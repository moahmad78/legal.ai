import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReportViewer } from "@/components/reports-gen/ReportViewer";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userId = user?.id;

  if (!userId) {
    redirect("/sign-in");
  }


  // Find the internal Supabase user UUID
  const { data: dbUser } = await supabase
    .from("users")
    .select("auth_user_id")
    .eq("id", userId)
    .single();

  if (!dbUser) redirect("/");

  // Fetch the generated report
  const { data: report, error } = await supabase
    .from("generated_reports")
    .select(`
      *,
      generated_report_notes(id, note, created_at, author:users(first_name, last_name))
    `)
    .eq("id", reportId)
    .single();

  if (error || !report) redirect("/dashboard/reports");

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <ReportViewer report={report} />
    </div>
  );
}
