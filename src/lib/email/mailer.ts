import { resend } from "./resend";
import { createClient } from "@/lib/supabase/server";

export type EmailType = 
  | "transactional"
  | "lifecycle"
  | "billing"
  | "security"
  | "team";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  type: EmailType;
  userId?: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function sendEmail(options: SendEmailOptions, retries = 3) {
  // 1. Check Preferences for optional emails
  if (options.userId && (options.type === "lifecycle" || options.type === "team")) {
    const supabase = await createClient();
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", options.userId)
      .single();

    if (prefs) {
      if (options.type === "lifecycle" && !prefs.usage_emails) {
        console.log(`Skipping lifecycle email for user ${options.userId} due to preferences.`);
        return { success: true, skipped: true };
      }
    }
  }

  // 2. Exponential Backoff Retry Loop
  let attempt = 0;
  while (attempt < retries) {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.log("Mock sending email:", options.subject, "to", options.to);
        return { success: true, mocked: true };
      }

      const { data, error } = await resend.emails.send({
        from: "Catalyst Legal AI <no-reply@catalystlegal.ai>", // Replace with verified domain
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      attempt++;
      console.error(`Email attempt ${attempt} failed:`, error);
      if (attempt >= retries) {
        // Log to external system or DB in real world
        return { success: false, error: error.message };
      }
      // Wait before retrying (500ms, 1s, 2s)
      await sleep(500 * Math.pow(2, attempt - 1));
    }
  }
}
