"use client";

import { useEffect, useState } from "react";
import {  useAuth  } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Users, Mail, Trash2, ShieldCheck, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function TeamManagementPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const supabase = createClient();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("viewer");
  const [orgId, setOrgId] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("associate");
  const [inviting, setInviting] = useState(false);

  async function loadTeam() {
    if (!userId) return;
    const { data: user } = await supabase.from("users").select("id, active_organization_id").eq("auth_user_id", userId).single();
    if (!user?.active_organization_id) return;
    
    setOrgId(user.active_organization_id);

    const { data: currentMember } = await supabase.from("organization_members").select("role").eq("user_id", user.id).eq("organization_id", user.active_organization_id).single();
    if (currentMember) setRole(currentMember.role);

    const { data: orgMembers } = await supabase
      .from("organization_members")
      .select("*, user:users(full_name, email)")
      .eq("organization_id", user.active_organization_id)
      .order("created_at", { ascending: false });
    
    if (orgMembers) setMembers(orgMembers);
    setLoading(false);
  }

  useEffect(() => {
    loadTeam();
  }, [userId]);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !orgId) return;
    setInviting(true);

    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole, organizationId: orgId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success("Invitation sent to " + inviteEmail);
      setInviteEmail("");
      loadTeam();
    } catch (e: any) {
      toast.error(e.message);
    }
    setInviting(false);
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      await supabase.from("organization_members").delete().eq("id", memberId);
      toast.success("Member removed");
      loadTeam();
    } catch (e) {
      toast.error("Failed to remove member");
    }
  };

  if (loading) return <div className="p-12 text-center animate-pulse">Loading team...</div>;

  const canManage = role === 'owner' || role === 'admin';

  return (
    <div className="max-w-5xl space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
        <p className="text-muted-foreground mt-1">Manage who has access to your organization's matters and documents.</p>
      </div>

      {canManage && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Mail className="h-5 w-5" /> Invite New Member</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="space-y-2 flex-1">
                <Label>Email Address</Label>
                <Input placeholder="lawyer@firm.com" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
              </div>
              <div className="space-y-2 w-full md:w-64">
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={(val) => val && setInviteRole(val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="lawyer">Lawyer</SelectItem>
                    <SelectItem value="associate">Associate</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleInvite} disabled={inviting || !inviteEmail}>
                {inviting ? "Sending..." : "Send Invite"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Active Team Members</CardTitle>
          <CardDescription>Members currently assigned to your organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map(member => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground uppercase">
                    {(member.user?.full_name || member.email || "?")[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{member.user?.full_name || member.email}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span className="capitalize">{member.role}</span>
                      <span>•</span>
                      {member.status === 'active' ? (
                        <span className="flex items-center gap-1 text-green-600 font-medium"><ShieldCheck className="h-3 w-3" /> Active</span>
                      ) : (
                        <span className="flex items-center gap-1 text-orange-500 font-medium"><Clock className="h-3 w-3" /> Pending</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {canManage && member.role !== 'owner' && (
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleRemove(member.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

