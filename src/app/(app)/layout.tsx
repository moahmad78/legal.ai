import { AppShell } from "@/components/layout/AppShell";

export const metadata = {
  title: "Catalyst Legal AI",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
