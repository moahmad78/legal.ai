import { Progress } from "@/components/ui/progress";

interface HeatmapProps {
  data: {
    liability: number;
    termination: number;
    financial: number;
    compliance: number;
    confidentiality: number;
  };
}

export function RiskHeatmap({ data }: HeatmapProps) {
  const getRiskColor = (score: number) => {
    if (score < 31) return "bg-green-500";
    if (score < 71) return "bg-orange-500";
    return "bg-destructive";
  };

  const categories = [
    { label: "Liability", value: data.liability },
    { label: "Termination", value: data.termination },
    { label: "Financial", value: data.financial },
    { label: "Compliance", value: data.compliance },
    { label: "Confidentiality", value: data.confidentiality },
  ];

  return (
    <div className="space-y-4">
      {categories.map((cat, i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-muted-foreground">{cat.label}</span>
            <span className="font-bold">{cat.value}%</span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className={`h-full ${getRiskColor(cat.value)} transition-all duration-500`} 
              style={{ width: `${Math.max(5, cat.value)}%` }} 
            />
          </div>
        </div>
      ))}
    </div>
  );
}
