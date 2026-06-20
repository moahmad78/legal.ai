"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {  useAuth  } from "@/components/auth/AuthProvider";

interface Preferences {
  usage_emails: boolean;
  marketing_emails: boolean;
  report_notifications: boolean;
  security_notifications: boolean;
  billing_notifications: boolean;
}

export function NotificationPreferences() {
  const { user } = useAuth();
  const userId = user?.id;
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPreferences() {
      if (!userId) return;
      const supabase = createClient();
      
      const { data: user } = await supabase.from("users").select("id").eq("id", userId).single();
      if (!user) return;

      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setPreferences(data);
      } else {
        // If no row exists yet, initialize it
        const defaultPrefs = {
          user_id: user.id,
          usage_emails: true,
          marketing_emails: false,
          report_notifications: true,
          security_notifications: true,
          billing_notifications: true,
        };
        const { data: newPrefs } = await supabase.from("notification_preferences").insert(defaultPrefs).select().single();
        if (newPrefs) setPreferences(newPrefs);
      }
      setLoading(false);
    }
    loadPreferences();
  }, [userId]);

  const togglePref = async (key: keyof Preferences) => {
    if (!preferences || !userId) return;

    const newValue = !preferences[key];
    setPreferences({ ...preferences, [key]: newValue });

    try {
      const supabase = createClient();
      const { data: user } = await supabase.from("users").select("id").eq("id", userId).single();
      
      if (user) {
        await supabase
          .from("notification_preferences")
          .update({ [key]: newValue, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);
        toast.success("Preferences updated");
      }
    } catch (e) {
      toast.error("Failed to update preferences");
      // revert
      setPreferences({ ...preferences, [key]: !newValue });
    }
  };

  if (loading) return <div>Loading preferences...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Notifications</CardTitle>
        <CardDescription>Manage how we communicate with you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Usage Alerts</Label>
            <p className="text-sm text-muted-foreground">Receive emails when nearing plan limits.</p>
          </div>
          <Switch 
            checked={preferences?.usage_emails} 
            onCheckedChange={() => togglePref("usage_emails")} 
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Report & Processing Ready</Label>
            <p className="text-sm text-muted-foreground">Get notified when long-running AI tasks finish.</p>
          </div>
          <Switch 
            checked={preferences?.report_notifications} 
            onCheckedChange={() => togglePref("report_notifications")} 
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Marketing Emails</Label>
            <p className="text-sm text-muted-foreground">Hear about new features and legal AI insights.</p>
          </div>
          <Switch 
            checked={preferences?.marketing_emails} 
            onCheckedChange={() => togglePref("marketing_emails")} 
          />
        </div>

        <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
          <div className="space-y-0.5">
            <Label>Security Alerts</Label>
            <p className="text-sm text-muted-foreground">Mandatory alerts for suspicious activity and logins.</p>
          </div>
          <Switch checked={true} disabled />
        </div>

        <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
          <div className="space-y-0.5">
            <Label>Billing & Receipts</Label>
            <p className="text-sm text-muted-foreground">Mandatory invoices and subscription updates.</p>
          </div>
          <Switch checked={true} disabled />
        </div>

      </CardContent>
    </Card>
  );
}
