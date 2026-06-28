"use client";
import { useAuthenticatedChatStore } from "@/store/authenticated-chat-store";
import { useAuthenticatedChat } from "@/hooks/use-authenticated-chat";
import { MessageBubble } from "./MessageBubble";
import { QuestionInput } from "./QuestionInput";
import { useEffect, useRef, useState } from "react";
import { 
  Sparkles, Lock, Square, ShieldAlert, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useUploadStore } from "@/store/upload-store";
import { useAnalysisStore } from "@/store/analysis-store";
import { useAnalysis } from "@/hooks/use-analysis";
import { Badge } from "@/components/ui/badge";
import { ReportMessage } from "./ReportMessage";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";
import { fetchFreeUsage } from "@/actions/free-actions";
import { useModalStore } from "@/store/modal-store";
import { useUpgradeStore } from "@/store/upgrade-store";
import { analytics } from "@/lib/analytics";
import { useGuestStore } from "@/store/guest-store";
import { Loader2 } from "lucide-react";

const STAGES = [
  "Extracting document text...",
  "Detecting document type...",
  "Generating AI insights...",
  "Preparing results...",
];

const SUGGESTIONS = [
  { text: "What is due diligence?", icon: "🔍" },
  { text: "Explain indemnity clauses.", icon: "📋" },
  { text: "How do termination clauses work?", icon: "⚖️" },
  { text: "Documents needed for property verification?", icon: "🏠" },
];

const DOC_SUGGESTIONS = [
  { text: "Summarize the key risks.", icon: "⚠️" },
  { text: "Explain the main clauses.", icon: "📄" },
  { text: "What should my client negotiate?", icon: "🤝" },
  { text: "Identify any red flags.", icon: "🚩" },
];

