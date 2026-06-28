"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Plus, MessageSquare, Settings, CreditCard, X,  
  FileText, Briefcase, Search, User, LogOut, 
  Shield, Bell, HelpCircle, Package, 
  LayoutDashboard,        // Dashboard
  Users,                  // Clients (better than User)
  Scale,                  // Matters (legal scale icon)
  FolderOpen,             // Documents
  FileOutput,             // Deliverables
  ChevronLeft, ChevronRight,
  Sparkles                // AI Assistant section
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, useUser } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { FreePlanWidget } from "@/components/dashboard/FreePlanWidget";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

import { useUploadStore } from "@/store/upload-store";
import { useAnalysisStore } from "@/store/analysis-store";
import { useAuthenticatedChatStore } from "@/store/authenticated-chat-store";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  onCloseMobile?: () => void;
  isMobile?: boolean;
}

export function AuthSidebar({ isCollapsed = false, onToggle, onCloseMobile, isMobile = false }: SidebarProps) {
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

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Matters", href: "/matters", icon: Scale },
    { name: "Documents", href: "/documents", icon: FolderOpen },
    { name: "Deliverables", href: "/reports", icon: FileOutput },
  ];

  return (
    <TooltipProvider delay={0}>
      <motion.aside 
        initial={false}
        animate={{ width: isMobile ? '100%' : (isCollapsed ? 64 : 260) }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={cn(
        "flex flex-col h-full z-10 shrink-0 bg-sidebar border-r border-sidebar-border relative overflow-hidden text-sidebar-foreground",
        isMobile && "w-full"
      )}
    >
      <div className="p-4 flex items-center justify-between h-20 shrink-0 border-b border-sidebar-border">
        {(!isCollapsed || isMobile) ? (
          <Link href="/app/chat" className="flex items-center justify-center w-full">
            <img 
              src="/logo-legal.png" 
              alt="Catalyst AI" 
              className="w-[120px] md:w-[130px] lg:w-[150px] h-auto object-contain py-2"
            />
          </Link>
        ) : (
          <img 
            src="/logo-legal.png" 
            alt="Catalyst AI" 
            className="h-10 w-10 object-contain mx-auto"
          />
        )}

        {onCloseMobile && (
          <Button variant="ghost" size="icon" onClick={onCloseMobile} className="md:hidden shrink-0 text-sidebar-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 flex flex-col gap-6 custom-scrollbar">
        {/* Main Navigation */}
        <div className="px-2 space-y-0.5 flex flex-col">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link 
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group relative",
                      isActive 
                        ? "bg-sidebar-accent text-sidebar-primary font-medium" 
                        : "text-sidebar-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeNav"
                        className="absolute left-0 top-1 bottom-1 w-1 bg-sidebar-primary rounded-r-full"
                      />
                    )}
                    <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-sidebar-primary" : "text-sidebar-muted-foreground group-hover:text-sidebar-foreground")} />
                    {(!isCollapsed || isMobile) && (
                      <span className="whitespace-nowrap">{item.name}</span>
                    )}
                  </Link>
                </TooltipTrigger>
                {isCollapsed && !isMobile && <TooltipContent side="right">{item.name}</TooltipContent>}
              </Tooltip>
            );
          })}
        </div>

        {/* Divider */}
        <div className="px-4">
          <div className="h-px bg-sidebar-border w-full" />
        </div>

        {/* Search & New Chat Action */}
        <div className="px-2 space-y-2">
          {(!isCollapsed || isMobile) && (
            <div className="px-3 mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-xs font-semibold text-sidebar-muted-foreground uppercase tracking-wider">AI Assistant</span>
            </div>
          )}
          
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={handleNewChat}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group",
                  "bg-sidebar-primary/10 text-sidebar-primary hover:bg-sidebar-primary/20 hover:text-sidebar-primary"
                )}
              >
                <Plus className="h-4 w-4 shrink-0" />
                {(!isCollapsed || isMobile) && <span className="font-semibold whitespace-nowrap">New Chat</span>}
              </button>
            </TooltipTrigger>
            {isCollapsed && !isMobile && <TooltipContent side="right">New Chat</TooltipContent>}
          </Tooltip>

          {/* Recent Conversations */}
          {(!isCollapsed || isMobile) && conversations.length > 0 && (
            <div className="px-2 mt-2 space-y-0.5">
              <p className="px-3 mb-1 text-[11px] font-semibold text-sidebar-muted-foreground uppercase tracking-wider">
                Recent
              </p>
              {conversations.slice(0, 8).map((conv) => (
                <Link
                  key={conv.id}
                  href={`/app/chat?id=${conv.id}`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors group",
                    pathname.includes(conv.id)
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-sidebar-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
                  <span className="truncate text-xs">
                    {conv.title || "New conversation"}
                  </span>
                </Link>
              ))}
            </div>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => router.push('/search')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200 group"
              >
                <Search className="h-4 w-4 shrink-0" />
                {(!isCollapsed || isMobile) && (
                  <>
                    <span className="whitespace-nowrap">Search Chats</span>
                    <kbd className="ml-auto pointer-events-none inline-flex h-5 items-center gap-1 rounded border border-sidebar-border bg-sidebar-accent px-1.5 font-mono text-[10px] font-medium opacity-100">
                      <span className="text-xs">⌘</span>K
                    </kbd>
                  </>
                )}
              </button>
            </TooltipTrigger>
            {isCollapsed && !isMobile && <TooltipContent side="right">Search Chats (⌘K)</TooltipContent>}
          </Tooltip>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-3 border-t border-sidebar-border space-y-3 shrink-0">
        {(!isCollapsed || isMobile) && (
          <FreePlanWidget />
        )}
        
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(
              "flex items-center gap-3 w-full p-2 rounded-lg hover:bg-sidebar-accent transition-colors text-left group outline-none",
              isCollapsed && !isMobile ? "justify-center" : ""
            )}>
              <div className="h-8 w-8 rounded-full bg-sidebar-primary/20 overflow-hidden shrink-0 border border-sidebar-border flex items-center justify-center">
                {user.imageUrl ? (
                  <img src={user.imageUrl} alt={user.fullName || "User"} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-4 w-4 text-sidebar-primary" />
                )}
              </div>
              {(!isCollapsed || isMobile) && (
                <>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate group-hover:text-sidebar-foreground transition-colors">{user.fullName || "User"}</p>
                    <p className="text-xs text-sidebar-muted-foreground truncate">Solo Plan</p>
                  </div>
                  <Settings className="h-4 w-4 text-sidebar-muted-foreground group-hover:text-sidebar-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isCollapsed ? "center" : "end"} side={isCollapsed ? "right" : "bottom"} className="w-[240px]">
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
        )}
      </div>
      </motion.aside>
    </TooltipProvider>
  );
}

function Cpu(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <rect width="6" height="6" x="9" y="9" rx="1" />
      <path d="M15 2v2" />
      <path d="M15 20v2" />
      <path d="M2 15h2" />
      <path d="M2 9h2" />
      <path d="M20 15h2" />
      <path d="M20 9h2" />
      <path d="M9 2v2" />
      <path d="M9 20v2" />
    </svg>
  )
}
