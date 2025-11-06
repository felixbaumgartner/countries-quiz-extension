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

/**
 * Initialize the application
 */
async function init() {
  try {
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

  // Stats button
  if (uiManager.elements.statsButton) {
    uiManager.elements.statsButton.addEventListener('click', openStats);
  }

  // Review button
  if (uiManager.elements.reviewButton) {
    uiManager.elements.reviewButton.addEventListener('click', startReviewMode);
  }

  // Option buttons - use event delegation
  if (uiManager.elements.optionsContainer) {
    uiManager.elements.optionsContainer.addEventListener('click', handleOptionClick);
    uiManager.elements.optionsContainer.addEventListener('keydown', handleOptionKeydown);
  }

  // Global keyboard shortcut for Next Question (Enter or Space when feedback is shown)
  document.addEventListener('keydown', handleGlobalKeydown);
}

/**
 * Set quiz type
 * @param {string} type - Quiz type
 */
function setQuizType(type) {
  quizEngine.setQuizType(type);
  uiManager.updateActiveQuizType(type);
  generateNewQuestion();
}

/**
 * Generate a new question
 */
function generateNewQuestion() {
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

    // Check if review mode just ended
    if (wasInReviewMode && !quizEngine.isReviewMode() && remainingBefore === 0) {
      // Show completion message
      uiManager.showFeedback(true, 'Review complete! All missed questions have been answered.');
      setTimeout(() => {
        uiManager.hideFeedback();
      }, 3000);
    }

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
          const result = quizEngine.checkAnswer('');
          handleAnswerResult(result, '');
        }
      );
    }

    // Update review mode display
    if (quizEngine.isReviewMode()) {
      const remaining = quizEngine.getRemainingReviewCount();
      uiManager.elements.quizContent.innerHTML += ` <span class="review-badge">Review Mode (${remaining} left)</span>`;
    }
  } catch (error) {
    console.error('Error generating question:', error);
    uiManager.showError(error.message || 'Failed to generate question');
  }
}

/**
 * Handle option button click
 * @param {Event} event - Click event
 */
function handleOptionClick(event) {
  const button = event.target.closest('.option-button');
  if (!button) return;

  const answer = button.dataset.value;
  if (answer) {
    checkAnswer(answer);
  }
}

/**
 * Handle keyboard navigation for options
 * @param {Event} event - Keydown event
 */
function handleOptionKeydown(event) {
  const button = event.target.closest('.option-button');
  if (!button) return;

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    const answer = button.dataset.value;
    if (answer) {
      checkAnswer(answer);
    }
  }
}

/**
 * Handle global keyboard shortcuts
 * @param {Event} event - Keydown event
 */
function handleGlobalKeydown(event) {
  // Only trigger when feedback is visible (after answering)
  const feedback = document.getElementById('feedback');
  if (!feedback || feedback.classList.contains('hidden')) return;

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
  try {
    // Stop timer
    uiManager.stopTimer();

    // Check answer
    const result = quizEngine.checkAnswer(selectedAnswer);

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
  // Play sound
  const settings = quizEngine.getSettings();
  if (settings.soundEnabled) {
    if (result.correct) {
      soundManager.playCorrect();
    } else {
      soundManager.playIncorrect();
    }
  }

  // Highlight answers
  uiManager.highlightAnswers(selectedAnswer, result.correctAnswer);

  // Show feedback
  uiManager.showFeedback(result.correct, result.correctAnswer, result.funFact);

  // Scroll to Next button for better UX
  setTimeout(() => {
    if (uiManager.elements.nextButton) {
      uiManager.elements.nextButton.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, 300); // Small delay to allow feedback to render

  // Update scores
  try {
    const updatedScores = await StorageManager.updateScore(
      result.correct,
      quizEngine.getQuizType(),
      result.country,
      selectedAnswer,
      result.correctAnswer
    );

    currentScores = updatedScores;
    uiManager.updateScores(currentScores);

    // If in review mode and answer was correct, remove from missed questions
    if (quizEngine.isReviewMode() && result.correct) {
      const reviewQuestion = quizEngine.getCurrentReviewQuestion();
      if (reviewQuestion) {
        await StorageManager.removeMissedQuestion(
          reviewQuestion.country,
          reviewQuestion.quizType
        );
      }
    }
  } catch (error) {
    console.error('Error updating scores:', error);
  }
}

/**
 * Open settings page
 */
function openSettings() {
  window.open(chrome.runtime.getURL('settings.html'), '_blank');
}

/**
 * Open statistics page
 */
function openStats() {
  window.open(chrome.runtime.getURL('stats.html'), '_blank');
}

/**
 * Start review mode
 */
async function startReviewMode() {
  try {
    const missedQuestions = await StorageManager.getMissedQuestions();

    if (missedQuestions.length === 0) {
      uiManager.showFeedback(true, 'No missed questions to review!');
      setTimeout(() => {
        uiManager.hideFeedback();
        generateNewQuestion();
      }, 2000);
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
