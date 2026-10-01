import { ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ScenariosService } from "../scenarios/scenarios.service";
import { SandboxManagerService } from "../sandbox/sandbox-manager.service";
import { EnvironmentRealizerService } from "../sandbox/environment-realizer.service";
import { DockerStateReaderService } from "../sandbox/docker-state-reader.service";
import { ObjectiveValidatorService } from "../sandbox/objective-validator.service";
import { SessionDiscoveryService } from "../sandbox/session-discovery.service";
import { ProgressService } from "../progress/progress.service";
import type { Hint } from "@dockerops/shared";

interface HintTracker {
  requested: Set<string>;
  xpSpent: number;
}

const IDLE_TIMEOUT_MS = Number(process.env.SANDBOX_IDLE_TIMEOUT_MINUTES ?? 45) * 60_000;

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);
  private readonly hintTrackers = new Map<string, HintTracker>();
  private readonly lastActivity = new Map<string, number>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly scenarios: ScenariosService,
    private readonly sandboxManager: SandboxManagerService,
    private readonly realizer: EnvironmentRealizerService,
    private readonly stateReader: DockerStateReaderService,
    private readonly validator: ObjectiveValidatorService,
    private readonly discovery: SessionDiscoveryService,
    private readonly progress: ProgressService,
  ) {
    setInterval(() => this.reapIdleSessions().catch((e) => this.logger.error(e)), 5 * 60_000).unref();
  }

  async createSession(userId: string, levelId: string) {
    const scenario = this.scenarios.getById(levelId);

    const summaries = await this.progress.getLevelSummaries(userId);
    const summary = summaries.find((s) => s.id === levelId);
    if (summary?.locked) {
      throw new ForbiddenException(summary.lockedReason ?? "Level is locked");
    }

    const attempt = await this.prisma.missionAttempt.create({
      data: { userId, levelId },
    });

    const session = await this.prisma.gameSession.create({
      data: {
        userId,
        levelId,
        attemptId: attempt.id,
        status: "PROVISIONING",
        currentPartId: scenario.parts[0].id,
      },
    });

    try {
      const containerId = await this.sandboxManager.provision(session.id);
      this.discovery.reset(session.id);
      await this.realizer.realize(session.id, scenario.environment);
      const updated = await this.prisma.gameSession.update({
        where: { id: session.id },
        data: { status: "READY", sandboxContainerId: containerId },
      });
      this.hintTrackers.set(session.id, { requested: new Set(), xpSpent: 0 });
      this.lastActivity.set(session.id, Date.now());
      return updated;
    } catch (err: any) {
      this.logger.error(`Failed to provision session ${session.id}: ${err?.message ?? err}`);
      await this.prisma.gameSession.update({ where: { id: session.id }, data: { status: "ERROR" } });
      await this.sandboxManager.destroy(session.id).catch(() => undefined);
      throw err;
    }
  }

  async getSession(sessionId: string) {
    const session = await this.prisma.gameSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException("Session not found");
    return session;
  }

  async recordCommand(sessionId: string, command: string) {
    this.lastActivity.set(sessionId, Date.now());
    this.discovery.observeCommand(sessionId, command);
    await this.prisma.commandLogEntry.create({ data: { sessionId, command } });
    const session = await this.getSession(sessionId);
    if (session.attemptId) {
      await this.prisma.missionAttempt.update({
        where: { id: session.attemptId },
        data: { commandsRun: { increment: 1 } },
      });
    }
  }

  async getCommandHistory(sessionId: string): Promise<string[]> {
    const rows = await this.prisma.commandLogEntry.findMany({
      where: { sessionId },
      orderBy: { ranAt: "asc" },
      select: { command: true },
    });
    return rows.map((r) => r.command);
  }

  async getContainerLogs(sessionId: string, containerName: string): Promise<{ logs: string }> {
    const result = await this.sandboxManager.execOnce(sessionId, ["docker", "logs", "--tail", "20", containerName]);
    return { logs: (result.stdout + result.stderr).trim() || "(no logs yet)" };
  }

  async requestHint(sessionId: string, partId: string, hintId: string): Promise<Hint> {
    const session = await this.getSession(sessionId);
    const scenario = this.scenarios.getById(session.levelId);
    const part = scenario.parts.find((p) => p.id === partId);
    const hint = part?.hints.find((h) => h.id === hintId);
    if (!hint) throw new NotFoundException("Hint not found");

    const tracker = this.hintTrackers.get(sessionId) ?? { requested: new Set(), xpSpent: 0 };
    if (!tracker.requested.has(hintId)) {
      tracker.requested.add(hintId);
      tracker.xpSpent += hint.xpCost;
      this.hintTrackers.set(sessionId, tracker);
      if (session.attemptId) {
        await this.prisma.missionAttempt.update({
          where: { id: session.attemptId },
          data: { hintsUsed: { increment: 1 } },
        });
      }
    }
    return hint;
  }

  async checkAndAdvance(sessionId: string) {
    const session = await this.getSession(sessionId);
    const scenario = this.scenarios.getById(session.levelId);
    const snapshot = await this.stateReader.captureSnapshot(sessionId, scenario.environment.hostName);
    const topology = this.stateReader.buildTopology(snapshot);
    const commandHistory = await this.getCommandHistory(sessionId);

    const currentPart = scenario.parts.find((p) => p.id === session.currentPartId) ?? scenario.parts[0];
    const partComplete = await this.validator.allMet(
      sessionId,
      currentPart.completionConditions,
      snapshot,
      commandHistory,
    );
    const missionComplete = await this.validator.allMet(sessionId, scenario.winCondition, snapshot, commandHistory);

    let nextPartId = session.currentPartId;
    if (partComplete) {
      const idx = scenario.parts.findIndex((p) => p.id === currentPart.id);
      if (idx >= 0 && idx < scenario.parts.length - 1) {
        nextPartId = scenario.parts[idx + 1].id;
      }
    }
    if (nextPartId !== session.currentPartId) {
      await this.prisma.gameSession.update({ where: { id: sessionId }, data: { currentPartId: nextPartId } });
    }

    let xpAwarded: number | undefined;
    let commandsRunTotal: number | undefined;
    let hintsUsedTotal: number | undefined;
    let durationSecondsTotal: number | undefined;
    let newlyUnlockedAchievements: { id: string; title: string; description: string }[] | undefined;

    if (missionComplete && session.attemptId) {
      const claim = await this.prisma.missionAttempt.updateMany({
        where: { id: session.attemptId, outcome: "IN_PROGRESS" },
        data: { outcome: "COMPLETED", endedAt: new Date() },
      });
      if (claim.count === 1) {
        const tracker = this.hintTrackers.get(sessionId) ?? { requested: new Set(), xpSpent: 0 };
        const attempt = await this.prisma.missionAttempt.findUniqueOrThrow({ where: { id: session.attemptId } });
        const xpEarned = Math.max(20, scenario.metadata.xpReward - tracker.xpSpent);
        const achievementIds = scenario.achievements.map((a) => a.id);
        const durationSeconds = Math.round(
          ((attempt.endedAt?.getTime() ?? Date.now()) - attempt.startedAt.getTime()) / 1000,
        );

        const completion = await this.progress.recordCompletion({
          userId: session.userId,
          levelId: session.levelId,
          hintsUsed: tracker.requested.size,
          commandsRun: attempt.commandsRun,
          durationSeconds,
          xpEarned,
          newAchievementIds: achievementIds,
        });
        await this.prisma.missionAttempt.update({
          where: { id: session.attemptId },
          data: { xpEarned, score: completion.score },
        });
        xpAwarded = xpEarned;
        commandsRunTotal = attempt.commandsRun;
        hintsUsedTotal = tracker.requested.size;
        durationSecondsTotal = durationSeconds;
        newlyUnlockedAchievements = completion.newAchievements;
      }
    }

    return {
      snapshot,
      topology,
      partId: currentPart.id,
      partComplete,
      missionComplete,
      xpAwarded,
      commandsRun: commandsRunTotal,
      hintsUsed: hintsUsedTotal,
      durationSeconds: durationSecondsTotal,
      newlyUnlockedAchievements,
    };
  }

  async destroySession(sessionId: string) {
    await this.sandboxManager.destroy(sessionId);
    this.discovery.drop(sessionId);
    this.hintTrackers.delete(sessionId);
    this.lastActivity.delete(sessionId);
    await this.prisma.gameSession
      .update({ where: { id: sessionId }, data: { status: "DESTROYED", endedAt: new Date() } })
      .catch(() => undefined);
  }

  async resetSession(sessionId: string) {
    const session = await this.getSession(sessionId);
    await this.destroySession(sessionId);
    return this.createSession(session.userId, session.levelId);
  }

  private async reapIdleSessions() {
    const readySessions = await this.prisma.gameSession.findMany({ where: { status: "READY" } });
    const now = Date.now();
    for (const s of readySessions) {
      const last = this.lastActivity.get(s.id) ?? s.createdAt.getTime();
      if (now - last > IDLE_TIMEOUT_MS) {
        this.logger.log(`Reaping idle sandbox for session ${s.id}`);
        // eslint-disable-next-line no-await-in-loop
        await this.destroySession(s.id);
      }
    }
  }
}
