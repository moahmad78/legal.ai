import { createClient } from "@/lib/supabase/server";

export async function logAudit(
  organizationId: string, 
  actorId: string | null, 
  action: string, 
  entity: string, 
  details?: Record<string, any>
) {
  const supabase = await createClient();
  await supabase.from("audit_logs").insert({
    organization_id: organizationId,
    actor_id: actorId,
    action,
    entity,
    details
  });
}
