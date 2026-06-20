import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { Clock, Plus, User, FileText, Scale, FileBarChart, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ClientTimelineTab({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: timelineEvents } = await supabase
    .from("client_timeline")
    .select("*")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  const getIcon = (type: string) => {
    switch (type) {
      case "client_created": return <User className="h-4 w-4 text-primary" />;
      case "matter_created": return <Scale className="h-4 w-4 text-blue-500" />;
      case "document_uploaded": return <FileText className="h-4 w-4 text-emerald-500" />;
      case "report_generated": return <FileBarChart className="h-4 w-4 text-purple-500" />;
      case "ai_chat": return <Sparkles className="h-4 w-4 text-amber-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold font-heading">Chronological History</h2>
      </div>

      {!timelineEvents || timelineEvents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">No timeline events</h3>
            <p className="text-sm text-muted-foreground max-w-sm">Activity will appear here as you manage this client's workspace.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative pl-6 border-l-2 border-muted space-y-8 mt-4">
          {timelineEvents.map((event: any) => (
            <div key={event.id} className="relative">
              <div className="absolute -left-[35px] top-0 h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                {getIcon(event.event_type)}
              </div>
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-medium text-sm">{event.description}</h4>
                      {event.linked_entity_id && (
                        <Button variant="link" className="p-0 h-auto text-xs mt-1">View Details</Button>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(event.created_at), "MMM d, h:mm a")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
