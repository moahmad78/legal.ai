import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAnalysisStore } from "@/store/analysis-store";
import { toast } from "sonner";

export function useAnalysis() {
  const queryClient = useQueryClient();
  const { setStatus, setResult, setError } = useAnalysisStore();

  return useMutation({
    mutationFn: async ({ documentId, preferredLanguage }: { documentId: string, preferredLanguage?: string }) => {
      setStatus("processing");
      
      const response = await fetch(`/api/analyze/${documentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preferredLanguage: preferredLanguage || "English" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      setResult(data.detection, data.report);
      toast.success("Document analysis complete!");
      queryClient.invalidateQueries({ queryKey: ["recent-documents"] });
    },
    onError: (error: Error) => {
      setError(error.message);
      toast.error(error.message);
    },
  });
}
