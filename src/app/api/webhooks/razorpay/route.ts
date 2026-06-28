import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";
import { sendEmail } from "@/lib/email/mailer";
import { render } from "@react-email/render";
import { SubscriptionActivatedEmail } from "@/emails/SubscriptionActivatedEmail";

// Helper to determine limits based on plan
const getLimitsForPlan = (plan: string) => {
  if (plan === "solo") return { chat: 250, docs: 50 };
  if (plan === "starter") return { chat: 500, docs: 100 };
  if (plan === "professional") return { chat: 99999, docs: 500 };
  return { chat: 25, docs: 3 }; // fallback to free
};

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      console.warn("No webhook secret configured");
      return NextResponse.json({ received: true });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventId = event.id; // razorpay webhook event id
    const supabase = await createClient();

    // Idempotency check
    const { data: existingEvent } = await supabase.from("webhook_events").select("id").eq("id", eventId).single();
    if (existingEvent) {
      return NextResponse.json({ received: true, note: "Already processed" });
    }

    // Log the event for idempotency
    await supabase.from("webhook_events").insert({ id: eventId, type: event.event });

    const eventName = event.event;

    if (eventName === "subscription.activated" || eventName === "subscription.charged") {
      const subEntity = event.payload.subscription.entity;
      const subId = subEntity.id;
      const notes = subEntity.notes || {};
      const internalPlan = notes.internal_plan || "solo";
      const orgId = notes.organization_id;
      const userId = notes.user_id;

      // Upsert subscription
      if (orgId) {
        const { data: existingSub } = await supabase.from("subscriptions").select("id").eq("razorpay_subscription_id", subId).single();
        let actualSubId = existingSub?.id;
        
        if (!existingSub) {
          const { data: newSub } = await supabase.from("subscriptions").insert({
            organization_id: orgId,
            plan: internalPlan,
            status: "active",
            razorpay_subscription_id: subId,
            renewal_date: new Date(subEntity.charge_at * 1000).toISOString(),
            billing_frequency: "monthly"
          }).select("id").single();
          actualSubId = newSub?.id;
        } else {
          await supabase.from("subscriptions").update({
            status: "active",
            plan: internalPlan,
            renewal_date: new Date(subEntity.charge_at * 1000).toISOString(),
            updated_at: new Date().toISOString()
          }).eq("razorpay_subscription_id", subId);
        }

        // Also update the users plan for legacy code compatibility
        if (userId) {
          await supabase.from("users").update({ plan: internalPlan }).eq("auth_user_id", userId);
        }

        // If it's charged, create a billing_transaction
        if (eventName === "subscription.charged" && event.payload.payment) {
          const payment = event.payload.payment.entity;
          await supabase.from("billing_transactions").insert({
            organization_id: orgId,
            subscription_id: actualSubId,
            invoice_number: payment.invoice_id || `INV-${Date.now()}`,
            amount: payment.amount / 100, // paise to INR
            currency: payment.currency,
            status: "paid",
            payment_method: payment.method,
            razorpay_payment_id: payment.id
          });
        }

        // Send activation email
        if (eventName === "subscription.activated" && userId) {
          try {
            const { data: userRecord } = await supabase.from("users").select("email").eq("auth_user_id", userId).single();
            if (userRecord && userRecord.email) {
              const html = await render(SubscriptionActivatedEmail({ planName: internalPlan, renewalDate: new Date(subEntity.charge_at * 1000).toLocaleDateString() }));
              await sendEmail({
                to: userRecord.email,
                subject: "Your Catalyst subscription is active",
                html,
                type: "billing",
                userId: userId
              });
            }
          } catch (e) {
            console.error("Failed to send activation email", e);
          }
        }
      }
    } else if (eventName === "subscription.halted" || eventName === "subscription.cancelled") {
      const subId = event.payload.subscription.entity.id;
      const notes = event.payload.subscription.entity.notes || {};
      const userId = notes.user_id;

      await supabase
        .from("subscriptions")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("razorpay_subscription_id", subId);

      // Revert user to free plan
      if (userId) {
        await supabase.from("users").update({ plan: "free" }).eq("auth_user_id", userId);
      }
    } else if (eventName === "payment.failed") {
      const payment = event.payload.payment.entity;
      const notes = payment.notes || {};
      const orgId = notes.organization_id;
      
      if (orgId) {
        await supabase.from("billing_transactions").insert({
          organization_id: orgId,
          invoice_number: payment.invoice_id || `INV-FAILED-${Date.now()}`,
          amount: payment.amount / 100,
          currency: payment.currency,
          status: "failed",
          payment_method: payment.method,
          razorpay_payment_id: payment.id
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

