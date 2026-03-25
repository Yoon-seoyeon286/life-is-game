import type {
  CharacterState, Quest, Debuff, ActivityLog,
  QuestDifficulty, CharacterClass, Achievement, SkillNode, StatKey, XpHistoryEntry, Boss, Item, ItemRarity
} from './types';

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

export const CLASS_DEFS: Record<CharacterClass, {
  label: string;
  icon: string;
  description: string;
  bonusStat: StatKey;
  color: string;
  statMultipliers: Record<StatKey, number>;
}> = {
  warrior: {
    label: '전사',
    icon: '⚔️',
    description: '체력과 자제력이 강하다. 운동과 루틴에 특화.',
    bonusStat: 'strength',
    color: '#ef4444',
    statMultipliers: { strength: 1.5, discipline: 1.3, intelligence: 0.8, creativity: 0.9, social: 1.0 },
  },
  mage: {
    label: '마법사',
    icon: '🧙',
    description: '지능과 창의력이 뛰어나다. 공부와 창작에 특화.',
    bonusStat: 'intelligence',
    color: '#6366f1',
    statMultipliers: { intelligence: 1.5, creativity: 1.3, strength: 0.8, discipline: 1.0, social: 0.9 },
  },
  rogue: {
    label: '도적',
    icon: '🗡️',
    description: '창의력과 사교성이 높다. 프로젝트와 네트워킹에 특화.',
    bonusStat: 'creativity',
    color: '#f59e0b',
    statMultipliers: { creativity: 1.5, social: 1.3, discipline: 0.8, strength: 0.9, intelligence: 1.0 },
  },
  ranger: {
    label: '레인저',
    icon: '🏹',
    description: '균형잡힌 올라운더. 모든 스탯이 고르게 성장.',
    bonusStat: 'discipline',
    color: '#10b981',
    statMultipliers: { intelligence: 1.1, strength: 1.1, creativity: 1.1, discipline: 1.1, social: 1.1 },
  },
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

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

export const ALL_ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  { id: 'first_quest', title: '첫 발걸음', description: '첫 번째 퀘스트를 완료하라', icon: '👣' },
  { id: 'quest_10', title: '꾸준한 모험가', description: '퀘스트 10개 완료', icon: '📜' },
  { id: 'quest_50', title: '철의 의지', description: '퀘스트 50개 완료', icon: '🏆' },
  { id: 'quest_100', title: '전설의 영웅', description: '퀘스트 100개 완료', icon: '👑' },
  { id: 'level_5', title: '수련 시작', description: 'Lv.5 달성', icon: '⭐' },
  { id: 'level_10', title: '진정한 전사', description: 'Lv.10 달성', icon: '🌟' },
  { id: 'level_20', title: '고수의 경지', description: 'Lv.20 달성', icon: '💫' },
  { id: 'streak_3', title: '집중력 발화', description: '3일 연속 달성', icon: '🔥' },
  { id: 'streak_7', title: '일주일의 전사', description: '7일 연속 달성', icon: '🔥🔥' },
  { id: 'streak_30', title: '한 달의 지배자', description: '30일 연속 달성', icon: '🔥🔥🔥' },
  { id: 'stat_20', title: '특기 개발', description: '스탯 하나를 20 이상으로', icon: '📈' },
  { id: 'stat_50', title: '극한 수련', description: '스탯 하나를 50 이상으로', icon: '💎' },
  { id: 'epic_quest', title: '전설의 도전', description: '전설 난이도 퀘스트 완료', icon: '⚡' },
  { id: 'no_debuff', title: '완벽한 하루', description: '디버프 없이 퀘스트 3개 완료', icon: '✨' },
];