export function AuthenticatedChatContainer({
  documentId: propDocumentId,
}: {
  documentId?: string;
}) {
  const { messages, loading, typing, preferredLanguage, setPreferredLanguage } =
    useAuthenticatedChatStore();
  const { user } = useAuth();
  const userId = user?.id;

  const { status: uploadStatus, documentId: uploadDocId, file, reset: clearUpload } = useUploadStore();
  const { status: analysisStatus, report, detection } = useAnalysisStore();

  const [activeDocumentId, setActiveDocumentId] = useState(propDocumentId || uploadDocId || "");
  const [activeDocumentName, setActiveDocumentName] = useState("");
  const documentId = activeDocumentId;
  const isGeneralMode = !documentId && !file;

  const { sendMessage, isSending, stopGenerating } = useAuthenticatedChat(documentId);
  const bottomRef = useRef<HTMLDivElement>(null);
  const analyzeMutation = useAnalysis();
  const [analysisStage, setAnalysisStage] = useState(0);

  const { chatCount: guestChatCount, documentCount: guestDocumentCount, incrementChat: incrementGuestChat, incrementDocument: incrementGuestDocument } = useGuestStore();
  const [freeUsage, setFreeUsage] = useState<{ chat_count: number; document_count: number } | null>(null);
  const [dismissedWarning, setDismissedWarning] = useState(false);
  const { openSignupModal } = useModalStore();
  const { openUpgradeModal } = useUpgradeStore();

  useEffect(() => {
    if (userId) {
      fetchFreeUsage().then((res) => {
        if (res.success && res.usage) setFreeUsage(res.usage);
      });
    }
  }, [userId, messages.length, uploadStatus]);

  const hasReachedGuestLimit = !userId && guestChatCount >= 10;
  const hasReachedFreeLimit = !!userId && !!freeUsage && freeUsage.chat_count >= 25;
  const showFreeWarning = !!userId && !!freeUsage && freeUsage.chat_count >= 20 && freeUsage.chat_count < 25 && !dismissedWarning;
  const hasDocument = !!documentId || !!file;
  const suggestions = hasDocument ? DOC_SUGGESTIONS : SUGGESTIONS;

  // Auto-trigger analysis
  useEffect(() => {
    if (uploadStatus === "success" && analysisStatus === "idle" && documentId) {
      if (!userId && guestDocumentCount >= 2) {
        openSignupModal({
          title: "Free Limit Reached",
          message: "Create a free account to continue analyzing documents.",
        });
        return;
      }
      if (!userId) incrementGuestDocument();
      const timer = setTimeout(() => {
        analyzeMutation.mutate({ documentId, preferredLanguage });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [uploadStatus, analysisStatus, documentId]);

  useEffect(() => {
    if (analysisStatus === "processing") {
      setAnalysisStage(0);
      const interval = setInterval(() => {
        setAnalysisStage((prev) => Math.min(prev + 1, STAGES.length - 1));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [analysisStatus]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, uploadStatus, analysisStatus]);

  const handleClearDocument = () => {
    setActiveDocumentId("");
    setActiveDocumentName("");
    clearUpload();
  };

  const handleSelectDocument = (id: string, name: string) => {
    setActiveDocumentId(id);
    setActiveDocumentName(name);
  };

  const handleSend = (msg: string) => {
    if (!userId) {
      if (guestChatCount >= 10) {
        openSignupModal({
          title: "Free Limit Reached",
          message: "Create a free account to continue.",
        });
        return;
      }
      incrementGuestChat();
    }
    sendMessage({ message: msg });
  };

  const isEmpty = messages.length === 0 && uploadStatus === "idle" && analysisStatus === "idle";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-4 py-6">
          
          {isEmpty ? (
            /* ── Empty / Welcome State ── */
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8"
            >
              {/* Logo */}
              <div className="relative mb-6 mt-2">
                <div className="absolute inset-0 bg-primary/10 rounded-[2.5rem] blur-3xl scale-[1.5]" />
                <div className="relative h-28 w-28 mx-auto rounded-[2.5rem] bg-card border border-border/50 
                                shadow-xl flex items-center justify-center overflow-hidden">
                  <img
                    src="/logo-legal.png"
                    alt="Catalyst AI"
                    className="w-20 h-auto object-contain"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  How can I help you today?
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base max-w-xs mx-auto leading-relaxed">
                  Upload a document for AI analysis, or ask me any legal question.
                </p>
              </div>

              {/* Suggestion Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg mt-4">
                {suggestions.map((q, i) => {
                  const text = typeof q === 'string' ? q : q.text;
                  const icon = typeof q === 'string' ? '✦' : q.icon;
                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      whileHover={{ y: -1, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSend(text)}
                      className="flex flex-row items-center gap-3 p-3.5 rounded-xl 
                                 border border-border/60 bg-card/50 
                                 hover:border-primary/40 hover:bg-card 
                                 transition-all text-left shadow-sm group w-full"
                    >
                      <span className="text-lg leading-none shrink-0">{icon}</span>
                      <span className="text-sm text-foreground/75 group-hover:text-foreground 
                                       transition-colors leading-snug">{text}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            /* ── Messages ── */
            <div className="space-y-6 pb-4">
              {isGeneralMode && messages.length > 0 && (
                <div className="flex justify-center">
                  <Badge variant="outline" className="text-[10px] uppercase font-semibold text-muted-foreground bg-muted/30">
                    Educational Guidance • Not Legal Advice
                  </Badge>
                </div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    onExplain={(audience) =>
                      sendMessage({ message: `Explain this to a ${audience}`, explainAudience: audience })
                    }
                    onRegenerate={(msgId) => {
                      const idx = messages.findIndex((m) => m.id === msgId);
                      if (idx > 0 && messages[idx - 1].role === "user") {
                        const prev = messages[idx - 1];
                        sendMessage({ message: typeof prev.message === "string" ? prev.message : "" });
                      }
                    }}
                  />
                ))}
              </AnimatePresence>

              {/* Analysis Report */}
              {analysisStatus === "completed" && report && (
                <ReportMessage
                  report={report}
                  detection={detection}
                  preferredLanguage={preferredLanguage}
                  setPreferredLanguage={setPreferredLanguage}
                />
              )}

              {/* Processing State */}
              {(uploadStatus === "uploading" || analysisStatus === "processing") && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="h-8 w-8 rounded-full border shadow-sm overflow-hidden shrink-0 bg-card flex items-center justify-center">
                    <img src="/logo-legal.png" alt="AI" className="h-6 w-6 object-contain p-0.5" />
                  </div>
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-3 border">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm font-medium">
                      {uploadStatus === "uploading" ? "Uploading document..." : STAGES[analysisStage]}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Typing indicator */}
              {typing && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                  <div className="h-8 w-8 rounded-full border shadow-sm overflow-hidden shrink-0 bg-card flex items-center justify-center">
                    <img src="/logo-legal.png" alt="AI" className="h-6 w-6 object-contain p-0.5" />
                  </div>
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5 border h-11">
                    {[0, 150, 300].map((delay) => (
                      <span key={delay} className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Limit warnings - keep existing JSX for hasReachedGuestLimit and hasReachedFreeLimit */}
              {hasReachedGuestLimit && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start mt-6">
                  <div className="flex gap-3 max-w-[85%] w-full">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-primary/20 text-primary shadow-sm border border-primary/20">
                      <Lock className="h-4 w-4" />
                    </div>
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 px-5 py-4 rounded-[20px] rounded-tl-sm border border-primary/20 shadow-sm w-full">
                      <h4 className="font-semibold text-sm mb-2 text-foreground">Free Preview Limit Reached</h4>
                      <p className="text-sm text-muted-foreground mb-4">You're getting great insights! Create a free account to continue chatting, save your reports, and unlock unlimited documents.</p>
                      <div className="flex gap-3">
                        <Link href="/sign-up">
                          <Button size="sm" className="rounded-xl">
                            Create Free Account
                          </Button>
                        </Link>
                        <Link href="/sign-in">
                          <Button variant="outline" size="sm" className="rounded-xl">
                            Sign In
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {hasReachedFreeLimit && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start mt-6">
                  <div className="flex gap-3 max-w-[85%] w-full">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-amber-500/20 text-amber-600 shadow-sm border border-amber-500/20">
                      <Lock className="h-4 w-4" />
                    </div>
                    <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 px-5 py-4 rounded-[20px] rounded-tl-sm border border-amber-500/20 shadow-sm w-full">
                      <h4 className="font-semibold text-sm mb-2 text-foreground">You've reached your Free Plan limit.</h4>
                      <p className="text-sm text-muted-foreground mb-4">Upgrade to continue using Catalyst without interruptions.</p>
                      <div className="flex gap-3">
                        <Button onClick={() => openUpgradeModal({ title: "Unlock More with Catalyst Professional", message: "Upgrade to continue using Catalyst without interruptions." })} size="sm" className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white">
                          Upgrade Now
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-xl bg-background" onClick={() => analytics.trackEvent("maybe_later_clicked", { limit: "chat" })}>
                          Maybe Later
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={bottomRef} className="h-1" />
            </div>
          )}
        </div>
      </div>

      {/* ── Input Bar — always at bottom like ChatGPT ── */}
      <div className="border-t border-border/50 bg-background/95 backdrop-blur-sm px-4 py-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          
          {/* Stop generating button */}
          <AnimatePresence>
            {isSending && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="flex justify-center"
              >
                <Button
                  onClick={stopGenerating}
                  variant="outline"
                  size="sm"
                  className="rounded-full shadow-sm text-xs"
                >
                  <Square className="h-3 w-3 mr-2" fill="currentColor" />
                  Stop generating
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Input */}
          <QuestionInput
            onSend={handleSend}
            disabled={loading || typing || hasReachedGuestLimit || hasReachedFreeLimit}
            hasDocument={hasDocument}
            documentName={activeDocumentName || file?.name || "Document"}
            onClearDocument={hasDocument ? handleClearDocument : undefined}
            onSelectDocument={handleSelectDocument}
          />

          {/* Footer info */}
          <div className="flex justify-between items-center text-[11px] text-muted-foreground px-1">
            <p>AI can make mistakes. Verify important information.</p>
            {!userId && (
              <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-full border">
                <span className={`w-1.5 h-1.5 rounded-full ${guestChatCount >= 8 ? "bg-amber-500" : "bg-green-500"}`} />
                <span>{Math.max(0, 10 - guestChatCount)} / 10 free questions left</span>
              </div>
            )}
            {userId && freeUsage && (
              <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-full border">
                <span className={`w-1.5 h-1.5 rounded-full ${showFreeWarning ? "bg-amber-500" : "bg-green-500"}`} />
                <span>{freeUsage.chat_count} / 25 free chats used</span>
              </div>
            )}
          </div>

          {/* Free warning banner */}
          {showFreeWarning && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl text-xs"
            >
              <span className="text-amber-800 dark:text-amber-400 font-medium">
                Approaching monthly limit ({freeUsage?.chat_count} / 25 used).
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-amber-700 hover:bg-amber-500/20"
                  onClick={() => openUpgradeModal({ title: "Unlock More", message: "Upgrade for unlimited access." })}>
                  Upgrade
                </Button>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs"
                  onClick={() => setDismissedWarning(true)}>
                  Dismiss
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
