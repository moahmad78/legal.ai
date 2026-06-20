import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientWorkspaceHeader } from "@/components/clients/ClientWorkspaceHeader";
import { ClientQuickActions } from "@/components/clients/ClientQuickActions";

export default async function ClientWorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  const userId = authUser?.id;
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (!client) {
    redirect("/clients");
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/10 relative">
      <ClientWorkspaceHeader client={client} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 flex flex-col md:flex-row gap-8">
        <main className="flex-1 min-w-0">
          {children}
        </main>
        
        <aside className="w-full md:w-64 shrink-0">
          <ClientQuickActions clientId={client.id} />
        </aside>
      </div>
    </div>
  );
}
