import { createClient } from "@/lib/supabase/server";

export async function getFreeUsage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  const userId = authUser?.id;
  if (!userId) return null;

  // Since public.users is removed, we default all authenticated users to "free" plan for now
  // or bypass checking the "users" table.
  const userRecord = {
    id: userId,
    active_organization_id: userId, // Defaulting to userId for org
    plan: "free"
  };

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

  let { data: usage } = await supabase
    .from("user_usage")
    .select("*")
    .eq("user_id", userRecord.id)
    .gte("period_start", currentMonthStart)
    .single();

  if (!usage) {
    const { data: newUsage, error } = await supabase
      .from("user_usage")
      .insert({
        user_id: userRecord.id,
        organization_id: userRecord.active_organization_id,
        plan: "free",
        period_start: currentMonthStart,
        period_end: nextMonthStart,
        chat_count: 0,
        document_count: 0,
        report_count: 0
      })
      .select()
      .single();
    
    if (error) {
       console.error("Error creating user usage:", error);
       return { id: null, chat_count: 0, document_count: 0, report_count: 0, period_start: currentMonthStart, period_end: nextMonthStart };
    }
    usage = newUsage;
  }
  
  return usage;
}

export async function incrementFreeChat() {
  const usage = await getFreeUsage();
  if (!usage || !usage.id) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("user_usage")
    .update({ chat_count: usage.chat_count + 1 })
    .eq("id", usage.id)
    .select()
    .single();

  return data;
}

export async function incrementFreeDocument() {
  const usage = await getFreeUsage();
  if (!usage || !usage.id) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("user_usage")
    .update({ document_count: usage.document_count + 1 })
    .eq("id", usage.id)
    .select()
    .single();

  return data;
}

