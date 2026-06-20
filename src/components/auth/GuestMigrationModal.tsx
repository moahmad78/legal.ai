"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGuestStore } from "@/store/guest-store";
import { useGuestChatStore } from "@/store/guest-chat-store";
import { Loader2, ArrowRight, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function GuestMigrationModal() {
  const { user, isLoading: isLoaded } = useAuth();
  const userId = user?.id;
  const guestStore = useGuestStore();
  const guestChatStore = useGuestChatStore();
  const [open, setOpen] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && userId && guestStore.hasGuestSession()) {
      setOpen(true);
    }
  }, [isLoaded, userId, guestStore.chatCount, guestStore.documentCount]);

  const handleStartFresh = () => {
    guestStore.clearSession();
    guestChatStore.setMessages([]);
    setOpen(false);
  };

  const handleContinue = async () => {
    setMigrating(true);
    try {
      const messages = guestChatStore.messages;
      if (messages.length > 0) {
        // Send messages to backend to save in a new general conversation
        await fetch("/api/chat/migrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages })
        });
      }
    } catch (e) {
      console.error("Migration failed", e);
    } finally {
      guestStore.clearSession();
      setMigrating(false);
      setOpen(false);
      toast.success("Successfully migrated guest chats and documents to your account!");
      router.push("/app/chat");
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>We found your current work</DialogTitle>
          <DialogDescription>
            You have a guest session from before you signed in. Would you like to migrate this work to your new account?
          </DialogDescription>
        </DialogHeader>
        <div className="bg-muted/50 p-4 rounded-lg my-2 flex justify-around">
          <div className="text-center">
            <div className="text-2xl font-bold">{guestStore.chatCount}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">AI Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{guestStore.documentCount}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Analyses</div>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleStartFresh} disabled={migrating} className="w-full sm:w-auto text-destructive hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="w-4 h-4 mr-2" /> Start Fresh
          </Button>
          <Button onClick={handleContinue} disabled={migrating} className="w-full sm:w-auto">
            {migrating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
            Continue My Work
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
