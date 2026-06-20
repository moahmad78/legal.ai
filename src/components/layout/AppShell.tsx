"use client";

import { useState } from "react";
import { SidebarRouter } from "@/components/sidebar/SidebarRouter";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuestMigrationModal } from "@/components/auth/GuestMigrationModal";

export function AppShell({ children }: { children: React.ReactNode }) {
  // Desktop: true = expanded, false = collapsed (starts expanded by default for desktop)
  // Mobile: true = drawer open, false = drawer closed
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}
      
      {/* Sidebar Area */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0 md:w-[260px]" : "-translate-x-full md:w-[0px] md:translate-x-0 overflow-hidden"
        }`}
      >
        <SidebarRouter 
          isCollapsed={!sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
          onCloseMobile={() => setSidebarOpen(false)} 
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Mobile Header for hamburger */}
        <div className="md:hidden flex items-center h-14 px-4 border-b bg-background/95 backdrop-blur z-30 sticky top-0">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="-ml-2 mr-2">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <img src="/logo-legal.png" alt="Catalyst Legal AI" className="h-10 w-auto" />
          </div>
        </div>
        
        {/* Desktop Hamburger (when collapsed) */}
        {!sidebarOpen && (
          <div className="hidden md:flex absolute top-3 left-3 z-30">
             <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
               <Menu className="h-5 w-5 text-muted-foreground" />
             </Button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto relative h-full flex flex-col">
          {children}
        </main>
      </div>
      <GuestMigrationModal />
    </div>
  );
}
