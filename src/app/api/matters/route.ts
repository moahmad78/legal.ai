import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const userId = authUser?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orgId = userId; // Fallback

    const { data: matters, error } = await supabase
      .from("matters")
      .select(`
        *,
        client:clients(id, client_name)
      `)
      .eq("organization_id", orgId)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ matters: matters || [] });
  } catch (error: any) {
    console.error("Matters GET Error:", error);
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
    const orgId = userId; // Fallback

    const { data: newMatter, error } = await supabase
      .from("matters")
      .insert({
        ...body,
        organization_id: orgId,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ matter: newMatter });
  } catch (error: any) {
    console.error("Matters POST Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
