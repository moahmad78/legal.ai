import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ClientOverviewTab({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Parallel fetch basic summaries
  const [
    { data: client },
    { count: mattersCount },
    { count: docsCount },
  ] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).single(),
    supabase.from("matters").select("*", { count: 'exact', head: true }).eq("client_id", id),
    supabase.from("documents").select("*", { count: 'exact', head: true }).eq("client_id", id),
  ]);

  if (!client) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Client Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Total Matters</span>
                <span className="font-semibold text-lg">{mattersCount || 0}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Total Documents</span>
                <span className="font-semibold text-lg">{docsCount || 0}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Identification</span>
                <span className="font-medium uppercase">{client.pan_number || client.gst_number || "Not provided"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Industry/Occupation</span>
                <span className="font-medium">{client.occupation || "Not provided"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Contact & Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {client.address_line_1 ? (
              <div>
                <div className="font-medium">{client.address_line_1}</div>
                {client.address_line_2 && <div>{client.address_line_2}</div>}
                <div className="text-muted-foreground">{client.city}, {client.state} {client.pin_code}</div>
                <div className="text-muted-foreground">{client.country}</div>
              </div>
            ) : (
              <p className="text-muted-foreground italic">Address not provided.</p>
            )}

            {client.emergency_contact_person && (
              <div className="pt-2 border-t">
                <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Emergency Contact</span>
                <div className="font-medium">{client.emergency_contact_person} <span className="text-muted-foreground font-normal">({client.emergency_relationship})</span></div>
                <div className="text-muted-foreground">{client.emergency_phone}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Matters</CardTitle>
              <Badge variant="secondary">View All</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No recent matters found.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Open Risks</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {client.risk_status === 'High' ? (
              <div className="p-3 bg-red-500/10 text-red-600 rounded-md text-sm border border-red-500/20">
                Action Required: High risk identified in recent documentation. Review intelligence report.
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No critical risks identified.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
