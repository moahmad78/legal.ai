"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function dismissWelcome() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  const userId = authUser?.id;
  if (!userId) return { success: false, error: "Unauthorized" };

  // First get the user id
  const { data: user } = await supabase
    .from('users')
    .select("auth_user_id")
    .eq("id", userId)
    .single();

  if (!user) return { success: false, error: "User not found" };

  // Update or insert preference
  const { error } = await supabase
    .from('user_preferences')
    .upsert(
      { 
        user_id: user.id, 
        welcome_dismissed: true, 
        has_seen_welcome: true 
      },
      { onConflict: 'user_id' }
    );

  if (error) {
    console.error("Failed to dismiss welcome:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/welcome');
  revalidatePath('/dashboard');
  
  redirect('/dashboard');
}
