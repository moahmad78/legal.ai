"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const clientSchema = z.object({
  client_type: z.string().min(1, "Client type is required"),
  client_name: z.string().min(1, "Client name is required"),
  company_name: z.string().optional(),
  contact_person: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  gst_number: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

export function ClientForm({
  initialData,
  onSuccess,
}: {
  initialData?: any;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData || {
      client_type: "Individual",
      client_name: "",
      company_name: "",
      contact_person: "",
      email: "",
      phone: "",
      gst_number: "",
      address: "",
      notes: "",
    },
  });

  const onSubmit = async (data: ClientFormValues) => {
    try {
      setIsLoading(true);
      const url = initialData
        ? `/api/clients/${initialData.id}`
        : "/api/clients";
      const method = initialData ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to save client");
      }

      toast.success(
        initialData
          ? "Client updated successfully"
          : "Client created successfully"
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Client Type</Label>
        <select
          {...register("client_type")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="Individual">Individual</option>
          <option value="Company">Company</option>
          <option value="Law Firm">Law Firm</option>
          <option value="Builder">Builder</option>
          <option value="Consultant">Consultant</option>
          <option value="Other">Other</option>
        </select>
        {errors.client_type && (
          <p className="text-sm text-red-500">{errors.client_type.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Client Name *</Label>
        <Input {...register("client_name")} placeholder="Enter client name" />
        {errors.client_name && (
          <p className="text-sm text-red-500">{errors.client_name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Company Name</Label>
          <Input {...register("company_name")} placeholder="Optional" />
        </div>
        <div className="space-y-2">
          <Label>Contact Person</Label>
          <Input {...register("contact_person")} placeholder="Optional" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input {...register("email")} type="email" placeholder="Optional" />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Phone Number</Label>
          <Input {...register("phone")} placeholder="Optional" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>GST Number</Label>
        <Input {...register("gst_number")} placeholder="Optional" />
      </div>

      <div className="space-y-2">
        <Label>Address</Label>
        <Textarea {...register("address")} placeholder="Optional" rows={3} />
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea {...register("notes")} placeholder="Optional" rows={3} />
      </div>

      <div className="pt-4 flex justify-end gap-2">
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
          {isLoading ? "Saving..." : "Save Client"}
        </Button>
      </div>
    </form>
  );
}
