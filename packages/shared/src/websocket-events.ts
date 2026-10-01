import type { SandboxStateSnapshot, TopologyGraph } from "./docker-state";

/** Client -> server */
export interface TerminalInputEvent {
  sessionId: string;
  data: string;
}

export interface TerminalResizeEvent {
  sessionId: string;
  cols: number;
  rows: number;
}

export interface JoinSessionEvent {
  sessionId: string;
}

/** Server -> client */
export interface TerminalOutputEvent {
  sessionId: string;
  data: string;
}

export interface SandboxStatusEvent {
  sessionId: string;
  status: "provisioning" | "ready" | "error" | "destroyed";
  message?: string;
}

export interface StateUpdateEvent {
  sessionId: string;
  snapshot: SandboxStateSnapshot;
  topology: TopologyGraph;
}

export interface ObjectiveUpdateEvent {
  sessionId: string;
  partId: string;
  status: "in-progress" | "complete";
  missionComplete: boolean;
  xpAwarded?: number;
  commandsRun?: number;
  hintsUsed?: number;
  durationSeconds?: number;
  newlyUnlockedAchievements?: { id: string; title: string; description: string }[];
}

export const SOCKET_EVENTS = {
  JOIN_SESSION: "session:join",
  TERMINAL_INPUT: "terminal:input",
  TERMINAL_RESIZE: "terminal:resize",
  TERMINAL_OUTPUT: "terminal:output",
  SANDBOX_STATUS: "sandbox:status",
  STATE_UPDATE: "state:update",
  OBJECTIVE_UPDATE: "objective:update",
  REQUEST_HINT: "hint:request",
} as const;
