import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const userId = authUser?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("id, active_organization_id")
      .eq("id", userId)
      .single();

    if (!user || !user.active_organization_id) {
      return NextResponse.json({ error: "Organization not found" }, { status: 400 });
    }

    const { planId } = await req.json();

    if (!planId) {
      return NextResponse.json({ error: "Missing plan ID" }, { status: 400 });
    }

    // Determine the Razorpay Plan ID from env mapping
    const razorpayPlanId = 
      planId === "solo" 
        ? process.env.RAZORPAY_SOLO_PLAN_ID 
        : planId === "starter" 
          ? process.env.RAZORPAY_STARTER_PLAN_ID 
          : planId === "professional"
            ? process.env.RAZORPAY_PROFESSIONAL_PLAN_ID
            : null;

    if (!razorpayPlanId) {
      return NextResponse.json({ error: "Invalid plan or missing configuration" }, { status: 400 });
    }

    // Guard: Razorpay not configured
    if (!razorpay) {
      return NextResponse.json({ error: "Payment provider not configured" }, { status: 503 });
    }

    // Create a subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: razorpayPlanId,
      total_count: 120, // max billing cycles (10 years)
      customer_notify: 1,
      notes: {
        clerk_user_id: userId,
        user_id: user.id,
        organization_id: user.active_organization_id,
        internal_plan: planId,
      }
    });

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
    });
  } catch (error: any) {
    console.error("Checkout API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
