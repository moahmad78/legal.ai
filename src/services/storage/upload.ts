import { createClient } from "@/lib/supabase/server";

export async function uploadFileToS3(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  guestSessionId: string,
  userId?: string | null
): Promise<{ key: string; url: string }> {
  // Sanitize filename: remove spaces and special characters
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const timestamp = Date.now();
  
  // Format path depending on authentication
  const key = userId 
    ? `users/${userId}/${timestamp}-${sanitizedName}`
    : `guest/${guestSessionId}/${timestamp}-${sanitizedName}`;

  const supabase = await createClient();
  
  const bucketName = "documents";
  console.log(`[Storage] Uploading - User: ${userId || 'guest'}, Bucket: ${bucketName}, Path: ${key}`);

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

  console.log(`[Storage] Upload success - Response:`, data);

  const { data: publicUrlData } = supabase.storage
    .from("documents")
    .getPublicUrl(key);

  return { key, url: publicUrlData.publicUrl };
}
