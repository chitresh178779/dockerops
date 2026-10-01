export interface LevelSummary {
  id: string;
  order: number;
  title: string;
  concept: string;
  difficulty: string;
  estimatedMinutes: number;
  xpReward: number;
  partsCount: number;
  locked: boolean;
  lockedReason?: string;
  completed: boolean;
  bestScore?: number;
}

export interface MissionCompletionSummary {
  levelId: string;
  xpEarned: number;
  hintsUsed: number;
  commandsRun: number;
  durationSeconds: number;
  score: number;
  newAchievements: { id: string; title: string; description: string }[];
}

export interface PlayerProfile {
  id: string;
  displayName: string;
  totalXp: number;
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  streakDays: number;
  levelsCompleted: number;
  totalLevels: number;
  totalCommandsRun: number;
  totalHintsUsed: number;
  totalPlaySeconds: number;
  achievements: { id: string; title: string; description: string; unlockedAt: string }[];
}
