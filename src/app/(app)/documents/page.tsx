import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  const userId = authUser?.id;

  if (!userId) {
    redirect("/sign-in");
  }

  // Find the internal Supabase user record
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("auth_user_id", userId)
    .single();

  if (!user) {
    return <div className="p-8 text-center">Loading account data...</div>;
  }

  // Fetch documents for the user
  const { data: documents } = await supabase
    .from("documents")
    .select("*, reports(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-6 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Saved Reports</h1>
          <p className="text-muted-foreground mt-1 text-lg">Manage and review your AI document analyses.</p>
        </div>
        <Link href="/dashboard" className={buttonVariants()}>
          Analyze New Document
        </Link>
      </div>

      {(!documents || documents.length === 0) ? (
        <Card className="border-dashed py-12 text-center bg-muted/10">
          <CardContent className="flex flex-col items-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Reports Yet</h3>
            <p className="text-muted-foreground mb-6">You haven&apos;t uploaded or analyzed any documents yet.</p>
            <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
              Get Started
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc: any) => {
            const report = doc.reports?.[0];
            return (
              <Card key={doc.id} className="flex flex-col hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {doc.document_type || "Document"}
                    </Badge>
                    <Badge variant="outline" className={
                      doc.status === 'completed' ? "bg-green-500/10 text-green-600 border-green-500/20" : 
                      doc.status === 'failed' ? "bg-destructive/10 text-destructive border-destructive/20" :
                      "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    }>
                      {doc.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-1" title={doc.file_name}>{doc.file_name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 pb-4">
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><AlertTriangle className="h-4 w-4" /> Risk Level</span>
                      <span className={`font-medium ${
                        report?.risk_level === 'High' ? 'text-destructive' : 
                        report?.risk_level === 'Medium' ? 'text-orange-500' : 
                        report?.risk_level === 'Low' ? 'text-green-500' : 'text-muted-foreground'
                      }`}>{report?.risk_level || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Analyzed</span>
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link href={`/documents/${doc.id}`} className={buttonVariants({ variant: "secondary", className: "w-full" })}>
                    View Full Report
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

