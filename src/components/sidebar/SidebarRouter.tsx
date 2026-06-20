"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { AuthSidebar } from "./AuthSidebar";
import { GuestSidebar } from "./GuestSidebar";

interface SidebarRouterProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  onCloseMobile?: () => void;
}

export function SidebarRouter(props: SidebarRouterProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null; // Hydration guard

  if (user) {
    return <AuthSidebar {...props} />;
  } else {
    return <GuestSidebar {...props} />;
  }
}
