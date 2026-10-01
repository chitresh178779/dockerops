"use client";

import { useRouter } from "next/navigation";
import { formatDuration } from "@/lib/format";
import { AchievementBadge } from "@/components/ui/AchievementBadge";

export function MissionCompleteOverlay({
  levelTitle,
  summary,
  xpAwarded,
  commandsRun,
  hintsUsed,
  durationSeconds,
  newlyUnlockedAchievements,
}: {
  levelTitle: string;
  summary: string;
  xpAwarded: number;
  commandsRun: number;
  hintsUsed: number;
  durationSeconds: number;
  newlyUnlockedAchievements: { id: string; title: string; description: string }[];
}) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-xs font-mono">
      <div className="w-full max-w-xl border-2 border-acid bg-black p-8 shadow-glowAcid">
        {/* Header matching wireframe 10 */}
        <div className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[#8e8e93]">
          LEVEL COMPLETE
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_200px]">
          {/* Left Column: Big Checkmark and Mission Complete */}
          <div className="flex flex-col justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-acid bg-acid text-3xl font-black text-black">
                ✓
              </div>
              <div>
                <div className="font-display text-2xl font-black uppercase tracking-tight text-white">
                  MISSION COMPLETE
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-[#a1a1aa]">
                  {summary || "You fixed the missing data issue and ensured uploads persist."}
                </p>
              </div>
            </div>

            {newlyUnlockedAchievements.length > 0 && (
              <div className="mt-4 space-y-2 border-t border-line pt-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-acid">
                  NEW COMMENDATIONS UNLOCKED
                </div>
                {newlyUnlockedAchievements.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 border border-acid/40 bg-surfaceRaised p-2 text-xs text-white"
                  >
                    <AchievementBadge
                      title={a.title}
                      description={a.description}
                      unlocked={true}
                      className="h-8 w-8"
                    />
                    <div>
                      <div className="font-bold text-acid">{a.title}</div>
                      <div className="text-[10px] text-[#8e8e93]">{a.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Stats Box */}
          <div className="flex flex-col justify-between border border-line bg-surfaceRaised p-4 text-xs">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-line/50 pb-1.5">
                <span className="text-[10px] uppercase text-[#8e8e93]">TIME TAKEN</span>
                <span className="font-bold text-white">{formatDuration(durationSeconds)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-line/50 pb-1.5">
                <span className="text-[10px] uppercase text-[#8e8e93]">COMMANDS USED</span>
                <span className="font-bold text-white">{commandsRun}</span>
              </div>
              <div className="flex items-center justify-between border-b border-line/50 pb-1.5">
                <span className="text-[10px] uppercase text-[#8e8e93]">HINTS USED</span>
                <span className="font-bold text-white">{hintsUsed}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] uppercase text-[#8e8e93]">XP EARNED</span>
                <span className="font-display text-base font-black text-acid">+{xpAwarded || 400}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-2">
          <button
            onClick={() => router.push("/levels")}
            className="flex w-full items-center justify-center gap-2 border border-acid bg-acid px-6 py-3 text-xs font-black uppercase tracking-wider text-black transition-all hover:brightness-105 active:translate-y-px"
          >
            CONTINUE <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
