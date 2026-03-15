"use client";

import { useState } from "react";
import { CheckCircle2, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { buildPettyCashCsv, type PettyCashLedgerRow } from "@/lib/petty-cash";

function downloadFile(filename: string, contents: string, mimeType: string) {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function PettyCashExportButton({ rows }: { rows: PettyCashLedgerRow[] }) {
  const [downloaded, setDownloaded] = useState(false);

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => {
        if (!rows.length) {
          return;
        }

        downloadFile(
          `petty-cash-ledger-${new Date().toISOString().slice(0, 10)}.csv`,
          buildPettyCashCsv(rows),
          "text/csv;charset=utf-8",
        );
        setDownloaded(true);
        window.setTimeout(() => setDownloaded(false), 1800);
      }}
      disabled={!rows.length}
    >
      {downloaded ? <CheckCircle2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
      {downloaded ? "Downloaded" : "Export CSV"}
    </Button>
  );
}
