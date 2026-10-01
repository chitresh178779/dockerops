import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import type { Server, Socket } from "socket.io";
import {
  SOCKET_EVENTS,
  type JoinSessionEvent,
  type TerminalInputEvent,
  type TerminalResizeEvent,
  type ObjectiveUpdateEvent,
  type StateUpdateEvent,
} from "@dockerops/shared";
import { SandboxManagerService, type InteractiveExec } from "../sandbox/sandbox-manager.service";
import { SessionsService } from "../sessions/sessions.service";

interface ActiveExec {
  exec: InteractiveExec;
  inputBuffer: string;
}

@WebSocketGateway({ cors: { origin: process.env.WEB_ORIGIN ?? "http://localhost:3000", credentials: true } })
export class TerminalGateway implements OnGatewayDisconnect {
  private readonly logger = new Logger(TerminalGateway.name);
  private readonly activeExecs = new Map<string, ActiveExec>();
  private readonly pendingChecks = new Map<string, NodeJS.Timeout>();

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly sandboxManager: SandboxManagerService,
    private readonly sessions: SessionsService,
  ) {}

  handleDisconnect(client: Socket) {
    // Sandbox exec streams are kept alive across disconnects so a page
    // refresh doesn't kill the player's in-progress terminal session.
    void client;
  }

  @SubscribeMessage(SOCKET_EVENTS.JOIN_SESSION)
  async onJoin(@ConnectedSocket() client: Socket, @MessageBody() payload: JoinSessionEvent) {
    const { sessionId } = payload;
    await client.join(sessionId);

    const session = await this.sessions.getSession(sessionId).catch(() => null);
    if (!session || session.status !== "READY") {
      this.emitStatus(sessionId, "error", "Sandbox is not ready yet.");
      return;
    }

    if (!this.activeExecs.has(sessionId)) {
      try {
        const exec = await this.sandboxManager.execInteractiveShell(sessionId);
        const active: ActiveExec = { exec, inputBuffer: "" };
        this.activeExecs.set(sessionId, active);

        exec.stream.on("data", (chunk: Buffer) => {
          this.server.to(sessionId).emit(SOCKET_EVENTS.TERMINAL_OUTPUT, {
            sessionId,
            data: chunk.toString("utf-8"),
          });
        });
        exec.stream.on("end", () => {
          this.activeExecs.delete(sessionId);
          this.emitStatus(sessionId, "destroyed", "Terminal session ended.");
        });
        exec.stream.on("error", (err) => {
          this.logger.warn(`exec stream error for ${sessionId}: ${err.message}`);
          this.activeExecs.delete(sessionId);
        });
      } catch (err: any) {
        this.logger.error(`Failed to attach terminal for ${sessionId}: ${err?.message ?? err}`);
        this.emitStatus(sessionId, "error", "Could not attach to sandbox shell.");
        return;
      }
    }

    this.emitStatus(sessionId, "ready");
    await this.pushUpdate(sessionId);
  }

  @SubscribeMessage(SOCKET_EVENTS.TERMINAL_INPUT)
  async onInput(@MessageBody() payload: TerminalInputEvent) {
    const active = this.activeExecs.get(payload.sessionId);
    if (!active) return;
    active.exec.stream.write(payload.data);

    // The remote shell can query the terminal (e.g. a cursor-position
    // request on redraw/resize) and xterm.js answers automatically on the
    // same onData channel we read for command-history tracking — strip
    // those escape sequences first or their reply text gets recorded as if
    // the player had typed it.
    const cleaned = payload.data.replace(/\x1b(\[[0-9;?]*[a-zA-Z]|\][^\x07]*(\x07|\x1b\\))/g, "");

    for (const ch of cleaned) {
      if (ch === "\r" || ch === "\n") {
        const line = active.inputBuffer.trim();
        active.inputBuffer = "";
        if (line) {
          await this.sessions.recordCommand(payload.sessionId, line);
          this.scheduleCheck(payload.sessionId);
        }
      } else if (ch === "\u007f" || ch === "\b") {
        active.inputBuffer = active.inputBuffer.slice(0, -1);
      } else if (ch >= " ") {
        active.inputBuffer += ch;
      }
    }
  }

  @SubscribeMessage(SOCKET_EVENTS.TERMINAL_RESIZE)
  async onResize(@MessageBody() payload: TerminalResizeEvent) {
    const active = this.activeExecs.get(payload.sessionId);
    if (!active) return;
    await active.exec.resize(payload.cols, payload.rows);
  }

  private scheduleCheck(sessionId: string) {
    const existing = this.pendingChecks.get(sessionId);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      this.pendingChecks.delete(sessionId);
      this.pushUpdate(sessionId).catch((err) => this.logger.error(err));
    }, 600);
    this.pendingChecks.set(sessionId, timer);
  }

  private async pushUpdate(sessionId: string) {
    const result = await this.sessions.checkAndAdvance(sessionId).catch((err) => {
      this.logger.warn(`checkAndAdvance failed for ${sessionId}: ${err?.message ?? err}`);
      return null;
    });
    if (!result) return;

    const stateEvent: StateUpdateEvent = { sessionId, snapshot: result.snapshot, topology: result.topology };
    this.server.to(sessionId).emit(SOCKET_EVENTS.STATE_UPDATE, stateEvent);

    const objectiveEvent: ObjectiveUpdateEvent = {
      sessionId,
      partId: result.partId,
      status: result.partComplete ? "complete" : "in-progress",
      missionComplete: result.missionComplete,
      xpAwarded: result.xpAwarded,
      commandsRun: result.commandsRun,
      hintsUsed: result.hintsUsed,
      durationSeconds: result.durationSeconds,
      newlyUnlockedAchievements: result.newlyUnlockedAchievements,
    };
    this.server.to(sessionId).emit(SOCKET_EVENTS.OBJECTIVE_UPDATE, objectiveEvent);
  }

  private emitStatus(sessionId: string, status: "provisioning" | "ready" | "error" | "destroyed", message?: string) {
    this.server.to(sessionId).emit(SOCKET_EVENTS.SANDBOX_STATUS, { sessionId, status, message });
  }
}
