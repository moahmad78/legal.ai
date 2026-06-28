import { PricingTable } from "@/components/marketing/PricingTable";

export const metadata = {
  title: "Pricing | Catalyst AI",
  description: "Choose the right plan to unlock unlimited uploads, advanced AI chats, and more.",
};

export default function PublicPricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <PricingTable />
    </div>
  );
}
