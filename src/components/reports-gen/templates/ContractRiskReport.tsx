"use client";

import { ShieldAlert, Lightbulb, Lock } from "lucide-react";
import {  useAuth  } from "@/components/auth/AuthProvider";
import { useModalStore } from "@/store/modal-store";
import { Button } from "@/components/ui/button";

export function ContractRiskReportTemplate({ content }: { content: any }) {
  const { user } = useAuth();
  const { openSignupModal } = useModalStore();
  const isGuest = !user;
  return (
    <div className="space-y-8 text-foreground font-serif">
      <div className="text-center space-y-4 border-b pb-8">
        <h1 className="text-3xl font-bold uppercase tracking-widest text-primary">Contract Risk Report</h1>
        <div className="space-y-1 text-sm text-muted-foreground font-sans">
          <p><strong>Document:</strong> {content.documentTitle}</p>
          <p><strong>Date Prepared:</strong> {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-bold mb-3 border-b pb-2 uppercase tracking-wide">1. Executive Summary</h2>
        <p className="leading-relaxed whitespace-pre-wrap">{content.summary || content.narrative?.executiveSummary}</p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3 border-b pb-2 uppercase tracking-wide">2. Risk Assessment</h2>
        <div className="flex gap-4 mb-6">
          <div className="flex-1 p-4 border rounded bg-muted/20">
            <p className="text-sm uppercase text-muted-foreground font-sans font-bold">Overall Risk</p>
            <p className="text-2xl font-bold">{content.overallRisk}</p>
          </div>
          <div className="flex-1 p-4 border rounded bg-muted/20">
            <p className="text-sm uppercase text-muted-foreground font-sans font-bold">Risk Score</p>
            <p className="text-2xl font-bold">{content.riskScore}/100</p>
          </div>
        </div>

        {content.highRisks?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-destructive mb-3 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" /> High Priority Risks
            </h3>
            <ul className="space-y-3">
              {content.highRisks.map((risk: any, i: number) => (
                <li key={i} className="border-l-4 border-destructive pl-4 py-1">
                  <h4 className="font-bold">{risk.title}</h4>
                  <p className="text-sm text-muted-foreground">{risk.description}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {content.mediumRisks?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-orange-500 mb-3 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" /> Medium Priority Risks
            </h3>
            <ul className="space-y-3">
              {content.mediumRisks.map((risk: any, i: number) => (
                <li key={i} className="border-l-4 border-orange-500 pl-4 py-1">
                  <h4 className="font-bold">{risk.title}</h4>
                  <p className="text-sm text-muted-foreground">{risk.description}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {isGuest ? (
        <div className="relative overflow-hidden rounded-xl border bg-muted/10 p-8 mt-12 mb-8">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 z-10" />
          <div className="filter blur-[6px] opacity-60 pointer-events-none select-none">
            <h2 className="text-xl font-bold mb-3 border-b pb-2 uppercase tracking-wide">3. Missing Standard Clauses</h2>
            <ul className="space-y-3">
              <li className="border-l-4 border-muted pl-4 py-1">
                <h4 className="font-bold capitalize">Indemnification</h4>
                <p className="text-sm text-muted-foreground">This protects the party from specific third-party liabilities.</p>
              </li>
              <li className="border-l-4 border-muted pl-4 py-1">
                <h4 className="font-bold capitalize">Severability</h4>
                <p className="text-sm text-muted-foreground">Ensures the rest of the contract remains valid if one clause fails.</p>
              </li>
            </ul>
            <h2 className="text-xl font-bold mt-8 mb-3 border-b pb-2 uppercase tracking-wide">4. Recommended Actions</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>Negotiate a limitation of liability.</li>
              <li>Include a force majeure provision.</li>
            </ul>
          </div>
          
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
            <div className="bg-background/80 backdrop-blur-md p-6 rounded-2xl border shadow-xl text-center max-w-sm">
              <div className="mx-auto w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-heading mb-2">Unlock the Complete Review</h3>
              <p className="text-sm text-muted-foreground mb-6">Create a free account to view missing clauses, actionable recommendations, and property intelligence.</p>
              <Button onClick={() => openSignupModal({ title: "Unlock Full Report", message: "Create your free account to view missing clauses and actionable recommendations." })} className="w-full rounded-xl">
                Create Free Account
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {content.missingClauses?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-3 border-b pb-2 uppercase tracking-wide">3. Missing Standard Clauses</h2>
              <ul className="space-y-3">
                {content.missingClauses.map((clause: any, i: number) => (
                  <li key={i} className="border-l-4 border-muted pl-4 py-1">
                    <h4 className="font-bold capitalize">{clause.title || "Missing Clause"}</h4>
                    <p className="text-sm text-muted-foreground">{clause.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {content.narrative?.recommendedNextSteps?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-3 border-b pb-2 uppercase tracking-wide">4. Recommended Actions</h2>
              <ul className="space-y-2 list-disc pl-5">
                {content.narrative.recommendedNextSteps.map((step: string, i: number) => (
                  <li key={i} className="leading-relaxed">{step}</li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <div className="mt-16 pt-8 border-t text-sm text-muted-foreground text-center font-sans">
        <p>This report is AI-assisted and should be reviewed by a qualified legal professional before reliance.</p>
      </div>
    </div>
  );
}
