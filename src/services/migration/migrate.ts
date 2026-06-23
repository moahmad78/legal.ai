import { createClient } from "@/lib/supabase/server";
import { MigrationSummary } from "./types";

export async function migrateGuestData(
  guestSessionId: string,
  userId: string
): Promise<MigrationSummary> {
  const supabase = await createClient();

  const dbUserId = userId; // Bypass users table, use auth userId directly

  // Find guest documents
  const { data: documents, error: docFetchError } = await supabase
    .from("documents")
    .select("id")
    .eq("guest_session_id", guestSessionId);

  if (docFetchError) {
    throw new Error("Failed to fetch guest documents");
  }

  const migratedDocumentsCount = documents?.length || 0;

  if (migratedDocumentsCount > 0) {
    // Update documents to assign user_id and remove guest_session_id
    const { error: updateError } = await supabase
      .from("documents")
      .update({
        user_id: dbUserId,
        guest_session_id: null,
      })
      .eq("guest_session_id", guestSessionId);

    if (updateError) {
      throw new Error("Failed to migrate guest documents to user");
    }
  }

  // Reports and Chat Messages are linked via document_id, 
  // so they automatically follow the document ownership.
  // We can count them for the summary.
  let migratedReportsCount = 0;
  let migratedChatsCount = 0;

  if (migratedDocumentsCount > 0) {
    const documentIds = documents!.map((d: any) => d.id);
    
    const { count: reportsCount } = await supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .in("document_id", documentIds);
      
    migratedReportsCount = reportsCount || 0;

    const { count: chatsCount } = await supabase
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .in("document_id", documentIds);

    migratedChatsCount = chatsCount || 0;
  }

  return {
    migratedDocuments: migratedDocumentsCount,
    migratedReports: migratedReportsCount,
    migratedChats: migratedChatsCount,
  };
}

