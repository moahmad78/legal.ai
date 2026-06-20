import { createClient } from "@/lib/supabase/server";

export async function uploadFileToS3(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  guestSessionId: string
): Promise<{ key: string; url: string }> {
  // Sanitize filename: remove spaces and special characters
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const timestamp = Date.now();
  const key = `guest/${guestSessionId}/${timestamp}-${sanitizedName}`;

  const supabase = await createClient();
  
  const { data, error } = await supabase.storage
    .from("documents")
    .upload(key, fileBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from("documents")
    .getPublicUrl(key);

  return { key, url: publicUrlData.publicUrl };
}
