// Background script
// This will handle initialization and storage setup

chrome.runtime.onInstalled.addListener(() => {
  // Only initialize storage if it doesn't exist (don't reset on updates)
  chrome.storage.local.get([
    'countriesQuizScore',
    'countriesQuizStreak',
    'countriesQuizTotalCorrect',
    'countriesQuizTotalQuestions',
    'countriesQuizSettings',
    'countriesQuizStats',
    'countriesQuizMissedQuestions'
  ], (result) => {
    const updates = {};

    // Initialize score tracking if not exists
    if (result.countriesQuizScore === undefined) {
      updates.countriesQuizScore = 0;
    }
    if (result.countriesQuizStreak === undefined) {
      updates.countriesQuizStreak = 0;
    }
    if (result.countriesQuizTotalCorrect === undefined) {
      updates.countriesQuizTotalCorrect = 0;
    }
    if (result.countriesQuizTotalQuestions === undefined) {
      updates.countriesQuizTotalQuestions = 0;
    }

    // Initialize settings if not exists
    if (!result.countriesQuizSettings) {
      updates.countriesQuizSettings = {
        difficulty: 'medium',
        theme: 'light',
        soundEnabled: true,
        timedMode: false,
        timerDuration: 10,
        region: 'all'
      };
    }

    // Initialize statistics if not exists
    if (!result.countriesQuizStats) {
      updates.countriesQuizStats = {
        byQuizType: {
          capitals: { correct: 0, total: 0 },
          flags: { correct: 0, total: 0 },
          countries: { correct: 0, total: 0 }
        },
        byCountry: {},
        quizHistory: [],
        startDate: new Date().toISOString()
      };
    }

    // Initialize missed questions if not exists
    if (!result.countriesQuizMissedQuestions) {
      updates.countriesQuizMissedQuestions = [];
    }

    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      chrome.storage.local.set(updates);
      console.log('Countries Quiz extension initialized with defaults');
    } else {
      console.log('Countries Quiz extension updated, preserving existing data');
    }
  });
}); 