"use client";

import { Network, Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ResolverPage() {
  return (
    <main className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <Network className="h-6 w-6 text-purple-500" />
            Route 53 Resolver
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Hybrid cloud DNS resolution across AWS VPCs and on-premises corporate networks.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border">
            Create Inbound Endpoint
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-500 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Outbound Endpoint
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="border border-border bg-card/40 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <ArrowDownLeft className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Inbound Endpoints</h3>
                <p className="text-xs text-muted-foreground">Allows on-prem networks to resolve VPC DNS</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">Active</Badge>
          </div>
          <div className="p-4 rounded-xl bg-background/50 border border-border text-xs space-y-2 font-mono text-zinc-300">
            <div className="flex justify-between"><span>VPC ID:</span> <span className="text-foreground">vpc-0a817f2c</span></div>
            <div className="flex justify-between"><span>Subnet IPs:</span> <span>10.0.1.5, 10.0.2.5</span></div>
            <div className="flex justify-between"><span>Status:</span> <span className="text-green-400">OPERATIONAL</span></div>
          </div>
        </div>

        <div className="border border-border bg-card/40 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Outbound Endpoints</h3>
                <p className="text-xs text-muted-foreground">Allows VPC resources to resolve on-prem DNS</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">Active</Badge>
          </div>
          <div className="p-4 rounded-xl bg-background/50 border border-border text-xs space-y-2 font-mono text-zinc-300">
            <div className="flex justify-between"><span>Rules Attached:</span> <span className="text-foreground">corp.internal forwarding</span></div>
            <div className="flex justify-between"><span>Target IPs:</span> <span>192.168.1.10, 192.168.1.11</span></div>
            <div className="flex justify-between"><span>Status:</span> <span className="text-green-400">OPERATIONAL</span></div>
          </div>
        </div>
      </div>
    </main>
  );
}
