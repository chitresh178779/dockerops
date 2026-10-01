"use client";

import type { LevelSummary } from "@dockerops/shared";
import { cn } from "@/lib/cn";

export function LevelSidebarList({
  levels,
  selectedId,
  onSelect,
}: {
  levels: LevelSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex h-full flex-col border border-line bg-surface p-1.5 font-mono">
      {levels.map((l) => {
        const isSelected = selectedId === l.id;
        return (
          <button
            key={l.id}
            onClick={() => !l.locked && onSelect(l.id)}
            disabled={l.locked}
            className={cn(
              "flex items-center gap-3.5 px-3 py-2 text-left text-xs transition-all duration-150 rounded-none disabled:cursor-not-allowed disabled:opacity-30",
              isSelected
                ? "bg-volt text-black font-bold shadow-[0_0_10px_rgba(226,255,50,0.2)] translate-x-1"
                : "text-white/80 hover:bg-surfaceRaised hover:text-white hover:translate-x-0.5",
            )}
          >
            <span className="w-5 shrink-0 font-mono font-bold">
              {String(l.order).padStart(2, "0")}
            </span>
            <span className="flex-1 truncate font-medium">{l.title}</span>
            {l.completed && !isSelected && (
              <span className="text-[10px] text-acid font-bold">✓</span>
            )}
            {l.locked && !isSelected && (
              <svg
                className="h-3 w-3 text-[#71717a]"
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
            )}
          </button>
        );
      })}
    </div>
  );
}
