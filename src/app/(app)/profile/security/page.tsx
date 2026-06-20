"use client";

import {  useSessionList, useUser  } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Smartphone, Laptop, History } from "lucide-react";

export default function SecurityPage() {
  const { isLoaded, sessions } = useSessionList();
  const { user } = useUser();

  if (!isLoaded || !user) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security to your account.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Authenticator App</p>
            <p className="text-sm text-muted-foreground mt-1">Not configured</p>
          </div>
          <Button variant="outline">Enable 2FA</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Laptop className="h-5 w-5 text-blue-500" /> Active Sessions</CardTitle>
          <CardDescription>Devices that are currently logged into your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {sessions?.map((session) => (
              <div key={session.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <Laptop className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">
                        Desktop Session
                      </p>
                      {session.id === user.primaryEmailAddressId ? null : <Badge variant="outline" className="bg-green-500/10 text-green-600 text-[10px]">Current Session</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last Active: {session.lastActiveAt ? new Date(session.lastActiveAt).toLocaleString() : "Unknown"}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">Revoke</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="h-5 w-5 text-muted-foreground" /> Login History</CardTitle>
          <CardDescription>Recent authentication events for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y text-sm">
            <div className="py-3 flex justify-between items-center">
              <div>
                <p className="font-medium">Successful Login</p>
                <p className="text-xs text-muted-foreground">Chrome on Windows • Mumbai, India</p>
              </div>
              <span className="text-xs text-muted-foreground">Today, 09:15 AM</span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <div>
                <p className="font-medium">Successful Login</p>
                <p className="text-xs text-muted-foreground">Safari on iOS • Delhi, India</p>
              </div>
              <span className="text-xs text-muted-foreground">Yesterday, 14:30 PM</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
