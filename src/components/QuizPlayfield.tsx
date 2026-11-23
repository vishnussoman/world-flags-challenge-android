import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle2, XCircle, ArrowRight, Sparkles } from 'lucide-react';
import { QuizQuestion, Country } from '../types/flags';
import { FlagSvg } from './FlagSvg';

interface QuizPlayfieldProps {
  question: QuizQuestion;
  onAnswer: (selectedCountry: Country) => void;
  onNext: () => void;
  isBlitz: boolean;
  isFinalStep?: boolean;
}

export const QuizPlayfield: React.FC<QuizPlayfieldProps> = ({
  question,
  onAnswer,
  onNext,
  isBlitz,
  isFinalStep = false,
}) => {
  const [selectedOption, setSelectedOption] = useState<Country | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const blitzAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onNextRef = useRef(onNext);
  onNextRef.current = onNext;

  const clearTimers = useCallback(() => {
    if (blitzAdvanceTimerRef.current) {
      clearTimeout(blitzAdvanceTimerRef.current);
      blitzAdvanceTimerRef.current = null;
    }
    if (shakeTimerRef.current) {
      clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = null;
    }
  }, []);

  // Reset state and cancel pending timers when new question appears or component unmounts
  useEffect(() => {
    clearTimers();
    setSelectedOption(null);
    setHasAnswered(false);
    setIsShaking(false);

    return () => {
      clearTimers();
    };
  }, [question.id, clearTimers]);

  const handleSelect = useCallback(
    (option: Country) => {
      if (hasAnswered) return;

      setSelectedOption(option);
      setHasAnswered(true);

      const isCorrect = option.code === question.country.code;
      if (!isCorrect) {
        setIsShaking(true);
        shakeTimerRef.current = setTimeout(() => {
          shakeTimerRef.current = null;
          setIsShaking(false);
        }, 350);
      }

      onAnswer(option);

      // If Blitz mode, auto advance rapidly (cleared automatically on pause/game-over/unmount)
      if (isBlitz) {
        blitzAdvanceTimerRef.current = setTimeout(() => {
          blitzAdvanceTimerRef.current = null;
          onNextRef.current();
        }, 700);
      }
    },
    [hasAnswered, question.country.code, onAnswer, isBlitz]
  );

  // Keyboard navigation on desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasAnswered) {
        if (e.key === '1' && question.options[0]) handleSelect(question.options[0]);
        if (e.key === '2' && question.options[1]) handleSelect(question.options[1]);
        if (e.key === '3' && question.options[2]) handleSelect(question.options[2]);
        if (e.key === '4' && question.options[3]) handleSelect(question.options[3]);
      } else if (!isBlitz && (e.code === 'Space' || e.key === 'Enter')) {
        e.preventDefault();
        onNextRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasAnswered, isBlitz, question.options, handleSelect]);

  return (
    <div className={`w-full max-w-2xl mx-auto px-4 flex flex-col items-center ${isShaking ? 'animate-shake' : ''}`}>
      {/* Concise Question Prompt */}
      <h2 className="text-base sm:text-xl font-bold font-display text-slate-200 text-center mb-3 sm:mb-4">
        Which country does this flag belong to?
      </h2>

      {/* Flag Showcase Centerpiece */}
      <div className="relative mb-4 sm:mb-6">
        <div className="w-52 h-34 sm:w-64 sm:h-42 md:w-72 md:h-48 rounded-2xl overflow-hidden shadow-2xl">
          <FlagSvg
            code={question.country.code}
            title={question.country.name}
            hideLabel={!hasAnswered}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Answer Options Grid (4 Choices with >=52px mobile tap height) */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-4">
        {question.options.map((option, index) => {
          const isSelected = selectedOption?.code === option.code;
          const isCorrectAnswer = option.code === question.country.code;

          let btnStyle = 'bg-slate-900 hover:bg-slate-800/90 border-slate-700/80 text-slate-100';
          let indicator = (
            <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
              {['A', 'B', 'C', 'D'][index]}
            </span>
          );

          if (hasAnswered) {
            if (isCorrectAnswer) {
              btnStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-100 shadow-lg shadow-emerald-950/50';
              indicator = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
            } else if (isSelected && !isCorrectAnswer) {
              btnStyle = 'bg-rose-950/90 border-rose-500 text-rose-100 shadow-lg shadow-rose-950/50';
              indicator = <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
            } else {
              btnStyle = 'bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-50';
            }
          }

          return (
            <button
              key={option.code}
              onClick={() => handleSelect(option)}
              disabled={hasAnswered}
              className={`w-full min-h-[52px] py-3 px-4 rounded-xl border font-semibold text-sm sm:text-base flex items-center justify-between gap-3 transition-all duration-150 cursor-pointer active:scale-[0.98] ${btnStyle}`}
            >
              <span className="truncate text-left">{option.name}</span>
              {indicator}
            </button>
          );
        })}
      </div>

      {/* Post-Answer Dossier + Full-Width Thumb-Reachable Action */}
      {hasAnswered && (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl animate-pop text-left">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <span className="text-base sm:text-lg font-bold text-white font-display truncate">
              {question.country.name}
            </span>
            <span className="text-xs font-mono text-slate-400 shrink-0">
              {question.country.code}
            </span>
          </div>

          {/* Unboxed clean metadata line */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400 mb-3">
            <span>Capital: <strong className="text-slate-200 font-medium">{question.country.capital}</strong></span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{question.country.continent}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Pop. {question.country.population}</span>
          </div>

          {/* Flag Fact */}
          <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-300 leading-relaxed pt-3 border-t border-slate-800/80">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>{question.country.flagFact}</p>
          </div>

          {/* Full-width mobile thumb CTA */}
          {!isBlitz && (
            <button
              onClick={onNext}
              className="mt-4 w-full min-h-[48px] py-3 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all duration-150 active:scale-[0.98] cursor-pointer"
            >
              <span>{isFinalStep ? 'View Results' : 'Next Flag'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
