"use client";

import { useState, useEffect } from "react";
import { ContractRiskReportTemplate } from "./templates/ContractRiskReport";
import { Button } from "@/components/ui/button";
import { FileDown, ArrowLeft, Edit3, Save, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {  useAuth  } from "@/components/auth/AuthProvider";
import { useModalStore } from "@/store/modal-store";
import { useUpgradeStore } from "@/store/upgrade-store";
import { fetchFreeUsage } from "@/actions/free-actions";
import Link from "next/link";

export function ReportViewer({ report }: { report: any }) {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [notes, setNotes] = useState(report.generated_report_notes || []);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isFreePlan, setIsFreePlan] = useState(false);
  const { user } = useAuth();
  const userId = user?.id;
  const { openSignupModal } = useModalStore();
  const { openUpgradeModal } = useUpgradeStore();

  useEffect(() => {
    if (userId) {
      fetchFreeUsage().then(res => {
        if (res.success && res.usage) {
          setIsFreePlan(true);
        }
      });
    }
  }, [userId]);

  const handleExportPDF = async () => {
    if (!userId) {
      openSignupModal({
        title: "Export Report",
        message: "Create a free account to export this report as a PDF."
      });
      return;
    }
    setIsExportingPDF(true);
    try {
      // Dynamic import to avoid SSR issues with html2pdf
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.getElementById("report-printable-area");
      
      let watermarkDiv = null;
      if (isFreePlan && element) {
        watermarkDiv = document.createElement("div");
        watermarkDiv.style.position = "absolute";
        watermarkDiv.style.top = "0";
        watermarkDiv.style.left = "0";
        watermarkDiv.style.width = "100%";
        watermarkDiv.style.height = "100%";
        watermarkDiv.style.display = "flex";
        watermarkDiv.style.flexWrap = "wrap";
        watermarkDiv.style.alignItems = "center";
        watermarkDiv.style.justifyContent = "center";
        watermarkDiv.style.overflow = "hidden";
        watermarkDiv.style.pointerEvents = "none";
        watermarkDiv.style.zIndex = "50";
        watermarkDiv.style.opacity = "0.08";
        
        watermarkDiv.innerHTML = Array(20).fill('<div style="font-size: 60px; font-weight: 800; font-family: sans-serif; transform: rotate(-45deg); margin: 60px; color: #000; white-space: nowrap;">CATALYST AI FREE</div>').join('');
        
        element.style.position = "relative";
        element.appendChild(watermarkDiv);
      }

      const opt = {
        margin:       0.5,
        filename:     `${report.title}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' as const }
      };
      if (!element) return;
      await html2pdf().set(opt).from(element).save();

      if (watermarkDiv && element) {
        element.removeChild(watermarkDiv);
      }
    } catch (e) {
      console.error(e);
    }
    setIsExportingPDF(false);
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim()) return;
    try {
      const res = await fetch("/api/reports/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: report.id, note: noteContent }),
      });
      const data = await res.json();
      if (data.note) {
        setNotes([...notes, data.note]);
        setNoteContent("");
        setIsAddingNote(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportDocx = async () => {
    if (!userId) {
      openSignupModal({
        title: "Export Report",
        message: "Create a free account to export this report as a DOCX file."
      });
      return;
    }
    if (isFreePlan) {
      openUpgradeModal({
        title: "Unlock editable reports.",
        message: "DOCX exports are available on the Professional plan. Upgrade to edit your reports in Word."
      });
      return;
    }
    try {
      const { exportToDocx } = await import("@/services/export/docx-generator");
      await exportToDocx(report, notes);
    } catch (e) {
      console.error("Failed to export DOCX", e);
    }
  };

  const renderTemplate = () => {
    // We can add a switch statement here for other templates like executive_brief
    return <ContractRiskReportTemplate content={report.content} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-background p-4 border rounded-xl sticky top-4 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/reports">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-lg">{report.title}</h1>
            <p className="text-xs text-muted-foreground capitalize">{report.report_type.replace('_', ' ')} • v{report.version}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF} disabled={isExportingPDF}>
            <FileDown className="h-4 w-4 mr-2" />
            {isExportingPDF ? "Generating PDF..." : "Export PDF"}
          </Button>
          <Button variant="outline" onClick={handleExportDocx}>
            <FileDown className="h-4 w-4 mr-2" />
            Export DOCX
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 items-start">
        <div className="md:col-span-3">
          <div className="bg-white border rounded-xl shadow-sm p-12 overflow-hidden" id="report-printable-area">
            {renderTemplate()}
            
            {/* Inject Lawyer Notes at the end of the report for printing */}
            {notes.length > 0 && (
              <div className="mt-12 pt-8 border-t border-dashed">
                <h3 className="text-lg font-bold mb-4 font-serif text-primary">Lawyer Notes & Addendums</h3>
                <div className="space-y-6">
                  {notes.map((note: any) => (
                    <div key={note.id} className="bg-muted/10 p-4 rounded-lg font-serif">
                      <p className="text-sm font-bold mb-2 text-muted-foreground uppercase tracking-wide">
                        Added by {note.author?.first_name || "Attorney"} • {new Date(note.created_at).toLocaleDateString()}
                      </p>
                      <p className="whitespace-pre-wrap">{note.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-1 space-y-4 sticky top-24">
          <div className="bg-muted/20 border rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><Edit3 className="h-4 w-4" /> Internal Notes</h3>
            </div>
            
            <div className="space-y-4 mb-4">
              {notes.map((note: any) => (
                <div key={note.id} className="text-sm bg-background p-3 rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">{note.author?.first_name || "Me"}</p>
                  <p>{note.note}</p>
                </div>
              ))}
              {notes.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No internal notes.</p>}
            </div>

            {isAddingNote ? (
              <div className="space-y-2">
                <Textarea 
                  placeholder="Add a legal addendum or internal note..." 
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="min-h-[100px] text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveNote} className="flex-1"><Save className="h-4 w-4 mr-2" /> Save Note</Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsAddingNote(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" className="w-full border-dashed" onClick={() => setIsAddingNote(true)}>
                + Add Lawyer Note
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
