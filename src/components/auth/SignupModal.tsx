"use client";

import { useModalStore } from "@/store/modal-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
export function SignupModal() {
  const { isSignupModalOpen, closeSignupModal, signupModalTitle, signupModalMessage } = useModalStore();

  return (
    <Dialog open={isSignupModalOpen} onOpenChange={(open) => !open && closeSignupModal()}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-heading text-center">
            {signupModalTitle}
          </DialogTitle>
          <DialogDescription className="text-center pt-2 pb-4 text-base text-muted-foreground">
            {signupModalMessage}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mb-6 mt-2 px-2">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Save Conversations</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Manage Clients & Matters</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Continue Legal Analysis</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Access Reports</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/sign-up">
            <Button className="w-full text-base py-5 rounded-xl font-medium">
              Create Free Account
            </Button>
          </Link>
          <Button variant="ghost" className="w-full rounded-xl" onClick={closeSignupModal}>
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
