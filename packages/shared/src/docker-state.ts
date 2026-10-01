/**
 * The live projection of a player sandbox's real Docker Engine state.
 * The backend derives this from `docker inspect`/`ps`/`network ls`/`volume ls`
 * calls against the sandbox's inner engine (via dockerode) — it is never
 * trusted to or authored by the client.
 */

export type ContainerRuntimeState =
  | "running"
  | "exited"
  | "restarting"
  | "paused"
  | "dead"
  | "created";

export type HealthState = "healthy" | "unhealthy" | "starting" | "none";

export interface PortMapping {
  containerPort: number;
  protocol: "tcp" | "udp";
  hostPort?: number;
  hostIp?: string;
}

export interface ContainerSummary {
  id: string;
  shortId: string;
  name: string;
  image: string;
  state: ContainerRuntimeState;
  health: HealthState;
  status: string;
  createdAt: string;
  startedAt?: string;
  exitCode?: number;
  networks: string[];
  volumes: { name: string; mountPath: string; readOnly: boolean }[];
  ports: PortMapping[];
  labels: Record<string, string>;
  discovered: boolean;
}

export interface ImageSummary {
  id: string;
  shortId: string;
  repository: string;
  tag: string;
  size: string;
  createdAt: string;
  inUseBy: string[];
  discovered: boolean;
}

export interface NetworkSummary {
  id: string;
  name: string;
  driver: string;
  scope: string;
  containers: string[];
  isolated: boolean;
  discovered: boolean;
}

export interface VolumeSummary {
  name: string;
  driver: string;
  mountpoint: string;
  attachedTo: string[];
  discovered: boolean;
}

export interface HostSummary {
  name: string;
  engineStatus: "up" | "down" | "degraded";
  dockerVersion: string;
  containerCount: number;
  imageCount: number;
}

export interface SandboxStateSnapshot {
  sessionId: string;
  host: HostSummary;
  containers: ContainerSummary[];
  images: ImageSummary[];
  networks: NetworkSummary[];
  volumes: VolumeSummary[];
  capturedAt: string;
}

export interface TopologyNodeData {
  id: string;
  kind: "host" | "container" | "network" | "volume" | "service";
  label: string;
  state?: string;
  health?: HealthState;
}

export interface TopologyEdgeData {
  id: string;
  source: string;
  target: string;
  kind: "runs-on" | "network" | "mount" | "port" | "depends-on";
  label?: string;
}

export interface TopologyGraph {
  nodes: TopologyNodeData[];
  edges: TopologyEdgeData[];
}
