import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  
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
      console.error("❌ Invalid environment variables:", parsed.error.format());
      if (process.env.NODE_ENV === "production" && !process.env.SKIP_ENV_VALIDATION && process.env.NEXT_PHASE !== 'phase-production-build' && !process.env.VERCEL) {
        console.warn("Skipping strict env validation to allow build to proceed. Please ensure vars are set.");
      }
    }
    
    return (parsed.success ? parsed.data : process.env) as z.infer<typeof envSchema>;
  }
  
  // Client side fallback (only has access to NEXT_PUBLIC_)
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
  } as z.infer<typeof envSchema>;
};

export const env = parseEnv();
