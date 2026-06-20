import vision from "@google-cloud/vision";
import { OcrResult } from "./types";

export async function extractTextWithGoogleVision(buffer: Buffer): Promise<OcrResult> {
  try {
    // Requires GOOGLE_APPLICATION_CREDENTIALS to be set in environment
    const client = new vision.ImageAnnotatorClient();

    const [result] = await client.documentTextDetection(buffer);
    const fullTextAnnotation = result.fullTextAnnotation;

    return {
      text: fullTextAnnotation?.text || "",
      extractionMethod: "google-vision",
    };
  } catch (error) {
    console.error("Google Vision OCR Error:", error);
    throw new Error("Failed to extract text from image using Google Vision.");
  }
}
