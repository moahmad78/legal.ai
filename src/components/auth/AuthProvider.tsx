"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, currentSession: Session | null) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/chat");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Also export a useUser hook for compatibility with existing code
export const useUser = () => {
  const context = useAuth();
  
  return {
    isLoaded: !context.isLoading,
    isSignedIn: !!context.user,
    user: context.user ? {
      id: context.user.id,
      fullName: context.user.user_metadata?.full_name || context.user.email?.split('@')[0],
      primaryEmailAddress: { emailAddress: context.user.email },
      imageUrl: context.user.user_metadata?.avatar_url,
    } : null,
  };
};

// useSessionList: compatibility hook for session-based UI
export const useSessionList = () => {
  const context = useAuth();
  const session = context.session;

  const sessions = session
    ? [
        {
          id: session.access_token?.slice(-8) || "current",
          lastActiveAt: session.user?.last_sign_in_at || null,
          isCurrent: true,
        },
      ]
    : [];

  return {
    isLoaded: !context.isLoading,
    sessions,
  };
};
