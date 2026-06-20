import { FileText, Briefcase, CheckCircle2, AlertTriangle, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface LegalMessageProps {
  content: string; // the JSON string from the API
  onExplain?: (audience: string) => void;
}

export function LegalMessageBubble({ content, onExplain }: LegalMessageProps) {
  let parsedContent;
  let isJson = false;
  
  try {
    parsedContent = JSON.parse(content);
    isJson = true;
  } catch (e) {
    parsedContent = content;
  }

  if (!isJson) {
    return <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{content}</div>;
  }

  // Hallucination Prevention Check
  if (parsedContent.confidenceScore === 0) {
    return (
      <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-lg flex gap-3 text-destructive">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">{parsedContent.answer || "I could not confidently determine this from the available context."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {/* Answer */}
      <div className="text-sm font-medium leading-relaxed text-foreground">
        {parsedContent.answer}
      </div>

      <div className="grid gap-3 pt-2">
        {/* Supporting Clause */}
        {parsedContent.supportingClause && (
          <div className="bg-muted p-3 rounded-lg border border-border/50">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5 mb-1.5">
              <FileText className="h-3.5 w-3.5" /> Source: {parsedContent.supportingClause.name}
            </h4>
            <p className="text-xs font-serif italic text-muted-foreground border-l-2 pl-2 border-primary/30">
              "{parsedContent.supportingClause.snippet}"
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {/* Business Impact */}
          {parsedContent.businessImpact && (
            <div className="bg-orange-500/5 p-3 rounded-lg border border-orange-500/20">
              <h4 className="text-xs font-semibold uppercase text-orange-600 dark:text-orange-400 flex items-center gap-1.5 mb-1.5">
                <Briefcase className="h-3.5 w-3.5" /> Business Impact
              </h4>
              <p className="text-xs text-orange-900 dark:text-orange-200">{parsedContent.businessImpact}</p>
            </div>
          )}

          {/* Recommended Action */}
          {parsedContent.recommendedAction && (
            <div className="bg-green-500/5 p-3 rounded-lg border border-green-500/20">
              <h4 className="text-xs font-semibold uppercase text-green-600 dark:text-green-400 flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Action
              </h4>
              <p className="text-xs text-green-900 dark:text-green-200">{parsedContent.recommendedAction}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Attribution */}
      <div className="flex flex-wrap items-center justify-between pt-1 border-t gap-2">
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/20 text-primary/70">
          Confidence: {parsedContent.confidenceScore}%
        </Badge>
        {onExplain && (
          <div className="flex gap-2">
            <button onClick={() => onExplain("Client")} className="text-[10px] font-semibold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
              <MessageSquare className="h-3 w-3" /> Client
            </button>
            <button onClick={() => onExplain("Junior Associate")} className="text-[10px] font-semibold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
              <MessageSquare className="h-3 w-3" /> Associate
            </button>
            <button onClick={() => onExplain("Business Team")} className="text-[10px] font-semibold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
              <MessageSquare className="h-3 w-3" /> Business
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
