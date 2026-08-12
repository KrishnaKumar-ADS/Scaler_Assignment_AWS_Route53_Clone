"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { useHotkeys } from "@/hooks/useHotkeys";
import api from "../../../../lib/api";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, Globe, FileText, Loader2 } from "lucide-react";

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
  
  // New Record State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRecordName, setNewRecordName] = useState("");
  const [newRecordType, setNewRecordType] = useState("A");
  const [newRecordValue, setNewRecordValue] = useState("");
  const [newRecordTtl, setNewRecordTtl] = useState("300");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRecords = async () => {
    try {
      const res = await api.get(`/hosted-zones/${zoneId}/records`);
      setRecords(res.data);
    } catch (error) {
      console.error("Failed to fetch records", error);
      // Redirect back if unauthorized or not found
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && zoneId) {
      fetchRecords();
    }
  }, [user, zoneId]);

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

  const handleDeleteRecord = async (recordId: number) => {
    if (confirm("Are you sure you want to delete this DNS record?")) {
      try {
        await api.delete(`/hosted-zones/${zoneId}/records/${recordId}`);
        setRecords(records.filter((r) => r.id !== recordId));
        setSelectedRecords(selectedRecords.filter((rid) => rid !== recordId));
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
      setRecords(records.filter((r) => !selectedRecords.includes(r.id)));
      setSelectedRecords([]);
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
      fetchRecords(); // Refresh the list
      alert("Successfully imported BIND file!");
    } catch (error) {
      console.error("Failed to import BIND file", error);
      alert("Failed to import file. Ensure it is a valid BIND format.");
    }
    // reset input
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-zinc-200">
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="text-muted-foreground hover:text-foreground hover:bg-zinc-800">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl ring-1 ring-indigo-500/20">
              <Globe className="h-5 w-5 text-indigo-500" />
            </div>
            <h1 className="font-semibold text-lg text-foreground">Zone Records</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">DNS Records Management</h2>
              {selectedRecords.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedRecords.length})
                </Button>
              )}
            </div>
            <p className="text-muted-foreground mt-1">Create and manage routing configurations for this zone.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              accept=".txt,.zone" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleImportBind} 
            />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="border-border text-foreground hover:bg-muted">
              Import BIND
            </Button>
            <div className="flex rounded-md shadow-sm">
              <Button variant="outline" size="sm" onClick={() => handleExport("json")} className="rounded-r-none border-r-0 border-border text-foreground hover:bg-muted">
                Export JSON
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport("bind")} className="rounded-l-none border-border text-foreground hover:bg-muted">
                Export BIND
              </Button>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger render={
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-foreground ml-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Record
                </Button>
              } />
            <DialogContent className="sm:max-w-md bg-background border-border text-zinc-200">
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
                    className="bg-card border-border text-foreground focus-visible:ring-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Record Type</label>
                  <select 
                    value={newRecordType}
                    onChange={(e) => setNewRecordType(e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="A">A - IPv4 address</option>
                    <option value="AAAA">AAAA - IPv6 address</option>
                    <option value="CNAME">CNAME - Canonical name</option>
                    <option value="TXT">TXT - Text record</option>
                    <option value="MX">MX - Mail exchange</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Value / Route to</label>
                  <Input 
                    placeholder="e.g. 192.0.2.1" 
                    value={newRecordValue} 
                    onChange={(e) => setNewRecordValue(e.target.value)}
                    required
                    className="bg-card border-border text-foreground focus-visible:ring-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">TTL (Seconds)</label>
                  <Input 
                    type="number"
                    value={newRecordTtl} 
                    onChange={(e) => setNewRecordTtl(e.target.value)}
                    required
                    className="bg-card border-border text-foreground focus-visible:ring-indigo-500"
                  />
                </div>

                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-500 text-foreground">
                    {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Save Record
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        </div>

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
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading records...</TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-zinc-700" />
                    <p>No DNS records found for this zone.</p>
                    <p className="text-sm mt-1">Create one to get started.</p>
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id} className="border-border hover:bg-zinc-800/50 transition-colors group">
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
                      <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
                        {record.record_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-300 truncate max-w-xs" title={record.value}>
                      {record.value}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{record.ttl}s</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
        </div>

      </main>
    </div>
  );
}
