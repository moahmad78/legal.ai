import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import { env } from "@/lib/env";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userId = user?.id;
    if (!userId) return NextResponse.json({ messages: [] });


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

    if (!conversation) return NextResponse.json({ messages: [] });

    const { data: messages, error } = await supabase
      .from("assistant_messages")
      .select("id, role, message, created_at, sources, confidence")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Normalize legacy JSON messages to pure text for the unified UI
    const normalizedMessages = (messages || []).map((msg: any) => {
      let content = msg.message;
      if (typeof content === 'object' && content !== null) {
        content = content.answer || JSON.stringify(content);
      }
      return { ...msg, message: content };
    });

    return NextResponse.json({ messages: normalizedMessages });
  } catch (error: any) {
    console.error("General Chat GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const userId = user?.id;

    let isGuest = false;
    if (!userId) {
      isGuest = true;
    }

    const body = await req.json();
    const { message, preferredLanguage = "English", stream = true } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing or invalid message" }, { status: 400 });
    }


    let internalUserId = null;
    if (!isGuest) {
      const { data: dbUser } = await supabase
        .from("users")
        .select("id, plan")
        .eq("auth_user_id", userId)
        .single();

      if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

      if (dbUser.plan === "free") {
        const { getFreeUsage, incrementFreeChat } = await import("@/lib/free-tracking");
        const usage = await getFreeUsage();
        if (usage && usage.chat_count >= 25) {
          return NextResponse.json({ error: "Free plan limit reached", code: "FREE_LIMIT" }, { status: 403 });
        }
        await incrementFreeChat();
      }
      internalUserId = dbUser.id;
    }

    // Get or Create General Conversation
    let conversation: any = null;
    if (!isGuest && internalUserId) {
      const { data: conv } = await supabase
        .from("assistant_conversations")
        .select("id")
        .is("document_id", null)
        .eq("user_id", internalUserId)
        .single();

      if (!conv) {
        const { data: newConv } = await supabase
          .from("assistant_conversations")
          .insert({ user_id: internalUserId, organization_id: userId, title: "General Chat", mode: "general" })
          .select("id")
          .single();
        conversation = newConv;
      } else {
        conversation = conv;
      }
    }

    // Fetch recent chat history if user exists
    let chatHistory: any[] = [];
    if (!isGuest && conversation) {
      const { data } = await supabase
        .from("assistant_messages")
        .select("role, message")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true })
        .limit(10);
      chatHistory = data || [];
    }

    const systemPrompt = `You are Catalyst Legal AI, an expert legal associate available 24/7.
You are in "Universal AI Assistant" mode.
Guidelines:
* Answer any general or legal workflow questions.
* Provide legal education and guidance.
* Do not claim document-specific knowledge unless a document is provided.
* Clearly state when advice is general information and does not constitute formal legal counsel.
* Use Markdown extensively for readability. Use bolding, bullet points, and tables where appropriate.
* The user's preferred language is ${preferredLanguage}. Translate your response to ${preferredLanguage}.`;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
    ];

    if (chatHistory && chatHistory.length > 0) {
      for (const msg of chatHistory) {
        let content = msg.message;
        if (typeof content === 'object' && content !== null) {
          content = content.answer || JSON.stringify(content);
        }
        messages.push({ 
          role: msg.role as "user" | "assistant", 
          content: content
        });
      }
    }

    messages.push({ role: "user", content: message });

    if (stream) {
      const completionStream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
        temperature: 0.3,
        stream: true,
      });

      const encoder = new TextEncoder();

      const readableStream = new ReadableStream({
        async start(controller) {
          let fullContent = "";
          try {
            for await (const chunk of completionStream) {
              const text = chunk.choices[0]?.delta?.content;
              if (text) {
                fullContent += text;
                controller.enqueue(encoder.encode(text));
              }
            }
          } catch (e) {
            controller.error(e);
          } finally {
            controller.close();
            
            // Save to DB after stream finishes securely in background
            if (!isGuest && conversation) {
              await supabase.from("assistant_messages").insert([
                { conversation_id: conversation.id, role: "user", message: message },
                { conversation_id: conversation.id, role: "assistant", message: fullContent, confidence: 100 }
              ]);
            }
          }
        }
      });

      return new NextResponse(readableStream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // Fallback for non-streaming
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.3,
    });

    const answerContent = completion.choices[0]?.message?.content || "";

    if (!isGuest && conversation) {
      await supabase.from("assistant_messages").insert([
        { conversation_id: conversation.id, role: "user", message: message },
        { conversation_id: conversation.id, role: "assistant", message: answerContent, confidence: 100 }
      ]);
    }

    return NextResponse.json({
      success: true,
      answer: answerContent,
    });

  } catch (error: any) {
    console.error("General AI API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

