"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, MessageSquare, Settings, CreditCard, X, PanelLeftClose, FileText, Pin, Briefcase, Search, MoreHorizontal, User, Share, Edit2, FolderInput, Archive, Trash2, LogOut, Shield, Bell, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, useUser } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { FreePlanWidget } from "@/components/dashboard/FreePlanWidget";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  onCloseMobile?: () => void;
}

import { useRouter } from "next/navigation";
import { useUploadStore } from "@/store/upload-store";
import { useAnalysisStore } from "@/store/analysis-store";
import { useAuthenticatedChatStore } from "@/store/authenticated-chat-store";

export function AuthSidebar({ isCollapsed = false, onToggle, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();

  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    async function loadConversations() {
      if (!user?.id) return;
      const supabase = createClient();
      const { data } = await supabase
        .from("assistant_conversations")
        .select("id, title, is_pinned, created_at")
        .eq("organization_id", user.id)
        .order("created_at", { ascending: false });
      
      if (data) {
        setConversations(data);
      }
    }
    loadConversations();
  }, [user?.id]);

  const handleNewChat = (e: React.MouseEvent) => {
    e.preventDefault();
    const newChatId = crypto.randomUUID();
    useAuthenticatedChatStore.getState().setMessages([]);
    useUploadStore.getState().reset();
    useAnalysisStore.getState().reset();
    router.push(`/app/chat?id=${newChatId}`);
    if (onCloseMobile) onCloseMobile();
    window.dispatchEvent(new CustomEvent('focus-chat-input'));
  };

  if (isCollapsed) return null;

  const pinnedChats = conversations.filter(c => c.is_pinned);
  const unpinnedChats = conversations.filter(c => !c.is_pinned);
  
  // Basic date grouping
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const recentChats = {
    today: unpinnedChats.filter(c => new Date(c.created_at) >= today),
    yesterday: unpinnedChats.filter(c => {
      const d = new Date(c.created_at);
      return d >= yesterday && d < today;
    }),
    older: unpinnedChats.filter(c => new Date(c.created_at) < yesterday)
  };

  return (
    <aside className="w-[260px] border-r bg-muted/30 flex flex-col h-full z-10 shrink-0">
      <div className="p-3 flex items-center justify-between">
        <Link 
          href="/app/chat" 
          onClick={handleNewChat}
          className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-background hover:bg-muted border shadow-sm transition-colors group cursor-pointer"
        >
          <div className="bg-primary/10 p-1 rounded-md group-hover:bg-primary/20">
            <Plus className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-sm">New Chat</span>
        </Link>
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

        <div className="space-y-1 pb-2">
          <Link href="/clients" className={cn("flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors", pathname.startsWith("/clients") ? "bg-muted text-foreground font-medium" : "hover:bg-muted text-muted-foreground hover:text-foreground")}>
            <User className="h-4 w-4" /> Clients
          </Link>
          <Link href="/matters" className={cn("flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors", pathname.startsWith("/matters") ? "bg-muted text-foreground font-medium" : "hover:bg-muted text-muted-foreground hover:text-foreground")}>
            <Briefcase className="h-4 w-4" /> Matters
          </Link>
          <Link href="/documents" className={cn("flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors", pathname.startsWith("/documents") ? "bg-muted text-foreground font-medium" : "hover:bg-muted text-muted-foreground hover:text-foreground")}>
            <FileText className="h-4 w-4" /> Documents
          </Link>
          <Link href="/reports" className={cn("flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors", pathname.startsWith("/reports") ? "bg-muted text-foreground font-medium" : "hover:bg-muted text-muted-foreground hover:text-foreground")}>
            <FileText className="h-4 w-4" /> Deliverables
          </Link>
        </div>

        {/* Pinned Section */}
        {pinnedChats.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-2 px-2 flex items-center gap-2">
              <Pin className="h-3 w-3" /> Pinned
            </div>
            <div className="space-y-0.5">
              {pinnedChats.map((chat) => (
                <ChatItem key={chat.id} title={chat.title} isPinned />
              ))}
            </div>
          </div>
        )}

        {/* Recent Conversations */}
        <div className="space-y-6">
          {recentChats.today.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">Today</div>
              <div className="space-y-0.5">
                {recentChats.today.map((chat) => (
                  <ChatItem key={chat.id} title={chat.title} />
                ))}
              </div>
            </div>
          )}
          {recentChats.yesterday.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">Yesterday</div>
              <div className="space-y-0.5">
                {recentChats.yesterday.map((chat) => (
                  <ChatItem key={chat.id} title={chat.title} />
                ))}
              </div>
            </div>
          )}
          {recentChats.older.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">Previous 7 Days</div>
              <div className="space-y-0.5">
                {recentChats.older.map((chat) => (
                  <ChatItem key={chat.id} title={chat.title} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 border-t bg-background/50 space-y-1 shrink-0">
        {user ? (
          <>
            <FreePlanWidget />
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted transition-colors text-left group outline-none">
                  <div className="h-8 w-8 rounded-full bg-primary/10 overflow-hidden shrink-0 border">
                    <img src={user.imageUrl} alt={user.fullName || "User"} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{user.fullName || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">Solo Plan</p>
                  </div>
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground group-hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[240px]">
                <Link href="/profile">
                  <DropdownMenuItem className="flex items-center cursor-pointer">
                    <User className="h-4 w-4 mr-2" /> My Profile
                  </DropdownMenuItem>
                </Link>
                <Link href="/settings/organization">
                  <DropdownMenuItem className="flex items-center cursor-pointer">
                    <Briefcase className="h-4 w-4 mr-2" /> Organization
                  </DropdownMenuItem>
                </Link>
                <Link href="/profile/notifications">
                  <DropdownMenuItem className="flex items-center cursor-pointer">
                    <Bell className="h-4 w-4 mr-2" /> Notification Settings
                  </DropdownMenuItem>
                </Link>
                <Link href="/profile/security">
                  <DropdownMenuItem className="flex items-center cursor-pointer">
                    <Shield className="h-4 w-4 mr-2" /> Security
                  </DropdownMenuItem>
                </Link>
                <Link href="/billing">
                  <DropdownMenuItem className="flex items-center cursor-pointer">
                    <CreditCard className="h-4 w-4 mr-2" /> Billing
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center cursor-pointer">
                  <HelpCircle className="h-4 w-4 mr-2" /> Help & Support
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()} className="flex items-center cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : null}
      </div>
    </aside>
  );
}

function ChatItem({ title, isPinned = false }: { title: string, isPinned?: boolean }) {
  return (
    <div className="group flex items-center justify-between gap-1 px-2 py-2 rounded-lg text-sm hover:bg-muted transition-colors text-foreground cursor-pointer">
      <Link href="#" className="flex items-center gap-2.5 flex-1 truncate">
        {isPinned ? <Pin className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-foreground" /> : <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-foreground" />}
        <span className="truncate pr-2">{title}</span>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 p-1 hover:bg-background rounded-md transition-all outline-none">
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuItem className="flex items-center cursor-pointer"><Share className="h-4 w-4 mr-2" /> Share</DropdownMenuItem>
          <DropdownMenuItem className="flex items-center cursor-pointer"><Edit2 className="h-4 w-4 mr-2" /> Rename</DropdownMenuItem>
          <DropdownMenuItem className="flex items-center cursor-pointer"><Pin className="h-4 w-4 mr-2" /> {isPinned ? "Unpin" : "Pin"}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex items-center cursor-pointer"><User className="h-4 w-4 mr-2" /> Move to Client</DropdownMenuItem>
          <DropdownMenuItem className="flex items-center cursor-pointer"><Briefcase className="h-4 w-4 mr-2" /> Move to Matter</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex items-center cursor-pointer"><Archive className="h-4 w-4 mr-2" /> Archive</DropdownMenuItem>
          <DropdownMenuItem className="flex items-center cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
