import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Home,
  Award,
  Zap,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Film,
  Heart,
  Share2,
  Target,
  Flame,
  Check,
} from 'lucide-react';
import { GameMode, GameStats, Country } from '../types/flags';
import { formatShortDate } from '../utils/daily';
import { FlagSvg } from './FlagSvg';

interface ResultsModalProps {
  mode: GameMode;
  stats: GameStats;
  isNewHighScore: boolean;
  dailyStreak: number;
  onRestart: () => void;
  onQuitToMenu: () => void;
  onInspectCountry: (country: Country) => void;
  onPracticeMissed?: (missedCountries: Country[]) => void;
  canRevive?: boolean;
  onRevive?: () => Promise<boolean>;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  mode,
  stats,
  isNewHighScore,
  dailyStreak,
  onRestart,
  onQuitToMenu,
  onInspectCountry,
  onPracticeMissed,
  canRevive = false,
  onRevive,
}) => {
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<'idle' | 'copied' | 'shared'>('idle');

  const accuracy = stats.totalAnswered > 0 ? Math.round((stats.correctCount / stats.totalAnswered) * 100) : 0;

  // Deduplicated list of missed countries for targeted practice
  const missedCountries = stats.history
    .filter((h) => !h.isCorrect)
    .reduce<Country[]>((acc, item) => {
      if (!acc.some((c) => c.code === item.country.code)) acc.push(item.country);
      return acc;
    }, []);

  useEffect(() => {
    if (accuracy >= 70 || isNewHighScore) {
      try {
        confetti({
          particleCount: 75,
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
      case 'daily':
        return accuracy === 100 ? 'Perfect Daily Run!' : 'Daily Challenge Complete';
      case 'mistakes':
        return accuracy === 100 ? 'Mistakes Mastered!' : 'Practice Complete';
      case 'blitz':
        return 'Blitz Rush Complete!';
      case 'survival':
        return stats.livesRemaining === 0 ? 'Survival Run Over' : 'Victory!';
      default:
        return accuracy >= 80 ? 'Master Vexillologist!' : accuracy >= 50 ? 'Well Done!' : 'Challenge Completed';
    }
  };

  const handleShareScore = async () => {
    const modeLabel =
      mode === 'daily'
        ? `Daily (${formatShortDate()})`
        : mode === 'blitz'
        ? '60s Blitz'
        : mode === 'survival'
        ? 'Survival'
        : mode === 'mistakes'
        ? 'Mistakes Drill'
        : 'Classic Quiz';

    const grid = stats.history
      .slice(0, 15)
      .map((h) => (h.isCorrect ? '🟩' : '🟥'))
      .join('');

    const lines = [
      `🌍 World Flags Challenge — ${modeLabel}`,
      `Score: ${stats.score.toLocaleString()} · ${stats.correctCount}/${stats.totalAnswered} (${accuracy}%)`,
      grid,
    ];

    if (mode === 'daily' && dailyStreak > 0) {
      lines.push(`🔥 ${dailyStreak}-day daily streak`);
    } else if (stats.maxStreak >= 3) {
      lines.push(`⚡ Best streak: ${stats.maxStreak}`);
    }

    const text = lines.join('\n');

    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({
          title: 'World Flags Challenge',
          text,
        });
        setShareFeedback('shared');
        setTimeout(() => setShareFeedback('idle'), 2000);
        return;
      }
    } catch {
      // User dismissed native share sheet or unsupported; fall through to clipboard
    }

    try {
      await navigator.clipboard.writeText(text);
      setShareFeedback('copied');
      setTimeout(() => setShareFeedback('idle'), 2200);
    } catch {
      // Ignore if clipboard unavailable
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl animate-pop text-slate-100 my-auto">
        {/* Header */}
        <div className="text-center mb-5">
          {mode === 'daily' && dailyStreak > 0 ? (
            <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1.5 tracking-wide">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>{dailyStreak}-Day Daily Streak</span>
            </div>
          ) : isNewHighScore ? (
            <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1.5 tracking-wide">
              <Award className="w-4 h-4 text-amber-400" />
              <span>New Personal Best</span>
            </div>
          ) : null}

          <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white mb-1">
            {getModeTitle()}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {mode === 'daily'
              ? `Daily 5-flag challenge · ${formatShortDate()}`
              : mode === 'blitz'
              ? '60 seconds of high-speed flag recognition'
              : mode === 'survival'
              ? `You survived ${stats.totalAnswered} flag rounds`
              : mode === 'mistakes'
              ? 'Focused review of your missed flags'
              : 'Round summary & flag knowledge review'}
          </p>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
            <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Score</span>
            <span className="font-mono text-lg sm:text-2xl font-bold text-emerald-400 tabular-nums">
              {stats.score.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
            <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Accuracy</span>
            <span className="font-mono text-lg sm:text-2xl font-bold text-blue-400 tabular-nums">
              {accuracy}%
            </span>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
            <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Streak</span>
            <span className="font-mono text-lg sm:text-2xl font-bold text-amber-400 tabular-nums flex items-center justify-center gap-1">
              <Zap className="w-4 h-4 fill-amber-400" />
              {stats.maxStreak}
            </span>
          </div>
        </div>

        {/* Flag History Review List */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Flag Review ({stats.correctCount}/{stats.totalAnswered})
            </h3>
            <span className="text-xs text-slate-500">Tap for dossier</span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {stats.history.map((item, index) => (
              <button
                key={index}
                onClick={() => onInspectCountry(item.country)}
                className="w-full min-h-[52px] flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/60 hover:bg-slate-800/70 border border-slate-800/60 transition-colors text-left group cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-6.5 shrink-0">
                    <FlagSvg code={item.country.code} className="w-full h-full shadow-sm" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-slate-200 group-hover:text-white block truncate">
                      {item.country.name}
                    </span>
                    <span className="text-xs text-slate-500 block truncate">
                      {item.country.capital} · {item.country.continent}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Rewarded Ad Revive Option (Survival Mode — max 1 revive per run) */}
        {mode === 'survival' && canRevive && onRevive && (
          <button
            onClick={async () => {
              if (isWatchingAd) return;
              setIsWatchingAd(true);
              try {
                await onRevive();
              } finally {
                setIsWatchingAd(false);
              }
            }}
            disabled={isWatchingAd}
            className="w-full min-h-[48px] mb-2.5 py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <Film className="w-4 h-4 text-slate-950" />
            <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
            <span>{isWatchingAd ? 'Loading Ad...' : 'Watch Ad to Revive (+1 Life)'}</span>
          </button>
        )}

        {/* Practice Missed Flags CTA (P1 Retention Hook) */}
        {missedCountries.length > 0 && onPracticeMissed && (
          <button
            onClick={() => onPracticeMissed(missedCountries)}
            className="w-full min-h-[48px] mb-2.5 py-3 px-4 bg-rose-950/60 hover:bg-rose-950/90 border border-rose-500/40 text-rose-200 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Target className="w-4 h-4 text-rose-400" />
            <span>
              Practice {missedCountries.length} Missed {missedCountries.length === 1 ? 'Flag' : 'Flags'}
            </span>
          </button>
        )}

        {/* Share Score Button (Organic Viral Growth) */}
        <button
          onClick={handleShareScore}
          className="w-full min-h-[46px] mb-2.5 py-2.5 px-4 bg-slate-950/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
        >
          {shareFeedback === 'idle' ? (
            <>
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>Share Score</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">
                {shareFeedback === 'copied' ? 'Score Copied to Clipboard!' : 'Shared!'}
              </span>
            </>
          )}
        </button>

        {/* Primary Restart / Home Actions */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onRestart}
            className="min-h-[48px] py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all duration-150 active:scale-[0.98] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{mode === 'daily' ? 'Replay Daily' : 'Play Again'}</span>
          </button>

          <button
            onClick={onQuitToMenu}
            className="min-h-[48px] py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-200 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
