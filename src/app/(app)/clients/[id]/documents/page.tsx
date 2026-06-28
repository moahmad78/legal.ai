import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { FileText, Search, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function ClientDocumentsTab({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search documents..." className="pl-9 bg-background" />
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" /> Upload Document
        </Button>
      </div>

      {!documents || documents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">No documents uploaded</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">Upload contracts, agreements, or legal notices to run AI analysis.</p>
            <Button variant="outline"><Upload className="h-4 w-4 mr-2" /> Upload Document</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border bg-background overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold border-b">
              <tr>
                <th className="px-4 py-3">Document Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Uploaded</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {documents.map((doc: any) => (
                <tr key={doc.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    {doc.file_name}
                  </td>
                  <td className="px-4 py-3">{doc.document_type || "Unknown"}</td>
                  <td className="px-4 py-3">{doc.status}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {format(new Date(doc.created_at), "MMM d, yyyy")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
