/**
 * Countries Quiz - Main Popup Script
 * Integrates all modules for the quiz functionality
 */

// Global state
let currentScores = {
  score: 0,
  streak: 0,
  totalCorrect: 0,
  totalQuestions: 0
};
let savingAnswer = false;

/**
 * Initialize the application
 */
async function init() {
  uiManager.init();
  try {
    console.log('Initializing popup...');

    // Initialize storage first
    await StorageManager.initializeStorage();

    // Initialize UI Manager
    uiManager.init();

    // Initialize Sound Manager (requires user interaction)
    soundManager.init();

    // Initialize Quiz Engine
    await quizEngine.init();

    // Validate data
    if (!quizEngine.validateData()) {
      uiManager.showError('Failed to load quiz data');
      return;
    }

    // Load saved scores
    await loadScores();

    // Apply theme
    const settings = quizEngine.getSettings();
    uiManager.applyTheme(settings.theme);
    soundManager.setEnabled(settings.soundEnabled);

    // Set up event listeners
    setupEventListeners();

    // Check if we should start review mode
    const shouldStartReview = await StorageManager.getAndClearStartReviewMode();
    if (shouldStartReview) {
      await startReviewMode();
    } else {
      // Generate first question
      generateNewQuestion();
    }
  } catch (error) {
    console.error('Initialization error:', error);
    uiManager.showError('Failed to initialize quiz');
  }
}

/**
 * Load scores from storage
 */
async function loadScores() {
  try {
    const [score, streak, totalCorrect, totalQuestions] = await Promise.all([
      StorageManager.getScore(),
      StorageManager.getStreak(),
      StorageManager.getTotalCorrect(),
      StorageManager.getTotalQuestions()
    ]);

    currentScores = {
      score,
      streak,
      totalCorrect,
      totalQuestions
    };

    uiManager.updateScores(currentScores);
  } catch (error) {
    console.error('Error loading scores:', error);
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Next question button
  if (uiManager.elements.nextButton) {
    uiManager.elements.nextButton.addEventListener('click', generateNewQuestion);
  }

  // Quiz type buttons
  if (uiManager.elements.quizCapitals) {
    uiManager.elements.quizCapitals.addEventListener('click', () => setQuizType(QUIZ_TYPES.CAPITALS));
  }
  if (uiManager.elements.quizFlags) {
    uiManager.elements.quizFlags.addEventListener('click', () => setQuizType(QUIZ_TYPES.FLAGS));
  }
  if (uiManager.elements.quizCountries) {
    uiManager.elements.quizCountries.addEventListener('click', () => setQuizType(QUIZ_TYPES.COUNTRIES));
  }

  // Settings button
  if (uiManager.elements.settingsButton) {
    uiManager.elements.settingsButton.addEventListener('click', openSettings);
  }
  uiManager.elements.statsButton?.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('stats.html') });
  });

  // Review button
  if (uiManager.elements.reviewButton) {
    uiManager.elements.reviewButton.addEventListener('click', startReviewMode);
  }

  // Option buttons - use event delegation
  if (uiManager.elements.optionsContainer) {
    uiManager.elements.optionsContainer.addEventListener('click', handleOptionClick);
  }

  // Global keyboard shortcut for Next Question (Enter or Space when feedback is shown)
  document.addEventListener('keydown', handleGlobalKeydown);
}

/**
 * Set quiz type
 * @param {string} type - Quiz type
 */
function setQuizType(type) {
  if (savingAnswer) return;
  quizEngine.stopReviewMode();
  quizEngine.setQuizType(type);
  uiManager.updateActiveQuizType(type);
  generateNewQuestion();
}

/**
 * Generate a new question
 */
function generateNewQuestion() {
  if (savingAnswer) return;
  try {
    // Hide feedback
    uiManager.hideFeedback();

    // Clear highlights
    uiManager.clearHighlights();

    // Stop timer if running
    uiManager.stopTimer();

    // Check if we're in review mode before generating
    const wasInReviewMode = quizEngine.isReviewMode();
    const remainingBefore = quizEngine.getRemainingReviewCount();

    // Generate question
    const question = quizEngine.generateQuestion();
    const quizType = quizEngine.getQuizType();

    uiManager.updateActiveQuizType(quizType);

    // Render question based on type
    switch (quizType) {
      case QUIZ_TYPES.CAPITALS:
        uiManager.renderCapitalsQuestion(question);
        break;
      case QUIZ_TYPES.FLAGS:
        uiManager.renderFlagsQuestion(question);
        break;
      case QUIZ_TYPES.COUNTRIES:
        uiManager.renderCountriesQuestion(question);
        break;
    }

    // Start timer if enabled
    const settings = quizEngine.getSettings();
    if (settings.timedMode) {
      uiManager.startTimer(
        settings.timerDuration,
        (timeLeft) => {
          if (timeLeft <= 3 && timeLeft > 0 && settings.soundEnabled) {
            soundManager.playTick();
          }
        },
        () => {
          // Time's up - treat as incorrect
          checkAnswer('');
        }
      );
    }

    // Update review mode display
    if (quizEngine.isReviewMode()) {
      const remaining = quizEngine.getRemainingReviewCount();
      const badge = document.createElement('span');
      badge.className = 'review-badge';
      badge.textContent = `Review · ${remaining + 1} remaining`;
      uiManager.elements.quizContent.appendChild(badge);
    } else if (wasInReviewMode && remainingBefore === 0) {
      uiManager.showNotice('Review session finished. Any skipped or incorrect answers remain available for review.');
    }
  } catch (error) {
    console.error('Error generating question:', error);
    uiManager.elements.optionsContainer.replaceChildren();
    uiManager.elements.flagContainer.classList.add(UI_CLASSES.HIDDEN);
    uiManager.showError(error.message || 'Failed to generate question');
  }
}

