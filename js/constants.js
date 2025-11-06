/**
 * Constants for the Countries Quiz Extension
 */

// Quiz configuration
const QUIZ_CONFIG = {
  NUM_OPTIONS: 4,
  DEFAULT_QUIZ_TYPE: 'capitals',
  TIMER_DURATION: 10, // seconds
  MAX_HISTORY_LENGTH: 50,
  MAX_MISSED_QUESTIONS: 100
};

// Quiz types
const QUIZ_TYPES = {
  CAPITALS: 'capitals',
  FLAGS: 'flags',
  COUNTRIES: 'countries'
};

// Difficulty levels
const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

// Regions
const REGIONS = {
  ALL: 'all',
  AFRICA: 'Africa',
  ASIA: 'Asia',
  EUROPE: 'Europe',
  NORTH_AMERICA: 'North America',
  SOUTH_AMERICA: 'South America',
  OCEANIA: 'Oceania'
};

// Themes
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

// Storage keys
const STORAGE_KEYS = {
  SCORE: 'countriesQuizScore',
  STREAK: 'countriesQuizStreak',
  TOTAL_CORRECT: 'countriesQuizTotalCorrect',
  TOTAL_QUESTIONS: 'countriesQuizTotalQuestions',
  SETTINGS: 'countriesQuizSettings',
  STATS: 'countriesQuizStats',
  MISSED_QUESTIONS: 'countriesQuizMissedQuestions',
  START_REVIEW_MODE: 'countriesQuizStartReviewMode'
};

// Default settings
const DEFAULT_SETTINGS = {
  difficulty: DIFFICULTY.MEDIUM,
  theme: THEMES.LIGHT,
  soundEnabled: true,
  timedMode: false,
  timerDuration: QUIZ_CONFIG.TIMER_DURATION,
  region: REGIONS.ALL
};

// Sound effects (Web Audio API - we'll generate these)
const SOUNDS = {
  CORRECT: 'correct',
  INCORRECT: 'incorrect',
  TICK: 'tick',
  FINISH: 'finish'
};

// UI Classes
const UI_CLASSES = {
  HIDDEN: 'hidden',
  ACTIVE: 'active',
  CORRECT: 'correct',
  INCORRECT: 'incorrect',
  LOADING: 'loading',
  DISABLED: 'disabled'
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    QUIZ_CONFIG,
    QUIZ_TYPES,
    DIFFICULTY,
    REGIONS,
    THEMES,
    STORAGE_KEYS,
    DEFAULT_SETTINGS,
    SOUNDS,
    UI_CLASSES
  };
}
