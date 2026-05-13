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
    referenceNumber ? { key: "reference", label: "Ref", value: referenceNumber } : null,
    receiptReference ? { key: "receipt", label: "Receipt", value: receiptReference } : null,
    notes ? { key: "notes", label: "Note", value: notes } : null,
  ].filter((action): action is { key: string; label: string; value: string } => Boolean(action));

  if (!actions.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {actions.map((action) => {
        const copied = copiedKey === action.key;
        return (
          <Button
            key={action.key}
            type="button"
            variant="outline"
            size="xs"
            className="h-7 rounded-full text-2xs"
            onClick={async () => {
              await navigator.clipboard.writeText(action.value);
              setCopiedKey(action.key);
              window.setTimeout(() => setCopiedKey(null), 1400);
            }}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : `Copy ${action.label}`}
          </Button>
        );
      })}
    </div>
  );
}
