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
import { Plus, Trash2, Globe, Server, Activity, ArrowRight, Edit, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

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
  description?: string;
  created_at: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [zones, setZones] = useState<HostedZone[]>([]);
  const [selectedZones, setSelectedZones] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Search state
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);

  // New Zone State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneType, setNewZoneType] = useState("PUBLIC");
  const [newZoneDesc, setNewZoneDesc] = useState("");

  // Edit Zone State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<HostedZone | null>(null);
  const [editZoneType, setEditZoneType] = useState("PUBLIC");
  const [editZoneDesc, setEditZoneDesc] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchStats = async () => {
    try {
      const statsRes = await api.get("/analytics/dashboard-stats");
      setStats(statsRes.data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  const fetchZones = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const zonesRes = await api.get(`/hosted-zones?${params.toString()}`);
      setZones(zonesRes.data.items);
      setTotal(zonesRes.data.total);
    } catch (error) {
      console.error("Failed to fetch hosted zones", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchZones();
    }
  }, [user, page, search]);

  // Hotkey to open create zone dialog
  useHotkeys("c", () => setIsDialogOpen(true));

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/hosted-zones", {
        name: newZoneName,
        zone_type: newZoneType,
        description: newZoneDesc
      });
      setIsDialogOpen(false);
      setNewZoneName("");
      setNewZoneDesc("");
      fetchStats();
      fetchZones();
    } catch (error) {
      console.error("Failed to create zone", error);
    }
  };

  const handleOpenEdit = (zone: HostedZone) => {
    setEditingZone(zone);
    setEditZoneType(zone.zone_type);
    setEditZoneDesc(zone.description || "");
    setIsEditOpen(true);
  };

  const handleUpdateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone) return;
    setIsSaving(true);
    try {
      await api.put(`/hosted-zones/${editingZone.id}`, {
        zone_type: editZoneType,
        description: editZoneDesc
      });
      setIsEditOpen(false);
      setEditingZone(null);
      fetchZones();
    } catch (error) {
      console.error("Failed to update zone", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteZone = async (id: number) => {
    if (confirm("Are you sure you want to delete this Hosted Zone and all its DNS records?")) {
      try {
        await api.delete(`/hosted-zones/${id}`);
        setSelectedZones(selectedZones.filter((zid) => zid !== id));
        fetchStats();
        fetchZones();
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
      setSelectedZones([]);
      fetchStats();
      fetchZones();
    } catch (error) {
      console.error("Failed to bulk delete zones", error);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  if (!user) return null;

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8">
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

      {/* Hosted Zones Table & Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-foreground">Hosted Zones</h2>
            {selectedZones.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedZones.length})
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by domain..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 bg-card border-border text-foreground text-sm"
              />
            </div>

            {/* Create Zone Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger render={
                <Button className="bg-blue-600 hover:bg-blue-500 text-white shrink-0">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Zone
                </Button>
              } />
              <DialogContent className="sm:max-w-md bg-background border-border text-foreground">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Create Hosted Zone</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Enter domain name details to route internet traffic to your resources.
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
                    <label className="text-sm font-medium">Description (Optional)</label>
                    <Input 
                      placeholder="Production domain for web app" 
                      value={newZoneDesc} 
                      onChange={(e) => setNewZoneDesc(e.target.value)}
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
                        className={newZoneType === "PUBLIC" ? "bg-blue-600 flex-1 text-white" : "border-border flex-1 text-muted-foreground hover:text-foreground"}
                      >
                        Public Hosted Zone
                      </Button>
                      <Button 
                        type="button" 
                        variant={newZoneType === "PRIVATE" ? "default" : "outline"}
                        onClick={() => setNewZoneType("PRIVATE")}
                        className={newZoneType === "PRIVATE" ? "bg-zinc-700 flex-1 text-white" : "border-border flex-1 text-muted-foreground hover:text-foreground"}
                      >
                        Private Hosted Zone
                      </Button>
                    </div>
                  </div>
                  <DialogFooter className="pt-4">
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                      Create Hosted Zone
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Table */}
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
                <TableHead className="text-muted-foreground">Description</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span>Loading hosted zones...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : zones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <Globe className="h-12 w-12 mx-auto mb-3 text-zinc-700" />
                    <p>No hosted zones found.</p>
                    <p className="text-xs mt-1">Try clearing your search query or create a new zone.</p>
                  </TableCell>
                </TableRow>
              ) : (
                zones.map((zone) => (
                  <TableRow key={zone.id} className="border-border hover:bg-muted/30 transition-colors group">
                    <TableCell className="text-center">
                      <Checkbox 
                        checked={selectedZones.includes(zone.id)}
                        onCheckedChange={(checked) => {
                          if (checked) setSelectedZones([...selectedZones, zone.id]);
                          else setSelectedZones(selectedZones.filter(id => id !== zone.id));
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {zone.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={zone.zone_type === "PUBLIC" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-zinc-800 text-zinc-300 border-zinc-700"}>
                        {zone.zone_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-300">{zone.record_count} records</TableCell>
                    <TableCell className="text-muted-foreground text-xs truncate max-w-xs">{zone.description || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${zone.status === 'ACTIVE' ? 'bg-green-500' : 'bg-zinc-500'}`}></div>
                        <span className="text-xs text-muted-foreground">{zone.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(zone)} className="text-muted-foreground hover:text-foreground">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/zones/${zone.id}`)} className="text-blue-400 hover:text-blue-300">
                          Manage <ArrowRight className="ml-1 w-3.5 h-3.5" />
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

          {/* Pagination Controls */}
          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <div>
              Showing <span className="text-foreground font-medium">{zones.length > 0 ? (page - 1) * limit + 1 : 0}</span> to <span className="text-foreground font-medium">{Math.min(page * limit, total)}</span> of <span className="text-foreground font-medium">{total}</span> zones
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 border-border text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Previous
              </Button>
              <span className="text-xs px-2 font-mono text-foreground">Page {page} of {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 border-border text-xs"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Zone Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md bg-background border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Hosted Zone ({editingZone?.name})</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Modify description and routing exposure for this hosted zone.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateZone} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Description"
                value={editZoneDesc}
                onChange={(e) => setEditZoneDesc(e.target.value)}
                className="bg-card border-border text-foreground focus-visible:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Zone Type</label>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant={editZoneType === "PUBLIC" ? "default" : "outline"}
                  onClick={() => setEditZoneType("PUBLIC")}
                  className={editZoneType === "PUBLIC" ? "bg-blue-600 flex-1 text-white" : "border-border flex-1 text-muted-foreground hover:text-foreground"}
                >
                  Public Hosted Zone
                </Button>
                <Button 
                  type="button" 
                  variant={editZoneType === "PRIVATE" ? "default" : "outline"}
                  onClick={() => setEditZoneType("PRIVATE")}
                  className={editZoneType === "PRIVATE" ? "bg-zinc-700 flex-1 text-white" : "border-border flex-1 text-muted-foreground hover:text-foreground"}
                >
                  Private Hosted Zone
                </Button>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
