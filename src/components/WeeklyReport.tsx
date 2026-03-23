import type { XpHistoryEntry } from '../types';

interface Props {
  xpHistory: XpHistoryEntry[];
  questsCompleted: number;
  streak: number;
}

export default function WeeklyReport({ xpHistory, questsCompleted, streak }: Props) {
  const last7Days = xpHistory.slice(-7);
  const totalXpThisWeek = last7Days.reduce((sum, e) => sum + e.xp, 0);
  const avgXpPerDay = last7Days.length > 0 ? Math.round(totalXpThisWeek / last7Days.length) : 0;
  const maxXpDay = last7Days.length > 0 ? Math.max(...last7Days.map(e => e.xp)) : 0;

  const last30Days = xpHistory.slice(-30);
  const totalXpThisMonth = last30Days.reduce((sum, e) => sum + e.xp, 0);

  return (
    <div className="rounded-2xl border border-purple-900/40 bg-[#13111c] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-base">📊 리포트</h3>
      </div>

      <div className="space-y-3">
        <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-900/30">
          <div className="text-xs text-blue-400 mb-1">이번 주</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{totalXpThisWeek}</span>
            <span className="text-xs text-gray-500">XP</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            일평균 {avgXpPerDay}XP · 최고 {maxXpDay}XP
          </div>
        </div>

        <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-900/30">
          <div className="text-xs text-purple-400 mb-1">이번 달</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{totalXpThisMonth}</span>
            <span className="text-xs text-gray-500">XP</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-green-950/20 border border-green-900/30">
            <div className="text-xs text-green-400 mb-1">완료한 퀘스트</div>
            <div className="text-xl font-bold text-white">{questsCompleted}</div>
          </div>
          <div className="p-3 rounded-xl bg-orange-950/20 border border-orange-900/30">
            <div className="text-xs text-orange-400 mb-1">현재 스트릭</div>
            <div className="text-xl font-bold text-white">{streak}일</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-gray-900/50 border border-gray-800/50">
          <div className="text-xs text-gray-400 mb-2">최근 7일 활동</div>
          <div className="flex items-end gap-1 h-16">
            {last7Days.map((entry, i) => {
              const height = maxXpDay > 0 ? (entry.xp / maxXpDay) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center h-full">
                    <div
                      className="w-full bg-purple-600 rounded-t"
                      style={{ height: `${height}%`, minHeight: entry.xp > 0 ? '4px' : '0' }}
                    />
                  </div>
                  <div className="text-xs text-gray-600">
                    {new Date(entry.date).getDate()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
