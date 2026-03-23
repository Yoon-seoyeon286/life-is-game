import { useState, useEffect } from 'react';

interface Props {
  onComplete: (minutes: number) => void;
  totalMinutes: number;
}

export default function PomodoroTimer({ onComplete, totalMinutes }: Props) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [originalMinutes, setOriginalMinutes] = useState(25);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(interval);
          setIsRunning(false);
          onComplete(originalMinutes);
          setMinutes(originalMinutes);
          setSeconds(0);
        } else {
          setMinutes(minutes - 1);
          setSeconds(59);
        }
      } else {
        setSeconds(seconds - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, minutes, seconds, onComplete, originalMinutes]);

  function handleStart() {
    setOriginalMinutes(minutes);
    setIsRunning(true);
  }

  function handlePause() {
    setIsRunning(false);
  }

  function handleReset() {
    setIsRunning(false);
    setMinutes(originalMinutes);
    setSeconds(0);
  }

  function handleSetMinutes(value: number) {
    if (!isRunning) {
      setMinutes(value);
      setOriginalMinutes(value);
    }
  }

  const progress = ((originalMinutes * 60 - (minutes * 60 + seconds)) / (originalMinutes * 60)) * 100;

  return (
    <div className="rounded-2xl border border-purple-900/40 bg-[#13111c] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-base">⏱️ 포모도로 타이머</h3>
        <span className="text-xs text-gray-500">{totalMinutes}분 집중</span>
      </div>

      <div className="text-center">
        <div className="relative inline-block mb-4">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#1e1a2e"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#9333ea"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-3xl font-bold text-white">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          </div>
        </div>

        {!isRunning && minutes === originalMinutes && seconds === 0 && (
          <div className="flex gap-2 justify-center mb-3">
            {[15, 25, 45, 60].map(m => (
              <button
                key={m}
                onClick={() => handleSetMinutes(m)}
                className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                  minutes === m
                    ? 'bg-purple-700 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                {m}분
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 justify-center">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              시작
            </button>
          ) : (
            <>
              <button
                onClick={handlePause}
                className="bg-yellow-700 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                일시정지
              </button>
              <button
                onClick={handleReset}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                초기화
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 p-3 rounded-xl bg-purple-900/15 border border-purple-900/30">
        <p className="text-xs text-purple-400 text-center">
          집중한 시간만큼 XP를 획득합니다 (1분 = 2XP)
        </p>
      </div>
    </div>
  );
}
