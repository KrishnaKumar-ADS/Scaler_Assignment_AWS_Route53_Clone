"use client"

import { useState } from "react"
import { useHotkeys } from "@/hooks/useHotkeys"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function ShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  // ? to toggle help
  useHotkeys("?", () => setIsOpen(prev => !prev))
  
  // h to go home
  useHotkeys("h", () => {
    setIsOpen(false)
    router.push("/dashboard")
  })

  // l to go to logs
  useHotkeys("l", () => {
    setIsOpen(false)
    router.push("/dashboard/logs")
  })

  // c to trigger "Create" action - we will let the individual pages listen for this or just rely on local state
  // But global navigation is safe here

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-background border-border text-foreground">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-between items-center border-b border-border pb-2">
            <span className="text-sm text-muted-foreground">Show Keyboard Shortcuts</span>
            <kbd className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-mono">?</kbd>
          </div>
          <div className="flex justify-between items-center border-b border-border pb-2">
            <span className="text-sm text-muted-foreground">Go to Dashboard</span>
            <kbd className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-mono">h</kbd>
          </div>
          <div className="flex justify-between items-center border-b border-border pb-2">
            <span className="text-sm text-muted-foreground">Go to Audit Logs</span>
            <kbd className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-mono">l</kbd>
          </div>
          <div className="flex justify-between items-center border-b border-border pb-2">
            <span className="text-sm text-muted-foreground">Create Zone/Record</span>
            <kbd className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-mono">c</kbd>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
