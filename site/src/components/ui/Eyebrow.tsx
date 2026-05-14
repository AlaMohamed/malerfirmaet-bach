import { cn } from "@/lib/cn";

export function Eyebrow({
  children,
  className,
  tone = "brand",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "brand" | "light";
}) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-widest",
        tone === "brand" ? "text-brand-500" : "text-brand-200",
        className,
      )}
    >
      <span
        className={cn(
          "h-px w-6",
          tone === "brand" ? "bg-brand-400" : "bg-brand-300/60",
        )}
        aria-hidden="true"
      />
      {children}
    </p>
  );
}
