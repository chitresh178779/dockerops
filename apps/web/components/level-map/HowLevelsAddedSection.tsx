"use client";

import { useEffect, useState } from "react";

export function HowLevelsAddedSection() {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const isEnvEnabled =
    process.env.NEXT_PUBLIC_SHOW_MAINTAINER_TOOLS === "true";
  const [overrideView, setOverrideView] = useState<"public" | "maintainer" | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get("view");
      if (viewParam === "public" || viewParam === "maintainer") {
        setOverrideView(viewParam);
      }
    }
  }, []);

  const showMaintainerSection = overrideView
    ? overrideView === "maintainer"
    : isEnvEnabled;

  const handleCopy = () => {
    navigator.clipboard?.writeText("pnpm new-level");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!showMaintainerSection) {
    return (
      <div className="border border-line bg-surface p-6 font-mono">
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="mb-3 flex items-center gap-2 rounded-sm border border-acid/40 bg-acid/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-acid">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-acid animate-pulse" />
            CONTENT ROADMAP
          </div>
          <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
            NEW LEVELS WILL BE ADDED SOON
          </h2>
          <p className="mt-2 max-w-lg text-xs font-mono uppercase tracking-wider text-[#a1a1aa]">
            Real-world incidents, advanced multi-host networks, and production scenarios are currently under development.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider">
            <span className="border border-line bg-black/60 px-3 py-1.5 text-white/80">
              • SWARM MODE
            </span>
            <span className="border border-line bg-black/60 px-3 py-1.5 text-white/80">
              • MULTI-HOST NETWORKING
            </span>
            <span className="border border-line bg-black/60 px-3 py-1.5 text-white/80">
              • CI/CD AUTOMATION
            </span>
            <span className="border border-line bg-black/60 px-3 py-1.5 text-white/80">
              • OUTAGE DRILLS
            </span>
          </div>

          {isEnvEnabled && (
            <button
              onClick={() => setOverrideView("maintainer")}
              className="mt-6 border border-line bg-black px-3 py-1 text-[10px] font-bold uppercase text-[#8e8e93] hover:border-acid hover:text-acid"
            >
              Exit Public Preview (Switch to Maintainer View)
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-2 flex items-center justify-between font-mono text-[10px] text-[#8e8e93]">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-acid" />
          <span className="font-bold uppercase text-acid">MAINTAINER MODE</span>
          <span className="hidden sm:inline">
            (Visible only to you via NEXT_PUBLIC_SHOW_MAINTAINER_TOOLS)
          </span>
        </div>
        <button
          onClick={() => setOverrideView("public")}
          className="border border-line bg-black px-2.5 py-1 text-[9px] font-bold uppercase text-white hover:border-acid hover:text-acid"
        >
          Preview Public View
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 font-mono lg:grid-cols-[1fr_340px]">
        {/* Left Column: How New Levels Are Added */}
        <div className="border border-line bg-surface p-4">
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-white">
            HOW NEW LEVELS ARE ADDED
          </h2>

          <div className="grid grid-cols-1 items-stretch gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {/* Step 1: CREATE SCENARIO FILE */}
            <div className="flex flex-col border border-line bg-black p-2.5">
              <div className="mb-2 text-[10px] font-bold uppercase text-white">
                1. CREATE SCENARIO FILE
              </div>
              <div className="flex-1 overflow-x-auto border border-line/60 bg-[#0c0d10] p-2 text-[9px] font-mono leading-tight text-white/80">
                <div className="text-white/60 mb-1">level-11.yaml</div>
                <div className="text-volt">id: level-11</div>
                <div className="text-white">title: &quot;Multi-Host Setup&quot;</div>
                <div className="text-[#8e8e93]">description: &quot;Deploy and manage</div>
                <div className="text-[#8e8e93] pl-2">containers across multiple hosts.&quot;</div>
                <div className="text-volt mt-1">parts:</div>
                <div className="pl-2 text-white/90">- id: 1</div>
                <div className="pl-4 text-white/60">type: investigate</div>
                <div className="pl-2 text-white/90">- id: 2</div>
                <div className="pl-4 text-white/60">type: fix</div>
                <div className="pl-2 text-white/90">- id: 3</div>
                <div className="pl-4 text-white/60">type: verify</div>
              </div>
            </div>

            {/* Step 2: DEFINE ENVIRONMENT STATE */}
            <div className="flex flex-col border border-line bg-black p-2.5">
              <div className="mb-2 text-[10px] font-bold uppercase text-white">
                2. DEFINE ENVIRONMENT STATE
              </div>
              <div className="flex-1 overflow-x-auto border border-line/60 bg-[#0c0d10] p-2 text-[9px] font-mono leading-tight text-white/80">
                <div className="text-volt">environment:</div>
                <div className="pl-2 text-white/90">hosts:</div>
                <div className="pl-4 text-white">- name: prod-01</div>
                <div className="pl-6 text-[#8e8e93]">containers: [...]</div>
                <div className="pl-6 text-[#8e8e93]">networks: [...]</div>
                <div className="pl-6 text-[#8e8e93]">volumes: [...]</div>
                <div className="text-volt mt-1">initial_state: &#123;...&#125;</div>
                <div className="text-volt">win_condition: &#123;...&#125;</div>
              </div>
            </div>

            {/* Step 3: ADD LEARNING CONTENT */}
            <div className="flex flex-col border border-line bg-black p-2.5">
              <div className="mb-2 text-[10px] font-bold uppercase text-white">
                3. ADD LEARNING CONTENT
              </div>
              <div className="flex flex-1 flex-col justify-between space-y-1.5 border border-line/60 bg-[#0c0d10] p-2 text-[9px]">
                <div className="flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center border border-line bg-volt/10 text-volt">
                    <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18h6M10 21h4" strokeLinecap="round" />
                      <path d="M12 3a6 6 0 0 0-6 6c0 2.2 1.3 4.1 2.5 5.5.5.6.8 1.5.9 2.5h5.2c.1-1 .4-1.9.9-2.5 1.2-1.4 2.5-3.3 2.5-5.5a6 6 0 0 0-6-6z" fill="#facc15" fillOpacity="0.25" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-white/90">Scenario story</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center border border-line text-volt">!</span>
                  <span className="text-white/90">Hints</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center border border-line text-volt">◎</span>
                  <span className="text-white/90">Expected outcomes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center border border-line text-volt">📄</span>
                  <span className="text-white/90">Documentation links</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center border border-line text-volt">★</span>
                  <span className="text-white/90">XP &amp; achievements</span>
                </div>
              </div>
            </div>

            {/* Step 4: PUBLISH */}
            <div className="flex flex-col border border-line bg-black p-2.5">
              <div className="mb-2 text-[10px] font-bold uppercase text-white">
                4. PUBLISH
              </div>
              <div className="flex flex-1 flex-col justify-between space-y-1.5 border border-line/60 bg-[#0c0d10] p-2 text-[9px]">
                <div className="flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center border border-line text-acid">🖼</span>
                  <span className="text-white/90">Add to game content</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center border border-line text-acid">⚙</span>
                  <span className="text-white/90">Runs in the same engine</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center border border-line text-acid">🗺</span>
                  <span className="text-white/90">Appears in level map</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center border border-line text-acid">✓</span>
                  <span className="text-white/90">No code changes needed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: POST MVP Retro Cream Card matching Image 1 */}
        <div className="flex flex-col justify-between border border-black bg-[#f5f0e6] p-4 text-black font-mono">
          <div>
            <h2 className="font-display text-xl font-black uppercase tracking-tight text-black">
              POST MVP
            </h2>
            <div className="mt-1 text-[9px] font-black uppercase tracking-wider text-[#333333]">
              WE CAN CONTINUOUSLY ADD NEW LEVELS:
            </div>

            <ul className="mt-3 space-y-1.5 text-[10px] font-bold text-black">
              <li className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-700">✓</span>
                <span>Advanced networking (multi-host, overlay)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-700">✓</span>
                <span>Swarm mode</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-700">✓</span>
                <span>Kubernetes comparison</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-700">✓</span>
                <span>CI/CD with Docker</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-700">✓</span>
                <span>Monitoring &amp; logging (Prometheus, Grafana)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-700">✓</span>
                <span>Real-world production outages</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-700">✓</span>
                <span>Custom community scenarios</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-2">
            <button
              onClick={() => setShowModal(true)}
              className="flex w-full items-center justify-center gap-2 border border-black bg-acid px-3 py-2.5 text-xs font-black uppercase tracking-wider text-black transition-all hover:brightness-105 active:translate-y-px"
            >
              PLUG &amp; PLAY NEW SCENARIOS <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Developer Scenario Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 font-mono">
          <div className="relative w-full max-w-2xl border border-line bg-surface p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-acid">
                  MAINTAINER WORKFLOW
                </div>
                <h3 className="font-display text-xl font-black uppercase text-white">
                  Adding New Levels to DockerOps
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="flex h-7 w-7 items-center justify-center border border-line bg-black text-sm text-[#8e8e93] hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Security Notice */}
            <div className="mt-4 border border-line/60 bg-black/60 p-3 text-xs text-[#8e8e93]">
              <div className="flex items-center gap-1.5 font-bold text-white mb-1">
                <svg
                  className="h-3.5 w-3.5 text-volt"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Security Note for Deployment:</span>
              </div>
              Public website visitors <strong className="text-volt">cannot</strong> create or upload levels.
              Levels are defined securely in the repository as validated YAML documents so you have full control over what runs on your servers.
            </div>

            {/* Quick Command */}
            <div className="mt-4">
              <div className="mb-1.5 text-[10px] font-bold uppercase text-[#8e8e93]">
                Run the Level Creator CLI in your repository root:
              </div>
              <div className="flex items-center justify-between border border-line bg-black px-4 py-3">
                <code className="text-sm font-bold text-acid">pnpm new-level</code>
                <button
                  onClick={handleCopy}
                  className="border border-line bg-surfaceRaised px-3 py-1 text-[10px] font-bold uppercase text-white hover:border-acid hover:text-acid"
                >
                  {copied ? "COPIED! ✓" : "COPY COMMAND"}
                </button>
              </div>
            </div>

            {/* 3 Step Guide */}
            <div className="mt-5 space-y-2.5 text-xs">
              <div className="flex items-start gap-3 border border-line/40 bg-black/40 p-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-line bg-black text-[10px] font-bold text-volt">
                  1
                </span>
                <div>
                  <strong className="text-white">Run the CLI:</strong> Run <code className="text-acid">pnpm new-level</code>. It prompts for title, concept, difficulty &amp; generates a validated YAML scenario file.
                </div>
              </div>

              <div className="flex items-start gap-3 border border-line/40 bg-black/40 p-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-line bg-black text-[10px] font-bold text-volt">
                  2
                </span>
                <div>
                  <strong className="text-white">Validate Scenarios:</strong> Run <code className="text-acid">pnpm validate-levels</code> to ensure all conditions, hints, and docker images conform to the schema.
                </div>
              </div>

              <div className="flex items-start gap-3 border border-line/40 bg-black/40 p-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-line bg-black text-[10px] font-bold text-volt">
                  3
                </span>
                <div>
                  <strong className="text-white">Deploy:</strong> Push changes via <code className="text-white">git push</code>. The game engine automatically loads the new level into the map, runner, and history log.
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end border-t border-line pt-4">
              <button
                onClick={() => setShowModal(false)}
                className="border border-line bg-white px-5 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-paperDim"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
