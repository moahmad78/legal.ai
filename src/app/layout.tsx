import type { Metadata } from "next";
import { Inter, Outfit, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { MigrationHandler } from "@/components/auth/MigrationHandler";
import { SignupModal } from "@/components/auth/SignupModal";
import { UpgradeModal } from "@/components/modals/UpgradeModal";
import { GlobalSearch } from "@/components/search/GlobalSearch";

const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const fontHeading = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
});

const fontAccent = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-accent",
});

export const metadata: Metadata = {
  title: {
    default: "Catalyst AI | Document Intelligence",
    template: "%s | Catalyst AI",
  },
  description: "AI-powered document intelligence assistant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${fontBody.variable} ${fontHeading.variable} ${fontAccent.variable} font-sans antialiased min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary`}
        >
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider delay={300}>
                {children}
                <MigrationHandler />
                <SignupModal />
                <UpgradeModal />
                <GlobalSearch />
              </TooltipProvider>
              <Toaster />
            </ThemeProvider>
          </QueryProvider>
        </body>
      </html>
    </AuthProvider>
  );
}
