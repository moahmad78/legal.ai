"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import {  useAuth  } from "@/components/auth/AuthProvider";
import { toast } from "sonner";
import { Building2, Save, Loader2 } from "lucide-react";

export default function OrganizationSettingsPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState("viewer");
  
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    firm_type: "",
    gst_number: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    timezone: "Asia/Kolkata",
    date_format: "DD-MM-YYYY"
  });

  useEffect(() => {
    async function loadOrg() {
      if (!userId) return;
      const { data: user } = await supabase.from("users").select("id, active_organization_id").eq("auth_user_id", userId).single();
      if (!user?.active_organization_id) return;

      const { data: member } = await supabase.from("organization_members").select("role").eq("user_id", user.id).eq("organization_id", user.active_organization_id).single();
      if (member) setRole(member.role);

      const { data: org } = await supabase.from("organizations").select("*").eq("id", user.active_organization_id).single();
      if (org) {
        setFormData({
          id: org.id,
          name: org.name || "",
          firm_type: org.firm_type || "",
          gst_number: org.gst_number || "",
          email: org.email || "",
          phone: org.phone || "",
          website: org.website || "",
          address: org.address || "",
          timezone: org.timezone || "Asia/Kolkata",
          date_format: org.date_format || "DD-MM-YYYY"
        });
      }
      setLoading(false);
    }
    loadOrg();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (role !== 'owner' && role !== 'admin') {
      toast.error("Only Owners and Admins can update organization settings.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("organizations")
        .update({
          name: formData.name,
          firm_type: formData.firm_type,
          gst_number: formData.gst_number,
          email: formData.email,
          phone: formData.phone,
          website: formData.website,
          address: formData.address,
          timezone: formData.timezone,
          date_format: formData.date_format,
          updated_at: new Date().toISOString()
        })
        .eq("id", formData.id);

      if (error) throw error;
      
      // We can create a quick API call to log the audit event since this is a client component
      fetch("/api/organization/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updated_settings", details: formData })
      }).catch(console.error);

      toast.success("Organization settings updated successfully");
    } catch (e: any) {
      toast.error("Failed to update settings: " + e.message);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-12 text-center animate-pulse">Loading organization data...</div>;
  }

  const isReadOnly = role !== 'owner' && role !== 'admin';

  return (
    <div className="max-w-4xl space-y-6 pb-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organization Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your firm's details, tax information, and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Firm Details</CardTitle>
          <CardDescription>This information may appear on your generated reports and invoices.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input name="name" value={formData.name} onChange={handleChange} readOnly={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label>Firm Type</Label>
              <Input name="firm_type" placeholder="e.g. Law Firm, Solo Practitioner" value={formData.firm_type} onChange={handleChange} readOnly={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label>GST Number</Label>
              <Input name="gst_number" value={formData.gst_number} onChange={handleChange} readOnly={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input name="email" type="email" value={formData.email} onChange={handleChange} readOnly={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input name="phone" value={formData.phone} onChange={handleChange} readOnly={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input name="website" value={formData.website} onChange={handleChange} readOnly={isReadOnly} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Business Address</Label>
              <Input name="address" value={formData.address} onChange={handleChange} readOnly={isReadOnly} />
            </div>
            
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Input name="timezone" value={formData.timezone} onChange={handleChange} readOnly={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label>Date Format</Label>
              <Input name="date_format" value={formData.date_format} onChange={handleChange} readOnly={isReadOnly} />
            </div>
          </div>

          {!isReadOnly && (
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          )}
          {isReadOnly && (
            <div className="pt-4 border-t text-sm text-muted-foreground text-right">
              You must be an Admin or Owner to edit these settings.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

