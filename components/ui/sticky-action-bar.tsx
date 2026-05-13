import { cn } from "@/lib/utils";

type StickyActionBarProps = {
  children: React.ReactNode;
  className?: string;
};

export function StickyActionBar({ children, className }: StickyActionBarProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 -mx-5 mt-6 border-t border-border bg-white/96 px-5 py-4 backdrop-blur supports-[backdrop-filter]:bg-white/90 sm:-mx-6 sm:px-6",
        className,
      )}
      style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
    >
      {children}
    </div>
  );
}
