"use client";

import { useUser, useAuth } from "./AuthProvider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, Briefcase, Bell, Shield, CreditCard, HelpCircle, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function UserButtonDropdown() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-1 border hover:bg-muted transition-colors outline-none">
        <div className="h-8 w-8 rounded-full overflow-hidden bg-primary/10">
          <img src={user.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}`} alt={user.fullName || "User"} className="h-full w-full object-cover" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px]">
        <div className="px-2 py-1.5 text-sm">
          <div className="font-medium truncate">{user.fullName || "User"}</div>
          <div className="text-muted-foreground text-xs truncate">{user.primaryEmailAddress?.emailAddress}</div>
        </div>
        <DropdownMenuSeparator />
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
  );
}
