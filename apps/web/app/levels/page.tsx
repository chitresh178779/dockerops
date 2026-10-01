"use client";

import { useEffect, useState } from "react";
import type { LevelSummary } from "@dockerops/shared";
import { api } from "@/lib/api";
import { LevelMapCard } from "@/components/level-map/LevelMapCard";
import { LevelSidebarList } from "@/components/level-map/LevelSidebarList";
import { LevelDetailPanel } from "@/components/level-map/LevelDetailPanel";
import { LevelStructurePanel } from "@/components/level-map/LevelStructurePanel";
import { UnlocksPanel } from "@/components/level-map/UnlocksPanel";
import { HowLevelsAddedSection } from "@/components/level-map/HowLevelsAddedSection";

export default function LevelMapPage() {
  const [levels, setLevels] = useState<LevelSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    api
      .getLevels()
      .then((data) => {
        const sorted = data.sort((a, b) => a.order - b.order);
        setLevels(sorted);
        // Default select level 4 if present to match the reference UI, or first active
        setSelectedId((prev) => prev ?? sorted.find((l) => l.order === 4)?.id ?? sorted[0]?.id ?? null);
      })
      .catch((e) => setError(String(e.message ?? e)));
  }, []);

  const selected = levels?.find((l) => l.id === selectedId) ?? null;
  const currentId = levels?.find((l) => !l.completed && !l.locked)?.id ?? null;

  if (error) {
    return (
      <div className="p-10 font-mono text-sm text-incident">
        Could not reach the DockerOps API. Is the backend running?
        <div className="mt-1 text-xs text-paperDim">{error}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1520px] space-y-4 px-3 sm:px-6 py-4 sm:py-6 font-mono">
      {/* Top Banner Header matching Image 1 */}
      <div className="flex flex-col justify-between border border-line bg-surface p-4 sm:p-6 lg:flex-row lg:items-center">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-white">
            LEVEL MAP.
          </h1>
          <p className="mt-1 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#8e8e93]">
            LEARN DOCKER THROUGH REAL PRODUCTION SCENARIOS.
          </p>
        </div>

        {/* Stats Row */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-wrap items-stretch lg:items-center gap-2 sm:gap-3 lg:mt-0">
          {/* MVP INFO yellow badge card */}
          <div className="flex flex-col items-center justify-center border border-line bg-surfaceRaised px-3 py-2 text-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#8e8e93]">
              MVP INFO
            </span>
            <div className="mt-1 bg-volt px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-black">
              10 LEVELS IN MVP
            </div>
          </div>

          {/* 20-30 MIN / LEVEL */}
          <div className="flex flex-col items-center justify-center border border-line bg-surfaceRaised px-4 py-2 text-center min-w-[90px]">
            <span className="font-display text-lg font-bold text-white">20-30</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#8e8e93]">
              MIN / LEVEL
            </span>
          </div>

          {/* 2-3 PARTS / LEVEL */}
          <div className="flex flex-col items-center justify-center border border-line bg-surfaceRaised px-4 py-2 text-center min-w-[90px]">
            <span className="font-display text-lg font-bold text-white">2-3</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#8e8e93]">
              PARTS / LEVEL
            </span>
          </div>

          {/* ~5 HOURS TOTAL PLAYTIME */}
          <div className="flex flex-col items-center justify-center border border-line bg-surfaceRaised px-4 py-2 text-center min-w-[100px]">
            <span className="font-display text-lg font-bold text-white">~5 HOURS</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#8e8e93]">
              TOTAL PLAYTIME
            </span>
          </div>

          {/* MORE LEVELS box */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex items-center gap-2.5 border border-line bg-surfaceRaised px-4 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-dashed border-white/50 text-white">
              <span className="text-xs font-mono">[]</span>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase text-white">MORE LEVELS</div>
              <div className="text-[8px] font-bold uppercase tracking-wider text-[#8e8e93]">
                EASILY ADD NEW LEVELS VIA SCENARIO FILES
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal MVP Levels Progression Bar matching Image 1 */}
      <div className="border border-line bg-surface p-4">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[#8e8e93]">
          MVP LEVELS ({levels ? levels.length : 10})
        </div>
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 px-1 scrollbar-thin">
          {!levels && <p className="text-xs text-paperDim">Loading mission roster…</p>}
          {levels?.map((level, idx) => (
            <div key={level.id} className="flex items-center gap-2 shrink-0">
              <LevelMapCard
                level={level}
                current={level.id === currentId}
                selected={level.id === selectedId}
                onSelect={() => setSelectedId(level.id)}
              />
              {idx < levels.length - 1 && (
                <span className="text-xs font-mono text-[#555555]">&gt;</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Middle 3 Columns matching Image 1 */}
      {levels && selected && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[200px_1fr_360px]">
          {/* Column 1: Vertical Sidebar List (Desktop only to prevent redundant vertical scrolling on mobile) */}
          <div className="hidden lg:block h-full">
            <LevelSidebarList levels={levels} selectedId={selectedId} onSelect={setSelectedId} />
          </div>

          {/* Column 2: Selected Level Detail Panel with Red-Black Illustration */}
          <div className="min-w-0">
            <LevelDetailPanel summary={selected} />
          </div>

          {/* Column 3: Level Structure and Unlocks */}
          <div className="space-y-4">
            <LevelStructurePanel />
            <UnlocksPanel />
          </div>
        </div>
      )}

      {/* Bottom Section: How New Levels Are Added + Post MVP */}
      <HowLevelsAddedSection />
    </div>
  );
}
