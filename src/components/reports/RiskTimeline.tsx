import { CheckCircle2, Clock, Loader2 } from "lucide-react";

interface RiskTimelineProps {
  status: string; // 'processing', 'completed', 'failed'
}

export function RiskTimeline({ status }: RiskTimelineProps) {
  const isCompleted = status === "completed";
  
  const steps = [
    { label: "OCR Complete", completed: true },
    { label: "Language Identified", completed: true },
    { label: "Document Classified", completed: true },
    { label: "Evaluating Risks", completed: isCompleted },
    { label: "Identifying Missing Clauses", completed: isCompleted },
    { label: "Generating Recommendations", completed: isCompleted },
    { label: "Risk Review Ready", completed: isCompleted },
  ];

  return (
    <div className="bg-muted/30 p-5 rounded-xl border space-y-4">
      <h4 className="font-semibold text-sm uppercase text-muted-foreground mb-4">Processing Timeline</h4>
      <div className="space-y-3 text-sm">
        {steps.map((step, i) => (
          <div key={i} className={`flex items-center gap-3 ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>
            {step.completed ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : status === "processing" ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            <span className={step.completed ? "font-medium" : ""}>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
