"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { AuthenticatedChatContainer } from "@/components/chat/AuthenticatedChatContainer";

export default function ChatPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  return <AuthenticatedChatContainer documentId="" />;
}
