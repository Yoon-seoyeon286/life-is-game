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
export type QuestCategory = 'study' | 'health' | 'project' | 'social' | 'habit' | 'other';
export type RecurringType = 'daily' | 'weekly' | null;

export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  stat: StatKey;
  category: QuestCategory;
  xpReward: number;
  statReward: number;
  status: QuestStatus;
  createdAt: number;
  completedAt?: number;
  recurring: RecurringType;
  lastResetAt?: number;
}

export type LogType = 'xp' | 'levelup' | 'quest' | 'debuff' | 'stat' | 'achievement' | 'skill' | 'streak' | 'boss';

export interface Boss {
  id: string;
  name: string;
  title: string;
  description: string;
  emoji: string;
  requiredLevel: number;
  power: number;
  weakStats: StatKey[];
  xpReward: number;
  specialTitle: string;
  defeatedAt: number | null;
}

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

export type CharacterClass = 'warrior' | 'mage' | 'rogue' | 'ranger';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: number | null;
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  stat: StatKey;
  requiredStatValue: number;
  unlockedAt: number | null;
}

export interface XpHistoryEntry {
  date: string;
  xp: number;
}

export interface CharacterState {
  name: string;
  characterClass: CharacterClass;
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
  streak: number;
  lastActiveDate: string | null;
  achievements: Achievement[];
  skills: SkillNode[];
  xpHistory: XpHistoryEntry[];
  bosses: Boss[];
}
