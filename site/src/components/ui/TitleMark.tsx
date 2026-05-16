/**
 * TitleMark — emphasis span used inside section titles.
 *
 * Centralises the "one word in a title gets a brand-coloured accent"
 * pattern so every page-level headline applies the same treatment.
 * Uses <em> for semantic emphasis (matters for screen readers and SEO)
 * and overrides the default italic with `not-italic` so the style
 * decision is purely a colour shift.
 *
 *   <h2>Hvad du kan <TitleMark>forvente</TitleMark></h2>
 *
 * The `tone` prop picks a palette that reads well on the surrounding
 * background — light tone for dark hero overlays, default for the
 * cream/white body surfaces.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface TitleMarkProps {
  children: ReactNode;
  tone?: "default" | "light";
  className?: string;
}

export function TitleMark({ children, tone = "default", className }: TitleMarkProps) {
  return (
    <em
      className={cn(
        "not-italic",
        tone === "light" ? "text-brand-200" : "text-brand-400",
        className,
      )}
    >
      {children}
    </em>
  );
}
