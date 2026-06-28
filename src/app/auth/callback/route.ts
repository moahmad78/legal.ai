import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // Profile Synchronization logic
      const user = data.user;
      const email = user.email;
      const full_name = user.user_metadata?.full_name || email?.split('@')[0];
      const avatar_url = user.user_metadata?.avatar_url;

      try {
        // Automatically create user in public.users
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("auth_user_id", user.id)
          .single();

        if (!existingUser) {
          await supabase.from("users").insert({
            auth_user_id: user.id,
            email,
            full_name,
            avatar_url,
            plan: 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      } catch (upsertError) {
        console.error("Failed to create user during auth callback", upsertError);
      }

      // Check if there is a redirect_url in session storage (from middleware), but since we are server side, 
      // we just redirect to dashboard.
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // Return to sign-in if error
  return NextResponse.redirect(new URL("/sign-in", requestUrl.origin));
}
