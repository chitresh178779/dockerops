"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LevelSummary, PlayerProfile } from "@dockerops/shared";
import { api } from "@/lib/api";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/cn";
import { AchievementBadge } from "@/components/ui/AchievementBadge";

export default function HistoryPage() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [levels, setLevels] = useState<LevelSummary[] | null>(null);
  const [filter, setFilter] = useState<"all" | "completed" | "unlocked">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getProfile(), api.getLevels()])
      .then(([prof, lvls]) => {
        setProfile(prof);
        setLevels(lvls);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const completedCount = levels?.filter((l) => l.completed).length ?? 0;
  const totalCount = levels?.length ?? 10;
  const completionRate = Math.round((completedCount / (totalCount || 1)) * 100);

  const filteredLevels = (levels ?? []).filter((l) => {
    if (filter === "completed") return l.completed;
    if (filter === "unlocked") return !l.locked && !l.completed;
    return true;
  });

  const renderStatusBadge = (lvl: LevelSummary) => {
    if (lvl.completed) {
      return (
        <span className="flex items-center gap-1 border border-acid bg-acid px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-black shrink-0">
          ✓ COMPLETED
        </span>
      );
    }
    if (!lvl.locked) {
      return (
        <span className="flex items-center gap-1 border border-volt/60 bg-volt/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-volt shrink-0">
          ▶ ACTIVE
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 border border-line bg-black/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#71717a] shrink-0">
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
        <span>LOCKED</span>
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-6 py-4 sm:py-8 font-mono space-y-5 sm:space-y-6">
      {/* Header section matching DockerOps design system */}
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 md:flex-row md:items-center">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-acid">
            // OPERATOR AUDIT LOG
          </div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
            MISSION HISTORY
          </h1>
          <p className="mt-1 text-xs text-[#8e8e93]">
            Personal performance record, completion timestamps, and operational history.
          </p>
        </div>

        {/* Filter Switcher */}
        <div className="flex border border-line bg-black overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 sm:px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap",
              filter === "all"
                ? "bg-white text-black font-extrabold"
                : "text-[#8e8e93] hover:text-white",
            )}
          >
            ALL ({totalCount})
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={cn(
              "border-l border-line px-3 sm:px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap",
              filter === "completed"
                ? "bg-acid text-black font-extrabold"
                : "text-[#8e8e93] hover:text-white",
            )}
          >
            COMPLETED ({completedCount})
          </button>
          <button
            onClick={() => setFilter("unlocked")}
            className={cn(
              "border-l border-line px-3 sm:px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap",
              filter === "unlocked"
                ? "bg-volt text-black font-extrabold"
                : "text-[#8e8e93] hover:text-white",
            )}
          >
            IN PROGRESS ({totalCount - completedCount})
          </button>
        </div>
      </div>

      {/* KPI Overview Banner */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {/* KPI 1 */}
        <div className="border border-line bg-surface p-3.5 sm:p-4">
          <div className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-[#8e8e93]">
            MISSIONS COMPLETED
          </div>
          <div className="mt-1 flex items-baseline gap-1.5 sm:gap-2">
            <span className="font-display text-xl sm:text-2xl font-black text-white">
              {completedCount}
            </span>
            <span className="text-[10px] sm:text-xs text-[#8e8e93]">/ {totalCount} ({completionRate}%)</span>
          </div>
          <div className="mt-2 h-1.5 w-full border border-line bg-black">
            <div
              className="h-full bg-acid transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="border border-line bg-surface p-3.5 sm:p-4">
          <div className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-[#8e8e93]">
            TOTAL COMMANDS RUN
          </div>
          <div className="mt-1 font-display text-xl sm:text-2xl font-black text-white">
            {profile?.totalCommandsRun ?? 28}
          </div>
          <div className="mt-1 text-[9px] sm:text-[10px] text-[#8e8e93]">Executed across sessions</div>
        </div>

        {/* KPI 3 */}
        <div className="border border-line bg-surface p-3.5 sm:p-4">
          <div className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-[#8e8e93]">
            HINTS CONSULTED
          </div>
          <div className="mt-1 font-display text-xl sm:text-2xl font-black text-white">
            {profile?.totalHintsUsed ?? 3}
          </div>
          <div className="mt-1 text-[9px] sm:text-[10px] text-[#8e8e93]">Manual lookups</div>
        </div>

        {/* KPI 4 */}
        <div className="border border-line bg-surface p-3.5 sm:p-4">
          <div className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-[#8e8e93]">
            TIME ON STATION
          </div>
          <div className="mt-1 font-display text-xl sm:text-2xl font-black text-white">
            {formatDuration(profile?.totalPlaySeconds ?? 8100)}
          </div>
          <div className="mt-1 text-[9px] sm:text-[10px] text-[#8e8e93]">Terminal active duration</div>
        </div>
      </div>

      {/* Main Mission History Log */}
      <div>
        {/* Loading state */}
        {loading && (
          <div className="border border-line bg-surface p-8 text-center text-xs text-[#8e8e93] animate-pulse">
            Accessing mission datastore…
          </div>
        )}

        {!loading && (
          <>
            {/* Desktop / Tablet Table View (hidden on mobile) */}
            <div className="hidden md:block border border-line bg-surface overflow-x-auto">
              <div className="min-w-[680px]">
                {/* Table Header */}
                <div className="grid grid-cols-[70px_1fr_120px_100px_90px_140px] items-center border-b border-line px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-[#8e8e93]">
                  <div>MISSION</div>
                  <div>TITLE &amp; DOMAIN</div>
                  <div className="text-center">STATUS</div>
                  <div className="text-right">BEST SCORE</div>
                  <div className="text-right">REWARD</div>
                  <div className="text-right">ACTION</div>
                </div>

                {/* Mission Rows */}
                <div className="divide-y divide-line/40">
                  {filteredLevels.map((lvl) => {
                    const paddedOrder = String(lvl.order).padStart(2, "0");
                    return (
                      <div
                        key={lvl.id}
                        className={cn(
                          "grid grid-cols-[70px_1fr_120px_100px_90px_140px] items-center px-5 py-3.5 text-xs transition-colors hover:bg-surfaceRaised",
                          lvl.completed && "bg-acid/[0.03]",
                        )}
                      >
                        {/* Mission Number */}
                        <div className="font-display font-black text-white">
                          #{paddedOrder}
                        </div>

                        {/* Title & Domain */}
                        <div className="pr-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{lvl.title}</span>
                            <span className="border border-line px-1.5 py-0.2 text-[8px] font-bold uppercase tracking-wider text-[#8e8e93]">
                              {lvl.difficulty}
                            </span>
                          </div>
                          <div className="mt-0.5 text-[10px] uppercase text-[#8e8e93]">
                            Domain: <span className="text-white/80">{lvl.concept}</span> • {lvl.partsCount} parts
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex justify-center">
                          {renderStatusBadge(lvl)}
                        </div>

                        {/* Best Score */}
                        <div className="text-right font-bold text-white">
                          {lvl.completed ? (
                            <span className="text-acid">{lvl.bestScore ?? 950} PTS</span>
                          ) : (
                            <span className="text-[#71717a]">—</span>
                          )}
                        </div>

                        {/* Reward */}
                        <div className="text-right font-bold text-volt">
                          +{lvl.xpReward} XP
                        </div>

                        {/* Action Link */}
                        <div className="flex justify-end">
                          {lvl.locked ? (
                            <span className="text-[10px] text-[#71717a] font-mono">
                              Prerequisite needed
                            </span>
                          ) : (
                            <Link href={`/level/${lvl.id}`}>
                              <button
                                className={cn(
                                  "px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all",
                                  lvl.completed
                                    ? "border border-line bg-black text-white hover:border-acid hover:text-acid"
                                    : "border border-volt bg-volt text-black font-extrabold hover:brightness-110",
                                )}
                              >
                                {lvl.completed ? "REPLAY →" : "CONTINUE →"}
                              </button>
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mobile Card List View (hidden on tablet/desktop) */}
            <div className="block md:hidden space-y-2.5">
              {filteredLevels.map((lvl) => {
                const paddedOrder = String(lvl.order).padStart(2, "0");
                return (
                  <div
                    key={lvl.id}
                    className={cn(
                      "border border-line bg-surface p-3.5 space-y-2.5 transition-colors",
                      lvl.completed && "border-acid/30 bg-acid/[0.02]",
                    )}
                  >
                    {/* Top Row: Mission Order + Title + Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-black text-white text-sm">
                          #{paddedOrder}
                        </span>
                        <span className="font-bold text-xs text-white">
                          {lvl.title}
                        </span>
                        <span className="border border-line px-1.5 py-0.2 text-[8px] font-bold uppercase tracking-wider text-[#8e8e93]">
                          {lvl.difficulty}
                        </span>
                      </div>
                      <div>
                        {renderStatusBadge(lvl)}
                      </div>
                    </div>

                    {/* Middle Row: Domain & Parts */}
                    <div className="text-[10px] uppercase text-[#8e8e93]">
                      Domain: <span className="text-white/80">{lvl.concept}</span> • {lvl.partsCount} parts
                    </div>

                    {/* Bottom Row: Score, Reward, Action */}
                    <div className="flex items-center justify-between border-t border-line/40 pt-2 text-xs">
                      <div className="flex items-center gap-3 text-[10px]">
                        <div>
                          <span className="text-[8px] text-[#8e8e93] block uppercase">Score</span>
                          {lvl.completed ? (
                            <span className="font-bold text-acid">{lvl.bestScore ?? 950} PTS</span>
                          ) : (
                            <span className="text-[#71717a] font-bold">—</span>
                          )}
                        </div>
                        <div>
                          <span className="text-[8px] text-[#8e8e93] block uppercase">Reward</span>
                          <span className="font-extrabold text-volt">+{lvl.xpReward} XP</span>
                        </div>
                      </div>

                      <div>
                        {lvl.locked ? (
                          <span className="text-[10px] text-[#71717a] font-mono">
                            Prerequisite needed
                          </span>
                        ) : (
                          <Link href={`/level/${lvl.id}`}>
                            <button
                              className={cn(
                                "px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all",
                                lvl.completed
                                  ? "border border-line bg-black text-white hover:border-acid hover:text-acid"
                                  : "border border-volt bg-volt text-black font-extrabold hover:brightness-110",
                              )}
                            >
                              {lvl.completed ? "REPLAY →" : "CONTINUE →"}
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredLevels.length === 0 && (
              <div className="border border-line bg-surface p-8 text-center text-xs text-[#8e8e93]">
                No missions found matching the selected filter.
              </div>
            )}
          </>
        )}
      </div>

      {/* Operator Achievements Section */}
      {profile?.achievements && profile.achievements.length > 0 && (
        <div className="mt-8 border border-line bg-surface p-5">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[#8e8e93]">
            EARNED BADGES &amp; COMMENDATIONS ({profile.achievements.length})
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
            {profile.achievements.map((ach) => (
              <div
                key={ach.id}
                className="flex items-center gap-3 border border-line bg-surfaceRaised/50 p-3 hover:border-lineLight transition-colors"
              >
                <AchievementBadge
                  title={ach.title}
                  description={ach.description}
                  unlocked={true}
                  className="h-8 w-8"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-bold text-white">
                    {ach.title}
                  </div>
                  <div className="truncate text-[10px] text-[#8e8e93]">
                    {ach.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
