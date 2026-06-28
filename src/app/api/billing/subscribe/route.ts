import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { plan, organizationId } = await req.json();
    if (!plan || !organizationId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    
    // Check if Razorpay keys exist
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn("Razorpay keys missing. Simulating checkout success.");
      // Simulate updating subscription
      await supabase.from("subscriptions").upsert({
        organization_id: organizationId,
        plan: plan,
        status: "active",
        razorpay_subscription_id: `sub_mock_${Date.now()}`
      }, { onConflict: 'organization_id' });
      
      return NextResponse.json({ id: `sub_mock_${Date.now()}` });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Map plan to Razorpay Plan ID (these would be setup in Razorpay dashboard)
    const razorpayPlanIds: Record<string, string> = {
      "professional": process.env.RAZORPAY_PRO_PLAN_ID || "plan_dummy_pro",
      "starter": process.env.RAZORPAY_STARTER_PLAN_ID || "plan_dummy_starter"
    };

    const rzpPlanId = razorpayPlanIds[plan];

    const subscription = await instance.subscriptions.create({
      plan_id: rzpPlanId,
      customer_notify: 1,
      total_count: 120, // 10 years
    });

    // Update db with pending sub
    await supabase.from("subscriptions").upsert({
      organization_id: organizationId,
      plan: plan,
      status: "pending",
      razorpay_subscription_id: subscription.id
    }, { onConflict: 'organization_id' });

    return NextResponse.json({ id: subscription.id });

  } catch (error: any) {
    console.error("Razorpay Sub Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
