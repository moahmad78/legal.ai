"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  UploadCloud, 
  MessageSquare, 
  Users, 
  Briefcase, 
  Building2, 
  FileText, 
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  X,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { dismissWelcome } from "@/app/actions/welcome";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function WelcomeWorkspace({ user, checklist, recentActivity }: any) {
  const [isDismissing, setIsDismissing] = useState(false);

  const handleDismiss = async () => {
    setIsDismissing(true);
    const res = await dismissWelcome();
    if (res?.error) {
      toast.error(res.error);
      setIsDismissing(false);
    }
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalChecklist = 5;
  const progressPercent = Math.round((completedCount / totalChecklist) * 100);

  const actions = [
    {
      title: "Upload a Document",
      description: "Analyze contracts, agreements, notices, and legal files.",
      cta: "Upload Now",
      icon: <UploadCloud className="h-6 w-6 text-blue-500" />,
      href: "/dashboard",
    },
    {
      title: "Ask Catalyst",
      description: "Get legal guidance or chat with your documents.",
      cta: "Start Chat",
      icon: <MessageSquare className="h-6 w-6 text-purple-500" />,
      href: "/",
    },
    {
      title: "Create Client",
      description: "Add a new client and organize legal work.",
      cta: "Create Client",
      icon: <Users className="h-6 w-6 text-green-500" />,
      href: "/clients",
    },
    {
      title: "Create Matter",
      description: "Set up a new legal matter or engagement.",
      cta: "Create Matter",
      icon: <Briefcase className="h-6 w-6 text-orange-500" />,
      href: "/matters",
    },
    {
      title: "Review Property",
      description: "Verify ownership, title, and property risks.",
      cta: "Start Property Review",
      icon: <Building2 className="h-6 w-6 text-indigo-500" />,
      href: "/dashboard", // Update later when property intelligence is added
    },
    {
      title: "View Reports",
      description: "Access legal opinions and generated reports.",
      cta: "Open Reports",
      icon: <FileText className="h-6 w-6 text-rose-500" />,
      href: "/dashboard/reports",
    }
  ];

  const checklistItems = [
    { key: "ask_ai", label: "Ask Catalyst a question" },
    { key: "upload_document", label: "Upload your first document" },
    { key: "create_client", label: "Create your first client" },
    { key: "create_matter", label: "Create your first matter" },
    { key: "generate_report", label: "Generate your first report" }
  ];

  return (
    <div className="max-w-6xl mx-auto w-full px-6 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome back, {user.firstName}
          </h1>
          <p className="text-xl text-muted-foreground">
            What would you like to do today?
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a starting point and Catalyst will guide you through the rest.
          </p>
        </motion.div>
        
        <button 
          onClick={handleDismiss}
          disabled={isDismissing}
          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 shrink-0 bg-muted/50 px-4 py-2 rounded-full border border-transparent hover:border-border"
        >
          <X className="h-4 w-4" /> {isDismissing ? "Dismissing..." : "Skip for now"}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Action Cards */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Recommended Section (Simple logic based on checklist) */}
          {completedCount === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
                  <Sparkles className="h-5 w-5" /> Recommended for You
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  The best way to experience Catalyst is by uploading your first legal agreement.
                </p>
              </div>
              <Link href="/dashboard" className="shrink-0 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
                Upload Document
              </Link>
            </motion.div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {actions.map((action, i) => (
              <motion.div 
                key={action.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={action.href} className="block group h-full">
                  <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 relative overflow-hidden bg-card/50 backdrop-blur-sm border-muted">
                    <div className="absolute right-4 top-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardHeader>
                      <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center border shadow-sm mb-4">
                        {action.icon}
                      </div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {action.description}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-2 pb-6">
                      <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:underline">
                        {action.cta}
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-8">
          {/* Checklist */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-muted shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center mb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" /> Getting Started
                  </CardTitle>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {progressPercent}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {checklistItems.map((item) => {
                  const isDone = checklist[item.key as keyof typeof checklist];
                  return (
                    <div key={item.key} className="flex items-start gap-3">
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/30 shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${isDone ? "text-muted-foreground line-through decoration-muted-foreground/30" : "font-medium"}`}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>

          {/* Continue Where You Left Off */}
          {(recentActivity.matter || recentActivity.document) && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Continue Where You Left Off
              </h3>
              <div className="space-y-3">
                {recentActivity.matter && (
                  <Link href={`/matters/${recentActivity.matter.id}`} className="block group">
                    <Card className="p-4 transition-colors hover:bg-muted/50 border-muted">
                      <div className="flex items-start gap-3">
                        <Briefcase className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                            {recentActivity.matter.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Recent Matter</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )}
                
                {recentActivity.document && (
                  <Link href={`/dashboard?doc=${recentActivity.document.id}`} className="block group">
                    <Card className="p-4 transition-colors hover:bg-muted/50 border-muted">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                            {recentActivity.document.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Recent Document</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )}
              </div>
            </motion.div>
          )}

          {/* Empty State / Motivation */}
          {(!recentActivity.matter && !recentActivity.document) && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 text-center px-4 py-10 rounded-xl border border-dashed border-muted-foreground/20 bg-muted/10"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-muted-foreground italic">
                "Every great legal matter starts with a first step."
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
