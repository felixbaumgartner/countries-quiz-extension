/**
 * UI Manager - Handles all UI updates and rendering
 */

class UIManager {
  constructor() {
    this.elements = {};
    this.currentTimer = null;
  }

  /**
   * Initialize UI elements
   */
  init() {
    this.elements = {
      // Score and stats
      score: document.getElementById('score'),
      streak: document.getElementById('streak'),
      totalCorrect: document.getElementById('total-correct'),
      accuracy: document.getElementById('accuracy'),

      // Quiz content
      quizContent: document.getElementById('quiz-content'),
      flagContainer: document.getElementById('flag-container'),
      flagImage: document.getElementById('flag-image'),
      optionsContainer: document.getElementById('options-container'),
      feedback: document.getElementById('feedback'),

      // Controls
      nextButton: document.getElementById('next-button'),
      quizCapitals: document.getElementById('quiz-capitals'),
      quizFlags: document.getElementById('quiz-flags'),
      quizCountries: document.getElementById('quiz-countries'),

      // Settings and navigation
      settingsButton: document.getElementById('settings-button'),
      reviewButton: document.getElementById('review-button'),
      statsButton: document.getElementById('stats-button'),

      // Timer
      timerContainer: document.getElementById('timer-container'),
      timerDisplay: document.getElementById('timer-display'),
      timerProgress: document.getElementById('timer-progress'),

      // Loading spinner
      loadingSpinner: document.getElementById('loading-spinner')
    };
  }

  /**
   * Update score display
   * @param {Object} scores - Score object {score, streak, totalCorrect, totalQuestions}
   */
  updateScores(scores) {
    if (this.elements.score) {
      this.elements.score.textContent = scores.score;
    }
    if (this.elements.streak) {
      this.elements.streak.textContent = scores.streak;
    }
    if (this.elements.totalCorrect) {
      this.elements.totalCorrect.textContent = scores.totalCorrect;
    }
    // Update total questions element
    const totalQuestionsElement = document.getElementById('total-questions');
    if (totalQuestionsElement) {
      totalQuestionsElement.textContent = scores.totalQuestions;
    }
    if (this.elements.accuracy && scores.totalQuestions > 0) {
      const accuracy = Math.round((scores.totalCorrect / scores.totalQuestions) * 100);
      this.elements.accuracy.textContent = accuracy + '%';
    }
  }

  /**
   * Update active quiz type button
   * @param {string} quizType - Active quiz type
   */
  updateActiveQuizType(quizType) {
    const buttons = [
      { element: this.elements.quizCapitals, type: QUIZ_TYPES.CAPITALS },
      { element: this.elements.quizFlags, type: QUIZ_TYPES.FLAGS },
      { element: this.elements.quizCountries, type: QUIZ_TYPES.COUNTRIES }
    ];

    buttons.forEach(({ element, type }) => {
      if (element) {
        element.classList.toggle(UI_CLASSES.ACTIVE, type === quizType);
        element.setAttribute('aria-pressed', String(type === quizType));
      }
    });
  }

  /**
   * Render capitals question
   * @param {Object} question - Question object
   */
  renderCapitalsQuestion(question) {
    this.elements.flagContainer.classList.add(UI_CLASSES.HIDDEN);
    this.elements.quizContent.innerHTML = `
      What is the capital of <strong>${question.correctCountry.name}</strong>?
    `;
    this.elements.quizContent.setAttribute('aria-label', `Question: What is the capital of ${question.correctCountry.name}?`);

    this.renderOptions(question.options.map(country => ({
      text: country.capital,
      value: country.capital,
      country
    })));
  }

  /**
   * Render flags question
   * @param {Object} question - Question object
   */
  renderFlagsQuestion(question) {
    this.elements.flagContainer.classList.remove(UI_CLASSES.HIDDEN);
    this.elements.quizContent.textContent = 'Which country does this flag belong to?';
    this.elements.quizContent.setAttribute('aria-label', 'Question: Which country does this flag belong to?');

    // Show loading spinner while flag loads
    this.showLoading(this.elements.flagContainer);

    const img = this.elements.flagImage;
    img.onload = () => this.hideLoading(this.elements.flagContainer);
    img.onerror = () => {
      this.hideLoading(this.elements.flagContainer);
      console.error('Failed to load flag:', question.correctCountry.flag);
      img.alt = 'Flag failed to load';
    };
    img.alt = 'Flag to identify';
    img.src = question.correctCountry.flag;

    this.renderOptions(question.options.map(country => ({
      text: country.name,
      value: country.name,
      country
    })));
  }

