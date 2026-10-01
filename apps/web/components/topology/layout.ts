import type { Node, Edge } from "@xyflow/react";
import type { TopologyGraph, TopologyNodeData } from "@dockerops/shared";

const ROW_Y: Record<TopologyNodeData["kind"] | "internet", number> = {
  internet: -130,
  host: 0,
  container: 140,
  service: 140,
  network: 280,
  volume: 410,
};

const COL_WIDTH = 160;

export function layoutTopology(graph: TopologyGraph): { nodes: Node[]; edges: Edge[] } {
  const byKind = new Map<TopologyNodeData["kind"], TopologyNodeData[]>();
  for (const n of graph.nodes) {
    const list = byKind.get(n.kind) ?? [];
    list.push(n);
    byKind.set(n.kind, list);
  }

  const nodes: Node[] = [];
  for (const [kind, list] of byKind.entries()) {
    const totalWidth = (list.length - 1) * COL_WIDTH;
    list.forEach((n, idx) => {
      nodes.push({
        id: n.id,
        type: "topo",
        data: n as unknown as Record<string, unknown>,
        position: { x: idx * COL_WIDTH - totalWidth / 2, y: ROW_Y[kind] },
        draggable: false,
      });
    });
  }

  const edges: Edge[] = graph.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: e.kind === "network",
    style: { stroke: e.kind === "port" ? "#ffc23c" : "#232b28", strokeWidth: 1.5 },
    labelStyle: { fill: "#eef1ec", fontSize: 9 },
  }));

  // "Internet" isn't real Docker state — it's a cosmetic anchor above any
  // container that actually publishes a port to the host, so the diagram
  // reads the way traffic really flows: internet -> host -> container.
  const publishingEdges = graph.edges.filter((e) => e.kind === "port");
  if (publishingEdges.length > 0) {
    nodes.push({
      id: "internet",
      type: "topo",
      data: { id: "internet", kind: "service", label: "Internet" } as unknown as Record<string, unknown>,
      position: { x: 0, y: ROW_Y.internet },
      draggable: false,
    });
    for (const e of publishingEdges) {
      edges.push({
        id: `internet-${e.target}`,
        source: "internet",
        target: e.target,
        animated: true,
        style: { stroke: "#ffc23c", strokeWidth: 1.5 },
      });
    }
  }

  return { nodes, edges };
}
