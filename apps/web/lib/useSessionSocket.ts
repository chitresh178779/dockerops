"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { SOCKET_EVENTS, type SandboxStatusEvent, type StateUpdateEvent, type ObjectiveUpdateEvent } from "@dockerops/shared";
import { useSessionStore } from "@/store/session-store";

export function useSessionSocket(sessionId: string | null) {
  const applyStateUpdate = useSessionStore((s) => s.applyStateUpdate);
  const applyObjectiveUpdate = useSessionStore((s) => s.applyObjectiveUpdate);
  const setSandboxStatus = useSessionStore((s) => s.setSandboxStatus);

  useEffect(() => {
    if (!sessionId) return;
    const socket = getSocket();

    const onStatus = (evt: SandboxStatusEvent) => {
      if (evt.sessionId === sessionId) setSandboxStatus(evt.status, evt.message);
    };
    const onState = (evt: StateUpdateEvent) => {
      if (evt.sessionId === sessionId) applyStateUpdate(evt.snapshot, evt.topology);
    };
    const onObjective = (evt: ObjectiveUpdateEvent) => {
      if (evt.sessionId === sessionId) {
        applyObjectiveUpdate(evt.partId, evt.status === "complete", evt.missionComplete, {
          xpAwarded: evt.xpAwarded ?? 0,
          commandsRun: evt.commandsRun ?? 0,
          hintsUsed: evt.hintsUsed ?? 0,
          durationSeconds: evt.durationSeconds ?? 0,
          newlyUnlockedAchievements: evt.newlyUnlockedAchievements ?? [],
        });
      }
    };

    socket.on(SOCKET_EVENTS.SANDBOX_STATUS, onStatus);
    socket.on(SOCKET_EVENTS.STATE_UPDATE, onState);
    socket.on(SOCKET_EVENTS.OBJECTIVE_UPDATE, onObjective);

    return () => {
      socket.off(SOCKET_EVENTS.SANDBOX_STATUS, onStatus);
      socket.off(SOCKET_EVENTS.STATE_UPDATE, onState);
      socket.off(SOCKET_EVENTS.OBJECTIVE_UPDATE, onObjective);
    };
  }, [sessionId, applyStateUpdate, applyObjectiveUpdate, setSandboxStatus]);
}
