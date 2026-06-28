"use client";

import { Bot, FileText, ShieldAlert, CheckCircle, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export function ReportMessage({ report, detection, preferredLanguage, setPreferredLanguage }: { report: any, detection: any, preferredLanguage: string, setPreferredLanguage: (lang: string) => void }) {
  if (!report) return null;
  
  return (
    <div className="flex justify-start mb-6">
      <div className="flex gap-3 max-w-[85%] w-full">
        <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-primary text-white shadow-sm">
          <Bot className="h-5 w-5" />
        </div>
        <div className="bg-muted/30 px-5 py-4 rounded-[20px] rounded-tl-sm border shadow-sm flex flex-col gap-4 w-full">
          <div>
            <h4 className="text-lg font-bold font-heading mb-1">Analysis Complete</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {detection && (
                <Badge variant="outline" className="bg-background text-xs">
                  {detection.type || detection.documentType} &bull; {(detection.confidence * 100).toFixed(0)}% Match
                </Badge>
              )}
              {detection?.languageName && (
                <Badge variant="outline" className="bg-background text-xs flex items-center gap-1">
                  <Languages className="w-3 h-3" /> Original: {detection.languageName}
                </Badge>
              )}
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs flex items-center gap-1">
                <Languages className="w-3 h-3" /> Responding in: {preferredLanguage}
              </Badge>
            </div>
          </div>
          
          {report.executiveSummary && (
            <div className="space-y-2">
              <h5 className="font-semibold flex items-center gap-2 text-sm text-primary">
                <FileText className="h-4 w-4" /> Executive Summary
              </h5>
              <p className="text-sm text-muted-foreground leading-relaxed">{report.executiveSummary}</p>
            </div>
          )}

          {report.keyRisks && report.keyRisks.length > 0 && (
            <div className="space-y-2 bg-red-500/5 p-3 rounded-xl border border-red-500/10">
              <h5 className="font-semibold flex items-center gap-2 text-sm text-red-500">
                <ShieldAlert className="h-4 w-4" /> Key Risks
              </h5>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {report.keyRisks.map((risk: any, i: number) => (
                  <li key={i}>{risk.title || risk.description || risk}</li>
                ))}
              </ul>
            </div>
          )}

          {report.opportunities && report.opportunities.length > 0 && (
            <div className="space-y-2 bg-green-500/5 p-3 rounded-xl border border-green-500/10">
              <h5 className="font-semibold flex items-center gap-2 text-sm text-green-500">
                <Lightbulb className="h-4 w-4" /> Opportunities
              </h5>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {report.opportunities.map((opp: any, i: number) => (
                  <li key={i}>{opp.title || opp.description || opp}</li>
                ))}
              </ul>
            </div>
          )}

          {report.complianceStatus && (
            <div className="space-y-2 bg-blue-500/5 p-3 rounded-xl border border-blue-500/10">
              <h5 className="font-semibold flex items-center gap-2 text-sm text-blue-500">
                <CheckCircle className="h-4 w-4" /> Compliance Status
              </h5>
              <div className="text-sm text-muted-foreground">
                Score: {report.complianceStatus.overallScore}/100
                {report.complianceStatus.missingClauses?.length > 0 && (
                  <div className="mt-2">
                    <span className="font-medium">Missing Clauses: </span>
                    {report.complianceStatus.missingClauses.join(", ")}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Action Chips */}
      <div className="flex flex-wrap gap-2 mt-4 ml-[44px]">
        <Button variant="outline" size="sm" className="rounded-full bg-background shadow-sm h-8 text-xs" onClick={() => {
            const langs = ["English", "Spanish", "French", "German", "Hindi", "Arabic", "Japanese"];
            const nextLang = langs[(langs.indexOf(preferredLanguage) + 1) % langs.length];
            setPreferredLanguage(nextLang);
        }}>
          <Languages className="w-3 h-3 mr-1" /> Translate to {
            ["English", "Spanish", "French", "German", "Hindi", "Arabic", "Japanese"][
              (["English", "Spanish", "French", "German", "Hindi", "Arabic", "Japanese"].indexOf(preferredLanguage) + 1) % 7
            ]
          }
        </Button>
        <Button variant="outline" size="sm" className="rounded-full bg-background shadow-sm h-8 text-xs">
          <Lightbulb className="w-3 h-3 mr-1" /> Explain in simpler language
        </Button>
      </div>
    </div>
  );
}
