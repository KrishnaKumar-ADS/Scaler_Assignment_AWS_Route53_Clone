"use client";

import { Shield, Plus, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ProfilesPage() {
  return (
    <main className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <Shield className="h-6 w-6 text-indigo-500" />
            Route 53 Profiles
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Standardize and apply DNS security, Firewall rules, and Private DNS configurations across multiple VPCs.
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create Profile
        </Button>
      </div>

      <div className="border border-border bg-card/40 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-foreground text-base">Corporate Security Profile</h3>
                <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">DEFAULT</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Enforces DNS Firewall blocklists and VPC association rules</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="border-border text-xs">Edit Associations</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3 pt-2">
          <div className="p-4 rounded-xl bg-background/50 border border-border space-y-1">
            <p className="text-xs text-muted-foreground">Associated VPCs</p>
            <p className="text-lg font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              12 VPCs Active
            </p>
          </div>
          <div className="p-4 rounded-xl bg-background/50 border border-border space-y-1">
            <p className="text-xs text-muted-foreground">DNS Firewall Rule Groups</p>
            <p className="text-lg font-bold text-foreground">3 Rule Groups Attached</p>
          </div>
          <div className="p-4 rounded-xl bg-background/50 border border-border space-y-1">
            <p className="text-xs text-muted-foreground">Private Hosted Zones</p>
            <p className="text-lg font-bold text-foreground">4 Zones Auto-Linked</p>
          </div>
        </div>
      </div>
    </main>
  );
}
