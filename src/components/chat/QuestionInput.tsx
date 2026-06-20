"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Camera as CameraIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { AttachmentMenu } from "./AttachmentMenu";
import { CameraModal } from "./CameraModal";
import { useUploadStore } from "@/store/upload-store";
import { Badge } from "@/components/ui/badge";
import { DocumentPicker } from "./DocumentPicker";
import { X, FileText, FileSearch } from "lucide-react";

interface QuestionInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  hasDocument?: boolean;
  documentName?: string;
  onClearDocument?: () => void;
  onSelectDocument?: (id: string, name: string) => void;
}

export function QuestionInput({ onSend, disabled, hasDocument, documentName, onClearDocument, onSelectDocument }: QuestionInputProps) {
  const [value, setValue] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const { file, status: uploadStatus } = useUploadStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleFocus = () => {
      textareaRef.current?.focus();
      // Scroll to top by finding the scroll container
      const container = document.querySelector('.overflow-y-auto');
      if (container) {
        container.scrollTop = 0;
      }
    };
    window.addEventListener('focus-chat-input', handleFocus);
    return () => window.removeEventListener('focus-chat-input', handleFocus);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Context Badge */}
      <div className="px-1 flex items-center">
        {!hasDocument ? (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 py-1 px-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse" /> 
              Educational Guidance
            </Badge>
            {onSelectDocument && (
              <DocumentPicker onSelectDocument={onSelectDocument}>
                <button type="button" className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-full border">
                  <FileSearch className="h-3 w-3" /> Select Document
                </button>
              </DocumentPicker>
            )}
          </div>
        ) : (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 flex items-center gap-1.5 py-1">
            <FileText className="h-3.5 w-3.5" /> 
            <span>Analyzing: {documentName || file?.name || "Document"}</span>
            {onClearDocument && (
              <button onClick={onClearDocument} className="ml-1 p-0.5 hover:bg-blue-200 rounded-full text-blue-900 transition-colors" title="Switch to General Chat">
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative flex items-end w-full border rounded-2xl overflow-hidden bg-background focus-within:ring-1 focus-within:ring-primary shadow-sm">
        <div className="p-2 flex items-center gap-1">
          <AttachmentMenu />
          <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted md:hidden" onClick={() => setCameraOpen(true)}>
            <CameraIcon className="h-5 w-5" />
          </Button>
        </div>
        
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={hasDocument ? "Ask anything about this document..." : "Ask a legal question..."}
          className="min-h-[56px] max-h-[200px] w-full resize-none border-0 focus-visible:ring-0 px-2 py-4 rounded-none bg-transparent"
          disabled={disabled || uploadStatus === "uploading"}
        />
        
        <div className="p-2">
          <Button 
            type="submit" 
            size="icon" 
            disabled={!value.trim() || disabled || uploadStatus === "uploading"}
            className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 transition-transform hover:scale-105"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </form>

      <CameraModal open={cameraOpen} onOpenChange={setCameraOpen} />
    </div>
  );
}
