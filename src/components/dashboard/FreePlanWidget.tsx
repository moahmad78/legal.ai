"use client";

import { useEffect, useState } from "react";
import { fetchFreeUsage } from "@/actions/free-actions";
import {  useAuth  } from "@/components/auth/AuthProvider";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap } from "lucide-react";
import { useUpgradeStore } from "@/store/upgrade-store";
import { analytics } from "@/lib/analytics";

export function FreePlanWidget() {
  const { user } = useAuth();
  const userId = user?.id;
  const [usage, setUsage] = useState<{ chat_count: number; document_count: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const { openUpgradeModal } = useUpgradeStore();

  useEffect(() => {
    if (userId) {
      fetchFreeUsage().then((res) => {
        if (res.success && res.usage) {
          setUsage(res.usage);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [userId]);

  if (!userId || loading || !usage) return null;

  const chatPercentage = Math.min((usage.chat_count / 25) * 100, 100);
  const docPercentage = Math.min((usage.document_count / 3) * 100, 100);

  return (
    <div className="mt-4 p-4 rounded-xl border bg-gradient-to-br from-card to-card/50 text-card-foreground shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Zap className="w-24 h-24" />
      </div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="font-semibold text-sm">Subscription</h3>
        <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md uppercase tracking-wider">Free Plan</span>
      </div>
      
      <div className="space-y-4 relative z-10">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">AI Chats</span>
            <span className="font-medium">{usage.chat_count} / 25</span>
          </div>
          <Progress value={chatPercentage} className="h-1.5" />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Documents</span>
            <span className="font-medium">{usage.document_count} / 3</span>
          </div>
          <Progress value={docPercentage} className="h-1.5" />
        </div>
      </div>

      <Button 
        onClick={() => {
          analytics.trackUpgradeCtaClicked("dashboard_widget", "Professional");
          openUpgradeModal({ title: "Unlock More with Catalyst Professional", message: "Upgrade to continue using Catalyst without interruptions." });
        }} 
        className="w-full mt-5 h-9 text-xs font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-sm transition-all hover:shadow-md"
      >
        <Sparkles className="w-3.5 h-3.5 mr-2" /> Upgrade Plan
      </Button>
    </div>
  );
}