/**
 * Handle option button click
 * @param {Event} event - Click event
 */
function handleOptionClick(event) {
  const button = event.target.closest('.option-button');
  if (!button || button.disabled || savingAnswer) return;

  const answer = button.dataset.value;
  if (answer) {
    checkAnswer(answer);
  }
}

/**
 * Handle global keyboard shortcuts
 * @param {Event} event - Keydown event
 */
function handleGlobalKeydown(event) {
  if (event.defaultPrevented || event.repeat || savingAnswer) return;
  // Native controls own their keys. A submitted answer must not also advance.
  if (event.target.closest('button, a, input, textarea, select, [contenteditable]')) return;
  // Only trigger when feedback is visible (after answering)
  const feedback = document.getElementById('feedback');
  if (!feedback || feedback.classList.contains('hidden') || !quizEngine.currentQuestion?.answered) return;

  // Prevent if user is typing in an input or textarea
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

  // Trigger next question on Enter or Space
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    generateNewQuestion();
  }
}

/**
 * Check answer
 * @param {string} selectedAnswer - User's answer
 */
async function checkAnswer(selectedAnswer) {
  if (savingAnswer) return;
  try {
    // Stop timer
    uiManager.stopTimer();

    // Check answer
    const result = quizEngine.checkAnswer(selectedAnswer);
    if (!result) return;

    // Handle result
    await handleAnswerResult(result, selectedAnswer);
  } catch (error) {
    console.error('Error checking answer:', error);
    uiManager.showError('Failed to check answer');
  }
}

/**
 * Handle answer result
 * @param {Object} result - Result from quiz engine
 * @param {string} selectedAnswer - User's selected answer
 */
async function handleAnswerResult(result, selectedAnswer) {
  if (!result) return;
  const focusedAnswer = uiManager.elements.optionsContainer.contains(document.activeElement);
  savingAnswer = true;
  const controls = ['nextButton', 'quizCapitals', 'quizFlags', 'quizCountries', 'reviewButton', 'settingsButton', 'statsButton'];
  controls.forEach(key => { if (uiManager.elements[key]) uiManager.elements[key].disabled = true; });
  try {
    // Audio is optional; feedback and persistence must still work if it fails.
    const settings = quizEngine.getSettings();
    if (settings.soundEnabled) {
      try {
        if (result.correct) soundManager.playCorrect();
        else soundManager.playIncorrect();
      } catch (error) {
        console.warn('Sound unavailable:', error);
      }
    }
    uiManager.highlightAnswers(selectedAnswer, result.correctAnswer);
    uiManager.showFeedback(result.correct, result.correctAnswer, result.funFact);
    const updatedScores = await StorageManager.submitAnswer(
      result.correct,
      result.quizType,
      result.country,
      selectedAnswer,
      result.correctAnswer,
      Boolean(result.reviewQuestion)
    );

    currentScores = updatedScores;
    uiManager.updateScores(currentScores);

  } catch (error) {
    console.error('Error updating scores:', error);
    uiManager.showError('Your answer could not be saved. Check extension storage and try another question.');
  } finally {
    savingAnswer = false;
    controls.forEach(key => { if (uiManager.elements[key]) uiManager.elements[key].disabled = false; });
    if (focusedAnswer && (document.activeElement === document.body ||
        uiManager.elements.optionsContainer.contains(document.activeElement))) {
      uiManager.elements.nextButton.focus({ preventScroll: true });
    }
  }
}

/**
 * Open settings page
 */
function openSettings() {
  chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
}

/**
 * Start review mode
 */
async function startReviewMode() {
  if (savingAnswer) return;
  try {
    const missedQuestions = await StorageManager.getMissedQuestions();

    if (missedQuestions.length === 0) {
      if (!quizEngine.currentQuestion) generateNewQuestion();
      uiManager.showNotice('No missed questions to review yet. Keep exploring!');
      return;
    }

    quizEngine.startReviewMode(missedQuestions);
    generateNewQuestion();
  } catch (error) {
    console.error('Error starting review mode:', error);
    uiManager.showError('Failed to start review mode');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
