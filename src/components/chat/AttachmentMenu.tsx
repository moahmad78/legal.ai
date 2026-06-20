"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Paperclip, FileText, Image as ImageIcon, UploadCloud } from "lucide-react";
import { useUploadStore } from "@/store/upload-store";
import { useUpload } from "@/hooks/use-upload";
import { useRef } from "react";

export function AttachmentMenu() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setFile, status } = useUploadStore();
  const uploadMutation = useUpload();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      uploadMutation.mutate(file);
    }
  };

  return (
    <Popover>
      <PopoverTrigger 
        className="inline-flex items-center justify-center whitespace-nowrap h-9 w-9 rounded-full text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:pointer-events-none" 
        disabled={status === "uploading"}
      >
        <Paperclip className="h-5 w-5" />
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2 rounded-xl mb-2" align="start" sideOffset={8}>
        <div className="space-y-1">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf,.docx,image/*" 
            onChange={handleFileSelect} 
          />
          <Button variant="ghost" className="w-full justify-start text-sm h-10 px-3" onClick={() => {
            if(fileInputRef.current) {
              fileInputRef.current.accept = ".pdf";
              fileInputRef.current.click();
            }
          }}>
            <FileText className="h-4 w-4 mr-2 text-red-500" />
            Upload PDF
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sm h-10 px-3" onClick={() => {
            if(fileInputRef.current) {
              fileInputRef.current.accept = ".docx";
              fileInputRef.current.click();
            }
          }}>
            <FileText className="h-4 w-4 mr-2 text-blue-500" />
            Upload DOCX
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sm h-10 px-3" onClick={() => {
            if(fileInputRef.current) {
              fileInputRef.current.accept = "image/*";
              fileInputRef.current.click();
            }
          }}>
            <ImageIcon className="h-4 w-4 mr-2 text-green-500" />
            Upload Image
          </Button>
          <div className="h-px bg-border my-1" />
          <Button variant="ghost" className="w-full justify-start text-sm h-10 px-3" onClick={() => {
            if(fileInputRef.current) {
              fileInputRef.current.accept = ".pdf,.docx,image/*";
              fileInputRef.current.click();
            }
          }}>
            <UploadCloud className="h-4 w-4 mr-2 text-muted-foreground" />
            Browse Files
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
