"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {  useAuth  } from "@/components/auth/AuthProvider";
import { Plus, ArrowRight, ArrowLeft, Check, User, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

const clientSchema = z.object({
  client_type: z.enum(["individual", "organization"]),
  client_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  alternate_phone: z.string().optional(),
  occupation: z.string().optional(),
  date_of_birth: z.string().optional(),
  pan_number: z.string().optional(),
  aadhaar_number: z.string().optional(),
  gst_number: z.string().optional(),
  registration_number: z.string().optional(),
  address_line_1: z.string().optional(),
  address_line_2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pin_code: z.string().optional(),
  country: z.string().optional(),
  emergency_contact_person: z.string().optional(),
  emergency_relationship: z.string().optional(),
  emergency_phone: z.string().optional(),
  emergency_email: z.string().optional(),
  preferred_communication: z.string().optional(),
  special_instructions: z.string().optional(),
  internal_notes: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

export function ClientWizard() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const userId = user?.id;
  const router = useRouter();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      client_type: "individual",
      preferred_communication: "email",
    },
  });

  const nextStep = async () => {
    // Validate current step before proceeding
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ["client_type"];
    if (step === 2) fieldsToValidate = ["client_name", "email", "phone"];
    
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) setStep((s) => Math.min(s + 1, 7));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const onSubmit = async (data: ClientFormValues) => {
    if (!userId) return;
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const orgId = userId; // Fallback to userId

      const { data: newClient, error } = await supabase
        .from("clients")
        .insert({
          organization_id: orgId,
          client_type: data.client_type,
          client_name: data.client_name,
          email: data.email || null,
          phone: data.phone || null,
          alternate_phone: data.alternate_phone || null,
          occupation: data.occupation || null,
          date_of_birth: data.date_of_birth || null,
          pan_number: data.pan_number || null,
          aadhaar_number: data.aadhaar_number || null,
          gst_number: data.gst_number || null,
          registration_number: data.registration_number || null,
          address_line_1: data.address_line_1 || null,
          address_line_2: data.address_line_2 || null,
          city: data.city || null,
          state: data.state || null,
          pin_code: data.pin_code || null,
          country: data.country || null,
          emergency_contact_person: data.emergency_contact_person || null,
          emergency_relationship: data.emergency_relationship || null,
          emergency_phone: data.emergency_phone || null,
          emergency_email: data.emergency_email || null,
          created_by: userId,
        })
        .select()
        .single();

      if (error) throw error;

      // Insert preferences
      if (newClient) {
        await supabase.from("client_preferences").insert({
          client_id: newClient.id,
          preferred_communication: data.preferred_communication || "email",
          special_instructions: data.special_instructions || null,
          internal_notes: data.internal_notes || null,
        });

        // Insert timeline event
        await supabase.from("client_timeline").insert({
          client_id: newClient.id,
          event_type: "client_created",
          description: "Client Workspace created",
          user_id: userId,
        });
      }

      toast.success("Client created successfully");
      setOpen(false);
      setStep(1);
      form.reset();
      router.push(`/clients/${newClient.id}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create client");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clientType = form.watch("client_type");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        <div className="px-6 py-4 border-b">
          <DialogTitle>Create New Client</DialogTitle>
          <DialogDescription>
            Step {step} of 7: {
              step === 1 ? "Client Type" :
              step === 2 ? "Basic Information" :
              step === 3 ? "Identification" :
              step === 4 ? "Address" :
              step === 5 ? "Emergency Contact" :
              step === 6 ? "Preferences" : "Review & Save"
            }
          </DialogDescription>
          {/* Progress Bar */}
          <div className="w-full bg-muted h-2 mt-4 rounded-full overflow-hidden">
            <div className="bg-primary h-full transition-all duration-300" style={{ width: `${(step / 7) * 100}%` }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {step === 1 && (
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`border-2 rounded-xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors ${clientType === 'individual' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                  onClick={() => form.setValue("client_type", "individual")}
                >
                  <User className="h-12 w-12 text-primary" />
                  <span className="font-semibold text-lg">Individual</span>
                </div>
                <div 
                  className={`border-2 rounded-xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors ${clientType === 'organization' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                  onClick={() => form.setValue("client_type", "organization")}
                >
                  <Building2 className="h-12 w-12 text-primary" />
                  <span className="font-semibold text-lg">Organization</span>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name / Organization Name <span className="text-destructive">*</span></Label>
                  <Input {...form.register("client_name")} placeholder="John Doe" />
                  {form.formState.errors.client_name && <p className="text-xs text-destructive">{form.formState.errors.client_name.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input {...form.register("email")} type="email" placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input {...form.register("phone")} placeholder="+91 9876543210" />
                  </div>
                  <div className="space-y-2">
                    <Label>Alternate Phone</Label>
                    <Input {...form.register("alternate_phone")} />
                  </div>
                  <div className="space-y-2">
                    <Label>{clientType === 'individual' ? 'Occupation' : 'Industry'}</Label>
                    <Input {...form.register("occupation")} />
                  </div>
                  {clientType === 'individual' && (
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input {...form.register("date_of_birth")} type="date" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>PAN Number</Label>
                    <Input {...form.register("pan_number")} className="uppercase" />
                  </div>
                  <div className="space-y-2">
                    <Label>GST Number</Label>
                    <Input {...form.register("gst_number")} className="uppercase" />
                  </div>
                  {clientType === 'individual' && (
                    <div className="space-y-2">
                      <Label>Aadhaar Number</Label>
                      <Input {...form.register("aadhaar_number")} />
                    </div>
                  )}
                  {clientType === 'organization' && (
                    <div className="space-y-2">
                      <Label>Registration Number (CIN)</Label>
                      <Input {...form.register("registration_number")} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Address Line 1</Label>
                  <Input {...form.register("address_line_1")} />
                </div>
                <div className="space-y-2">
                  <Label>Address Line 2</Label>
                  <Input {...form.register("address_line_2")} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input {...form.register("city")} />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input {...form.register("state")} />
                  </div>
                  <div className="space-y-2">
                    <Label>PIN Code</Label>
                    <Input {...form.register("pin_code")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input {...form.register("country")} defaultValue="India" />
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Contact Person</Label>
                    <Input {...form.register("emergency_contact_person")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Relationship</Label>
                    <Input {...form.register("emergency_relationship")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input {...form.register("emergency_phone")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input {...form.register("emergency_email")} />
                  </div>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Preferred Communication</Label>
                  <Controller
                    control={form.control}
                    name="preferred_communication"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="meeting">In-Person Meeting</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Special Instructions</Label>
                  <Textarea {...form.register("special_instructions")} placeholder="Client preferences, availability..." />
                </div>
                <div className="space-y-2">
                  <Label>Internal Notes</Label>
                  <Textarea {...form.register("internal_notes")} placeholder="Private notes for the firm..." />
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="space-y-4 text-sm">
                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium capitalize">{form.getValues("client_type")}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{form.getValues("client_name")}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{form.getValues("email") || "-"}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{form.getValues("phone") || "-"}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">PAN/GST:</span>
                    <span className="font-medium uppercase">{form.getValues("pan_number") || "-"} / {form.getValues("gst_number") || "-"}</span>
                  </div>
                </div>
                <p className="text-muted-foreground text-center pt-2">Please review the details. You can edit them later from the Client Workspace.</p>
              </div>
            )}
          </form>
        </div>

        <div className="px-6 py-4 border-t bg-muted/10 flex justify-between items-center">
          <Button variant="outline" onClick={prevStep} disabled={step === 1 || isSubmitting}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          
          {step < 7 ? (
            <Button onClick={nextStep}>
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Save Workspace"} <Check className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
