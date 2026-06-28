import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default async function AuditLogsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userId = user?.id;
  if (!userId) redirect("/sign-in");

  const { data: dbUser } = await supabase.from("users").select("id, active_organization_id").eq("auth_user_id", userId).single();

  if (!user?.active_organization_id) {
    redirect("/dashboard");
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("organization_id", user.active_organization_id)
    .single();

  if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
    redirect("/dashboard?error=unauthorized");
  }

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("*, actor:users(full_name, email)")
    .eq("organization_id", user.active_organization_id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="max-w-5xl space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">Review administrative actions and security events.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Recent Activity</CardTitle>
          <CardDescription>The last 50 events for your organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {logs?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground bg-muted/20 rounded-lg">
                No activity recorded yet.
              </div>
            ) : (
              logs?.map((log: any, i: number) => (
                <div key={log.id} className={`flex items-start gap-4 p-4 ${i !== logs.length - 1 ? 'border-b' : ''}`}>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      <span className="text-primary">{log.actor?.full_name || log.actor?.email || "System"}</span> performed <span className="font-bold">{log.action}</span> on <span className="underline decoration-muted-foreground/30">{log.entity}</span>
                    </p>
                    {log.details && (
                      <pre className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded-md overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0 mt-0.5">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

