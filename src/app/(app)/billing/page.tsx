import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BillingDashboard } from "@/components/billing/BillingDashboard";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  const userId = authUser?.id;
  if (!userId) redirect("/sign-in");

  const { data: user } = await supabase.from("users").select("active_organization_id").eq("id", userId).single();
  
  if (!user || !user.active_organization_id) {
    redirect("/dashboard");
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("organization_id", user.active_organization_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const { data: invoices } = await supabase
    .from("billing_transactions")
    .select("*")
    .eq("organization_id", user.active_organization_id)
    .order("created_at", { ascending: false });

  const { data: usage } = await supabase
    .from("user_usage")
    .select("*")
    .eq("user_id", userId)
    .single();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-muted/10">
      <div className="flex items-center h-14 border-b px-6 bg-background sticky top-0 z-10">
        <h1 className="text-lg font-bold">Billing &amp; Subscription</h1>
      </div>
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <BillingDashboard 
            subscription={subscription} 
            invoices={invoices || []} 
            usage={usage} 
          />
        </div>
      </main>
    </div>
  );
}
