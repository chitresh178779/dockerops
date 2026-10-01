"use client";

import type { LevelSummary } from "@dockerops/shared";
import { LevelIcon } from "@/components/ui/LevelIcon";
import { LEVEL_TAGLINES } from "./taglines";
import { cn } from "@/lib/cn";

export function LevelMapCard({
  level,
  current,
  selected,
  onSelect,
}: {
  level: LevelSummary;
  current: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const isTroubleshoot = level.order === 7;

  return (
    <button
      onClick={onSelect}
      disabled={level.locked}
      className={cn(
        "group flex w-[140px] shrink-0 flex-col justify-between border bg-black p-2.5 text-left transition-all duration-200 min-h-[145px]",
        selected
          ? "border-acid ring-1 ring-acid/40 shadow-[0_0_15px_rgba(0,255,102,0.2)]"
          : "border-line hover:border-lineLight hover:bg-surfaceRaised/40",
        level.locked && "opacity-40 cursor-not-allowed hover:border-line hover:bg-black",
      )}
    >
      {/* Top Row: Number + Icon */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "font-display text-sm font-bold",
            isTroubleshoot ? "text-incident" : "text-acid",
          )}
        >
          {String(level.order).padStart(2, "0")}
        </span>
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center text-white",
            isTroubleshoot ? "text-incident" : "text-white",
          )}
        >
          <LevelIcon order={level.order} className="h-4 w-4" />
        </span>
      </div>

      {/* Title & Description */}
      <div className="my-1.5 flex flex-col gap-0.5">
        <div className="font-mono text-[10px] font-bold uppercase leading-tight text-white line-clamp-2">
          {level.title}
        </div>
        <p className="font-mono text-[8px] leading-tight text-[#8e8e93] line-clamp-2">
          {LEVEL_TAGLINES[level.id] ?? level.concept}
        </p>
      </div>

      {/* Bottom Row: Parts Count + Status Indicator */}
      <div className="mt-auto flex items-center justify-between border-t border-line/40 pt-1 font-mono text-[9px]">
        <span className="font-semibold uppercase tracking-wider text-[#a1a1aa]">
          {level.partsCount} PARTS
        </span>
        {level.completed ? (
          <span
            className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-acid text-[8px] font-black text-black"
            title="Completed"
          >
            ✓
          </span>
        ) : level.locked ? (
          <span
            className="flex h-3.5 w-3.5 items-center justify-center text-[#71717a]"
            title={level.lockedReason ?? "Locked (Complete prerequisites first)"}
          >
            <svg
              className="h-3 w-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
        ) : (
          <span
            className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-volt/80 bg-volt/20 pl-0.5 text-[7px] font-black text-volt"
            title="Active / Ready"
          >
            ▶
          </span>
        )}
      </div>
    </button>
  );
}
