"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import Script from "next/script";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "/month",
    description: "Perfect for trying out Catalyst AI.",
    features: [
      "3 Documents / Month",
      "5 Ask AI Questions / Month",
      "PDF Downloads",
      "5 Email Reports / Month",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹499",
    period: "/month",
    description: "For professionals needing more power.",
    features: [
      "50 Documents / Month",
      "200 Ask AI Questions",
      "Unlimited Email Reports",
      "Priority Processing",
    ],
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    price: "₹1,999",
    period: "/month",
    description: "For power users and teams.",
    features: [
      "Unlimited Documents",
      "Unlimited Ask AI",
      "Unlimited Email Reports",
      "Highest Priority Processing",
    ],
  },
];

export function PricingCards({ currentPlan }: { currentPlan: string }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    try {
      setLoading(planId);
      
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate checkout");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
        subscription_id: data.subscriptionId,
        name: "Catalyst AI",
        description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan Subscription`,
        handler: function (response: any) {
          toast.success("Subscription successful! Your account is being upgraded.");
          // Ideally poll or rely on webhook, here we just reload after a brief delay
          setTimeout(() => window.location.reload(), 2000);
        },
        theme: {
          color: "#0f172a", // slate-900 (primary)
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <div className="grid md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          
          return (
            <Card 
              key={plan.id} 
              className={`flex flex-col p-6 border-2 relative ${
                plan.popular ? "border-primary shadow-lg" : "border-muted"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mt-2 min-h-[40px]">{plan.description}</p>
              </div>
              
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm font-medium">{plan.period}</span>
              </div>
              
              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                variant={plan.popular ? "default" : "outline"} 
                className="w-full"
                disabled={isCurrentPlan || loading !== null}
                onClick={() => handleSubscribe(plan.id)}
              >
                {loading === plan.id ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isCurrentPlan ? "Current Plan" : loading === plan.id ? "Processing..." : `Upgrade to ${plan.name}`}
              </Button>
            </Card>
          );
        })}
      </div>
    </>
  );
}
