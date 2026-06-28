import { Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function ClientActivityTab({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold font-heading">Recent Activity Feed</h2>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-1">Activity Log</h3>
          <p className="text-sm text-muted-foreground max-w-sm">The activity log is currently being aggregated. Please check the Timeline tab for a chronological history.</p>
        </CardContent>
      </Card>
    </div>
  );
}
