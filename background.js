// Background script
// This will handle initialization and storage setup

chrome.runtime.onInstalled.addListener(() => {
  // Initialize storage with default values
  chrome.storage.local.set({ 
    countriesQuizScore: 0,
    countriesQuizSettings: {
      difficulty: 'medium',
      dailyReminder: false,
      reminderTime: '09:00'
    }
  });
  
  console.log('Countries Quiz extension installed successfully!');
}); 