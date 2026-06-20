import { MissingClause } from "@/services/ai/types";
import { FileWarning, PlusCircle } from "lucide-react";

export function MissingClauseCard({ clause }: { clause: MissingClause }) {
  const isHigh = clause.severity === "High";

  return (
    <div className="p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <FileWarning className={`h-4 w-4 ${isHigh ? "text-destructive" : "text-orange-500"}`} />
        <h4 className="font-semibold">{clause.missingClause}</h4>
        <span className="text-xs text-muted-foreground ml-auto uppercase tracking-wider">{clause.severity}</span>
      </div>
      
      <p className="text-sm text-muted-foreground mb-3">{clause.reason}</p>
      
      <div className="flex items-start gap-2 text-sm bg-background p-3 rounded-md border">
        <PlusCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <span className="font-medium text-foreground">{clause.recommendation}</span>
      </div>
    </div>
  );
}
