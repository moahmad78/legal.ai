type EventProperties = Record<string, string | number | boolean | null | undefined>;

export const analytics = {
  trackEvent: (eventName: string, properties?: EventProperties) => {
    // In production, this would call PostHog, Mixpanel, or Google Analytics
    if (process.env.NODE_ENV === "development") {
      console.log(`📊 [Analytics Event]: ${eventName}`, properties || "");
    }
    // Example: window.posthog?.capture(eventName, properties);
  },

  pageView: (url: string) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`👁️ [Analytics PageView]: ${url}`);
    }
    // Example: window.posthog?.capture('$pageview');
  },

  identify: (userId: string, traits?: EventProperties) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`👤 [Analytics Identify]: User ${userId}`, traits || "");
    }
    // Example: window.posthog?.identify(userId, traits);
  },

  // Specialized tracking methods for Upgrade Experience
  trackPricingViewed: () => analytics.trackEvent("pricing_viewed"),
  trackUpgradeModalShown: (source: string) => analytics.trackEvent("upgrade_modal_shown", { source }),
  trackUpgradeCtaClicked: (source: string, plan?: string) => analytics.trackEvent("upgrade_cta_clicked", { source, plan }),
  trackLimitReached: (limitType: string) => analytics.trackEvent("limit_reached", { type: limitType }),
  trackUsageWarningDismissed: (limitType: string) => analytics.trackEvent("usage_warning_dismissed", { type: limitType }),

  // Billing and Subscription Events
  trackCheckoutStarted: (plan: string) => analytics.trackEvent("checkout_started", { plan }),
  trackCheckoutCompleted: (plan: string, subscriptionId: string) => analytics.trackEvent("checkout_completed", { plan, subscriptionId }),
  trackPaymentSuccess: (subscriptionId: string, amount: number) => analytics.trackEvent("payment_success", { subscriptionId, amount }),
  trackPaymentFailed: (subscriptionId: string, error: string) => analytics.trackEvent("payment_failed", { subscriptionId, error }),
  trackSubscriptionActivated: (plan: string, subscriptionId: string) => analytics.trackEvent("subscription_activated", { plan, subscriptionId }),
  trackSubscriptionCancelled: (plan: string, reason?: string) => analytics.trackEvent("subscription_cancelled", { plan, reason }),
  trackPlanChanged: (oldPlan: string, newPlan: string) => analytics.trackEvent("plan_changed", { oldPlan, newPlan }),
  trackRefundProcessed: (amount: number, reason?: string) => analytics.trackEvent("refund_processed", { amount, reason }),

  // Email Notification Events
  trackWelcomeEmailSent: () => analytics.trackEvent("welcome_email_sent"),
  trackUsageWarningSent: (limitType: string) => analytics.trackEvent("usage_warning_sent", { type: limitType }),
  trackLimitEmailSent: (limitType: string) => analytics.trackEvent("limit_email_sent", { type: limitType }),
  trackSubscriptionEmailSent: (emailType: string) => analytics.trackEvent("subscription_email_sent", { type: emailType }),
  trackPaymentFailureEmailSent: () => analytics.trackEvent("payment_failure_email_sent"),
  trackTeamInvitationSent: () => analytics.trackEvent("team_invitation_sent"),
  trackReportEmailSent: () => analytics.trackEvent("report_email_sent"),
  trackProcessingEmailSent: (processType: string) => analytics.trackEvent("processing_email_sent", { type: processType }),
  trackEmailOpened: (emailId: string) => analytics.trackEvent("email_opened", { emailId }),
  trackEmailCtaClicked: (emailId: string, linkUrl: string) => analytics.trackEvent("cta_clicked", { emailId, linkUrl })
};
