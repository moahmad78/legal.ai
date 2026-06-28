import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { FileBarChart, Search, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function ClientReportsTab({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from("generated_reports")
    .select("*")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search reports..." className="pl-9 bg-background" />
        </div>
        <Button>
          <Sparkles className="h-4 w-4 mr-2" /> Generate Report
        </Button>
      </div>

      {!reports || reports.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FileBarChart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">No reports generated</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">Use Catalyst AI to generate comprehensive risk, clause, or property reports.</p>
            <Button variant="outline"><Sparkles className="h-4 w-4 mr-2" /> Generate Report</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report: any) => (
            <Card key={report.id} className="hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                    <FileBarChart className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="font-semibold truncate">{report.title}</h4>
                </div>
                <div className="text-xs text-muted-foreground mb-4">
                  Type: <span className="uppercase">{report.report_type}</span> • {format(new Date(report.created_at), "MMM d, yyyy")}
                </div>
                <Button variant="secondary" className="w-full">View Report</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
