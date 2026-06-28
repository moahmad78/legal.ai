"use client";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Cpu, Search, Menu, ChevronRight } from "lucide-react";
import { UserButtonDropdown } from "@/components/auth/UserButtonDropdown";
import { Notifications } from "./Notifications";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  
  const [scrolled, setScrolled] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);

  useEffect(() => {
    const el = document.querySelector('main');
    const onScroll = () => {
      setScrolled(el ? el.scrollTop > 10 : false);
    };
    el?.addEventListener('scroll', onScroll);
    return () => el?.removeEventListener('scroll', onScroll);
  }, []);
  
  const generateBreadcrumb = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname.startsWith('/clients')) return 'Clients';
    if (pathname.startsWith('/matters')) return 'Matters';
    if (pathname.startsWith('/documents')) return 'Documents';
    if (pathname.startsWith('/reports')) return 'Deliverables';
    if (pathname.startsWith('/settings')) return 'Settings';
    if (pathname.startsWith('/profile')) return 'Profile';
    return '';
  };
  
  const breadcrumb = generateBreadcrumb();

  return (
    <header className={cn(
      "sticky top-0 z-40 flex items-center px-4 gap-3 transition-all duration-200 border-b",
      scrolled 
        ? "bg-background/80 backdrop-blur-md border-border/80 shadow-sm h-14" 
        : "bg-background border-transparent h-16"
    )}>
      {/* Left section */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden text-muted-foreground hover:text-foreground hover:bg-muted shrink-0">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <Link href="/" className="flex items-center gap-2 md:hidden">
          <div className="bg-primary rounded p-1">
            <Cpu className="h-5 w-5 text-primary-foreground" />
          </div>
        </Link>
        
        {/* Desktop Breadcrumb */}
        {breadcrumb && (
          <div className="hidden md:flex items-center text-sm font-medium text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50" />
            <span className="text-foreground">{breadcrumb}</span>
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-end md:justify-start md:px-6">
        {/* Search */}
        <div className={cn(
          "relative transition-all duration-300 flex-1 md:max-w-md w-full group",
          searchExpanded ? "flex absolute inset-x-4 z-50 bg-background" : "hidden md:flex"
        )}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            type="search" 
            placeholder="Search documents, insights, or ask AI..." 
            className="w-full pl-10 bg-muted/50 border-transparent focus-visible:bg-background rounded-full focus-visible:ring-primary/30 transition-all font-body text-sm h-10"
            autoFocus={searchExpanded}
            onBlur={() => setSearchExpanded(false)}
          />
        </div>

        {/* Mobile Search Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("md:hidden shrink-0", searchExpanded ? "hidden" : "flex")}
          onClick={() => setSearchExpanded(true)}
        >
          <Search className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
      
      {/* Right section */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        {!isLoading && !user ? (
          <>
            <Link href="/sign-in" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "font-medium transition-transform hover:-translate-y-[1px] hidden sm:inline-flex")}>
              Sign In
            </Link>
            <Link href="/sign-up" className={cn(buttonVariants({ size: "sm" }), "rounded-full px-5 shadow-sm transition-transform hover:-translate-y-[1px]")}>
              Create Free Account
            </Link>
          </>
        ) : user ? (
          <>
            <Notifications />
            <div className="h-8 w-8 rounded-full border bg-muted/50 hidden md:block overflow-hidden">
              <UserButtonDropdown />
            </div>
          </>
        ) : null}
      </div>
    </header>
  );
}
