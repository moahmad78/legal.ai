"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const matterSchema = z.object({
  matter_name: z.string().min(1, "Matter name is required"),
  client_id: z.string().min(1, "Client is required"),
  matter_type: z.string().min(1, "Matter type is required"),
  priority: z.string().min(1, "Priority is required"),
  status: z.string().min(1, "Status is required"),
  description: z.string().optional(),
  internal_notes: z.string().optional(),
  assigned_to: z.string().optional(),
  due_date: z.string().optional(),
});

type MatterFormValues = z.infer<typeof matterSchema>;

export function MatterForm({
  initialData,
  onSuccess,
}: {
  initialData?: any;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch("/api/clients");
        if (res.ok) {
          const data = await res.json();
          setClients(data.clients || []);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchClients();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MatterFormValues>({
    resolver: zodResolver(matterSchema),
    defaultValues: initialData || {
      matter_name: "",
      client_id: "",
      matter_type: "Contract Review",
      priority: "Medium",
      status: "Open",
      description: "",
      internal_notes: "",
      assigned_to: "",
      due_date: "",
    },
  });

  const onSubmit = async (data: MatterFormValues) => {
    try {
      setIsLoading(true);
      
      const payload = { ...data };
      if (payload.due_date) {
        payload.due_date = new Date(payload.due_date).toISOString();
      } else {
        delete payload.due_date;
      }

      const url = initialData
        ? `/api/matters/${initialData.id}`
        : "/api/matters";
      const method = initialData ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save matter");
      }

      toast.success(
        initialData
          ? "Matter updated successfully"
          : "Matter created successfully"
      );
      
      router.refresh();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 hide-scrollbar">
      <div className="space-y-2">
        <Label>Matter Name *</Label>
        <Input {...register("matter_name")} placeholder="e.g. Acme Corp Lease Agreement" />
        {errors.matter_name && (
          <p className="text-sm text-red-500">{errors.matter_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Client *</Label>
        <select
          {...register("client_id")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select a Client...</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.client_name}</option>
          ))}
        </select>
        {errors.client_id && (
          <p className="text-sm text-red-500">{errors.client_id.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Matter Type *</Label>
          <select
            {...register("matter_type")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="Contract Review">Contract Review</option>
            <option value="Property Verification">Property Verification</option>
            <option value="Due Diligence">Due Diligence</option>
            <option value="Employment">Employment</option>
            <option value="Compliance">Compliance</option>
            <option value="Litigation">Litigation</option>
            <option value="Corporate Advisory">Corporate Advisory</option>
            <option value="Other">Other</option>
          </select>
          {errors.matter_type && (
            <p className="text-sm text-red-500">{errors.matter_type.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label>Priority *</Label>
          <select
            {...register("priority")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Status *</Label>
          <select
            {...register("status")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Review">Under Review</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <Label>Due Date</Label>
          <Input type="date" {...register("due_date")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Assigned To</Label>
        <Input {...register("assigned_to")} placeholder="e.g. Jane Doe" />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea {...register("description")} placeholder="Brief description of the matter" rows={3} />
      </div>

      <div className="space-y-2">
        <Label>Internal Notes</Label>
        <Textarea {...register("internal_notes")} placeholder="Private notes for your team" rows={2} />
      </div>

      <div className="pt-4 flex justify-end gap-2 sticky bottom-0 bg-background pb-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (onSuccess) onSuccess();
          }}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Matter"}
        </Button>
      </div>
    </form>
  );
}
