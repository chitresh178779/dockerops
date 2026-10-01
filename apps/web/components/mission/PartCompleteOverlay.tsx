"use client";

import type { PublicLevel } from "@/lib/api";
import { cn } from "@/lib/cn";

export function PartCompleteOverlay({
  level,
  completedPartIds,
  justCompletedPartId,
  onContinue,
}: {
  level: PublicLevel;
  completedPartIds: Set<string>;
  justCompletedPartId: string;
  onContinue: () => void;
}) {
  const justCompleted = level.parts.find((p) => p.id === justCompletedPartId);
  if (!justCompleted) return null;
  const index = level.parts.findIndex((p) => p.id === justCompletedPartId);
  const doneCount = level.parts.filter((p) => completedPartIds.has(p.id)).length;
  const partialXp = Math.round((level.metadata.xpReward * doneCount) / level.parts.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-xs font-mono">
      <div className="w-full max-w-xl border-2 border-acid bg-black p-8 shadow-glowAcid">
        {/* Top Header matching wireframe 09 */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-acid bg-acid text-2xl font-black text-black">
            ✓
          </div>
          <div>
            <div className="font-display text-2xl font-black uppercase tracking-tight text-acid">
              PART {index + 1} COMPLETE
            </div>
            <p className="mt-1 text-xs text-[#a1a1aa] leading-relaxed">
              {justCompleted.objective || "You have identified the issue with data persistence."}
            </p>
          </div>
        </div>

        {/* Content Body: Checklist on Left, Rewards on Right */}
        <div className="mt-6 grid grid-cols-[1fr_auto] gap-4">
          <div className="space-y-2">
            {level.parts.map((p) => {
              const done = completedPartIds.has(p.id);
              return (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center gap-3 border p-2.5 text-xs transition-colors",
                    done
                      ? "border-acid/50 bg-[#08180e] text-white"
                      : "border-line bg-surfaceRaised text-[#8e8e93]",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center text-[10px] font-black",
                      done ? "bg-acid text-black" : "border border-line text-transparent",
                    )}
                  >
                    {done ? "✓" : ""}
                  </span>
                  <span className="font-bold">{p.title}</span>
                </div>
              );
            })}
          </div>

          {/* Rewards card on right */}
          <div className="flex w-36 shrink-0 flex-col items-center justify-center border border-line bg-surfaceRaised p-4 text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#8e8e93]">
              REWARDS
            </div>
            <div className="my-1.5 font-display text-2xl font-black text-acid">
              +{partialXp || 200} XP
            </div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-[#71717a]">
              LEVEL PROGRESS
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-2">
          <button
            onClick={onContinue}
            className="flex w-full items-center justify-center gap-2 border border-acid bg-acid px-6 py-3 text-xs font-black uppercase tracking-wider text-black transition-all hover:brightness-105 active:translate-y-px"
          >
            CONTINUE <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
