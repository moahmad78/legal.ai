import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userId = user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { messages } = body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ success: true });
    }


    const { data: dbUser } = await supabase.from("users").select("id").eq("auth_user_id", userId).single();
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Fetch or create general conversation
    let { data: conversation } = await supabase
      .from("assistant_conversations")
      .select("id")
      .is("document_id", null)
      .eq("user_id", user.id)
      .single();

    if (!conversation) {
      const { data: newConv } = await supabase
        .from("assistant_conversations")
        .insert({ user_id: user.id, organization_id: userId, title: "General Chat", mode: "general" })
        .select("id")
        .single();
      conversation = newConv;
    }

    if (!conversation) throw new Error("Failed to create conversation");

    // Format messages for db insertion
    const records = messages.map(msg => ({
      conversation_id: conversation.id,
      role: msg.role,
      message: typeof msg.message === 'string' ? msg.message : JSON.stringify(msg.message),
      created_at: msg.created_at || new Date().toISOString(),
      confidence: msg.role === 'assistant' ? 100 : null
    }));

    const { error } = await supabase.from("assistant_messages").insert(records);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Migration API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

