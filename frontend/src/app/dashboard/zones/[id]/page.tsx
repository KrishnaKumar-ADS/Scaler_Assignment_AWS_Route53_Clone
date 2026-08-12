"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { useHotkeys } from "@/hooks/useHotkeys";
import api from "../../../../lib/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, Globe, FileText, Loader2, Edit, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface DNSRecord {
  id: number;
  name: string;
  record_type: string;
  value: string;
  ttl: number;
}

export default function ZoneDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const zoneId = params.id as string;
  
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecords, setSelectedRecords] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pagination & Search state
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);

  // New Record State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRecordName, setNewRecordName] = useState("");
  const [newRecordType, setNewRecordType] = useState("A");
  const [newRecordValue, setNewRecordValue] = useState("");
  const [newRecordTtl, setNewRecordTtl] = useState("300");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Record State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DNSRecord | null>(null);
  const [editRecordName, setEditRecordName] = useState("");
  const [editRecordType, setEditRecordType] = useState("A");
  const [editRecordValue, setEditRecordValue] = useState("");
  const [editRecordTtl, setEditRecordTtl] = useState("300");
  const [isSaving, setIsSaving] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const res = await api.get(`/hosted-zones/${zoneId}/records?${params.toString()}`);
      setRecords(res.data.items);
      setTotal(res.data.total);
    } catch (error) {
      console.error("Failed to fetch records", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && zoneId) {
      fetchRecords();
    }
  }, [user, zoneId, page, search]);

  // Hotkey to open create record dialog
  useHotkeys("c", () => setIsDialogOpen(true));

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post(`/hosted-zones/${zoneId}/records`, {
        name: newRecordName,
        record_type: newRecordType,
        value: newRecordValue,
        ttl: parseInt(newRecordTtl)
      });
      setIsDialogOpen(false);
      setNewRecordName("");
      setNewRecordType("A");
      setNewRecordValue("");
      setNewRecordTtl("300");
      fetchRecords();
    } catch (error) {
      console.error("Failed to create record", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (record: DNSRecord) => {
    setEditingRecord(record);
    setEditRecordName(record.name);
    setEditRecordType(record.record_type);
    setEditRecordValue(record.value);
    setEditRecordTtl(record.ttl.toString());
    setIsEditOpen(true);
  };

  const handleUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    setIsSaving(true);
    try {
      await api.put(`/hosted-zones/${zoneId}/records/${editingRecord.id}`, {
        name: editRecordName,
        record_type: editRecordType,
        value: editRecordValue,
        ttl: parseInt(editRecordTtl)
      });
      setIsEditOpen(false);
      setEditingRecord(null);
      fetchRecords();
    } catch (error) {
      console.error("Failed to update record", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecord = async (recordId: number) => {
    if (confirm("Are you sure you want to delete this DNS record?")) {
      try {
        await api.delete(`/hosted-zones/${zoneId}/records/${recordId}`);
        setSelectedRecords(selectedRecords.filter((rid) => rid !== recordId));
        fetchRecords();
      } catch (error) {
        console.error("Failed to delete record", error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRecords.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedRecords.length} records?`)) return;
    try {
      await api.post(`/hosted-zones/${zoneId}/records/bulk-delete`, { ids: selectedRecords });
      setSelectedRecords([]);
      fetchRecords();
    } catch (error) {
      console.error("Failed to bulk delete records", error);
    }
  };

  const handleImportBind = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      await api.post(`/hosted-zones/${zoneId}/records/import`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      fetchRecords();
      alert("Successfully imported BIND file!");
    } catch (error) {
      console.error("Failed to import BIND file", error);
      alert("Failed to import file. Ensure it is a valid BIND format.");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExport = async (format: "json" | "bind") => {
    try {
      const res = await api.get(`/hosted-zones/${zoneId}/export?format=${format}`, {
        responseType: format === "json" ? "json" : "text"
      });
      
      const blob = new Blob([format === "json" ? JSON.stringify(res.data, null, 2) : res.data], { 
        type: format === "json" ? "application/json" : "text/plain" 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zone_${zoneId}_export.${format === "json" ? "json" : "txt"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Failed to export zone as ${format}`, error);
      alert("Failed to export zone.");
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  if (!user) return null;

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">DNS Records</h1>
              {selectedRecords.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedRecords.length})
                </Button>
              )}
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">Manage domain mapping endpoints and routing definitions.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <input 
            type="file" 
            accept=".txt,.zone" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleImportBind} 
          />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="border-border text-foreground hover:bg-muted text-xs">
            Import BIND
          </Button>
          <div className="flex rounded-md shadow-sm">
            <Button variant="outline" size="sm" onClick={() => handleExport("json")} className="rounded-r-none border-r-0 border-border text-foreground hover:bg-muted text-xs">
              Export JSON
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("bind")} className="rounded-l-none border-border text-foreground hover:bg-muted text-xs">
              Export BIND
            </Button>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={
              <Button className="bg-blue-600 hover:bg-blue-500 text-white text-xs">
                <Plus className="h-4 w-4 mr-1.5" />
                Create Record
              </Button>
            } />
            <DialogContent className="sm:max-w-md bg-background border-border text-foreground">
              <DialogHeader>
                <DialogTitle className="text-foreground">Create DNS Record</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Define how traffic is routed for this domain or subdomain.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateRecord} className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Record Name</label>
                  <Input 
                    placeholder="e.g. www.example.com" 
                    value={newRecordName} 
                    onChange={(e) => setNewRecordName(e.target.value)}
                    required
                    className="bg-card border-border text-foreground focus-visible:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Record Type</label>
                  <select 
                    value={newRecordType}
                    onChange={(e) => setNewRecordType(e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A">A - IPv4 address</option>
                    <option value="AAAA">AAAA - IPv6 address</option>
                    <option value="CNAME">CNAME - Canonical name</option>
                    <option value="TXT">TXT - Text record</option>
                    <option value="MX">MX - Mail exchange</option>
                    <option value="NS">NS - Name server</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Value / Target</label>
                  <Input 
                    placeholder="e.g. 192.0.2.1" 
                    value={newRecordValue} 
                    onChange={(e) => setNewRecordValue(e.target.value)}
                    required
                    className="bg-card border-border text-foreground focus-visible:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">TTL (Seconds)</label>
                  <Input 
                    type="number"
                    value={newRecordTtl} 
                    onChange={(e) => setNewRecordTtl(e.target.value)}
                    required
                    className="bg-card border-border text-foreground focus-visible:ring-blue-500"
                  />
                </div>

                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                    {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Save Record
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search records by name or value..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-card border-border text-foreground text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden bg-card/30">
        <Table>
          <TableHeader className="bg-card/80">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-[40px] text-center">
                <Checkbox 
                  checked={selectedRecords.length === records.length && records.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) setSelectedRecords(records.map(r => r.id));
                    else setSelectedRecords([]);
                  }}
                />
              </TableHead>
              <TableHead className="text-muted-foreground">Record Name</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Value / Target</TableHead>
              <TableHead className="text-muted-foreground">TTL</TableHead>
              <TableHead className="text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <span>Loading records...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-zinc-700" />
                  <p>No DNS records found for this query.</p>
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id} className="border-border hover:bg-muted/30 transition-colors group">
                  <TableCell className="text-center">
                    <Checkbox 
                      checked={selectedRecords.includes(record.id)}
                      onCheckedChange={(checked) => {
                        if (checked) setSelectedRecords([...selectedRecords, record.id]);
                        else setSelectedRecords(selectedRecords.filter(id => id !== record.id));
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{record.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                      {record.record_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-300 truncate max-w-xs font-mono text-xs" title={record.value}>
                    {record.value}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{record.ttl}s</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(record)} className="text-muted-foreground hover:text-foreground">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteRecord(record.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
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
            Showing <span className="text-foreground font-medium">{records.length > 0 ? (page - 1) * limit + 1 : 0}</span> to <span className="text-foreground font-medium">{Math.min(page * limit, total)}</span> of <span className="text-foreground font-medium">{total}</span> records
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

      {/* Edit Record Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md bg-background border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit DNS Record</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update name, type, value or TTL for this record.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateRecord} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Record Name</label>
              <Input 
                value={editRecordName} 
                onChange={(e) => setEditRecordName(e.target.value)}
                required
                className="bg-card border-border text-foreground focus-visible:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Record Type</label>
              <select 
                value={editRecordType}
                onChange={(e) => setEditRecordType(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="A">A - IPv4 address</option>
                <option value="AAAA">AAAA - IPv6 address</option>
                <option value="CNAME">CNAME - Canonical name</option>
                <option value="TXT">TXT - Text record</option>
                <option value="MX">MX - Mail exchange</option>
                <option value="NS">NS - Name server</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Value / Target</label>
              <Input 
                value={editRecordValue} 
                onChange={(e) => setEditRecordValue(e.target.value)}
                required
                className="bg-card border-border text-foreground focus-visible:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">TTL (Seconds)</label>
              <Input 
                type="number"
                value={editRecordTtl} 
                onChange={(e) => setEditRecordTtl(e.target.value)}
                required
                className="bg-card border-border text-foreground focus-visible:ring-blue-500"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Save Record Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
