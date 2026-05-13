"use client";

import { createContext, useContext, useOptimistic } from "react";

export type PendingOvertimeRow = {
  tempId: string;
  workedDate: string;
  startTimeLabel: string;
  endTimeLabel: string;
  overnight: boolean;
  totalWorkedLabel: string;
  overtimeLabel: string;
  amountLabel: string;
  isWeekend: boolean;
  isHoliday: boolean;
};

type Ctx = {
  pendingRows: PendingOvertimeRow[];
  addPending: (row: PendingOvertimeRow) => void;
};

const Context = createContext<Ctx | null>(null);

export function OvertimePendingProvider({ children }: { children: React.ReactNode }) {
  const [pendingRows, addPending] = useOptimistic(
    [] as PendingOvertimeRow[],
    (current, optimistic: PendingOvertimeRow) => [optimistic, ...current],
  );

  return (
    <Context.Provider value={{ pendingRows, addPending }}>
      {children}
    </Context.Provider>
  );
}

export function useOvertimePending() {
  return useContext(Context);
}
