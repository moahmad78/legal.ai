export interface OcrResult {
  text: string;
  pageCount?: number;
  extractionMethod: "pdf-parse" | "mammoth" | "unknown";
}
