import React, { useEffect, useState } from 'react';
import { Play, Zap, Shield, BookOpen, Volume2, VolumeX, Globe2, Award } from 'lucide-react';
import { GameMode, Continent, HighScores } from '../types/flags';
import { FlagSvg } from './FlagSvg';

interface TitleScreenProps {
  onStartGame: (mode: GameMode, continent: Continent | 'All') => void;
  onOpenAtlas: () => void;
  highScores: HighScores;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenAtlas,
  highScores,
  isMuted,
  onToggleMute,
}) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [selectedContinent, setSelectedContinent] = useState<Continent | 'All'>('All');

  // Showcase flags rotating smoothly across all continents
  const showcaseCodes = [
    'JP', 'BR', 'ZA', 'FR', 'CA', 'IN', 'GR', 'EG', 'SE', 'AU',
    'JM', 'IS', 'MX', 'KR', 'KE', 'AR', 'NO', 'VN', 'SC', 'NP',
    'CH', 'NZ', 'TZ', 'PE', 'GE', 'GH', 'FI', 'UY', 'BT', 'CR'
  ];
  const [activeFlagIdx, setActiveFlagIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFlagIdx((prev) => (prev + 1) % showcaseCodes.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [showcaseCodes.length]);

  // Keyboard shortcut: Space or Enter starts game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        if (selectedMode === 'atlas') {
          onOpenAtlas();
        } else {
          onStartGame(selectedMode, selectedContinent);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMode, selectedContinent, onStartGame, onOpenAtlas]);

  const continents: (Continent | 'All')[] = ['All', 'Europe', 'Asia', 'Africa', 'Americas', 'Oceania'];

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between p-4 md:p-8 bg-slate-950 text-slate-100 overflow-hidden">
      {/* Background ambient gradient and subtle world map grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.15),rgba(2,6,23,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Top Bar: Clean audio toggle and High score overview */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs uppercase tracking-widest font-mono text-slate-400 font-semibold">
            World Flags Challenge · Vexillology Arena
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMute}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? 'Muted' : 'Sound On'}</span>
          </button>
        </div>
      </div>

      {/* Hero Centerpiece: Bespoke Title Lockup & Showcase */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center my-auto py-6">
        {/* Animated Flag Centerpiece Showcase */}
        <div className="relative mb-6">
          <div className="w-40 h-26 md:w-56 md:h-36 rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-500/40 p-1 bg-slate-900/80 transition-all duration-700 ease-in-out">
            <FlagSvg
              code={showcaseCodes[activeFlagIdx]}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-900 border border-emerald-500/40 text-[10px] font-mono text-emerald-400 uppercase tracking-widest shadow-md">
            {showcaseCodes[activeFlagIdx]}
          </div>
        </div>

        {/* Bespoke Inline SVG Title Lockup */}
        <div className="mb-3 w-full px-2">
          <svg viewBox="0 0 760 64" className="w-full max-w-xl h-auto mx-auto block font-display overflow-visible">
            <defs>
              <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#E2E8F0" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
            <text
              x="380"
              y="46"
              textAnchor="middle"
              fill="url(#titleGrad)"
              fontSize="38"
              fontWeight="900"
              letterSpacing="1.5"
            >
              WORLD FLAGS CHALLENGE
            </text>
          </svg>
        </div>

        <p className="text-sm md:text-base text-slate-400 max-w-lg mx-auto mb-8 font-normal">
          Featuring all <strong>196 sovereign nations</strong> across 5 continents. Test your recognition speed, build unshakeable streaks, and explore flag history.
        </p>

        {/* Game Mode Selector Cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-left">
          {/* Mode 1: Classic */}
          <button
            onClick={() => setSelectedMode('classic')}
            className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
              selectedMode === 'classic'
                ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-base text-white flex items-center gap-1.5">
                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                Classic Quiz
              </span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                15 Qs
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Standard recognition challenge with trivia facts & combo multipliers.
            </p>
            <div className="text-[11px] font-mono text-emerald-400/90 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              <span>Best: {highScores.classic.toLocaleString()}</span>
            </div>
          </button>

          {/* Mode 2: 60s Blitz */}
          <button
            onClick={() => setSelectedMode('blitz')}
            className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
              selectedMode === 'blitz'
                ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-950/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-base text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                60s Blitz Rush
              </span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                Timed
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Rapid-fire clock rush. Correct streaks reward bonus time!
            </p>
            <div className="text-[11px] font-mono text-amber-400/90 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              <span>Best: {highScores.blitz.toLocaleString()}</span>
            </div>
          </button>

          {/* Mode 3: Survival */}
          <button
            onClick={() => setSelectedMode('survival')}
            className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
              selectedMode === 'survival'
                ? 'bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-950/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-base text-white flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-rose-400 fill-rose-400" />
                Streak Survival
              </span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                3 Lives
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Sudden death endurance. One mistake burns a heart!
            </p>
            <div className="text-[11px] font-mono text-rose-400/90 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              <span>Best: {highScores.survival.toLocaleString()}</span>
            </div>
          </button>
        </div>

        {/* Region / Continent Filter Strip */}
        <div className="w-full mb-6">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2 text-center">
            Select Territory Region
          </span>
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-xl max-w-xl mx-auto">
            {continents.map((continent) => (
              <button
                key={continent}
                onClick={() => setSelectedContinent(continent)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedContinent === continent
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {continent === 'All' ? 'World (All)' : continent}
              </button>
            ))}
          </div>
        </div>

        {/* Primary CTA & Atlas Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
          <button
            onClick={() => onStartGame(selectedMode, selectedContinent)}
            className="w-full py-4 px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-950/60 transition-all active:scale-98 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Start Challenge</span>
          </button>

          <button
            onClick={onOpenAtlas}
            className="w-full sm:w-auto py-4 px-6 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-base rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Flag Atlas & Study</span>
          </button>
        </div>
      </div>

      {/* Flat Control Hint Line */}
      <div className="relative z-10 w-full max-w-md mx-auto text-center">
        <p className="text-xs text-slate-500 font-mono">
          Enter or Space Start · 1-4 Select · Esc Pause
        </p>
      </div>
    </div>
  );
};
