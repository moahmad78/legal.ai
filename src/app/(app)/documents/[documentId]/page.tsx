import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FileText, ArrowLeft, Bot, ShieldAlert, FileSearch, Lightbulb } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RiskHeatmap } from "@/components/reports/RiskHeatmap";
import { RiskCard } from "@/components/reports/RiskCard";
import { MissingClauseCard } from "@/components/reports/MissingClauseCard";
import { RiskTimeline } from "@/components/reports/RiskTimeline";
import { ClauseNavigator } from "@/components/reports/ClauseNavigator";
import { AuthenticatedChatContainer } from "@/components/chat/AuthenticatedChatContainer";
import { MessageSquare } from "lucide-react";

export default async function ReportPage({
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

  const { data: user } = await supabase.from("users").select("id").eq("id", userId).single();
  if (!user) redirect("/dashboard");

  const { data: document, error } = await supabase
    .from("documents")
    .select("*, reports(*), document_risks(*), document_clauses(*)")
    .eq("id", documentId)
    .eq("user_id", user.id)
    .single();

  if (error || !document) redirect("/dashboard/documents");

  const report = document.reports?.[0];
  const risks = document.document_risks || [];
  
  const highRisks = risks.filter((r: any) => r.severity === "High");
  const mediumRisks = risks.filter((r: any) => r.severity === "Medium");
  const missingClauses = report?.missing_clauses || [];
  const recommendedActions = report?.recommended_actions || [];
  const clauses = document.document_clauses || [];

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] w-full gap-4 pb-4 overflow-hidden -mt-4 pl-4 pr-2">
      
      {/* Left Panel: Sidebar content is already handled globally, this acts as the main viewport container now */}

      {/* Center Panel: Document Viewer / Tabs */}
      <div className="flex-1 overflow-y-auto space-y-8 pr-2">
        <div className="flex justify-between items-center bg-background sticky top-0 py-2 z-10 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
              <FileText className="h-6 w-6" />
              {document.file_name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Uploaded {new Date(document.created_at).toLocaleDateString()}</p>
          </div>
          {document.overall_risk_level === 'High' ? (
             <Badge variant="destructive" className="px-3 py-1 text-xs uppercase font-bold tracking-wider">High Risk</Badge>
          ) : document.overall_risk_level === 'Medium' ? (
             <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30 px-3 py-1 text-xs uppercase font-bold tracking-wider">Medium Risk</Badge>
          ) : (
             <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 px-3 py-1 text-xs uppercase font-bold tracking-wider">Low Risk</Badge>
          )}
        </div>

        <Tabs defaultValue="risks" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-3 max-w-[500px]">
            <TabsTrigger value="risks" className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" /> Risks First
            </TabsTrigger>
            <TabsTrigger value="clauses" className="flex items-center gap-2">
              <FileSearch className="h-4 w-4" /> Clauses
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Summary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="risks" className="space-y-8">
            <section>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                <ShieldAlert className="h-5 w-5" /> Overall Risk Status
              </h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-xl bg-card">
                  <p className="text-sm text-muted-foreground mb-1">Risk Score</p>
                  <p className="text-3xl font-bold text-destructive">{document.overall_risk_score || 0}/100</p>
                </div>
                <div className="p-4 border rounded-xl bg-card">
                  <p className="text-sm text-muted-foreground mb-1">Confidence</p>
                  <p className="text-3xl font-bold">{document.risk_confidence || 0}%</p>
                </div>
                {report?.heatmap && (
                  <div className="p-4 border rounded-xl bg-card sm:col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">Liability Exposure</p>
                    <div className="h-2 bg-muted rounded-full mt-3 overflow-hidden">
                      <div className="h-full bg-destructive" style={{ width: `${report.heatmap.liability}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {highRisks.length > 0 && (
              <section>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-destructive">
                  <ShieldAlert className="h-5 w-5" /> High Risks ({highRisks.length})
                </h3>
                <div className="space-y-4">
                  {highRisks.map((risk: any) => (
                    <RiskCard key={risk.id} risk={risk} />
                  ))}
                </div>
              </section>
            )}

            {mediumRisks.length > 0 && (
              <section>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-500">
                  <ShieldAlert className="h-5 w-5" /> Medium Risks ({mediumRisks.length})
                </h3>
                <div className="space-y-4">
                  {mediumRisks.map((risk: any) => (
                    <RiskCard key={risk.id} risk={risk} />
                  ))}
                </div>
              </section>
            )}
            
            {recommendedActions.length > 0 && (
              <section>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                  <Lightbulb className="h-5 w-5" /> Recommended Actions
                </h3>
                <div className="bg-muted/20 p-5 rounded-xl border">
                  <ul className="space-y-3">
                    {recommendedActions.map((action: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="bg-primary/10 p-1 rounded-full shrink-0 mt-0.5">
                          <Lightbulb className="h-3 w-3 text-primary" />
                        </div>
                        <span className="font-medium text-sm">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {highRisks.length === 0 && mediumRisks.length === 0 && missingClauses.length === 0 && (
              <div className="text-center p-12 border rounded-xl bg-muted/10">
                <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-bold">No significant risks found</h3>
                <p className="text-muted-foreground mt-2">The document appears to be well structured with standard clauses.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="clauses" className="space-y-8">
            <section>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                <FileSearch className="h-5 w-5" /> Clause Intelligence
              </h3>
              {clauses.length > 0 ? (
                <ClauseNavigator clauses={clauses} />
              ) : (
                <div className="text-center p-12 border rounded-xl bg-muted/10">
                  <FileSearch className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-bold">No clauses extracted</h3>
                  <p className="text-muted-foreground mt-2">Clause extraction is either processing or unavailable for this document.</p>
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="summary" className="space-y-8">
            <section>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-primary" />
                Executive Summary
              </h3>
              <p className="text-muted-foreground leading-relaxed bg-muted/30 p-5 rounded-xl border">
                {report?.summary || "No summary available."}
              </p>
            </section>
            <section>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-primary" /> Missing Standard Clauses
              </h3>
              <div className="space-y-4">
                {missingClauses.map((clause: any, i: number) => <MissingClauseCard key={i} clause={clause} />)}
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Panel: Chat Assistant */}
      <div className="w-96 flex-shrink-0 border-l pl-4 flex flex-col h-full bg-background relative z-20">
        <div className="flex items-center gap-2 mb-4 border-b pb-4 pt-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="font-bold">Ask Catalyst AI</h2>
        </div>
          <div className="col-span-4 h-[calc(100vh-8rem)] rounded-xl border bg-background overflow-hidden shadow-sm flex flex-col">
            <AuthenticatedChatContainer documentId={documentId} />
          </div>
      </div>
    </div>
  );
}