  /**
   * Render countries question
   * @param {Object} question - Question object
   */
  renderCountriesQuestion(question) {
    this.elements.flagContainer.classList.add(UI_CLASSES.HIDDEN);
    this.elements.quizContent.innerHTML = `
      What is the flag of <strong>${question.correctCountry.name}</strong>?
    `;
    this.elements.quizContent.setAttribute('aria-label', `Question: What is the flag of ${question.correctCountry.name}?`);

    this.renderOptions(question.options.map((country, index) => ({
      isFlag: true,
      flagUrl: country.flag,
      value: country.name,
      country,
      index
    })));
  }

  /**
   * Render option buttons
   * @param {Array} options - Array of option objects
   */
  renderOptions(options) {
    this.elements.optionsContainer.innerHTML = '';
    this.elements.optionsContainer.style.pointerEvents = 'auto';

    options.forEach((option, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'option-button';
      button.dataset.value = option.value;

      if (option.isFlag) {
        const img = document.createElement('img');
        img.alt = `Flag option ${index + 1}`;

        // Show loading state
        button.classList.add(UI_CLASSES.LOADING);
        img.onload = () => button.classList.remove(UI_CLASSES.LOADING);
        img.onerror = () => {
          button.classList.remove(UI_CLASSES.LOADING);
          img.alt = 'Failed to load flag';
        };
        img.src = option.flagUrl;

        button.appendChild(img);
      } else {
        button.textContent = option.text;
      }

      // Store country data for event handler
      button.dataset.country = JSON.stringify(option.country);

      this.elements.optionsContainer.appendChild(button);
    });

    // Keep keyboard users with the question after activating Next or a mode.
    if (document.activeElement?.matches('#next-button, .quiz-button, #review-button')) {
      this.elements.quizContent.focus({ preventScroll: true });
    }
  }

  /**
   * Show feedback after answer
   * @param {boolean} correct - Whether answer was correct
   * @param {string} correctAnswer - The correct answer
   * @param {string} funFact - Fun fact about the country
   */
  showFeedback(correct, correctAnswer, funFact = null) {
    const feedback = this.elements.feedback;
    const focusedAnswer = this.elements.optionsContainer.contains(document.activeElement);
    this.elements.optionsContainer.querySelectorAll('.option-button').forEach(button => {
      button.disabled = true;
    });
    feedback.replaceChildren();
    feedback.className = correct ? 'feedback-correct' : 'feedback-incorrect';
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    feedback.removeAttribute('aria-label');
    const title = document.createElement('div');
    title.className = 'feedback-title';
    title.textContent = correct ? '✓ Correct!' : '✗ Incorrect';
    feedback.appendChild(title);
    if (!correct) {
      const answer = document.createElement('div');
      answer.className = 'correct-answer';
      answer.textContent = `The correct answer is: ${correctAnswer}`;
      feedback.appendChild(answer);
    }
    if (funFact) {
      const fact = document.createElement('div');
      fact.className = 'fun-fact';
      fact.textContent = funFact;
      feedback.appendChild(fact);
    }
    if (focusedAnswer) {
      this.elements.nextButton?.focus({ preventScroll: true });
    }
  }

  /**
   * Hide feedback
   */
  hideFeedback() {
    this.elements.feedback?.classList.add(UI_CLASSES.HIDDEN);
  }

  /**
   * Highlight correct and incorrect answers
   * @param {string} selectedAnswer - User's selected answer
   * @param {string} correctAnswer - Correct answer
   */
  highlightAnswers(selectedAnswer, correctAnswer) {
    const buttons = this.elements.optionsContainer.querySelectorAll('.option-button');

    buttons.forEach(button => {
      const buttonValue = button.dataset.value || '';
      const normalizedButtonValue = this.normalizeString(buttonValue);
      const normalizedCorrectAnswer = this.normalizeString(correctAnswer);
      const normalizedSelectedAnswer = this.normalizeString(selectedAnswer);

      if (normalizedButtonValue === normalizedCorrectAnswer) {
        button.classList.add(UI_CLASSES.CORRECT);
      } else if (normalizedButtonValue === normalizedSelectedAnswer) {
        button.classList.add(UI_CLASSES.INCORRECT);
      }
    });
  }

