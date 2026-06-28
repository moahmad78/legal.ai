import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Cpu, ShieldCheck, FileSearch, Building2, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 md:px-12 sticky top-0 z-50 glass border-b border-border/50">
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/logo-legal.png" alt="Catalyst Legal AI" className="h-14 w-auto transition-transform group-hover:scale-105" />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</Link>
          <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden md:inline-flex")}>Sign In</Link>
          <Link href="/chat" className={cn(buttonVariants({ size: "sm" }), "rounded-full px-5 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5")}>
            Try Catalyst Free
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center text-center overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 opacity-50" />
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />

          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
            Enterprise Legal Operating System
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold font-heading tracking-tight mb-8 max-w-4xl text-balance leading-[1.1]">
            AI Copilot for <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Legal Professionals.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mb-10 text-balance leading-relaxed">
            Analyze documents, identify risks, review properties, and manage legal work from one unified intelligence workspace.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/chat" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto rounded-full px-8 text-base shadow-xl hover:shadow-primary/25 transition-all hover:-translate-y-1")}>
              Try Catalyst Free <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/sign-in" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto rounded-full px-8 text-base")}>
              Sign In
            </Link>
          </div>

          {/* Interactive Preview Mockup */}
          <div className="mt-20 md:mt-32 w-full max-w-5xl rounded-xl md:rounded-2xl border bg-card shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500" />
            <div className="bg-muted/30 border-b p-3 md:p-4 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>
              <div className="mx-auto bg-background/50 border rounded-md px-3 py-1 text-xs text-muted-foreground font-medium w-64 text-center">
                app.catalyst.ai
              </div>
            </div>
            <div className="p-6 md:p-10 text-left bg-gradient-to-b from-card to-muted/10">
              <div className="flex items-start gap-4 mb-8">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">US</span>
                </div>
                <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm text-sm border shadow-sm">
                  What are the biggest risks in this agreement?
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm border border-primary-foreground/20">
                  <Cpu className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="space-y-4 w-full max-w-2xl">
                  <div className="bg-card px-5 py-4 rounded-2xl rounded-tl-sm text-sm border shadow-sm space-y-4">
                    <p className="font-medium text-primary">I found 3 critical risks in the Employment Agreement:</p>
                    <div className="space-y-3">
                      <div className="bg-destructive/5 p-3 rounded-lg border border-destructive/20">
                        <p className="font-semibold text-destructive flex items-center gap-2 mb-1">
                          1. Broad Non-Compete Clause
                        </p>
                        <p className="text-muted-foreground">The 2-year non-compete applies globally, which is likely unenforceable under current jurisdiction laws.</p>
                      </div>
                      <div className="bg-orange-500/5 p-3 rounded-lg border border-orange-500/20">
                        <p className="font-semibold text-orange-600 flex items-center gap-2 mb-1">
                          2. Missing Severance Terms
                        </p>
                        <p className="text-muted-foreground">Section 4.2 outlines termination for cause but fails to establish severance calculations for termination without cause.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">A complete legal operating system</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Everything you need to analyze, manage, and deliver superior legal outcomes faster.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<FileSearch className="h-6 w-6 text-primary" />}
                title="Contract Risk Intelligence"
                description="Instantly detect loopholes, missing clauses, and non-standard terms across complex agreements."
              />
              <FeatureCard 
                icon={<Building2 className="h-6 w-6 text-primary" />}
                title="Property Intelligence"
                description="Automate property title reviews, analyze registry documents, and flag ownership risks."
              />
              <FeatureCard 
                icon={<ShieldCheck className="h-6 w-6 text-primary" />}
                title="Client Workspace 360"
                description="Manage all your clients, matters, documents, and AI conversations in one secure silo."
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 px-6 border-y">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-16">How it works</h2>
            
            <div className="grid md:grid-cols-4 gap-8">
              <Step number="1" title="Upload" desc="Drag & drop your legal documents." />
              <Step number="2" title="Ask" desc="Query Catalyst AI in natural language." />
              <Step number="3" title="Review" desc="Review extracted risks and clauses." />
              <Step number="4" title="Generate" desc="Export ready-to-send legal reports." />
            </div>
          </div>
        </section>

        {/* Pricing Preview */}
        <section id="pricing" className="py-24 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Transparent Pricing</h2>
            <p className="text-muted-foreground text-lg mb-16 max-w-2xl mx-auto">Start for free, upgrade when you need to scale your practice.</p>

            <div className="grid md:grid-cols-4 gap-6 text-left">
              <PricingCard title="Free" price="₹0" features={["25 AI Chats / mo", "3 Documents / mo", "Basic Analytics", "Community Support"]} />
              <PricingCard title="Solo" price="₹2,999" highlighted features={["Unlimited AI Chats", "100 Documents / mo", "Matter Management", "Email Support"]} />
              <PricingCard title="Starter" price="₹7,999" features={["Unlimited Everything", "Up to 3 Users", "Client Workspace", "Priority Support"]} />
              <PricingCard title="Professional" price="₹19,999" features={["Up to 10 Users", "Custom Branding", "Advanced Reports", "Dedicated Account Manager"]} />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t bg-muted/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-80">
            <img src="/logo-legal.png" alt="Catalyst Legal AI" className="h-10 w-auto grayscale" />
          </div>
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} Catalyst AI Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground font-medium">
            <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function Step({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl mb-4 shadow-md">
        {number}
      </div>
      <h4 className="font-bold text-lg mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function PricingCard({ title, price, features, highlighted = false }: { title: string; price: string; features: string[], highlighted?: boolean }) {
  return (
    <div className={cn("bg-card border rounded-2xl p-6 flex flex-col shadow-sm relative", highlighted && "border-primary shadow-md ring-1 ring-primary/20")}>
      {highlighted && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">Most Popular</div>}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-3xl font-bold">{price}</span>
        <span className="text-muted-foreground text-sm">/mo</span>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> {f}
          </li>
        ))}
      </ul>
      <Link href="/sign-up" className={cn(buttonVariants({ variant: highlighted ? "default" : "outline" }), "w-full rounded-xl")}>
        Get Started
      </Link>
    </div>
  );
}

// Minimal Badge Component for Marketing Page
function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}>
      {children}
    </div>
  );
}
