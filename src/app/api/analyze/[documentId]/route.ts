import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { extractText } from "@/services/ocr/extract-text";
import { detectDocumentType } from "@/services/document-detector/detect";
import { analyzeDocument } from "@/services/ai/analyze";
import { trackUsage } from "@/lib/usage";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await params;
  let preferredLanguage = "English";
  
  try {
    const body = await req.json();
    if (body && body.preferredLanguage) {
      preferredLanguage = body.preferredLanguage;
    }
  } catch (e) {
    // Ignore JSON parse errors if body is empty
  }
  
  if (!documentId) {
    return NextResponse.json({ error: "Missing document ID" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }


  const isDevelopmentAnalysis = process.env.NODE_ENV === "development" && !env.OPENAI_API_KEY;

  if (isDevelopmentAnalysis) {
    if (process.env.NODE_ENV === "development") {
      console.log("[DEBUG Analysis] Missing AI or S3 keys in development. Simulating analysis...");
    }
    // Simulate 8 seconds of processing to allow the frontend to cycle through the 4 stages (2 seconds each)
    await new Promise((resolve) => setTimeout(resolve, 8000));
    
    return NextResponse.json({
      success: true,
      detection: { documentType: "Lease Agreement", confidence: 98 },
      report: {
         executiveSummary: "This is a simulated executive summary generated because Catalyst AI is running in Development Mode without external API keys. It outlines the mock terms between the mock landlord and tenant.",
         riskLevel: "Medium",
         redFlags: ["Mock red flag: Automatic renewal clause detected", "Mock red flag: High late payment penalty"],
         importantDates: ["2026-06-14"],
         financialTerms: ["Rent: $2,000/month", "Security Deposit: $2,000"],
         recommendations: ["Review the automatic renewal clause.", "Negotiate the late payment penalty."],
         explainLikeIm15: "This is a simulated simple explanation. Essentially, if you break something, you buy it.",
         overallRiskScore: 78,
         overallRiskLevel: "High",
         riskConfidence: 95,
         heatmap: { liability: 85, termination: 70, financial: 90, compliance: 60, confidentiality: 50 },
         risks: [
           {
             title: "Unlimited Liability",
             severity: "High",
             affectedClause: "Section 4.2",
             description: "The tenant is liable for all damages without a cap.",
             businessImpact: "Potential exposure to unlimited financial claims.",
             recommendation: "Limit liability to a negotiated cap or 12 months rent.",
             confidence: 98
           }
         ],
         missingClauses: [
           {
             missingClause: "Force Majeure",
             severity: "Medium",
             reason: "Standard protection against unforeseen events.",
             recommendation: "Add a standard force majeure clause."
           }
         ],
         recommendedActions: [
           "Review immediately",
           "Add liability cap",
           "Clarify renewal terms"
         ],
         clauses: [
           {
             clauseType: "Liability",
             originalText: "The Tenant shall be strictly liable for any and all damages to the Premises, regardless of fault, and shall indemnify the Landlord against all claims.",
             simpleMeaning: "If the property is damaged, the tenant pays for it, even if it wasn't their fault.",
             riskLevel: "High",
             businessImpact: "Exposes the business to unpredictable, unlimited financial liability for events outside their control.",
             negotiationSuggestion: "Add a liability cap equal to 12 months' rent and exclude damages caused by the landlord's negligence.",
             confidence: 96
           },
           {
             clauseType: "Termination",
             originalText: "This Agreement shall automatically renew for successive one-year terms unless either party provides written notice of termination at least 90 days prior to the expiration of the then-current term.",
             simpleMeaning: "The contract renews automatically unless you cancel it 90 days before it ends.",
             riskLevel: "Medium",
             businessImpact: "Risk of unwanted renewals and operational inflexibility if the notice window is missed.",
             negotiationSuggestion: "Reduce notice period to 30 days and require the landlord to send a reminder before the deadline.",
             confidence: 92
           }
         ]
      }
    });
  }

  try {
    // 1. Fetch document metadata
    const { data: document, error: fetchError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (fetchError || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Update status to processing
    await supabase.from("documents").update({ status: "processing" }).eq("id", documentId);

    // 2. Retrieve file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(document.storage_key);

    if (downloadError || !fileData) {
      throw new Error(`Failed to retrieve file body from Supabase: ${downloadError?.message}`);
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Extract text
    const ocrResult = await extractText(buffer, document.file_type);

    // 4. Detect document type
    const detectionResult = await detectDocumentType(ocrResult.text);

    // Update document type and confidence in DB
    await supabase.from("documents").update({ 
      document_type: detectionResult.documentType,
      confidence_score: detectionResult.confidence,
      original_language_code: detectionResult.languageCode,
      original_language_name: detectionResult.languageName,
      language_confidence: detectionResult.languageConfidence,
    }).eq("id", documentId);

    // 5. Run AI Analysis
    const analysisReport = await analyzeDocument(ocrResult.text, preferredLanguage);

    // 6. Save report
    const { error: reportError } = await supabase.from("reports").insert({
      document_id: documentId,
      summary: analysisReport.executiveSummary,
      risk_level: analysisReport.riskLevel,
      red_flags: analysisReport.redFlags,
      important_dates: analysisReport.importantDates,
      financial_terms: analysisReport.financialTerms,
      recommendations: analysisReport.recommendations,
      extracted_text: ocrResult.text,
      heatmap: analysisReport.heatmap,
      missing_clauses: analysisReport.missingClauses,
      recommended_actions: analysisReport.recommendedActions,
    });

    if (reportError) {
      throw new Error(`Failed to save report: ${reportError.message}`);
    }

    // 6.5. Update document risk fields
    await supabase.from("documents").update({
      overall_risk_score: analysisReport.overallRiskScore,
      overall_risk_level: analysisReport.overallRiskLevel,
      risk_confidence: analysisReport.riskConfidence,
      risk_completed_at: new Date().toISOString()
    }).eq("id", documentId);

    // 6.6. Insert risks
    if (analysisReport.risks && analysisReport.risks.length > 0) {
      const risksToInsert = analysisReport.risks.map((risk) => ({
        document_id: documentId,
        title: risk.title,
        severity: risk.severity,
        affected_clause: risk.affectedClause,
        description: risk.description,
        business_impact: risk.businessImpact,
        recommendation: risk.recommendation,
        confidence: risk.confidence,
      }));
      await supabase.from("document_risks").insert(risksToInsert);
    }

    // 6.7. Insert clauses
    if (analysisReport.clauses && analysisReport.clauses.length > 0) {
      const clausesToInsert = analysisReport.clauses.map((clause) => ({
        document_id: documentId,
        clause_type: clause.clauseType,
        original_text: clause.originalText,
        simple_meaning: clause.simpleMeaning,
        risk_level: clause.riskLevel,
        business_impact: clause.businessImpact,
        negotiation_suggestion: clause.negotiationSuggestion,
        confidence: clause.confidence,
      }));
      await supabase.from("document_clauses").insert(clausesToInsert);
    }

    // 7. Update status to completed
    await supabase.from("documents").update({ 
      status: "completed",
      processed_at: new Date().toISOString()
    }).eq("id", documentId);

    // Track usage
    const { data: userObj } = await supabase.from("users").select("active_organization_id").eq("id", userId).single();
    if (userObj?.active_organization_id) {
      await trackUsage(userObj.active_organization_id, "documents_processed");
    }

    return NextResponse.json({
      success: true,
      detection: detectionResult,
      report: analysisReport
    });

  } catch (error: any) {
    console.error("Processing API Error:", error);
    
    // Update status to failed
    await supabase.from("documents").update({ 
      status: "failed",
      error_message: error.message || "Unknown processing error",
      processed_at: new Date().toISOString()
    }).eq("id", documentId);

    return NextResponse.json({ 
      error: "Document processing failed",
      message: error.message 
    }, { status: 500 });
  }
}
