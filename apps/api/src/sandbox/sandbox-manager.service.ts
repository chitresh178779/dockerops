import { Injectable, Logger, OnModuleInit, ServiceUnavailableException } from "@nestjs/common";
import Docker from "dockerode";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Duplex } from "node:stream";

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface InteractiveExec {
  stream: Duplex;
  resize: (cols: number, rows: number) => Promise<void>;
}

/** One machine whose Docker engine can run player sandboxes. */
interface SandboxHost {
  name: string; // "local" for this VM, otherwise the worker's private IP
  docker: Docker;
  max: number; // max sandboxes allowed on this host at once
}

const SANDBOX_NETWORK = "dockerops-sandboxes";
const CONTAINER_PREFIX = "dockerops-sbx-";
const SESSION_LABEL = "dockerops.session";

/**
 * Builds the list of Docker hosts from environment variables:
 *   MAX_SANDBOXES             max sandboxes on this (main) VM, default 2
 *   SANDBOX_WORKERS           comma-separated worker private IPs, e.g. "172.16.0.5"
 *   MAX_SANDBOXES_PER_WORKER  max sandboxes per worker, default 3
 *   WORKER_CERT_DIR           folder with ca.pem, cert.pem, key.pem for the workers' TLS
 */
function buildHosts(): SandboxHost[] {
  const hosts: SandboxHost[] = [
    { name: "local", docker: new Docker(), max: Number(process.env.MAX_SANDBOXES ?? 2) },
  ];

  const workers = (process.env.SANDBOX_WORKERS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (workers.length > 0) {
    const certDir = process.env.WORKER_CERT_DIR;
    if (!certDir) throw new Error("WORKER_CERT_DIR must be set when SANDBOX_WORKERS is used");
    const ca = readFileSync(join(certDir, "ca.pem"));
    const cert = readFileSync(join(certDir, "cert.pem"));
    const key = readFileSync(join(certDir, "key.pem"));

    for (const ip of workers) {
      hosts.push({
        name: ip,
        docker: new Docker({ host: ip, port: 2376, protocol: "https", ca, cert, key }),
        max: Number(process.env.MAX_SANDBOXES_PER_WORKER ?? 3),
      });
    }
  }
  return hosts;
}

/**
 * Talks to the Docker engines (this VM + any worker VMs) only to provision/destroy
 * one isolated docker:dind container per game session, and to exec into it.
 * Players never get a handle on these connections — every command they type runs
 * one level down, inside their own sandbox's inner engine.
 */
@Injectable()
export class SandboxManagerService implements OnModuleInit {
  private readonly logger = new Logger(SandboxManagerService.name);
  private readonly sandboxImage = process.env.SANDBOX_IMAGE ?? "dockerops/sandbox:latest";
  private readonly hosts: SandboxHost[] = buildHosts();
  /** Which host each session's sandbox lives on. Rebuilt on demand after an API restart. */
  private readonly sessionHost = new Map<string, SandboxHost>();

  async onModuleInit() {
    for (const host of this.hosts) {
      try {
        await this.ensureNetwork(host);
        this.logger.log(`Sandbox host "${host.name}" ready (max ${host.max})`);
      } catch (err: any) {
        // A worker being down must not stop the API; it is simply skipped when placing sandboxes.
        this.logger.warn(`Sandbox host "${host.name}" unavailable at startup: ${err?.message ?? err}`);
      }
    }
  }

  private async ensureNetwork(host: SandboxHost) {
    const networks = await host.docker.listNetworks({ filters: { name: [SANDBOX_NETWORK] } });
    if (!networks.some((n) => n.Name === SANDBOX_NETWORK)) {
      await host.docker.createNetwork({
        Name: SANDBOX_NETWORK,
        Driver: "bridge",
        Options: { "com.docker.network.bridge.enable_icc": "false" },
      });
      this.logger.log(`Created isolated network ${SANDBOX_NETWORK} on "${host.name}"`);
    }
  }

  containerNameFor(sessionId: string) {
    return `${CONTAINER_PREFIX}${sessionId}`;
  }

  /** Picks the host with the most free sandbox slots; skips hosts that can't be reached. */
  private async pickHost(name: string): Promise<SandboxHost> {
    let best: { host: SandboxHost; free: number } | null = null;
    for (const host of this.hosts) {
      try {
        const running = await host.docker.listContainers({ filters: { label: [SESSION_LABEL] } });
        const others = running.filter((c) => !c.Names.includes(`/${name}`));
        const free = host.max - others.length;
        if (free > 0 && (!best || free > best.free)) best = { host, free };
      } catch (err: any) {
        this.logger.warn(`Skipping host "${host.name}": ${err?.message ?? err}`);
      }
    }
    if (!best) {
      throw new ServiceUnavailableException(
        "All game servers are busy right now. Please try again in a few minutes.",
      );
    }
    return best.host;
  }

  /** Finds the host that holds this session's sandbox (from memory, or by asking every host). */
  private async hostFor(sessionId: string): Promise<SandboxHost> {
    const known = this.sessionHost.get(sessionId);
    if (known) return known;
    const name = this.containerNameFor(sessionId);
    for (const host of this.hosts) {
      try {
        await host.docker.getContainer(name).inspect();
        this.sessionHost.set(sessionId, host);
        return host;
      } catch {
        // not on this host (or host unreachable) — try the next one
      }
    }
    throw new Error(`Sandbox for session ${sessionId} not found on any host`);
  }

  async provision(sessionId: string): Promise<string> {
    const name = this.containerNameFor(sessionId);
    const host = await this.pickHost(name);
    this.logger.log(`Provisioning sandbox ${name} on "${host.name}" from ${this.sandboxImage}`);

    const container = await host.docker.createContainer({
      name,
      Image: this.sandboxImage,
      Tty: false,
      HostConfig: {
        Privileged: true,
        NetworkMode: SANDBOX_NETWORK,
        AutoRemove: false,
        Memory: 384 * 1024 * 1024, // 384 MB RAM per sandbox
        MemorySwap: 768 * 1024 * 1024, // RAM + swap total
        NanoCpus: 1_000_000_000, // max 1 CPU core
        PidsLimit: 300, // stops fork bombs
      },
      Labels: { [SESSION_LABEL]: sessionId },
    });
    this.sessionHost.set(sessionId, host);
    await container.start();
    await this.waitUntilReady(host, container.id);
    return container.id;
  }

  private async waitUntilReady(host: SandboxHost, containerId: string, timeoutMs = 120_000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const result = await this.execOnceOn(host, containerId, ["test", "-f", "/tmp/sandbox-ready"]);
        if (result.exitCode === 0) return;
      } catch {
        // container may not be fully started yet; keep polling
      }
      await new Promise((r) => setTimeout(r, 750));
    }
    throw new Error(`Sandbox ${containerId} on "${host.name}" did not become ready within ${timeoutMs}ms`);
  }

  async destroy(sessionId: string): Promise<void> {
    const name = this.containerNameFor(sessionId);
    let host: SandboxHost;
    try {
      host = await this.hostFor(sessionId);
    } catch {
      this.sessionHost.delete(sessionId);
      return; // already gone
    }
    try {
      const container = host.docker.getContainer(name);
      await container.stop({ t: 2 }).catch(() => undefined);
      await container.remove({ force: true, v: true });
      this.logger.log(`Destroyed sandbox ${name} on "${host.name}"`);
    } catch (err: any) {
      if (err?.statusCode !== 404) {
        this.logger.warn(`Failed to destroy sandbox ${name}: ${err?.message ?? err}`);
      }
    } finally {
      this.sessionHost.delete(sessionId);
    }
  }

  async execOnce(sessionId: string, cmd: string[]): Promise<ExecResult> {
    const host = await this.hostFor(sessionId);
    return this.execOnceOn(host, this.containerNameFor(sessionId), cmd);
  }

  async execShellOnce(sessionId: string, shellScript: string): Promise<ExecResult> {
    return this.execOnce(sessionId, ["sh", "-c", shellScript]);
  }

  private async execOnceOn(host: SandboxHost, containerRef: string, cmd: string[]): Promise<ExecResult> {
    const container = host.docker.getContainer(containerRef);
    const exec = await container.exec({
      Cmd: cmd,
      AttachStdin: false,
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
    });

    const stream = await exec.start({ hijack: true, stdin: false });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      host.docker.modem.demuxStream(
        stream,
        { write: (c: Buffer) => stdoutChunks.push(c) } as any,
        { write: (c: Buffer) => stderrChunks.push(c) } as any,
      );
      stream.on("end", resolve);
      stream.on("error", reject);
    });

    const inspect = await exec.inspect();
    return {
      stdout: Buffer.concat(stdoutChunks).toString("utf-8"),
      stderr: Buffer.concat(stderrChunks).toString("utf-8"),
      exitCode: inspect.ExitCode ?? 0,
    };
  }

  async execInteractiveShell(sessionId: string): Promise<InteractiveExec> {
    const host = await this.hostFor(sessionId);
    const container = host.docker.getContainer(this.containerNameFor(sessionId));
    const exec = await container.exec({
      Cmd: ["sh"],
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
      Env: ["TERM=xterm-256color"],
    });

    const stream = (await exec.start({ hijack: true, stdin: true, Tty: true })) as unknown as Duplex;

    return {
      stream,
      resize: async (cols: number, rows: number) => {
        await exec.resize({ w: cols, h: rows }).catch(() => undefined);
      },
    };
  }
}