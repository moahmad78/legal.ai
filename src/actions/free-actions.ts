"use server";

import { getFreeUsage } from "@/lib/free-tracking";

export async function fetchFreeUsage() {
  try {
    const usage = await getFreeUsage();
    return {
      success: true,
      usage,
    };
  } catch (error) {
    console.error("Failed to fetch free usage:", error);
    return { success: false, usage: null };
  }
}
