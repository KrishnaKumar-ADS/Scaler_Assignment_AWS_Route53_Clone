"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Globe,
  Layers,
  Activity,
  Network,
  Shield,
  ClipboardList,
  Sparkles,
  LogOut,
  Menu,
  X,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <>{children}</>;

  const navItems = [
    {
      group: "DNS Management",
      items: [
        { name: "Hosted Zones", href: "/dashboard", icon: Globe },
        { name: "Traffic Policies", href: "/dashboard/traffic-policies", icon: Layers },
        { name: "Health Checks", href: "/dashboard/health-checks", icon: Activity },
      ],
    },
    {
      group: "Resolver & Security",
      items: [
        { name: "Resolver", href: "/dashboard/resolver", icon: Network },
        { name: "Profiles", href: "/dashboard/profiles", icon: Shield },
      ],
    },
    {
      group: "Monitoring & AI",
      items: [
        { name: "Audit Logs", href: "/dashboard/logs", icon: ClipboardList },
        { name: "AI Assistant", href: "/dashboard/chat", icon: Sparkles, highlight: true },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname.startsWith("/dashboard/zones");
    }
    return pathname === href;
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card/60 border-r border-border flex flex-col transition-transform duration-300 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } backdrop-blur-md`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-border flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl ring-1 ring-blue-500/20">
              <Globe className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-foreground">AWS Route 53</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Management Console</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {navItems.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <h2 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.group}
              </h2>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? "bg-blue-600/15 text-blue-400 border border-blue-500/30"
                          : item.highlight
                          ? "text-blue-400 hover:bg-blue-500/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${active ? "text-blue-400" : item.highlight ? "text-blue-400" : "text-muted-foreground"}`} />
                        <span>{item.name}</span>
                      </div>
                      {active && <ChevronRight className="h-4 w-4 text-blue-400" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-border bg-card/30 flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs font-medium text-foreground truncate">{user.email.split("@")[0] || "Admin User"}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
          </div>
          <ThemeToggle />
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur sticky top-0 z-30 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <span className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded font-mono text-[11px]">us-east-1</span>
              <span>•</span>
              <span>Global DNS Engine</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/chat")}
              className="border-blue-500/30 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 text-xs hidden md:flex items-center gap-2"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ask AI Copilot</span>
              <kbd className="ml-1 px-1.5 py-0.5 text-[10px] bg-background/50 border border-blue-500/30 rounded">Cmd+K</kbd>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
