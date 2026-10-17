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
  // Compute multiplier
  const multiplier = streak >= 7 ? '3.0x' : streak >= 4 ? '2.0x' : streak >= 2 ? '1.5x' : '1.0x';

  return (
    <header className="w-full max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3 text-slate-100 z-20">
      {/* Left perimeter: Mode & Progress / Timer */}
      <div className="flex items-center gap-3">
        {mode === 'blitz' ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 border border-slate-700/70 rounded-lg">
            <Clock className={`w-4 h-4 ${timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`} />
            <span className={`font-mono text-sm font-bold tabular-nums ${timeLeft <= 10 ? 'text-rose-400' : 'text-slate-100'}`}>
              {Math.max(0, timeLeft)}s
            </span>
          </div>
        ) : mode === 'survival' ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 border border-slate-700/70 rounded-lg">
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((heartIndex) => (
                <Heart
                  key={heartIndex}
                  className={`w-4 h-4 transition-all duration-300 ${
                    heartIndex <= lives
                      ? 'text-rose-500 fill-rose-500 scale-100'
                      : 'text-slate-600 scale-90 opacity-40'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 border border-slate-700/70 rounded-lg font-mono text-xs font-semibold text-slate-300">
            <span>Round</span>
            <span className="text-emerald-400 tabular-nums font-bold">
              {currentQuestionIndex + 1}
            </span>
            <span className="text-slate-500">/</span>
            <span className="tabular-nums">{totalQuestions}</span>
          </div>
        )}

        {/* Streak indicator with multiplier */}
        {streak >= 2 && (
          <div className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-xs font-bold animate-pop">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-bounce" />
            <span className="font-mono tabular-nums">{streak} Streak</span>
            <span className="text-amber-300 font-mono text-[10px]">({multiplier})</span>
          </div>
        )}
      </div>

      {/* Center Score readout */}
      <div className="flex items-baseline gap-1.5 px-4 py-1 bg-slate-900/90 border border-slate-800 rounded-lg">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Score</span>
        <span className="font-mono text-lg md:text-xl font-bold tabular-nums text-emerald-400">
          {score.toLocaleString()}
        </span>
      </div>

      {/* Right controls: Mute & Pause */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-white transition-colors cursor-pointer"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        <button
          onClick={onPause}
          title="Pause Game (Esc)"
          className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-white transition-colors cursor-pointer"
          aria-label="Pause Game"
        >
          <Pause className="w-4 h-4" />
        </button>
      </div>

      {/* Blitz Mode Progress Bar */}
      {mode === 'blitz' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ease-linear ${
              timeLeft <= 10 ? 'bg-rose-500' : timeLeft <= 25 ? 'bg-amber-400' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.max(0, (timeLeft / totalTime) * 100)}%` }}
          />
        </div>
      )}
    </header>
  );
};
