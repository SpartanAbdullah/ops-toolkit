import { cn } from "@/lib/utils";

type StickyActionBarProps = {
  children: React.ReactNode;
  className?: string;
  offsetForMobileNav?: boolean;
};

export function StickyActionBar({
  children,
  className,
  offsetForMobileNav = false,
}: StickyActionBarProps) {
  return (
    <div
      className={cn(
        "sticky z-20 mt-8 rounded-[1.4rem] border border-border bg-white/96 px-4 py-4 shadow-[0_-10px_30px_-24px_rgba(15,23,42,0.45)] backdrop-blur supports-[backdrop-filter]:bg-white/88 sm:px-5",
        offsetForMobileNav ? "bottom-24 lg:bottom-0" : "bottom-0",
        className,
      )}
      style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
    >
      {children}
    </div>
  );
}
