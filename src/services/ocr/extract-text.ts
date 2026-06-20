const pdfParse = require("pdf-parse");
import mammoth from "mammoth";
import { OcrResult } from "./types";
import { extractTextWithGoogleVision } from "./google-vision";

export async function extractText(buffer: Buffer, fileType: string): Promise<OcrResult> {
  try {
    if (fileType === "application/pdf") {
      const data = await pdfParse(buffer);
      return {
        text: data.text,
        pageCount: data.numpages,
        extractionMethod: "pdf-parse",
      };
    }

    if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const data = await mammoth.extractRawText({ buffer });
      return {
        text: data.value,
        extractionMethod: "mammoth",
      };
    }

    if (["image/jpeg", "image/jpg", "image/png"].includes(fileType)) {
      return await extractTextWithGoogleVision(buffer);
    }

    throw new Error(`Unsupported file type for extraction: ${fileType}`);
  } catch (error) {
    console.error("Text Extraction Error:", error);
    throw new Error("Failed to extract text from document.");
  }
}
