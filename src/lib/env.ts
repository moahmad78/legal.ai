import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  
  OPENAI_API_KEY: z.string().min(1).optional(),
  
  RESEND_API_KEY: z.string().min(1).optional(),
  
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  RAZORPAY_PRO_PLAN_ID: z.string().optional(),
  RAZORPAY_BUSINESS_PLAN_ID: z.string().optional(),
});

// Using a custom parsing function to avoid crashing the client side instantly if not all env vars are leaked.
// We only enforce strict validation on the server for secrets.
const parseEnv = () => {
  if (typeof window === "undefined") {
    const parsed = envSchema.safeParse(process.env);
    
    if (!parsed.success) {
      console.warn("⚠️  Environment validation warnings:", parsed.error.format());
    }

    const data = parsed.success ? parsed.data : (process.env as any);

    // Fallback logic for Vercel's Supabase Integration
    if (!data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && data.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = data.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    }
    
    return data as z.infer<typeof envSchema>;
  }
  
  // Client side fallback (only has access to NEXT_PUBLIC_)
  const clientEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  if (!clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }

  return clientEnv as z.infer<typeof envSchema>;
};

export const env = parseEnv();
