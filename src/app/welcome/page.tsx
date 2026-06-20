import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WelcomeWorkspace } from "@/components/welcome/WelcomeWorkspace";

export default async function WelcomePage() {
  const supabase = await createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    redirect("/sign-in");
  }

  const { data: user } = await supabase
    .from("users")
    .select("id, full_name")
    .eq("id", authUser.id)
    .single();

  if (!user) {
    redirect("/dashboard");
  }

  const { data: prefs } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (prefs?.welcome_dismissed) {
    redirect("/dashboard");
  }

  // Fetch stats for checklist
  const [{ count: clientCount }, { count: matterCount }, { count: documentCount }, { count: reportCount }, { count: chatCount }] = await Promise.all([
    supabase.from("clients").select("*", { count: 'exact', head: true }).eq("user_id", user.id),
    supabase.from("matters").select("*", { count: 'exact', head: true }).eq("user_id", user.id),
    supabase.from("documents").select("*", { count: 'exact', head: true }).eq("user_id", user.id),
    supabase.from("generated_reports").select("*", { count: 'exact', head: true }).eq("user_id", user.id),
    supabase.from("chat_messages").select("*", { count: 'exact', head: true }).eq("user_id", user.id)
  ]);

  const checklistProgress = {
    ask_ai: (chatCount || 0) > 0,
    upload_document: (documentCount || 0) > 0,
    create_client: (clientCount || 0) > 0,
    create_matter: (matterCount || 0) > 0,
    generate_report: (reportCount || 0) > 0
  };

  // Recent activity
  const { data: recentMatter } = await supabase
    .from("matters")
    .select("id, title, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  const { data: recentDocument } = await supabase
    .from("documents")
    .select("id, name, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  const recentActivity = {
    matter: recentMatter || null,
    document: recentDocument || null
  };

  return (
    <WelcomeWorkspace 
      user={{ firstName: user.full_name?.split(' ')[0] || "there" }}
      checklist={checklistProgress}
      recentActivity={recentActivity}
    />
  );
}
