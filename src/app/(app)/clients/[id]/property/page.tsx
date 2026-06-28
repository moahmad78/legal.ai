import { MapPin, Search, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function ClientPropertyTab({ params }: { params: Promise<{ id: string }> }) {
  // In a real implementation, we would fetch properties related to this client
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search property reviews..." className="pl-9 bg-background" />
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> New Property Review
        </Button>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-1">No property reviews</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">Track real estate ownership, risk scores, and missing documents for this client.</p>
          <Button variant="outline"><Plus className="h-4 w-4 mr-2" /> Add Property</Button>
        </CardContent>
      </Card>
    </div>
  );
}
