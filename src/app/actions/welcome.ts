"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function dismissWelcome() {
  const { userId: userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const supabase = await createClient();

  // First get the user id
  const { data: user } = await supabase
    .from('users')
    .select('id')
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
