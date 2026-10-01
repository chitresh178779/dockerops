import { Handle, Position } from "@xyflow/react";
import { cn } from "@/lib/cn";
import type { TopologyNodeData } from "@dockerops/shared";

function borderTone(node: TopologyNodeData): string {
  if (node.id === "internet") return "border-white/70 text-white bg-black hover:border-white";
  if (node.kind === "host") {
    const isUp = node.state === "up" || node.state === "running";
    return isUp
      ? "border-acid text-white bg-black hover:border-acid hover:shadow-glowAcid"
      : "border-incident text-white bg-black hover:border-incident";
  }
  if (node.kind === "container") {
    if (node.health === "unhealthy") return "border-incident text-incident bg-black hover:border-incidentDim";
    if (node.state === "running") return "border-acid text-acid bg-black hover:border-acidDim hover:shadow-glowAcid";
    if (node.state === "exited" || node.state === "dead") return "border-incident text-incident bg-black hover:border-incidentDim";
    return "border-volt text-volt bg-black hover:border-voltHover";
  }
  if (node.kind === "network") return "border-info/80 text-info bg-black hover:border-info";
  if (node.kind === "volume") return "border-warn/80 text-warn bg-black hover:border-warn";
  return "border-line text-white bg-black";
}

export function TopologyNode({ data }: { data: TopologyNodeData }) {
  if (data.id === "internet") {
    return (
      <div className={cn("min-w-[120px] border px-3 py-1.5 text-center font-mono select-none", borderTone(data))}>
        <Handle type="source" position={Position.Bottom} className="!bg-white" />
        <div className="flex items-center justify-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest text-[#8e8e93]">
          PUBLIC INGRESS
        </div>
        <div className="text-xs font-black uppercase tracking-wider text-white">INTERNET</div>
      </div>
    );
  }

  if (data.kind === "host") {
    const isUp = data.state === "up" || data.state === "running";
    return (
      <div className={cn("min-w-[140px] cursor-pointer border-2 px-3.5 py-2 text-center font-mono select-none transition-all hover:scale-105 active:scale-95", borderTone(data))}>
        <div className="flex items-center justify-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest text-[#8e8e93]">
          <span className={cn("h-2 w-2 rounded-full", isUp ? "bg-acid animate-pulse" : "bg-incident")} />
          HOST MACHINE
        </div>
        <div className="mt-0.5 truncate text-xs font-black text-white">{data.label}</div>
        <div className={cn("mt-0.5 text-[9px] font-bold uppercase tracking-wider", isUp ? "text-acid" : "text-incident")}>
          DOCKER ENGINE {isUp ? "ONLINE" : "OFFLINE"}
        </div>
        <Handle type="source" position={Position.Bottom} className="!bg-acid" />
      </div>
    );
  }

  if (data.kind === "volume") {
    return (
      <div className="flex flex-col items-center font-mono select-none">
        <Handle type="target" position={Position.Top} className="!bg-warn" />
        <div className={cn("min-w-[110px] cursor-pointer border border-warn bg-black px-2.5 py-2 text-center transition-all hover:scale-105", borderTone(data))}>
          <div className="text-[8px] font-extrabold uppercase tracking-widest text-warn">STORAGE VOLUME</div>
          <div className="truncate text-xs font-bold text-white">{data.label}</div>
        </div>
      </div>
    );
  }

  if (data.kind === "network") {
    return (
      <div className={cn("min-w-[120px] cursor-pointer border px-3 py-1.5 text-center font-mono select-none transition-all hover:scale-105", borderTone(data))}>
        <Handle type="target" position={Position.Top} className="!bg-info" />
        <div className="text-[8px] font-extrabold uppercase tracking-widest text-info">BRIDGE NETWORK</div>
        <div className="truncate text-xs font-bold text-white">{data.label}</div>
        <Handle type="source" position={Position.Bottom} className="!bg-info" />
      </div>
    );
  }

  // Container node
  const isRunning = data.state === "running";
  return (
    <div className={cn("min-w-[130px] cursor-pointer border px-3 py-2 text-center font-mono select-none transition-all hover:scale-105 active:scale-95", borderTone(data))}>
      <Handle type="target" position={Position.Top} className="!bg-line" />
      <div className="flex items-center justify-center gap-1 text-[8px] font-extrabold uppercase tracking-widest text-[#8e8e93]">
        CONTAINER
      </div>
      <div className="truncate text-xs font-black text-white">{data.label}</div>
      <div className={cn("mt-0.5 text-[9px] font-bold uppercase tracking-wider", isRunning ? "text-acid" : "text-incident")}>
        {isRunning ? "● RUNNING" : data.state === "exited" ? "■ EXITED (1)" : data.state ?? "UNKNOWN"}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-line" />
    </div>
  );
}