export const ALL_SKILLS: Omit<SkillNode, 'unlockedAt'>[] = [
  { id: 'focus', name: '집중력', description: '지능 10 달성 - 학습 속도 +10%', icon: '🧠', stat: 'intelligence', requiredStatValue: 10 },
  { id: 'deep_study', name: '심층 탐구', description: '지능 25 달성 - 어려운 퀘스트 XP +20%', icon: '📚', stat: 'intelligence', requiredStatValue: 25 },
  { id: 'iron_body', name: '강철 육체', description: '체력 10 달성 - 체력 스탯 성장 +15%', icon: '💪', stat: 'strength', requiredStatValue: 10 },
  { id: 'marathon', name: '마라토너', description: '체력 25 달성 - 연속 퀘스트 보너스 XP', icon: '🏃', stat: 'strength', requiredStatValue: 25 },
  { id: 'inspiration', name: '영감의 불꽃', description: '창의력 10 달성 - 창작 퀘스트 XP +15%', icon: '✨', stat: 'creativity', requiredStatValue: 10 },
  { id: 'breakthrough', name: '한계 돌파', description: '창의력 25 달성 - 새 퀘스트 보너스 XP +10%', icon: '💡', stat: 'creativity', requiredStatValue: 25 },
  { id: 'iron_will', name: '철의 의지', description: '자제력 10 달성 - 디버프 내성', icon: '⚔️', stat: 'discipline', requiredStatValue: 10 },
  { id: 'ascetic', name: '금욕주의', description: '자제력 25 달성 - 스트릭 XP 보너스 2배', icon: '🏔️', stat: 'discipline', requiredStatValue: 25 },
  { id: 'charisma', name: '카리스마', description: '사교성 10 달성 - 소셜 퀘스트 XP +15%', icon: '🤝', stat: 'social', requiredStatValue: 10 },
  { id: 'leader', name: '리더십', description: '사교성 25 달성 - 퀘스트 실패 패널티 감소', icon: '👑', stat: 'social', requiredStatValue: 25 },
];

