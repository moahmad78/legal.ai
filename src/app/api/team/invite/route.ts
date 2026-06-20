import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const userId = authUser?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email, role, organizationId } = await req.json();
    if (!email || !role || !organizationId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Verify sender is admin or owner
    const { data: user } = await supabase.from("users").select("id").eq("id", userId).single();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("organization_id", organizationId)
      .single();

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // See if user already exists
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).maybeSingle();

    // Create membership record
    const { data: newMember, error } = await supabase
      .from("organization_members")
      .insert({
        organization_id: organizationId,
        user_id: existingUser?.id || null,
        email: email,
        role: role,
        status: existingUser ? "active" : "pending"
      })
      .select()
      .single();

    if (error) throw error;

    await logAudit(
      organizationId,
      user.id,
      "invited_member",
      "organization_members",
      { email, role }
    );

    // Ideally here we would send an email using SendGrid or Resend
    // await sendEmail(email, "You have been invited to Catalyst Legal AI");

    return NextResponse.json({ success: true, member: newMember });

  } catch (error: any) {
    console.error("Invite Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
