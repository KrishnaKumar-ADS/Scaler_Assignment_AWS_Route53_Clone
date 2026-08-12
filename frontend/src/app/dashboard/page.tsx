"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useHotkeys } from "@/hooks/useHotkeys";
import api from "../../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogOut, Plus, Trash2, Globe, Server, Activity, ArrowRight, ClipboardList, Sparkles } from "lucide-react";

interface DashboardStats {
  total_hosted_zones: number;
  total_dns_records: number;
  public_zones: number;
  private_zones: number;
  recent_activity_count: number;
}

interface HostedZone {
  id: number;
  name: string;
  zone_type: string;
  status: string;
  record_count: number;
  created_at: string;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [zones, setZones] = useState<HostedZone[]>([]);
  const [selectedZones, setSelectedZones] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // New Zone State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneType, setNewZoneType] = useState("PUBLIC");

  const fetchStats = async () => {
    try {
      const statsRes = await api.get("/analytics/dashboard-stats");
      setStats(statsRes.data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  const fetchData = async () => {
    try {
      await fetchStats();
      const zonesRes = await api.get("/hosted-zones");
      setZones(zonesRes.data.items);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  // Hotkey to open create zone dialog
  useHotkeys("c", () => setIsDialogOpen(true));

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/hosted-zones", {
        name: newZoneName,
        zone_type: newZoneType,
        description: ""
      });
      setIsDialogOpen(false);
      setNewZoneName("");
      fetchData(); // Refresh list and stats
    } catch (error) {
      console.error("Failed to create zone", error);
    }
  };

  const handleDeleteZone = async (id: number) => {
    if (confirm("Are you sure you want to delete this Hosted Zone and all its DNS records?")) {
      try {
        await api.delete(`/hosted-zones/${id}`);
        setZones(zones.filter((z) => z.id !== id));
        setSelectedZones(selectedZones.filter((zid) => zid !== id));
        fetchStats();
      } catch (error) {
        console.error("Failed to delete zone", error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedZones.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedZones.length} zones?`)) return;
    try {
      await api.post("/hosted-zones/bulk-delete", { ids: selectedZones });
      setZones(zones.filter((z) => !selectedZones.includes(z.id)));
      setSelectedZones([]);
      fetchStats();
    } catch (error) {
      console.error("Failed to bulk delete zones", error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-zinc-200">
      {/* Navbar */}
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl ring-1 ring-blue-500/20">
              <Globe className="h-5 w-5 text-blue-500" />
            </div>
            <h1 className="font-semibold text-lg text-foreground">Route53 Console</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/chat")} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 hidden md:flex">
              <Sparkles className="h-4 w-4 mr-2" />
              Ask AI
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/logs")} className="text-muted-foreground hover:text-foreground hover:bg-card hidden md:flex">
              <ClipboardList className="h-4 w-4 mr-2" />
              Audit Logs
            </Button>
            <p className="text-muted-foreground text-sm hidden md:block border-l border-border pl-4">{user.email}</p>
            <Button variant="outline" onClick={logout} size="sm" className="border-border hover:bg-card text-zinc-300">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Stats Section */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Dashboard Overview</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-6 rounded-2xl border border-border bg-card/40 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Globe className="h-16 w-16 text-blue-500" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">Total Hosted Zones</h3>
              <p className="text-4xl font-bold mt-2 text-foreground">{stats?.total_hosted_zones ?? "-"}</p>
              <div className="mt-4 flex gap-2 text-xs">
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">{stats?.public_zones ?? 0} Public</Badge>
                <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700">{stats?.private_zones ?? 0} Private</Badge>
              </div>
            </div>
            <div className="p-6 rounded-2xl border border-border bg-card/40 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Server className="h-16 w-16 text-indigo-500" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">Total DNS Records</h3>
              <p className="text-4xl font-bold mt-2 text-foreground">{stats?.total_dns_records ?? "-"}</p>
              <p className="mt-4 text-xs text-muted-foreground">Across all your hosted zones</p>
            </div>
            <div className="p-6 rounded-2xl border border-border bg-card/40 relative overflow-hidden group hover:border-purple-500/50 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity className="h-16 w-16 text-purple-500" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">Recent Activity</h3>
              <p className="text-4xl font-bold mt-2 text-foreground">{stats?.recent_activity_count ?? "-"}</p>
              <p className="mt-4 text-xs text-muted-foreground">Audit events in the last 24 hours</p>
            </div>
          </div>
        </div>

        {/* Hosted Zones Table */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-foreground">Your Hosted Zones</h2>
              {selectedZones.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedZones.length})
                </Button>
              )}
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger render={
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Zone
                </Button>
              } />
              <DialogContent className="sm:max-w-md bg-background border-border text-zinc-200">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Create Hosted Zone</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Enter the domain name to route internet traffic to your resources.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateZone} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Domain Name</label>
                    <Input 
                      placeholder="example.com" 
                      value={newZoneName} 
                      onChange={(e) => setNewZoneName(e.target.value)}
                      required
                      className="bg-card border-border text-foreground focus-visible:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant={newZoneType === "PUBLIC" ? "default" : "outline"}
                        onClick={() => setNewZoneType("PUBLIC")}
                        className={newZoneType === "PUBLIC" ? "bg-blue-600 flex-1" : "border-border flex-1 text-muted-foreground hover:text-foreground"}
                      >
                        Public Route
                      </Button>
                      <Button 
                        type="button" 
                        variant={newZoneType === "PRIVATE" ? "default" : "outline"}
                        onClick={() => setNewZoneType("PRIVATE")}
                        className={newZoneType === "PRIVATE" ? "bg-zinc-700 flex-1" : "border-border flex-1 text-muted-foreground hover:text-foreground"}
                      >
                        Private Route
                      </Button>
                    </div>
                  </div>
                  <DialogFooter className="pt-4">
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-foreground">
                      Create Zone
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border border-border rounded-xl overflow-hidden bg-card/30">
            <Table>
              <TableHeader className="bg-card/80">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-[40px] text-center">
                    <Checkbox 
                      checked={selectedZones.length === zones.length && zones.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) setSelectedZones(zones.map(z => z.id));
                        else setSelectedZones([]);
                      }}
                    />
                  </TableHead>
                  <TableHead className="text-muted-foreground">Domain Name</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Record Count</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading zones...</TableCell>
                  </TableRow>
                ) : zones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <Globe className="h-12 w-12 mx-auto mb-3 text-zinc-700" />
                      <p>No hosted zones found.</p>
                      <p className="text-sm mt-1">Create one to get started.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  zones.map((zone) => (
                    <TableRow key={zone.id} className="border-border hover:bg-zinc-800/50 transition-colors group">
                      <TableCell className="text-center">
                        <Checkbox 
                          checked={selectedZones.includes(zone.id)}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedZones([...selectedZones, zone.id]);
                            else setSelectedZones(selectedZones.filter(id => id !== zone.id));
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-foreground flex items-center gap-2">
                        {zone.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={zone.zone_type === "PUBLIC" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-zinc-800 text-zinc-300 border-zinc-700"}>
                          {zone.zone_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-300">{zone.record_count} records</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${zone.status === 'ACTIVE' ? 'bg-green-500' : 'bg-zinc-500'}`}></div>
                          <span className="text-sm text-muted-foreground">{zone.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/zones/${zone.id}`)} className="text-muted-foreground hover:text-foreground hover:bg-zinc-800">
                            Manage <ArrowRight className="ml-1 w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteZone(zone.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

      </main>
    </div>
  );
}
