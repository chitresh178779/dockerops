import type { LevelSummary, PlayerProfile } from "@dockerops/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const PLAYER_KEY = "dockerops-player-id";

function getPlayerId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(PLAYER_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(PLAYER_KEY, id);
  }
  return id;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Player-Id": getPlayerId(), ...init?.headers
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${init?.method ?? "GET"} ${path} failed: ${res.status} ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface PublicPart {
  id: string;
  kind: string;
  title: string;
  objective: string;
  briefing?: string;
  docRefs: string[];
  hints: { id: string; tier: string; xpCost: number }[];
}

export interface PublicLevel {
  metadata: {
    id: string;
    order: number;
    title: string;
    concept: string;
    difficulty: string;
    estimatedMinutes: number;
    prerequisites: string[];
    xpReward: number;
    commandFamilies: string[];
    learningGoals: string[];
  };
  narrative: {
    role: string;
    incident: string;
    symptoms: string[];
    missionBrief: string;
    timeline: string[];
  };
  parts: PublicPart[];
  achievements: { id: string; title: string; description: string }[];
}

export interface GameSessionDto {
  id: string;
  userId: string;
  levelId: string;
  status: "PROVISIONING" | "READY" | "ERROR" | "DESTROYED";
  currentPartId: string | null;
  sandboxContainerId: string | null;
}

export interface DocPage {
  slug: string;
  title: string;
  concept: string;
  shortExplanation: string;
  body: string;
  syntax: string[];
  commonFlags: { flag: string; description: string }[];
}

export const api = {
  getLevels: () => request<LevelSummary[]>("/levels"),
  getLevel: (id: string) => request<PublicLevel>(`/levels/${id}`),
  getProfile: () => request<PlayerProfile>("/profile"),
  createSession: (levelId: string) =>
    request<GameSessionDto>("/sessions", { method: "POST", body: JSON.stringify({ levelId }) }),
  getSession: (id: string) => request<GameSessionDto>(`/sessions/${id}`),
  resetSession: (id: string) => request<GameSessionDto>(`/sessions/${id}/reset`, { method: "POST" }),
  destroySession: (id: string) => request<{ ok: boolean }>(`/sessions/${id}`, { method: "DELETE" }),
  requestHint: (sessionId: string, partId: string, hintId: string) =>
    request<{ id: string; tier: string; text: string; xpCost: number }>(
      `/sessions/${sessionId}/hints/${hintId}`,
      { method: "POST", body: JSON.stringify({ partId }) },
    ),
  getContainerLogs: (sessionId: string, container: string) =>
    request<{ logs: string }>(`/sessions/${sessionId}/logs/${container}`),
  getDocs: () => request<DocPage[]>("/docs"),
  getDoc: (slug: string) => request<DocPage>(`/docs/${slug}`),
  getAchievements: () =>
    request<
      { id: string; title: string; description: string; levelId: string; levelTitle: string; unlocked: boolean; unlockedAt?: string }[]
    >("/achievements"),
};
