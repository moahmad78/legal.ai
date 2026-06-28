"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@/components/auth/AuthProvider";
import { clearGuestSession } from "@/lib/guest-session";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function MigrationHandler() {
  const { isSignedIn } = useUser();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;

    // Check for existing guest session in sessionStorage
    const session = sessionStorage.getItem("catalyst_guest_session_id");
    if (session) {
      setGuestSessionId(session);
      setIsOpen(true);
    }
  }, [isSignedIn]);

  const handleMigrate = async () => {
    if (!guestSessionId) return;
    setMigrating(true);

    try {
      const res = await fetch("/api/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestSessionId }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.summary.migratedDocuments > 0 || data.summary.migratedChats > 0) {
          toast.success("Your guest sessions have been saved successfully.");
          queryClient.invalidateQueries({ queryKey: ["recent-documents"] });
          queryClient.invalidateQueries({ queryKey: ["chats"] });
        }
      }
    } catch (error) {
      console.error("Migration failed:", error);
      toast.error("Failed to migrate your previous session.");
    } finally {
      clearGuestSession();
      setIsOpen(false);
      setMigrating(false);
    }
  };

  const handleStartFresh = () => {
    clearGuestSession();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>We found your current session.</DialogTitle>
          <DialogDescription>
            You have a temporary guest session active. Would you like to save this work to your new account, or start fresh?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
          <Button variant="outline" onClick={handleStartFresh} disabled={migrating} className="w-full sm:w-auto">
            Start Fresh
          </Button>
          <Button onClick={handleMigrate} disabled={migrating} className="w-full sm:w-auto">
            {migrating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue My Work
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
