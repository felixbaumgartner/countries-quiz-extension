/**
 * Storage Manager - Handles all Chrome Storage operations
 */

class StorageManager {
  // Coordinate read/modify/write operations across popup, settings and worker.
  static withWriteLock(operation) {
    return navigator.locks.request('countries-quiz-storage', operation);
  }

  // The worker owns the write so closing the toolbar popup cannot cancel it.
  static async submitAnswer(correct, quizType, country, userAnswer, correctAnswer, isReview) {
    const response = await chrome.runtime.sendMessage({
      type: 'record-answer', correct, quizType, country, userAnswer, correctAnswer, isReview
    });
    if (!response?.ok) throw new Error(response?.error || 'Could not save answer');
    return response.scores;
  }

  /**
   * Get data from Chrome storage
   * @param {string|string[]} keys - Storage key(s) to retrieve
   * @returns {Promise<Object>} Retrieved data
   */
  static async get(keys) {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get(keys, (result) => {
          if (chrome.runtime.lastError) {
            console.error('Storage get error:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            resolve(result);
          }
        });
      } catch (error) {
        console.error('Storage get exception:', error);
        reject(error);
      }
    });
  }

  /**
   * Set data in Chrome storage
   * @param {Object} data - Data to store
   * @returns {Promise<void>}
   */
  static async set(data) {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.set(data, () => {
          if (chrome.runtime.lastError) {
            console.error('Storage set error:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      } catch (error) {
        console.error('Storage set exception:', error);
        reject(error);
      }
    });
  }

  /**
   * Get current score
   * @returns {Promise<number>}
   */
  static async getScore() {
    const result = await this.get(STORAGE_KEYS.SCORE);
    return result[STORAGE_KEYS.SCORE] || 0;
  }

  /**
   * Get current streak
   * @returns {Promise<number>}
   */
  static async getStreak() {
    const result = await this.get(STORAGE_KEYS.STREAK);
    return result[STORAGE_KEYS.STREAK] || 0;
  }

  /**
   * Get total correct answers
   * @returns {Promise<number>}
   */
  static async getTotalCorrect() {
    const result = await this.get(STORAGE_KEYS.TOTAL_CORRECT);
    return result[STORAGE_KEYS.TOTAL_CORRECT] || 0;
  }

  /**
   * Get total questions answered
   * @returns {Promise<number>}
   */
  static async getTotalQuestions() {
    const result = await this.get(STORAGE_KEYS.TOTAL_QUESTIONS);
    return result[STORAGE_KEYS.TOTAL_QUESTIONS] || 0;
  }

  /**
   * Update score and statistics
   * @param {boolean} correct - Whether answer was correct
   * @param {string} quizType - Type of quiz
   * @param {Object} country - Country object
   * @param {string} userAnswer - User's answer
   * @param {string} correctAnswer - Correct answer
   * @returns {Promise<Object>} Updated scores
   */
  static async updateScore(correct, quizType, country, userAnswer, correctAnswer, isReview = false) {
    return this.withWriteLock(() => this.recordAnswer(correct, quizType, country, userAnswer, correctAnswer, isReview));
  }

  static async recordAnswer(correct, quizType, country, userAnswer, correctAnswer, isReview) {
    try {
      const [score, streak, totalCorrect, totalQuestions, stats, missedQuestions] = await Promise.all([
        this.getScore(),
        this.getStreak(),
        this.getTotalCorrect(),
        this.getTotalQuestions(),
        this.getStats(),
        this.getMissedQuestions()
      ]);

      const newStreak = correct ? streak + 1 : 0;
      const newTotalCorrect = correct ? totalCorrect + 1 : totalCorrect;
      const newTotalQuestions = totalQuestions + 1;
      const newScore = newTotalQuestions > 0 ? Math.round((newTotalCorrect / newTotalQuestions) * 100) : 0;

      // Update statistics
      stats.byQuizType[quizType].total++;
      if (correct) {
        stats.byQuizType[quizType].correct++;
      }

      // Update per-country statistics
      if (!stats.byCountry[country.name]) {
        stats.byCountry[country.name] = { correct: 0, total: 0 };
      }
      stats.byCountry[country.name].total++;
      if (correct) {
        stats.byCountry[country.name].correct++;
      }

      // Add to quiz history
      stats.quizHistory.unshift({
        timestamp: new Date().toISOString(),
        quizType,
        country: country.name,
        correct,
        userAnswer,
        correctAnswer
      });

      // Limit history length
      if (stats.quizHistory.length > QUIZ_CONFIG.MAX_HISTORY_LENGTH) {
        stats.quizHistory = stats.quizHistory.slice(0, QUIZ_CONFIG.MAX_HISTORY_LENGTH);
      }

      // Resolve review entries in the same write as the score, with no duplicates.
      if (!correct || isReview) {
        for (let index = missedQuestions.length - 1; index >= 0; index--) {
          if (missedQuestions[index].country === country.name && missedQuestions[index].quizType === quizType) {
            missedQuestions.splice(index, 1);
          }
        }
      }
      if (!correct) {
        const missedQuestion = {
          quizType,
          country: country.name,
          capital: country.capital,
          flag: country.flag,
          region: country.region,
          timestamp: new Date().toISOString(),
          userAnswer,
          correctAnswer
        };

        missedQuestions.unshift(missedQuestion);

        // Limit missed questions
        if (missedQuestions.length > QUIZ_CONFIG.MAX_MISSED_QUESTIONS) {
          missedQuestions.length = QUIZ_CONFIG.MAX_MISSED_QUESTIONS;
        }
      }

      // Save all updates
      await this.set({
        [STORAGE_KEYS.SCORE]: newScore,
        [STORAGE_KEYS.STREAK]: newStreak,
        [STORAGE_KEYS.TOTAL_CORRECT]: newTotalCorrect,
        [STORAGE_KEYS.TOTAL_QUESTIONS]: newTotalQuestions,
        [STORAGE_KEYS.STATS]: stats,
        [STORAGE_KEYS.MISSED_QUESTIONS]: missedQuestions
      });

      return {
        score: newScore,
        streak: newStreak,
        totalCorrect: newTotalCorrect,
        totalQuestions: newTotalQuestions
      };
    } catch (error) {
      console.error('Error updating score:', error);
      throw error;
    }
  }

  /**
   * Get settings
   * @returns {Promise<Object>}
   */
  static async getSettings() {
    const result = await this.get(STORAGE_KEYS.SETTINGS);
    const settings = { ...DEFAULT_SETTINGS, ...result[STORAGE_KEYS.SETTINGS] };
    if (![...Object.values(DIFFICULTY), 'all'].includes(settings.difficulty)) settings.difficulty = DEFAULT_SETTINGS.difficulty;
    if (!Object.values(REGIONS).includes(settings.region)) settings.region = DEFAULT_SETTINGS.region;
    if (!Object.values(THEMES).includes(settings.theme)) settings.theme = DEFAULT_SETTINGS.theme;
    if (typeof settings.soundEnabled !== 'boolean') settings.soundEnabled = DEFAULT_SETTINGS.soundEnabled;
    if (typeof settings.timedMode !== 'boolean') settings.timedMode = DEFAULT_SETTINGS.timedMode;
    if (!Number.isInteger(settings.timerDuration) || settings.timerDuration < 5 || settings.timerDuration > 60) {
      settings.timerDuration = DEFAULT_SETTINGS.timerDuration;
    }
    return settings;
  }

  /**
   * Update settings
   * @param {Object} settings - Settings to update
   * @returns {Promise<void>}
   */
  static async updateSettings(settings) {
    return this.withWriteLock(async () => {
      const currentSettings = await this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      await this.set({ [STORAGE_KEYS.SETTINGS]: newSettings });
      return newSettings;
    });
  }

  /**
   * Get statistics
   * @returns {Promise<Object>}
   */
  static async getStats() {
    const result = await this.get(STORAGE_KEYS.STATS);
    return result[STORAGE_KEYS.STATS] || {
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

  /**
   * Get missed questions
   * @returns {Promise<Array>}
   */
  static async getMissedQuestions() {
    const result = await this.get(STORAGE_KEYS.MISSED_QUESTIONS);
    const questions = result[STORAGE_KEYS.MISSED_QUESTIONS];
    return Array.isArray(questions) ? questions.filter(question =>
      question && typeof question.country === 'string' && Object.values(QUIZ_TYPES).includes(question.quizType)
    ) : [];
  }

  /**
   * Clear missed questions
   * @returns {Promise<void>}
   */
  static async clearMissedQuestions() {
    await this.withWriteLock(() => this.set({
      [STORAGE_KEYS.MISSED_QUESTIONS]: [],
      [STORAGE_KEYS.START_REVIEW_MODE]: false
    }));
  }

  /**
   * Remove a specific missed question from storage
   * @param {string} countryName - Name of the country to remove
   * @param {string} quizType - Type of quiz to remove
   * @returns {Promise<void>}
   */
  static async removeMissedQuestion(countryName, quizType) {
    return this.withWriteLock(async () => {
      const missedQuestions = await this.getMissedQuestions();
      await this.set({ [STORAGE_KEYS.MISSED_QUESTIONS]: missedQuestions.filter(
        question => question.country !== countryName || question.quizType !== quizType
      ) });
    });
  }

  /**
   * Reset all statistics
   * @returns {Promise<void>}
   */
  static async resetStats() {
    await this.withWriteLock(() => this.set({
      [STORAGE_KEYS.SCORE]: 0,
      [STORAGE_KEYS.STREAK]: 0,
      [STORAGE_KEYS.TOTAL_CORRECT]: 0,
      [STORAGE_KEYS.TOTAL_QUESTIONS]: 0,
      [STORAGE_KEYS.START_REVIEW_MODE]: false,
      [STORAGE_KEYS.STATS]: {
        byQuizType: {
          capitals: { correct: 0, total: 0 },
          flags: { correct: 0, total: 0 },
          countries: { correct: 0, total: 0 }
        },
        byCountry: {},
        quizHistory: [],
        startDate: new Date().toISOString()
      },
      [STORAGE_KEYS.MISSED_QUESTIONS]: []
    }));
  }

  /**
   * Set flag to start review mode
   * @param {boolean} value - Whether to start review mode
   * @returns {Promise<void>}
   */
  static async setStartReviewMode(value) {
    await this.set({ [STORAGE_KEYS.START_REVIEW_MODE]: value });
  }

  /**
   * Get and clear the start review mode flag
   * @returns {Promise<boolean>}
   */
  static async getAndClearStartReviewMode() {
    const result = await this.get(STORAGE_KEYS.START_REVIEW_MODE);
    const shouldStart = result[STORAGE_KEYS.START_REVIEW_MODE] || false;
    if (shouldStart) {
      await this.set({ [STORAGE_KEYS.START_REVIEW_MODE]: false });
    }
    return shouldStart;
  }

  /**
   * Initialize all storage with default values if not present
   * @returns {Promise<void>}
   */
  static async initializeStorage() {
    return this.withWriteLock(() => this.initializeDefaults());
  }

  static async initializeDefaults() {
    console.log('Initializing storage...');
    const data = await this.get([
      STORAGE_KEYS.SCORE,
      STORAGE_KEYS.STREAK,
      STORAGE_KEYS.TOTAL_CORRECT,
      STORAGE_KEYS.TOTAL_QUESTIONS,
      STORAGE_KEYS.SETTINGS,
      STORAGE_KEYS.STATS,
      STORAGE_KEYS.MISSED_QUESTIONS
    ]);

    const updates = {};

    // Initialize score if missing
    if (data[STORAGE_KEYS.SCORE] === undefined) {
      updates[STORAGE_KEYS.SCORE] = 0;
    }

    // Initialize streak if missing
    if (data[STORAGE_KEYS.STREAK] === undefined) {
      updates[STORAGE_KEYS.STREAK] = 0;
    }

    // Initialize total correct if missing
    if (data[STORAGE_KEYS.TOTAL_CORRECT] === undefined) {
      updates[STORAGE_KEYS.TOTAL_CORRECT] = 0;
    }

    // Initialize total questions if missing
    if (data[STORAGE_KEYS.TOTAL_QUESTIONS] === undefined) {
      updates[STORAGE_KEYS.TOTAL_QUESTIONS] = 0;
    }

    // Initialize settings if missing
    if (!data[STORAGE_KEYS.SETTINGS]) {
      updates[STORAGE_KEYS.SETTINGS] = DEFAULT_SETTINGS;
    }

    // Initialize stats if missing
    if (!data[STORAGE_KEYS.STATS]) {
      updates[STORAGE_KEYS.STATS] = {
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

    // Initialize missed questions if missing
    if (!data[STORAGE_KEYS.MISSED_QUESTIONS]) {
      updates[STORAGE_KEYS.MISSED_QUESTIONS] = [];
    }

    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      console.log('Applying storage updates:', updates);
      await this.set(updates);
    }

    console.log('Storage initialization complete');
  }

  /**
   * Export all data as JSON
   * @returns {Promise<string>}
   */
  static async exportData() {
    const data = await this.get([
      STORAGE_KEYS.SCORE,
      STORAGE_KEYS.STREAK,
      STORAGE_KEYS.TOTAL_CORRECT,
      STORAGE_KEYS.TOTAL_QUESTIONS,
      STORAGE_KEYS.SETTINGS,
      STORAGE_KEYS.STATS,
      STORAGE_KEYS.MISSED_QUESTIONS
    ]);

    return JSON.stringify(data, null, 2);
  }
}
