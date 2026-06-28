"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, FileText, AlertTriangle, Clock } from "lucide-react";

export function OverviewTab({ client }: { client: any }) {
  const stats = [
    {
      title: "Open Matters",
      value: "0", // Placeholder
      icon: <FolderOpen className="h-4 w-4 text-blue-500" />,
      description: "Active cases",
    },
    {
      title: "Documents",
      value: "0", // Placeholder
      icon: <FileText className="h-4 w-4 text-green-500" />,
      description: "Total uploaded",
    },
    {
      title: "Pending Reviews",
      value: "0", // Placeholder
      icon: <Clock className="h-4 w-4 text-orange-500" />,
      description: "Awaiting analysis",
    },
    {
      title: "High Risk",
      value: "0", // Placeholder
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      description: "Documents flagged",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="p-2 bg-muted/50 rounded-md">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold font-heading">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 border border-dashed rounded-lg bg-muted/30 text-muted-foreground text-sm">
              No recent activity found.
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold font-heading">Client Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold block mb-1">Email</span>
                <span className="font-medium">{client.email || "-"}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold block mb-1">Phone</span>
                <span className="font-medium">{client.phone || "-"}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold block mb-1">Company</span>
                <span className="font-medium">{client.company_name || "-"}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold block mb-1">GST Number</span>
                <span className="font-medium">{client.gst_number || "-"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold block mb-1">Address</span>
                <span className="font-medium">{client.address || "-"}</span>
              </div>
              {client.notes && (
                <div className="col-span-2">
                  <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold block mb-1">Notes</span>
                  <div className="p-3 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap">
                    {client.notes}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
