"use client";

import {  useAuth  } from "@/components/auth/AuthProvider";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Search, Filter, Clock, MoreVertical, FileDown, Eye } from "lucide-react";
import Link from "next/link";
import { buttonVariants, Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

export default function ReportsCenterPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const supabase = createClient();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchReports() {
      if (!userId) return;

      const { data: user } = await supabase.from("users").select("id").eq("id", userId).single();
      if (!user) return;

      const { data } = await supabase
        .from("generated_reports")
        .select("*")
        .eq("generated_by", user.id)
        .order("created_at", { ascending: false });

      if (data) setReports(data);
      setLoading(false);
    }
    fetchReports();
  }, [userId]);

  const filteredReports = reports.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.report_type.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Legal Deliverables & Reports</h1>
          <p className="text-muted-foreground mt-1">Generate professional opinions and briefs for your clients.</p>
        </div>
        <Link href="/reports/generate" className={buttonVariants({ className: "gap-2" })}>
          <Plus className="h-4 w-4" /> Generate Report
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search reports by title or type..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" /> Filter
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-muted/20 animate-pulse rounded-xl border"></div>)}
        </div>
      ) : filteredReports.length === 0 ? (
        <Card className="border-dashed py-12 text-center bg-muted/10">
          <CardContent className="flex flex-col items-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Reports Generated</h3>
            <p className="text-muted-foreground mb-6">Create a new professional report from your analyzed documents.</p>
            <Link href="/reports/generate" className={buttonVariants({ variant: "outline" })}>
              Create First Report
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report: any) => (
            <Card key={report.id} className="flex flex-col hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {report.report_type}
                  </Badge>
                  <Badge variant="outline" className={
                    report.status === 'final' ? "bg-green-500/10 text-green-600 border-green-500/20" : 
                    "bg-orange-500/10 text-orange-600 border-orange-500/20"
                  }>
                    {report.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg line-clamp-1" title={report.title}>{report.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Generated</span>
                    <span>{formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex gap-2">
                <Link href={`/dashboard/reports/${report.id}`} className={buttonVariants({ variant: "secondary", className: "flex-1 gap-2" })}>
                  <Eye className="h-4 w-4" /> View
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 w-9">
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <FileDown className="h-4 w-4 mr-2" /> Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileDown className="h-4 w-4 mr-2" /> Download DOCX
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
