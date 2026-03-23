import { useState } from 'react';
import type { Quest, StatKey, QuestDifficulty, QuestCategory, RecurringType } from '../types';
import {
  STAT_LABELS, STAT_EMOJIS, DIFFICULTY_LABELS, DIFFICULTY_COLORS,
  CATEGORY_LABELS, CATEGORY_EMOJIS
} from '../gameLogic';

interface Props {
  quests: Quest[];
  onComplete: (id: string) => void;
  onFail: (id: string) => void;
  onAdd: (quest: Omit<Quest, 'id' | 'status' | 'createdAt' | 'xpReward' | 'statReward'>) => void;
}

const STAT_KEYS: StatKey[] = ['intelligence', 'strength', 'creativity', 'discipline', 'social'];
const DIFFICULTIES: QuestDifficulty[] = ['easy', 'normal', 'hard', 'epic'];
const CATEGORIES: QuestCategory[] = ['study', 'health', 'project', 'social', 'habit', 'other'];
const XP_MAP: Record<QuestDifficulty, number> = { easy: 30, normal: 60, hard: 120, epic: 250 };

type MainTab = 'daily' | 'quests';
type StatusFilter = 'active' | 'completed' | 'failed';

export default function QuestBoard({ quests, onComplete, onFail, onAdd }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>('daily');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [categoryFilter, setCategoryFilter] = useState<QuestCategory | 'all'>('all');
  const [form, setForm] = useState({
    title: '',
    description: '',
    difficulty: 'normal' as QuestDifficulty,
    stat: 'discipline' as StatKey,
    category: 'habit' as QuestCategory,
    recurring: 'daily' as RecurringType,
  });

  const dailyQuests = quests.filter(q => q.recurring !== null);
  const oneTimeQuests = quests.filter(q => q.recurring === null);

  const filteredDaily = dailyQuests.filter(q => q.status === statusFilter);
  const filteredOneTime = oneTimeQuests.filter(q =>
    q.status === statusFilter &&
    (categoryFilter === 'all' || q.category === categoryFilter)
  );

  const currentList = mainTab === 'daily' ? filteredDaily : filteredOneTime;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onAdd(form);
    setForm({ title: '', description: '', difficulty: 'normal', stat: 'discipline', category: 'habit', recurring: mainTab === 'daily' ? 'daily' : null });
    setShowForm(false);
  }

  function handleTabChange(tab: MainTab) {
    setMainTab(tab);
    setShowForm(false);
    setStatusFilter('active');
    setForm(v => ({ ...v, recurring: tab === 'daily' ? 'daily' : null }));
  }

  const dailyActive = dailyQuests.filter(q => q.status === 'active').length;
  const questActive = oneTimeQuests.filter(q => q.status === 'active').length;

  return (
    <div className="rounded-2xl border border-purple-900/40 bg-[#13111c] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-gray-900/60 rounded-xl p-1">
          <button
            onClick={() => handleTabChange('daily')}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
              mainTab === 'daily' ? 'bg-blue-700 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            🔄 루틴
            {dailyActive > 0 && (
              <span className="text-xs bg-blue-500/40 px-1.5 rounded-full">{dailyActive}</span>
            )}
          </button>
          <button
            onClick={() => handleTabChange('quests')}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
              mainTab === 'quests' ? 'bg-purple-700 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            📜 퀘스트
            {questActive > 0 && (
              <span className="text-xs bg-purple-500/40 px-1.5 rounded-full">{questActive}</span>
            )}
          </button>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className={`text-xs text-white px-3 py-1.5 rounded-lg transition-colors ${
            mainTab === 'daily' ? 'bg-blue-700 hover:bg-blue-600' : 'bg-purple-700 hover:bg-purple-600'
          }`}
        >
          {showForm ? '취소' : mainTab === 'daily' ? '+ 루틴 추가' : '+ 퀘스트 추가'}
        </button>
      </div>

      {mainTab === 'daily' && !showForm && dailyActive === 0 && statusFilter === 'active' && (
        <div className="mb-3 p-3 rounded-xl bg-blue-900/15 border border-blue-900/30 text-center">
          <p className="text-xs text-blue-400">매일/매주 반복할 루틴을 등록하세요</p>
          <p className="text-xs text-gray-600 mt-0.5">완료해도 다음 날 자동으로 초기화돼요</p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 rounded-xl bg-[#1e1a2e] border border-purple-800/30 space-y-3 fade-in">
          <input
            className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-purple-500"
            placeholder={mainTab === 'daily' ? '루틴 이름 (예: 30분 독서)' : '퀘스트 이름'}
            value={form.title}
            onChange={e => setForm(v => ({ ...v, title: e.target.value }))}
            required
          />
          <input
            className="w-full bg-gray-800 text-gray-300 text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-purple-500"
            placeholder="설명 (선택)"
            value={form.description}
            onChange={e => setForm(v => ({ ...v, description: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-gray-400 mb-1">카테고리</div>
              <select
                className="w-full bg-gray-800 text-white text-sm rounded-lg px-2 py-2 border border-gray-700 focus:outline-none"
                value={form.category}
                onChange={e => setForm(v => ({ ...v, category: e.target.value as QuestCategory }))}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{CATEGORY_EMOJIS[c]} {CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">관련 스탯</div>
              <select
                className="w-full bg-gray-800 text-white text-sm rounded-lg px-2 py-2 border border-gray-700 focus:outline-none"
                value={form.stat}
                onChange={e => setForm(v => ({ ...v, stat: e.target.value as StatKey }))}
              >
                {STAT_KEYS.map(k => (
                  <option key={k} value={k}>{STAT_EMOJIS[k]} {STAT_LABELS[k]}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">난이도</div>
              <select
                className="w-full bg-gray-800 text-white text-sm rounded-lg px-2 py-2 border border-gray-700 focus:outline-none"
                value={form.difficulty}
                onChange={e => setForm(v => ({ ...v, difficulty: e.target.value as QuestDifficulty }))}
              >
                {DIFFICULTIES.map(d => (
                  <option key={d} value={d}>{DIFFICULTY_LABELS[d]} (+{XP_MAP[d]}XP)</option>
                ))}
              </select>
            </div>
            {mainTab === 'daily' && (
              <div>
                <div className="text-xs text-gray-400 mb-1">반복 주기</div>
                <select
                  className="w-full bg-gray-800 text-white text-sm rounded-lg px-2 py-2 border border-gray-700 focus:outline-none"
                  value={form.recurring ?? 'daily'}
                  onChange={e => setForm(v => ({ ...v, recurring: e.target.value as RecurringType }))}
                >
                  <option value="daily">매일</option>
                  <option value="weekly">매주</option>
                </select>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-500 text-white text-sm py-2 rounded-lg transition-colors font-medium"
          >
            {mainTab === 'daily' ? '루틴 등록' : '퀘스트 수락'}
          </button>
        </form>
      )}

      <div className="flex gap-1 mb-3 flex-wrap">
        {(['active', 'completed', 'failed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              statusFilter === f ? 'bg-purple-700 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {f === 'active' ? '진행 중' : f === 'completed' ? '완료' : '실패'}
            <span className="ml-1 text-gray-500">
              ({(mainTab === 'daily' ? dailyQuests : oneTimeQuests).filter(q => q.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {mainTab === 'quests' && statusFilter === 'active' && (
        <div className="flex gap-1 mb-3 flex-wrap">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`text-xs px-2 py-0.5 rounded-full transition-colors ${categoryFilter === 'all' ? 'bg-gray-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            전체
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`text-xs px-2 py-0.5 rounded-full transition-colors ${categoryFilter === c ? 'bg-gray-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {CATEGORY_EMOJIS[c]} {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {currentList.length === 0 && (
          <div className="text-center text-gray-600 py-8 text-sm">
            {statusFilter === 'active'
              ? mainTab === 'daily' ? '오늘 할 루틴이 없어요' : '진행 중인 퀘스트가 없습니다'
              : statusFilter === 'completed' ? '완료한 항목이 없습니다' : '실패한 항목이 없습니다'}
          </div>
        )}
        {currentList.map(quest => (
          <QuestItem key={quest.id} quest={quest} onComplete={onComplete} onFail={onFail} isDaily={mainTab === 'daily'} />
        ))}
      </div>
    </div>
  );
}

function QuestItem({ quest, onComplete, onFail, isDaily }: {
  quest: Quest;
  onComplete: (id: string) => void;
  onFail: (id: string) => void;
  isDaily: boolean;
}) {
  return (
    <div className={`p-3 rounded-xl border fade-in ${
      isDaily
        ? 'bg-blue-950/20 border-blue-900/30'
        : 'bg-gray-900/50 border-gray-800/50'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs">{CATEGORY_EMOJIS[quest.category]}</span>
            <span className="text-sm font-medium text-white truncate">{quest.title}</span>
            {quest.recurring && (
              <span className="text-xs bg-blue-900/50 text-blue-400 border border-blue-800/40 px-1.5 py-0.5 rounded-full">
                {quest.recurring === 'daily' ? '매일' : '매주'}
              </span>
            )}
            <span
              className="text-xs px-1.5 py-0.5 rounded font-medium"
              style={{ color: DIFFICULTY_COLORS[quest.difficulty], backgroundColor: `${DIFFICULTY_COLORS[quest.difficulty]}22` }}
            >
              {DIFFICULTY_LABELS[quest.difficulty]}
            </span>
          </div>
          {quest.description && (
            <div className="text-xs text-gray-500 mt-0.5 truncate">{quest.description}</div>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">{STAT_EMOJIS[quest.stat]} {STAT_LABELS[quest.stat]}</span>
            <span className="text-xs text-yellow-500">+{quest.xpReward}XP</span>
          </div>
        </div>

        {quest.status === 'active' && (
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => onComplete(quest.id)}
              className="text-xs bg-green-800/60 hover:bg-green-700 text-green-300 px-2 py-1 rounded-lg transition-colors"
            >
              완료
            </button>
            <button
              onClick={() => onFail(quest.id)}
              className="text-xs bg-red-900/60 hover:bg-red-800 text-red-400 px-2 py-1 rounded-lg transition-colors"
            >
              실패
            </button>
          </div>
        )}
        {quest.status === 'completed' && <span className="text-green-500 text-lg shrink-0">✓</span>}
        {quest.status === 'failed' && <span className="text-red-500 text-lg shrink-0">✗</span>}
      </div>
    </div>
  );
}
