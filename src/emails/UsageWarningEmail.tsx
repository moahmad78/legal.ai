import { EmailLayout } from "./components/Layout";
import { Text, Button, Section } from "@react-email/components";

interface UsageWarningEmailProps {
  currentUsage: string;
  limitType: "chats" | "documents";
  pricingUrl?: string;
}

export function UsageWarningEmail({ 
  currentUsage = "20 / 25", 
  limitType = "chats",
  pricingUrl = "https://catalystlegal.ai/pricing" 
}: UsageWarningEmailProps) {
  return (
    <EmailLayout title="You're nearing your Catalyst usage limit">
      <Text style={heading}>You're getting close to your monthly limit</Text>
      <Text style={paragraph}>
        You have currently used <strong>{currentUsage}</strong> of your monthly {limitType}. Once you reach your limit, you will not be able to process more {limitType} until your billing cycle resets.
      </Text>

      <Section style={btnContainer}>
        <Button href={pricingUrl} style={button}>
          View Plans
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

export default UsageWarningEmail;
