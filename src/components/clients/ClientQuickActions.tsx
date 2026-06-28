"use client";

import { Plus, Upload, MessageSquare, FileText, StickyNote, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function ClientQuickActions({ clientId }: { clientId: string }) {
  const router = useRouter();

  const actions = [
    { name: "New Matter", icon: Plus, onClick: () => router.push(`/clients/${clientId}/matters/new`), variant: "default" as any },
    { name: "Upload Document", icon: Upload, onClick: () => router.push(`/clients/${clientId}/documents?upload=true`), variant: "outline" as any },
    { name: "Start AI Chat", icon: MessageSquare, onClick: () => router.push(`/clients/${clientId}/conversations/new`), variant: "outline" as any },
    { name: "Generate Report", icon: FileText, onClick: () => router.push(`/clients/${clientId}/reports/new`), variant: "outline" as any },
    { name: "Add Note", icon: StickyNote, onClick: () => router.push(`/clients/${clientId}/notes`), variant: "outline" as any },
    { name: "Schedule Follow-up", icon: Calendar, onClick: () => router.push(`/clients/${clientId}/timeline`), variant: "outline" as any },
  ];

  return (
    <div className="bg-background rounded-xl border shadow-sm p-4 sticky top-6">
      <h3 className="font-semibold mb-4 font-heading text-sm uppercase tracking-wider text-muted-foreground">Quick Actions</h3>
      <div className="flex flex-col gap-2">
        {actions.map((action) => (
          <Button
            key={action.name}
            variant={action.variant}
            className="w-full justify-start shadow-none"
            onClick={action.onClick}
          >
            <action.icon className="mr-2 h-4 w-4" />
            {action.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
