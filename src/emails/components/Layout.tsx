import { Html, Head, Body, Container, Section, Text, Img, Link, Hr } from "@react-email/components";

export function EmailLayout({ children, title }: { children: React.ReactNode, title: string }) {
  return (
    <Html>
      <Head>
        <title>{title}</title>
      </Head>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>Catalyst Legal AI</Text>
          </Section>
          
          <Section style={content}>
            {children}
          </Section>

          <Hr style={hr} />
          
          <Section style={footer}>
            <Text style={footerText}>
              This communication was sent by Catalyst Legal AI.<br />
              If you did not expect this email, please <Link href="mailto:support@catalystlegal.ai" style={link}>contact support</Link>.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "8px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
};

const header = {
  padding: "24px 32px",
  borderBottom: "1px solid #e6ebf1",
};

const logo = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#0f172a",
  margin: "0",
};

const content = {
  padding: "32px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  padding: "0 32px",
};

const footerText = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
};

const link = {
  color: "#2563eb",
  textDecoration: "underline",
};
