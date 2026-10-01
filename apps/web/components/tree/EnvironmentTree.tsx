"use client";

import { useState } from "react";
import type { SandboxStateSnapshot } from "@dockerops/shared";
import { useSessionStore } from "@/store/session-store";
import { cn } from "@/lib/cn";

const STATE_DOT: Record<string, string> = {
  running: "bg-acid",
  exited: "bg-incident",
  restarting: "bg-warn animate-pulse",
  paused: "bg-info",
  dead: "bg-incident",
  created: "bg-info",
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("h-3 w-3 shrink-0 text-paper/40 transition-transform", open && "rotate-90")}
    >
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Section({
  title,
  count,
  hiddenCount,
  children,
}: {
  title: string;
  count: number;
  hiddenCount: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-line/60">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-[11px] font-bold uppercase tracking-widest text-paper/60 hover:text-paper"
      >
        <span className="flex items-center gap-1.5">
          <Chevron open={open} />
          {title} <span className="text-paper/30">({count})</span>
        </span>
        {hiddenCount > 0 && <span className="text-paper/25">+{hiddenCount} hidden</span>}
      </button>
      {open && <div className="pb-1">{children}</div>}
    </div>
  );
}

function Row({
  label,
  sub,
  dot,
  active,
  onClick,
}: {
  label: string;
  sub?: string;
  dot?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-surfaceRaised",
        active && "bg-surfaceRaised text-acid",
      )}
    >
      {dot && <span className={cn("h-2 w-2 shrink-0 rounded-full", dot)} />}
      <span className="flex-1 truncate">{label}</span>
      {sub && <span className="shrink-0 text-[10px] text-paper/40">{sub}</span>}
    </button>
  );
}

export function EnvironmentTree({ snapshot }: { snapshot: SandboxStateSnapshot | null }) {
  const selected = useSessionStore((s) => s.selectedResource);
  const select = useSessionStore((s) => s.selectResource);

  if (!snapshot) {
    return <div className="p-4 text-xs text-paper/40">Provisioning sandbox…</div>;
  }

  const containers = snapshot.containers.filter((c) => c.discovered);
  const images = snapshot.images.filter((i) => i.discovered);
  const networks = snapshot.networks.filter((n) => n.discovered);
  const volumes = snapshot.volumes.filter((v) => v.discovered);
  const ports = containers.flatMap((c) => c.ports.filter((p) => p.hostPort).map((p) => ({ container: c, port: p })));

  return (
    <div className="h-full overflow-y-auto">
      <div className="border-b border-line/60 px-3 py-2">
        <Row
          label={snapshot.host.name}
          sub={snapshot.host.engineStatus.toUpperCase()}
          dot={snapshot.host.engineStatus === "up" ? "bg-acid" : "bg-incident"}
          active={selected?.kind === "host"}
          onClick={() => select({ kind: "host", id: snapshot.host.name })}
        />
      </div>

      <Section title="Containers" count={containers.length} hiddenCount={snapshot.containers.length - containers.length}>
        {containers.length === 0 && <p className="px-3 py-1 text-[11px] text-paper/30">Nothing discovered yet.</p>}
        {containers.map((c) => (
          <Row
            key={c.id}
            label={c.name}
            sub={c.state}
            dot={STATE_DOT[c.state] ?? "bg-paper/30"}
            active={selected?.kind === "container" && selected.id === c.id}
            onClick={() => select({ kind: "container", id: c.id })}
          />
        ))}
      </Section>

      <Section title="Images" count={images.length} hiddenCount={snapshot.images.length - images.length}>
        {images.length === 0 && <p className="px-3 py-1 text-[11px] text-paper/30">Nothing discovered yet.</p>}
        {images.map((i) => (
          <Row
            key={i.id}
            label={`${i.repository}:${i.tag}`}
            active={selected?.kind === "image" && selected.id === i.id}
            onClick={() => select({ kind: "image", id: i.id })}
          />
        ))}
      </Section>

      <Section title="Networks" count={networks.length} hiddenCount={snapshot.networks.length - networks.length}>
        {networks.length === 0 && <p className="px-3 py-1 text-[11px] text-paper/30">Nothing discovered yet.</p>}
        {networks.map((n) => (
          <Row
            key={n.id}
            label={n.name}
            sub={`${n.containers.length} ctr`}
            active={selected?.kind === "network" && selected.id === n.id}
            onClick={() => select({ kind: "network", id: n.id })}
          />
        ))}
      </Section>

      <Section title="Volumes" count={volumes.length} hiddenCount={snapshot.volumes.length - volumes.length}>
        {volumes.length === 0 && <p className="px-3 py-1 text-[11px] text-paper/30">Nothing discovered yet.</p>}
        {volumes.map((v) => (
          <Row
            key={v.name}
            label={v.name}
            active={selected?.kind === "volume" && selected.id === v.name}
            onClick={() => select({ kind: "volume", id: v.name })}
          />
        ))}
      </Section>

      <Section title="Ports" count={ports.length} hiddenCount={0}>
        {ports.length === 0 && <p className="px-3 py-1 text-[11px] text-paper/30">Nothing published yet.</p>}
        {ports.map(({ container, port }) => (
          <Row
            key={`${container.id}-${port.hostPort}-${port.containerPort}`}
            label={`${port.hostPort} → ${port.containerPort}`}
            sub={container.name}
            active={selected?.kind === "container" && selected.id === container.id}
            onClick={() => select({ kind: "container", id: container.id })}
          />
        ))}
      </Section>
    </div>
  );
}
