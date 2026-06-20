import { DocumentRisk } from "@/services/ai/types";
import { AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";

export function RiskCard({ risk }: { risk: DocumentRisk }) {
  const isHigh = risk.severity === "High";
  const isMedium = risk.severity === "Medium";

  return (
    <div className={`p-5 rounded-xl border ${
      isHigh ? "bg-destructive/5 border-destructive/20" : 
      isMedium ? "bg-orange-500/5 border-orange-500/20" : 
      "bg-green-500/5 border-green-500/20"
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {isHigh ? (
            <AlertTriangle className="h-5 w-5 text-destructive" />
          ) : isMedium ? (
            <AlertCircle className="h-5 w-5 text-orange-500" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          )}
          <h4 className="font-bold text-lg">{risk.title}</h4>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
          isHigh ? "bg-destructive/10 text-destructive" : 
          isMedium ? "bg-orange-500/10 text-orange-600" : 
          "bg-green-500/10 text-green-600"
        }`}>
          {risk.severity} Risk
        </span>
      </div>

      <div className="space-y-4 text-sm mt-4">
        {risk.affectedClause && (
          <div>
            <span className="text-muted-foreground font-medium uppercase text-xs">Affected Clause</span>
            <p className="mt-1 font-medium">{risk.affectedClause}</p>
          </div>
        )}
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <span className="text-muted-foreground font-medium uppercase text-xs">Description</span>
            <p className="mt-1">{risk.description}</p>
          </div>
          <div>
            <span className="text-muted-foreground font-medium uppercase text-xs">Business Impact</span>
            <p className="mt-1">{risk.businessImpact}</p>
          </div>
        </div>

        <div className="bg-background/60 p-3 rounded-lg border mt-2">
          <span className="text-muted-foreground font-medium uppercase text-xs flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> Recommendation
          </span>
          <p className="mt-1 font-medium">{risk.recommendation}</p>
        </div>
      </div>
    </div>
  );
}
