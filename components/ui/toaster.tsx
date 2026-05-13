"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info" | "warning";

type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
};

type Toast = ToastInput & {
  id: number;
  tone: ToastTone;
};

type ToasterCtx = {
  toast: (input: ToastInput) => void;
};

const Context = createContext<ToasterCtx | null>(null);

const ICONS: Record<ToastTone, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: TriangleAlert,
};

const TONE_STYLES: Record<ToastTone, string> = {
  success: "border-mint-100 bg-white text-text-primary [&_[data-icon]]:text-mint-600",
  error: "border-danger-50 bg-white text-text-primary [&_[data-icon]]:text-danger-600",
  info: "border-primary-100 bg-white text-text-primary [&_[data-icon]]:text-primary-700",
  warning: "border-accent-100 bg-white text-text-primary [&_[data-icon]]:text-accent-600",
};

export function Toaster({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const toast = useCallback((input: ToastInput) => {
    const id = ++counterRef.current;
    const next: Toast = {
      id,
      title: input.title,
      description: input.description,
      tone: input.tone ?? "success",
      duration: input.duration ?? 3200,
    };
    setToasts((curr) => [...curr, next]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((curr) => curr.filter((t) => t.id !== id));
  }, []);

  return (
    <Context.Provider value={{ toast }}>
      {children}
      {/* Toast container — bottom on mobile (above bottom nav), bottom-right on desktop */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-[6.25rem] z-50 flex flex-col items-center gap-2 px-4 lg:bottom-4 lg:right-4 lg:left-auto lg:items-end lg:px-0"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </Context.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const Icon = ICONS[toast.tone];

  useEffect(() => {
    if (!toast.duration) return;
    const timer = window.setTimeout(onDismiss, toast.duration);
    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.duration]);

  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-elevated animate-fade-up",
        TONE_STYLES[toast.tone],
      )}
    >
      <Icon data-icon="" className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="font-display text-sm font-semibold leading-tight text-text-primary">{toast.title}</p>
        {toast.description ? (
          <p className="text-sm leading-5 text-text-secondary">{toast.description}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="tap-highlight -my-1 -mr-2 inline-flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-surface-muted hover:text-text-primary"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(Context);
  if (!ctx) {
    // Allow components rendered outside the Toaster (e.g. in tests) to no-op gracefully.
    return (_input: ToastInput) => {};
  }
  return ctx.toast;
}
