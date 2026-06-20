import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { migrateGuestData } from "@/services/migration/migrate";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { guestSessionId } = await req.json();

    if (!guestSessionId) {
      return NextResponse.json({ error: "Missing guest session ID" }, { status: 400 });
    }

    const summary = await migrateGuestData(guestSessionId, userId);

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error: any) {
    console.error("Migration API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
