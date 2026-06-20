"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, Briefcase, Calendar, User, MoreHorizontal, Edit, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MatterOverviewTab } from "./MatterOverviewTab";
import { MatterForm } from "./MatterForm";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export function MatterProfile({ initialMatter }: { initialMatter: any }) {
  const [matter, setMatter] = useState(initialMatter);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const router = useRouter();

  if (!matter) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-xl font-semibold mb-2">Matter not found</h2>
        <Link href="/matters">
          <Button variant="outline">Return to Matters</Button>
        </Link>
      </div>
    );
  }

  const handleArchive = async () => {
    if (!confirm("Are you sure you want to archive this matter?")) return;

    try {
      const res = await fetch(`/api/matters/${matter.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to archive matter");
      
      toast.success("Matter archived successfully");
      router.push("/matters");
    } catch (error) {
      toast.error("Failed to archive matter");
    }
  };

  const priorityColors: Record<string, string> = {
    Low: "bg-gray-100 text-gray-800 border-gray-200",
    Medium: "bg-blue-50 text-blue-700 border-blue-200",
    High: "bg-red-50 text-red-700 border-red-200",
  };

  const statusColors: Record<string, string> = {
    Open: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
    "Under Review": "bg-purple-50 text-purple-700 border-purple-200",
    Completed: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-2">
        <Link href="/matters">
          <Button variant="ghost" size="sm" className="-ml-3 text-muted-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Matters
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Briefcase className="h-8 w-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold font-heading">{matter.matter_name}</h1>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors[matter.status] || "bg-gray-100"}`}>
                {matter.status}
              </span>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${priorityColors[matter.priority] || "bg-gray-100"}`}>
                {matter.priority} Priority
              </span>
            </div>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm text-muted-foreground">
              {matter.client && (
                <Link href={`/clients/${matter.client.id}`} className="flex items-center gap-1.5 hover:text-primary transition-colors font-medium">
                  <User className="h-4 w-4" /> {matter.client.client_name}
                </Link>
              )}
              {matter.due_date && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> Due: {format(new Date(matter.due_date), "MMM d, yyyy")}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Edit Matter
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleArchive} className="text-orange-600 focus:bg-orange-50 focus:text-orange-600">
                <Archive className="mr-2 h-4 w-4" /> Archive Matter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-12 p-0 mb-6 flex-nowrap overflow-x-auto hide-scrollbar">
          <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-6 h-full font-medium">
            Overview
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-6 h-full font-medium">
            Documents
          </TabsTrigger>
          <TabsTrigger value="risks" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-6 h-full font-medium">
            Risks
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-6 h-full font-medium">
            Tasks
          </TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-6 h-full font-medium">
            Team
          </TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-6 h-full font-medium">
            Timeline
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-6 h-full font-medium">
            Reports
          </TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-6 h-full font-medium text-blue-600 data-[state=active]:border-blue-600">
            AI Assistant
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 outline-none">
          <MatterOverviewTab matter={matter} />
        </TabsContent>

        <TabsContent value="documents" className="mt-0 pt-8 outline-none flex justify-center">
          <ComingSoon title="Document Vault" />
        </TabsContent>
        
        <TabsContent value="risks" className="mt-0 pt-8 outline-none flex justify-center">
          <ComingSoon title="Risk Analysis" />
        </TabsContent>

        <TabsContent value="tasks" className="mt-0 pt-8 outline-none flex justify-center">
          <ComingSoon title="Task Tracking" />
        </TabsContent>
        
        <TabsContent value="team" className="mt-0 pt-8 outline-none flex justify-center">
          <ComingSoon title="Matter Team" />
        </TabsContent>

        <TabsContent value="timeline" className="mt-0 pt-8 outline-none flex justify-center">
          <ComingSoon title="Matter Timeline" />
        </TabsContent>
        
        <TabsContent value="reports" className="mt-0 pt-8 outline-none flex justify-center">
          <ComingSoon title="Legal Reports" />
        </TabsContent>

        <TabsContent value="ai" className="mt-0 pt-8 outline-none flex justify-center">
          <ComingSoon title="Catalyst AI Assistant" />
        </TabsContent>
      </Tabs>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b bg-muted/30">
            <DialogTitle>Edit Matter</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-4">
            <MatterForm 
              initialData={matter} 
              onSuccess={() => {
                setIsEditOpen(false);
                router.refresh();
              }} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="text-center max-w-sm mx-auto py-12 px-6 bg-muted/20 border border-dashed rounded-xl">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Briefcase className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">
        This workspace feature is currently in development and will be available in the next release.
      </p>
    </div>
  );
}
