"use client";

import { useState } from "react";
import { Search, Filter, Briefcase, FileText, CheckCircle2, ChevronRight, Copy, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ClauseNavigatorProps {
  clauses: any[];
}

export function ClauseNavigator({ clauses }: ClauseNavigatorProps) {
  const [selectedClause, setSelectedClause] = useState<any | null>(clauses[0] || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string | null>(null);

  const filteredClauses = clauses.filter(c => {
    const matchesSearch = c.clause_type.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.original_text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter ? c.risk_level === riskFilter : true;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="grid md:grid-cols-3 gap-6 h-[700px] border rounded-xl overflow-hidden bg-background">
      {/* Left List Panel */}
      <div className="col-span-1 border-r flex flex-col bg-muted/10 h-full">
        <div className="p-4 border-b space-y-3 bg-background">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search clauses..." 
              className="pl-9 h-9 text-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 text-xs">
            <Button 
              variant={riskFilter === null ? "secondary" : "outline"} 
              size="sm" className="h-7 px-2"
              onClick={() => setRiskFilter(null)}
            >
              All
            </Button>
            <Button 
              variant={riskFilter === "High" ? "destructive" : "outline"} 
              size="sm" className="h-7 px-2 text-destructive border-destructive/30"
              onClick={() => setRiskFilter(riskFilter === "High" ? null : "High")}
            >
              High Risk
            </Button>
            <Button 
              variant={riskFilter === "Medium" ? "secondary" : "outline"} 
              size="sm" className="h-7 px-2 text-orange-500 border-orange-500/30"
              onClick={() => setRiskFilter(riskFilter === "Medium" ? null : "Medium")}
            >
              Medium
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {filteredClauses.map((clause, idx) => (
            <div 
              key={idx}
              onClick={() => setSelectedClause(clause)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedClause?.id === clause.id 
                  ? "bg-primary/5 border-primary shadow-sm" 
                  : "bg-background hover:bg-muted/50 border-transparent hover:border-border"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-sm truncate pr-2">{clause.clause_type}</h4>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-semibold ${
                  clause.risk_level === 'High' ? 'text-destructive border-destructive/30' :
                  clause.risk_level === 'Medium' ? 'text-orange-500 border-orange-500/30' :
                  'text-green-500 border-green-500/30'
                }`}>
                  {clause.risk_level}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{clause.simple_meaning}</p>
            </div>
          ))}
          
          {filteredClauses.length === 0 && (
            <div className="text-center p-8 text-muted-foreground text-sm">
              No clauses found.
            </div>
          )}
        </div>
      </div>

      {/* Right Detail Panel */}
      <div className="col-span-2 flex flex-col h-full bg-background overflow-y-auto">
        {selectedClause ? (
          <div className="p-6 md:p-8 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{selectedClause.clause_type}</h2>
                <Badge variant="outline" className={`px-2 py-0.5 ${
                  selectedClause.risk_level === 'High' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                  selectedClause.risk_level === 'Medium' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' :
                  'bg-green-500/10 text-green-600 border-green-500/20'
                }`}>
                  {selectedClause.risk_level} Risk
                </Badge>
              </div>
            </div>

            {/* Simple Meaning & Explain to Client */}
            <div className="bg-blue-500/5 rounded-xl border border-blue-500/20 p-5 shadow-sm">
              <h3 className="font-semibold flex items-center gap-2 mb-3 text-blue-700 dark:text-blue-400">
                <Users className="h-5 w-5" />
                Explain to Client
              </h3>
              <p className="text-sm md:text-base font-medium leading-relaxed">
                {selectedClause.simple_meaning}
              </p>
            </div>

            {/* Business Impact */}
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-3 text-foreground">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                Business Impact
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed bg-muted/30 p-4 rounded-lg border">
                {selectedClause.business_impact}
              </p>
            </div>

            {/* Negotiation Suggestions */}
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-3 text-foreground">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Negotiation Strategies
              </h3>
              <div className="bg-green-500/5 border border-green-500/20 p-4 rounded-lg text-sm text-green-900 dark:text-green-200 font-medium">
                {selectedClause.negotiation_suggestion}
              </div>
            </div>

            {/* Original Text */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <h3 className="font-semibold flex items-center gap-2 text-foreground">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  Original Text
                </h3>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => navigator.clipboard.writeText(selectedClause.original_text)}>
                  <Copy className="h-3 w-3" /> Copy
                </Button>
              </div>
              <div className="bg-muted p-4 rounded-lg border text-sm font-serif italic text-muted-foreground overflow-y-auto max-h-40 whitespace-pre-wrap">
                "{selectedClause.original_text}"
              </div>
            </div>

          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground flex-col">
            <FileText className="h-12 w-12 mb-4 opacity-20" />
            <p>Select a clause to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
