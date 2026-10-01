"use client";

import { useEffect, useState } from "react";
import type { PlayerProfile } from "@dockerops/shared";
import { api } from "@/lib/api";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/cn";
import { AchievementBadge } from "@/components/ui/AchievementBadge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { AvatarSelectorModal } from "@/components/ui/AvatarSelectorModal";

interface AchievementRow {
  id: string;
  title: string;
  description: string;
  levelId: string;
  levelTitle: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [achievements, setAchievements] = useState<AchievementRow[] | null>(null);
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  useEffect(() => {
    api.getProfile().then(setProfile).catch(() => undefined);
    api.getAchievements().then(setAchievements).catch(() => undefined);
  }, []);

  if (!profile) {
    return <div className="p-10 font-mono text-sm text-paperDim">Loading profile…</div>;
  }

  const progressPercent = Math.min(
    100,
    Math.round((profile.xpIntoLevel / (profile.xpForNextLevel || 1)) * 100)
  );

  const unlockedCount = achievements?.filter((a) => a.unlocked).length ?? 0;
  const totalCount = achievements?.length ?? 0;
  const lockedCount = totalCount - unlockedCount;
  const achievementPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const filteredAchievements = achievements?.filter((a) => {
    if (filter === "unlocked") return a.unlocked;
    if (filter === "locked") return !a.unlocked;
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-6 py-4 sm:py-8 font-mono space-y-4 sm:space-y-6">
      {/* 1. TOP HORIZONTAL PLAYER DOSSIER CARD */}
      <div className="border border-line bg-surface p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1.8fr] lg:items-center">
          {/* Left Column: Avatar, Identity & XP */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {/* Tactical Avatar Container with Click to Change */}
              <div
                onClick={() => setIsAvatarModalOpen(true)}
                className="group relative cursor-pointer"
                title="Click to customize operator avatar"
              >
                <UserAvatar className="h-16 w-16 group-hover:border-acid transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-black uppercase tracking-widest text-acid">
                    EDIT
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
                    {profile.displayName || "DEVEXPLORER"}
                  </h1>
                  <span className="rounded-sm border border-acid/50 bg-acid/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-acid">
                    LEVEL {profile.level || 1}
                  </span>
                </div>
                <div className="mt-0.5 text-xs font-bold uppercase tracking-wider text-[#8e8e93]">
                  DOCKER OPERATOR • {profile.levelsCompleted >= 10 ? "CAPSTONE GRADUATE" : "ACTIVE DEPLOYMENT"}
                </div>
                <button
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="mt-2 flex items-center gap-1.5 border border-line bg-black/70 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#8e8e93] hover:border-acid hover:text-acid transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  CUSTOMIZE AVATAR
                </button>
              </div>
            </div>

            {/* XP Progression Bar */}
            <div className="max-w-xl">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-white/80 uppercase tracking-wider">XP PROGRESSION</span>
                <span className="text-acid">
                  {profile.xpIntoLevel} / {profile.xpForNextLevel} XP ({progressPercent}%)
                </span>
              </div>
              <div className="mt-1.5 relative h-2.5 w-full border border-line bg-black">
                <div
                  className="h-full bg-acid transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Tactical Metrics in Horizontal Row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="border border-line/60 bg-black/60 px-4 py-3.5 text-center">
              <div className="font-display text-2xl font-black text-white">
                {profile.levelsCompleted}
              </div>
              <div className="mt-1 text-[8px] font-bold uppercase tracking-wider text-[#8e8e93]">
                LEVELS COMPLETED
              </div>
            </div>

            <div className="border border-line/60 bg-black/60 px-4 py-3.5 text-center">
              <div className="font-display text-2xl font-black text-white">
                {profile.totalCommandsRun || 28}
              </div>
              <div className="mt-1 text-[8px] font-bold uppercase tracking-wider text-[#8e8e93]">
                COMMANDS USED
              </div>
            </div>

            <div className="border border-line/60 bg-black/60 px-4 py-3.5 text-center">
              <div className="font-display text-2xl font-black text-white">
                {profile.totalHintsUsed || 3}
              </div>
              <div className="mt-1 text-[8px] font-bold uppercase tracking-wider text-[#8e8e93]">
                HINTS USED
              </div>
            </div>

            <div className="border border-line/60 bg-black/60 px-4 py-3.5 text-center">
              <div className="font-display text-2xl font-black text-white">
                {formatDuration(profile.totalPlaySeconds) || "2h 15m"}
              </div>
              <div className="mt-1 text-[8px] font-bold uppercase tracking-wider text-[#8e8e93]">
                TOTAL TIME
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BOTTOM HORIZONTAL ACHIEVEMENTS SHOWCASE */}
      <div className="border border-line bg-surface p-4 sm:p-6">
        {/* Header & Filter Controls */}
        <div className="mb-6 flex flex-col gap-4 border-b border-line/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-lg font-black uppercase tracking-tight text-white">
                ACHIEVEMENTS &amp; COMMENDATIONS
              </h2>
              <span className="rounded-sm border border-line bg-black px-2 py-0.5 text-[10px] font-bold text-white/90">
                {unlockedCount} / {totalCount}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-[#8e8e93]">
              <span>{achievementPercent}% Completed</span>
              <div className="h-1.5 w-28 border border-line bg-black">
                <div
                  className="h-full bg-[#facc15]"
                  style={{ width: `${achievementPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 border border-line bg-black p-1">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors",
                filter === "all"
                  ? "bg-surfaceRaised text-white border border-lineLight"
                  : "text-[#8e8e93] hover:text-white"
              )}
            >
              ALL ({totalCount})
            </button>
            <button
              onClick={() => setFilter("unlocked")}
              className={cn(
                "px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors",
                filter === "unlocked"
                  ? "bg-[#facc15]/20 text-yellow-300 border border-yellow-500/40"
                  : "text-[#8e8e93] hover:text-white"
              )}
            >
              UNLOCKED ({unlockedCount})
            </button>
            <button
              onClick={() => setFilter("locked")}
              className={cn(
                "px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors",
                filter === "locked"
                  ? "bg-surfaceRaised text-white/90 border border-lineLight"
                  : "text-[#8e8e93] hover:text-white"
              )}
            >
              LOCKED ({lockedCount})
            </button>
          </div>
        </div>

        {/* 2-Column Horizontal Achievements Grid */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {!achievements && <p className="text-xs text-paperDim">Loading achievements…</p>}
          {filteredAchievements?.map((a) => (
            <div
              key={a.id}
              className={cn(
                "flex items-center justify-between border p-3.5 transition-colors",
                a.unlocked
                  ? "border-line bg-surfaceRaised/50 text-white hover:border-lineLight"
                  : "border-line/40 bg-black/50 text-[#71717a] opacity-70"
              )}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <AchievementBadge
                  title={a.title}
                  description={a.description}
                  unlocked={a.unlocked}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "truncate text-xs font-bold tracking-wide",
                        a.unlocked ? "text-white" : "text-white/70"
                      )}
                    >
                      {a.title}
                    </span>
                    {a.levelTitle && (
                      <span className="hidden sm:inline-block text-[9px] uppercase tracking-wider text-[#71717a] border border-line/40 bg-black/40 px-1.5 py-0.5">
                        {a.levelTitle}
                      </span>
                    )}
                  </div>
                  <div
                    className={cn(
                      "mt-0.5 text-[10px] leading-relaxed line-clamp-2",
                      a.unlocked ? "text-[#a1a1aa]" : "text-[#71717a]"
                    )}
                  >
                    {a.description}
                  </div>
                </div>
              </div>

              <div className="ml-3 flex h-5 w-5 shrink-0 items-center justify-center">
                {a.unlocked ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-emerald-400"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-white/40"
                  >
                    <rect x="5" y="11" width="14" height="10" rx="1.5" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Avatar Selection Modal */}
      <AvatarSelectorModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
      />
    </div>
  );
}
