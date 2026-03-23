import type { XpHistoryEntry } from '../types';

interface Props {
  xpHistory: XpHistoryEntry[];
  totalXpEarned: number;
  questsCompleted: number;
  level: number;
  streak: number;
}

export default function StatsChart({ xpHistory, totalXpEarned, questsCompleted, level, streak }: Props) {
  const last7 = getLast7Days(xpHistory);
  const maxXp = Math.max(...last7.map(d => d.xp), 1);
  const chartHeight = 80;

  return (
    <div className="rounded-2xl border border-purple-900/40 bg-[#13111c] p-5">
      <h3 className="text-lg font-bold text-white mb-4">대시보드</h3>

      <div className="grid grid-cols-2 gap-2 mb-5">
        <StatBox label="총 경험치" value={totalXpEarned.toLocaleString()} color="text-yellow-400" />
        <StatBox label="현재 레벨" value={`Lv.${level}`} color="text-purple-400" />
        <StatBox label="완료 퀘스트" value={questsCompleted.toString()} color="text-green-400" />
        <StatBox label="최장 스트릭" value={`${streak}일`} color="text-orange-400" />
      </div>

      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">최근 7일 XP</div>
        <div className="flex items-end gap-1.5" style={{ height: `${chartHeight + 20}px` }}>
          {last7.map((entry, i) => {
            const barH = entry.xp > 0 ? Math.max(4, Math.round((entry.xp / maxXp) * chartHeight)) : 2;
            const isToday = i === last7.length - 1;
            return (
              <div key={entry.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs text-gray-500 font-medium">
                  {entry.xp > 0 ? entry.xp : ''}
                </div>
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${barH}px`,
                    backgroundColor: isToday ? '#a855f7' : entry.xp > 0 ? '#6366f1' : '#1f2937',
                    minHeight: '2px',
                  }}
                  title={`${entry.date}: ${entry.xp} XP`}
                />
                <div className="text-xs text-gray-600">{formatDay(entry.date)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-3 rounded-xl bg-gray-900/50 border border-gray-800/40 text-center">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function getLast7Days(history: XpHistoryEntry[]): XpHistoryEntry[] {
  const result: XpHistoryEntry[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const found = history.find(e => e.date === dateStr);
    result.push({ date: dateStr, xp: found?.xp ?? 0 });
  }
  return result;
}

function formatDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
