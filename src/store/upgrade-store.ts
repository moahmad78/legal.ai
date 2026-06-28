import { create } from "zustand";

interface UpgradeState {
  isOpen: boolean;
  title: string;
  message: string;
  openUpgradeModal: (options?: { title?: string; message?: string }) => void;
  closeUpgradeModal: () => void;
}

export const useUpgradeStore = create<UpgradeState>((set) => ({
  isOpen: false,
  title: "Upgrade to Catalyst Professional",
  message: "Unlock editable legal reports and advanced features with Catalyst Professional.",
  openUpgradeModal: (options) =>
    set({
      isOpen: true,
      title: options?.title || "Upgrade to Catalyst Professional",
      message: options?.message || "Unlock editable legal reports and advanced features with Catalyst Professional.",
    }),
  closeUpgradeModal: () => set({ isOpen: false }),
}));
