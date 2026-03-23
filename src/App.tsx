import { useState, useEffect, useRef } from 'react';
import type { CharacterState, Quest, Debuff } from './types';
import {
  createInitialState,
  addQuest,
  completeQuest,
  failQuest,
  addDebuff,
  resolveDebuff,
} from './gameLogic';
import CharacterCard from './components/CharacterCard';
import QuestBoard from './components/QuestBoard';
import DebuffPanel from './components/DebuffPanel';
import ActivityLogPanel from './components/ActivityLogPanel';

const STORAGE_KEY = 'life-is-game-v1';

function loadState(): CharacterState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState(state: CharacterState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

type XpFloat = { id: string; amount: number };

export default function App() {
  const [state, setState] = useState<CharacterState | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [xpFloats, setXpFloats] = useState<XpFloat[]>([]);
  const prevLevelRef = useRef(0);

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setState(saved);
      prevLevelRef.current = saved.level;
    }
  }, []);

  useEffect(() => {
    if (state) {
      saveState(state);
      if (state.level > prevLevelRef.current && prevLevelRef.current !== 0) {
        const card = document.getElementById('character-card');
        if (card) {
          card.classList.remove('level-up-pulse');
          void card.offsetWidth;
          card.classList.add('level-up-pulse');
        }
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
    const s = createInitialState(nameInput.trim());
    setState(s);
    prevLevelRef.current = s.level;
  }

  function handleAddQuest(quest: Omit<Quest, 'id' | 'status' | 'createdAt' | 'xpReward' | 'statReward'>) {
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

  function handleAddDebuff(debuff: Omit<Debuff, 'id' | 'createdAt' | 'resolved'>) {
    setState(s => s ? addDebuff(s, debuff) : s);
  }

  function handleResolveDebuff(id: string) {
    setState(s => s ? resolveDebuff(s, id) : s);
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
        <div className="w-full max-w-sm mx-4">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">⚔️</div>
            <h1 className="text-3xl font-black text-white mb-2">Life is Game</h1>
            <p className="text-gray-400 text-sm">현실을 RPG로. 자신을 레벨업하라.</p>
          </div>

          <form onSubmit={handleStart} className="rounded-2xl border border-purple-900/40 bg-[#13111c] p-6 space-y-4">
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
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-colors text-base"
            >
              모험 시작
            </button>
          </form>

          <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs text-gray-600">
            <div className="p-2 rounded-lg bg-gray-900/50">🧠 지능 스탯</div>
            <div className="p-2 rounded-lg bg-gray-900/50">💪 체력 스탯</div>
            <div className="p-2 rounded-lg bg-gray-900/50">📜 퀘스트 시스템</div>
            <div className="p-2 rounded-lg bg-gray-900/50">⚡ 경험치 & 레벨업</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
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
              <CharacterCard state={state} />
              {xpFloats.map(f => (
                <div key={f.id} className="xp-float" style={{ top: '40%', left: '60%' }}>
                  +{f.amount} XP
                </div>
              ))}
            </div>
            <ActivityLogPanel logs={state.logs} />
          </div>

          <div className="lg:col-span-2 space-y-5">
            <QuestBoard
              quests={state.quests}
              onComplete={handleCompleteQuest}
              onFail={handleFailQuest}
              onAdd={handleAddQuest}
            />
            <DebuffPanel
              debuffs={state.debuffs}
              onAdd={handleAddDebuff}
              onResolve={handleResolveDebuff}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
