"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { api, type PublicLevel } from "@/lib/api";
import { useSessionStore } from "@/store/session-store";
import dynamic from "next/dynamic";
import { useSessionSocket } from "@/lib/useSessionSocket";
import { EnvironmentTree } from "@/components/tree/EnvironmentTree";
import { TopologyInspectorPanel } from "@/components/mission/TopologyInspectorPanel";
import { ObjectiveBar } from "@/components/mission/ObjectiveBar";
import { PartCompleteOverlay } from "@/components/mission/PartCompleteOverlay";
import { MissionCompleteOverlay } from "@/components/mission/MissionCompleteOverlay";
import { Panel } from "@/components/ui/Panel";
import type { PlayerProfile } from "@dockerops/shared";

const GameTerminal = dynamic(
  () => import("@/components/terminal/Terminal").then((m) => m.GameTerminal),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center font-mono text-xs text-[#8e8e93]">
        INITIALIZING TERMINAL TTY…
      </div>
    ),
  },
);

export default function LevelPage() {
  const params = useParams<{ levelId: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const levelId = params.levelId;

  const [level, setLevel] = useState<PublicLevel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [provisioning, setProvisioning] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);

  const PROVISIONING_STEPS = [
    "INITIALIZING DOCKER DAEMON…",
    "ALLOCATING NETWORK NAMESPACE…",
    "PULLING CONTAINER IMAGES…",
    "SPAWNING ISOLATED CONTAINERS…",
    "WARMING TERMINAL TTY…",
  ];

  useEffect(() => {
    if (!provisioning) return;
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % PROVISIONING_STEPS.length);
    }, 1400);
    return () => clearInterval(interval);
  }, [provisioning]);

  const sessionId = useSessionStore((s) => s.sessionId);
  const setSession = useSessionStore((s) => s.setSession);
  const snapshot = useSessionStore((s) => s.snapshot);
  const topology = useSessionStore((s) => s.topology);
  const completedPartIds = useSessionStore((s) => s.completedPartIds);
  const celebratingPartId = useSessionStore((s) => s.celebratingPartId);
  const dismissCelebration = useSessionStore((s) => s.dismissCelebration);
  const missionComplete = useSessionStore((s) => s.missionComplete);
  const completion = useSessionStore((s) => s.completion);
  const reset = useSessionStore((s) => s.reset);

  useSessionSocket(sessionId);

  useEffect(() => {
    api.getProfile().then(setProfile).catch(() => undefined);
  }, [missionComplete]);

  useEffect(() => {
    let cancelled = false;
    let adoptedSessionId: string | null = null;
    let missionWasCompleted = false;
    reset();
    setProvisioning(true);
    setError(null);

    (async () => {
      const lvl = await api.getLevel(levelId);
      if (cancelled) return;
      setLevel(lvl);

      const session = await api.createSession(levelId);
      if (cancelled) {
        api.destroySession(session.id).catch(() => undefined);
        return;
      }
      adoptedSessionId = session.id;
      setSession(session.id);
      setProvisioning(false);
    })().catch((e) => {
      if (!cancelled) {
        setError(String(e.message ?? e));
        setProvisioning(false);
      }
    });

    const unsubscribe = useSessionStore.subscribe((state) => {
      missionWasCompleted = state.missionComplete;
    });

    return () => {
      cancelled = true;
      unsubscribe();
      if (adoptedSessionId && !missionWasCompleted) {
        api.destroySession(adoptedSessionId).catch(() => undefined);
      }
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelId]);

  const currentPart = useMemo(() => {
    if (!level) return null;
    return level.parts.find((p) => !completedPartIds.has(p.id)) ?? level.parts[level.parts.length - 1];
  }, [level, completedPartIds]);

  async function handleReset() {
    if (!sessionId) return;
    setProvisioning(true);
    const fresh = await api.resetSession(sessionId);
    reset();
    setSession(fresh.id);
    setProvisioning(false);
  }

  async function handleAbort() {
    if (sessionId) await api.destroySession(sessionId).catch(() => undefined);
    router.push("/levels");
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 font-mono">
        <div className="max-w-md border border-incident/40 bg-surface p-6 text-center">
          <p className="mb-3 text-sm text-incident">{error}</p>
          <button
            onClick={() => router.push("/levels")}
            className="border border-line bg-surfaceRaised px-4 py-2 text-xs font-bold text-white hover:bg-surfaceHover"
          >
            Back to level map
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 03: Level Intro / Scenario View
  if (level && showIntro) {
    const formattedConcept = `LEVEL ${String(level.metadata.order).padStart(2, "0")} – ${level.metadata.concept.toUpperCase()}`;
    return (
      <div className="flex min-h-screen flex-col bg-black font-mono">
        {/* Top Header matching wireframe 03 */}
        <header className="flex h-12 items-center justify-between border-b border-line bg-black px-6">
          <Link
            href="/levels"
            className="font-display text-base font-bold tracking-tight text-white hover:text-acid"
          >
            DOCKER OPS
          </Link>

          <div className="font-mono text-xs font-bold uppercase tracking-wider text-white">
            {formattedConcept}
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="font-bold text-acid">XP {profile?.totalXp ?? 1200}</span>
            <span className="font-bold text-white">LV {profile?.level ?? 4}</span>
          </div>
        </header>

        {/* Main 2-Column Content */}
        <div className="mx-auto my-auto grid w-full max-w-6xl grid-cols-1 items-stretch gap-8 px-6 py-8 lg:grid-cols-2">
          {/* Left Column */}
          <div className="flex flex-col justify-between py-2">
            <div>
              <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
                {level.metadata.title.toUpperCase()}
              </h1>

              <div className="mt-2.5">
                <span className="border border-incident bg-incident/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-incident">
                  PRODUCTION INCIDENT
                </span>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-[#a1a1aa]">
                {level.narrative.incident ||
                  "Your team deployed a new version of the app. Now user uploads are missing. Investigate and fix the issue."}
              </p>

              {/* 3 Action Steps matching wireframe 03 */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-incident/50 bg-incident/10 text-xs font-black text-incident">
                    !
                  </span>
                  <div>
                    <span className="text-xs font-bold uppercase text-white">UNDERSTAND</span>
                    <span className="ml-2 text-xs text-[#8e8e93]">
                      — Inspect the current environment
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-line bg-surfaceRaised text-xs font-black text-white">
                    🔧
                  </span>
                  <div>
                    <span className="text-xs font-bold uppercase text-white">FIX</span>
                    <span className="ml-2 text-xs text-[#8e8e93]">
                      — Ensure data is persisted correctly
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-line bg-surfaceRaised text-xs font-black text-white">
                    ✓
                  </span>
                  <div>
                    <span className="text-xs font-bold uppercase text-white">VERIFY</span>
                    <span className="ml-2 text-xs text-[#8e8e93]">
                      — Confirm the application works
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action button */}
            <div className="mt-10 pt-4">
              {provisioning ? (
                <div className="relative flex w-full flex-col items-center justify-center overflow-hidden border-2 border-incident bg-incident px-6 py-4 text-black shadow-glowIncident animate-pulse-glow cursor-wait select-none">
                  {/* High-speed animated hazard stripes overlay */}
                  <div className="pointer-events-none absolute inset-0 animate-barber-pole opacity-35" />

                  {/* Specular light sweep */}
                  <div className="pointer-events-none absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                  {/* Main status line */}
                  <div className="relative z-10 flex items-center justify-center gap-3 font-mono text-xs font-black uppercase tracking-widest text-black">
                    {/* Spinning dual-ring radar loader */}
                    <svg
                      className="h-4 w-4 animate-spin text-black"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-95"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>

                    <span>PROVISIONING SANDBOX</span>

                    {/* Animated pulsing dots */}
                    <span className="flex gap-0.5 tracking-normal">
                      <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                    </span>
                  </div>

                  {/* Real-time provisioning micro-step */}
                  <div className="relative z-10 mt-1 font-mono text-[10px] font-extrabold uppercase tracking-wider text-black/85">
                    // {PROVISIONING_STEPS[stepIndex]}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowIntro(false)}
                  className="flex w-full items-center justify-center gap-2 border border-incident bg-incident px-6 py-4 text-xs font-black uppercase tracking-widest text-black transition-all hover:bg-incidentDim hover:brightness-110 active:translate-y-px"
                >
                  START MISSION →
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Industrial Warehouse Illustration */}
          <div className="relative min-h-[380px] overflow-hidden border border-line bg-black lg:min-h-[440px]">
            <Image
              src="/images/scenario_hero.jpg"
              alt="Scenario Warehouse Incident"
              fill
              className="object-cover object-center"
              priority
            />
          </div>
        </div>
      </div>
    );
  }

  // Provisioning fallback if intro dismissed early
  if (!level || provisioning || !sessionId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-black p-6 font-mono text-center">
        <div className="w-full max-w-md">
          <div className="relative flex w-full flex-col items-center justify-center overflow-hidden border-2 border-incident bg-incident px-6 py-5 text-black shadow-glowIncident animate-pulse-glow">
            <div className="pointer-events-none absolute inset-0 animate-barber-pole opacity-35" />
            <div className="pointer-events-none absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <div className="relative z-10 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest text-black">
              <svg className="h-4 w-4 animate-spin text-black" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-95" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>PROVISIONING SANDBOX</span>
              <span className="flex gap-0.5 tracking-normal">
                <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
              </span>
            </div>
            <div className="relative z-10 mt-1.5 font-mono text-[10px] font-extrabold uppercase tracking-wider text-black/85">
              // {PROVISIONING_STEPS[stepIndex]}
            </div>
          </div>
        </div>
        <p className="max-w-sm text-xs text-[#8e8e93]">
          Spinning up an isolated Docker-in-Docker environment for this mission. Real containers are starting up.
        </p>
      </div>
    );
  }

  // SCREEN 04, 05, 06: Main Gameplay Screen
  return (
    <div className="flex h-screen flex-col bg-black font-mono">
      {/* Top Header matching wireframe 04 */}
      <div className="flex items-center justify-between border-b border-line bg-black px-4 py-2.5">
        <div className="flex items-center gap-4">
          <Link
            href="/levels"
            className="font-display text-sm font-bold tracking-tight text-white hover:text-acid"
          >
            DOCKER OPS
          </Link>
          <span className="h-3 w-px bg-line" />
          <span className="font-mono text-xs font-bold uppercase text-white">
            LEVEL {String(level.metadata.order).padStart(2, "0")} – {level.metadata.title.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowIntro(true)}
            className="border border-line bg-surfaceRaised px-2.5 py-1 text-[10px] font-bold uppercase text-paperDim hover:text-white"
          >
            BRIEF
          </button>
          <button
            onClick={handleReset}
            className="border border-line bg-surfaceRaised px-2.5 py-1 text-[10px] font-bold uppercase text-paperDim hover:text-white"
          >
            RESET
          </button>
          <button
            onClick={handleAbort}
            className="border border-line bg-surfaceRaised px-2.5 py-1 text-[10px] font-bold uppercase text-paperDim hover:text-white"
          >
            EXIT
          </button>

          <div className="ml-3 flex items-center gap-3 text-xs">
            <span className="font-bold text-acid">XP {profile?.totalXp ?? 1200}</span>
            <span className="font-bold text-white">LV {profile?.level ?? 4}</span>
          </div>
        </div>
      </div>

      {currentPart && <ObjectiveBar sessionId={sessionId} part={currentPart} />}

      {/* Main 3-Panel In-Game Environment (Wireframe 04 / 05 / 06) */}
      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-[220px_1fr] gap-2 overflow-hidden p-2 lg:grid-cols-[260px_1fr]">
        <Panel title="ENVIRONMENT" className="min-h-0 min-w-0 border-line bg-black">
          <EnvironmentTree snapshot={snapshot} />
        </Panel>

        <div className="flex min-h-0 min-w-0 flex-col gap-2">
          <div className="h-[55%] min-h-0 flex flex-col">
            <TopologyInspectorPanel snapshot={snapshot} topology={topology} sessionId={sessionId} />
          </div>
          <Panel
            title="TERMINAL"
            className="h-[45%] min-h-0 border-line bg-black"
            bodyClassName="min-h-0 min-w-0 overflow-hidden"
          >
            <GameTerminal sessionId={sessionId} />
          </Panel>
        </div>
      </div>

      {celebratingPartId && !missionComplete && (
        <PartCompleteOverlay
          level={level}
          completedPartIds={completedPartIds}
          justCompletedPartId={celebratingPartId}
          onContinue={dismissCelebration}
        />
      )}

      {missionComplete && completion && (
        <MissionCompleteOverlay
          levelTitle={level.metadata.title}
          summary={level.narrative.missionBrief}
          xpAwarded={completion.xpAwarded}
          commandsRun={completion.commandsRun}
          hintsUsed={completion.hintsUsed}
          durationSeconds={completion.durationSeconds}
          newlyUnlockedAchievements={completion.newlyUnlockedAchievements}
        />
      )}
    </div>
  );
}
