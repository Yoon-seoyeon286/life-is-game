import { useState, useEffect, useRef } from 'react';
import type { CharacterState, Quest, Debuff, CharacterClass } from './types';
import {
  createInitialState,
  addQuest,
  completeQuest,
  failQuest,
  deleteQuest,
  addDebuff,
  resolveDebuff,
  challengeBoss,
  getAvailableBoss,
  equipItem,
  completePomodoroSession,
  ALL_BOSSES,
  ALL_ACHIEVEMENTS,
  ALL_SKILLS,
  dailyReset,
} from './gameLogic';
import CharacterCard from './components/CharacterCard';
import QuestBoard from './components/QuestBoard';
import DebuffPanel from './components/DebuffPanel';
import ActivityLogPanel from './components/ActivityLogPanel';
import SkillTree from './components/SkillTree';
import AchievementsPanel from './components/AchievementsPanel';
import StatsChart from './components/StatsChart';
import LevelUpOverlay from './components/LevelUpOverlay';
import ClassSelector from './components/ClassSelector';
import BossModal from './components/BossModal';
import ItemPanel from './components/ItemPanel';
import PomodoroTimer from './components/PomodoroTimer';
import WeeklyReport from './components/WeeklyReport';

const STORAGE_KEY = 'life-is-game-v4';
const OLD_KEYS = ['life-is-game-v1', 'life-is-game-v2', 'life-is-game-v3'];

function migrateState(raw: CharacterState): CharacterState {
  return {
    ...raw,
    characterClass: raw.characterClass ?? 'ranger',
    streak: raw.streak ?? 0,
    lastActiveDate: raw.lastActiveDate ?? null,
    totalXpEarned: raw.totalXpEarned ?? 0,
    questsCompleted: raw.questsCompleted ?? 0,
    xpHistory: raw.xpHistory ?? [],
    logs: raw.logs ?? [],
    debuffs: raw.debuffs ?? [],
    achievements: raw.achievements?.length
      ? raw.achievements
      : ALL_ACHIEVEMENTS.map(a => ({ ...a, unlockedAt: null })),
    skills: raw.skills?.length
      ? raw.skills
      : ALL_SKILLS.map(s => ({ ...s, unlockedAt: null })),
    bosses: ALL_BOSSES.map(b => {
      const existing = (raw.bosses ?? []).find((eb: { id: string }) => eb.id === b.id);
      return { ...b, defeatedAt: existing?.defeatedAt ?? null };
    }),
    quests: (raw.quests ?? []).map(q => ({
      ...q,
      category: q.category ?? 'other',
      recurring: q.recurring ?? null,
      lastCompletedDate: q.lastCompletedDate ?? null,
    })),
    items: raw.items ?? [],
    notifications: raw.notifications ?? [],
    pomodoroMinutes: raw.pomodoroMinutes ?? 0,
    lastQuestCheckDate: raw.lastQuestCheckDate ?? null,
  };
}

