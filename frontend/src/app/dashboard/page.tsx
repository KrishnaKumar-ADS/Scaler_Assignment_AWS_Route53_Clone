"use client";

import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center pb-6 border-b border-zinc-800">
          <div>
            <h1 className="text-2xl font-bold text-white">Route53 Dashboard</h1>
            <p className="text-zinc-400 text-sm mt-1">Welcome back, {user?.email}</p>
          </div>
          <Button variant="outline" onClick={logout} className="border-zinc-800 hover:bg-zinc-900 text-zinc-300">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
            <h3 className="text-sm font-medium text-zinc-400">Total Hosted Zones</h3>
            <p className="text-3xl font-bold mt-2 text-white">--</p>
          </div>
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
            <h3 className="text-sm font-medium text-zinc-400">Total DNS Records</h3>
            <p className="text-3xl font-bold mt-2 text-white">--</p>
          </div>
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
            <h3 className="text-sm font-medium text-zinc-400">Recent Activity</h3>
            <p className="text-3xl font-bold mt-2 text-white">--</p>
          </div>
        </div>

        <div className="p-12 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
          <p className="text-zinc-500">Dashboard content (Hosted Zones, etc.) will be added in Step 9</p>
        </div>
      </div>
    </div>
  );
}
