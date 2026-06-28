import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ matterId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const userId = authUser?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { matterId } = await params;

    const { data: matter, error } = await supabase
      .from("matters")
      .select(`
        *,
        client:clients(id, client_name)
      `)
      .eq("id", matterId)
      .eq("organization_id", userId) // Ensure ownership
      .eq("is_archived", false)
      .single();

    if (error || !matter) {
      return NextResponse.json({ error: "Matter not found" }, { status: 404 });
    }

    return NextResponse.json({ matter });
  } catch (error: any) {
    console.error("Matter GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ matterId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const userId = authUser?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { matterId } = await params;
    const body = await req.json();

    // Verify ownership
    const { data: existing, error: checkError } = await supabase
      .from("matters")
      .select("id")
      .eq("id", matterId)
      .eq("organization_id", userId)
      .single();

    if (checkError || !existing) {
      return NextResponse.json({ error: "Matter not found or unauthorized" }, { status: 404 });
    }

    const { data: updatedMatter, error } = await supabase
      .from("matters")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", matterId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ matter: updatedMatter });
  } catch (error: any) {
    console.error("Matter PATCH Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// "DELETE" handles archiving in this context to avoid confusion, or we can use PATCH to archive. 
// For simplicity and REST alignment for "removing" from view, DELETE is used here.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ matterId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const userId = authUser?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { matterId } = await params;

    // Verify ownership
    const { data: existing, error: checkError } = await supabase
      .from("matters")
      .select("id")
      .eq("id", matterId)
      .eq("organization_id", userId)
      .single();

    if (checkError || !existing) {
      return NextResponse.json({ error: "Matter not found or unauthorized" }, { status: 404 });
    }

    // Soft delete / archive
    const { error } = await supabase
      .from("matters")
      .update({ is_archived: true, updated_at: new Date().toISOString() })
      .eq("id", matterId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Matter DELETE Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
