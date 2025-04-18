// Global variables
let currentScore = 0;
let currentQuestion = null;
let quizType = 'capitals'; // default: 'capitals', 'flags', or 'countries'

// DOM elements
const scoreElement = document.getElementById('score');
const quizContentElement = document.getElementById('quiz-content');
const flagContainerElement = document.getElementById('flag-container');
const flagImageElement = document.getElementById('flag-image');
const optionsContainerElement = document.getElementById('options-container');
const feedbackElement = document.getElementById('feedback');
const nextButton = document.getElementById('next-button');

// Quiz type buttons
const quizCapitalsButton = document.getElementById('quiz-capitals');
const quizFlagsButton = document.getElementById('quiz-flags');
const quizCountriesButton = document.getElementById('quiz-countries');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Load saved score from storage
  chrome.storage.local.get(['countriesQuizScore'], (result) => {
    if (result.countriesQuizScore) {
      currentScore = result.countriesQuizScore;
      updateScoreDisplay();
    }
  });

  // Set up event listeners
  nextButton.addEventListener('click', generateNewQuestion);
  quizCapitalsButton.addEventListener('click', () => setQuizType('capitals'));
  quizFlagsButton.addEventListener('click', () => setQuizType('flags'));
  quizCountriesButton.addEventListener('click', () => setQuizType('countries'));

  // Generate first question
  generateNewQuestion();
});

// Set quiz type
function setQuizType(type) {
  quizType = type;
  
  // Update active button UI
  quizCapitalsButton.classList.toggle('active', type === 'capitals');
  quizFlagsButton.classList.toggle('active', type === 'flags');
  quizCountriesButton.classList.toggle('active', type === 'countries');
  
  // Generate new question of the selected type
  generateNewQuestion();
}

// Generate a new question based on quiz type
function generateNewQuestion() {
  // Reset feedback and UI
  feedbackElement.classList.add('hidden');
  optionsContainerElement.innerHTML = '';
  
  // Enable click on options
  optionsContainerElement.style.pointerEvents = 'auto';
  
  // Get random countries for the question
  const correctCountry = getRandomCountry();
  const options = [correctCountry];
  
  // Add 3 more random countries as wrong options
  while (options.length < 4) {
    const randomCountry = getRandomCountry();
    if (!options.some(country => country.name === randomCountry.name)) {
      options.push(randomCountry);
    }
  }
  
  // Shuffle options
  shuffleArray(options);
  
  // Set the current question
  currentQuestion = {
    correctCountry,
    options
  };
  
  // Render the question based on quiz type
  if (quizType === 'capitals') {
    renderCapitalsQuestion();
  } else if (quizType === 'flags') {
    renderFlagsQuestion();
  } else {
    renderCountriesQuestion();
  }
}

// Render a "What's the capital of X?" question
function renderCapitalsQuestion() {
  flagContainerElement.classList.add('hidden');
  quizContentElement.textContent = `What is the capital of ${currentQuestion.correctCountry.name}?`;
  
  currentQuestion.options.forEach(country => {
    const optionButton = createOptionButton(country.capital, () => checkAnswer(country.capital));
    optionsContainerElement.appendChild(optionButton);
  });
}

// Render a "Which country does this flag belong to?" question
function renderFlagsQuestion() {
  flagContainerElement.classList.remove('hidden');
  flagImageElement.src = currentQuestion.correctCountry.flag;
  quizContentElement.textContent = 'Which country does this flag belong to?';
  
  currentQuestion.options.forEach(country => {
    const optionButton = createOptionButton(country.name, () => checkAnswer(country.name));
    optionsContainerElement.appendChild(optionButton);
  });
}

// Render a "What's the flag of X?" question
function renderCountriesQuestion() {
  flagContainerElement.classList.add('hidden');
  quizContentElement.textContent = `What is the flag of ${currentQuestion.correctCountry.name}?`;
  
  currentQuestion.options.forEach(country => {
    const optionButton = document.createElement('div');
    optionButton.className = 'option-button';
    
    const flagImg = document.createElement('img');
    flagImg.src = country.flag;
    flagImg.alt = `Flag of ${country.name}`;
    flagImg.style.width = '100%';
    flagImg.style.maxHeight = '50px';
    flagImg.style.objectFit = 'contain';
    
    optionButton.appendChild(flagImg);
    optionButton.addEventListener('click', () => checkAnswer(country.name));
    optionsContainerElement.appendChild(optionButton);
  });
}

// Create an option button with click handler
function createOptionButton(text, clickHandler) {
  const button = document.createElement('div');
  button.className = 'option-button';
  button.textContent = text;
  button.dataset.value = text; // Store the original value as a data attribute
  button.addEventListener('click', clickHandler);
  return button;
}

// Check if the answer is correct
function checkAnswer(selectedAnswer) {
  // Disable further clicks on options
  optionsContainerElement.style.pointerEvents = 'none';
  
  // Get the correct answer based on quiz type
  let correctAnswer;
  if (quizType === 'capitals') {
    correctAnswer = currentQuestion.correctCountry.capital;
  } else if (quizType === 'flags') {
    correctAnswer = currentQuestion.correctCountry.name;
  } else { // countries
    correctAnswer = currentQuestion.correctCountry.name;
  }
  
  // Find the selected option button
  const optionButtons = optionsContainerElement.querySelectorAll('.option-button');
  
  // Highlight correct/incorrect answers
  optionButtons.forEach(button => {
    // Use dataset.value instead of textContent for comparison
    const buttonValue = button.dataset.value || '';
    const buttonCountry = button.querySelector('img')?.alt?.replace('Flag of ', '') || '';
    const valueToCheck = buttonValue || buttonCountry;
    
    // Normalize strings for comparison (remove accents for comparison)
    if (normalizeString(valueToCheck) === normalizeString(correctAnswer)) {
      button.classList.add('correct');
    } else if (normalizeString(valueToCheck) === normalizeString(selectedAnswer)) {
      button.classList.add('incorrect');
    }
  });
  
  // Provide feedback
  feedbackElement.classList.remove('hidden');
  
  if (normalizeString(selectedAnswer) === normalizeString(correctAnswer)) {
    // Correct answer
    feedbackElement.textContent = 'Correct! ★';
    feedbackElement.style.backgroundColor = '#d4edda';
    feedbackElement.style.color = '#155724';
    currentScore++;
    updateScoreDisplay();
  } else {
    // Incorrect answer
    feedbackElement.textContent = `Incorrect. The correct answer is ${correctAnswer}.`;
    feedbackElement.style.backgroundColor = '#f8d7da';
    feedbackElement.style.color = '#721c24';
  }
  
  // Save current score
  chrome.storage.local.set({ countriesQuizScore: currentScore });
}

// Helper function to normalize strings for comparison (handles special characters)
function normalizeString(str) {
  if (!str) return '';
  // Keep the original string for display, but normalize for comparison
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

// Update the score display
function updateScoreDisplay() {
  scoreElement.textContent = currentScore;
}

// Helper function to get a random country
function getRandomCountry() {
  const randomIndex = Math.floor(Math.random() * countriesData.length);
  return countriesData[randomIndex];
}

// Helper function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
} 