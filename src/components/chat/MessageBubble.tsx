"use client";

import { ChatMessage } from "@/store/authenticated-chat-store";
import { User, Cpu, Copy, Check, ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LegalMessageBubble } from "./LegalMessageBubble";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageBubbleProps {
  message: ChatMessage;
  onExplain?: (audience: string, msg: string) => void;
  onRegenerate?: (msgId: string) => void;
}

export function MessageBubble({ message, onExplain, onRegenerate }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [thumbState, setThumbState] = useState<"up" | "down" | null>(null);

  const contentStr = typeof message.message === 'string' ? message.message : JSON.stringify(message.message);

  const onCopy = () => {
    navigator.clipboard.writeText(contentStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  let parsedJson = null;
  let isJson = false;
  try {
    parsedJson = JSON.parse(contentStr);
    if (typeof parsedJson === 'object' && parsedJson !== null && ('answer' in parsedJson || 'confidenceScore' in parsedJson)) {
      isJson = true;
    }
  } catch (e) {}

  return (
    <div className={cn("flex w-full group", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex gap-3 max-w-[85%]", isUser ? "flex-row-reverse" : "flex-row")}>
        <div className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-1 overflow-hidden",
          isUser ? "bg-primary text-primary-foreground" : "bg-white border shadow-sm"
        )}>
          {isUser ? <User className="h-5 w-5" /> : <img src="/logo-legal.png" alt="AI" className="h-full w-full object-contain p-1" />}
        </div>
        
        <div className={cn(
          "px-4 py-3 rounded-2xl flex flex-col",
          isUser ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm w-full"
        )}>
          <div className={cn("whitespace-pre-wrap text-sm leading-relaxed w-full", isUser ? "" : "prose prose-sm dark:prose-invert max-w-none")}>
            {isUser ? (
              contentStr
            ) : isJson ? (
              <LegalMessageBubble content={contentStr} onExplain={(audience) => onExplain?.(audience, contentStr)} />
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {contentStr}
              </ReactMarkdown>
            )}
          </div>
          
          {!isUser && (
            <div className="mt-2 flex justify-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={onCopy} title="Copy">
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
              {onRegenerate && (
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => onRegenerate(message.id)} title="Regenerate">
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className={cn("h-6 w-6 hover:text-foreground", thumbState === "up" ? "text-green-500" : "text-muted-foreground")} onClick={() => setThumbState(thumbState === "up" ? null : "up")} title="Helpful">
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className={cn("h-6 w-6 hover:text-foreground", thumbState === "down" ? "text-red-500" : "text-muted-foreground")} onClick={() => setThumbState(thumbState === "down" ? null : "down")} title="Not Helpful">
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
