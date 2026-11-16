"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/client";
import { cn } from "@/lib/utils";

const REASONS = [
  { id: "broker", label: "This is a broker" },
  { id: "fake", label: "Fake profile or listing" },
  { id: "harassment", label: "Unsafe or disrespectful" },
  { id: "concern", label: "Something else" },
];

export function SafetyDialog({
  open,
  onOpenChange,
  targetUserId,
  name,
  onBlocked,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUserId: string;
  name: string;
  onBlocked?: () => void;
}) {
  const [kind, setKind] = useState("broker");
  const [reason, setReason] = useState("");
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [busy, setBusy] = useState(false);

  async function send(action: "report" | "block") {
    setBusy(true);
    try {
      await api("/api/safety", {
        method: "POST",
        body: JSON.stringify({
          action,
          targetUserId,
          kind,
          reason,
          alsoBlock: action === "block" ? true : alsoBlock,
        }),
      });
      toast.success(
        action === "block"
          ? `${name} is blocked. They won't show up again.`
          : "Report saved in this demo. A real trust team would review it.",
      );
      onOpenChange(false);
      if (action === "block" || alsoBlock) onBlocked?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save that.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Report {name}</DialogTitle>
          <DialogDescription>
            Reports stay in the local demo database. Blocking hides this person from your deck and closes the chat.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          {REASONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setKind(item.id)}
              className={cn(
                "rounded-xl border px-3 py-2 text-left text-sm",
                kind === item.id ? "border-primary bg-primary/10" : "border-border",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <Textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="What happened? A sentence is enough."
          className="min-h-24 rounded-xl text-base"
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={alsoBlock} onChange={(event) => setAlsoBlock(event.target.checked)} />
          Also block {name}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-11 rounded-full" disabled={busy} onClick={() => send("report")}>
            Report
          </Button>
          <Button variant="destructive" className="h-11 rounded-full" disabled={busy} onClick={() => send("block")}>
            Block
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
