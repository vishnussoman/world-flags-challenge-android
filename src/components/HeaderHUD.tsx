import React from 'react';
import { Volume2, VolumeX, Pause, Heart, Flame, Clock } from 'lucide-react';
import { GameMode } from '../types/flags';

interface HeaderHUDProps {
  mode: GameMode;
  score: number;
  streak: number;
  lives?: number;
  timeLeft?: number;
  totalTime?: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  mode,
  score,
  streak,
  lives = 3,
  timeLeft = 60,
  totalTime = 60,
  currentQuestionIndex,
  totalQuestions,
  isMuted,
  onToggleMute,
  onPause,
}) => {
  const multiplier = streak >= 7 ? '3x' : streak >= 4 ? '2x' : streak >= 2 ? '1.5x' : '';
  const classicProgressPct =
    totalQuestions > 0 ? Math.min(100, ((currentQuestionIndex + 1) / totalQuestions) * 100) : 0;
  const blitzProgressPct = Math.max(0, (timeLeft / totalTime) * 100);

  return (
    <header className="relative w-full border-b border-slate-800/80 bg-slate-950/95 z-20">
      {/* Top slim progress bar for Classic & Blitz */}
      {mode === 'blitz' && (
        <div className="w-full h-1 bg-slate-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ease-linear ${
              timeLeft <= 10 ? 'bg-rose-500' : timeLeft <= 25 ? 'bg-amber-400' : 'bg-emerald-500'
            }`}
            style={{ width: `${blitzProgressPct}%` }}
          />
        </div>
      )}
      {mode === 'classic' && (
        <div className="w-full h-1 bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 ease-out"
            style={{ width: `${classicProgressPct}%` }}
          />
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2 text-slate-100">
        {/* Left: Mode Progress / Timer / Hearts */}
        <div className="flex items-center min-w-[76px] shrink-0">
          {mode === 'blitz' ? (
            <div className="flex items-center gap-1.5">
              <Clock className={`w-4 h-4 shrink-0 ${timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`} />
              <span className={`font-mono text-base font-bold tabular-nums ${timeLeft <= 10 ? 'text-rose-400' : 'text-slate-100'}`}>
                {Math.max(0, timeLeft)}s
              </span>
            </div>
          ) : mode === 'survival' ? (
            <div className="flex items-center gap-1" aria-label={`${lives} lives remaining`}>
              {[1, 2, 3].map((heartIndex) => (
                <Heart
                  key={heartIndex}
                  className={`w-4.5 h-4.5 transition-all duration-200 ${
                    heartIndex <= lives
                      ? 'text-rose-500 fill-rose-500 scale-100'
                      : 'text-slate-700 scale-90'
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-baseline gap-1 font-mono text-sm font-semibold tabular-nums">
              <span className="text-emerald-400 font-bold">{currentQuestionIndex + 1}</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400">{totalQuestions}</span>
            </div>
          )}
        </div>

        {/* Center: Clean unboxed Score + inline Streak indicator */}
        <div className="flex items-center justify-center gap-2 min-w-0">
          <span className="font-mono text-lg sm:text-xl font-bold tabular-nums text-white tracking-tight">
            {score.toLocaleString()}
          </span>
          {streak >= 2 && (
            <span className="inline-flex items-center gap-0.5 text-xs font-mono font-bold text-amber-400 tabular-nums animate-pop whitespace-nowrap">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{streak}</span>
              <span className="text-amber-300/80 text-[11px]">({multiplier})</span>
            </span>
          )}
        </div>

        {/* Right: 44x44px Touch Targets for Audio & Pause */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="w-11 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={onPause}
            title="Pause Game"
            className="w-11 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            aria-label="Pause Game"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
