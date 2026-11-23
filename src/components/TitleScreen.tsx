import React, { useEffect, useState } from 'react';
import { Play, Zap, Shield, BookOpen, Volume2, VolumeX, Award, Settings, Calendar, Flame, CheckCircle2 } from 'lucide-react';
import { GameMode, Continent, HighScores } from '../types/flags';
import { COUNTRIES } from '../data/countries';
import { getLocalDateKey, DAILY_QUESTION_COUNT } from '../utils/daily';
import { FlagSvg } from './FlagSvg';

interface TitleScreenProps {
  onStartGame: (mode: GameMode, continent: Continent | 'All') => void;
  onStartDaily: () => void;
  onOpenAtlas: () => void;
  onOpenSettings: () => void;
  highScores: HighScores;
  isMuted: boolean;
  onToggleMute: () => void;
  isModalOpen?: boolean;
}

const SHOWCASE_CODES = [
  'JP', 'BR', 'ZA', 'FR', 'CA', 'IN', 'GR', 'EG', 'SE', 'AU',
  'JM', 'IS', 'MX', 'KR', 'KE', 'AR', 'NO', 'VN', 'SC', 'NP',
  'CH', 'NZ', 'TZ', 'PE', 'GE', 'GH', 'FI', 'UY', 'BT', 'CR'
];

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onStartDaily,
  onOpenAtlas,
  onOpenSettings,
  highScores,
  isMuted,
  onToggleMute,
  isModalOpen = false,
}) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [selectedContinent, setSelectedContinent] = useState<Continent | 'All'>('All');
  const [activeFlagIdx, setActiveFlagIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFlagIdx((prev) => (prev + 1) % SHOWCASE_CODES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut: Space or Enter starts game on desktop (disabled while modal is open)
  useEffect(() => {
    if (isModalOpen) return;
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
  }, [isModalOpen, selectedMode, selectedContinent, onStartGame, onOpenAtlas]);

  const continents: (Continent | 'All')[] = ['All', 'Europe', 'Asia', 'Africa', 'Americas', 'Oceania'];
  const activeCode = SHOWCASE_CODES[activeFlagIdx];
  const activeCountry = COUNTRIES.find((c) => c.code === activeCode);
  const learnedCount = highScores.flagsLearned.length;
  const totalCountries = COUNTRIES.length;
  const masteryPct = Math.round((learnedCount / totalCountries) * 100);

  const todayKey = getLocalDateKey();
  const completedDailyToday = highScores.lastDailyDate === todayKey;

  const modes: {
    id: GameMode;
    label: string;
    shortRule: string;
    description: string;
    best: number;
    accentText: string;
    activeClass: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'classic',
      label: 'Classic',
      shortRule: '15 Flags',
      description: 'Trivia facts & streak multipliers.',
      best: highScores.classic,
      accentText: 'text-emerald-400',
      activeClass: 'bg-emerald-950/50 border-emerald-500 text-white shadow-lg shadow-emerald-950/40',
      icon: <Play className="w-4 h-4 text-emerald-400 fill-emerald-400 shrink-0" />,
    },
    {
      id: 'blitz',
      label: '60s Blitz',
      shortRule: 'Timed',
      description: 'Rapid clock rush with time bonuses.',
      best: highScores.blitz,
      accentText: 'text-amber-400',
      activeClass: 'bg-amber-950/50 border-amber-500 text-white shadow-lg shadow-amber-950/40',
      icon: <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />,
    },
    {
      id: 'survival',
      label: 'Survival',
      shortRule: '3 Lives',
      description: 'Endurance run until hearts run out.',
      best: highScores.survival,
      accentText: 'text-rose-400',
      activeClass: 'bg-rose-950/50 border-rose-500 text-white shadow-lg shadow-rose-950/40',
      icon: <Shield className="w-4 h-4 text-rose-400 fill-rose-400 shrink-0" />,
    },
  ];

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between px-4 pt-3 pb-20 md:px-8 md:pt-6 md:pb-24 bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Subtle ambient depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(16,185,129,0.16),rgba(2,6,23,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Top Bar: Mastery Progress + 44px Audio & Settings Controls */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between gap-3">
        <button
          onClick={onOpenAtlas}
          className="flex flex-col items-start gap-1 py-1 text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
          aria-label={`Flags mastered: ${learnedCount} of ${totalCountries}. Open Flag Atlas.`}
        >
          <div className="flex items-baseline gap-1.5 text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
            <span className="font-mono font-bold text-emerald-400 tabular-nums">
              {learnedCount}/{totalCountries}
            </span>
            <span>Mastered</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono tabular-nums text-slate-500">{masteryPct}%</span>
          </div>
          <div className="w-28 h-1 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.max(4, masteryPct)}%` }}
            />
          </div>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleMute}
            className="w-11 h-11 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 transition-colors cursor-pointer active:scale-95"
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>

          <button
            onClick={onOpenSettings}
            className="w-11 h-11 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer active:scale-95"
            aria-label="Settings and Privacy"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Centerpiece */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center my-auto py-2 md:py-5">
        {/* Flag Showcase */}
        <div className="flex flex-col items-center mb-2.5 md:mb-4">
          <div className="w-32 h-22 sm:w-44 sm:h-28 md:w-48 md:h-32 rounded-2xl overflow-hidden shadow-2xl border border-emerald-500/35 p-1 bg-slate-900/90">
            <FlagSvg
              code={activeCode}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <span className="mt-1 text-xs text-slate-400 font-medium tracking-wide">
            {activeCountry ? activeCountry.name : activeCode}
            <span aria-hidden="true" className="mx-1.5 text-slate-600">·</span>
            <span className="font-mono text-emerald-400/90">{activeCode}</span>
          </span>
        </div>

        {/* Title Lockup */}
        <div className="mb-1 w-full px-1">
          <svg viewBox="0 0 760 58" className="w-full max-w-xl h-auto mx-auto block font-display overflow-visible">
            <defs>
              <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#E2E8F0" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
            <text
              x="380"
              y="43"
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

        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-3.5 md:mb-5 text-balance">
          All <strong className="text-slate-200 font-semibold">196 sovereign nations</strong> across 5 continents.
        </p>

        {/* Daily Flag Challenge Strip (Retention Habit Driver) */}
        <button
          onClick={onStartDaily}
          className={`w-full mb-3 sm:mb-4 px-4 py-3 rounded-2xl border flex items-center justify-between gap-3 text-left transition-all duration-150 cursor-pointer active:scale-[0.99] ${
            completedDailyToday
              ? 'bg-slate-900/80 border-emerald-500/40 hover:border-emerald-500/70'
              : 'bg-amber-950/35 border-amber-500/50 hover:border-amber-400 shadow-lg shadow-amber-950/30'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                completedDailyToday ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
              }`}
            >
              {completedDailyToday ? <CheckCircle2 className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-white truncate">
                  Daily Challenge
                </span>
                {highScores.dailyStreak > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-xs font-mono font-bold text-amber-400 tabular-nums shrink-0">
                    <Flame className="w-3.5 h-3.5 fill-amber-400" />
                    {highScores.dailyStreak}d
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate">
                {completedDailyToday
                  ? `Completed today · ${highScores.lastDailyCorrect}/${DAILY_QUESTION_COUNT} correct`
                  : `Today's ${DAILY_QUESTION_COUNT} flags · Keep your streak alive`}
              </p>
            </div>
          </div>

          <span
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 whitespace-nowrap ${
              completedDailyToday
                ? 'bg-slate-800 text-slate-200'
                : 'bg-amber-500 text-slate-950'
            }`}
          >
            {completedDailyToday ? 'Replay' : 'Play'}
          </span>
        </button>

        {/* Compact 3-Column Mode Selector */}
        <div className="w-full grid grid-cols-3 gap-2 sm:gap-3 mb-3.5 md:mb-5 text-left">
          {modes.map((m) => {
            const isActive = selectedMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMode(m.id)}
                className={`p-3 sm:p-4 rounded-2xl border transition-all duration-150 cursor-pointer active:scale-[0.98] flex flex-col justify-between min-h-[92px] sm:min-h-[114px] ${
                  isActive
                    ? m.activeClass
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {m.icon}
                    <span className="font-bold text-sm sm:text-base text-white truncate">
                      {m.label}
                    </span>
                  </div>
                  <span className="text-[11px] sm:text-xs text-slate-400 block">
                    {m.shortRule}
                  </span>
                  <p className="hidden sm:block text-xs text-slate-400 mt-1 leading-snug">
                    {m.description}
                  </p>
                </div>

                <div className={`mt-1.5 pt-1.5 border-t border-slate-800/70 text-[11px] font-mono tabular-nums flex items-center gap-1 ${m.accentText}`}>
                  <Award className="w-3 h-3 shrink-0" />
                  <span className="truncate">{m.best.toLocaleString()}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Region Filter Segmented Control */}
        <div className="w-full mb-4 md:mb-6">
          <div className="flex items-center sm:justify-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-xl overflow-x-auto no-scrollbar max-w-xl mx-auto">
            {continents.map((continent) => (
              <button
                key={continent}
                onClick={() => setSelectedContinent(continent)}
                className={`min-h-[40px] px-3.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedContinent === continent
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {continent === 'All' ? 'All World' : continent}
              </button>
            ))}
          </div>
        </div>

        {/* Primary CTA & Secondary Atlas Action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 w-full max-w-md">
          <button
            onClick={() => onStartGame(selectedMode, selectedContinent)}
            className="w-full min-h-[52px] py-3.5 px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base sm:text-lg rounded-xl flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-950/60 transition-all duration-150 active:scale-[0.98] cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Start Challenge</span>
          </button>

          <button
            onClick={onOpenAtlas}
            className="w-full sm:w-auto min-h-[48px] py-3 px-5 bg-slate-900 hover:bg-slate-800 border border-slate-700/90 text-slate-200 font-semibold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] cursor-pointer whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Flag Atlas</span>
          </button>
        </div>
      </div>

      <div className="h-1" aria-hidden="true" />
    </div>
  );
};
