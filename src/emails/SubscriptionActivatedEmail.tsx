import { EmailLayout } from "./components/Layout";
import { Text, Button, Section } from "@react-email/components";

interface SubscriptionActivatedEmailProps {
  planName: string;
  renewalDate: string;
  dashboardUrl?: string;
}

export function SubscriptionActivatedEmail({ 
  planName = "Professional", 
  renewalDate = "N/A",
  dashboardUrl = "https://catalystlegal.ai/dashboard" 
}: SubscriptionActivatedEmailProps) {
  return (
    <EmailLayout title="Your Catalyst Subscription is Active">
      <Text style={heading}>Your {planName} subscription is active!</Text>
      <Text style={paragraph}>
        Thank you for choosing Catalyst Legal AI. Your subscription to the <strong>{planName}</strong> plan is now active and ready to use.
      </Text>

      <Text style={paragraph}>
        <strong>Next Renewal Date:</strong> {renewalDate}
      </Text>

      <Section style={btnContainer}>
        <Button href={dashboardUrl} style={button}>
          Explore Premium Features
        </Button>
      </Section>
    </EmailLayout>
  );
}

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#333",
  marginBottom: "16px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#525f7f",
};

const btnContainer = {
  marginTop: "32px",
  marginBottom: "32px",
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
};

export default SubscriptionActivatedEmail;
