"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, FileText, AlertTriangle, Users } from "lucide-react";

export function MatterOverviewTab({ matter }: { matter: any }) {
  const stats = [
    {
      title: "Total Documents",
      value: "0", // Placeholder
      icon: <FileText className="h-4 w-4 text-blue-500" />,
      description: "Across all folders",
    },
    {
      title: "Pending Reviews",
      value: "0", // Placeholder
      icon: <FolderOpen className="h-4 w-4 text-amber-500" />,
      description: "Awaiting legal analysis",
    },
    {
      title: "High Risk Findings",
      value: "0", // Placeholder
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      description: "Critical red flags",
    },
    {
      title: "Team Members",
      value: "1", // Placeholder
      icon: <Users className="h-4 w-4 text-purple-500" />,
      description: "Assigned to matter",
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
            <CardTitle className="text-base font-semibold font-heading">Matter Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-y-4">
              <div className="col-span-2">
                <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold block mb-1">Description</span>
                <span className="font-medium text-sm whitespace-pre-wrap">{matter.description || "-"}</span>
              </div>
              
              <div>
                <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold block mb-1">Matter Type</span>
                <span className="font-medium">{matter.matter_type || "-"}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold block mb-1">Priority</span>
                <span className="font-medium">{matter.priority || "-"}</span>
              </div>
              
              <div>
                <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold block mb-1">Status</span>
                <span className="font-medium">{matter.status || "-"}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold block mb-1">Assigned To</span>
                <span className="font-medium">{matter.assigned_to || "-"}</span>
              </div>

              {matter.internal_notes && (
                <div className="col-span-2">
                  <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold block mb-1">Internal Notes</span>
                  <div className="p-3 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap border border-amber-100/50">
                    {matter.internal_notes}
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
