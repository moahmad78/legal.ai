"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { format } from "date-fns";
import { User, Building, MapPin, Phone, Mail, FileText, Settings, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const tabs = [
  { name: "Overview", href: "" },
  { name: "Matters", href: "/matters" },
  { name: "Documents", href: "/documents" },
  { name: "AI Conversations", href: "/conversations" },
  { name: "Reports", href: "/reports" },
  { name: "Timeline", href: "/timeline" },
  { name: "Property Reviews", href: "/property" },
  { name: "Notes", href: "/notes" },
  { name: "Activity", href: "/activity" },
];

export function ClientWorkspaceHeader({ client }: { client: any }) {
  const pathname = usePathname();
  const baseUrl = `/clients/${client.id}`;

  const getRiskColor = (risk: string) => {
    switch(risk?.toLowerCase()) {
      case 'high': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'low': return 'bg-green-500/10 text-green-600 border-green-500/20';
      default: return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    }
  };

  return (
    <div className="bg-background border-b shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                {client.client_type === 'organization' ? (
                  <Building className="h-8 w-8 text-primary" />
                ) : (
                  <User className="h-8 w-8 text-primary" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold font-heading">{client.client_name}</h1>
                  <Badge variant="outline" className={`text-[10px] uppercase font-semibold tracking-wider ${getRiskColor(client.risk_status || 'Medium')}`}>
                    {client.risk_status === 'High' && <ShieldAlert className="w-3 h-3 mr-1" />}
                    {client.risk_status === 'Low' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                    Risk: {client.risk_status || 'Medium'}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="capitalize text-[10px]">{client.client_type}</Badge>
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {client.email}
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {client.phone}
                    </div>
                  )}
                  {client.city && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {client.city}, {client.country}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" /> Edit Client
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto scrollbar-hide -mb-px">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const fullHref = `${baseUrl}${tab.href}`;
              const isActive = pathname === fullHref || (tab.href === "" && pathname === baseUrl);
              
              return (
                <Link
                  key={tab.name}
                  href={fullHref}
                  className={`
                    whitespace-nowrap px-4 py-3 border-b-2 font-medium text-sm transition-colors
                    ${isActive 
                      ? "border-primary text-primary" 
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    }
                  `}
                >
                  {tab.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
