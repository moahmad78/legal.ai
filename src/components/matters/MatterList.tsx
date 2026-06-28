"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Search, Plus, MoreVertical, Edit, Archive, Briefcase, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MatterForm } from "./MatterForm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {  useAuth  } from "@/components/auth/AuthProvider";
import { useModalStore } from "@/store/modal-store";

export function MatterList({ initialMatters }: { initialMatters: any[] }) {
  const [matters, setMatters] = useState(initialMatters);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMatter, setEditingMatter] = useState<any>(null);
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id;
  const { openSignupModal } = useModalStore();

  const handleAddMatter = () => {
    if (!userId) {
      openSignupModal({
        title: "Create Matter",
        message: "Create a free account to manage your legal matters and link documents directly."
      });
      return;
    }
    setIsAddOpen(true);
  };

  const filteredMatters = matters.filter((m) => {
    const matchesSearch = 
      m.matter_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.client?.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.matter_type?.toLowerCase().includes(search.toLowerCase()) ||
      m.assigned_to?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || m.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || m.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority && !m.is_archived;
  });

  const handleArchive = async (id: string) => {
    if (!confirm("Are you sure you want to archive this matter?")) return;

    try {
      const res = await fetch(`/api/matters/${id}`, {
        method: "DELETE", // Our delete is soft-delete/archive
      });
      if (!res.ok) throw new Error("Failed to archive matter");
      
      setMatters(matters.map(m => m.id === id ? { ...m, is_archived: true } : m));
      toast.success("Matter archived successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to archive matter");
    }
  };

  const handleEdit = (matter: any) => {
    setEditingMatter(matter);
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-1 flex-col sm:flex-row w-full gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search matters..."
              className="pl-9 bg-background shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm flex-shrink-0"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Under Review">Under Review</option>
              <option value="Completed">Completed</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm flex-shrink-0"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
        
        <Button onClick={handleAddMatter} className="shadow-sm whitespace-nowrap">
          <Plus className="mr-2 h-4 w-4" /> Create Matter
        </Button>
      </div>

      {filteredMatters.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-background border-dashed">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No matters found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {search || statusFilter !== "All" || priorityFilter !== "All" 
              ? "No matters match your filters." 
              : "Get started by creating your first matter."}
          </p>
          {!(search || statusFilter !== "All" || priorityFilter !== "All") && (
            <Button onClick={handleAddMatter}>
              <Plus className="mr-2 h-4 w-4" /> Create Matter
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-xl border bg-background shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground border-b uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3 font-medium">Matter Name</th>
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 font-medium">Priority</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Assigned</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredMatters.map((matter) => (
                    <tr key={matter.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-4 py-3">
                        <Link href={`/matters/${matter.id}`} className="font-medium cursor-pointer hover:underline block truncate max-w-[200px]">
                          {matter.matter_name}
                        </Link>
                        <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">
                          {matter.matter_type}
                        </div>
                      </td>
                      <td className="px-4 py-3 truncate max-w-[150px]">
                        {matter.client?.client_name || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${priorityColors[matter.priority] || "bg-gray-100 text-gray-800"}`}>
                          {matter.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${statusColors[matter.status] || "bg-gray-100 text-gray-800"}`}>
                          {matter.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 truncate max-w-[120px]">
                        {matter.assigned_to || <span className="text-muted-foreground text-xs italic">Unassigned</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem render={<Link href={`/matters/${matter.id}`} />}>
                                <Briefcase className="mr-2 h-4 w-4" /> View Matter
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(matter)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleArchive(matter.id)} className="text-orange-600 focus:bg-orange-50 focus:text-orange-600">
                              <Archive className="mr-2 h-4 w-4" /> Archive Matter
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredMatters.map((matter) => (
              <Card key={matter.id} className="p-4 flex flex-col gap-3 relative hover:shadow-md transition-shadow">
                <div className="absolute top-4 right-4 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem render={<Link href={`/matters/${matter.id}`} />}>
                        <Briefcase className="mr-2 h-4 w-4" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(matter)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleArchive(matter.id)} className="text-orange-600 focus:bg-orange-50 focus:text-orange-600">
                        <Archive className="mr-2 h-4 w-4" /> Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="pr-8">
                  <Link href={`/matters/${matter.id}`} className="font-semibold block hover:underline">
                    {matter.matter_name}
                  </Link>
                  <div className="text-xs text-muted-foreground mt-1">
                    {matter.client?.client_name || "Unknown Client"}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusColors[matter.status] || "bg-gray-100 text-gray-800"}`}>
                    {matter.status}
                  </span>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${priorityColors[matter.priority] || "bg-gray-100 text-gray-800"}`}>
                    {matter.priority}
                  </span>
                  <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full border">
                    {matter.matter_type}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b bg-muted/30">
            <DialogTitle>Create New Matter</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-4">
            <MatterForm onSuccess={() => {
              setIsAddOpen(false);
              // Refetch by refreshing page, or relying on router.refresh() inside MatterForm
              // We'll let Next.js refresh handle it
            }} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingMatter} onOpenChange={(open) => !open && setEditingMatter(null)}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b bg-muted/30">
            <DialogTitle>Edit Matter</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-4">
            {editingMatter && (
              <MatterForm 
                initialData={editingMatter} 
                onSuccess={() => {
                  setEditingMatter(null);
                  router.refresh();
                }} 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
