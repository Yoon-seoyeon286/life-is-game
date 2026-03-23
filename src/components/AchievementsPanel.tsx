import type { Achievement } from '../types';

interface Props {
  achievements: Achievement[];
}

export default function AchievementsPanel({ achievements }: Props) {
  const unlocked = achievements.filter(a => a.unlockedAt !== null);
  const locked = achievements.filter(a => a.unlockedAt === null);

  return (
    <div className="rounded-2xl border border-yellow-900/30 bg-[#13111c] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">업적 컬렉션</h3>
        <span className="text-xs text-yellow-500">{unlocked.length}/{achievements.length}</span>
      </div>

      {unlocked.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">달성</div>
          <div className="grid grid-cols-1 gap-1.5">
            {unlocked.map(a => (
              <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-yellow-900/15 border border-yellow-800/30 fade-in">
                <span className="text-xl shrink-0">{a.icon}</span>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-yellow-300">{a.title}</div>
                  <div className="text-xs text-gray-500 truncate">{a.description}</div>
                </div>
                <span className="text-green-500 shrink-0 ml-auto">✓</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">미달성</div>
        <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {locked.map(a => (
            <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-900/30 border border-gray-800/30 opacity-50">
              <span className="text-xl grayscale shrink-0">{a.icon}</span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-500">{a.title}</div>
                <div className="text-xs text-gray-600 truncate">{a.description}</div>
              </div>
              <span className="text-gray-700 shrink-0 ml-auto text-lg">🔒</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
