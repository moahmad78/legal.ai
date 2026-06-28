"use server";

import { createClient } from "@/lib/supabase/server";

export async function logUpgradeIntent(triggerSource: string, planSelected?: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const { data: userData } = await supabase
      .from("users")
      .select("id, active_organization_id")
      .eq("auth_user_id", userId)
      .single();

    if (!userData) {
      return { success: false, error: "User not found" };
    }

    const { data, error } = await supabase
      .from("upgrade_intents")
      .insert({
        user_id: userData.id,
        organization_id: userData.active_organization_id,
        trigger_source: triggerSource,
        plan_selected: planSelected || null,
        status: "started"
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error [upgrade_intents]:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Failed to log upgrade intent:", error);
    return { success: false, error: error.message || "Internal error" };
  }
}

