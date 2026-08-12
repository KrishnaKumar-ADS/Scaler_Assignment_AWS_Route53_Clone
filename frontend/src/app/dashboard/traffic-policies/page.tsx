"use client";

import { Layers, Plus, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TrafficPoliciesPage() {
  return (
    <main className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <Layers className="h-6 w-6 text-blue-500" />
            Traffic Flow & Policies
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Visual traffic routing policies supporting Geolocation, Latency, Weighted, and Failover routing.
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-500 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create Traffic Policy
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 pt-4">
        <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-3">
          <div className="p-3 w-fit bg-blue-500/10 rounded-xl text-blue-500">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-foreground">Visual Policy Builder</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Construct multi-tier routing rules with visual drag-and-drop nodes for latency-based routing.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-3">
          <div className="p-3 w-fit bg-indigo-500/10 rounded-xl text-indigo-500">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-foreground">Traffic Policy Records</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Attach traffic policy versions directly to Hosted Zones with automatic DNS failover switching.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-3">
          <div className="p-3 w-fit bg-purple-500/10 rounded-xl text-purple-500">
            <Layers className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-foreground">Geo-DNS Routing</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Serve location-customized DNS responses tailored to country or region origin requests.
          </p>
        </div>
      </div>

      <div className="border border-border rounded-2xl p-12 text-center bg-card/20 space-y-4">
        <Layers className="h-12 w-12 text-zinc-600 mx-auto" />
        <div className="max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-foreground">No Active Traffic Policies</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Traffic Policies enable sophisticated multi-region routing algorithms for high availability applications.
          </p>
        </div>
      </div>
    </main>
  );
}
