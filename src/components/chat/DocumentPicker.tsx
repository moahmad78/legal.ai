"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface DocumentPickerProps {
  onSelectDocument: (documentId: string, documentName: string) => void;
  children: React.ReactNode;
}

export function DocumentPicker({ onSelectDocument, children }: DocumentPickerProps) {
  const [open, setOpen] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchDocuments();
    }
  }, [open]);

  const fetchDocuments = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("documents")
      .select("id, name, updated_at")
      .order("updated_at", { ascending: false })
      .limit(10);
      
    if (data) {
      setDocuments(data);
    }
    setLoading(false);
  };

  const handleSelect = (id: string, name: string) => {
    onSelectDocument(id, name);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Document</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {loading ? (
            <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : documents.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground text-sm">No recent documents found.</div>
          ) : (
            <div className="space-y-2">
              {documents.map(doc => (
                <Button 
                  key={doc.id} 
                  variant="outline" 
                  className="w-full justify-start font-normal h-auto py-3 px-4"
                  onClick={() => handleSelect(doc.id, doc.name)}
                >
                  <FileText className="mr-3 h-4 w-4 shrink-0 text-blue-500" />
                  <div className="flex flex-col items-start truncate w-full">
                    <span className="truncate w-full text-left">{doc.name}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {new Date(doc.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto shrink-0 text-muted-foreground opacity-50" />
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
