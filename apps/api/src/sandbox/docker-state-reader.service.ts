import { Injectable, Logger } from "@nestjs/common";
import type {
  ContainerRuntimeState,
  ContainerSummary,
  HealthState,
  ImageSummary,
  NetworkSummary,
  SandboxStateSnapshot,
  TopologyGraph,
  VolumeSummary,
} from "@dockerops/shared";
import { SandboxManagerService } from "./sandbox-manager.service";
import { SessionDiscoveryService } from "./session-discovery.service";

const MARKERS = {
  containers: "###CONTAINERS###",
  networks: "###NETWORKS###",
  volumes: "###VOLUMES###",
  images: "###IMAGES###",
  version: "###VERSION###",
};

const SNAPSHOT_SCRIPT = `
echo '${MARKERS.containers}'
ids=$(docker ps -aq)
if [ -n "$ids" ]; then docker inspect $ids; else echo '[]'; fi
echo '${MARKERS.networks}'
nids=$(docker network ls -q)
if [ -n "$nids" ]; then docker network inspect $nids; else echo '[]'; fi
echo '${MARKERS.volumes}'
vnames=$(docker volume ls -q)
if [ -n "$vnames" ]; then docker volume inspect $vnames; else echo '[]'; fi
echo '${MARKERS.images}'
docker image ls --format '{{json .}}' 2>/dev/null
echo '${MARKERS.version}'
docker version --format '{{json .}}' 2>/dev/null
`.trim();

function splitSections(raw: string): Record<keyof typeof MARKERS, string> {
  const out: any = {};
  const markerEntries = Object.entries(MARKERS);
  for (let i = 0; i < markerEntries.length; i++) {
    const [key, marker] = markerEntries[i];
    const start = raw.indexOf(marker);
    if (start === -1) {
      out[key] = "";
      continue;
    }
    const contentStart = start + marker.length;
    const nextMarker = markerEntries[i + 1]?.[1];
    const end = nextMarker ? raw.indexOf(nextMarker, contentStart) : raw.length;
    out[key] = raw.slice(contentStart, end === -1 ? raw.length : end).trim();
  }
  return out;
}

