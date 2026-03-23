import type { CharacterState } from '../types';
import { STAT_LABELS, STAT_COLORS, STAT_EMOJIS, CLASS_DEFS, getAvailableBoss } from '../gameLogic';

interface Props {
  state: CharacterState;
  onBossClick: () => void;
}

export default function CharacterCard({ state, onBossClick }: Props) {
  const xpPercent = Math.min(100, (state.xp / state.xpToNextLevel) * 100);
  const activeDebuffs = state.debuffs.filter(d => !d.resolved).length;
  const classDef = CLASS_DEFS[state.characterClass];
  const unlockedAchievements = state.achievements.filter(a => a.unlockedAt !== null).length;
  const unlockedSkills = state.skills.filter(s => s.unlockedAt !== null).length;
  const availableBoss = getAvailableBoss(state);

  return (
    <div className="relative rounded-2xl border border-purple-900/40 bg-gradient-to-br from-[#13111c] to-[#1a1628] p-6 shadow-2xl">
      <div className="absolute inset-0 rounded-2xl shimmer-bg pointer-events-none" />

      <div className="relative flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-purple-400 uppercase tracking-widest">Player</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ color: classDef.color, backgroundColor: `${classDef.color}22`, border: `1px solid ${classDef.color}55` }}
            >
              {classDef.icon} {classDef.label}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white">{state.name}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-sm text-purple-300 font-medium">[{state.title}]</span>
            {state.streak > 0 && (
              <span className="text-xs bg-orange-900/50 text-orange-400 border border-orange-800/50 px-2 py-0.5 rounded-full">
                🔥 {state.streak}일 연속
              </span>
            )}
            {activeDebuffs > 0 && (
              <span className="text-xs bg-red-900/50 text-red-400 border border-red-800/50 px-2 py-0.5 rounded-full">
                💀 디버프 {activeDebuffs}
              </span>
            )}
          </div>
        </div>

        <div className="text-center shrink-0">
          <div className="w-16 h-16 rounded-full border-2 border-purple-600 bg-purple-900/30 flex items-center justify-center text-2xl font-black text-purple-300 relative">
            {state.level}
            <div className="absolute -bottom-1 -right-1 text-xs bg-purple-600 rounded-full w-5 h-5 flex items-center justify-center text-white font-bold">
              Lv
            </div>
          </div>
        </div>
      </div>

      <div className="relative mb-5">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>경험치</span>
          <span>{state.xp} / {state.xpToNextLevel} XP</span>
        </div>
        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full stat-bar bg-gradient-to-r from-purple-600 to-violet-400"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
        <div className="text-right text-xs text-purple-400 mt-0.5">{xpPercent.toFixed(1)}%</div>
      </div>

      <div className="relative grid grid-cols-1 gap-2">
        {Object.entries(state.stats).map(([key, value]) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-base w-6">{STAT_EMOJIS[key]}</span>
            <span className="text-xs text-gray-300 w-14">{STAT_LABELS[key]}</span>
            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full stat-bar"
                style={{
                  width: `${Math.min(100, value)}%`,
                  backgroundColor: STAT_COLORS[key],
                }}
              />
            </div>
            <span className="text-xs font-bold text-gray-200 w-6 text-right">{value}</span>
          </div>
        ))}
      </div>

      <div className="relative mt-4 pt-4 border-t border-gray-700/50 grid grid-cols-4 gap-1 text-center">
        <div>
          <div className="text-base font-bold text-yellow-400">{state.totalXpEarned.toLocaleString()}</div>
          <div className="text-xs text-gray-500">총 XP</div>
        </div>
        <div>
          <div className="text-base font-bold text-green-400">{state.questsCompleted}</div>
          <div className="text-xs text-gray-500">완료</div>
        </div>
        <div>
          <div className="text-base font-bold text-orange-400">{state.streak}</div>
          <div className="text-xs text-gray-500">스트릭</div>
        </div>
        <div>
          <div className="text-base font-bold text-purple-400">{unlockedAchievements}</div>
          <div className="text-xs text-gray-500">업적</div>
        </div>
      </div>

      {unlockedSkills > 0 && (
        <div className="relative mt-3 pt-3 border-t border-gray-700/50">
          <div className="text-xs text-gray-500 mb-2">해금된 스킬</div>
          <div className="flex flex-wrap gap-1">
            {state.skills.filter(s => s.unlockedAt !== null).map(skill => (
              <span key={skill.id} className="text-base" title={skill.name + ': ' + skill.description}>
                {skill.icon}
              </span>
            ))}
          </div>
        </div>
      )}

      {availableBoss && (
        <div className="relative mt-3 pt-3 border-t border-red-900/40">
          <button
            onClick={onBossClick}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-red-800/60 bg-red-950/30 hover:bg-red-900/40 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{availableBoss.emoji}</span>
              <div className="text-left">
                <div className="text-xs text-red-400 uppercase tracking-wider">보스 출현!</div>
                <div className="text-sm font-bold text-white">{availableBoss.name}</div>
              </div>
            </div>
            <span className="text-xs bg-red-700 group-hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold transition-colors">
              도전하기 ⚔️
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
