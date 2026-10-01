"use client";

import dynamic from "next/dynamic";
import type { SandboxStateSnapshot, TopologyGraph } from "@dockerops/shared";
import { useSessionStore } from "@/store/session-store";
import { Panel } from "@/components/ui/Panel";
import { Inspector } from "@/components/tree/Inspector";
import { cn } from "@/lib/cn";

const TopologyView = dynamic(
  () => import("@/components/topology/TopologyView").then((m) => m.TopologyView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center font-mono text-xs text-[#8e8e93]">
        RENDERING TOPOLOGY GRAPH…
      </div>
    ),
  },
);

export function TopologyInspectorPanel({
  snapshot,
  topology,
  sessionId,
}: {
  snapshot: SandboxStateSnapshot | null;
  topology: TopologyGraph | null;
  sessionId: string;
}) {
  const inspectorOpen = useSessionStore((s) => s.inspectorOpen);
  const setInspectorOpen = useSessionStore((s) => s.setInspectorOpen);
  const selectedResource = useSessionStore((s) => s.selectedResource);
  const selectResource = useSessionStore((s) => s.selectResource);

  const handleTabClick = (tab: "topology" | "inspector") => {
    if (tab === "topology") {
      setInspectorOpen(false);
    } else {
      // If nothing is selected, default to host so user immediately sees real data
      if (!selectedResource && snapshot?.host) {
        selectResource({ kind: "host", id: snapshot.host.name });
      }
      setInspectorOpen(true);
    }
  };

  return (
    <Panel
      title={
        <div className="flex items-center gap-4">
          <Tab active={!inspectorOpen} onClick={() => handleTabClick("topology")}>
            Topology
          </Tab>
          <Tab active={inspectorOpen} onClick={() => handleTabClick("inspector")}>
            Inspector {selectedResource ? `• ${selectedResource.kind.toUpperCase()}: ${selectedResource.id}` : ""}
          </Tab>
        </div>
      }
      className="h-full min-h-0 flex flex-col"
      bodyClassName="h-full min-h-0 relative flex-1 overflow-hidden"
    >
      {inspectorOpen ? (
        <div className="h-full w-full overflow-y-auto bg-black">
          <Inspector snapshot={snapshot} sessionId={sessionId} />
        </div>
      ) : (
        <div className="h-full w-full relative min-h-[220px]">
          <TopologyView topology={topology} snapshot={snapshot} />
        </div>
      )}
    </Panel>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-[11px] font-bold uppercase tracking-widest transition-colors",
        active ? "text-acid border-b border-acid pb-0.5" : "text-paper/40 hover:text-paper",
      )}
    >
      {children}
    </button>
  );
}
