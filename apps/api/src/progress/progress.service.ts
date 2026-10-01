import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ScenariosService } from "../scenarios/scenarios.service";
import type { LevelSummary, PlayerProfile, MissionCompletionSummary } from "@dockerops/shared";

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scenarios: ScenariosService,
  ) {}

  async getLevelSummaries(userId: string): Promise<LevelSummary[]> {
    const scenarios = this.scenarios.getAll();
    const progress = await this.prisma.levelProgress.findMany({ where: { userId } });
    const progressByLevel = new Map(progress.map((p) => [p.levelId, p]));

    return scenarios.map((s) => {
      const p = progressByLevel.get(s.metadata.id);
      const missingPrereqs = s.metadata.prerequisites.filter((prereqId) => {
        const prereqProgress = progressByLevel.get(prereqId);
        return prereqProgress?.status !== "COMPLETED";
      });
      const locked = missingPrereqs.length > 0;
      return {
        id: s.metadata.id,
        order: s.metadata.order,
        title: s.metadata.title,
        concept: s.metadata.concept,
        difficulty: s.metadata.difficulty,
        estimatedMinutes: s.metadata.estimatedMinutes,
        xpReward: s.metadata.xpReward,
        partsCount: s.parts.length,
        locked,
        lockedReason: locked
          ? `Complete "${this.scenarios.getById(missingPrereqs[0]).metadata.title}" first.`
          : undefined,
        completed: p?.status === "COMPLETED",
        bestScore: p?.bestScore ?? undefined,
      };
    });
  }

  async getAllAchievements(userId: string) {
    const scenarios = this.scenarios.getAll();
    const allDefs = scenarios.flatMap((s) =>
      s.achievements.map((a) => ({ ...a, levelId: s.metadata.id, levelTitle: s.metadata.title })),
    );
    const unlocked = await this.prisma.userAchievement.findMany({ where: { userId } });
    const unlockedMap = new Map(unlocked.map((u) => [u.achievementId, u.unlockedAt]));

    return allDefs.map((a) => ({
      ...a,
      unlocked: unlockedMap.has(a.id),
      unlockedAt: unlockedMap.get(a.id)?.toISOString(),
    }));
  }

  async getProfile(userId: string): Promise<PlayerProfile> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const achievements = await this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" },
    });
    const levelsCompleted = await this.prisma.levelProgress.count({ where: { userId, status: "COMPLETED" } });
    const attempts = await this.prisma.missionAttempt.findMany({ where: { userId, outcome: "COMPLETED" } });

    const totalCommandsRun = attempts.reduce((sum, a) => sum + a.commandsRun, 0);
    const totalHintsUsed = attempts.reduce((sum, a) => sum + a.hintsUsed, 0);
    const totalPlaySeconds = attempts.reduce((sum, a) => {
      if (!a.endedAt) return sum;
      return sum + Math.round((a.endedAt.getTime() - a.startedAt.getTime()) / 1000);
    }, 0);

    const XP_PER_LEVEL = 300;
    const level = Math.floor(user.totalXp / XP_PER_LEVEL) + 1;
    const xpIntoLevel = user.totalXp % XP_PER_LEVEL;

    return {
      id: user.id,
      displayName: user.displayName,
      totalXp: user.totalXp,
      level,
      xpIntoLevel,
      xpForNextLevel: XP_PER_LEVEL,
      streakDays: user.streakDays,
      levelsCompleted,
      totalLevels: this.scenarios.getAll().length,
      totalCommandsRun,
      totalHintsUsed,
      totalPlaySeconds,
      achievements: achievements.map((a) => ({
        id: a.achievement.id,
        title: a.achievement.title,
        description: a.achievement.description,
        unlockedAt: a.unlockedAt.toISOString(),
      })),
    };
  }

  async ensureUnlockedProgress(userId: string, levelId: string) {
    await this.prisma.levelProgress.upsert({
      where: { userId_levelId: { userId, levelId } },
      update: {},
      create: { userId, levelId, status: "UNLOCKED" },
    });
  }

  async recordCompletion(params: {
    userId: string;
    levelId: string;
    hintsUsed: number;
    commandsRun: number;
    durationSeconds: number;
    xpEarned: number;
    newAchievementIds: string[];
  }): Promise<MissionCompletionSummary> {
    const { userId, levelId, hintsUsed, commandsRun, durationSeconds, xpEarned, newAchievementIds } = params;

    const score = Math.max(0, 1000 - hintsUsed * 40 - Math.max(0, commandsRun - 12) * 10);

    await this.prisma.$transaction(async (tx) => {
      await tx.levelProgress.upsert({
        where: { userId_levelId: { userId, levelId } },
        update: {
          status: "COMPLETED",
          bestScore: score,
          hintsUsed: { increment: hintsUsed },
          attempts: { increment: 1 },
          completedAt: new Date(),
        },
        create: {
          userId,
          levelId,
          status: "COMPLETED",
          bestScore: score,
          hintsUsed,
          attempts: 1,
          completedAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { totalXp: { increment: xpEarned }, lastPlayedAt: new Date() },
      });

      for (const achievementId of newAchievementIds) {
        await tx.userAchievement.upsert({
          where: { userId_achievementId: { userId, achievementId } },
          update: {},
          create: { userId, achievementId },
        });
      }
    });

    const achievements = newAchievementIds.length
      ? await this.prisma.achievement.findMany({ where: { id: { in: newAchievementIds } } })
      : [];

    return {
      levelId,
      xpEarned,
      hintsUsed,
      commandsRun,
      durationSeconds,
      score,
      newAchievements: achievements.map((a) => ({ id: a.id, title: a.title, description: a.description })),
    };
  }
}
