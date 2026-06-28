"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Plus, ArrowRight, FileText, SplitSquareHorizontal, CheckCircle2, AlertTriangle, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface DocumentCompareTabProps {
  matterId: string;
}

export function MatterCompareTab({ matterId }: DocumentCompareTabProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [comparisons, setComparisons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [baseDocId, setBaseDocId] = useState<string>("");
  const [targetDocId, setTargetDocId] = useState<string>("");
  const [isComparing, setIsComparing] = useState(false);
  const [activeComparison, setActiveComparison] = useState<any | null>(null);

  useEffect(() => {
    fetchData();
  }, [matterId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch documents for the dropdowns
      const docsRes = await fetch(`/api/matters/${matterId}/documents`);
      if (docsRes.ok) {
        const data = await docsRes.json();
        setDocuments(data.documents || []);
      }

      // Fetch comparisons
      const compRes = await fetch(`/api/matters/${matterId}/compare`);
      if (compRes.ok) {
        const data = await compRes.json();
        setComparisons(data.comparisons || []);
      }
    } catch (err) {
      console.error("Failed to fetch compare tab data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!baseDocId || !targetDocId) {
      toast.error("Please select both Document V1 and Document V2");
      return;
    }
    if (baseDocId === targetDocId) {
      toast.error("Please select two different documents");
      return;
    }

    setIsComparing(true);
    try {
      const res = await fetch(`/api/matters/${matterId}/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseDocumentId: baseDocId, targetDocumentId: targetDocId })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Comparison failed");
      }

      const data = await res.json();
      toast.success("Documents compared successfully");
      
      // Select the newly generated one
      setActiveComparison({
        id: data.id,
        summary: data.summary,
        comparison_data: data.changes,
        base_name: documents.find(d => d.id === baseDocId)?.name,
        target_name: documents.find(d => d.id === targetDocId)?.name,
        created_at: new Date().toISOString()
      });
      
      // Refresh list
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsComparing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High": return "text-red-600 bg-red-50 border-red-200";
      case "Medium": return "text-amber-600 bg-amber-50 border-amber-200";
      case "Low": return "text-blue-600 bg-blue-50 border-blue-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Addition": return <Plus className="h-4 w-4 text-emerald-600" />;
      case "Deletion": return <Trash2 className="h-4 w-4 text-red-600" />;
      case "Modification": return <AlertCircle className="h-4 w-4 text-amber-600" />;
      default: return null;
    }
  };

  if (isLoading && !comparisons.length) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading engine...</div>;
  }

  // If a comparison is active, show the Diff Viewer
  if (activeComparison) {
    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" onClick={() => setActiveComparison(null)} className="-ml-3 text-muted-foreground mb-2">
              &larr; Back to Comparisons
            </Button>
            <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
              <SplitSquareHorizontal className="h-6 w-6 text-primary" /> Diff Viewer
            </h2>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <span className="font-medium bg-muted px-2 py-1 rounded-md">{activeComparison.base_name}</span>
              <ArrowRight className="h-4 w-4" />
              <span className="font-medium bg-muted px-2 py-1 rounded-md">{activeComparison.target_name}</span>
            </div>
          </div>
          <Button variant="outline" onClick={() => window.print()}>
            Export Diff
          </Button>
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">AI Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{activeComparison.summary}</p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold mt-8 mb-4">Material Changes ({activeComparison.comparison_data.length})</h3>
          
          {activeComparison.comparison_data.map((change: any, idx: number) => (
            <Card key={idx} className="overflow-hidden">
              <div className="flex flex-col md:flex-row border-b">
                <div className="flex-1 p-4 bg-red-50/50 border-r relative">
                  <span className="absolute top-0 right-0 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-bl-md uppercase tracking-wider">Document V1</span>
                  <p className="text-sm text-muted-foreground line-through decoration-red-300 mt-2">{change.oldText || "—"}</p>
                </div>
                <div className="flex-1 p-4 bg-emerald-50/50 relative">
                  <span className="absolute top-0 right-0 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-bl-md uppercase tracking-wider">Document V2</span>
                  <p className="text-sm font-medium text-emerald-900 mt-2">{change.newText || "—"}</p>
                </div>
              </div>
              <div className="p-4 bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(change.type)}
                    <h4 className="font-semibold">{change.clauseName}</h4>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full border ${getSeverityColor(change.severity)}`}>
                    {change.severity} Severity
                  </span>
                </div>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md border">
                  <span className="font-semibold text-foreground">Implication: </span>
                  {change.explanation}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // List & Create View
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Left Column: Create New Comparison */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SplitSquareHorizontal className="h-5 w-5 text-primary" /> New Comparison
            </CardTitle>
            <CardDescription>
              Select two documents to run a differential risk analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Document V1 (Base)</label>
              <Select value={baseDocId} onValueChange={(val) => setBaseDocId(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select original document" />
                </SelectTrigger>
                <SelectContent>
                  {documents.map(doc => (
                    <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-center -my-2 relative z-10">
              <div className="bg-background border rounded-full p-1 shadow-sm">
                <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Document V2 (Target)</label>
              <Select value={targetDocId} onValueChange={(val) => setTargetDocId(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select revised document" />
                </SelectTrigger>
                <SelectContent>
                  {documents.map(doc => (
                    <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full mt-4" 
              onClick={handleCompare} 
              disabled={isComparing || !baseDocId || !targetDocId || baseDocId === targetDocId}
            >
              {isComparing ? "Analyzing Differences..." : "Run AI Comparison"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Comparison History */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" /> Past Comparisons
        </h3>

        {comparisons.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-xl bg-muted/20">
            <SplitSquareHorizontal className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground font-medium">No comparisons run for this matter yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comparisons.map((comp) => (
              <Card key={comp.id} className="transition-all hover:border-primary/50 hover:shadow-sm cursor-pointer group" onClick={() => setActiveComparison(comp)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-medium">
                      <span className="line-clamp-1 max-w-[200px] text-sm" title={comp.base_name}>{comp.base_name}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="line-clamp-1 max-w-[200px] text-sm" title={comp.target_name}>{comp.target_name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ran on {format(new Date(comp.created_at), "MMM d, yyyy h:mm a")} • {comp.comparison_data.length} material changes detected
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="group-hover:bg-primary/10 group-hover:text-primary">
                    View Diff
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
