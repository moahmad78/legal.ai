"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, AlertCircle, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { analytics } from "@/lib/analytics";
import Link from "next/link";

export function BillingDashboard({ subscription, invoices, usage }: { subscription: any, invoices: any[], usage: any }) {
  const [isCanceling, setIsCanceling] = useState(false);

  const planName = subscription?.plan || "free";
  const isActive = subscription?.status === "active";
  const renewalDate = subscription?.renewal_date ? new Date(subscription.renewal_date).toLocaleDateString() : "N/A";

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You will have access until the end of the billing period.")) return;
    
    setIsCanceling(true);
    try {
      const res = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancel_at_period_end: true })
      });
      if (res.ok) {
        toast.success("Subscription canceled successfully.");
        analytics.trackSubscriptionCancelled(planName, "user_initiated");
        window.location.reload();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to cancel subscription.");
      }
    } catch (e) {
      toast.error("An error occurred.");
    }
    setIsCanceling(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Manage your subscription and billing cycle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold capitalize">{planName}</p>
                {isActive && <p className="text-sm text-muted-foreground">Renews on {renewalDate}</p>}
              </div>
              <Badge variant={isActive ? "default" : "secondary"} className="uppercase">{subscription?.status || "Free"}</Badge>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <Link href="/pricing">
              <Button variant="outline">Change Plan</Button>
            </Link>
            {isActive && (
              <Button variant="ghost" className="text-destructive" onClick={handleCancel} disabled={isCanceling}>
                {isCanceling ? "Canceling..." : "Cancel Subscription"}
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Summary</CardTitle>
            <CardDescription>Your usage for the current billing cycle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Documents Analyzed</span>
                <span className="font-medium">{usage?.document_count || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>AI Chats</span>
                <span className="font-medium">{usage?.chat_count || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>Download your past invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">No invoices found.</div>
          ) : (
            <div className="space-y-4">
              {invoices.map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{inv.invoice_number}</p>
                    <p className="text-xs text-muted-foreground">{new Date(inv.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">₹{inv.amount}</span>
                    <Badge variant={inv.status === "paid" ? "default" : "destructive"}>{inv.status}</Badge>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
