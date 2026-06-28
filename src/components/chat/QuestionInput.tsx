"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  SendHorizontal, Mic, MicOff, 
  FileText, X, FileSearch 
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { AttachmentMenu } from "./AttachmentMenu";
import { CameraModal } from "./CameraModal";
import { useUploadStore } from "@/store/upload-store";
import { cn } from "@/lib/utils";

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
  
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

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

  useEffect(() => {
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const startRecording = () => {
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // India English

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setValue(transcript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

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
    <div className="w-full relative flex flex-col gap-2 pb-safe">
      {/* Recording indicator text */}
      {isRecording && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 
                        bg-red-500 text-white text-xs px-3 py-1 rounded-full 
                        flex items-center gap-1.5 whitespace-nowrap shadow-lg z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          Recording... tap mic to stop
        </div>
      )}

      {/* Document chip when attached */}
      {hasDocument && (
        <div className="px-1 flex items-center">
          <div className="flex items-center gap-1.5 bg-primary/10 text-primary 
                          text-xs px-3 py-1.5 rounded-full border border-primary/20">
            <FileText className="h-3 w-3 shrink-0" />
            <span className="truncate max-w-[200px]">
              {documentName || file?.name || "Document"}
            </span>
            {onClearDocument && (
              <button onClick={onClearDocument} 
                type="button"
                className="ml-1 hover:text-destructive transition-colors">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main input form */}
      <form 
        onSubmit={handleSubmit} 
        className={cn(
          "relative flex flex-row items-end w-full border rounded-2xl",
          "bg-background shadow-sm transition-all duration-200 overflow-hidden",
          isRecording 
            ? "ring-2 ring-red-500/50 border-red-500/30" 
            : "focus-within:ring-1 focus-within:ring-primary border-border"
        )}
      >
        {/* LEFT buttons - only AttachmentMenu now */}
        <div className="flex items-center p-2 shrink-0">
          <AttachmentMenu 
            onCameraClick={() => setCameraOpen(true)}
            onSelectDocument={onSelectDocument}
          />
        </div>

        {/* Vertical divider */}
        <div className="w-px h-5 bg-border/60 shrink-0 self-center" />

        {/* MIDDLE: Textarea */}
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isRecording 
              ? "Listening... speak now" 
              : hasDocument 
                ? "Ask anything about this document..." 
                : "Ask a legal question..."
          }
          className="min-h-[52px] max-h-[160px] flex-1 resize-none border-0 
                     focus-visible:ring-0 px-3 py-4 bg-transparent text-sm"
          disabled={disabled || uploadStatus === "uploading"}
        />

        {/* RIGHT: Mic + Send INSIDE form */}
        <div className="flex items-center gap-1 p-2 shrink-0">
          {isSupported && (
            <Button type="button" variant="ghost" size="icon"
              onClick={toggleRecording}
              className={cn(
                "h-9 w-9 rounded-full transition-all",
                isRecording 
                  ? "bg-red-500/20 text-red-500 animate-pulse" 
                  : "text-muted-foreground hover:text-primary hover:bg-primary/10"
              )}>
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}

          <Button type="submit" size="icon"
            disabled={!value.trim() || disabled || uploadStatus === "uploading"}
            className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90 
                       disabled:opacity-40 transition-all hover:scale-105">
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </form>

      <CameraModal open={cameraOpen} onOpenChange={setCameraOpen} />
    </div>
  );
}
