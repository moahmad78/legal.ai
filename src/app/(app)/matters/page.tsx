import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MatterList } from "@/components/matters/MatterList";

export const metadata = {
  title: "Matters - Catalyst Legal AI",
};

export default async function MattersPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  const userId = authUser?.id;
  if (!userId) redirect("/sign-in");

  const orgId = userId; // Fallback to userId until orgs are fully implemented

  const { data: matters } = await supabase
    .from("matters")
    .select(`
      *,
      client:clients(id, client_name)
    `)
    .eq("organization_id", orgId)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  return (
    <div className="flex-1 overflow-auto bg-muted/10 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 md:p-8 pt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading">Matters</h1>
          <p className="text-muted-foreground mt-1">
            Manage your legal workspaces and active cases.
          </p>
        </div>

        <Suspense fallback={<div className="h-40 flex items-center justify-center">Loading matters...</div>}>
          <MatterList initialMatters={matters || []} />
        </Suspense>
      </div>
    </div>
  );
}
