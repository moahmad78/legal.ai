import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useGuestChatStore, ChatMessage } from "@/store/guest-chat-store";
import { toast } from "sonner";
import { useModalStore } from "@/store/modal-store";
import { useRef } from "react";

export function useGuestChat(documentId: string) {
  const queryClient = useQueryClient();
  const { setMessages, addMessage, updateMessage, setLoading, setError, setTyping, preferredLanguage } = useGuestChatStore();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Guests do not fetch history from the server, they use client-side storage
  const isFetchingHistory = false;

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
      setTyping(false);
    }
  };

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, explainAudience }: { message: string, explainAudience?: string }) => {
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const url = documentId ? `/api/chat/${documentId}` : `/api/chat/general`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, preferredLanguage, explainAudience, stream: true }),
        signal,
      });

      if (!res.ok) {
        let errorMsg = "Failed to send message";
        try {
          const data = await res.json();
          errorMsg = data.error || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      // Check if it's a JSON response (like Guest limit reached) or stream
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        return data; // Possibly a fallback non-streaming response
      }

      // Handle streaming response
      const reader = res.body?.getReader();
      if (!reader) throw new Error("Stream not supported");

      const decoder = new TextDecoder("utf-8");
      let done = false;
      let accumulatedContent = "";

      const aiMessageId = `ai-${Date.now()}`;
      
      setTyping(false); // Stop typing indicator since we are receiving data
      addMessage({
        id: aiMessageId,
        role: "assistant",
        message: "",
        created_at: new Date().toISOString(),
      });

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          accumulatedContent += chunk;
          updateMessage(aiMessageId, accumulatedContent);
        }
      }

      return { messageId: aiMessageId, answer: accumulatedContent };
    },
    onMutate: async ({ message }) => {
      setLoading(true);
      setError(null);
      setTyping(true);

      // Optimistically add user message
      const optimisticMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        message,
        created_at: new Date().toISOString(),
      };
      addMessage(optimisticMessage);
    },
    onSuccess: (data) => {
      // If it was a non-streaming JSON response, we handle it here
      if (data && data.answer && !data.messageId?.startsWith("ai-")) {
        const assistantMessage: ChatMessage = {
          id: data.messageId || `ai-${Date.now()}`,
          role: "assistant",
          message: data.answer,
          created_at: new Date().toISOString(),
        };
        addMessage(assistantMessage);
      }
    },
    onError: (error: Error) => {
      if (error.name === "AbortError") {
        console.warn("Stream aborted");
        return;
      }
      setError(error.message);
      if (error.message === "Guest limit reached") {
        useModalStore.getState().openSignupModal({
          title: "Free Limit Reached",
          message: "You've reached your free 10-question limit. Create a free account to continue asking questions and unlock unlimited access.",
        });
      } else if (error.message === "Free plan limit reached") {
         // Free limit handled by UI checking stats
      } else {
        toast.error(error.message);
      }
    },
    onSettled: () => {
      setLoading(false);
      setTyping(false);
      abortControllerRef.current = null;
      queryClient.invalidateQueries({ queryKey: ["usage"] }); 
    },
  });

  return {
    isFetchingHistory,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
    stopGenerating,
  };
}
