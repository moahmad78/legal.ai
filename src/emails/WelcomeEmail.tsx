import { EmailLayout } from "./components/Layout";
import { Text, Button, Section } from "@react-email/components";

interface WelcomeEmailProps {
  firstName?: string;
  loginUrl?: string;
}

export function WelcomeEmail({ firstName = "there", loginUrl = "https://catalystlegal.ai/sign-in" }: WelcomeEmailProps) {
  return (
    <EmailLayout title="Welcome to Catalyst Legal AI">
      <Text style={heading}>Welcome to Catalyst Legal AI, {firstName}</Text>
      <Text style={paragraph}>
        We're thrilled to have you onboard. Catalyst is an enterprise-grade Legal Operating System designed to automate legal due diligence, risk discovery, and contract review.
      </Text>
      
      <Text style={subheading}>Key Capabilities you can explore today:</Text>
      <ul style={list}>
        <li>Upload and analyze complex legal documents instantly.</li>
        <li>Identify critical hidden risks in contracts.</li>
        <li>Interact with our Dual-Mode Legal AI Assistant.</li>
      </ul>

      <Section style={btnContainer}>
        <Button href={loginUrl} style={button}>
          Start Using Catalyst
        </Button>
      </Section>

      <Text style={paragraph}>
        If you have any questions or need help setting up your firm's workspace, simply reply to this email.
      </Text>
    </EmailLayout>
  );
}

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#333",
  marginBottom: "16px",
};

const subheading = {
  fontSize: "18px",
  fontWeight: "semibold",
  color: "#333",
  marginTop: "24px",
  marginBottom: "8px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#525f7f",
};

const list = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  paddingLeft: "24px",
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

export default WelcomeEmail;
