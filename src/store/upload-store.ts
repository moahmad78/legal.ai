import { create } from "zustand";

export type UploadStateStatus = "idle" | "uploading" | "success" | "error";

interface UploadState {
  file: File | null;
  status: UploadStateStatus;
  progress: number;
  error: string | null;
  documentId: string | null;
  
  setFile: (file: File | null) => void;
  setStatus: (status: UploadStateStatus) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  setDocumentId: (id: string | null) => void;
  reset: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  file: null,
  status: "idle",
  progress: 0,
  error: null,
  documentId: null,

  setFile: (file) => set({ file, error: null, status: file ? "idle" : "idle" }),
  setStatus: (status) => set({ status }),
  setProgress: (progress) => set({ progress }),
  setError: (error) => set({ error, status: "error" }),
  setDocumentId: (documentId) => set({ documentId }),
  reset: () => set({ file: null, status: "idle", progress: 0, error: null, documentId: null }),
}));
