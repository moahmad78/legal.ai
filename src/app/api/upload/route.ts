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
    let internalUserId = null;
    let userPlan = null;

    if (!userId) {
      // Guest limits are handled purely client-side via sessionStorage
    }

    if (userId) {
      // Find internal Supabase user
      const { data: userRecord } = await supabase.from("users").select("id, plan").eq("auth_user_id", userId).single();
      
      if (userRecord) {
        internalUserId = userRecord.id;
        userPlan = userRecord.plan;

        // Check usage limits if on free plan
        if (userRecord.plan === "free") {
          const { getFreeUsage } = await import("@/lib/free-tracking");
          const usageLog = await getFreeUsage();

          if (usageLog && usageLog.document_count >= 3) {
            return Response.json({ success: false, error: "Free plan limit reached", code: "FREE_LIMIT" }, { status: 403 });
          }
        }
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    const { key, url } = await uploadFileToS3(buffer, file.name, file.type, guestSessionId);

    // Store in Supabase
    const { data: document, error } = await supabase
      .from("documents")
      .insert({
        guest_session_id: internalUserId ? null : guestSessionId,
        user_id: internalUserId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_url: url,
        storage_key: key,
        status: "uploaded",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return Response.json({ success: false, error: "Failed to record document in database" }, { status: 500 });
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[DEBUG Upload] File saved to Supabase with ID:", document.id);
    }

    // Increment usage log if authenticated
    if (internalUserId && userPlan === "free") {
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
      status: document.status,
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

