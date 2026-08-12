"use client";

import { useState } from "react";
import { useHotkeys } from "@/hooks/useHotkeys";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function ShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // ? to toggle help modal
  useHotkeys("?", () => setIsOpen((prev) => !prev));

  // Cmd+K or Ctrl+K to navigate to AI Chat
  useHotkeys("k", () => {
    setIsOpen(false);
    router.push("/dashboard/chat");
  }, { ctrl: true });

  // h to go home / dashboard
  useHotkeys("h", () => {
    setIsOpen(false);
    router.push("/dashboard");
  });

  // l to go to audit logs
  useHotkeys("l", () => {
    setIsOpen(false);
    router.push("/dashboard/logs");
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-background border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center justify-between">
            <span>Keyboard Shortcuts</span>
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-3">
          <div className="flex justify-between items-center border-b border-border pb-2.5">
            <span className="text-sm text-muted-foreground">Open AI Assistant</span>
            <div className="flex gap-1">
              <kbd className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-mono border border-border">Cmd/Ctrl</kbd>
              <kbd className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-mono border border-border">K</kbd>
            </div>
          </div>
          <div className="flex justify-between items-center border-b border-border pb-2.5">
            <span className="text-sm text-muted-foreground">Show Shortcuts Help</span>
            <kbd className="px-2.5 py-1 bg-muted text-muted-foreground rounded text-xs font-mono border border-border">?</kbd>
          </div>
          <div className="flex justify-between items-center border-b border-border pb-2.5">
            <span className="text-sm text-muted-foreground">Go to Dashboard</span>
            <kbd className="px-2.5 py-1 bg-muted text-muted-foreground rounded text-xs font-mono border border-border">h</kbd>
          </div>
          <div className="flex justify-between items-center border-b border-border pb-2.5">
            <span className="text-sm text-muted-foreground">Go to Audit Logs</span>
            <kbd className="px-2.5 py-1 bg-muted text-muted-foreground rounded text-xs font-mono border border-border">l</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Create Zone / Record</span>
            <kbd className="px-2.5 py-1 bg-muted text-muted-foreground rounded text-xs font-mono border border-border">c</kbd>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
