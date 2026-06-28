"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Paperclip, Image, Camera, FolderOpen, 
  FileText, X, FileEdit
} from "lucide-react";
import { useUpload } from "@/hooks/use-upload";
import { useUploadStore } from "@/store/upload-store";
import { toast } from "sonner";
import { MAX_FILE_SIZE } from "@/services/storage/types";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface AttachmentMenuProps {
  onCameraClick?: () => void;
  onSelectDocument?: (id: string, name: string) => void;
}

export function AttachmentMenu({ 
  onCameraClick,
  onSelectDocument 
}: AttachmentMenuProps) {
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUpload();
  const { setFile, status } = useUploadStore();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File exceeds 20MB limit");
      return;
    }
    setFile(file);
    uploadMutation.mutate(file);
    setOpen(false);
    e.target.value = "";
  };

  const menuItems = [
    {
      id: "pdf",
      icon: FileText,
      label: "PDF Document",
      sublabel: "Upload .pdf",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      onClick: () => { fileRef.current?.click(); }
    },
    {
      id: "word",
      icon: FileEdit,
      label: "Word Document",
      sublabel: "Upload .docx",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      onClick: () => { fileRef.current?.click(); }
    },
    {
      id: "image",
      icon: Image,
      label: "Image", 
      sublabel: "JPG, PNG",
      color: "text-green-400",
      bg: "bg-green-500/10",
      onClick: () => { imageRef.current?.click(); }
    },
    {
      id: "camera",
      icon: Camera,
      label: "Camera",
      sublabel: "Take a photo",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      onClick: () => { 
        onCameraClick?.();
        setOpen(false);
      }
    },
  ];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      {/* Hidden file inputs */}
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        accept=".pdf,.docx"
        onChange={handleFile}
      />
      <input
        ref={imageRef}
        type="file"
        className="hidden"
        accept=".jpg,.jpeg,.png"
        onChange={handleFile}
      />

      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium",
          "h-9 w-9 rounded-full transition-all duration-200 focus-visible:ring-2",
          open 
            ? "bg-primary/20 text-primary rotate-45" 
            : "text-muted-foreground hover:text-primary hover:bg-primary/10",
          "disabled:opacity-40"
        )}
        disabled={status === "uploading" || status === "success"}
        title="Attach files"
      >
        <Paperclip className="h-4 w-4 transition-transform duration-200" />
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="start" 
        side="top" 
        sideOffset={12}
        className={cn(
          "w-60 rounded-2xl border border-border/80",
          "bg-card/75 backdrop-blur-xl shadow-2xl p-1.5",
          "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=top]:slide-in-from-bottom-2"
        )}
      >
        {menuItems.map((item) => (
          <DropdownMenuItem
            key={item.id}
            onClick={item.onClick}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer",
              "transition-colors duration-200 focus:bg-accent/80 hover:bg-accent/80 group"
            )}
          >
            <div className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
              item.bg
            )}>
              <item.icon className={cn("h-4 w-4", item.color)} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {item.label}
              </p>
              {item.sublabel && (
                <p className="text-xs text-muted-foreground">
                  {item.sublabel}
                </p>
              )}
            </div>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="my-1.5 bg-border/50" />
        
        <DropdownMenuItem
          onClick={() => {
            setOpen(false);
          }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer",
            "transition-colors duration-200 focus:bg-accent/80 hover:bg-accent/80 group"
          )}
        >
          <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-orange-500/10">
            <FolderOpen className="h-4 w-4 text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Recent Documents
            </p>
            <p className="text-xs text-muted-foreground">
              Choose from history
            </p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
