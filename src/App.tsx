import React, { useState, useEffect, useCallback, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { TitleScreen } from './components/TitleScreen';
import { HeaderHUD } from './components/HeaderHUD';
import { QuizPlayfield } from './components/QuizPlayfield';
import { PauseModal } from './components/PauseModal';
import { ResultsModal } from './components/ResultsModal';
import { StudyAtlas } from './components/StudyAtlas';
import { SettingsModal } from './components/SettingsModal';
import { COUNTRIES } from './data/countries';
import { GameMode, Continent, Country, QuizQuestion, GameStats, HighScores } from './types/flags';
import { sound } from './utils/audio';
import { adManager, INTERSTITIAL_FREQUENCY } from './utils/admob';
import {
  shuffleArray,
  getDailyCountries,
  getLocalDateKey,
  getYesterdayDateKey,
} from './utils/daily';

type AppState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'ROUND_SUMMARY' | 'ATLAS';

const TOTAL_CLASSIC_QUESTIONS = 15;
const BLITZ_DURATION = 60;
const HIGH_SCORES_STORAGE_KEY = 'exile_flags_highscores';

const DEFAULT_HIGH_SCORES: HighScores = {
  classic: 0,
  blitz: 0,
  survival: 0,
  flagsLearned: [],
  dailyStreak: 0,
  bestDailyStreak: 0,
  lastDailyDate: null,
  lastDailyCorrect: 0,
  lastDailyScore: 0,
};

function loadHighScores(): HighScores {
  try {
    const saved = localStorage.getItem(HIGH_SCORES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<HighScores>;
      const merged: HighScores = {
        ...DEFAULT_HIGH_SCORES,
        ...parsed,
        flagsLearned: Array.isArray(parsed.flagsLearned) ? parsed.flagsLearned : [],
      };

      // Reset active streak display if the player missed yesterday
      const todayKey = getLocalDateKey();
      const yesterdayKey = getYesterdayDateKey();
      if (
        merged.lastDailyDate &&
        merged.lastDailyDate !== todayKey &&
        merged.lastDailyDate !== yesterdayKey
      ) {
        merged.dailyStreak = 0;
      }

      return merged;
    }
  } catch {
    // storage fallback
  }
  return { ...DEFAULT_HIGH_SCORES };
}

export default function App() {
  const [appState, setAppState] = useState<AppState>('TITLE_MENU');
  const [currentMode, setCurrentMode] = useState<GameMode>('classic');
  const [currentContinent, setCurrentContinent] = useState<Continent | 'All'>('All');
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => sound.getHapticsEnabled());
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // High Scores & Mastered Flags
  const [highScores, setHighScores] = useState<HighScores>(() => loadHighScores());

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
  const [hasRevivedInRun, setHasRevivedInRun] = useState<boolean>(false);
  const [lastMissedPool, setLastMissedPool] = useState<Country[]>([]);

  // Active country dossier inside Flag Atlas (also populated from Results modal)
  const [activeAtlasCountry, setActiveAtlasCountry] = useState<Country | null>(null);

  // Blitz timer & latest refs
  const blitzTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());
  const gameOverTriggeredRef = useRef<boolean>(false);
  const statsRef = useRef<GameStats>(stats);
  statsRef.current = stats;
  const highScoresRef = useRef<HighScores>(highScores);
  highScoresRef.current = highScores;
  const showSettingsRef = useRef<boolean>(showSettings);
  showSettingsRef.current = showSettings;
  const activeAtlasCountryRef = useRef<Country | null>(activeAtlasCountry);
  activeAtlasCountryRef.current = activeAtlasCountry;

  // Save high scores & daily streak helper
  const updateHighScores = useCallback(
    (mode: GameMode, finalScore: number, correctCount: number, newLearnedCodes: string[]) => {
      const prev = highScoresRef.current;
      let isNewRecord = false;
      const updated: HighScores = { ...prev };

      if (mode === 'classic' && finalScore > prev.classic) {
        updated.classic = finalScore;
        isNewRecord = true;
      } else if (mode === 'blitz' && finalScore > prev.blitz) {
        updated.blitz = finalScore;
        isNewRecord = true;
      } else if (mode === 'survival' && finalScore > prev.survival) {
        updated.survival = finalScore;
        isNewRecord = true;
      } else if (mode === 'daily') {
        const todayKey = getLocalDateKey();
        const yesterdayKey = getYesterdayDateKey();

        if (prev.lastDailyDate !== todayKey) {
          const nextStreak = prev.lastDailyDate === yesterdayKey ? prev.dailyStreak + 1 : 1;
          updated.dailyStreak = nextStreak;
          updated.bestDailyStreak = Math.max(prev.bestDailyStreak, nextStreak);
          updated.lastDailyDate = todayKey;
          updated.lastDailyCorrect = correctCount;
          updated.lastDailyScore = finalScore;
        } else {
          updated.lastDailyCorrect = Math.max(prev.lastDailyCorrect, correctCount);
          updated.lastDailyScore = Math.max(prev.lastDailyScore, finalScore);
        }
      }

      const setOfCodes = new Set([...prev.flagsLearned, ...newLearnedCodes]);
      updated.flagsLearned = Array.from(setOfCodes);

      try {
        localStorage.setItem(HIGH_SCORES_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }

      highScoresRef.current = updated;
      setHighScores(updated);
      setIsNewHighScore(isNewRecord);
    },
    []
  );

  // Generate question helper (unbiased Fisher-Yates shuffle)
  const createQuestion = useCallback((targetCountry: Country, allCountries: Country[]): QuizQuestion => {
    const sameContinent = allCountries.filter(
      (c) => c.code !== targetCountry.code && c.continent === targetCountry.continent
    );
    const otherCountries = allCountries.filter((c) => c.code !== targetCountry.code);

    const pool = sameContinent.length >= 3 ? sameContinent : otherCountries;
    const shuffledPool = shuffleArray(pool);
    const distractors = shuffledPool.slice(0, Math.min(3, shuffledPool.length));

    const options = shuffleArray([targetCountry, ...distractors]);
    const correctIndex = options.findIndex((c) => c.code === targetCountry.code);

    return {
      id: `${targetCountry.code}-${Date.now()}-${Math.random()}`,
      country: targetCountry,
      options,
      correctIndex,
      type: 'flag-to-name',
    };
  }, []);

  const resetSessionStats = useCallback(() => {
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
  }, []);

  // Build a freshly shuffled batch of questions for a continent (avoiding repeating the immediately previous flag)
  const buildContinentBatch = useCallback(
    (continent: Continent | 'All', avoidFirstCode?: string): QuizQuestion[] => {
      const pool = COUNTRIES.filter((c) => continent === 'All' || c.continent === continent);
      const shuffled = shuffleArray(pool);
      if (avoidFirstCode && shuffled.length > 1 && shuffled[0].code === avoidFirstCode) {
        [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
      }
      const distractorPool = pool.length >= 4 ? pool : COUNTRIES;
      return shuffled.map((c) => createQuestion(c, distractorPool));
    },
    [createQuestion]
  );

  // Start standard game flow (Classic / 60s Blitz / Survival)
  const startGame = useCallback(
    (mode: GameMode, continent: Continent | 'All', specificCountry?: Country) => {
      sound.playClick();
      gameOverTriggeredRef.current = false;
      setCurrentMode(mode);
      setCurrentContinent(continent);
      setIsNewHighScore(false);
      setHasRevivedInRun(false);
      setActiveAtlasCountry(null);

      const pool = COUNTRIES.filter((c) => continent === 'All' || c.continent === continent);
      const shuffled = shuffleArray(pool);

      let sessionCountries = shuffled;
      if (specificCountry) {
        sessionCountries = [specificCountry, ...shuffled.filter((c) => c.code !== specificCountry.code)];
      }

      const distractorPool = pool.length >= 4 ? pool : COUNTRIES;
      const generatedQuestions = sessionCountries.map((c) => createQuestion(c, distractorPool));

      setQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);
      resetSessionStats();

      questionStartTimeRef.current = Date.now();
      setAppState('PLAYING');
    },
    [createQuestion, resetSessionStats]
  );

  // Start Today's 5-Flag Daily Challenge
  const startDailyChallenge = useCallback(() => {
    sound.playClick();
    gameOverTriggeredRef.current = false;
    setCurrentMode('daily');
    setCurrentContinent('All');
    setIsNewHighScore(false);
    setHasRevivedInRun(false);
    setActiveAtlasCountry(null);

    const dailyCountries = getDailyCountries(COUNTRIES);
    const generatedQuestions = dailyCountries.map((c) => createQuestion(c, COUNTRIES));

    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    resetSessionStats();

    questionStartTimeRef.current = Date.now();
    setAppState('PLAYING');
  }, [createQuestion, resetSessionStats]);

  // Start Focused Mistakes Drill for Missed Flags
  const startMistakesPractice = useCallback(
    (missedCountries: Country[]) => {
      if (missedCountries.length === 0) return;
      sound.playClick();
      gameOverTriggeredRef.current = false;
      setCurrentMode('mistakes');
      setCurrentContinent('All');
      setIsNewHighScore(false);
      setHasRevivedInRun(false);
      setActiveAtlasCountry(null);
      setLastMissedPool(missedCountries);

      const shuffled = shuffleArray(missedCountries);
      const generatedQuestions = shuffled.map((c) => createQuestion(c, COUNTRIES));

      setQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);
      resetSessionStats();

      questionStartTimeRef.current = Date.now();
      setAppState('PLAYING');
    },
    [createQuestion, resetSessionStats]
  );

  const handleRestartCurrentMode = useCallback(() => {
    if (currentMode === 'daily') {
      startDailyChallenge();
    } else if (currentMode === 'mistakes' && lastMissedPool.length > 0) {
      startMistakesPractice(lastMissedPool);
    } else {
      startGame(currentMode, currentContinent);
    }
  }, [currentMode, currentContinent, lastMissedPool, startDailyChallenge, startMistakesPractice, startGame]);

  // Handle Game Over / Round Summary (idempotent per round)
  const handleGameOver = useCallback(() => {
    if (gameOverTriggeredRef.current) return;
    gameOverTriggeredRef.current = true;

    if (blitzTimerRef.current) {
      clearInterval(blitzTimerRef.current);
      blitzTimerRef.current = null;
    }

    const currentStats = statsRef.current;
    const learned = currentStats.history.filter((h) => h.isCorrect).map((h) => h.country.code);
    updateHighScores(currentMode, currentStats.score, currentStats.correctCount, learned);

    const accuracy =
      currentStats.totalAnswered > 0 ? currentStats.correctCount / currentStats.totalAnswered : 0;

    if (accuracy >= 0.7 || currentStats.correctCount >= 10 || currentStats.score > 1000) {
      sound.playVictory();
    } else {
      sound.playGameOver();
    }

    setAppState('ROUND_SUMMARY');

    // Show preloaded interstitial ad every N completed rounds (after summary paints)
    setTimeout(() => {
      void adManager.recordRoundAndShowInterstitial(INTERSTITIAL_FREQUENCY);
    }, 150);
  }, [currentMode, updateHighScores]);

  // Blitz mode countdown timer (pure state decrement; completion handled in separate effect)
  useEffect(() => {
    if (appState === 'PLAYING' && currentMode === 'blitz') {
      blitzTimerRef.current = setInterval(() => {
        setStats((prev) => {
          const currentLeft = prev.timeRemaining ?? 0;
          if (currentLeft <= 0) {
            return prev;
          }
          const nextLeft = currentLeft - 1;
          if (nextLeft > 0 && nextLeft <= 10) {
            sound.playTick(true);
          }
          return { ...prev, timeRemaining: nextLeft };
        });
      }, 1000);

      return () => {
        if (blitzTimerRef.current) {
          clearInterval(blitzTimerRef.current);
          blitzTimerRef.current = null;
        }
      };
    }
  }, [appState, currentMode]);

  // End Blitz cleanly once countdown reaches 0
  useEffect(() => {
    if (appState === 'PLAYING' && currentMode === 'blitz' && stats.timeRemaining === 0) {
      handleGameOver();
    }
  }, [appState, currentMode, stats.timeRemaining, handleGameOver]);

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

        if (isCorrect) {
          if (nextStreak === 3 || nextStreak === 5 || nextStreak === 10) {
            sound.playStreakFanfare();
          } else {
            sound.playCorrect(nextStreak);
          }
        } else {
          sound.playIncorrect();
        }

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

  // Accurate total questions per round (fixes Oceania 14-flag mismatch in Classic)
  const totalRoundQuestions =
    currentMode === 'classic'
      ? Math.min(TOTAL_CLASSIC_QUESTIONS, questions.length)
      : questions.length;

  // Advance to next question
  const handleNextQuestion = useCallback(() => {
    if (gameOverTriggeredRef.current) return;
    sound.playClick();

    if (currentMode === 'survival' && statsRef.current.livesRemaining !== undefined && statsRef.current.livesRemaining <= 0) {
      handleGameOver();
      return;
    }

    // In 60s Blitz, seamlessly reshuffle and append a new batch if a small continent (e.g., Oceania) is exhausted
    if (currentMode === 'blitz' && currentQuestionIndex + 1 >= questions.length) {
      const lastCode = questions[currentQuestionIndex]?.country.code;
      const nextBatch = buildContinentBatch(currentContinent, lastCode);
      setQuestions((prev) => [...prev, ...nextBatch]);
      setCurrentQuestionIndex((prev) => prev + 1);
      questionStartTimeRef.current = Date.now();
      return;
    }

    if (currentQuestionIndex + 1 >= totalRoundQuestions) {
      handleGameOver();
      return;
    }

    setCurrentQuestionIndex((prev) => prev + 1);
    questionStartTimeRef.current = Date.now();
  }, [currentMode, currentContinent, currentQuestionIndex, questions, totalRoundQuestions, buildContinentBatch, handleGameOver]);

  // Pause toggle
  const togglePause = useCallback(() => {
    if (appState === 'PLAYING') {
      sound.playClick();
      setAppState('PAUSED');
    } else if (appState === 'PAUSED') {
      sound.playClick();
      setAppState('PLAYING');
    }
  }, [appState]);

  // Android Hardware Back Button Handler via Capacitor App
  useEffect(() => {
    const backListener = CapacitorApp.addListener('backButton', () => {
      if (showSettingsRef.current) {
        sound.playClick();
        setShowSettings(false);
        return;
      }

      setAppState((current) => {
        if (current === 'ATLAS' && activeAtlasCountryRef.current) {
          sound.playClick();
          setActiveAtlasCountry(null);
          return 'ATLAS';
        }
        if (current === 'PLAYING') {
          sound.playClick();
          return 'PAUSED';
        } else if (current === 'PAUSED' || current === 'ROUND_SUMMARY' || current === 'ATLAS') {
          sound.playClick();
          setActiveAtlasCountry(null);
          return 'TITLE_MENU';
        } else if (current === 'TITLE_MENU') {
          CapacitorApp.exitApp();
        }
        return current;
      });
    });

    return () => {
      backListener.then((listener) => listener.remove());
    };
  }, []);

  // Initialize AdMob + UMP Consent on mount
  useEffect(() => {
    void adManager.initialize();
  }, []);

  // Show bottom banner ad on Title Screen & Flag Atlas (when no modal/dossier is open)
  useEffect(() => {
    const shouldShowBanner =
      !showSettings &&
      (appState === 'TITLE_MENU' || (appState === 'ATLAS' && !activeAtlasCountry));

    if (shouldShowBanner) {
      void adManager.showBanner();
    } else {
      void adManager.hideBanner();
    }
  }, [appState, showSettings, activeAtlasCountry]);

  // Handle Revive via Rewarded Video Ad (Survival Mode — max 1 revive per run)
  const handleReviveSurvival = useCallback(async (): Promise<boolean> => {
    if (hasRevivedInRun) return false;
    const earnedReward = await adManager.showRewardedAd();
    if (earnedReward) {
      sound.playStreakFanfare();
      gameOverTriggeredRef.current = false;
      setHasRevivedInRun(true);
      setStats((prev) => ({
        ...prev,
        livesRemaining: 1,
      }));

      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        // Player lost last life on the final flag of a continent — append a fresh unseen batch
        const lastCode = questions[currentQuestionIndex]?.country.code;
        const freshBatch = buildContinentBatch(currentContinent, lastCode);
        setQuestions((prev) => [...prev, ...freshBatch]);
        setCurrentQuestionIndex((prev) => prev + 1);
      }

      questionStartTimeRef.current = Date.now();
      setAppState('PLAYING');
      return true;
    }
    return false;
  }, [hasRevivedInRun, currentQuestionIndex, questions, currentContinent, buildContinentBatch]);

  const handleToggleMute = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleToggleHaptics = () => {
    const nextEnabled = sound.toggleHaptics();
    setHapticsEnabled(nextEnabled);
  };

  const handleResetProgress = () => {
    sound.playClick();
    setHighScores({ ...DEFAULT_HIGH_SCORES });
    try {
      localStorage.removeItem(HIGH_SCORES_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const playfieldFooterLabel =
    currentMode === 'daily'
      ? 'Daily Challenge'
      : currentMode === 'mistakes'
      ? 'Mistakes Practice'
      : currentContinent === 'All'
      ? 'All World'
      : currentContinent;

  return (
    <main className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Title Screen */}
      {appState === 'TITLE_MENU' && (
        <TitleScreen
          onStartGame={(mode, continent) => startGame(mode, continent)}
          onStartDaily={startDailyChallenge}
          onOpenAtlas={() => {
            sound.playClick();
            setAppState('ATLAS');
          }}
          onOpenSettings={() => {
            sound.playClick();
            setShowSettings(true);
          }}
          highScores={highScores}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isModalOpen={showSettings}
        />
      )}

      {/* Active Playing View */}
      {appState === 'PLAYING' && questions[currentQuestionIndex] && (
        <div className="relative min-h-screen w-full flex flex-col justify-between pb-4">
          <HeaderHUD
            mode={currentMode}
            score={stats.score}
            streak={stats.currentStreak}
            lives={stats.livesRemaining}
            timeLeft={stats.timeRemaining}
            totalTime={BLITZ_DURATION}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={totalRoundQuestions}
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
              isFinalStep={
                currentMode !== 'blitz' &&
                ((currentMode === 'survival' && (stats.livesRemaining ?? 3) <= 0) ||
                  currentQuestionIndex + 1 >= totalRoundQuestions)
              }
            />
          </div>

          <div className="w-full text-center pt-1 text-[11px] text-slate-600 font-mono">
            {playfieldFooterLabel}
          </div>
        </div>
      )}

      {/* Pause Modal */}
      {appState === 'PAUSED' && (
        <PauseModal
          onResume={togglePause}
          onRestart={handleRestartCurrentMode}
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
          dailyStreak={highScores.dailyStreak}
          onRestart={handleRestartCurrentMode}
          onQuitToMenu={() => {
            sound.playClick();
            setAppState('TITLE_MENU');
          }}
          onInspectCountry={(country) => {
            setActiveAtlasCountry(country);
            setAppState('ATLAS');
          }}
          onPracticeMissed={startMistakesPractice}
          canRevive={
            currentMode === 'survival' &&
            !hasRevivedInRun &&
            (stats.livesRemaining ?? 0) <= 0
          }
          onRevive={handleReviveSurvival}
        />
      )}

      {/* Flag Atlas & Study Center */}
      {appState === 'ATLAS' && (
        <StudyAtlas
          onBack={() => {
            sound.playClick();
            setActiveAtlasCountry(null);
            setAppState('TITLE_MENU');
          }}
          onPracticeCountry={(country) => {
            setActiveAtlasCountry(null);
            startGame('classic', 'All', country);
          }}
          learnedCodes={highScores.flagsLearned}
          activeCountry={activeAtlasCountry}
          onSelectCountry={setActiveAtlasCountry}
        />
      )}

      {/* Settings & Privacy Modal */}
      {showSettings && (
        <SettingsModal
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          hapticsEnabled={hapticsEnabled}
          onToggleHaptics={handleToggleHaptics}
          onResetProgress={handleResetProgress}
          onClose={() => {
            sound.playClick();
            setShowSettings(false);
          }}
        />
      )}
    </main>
  );
}
