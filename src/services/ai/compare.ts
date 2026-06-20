import OpenAI from "openai";
import { DocumentCompareResult } from "./types";
import { DOCUMENT_COMPARE_PROMPT } from "./prompts";
import { env } from "@/lib/env";
export async function compareDocuments(text1: string, text2: string, retries = 1): Promise<DocumentCompareResult> {
  try {
    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
    // Truncate both to fit in context window (roughly 100k chars each)
    const truncatedText1 = text1.substring(0, 50000);
    const truncatedText2 = text2.substring(0, 50000);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: DOCUMENT_COMPARE_PROMPT
        },
        {
          role: "user",
          content: `=== DOCUMENT V1 ===\n${truncatedText1}\n\n=== DOCUMENT V2 ===\n${truncatedText2}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) throw new Error("No response from OpenAI");

    return JSON.parse(responseContent) as DocumentCompareResult;
  } catch (error) {
    console.error("Comparison Engine Error:", error);
    
    if (retries > 0) {
      console.log("Retrying AI comparison...");
      return compareDocuments(text1, text2, retries - 1);
    }
    
    throw new Error("Failed to compare documents with AI.");
  }
}
