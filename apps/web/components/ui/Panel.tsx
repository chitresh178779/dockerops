import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Panel({
  title,
  action,
  children,
  className,
  bodyClassName,
  tone = "neutral",
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  tone?: "neutral" | "acid" | "incident";
}) {
  return (
    <div
      className={cn(
        "flex flex-col border border-line bg-surface font-mono",
        tone === "acid" && "border-acid/60 shadow-glowAcid",
        tone === "incident" && "border-incident/60 shadow-glowIncident",
        className,
      )}
    >
      {title && (
        <div className="flex items-center justify-between border-b border-line bg-surfaceRaised/80 px-3 py-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8e8e93]">{title}</span>
          {action}
        </div>
      )}
      <div className={cn("min-h-0 flex-1", bodyClassName)}>{children}</div>
    </div>
  );
}
