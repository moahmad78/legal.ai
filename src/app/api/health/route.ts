import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const timestamp = new Date().toISOString();
  
  try {
    const supabase = await createClient();
    
    // Check DB connectivity
    const { error: dbError } = await supabase.from("users").select("id").limit(1);
    
    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    return NextResponse.json({
      status: "ok",
      timestamp,
      services: {
        database: "connected",
        storage: "ok", // Storage is abstracted, assuming OK if app is up
        ai: "ok" // AI is stateless, assuming OK
      }
    });
  } catch (error: any) {
    console.error("Health Check Failed:", error);
    return NextResponse.json({
      status: "error",
      timestamp,
      message: "One or more services are down",
      services: {
        database: "error",
        storage: "unknown",
        ai: "unknown"
      }
    }, { status: 503 });
  }
}
