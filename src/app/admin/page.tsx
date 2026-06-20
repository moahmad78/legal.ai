import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, FileText, Activity, IndianRupee, PieChart } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userId = user?.id;
  if (!userId) redirect("/sign-in");

  const { data: dbUser } = await supabase.from("users").select("is_superadmin").eq("id", userId).single();

  if (!user || !user.is_superadmin) {
    redirect("/dashboard?error=unauthorized");
  }

  // Fetch Global Stats
  const { count: orgCount } = await supabase.from("organizations").select("*", { count: "exact", head: true });
  const { count: userCount } = await supabase.from("users").select("*", { count: "exact", head: true });
  const { count: docCount } = await supabase.from("documents").select("*", { count: "exact", head: true });
  
  const { data: recentOrgs } = await supabase
    .from("organizations")
    .select("id, name, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: invoices } = await supabase.from("invoices").select("amount").eq("status", "paid");
  const totalRevenue = invoices?.reduce((sum: number, inv: any) => sum + Number(inv.amount), 0) || 0;

  const { data: subs } = await supabase.from("subscriptions").select("plan");
  const plans = { starter: 0, professional: 0, enterprise: 0 };
  subs?.forEach((s: any) => {
    if (s.plan in plans) plans[s.plan as keyof typeof plans]++;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Admin</h1>
        <p className="text-muted-foreground mt-1">Global platform metrics and health.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-xl"><IndianRupee className="h-6 w-6 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
                <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-xl"><Building2 className="h-6 w-6 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Organizations</p>
                <p className="text-3xl font-bold">{orgCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-xl"><Users className="h-6 w-6 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Users</p>
                <p className="text-3xl font-bold">{userCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-xl"><FileText className="h-6 w-6 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Documents</p>
                <p className="text-3xl font-bold">{docCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5" /> Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="font-medium">Professional</span>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-md font-bold">{plans.professional}</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="font-medium">Starter</span>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-md font-bold">{plans.starter}</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="font-medium">Enterprise</span>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-md font-bold">{plans.enterprise}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrgs?.map((org: any) => (
                <div key={org.id} className="flex justify-between items-center p-4 border rounded-xl">
                  <span className="font-semibold">{org.name}</span>
                  <span className="text-sm text-muted-foreground">Joined {new Date(org.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
