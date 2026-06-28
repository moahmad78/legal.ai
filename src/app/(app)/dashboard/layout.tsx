import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (authUser) {
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("id", authUser.id)
      .single();

    if (user) {
      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("has_seen_welcome, welcome_dismissed")
        .eq("user_id", user.id)
        .single();

      if (!prefs || (!prefs.has_seen_welcome && !prefs.welcome_dismissed)) {
        redirect("/welcome");
      }
    }
  }

  return <>{children}</>;
}
