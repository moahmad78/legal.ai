"use client";

import Link from "next/link";
import { Plus, UploadCloud, FileText, CreditCard, X, PanelLeftClose, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGuestStore } from "@/store/guest-store";

import { useRouter } from "next/navigation";
import { useUploadStore } from "@/store/upload-store";
import { useAnalysisStore } from "@/store/analysis-store";
import { useGuestChatStore } from "@/store/guest-chat-store";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  onCloseMobile?: () => void;
}

export function GuestSidebar({ isCollapsed = false, onToggle, onCloseMobile }: SidebarProps) {
  const { chatCount, documentCount } = useGuestStore();
  const router = useRouter();

  const handleNewChat = (e: React.MouseEvent) => {
    e.preventDefault();
    useGuestChatStore.getState().setMessages([]);
    useUploadStore.getState().reset();
    useAnalysisStore.getState().reset();
    router.push('/chat');
    window.dispatchEvent(new CustomEvent('focus-chat-input'));
  };

  if (isCollapsed) return null;

  return (
    <aside className="w-[260px] border-r bg-muted/30 flex flex-col h-full z-10 shrink-0">
      <div className="p-3 flex items-center justify-between">
        <a 
          href="/chat" 
          onClick={handleNewChat}
          className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-background hover:bg-muted border shadow-sm transition-colors group cursor-pointer"
        >
          <div className="bg-primary/10 p-1 rounded-md group-hover:bg-primary/20">
            <Plus className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-sm">New Chat</span>
        </a>
        {onCloseMobile && (
          <Button variant="ghost" size="icon" onClick={onCloseMobile} className="md:hidden ml-2 h-10 w-10 shrink-0">
            <X className="h-5 w-5 text-muted-foreground" />
          </Button>
        )}
        {onToggle && (
          <Button variant="ghost" size="icon" onClick={onToggle} className="hidden md:flex ml-2 h-10 w-10 text-muted-foreground shrink-0">
            <PanelLeftClose className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        <div className="space-y-1">
          <button className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-medium w-full text-left" onClick={() => router.push('/search')}>
            <Search className="h-4 w-4" />
            Search Chats
            <kbd className="ml-auto pointer-events-none inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        <div className="space-y-1 pb-2 border-b">
          <Link href="/analyze" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-medium">
            <UploadCloud className="h-4 w-4" /> Analyze Document
          </Link>
          <Link href="/sample-documents" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-medium">
            <FileText className="h-4 w-4" /> Sample Documents
          </Link>
          <Link href="/pricing" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-medium">
            <CreditCard className="h-4 w-4" /> Pricing
          </Link>
        </div>
      </div>

      <div className="p-3 border-t bg-background/50 space-y-1 shrink-0">
        <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 space-y-3">
          <div>
            <h4 className="font-semibold text-sm mb-1">Free Usage</h4>
            <p className="text-xs text-muted-foreground">{Math.max(0, 10 - chatCount)} AI Questions Remaining</p>
            <p className="text-xs text-muted-foreground mt-0.5">{Math.max(0, 2 - documentCount)} Analyses Remaining</p>
          </div>
          <div className="space-y-2">
            <Link href="/sign-up" className={cn("w-full text-xs h-8 bg-primary text-primary-foreground flex items-center justify-center rounded-md font-medium hover:bg-primary/90 transition-colors")}>
              Create Free Account
            </Link>
            <Link href="/sign-in" className={cn("w-full text-xs h-8 border flex items-center justify-center rounded-md font-medium hover:bg-muted transition-colors")}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