function safeJsonArray(text: string): any[] {
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

function safeJsonLines(text: string): any[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function mapHealth(inspectState: any): HealthState {
  const status = inspectState?.Health?.Status;
  if (status === "healthy") return "healthy";
  if (status === "unhealthy") return "unhealthy";
  if (status === "starting") return "starting";
  return "none";
}

function mapRuntimeState(status: string): ContainerRuntimeState {
  const s = (status ?? "").toLowerCase();
  if (["running", "exited", "restarting", "paused", "dead", "created"].includes(s)) {
    return s as ContainerRuntimeState;
  }
  return "created";
}

@Injectable()
export class DockerStateReaderService {
  private readonly logger = new Logger(DockerStateReaderService.name);

  constructor(
    private readonly sandbox: SandboxManagerService,
    private readonly discovery: SessionDiscoveryService,
  ) {}

  async captureSnapshot(sessionId: string, hostName: string): Promise<SandboxStateSnapshot> {
    const result = await this.sandbox.execShellOnce(sessionId, SNAPSHOT_SCRIPT);
    if (result.exitCode !== 0) {
      this.logger.warn(`snapshot script exited ${result.exitCode} for ${sessionId}: ${result.stderr}`);
    }
    const sections = splitSections(result.stdout);

    const rawContainers = safeJsonArray(sections.containers);
    const rawNetworks = safeJsonArray(sections.networks);
    const rawVolumes = safeJsonArray(sections.volumes);
    const rawImages = safeJsonLines(sections.images);
    let versionInfo: any = {};
    try {
      versionInfo = JSON.parse(sections.version || "{}");
    } catch {
      versionInfo = {};
    }

    const containers: ContainerSummary[] = rawContainers.map((c: any) => {
      const name = (c.Name ?? "").replace(/^\//, "");
      const state = mapRuntimeState(c.State?.Status);
      const mounts = (c.Mounts ?? []).map((m: any) => ({
        name: m.Name ?? m.Source,
        mountPath: m.Destination,
        readOnly: !m.RW,
      }));
      const networks = Object.keys(c.NetworkSettings?.Networks ?? {});
      const ports: ContainerSummary["ports"] = [];
      for (const [portProto, bindings] of Object.entries<any>(c.NetworkSettings?.Ports ?? {})) {
        const [containerPort, protocol] = portProto.split("/");
        if (Array.isArray(bindings) && bindings.length) {
          for (const b of bindings) {
            ports.push({
              containerPort: Number(containerPort),
              protocol: (protocol as "tcp" | "udp") ?? "tcp",
              hostPort: Number(b.HostPort),
              hostIp: b.HostIp,
            });
          }
        } else {
          ports.push({ containerPort: Number(containerPort), protocol: (protocol as "tcp" | "udp") ?? "tcp" });
        }
      }

      return {
        id: c.Id,
        shortId: (c.Id ?? "").slice(0, 12),
        name,
        image: c.Config?.Image ?? "unknown",
        state,
        health: mapHealth(c.State),
        status: c.State?.Status ?? "unknown",
        createdAt: c.Created,
        startedAt: c.State?.StartedAt,
        exitCode: c.State?.ExitCode,
        networks,
        volumes: mounts,
        ports,
        labels: c.Config?.Labels ?? {},
        discovered: this.discovery.isContainerDiscovered(sessionId, name, state === "running"),
      };
    });

    const images: ImageSummary[] = rawImages
      .filter((i: any) => i.Repository && i.Repository !== "<none>")
      .map((i: any) => {
        const ref = `${i.Repository}:${i.Tag}`;
        return {
          id: i.ID,
          shortId: (i.ID ?? "").replace("sha256:", "").slice(0, 12),
          repository: i.Repository,
          tag: i.Tag,
          size: i.Size,
          createdAt: i.CreatedAt,
          inUseBy: containers.filter((c) => c.image === ref || c.image === i.ID).map((c) => c.name),
          discovered: this.discovery.isImageDiscovered(sessionId, ref),
        };
      });

    const networks: NetworkSummary[] = rawNetworks
      .filter((n: any) => !["host", "none"].includes(n.Name))
      .map((n: any) => ({
        id: n.Id,
        name: n.Name,
        driver: n.Driver,
        scope: n.Scope,
        containers: Object.values<any>(n.Containers ?? {}).map((c: any) => c.Name),
        isolated: n.Internal === true,
        discovered: this.discovery.isNetworkDiscovered(sessionId, n.Name),
      }));

    const volumes: VolumeSummary[] = rawVolumes.map((v: any) => ({
      name: v.Name,
      driver: v.Driver,
      mountpoint: v.Mountpoint,
      attachedTo: containers.filter((c) => c.volumes.some((m) => m.name === v.Name)).map((c) => c.name),
      discovered: this.discovery.isVolumeDiscovered(sessionId, v.Name),
    }));

    return {
      sessionId,
      host: {
        name: hostName,
        engineStatus: "up",
        dockerVersion: versionInfo?.Server?.Version ?? "unknown",
        containerCount: containers.length,
        imageCount: images.length,
      },
      containers,
      images,
      networks,
      volumes,
      capturedAt: new Date().toISOString(),
    };
  }

  buildTopology(snapshot: SandboxStateSnapshot): TopologyGraph {
    const nodes: TopologyGraph["nodes"] = [
      { id: "host", kind: "host", label: snapshot.host.name, state: snapshot.host.engineStatus },
    ];
    const edges: TopologyGraph["edges"] = [];

    for (const network of snapshot.networks.filter((n) => n.discovered)) {
      nodes.push({ id: `net:${network.name}`, kind: "network", label: network.name });
    }

    for (const c of snapshot.containers.filter((x) => x.discovered)) {
      nodes.push({ id: `ctr:${c.name}`, kind: "container", label: c.name, state: c.state, health: c.health });
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

    const dedupedNodes = Array.from(new Map(nodes.map((n) => [n.id, n])).values());
    return { nodes: dedupedNodes, edges };
  }
}
