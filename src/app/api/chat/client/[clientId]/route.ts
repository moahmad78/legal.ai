import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import { env } from "@/lib/env";
export async function POST(req: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  try {
    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
    const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userId = user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = await params;
    const body = await req.json();
    const { message, conversationId } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing or invalid message" }, { status: 400 });
    }


    const { data: dbUser } = await supabase
      .from("users")
      .select("auth_user_id")
      .eq("id", userId)
      .single();

    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const internalUserId = user.id;

    // Verify client ownership
    const { data: client, error: clientErr } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .single();

    if (clientErr || !client || client.organization_id !== userId) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    // Context Assembly Strategy
    // 1. Fetch Matters
    const { data: matters } = await supabase
      .from("matters")
      .select("title, status, created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(5);

    // 2. Fetch Documents
    const { data: documents } = await supabase
      .from("documents")
      .select("file_name, document_type, status")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(5);

    // 3. Fetch Timeline Events
    const { data: timeline } = await supabase
      .from("client_timeline")
      .select("event_type, description, created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(5);

    // 4. Fetch Notes
    const { data: notes } = await supabase
      .from("client_notes")
      .select("note_type, title, content")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(3);

    const contextStr = `
CLIENT PROFILE:
Name: ${client.client_name}
Type: ${client.client_type}
Risk Status: ${client.risk_status || "Medium"}
Occupation/Industry: ${client.occupation || client.company_name || "N/A"}

RECENT MATTERS:
${matters?.map((m: any) => `- ${m.title} (${m.status})`).join("\n") || "None"}

RECENT DOCUMENTS:
${documents?.map((d: any) => `- ${d.file_name} (${d.document_type}, ${d.status})`).join("\n") || "None"}

RECENT ACTIVITY TIMELINE:
${timeline?.map((t: any) => `- ${t.description} (${new Date(t.created_at).toLocaleDateString()})`).join("\n") || "None"}

RECENT NOTES:
${notes?.map((n: any) => `- [${n.note_type}] ${n.title}: ${n.content}`).join("\n") || "None"}
`;

    // Manage Conversation
    let activeConversationId = conversationId;
    if (!activeConversationId) {
      const { data: newConv } = await supabase
        .from("assistant_conversations")
        .insert({
          user_id: internalUserId,
          client_id: clientId,
          organization_id: userId,
          title: "Client Intelligence Chat",
          mode: "client"
        })
        .select("id")
        .single();
      if (newConv) activeConversationId = newConv.id;
    }

    let chatHistory: any[] = [];
    if (activeConversationId) {
      const { data } = await supabase
        .from("assistant_messages")
        .select("role, message")
        .eq("conversation_id", activeConversationId)
        .order("created_at", { ascending: true })
        .limit(10);
      chatHistory = data || [];
    }

    const systemPrompt = `You are Catalyst Legal AI, an expert legal associate.
You are in "Client Intelligence Chat" mode.
You have access to a 360-degree context of the client below.

--- CONTEXT ---
${contextStr}
---------------

Guidelines:
* Answer questions specifically about this client using the context provided.
* If asked for a summary, synthesize the matters, documents, and risks into a cohesive overview.
* If a question falls outside the provided context, clarify that you don't have that specific data but answer conceptually.
* You MUST respond in JSON format, strictly following the schema below.

JSON Schema:
{
  "answer": "Clear, concise client-specific intelligence or summary.",
  "supportingClause": "Any relevant reference from the context (e.g. matter title, document name)",
  "businessImpact": "Implications of the client's current status or risks.",
  "recommendedAction": "Suggested best practice or next step for the lawyer.",
  "confidenceScore": 95
}
`;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
    ];

    if (chatHistory && chatHistory.length > 0) {
      for (const msg of chatHistory) {
        messages.push({ 
          role: msg.role as "user" | "assistant", 
          content: typeof msg.message === "string" ? msg.message : JSON.stringify(msg.message) 
        });
      }
    }

    messages.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const answerContent = completion.choices[0]?.message?.content || "{}";
    let answerJson = {};
    try {
      answerJson = JSON.parse(answerContent);
    } catch (e) {
      answerJson = { answer: answerContent, confidenceScore: 0 };
    }

    if (activeConversationId) {
      await supabase.from("assistant_messages").insert({
        conversation_id: activeConversationId,
        role: "user",
        message: message,
      });

      const { data: savedMessage } = await supabase.from("assistant_messages").insert({
        conversation_id: activeConversationId,
        role: "assistant",
        message: answerJson,
        confidence: (answerJson as any).confidenceScore || 0,
        sources: null,
      }).select().single();

      return NextResponse.json({
        success: true,
        answer: answerContent,
        messageId: savedMessage?.id,
        conversationId: activeConversationId
      });
    }

    return NextResponse.json({
      success: true,
      answer: answerContent,
    });

  } catch (error: any) {
    console.error("Client AI API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
