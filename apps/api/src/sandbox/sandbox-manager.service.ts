import { Injectable, Logger, OnModuleInit, ServiceUnavailableException } from "@nestjs/common";
import Docker from "dockerode";
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

const SANDBOX_NETWORK = "dockerops-sandboxes";
const CONTAINER_PREFIX = "dockerops-sbx-";
const MAX_SANDBOXES = Number(process.env.MAX_SANDBOXES ?? 2);

/**
 * Talks to the HOST Docker Engine only to provision/destroy one isolated
 * docker:dind container per game session, and to exec into it. Players
 * never get a handle on this connection or the host socket — every command
 * they type is executed one level down, inside their own sandbox's inner
 * engine (see docker/sandbox/Dockerfile).
 */
@Injectable()
export class SandboxManagerService implements OnModuleInit {
  private readonly logger = new Logger(SandboxManagerService.name);
  private readonly docker = new Docker();
  private readonly sandboxImage = process.env.SANDBOX_IMAGE ?? "dockerops/sandbox:latest";

  async onModuleInit() {
    await this.ensureNetwork();
  }

  private async ensureNetwork() {
    const networks = await this.docker.listNetworks({ filters: { name: [SANDBOX_NETWORK] } });
    if (!networks.some((n) => n.Name === SANDBOX_NETWORK)) {
      await this.docker.createNetwork({
        Name: SANDBOX_NETWORK,
        Driver: "bridge",
        Options: {
          "com.docker.network.bridge.enable_icc": "false"
        }
      });
    }
  }

  containerNameFor(sessionId: string) {
    return `${CONTAINER_PREFIX}${sessionId}`;
  }

  async provision(sessionId: string): Promise<string> {
    const name = this.containerNameFor(sessionId);

    // Cap concurrent sandboxes so a 1 GB VM can't be overloaded.
    const running = await this.docker.listContainers({
      filters: { label: ["dockerops.session"] },
    });
    const others = running.filter((c) => !c.Names.includes(`/${name}`));
    if (others.length >= MAX_SANDBOXES) {
      this.logger.warn(`Sandbox limit reached (${others.length}/${MAX_SANDBOXES}); refusing ${name}`);
      throw new ServiceUnavailableException(
        "All game servers are busy right now. Please try again in a few minutes.",
      );
    }

    this.logger.log(`Provisioning sandbox ${name} from ${this.sandboxImage}`);

    const container = await this.docker.createContainer({
      name,
      Image: this.sandboxImage,
      Tty: false,
      HostConfig: {
        Privileged: true,
        NetworkMode: SANDBOX_NETWORK,
        AutoRemove: false,
        Memory: 384 * 1024 * 1024,      // 384 MB RAM per sandbox
        MemorySwap: 768 * 1024 * 1024,  // RAM + swap total
        NanoCpus: 1_000_000_000,        // max 1 CPU core
        PidsLimit: 300,                 // stops fork bombs
      },
      Labels: { "dockerops.session": sessionId },
    });
    await container.start();
    await this.waitUntilReady(container.id);
    return container.id;
  }

  private async waitUntilReady(containerId: string, timeoutMs = 60_000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const result = await this.execOnceById(containerId, ["test", "-f", "/tmp/sandbox-ready"]);
        if (result.exitCode === 0) return;
      } catch {
        // container may not be fully started yet; keep polling
      }
      await new Promise((r) => setTimeout(r, 750));
    }
    throw new Error(`Sandbox ${containerId} did not become ready within ${timeoutMs}ms`);
  }

  async destroy(sessionId: string): Promise<void> {
    const name = this.containerNameFor(sessionId);
    try {
      const container = this.docker.getContainer(name);
      await container.stop({ t: 2 }).catch(() => undefined);
      await container.remove({ force: true, v: true });
      this.logger.log(`Destroyed sandbox ${name}`);
    } catch (err: any) {
      if (err?.statusCode !== 404) {
        this.logger.warn(`Failed to destroy sandbox ${name}: ${err?.message ?? err}`);
      }
    }
  }

  async execOnce(sessionId: string, cmd: string[]): Promise<ExecResult> {
    return this.execOnceById(this.containerNameFor(sessionId), cmd);
  }

  async execShellOnce(sessionId: string, shellScript: string): Promise<ExecResult> {
    return this.execOnce(sessionId, ["sh", "-c", shellScript]);
  }

  private async execOnceById(containerRef: string, cmd: string[]): Promise<ExecResult> {
    const container = this.docker.getContainer(containerRef);
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
      this.docker.modem.demuxStream(
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
    const container = this.docker.getContainer(this.containerNameFor(sessionId));
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
