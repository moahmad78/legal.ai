import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MatterProfile } from "@/components/matters/MatterProfile";

export async function generateMetadata({ params }: { params: Promise<{ matterId: string }> }) {
  const { matterId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  
  if (!userId) return { title: "Matter Profile" };

  const { data: matter } = await supabase
    .from("matters")
    .select("matter_name")
    .eq("id", matterId)
    .single();

  return {
    title: matter ? `${matter.matter_name} - Catalyst Legal AI` : "Matter Profile",
  };
}

export default async function MatterDetailPage({ params }: { params: Promise<{ matterId: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) redirect("/sign-in");

  const { matterId } = await params;
  const orgId = userId; // Fallback to userId

  const { data: matter, error } = await supabase
    .from("matters")
    .select(`
      *,
      client:clients(id, client_name)
    `)
    .eq("id", matterId)
    .eq("organization_id", orgId)
    .eq("is_archived", false)
    .single();

  if (error || !matter) {
    notFound();
  }

  return (
    <div className="flex-1 overflow-auto bg-muted/10 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 md:p-8 pt-6">
        <Suspense fallback={<div className="h-40 flex items-center justify-center">Loading matter...</div>}>
          <MatterProfile initialMatter={matter} />
        </Suspense>
      </div>
    </div>
  );
}
