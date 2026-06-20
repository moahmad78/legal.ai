"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Search, MoreVertical, Edit, Trash, Building, User, FileText, Activity, AlertTriangle, MessageSquare, ArrowRight, FileSignature } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {  useAuth  } from "@/components/auth/AuthProvider";
import { useModalStore } from "@/store/modal-store";
import { ClientWizard } from "./ClientWizard";
import { Badge } from "@/components/ui/badge";

export function ClientList({ initialClients }: { initialClients: any[] }) {
  const [clients, setClients] = useState(initialClients);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id;
  const { openSignupModal } = useModalStore();

  const filteredClients = clients.filter(
    (c) =>
      c.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.contact_person?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;

    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete client");
      
      setClients(clients.filter((c) => c.id !== id));
      toast.success("Client deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete client");
    }
  };

  const getRiskColor = (risk: string) => {
    switch(risk?.toLowerCase()) {
      case 'high': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'low': return 'bg-green-500/10 text-green-600 border-green-500/20';
      default: return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background p-4 rounded-xl border shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients, organizations, contacts..."
            className="pl-9 border-none shadow-none focus-visible:ring-0 bg-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="shrink-0 flex items-center">
          {userId ? (
            <ClientWizard />
          ) : (
            <Button onClick={() => openSignupModal({
              title: "Manage Clients",
              message: "Create a free account to manage your clients, store matters, and organize documents."
            })}>
              Add Client
            </Button>
          )}
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center border rounded-xl bg-background border-dashed">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Building className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No clients found</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            {search ? "No clients match your search criteria. Try a different term." : "Get started by building your client intelligence workspace."}
          </p>
          {!search && userId && <ClientWizard />}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card key={client.id} className="group hover:shadow-md transition-all duration-300 border-border/50 hover:border-primary/30 flex flex-col">
              <CardHeader className="pb-3 flex flex-row items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] uppercase font-semibold tracking-wider">
                      {client.client_type}
                    </Badge>
                    <Badge variant="outline" className={`text-[10px] uppercase font-semibold tracking-wider ${getRiskColor(client.risk_status || 'Medium')}`}>
                      Risk: {client.risk_status || 'Medium'}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold cursor-pointer hover:text-primary transition-colors mt-2" onClick={() => router.push(`/clients/${client.id}`)}>
                    {client.client_name}
                  </CardTitle>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <User className="h-3 w-3" /> Client since {client.client_since ? format(new Date(client.client_since), "MMM yyyy") : format(new Date(client.created_at), "MMM yyyy")}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <div className="h-8 w-8 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hover:bg-muted cursor-pointer">
                      <MoreVertical className="h-4 w-4" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => router.push(`/clients/${client.id}`)}>
                      <Activity className="mr-2 h-4 w-4" /> Open Workspace
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600" onClick={() => handleDelete(client.id)}>
                      <Trash className="mr-2 h-4 w-4" /> Delete Client
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              
              <CardContent className="pb-4 flex-1">
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm mt-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-8 w-8 rounded-md bg-primary/5 flex items-center justify-center shrink-0">
                      <FileSignature className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{(client.matters_count || 0)}</div>
                      <div className="text-[10px] uppercase tracking-wider">Matters</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-8 w-8 rounded-md bg-blue-500/5 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{(client.documents_count || 0)}</div>
                      <div className="text-[10px] uppercase tracking-wider">Documents</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-8 w-8 rounded-md bg-purple-500/5 flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{(client.reports_count || 0)}</div>
                      <div className="text-[10px] uppercase tracking-wider">Reports</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-8 w-8 rounded-md bg-emerald-500/5 flex items-center justify-center shrink-0">
                      <MessageSquare className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{(client.conversations_count || 0)}</div>
                      <div className="text-[10px] uppercase tracking-wider">AI Chats</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-4 border-t bg-muted/10 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Activity: {client.last_activity_date ? format(new Date(client.last_activity_date), "MMM d, h:mm a") : "No recent activity"}
                </div>
                <Button variant="ghost" size="sm" className="h-8 text-primary hover:bg-primary/10 hover:text-primary" onClick={() => router.push(`/clients/${client.id}`)}>
                  Workspace <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
