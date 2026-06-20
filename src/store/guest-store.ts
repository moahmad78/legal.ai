import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface GuestStore {
  sessionId: string;
  chatCount: number;
  documentCount: number;
  incrementChat: () => void;
  incrementDocument: () => void;
  clearSession: () => void;
  hasGuestSession: () => boolean;
}

export const useGuestStore = create<GuestStore>()(
  persist(
    (set, get) => ({
      sessionId: typeof crypto !== 'undefined' ? crypto.randomUUID() : '',
      chatCount: 0,
      documentCount: 0,
      incrementChat: () => set((state) => ({ chatCount: state.chatCount + 1 })),
      incrementDocument: () => set((state) => ({ documentCount: state.documentCount + 1 })),
      clearSession: () => set({ 
        sessionId: typeof crypto !== 'undefined' ? crypto.randomUUID() : '', 
        chatCount: 0, 
        documentCount: 0 
      }),
      hasGuestSession: () => {
        const state = get();
        return state.chatCount > 0 || state.documentCount > 0;
      }
    }),
    {
      name: 'catalyst-guest-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
