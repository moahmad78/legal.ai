"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { AuthenticatedChatContainer } from "@/components/chat/AuthenticatedChatContainer";
import { GuestChatContainer } from "@/components/chat/GuestChatContainer";

export default function AnalyzePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <div className="h-full flex flex-col w-full">
      {user ? <AuthenticatedChatContainer documentId="" /> : <GuestChatContainer documentId="" />}
    </div>
  );
}
