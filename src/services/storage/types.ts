export type UploadStatus = "idle" | "uploading" | "success" | "error";

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  type: string;
  name: string;
}

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/jpg",
];

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
