import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AuthenticatedChatContainer } from "@/components/chat/AuthenticatedChatContainer";
import { FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function AskAIPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  const userId = authUser?.id;

  if (!userId) {
    redirect("/sign-in");
  }

  // Find the internal Supabase user record
  const { data: user } = await supabase
    .from("users")
    .select("id, plan")
    .eq("id", userId)
    .single();

  if (!user) {
    redirect("/dashboard");
  }

  // Fetch document and report
  const { data: document, error } = await supabase
    .from("documents")
    .select("*, reports(*)")
    .eq("id", documentId)
    .eq("user_id", user.id)
    .single();

  if (error || !document) {
    redirect("/dashboard/documents");
  }

  const report = document.reports?.[0];
  const riskLevel = report?.risk_level || "Unknown";

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/documents/${documentId}`} className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Ask AI: {document.file_name}
            </h1>
            <Badge variant="outline" className={
              riskLevel === 'High' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
              riskLevel === 'Medium' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' : 
              'bg-green-500/10 text-green-600 border-green-500/20'
            }>
              Risk: {riskLevel}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Chat with this document. {user.plan === "free" ? "Free plan allows 5 questions/month." : "Pro plan active."}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-background/50 relative">
        <AuthenticatedChatContainer documentId={documentId} />
      </div>
    </div>
  );
}
