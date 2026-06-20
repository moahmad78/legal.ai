import OpenAI from "openai";
import { DocumentAnalysisReport } from "./types";
import { UNIVERSAL_ANALYSIS_PROMPT } from "./prompts";
import { env } from "@/lib/env";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function analyzeDocument(text: string, preferredLanguage: string = "English", retries = 1): Promise<DocumentAnalysisReport> {
  try {
    // Truncate to a reasonable length for OpenAI to process (approx 100k chars ~ 25k tokens)
    const truncatedText = text.substring(0, 100000);

    const injectedPrompt = `${UNIVERSAL_ANALYSIS_PROMPT}\n\nIMPORTANT: You must write the final JSON response entirely in ${preferredLanguage}. Preserve the exact JSON keys in English, but translate all values into ${preferredLanguage}.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Using the flagship model for complex analysis
      messages: [
        {
          role: "system",
          content: injectedPrompt
        },
        {
          role: "user",
          content: truncatedText
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) throw new Error("No response from OpenAI");

    return JSON.parse(responseContent) as DocumentAnalysisReport;
  } catch (error) {
    console.error("Analysis Engine Error:", error);
    
    if (retries > 0) {
      console.log("Retrying AI analysis...");
      return analyzeDocument(text, preferredLanguage, retries - 1);
    }
    
    throw new Error("Failed to analyze document with AI.");
  }
}
