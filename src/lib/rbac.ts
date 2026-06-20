// rbac.ts
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type Role = "owner" | "admin" | "lawyer" | "associate" | "viewer";

const ROLE_HIERARCHY: Record<Role, number> = {
  owner: 50,
  admin: 40,
  lawyer: 30,
  associate: 20,
  viewer: 10,
};

export async function requireOrganizationMembership(requiredRole: Role = "viewer") {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  const userId = authUser?.id;
  if (!userId) redirect("/sign-in");

  const { data: user } = await supabase
    .from("users")
    .select("id, active_organization_id, is_superadmin")
    .eq("auth_user_id", userId)
    .single();

  if (!user) redirect("/sign-in");

  if (user.is_superadmin) {
    return { user, role: "owner" as Role, organizationId: user.active_organization_id };
  }

  if (!user.active_organization_id) {
    // If no active organization, create one automatically
    // To satisfy "solo advocates", we auto-provision a default firm
    const { data: org } = await supabase
      .from("organizations")
      .insert({ name: "My Legal Firm" })
      .select()
      .single();
      
    if (org) {
      await supabase.from("organization_members").insert({
        organization_id: org.id,
        user_id: user.id,
        role: "owner",
        status: "active"
      });
      await supabase.from("users").update({ active_organization_id: org.id }).eq("auth_user_id", user.id);
      user.active_organization_id = org.id;
      return { user, role: "owner" as Role, organizationId: org.id };
    }
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("role, status")
    .eq("user_id", user.id)
    .eq("organization_id", user.active_organization_id)
    .single();

  if (!membership || membership.status !== "active") {
    // Has an org set, but lost membership? Clear it out.
    await supabase.from("users").update({ active_organization_id: null }).eq("auth_user_id", user.id);
    redirect("/"); 
  }

  const userRole = membership.role as Role;

  if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[requiredRole]) {
    redirect("/dashboard?error=unauthorized");
  }

  return { user, role: userRole, organizationId: user.active_organization_id };
}

export function hasPermission(currentRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[currentRole] >= ROLE_HIERARCHY[requiredRole];
}

