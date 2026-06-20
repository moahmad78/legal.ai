export interface DocumentDetectionResult {
  documentType: string;
  confidence: number;
  languageCode?: string;
  languageName?: string;
  languageConfidence?: number;
}
