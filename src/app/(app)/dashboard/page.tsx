import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Briefcase,
  AlertTriangle,
  Clock,
  MessageSquare,
  Calendar,
  CreditCard,
  Building2,
  ChevronRight,
  Plus
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StaggerContainer, StaggerItem } from "@/components/ui/stagger";

export default async function AuthenticatedDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch counts
  const { count: clientCount } = await supabase.from('clients').select('*', { count: 'exact', head: true });
  const { count: matterCount } = await supabase.from('matters').select('*', { count: 'exact', head: true });
  const { count: documentCount } = await supabase.from('documents').select('*', { count: 'exact', head: true });
  const { count: conversationCount } = await supabase.from('assistant_conversations').select('*', { count: 'exact', head: true });

  // Fetch recents
  const { data: recentMatters } = await supabase.from('matters').select('*, clients(client_name)').order('created_at', { ascending: false }).limit(3);
  const { data: recentDocuments } = await supabase.from('documents').select('*').order('created_at', { ascending: false }).limit(3);

  const hasNoData = clientCount === 0 && matterCount === 0 && documentCount === 0;

  if (hasNoData) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <StaggerContainer className="text-center space-y-4 mb-16">
          <StaggerItem>
            <h1 className="text-4xl font-bold tracking-tight">Welcome to Catalyst AI, {user?.user_metadata?.full_name?.split(' ')[0] || "Counsel"}</h1>
          </StaggerItem>
          <StaggerItem>
            <p className="text-xl text-muted-foreground">You haven't added any data yet. Let's get your practice set up.</p>
          </StaggerItem>
        </StaggerContainer>

        <StaggerContainer className="grid md:grid-cols-3 gap-6">
          <StaggerItem>
            <Card className="flex flex-col items-center p-8 text-center hover:border-primary/50 transition-all shadow-card hover:shadow-card-hover h-full">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Create Client</h3>
              <p className="text-sm text-muted-foreground mb-6 flex-1">Start by adding your first client to the system.</p>
              <Link href="/clients/new" className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors">
                <Plus className="h-4 w-4" /> Create Client
              </Link>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="flex flex-col items-center p-8 text-center hover:border-primary/50 transition-all shadow-card hover:shadow-card-hover h-full">
              <div className="h-16 w-16 bg-[hsl(var(--info-bg))] rounded-full flex items-center justify-center mb-4">
                <Briefcase className="h-8 w-8 text-info" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Create Matter</h3>
              <p className="text-sm text-muted-foreground mb-6 flex-1">Open a new matter for an existing client.</p>
              <Link href="/matters/new" className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors">
                <Plus className="h-4 w-4" /> Create Matter
              </Link>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="flex flex-col items-center p-8 text-center hover:border-primary/50 transition-all shadow-card hover:shadow-card-hover h-full">
              <div className="h-16 w-16 bg-[hsl(var(--success-bg))] rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload Document</h3>
              <p className="text-sm text-muted-foreground mb-6 flex-1">Upload legal documents for AI analysis.</p>
              <Link href="/app/chat" className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors">
                <Plus className="h-4 w-4" /> Upload Document
              </Link>
            </Card>
          </StaggerItem>
        </StaggerContainer>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || "Counsel"}</h1>
          <p className="text-muted-foreground mt-1 text-lg">Here's what's happening across your practice today.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/app/chat" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-primary-hover transition-colors">
            Upload Document
          </Link>
        </div>
      </div>

      {/* Top Widgets */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem>
          <Card className="shadow-card hover:shadow-card-hover transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clients</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Total active clients</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="shadow-card hover:shadow-card-hover transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documentCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Uploaded in system</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="shadow-card hover:shadow-card-hover transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversationCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Chats initiated</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="shadow-card hover:shadow-card-hover transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Matters</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{matterCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Open matters</p>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      <StaggerContainer className="grid md:grid-cols-2 gap-8">
        {/* Recent Matters */}
        <StaggerItem className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Recent Matters
            </h2>
            <Link href="/matters" className="text-sm text-primary font-medium hover:underline">View All</Link>
          </div>
          <Card className="shadow-card">
            <div className="divide-y divide-border">
              {recentMatters && recentMatters.length > 0 ? recentMatters.map((matter: any) => (
                <div key={matter.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="font-semibold text-sm">{matter.matter_name}</p>
                    <p className="text-xs text-muted-foreground">{matter.clients?.client_name || 'Unknown Client'}</p>
                  </div>
                  <Badge variant="outline" className={matter.status === "Active" ? "bg-[hsl(var(--success-bg))] text-success border-success/20" : "bg-[hsl(var(--warning-bg))] text-warning border-warning/20"}>
                    {matter.status}
                  </Badge>
                </div>
              )) : (
                <div className="p-4 text-center text-muted-foreground text-sm">No recent matters found.</div>
              )}
            </div>
          </Card>
        </StaggerItem>

        {/* Recent Documents & Risks */}
        <StaggerItem className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Recent Documents
            </h2>
            <Link href="/documents" className="text-sm text-primary font-medium hover:underline">View All</Link>
          </div>
          <Card className="shadow-card">
            <div className="divide-y divide-border">
              {recentDocuments && recentDocuments.length > 0 ? recentDocuments.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${doc.overall_risk_level === 'High' ? 'bg-danger' : doc.overall_risk_level === 'Medium' ? 'bg-warning' : 'bg-success'}`} />
                    <div>
                      <p className="font-semibold text-sm line-clamp-1">{doc.file_name}</p>
                      <p className="text-xs text-muted-foreground">{doc.file_type} • {doc.status}</p>
                    </div>
                  </div>
                  <Link href={`/documents/${doc.id}`} className="text-muted-foreground hover:text-foreground">
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )) : (
                <div className="p-4 text-center text-muted-foreground text-sm">No recent documents found.</div>
              )}
            </div>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      {/* Property & Deliverables row */}
      <StaggerContainer className="grid md:grid-cols-2 gap-8">
        <StaggerItem>
          <Card className="bg-gradient-to-br from-card to-muted/20 border-primary/10 shadow-card hover:shadow-card-hover transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-primary" /> Property Intelligence
              </CardTitle>
              <CardDescription>Review property titles and flag ownership risks.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/property" className="text-sm font-medium text-primary flex items-center gap-1 hover:underline">
                Access Module <ChevronRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="bg-gradient-to-br from-card to-muted/20 border-primary/10 shadow-card hover:shadow-card-hover transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-primary" /> Generate Reports
              </CardTitle>
              <CardDescription>Export risk reports and legal opinions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/reports" className="text-sm font-medium text-primary flex items-center gap-1 hover:underline">
                View Deliverables <ChevronRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

    </div>
  );
}
