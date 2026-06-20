import OpenAI from "openai";
import { DocumentDetectionResult } from "./types";
import { env } from "@/lib/env";

export async function detectDocumentType(text: string): Promise<DocumentDetectionResult> {
  try {
    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
    // Truncate text to fit within context window limits if necessary
    const truncatedText = text.substring(0, 10000); 

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using a faster/cheaper model for classification
      messages: [
        {
          role: "system",
          content: `You are an expert document classifier and language detector. 
Categorize the following text into exactly one of these types:
- Lease Agreement
- NDA
- Employment Contract
- Insurance Policy
- Invoice
- Bank Statement
- Government Notice
- Medical Report
- Tax Notice
- Academic Certificate
- General Contract
- Unknown

Also detect the primary language of the text.

Respond with valid JSON only in this exact format:
{
  "documentType": "string",
  "confidence": number (0-100),
  "languageCode": "string" (e.g., "en", "es", "ja", "fr", "ar", "hi", "ur", "zh", "ko", etc.),
  "languageName": "string" (e.g., "English", "Spanish", "Japanese"),
  "languageConfidence": number (0-100)
}`
        },
        {
          role: "user",
          content: truncatedText
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) throw new Error("No response from OpenAI");

    return JSON.parse(responseContent) as DocumentDetectionResult;
  } catch (error) {
    console.error("Document Detection Error:", error);
    return {
      documentType: "Unknown",
      confidence: 0,
      languageCode: "en",
      languageName: "English",
      languageConfidence: 0,
    };
  }
}
