"use client";

import { useState, useEffect } from "react";
import {  useAuth  } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { FileText, ChevronRight, Loader2, Search, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const REPORT_TYPES = [
  { id: "contract_risk", name: "Contract Risk Report", description: "Detailed breakdown of liabilities, obligations, and red flags.", icon: FileText },
  { id: "executive_brief", name: "Executive Brief", description: "1-2 page high-level summary designed for partners and senior management.", icon: Briefcase },
  { id: "legal_opinion", name: "Legal Opinion", description: "Structured formal opinion with facts, issues, and risk assessment.", icon: FileText },
  { id: "client_summary", name: "Client Summary Report", description: "Jargon-free, easy to understand summary for clients.", icon: FileText },
];

export default function GenerateReportPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const supabase = createClient();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function loadDocs() {
      if (!userId) return;
      const { data: user } = await supabase.from("users").select("id").eq("auth_user_id", userId).single();
      if (!user) return;

      const { data } = await supabase
        .from("documents")
        .select("id, file_name, created_at, status")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false });
        
      if (data) setDocuments(data);
    }
    loadDocs();
  }, [userId]);

  const handleGenerate = async () => {
    if (!selectedDoc || !selectedType) return;
    setGenerating(true);

    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: selectedDoc, reportType: selectedType }),
      });

      const data = await response.json();
      if (data.reportId) {
        router.push(`/dashboard/reports/${data.reportId}`);
      } else {
        throw new Error(data.error || "Failed to generate report");
      }
    } catch (err) {
      console.error(err);
      setGenerating(false);
    }
  };

  const filteredDocs = documents.filter(d => d.file_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generate Deliverable</h1>
        <p className="text-muted-foreground mt-1">Select a report format and source document.</p>
      </div>

      <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground mb-8">
        <span className={step >= 1 ? "text-primary" : ""}>1. Select Type</span>
        <ChevronRight className="h-4 w-4" />
        <span className={step >= 2 ? "text-primary" : ""}>2. Select Source</span>
        <ChevronRight className="h-4 w-4" />
        <span className={step >= 3 ? "text-primary" : ""}>3. Generate</span>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Choose Report Type</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {REPORT_TYPES.map(type => (
              <Card 
                key={type.id} 
                className={`cursor-pointer transition-colors ${selectedType === type.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                onClick={() => setSelectedType(type.id)}
              >
                <CardContent className="p-6 flex gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${selectedType === type.id ? 'bg-primary text-white' : 'bg-muted'}`}>
                    <type.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{type.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{type.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-end mt-8">
            <Button disabled={!selectedType} onClick={() => setStep(2)}>Next Step</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Select Source Document</h2>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search analyzed documents..." 
              className="pl-10 h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {filteredDocs.map(doc => (
              <div 
                key={doc.id}
                onClick={() => setSelectedDoc(doc.id)}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${selectedDoc === doc.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">Analyzed on {new Date(doc.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
            {filteredDocs.length === 0 && (
              <div className="text-center p-8 text-muted-foreground border border-dashed rounded-xl">
                No analyzed documents found.
              </div>
            )}
          </div>
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button disabled={!selectedDoc} onClick={() => setStep(3)}>Next Step</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8 text-center py-12">
          <div className="max-w-md mx-auto space-y-4">
            <FileText className="h-16 w-16 mx-auto text-primary opacity-80" />
            <h2 className="text-2xl font-bold">Ready to Generate</h2>
            <p className="text-muted-foreground">
              We will generate a <span className="font-semibold text-foreground">{REPORT_TYPES.find(t => t.id === selectedType)?.name}</span> using the intelligence from <span className="font-semibold text-foreground">{documents.find(d => d.id === selectedDoc)?.file_name}</span>.
            </p>
          </div>
          <div className="flex justify-center gap-4 mt-8">
            <Button variant="outline" onClick={() => setStep(2)} disabled={generating}>Back</Button>
            <Button size="lg" onClick={handleGenerate} disabled={generating} className="min-w-[200px]">
              {generating ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Structuring Report...</>
              ) : (
                "Generate Report"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

