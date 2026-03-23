import { useEffect } from 'react';

interface Props {
  level: number;
  title: string;
  onDone: () => void;
}

function playLevelUpSound() {
  try {
    const ctx = new AudioContext();
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.3);
    });
  } catch {
    // 사운드 지원 안 되는 환경 무시
  }
}

export default function LevelUpOverlay({ level, title, onDone }: Props) {
  useEffect(() => {
    playLevelUpSound();
    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onDone}
    >
      <div className="text-center fade-in">
        <div className="text-7xl mb-4" style={{ animation: 'levelUp 0.6s ease-in-out infinite alternate' }}>
          ⚡
        </div>
        <div className="text-purple-400 text-sm uppercase tracking-[0.3em] mb-2">Level Up!</div>
        <div className="text-white text-6xl font-black mb-3">Lv.{level}</div>
        <div
          className="text-2xl font-bold px-6 py-2 rounded-full border"
          style={{ color: '#c4b5fd', borderColor: '#7c3aed', background: 'rgba(124,58,237,0.2)' }}
        >
          [{title}]
        </div>
        <div className="text-gray-500 text-xs mt-6">화면을 탭해서 계속</div>
      </div>

      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute pointer-events-none text-xl"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `xpGain ${1 + Math.random()}s ease-out forwards`,
            animationDelay: `${Math.random() * 0.5}s`,
            opacity: 0,
          }}
        >
          {['⭐', '✨', '💫', '🌟'][Math.floor(Math.random() * 4)]}
        </div>
      ))}
    </div>
  );
}
