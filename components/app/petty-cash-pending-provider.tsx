"use client";

import { createContext, useContext, useOptimistic } from "react";

import type { PettyCashTransactionTypeValue } from "@/lib/petty-cash";

export type PendingPettyCashRow = {
  tempId: string;
  type: PettyCashTransactionTypeValue;
  typeLabel: string;
  category: string;
  amount: number;
  occurredAt: string;
};

type Ctx = {
  pendingRows: PendingPettyCashRow[];
  addPending: (row: PendingPettyCashRow) => void;
};

const Context = createContext<Ctx | null>(null);

export function PettyCashPendingProvider({ children }: { children: React.ReactNode }) {
  const [pendingRows, addPending] = useOptimistic(
    [] as PendingPettyCashRow[],
    (current, optimistic: PendingPettyCashRow) => [optimistic, ...current],
  );

  return (
    <Context.Provider value={{ pendingRows, addPending }}>
      {children}
    </Context.Provider>
  );
}

export function usePettyCashPending() {
  return useContext(Context);
}
