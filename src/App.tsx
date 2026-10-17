import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { HeaderHUD } from './components/HeaderHUD';
import { QuizPlayfield } from './components/QuizPlayfield';
import { PauseModal } from './components/PauseModal';
import { ResultsModal } from './components/ResultsModal';
import { StudyAtlas } from './components/StudyAtlas';
import { COUNTRIES } from './data/countries';
import { GameMode, Continent, Country, QuizQuestion, GameStats, HighScores } from './types/flags';
import { sound } from './utils/audio';

type AppState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'ROUND_SUMMARY' | 'ATLAS';

const TOTAL_CLASSIC_QUESTIONS = 15;
const BLITZ_DURATION = 60;

export default function App() {
  const [appState, setAppState] = useState<AppState>('TITLE_MENU');
  const [currentMode, setCurrentMode] = useState<GameMode>('classic');
  const [currentContinent, setCurrentContinent] = useState<Continent | 'All'>('All');
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());

  // High Scores & Mastered Flags
  const [highScores, setHighScores] = useState<HighScores>(() => {
    try {
      const saved = localStorage.getItem('world_flags_highscores');
      if (saved) return JSON.parse(saved);
    } catch {
      // storage fallback
    }
    return {
      classic: 0,
      blitz: 0,
      survival: 0,
      flagsLearned: [],
    };
  });

  // Current session stats
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    totalAnswered: 0,
    correctCount: 0,
    currentStreak: 0,
    maxStreak: 0,
    livesRemaining: 3,
    timeRemaining: BLITZ_DURATION,
    history: [],
  });

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);

  // Inspected country from Results modal
  const [inspectedCountry, setInspectedCountry] = useState<Country | null>(null);

  // Blitz timer ref
  const blitzTimerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());

  // Save high scores helper
  const updateHighScores = useCallback(
    (mode: GameMode, finalScore: number, newLearnedCodes: string[]) => {
      setHighScores((prev) => {
        let isNewRecord = false;
        const updated = { ...prev };

        if (mode === 'classic' && finalScore > prev.classic) {
          updated.classic = finalScore;
          isNewRecord = true;
        } else if (mode === 'blitz' && finalScore > prev.blitz) {
          updated.blitz = finalScore;
          isNewRecord = true;
        } else if (mode === 'survival' && finalScore > prev.survival) {
          updated.survival = finalScore;
          isNewRecord = true;
        }

        // Add newly learned flags
        const setOfCodes = new Set([...prev.flagsLearned, ...newLearnedCodes]);
        updated.flagsLearned = Array.from(setOfCodes);

        setIsNewHighScore(isNewRecord);

        try {
          localStorage.setItem('world_flags_highscores', JSON.stringify(updated));
        } catch {
          // ignore
        }

        return updated;
      });
    },
    []
  );

  // Generate question helper
  const createQuestion = useCallback((targetCountry: Country, allCountries: Country[]): QuizQuestion => {
    // Pick 3 distractors from same continent or globally
    const sameContinent = allCountries.filter(
      (c) => c.code !== targetCountry.code && c.continent === targetCountry.continent
    );
    const otherCountries = allCountries.filter((c) => c.code !== targetCountry.code);

    const distractors: Country[] = [];
    const pool = sameContinent.length >= 3 ? sameContinent : otherCountries;
    const shuffledPool = [...pool].sort(() => 0.5 - Math.random());

    for (let i = 0; i < Math.min(3, shuffledPool.length); i++) {
      distractors.push(shuffledPool[i]);
    }

    // Combine and shuffle 4 options
    const options = [targetCountry, ...distractors].sort(() => 0.5 - Math.random());
    const correctIndex = options.findIndex((c) => c.code === targetCountry.code);

    return {
      id: `${targetCountry.code}-${Date.now()}-${Math.random()}`,
      country: targetCountry,
      options,
      correctIndex,
      type: 'flag-to-name',
    };
  }, []);

  // Start game flow
  const startGame = useCallback(
    (mode: GameMode, continent: Continent | 'All', specificCountry?: Country) => {
      sound.playClick();
      setCurrentMode(mode);
      setCurrentContinent(continent);
      setIsNewHighScore(false);
      setInspectedCountry(null);

      // Filter available countries based on continent
      const pool = COUNTRIES.filter((c) => continent === 'All' || c.continent === continent);
      const shuffled = [...pool].sort(() => 0.5 - Math.random());

      let sessionCountries = shuffled;
      if (specificCountry) {
        // Practice mode starts with the requested country
        sessionCountries = [specificCountry, ...shuffled.filter((c) => c.code !== specificCountry.code)];
      }

      // Generate question list
      const generatedQuestions = sessionCountries.map((c) => createQuestion(c, pool));

      setQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);

      setStats({
        score: 0,
        totalAnswered: 0,
        correctCount: 0,
        currentStreak: 0,
        maxStreak: 0,
        livesRemaining: 3,
        timeRemaining: BLITZ_DURATION,
        history: [],
      });

      questionStartTimeRef.current = Date.now();
      setAppState('PLAYING');
    },
    [createQuestion]
  );

  // Blitz mode countdown timer
  useEffect(() => {
    if (appState === 'PLAYING' && currentMode === 'blitz') {
      blitzTimerRef.current = setInterval(() => {
        setStats((prev) => {
          if (prev.timeRemaining === undefined || prev.timeRemaining <= 1) {
            clearInterval(blitzTimerRef.current!);
            handleGameOver();
            return { ...prev, timeRemaining: 0 };
          }

          // Sound tick on last 10 seconds
          if (prev.timeRemaining <= 10) {
            sound.playTick(true);
          }

          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);

      return () => {
        if (blitzTimerRef.current) clearInterval(blitzTimerRef.current);
      };
    }
  }, [appState, currentMode]);

  // Handle Game Over / Round Summary
  const handleGameOver = useCallback(() => {
    if (blitzTimerRef.current) clearInterval(blitzTimerRef.current);

    setStats((currentStats) => {
      // Collect codes answered correctly
      const learned = currentStats.history.filter((h) => h.isCorrect).map((h) => h.country.code);
      updateHighScores(currentMode, currentStats.score, learned);

      if (currentStats.correctCount >= 10 || currentStats.score > 1000) {
        sound.playVictory();
      } else {
        sound.playGameOver();
      }

      return currentStats;
    });

    setAppState('ROUND_SUMMARY');
  }, [currentMode, updateHighScores]);

  // Handle user's answer selection
  const handleAnswer = useCallback(
    (selectedOption: Country) => {
      const currentQuestion = questions[currentQuestionIndex];
      if (!currentQuestion) return;

      const isCorrect = selectedOption.code === currentQuestion.country.code;
      const responseTimeMs = Date.now() - questionStartTimeRef.current;

      setStats((prev) => {
        const nextStreak = isCorrect ? prev.currentStreak + 1 : 0;
        const nextMaxStreak = Math.max(prev.maxStreak, nextStreak);

        // Sound feedback
        if (isCorrect) {
          if (nextStreak === 3 || nextStreak === 5 || nextStreak === 10) {
            sound.playStreakFanfare();
          } else {
            sound.playCorrect(nextStreak);
          }
        } else {
          sound.playIncorrect();
        }

        // Calculate score with streak multiplier and speed bonus
        let pointsEarned = 0;
        if (isCorrect) {
          const basePoints = 100;
          const streakMultiplier = nextStreak >= 7 ? 3 : nextStreak >= 4 ? 2 : nextStreak >= 2 ? 1.5 : 1;
          const speedBonus = Math.max(0, Math.floor((4000 - responseTimeMs) / 80));
          pointsEarned = Math.round((basePoints + speedBonus) * streakMultiplier);
        }

        const nextLives =
          currentMode === 'survival' && !isCorrect
            ? Math.max(0, (prev.livesRemaining || 3) - 1)
            : prev.livesRemaining;

        // Blitz bonus time for streak
        let nextTime = prev.timeRemaining;
        if (currentMode === 'blitz' && isCorrect && nextStreak >= 3) {
          nextTime = Math.min(BLITZ_DURATION + 15, (nextTime || 0) + 2);
        }

        return {
          ...prev,
          score: prev.score + pointsEarned,
          totalAnswered: prev.totalAnswered + 1,
          correctCount: prev.correctCount + (isCorrect ? 1 : 0),
          currentStreak: nextStreak,
          maxStreak: nextMaxStreak,
          livesRemaining: nextLives,
          timeRemaining: nextTime,
          history: [
            ...prev.history,
            {
              country: currentQuestion.country,
              isCorrect,
              userAnswer: selectedOption.name,
            },
          ],
        };
      });
    },
    [questions, currentQuestionIndex, currentMode]
  );

  // Advance to next question
  const handleNextQuestion = useCallback(() => {
    sound.playClick();

    // Check survival lives
    if (currentMode === 'survival' && stats.livesRemaining !== undefined && stats.livesRemaining <= 0) {
      handleGameOver();
      return;
    }

    // Check classic mode completion
    if (currentMode === 'classic' && currentQuestionIndex >= TOTAL_CLASSIC_QUESTIONS - 1) {
      handleGameOver();
      return;
    }

    // Check if questions ran out
    if (currentQuestionIndex + 1 >= questions.length) {
      // Loop or finish
      handleGameOver();
      return;
    }

    setCurrentQuestionIndex((prev) => prev + 1);
    questionStartTimeRef.current = Date.now();
  }, [currentMode, currentQuestionIndex, questions.length, stats.livesRemaining, handleGameOver]);

  // Pause toggle (also via Esc key)
  const togglePause = useCallback(() => {
    if (appState === 'PLAYING') {
      sound.playClick();
      setAppState('PAUSED');
    } else if (appState === 'PAUSED') {
      sound.playClick();
      setAppState('PLAYING');
    }
  }, [appState]);

  // Global keydown for pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (appState === 'PLAYING') {
          togglePause();
        } else if (appState === 'PAUSED') {
          togglePause();
        } else if (appState === 'ATLAS') {
          setAppState('TITLE_MENU');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appState, togglePause]);

  const handleToggleMute = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  return (
    <main className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Title Screen */}
      {appState === 'TITLE_MENU' && (
        <TitleScreen
          onStartGame={(mode, continent) => startGame(mode, continent)}
          onOpenAtlas={() => {
            sound.playClick();
            setAppState('ATLAS');
          }}
          highScores={highScores}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Active Playing View */}
      {appState === 'PLAYING' && questions[currentQuestionIndex] && (
        <div className="relative min-h-screen w-full flex flex-col justify-between py-2 md:py-4">
          <HeaderHUD
            mode={currentMode}
            score={stats.score}
            streak={stats.currentStreak}
            lives={stats.livesRemaining}
            timeLeft={stats.timeRemaining}
            totalTime={BLITZ_DURATION}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={currentMode === 'classic' ? TOTAL_CLASSIC_QUESTIONS : questions.length}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onPause={togglePause}
          />

          <div className="my-auto py-4">
            <QuizPlayfield
              question={questions[currentQuestionIndex]}
              onAnswer={handleAnswer}
              onNext={handleNextQuestion}
              isBlitz={currentMode === 'blitz'}
            />
          </div>

          <div className="w-full text-center py-2 text-[11px] text-slate-600 font-mono">
            World Flags Challenge · {currentContinent} Territory
          </div>
        </div>
      )}

      {/* Pause Modal */}
      {appState === 'PAUSED' && (
        <PauseModal
          onResume={togglePause}
          onRestart={() => startGame(currentMode, currentContinent)}
          onQuitToMenu={() => {
            sound.playClick();
            setAppState('TITLE_MENU');
          }}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Round Summary / Victory / Game Over Modal */}
      {appState === 'ROUND_SUMMARY' && (
        <ResultsModal
          mode={currentMode}
          stats={stats}
          isNewHighScore={isNewHighScore}
          onRestart={() => startGame(currentMode, currentContinent)}
          onQuitToMenu={() => {
            sound.playClick();
            setAppState('TITLE_MENU');
          }}
          onInspectCountry={(country) => {
            setInspectedCountry(country);
            setAppState('ATLAS');
          }}
        />
      )}

      {/* Flag Atlas & Study Center */}
      {appState === 'ATLAS' && (
        <StudyAtlas
          onBack={() => {
            sound.playClick();
            setAppState('TITLE_MENU');
          }}
          onPracticeCountry={(country) => {
            startGame('classic', 'All', country);
          }}
          learnedCodes={highScores.flagsLearned}
        />
      )}
    </main>
  );
}
