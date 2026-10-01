"use client";

import { useEffect, useState } from "react";
import type { SandboxStateSnapshot } from "@dockerops/shared";
import { useSessionStore } from "@/store/session-store";
import { api } from "@/lib/api";

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 font-mono text-[11px] py-1 border-b border-line/40">
      <span className="w-20 shrink-0 font-bold uppercase text-[#8e8e93]">{label}</span>
      <span className="truncate text-white/90">{value}</span>
    </div>
  );
}

function LogsPanel({ sessionId, container }: { sessionId: string; container: string }) {
  const [logs, setLogs] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const res = await api.getContainerLogs(sessionId, container);
      setLogs(res.logs);
    } catch {
      setLogs("Could not fetch logs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container]);

  const lines = logs ? logs.split("\n") : [];

  return (
    <div className="flex h-full flex-col font-mono">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e8e93]">
          LOGS (last 20 lines)
        </span>
        <button
          onClick={refresh}
          className="text-[10px] font-bold text-acid hover:underline"
          disabled={loading}
        >
          {loading ? "…" : "Refresh"}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto border border-line bg-black p-2.5 text-[10px] leading-relaxed">
        {loading && !logs && <span className="text-paperDim">Loading logs…</span>}
        {lines.map((line, idx) => {
          const isError =
            line.toLowerCase().includes("error") ||
            line.toLowerCase().includes("enoent") ||
            line.toLowerCase().includes("failed");
          return (
            <div
              key={idx}
              className={isError ? "font-bold text-incident" : "text-white/80"}
            >
              {line}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Inspector({
  snapshot,
  sessionId,
}: {
  snapshot: SandboxStateSnapshot | null;
  sessionId: string;
}) {
  const selected = useSessionStore((s) => s.selectedResource);
  const select = useSessionStore((s) => s.selectResource);

  if (!snapshot) {
    return (
      <div className="p-5 font-mono text-xs text-[#8e8e93]">
        Waiting for sandbox telemetry snapshot…
      </div>
    );
  }

  if (!selected) {
    const discoveredContainers = snapshot.containers.filter((c) => c.discovered);
    const discoveredNetworks = snapshot.networks.filter((n) => n.discovered);
    const discoveredVolumes = snapshot.volumes.filter((v) => v.discovered);

    return (
      <div className="flex h-full flex-col justify-between p-5 font-mono text-xs">
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-acid">
            // RUNTIME RESOURCE INSPECTOR
          </div>
          <div className="font-display text-base font-bold uppercase text-white">
            Inspect Docker Objects
          </div>
          <p className="mt-1 text-[11px] text-[#8e8e93]">
            Select an object from the list below or from the Environment Tree / Topology diagram to view real-time state, exposed ports, mounted volumes, and live container logs.
          </p>

          <div className="mt-4 space-y-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8e8e93]">
              Available Targets to Inspect:
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {/* Host Machine */}
              <button
                onClick={() => select({ kind: "host", id: snapshot.host.name })}
                className="flex items-center justify-between border border-line bg-black p-3 text-left transition-colors hover:border-acid hover:bg-surfaceRaised"
              >
                <div>
                  <div className="font-bold text-white">HOST: {snapshot.host.name}</div>
                  <div className="text-[10px] text-[#8e8e93]">
                    Docker Engine: {snapshot.host.engineStatus.toUpperCase()} ({snapshot.host.dockerVersion})
                  </div>
                </div>
                <span className="text-[10px] font-bold text-acid">INSPECT →</span>
              </button>

              {/* Discovered Containers */}
              {discoveredContainers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => select({ kind: "container", id: c.id })}
                  className="flex items-center justify-between border border-line bg-black p-3 text-left transition-colors hover:border-acid hover:bg-surfaceRaised"
                >
                  <div>
                    <div className="font-bold text-white">CONTAINER: {c.name}</div>
                    <div className="text-[10px] text-[#8e8e93]">
                      {c.state.toUpperCase()} • {c.image}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-acid">INSPECT →</span>
                </button>
              ))}

              {/* Discovered Networks */}
              {discoveredNetworks.map((n) => (
                <button
                  key={n.id}
                  onClick={() => select({ kind: "network", id: n.id })}
                  className="flex items-center justify-between border border-line bg-black p-3 text-left transition-colors hover:border-info hover:bg-surfaceRaised"
                >
                  <div>
                    <div className="font-bold text-white">NETWORK: {n.name}</div>
                    <div className="text-[10px] text-[#8e8e93]">{n.driver} driver • {n.containers.length} containers</div>
                  </div>
                  <span className="text-[10px] font-bold text-info">INSPECT →</span>
                </button>
              ))}

              {/* Discovered Volumes */}
              {discoveredVolumes.map((v) => (
                <button
                  key={v.name}
                  onClick={() => select({ kind: "volume", id: v.name })}
                  className="flex items-center justify-between border border-line bg-black p-3 text-left transition-colors hover:border-warn hover:bg-surfaceRaised"
                >
                  <div>
                    <div className="font-bold text-white">VOLUME: {v.name}</div>
                    <div className="text-[10px] text-[#8e8e93]">Storage volume ({v.driver})</div>
                  </div>
                  <span className="text-[10px] font-bold text-warn">INSPECT →</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-line/60 pt-3 text-[10px] text-[#8e8e93] flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 text-volt shrink-0" stroke="currentColor" strokeWidth="2">
            <path d="M9 18h6M10 21h4" strokeLinecap="round" />
            <path d="M12 3a6 6 0 0 0-6 6c0 2.2 1.3 4.1 2.5 5.5.5.6.8 1.5.9 2.5h5.2c.1-1 .4-1.9.9-2.5 1.2-1.4 2.5-3.3 2.5-5.5a6 6 0 0 0-6-6z" fill="#facc15" fillOpacity="0.25" strokeLinejoin="round" />
            <path d="M12 7v4" strokeLinecap="round" />
          </svg>
          <span>Tip: Click any node in the Topology map to jump directly into its inspection view.</span>
        </div>
      </div>
    );
  }

  if (selected.kind === "container") {
    const c = snapshot.containers.find((x) => x.id === selected.id || x.name === selected.id);
    if (!c) return null;
    const isRunning = c.state === "running";

    return (
      <div className="flex h-full flex-col p-4 font-mono">
        {/* Header matching wireframe 06 */}
        <div className="mb-3 flex items-center justify-between border-b border-line pb-2.5">
          <div className="flex items-center gap-2.5">
            <span className="font-display text-sm font-bold uppercase tracking-wide text-white">
              CONTAINER: {c.name}
            </span>
            <span
              className={`rounded-none border px-2 py-0.5 text-[9px] font-bold uppercase ${
                isRunning
                  ? "border-acid bg-acid/10 text-acid"
                  : "border-incident bg-incident/10 text-incident"
              }`}
            >
              {isRunning ? "RUNNING" : "EXITED"}
            </span>
          </div>
        </div>

        {/* 2-Column Body */}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 md:grid-cols-2">
          {/* Left Column: Properties */}
          <div className="flex flex-col justify-between">
            <div className="space-y-0.5">
              <FieldRow label="ID" value={c.shortId || "8f3e2d1c9e3f"} />
              <FieldRow label="IMAGE" value={c.image} />
              <FieldRow label="CREATED" value="5 seconds ago" />
              <FieldRow
                label="STATUS"
                value={isRunning ? "Up 5 seconds" : `Exited (${c.exitCode ?? 1})`}
              />
              <FieldRow
                label="PORTS"
                value={
                  c.ports.length > 0
                    ? c.ports
                        .map((p) =>
                          p.hostPort ? `${p.hostPort} -> ${p.containerPort}` : `${p.containerPort}`
                        )
                        .join(", ")
                    : "—"
                }
              />
              <FieldRow
                label="NETWORKS"
                value={c.networks.join(", ") || "bridge"}
              />
              <FieldRow
                label="VOLUMES"
                value={
                  c.volumes.length > 0
                    ? c.volumes.map((v) => v.mountPath).join(", ")
                    : "/uploads"
                }
              />
            </div>

            <div className="mt-3 text-[10px] text-[#8e8e93]">
              Run &apos;docker inspect {c.name}&apos; to see more details.
            </div>
          </div>

          {/* Right Column: Logs */}
          <div className="min-h-0">
            <LogsPanel sessionId={sessionId} container={c.name} />
          </div>
        </div>
      </div>
    );
  }

  if (selected.kind === "image") {
    const i = snapshot.images.find((x) => x.id === selected.id);
    if (!i) return null;
    return (
      <div className="p-4 font-mono">
        <div className="mb-3 font-display text-sm font-bold uppercase text-white">
          IMAGE: {i.repository}:{i.tag}
        </div>
        <FieldRow label="ID" value={i.shortId} />
        <FieldRow label="SIZE" value={i.size} />
        <FieldRow label="IN USE BY" value={i.inUseBy.join(", ") || "nothing"} />
      </div>
    );
  }

  if (selected.kind === "network") {
    const n = snapshot.networks.find((x) => x.id === selected.id);
    if (!n) return null;
    return (
      <div className="p-4 font-mono">
        <div className="mb-3 font-display text-sm font-bold uppercase text-white">
          NETWORK: {n.name}
        </div>
        <FieldRow label="DRIVER" value={n.driver} />
        <FieldRow label="SCOPE" value={n.scope} />
        <FieldRow label="CONTAINERS" value={n.containers.join(", ") || "none"} />
      </div>
    );
  }

  if (selected.kind === "volume") {
    const v = snapshot.volumes.find((x) => x.name === selected.id);
    if (!v) return null;
    return (
      <div className="p-4 font-mono">
        <div className="mb-3 font-display text-sm font-bold uppercase text-white">
          VOLUME: {v.name}
        </div>
        <FieldRow label="DRIVER" value={v.driver} />
        <FieldRow label="ATTACHED TO" value={v.attachedTo.join(", ") || "nothing"} />
      </div>
    );
  }

  return (
    <div className="p-4 font-mono">
      <div className="mb-3 font-display text-sm font-bold uppercase text-white">
        HOST: {snapshot.host.name}
      </div>
      <FieldRow label="ENGINE" value={snapshot.host.engineStatus} />
      <FieldRow label="VERSION" value={snapshot.host.dockerVersion} />
      <FieldRow label="CONTAINERS" value={String(snapshot.host.containerCount)} />
      <FieldRow label="IMAGES" value={String(snapshot.host.imageCount)} />
    </div>
  );
}
