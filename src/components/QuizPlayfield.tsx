import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ArrowRight, Sparkles, MapPin, Users, Globe2 } from 'lucide-react';
import { QuizQuestion, Country } from '../types/flags';
import { FlagSvg } from './FlagSvg';

interface QuizPlayfieldProps {
  question: QuizQuestion;
  onAnswer: (selectedCountry: Country) => void;
  onNext: () => void;
  isBlitz: boolean;
}

export const QuizPlayfield: React.FC<QuizPlayfieldProps> = ({
  question,
  onAnswer,
  onNext,
  isBlitz,
}) => {
  const [selectedOption, setSelectedOption] = useState<Country | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Reset state when new question appears
  useEffect(() => {
    setSelectedOption(null);
    setHasAnswered(false);
    setIsShaking(false);
  }, [question.id]);

  const handleSelect = (option: Country) => {
    if (hasAnswered) return;

    setSelectedOption(option);
    setHasAnswered(true);

    const isCorrect = option.code === question.country.code;
    if (!isCorrect) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 350);
    }

    onAnswer(option);

    // If Blitz mode, auto advance rapidly after 750ms so user can blitz through
    if (isBlitz) {
      setTimeout(() => {
        onNext();
      }, 700);
    }
  };

  // Keyboard navigation: 1, 2, 3, 4 to select; Space to continue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasAnswered) {
        if (e.key === '1' && question.options[0]) handleSelect(question.options[0]);
        if (e.key === '2' && question.options[1]) handleSelect(question.options[1]);
        if (e.key === '3' && question.options[2]) handleSelect(question.options[2]);
        if (e.key === '4' && question.options[3]) handleSelect(question.options[3]);
      } else if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasAnswered, question.options, onNext]);

  return (
    <div className={`w-full max-w-3xl mx-auto px-4 flex flex-col items-center ${isShaking ? 'animate-shake' : ''}`}>
      {/* Question Prompt */}
      <div className="text-center mb-4">
        <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1 block">
          Flag Identification
        </span>
        <h2 className="text-xl md:text-2xl font-bold font-display text-white">
          Which country does this flag represent?
        </h2>
      </div>

      {/* Flag Showcase Centerpiece */}
      <div className="relative mb-6 group cursor-default">
        <div className="w-56 h-36 md:w-72 md:h-48 rounded-xl overflow-hidden shadow-2xl transition-transform duration-300 transform group-hover:scale-[1.02]">
          <FlagSvg code={question.country.code} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Answer Options Grid (4 Choices) */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {question.options.map((option, index) => {
          const isSelected = selectedOption?.code === option.code;
          const isCorrectAnswer = option.code === question.country.code;

          let btnStyle = 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-700/80 text-slate-200';
          let indicator = (
            <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-400 font-mono text-xs font-bold flex items-center justify-center border border-slate-700">
              {index + 1}
            </span>
          );

          if (hasAnswered) {
            if (isCorrectAnswer) {
              btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-950/50';
              indicator = <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />;
            } else if (isSelected && !isCorrectAnswer) {
              btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-lg shadow-rose-950/50';
              indicator = <XCircle className="w-6 h-6 text-rose-400 shrink-0" />;
            } else {
              btnStyle = 'bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-50';
            }
          }

          return (
            <button
              key={option.code}
              onClick={() => handleSelect(option)}
              disabled={hasAnswered}
              className={`w-full p-4 rounded-xl border font-semibold text-base md:text-lg flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer active:scale-98 ${btnStyle}`}
            >
              <span className="truncate text-left">{option.name}</span>
              {indicator}
            </button>
          );
        })}
      </div>

      {/* Dossier Card on Answered */}
      {hasAnswered && (
        <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 md:p-5 shadow-xl animate-pop mb-4 text-left">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-white font-display">
                  {question.country.name}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {question.country.code}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Capital: <strong className="text-slate-200">{question.country.capital}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Globe2 className="w-3.5 h-3.5 text-blue-400" />
                  {question.country.continent}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  Pop: {question.country.population}
                </span>
              </div>
            </div>

            {/* Next Button */}
            {!isBlitz && (
              <button
                onClick={onNext}
                className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-98 cursor-pointer shrink-0"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Vexillology Fact */}
          <div className="flex items-start gap-2.5 text-xs md:text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-amber-300 font-semibold mr-1">Flag Fact:</strong>
              {question.country.flagFact}
            </p>
          </div>
        </div>
      )}

      {/* Control Hint Line */}
      <div className="text-xs text-slate-500 font-mono flex items-center gap-2 text-center">
        <span>Keys <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">1</kbd>-<kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">4</kbd> Choose</span>
        <span aria-hidden="true">·</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">Space</kbd> Continue</span>
        <span aria-hidden="true">·</span>
        <span><kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">Esc</kbd> Pause</span>
      </div>
    </div>
  );
};
