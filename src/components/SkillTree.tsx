import type { SkillNode } from '../types';
import { STAT_LABELS, STAT_COLORS } from '../gameLogic';

interface Props {
  skills: SkillNode[];
  stats: Record<string, number>;
}

export default function SkillTree({ skills, stats }: Props) {
  const unlocked = skills.filter(s => s.unlockedAt !== null);
  const locked = skills.filter(s => s.unlockedAt === null);

  return (
    <div className="rounded-2xl border border-purple-900/40 bg-[#13111c] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">스킬 트리</h3>
        <span className="text-xs text-purple-400">{unlocked.length}/{skills.length} 해금</span>
      </div>

      {unlocked.length === 0 && (
        <p className="text-xs text-gray-600 mb-3">스탯을 10 이상으로 올리면 스킬이 해금됩니다.</p>
      )}

      <div className="grid grid-cols-1 gap-2">
        {[...unlocked, ...locked].map(skill => {
          const isUnlocked = skill.unlockedAt !== null;
          const progress = Math.min(100, (stats[skill.stat] / skill.requiredStatValue) * 100);

          return (
            <div
              key={skill.id}
              className={`p-3 rounded-xl border transition-all ${
                isUnlocked
                  ? 'border-purple-700/60 bg-purple-900/20'
                  : 'border-gray-800/50 bg-gray-900/30 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-xl ${isUnlocked ? '' : 'grayscale'}`}>{skill.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                      {skill.name}
                    </span>
                    {isUnlocked && (
                      <span className="text-xs text-purple-400">해금</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{skill.description}</p>
                  {!isUnlocked && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: STAT_COLORS[skill.stat],
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 shrink-0">
                        {stats[skill.stat]}/{skill.requiredStatValue} {STAT_LABELS[skill.stat]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
