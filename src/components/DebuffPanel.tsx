import { useState } from 'react';
import type { Debuff, StatKey } from '../types';
import { STAT_LABELS, STAT_EMOJIS } from '../gameLogic';

interface Props {
  debuffs: Debuff[];
  onAdd: (debuff: Omit<Debuff, 'id' | 'createdAt' | 'resolved'>) => void;
  onResolve: (id: string) => void;
}

const STAT_KEYS: StatKey[] = ['intelligence', 'strength', 'creativity', 'discipline', 'social'];

export default function DebuffPanel({ debuffs, onAdd, onResolve }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [showResolved, setShowResolved] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    statPenalty: 'discipline' as StatKey,
    penaltyAmount: 1,
  });

  const active = debuffs.filter(d => !d.resolved);
  const resolved = debuffs.filter(d => d.resolved);
  const visible = showResolved ? resolved : active;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onAdd(form);
    setForm({ title: '', description: '', statPenalty: 'discipline', penaltyAmount: 1 });
    setShowForm(false);
  }

  return (
    <div className="rounded-2xl border border-red-900/30 bg-[#13111c] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-white">디버프 / 실패</h3>
          {active.length > 0 && (
            <span className="text-xs bg-red-900/60 text-red-400 border border-red-800/40 px-2 py-0.5 rounded-full">
              {active.length}개 활성
            </span>
          )}
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="text-xs bg-red-900/50 hover:bg-red-900 text-red-300 px-3 py-1.5 rounded-lg transition-colors border border-red-800/30"
        >
          {showForm ? '취소' : '+ 실패 기록'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 rounded-xl bg-[#1e1a2e] border border-red-800/20 space-y-3 fade-in">
          <input
            className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-red-500"
            placeholder="실패/문제 내용"
            value={form.title}
            onChange={e => setForm(v => ({ ...v, title: e.target.value }))}
            required
          />
          <input
            className="w-full bg-gray-800 text-gray-300 text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-red-500"
            placeholder="원인/메모 (선택)"
            value={form.description}
            onChange={e => setForm(v => ({ ...v, description: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-gray-400 mb-1">패널티 스탯</div>
              <select
                className="w-full bg-gray-800 text-white text-sm rounded-lg px-2 py-2 border border-gray-700 focus:outline-none"
                value={form.statPenalty}
                onChange={e => setForm(v => ({ ...v, statPenalty: e.target.value as StatKey }))}
              >
                {STAT_KEYS.map(k => (
                  <option key={k} value={k}>{STAT_EMOJIS[k]} {STAT_LABELS[k]}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">패널티 수치 (-{form.penaltyAmount})</div>
              <input
                type="range"
                min={1}
                max={5}
                value={form.penaltyAmount}
                onChange={e => setForm(v => ({ ...v, penaltyAmount: Number(e.target.value) }))}
                className="w-full mt-2"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-red-800 hover:bg-red-700 text-white text-sm py-2 rounded-lg transition-colors font-medium"
          >
            디버프 기록
          </button>
        </form>
      )}

      <div className="flex gap-1 mb-3">
        <button
          onClick={() => setShowResolved(false)}
          className={`text-xs px-3 py-1 rounded-full transition-colors ${!showResolved ? 'bg-red-900/60 text-red-300' : 'text-gray-400 hover:text-gray-200'}`}
        >
          활성 ({active.length})
        </button>
        <button
          onClick={() => setShowResolved(true)}
          className={`text-xs px-3 py-1 rounded-full transition-colors ${showResolved ? 'bg-gray-700 text-gray-200' : 'text-gray-400 hover:text-gray-200'}`}
        >
          극복함 ({resolved.length})
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {visible.length === 0 && (
          <div className="text-center text-gray-600 py-6 text-sm">
            {showResolved ? '극복한 디버프가 없습니다' : '활성 디버프가 없습니다. 잘하고 있어요!'}
          </div>
        )}
        {visible.map(debuff => (
          <div key={debuff.id} className={`p-3 rounded-xl border fade-in ${debuff.resolved ? 'bg-gray-900/30 border-gray-800/30 opacity-60' : 'bg-red-950/20 border-red-900/30'}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">{debuff.title}</div>
                {debuff.description && (
                  <div className="text-xs text-gray-500 mt-0.5">{debuff.description}</div>
                )}
                <div className="text-xs text-red-400 mt-1">
                  {STAT_EMOJIS[debuff.statPenalty]} {STAT_LABELS[debuff.statPenalty]} -{debuff.penaltyAmount}
                </div>
              </div>
              {!debuff.resolved && (
                <button
                  onClick={() => onResolve(debuff.id)}
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded-lg transition-colors shrink-0"
                >
                  극복
                </button>
              )}
              {debuff.resolved && (
                <span className="text-green-500 text-sm shrink-0">극복</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
