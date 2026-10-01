import { cn } from "@/lib/cn";

export function ProgressBar({
  value,
  max,
  tone = "acid",
  className,
}: {
  value: number;
  max: number;
  tone?: "acid" | "incident" | "info";
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const fill = tone === "acid" ? "bg-acid" : tone === "incident" ? "bg-incident" : "bg-info";
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-surfaceRaised", className)}>
      <div className={cn("h-full rounded-full transition-all", fill)} style={{ width: `${pct}%` }} />
    </div>
  );
}
