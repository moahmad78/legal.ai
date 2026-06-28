import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

export async function exportToDocx(report: any, notes: any[]) {
  const content = report.content;
  
  const children = [
    new Paragraph({
      text: `${report.title}`,
      heading: HeadingLevel.TITLE,
      spacing: { after: 400 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Document: ", bold: true }),
        new TextRun(content.documentTitle || "Unknown"),
      ],
      spacing: { after: 120 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Date Prepared: ", bold: true }),
        new TextRun(new Date().toLocaleDateString()),
      ],
      spacing: { after: 400 }
    }),
    
    new Paragraph({
      text: "1. Executive Summary",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 }
    }),
    new Paragraph({
      text: content.summary || content.narrative?.executiveSummary || "No summary provided.",
      spacing: { after: 400 }
    }),

    new Paragraph({
      text: "2. Risk Assessment",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Overall Risk: ", bold: true }),
        new TextRun(`${content.overallRisk} (Score: ${content.riskScore}/100)`),
      ],
      spacing: { after: 400 }
    }),
  ];

  if (content.highRisks?.length > 0) {
    children.push(new Paragraph({ text: "High Priority Risks", heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }));
    content.highRisks.forEach((risk: any) => {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${risk.title}: `, bold: true }),
          new TextRun(risk.description)
        ],
        bullet: { level: 0 }
      }));
    });
  }

  if (notes && notes.length > 0) {
    children.push(new Paragraph({
      text: "Lawyer Notes & Addendums",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 }
    }));
    notes.forEach((note: any) => {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `Added by ${note.author?.first_name || "Attorney"}: `, bold: true }),
          new TextRun(note.note)
        ],
        spacing: { after: 200 }
      }));
    });
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: children
    }]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
