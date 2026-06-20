import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PricingCards } from "./PricingCards";

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userId = user?.id;

  if (!userId) {
    redirect("/sign-in");
  }


  const { data: dbUser } = await supabase
    .from("users")
    .select("plan")
    .eq("auth_user_id", userId)
    .single();

  if (!dbUser) {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Upgrade Your Document Intelligence</h1>
        <p className="text-muted-foreground text-lg">
          Choose the right plan to unlock unlimited uploads, advanced AI chats, and more.
        </p>
      </div>

      <PricingCards currentPlan={user.plan} />
    </div>
  );
}

