export interface DocumentRisk {
  title: string;
  severity: "High" | "Medium" | "Low";
  affectedClause: string;
  description: string;
  businessImpact: string;
  recommendation: string;
  confidence: number;
}

export interface MissingClause {
  missingClause: string;
  severity: "High" | "Medium" | "Low";
  reason: string;
  recommendation: string;
}

export interface RiskHeatmap {
  liability: number;
  termination: number;
  financial: number;
  compliance: number;
  confidentiality: number;
}

export interface DocumentClause {
  clauseType: string;
  originalText: string;
  simpleMeaning: string;
  riskLevel: "High" | "Medium" | "Low";
  businessImpact: string;
  negotiationSuggestion: string;
  confidence: number;
}

export interface DocumentAnalysisReport {
  executiveSummary: string;
  purpose: string;
  parties: string[];
  riskLevel: "Low" | "Medium" | "High";
  redFlags: string[];
  importantDates: string[];
  financialTerms: string[];
  recommendations: string[];
  explainLikeIm15: string;
  // Risk Intelligence Engine Fields
  overallRiskScore: number;
  overallRiskLevel: "Low" | "Medium" | "High";
  riskConfidence: number;
  heatmap: RiskHeatmap;
  risks: DocumentRisk[];
  missingClauses: MissingClause[];
  recommendedActions: string[];
  // Clause Intelligence Engine Fields
  clauses: DocumentClause[];
}

export interface DocumentChange {
  clauseName: string;
  oldText: string;
  newText: string;
  explanation: string;
  type: "Addition" | "Deletion" | "Modification";
  severity: "High" | "Medium" | "Low";
}

export interface DocumentCompareResult {
  summary: string;
  changes: DocumentChange[];
}
