"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ClipboardList, Activity } from "lucide-react";

interface AuditLog {
  id: number;
  user_email: string;
  action: string;
  entity_type: string;
  entity_name: string;
  timestamp: string;
}

export default function AuditLogsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await api.get(`/analytics/audit-logs?limit=50`);
      setLogs(res.data.items);
    } catch (error) {
      console.error("Failed to fetch audit logs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user]);

  // Utility to style the action badges dynamically
  const getActionColor = (action: string) => {
    if (action.includes("CREATE")) return "bg-green-500/10 text-green-400 border-green-500/20";
    if (action.includes("DELETE")) return "bg-red-500/10 text-red-400 border-red-500/20";
    if (action.includes("UPDATE")) return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    return "bg-zinc-800 text-zinc-300 border-zinc-700";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(date);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-xl ring-1 ring-purple-500/20">
              <ClipboardList className="h-5 w-5 text-purple-500" />
            </div>
            <h1 className="font-semibold text-lg text-white">System Audit Logs</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Recent Activity</h2>
          <p className="text-zinc-400 mt-1">Track all administrative actions performed within your account.</p>
        </div>

        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/30">
          <Table>
            <TableHeader className="bg-zinc-900/80">
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Timestamp</TableHead>
                <TableHead className="text-zinc-400">Action</TableHead>
                <TableHead className="text-zinc-400">Entity</TableHead>
                <TableHead className="text-zinc-400">Entity Name</TableHead>
                <TableHead className="text-zinc-400">Performed By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-zinc-500">Loading audit logs...</TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-zinc-500">
                    <Activity className="h-12 w-12 mx-auto mb-3 text-zinc-700" />
                    <p>No activity recorded yet.</p>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                    <TableCell className="text-zinc-400 text-sm whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-300 font-medium">{log.entity_type}</TableCell>
                    <TableCell className="text-zinc-400">{log.entity_name}</TableCell>
                    <TableCell className="text-zinc-500 text-sm">{log.user_email}</TableCell>
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
