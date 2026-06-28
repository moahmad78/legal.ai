"use client";

import { useUpgradeStore } from "@/store/upgrade-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { analytics } from "@/lib/analytics";
import { logUpgradeIntent } from "@/actions/upgrade-intents";

export function UpgradeModal() {
  const { isOpen, title, message, closeUpgradeModal } = useUpgradeStore();

  useEffect(() => {
    if (isOpen) {
      analytics.trackUpgradeModalShown(title);
    }
  }, [isOpen, title]);

  const handleUpgradeClick = async () => {
    analytics.trackUpgradeCtaClicked(title);
    await logUpgradeIntent(title);
    closeUpgradeModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeUpgradeModal()}>
      <DialogContent className="sm:max-w-md p-6 text-center border-border shadow-xl">
        <DialogHeader className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-bold font-heading">{title}</DialogTitle>
          <DialogDescription className="text-sm mt-2 font-sans text-center">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="text-left mt-5 bg-muted/30 p-4 rounded-xl border space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground"><CheckCircle2 className="w-4 h-4 text-primary" /> More documents & uploads</div>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground"><CheckCircle2 className="w-4 h-4 text-primary" /> More AI chats & history</div>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground"><CheckCircle2 className="w-4 h-4 text-primary" /> DOCX exports & editing</div>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground"><CheckCircle2 className="w-4 h-4 text-primary" /> Team collaboration features</div>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground"><CheckCircle2 className="w-4 h-4 text-primary" /> Advanced intelligence reports</div>
        </div>

        <div className="mt-6 space-y-3">
          <Link href="/pricing" onClick={handleUpgradeClick} className="block">
            <Button className="w-full h-11 text-base rounded-xl font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-primary-foreground shadow-sm">
              View Plans
            </Button>
          </Link>
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => {
            analytics.trackEvent("upgrade_modal_dismissed", { source: title });
            closeUpgradeModal();
          }}>
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
