import React, { useState, useMemo } from 'react';
import { Search, ArrowLeft, RotateCw, MapPin, Globe2, Users, Sparkles, Filter, Check, Play } from 'lucide-react';
import { Country, Continent } from '../types/flags';
import { COUNTRIES } from '../data/countries';
import { FlagSvg } from './FlagSvg';

interface StudyAtlasProps {
  onBack: () => void;
  onPracticeCountry: (country: Country) => void;
  learnedCodes: string[];
}

export const StudyAtlas: React.FC<StudyAtlasProps> = ({
  onBack,
  onPracticeCountry,
  learnedCodes,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<Continent | 'All'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'flashcards'>('grid');
  const [activeCountry, setActiveCountry] = useState<Country | null>(null);

  // Flashcard mode state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

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

  // Current flashcard country
  const currentCard = filteredCountries[cardIndex] || filteredCountries[0];

  const handleNextCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1) % filteredCountries.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev - 1 + filteredCountries.length) % filteredCountries.length);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col">
      {/* Top Navigation Bar */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-semibold">Back to Menu</span>
        </button>

        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold font-display tracking-tight text-white">
            World Flag Atlas & Study Center
          </h1>
          <p className="text-xs text-slate-400">
            {COUNTRIES.length} sovereign nations · {learnedCodes.length} flags mastered
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => {
              setViewMode('grid');
              setIsFlipped(false);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Atlas Grid
          </button>
          <button
            onClick={() => {
              setViewMode('flashcards');
              setIsFlipped(false);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              viewMode === 'flashcards' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Flashcards
          </button>
        </div>
      </div>

      {/* Controls: Search and Continent Filter Bar */}
      <div className="w-full max-w-6xl mx-auto mb-6 flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCardIndex(0);
            }}
            placeholder="Search country, capital, code..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Continent Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-xl overflow-x-auto w-full md:w-auto">
          {continents.map((cont) => (
            <button
              key={cont}
              onClick={() => {
                setSelectedContinent(cont);
                setCardIndex(0);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedContinent === cont
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cont}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-6xl mx-auto flex-1">
        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {filteredCountries.map((country) => {
              const isLearned = learnedCodes.includes(country.code);
              return (
                <div
                  key={country.code}
                  onClick={() => setActiveCountry(country)}
                  className="group bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3 flex flex-col transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="w-full aspect-[3/2] mb-2.5 overflow-hidden rounded-lg">
                    <FlagSvg
                      code={country.code}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h3 className="font-bold text-sm text-slate-200 group-hover:text-white truncate">
                      {country.name}
                    </h3>
                    {isLearned && (
                      <span title="Mastered in Challenge" className="shrink-0 text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 truncate mb-2">
                    {country.capital}
                  </p>

                  <div className="mt-auto pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{country.continent}</span>
                    <span className="uppercase">{country.code}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Flashcard Study Mode */
          <div className="flex flex-col items-center justify-center py-6">
            {currentCard ? (
              <div className="w-full max-w-md">
                {/* 3D Flip Card */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full min-h-[380px] bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-between cursor-pointer transition-all duration-300 hover:border-emerald-500/50"
                >
                  {!isFlipped ? (
                    /* Front: Flag Showcase */
                    <div className="flex flex-col items-center justify-center my-auto w-full text-center">
                      <div className="w-64 h-40 md:w-72 md:h-48 rounded-xl overflow-hidden shadow-xl mb-6">
                        <FlagSvg code={currentCard.code} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">
                        Tap anywhere to reveal country facts
                      </span>
                    </div>
                  ) : (
                    /* Back: Detailed Dossier */
                    <div className="flex flex-col justify-between h-full w-full animate-pop text-left">
                      <div>
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                          <div>
                            <h2 className="text-2xl font-bold font-display text-white">
                              {currentCard.name}
                            </h2>
                            <span className="text-xs text-emerald-400 font-mono">
                              ISO: {currentCard.code}
                            </span>
                          </div>
                          <div className="w-16 h-10 rounded overflow-hidden shadow">
                            <FlagSvg code={currentCard.code} className="w-full h-full object-cover" />
                          </div>
                        </div>

                        <div className="space-y-2.5 mb-4 text-sm text-slate-300">
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

                        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed mb-4">
                          <strong className="text-amber-400 block mb-1">Flag Symbolism & History:</strong>
                          {currentCard.flagFact}
                        </div>
                      </div>

                      <span className="text-[11px] text-slate-500 font-mono text-center block">
                        Tap to flip back
                      </span>
                    </div>
                  )}

                  {/* Card Footer Indicator */}
                  <div className="w-full pt-4 mt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5" />
                      {isFlipped ? 'Back' : 'Front'}
                    </span>
                    <span className="font-mono tabular-nums">
                      {cardIndex + 1} of {filteredCountries.length}
                    </span>
                  </div>
                </div>

                {/* Card Controls */}
                <div className="flex items-center justify-between gap-3 mt-4">
                  <button
                    onClick={handlePrevCard}
                    className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-sm font-semibold text-slate-300 cursor-pointer"
                  >
                    Previous
                  </button>

                  <button
                    onClick={() => onPracticeCountry(currentCard)}
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/40"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Practice This Flag</span>
                  </button>

                  <button
                    onClick={handleNextCard}
                    className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-sm font-semibold text-slate-300 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No countries found matching your search.</p>
            )}
          </div>
        )}
      </div>

      {/* Country Detail Modal when clicked in Grid */}
      {activeCountry && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl animate-pop text-left">
            <div className="w-full aspect-[3/2] rounded-xl overflow-hidden shadow-lg mb-4">
              <FlagSvg code={activeCountry.code} className="w-full h-full object-cover" />
            </div>

            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-2xl font-bold font-display text-white">{activeCountry.name}</h3>
                <span className="text-xs text-emerald-400 font-mono">ISO: {activeCountry.code}</span>
              </div>
              <span className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-300">
                {activeCountry.continent}
              </span>
            </div>

            <div className="space-y-2 mb-4 text-sm text-slate-300">
              <p><strong className="text-slate-400">Capital:</strong> {activeCountry.capital}</p>
              <p><strong className="text-slate-400">Population:</strong> {activeCountry.population}</p>
              <p><strong className="text-slate-400">Colors:</strong> {activeCountry.colors.join(', ')}</p>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed mb-6">
              <strong className="text-amber-400 block mb-1">Flag Symbolism & History:</strong>
              {activeCountry.flagFact}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setActiveCountry(null)}
                className="py-2 px-4 rounded-xl text-sm font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const target = activeCountry;
                  setActiveCountry(null);
                  onPracticeCountry(target);
                }}
                className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
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
