"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { LevelSummary } from "@dockerops/shared";
import { api, type PublicLevel } from "@/lib/api";
import { LEVEL_TAGLINES } from "./taglines";
import { cn } from "@/lib/cn";

const TABS = ["OVERVIEW", "PARTS", "LEARNING GOALS", "SCENARIO"] as const;
type Tab = (typeof TABS)[number];

const KIND_COLORS: Record<string, string> = {
  investigate: "border-sky-500/40 text-sky-400 bg-sky-500/10",
  fix: "border-volt/40 text-volt bg-volt/10",
  verify: "border-acid/40 text-acid bg-acid/10",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "text-acid border-acid/40 bg-acid/10",
  medium: "text-volt border-volt/40 bg-volt/10",
  hard: "text-incident border-incident/40 bg-incident/10",
};

export function LevelDetailPanel({ summary }: { summary: LevelSummary }) {
  const [level, setLevel] = useState<PublicLevel | null>(null);
  const [tab, setTab] = useState<Tab>("OVERVIEW");
  const [direction, setDirection] = useState<"right" | "left">("right");

  const handleTabChange = (newTab: Tab) => {
    if (newTab === tab) return;
    const oldIdx = TABS.indexOf(tab);
    const newIdx = TABS.indexOf(newTab);
    setDirection(newIdx > oldIdx ? "right" : "left");
    setTab(newTab);
  };

  useEffect(() => {
    setLevel(null);
    setTab("OVERVIEW");
    setDirection("right");
    api.getLevel(summary.id).then(setLevel).catch(() => undefined);
  }, [summary.id]);

  const levelTitleFormatted = `LEVEL ${String(summary.order).padStart(2, "0")} – ${summary.title.toUpperCase()}`;

  const heroImage =
    summary.id === "volumes"
      ? "/images/volumes_hero.jpg"
      : summary.order % 2 === 0
      ? "/images/scenario_hero.jpg"
      : "/images/landing_hero.jpg";

  return (
    <div className="flex h-full flex-col border border-line bg-surface font-mono">
      {/* Header bar matching Image 1 */}
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight text-white">
            {levelTitleFormatted}
          </h2>
          <p className="mt-0.5 text-xs text-[#8e8e93]">
            {LEVEL_TAGLINES[summary.id] ?? "Persist data and manage storage in Docker."}
          </p>
        </div>

        {summary.completed ? (
          <div className="flex items-center gap-1.5 border border-acid bg-black px-3 py-1 text-[11px] font-bold uppercase text-acid">
            <span>✓</span> COMPLETED
          </div>
        ) : summary.locked ? (
          <div className="flex items-center gap-1.5 border border-line bg-black px-3 py-1 text-[11px] font-bold uppercase text-[#71717a]">
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
            <span>LOCKED</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 border border-volt/60 bg-volt/10 px-3 py-1 text-[11px] font-bold uppercase text-volt">
            <span>▶</span> ACTIVE
          </div>
        )}
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-line bg-surfaceRaised/50">
        {TABS.map((t) => {
          const isActive = tab === t;
          const label = t === "PARTS" && level ? `PARTS (${level.parts.length})` : t;
          return (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={cn(
                "relative px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-200",
                isActive
                  ? "bg-volt text-black shadow-[0_0_12px_rgba(226,255,50,0.25)]"
                  : "text-[#8e8e93] hover:text-white hover:bg-white/5 border-r border-line",
              )}
            >
              {label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-black animate-fade-in" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {!level && (
          <div className="flex items-center gap-2 text-xs text-paperDim animate-pulse">
            <span className="inline-block h-2 w-2 rounded-full bg-volt animate-ping" />
            Loading mission data…
          </div>
        )}

        {level && (
          <div
            key={`${summary.id}-${tab}`}
            className={cn(
              direction === "right" ? "animate-slide-in-right" : "animate-slide-in-left",
              "will-change-transform"
            )}
          >
            {tab === "OVERVIEW" && (
              <div className="space-y-5">
                {/* Top Row: Graphic Illustration + Scenario & Goals */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* Left: Graphic Illustration with Sector HUD Badge */}
              <div className="relative min-h-[200px] overflow-hidden border border-line bg-black lg:min-h-[240px]">
                <Image
                  src={heroImage}
                  alt={summary.title}
                  fill
                  className="object-cover object-center opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2">
                  <span className="border border-line bg-black/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                    SECTOR {String(summary.order).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] font-mono uppercase text-[#a1a1aa] font-medium">
                    {summary.concept}
                  </span>
                </div>
              </div>

              {/* Right: Scenario & Learning Goals */}
              <div className="flex flex-col justify-between space-y-3.5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#8e8e93]">
                      TACTICAL INCIDENT
                    </span>
                    {level.narrative.role && (
                      <span className="text-[9px] font-mono text-[#8e8e93] truncate max-w-[200px]" title={level.narrative.role}>
                        {level.narrative.role}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-white/90">
                    {level.narrative.incident ||
                      "Your team's application is losing user uploads after container restarts. Investigate and persist the data using Docker volumes."}
                  </p>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#8e8e93]">
                    YOU WILL LEARN
                  </div>
                  <ul className="mt-1.5 space-y-1 text-xs text-white">
                    {level.metadata.learningGoals.map((g) => (
                      <li key={g} className="flex items-center gap-2">
                        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center bg-acid text-[9px] font-black text-black">
                          ✓
                        </span>
                        <span className="text-white/90">{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-1">
                  <Link href={`/level/${summary.id}`} className="block w-full">
                    <button
                      disabled={summary.locked}
                      className="flex w-full items-center justify-center gap-2 bg-volt px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black transition-all hover:bg-voltHover disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {summary.locked ? (
                        <>
                          <svg
                            className="h-3.5 w-3.5"
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
                          <span>LOCKED — COMPLETE PREVIOUS LEVEL</span>
                        </>
                      ) : summary.completed ? (
                        <>
                          REPLAY LEVEL <span>→</span>
                        </>
                      ) : (
                        <>
                          START LEVEL <span>→</span>
                        </>
                      )}
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Mission Telemetry & Specs Bar */}
            <div className="grid grid-cols-2 gap-2 border-y border-line py-3 sm:grid-cols-4 lg:grid-cols-5">
              <div className="border border-line/60 bg-surfaceRaised/40 p-2.5">
                <div className="text-[8px] font-bold uppercase tracking-widest text-[#8e8e93]">
                  DIFFICULTY
                </div>
                <div className="mt-1">
                  <span
                    className={cn(
                      "inline-block rounded-xs border px-1.5 py-0.5 text-[9px] font-bold uppercase",
                      DIFFICULTY_COLORS[level.metadata.difficulty.toLowerCase()] ?? "text-white border-line",
                    )}
                  >
                    {level.metadata.difficulty}
                  </span>
                </div>
              </div>

              <div className="border border-line/60 bg-surfaceRaised/40 p-2.5">
                <div className="text-[8px] font-bold uppercase tracking-widest text-[#8e8e93]">
                  EST. TIME
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-white">
                  <svg
                    className="h-3 w-3 text-[#8e8e93]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{level.metadata.estimatedMinutes} MINS</span>
                </div>
              </div>

              <div className="border border-line/60 bg-surfaceRaised/40 p-2.5">
                <div className="text-[8px] font-bold uppercase tracking-widest text-[#8e8e93]">
                  XP REWARD
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-extrabold text-volt">
                  <svg
                    className="h-3 w-3 text-volt"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  <span>+{level.metadata.xpReward} XP</span>
                </div>
              </div>

              <div className="border border-line/60 bg-surfaceRaised/40 p-2.5">
                <div className="text-[8px] font-bold uppercase tracking-widest text-[#8e8e93]">
                  PHASES
                </div>
                <div className="mt-1 text-xs font-bold text-white">
                  {level.parts.length} PARTS
                </div>
              </div>

              <div className="col-span-2 border border-line/60 bg-surfaceRaised/40 p-2.5 sm:col-span-4 lg:col-span-1">
                <div className="text-[8px] font-bold uppercase tracking-widest text-[#8e8e93]">
                  TOOLSET
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {level.metadata.commandFamilies.map((cmd) => (
                    <span
                      key={cmd}
                      className="border border-line bg-black px-1.5 py-0.5 text-[8px] font-bold uppercase text-[#a1a1aa]"
                    >
                      {cmd}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Row: Mission Phases Roadmap + Tactical Intel & Achievements */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
              {/* Left (7 cols): Execution Phases (Parts Breakdown) */}
              <div className="space-y-2.5 xl:col-span-7">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white">
                    MISSION EXECUTION PHASES ({level.parts.length})
                  </div>
                  <button
                    onClick={() => handleTabChange("PARTS")}
                    className="text-[9px] font-bold uppercase text-volt hover:underline"
                  >
                    VIEW FULL DETAILS →
                  </button>
                </div>

                <div className="space-y-2 animate-cascade">
                  {level.parts.map((p, idx) => (
                    <div
                      key={p.id}
                      className="flex items-start gap-3 border border-line bg-surfaceRaised/50 p-2.5 transition-colors hover:border-lineLight"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center border border-line bg-black font-mono text-[10px] font-bold text-white">
                        {String(idx + 1).padStart(2, "0")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "border px-1.5 py-0.5 text-[8px] font-extrabold uppercase",
                              KIND_COLORS[p.kind.toLowerCase()] ?? "border-line text-white bg-black",
                            )}
                          >
                            {p.kind}
                          </span>
                          <span className="truncate text-xs font-bold text-white">
                            {p.title}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-[#8e8e93]">
                          {p.objective}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right (5 cols): Incident Symptoms & Unlockable Achievements */}
              <div className="space-y-3.5 xl:col-span-5">
                {/* Detected Symptoms with Aesthetic Hazard Warning Sign */}
                {level.narrative.symptoms.length > 0 && (
                  <div className="space-y-2 border border-incident/50 bg-gradient-to-b from-incident/10 to-incident/5 p-3 shadow-[0_0_12px_rgba(255,68,68,0.15)]">
                    <div className="flex items-center justify-between border-b border-incident/20 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-incident/70 bg-incident/20 text-incident shadow-[0_0_8px_rgba(255,68,68,0.35)]">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-3 w-3"
                          >
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3" />
                          </svg>
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-incident">
                          DETECTED SYMPTOMS
                        </span>
                      </div>
                      <span className="flex items-center gap-1.5 font-mono text-[8px] font-bold uppercase tracking-wider text-incident/90">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-incident opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-incident" />
                        </span>
                        ANOMALY
                      </span>
                    </div>
                    <ul className="space-y-1.5 pt-0.5">
                      {level.narrative.symptoms.map((s) => (
                        <li key={s} className="flex items-start gap-2 text-[10px] leading-relaxed text-white/90">
                          <span className="mt-0.5 font-mono text-[9px] font-bold text-incident">▸</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Level Achievements Preview */}
                {level.achievements && level.achievements.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#8e8e93]">
                      MISSION ACHIEVEMENTS ({level.achievements.length})
                    </div>
                    <div className="space-y-1.5 animate-cascade">
                      {level.achievements.map((ach) => (
                        <div
                          key={ach.id}
                          className="flex items-center gap-2.5 border border-line bg-surfaceRaised/40 p-2 transition-colors hover:border-lineLight"
                        >
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center border border-volt/40 bg-volt/10 text-xs text-volt">
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[10px] font-bold uppercase text-white">
                              {ach.title}
                            </div>
                            <div className="line-clamp-1 text-[9px] text-[#8e8e93]">
                              {ach.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "PARTS" && (
          <div className="space-y-3 animate-cascade">
            {level.parts.map((p, i) => (
              <div
                key={p.id}
                className="flex items-start gap-3 border border-line bg-surfaceRaised p-3 transition-colors hover:border-lineLight"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-line bg-black text-[10px] font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="border border-line bg-black px-1.5 py-0.5 text-[9px] font-bold uppercase text-volt">
                      {p.kind}
                    </span>
                    <span className="text-xs font-bold text-white">{p.title}</span>
                  </div>
                  <p className="text-[11px] text-[#8e8e93]">{p.objective}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "LEARNING GOALS" && (
          <ul className="space-y-2 animate-cascade">
            {level.metadata.learningGoals.map((g) => (
              <li
                key={g}
                className="flex items-center gap-3 border border-line bg-surfaceRaised p-3 text-xs text-white transition-colors hover:border-lineLight"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center bg-acid text-[10px] font-black text-black">
                  ✓
                </span>
                {g}
              </li>
            ))}
          </ul>
        )}

        {tab === "SCENARIO" && (
          <div className="space-y-3 text-xs leading-relaxed text-white/80 animate-fade-in">
            <p className="text-[#8e8e93]">{level.narrative.role}</p>
            <p>{level.narrative.incident}</p>
            {level.narrative.symptoms.length > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-volt">
                  SYMPTOMS:
                </div>
                <ul className="list-inside list-disc space-y-1">
                  {level.narrative.symptoms.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
          </div>
        )}
      </div>
    </div>
  );
}
