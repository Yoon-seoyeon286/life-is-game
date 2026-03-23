import type { CharacterState, Quest, Debuff, ActivityLog, QuestDifficulty } from './types';

const XP_REWARDS: Record<QuestDifficulty, number> = {
  easy: 30,
  normal: 60,
  hard: 120,
  epic: 250,
};

const STAT_REWARDS: Record<QuestDifficulty, number> = {
  easy: 1,
  normal: 2,
  hard: 4,
  epic: 8,
};

export const TITLES: Array<{ level: number; title: string }> = [
  { level: 1, title: '방랑자' },
  { level: 3, title: '견습생' },
  { level: 5, title: '수련자' },
  { level: 8, title: '전사' },
  { level: 12, title: '숙련가' },
  { level: 17, title: '고수' },
  { level: 23, title: '마스터' },
  { level: 30, title: '전설' },
  { level: 40, title: '신화' },
];

export function getTitleForLevel(level: number): string {
  let title = '방랑자';
  for (const t of TITLES) {
    if (level >= t.level) title = t.title;
  }
  return title;
}

export function calcXpToNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function createInitialState(name: string): CharacterState {
  return {
    name,
    level: 1,
    xp: 0,
    xpToNextLevel: calcXpToNextLevel(1),
    title: '방랑자',
    stats: {
      intelligence: 5,
      strength: 5,
      creativity: 5,
      discipline: 5,
      social: 5,
    },
    quests: [],
    logs: [],
    debuffs: [],
    totalXpEarned: 0,
    questsCompleted: 0,
  };
}

export function addLog(state: CharacterState, log: Omit<ActivityLog, 'id' | 'timestamp'>): CharacterState {
  const newLog: ActivityLog = {
    ...log,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  return {
    ...state,
    logs: [newLog, ...state.logs].slice(0, 50),
  };
}

export function gainXP(state: CharacterState, amount: number): CharacterState {
  let { xp, level, xpToNextLevel, totalXpEarned } = state;
  xp += amount;
  totalXpEarned += amount;

  let leveledUp = false;
  while (xp >= xpToNextLevel) {
    xp -= xpToNextLevel;
    level += 1;
    xpToNextLevel = calcXpToNextLevel(level);
    leveledUp = true;
  }

  let updated: CharacterState = {
    ...state,
    xp,
    level,
    xpToNextLevel,
    title: getTitleForLevel(level),
    totalXpEarned,
  };

  if (leveledUp) {
    updated = addLog(updated, {
      type: 'levelup',
      message: `레벨 업! Lv.${level} 달성 - 칭호: ${getTitleForLevel(level)}`,
      value: level,
    });
  }

  return updated;
}

export function completeQuest(state: CharacterState, questId: string): CharacterState {
  const quest = state.quests.find(q => q.id === questId);
  if (!quest || quest.status !== 'active') return state;

  const xpReward = XP_REWARDS[quest.difficulty];
  const statReward = STAT_REWARDS[quest.difficulty];

  let updated: CharacterState = {
    ...state,
    quests: state.quests.map(q => q.id === questId ? { ...q, status: 'completed' as const, completedAt: Date.now() } : q),
    stats: {
      ...state.stats,
      [quest.stat]: state.stats[quest.stat] + statReward,
    },
    questsCompleted: state.questsCompleted + 1,
  };

  updated = gainXP(updated, xpReward);
  updated = addLog(updated, {
    type: 'quest',
    message: `퀘스트 완료: "${quest.title}" +${xpReward}XP, ${STAT_LABELS[quest.stat]} +${statReward}`,
    value: xpReward,
  });

  return updated;
}

export function failQuest(state: CharacterState, questId: string): CharacterState {
  const quest = state.quests.find(q => q.id === questId);
  if (!quest || quest.status !== 'active') return state;

  let updated: CharacterState = {
    ...state,
    quests: state.quests.map(q => q.id === questId ? { ...q, status: 'failed' as const } : q),
  };

  updated = addLog(updated, {
    type: 'debuff',
    message: `퀘스트 실패: "${quest.title}" - 의지력 약화`,
  });

  return updated;
}

export function addQuest(state: CharacterState, quest: Omit<Quest, 'id' | 'status' | 'createdAt' | 'xpReward' | 'statReward'>): CharacterState {
  const newQuest: Quest = {
    ...quest,
    id: crypto.randomUUID(),
    status: 'active',
    createdAt: Date.now(),
    xpReward: XP_REWARDS[quest.difficulty],
    statReward: STAT_REWARDS[quest.difficulty],
  };

  let updated = { ...state, quests: [newQuest, ...state.quests] };
  updated = addLog(updated, {
    type: 'quest',
    message: `새 퀘스트 수락: "${quest.title}" [${DIFFICULTY_LABELS[quest.difficulty]}]`,
  });

  return updated;
}

export function addDebuff(state: CharacterState, debuff: Omit<Debuff, 'id' | 'createdAt' | 'resolved'>): CharacterState {
  const newDebuff: Debuff = {
    ...debuff,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    resolved: false,
  };

  let updated: CharacterState = {
    ...state,
    debuffs: [newDebuff, ...state.debuffs],
    stats: {
      ...state.stats,
      [debuff.statPenalty]: Math.max(1, state.stats[debuff.statPenalty] - debuff.penaltyAmount),
    },
  };

  updated = addLog(updated, {
    type: 'debuff',
    message: `디버프 발생: "${debuff.title}" - ${STAT_LABELS[debuff.statPenalty]} -${debuff.penaltyAmount}`,
    value: -debuff.penaltyAmount,
  });

  return updated;
}

export function resolveDebuff(state: CharacterState, debuffId: string): CharacterState {
  const debuff = state.debuffs.find(d => d.id === debuffId);
  if (!debuff || debuff.resolved) return state;

  let updated: CharacterState = {
    ...state,
    debuffs: state.debuffs.map(d => d.id === debuffId ? { ...d, resolved: true } : d),
  };

  updated = addLog(updated, {
    type: 'stat',
    message: `디버프 해제: "${debuff.title}" - 극복 완료`,
  });

  return updated;
}

export const STAT_LABELS: Record<string, string> = {
  intelligence: '지능',
  strength: '체력',
  creativity: '창의력',
  discipline: '자제력',
  social: '사교성',
};

export const STAT_COLORS: Record<string, string> = {
  intelligence: '#6366f1',
  strength: '#ef4444',
  creativity: '#f59e0b',
  discipline: '#10b981',
  social: '#3b82f6',
};

export const STAT_EMOJIS: Record<string, string> = {
  intelligence: '🧠',
  strength: '💪',
  creativity: '✨',
  discipline: '⚔️',
  social: '🤝',
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: '쉬움',
  normal: '보통',
  hard: '어려움',
  epic: '전설',
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#10b981',
  normal: '#3b82f6',
  hard: '#f59e0b',
  epic: '#a855f7',
};
