import { create } from "zustand";
import { DocumentAnalysisReport } from "@/services/ai/types";
import { DocumentDetectionResult } from "@/services/document-detector/types";

export type AnalysisStateStatus = "idle" | "processing" | "completed" | "failed";

interface AnalysisState {
  status: AnalysisStateStatus;
  documentId: string | null;
  report: DocumentAnalysisReport | null;
  detection: DocumentDetectionResult | null;
  error: string | null;

  setStatus: (status: AnalysisStateStatus) => void;
  setDocumentId: (id: string | null) => void;
  setResult: (detection: DocumentDetectionResult, report: DocumentAnalysisReport) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  status: "idle",
  documentId: null,
  report: null,
  detection: null,
  error: null,

  setStatus: (status) => set({ status }),
  setDocumentId: (documentId) => set({ documentId, status: "processing", error: null, report: null, detection: null }),
  setResult: (detection, report) => set({ detection, report, status: "completed" }),
  setError: (error) => set({ error, status: "failed" }),
  reset: () => set({ status: "idle", documentId: null, report: null, detection: null, error: null }),
}));
