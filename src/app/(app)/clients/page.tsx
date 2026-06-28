import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientList } from "@/components/clients/ClientList";

export const metadata = {
  title: "Clients - Catalyst Legal AI",
};

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  const userId = authUser?.id;
  if (!userId) redirect("/sign-in");

  const orgId = userId; // Fallback to userId until orgs are fully implemented

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("organization_id", orgId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  // Fetch counts
  const clientsWithCounts = await Promise.all((clients || []).map(async (client: any) => {
    // Matters count
    const { count: mattersCount } = await supabase
      .from("matters")
      .select("id", { count: "exact", head: true })
      .eq("client_id", client.id);

    // If documents are attached to matters, this gets complex without a view.
    // Assuming reports and conversations might be tied to organization_id or matter_id.
    // For now, populate matters count.
    
    return {
      ...client,
      matters_count: mattersCount || 0,
      documents_count: 0, // Requires join or view
      reports_count: 0,
      conversations_count: 0,
    };
  }));

  return (
    <div className="flex-1 overflow-auto bg-muted/10 min-h-screen">
      <div className="max-w-6xl mx-auto p-4 md:p-8 pt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading">Clients</h1>
          <p className="text-muted-foreground mt-1">
            Manage your clients, organizations, and contacts.
          </p>
        </div>

        <Suspense fallback={<div className="h-40 flex items-center justify-center">Loading clients...</div>}>
          <ClientList initialClients={clientsWithCounts || []} />
        </Suspense>
      </div>
    </div>
  );
}
