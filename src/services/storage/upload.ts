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
  
  const bucketName = "documents";
  console.log(`[Storage] Attempting upload to bucket: ${bucketName}, key: ${key}`);

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(key, fileBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error(`[Storage] Upload failed for bucket ${bucketName}:`, error);
    throw new Error(`Storage upload failed: ${error.message} (Bucket: ${bucketName})`);
  }

  const { data: publicUrlData } = supabase.storage
    .from("documents")
    .getPublicUrl(key);

  return { key, url: publicUrlData.publicUrl };
}
