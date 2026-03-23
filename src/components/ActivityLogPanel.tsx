import type { ActivityLog } from '../types';

interface Props {
  logs: ActivityLog[];
}

const LOG_ICONS: Record<string, string> = {
  xp: '⚡',
  levelup: '🏆',
  quest: '📜',
  debuff: '💀',
  stat: '📈',
};

const LOG_COLORS: Record<string, string> = {
  xp: 'text-yellow-400',
  levelup: 'text-purple-300',
  quest: 'text-blue-400',
  debuff: 'text-red-400',
  stat: 'text-green-400',
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return '방금 전';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

export default function ActivityLogPanel({ logs }: Props) {
  return (
    <div className="rounded-2xl border border-purple-900/40 bg-[#13111c] p-5">
      <h3 className="text-lg font-bold text-white mb-4">활동 로그</h3>

      <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
        {logs.length === 0 && (
          <div className="text-center text-gray-600 py-8 text-sm">
            아직 활동 기록이 없습니다
          </div>
        )}
        {logs.map(log => (
          <div key={log.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-800/30 transition-colors fade-in">
            <span className="text-base mt-0.5 shrink-0">{LOG_ICONS[log.type] || '•'}</span>
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-medium ${LOG_COLORS[log.type]}`}>{log.message}</div>
              <div className="text-xs text-gray-600 mt-0.5">{timeAgo(log.timestamp)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
