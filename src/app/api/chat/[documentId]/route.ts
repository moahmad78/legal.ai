import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import { env } from "@/lib/env";
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userId = user?.id;
    if (!userId) return NextResponse.json({ messages: [] });

    const { documentId } = await params;

    console.log("AUTH USER", user);
    console.log("OPENAI KEY", !!process.env.OPENAI_API_KEY);

    // Fetch or create conversation
    let { data: conversation } = await supabase
      .from("assistant_conversations")
      .select("id")
      .eq("document_id", documentId)
      .eq("user_id", user.id)
      .single();

    if (!conversation) {
      const { data: newConv } = await supabase
        .from("assistant_conversations")
        .insert({ document_id: documentId, user_id: user.id, title: "Document Chat", mode: "document" })
        .select("id")
        .single();
      conversation = newConv;
    }

    if (!conversation) return NextResponse.json({ messages: [] });

    const { data: messages, error } = await supabase
      .from("assistant_messages")
      .select("id, role, message, created_at, sources, confidence")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ messages: messages || [] });
  } catch (error: any) {
    console.error("Chat GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const userId = user?.id;

    let isGuest = false;
    if (!userId) {
      isGuest = true;
    }

    const { documentId } = await params;
    const body = await req.json();
    const { message, preferredLanguage = "English", explainAudience } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing or invalid message" }, { status: 400 });
    }


    console.log("AUTH USER", user);
    console.log("OPENAI KEY", !!process.env.OPENAI_API_KEY);

    // Assume free plan by default if no user record is used
    const { getFreeUsage, incrementFreeChat } = await import("@/lib/free-tracking");
    const usage = await getFreeUsage();
    if (usage && usage.chat_count >= 25) {
      return NextResponse.json({ error: "Free plan limit reached", code: "FREE_LIMIT" }, { status: 403 });
    }
    await incrementFreeChat();

    const internalUserId = userId; // Use auth user ID directly

    // Verify document ownership if logged in
    if (!isGuest) {
      const { data: document } = await supabase
        .from("documents")
        .select("id, file_name, user_id")
        .eq("id", documentId)
        .single();

      if (!document || document.user_id !== internalUserId) {
        return NextResponse.json({ error: "Document not found or unauthorized" }, { status: 404 });
      }
    }

    // Get or Create Conversation
    let conversation = null;
    if (!isGuest && internalUserId) {
      const { data: existingConv } = await supabase
        .from("assistant_conversations")
        .select("id")
        .eq("document_id", documentId)
        .eq("user_id", internalUserId)
        .single();
      
      conversation = existingConv;

      if (!conversation) {
        const { data: newConv } = await supabase
          .from("assistant_conversations")
          .insert({ document_id: documentId, user_id: internalUserId, title: "Document Chat", mode: "document" })
          .select("id")
          .single();
        conversation = newConv;
      }
    }

    // Fetch Context (Risks & Clauses & Text)
    const { data: report } = await supabase.from("reports").select("summary, risk_level, extracted_text").eq("document_id", documentId).single();
    const { data: risks } = await supabase.from("document_risks").select("title, severity, description").eq("document_id", documentId);
    const { data: clauses } = await supabase.from("document_clauses").select("clause_type, simple_meaning, original_text").eq("document_id", documentId);

    // Fetch recent chat history
    let chatHistory: any[] = [];
    if (!isGuest && conversation) {
      const { data } = await supabase
        .from("assistant_messages")
        .select("role, message")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true })
        .limit(6);
      chatHistory = data || [];
    }

    const systemPrompt = `You are Catalyst Legal AI, an expert legal associate available 24/7.
Answer the user's questions grounded ONLY in the provided document context.

${explainAudience ? `IMPORTANT EXPLAIN-TO INSTRUCTION: The user has explicitly requested that you explain this to a **${explainAudience}**. You MUST tailor the tone, vocabulary, and depth of your answer to suit this audience perfectly. For a Client, use simple 8th-grade terms. For a Junior Associate, be technical and instructive. For a Business Team, focus purely on operational/financial impacts.` : ""}

Guidelines:
* Never hallucinate. Never invent clauses, page numbers, or legal conclusions.
* If the answer cannot be confidently determined from the provided context, you MUST return a standard rejection format: "I could not confidently determine this from the available documents." and set confidenceScore to 0.
* You MUST respond in JSON format, strictly following the schema below.
* The user's preferred language is ${preferredLanguage}. Translate the 'answer', 'businessImpact', and 'recommendedAction' fields to ${preferredLanguage}. Keep keys in English.

JSON Schema:
{
  "answer": "Clear, concise legal reasoning.",
  "supportingClause": {
    "name": "Clause Type (e.g., Liability Clause - Section X)",
    "snippet": "Short excerpt from original text"
  },
  "businessImpact": "Financial, operational, or legal consequence.",
  "recommendedAction": "Actionable negotiation suggestion.",
  "confidenceScore": 95
}

--- DOCUMENT CONTEXT ---
Summary: ${report?.summary || "N/A"}
Risks: ${JSON.stringify(risks || [])}
Clauses: ${JSON.stringify(clauses || [])}
Extracted Text: ${report?.extracted_text ? report.extracted_text.substring(0, 15000) : "N/A"}
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
      temperature: 0.1,
    });

    const answerContent = completion.choices[0]?.message?.content || "{}";
    let answerJson = {};
    try {
      answerJson = JSON.parse(answerContent);
    } catch (e) {
      answerJson = { answer: answerContent, confidenceScore: 0 };
    }

    if (!isGuest && conversation) {
      // Save user message
      await supabase.from("assistant_messages").insert({
        conversation_id: conversation.id,
        role: "user",
        message: message,
      });

      // Save assistant message
      const { data: savedMessage } = await supabase.from("assistant_messages").insert({
        conversation_id: conversation.id,
        role: "assistant",
        message: answerJson,
        confidence: (answerJson as any).confidenceScore || 0,
        sources: (answerJson as any).supportingClause || null,
      }).select().single();

      return NextResponse.json({
        success: true,
        answer: answerContent,
        messageId: savedMessage?.id,
      });
    }

    return NextResponse.json({
      success: true,
      answer: answerContent,
    });

  } catch (error: any) {
    console.error("Ask AI API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