function loadState(): CharacterState | null {
  try {
    // 이전 키 데이터 마이그레이션 (삭제하지 않고 읽어서 변환)
    for (const oldKey of OLD_KEYS) {
      const oldRaw = localStorage.getItem(oldKey);
      if (oldRaw) {
        const oldParsed = JSON.parse(oldRaw) as CharacterState;
        const migrated = migrateState(oldParsed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        localStorage.removeItem(oldKey);
        return migrated;
      }
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return migrateState(JSON.parse(raw) as CharacterState);
  } catch {
    return null;
  }
}

function saveState(state: CharacterState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

type XpFloat = { id: string; amount: number };
type Tab = 'quest' | 'skills' | 'achievements' | 'stats' | 'items' | 'pomodoro' | 'report';

export default function App() {
  const [state, setState] = useState<CharacterState | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('warrior');
  const [xpFloats, setXpFloats] = useState<XpFloat[]>([]);
  const [levelUpData, setLevelUpData] = useState<{ level: number; title: string } | null>(null);
  const [tab, setTab] = useState<Tab>('quest');
  const [showBossModal, setShowBossModal] = useState(false);
  const prevLevelRef = useRef(0);

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      const lastDate = localStorage.getItem('life-is-game-last-date');
      const today = new Date().toISOString().split('T')[0];
      const resetState = dailyReset(saved, lastDate);
      localStorage.setItem('life-is-game-last-date', today);
      setState(resetState);
      prevLevelRef.current = resetState.level;
    }
  }, []);

  useEffect(() => {
    if (state) {
      saveState(state);
      if (state.level > prevLevelRef.current && prevLevelRef.current !== 0) {
        setLevelUpData({ level: state.level, title: state.title });
      }
      prevLevelRef.current = state.level;
    }
  }, [state]);

  function showXpFloat(amount: number) {
    const id = crypto.randomUUID();
    setXpFloats(v => [...v, { id, amount }]);
    setTimeout(() => setXpFloats(v => v.filter(f => f.id !== id)), 1300);
  }

  function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim()) return;
    const s = createInitialState(nameInput.trim(), selectedClass);
    setState(s);
    prevLevelRef.current = s.level;
  }

  function handleAddQuest(quest: Omit<Quest, 'id' | 'status' | 'createdAt' | 'xpReward' | 'statReward' | 'lastCompletedDate'>) {
    setState(s => s ? addQuest(s, quest) : s);
  }

  function handleCompleteQuest(id: string) {
    setState(prev => {
      if (!prev) return prev;
      const quest = prev.quests.find(q => q.id === id);
      if (!quest) return prev;
      showXpFloat(quest.xpReward ?? 0);
      return completeQuest(prev, id);
    });
  }

  function handleFailQuest(id: string) {
    setState(s => s ? failQuest(s, id) : s);
  }

  function handleDeleteQuest(id: string) {
    setState(s => s ? deleteQuest(s, id) : s);
  }

  function handleEquipItem(id: string) {
    setState(s => s ? equipItem(s, id) : s);
  }

  function handleCompletePomodoroSession(minutes: number) {
    setState(prev => {
      if (!prev) return prev;
      showXpFloat(minutes * 2);
      return completePomodoroSession(prev, minutes);
    });
  }

  function handleAddDebuff(debuff: Omit<Debuff, 'id' | 'createdAt' | 'resolved'>) {
    setState(s => s ? addDebuff(s, debuff) : s);
  }

  function handleResolveDebuff(id: string) {
    setState(s => s ? resolveDebuff(s, id) : s);
  }

  function handleChallengeBoss(bossId: string) {
    setState(prev => {
      if (!prev) return prev;
      const { state: next, won } = challengeBoss(prev, bossId);
      if (won) showXpFloat(prev.bosses.find(b => b.id === bossId)?.xpReward ?? 0);
      return next;
    });
  }

  function handleReset() {
    if (window.confirm('정말 초기화하시겠습니까? 모든 데이터가 삭제됩니다.')) {
      localStorage.removeItem(STORAGE_KEY);
      setState(null);
      prevLevelRef.current = 0;
    }
  }

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-full max-w-md mx-4">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">⚔️</div>
            <h1 className="text-3xl font-black text-white mb-2">Life is Game</h1>
            <p className="text-gray-400 text-sm">현실을 RPG로. 자신을 레벨업하라.</p>
          </div>

          <form onSubmit={handleStart} className="rounded-2xl border border-purple-900/40 bg-[#13111c] p-6 space-y-5">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">캐릭터 이름</label>
              <input
                className="w-full bg-gray-800 text-white text-base rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="이름을 입력하세요"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                autoFocus
                required
              />
            </div>
            <ClassSelector selected={selectedClass} onChange={setSelectedClass} />
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-colors text-base"
            >
              모험 시작
            </button>
          </form>
        </div>
      </div>
    );
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'quest', label: '퀘스트' },
    { key: 'pomodoro', label: '포모도로' },
    { key: 'items', label: '인벤토리' },
    { key: 'skills', label: '스킬' },
    { key: 'achievements', label: '업적' },
    { key: 'report', label: '리포트' },
    { key: 'stats', label: '통계' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {levelUpData && (
        <LevelUpOverlay
          level={levelUpData.level}
          title={levelUpData.title}
          onDone={() => setLevelUpData(null)}
        />
      )}

      {showBossModal && state && getAvailableBoss(state) && (
        <BossModal
          boss={getAvailableBoss(state)!}
          state={state}
          onChallenge={(bossId) => { handleChallengeBoss(bossId); }}
          onClose={() => setShowBossModal(false)}
        />
      )}

      <header className="border-b border-purple-900/30 bg-[#0d0b14] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚔️</span>
            <span className="font-black text-white text-lg">Life is Game</span>
          </div>
          <button
            onClick={handleReset}
            className="text-xs text-gray-600 hover:text-red-400 transition-colors"
          >
            초기화
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 space-y-5">
            <div id="character-card" className="relative">
              <CharacterCard state={state} onBossClick={() => setShowBossModal(true)} />
              {xpFloats.map(f => (
                <div key={f.id} className="xp-float" style={{ top: '40%', left: '60%' }}>
                  +{f.amount} XP
                </div>
              ))}
            </div>
            <ActivityLogPanel
              logs={state.logs}
              onClear={() => setState(s => ({ ...s, logs: [] }))}
            />
          </div>

          <div className="lg:col-span-2 space-y-5">
            <div className="flex gap-1 bg-[#13111c] rounded-xl p-1 border border-purple-900/30">
              {TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-1 text-sm py-2 rounded-lg transition-colors font-medium ${
                    tab === t.key
                      ? 'bg-purple-700 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'quest' && (
              <>
                <QuestBoard
                  quests={state.quests}
                  onComplete={handleCompleteQuest}
                  onFail={handleFailQuest}
                  onDelete={handleDeleteQuest}
                  onAdd={handleAddQuest}
                />
                <DebuffPanel
                  debuffs={state.debuffs}
                  onAdd={handleAddDebuff}
                  onResolve={handleResolveDebuff}
                />
              </>
            )}
            {tab === 'pomodoro' && (
              <PomodoroTimer
                onComplete={handleCompletePomodoroSession}
                totalMinutes={state.pomodoroMinutes}
              />
            )}
            {tab === 'items' && (
              <ItemPanel
                items={state.items}
                onEquip={handleEquipItem}
              />
            )}
            {tab === 'skills' && (
              <SkillTree skills={state.skills} stats={state.stats} />
            )}
            {tab === 'achievements' && (
              <AchievementsPanel achievements={state.achievements} />
            )}
            {tab === 'report' && (
              <WeeklyReport
                xpHistory={state.xpHistory}
                questsCompleted={state.questsCompleted}
                streak={state.streak}
              />
            )}
            {tab === 'stats' && (
              <StatsChart
                xpHistory={state.xpHistory}
                totalXpEarned={state.totalXpEarned}
                questsCompleted={state.questsCompleted}
                level={state.level}
                streak={state.streak}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
