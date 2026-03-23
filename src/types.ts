export type StatKey = 'intelligence' | 'strength' | 'creativity' | 'discipline' | 'social';

export interface Stat {
  key: StatKey;
  label: string;
  emoji: string;
  color: string;
  value: number;
}

export type QuestStatus = 'active' | 'completed' | 'failed';
export type QuestDifficulty = 'easy' | 'normal' | 'hard' | 'epic';

export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  stat: StatKey;
  xpReward: number;
  statReward: number;
  status: QuestStatus;
  createdAt: number;
  completedAt?: number;
}

export type LogType = 'xp' | 'levelup' | 'quest' | 'debuff' | 'stat';

export interface ActivityLog {
  id: string;
  type: LogType;
  message: string;
  timestamp: number;
  value?: number;
}

export interface Debuff {
  id: string;
  title: string;
  description: string;
  statPenalty: StatKey;
  penaltyAmount: number;
  createdAt: number;
  resolved: boolean;
}

export interface CharacterState {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  title: string;
  stats: Record<StatKey, number>;
  quests: Quest[];
  logs: ActivityLog[];
  debuffs: Debuff[];
  totalXpEarned: number;
  questsCompleted: number;
}
