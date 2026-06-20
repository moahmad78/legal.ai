"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, Building, Mail, Phone, MoreHorizontal, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OverviewTab } from "./OverviewTab";
import { ClientForm } from "./ClientForm";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export function ClientProfile({ initialClient }: { initialClient: any }) {
  const [client, setClient] = useState(initialClient);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const router = useRouter();

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-xl font-semibold mb-2">Client not found</h2>
        <Link href="/clients">
          <Button variant="outline">Return to Clients</Button>
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this client?")) return;

    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete client");
      
      toast.success("Client deleted successfully");
      router.push("/clients");
    } catch (error) {
      toast.error("Failed to delete client");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-2">
        <Link href="/clients">
          <Button variant="ghost" size="sm" className="-ml-3 text-muted-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clients
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl shrink-0">
            {client.client_name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-heading">{client.client_name}</h1>
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/5 text-primary border-primary/20">
                {client.client_type}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
              {client.company_name && (
                <div className="flex items-center gap-1">
                  <Building className="h-3.5 w-3.5" /> {client.company_name}
                </div>
              )}
              {client.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> {client.email}
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {client.phone}
                </div>
              )}
            </div>
            
            <div className="mt-3 text-xs text-muted-foreground">
              Added on {format(new Date(client.created_at), "MMMM d, yyyy")}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:bg-red-50 focus:text-red-600">
                <Trash className="mr-2 h-4 w-4" /> Delete Client
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
          <TabsTrigger value="matters" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-6 h-full font-medium">
            Matters
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-6 h-full font-medium">
            Documents
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-6 h-full font-medium">
            Reports
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-6 h-full font-medium">
            Tasks
          </TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-6 h-full font-medium">
            Timeline
          </TabsTrigger>
          <TabsTrigger value="communication" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-6 h-full font-medium">
            Communication
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 outline-none">
          <OverviewTab client={client} />
        </TabsContent>

        <TabsContent value="matters" className="mt-0 pt-8 outline-none flex justify-center">
          <ComingSoon title="Matter Management" />
        </TabsContent>

        <TabsContent value="documents" className="mt-0 pt-8 outline-none flex justify-center">
          <ComingSoon title="Document Vault" />
        </TabsContent>
        
        <TabsContent value="reports" className="mt-0 pt-8 outline-none flex justify-center">
          <ComingSoon title="Client Reports" />
        </TabsContent>

        <TabsContent value="tasks" className="mt-0 pt-8 outline-none flex justify-center">
          <ComingSoon title="Task Tracking" />
        </TabsContent>

        <TabsContent value="timeline" className="mt-0 pt-8 outline-none flex justify-center">
          <ComingSoon title="Client Timeline" />
        </TabsContent>

        <TabsContent value="communication" className="mt-0 pt-8 outline-none flex justify-center">
          <ComingSoon title="Communication Log" />
        </TabsContent>
      </Tabs>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b bg-muted/30">
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-4">
            <ClientForm 
              initialData={client} 
              onSuccess={() => {
                setIsEditOpen(false);
                router.refresh();
                // Optionally update local state here if not relying purely on server component refresh
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
        <Building className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">
        This feature is currently in development and will be available in the upcoming Matter Management release.
      </p>
    </div>
  );
}
