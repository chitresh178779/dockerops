import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

const TONES = {
  neutral: "border-line text-paper/70 bg-surfaceRaised",
  acid: "border-acid/40 text-acid bg-acid/10",
  incident: "border-incident/40 text-incident bg-incident/10",
  warn: "border-warn/40 text-warn bg-warn/10",
  info: "border-info/40 text-info bg-info/10",
} as const;

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof TONES; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        TONES[tone],
      )}
    >
      {children}
    </span>
  );
}