  /**
   * Clear all option highlights
   */
  clearHighlights() {
    const buttons = this.elements.optionsContainer.querySelectorAll('.option-button');
    buttons.forEach(button => {
      button.classList.remove(UI_CLASSES.CORRECT, UI_CLASSES.INCORRECT);
    });
  }

  /**
   * Show loading spinner
   * @param {HTMLElement} container - Container to show spinner in
   */
  showLoading(container = null) {
    if (container) {
      container.classList.add(UI_CLASSES.LOADING);
    } else if (this.elements.loadingSpinner) {
      this.elements.loadingSpinner.classList.remove(UI_CLASSES.HIDDEN);
    }
  }

  /**
   * Hide loading spinner
   * @param {HTMLElement} container - Container to hide spinner from
   */
  hideLoading(container = null) {
    if (container) {
      container.classList.remove(UI_CLASSES.LOADING);
    } else if (this.elements.loadingSpinner) {
      this.elements.loadingSpinner.classList.add(UI_CLASSES.HIDDEN);
    }
  }

  /**
   * Start timer display
   * @param {number} duration - Timer duration in seconds
   * @param {Function} onTick - Callback for each tick
   * @param {Function} onComplete - Callback when timer completes
   */
  startTimer(duration, onTick, onComplete) {
    if (this.currentTimer) {
      clearInterval(this.currentTimer);
    }

    if (this.elements.timerContainer) {
      this.elements.timerContainer.classList.remove(UI_CLASSES.HIDDEN);
    }

    let timeLeft = duration;
    this.updateTimerDisplay(timeLeft, duration);

    this.currentTimer = setInterval(() => {
      timeLeft--;
      this.updateTimerDisplay(timeLeft, duration);

      if (onTick) {
        onTick(timeLeft);
      }

      if (timeLeft <= 0) {
        this.stopTimer();
        if (onComplete) {
          onComplete();
        }
      }
    }, 1000);
  }

  /**
   * Update timer display
   * @param {number} timeLeft - Seconds remaining
   * @param {number} totalTime - Total time
   */
  updateTimerDisplay(timeLeft, totalTime) {
    if (this.elements.timerDisplay) {
      this.elements.timerDisplay.textContent = timeLeft;
    }
    if (this.elements.timerProgress) {
      const percentage = (timeLeft / totalTime) * 100;
      this.elements.timerProgress.style.width = percentage + '%';

      // Change color when time is running out
      if (percentage <= 25) {
        this.elements.timerProgress.style.backgroundColor = '#e74c3c';
      } else if (percentage <= 50) {
        this.elements.timerProgress.style.backgroundColor = '#f39c12';
      } else {
        this.elements.timerProgress.style.backgroundColor = '#3498db';
      }
    }
  }

  /**
   * Stop timer
   */
  stopTimer() {
    if (this.currentTimer) {
      clearInterval(this.currentTimer);
      this.currentTimer = null;
    }

    if (this.elements.timerContainer) {
      this.elements.timerContainer.classList.add(UI_CLASSES.HIDDEN);
    }
  }

  /**
   * Apply theme
   * @param {string} theme - Theme name ('light' or 'dark')
   */
  applyTheme(theme) {
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);
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
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    this.showMessage(message, true);
  }

  /** Show information without marking or disabling the current answer. */
  showNotice(message) {
    this.showMessage(message, false);
  }

  showMessage(message, isError) {
    const feedback = this.elements.feedback || document.getElementById('feedback');
    if (!feedback) return;
    feedback.className = isError ? 'feedback-error' : 'feedback-notice';
    feedback.setAttribute('role', isError ? 'alert' : 'status');
    feedback.setAttribute('aria-live', isError ? 'assertive' : 'polite');
    feedback.removeAttribute('aria-label');
    feedback.textContent = message;
  }
}

// Create singleton instance
const uiManager = new UIManager();
