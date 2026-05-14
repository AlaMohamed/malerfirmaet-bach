import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-400 text-white hover:bg-brand-500 focus-visible:ring-brand-300",
  secondary:
    "bg-charcoal text-white hover:bg-charcoal-dark focus-visible:ring-charcoal/40",
  ghost:
    "bg-white/10 text-white border border-white/20 backdrop-blur-sm hover:bg-white/15",
  outline:
    "bg-transparent text-charcoal border border-charcoal/15 hover:border-brand-400 hover:text-charcoal-dark",
};
const sizes: Record<Size, string> = {
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-[15px]",
};

interface BtnProps {
  children: React.ReactNode;
  href?: string;
  type?: "button" | "submit";
  variant?: Variant;
  size?: Size;
  withArrow?: boolean;
  className?: string;
  ariaLabel?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({
  children,
  href,
  type = "button",
  variant = "primary",
  size = "md",
  withArrow = false,
  className,
  ariaLabel,
  onClick,
  disabled,
}: BtnProps) {
  const cls = cn(
    "inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-200",
    variants[variant],
    sizes[size],
    disabled && "opacity-50 cursor-not-allowed pointer-events-none",
    className,
  );
  const content = (
    <>
      {children}
      {withArrow ? <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" /> : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn("group", cls)} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} aria-label={ariaLabel} className={cn("group", cls)} disabled={disabled}>
      {content}
    </button>
  );
}
