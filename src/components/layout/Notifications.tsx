"use client";

import { useEffect, useState } from "react";
import {  useAuth  } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function Notifications() {
  const { user } = useAuth();
  const userId = user?.id;
  const supabase = createClient();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    async function loadNotifs() {
      if (!userId) return;
      const { data: user } = await supabase.from("users").select("active_organization_id").eq("id", userId).single();
      if (!user?.active_organization_id) return;

      const { data: notifs } = await supabase
        .from("notifications")
        .select("*")
        .eq("organization_id", user.active_organization_id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (notifs) {
        setNotifications(notifs);
        setUnread(notifs.filter((n: any) => !n.read).length);
      }
    }
    loadNotifs();
  }, [userId]);

  const markAsRead = async () => {
    if (unread === 0 || !userId) return;
    
    setUnread(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    
    const { data: user } = await supabase.from("users").select("active_organization_id").eq("id", userId).single();
    if (user?.active_organization_id) {
      await supabase.from("notifications").update({ read: true }).eq("organization_id", user.active_organization_id).eq("read", false);
    }
  };

  return (
    <Popover onOpenChange={(open) => open && markAsRead()}>
      <PopoverTrigger render={<Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground hover:text-primary" />}>
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 animate-pulse" />
          )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 rounded-xl">
        <div className="p-3 border-b bg-muted/20">
          <h4 className="font-semibold text-sm">Notifications</h4>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              You're all caught up!
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`p-3 border-b last:border-0 text-sm ${!n.read ? 'bg-primary/5' : ''}`}>
                <p className="text-foreground leading-relaxed">{n.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
