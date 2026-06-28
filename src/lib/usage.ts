import { createClient } from "@/lib/supabase/server";

export async function trackUsage(organizationId: string, metric: "documents_processed" | "ai_queries" | "reports_generated") {
  const supabase = await createClient();
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  
  let { data: usage } = await supabase
    .from("usage_metrics")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("period_start", startOfMonth)
    .single();
    
  if (!usage) {
     const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
     const { data: newUsage } = await supabase.from("usage_metrics").insert({
       organization_id: organizationId,
       period_start: startOfMonth,
       period_end: endOfMonth,
       [metric]: 1
     }).select().single();
     usage = newUsage;
  } else {
     await supabase.from("usage_metrics").update({
       [metric]: usage[metric] + 1
     }).eq("id", usage.id);
     
     usage[metric] += 1;
  }
  
  if (!usage) return;

  // Check limits
  const { data: sub } = await supabase.from("subscriptions").select("plan").eq("organization_id", organizationId).single();
  const plan = sub?.plan || "starter";
  const limits = { starter: 100, professional: 500, enterprise: 999999 };
  const currentLimit = limits[plan as keyof typeof limits] || 100;
  
  if (metric === "documents_processed") {
    const percent = usage[metric] / currentLimit;
    if (percent === 0.8) { 
      await supabase.from("notifications").insert({
        organization_id: organizationId,
        type: "usage",
        message: `Warning: You have reached 80% of your document limit for this billing cycle.`
      });
    } else if (percent >= 1.0 && percent <= 1.01) {
      await supabase.from("notifications").insert({
        organization_id: organizationId,
        type: "usage",
        message: `Alert: You have reached your document limit. Upgrade your plan to process more.`
      });
    }
  }
}
