import { NextRequest } from "next/server";
import { uploadFileToS3 } from "@/services/storage/upload";
import { env } from "@/lib/env";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/services/storage/types";
import { createClient } from "@/lib/supabase/server";
import { globalRateLimiter } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    await globalRateLimiter.check(20, ip);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    let guestSessionId = formData.get("guest_session_id") as string | null;

    if (!file) {
      return Response.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    if (!guestSessionId) {
      guestSessionId = crypto.randomUUID();
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return Response.json({ success: false, error: "File type not supported" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ success: false, error: "File exceeds 20MB limit" }, { status: 400 });
    }

    const storageConfigured = !!(
      env.NEXT_PUBLIC_SUPABASE_URL &&
      env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );
    const isDevelopmentStorage = process.env.NODE_ENV === "development" && !storageConfigured;

    if (isDevelopmentStorage) {
      if (process.env.NODE_ENV === "development") {
        console.log("[DEBUG Upload] Storage unconfigured in development. Simulating successful upload.");
      }
      return Response.json({
        success: true,
        document_id: `demo_${Date.now()}`,
        status: "uploaded",
        developmentMode: true
      });
    }

    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const userId = authUser?.id;

    if (!userId) {
      // Guest limits are handled purely client-side via sessionStorage
    }

    if (userId) {
      console.log(`[DB User Lookup] Skipping public.users lookup. Using Auth UID directly: ${userId}`);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    const { key, url } = await uploadFileToS3(buffer, file.name, file.type, guestSessionId, userId, userId);

    const insertPayload = {
      user_id: userId || null,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_path: url,
      storage_key: key,
      upload_status: "uploaded",
    };

    const { data: schemaCheck } = await supabase.from("documents").select("*").limit(1);
    console.log(`[DB Insert Audit]`);
    console.log(`- Actual documents schema (columns):`, schemaCheck && schemaCheck.length > 0 ? Object.keys(schemaCheck[0]).join(", ") : "Table empty or missing");
    console.log(`- Table: documents`);
    console.log(`- Auth User ID: ${userId || 'null (guest)'}`);
    console.log(`- Insert Payload:`, insertPayload);

    // Store in Supabase
    const { data: document, error } = await supabase
      .from("documents")
      .insert(insertPayload)
      .select()
      .single();

    console.log(`- Insert Response:`, document);
    console.log(`- Insert Error:`, error);

    if (error) {
      console.error("Supabase insert error details:", error);
      return Response.json({ 
        success: false, 
        error: "Failed to record document in database: " + error.message,
        details: error 
      }, { status: 500 });
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[DEBUG Upload] File saved to Supabase with ID:", document.id);
    }

    // Increment usage log if authenticated (assuming free default for now)
    if (userId) {
      const { incrementFreeDocument } = await import("@/lib/free-tracking");
      await incrementFreeDocument();
    }

    return Response.json({
      success: true,
      document_id: document.id,
      metadata: {
        url,
        key,
        size: file.size,
        type: file.type,
        name: file.name,
      },
      status: document.upload_status,
    });
  } catch (error: any) {
    console.error("Upload API error:", error);
    
    if (process.env.NODE_ENV === "development") {
      console.log("[DEBUG Upload] Error details:", error.message || String(error));
    }

    return Response.json(
      { 
        success: false, 
        error: error.message || "Internal server error during upload" 
      }, 
      { status: 500 }
    );
  }
}

