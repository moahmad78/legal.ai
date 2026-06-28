"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function renameChat(chatId: string, newTitle: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("assistant_conversations")
    .update({ title: newTitle, updated_at: new Date().toISOString() })
    .eq("id", chatId)
    .eq("organization_id", userId);

  if (error) throw new Error("Failed to rename chat");
  revalidatePath("/");
  return { success: true };
}

export async function togglePinChat(chatId: string, isPinned: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("assistant_conversations")
    .update({ is_pinned: isPinned, updated_at: new Date().toISOString() })
    .eq("id", chatId)
    .eq("organization_id", userId);

  if (error) throw new Error("Failed to pin chat");
  revalidatePath("/");
  return { success: true };
}

export async function archiveChat(chatId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("assistant_conversations")
    .update({ is_archived: true, updated_at: new Date().toISOString() })
    .eq("id", chatId)
    .eq("organization_id", userId);

  if (error) throw new Error("Failed to archive chat");
  revalidatePath("/");
  return { success: true };
}

export async function restoreChat(chatId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("assistant_conversations")
    .update({ is_archived: false, updated_at: new Date().toISOString() })
    .eq("id", chatId)
    .eq("organization_id", userId);

  if (error) throw new Error("Failed to restore chat");
  revalidatePath("/");
  return { success: true };
}

export async function deleteChat(chatId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("assistant_conversations")
    .delete()
    .eq("id", chatId)
    .eq("organization_id", userId);

  if (error) throw new Error("Failed to delete chat");
  revalidatePath("/");
  return { success: true };
}

export async function moveChat(chatId: string, targetId: string, type: "client" | "matter") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) throw new Error("Unauthorized");

  const updatePayload: any = { updated_at: new Date().toISOString() };
  if (type === "client") updatePayload.client_id = targetId;
  if (type === "matter") updatePayload.matter_id = targetId;

  const { error } = await supabase
    .from("assistant_conversations")
    .update(updatePayload)
    .eq("id", chatId)
    .eq("organization_id", userId);

  if (error) throw new Error("Failed to move chat");
  revalidatePath("/");
  return { success: true };
}
