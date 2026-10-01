import { create } from "zustand";
import type { SandboxStateSnapshot, TopologyGraph } from "@dockerops/shared";

export type SelectedResource = { kind: "container" | "image" | "network" | "volume" | "host"; id: string } | null;

export interface AchievementInfo {
  id: string;
  title: string;
  description: string;
}

interface CompletionInfo {
  xpAwarded: number;
  commandsRun: number;
  hintsUsed: number;
  durationSeconds: number;
  newlyUnlockedAchievements: AchievementInfo[];
}

interface SessionState {
  sessionId: string | null;
  sandboxStatus: "idle" | "provisioning" | "ready" | "error" | "destroyed";
  statusMessage?: string;
  snapshot: SandboxStateSnapshot | null;
  topology: TopologyGraph | null;
  completedPartIds: Set<string>;
  /** The id of a part that JUST completed, so the UI can show a one-time
   * "part complete" celebration before advancing — distinct from mission
   * completion, which uses `completion` below. */
  celebratingPartId: string | null;
  missionComplete: boolean;
  completion: CompletionInfo | null;
  selectedResource: SelectedResource;
  inspectorOpen: boolean;

  setSession: (sessionId: string) => void;
  setSandboxStatus: (status: SessionState["sandboxStatus"], message?: string) => void;
  applyStateUpdate: (snapshot: SandboxStateSnapshot, topology: TopologyGraph) => void;
  applyObjectiveUpdate: (
    partId: string,
    complete: boolean,
    missionComplete: boolean,
    completion?: CompletionInfo,
  ) => void;
  dismissCelebration: () => void;
  selectResource: (resource: SelectedResource) => void;
  setInspectorOpen: (open: boolean) => void;
  reset: () => void;
}

const initialState = {
  sessionId: null as string | null,
  sandboxStatus: "idle" as const,
  snapshot: null as SandboxStateSnapshot | null,
  topology: null as TopologyGraph | null,
  completedPartIds: new Set<string>(),
  celebratingPartId: null as string | null,
  missionComplete: false,
  completion: null as CompletionInfo | null,
  selectedResource: null as SelectedResource,
  inspectorOpen: false,
};

export const useSessionStore = create<SessionState>((set) => ({
  ...initialState,

  setSession: (sessionId) => set({ sessionId }),
  setSandboxStatus: (sandboxStatus, statusMessage) => set({ sandboxStatus, statusMessage }),
  applyStateUpdate: (snapshot, topology) => set({ snapshot, topology }),
  applyObjectiveUpdate: (partId, complete, missionComplete, completion) =>
    set((state) => {
      const alreadyKnown = state.completedPartIds.has(partId);
      const completedPartIds = new Set(state.completedPartIds);
      if (complete) completedPartIds.add(partId);
      return {
        completedPartIds,
        // Only pop the celebration the FIRST time we see this part complete.
        celebratingPartId: complete && !alreadyKnown && !missionComplete ? partId : state.celebratingPartId,
        missionComplete,
        completion: missionComplete && completion ? completion : state.completion,
      };
    }),
  dismissCelebration: () => set({ celebratingPartId: null }),
  selectResource: (selectedResource) => set({ selectedResource, inspectorOpen: true }),
  setInspectorOpen: (inspectorOpen) => set({ inspectorOpen }),
  reset: () => set({ ...initialState, completedPartIds: new Set() }),
}));
