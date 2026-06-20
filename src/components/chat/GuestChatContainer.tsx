"use client";

import { useGuestChatStore } from "@/store/guest-chat-store";
import { useGuestChat } from "@/hooks/use-guest-chat";
import { MessageBubble } from "./MessageBubble";
import { QuestionInput } from "./QuestionInput";
import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Sparkles, FileText, ShieldAlert, CheckCircle, Lock, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useUploadStore } from "@/store/upload-store";
import { useAnalysisStore } from "@/store/analysis-store";
import { useAnalysis } from "@/hooks/use-analysis";
import { Badge } from "@/components/ui/badge";
import { ReportMessage } from "./ReportMessage";
import {  useAuth  } from "@/components/auth/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchFreeUsage } from "@/actions/free-actions";
import { useModalStore } from "@/store/modal-store";
import { useUpgradeStore } from "@/store/upgrade-store";
import { analytics } from "@/lib/analytics";
import { useGuestStore } from "@/store/guest-store";

const STAGES = [
  "Extracting document text...",
  "Detecting document type...",
  "Generating AI insights...",
  "Preparing results..."
];

export function GuestChatContainer({ documentId: propDocumentId }: { documentId?: string }) {
  const { messages, loading, typing, preferredLanguage, setPreferredLanguage } = useGuestChatStore();
  const { user } = useAuth();
  const userId = user?.id;
  const router = useRouter();
  
  const { status: uploadStatus, documentId: uploadDocId, file, reset: clearUpload } = useUploadStore();
  const { status: analysisStatus, report, detection } = useAnalysisStore();
  
  const [activeDocumentId, setActiveDocumentId] = useState<string>(propDocumentId || uploadDocId || "");
  const [activeDocumentName, setActiveDocumentName] = useState<string>("");
  
  const documentId = activeDocumentId;
  const isGeneralMode = !documentId && !file;
  const { sendMessage, isFetchingHistory, isSending, stopGenerating } = useGuestChat(documentId);
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
      fetchFreeUsage().then(res => {
        if (res.success && res.usage) {
          setFreeUsage(res.usage);
        }
      });
    }
  }, [userId, messages.length, uploadStatus]);

  const hasReachedGuestLimit = !userId && guestChatCount >= 10;
  const hasReachedFreeLimit = !!userId && !!freeUsage && freeUsage.chat_count >= 25;
  const showFreeWarning = !!userId && !!freeUsage && freeUsage.chat_count >= 20 && freeUsage.chat_count < 25 && !dismissedWarning;

  useEffect(() => {
    if (hasReachedFreeLimit) {
      analytics.trackLimitReached("chat");
    }
  }, [hasReachedFreeLimit]);

  const handleSaveChat = () => {
    if (!userId) {
      openSignupModal({
        title: "Save Your Conversation",
        message: "Create a free account to securely save this chat and pick up exactly where you left off.",
      });
    }
  };

  // Auto-trigger analysis when upload succeeds
  useEffect(() => {
    if (uploadStatus === "success" && analysisStatus === "idle") {
      if (documentId) {
        if (!userId && guestDocumentCount >= 2) {
          openSignupModal({
            title: "Free Limit Reached",
            message: "You've reached your free 2-document limit. Create a free account to continue analyzing documents."
          });
          return;
        }
        
        if (!userId) {
          incrementGuestDocument();
        }

        const timer = setTimeout(() => {
          analyzeMutation.mutate({ documentId, preferredLanguage });
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [uploadStatus, analysisStatus, documentId, analyzeMutation, preferredLanguage, userId, guestDocumentCount, incrementGuestDocument, openSignupModal]);

  // Cycle analysis stages
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
  }, [messages, typing, uploadStatus, analysisStatus, analysisStage]);



  const generalSuggestions = [
    "What is due diligence?",
    "Explain indemnity.",
    "What documents are required for property verification?",
    "How do termination clauses work?",
  ];

  const docSuggestions = [
    "Summarize risks.",
    "Explain this clause.",
    "What should my client negotiate?",
    "Explain this to my client.",
  ];

  const hasDocument = !!documentId || !!file;
  const suggestions = hasDocument ? docSuggestions : generalSuggestions;

  const handleClearDocument = () => {
    setActiveDocumentId("");
    setActiveDocumentName("");
    clearUpload();
  };

  const handleSelectDocument = (id: string, name: string) => {
    setActiveDocumentId(id);
    setActiveDocumentName(name);
  };

  const handleExplain = (audience: string, msg: string) => {
    sendMessage({ message: `Explain this to a ${audience}`, explainAudience: audience });
  };

  const handleRegenerate = (msgId: string) => {
    const msgIndex = messages.findIndex(m => m.id === msgId);
    if (msgIndex > 0) {
      const prevUserMsg = messages[msgIndex - 1];
      if (prevUserMsg && prevUserMsg.role === 'user') {
         sendMessage({ message: typeof prevUserMsg.message === 'string' ? prevUserMsg.message : JSON.stringify(prevUserMsg.message) });
      }
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 relative max-w-4xl mx-auto w-full">
        {isGeneralMode && messages.length > 0 && (
          <div className="flex justify-center mb-2">
            <Badge variant="outline" className="text-[10px] uppercase font-semibold text-muted-foreground bg-muted/30">
              Educational Guidance • Not Legal Advice
            </Badge>
          </div>
        )}

        {!userId && messages.length > 0 && (
          <div className="absolute top-4 right-4 z-10">
            <Button variant="outline" size="sm" onClick={handleSaveChat} className="rounded-full shadow-sm">
              <Lock className="w-3 h-3 mr-2" /> Save Chat
            </Button>
          </div>
        )}
        
        {messages.length === 0 && uploadStatus === "idle" && analysisStatus === "idle" ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-6">
            <div className="h-20 w-20 bg-background rounded-full flex items-center justify-center mb-2 shadow-md border relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl" />
              <img src="/logo-legal.png" alt="Catalyst AI" className="h-12 w-12 object-contain relative z-10" />
            </div>
            <h3 className="text-3xl font-bold font-heading tracking-tight">Hi, I'm Catalyst AI.</h3>
            <p className="text-muted-foreground text-base font-body leading-relaxed max-w-[300px]">
              Upload a document, take a photo, or ask me anything.
            </p>
            <p className="text-xs text-muted-foreground/60">
              I can analyze contracts, notices, invoices, reports, certificates, and more.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-8">
              {suggestions.map((q, i) => (
                <motion.div key={i} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    variant="outline" 
                    className="h-auto py-3 px-4 justify-start text-left whitespace-normal text-sm border-primary/20 hover:border-primary/50 hover:bg-primary/5 w-full rounded-[14px] shadow-sm font-body"
                    onClick={() => sendMessage({ message: q })}
                  >
                    <Sparkles className="h-4 w-4 mr-2 text-blue-500 shrink-0" />
                    {q}
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6 pb-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} onExplain={handleExplain} onRegenerate={handleRegenerate} />
              ))}
            </AnimatePresence>

            {/* Analysis Results */}
            {analysisStatus === "completed" && report && (
              <ReportMessage 
                report={report} 
                detection={detection} 
                preferredLanguage={preferredLanguage}
                setPreferredLanguage={setPreferredLanguage}
              />
            )}

            {/* Processing States */}
            {(uploadStatus === "uploading" || analysisStatus === "processing") && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                <div className="flex gap-3 max-w-[85%]">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-white border shadow-sm overflow-hidden">
                    <img src="/logo-legal.png" alt="AI" className="h-full w-full object-contain p-1" />
                  </div>
                  <div className="bg-muted/80 backdrop-blur-sm px-4 py-3 rounded-[20px] rounded-tl-sm flex items-center gap-3 border shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm font-medium font-body">
                      {uploadStatus === "uploading" ? "Uploading your document..." : STAGES[analysisStage]}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
            
            {typing && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                <div className="flex gap-3 max-w-[85%]">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-white border shadow-sm overflow-hidden">
                    <img src="/logo-legal.png" alt="AI" className="h-full w-full object-contain p-1" />
                  </div>
                  <div className="bg-muted/80 backdrop-blur-sm px-4 py-3 rounded-[20px] rounded-tl-sm flex items-center gap-1.5 h-11 border border-white/10 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </motion.div>
            )}

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

      <div className="bg-background pt-2 pb-6 px-4 md:px-6 relative">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <AnimatePresence>
            {isSending && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mb-3">
                <Button onClick={stopGenerating} variant="outline" size="sm" className="rounded-full shadow-sm bg-background border-border hover:bg-muted text-xs">
                  <Square className="h-3 w-3 mr-2" fill="currentColor" /> Stop generating
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-full">
            <QuestionInput 
              onSend={(msg) => {
                if (!userId) {
                  if (guestChatCount >= 10) {
                    openSignupModal({
                      title: "Free Limit Reached",
                      message: "You've reached your free 10-question limit. Create a free account to continue asking questions and unlock unlimited access.",
                    });
                    return;
                  }
                  incrementGuestChat();
                }
                sendMessage({ message: msg });
              }} 
              disabled={loading || typing || hasReachedGuestLimit || hasReachedFreeLimit} 
              hasDocument={hasDocument}
              documentName={activeDocumentName || file?.name || "Document"}
              onClearDocument={hasDocument ? handleClearDocument : undefined}
              onSelectDocument={handleSelectDocument}
            />
          </div>
          {!userId && (
            <div className="mt-3 flex justify-between items-center text-[11px] text-muted-foreground font-medium font-body px-2">
              <p>AI can make mistakes. Consider verifying important information.</p>
              <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-full border">
                <span className={`w-1.5 h-1.5 rounded-full ${guestChatCount >= 8 ? 'bg-amber-500' : 'bg-green-500'}`} />
                <span>{Math.max(0, 10 - guestChatCount)} of 10 free questions left</span>
              </div>
            </div>
          )}
          {userId && (
            <div className="mt-3 flex justify-between items-center text-[11px] text-muted-foreground font-medium font-body px-2">
              <p>AI can make mistakes. Consider verifying important information.</p>
              {freeUsage && (
                <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-full border">
                  <span className={`w-1.5 h-1.5 rounded-full ${showFreeWarning ? 'bg-amber-500' : 'bg-green-500'}`} />
                  <span>{freeUsage.chat_count} / 25 free chats used</span>
                </div>
              )}
            </div>
          )}
          {showFreeWarning && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex items-center justify-between bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span className="text-amber-800 dark:text-amber-400 font-medium">
                  You're getting close to your monthly limit ({freeUsage?.chat_count} / 25 used).
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs hover:bg-amber-500/20 text-amber-700 dark:text-amber-300" onClick={() => openUpgradeModal({ title: "Unlock More with Catalyst Professional", message: "Upgrade to continue using Catalyst without interruptions." })}>
                  View Plans
                </Button>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground hover:bg-muted" onClick={() => {
                  setDismissedWarning(true);
                  analytics.trackUsageWarningDismissed("chat");
                }}>
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
