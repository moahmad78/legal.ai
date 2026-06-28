import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env } from "../env";

export async function createClient() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    console.warn("Supabase environment variables are missing. Running without Supabase.");
    const mockChain = new Proxy(() => {}, {
      get: (target, prop) => {
        if (prop === 'then') {
          return (resolve: any) => resolve({ data: null, error: null });
        }
        return mockChain;
      },
      apply: () => mockChain,
    }) as any;

    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
      },
      from: () => mockChain,
    } as any;
  }

  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      db: { schema: 'public' },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

export function createAdminClient() {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  
  if (!serviceKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY is missing. RLS might block queries.");
  }
  
  return createSupabaseClient(
    supabaseUrl,
    serviceKey || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
    {
      db: { schema: 'public' },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );
}
