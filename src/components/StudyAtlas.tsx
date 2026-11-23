import React, { useState, useMemo, useEffect } from 'react';
import { Search, ArrowLeft, RotateCw, MapPin, Globe2, Users, Check, Play, X } from 'lucide-react';
import { Country, Continent } from '../types/flags';
import { COUNTRIES } from '../data/countries';
import { FlagSvg } from './FlagSvg';

interface StudyAtlasProps {
  onBack: () => void;
  onPracticeCountry: (country: Country) => void;
  learnedCodes: string[];
  activeCountry: Country | null;
  onSelectCountry: (country: Country | null) => void;
}

export const StudyAtlas: React.FC<StudyAtlasProps> = ({
  onBack,
  onPracticeCountry,
  learnedCodes,
  activeCountry,
  onSelectCountry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<Continent | 'All'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'flashcards'>('grid');

  // Flashcard mode state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flashcard position whenever filters or search change
  useEffect(() => {
    setCardIndex(0);
    setIsFlipped(false);
  }, [searchQuery, selectedContinent]);

  // Filter countries
  const filteredCountries = useMemo(() => {
    return COUNTRIES.filter((country) => {
      const matchesContinent = selectedContinent === 'All' || country.continent === selectedContinent;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        country.name.toLowerCase().includes(q) ||
        country.capital.toLowerCase().includes(q) ||
        country.code.toLowerCase().includes(q);
      return matchesContinent && matchesSearch;
    });
  }, [searchQuery, selectedContinent]);

  const continents: (Continent | 'All')[] = ['All', 'Europe', 'Asia', 'Africa', 'Americas', 'Oceania'];

  // Safe current flashcard index
  const safeCardIndex = filteredCountries.length > 0 ? Math.min(cardIndex, filteredCountries.length - 1) : 0;
  const currentCard = filteredCountries[safeCardIndex];

  const handleNextCard = () => {
    if (filteredCountries.length === 0) return;
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1) % filteredCountries.length);
  };

  const handlePrevCard = () => {
    if (filteredCountries.length === 0) return;
    setIsFlipped(false);
    setCardIndex((prev) => (prev - 1 + filteredCountries.length) % filteredCountries.length);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 pt-3 pb-24 md:px-8 md:pt-6 flex flex-col">
      {/* Compact Mobile-First Top App Bar (Zero Wrapping Collision) */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onBack}
            className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center shrink-0 transition-colors cursor-pointer active:scale-95"
            aria-label="Back to Menu"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold font-display tracking-tight text-white truncate">
              Flag Atlas
            </h1>
            <p className="text-xs text-slate-400 truncate">
              <span className="font-mono text-emerald-400 tabular-nums">{learnedCodes.length}/{COUNTRIES.length}</span> mastered
            </p>
          </div>
        </div>

        {/* View Mode Segmented Control */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0">
          <button
            onClick={() => {
              setViewMode('grid');
              setIsFlipped(false);
            }}
            className={`min-h-[36px] px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => {
              setViewMode('flashcards');
              setIsFlipped(false);
            }}
            className={`min-h-[36px] px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              viewMode === 'flashcards' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cards
          </button>
        </div>
      </header>

      {/* Controls: Search and Continent Filter Bar */}
      <div className="w-full max-w-6xl mx-auto mb-5 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input (>=44px height) */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search country, capital, or code..."
            className="w-full min-h-[44px] pl-10 pr-10 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Continent Filter Tabs (Horizontal Scrollable Single Line on Mobile) */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/80 border border-slate-800 rounded-xl overflow-x-auto no-scrollbar w-full md:w-auto">
          {continents.map((cont) => (
            <button
              key={cont}
              onClick={() => setSelectedContinent(cont)}
              className={`min-h-[38px] px-3.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedContinent === cont
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cont === 'All' ? 'All World' : cont}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-6xl mx-auto flex-1">
        {viewMode === 'grid' ? (
          filteredCountries.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredCountries.map((country) => {
                const isLearned = learnedCodes.includes(country.code);
                return (
                  <button
                    key={country.code}
                    onClick={() => onSelectCountry(country)}
                    className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-3 flex flex-col text-left transition-all duration-150 cursor-pointer active:scale-[0.98]"
                  >
                    <div className="w-full aspect-[3/2] mb-2.5 overflow-hidden rounded-lg">
                      <FlagSvg
                        code={country.code}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-1 mb-0.5 w-full">
                      <h3 className="font-bold text-sm text-slate-200 group-hover:text-white truncate">
                        {country.name}
                      </h3>
                      {isLearned && (
                        <span title="Mastered in Challenge" className="shrink-0 text-emerald-400">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 truncate w-full mb-2">
                      {country.capital}
                    </p>

                    <div className="mt-auto pt-2 border-t border-slate-800/60 flex items-center justify-between w-full text-[11px] text-slate-500 font-mono">
                      <span>{country.continent}</span>
                      <span className="uppercase">{country.code}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-slate-400 text-sm mb-3">No nations match "{searchQuery}".</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedContinent('All');
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-emerald-400 hover:bg-slate-800 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )
        ) : (
          /* Flashcard Study Mode */
          <div className="flex flex-col items-center justify-center py-4">
            {currentCard ? (
              <div className="w-full max-w-md">
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full min-h-[360px] bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-between cursor-pointer transition-colors duration-200 hover:border-emerald-500/50"
                >
                  {!isFlipped ? (
                    /* Front: Flag Showcase */
                    <div className="flex flex-col items-center justify-center my-auto w-full text-center">
                      <div className="w-60 h-40 sm:w-72 sm:h-48 rounded-xl overflow-hidden shadow-xl mb-6">
                        <FlagSvg code={currentCard.code} hideLabel={true} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        Tap card to reveal country details
                      </span>
                    </div>
                  ) : (
                    /* Back: Detailed Dossier */
                    <div className="flex flex-col justify-between h-full w-full animate-pop text-left">
                      <div>
                        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
                          <div className="min-w-0">
                            <h2 className="text-xl sm:text-2xl font-bold font-display text-white truncate">
                              {currentCard.name}
                            </h2>
                            <span className="text-xs text-emerald-400 font-mono">
                              {currentCard.code} · {currentCard.continent}
                            </span>
                          </div>
                          <div className="w-16 h-10 rounded overflow-hidden shadow shrink-0">
                            <FlagSvg code={currentCard.code} className="w-full h-full object-cover" />
                          </div>
                        </div>

                        <div className="space-y-2 mb-4 text-sm text-slate-300">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Capital: <strong className="text-white">{currentCard.capital}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Globe2 className="w-4 h-4 text-blue-400 shrink-0" />
                            <span>Continent: <strong className="text-white">{currentCard.continent}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>Population: <strong className="text-white">{currentCard.population}</strong></span>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed mb-3">
                          <strong className="text-amber-400 block mb-1">Flag Symbolism & History</strong>
                          {currentCard.flagFact}
                        </div>
                      </div>

                      <span className="text-[11px] text-slate-500 text-center block">
                        Tap card to flip back
                      </span>
                    </div>
                  )}

                  {/* Card Footer Indicator */}
                  <div className="w-full pt-3 mt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <RotateCw className="w-3.5 h-3.5" />
                      {isFlipped ? 'Back' : 'Front'}
                    </span>
                    <span className="font-mono tabular-nums">
                      {safeCardIndex + 1} / {filteredCountries.length}
                    </span>
                  </div>
                </div>

                {/* Card Controls (>=48px tap targets) */}
                <div className="grid grid-cols-3 gap-2.5 mt-4">
                  <button
                    onClick={handlePrevCard}
                    className="min-h-[48px] px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-sm font-semibold text-slate-200 cursor-pointer active:scale-[0.98]"
                  >
                    Previous
                  </button>

                  <button
                    onClick={() => onPracticeCountry(currentCard)}
                    className="min-h-[48px] px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/40 active:scale-[0.98]"
                  >
                    <Play className="w-3.5 h-3.5 fill-white shrink-0" />
                    <span>Practice</span>
                  </button>

                  <button
                    onClick={handleNextCard}
                    className="min-h-[48px] px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-sm font-semibold text-slate-200 cursor-pointer active:scale-[0.98]"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm py-12">No countries match your current filter.</p>
            )}
          </div>
        )}
      </div>

      {/* Country Detail Modal (Tap outside, X, or Android Back to close; solid dark scrim for Android) */}
      {activeCountry && (
        <div
          onClick={() => onSelectCountry(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl animate-pop text-left relative my-auto"
          >
            <button
              onClick={() => onSelectCountry(null)}
              className="absolute top-3 right-3 w-11 h-11 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center z-10 cursor-pointer active:scale-95"
              aria-label="Close dossier"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full aspect-[3/2] rounded-xl overflow-hidden shadow-lg mb-4">
              <FlagSvg code={activeCountry.code} title={activeCountry.name} className="w-full h-full object-cover" />
            </div>

            <div className="mb-3 pb-3 border-b border-slate-800">
              <h3 className="text-2xl font-bold font-display text-white">{activeCountry.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                <span className="font-mono text-emerald-400">{activeCountry.code}</span>
                <span aria-hidden="true" className="mx-1.5 text-slate-600">·</span>
                <span>{activeCountry.continent}</span>
              </p>
            </div>

            <div className="space-y-1.5 mb-4 text-sm text-slate-300">
              <p><span className="text-slate-400">Capital:</span> <strong className="text-white font-medium">{activeCountry.capital}</strong></p>
              <p><span className="text-slate-400">Population:</span> <strong className="text-white font-medium">{activeCountry.population}</strong></p>
              <p><span className="text-slate-400">Flag Colors:</span> {activeCountry.colors.join(', ')}</p>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
              <strong className="text-amber-400 block mb-1">Flag Symbolism & History</strong>
              {activeCountry.flagFact}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onSelectCountry(null)}
                className="min-h-[48px] px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-slate-200 cursor-pointer active:scale-[0.98]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const target = activeCountry;
                  onSelectCountry(null);
                  onPracticeCountry(target);
                }}
                className="min-h-[48px] px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40 active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Practice Flag</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
