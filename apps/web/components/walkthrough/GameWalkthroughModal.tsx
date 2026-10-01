"use client";

import React, { useState } from "react";
import { cn } from "@/lib/cn";
import { sfx } from "@/lib/audio";
import Link from "next/link";

interface WalkthroughStep {
  stepNumber: number;
  badge: string;
  title: string;
  subtitle: string;
  explanation: string[];
  interactiveElement?: string;
  codeSample?: string;
  tip: string;
  renderVisual: () => React.ReactNode;
}

const STEPS: WalkthroughStep[] = [
  {
    stepNumber: 1,
    badge: "STEP 1 // MISSION BRIEFING",
    title: "READ THE INCIDENT OBJECTIVE",
    subtitle: "Every mission is a real production outage. Understand your goal.",
    explanation: [
      "When you enter a level, look at the top Objective Bar. Production is down, a service is unreachable, or a container is leaking data.",
      "Each level is broken into 2 to 3 manageable parts: usually Part 1 (Investigate), Part 2 (Fix), and Part 3 (Verify).",
      "Read the narrative briefing to understand what symptoms users are reporting, then check the current objective.",
    ],
    codeSample: "OBJECTIVE: Inspect running containers and find why the billing-api container keeps restarting.",
    tip: "You don't need to memorize everything—the Objective Bar will always show your active goal.",
    renderVisual: () => (
      <div className="border border-line bg-black p-3 space-y-2 font-mono">
        <div className="flex items-center justify-between border-b border-line/60 pb-2">
          <div className="flex items-center gap-2">
            <span className="bg-acid px-1.5 py-0.5 text-[9px] font-black text-black">PART 1 OF 3</span>
            <span className="text-xs font-bold text-white">TRIAGE THE RESTARTS</span>
          </div>
          <span className="text-[10px] text-acid font-bold">XP REWARD: +150</span>
        </div>
        <div className="bg-[#0b1016] border border-line/40 p-2.5 text-xs text-white/90">
          <span className="text-[#8e8e93] block text-[10px] uppercase font-bold mb-1">CURRENT OBJECTIVE:</span>
          Run <code className="text-acid font-bold">docker ps</code> or <code className="text-acid font-bold">docker logs</code> to discover the root cause of the crash.
        </div>
      </div>
    ),
  },
  {
    stepNumber: 2,
    badge: "STEP 2 // THE COMMAND CENTER",
    title: "WHERE TO WRITE WHAT: THE REAL TERMINAL",
    subtitle: "This is a real Linux shell talking to an isolated Docker Engine.",
    explanation: [
      "The bottom black window with the green cursor is your Interactive Terminal (powered by xterm.js).",
      "THIS IS WHERE YOU TYPE ALL COMMANDS. Click anywhere inside the terminal box to focus your cursor.",
      "This is NOT a simulation or multiple-choice test. You are typing real commands into an authentic Linux environment with the full docker CLI.",
    ],
    codeSample: "docker ps\ndocker logs web-app\ndocker run -d -p 8080:80 --name my-app nginx",
    tip: "Essential Commands to remember: 'docker ps' (view containers), 'docker logs <name>' (read errors), 'docker restart <name>'.",
    renderVisual: () => (
      <div className="border border-line bg-black font-mono overflow-hidden">
        <div className="flex items-center justify-between bg-[#111827] px-3 py-1.5 border-b border-line">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            <span className="ml-2 text-[10px] text-white/70">operator@dockerops-sandbox: ~</span>
          </div>
          <span className="text-[9px] text-acid font-bold">ACTIVE PTY TTY</span>
        </div>
        <div className="p-3 text-xs space-y-1 bg-[#05080c]">
          <div className="text-white/80">
            <span className="text-acid font-bold">/ # </span>
            <span className="text-white font-bold">docker ps</span>
          </div>
          <div className="text-[10px] text-[#8e8e93] font-mono leading-tight pt-1">
            CONTAINER ID &nbsp; IMAGE &nbsp; &nbsp; &nbsp; STATUS &nbsp; &nbsp; &nbsp; &nbsp; PORTS<br />
            <span className="text-white/90">9a8f21bc01d2 &nbsp; prod-api &nbsp; Restarting (1) &nbsp; 0.0.0.0:3000-&gt;3000/tcp</span>
          </div>
          <div className="text-white/80 pt-1 flex items-center">
            <span className="text-acid font-bold">/ # </span>
            <span className="ml-1 inline-block h-3.5 w-2 bg-acid animate-pulse" />
          </div>
        </div>
      </div>
    ),
  },
  {
    stepNumber: 3,
    badge: "STEP 3 // LIVE TOPOLOGY",
    title: "LIVE DOCKER MAP & OBJECT TREE",
    subtitle: "Watch real containers, networks, and volumes update in real time.",
    explanation: [
      "In the top-right and left panels, you'll see the Topology Map and the Environment Tree.",
      "As you run commands like 'docker run' or 'docker network connect', the diagram updates live. It inspects the actual Docker socket.",
      "You can click on any container node to inspect its CPU, memory usage, environment variables, and mount points.",
    ],
    codeSample: "Containers (Green = Healthy, Yellow = Restarting, Red = Stopped) | Bridge Networks | Storage Volumes",
    tip: "If a container is missing or isolated from the network bridge, the visual diagram will immediately show the broken connection.",
    renderVisual: () => (
      <div className="border border-line bg-black p-3 font-mono">
        <div className="text-[9px] text-[#8e8e93] font-bold uppercase mb-2">LIVE INFRASTRUCTURE TOPOLOGY:</div>
        <div className="flex items-center justify-around py-3 border border-line/50 bg-[#080d14]">
          <div className="flex flex-col items-center border border-acid bg-acid/10 px-3 py-2 text-center">
            <span className="text-acid font-bold text-xs">web-service</span>
            <span className="text-[8px] text-white/70">Port 80:80</span>
          </div>
          <div className="flex flex-col items-center text-[9px] text-white/50">
            <span>── bridge ──</span>
            <span className="text-acid font-bold text-[8px]">app-net</span>
          </div>
          <div className="flex flex-col items-center border border-volt bg-volt/10 px-3 py-2 text-center">
            <span className="text-volt font-bold text-xs">db-postgres</span>
            <span className="text-[8px] text-white/70">Volume: pgdata</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    stepNumber: 4,
    badge: "STEP 4 // HINTS & MANUAL",
    title: "NEVER GET STUCK: HINTS & FIELD MANUAL",
    subtitle: "Learn as you go without frustration.",
    explanation: [
      "Don't remember a specific Docker flag like '-v' for volume mounting or '-p' for port forwarding? No problem!",
      "Click the 'REQUEST HINT' button in the Objective Bar. Hints are tiered: Tier 1 gives a subtle clue, Tier 2 points to the exact command family, and Tier 3 gives the exact syntax.",
      "You can also click 'MANUAL' in the top navigation bar at any time to look up syntax cheat sheets for containers, networks, volumes, and Dockerfiles.",
    ],
    codeSample: "Hint Tier 1: 'Check docker ps to see what ports are bound.'\nHint Tier 2: 'Use the -p host_port:container_port flag.'",
    tip: "Using hints deducts a small amount of bonus XP, but it's much better to learn the concept than stay stuck!",
    renderVisual: () => (
      <div className="border border-line bg-black p-3 font-mono space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-xs border border-volt/60 bg-volt/15 text-volt shadow-[0_0_8px_rgba(250,204,21,0.35)] shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-volt" stroke="currentColor" strokeWidth="2">
                <path d="M9 18h6M10 21h4" strokeLinecap="round" />
                <path d="M12 3a6 6 0 0 0-6 6c0 2.2 1.3 4.1 2.5 5.5.5.6.8 1.5.9 2.5h5.2c.1-1 .4-1.9.9-2.5 1.2-1.4 2.5-3.3 2.5-5.5a6 6 0 0 0-6-6z" fill="#facc15" fillOpacity="0.25" strokeLinejoin="round" />
                <path d="M12 7v4" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-xs font-bold text-white tracking-wide">TIER 1 HINT (COSTS 15 XP)</span>
          </div>
          <button className="border border-volt bg-volt/10 text-volt px-2 py-0.5 text-[9px] font-bold uppercase hover:bg-volt hover:text-black transition-colors">
            REVEAL HINT
          </button>
        </div>
        <div className="border border-line/60 bg-[#0d1017] p-2.5 text-xs text-[#a1a1aa]">
          &quot;The container needs port 80 exposed on the host. Try running: <code className="text-white">docker run -d -p 8080:80 nginx</code>&quot;
        </div>
      </div>
    ),
  },
  {
    stepNumber: 5,
    badge: "STEP 5 // AUTOMATIC SUCCESS",
    title: "REAL VERIFICATION: AUTOMATIC VICTORY",
    subtitle: "The game constantly inspects the engine. No 'Submit' button needed.",
    explanation: [
      "You do not need to click a 'Submit' button or paste terminal output. The DockerOps backend constantly checks the actual Docker daemon in your sandbox.",
      "The exact moment your container is running, the network bridge is linked, or the broken file is fixed, the engine detects it immediately.",
      "A victory chime sounds, you are awarded XP, your operator profile levels up, and the next challenge unlocks automatically!",
    ],
    codeSample: "ENGINE INSPECT: State.Running == true && NetworkSettings.Ports['80/tcp'] != null -> PASS ✓",
    tip: "You are now ready to operate real infrastructure. Begin with Level 01: Container Basics to get your hands dirty!",
    renderVisual: () => (
      <div className="border border-acid bg-black p-4 text-center font-mono space-y-2.5 shadow-[0_0_15px_rgba(0,255,102,0.15)]">
        <div className="relative inline-flex h-9 w-9 items-center justify-center">
          <div className="absolute inset-0 rounded-xs border border-acid bg-acid/15 animate-pulse shadow-[0_0_12px_rgba(0,255,102,0.4)]" />
          <svg viewBox="0 0 24 24" fill="none" stroke="#00ff66" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5 drop-shadow-[0_0_6px_#00ff66]">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="text-sm font-black uppercase text-white tracking-wide">
          OBJECTIVE COMPLETED // LEVEL 1 CLEARED!
        </div>
        <div className="text-xs text-acid font-bold">
          +250 XP EARNED • COMMENDATION UNLOCKED: &quot;FIRST DEPLOY&quot;
        </div>
      </div>
    ),
  },
];

interface GameWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GameWalkthroughModal({ isOpen, onClose }: GameWalkthroughModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [practiceInput, setPracticeInput] = useState("");
  const [practiceOutput, setPracticeOutput] = useState<string | null>(null);

  if (!isOpen) return null;

  const step = STEPS[currentStep];

  const handleNext = () => {
    sfx.playClick();
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    sfx.playClick();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dockerops_walkthrough_seen", "true");
    }
    sfx.playSuccess();
    onClose();
  };

  const handleRunPractice = () => {
    const cmd = practiceInput.trim();
    if (cmd === "docker ps" || cmd === "docker ps -a") {
      sfx.playClick();
      setPracticeOutput(
        "CONTAINER ID   IMAGE   COMMAND              CREATED         STATUS         PORTS\n4f9a12c8b820   nginx   \"/docker-entryp...\"   2 minutes ago   Up 2 minutes   0.0.0.0:80->80/tcp"
      );
    } else if (cmd.startsWith("docker")) {
      sfx.playClick();
      setPracticeOutput(`Executed: ${cmd}\nCommand accepted by Docker Engine.`);
    } else {
      setPracticeOutput("Try typing: docker ps");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4 font-mono backdrop-blur-md">
      <div className="relative flex max-h-[96vh] w-full max-w-3xl flex-col border border-line bg-surface shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line bg-ink px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-acid" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-acid">
                FIELD ORIENTATION // HOW TO PLAY
              </div>
              <h2 className="font-display text-sm sm:text-base font-black uppercase text-white tracking-wide">
                OPERATOR WALKTHROUGH &amp; CONTROLS
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center border border-line bg-black text-sm text-[#8e8e93] hover:border-white hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Step Progress Dots Bar */}
        <div className="flex items-center justify-between bg-black px-4 sm:px-6 py-2.5 border-b border-line/60 text-xs">
          <div className="flex items-center gap-2">
            {STEPS.map((s, idx) => (
              <button
                key={s.stepNumber}
                onClick={() => {
                  sfx.playClick();
                  setCurrentStep(idx);
                }}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-xs text-[10px] font-bold transition-all",
                  idx === currentStep
                    ? "bg-acid text-black font-black shadow-[0_0_8px_#00ff66]"
                    : idx < currentStep
                    ? "border border-white/60 bg-white/20 text-white"
                    : "border border-line bg-black text-[#555] hover:text-white"
                )}
              >
                0{s.stepNumber}
              </button>
            ))}
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e8e93]">
            STEP {currentStep + 1} OF {STEPS.length}
          </span>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Badge & Title */}
          <div>
            <span className="rounded-xs border border-acid/50 bg-acid/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-acid">
              {step.badge}
            </span>
            <h3 className="mt-2 font-display text-xl sm:text-2xl font-black uppercase text-white">
              {step.title}
            </h3>
            <p className="mt-1 text-xs font-bold text-[#8e8e93] uppercase tracking-wider">
              {step.subtitle}
            </p>
          </div>

          {/* Visual Presentation */}
          <div className="my-3">
            {step.renderVisual()}
          </div>

          {/* Explanations */}
          <div className="space-y-2 text-xs text-[#a1a1aa] leading-relaxed">
            {step.explanation.map((p, i) => (
              <p key={i}>• {p}</p>
            ))}
          </div>

          {/* Step 2 Special: Interactive Practice Box */}
          {step.stepNumber === 2 && (
            <div className="border border-line bg-black p-3 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-acid flex items-center justify-between">
                <span>INTERACTIVE COMMAND TRY-OUT:</span>
                <button
                  onClick={() => {
                    setPracticeInput("docker ps");
                    setPracticeOutput(
                      "CONTAINER ID   IMAGE   COMMAND              CREATED         STATUS         PORTS\n4f9a12c8b820   nginx   \"/docker-entryp...\"   2 minutes ago   Up 2 minutes   0.0.0.0:80->80/tcp"
                    );
                    sfx.playClick();
                  }}
                  className="flex items-center gap-1.5 border border-line bg-surfaceRaised px-2.5 py-1 text-[10px] font-bold uppercase text-white hover:text-volt hover:border-volt hover:bg-volt/10 transition-colors shadow-sm"
                >
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-xs bg-volt/15 text-volt shadow-[0_0_6px_rgba(250,204,21,0.3)]">
                    <svg viewBox="0 0 16 16" fill="currentColor" className="h-2.5 w-2.5 text-volt">
                      <path d="M9.5 1L2 9h5l-1.5 6L14 7H9l.5-6z" />
                    </svg>
                  </span>
                  <span>Autofill &quot;docker ps&quot;</span>
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={practiceInput}
                  onChange={(e) => setPracticeInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRunPractice()}
                  placeholder="Type 'docker ps' and press Enter..."
                  className="flex-1 border border-line bg-black px-3 py-1.5 text-xs font-mono text-white focus:border-acid focus:outline-none"
                />
                <button
                  onClick={handleRunPractice}
                  className="border border-acid bg-acid px-3 py-1.5 text-xs font-bold text-black uppercase"
                >
                  Run
                </button>
              </div>

              {practiceOutput && (
                <pre className="border border-line/60 bg-[#04070b] p-2 text-[10px] text-acid font-mono whitespace-pre-wrap leading-tight">
                  {practiceOutput}
                </pre>
              )}
            </div>
          )}

          {/* Pro Tip */}
          <div className="border-l-2 border-acid bg-surfaceRaised p-3 text-xs text-white">
            <div className="flex items-center gap-1.5 font-bold text-acid uppercase tracking-wider mb-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 text-acid shrink-0">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>OPERATOR PRO TIP:</span>
            </div>
            <div className="text-[#d1d5db]">{step.tip}</div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-line bg-ink px-4 sm:px-6 py-3.5">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={cn(
              "border border-line bg-black px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
              currentStep === 0
                ? "opacity-30 cursor-not-allowed text-[#555]"
                : "text-white hover:border-white"
            )}
          >
            ← BACK
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              className="border border-acid bg-acid px-5 py-2 text-xs font-black uppercase tracking-wider text-black transition-all hover:brightness-110 active:translate-y-px"
            >
              NEXT STEP →
            </button>
          ) : (
            <Link href="/levels" onClick={handleComplete}>
              <button className="border border-acid bg-acid px-5 py-2 text-xs font-black uppercase tracking-wider text-black transition-all hover:brightness-110 active:translate-y-px shadow-[0_0_12px_rgba(0,255,102,0.3)]">
                ENTER FIRST LEVEL NOW &gt;
              </button>
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
