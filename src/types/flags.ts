export type Continent = 'Europe' | 'Asia' | 'Africa' | 'Americas' | 'Oceania';

export type GameMode = 'classic' | 'blitz' | 'survival' | 'atlas';

export type QuestionType = 'flag-to-name' | 'name-to-flag';

export interface Country {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  capital: string;
  continent: Continent;
  population: string;
  colors: string[];
  difficulty: 1 | 2 | 3; // 1 = Easy/Famous, 2 = Medium, 3 = Hard/Trivia
  flagFact: string;
}

export interface QuizQuestion {
  id: string;
  country: Country;
  options: Country[];
  correctIndex: number;
  type: QuestionType;
}

export interface GameStats {
  score: number;
  totalAnswered: number;
  correctCount: number;
  currentStreak: number;
  maxStreak: number;
  livesRemaining?: number; // for survival mode
  timeRemaining?: number; // for blitz mode
  history: {
    country: Country;
    isCorrect: boolean;
    userAnswer: string;
  }[];
}

export interface HighScores {
  classic: number;
  blitz: number;
  survival: number;
  flagsLearned: string[]; // country codes
}
