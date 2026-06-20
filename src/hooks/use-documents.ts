import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getGuestSession } from "@/lib/guest-session";

export function useRecentDocuments() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["recent-documents"],
    queryFn: async () => {
      const sessionId = getGuestSession();
      if (!sessionId) return [];

      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("guest_session_id", sessionId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  });
}
