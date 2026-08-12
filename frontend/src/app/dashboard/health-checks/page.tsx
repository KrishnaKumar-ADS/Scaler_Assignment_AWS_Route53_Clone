"use client";

import { Activity, Plus, HeartPulse, BellCheck, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HealthChecksPage() {
  const mockChecks = [
    { id: "hc-1", name: "Primary Web Server Endpoint", type: "HTTP Endpoint", target: "192.0.2.1:80", status: "HEALTHY", interval: "30s" },
    { id: "hc-2", name: "API Gateway Failover Endpoint", type: "HTTPS Endpoint", target: "api.example.com", status: "HEALTHY", interval: "10s" },
    { id: "hc-3", name: "EU Region Health Monitor", type: "Calculated Check", target: "2 Child Checks", status: "HEALTHY", interval: "30s" },
  ];

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <Activity className="h-6 w-6 text-green-500" />
            Route 53 Health Checks
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor the health and performance of your web servers and backend endpoints worldwide.
          </p>
        </div>
        <Button className="bg-green-600 hover:bg-green-500 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create Health Check
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-5 rounded-2xl border border-border bg-card/40 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
            <HeartPulse className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Active Health Checks</p>
            <p className="text-2xl font-bold text-foreground mt-0.5">3 / 3 Healthy</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card/40 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
            <BellCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">CloudWatch Alarm Status</p>
            <p className="text-2xl font-bold text-foreground mt-0.5">OK (0 Triggered)</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card/40 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Global Health Checkers</p>
            <p className="text-2xl font-bold text-foreground mt-0.5">8 Locations Active</p>
          </div>
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-card/30">
        <table className="w-full text-left text-sm">
          <thead className="bg-card/80 border-b border-border text-muted-foreground text-xs uppercase font-medium">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Type</th>
              <th className="p-4">Target / Endpoint</th>
              <th className="p-4">Request Interval</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockChecks.map((hc) => (
              <tr key={hc.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-4 font-medium text-foreground">{hc.name}</td>
                <td className="p-4 text-muted-foreground">{hc.type}</td>
                <td className="p-4 font-mono text-xs text-zinc-300">{hc.target}</td>
                <td className="p-4 text-muted-foreground">{hc.interval}</td>
                <td className="p-4">
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                    ● {hc.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
