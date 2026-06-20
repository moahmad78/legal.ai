"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const samples = [
  {
    id: "nda",
    title: "Non-Disclosure Agreement",
    description: "Standard bilateral NDA between two parties for confidential information exchange.",
    category: "Contracts",
  },
  {
    id: "lease",
    title: "Residential Lease Agreement",
    description: "Comprehensive lease agreement for residential property rentals.",
    category: "Property",
  },
  {
    id: "employment",
    title: "Employment Offer Letter",
    description: "Formal employment offer letter with compensation and terms.",
    category: "HR & Employment",
  },
  {
    id: "terms",
    title: "Terms of Service",
    description: "Standard terms of service for SaaS and web applications.",
    category: "Tech & Startups",
  },
];

export default function SampleDocumentsPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-6 py-4 bg-background/95 backdrop-blur sticky top-0 z-10">
        <h1 className="text-lg font-semibold">Sample Documents</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Explore sample legal documents and analyze them with AI
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid sm:grid-cols-2 gap-4 max-w-3xl">
          {samples.map((doc) => (
            <div
              key={doc.id}
              className="border rounded-xl p-5 bg-background hover:border-primary/40 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{doc.title}</p>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {doc.category}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                {doc.description}
              </p>
              <Link href={`/analyze?sample=${doc.id}`}>
                <Button size="sm" variant="outline" className="w-full text-xs">
                  Analyze with AI
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
