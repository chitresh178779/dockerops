import { Injectable, Logger } from "@nestjs/common";
import type { InitEnvironment, InitContainer } from "@dockerops/shared";
import { SandboxManagerService } from "./sandbox-manager.service";

function sh(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function buildContainerCommand(c: InitContainer): string {
  const useCreate = c.startState === "created";
  const parts = [useCreate ? "docker create" : "docker run", useCreate ? "" : "-d", "--name", sh(c.name)];

  for (const [key, value] of Object.entries(c.env)) {
    parts.push("-e", sh(`${key}=${value}`));
  }
  for (const v of c.volumes) {
    const flag = v.readOnly ? `${v.name}:${v.mountPath}:ro` : `${v.name}:${v.mountPath}`;
    parts.push("-v", sh(flag));
  }
  for (const p of c.ports) {
    const flag = p.hostPort ? `${p.hostPort}:${p.containerPort}` : `${p.containerPort}`;
    parts.push("-p", sh(flag));
  }
  if (c.networks[0]) {
    parts.push("--network", sh(c.networks[0]));
  }
  if (c.restartPolicy !== "no") {
    parts.push("--restart", sh(c.restartPolicy));
  }
  if (c.healthcheck) {
    parts.push("--health-cmd", sh(c.healthcheck.test.join(" ")));
    parts.push("--health-interval", `${c.healthcheck.intervalSeconds}s`);
    parts.push("--health-retries", `${c.healthcheck.retries}`);
  }

  parts.push(sh(c.image));
  if (c.command?.length) {
    parts.push(...c.command.map(sh));
  }

  return parts.filter(Boolean).join(" ");
}

@Injectable()
export class EnvironmentRealizerService {
  private readonly logger = new Logger(EnvironmentRealizerService.name);

  constructor(private readonly sandbox: SandboxManagerService) {}

  async realize(sessionId: string, env: InitEnvironment): Promise<void> {
    const lines: string[] = ["set -e"];

    for (const net of env.networks) {
      lines.push(`docker network create --driver ${sh(net.driver)} ${sh(net.name)} >/dev/null 2>&1 || true`);
    }
    for (const vol of env.volumes) {
      lines.push(`docker volume create ${sh(vol.name)} >/dev/null 2>&1 || true`);
    }
    for (const img of env.images) {
      if (img.pull) {
        lines.push(`docker pull ${sh(`${img.repository}:${img.tag}`)} >/dev/null 2>&1 || true`);
      }
    }

    for (const c of env.containers) {
      lines.push(buildContainerCommand(c) + " >/dev/null");
      for (const extraNetwork of c.networks.slice(1)) {
        lines.push(`docker network connect ${sh(extraNetwork)} ${sh(c.name)} >/dev/null 2>&1 || true`);
      }
      if (c.startState === "exited") {
        lines.push(`docker stop ${sh(c.name)} >/dev/null`);
      }
    }

    if (env.setupScript) {
      lines.push(env.setupScript);
    }

    const script = lines.join("\n");
    const result = await this.sandbox.execShellOnce(sessionId, script);
    if (result.exitCode !== 0) {
      this.logger.error(`Environment setup failed for session ${sessionId}: ${result.stderr}`);
      throw new Error(`Sandbox environment setup failed: ${result.stderr.slice(0, 500)}`);
    }
  }
}
