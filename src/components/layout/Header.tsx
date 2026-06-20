import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Cpu, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { UserButtonDropdown } from "@/components/auth/UserButtonDropdown";
import { Notifications } from "./Notifications";
import { cn } from "@/lib/utils";

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  
  return (
    <header className="h-16 border-b flex items-center justify-between px-6 sticky top-0 z-40 glass">
      <div className="flex items-center gap-4 flex-1">
        <Link href="/" className="flex items-center gap-2 md:hidden">
          <img src="/logo-legal.png" alt="Catalyst Legal AI" className="h-10 w-auto" />
        </Link>
        
        <div className="hidden md:flex relative max-w-md w-full group">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            type="search" 
            placeholder="Search documents, insights, or ask AI..." 
            className="w-full pl-10 bg-muted/30 border-transparent focus-visible:bg-background rounded-full focus-visible:ring-primary/20 transition-all font-body text-sm"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {!userId ? (
          <>
            <Link href="/sign-in" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "font-medium transition-transform hover:-translate-y-[1px]")}>
              Sign In
            </Link>
            <Link href="/sign-up" className={cn(buttonVariants({ size: "sm" }), "rounded-full px-5 shadow-sm transition-transform hover:-translate-y-[1px]")}>
              Create Free Account
            </Link>
          </>
        ) : (
          <>
            <Notifications />
            <UserButtonDropdown />
          </>
        )}
      </div>
    </header>
  );
}
