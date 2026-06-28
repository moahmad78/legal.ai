"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { AuthenticatedChatContainer } from "@/components/chat/AuthenticatedChatContainer";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ChatPageContent() {
  const { user, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (isLoading) return null;

  return <AuthenticatedChatContainer key={id || 'default'} documentId="" />;
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatPageContent />
    </Suspense>
  );
}
