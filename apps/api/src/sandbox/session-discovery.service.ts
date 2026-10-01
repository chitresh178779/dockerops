import { Injectable } from "@nestjs/common";

interface DiscoveryState {
  sawPs: boolean;
  sawPsAll: boolean;
  sawImages: boolean;
  sawNetworkLs: boolean;
  sawVolumeLs: boolean;
  namedContainers: Set<string>;
  namedImages: Set<string>;
  namedNetworks: Set<string>;
  namedVolumes: Set<string>;
}

function emptyState(): DiscoveryState {
  return {
    sawPs: false,
    sawPsAll: false,
    sawImages: false,
    sawNetworkLs: false,
    sawVolumeLs: false,
    namedContainers: new Set(),
    namedImages: new Set(),
    namedNetworks: new Set(),
    namedVolumes: new Set(),
  };
}

const NAME_ARG_COMMANDS = [
  "start",
  "stop",
  "restart",
  "rm",
  "logs",
  "inspect",
  "exec",
  "pause",
  "unpause",
  "kill",
  "top",
  "port",
];

/**
 * Tracks the "knowledge fog" described in the spec: the environment
 * explorer should only reveal what the player has actually asked Docker
 * for. Pure in-memory, keyed by session — cheap and reset-safe.
 */
@Injectable()
export class SessionDiscoveryService {
  private sessions = new Map<string, DiscoveryState>();

  private get(sessionId: string): DiscoveryState {
    let s = this.sessions.get(sessionId);
    if (!s) {
      s = emptyState();
      this.sessions.set(sessionId, s);
    }
    return s;
  }

  reset(sessionId: string) {
    this.sessions.set(sessionId, emptyState());
  }

  drop(sessionId: string) {
    this.sessions.delete(sessionId);
  }

  /** Feed a full command line the player just ran (e.g. "docker ps -a"). */
  observeCommand(sessionId: string, commandLine: string) {
    const state = this.get(sessionId);
    const tokens = commandLine.trim().split(/\s+/);
    if (tokens[0] !== "docker") return;
    const sub = tokens[1];
    const rest = tokens.slice(2);

    if (sub === "ps") {
      state.sawPs = true;
      if (rest.includes("-a") || rest.includes("--all")) state.sawPsAll = true;
    } else if (sub === "images" || (sub === "image" && rest[0] === "ls")) {
      state.sawImages = true;
    } else if (sub === "network" && (rest[0] === "ls" || rest[0] === "inspect")) {
      state.sawNetworkLs = true;
      if (rest[0] === "inspect") rest.slice(1).forEach((n) => state.namedNetworks.add(n));
    } else if (sub === "volume" && (rest[0] === "ls" || rest[0] === "inspect")) {
      state.sawVolumeLs = true;
      if (rest[0] === "inspect") rest.slice(1).forEach((n) => state.namedVolumes.add(n));
    } else if (sub && NAME_ARG_COMMANDS.includes(sub)) {
      rest.filter((t) => !t.startsWith("-")).forEach((n) => state.namedContainers.add(n));
    } else if (sub === "run" || sub === "create") {
      const nameIdx = rest.indexOf("--name");
      if (nameIdx >= 0 && rest[nameIdx + 1]) state.namedContainers.add(rest[nameIdx + 1]);
    } else if (sub === "pull" || sub === "tag" || sub === "rmi") {
      rest.filter((t) => !t.startsWith("-")).forEach((n) => state.namedImages.add(n));
    }
  }

  isContainerDiscovered(sessionId: string, name: string, running: boolean): boolean {
    const s = this.get(sessionId);
    if (s.sawPsAll) return true;
    if (s.sawPs && running) return true;
    if (s.namedContainers.has(name)) return true;
    return false;
  }

  isImageDiscovered(sessionId: string, ref: string): boolean {
    const s = this.get(sessionId);
    if (s.sawImages) return true;
    return s.namedImages.has(ref);
  }

  isNetworkDiscovered(sessionId: string, name: string): boolean {
    const s = this.get(sessionId);
    return s.sawNetworkLs || s.namedNetworks.has(name);
  }

  isVolumeDiscovered(sessionId: string, name: string): boolean {
    const s = this.get(sessionId);
    return s.sawVolumeLs || s.namedVolumes.has(name);
  }
}
