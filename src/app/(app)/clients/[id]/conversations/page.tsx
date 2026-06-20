import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { MessageSquare, Search, Plus, Trash, Edit, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default async function ClientConversationsTab({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: conversations } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("client_id", id)
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search conversations..." className="pl-9 bg-background" />
        </div>
        <Button>
          <MessageSquare className="h-4 w-4 mr-2" /> New Conversation
        </Button>
      </div>

      {!conversations || conversations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">No AI conversations</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">Start a chat with Catalyst AI to ask questions about this client's matters, risks, and documents.</p>
            <Button variant="outline"><MessageSquare className="h-4 w-4 mr-2" /> Start Intelligence Chat</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {conversations.map((chat: any) => (
            <Card key={chat.id} className="hover:shadow-md transition-all group cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold font-heading text-lg flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" /> {chat.title || "New Conversation"}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>Started: {format(new Date(chat.created_at), "MMM d, yyyy")}</span>
                    <span>•</span>
                    <span>Last active: {format(new Date(chat.updated_at), "MMM d, h:mm a")}</span>
                    {chat.matter_id && (
                      <Badge variant="outline" className="font-normal text-[10px]">Linked Matter</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-600 hover:bg-red-50">
                    <Trash className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" className="shrink-0 ml-2">
                    Resume <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
