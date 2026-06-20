import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getGuestSession } from "@/lib/guest-session";
import { useUploadStore } from "@/store/upload-store";
import { toast } from "sonner";

export function useUpload() {
  const queryClient = useQueryClient();
  const { setStatus, setProgress, setError, setDocumentId } = useUploadStore();

  return useMutation({
    mutationFn: async (file: File) => {
      setStatus("uploading");
      setProgress(10);

      const guestSessionId = getGuestSession();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("guest_session_id", guestSessionId);

      // Simulate initial progress
      const progressInterval = setInterval(() => {
        useUploadStore.setState((state) => ({
          progress: Math.min(state.progress + 10, 90),
        }));
      }, 500);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);
        setProgress(100);

        if (!response.ok) {
          const text = await response.text();
          let errorMsg = "Upload failed";
          try {
            const errorData = JSON.parse(text);
            errorMsg = errorData.error || errorMsg;
          } catch {
            console.error("Non-JSON error response from upload API:", text);
            errorMsg = `Server error: ${response.statusText}`;
          }
          throw new Error(errorMsg);
        }

        const data = await response.json();
        
        if (process.env.NODE_ENV === "development") {
          console.log("[DEBUG Upload] Upload completion:", data);
        }

        return data;
      } catch (error) {
        clearInterval(progressInterval);
        
        if (process.env.NODE_ENV === "development") {
          console.error("[DEBUG Upload] Error:", error);
        }
        
        throw error;
      }
    },
    onSuccess: (data, file) => {
      setStatus("success");
      setDocumentId(data.document_id);
      
      if (data.developmentMode) {
        toast.success("Development Mode: Upload simulated successfully.");
        
        try {
          const simulatedDocs = JSON.parse(sessionStorage.getItem("simulated_documents") || "[]");
          simulatedDocs.push({
            id: data.document_id,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
            status: "uploaded",
          });
          sessionStorage.setItem("simulated_documents", JSON.stringify(simulatedDocs));
        } catch (e) {
          console.error("Failed to save simulated document metadata", e);
        }
      } else {
        toast.success("Document uploaded successfully");
      }
      
      queryClient.invalidateQueries({ queryKey: ["recent-documents"] });
    },
    onError: (error: Error) => {
      setStatus("error");
      setError(error.message);
      toast.error(error.message);
    },
  });
}
