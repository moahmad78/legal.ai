import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { compareDocuments } from "@/services/ai/compare";
import { trackUsage } from "@/lib/usage";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ matterId: string }> }
) {
  const { matterId } = await params;
  
  try {
    const { userId: userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    
    // Verify user
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify matter ownership
    const { data: matter } = await supabase
      .from("matters")
      .select("id")
      .eq("id", matterId)
      .eq("user_id", user.id)
      .single();

    if (!matter) {
      return NextResponse.json({ error: "Matter not found or unauthorized" }, { status: 404 });
    }

    const body = await req.json();
    const { baseDocumentId, targetDocumentId } = body;

    if (!baseDocumentId || !targetDocumentId) {
      return NextResponse.json({ error: "Both document IDs are required" }, { status: 400 });
    }

    // Fetch documents
    const { data: docs } = await supabase
      .from("documents")
      .select("id, name, extracted_text")
      .in("id", [baseDocumentId, targetDocumentId])
      .eq("matter_id", matterId);

    if (!docs || docs.length !== 2) {
      return NextResponse.json({ error: "Documents not found in this matter" }, { status: 404 });
    }

    const baseDoc = docs.find((d: any) => d.id === baseDocumentId);
    const targetDoc = docs.find((d: any) => d.id === targetDocumentId);

    if (!baseDoc?.extracted_text || !targetDoc?.extracted_text) {
      return NextResponse.json({ error: "One or both documents have not been processed for text extraction yet" }, { status: 400 });
    }

    // Call AI Compare Service
    const comparisonResult = await compareDocuments(baseDoc.extracted_text, targetDoc.extracted_text);

    // Save to database
    const { data: comparisonData, error: insertError } = await supabase
      .from("document_comparisons")
      .insert({
        matter_id: matterId,
        base_document_id: baseDocumentId,
        target_document_id: targetDocumentId,
        base_name: baseDoc.name,
        target_name: targetDoc.name,
        comparison_data: comparisonResult.changes,
        summary: comparisonResult.summary
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to save comparison:", insertError);
      // Still return the result even if saving fails
      return NextResponse.json({ result: comparisonResult });
    }

    return NextResponse.json({ 
      id: comparisonData.id,
      summary: comparisonResult.summary,
      changes: comparisonResult.changes
    });

  } catch (error: any) {
    console.error("Compare API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to compare documents" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ matterId: string }> }
) {
  const { matterId } = await params;
  
  try {
    const { userId: userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = await createClient();
    const { data: user } = await supabase.from("users").select("id").eq("id", userId).single();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("document_comparisons")
      .select("*")
      .eq("matter_id", matterId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ comparisons: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
