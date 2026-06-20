"use client";

import { Uploader } from "@/components/dashboard/Uploader";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DocumentUploadPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex items-center gap-4">
        <Link href="/documents">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Document</h1>
          <p className="text-muted-foreground mt-1">Upload a PDF, DOCX, or Image file for AI analysis.</p>
        </div>
      </div>
      
      <div className="mt-8">
        <Uploader />
      </div>
    </div>
  );
}
