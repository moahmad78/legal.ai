"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Shield, Bell, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navigation = [
    { name: "My Profile", href: "/profile", icon: User },
    { name: "Security", href: "/profile/security", icon: Shield },
    { name: "Notifications", href: "/profile/notifications", icon: Bell },
    { name: "Organization", href: "/settings/organization", icon: Briefcase },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-muted/10 overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your personal preferences, security, and organization.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sub Navigation */}
          <aside className="w-full md:w-64 shrink-0">
            <nav className="flex flex-col space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground font-medium shadow-sm" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
