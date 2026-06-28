import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const userId = authUser?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { clientId } = await params;

    const { data: client, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .eq("organization_id", userId) // Ensure ownership
      .eq("is_deleted", false)
      .single();

    if (error || !client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (error: any) {
    console.error("Client GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const userId = authUser?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { clientId } = await params;
    const body = await req.json();

    // Verify ownership
    const { data: existing, error: checkError } = await supabase
      .from("clients")
      .select("id")
      .eq("id", clientId)
      .eq("organization_id", userId)
      .single();

    if (checkError || !existing) {
      return NextResponse.json({ error: "Client not found or unauthorized" }, { status: 404 });
    }

    const { data: updatedClient, error } = await supabase
      .from("clients")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", clientId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ client: updatedClient });
  } catch (error: any) {
    console.error("Client PATCH Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const userId = authUser?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { clientId } = await params;

    // Verify ownership
    const { data: existing, error: checkError } = await supabase
      .from("clients")
      .select("id")
      .eq("id", clientId)
      .eq("organization_id", userId)
      .single();

    if (checkError || !existing) {
      return NextResponse.json({ error: "Client not found or unauthorized" }, { status: 404 });
    }

    // Soft delete
    const { error } = await supabase
      .from("clients")
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq("id", clientId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Client DELETE Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
