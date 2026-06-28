import { EmailLayout } from "./components/Layout";
import { Text, Button, Section } from "@react-email/components";

interface CancellationEmailProps {
  endDate: string;
  pricingUrl?: string;
}

export function CancellationEmail({ 
  endDate = "the end of your billing cycle",
  pricingUrl = "https://catalystlegal.ai/pricing" 
}: CancellationEmailProps) {
  return (
    <EmailLayout title="Your subscription will end soon">
      <Text style={heading}>We're sorry to see you go</Text>
      <Text style={paragraph}>
        Your subscription cancellation has been scheduled. You will continue to have full access to your premium features until <strong>{endDate}</strong>.
      </Text>

      <Text style={paragraph}>
        After this date, your account will automatically downgrade to the Free plan. You will lose access to editable DOCX exports and advanced team capabilities.
      </Text>

      <Section style={btnContainer}>
        <Button href={pricingUrl} style={button}>
          Reactivate Subscription
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

export default CancellationEmail;
