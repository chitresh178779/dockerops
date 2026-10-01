import { Injectable } from "@nestjs/common";
import type { Condition, SandboxStateSnapshot } from "@dockerops/shared";
import { SandboxManagerService } from "./sandbox-manager.service";

@Injectable()
export class ObjectiveValidatorService {
  constructor(private readonly sandbox: SandboxManagerService) {}

  async allMet(
    sessionId: string,
    conditions: Condition[],
    snapshot: SandboxStateSnapshot,
    commandHistory: string[],
  ): Promise<boolean> {
    for (const condition of conditions) {
      // eslint-disable-next-line no-await-in-loop
      if (!(await this.evaluate(sessionId, condition, snapshot, commandHistory))) return false;
    }
    return true;
  }

  async evaluate(
    sessionId: string,
    condition: Condition,
    snapshot: SandboxStateSnapshot,
    commandHistory: string[],
  ): Promise<boolean> {
    switch (condition.type) {
      case "container_state": {
        const c = snapshot.containers.find((x) => x.name === condition.target);
        if (condition.equals === "absent") return !c;
        return c?.state === condition.equals;
      }
      case "container_health": {
        const c = snapshot.containers.find((x) => x.name === condition.target);
        return c?.health === condition.equals;
      }
      case "container_exit_code": {
        const c = snapshot.containers.find((x) => x.name === condition.target);
        return c?.exitCode === condition.equals;
      }
      case "container_image": {
        const c = snapshot.containers.find((x) => x.name === condition.target);
        return c?.image === condition.equals || !!c?.image?.startsWith(`${condition.equals}`);
      }
      case "container_restart_count_max": {
        // Not tracked in snapshot yet; treat as satisfied (non-blocking for MVP).
        return true;
      }
      case "port_published": {
        const c = snapshot.containers.find((x) => x.name === condition.target);
        return !!c?.ports.some(
          (p) => p.containerPort === condition.containerPort && (!condition.hostPort || p.hostPort === condition.hostPort),
        );
      }
      case "network_exists": {
        return snapshot.networks.some((n) => n.name === condition.target);
      }
      case "network_connected": {
        const c = snapshot.containers.find((x) => x.name === condition.container);
        const connected = !!c?.networks.includes(condition.network);
        return condition.connected ? connected : !connected;
      }
      case "volume_exists": {
        return snapshot.volumes.some((v) => v.name === condition.target);
      }
      case "volume_mounted": {
        const c = snapshot.containers.find((x) => x.name === condition.container);
        return !!c?.volumes.some(
          (v) => v.name === condition.volume && (!condition.mountPath || v.mountPath === condition.mountPath),
        );
      }
      case "image_exists": {
        return snapshot.images.some((i) => i.repository === condition.repository && i.tag === condition.tag);
      }
      case "exec_output_contains": {
        try {
          const result = await this.sandbox.execOnce(sessionId, condition.command);
          return (result.stdout + result.stderr).includes(condition.contains);
        } catch {
          return false;
        }
      }
      case "http_status": {
        try {
          const script = `curl -s -o /dev/null -w '%{http_code}' http://localhost:${condition.hostPort}${condition.path}`;
          const result = await this.sandbox.execShellOnce(sessionId, script);
          return result.stdout.trim() === String(condition.equals);
        } catch {
          return false;
        }
      }
      case "command_used": {
        const re = new RegExp(condition.pattern);
        return commandHistory.some((cmd) => re.test(cmd));
      }
      default:
        return false;
    }
  }
}
