import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  message: string | any;
  created_at: string;
  sources?: any;
  confidence?: number;
};

type GuestChatStore = {
  conversationId: string;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  typing: boolean;
  preferredLanguage: string;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, messageContent: string | any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTyping: (typing: boolean) => void;
  setPreferredLanguage: (lang: string) => void;
  resetConversation: () => void;
};

// Simple browser language detection fallback
const getBrowserLanguage = () => {
  if (typeof window !== "undefined" && window.navigator && window.navigator.language) {
    const lang = window.navigator.language;
    if (lang.startsWith("es")) return "Spanish";
    if (lang.startsWith("fr")) return "French";
    if (lang.startsWith("de")) return "German";
    if (lang.startsWith("hi")) return "Hindi";
    if (lang.startsWith("ar")) return "Arabic";
    if (lang.startsWith("ja")) return "Japanese";
    if (lang.startsWith("zh")) return "Chinese";
    if (lang.startsWith("ko")) return "Korean";
    if (lang.startsWith("ur")) return "Urdu";
  }
  return "English";
};

export const useGuestChatStore = create<GuestChatStore>()(
  persist(
    (set) => ({
      conversationId: crypto.randomUUID(),
      messages: [],
      loading: false,
      error: null,
      typing: false,
      preferredLanguage: getBrowserLanguage(),
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      updateMessage: (id, messageContent) => set((state) => ({
        messages: state.messages.map(msg => msg.id === id ? { ...msg, message: messageContent } : msg)
      })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setTyping: (typing) => set({ typing }),
      setPreferredLanguage: (lang) => set({ preferredLanguage: lang }),
      resetConversation: () => set({ conversationId: crypto.randomUUID(), messages: [], error: null }),
    }),
    {
      name: 'guest-chat-session',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
