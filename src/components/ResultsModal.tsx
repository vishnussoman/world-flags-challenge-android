import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, Award, Zap, CheckCircle2, XCircle, ChevronRight, BookOpen } from 'lucide-react';
import { GameMode, GameStats, Country } from '../types/flags';
import { FlagSvg } from './FlagSvg';

interface ResultsModalProps {
  mode: GameMode;
  stats: GameStats;
  isNewHighScore: boolean;
  onRestart: () => void;
  onQuitToMenu: () => void;
  onInspectCountry: (country: Country) => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  mode,
  stats,
  isNewHighScore,
  onRestart,
  onQuitToMenu,
  onInspectCountry,
}) => {
  const accuracy = stats.totalAnswered > 0 ? Math.round((stats.correctCount / stats.totalAnswered) * 100) : 0;

  useEffect(() => {
    // Launch celebratory confetti if high accuracy or new high score
    if (accuracy >= 70 || isNewHighScore) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6'],
        });
      } catch {
        // Safe confetti trigger
      }
    }
  }, [accuracy, isNewHighScore]);

  const getModeTitle = () => {
    switch (mode) {
      case 'blitz':
        return 'Blitz Rush Complete!';
      case 'survival':
        return stats.livesRemaining === 0 ? 'Survival Run Over' : 'Victory!';
      default:
        return accuracy >= 80 ? 'Master Vexillologist!' : accuracy >= 50 ? 'Well Done!' : 'Challenge Completed';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl animate-pop text-slate-100 my-8">
        {/* Header */}
        <div className="text-center mb-6">
          {isNewHighScore && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
              <Award className="w-4 h-4 text-amber-400" />
              New Personal Best!
            </div>
          )}
          <h2 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight text-white mb-1">
            {getModeTitle()}
          </h2>
          <p className="text-sm text-slate-400">
            {mode === 'blitz'
              ? '60 seconds of high-speed flag recognition'
              : mode === 'survival'
              ? `You survived ${stats.totalAnswered} flag rounds`
              : 'Round summary & flag knowledge review'}
          </p>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-0.5">Final Score</span>
            <span className="font-mono text-xl md:text-2xl font-bold text-emerald-400 tabular-nums">
              {stats.score.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-0.5">Accuracy</span>
            <span className="font-mono text-xl md:text-2xl font-bold text-blue-400 tabular-nums">
              {accuracy}%
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-0.5">Max Streak</span>
            <span className="font-mono text-xl md:text-2xl font-bold text-amber-400 tabular-nums flex items-center justify-center gap-1">
              <Zap className="w-4 h-4 fill-amber-400" />
              {stats.maxStreak}
            </span>
          </div>
        </div>

        {/* Flag History Review List */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Flag Review ({stats.correctCount}/{stats.totalAnswered} Correct)
            </h3>
            <span className="text-xs text-slate-500">Tap a country to view dossier</span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-800/40">
            {stats.history.map((item, index) => (
              <button
                key={index}
                onClick={() => onInspectCountry(item.country)}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-950/40 hover:bg-slate-800/60 transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6.5 shrink-0">
                    <FlagSvg code={item.country.code} className="w-full h-full shadow-sm" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-200 group-hover:text-white">
                      {item.country.name}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      {item.country.capital} · {item.country.continent}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.isCorrect ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-400">
                      <XCircle className="w-4 h-4" />
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onRestart}
            className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-98 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <button
            onClick={onQuitToMenu}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-200 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
