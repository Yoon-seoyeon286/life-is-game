import { useState } from 'react';
import type { ActivityLog } from '../types';

interface Props {
  logs: ActivityLog[];
  onClear: () => void;
}

const LOG_ICONS: Record<string, string> = {
  xp: '⚡',
  levelup: '🏆',
  quest: '📜',
  debuff: '💀',
  stat: '📈',
  achievement: '🎖',
  skill: '✨',
  streak: '🔥',
  boss: '👹',
  pomodoro: '🍅',
  item: '🎁',
};

const LOG_COLORS: Record<string, string> = {
  xp: 'text-yellow-400',
  levelup: 'text-purple-300',
  quest: 'text-blue-400',
  debuff: 'text-red-400',
  stat: 'text-green-400',
  achievement: 'text-orange-400',
  skill: 'text-violet-400',
  streak: 'text-orange-300',
  boss: 'text-red-300',
  pomodoro: 'text-red-400',
  item: 'text-pink-400',
};

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'quest', label: '📜 퀘스트' },
  { key: 'xp', label: '⚡ XP' },
  { key: 'levelup', label: '🏆 레벨업' },
  { key: 'debuff', label: '💀 디버프' },
  { key: 'boss', label: '👹 보스' },
] as const;

type FilterKey = typeof FILTERS[number]['key'];

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return '방금 전';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

function getDayLabel(ts: number): string {
  const now = new Date();
  const d = new Date(ts);
  const todayStr = now.toDateString();
  const dStr = d.toDateString();
  if (dStr === todayStr) return '오늘';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (dStr === yesterday.toDateString()) return '어제';
  return '이전';
}

export default function ActivityLogPanel({ logs, onClear }: Props) {
  const [filter, setFilter] = useState<FilterKey>('all');

  const filtered = filter === 'all' ? logs : logs.filter(l => l.type === filter);

  // 날짜 구분선용 그룹핑
  const groups: { label: string; items: ActivityLog[] }[] = [];
  for (const log of filtered) {
    const label = getDayLabel(log.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push(log);
    } else {
      groups.push({ label, items: [log] });
    }
  }

  return (
    <div className="rounded-2xl border border-purple-900/40 bg-[#13111c] p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white">활동 로그</h3>
        {logs.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-gray-800/50"
          >
            🗑 지우기
          </button>
        )}
      </div>

      {/* 필터 버튼 */}
      <div className="flex gap-1 flex-wrap mb-3">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
              filter === f.key
                ? 'bg-purple-700 border-purple-500 text-white'
                : 'border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
        {filtered.length === 0 && (
          <div className="text-center text-gray-600 py-8 text-sm">
            {logs.length === 0 ? '아직 활동 기록이 없습니다' : '해당 유형의 기록이 없습니다'}
          </div>
        )}
        {groups.map(group => (
          <div key={group.label}>
            {/* 날짜 구분선 */}
            <div className="flex items-center gap-2 py-1.5">
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-xs text-gray-600 shrink-0">{group.label}</span>
              <div className="flex-1 h-px bg-gray-800" />
            </div>
            {group.items.map(log => (
              <div key={log.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-800/30 transition-colors fade-in">
                <span className="text-base mt-0.5 shrink-0">{LOG_ICONS[log.type] || '•'}</span>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium ${LOG_COLORS[log.type] ?? 'text-gray-300'}`}>{log.message}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{timeAgo(log.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
