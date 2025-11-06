/**
 * Quiz Engine - Handles quiz logic and game flow
 */

class QuizEngine {
  constructor() {
    this.currentQuestion = null;
    this.quizType = QUIZ_CONFIG.DEFAULT_QUIZ_TYPE;
    this.settings = DEFAULT_SETTINGS;
    this.countriesData = [];
    this.regionData = {};
    this.factsData = {};
    this.reviewMode = false;
    this.reviewQuestions = [];
    this.currentReviewQuestion = null; // Track which missed question is being reviewed
  }

  /**
   * Initialize the quiz engine
   */
  async init() {
    // Load settings
    try {
      this.settings = await StorageManager.getSettings();
    } catch (error) {
      console.error('Error loading settings:', error);
      this.settings = DEFAULT_SETTINGS;
    }

    // Merge countries data with regions and facts
    this.mergeData();
  }

  /**
   * Merge countries data with regions and fun facts
   */
  mergeData() {
    if (typeof countriesData !== 'undefined') {
      this.countriesData = countriesData.map(country => {
        const regionInfo = countryRegions[country.name] || {
          region: 'Unknown',
          subregion: 'Unknown',
          difficulty: 'medium'
        };
        const fact = countryFacts[country.name] || null;

        return {
          ...country,
          ...regionInfo,
          fact
        };
      });
    }
  }

  /**
   * Get filtered countries based on settings
   * @returns {Array} Filtered countries
   */
  getFilteredCountries() {
    let filtered = [...this.countriesData];

    // Filter by region
    if (this.settings.region && this.settings.region !== REGIONS.ALL) {
      filtered = filtered.filter(country => country.region === this.settings.region);
    }

    // Filter by difficulty
    if (this.settings.difficulty && this.settings.difficulty !== 'all') {
      filtered = filtered.filter(country => country.difficulty === this.settings.difficulty);
    }

    return filtered;
  }

  /**
   * Generate a new question
   * @returns {Object} Question object
   */
  generateQuestion() {
    if (this.reviewMode && this.reviewQuestions.length > 0) {
      return this.generateReviewQuestion();
    }

    // If review mode but no questions left, exit review mode
    if (this.reviewMode && this.reviewQuestions.length === 0) {
      this.stopReviewMode();
    }

    const availableCountries = this.getFilteredCountries();

    if (availableCountries.length < QUIZ_CONFIG.NUM_OPTIONS) {
      throw new Error('Not enough countries available for the selected filters');
    }

    const correctCountry = this.getRandomCountry(availableCountries);
    const options = [correctCountry];

    // Add wrong options
    while (options.length < QUIZ_CONFIG.NUM_OPTIONS) {
      const randomCountry = this.getRandomCountry(availableCountries);
      if (!options.some(country => country.name === randomCountry.name)) {
        options.push(randomCountry);
      }
    }

    // Shuffle options
    this.shuffleArray(options);

    this.currentQuestion = {
      correctCountry,
      options,
      quizType: this.quizType
    };

    return this.currentQuestion;
  }

  /**
   * Generate a review question from missed questions
   * @returns {Object} Question object
   */
  generateReviewQuestion() {
    const missedQuestion = this.reviewQuestions.shift();
    this.currentReviewQuestion = missedQuestion; // Store for later removal
    const correctCountry = this.countriesData.find(c => c.name === missedQuestion.country);

    if (!correctCountry) {
      // If country not found, generate regular question
      this.reviewMode = false;
      this.currentReviewQuestion = null;
      return this.generateQuestion();
    }

    const options = [correctCountry];
    const availableCountries = this.countriesData.filter(c => c.name !== correctCountry.name);

    while (options.length < QUIZ_CONFIG.NUM_OPTIONS && availableCountries.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableCountries.length);
      const randomCountry = availableCountries.splice(randomIndex, 1)[0];
      options.push(randomCountry);
    }

    this.shuffleArray(options);

    this.currentQuestion = {
      correctCountry,
      options,
      quizType: missedQuestion.quizType
    };

    return this.currentQuestion;
  }

  /**
   * Check if an answer is correct
   * @param {string} selectedAnswer - User's answer
   * @returns {Object} Result object {correct, correctAnswer, country, funFact}
   */
  checkAnswer(selectedAnswer) {
    if (!this.currentQuestion) {
      throw new Error('No current question');
    }

    const correctCountry = this.currentQuestion.correctCountry;
    let correctAnswer;

    switch (this.quizType) {
      case QUIZ_TYPES.CAPITALS:
        correctAnswer = correctCountry.capital;
        break;
      case QUIZ_TYPES.FLAGS:
      case QUIZ_TYPES.COUNTRIES:
        correctAnswer = correctCountry.name;
        break;
      default:
        correctAnswer = correctCountry.capital;
    }

    const correct = this.normalizeString(selectedAnswer) === this.normalizeString(correctAnswer);

    return {
      correct,
      correctAnswer,
      country: correctCountry,
      funFact: correctCountry.fact
    };
  }

  /**
   * Set quiz type
   * @param {string} type - Quiz type
   */
  setQuizType(type) {
    if (Object.values(QUIZ_TYPES).includes(type)) {
      this.quizType = type;
    }
  }

  /**
   * Get current quiz type
   * @returns {string}
   */
  getQuizType() {
    return this.quizType;
  }

  /**
   * Update settings
   * @param {Object} newSettings - New settings
   */
  async updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    await StorageManager.updateSettings(this.settings);
  }

  /**
   * Get current settings
   * @returns {Object}
   */
  getSettings() {
    return this.settings;
  }

  /**
   * Start review mode
   * @param {Array} missedQuestions - Array of missed questions
   */
  startReviewMode(missedQuestions) {
    this.reviewMode = true;
    this.reviewQuestions = [...missedQuestions];
  }

  /**
   * Stop review mode
   */
  stopReviewMode() {
    this.reviewMode = false;
    this.reviewQuestions = [];
    this.currentReviewQuestion = null;
  }

  /**
   * Check if in review mode
   * @returns {boolean}
   */
  isReviewMode() {
    return this.reviewMode;
  }

  /**
   * Get remaining review questions count
   * @returns {number}
   */
  getRemainingReviewCount() {
    return this.reviewQuestions.length;
  }

  /**
   * Get current review question being answered
   * @returns {Object|null} Current review question or null if not in review mode
   */
  getCurrentReviewQuestion() {
    return this.currentReviewQuestion;
  }

  /**
   * Get a random country from array
   * @param {Array} countries - Array of countries
   * @returns {Object} Random country
   */
  getRandomCountry(countries = null) {
    const source = countries || this.countriesData;
    const randomIndex = Math.floor(Math.random() * source.length);
    return source[randomIndex];
  }

  /**
   * Shuffle array in place
   * @param {Array} array - Array to shuffle
   * @returns {Array} Shuffled array
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Normalize string for comparison
   * @param {string} str - String to normalize
   * @returns {string}
   */
  normalizeString(str) {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  /**
   * Validate countries data
   * @returns {boolean} True if data is valid
   */
  validateData() {
    if (!this.countriesData || this.countriesData.length === 0) {
      console.error('No countries data loaded');
      return false;
    }

    let valid = true;
    this.countriesData.forEach((country, index) => {
      if (!country.name || !country.capital || !country.flag) {
        console.error(`Invalid country data at index ${index}:`, country);
        valid = false;
      }
    });

    return valid;
  }
}

// Create singleton instance
const quizEngine = new QuizEngine();
