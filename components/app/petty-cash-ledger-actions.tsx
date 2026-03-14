"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PettyCashLedgerActions({
  referenceNumber,
  receiptReference,
  notes,
}: {
  referenceNumber: string | null;
  receiptReference: string | null;
  notes: string | null;
}) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const actions = [
    referenceNumber ? { key: "reference", label: "Copy ref", value: referenceNumber } : null,
    receiptReference ? { key: "receipt", label: "Copy receipt", value: receiptReference } : null,
    notes ? { key: "notes", label: "Copy note", value: notes } : null,
  ].filter((action): action is { key: string; label: string; value: string } => Boolean(action));

  if (!actions.length) {
    return <span className="text-xs text-slate-400">No quick action</span>;
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {actions.map((action) => {
        const copied = copiedKey === action.key;
        return (
          <Button
            key={action.key}
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-full px-3 text-xs"
            onClick={async () => {
              await navigator.clipboard.writeText(action.value);
              setCopiedKey(action.key);
              window.setTimeout(() => setCopiedKey(null), 1400);
            }}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : action.label}
          </Button>
        );
      })}
    </div>
  );
}