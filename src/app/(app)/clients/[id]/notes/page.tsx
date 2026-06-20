import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { StickyNote, Search, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default async function ClientNotesTab({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: notes } = await supabase
    .from("client_notes")
    .select("*")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search notes..." className="pl-9 bg-background" />
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Add Note
        </Button>
      </div>

      {!notes || notes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <StickyNote className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">No notes yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">Keep track of private thoughts, meeting minutes, and legal strategy.</p>
            <Button variant="outline"><Plus className="h-4 w-4 mr-2" /> Add Note</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note: any) => (
            <Card key={note.id} className="hover:shadow-md transition-all">
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                <CardTitle className="text-base font-semibold">{note.title || "Untitled Note"}</CardTitle>
                <Badge variant="secondary" className="capitalize font-normal text-[10px]">{note.note_type}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-4">{note.content}</p>
              </CardContent>
              <CardFooter className="pt-3 border-t text-xs text-muted-foreground justify-between">
                <span>{format(new Date(note.created_at), "MMM d, yyyy")}</span>
                <Button variant="ghost" size="sm" className="h-6 text-xs p-0">Read More</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
