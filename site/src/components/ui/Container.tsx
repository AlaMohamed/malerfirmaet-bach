import type { JSX } from "react";
import { cn } from "@/lib/cn";

export function Container({
  children,
  className,
  as: As = "div",
}: {
  children: React.ReactNode;
  className?: string;
  // React 19 removed the global JSX namespace; import it explicitly from
  // "react" instead. JSX.IntrinsicElements is still the right type.
  as?: keyof JSX.IntrinsicElements;
}) {
  return (
    <As className={cn("mx-auto w-full max-w-7xl px-6 lg:px-12", className)}>
      {children}
    </As>
  );
}
