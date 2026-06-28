import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const userId = authUser?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // In a real multi-tenant app, get the user's org id. Here we'll use userId as a stand-in
    // or fetch it from a user profile. Since we haven't implemented orgs yet, let's use userId.
    // We assume the organization_id is the user's clerk ID for this MVP.
    const orgId = userId;

    const { data: clients, error } = await supabase
      .from("clients")
      .select("*")
      .eq("organization_id", orgId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ clients: clients || [] });
  } catch (error: any) {
    console.error("Clients GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const userId = authUser?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const orgId = userId;

    const { data: newClient, error } = await supabase
      .from("clients")
      .insert({
        ...body,
        organization_id: orgId,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ client: newClient });
  } catch (error: any) {
    console.error("Clients POST Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
