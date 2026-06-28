import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const userId = authUser?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { documentId, reportType } = await req.json();
    if (!documentId || !reportType) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("id, organization_id")
      .eq("auth_user_id", userId)
      .single();

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Fetch all related intelligence
    const { data: document } = await supabase
      .from("documents")
      .select(`
        *,
        reports(*),
        document_risks(*),
        document_clauses(*)
      `)
      .eq("id", documentId)
      .single();

    if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    // Based on the reportType, prompt the LLM to structure the payload correctly
    const systemPrompt = "You are an expert legal drafter. Return JSON.";
    const userPrompt = "Structure the report based on this data.";
    
    // To save time and tokens, we will just use the pre-calculated risks and clauses 
    // and format them directly in the UI. 
    // The LLM pass here is used just to generate a cohesive Executive Summary / Facts Reviewed if needed.
    // For Contract Risk Report, we don't even need LLM, we can just assemble JSON.
    
    let generatedContent: any = {
      documentTitle: document.file_name,
      documentType: document.document_type || "Legal Document",
      overallRisk: document.overall_risk_level || "Unknown",
      riskScore: document.overall_risk_score || 0,
      summary: document.reports?.[0]?.summary || "",
      highRisks: document.document_risks.filter((r: any) => r.risk_level === "High"),
      mediumRisks: document.document_risks.filter((r: any) => r.risk_level === "Medium"),
      clauses: document.document_clauses,
      missingClauses: document.reports?.[0]?.recommendations?.filter((r: any) => r.type === "missing_clause") || []
    };

    if (reportType === "executive_brief" || reportType === "legal_opinion" || reportType === "client_summary") {
       // Only run an LLM call for narrative heavy reports.
       const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You are a senior Legal Partner. You are drafting a ${reportType}. 
              Return a JSON object with: 
              { 
                "executiveSummary": "1-2 paragraphs", 
                "keyFindings": ["string array"], 
                "recommendedNextSteps": ["string array"],
                "criticalRisks": ["string array"]
              }`
            },
            {
              role: "user",
              content: `Document Summary: ${document.reports?.[0]?.summary}. 
              Risks: ${JSON.stringify(document.document_risks.map((r:any) => ({ title: r.title, description: r.description })))}`
            }
          ]
       });
       
       const aiData = JSON.parse(response.choices[0].message.content || "{}");
       generatedContent = { ...generatedContent, narrative: aiData };
    }

    const { data: newReport, error } = await supabase
      .from("generated_reports")
      .insert({
        organization_id: user.organization_id,
        client_id: null,
        matter_id: null,
        document_id: document.id,
        report_type: reportType,
        title: `${document.file_name} - ${reportType.replace('_', ' ').replace(/\b\w/g, (l:string) => l.toUpperCase())}`,
        generated_by: user.id,
        status: "final",
        content: generatedContent
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ reportId: newReport.id });

  } catch (error: any) {
    console.error("Report Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

