import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { Scale, Search, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default async function ClientMattersTab({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: matters } = await supabase
    .from("matters")
    .select("*")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search matters..." className="pl-9 bg-background" />
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Create Matter
        </Button>
      </div>

      {!matters || matters.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Scale className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">No matters found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">Create the first matter to start organizing documents and intelligence for this client.</p>
            <Button variant="outline"><Plus className="h-4 w-4 mr-2" /> Create Matter</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {matters.map((matter: any) => (
            <Card key={matter.id} className="hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold font-heading text-lg">{matter.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="font-normal">{matter.status}</Badge>
                    <span>Created: {format(new Date(matter.created_at), "MMM d, yyyy")}</span>
                  </div>
                </div>
                <Button variant="ghost">Open Matter</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
