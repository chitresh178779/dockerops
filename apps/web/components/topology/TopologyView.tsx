"use client";

import { useMemo, useCallback } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  type NodeTypes,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { TopologyGraph, TopologyNodeData, SandboxStateSnapshot } from "@dockerops/shared";
import { useSessionStore } from "@/store/session-store";
import { TopologyNode } from "./TopologyNode";
import { layoutTopology } from "./layout";

const nodeTypes: NodeTypes = { topo: TopologyNode as any };

export function TopologyView({
  topology,
  snapshot,
}: {
  topology: TopologyGraph | null;
  snapshot?: SandboxStateSnapshot | null;
}) {
  const selectResource = useSessionStore((s) => s.selectResource);
  const setInspectorOpen = useSessionStore((s) => s.setInspectorOpen);

  // Compute effective topology: fallback to snapshot if socket topology is not populated
  const effectiveGraph = useMemo<TopologyGraph>(() => {
    if (topology && topology.nodes.length > 0) {
      return topology;
    }
    if (snapshot) {
      const nodes: TopologyGraph["nodes"] = [
        {
          id: "host",
          kind: "host",
          label: snapshot.host.name || "prod-01",
          state: snapshot.host.engineStatus || "up",
        },
      ];
      const edges: TopologyGraph["edges"] = [];

      for (const net of snapshot.networks.filter((n) => n.discovered)) {
        nodes.push({ id: `net:${net.name}`, kind: "network", label: net.name });
      }

      for (const c of snapshot.containers.filter((x) => x.discovered)) {
        nodes.push({
          id: `ctr:${c.name}`,
          kind: "container",
          label: c.name,
          state: c.state,
          health: c.health,
        });
        edges.push({ id: `host-${c.name}`, source: "host", target: `ctr:${c.name}`, kind: "runs-on" });

        for (const net of c.networks) {
          if (snapshot.networks.find((n) => n.name === net && n.discovered)) {
            edges.push({
              id: `net-${c.name}-${net}`,
              source: `ctr:${c.name}`,
              target: `net:${net}`,
              kind: "network",
            });
          }
        }

        for (const v of c.volumes) {
          const vol = snapshot.volumes.find((x) => x.name === v.name && x.discovered);
          if (vol) {
            nodes.push({ id: `vol:${vol.name}`, kind: "volume", label: vol.name });
            edges.push({
              id: `mount-${c.name}-${vol.name}`,
              source: `ctr:${c.name}`,
              target: `vol:${vol.name}`,
              kind: "mount",
              label: v.mountPath,
            });
          }
        }

        for (const p of c.ports.filter((x) => x.hostPort)) {
          edges.push({
            id: `port-${c.name}-${p.hostPort}`,
            source: "host",
            target: `ctr:${c.name}`,
            kind: "port",
            label: `${p.hostPort}->${p.containerPort}`,
          });
        }
      }

      return {
        nodes: Array.from(new Map(nodes.map((n) => [n.id, n])).values()),
        edges,
      };
    }

    // Default minimum node if nothing is loaded yet
    return {
      nodes: [{ id: "host", kind: "host", label: "prod-01", state: "up" }],
      edges: [],
    };
  }, [topology, snapshot]);

  const { nodes, edges } = useMemo(() => layoutTopology(effectiveGraph), [effectiveGraph]);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const data = node.data as unknown as TopologyNodeData;
      if (!data) return;
      if (data.id === "internet") return;

      if (data.kind === "container") {
        const containerName = data.id.replace(/^ctr:/, "");
        selectResource({ kind: "container", id: containerName });
        setInspectorOpen(true);
      } else if (data.kind === "network") {
        const networkName = data.id.replace(/^net:/, "");
        selectResource({ kind: "network", id: networkName });
        setInspectorOpen(true);
      } else if (data.kind === "volume") {
        const volumeName = data.id.replace(/^vol:/, "");
        selectResource({ kind: "volume", id: volumeName });
        setInspectorOpen(true);
      } else if (data.kind === "host") {
        selectResource({ kind: "host", id: data.label });
        setInspectorOpen(true);
      }
    },
    [selectResource, setInspectorOpen],
  );

  const hiddenCount = snapshot?.containers.filter((c) => !c.discovered).length ?? 0;
  const discoveredCount = snapshot?.containers.filter((c) => c.discovered).length ?? 0;

  return (
    <div className="relative flex h-full w-full min-h-[220px] flex-col overflow-hidden bg-black font-mono">
      {/* Top Banner Guide */}
      <div className="pointer-events-none absolute left-3 top-2.5 z-10 flex items-center gap-2">
        <span className="border border-line bg-black/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#8e8e93]">
          ARCHITECTURE MAP • CLICK NODE TO INSPECT
        </span>
        {hiddenCount > 0 && discoveredCount === 0 && (
          <span className="border border-volt/60 bg-volt/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-volt">
            {hiddenCount} HIDDEN OBJECT (RUN &apos;docker ps -a&apos;)
          </span>
        )}
      </div>

      <div className="h-full w-full flex-1 relative min-h-[200px]" style={{ width: "100%", height: "100%" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          fitView
          fitViewOptions={{ padding: 0.35 }}
          proOptions={{ hideAttribution: true }}
          nodesConnectable={false}
          nodesDraggable={true}
          elementsSelectable={true}
          zoomOnScroll={true}
          panOnScroll={false}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#262626" />
          <Controls
            className="!border !border-line !bg-black !fill-white !text-white [&>button]:!border-line [&>button]:!bg-surface [&>button]:!fill-white [&>button:hover]:!bg-surfaceHover"
            showInteractive={false}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
