import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/mailer";
import { render } from "@react-email/render";
import { CancellationEmail } from "@/emails/CancellationEmail";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const userId = authUser?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cancel_at_period_end } = await req.json();

    const { data: user } = await supabase.from("users").select("active_organization_id").eq("auth_user_id", userId).single();
    if (!user || !user.active_organization_id) {
      return NextResponse.json({ error: "Organization not found" }, { status: 400 });
    }

    // Get active subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("razorpay_subscription_id")
      .eq("organization_id", user.active_organization_id)
      .in("status", ["active", "trialing"])
      .single();

    if (!subscription || !subscription.razorpay_subscription_id) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    const razorpaySub = await razorpay.subscriptions.cancel(
        subscription.razorpay_subscription_id,
        cancel_at_period_end ? 1 : 0
    );

    try {
      const { data: userRecord } = await supabase.from("users").select("email").eq("auth_user_id", userId).single();
      if (userRecord && userRecord.email) {
        // razorpay returns charge_at timestamp for when it will cancel
        const endDate = razorpaySub.charge_at ? new Date(razorpaySub.charge_at * 1000).toLocaleDateString() : "the end of your billing cycle";
        const html = await render(CancellationEmail({ endDate }));
        await sendEmail({
          to: userRecord.email,
          subject: "Your subscription will end soon",
          html,
          type: "billing",
          userId: userRecord.id
        });
      }
    } catch (e) {
      console.error("Failed to send cancellation email", e);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Cancel API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