export function createInitialState(name: string, characterClass: CharacterClass): CharacterState {
  return {
    name,
    characterClass,
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
    streak: 0,
    lastActiveDate: null,
    achievements: ALL_ACHIEVEMENTS.map(a => ({ ...a, unlockedAt: null })),
    skills: ALL_SKILLS.map(s => ({ ...s, unlockedAt: null })),
    xpHistory: [],
    bosses: ALL_BOSSES.map(b => ({ ...b, defeatedAt: null })),
    items: [],
    notifications: [],
    pomodoroMinutes: 0,
    lastQuestCheckDate: null,
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

function updateXpHistory(state: CharacterState, amount: number): CharacterState {
  const today = todayString();
  const history = [...state.xpHistory];
  const idx = history.findIndex(e => e.date === today);
  if (idx >= 0) {
    history[idx] = { ...history[idx], xp: history[idx].xp + amount };
  } else {
    history.push({ date: today, xp: amount });
  }
  return { ...state, xpHistory: history.slice(-30) };
}

function updateStreak(state: CharacterState): CharacterState {
  const today = todayString();
  if (state.lastActiveDate === today) return state;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak = state.lastActiveDate === yesterdayStr ? state.streak + 1 : 1;
  let updated: CharacterState = { ...state, streak: newStreak, lastActiveDate: today };

  if (newStreak > 1) {
    const streakBonus = Math.min(newStreak * 5, 100);
    updated = gainXP(updated, streakBonus);
    updated = addLog(updated, {
      type: 'streak',
      message: `🔥 ${newStreak}일 연속 달성! 스트릭 보너스 +${streakBonus}XP`,
      value: streakBonus,
    });
  }

  return checkAchievements(updated);
}

export function gainXP(state: CharacterState, amount: number): CharacterState {
  let { xp, level, xpToNextLevel, totalXpEarned } = state;
  xp += amount;
  totalXpEarned += amount;

  let leveledUp = false;
  let newLevel = level;
  while (xp >= xpToNextLevel) {
    xp -= xpToNextLevel;
    newLevel += 1;
    xpToNextLevel = calcXpToNextLevel(newLevel);
    leveledUp = true;
  }

  let updated: CharacterState = {
    ...state,
    xp,
    level: newLevel,
    xpToNextLevel,
    title: getTitleForLevel(newLevel),
    totalXpEarned,
  };

  updated = updateXpHistory(updated, amount);

  if (leveledUp) {
    updated = addLog(updated, {
      type: 'levelup',
      message: `레벨 업! Lv.${newLevel} 달성 - 칭호: ${getTitleForLevel(newLevel)}`,
      value: newLevel,
    });
    updated = checkAchievements(updated);
    updated = checkSkills(updated);
  }

  return updated;
}

function applyClassMultiplier(state: CharacterState, stat: StatKey, amount: number): number {
  const multiplier = CLASS_DEFS[state.characterClass].statMultipliers[stat];
  return Math.round(amount * multiplier);
}

export function completeQuest(state: CharacterState, questId: string): CharacterState {
  const quest = state.quests.find(q => q.id === questId);
  if (!quest) return state;
  if (quest.status !== 'active') return state;

  const today = todayString();
  if (quest.recurring && quest.lastCompletedDate === today) return state;

  const baseStatReward = STAT_REWARDS[quest.difficulty];
  const actualStatReward = applyClassMultiplier(state, quest.stat, baseStatReward);
  const xpReward = XP_REWARDS[quest.difficulty];

  const updatedQuests = state.quests.map(q => {
    if (q.id !== questId) return q;
    if (q.recurring) {
      return { ...q, lastCompletedDate: today };
    }
    return { ...q, status: 'completed' as const, completedAt: Date.now(), lastCompletedDate: today };
  });

  let updated: CharacterState = {
    ...state,
    quests: updatedQuests,
    stats: {
      ...state.stats,
      [quest.stat]: state.stats[quest.stat] + actualStatReward,
    },
    questsCompleted: state.questsCompleted + 1,
  };

  updated = gainXP(updated, xpReward);
  updated = updateStreak(updated);
  updated = addLog(updated, {
    type: 'quest',
    message: `${quest.recurring ? '루틴' : '퀘스트'} 완료: "${quest.title}" +${xpReward}XP, ${STAT_LABELS[quest.stat]} +${actualStatReward}`,
    value: xpReward,
  });
  updated = checkAchievements(updated);
  updated = checkSkills(updated);

  return updated;
}

export function failQuest(state: CharacterState, questId: string): CharacterState {
  const quest = state.quests.find(q => q.id === questId);
  if (!quest || quest.status !== 'active') return state;

  const penaltyAmount = STAT_REWARDS[quest.difficulty];

  let updated: CharacterState = {
    ...state,
    quests: state.quests.map(q => q.id === questId ? { ...q, status: 'failed' as const } : q),
    streak: 0,
    stats: {
      ...state.stats,
      [quest.stat]: Math.max(1, state.stats[quest.stat] - penaltyAmount),
    },
  };

  const debuff: Omit<Debuff, 'id' | 'createdAt' | 'resolved'> = {
    title: `"${quest.title}" 실패`,
    description: `퀘스트를 완료하지 못했습니다. ${STAT_LABELS[quest.stat]} 능력이 저하되었습니다.`,
    statPenalty: quest.stat,
    penaltyAmount: penaltyAmount,
  };

  updated = addDebuff(updated, debuff);

  updated = addLog(updated, {
    type: 'debuff',
    message: `퀘스트 실패: "${quest.title}" - 스트릭 초기화, ${STAT_LABELS[quest.stat]} -${penaltyAmount}`,
  });

  return updated;
}

export function addQuest(state: CharacterState, quest: Omit<Quest, 'id' | 'status' | 'createdAt' | 'xpReward' | 'statReward' | 'lastCompletedDate'>): CharacterState {
  const newQuest: Quest = {
    ...quest,
    id: crypto.randomUUID(),
    status: 'active',
    createdAt: Date.now(),
    xpReward: XP_REWARDS[quest.difficulty],
    statReward: STAT_REWARDS[quest.difficulty],
    lastCompletedDate: null,
  };

  let updated = { ...state, quests: [newQuest, ...state.quests] };
  updated = addLog(updated, {
    type: 'quest',
    message: `새 퀘스트 수락: "${quest.title}" [${DIFFICULTY_LABELS[quest.difficulty]}]${quest.recurring ? ` (${quest.recurring === 'daily' ? '매일' : '매주'} 반복)` : ''}`,
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

function checkAchievements(state: CharacterState): CharacterState {
  const maxStat = Math.max(...Object.values(state.stats));
  const activeDebuffs = state.debuffs.filter(d => !d.resolved).length;

  const conditions: Record<string, boolean> = {
    first_quest: state.questsCompleted >= 1,
    quest_10: state.questsCompleted >= 10,
    quest_50: state.questsCompleted >= 50,
    quest_100: state.questsCompleted >= 100,
    level_5: state.level >= 5,
    level_10: state.level >= 10,
    level_20: state.level >= 20,
    streak_3: state.streak >= 3,
    streak_7: state.streak >= 7,
    streak_30: state.streak >= 30,
    stat_20: maxStat >= 20,
    stat_50: maxStat >= 50,
    epic_quest: state.quests.some(q => q.difficulty === 'epic' && q.status === 'completed'),
    no_debuff: activeDebuffs === 0 && state.questsCompleted >= 3,
  };

  let updated = state;
  const newAchievements = state.achievements.map(a => {
    if (a.unlockedAt === null && conditions[a.id]) {
      updated = addLog(updated, {
        type: 'achievement',
        message: `업적 달성: ${a.icon} "${a.title}" - ${a.description}`,
      });
      return { ...a, unlockedAt: Date.now() };
    }
    return a;
  });

  return { ...updated, achievements: newAchievements };
}

function checkSkills(state: CharacterState): CharacterState {
  let updated = state;
  const newSkills = state.skills.map(skill => {
    if (skill.unlockedAt === null && state.stats[skill.stat] >= skill.requiredStatValue) {
      updated = addLog(updated, {
        type: 'skill',
        message: `스킬 해금: ${skill.icon} "${skill.name}" - ${skill.description}`,
      });
      return { ...skill, unlockedAt: Date.now() };
    }
    return skill;
  });

  return { ...updated, skills: newSkills };
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

export const CATEGORY_LABELS: Record<string, string> = {
  study: '공부',
  health: '건강',
  project: '프로젝트',
  social: '인간관계',
  habit: '습관',
  other: '기타',
};

export const CATEGORY_EMOJIS: Record<string, string> = {
  study: '📚',
  health: '🏃',
  project: '💻',
  social: '👥',
  habit: '🔄',
  other: '📌',
};

export function dailyReset(state: CharacterState, lastOpenedDate: string | null): CharacterState {
  const today = todayString();
  if (lastOpenedDate === today) return state;

  const recurringActive = state.quests.filter(
    q => q.recurring !== null && q.status === 'active' && q.lastCompletedDate !== lastOpenedDate
  );

  let updated = state;

  for (const q of recurringActive) {
    if (lastOpenedDate !== null) {
      const penaltyAmount = q.difficulty === 'epic' ? 5 : q.difficulty === 'hard' ? 4 : q.difficulty === 'normal' ? 3 : 2;
      updated = {
        ...updated,
        debuffs: [
          ...updated.debuffs,
          {
            id: crypto.randomUUID(),
            title: `루틴 미완료: ${q.title}`,
            description: '어제 루틴을 지키지 않았습니다.',
            statPenalty: q.stat,
            penaltyAmount,
            createdAt: Date.now(),
            resolved: false,
          },
        ],
        stats: {
          ...updated.stats,
          [q.stat]: Math.max(1, updated.stats[q.stat] - penaltyAmount),
        },
        streak: 0,
      };
      updated = addLog(updated, {
        type: 'debuff',
        message: `루틴 미완료 패널티: "${q.title}" ${STAT_LABELS[q.stat]} -${penaltyAmount}`,
        value: -penaltyAmount,
      });
    }
  }

  updated = {
    ...updated,
    quests: updated.quests.map(q =>
      q.recurring !== null && q.status === 'active'
        ? { ...q, lastCompletedDate: null }
        : q
    ),
  };

  return updated;
}

export { updateStreak };
export type { XpHistoryEntry };

export const ALL_BOSSES: Omit<Boss, 'defeatedAt'>[] = [
  {
    id: 'sloth_demon',
    name: '나태의 마왕',
    title: '게으름의 화신',
    description: '매일 미루고 포기하는 습관이 만들어낸 어둠의 존재. 자제력과 체력으로 쓰러뜨려라.',
    emoji: '😴',
    requiredLevel: 3,
    power: 50,
    weakStats: ['discipline', 'strength'],
    xpReward: 300,
    specialTitle: '나태 정복자',
  },
  {
    id: 'distraction_wraith',
    name: '산만의 망령',
    title: '집중력 파괴자',
    description: '스마트폰, SNS, 유튜브... 끝없는 유혹의 화신. 지능과 자제력으로 극복하라.',
    emoji: '👻',
    requiredLevel: 6,
    power: 100,
    weakStats: ['intelligence', 'discipline'],
    xpReward: 600,
    specialTitle: '집중의 달인',
  },
  {
    id: 'fear_golem',
    name: '두려움의 골렘',
    title: '도전 회피자',
    description: '실패가 두렵다는 핑계로 새로운 도전을 막아서는 돌덩이. 창의력과 사교성으로 부숴라.',
    emoji: '🗿',
    requiredLevel: 10,
    power: 180,
    weakStats: ['creativity', 'social'],
    xpReward: 1000,
    specialTitle: '용기의 전사',
  },
  {
    id: 'burnout_dragon',
    name: '번아웃 드래곤',
    title: '의지력 흡수자',
    description: '과부하로 지쳐버린 영혼이 용으로 각성한 존재. 모든 스탯의 균형으로만 쓰러뜨릴 수 있다.',
    emoji: '🐉',
    requiredLevel: 15,
    power: 280,
    weakStats: ['discipline', 'strength', 'intelligence'],
    xpReward: 1500,
    specialTitle: '드래곤 슬레이어',
  },
  {
    id: 'perfectionism_lich',
    name: '완벽주의 리치',
    title: '영원한 미완성',
    description: '"아직 완벽하지 않아"라는 말로 모든 시작을 막는 불사의 마법사. 창의력과 지능으로 무너뜨려라.',
    emoji: '💀',
    requiredLevel: 20,
    power: 400,
    weakStats: ['creativity', 'intelligence', 'social'],
    xpReward: 2000,
    specialTitle: '완벽주의 극복자',
  },
  {
    id: 'ego_titan',
    name: '자아의 타이탄',
    title: '성장의 최종 장벽',
    description: '지금의 나에 안주하려는 거대한 자아. 모든 스탯을 최고로 끌어올린 자만이 도전할 수 있다.',
    emoji: '⚡',
    requiredLevel: 30,
    power: 600,
    weakStats: ['discipline', 'strength', 'intelligence', 'creativity', 'social'],
    xpReward: 5000,
    specialTitle: '자아 초월자',
  },
];

export function getAvailableBoss(state: CharacterState): Boss | null {
  return state.bosses.find(b =>
    b.defeatedAt === null && state.level >= b.requiredLevel
  ) ?? null;
}

export function calcBossSuccessRate(state: CharacterState, boss: Boss): number {
  const statSum = boss.weakStats.reduce((sum, s) => sum + state.stats[s], 0);
  const avgStat = statSum / boss.weakStats.length;
  const base = (avgStat / (boss.power / boss.weakStats.length)) * 100;
  return Math.min(90, Math.max(10, Math.round(base)));
}

export function challengeBoss(state: CharacterState, bossId: string): { state: CharacterState; won: boolean } {
  const boss = state.bosses.find(b => b.id === bossId);
  if (!boss || boss.defeatedAt !== null) return { state, won: false };

  const successRate = calcBossSuccessRate(state, boss);
  const roll = Math.random() * 100;
  const won = roll < successRate;

  if (won) {
    let updated: CharacterState = {
      ...state,
      bosses: state.bosses.map(b => b.id === bossId ? { ...b, defeatedAt: Date.now() } : b),
    };
    updated = gainXP(updated, boss.xpReward);
    updated = addLog(updated, {
      type: 'boss',
      message: `보스 토벌! "${boss.name}" 격파 - +${boss.xpReward}XP, 칭호 [${boss.specialTitle}] 획득`,
      value: boss.xpReward,
    });
    
    const rewardItem = generateBossReward(boss);
    updated = addItem(updated, rewardItem);
    
    return { state: updated, won: true };
  } else {
    const penaltyStat = boss.weakStats[Math.floor(Math.random() * boss.weakStats.length)];
    let updated: CharacterState = {
      ...state,
      stats: {
        ...state.stats,
        [penaltyStat]: Math.max(1, state.stats[penaltyStat] - 2),
      },
    };
    updated = addLog(updated, {
      type: 'boss',
      message: `보스 토벌 실패: "${boss.name}" - ${STAT_LABELS[penaltyStat]} -2 (더 강해져서 다시 도전하라!)`,
      value: -2,
    });
    return { state: updated, won: false };
  }
}

export function deleteQuest(state: CharacterState, questId: string): CharacterState {
  const quest = state.quests.find(q => q.id === questId);
  if (!quest) return state;

  let updated: CharacterState = {
    ...state,
    quests: state.quests.filter(q => q.id !== questId),
  };

  updated = addLog(updated, {
    type: 'quest',
    message: `퀘스트 삭제: "${quest.title}"`,
  });

  return updated;
}

const ITEM_POOL: Omit<Item, 'id' | 'equipped' | 'acquiredAt'>[] = [
  { name: '지혜의 안경', description: '지능 +3', icon: '👓', rarity: 'common', statBoost: { intelligence: 3 } },
  { name: '근육 보조제', description: '체력 +3', icon: '💊', rarity: 'common', statBoost: { strength: 3 } },
  { name: '영감의 깃털', description: '창의력 +3', icon: '🪶', rarity: 'common', statBoost: { creativity: 3 } },
  { name: '수도승의 염주', description: '자제력 +3', icon: '📿', rarity: 'common', statBoost: { discipline: 3 } },
  { name: '친화력 향수', description: '사교성 +3', icon: '🌸', rarity: 'common', statBoost: { social: 3 } },
  { name: '현자의 돌', description: '지능 +5, XP 보너스 +10%', icon: '💎', rarity: 'rare', statBoost: { intelligence: 5 }, xpBoost: 10 },
  { name: '영웅의 검', description: '체력 +5, XP 보너스 +10%', icon: '⚔️', rarity: 'rare', statBoost: { strength: 5 }, xpBoost: 10 },
  { name: '창조자의 붓', description: '창의력 +5, XP 보너스 +10%', icon: '🖌️', rarity: 'rare', statBoost: { creativity: 5 }, xpBoost: 10 },
  { name: '철의 의지 반지', description: '자제력 +5, XP 보너스 +10%', icon: '💍', rarity: 'rare', statBoost: { discipline: 5 }, xpBoost: 10 },
  { name: '왕관의 카리스마', description: '사교성 +5, XP 보너스 +10%', icon: '👑', rarity: 'rare', statBoost: { social: 5 }, xpBoost: 10 },
  { name: '전지전능의 오브', description: '모든 스탯 +5, XP 보너스 +25%', icon: '🔮', rarity: 'epic', statBoost: { intelligence: 5, strength: 5, creativity: 5, discipline: 5, social: 5 }, xpBoost: 25 },
  { name: '신화의 부적', description: '모든 스탯 +10, XP 보너스 +50%', icon: '✨', rarity: 'legendary', statBoost: { intelligence: 10, strength: 10, creativity: 10, discipline: 10, social: 10 }, xpBoost: 50 },
];

function generateBossReward(boss: Boss): Omit<Item, 'id' | 'equipped' | 'acquiredAt'> {
  const rarityByLevel: ItemRarity = 
    boss.requiredLevel >= 30 ? 'legendary' :
    boss.requiredLevel >= 20 ? 'epic' :
    boss.requiredLevel >= 10 ? 'rare' : 'common';
  
  const pool = ITEM_POOL.filter(item => item.rarity === rarityByLevel);
  return pool[Math.floor(Math.random() * pool.length)] || ITEM_POOL[0];
}

export function addItem(state: CharacterState, item: Omit<Item, 'id' | 'equipped' | 'acquiredAt'>): CharacterState {
  const newItem: Item = {
    ...item,
    id: crypto.randomUUID(),
    equipped: false,
    acquiredAt: Date.now(),
  };

  let updated: CharacterState = {
    ...state,
    items: [newItem, ...state.items],
  };

  updated = addLog(updated, {
    type: 'item',
    message: `아이템 획득: ${item.icon} "${item.name}" [${RARITY_LABELS[item.rarity]}]`,
  });

  return updated;
}

export function equipItem(state: CharacterState, itemId: string): CharacterState {
  const item = state.items.find(i => i.id === itemId);
  if (!item) return state;

  const wasEquipped = item.equipped;
  
  let updated: CharacterState = {
    ...state,
    items: state.items.map(i => i.id === itemId ? { ...i, equipped: !wasEquipped } : i),
  };

  if (!wasEquipped && item.statBoost) {
    const newStats = { ...state.stats };
    Object.entries(item.statBoost).forEach(([stat, boost]) => {
      newStats[stat as StatKey] += boost || 0;
    });
    updated = { ...updated, stats: newStats };
  } else if (wasEquipped && item.statBoost) {
    const newStats = { ...state.stats };
    Object.entries(item.statBoost).forEach(([stat, boost]) => {
      newStats[stat as StatKey] = Math.max(1, newStats[stat as StatKey] - (boost || 0));
    });
    updated = { ...updated, stats: newStats };
  }

  updated = addLog(updated, {
    type: 'item',
    message: wasEquipped ? `아이템 장착 해제: "${item.name}"` : `아이템 장착: "${item.name}"`,
  });

  return updated;
}

export function completePomodoroSession(state: CharacterState, minutes: number): CharacterState {
  const xpReward = Math.floor(minutes * 2);
  
  let updated: CharacterState = {
    ...state,
    pomodoroMinutes: state.pomodoroMinutes + minutes,
  };

  updated = gainXP(updated, xpReward);
  updated = addLog(updated, {
    type: 'pomodoro',
    message: `포모도로 완료: ${minutes}분 집중 - +${xpReward}XP`,
    value: xpReward,
  });

  return updated;
}

export function checkDailyQuestFailures(state: CharacterState): CharacterState {
  const today = todayString();
  
  if (state.lastQuestCheckDate === today) {
    return state;
  }

  const activeQuests = state.quests.filter(q => q.status === 'active' && q.createdAt < Date.now() - 24 * 60 * 60 * 1000);
  
  let updated = state;
  activeQuests.forEach(quest => {
    updated = failQuest(updated, quest.id);
  });

  updated = { ...updated, lastQuestCheckDate: today };
  
  return updated;
}

export const RARITY_LABELS: Record<ItemRarity, string> = {
  common: '일반',
  rare: '희귀',
  epic: '영웅',
  legendary: '전설',
};

export const RARITY_COLORS: Record<ItemRarity, string> = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};
