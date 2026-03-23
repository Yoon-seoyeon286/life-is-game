import { useState } from 'react';
import type { Boss, CharacterState } from '../types';
import { calcBossSuccessRate, STAT_LABELS, STAT_EMOJIS } from '../gameLogic';

interface Props {
  boss: Boss;
  state: CharacterState;
  onChallenge: (bossId: string) => void;
  onClose: () => void;
}

function playBattleSound(won: boolean) {
  try {
    const ctx = new AudioContext();
    if (won) {
      const notes = [523, 659, 784, 1047, 1319];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.25);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.3);
      });
    } else {
      const notes = [300, 250, 200];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.35);
      });
    }
  } catch { /* ignore */ }
}

export default function BossModal({ boss, state, onChallenge, onClose }: Props) {
  const [phase, setPhase] = useState<'info' | 'battle' | 'result'>('info');
  const [won, setWon] = useState<boolean | null>(null);

  const successRate = calcBossSuccessRate(state, boss);

  function handleChallenge() {
    setPhase('battle');
    setTimeout(() => {
      const result = Math.random() * 100 < successRate;
      setWon(result);
      playBattleSound(result);
      setPhase('result');
      onChallenge(boss.id);
    }, 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.88)' }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-red-900/50 bg-[#13111c] shadow-2xl overflow-hidden fade-in">

        {phase === 'info' && (
          <>
            <div className="relative p-6 text-center border-b border-red-900/30"
              style={{ background: 'linear-gradient(135deg, #1a0a0a 0%, #1a1628 100%)' }}>
              <div className="text-7xl mb-3 animate-pulse">{boss.emoji}</div>
              <div className="text-xs text-red-400 uppercase tracking-widest mb-1">Boss</div>
              <h2 className="text-xl font-black text-white mb-1">{boss.name}</h2>
              <p className="text-xs text-gray-500">[{boss.title}]</p>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-300 leading-relaxed text-center">{boss.description}</p>

              <div className="rounded-xl bg-gray-900/60 border border-gray-800/50 p-3">
                <div className="text-xs text-gray-500 mb-2">약점 스탯</div>
                <div className="flex gap-2 flex-wrap">
                  {boss.weakStats.map(s => (
                    <span key={s} className="text-xs bg-red-900/40 text-red-300 border border-red-800/40 px-2 py-1 rounded-lg">
                      {STAT_EMOJIS[s]} {STAT_LABELS[s]} {state.stats[s]}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-gray-900/60 border border-gray-800/50 p-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                  <span>토벌 성공 확률</span>
                  <span className={successRate >= 60 ? 'text-green-400' : successRate >= 35 ? 'text-yellow-400' : 'text-red-400'}>
                    {successRate}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${successRate}%`,
                      backgroundColor: successRate >= 60 ? '#10b981' : successRate >= 35 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1.5">
                  {successRate < 35 ? '⚠️ 스탯이 부족합니다. 더 성장 후 도전하세요.' :
                   successRate < 60 ? '⚡ 도전 가능하지만 위험합니다.' :
                   '✅ 충분한 전력을 갖췄습니다!'}
                </p>
              </div>

              <div className="text-center text-xs text-yellow-500">
                승리 시 +{boss.xpReward.toLocaleString()} XP · [{boss.specialTitle}] 칭호
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onClose}
                  className="py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm hover:bg-gray-800 transition-colors"
                >
                  나중에
                </button>
                <button
                  onClick={handleChallenge}
                  className="py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white text-sm font-bold transition-colors"
                >
                  도전하기!
                </button>
              </div>
            </div>
          </>
        )}

        {phase === 'battle' && (
          <div className="p-12 text-center">
            <div className="text-7xl mb-6" style={{ animation: 'levelUp 0.4s ease-in-out infinite alternate' }}>
              {boss.emoji}
            </div>
            <div className="text-white text-lg font-bold mb-2">전투 중...</div>
            <div className="flex justify-center gap-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 bg-red-500 rounded-full"
                  style={{ animation: `xpGain 0.8s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {phase === 'result' && (
          <div className="p-8 text-center">
            {won ? (
              <>
                <div className="text-6xl mb-4">🏆</div>
                <div className="text-green-400 text-xs uppercase tracking-widest mb-2">Victory!</div>
                <h3 className="text-2xl font-black text-white mb-2">토벌 성공!</h3>
                <p className="text-gray-400 text-sm mb-4">
                  {boss.name}을 격파했습니다!
                </p>
                <div className="rounded-xl bg-yellow-900/20 border border-yellow-800/30 p-3 mb-5 space-y-1">
                  <div className="text-yellow-400 font-bold">+{boss.xpReward.toLocaleString()} XP</div>
                  <div className="text-purple-300 text-sm">[{boss.specialTitle}] 칭호 획득</div>
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">💔</div>
                <div className="text-red-400 text-xs uppercase tracking-widest mb-2">Defeat...</div>
                <h3 className="text-2xl font-black text-white mb-2">토벌 실패</h3>
                <p className="text-gray-400 text-sm mb-4">
                  {boss.name}에게 패배했습니다.<br />더 강해져서 다시 도전하세요!
                </p>
                <div className="rounded-xl bg-red-900/20 border border-red-800/30 p-3 mb-5">
                  <div className="text-red-400 text-sm">스탯 -2 패널티</div>
                </div>
              </>
            )}
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-sm font-bold transition-colors"
            >
              확인
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
