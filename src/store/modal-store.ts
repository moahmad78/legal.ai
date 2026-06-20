import { create } from "zustand";

interface ModalState {
  isSignupModalOpen: boolean;
  signupModalTitle: string;
  signupModalMessage: string;
  openSignupModal: (options?: { title?: string; message?: string }) => void;
  closeSignupModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isSignupModalOpen: false,
  signupModalTitle: "Continue with Catalyst Legal AI",
  signupModalMessage: "Create your free account to unlock full access.",
  openSignupModal: (options) =>
    set({
      isSignupModalOpen: true,
      signupModalTitle: options?.title || "Continue with Catalyst Legal AI",
      signupModalMessage: options?.message || "Create your free account to unlock full access.",
    }),
  closeSignupModal: () => set({ isSignupModalOpen: false }),
}));
