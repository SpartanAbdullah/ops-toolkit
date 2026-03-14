import { cn } from "@/lib/utils";

type SectionShellProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  children: React.ReactNode;
};

export function SectionShell({
  id,
  eyebrow,
  title,
  description,
  align = "left",
  className,
  headerClassName,
  contentClassName,
  children,
}: SectionShellProps) {
  return (
    <section id={id} className={cn("section-divider py-16 md:py-24", className)}>
      <div className="container">
        <div className={cn("max-w-3xl space-y-5", align === "center" && "mx-auto text-center", headerClassName)}>
          {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">{eyebrow}</p> : null}
          <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl xl:text-[2.7rem]">
            {title}
          </h2>
          {description ? <p className="text-base leading-8 text-slate-600 md:text-lg">{description}</p> : null}
        </div>
        <div className={cn("mt-10 md:mt-12", contentClassName)}>{children}</div>
      </div>
    </section>
  );
}