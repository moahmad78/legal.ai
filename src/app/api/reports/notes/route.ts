import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const userId = authUser?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { reportId, note } = await req.json();
    if (!reportId || !note) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("id, first_name, last_name")
      .eq("auth_user_id", userId)
      .single();

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { data: newNote, error } = await supabase
      .from("generated_report_notes")
      .insert({
        report_id: reportId,
        author_id: user.id,
        note: note
      })
      .select(`
        *,
        author:users(first_name, last_name)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ note: newNote });

  } catch (error: any) {
    console.error("Report Note Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

