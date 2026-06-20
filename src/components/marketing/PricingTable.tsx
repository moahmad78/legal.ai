"use client";

import { Check, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {  useAuth  } from "@/components/auth/AuthProvider";
import Link from "next/link";
import { analytics } from "@/lib/analytics";
import { useEffect, useState } from "react";
import { useUpgradeStore } from "@/store/upgrade-store";
import Script from "next/script";
import { toast } from "sonner";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Experience the power of Catalyst AI.",
    features: ["3 Documents / Month", "25 AI Chats / Month", "Watermarked PDF Exports", "Basic Intelligence"],
  },
  {
    id: "solo",
    name: "Solo",
    price: "₹999",
    period: "/month",
    description: "For independent practitioners.",
    features: ["15 Documents / Month", "100 AI Chats / Month", "Editable DOCX Exports", "Standard Reports"],
  },
  {
    id: "starter",
    name: "Starter",
    price: "₹2,499",
    period: "/month",
    description: "For growing boutique firms.",
    features: ["50 Documents / Month", "Unlimited AI Chats", "Property Intelligence", "Priority Support"],
  },
  {
    id: "professional",
    name: "Professional",
    price: "₹4,999",
    period: "/month",
    description: "For established law firms.",
    features: ["Unlimited Documents", "Advanced Intelligence", "Team Access (up to 5)", "Custom Integrations"],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations.",
    features: ["Unlimited Everything", "Dedicated Success Manager", "Audit Logs & Compliance", "SSO Authentication"],
  },
];

const featuresList = [
  { name: "Documents Analyzed", free: "3 / mo", solo: "15 / mo", starter: "50 / mo", professional: "Unlimited", enterprise: "Unlimited" },
  { name: "AI Chats", free: "25 / mo", solo: "100 / mo", starter: "Unlimited", professional: "Unlimited", enterprise: "Unlimited" },
  { name: "Reports Export", free: "Watermarked PDF", solo: "PDF & DOCX", starter: "PDF & DOCX", professional: "PDF & DOCX", enterprise: "PDF & DOCX" },
  { name: "Property Intelligence", free: false, solo: false, starter: true, professional: true, enterprise: true },
  { name: "Team Access", free: false, solo: false, starter: false, professional: "Up to 5", enterprise: "Unlimited" },
  { name: "Audit Logs", free: false, solo: false, starter: false, professional: false, enterprise: true },
  { name: "Custom Integrations", free: false, solo: false, starter: false, professional: true, enterprise: true },
  { name: "Support", free: "Community", solo: "Standard", starter: "Priority", professional: "Priority", enterprise: "24/7 Dedicated" },
];

export function PricingTable() {
  const { user } = useAuth();
  const userId = user?.id;
  const { openUpgradeModal } = useUpgradeStore();

  const [isLoading, setIsLoading] = useState<string | null>(null);

  useEffect(() => {
    analytics.trackPricingViewed();
  }, []);

  const handleCheckout = async (planId: string, planName: string) => {
    if (!userId) return;

    if (planId === "enterprise") {
      toast.info("Please contact our sales team to set up an Enterprise plan.");
      return;
    }

    if (planId === "free") {
      return;
    }

    setIsLoading(planId);
    analytics.trackCheckoutStarted(planName);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        subscription_id: data.subscriptionId,
        name: "Catalyst Legal AI",
        description: `Upgrade to ${planName}`,
        handler: function (response: any) {
          analytics.trackCheckoutCompleted(planName, data.subscriptionId);
          toast.success("Subscription activated successfully!");
          window.location.href = "/dashboard/billing";
        },
        theme: {
          color: "#0f172a",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        analytics.trackPaymentFailed(data.subscriptionId, response.error.description);
        toast.error("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (e: any) {
      toast.error(e.message || "Failed to initiate checkout");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-16 px-4 md:px-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-heading">
          Unlock the Full Power of Legal AI
        </h1>
        <p className="text-lg text-muted-foreground font-body">
          Choose a plan that fits your practice. From independent consultants to enterprise law firms.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-6 mb-20">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`flex flex-col p-6 relative bg-background border shadow-sm hover:shadow-md transition-shadow ${
              plan.popular ? "border-primary ring-1 ring-primary/20 scale-105 z-10" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-blue-500 text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3" /> Recommended
              </div>
            )}
            
            <div className="mb-4">
              <h3 className="text-lg font-bold font-heading">{plan.name}</h3>
              <p className="text-muted-foreground text-xs mt-1 min-h-[32px]">{plan.description}</p>
            </div>
            
            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-3xl font-bold font-heading tracking-tight">{plan.price}</span>
              <span className="text-muted-foreground text-xs font-medium">{plan.period}</span>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex gap-2 text-xs font-body">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {!userId ? (
              <Link href="/sign-up">
                <Button variant={plan.popular ? "default" : "outline"} className={`w-full ${plan.popular ? "bg-primary text-white" : ""}`}>
                  Get Started
                </Button>
              </Link>
            ) : (
              <Button 
                variant={plan.popular ? "default" : "outline"} 
                className={`w-full ${plan.popular ? "bg-primary text-white hover:bg-primary/90" : ""}`}
                onClick={() => handleCheckout(plan.id, plan.name)}
                disabled={isLoading === plan.id}
              >
                {isLoading === plan.id ? "Processing..." : `Upgrade to ${plan.name}`}
              </Button>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-20">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-10 font-heading">Compare Plans in Detail</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="p-4 font-semibold text-muted-foreground">Features</th>
                <th className="p-4 font-semibold text-center">Free</th>
                <th className="p-4 font-semibold text-center">Solo</th>
                <th className="p-4 font-semibold text-center">Starter</th>
                <th className="p-4 font-bold text-primary text-center bg-primary/5 rounded-t-xl">Professional</th>
                <th className="p-4 font-semibold text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {featuresList.map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium text-sm">{row.name}</td>
                  <td className="p-4 text-center text-sm">
                    {typeof row.free === "boolean" ? (row.free ? <Check className="w-4 h-4 mx-auto text-green-500" /> : <X className="w-4 h-4 mx-auto text-muted-foreground/30" />) : row.free}
                  </td>
                  <td className="p-4 text-center text-sm">
                    {typeof row.solo === "boolean" ? (row.solo ? <Check className="w-4 h-4 mx-auto text-green-500" /> : <X className="w-4 h-4 mx-auto text-muted-foreground/30" />) : row.solo}
                  </td>
                  <td className="p-4 text-center text-sm">
                    {typeof row.starter === "boolean" ? (row.starter ? <Check className="w-4 h-4 mx-auto text-green-500" /> : <X className="w-4 h-4 mx-auto text-muted-foreground/30" />) : row.starter}
                  </td>
                  <td className="p-4 text-center text-sm font-medium bg-primary/5">
                    {typeof row.professional === "boolean" ? (row.professional ? <Check className="w-4 h-4 mx-auto text-primary" /> : <X className="w-4 h-4 mx-auto text-muted-foreground/30" />) : row.professional}
                  </td>
                  <td className="p-4 text-center text-sm">
                    {typeof row.enterprise === "boolean" ? (row.enterprise ? <Check className="w-4 h-4 mx-auto text-green-500" /> : <X className="w-4 h-4 mx-auto text-muted-foreground/30" />) : row.enterprise}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
