// Use the same defaults and write lock as the popup; updates preserve progress.
importScripts('js/constants.js', 'js/storage-manager.js');

chrome.runtime.onInstalled.addListener(() => {
  StorageManager.initializeStorage().catch(error => {
    console.error('Could not initialize Countries Quiz storage:', error);
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id || message?.type !== 'record-answer') return false;
  if (typeof message.correct !== 'boolean' || !Object.values(QUIZ_TYPES).includes(message.quizType) ||
      !message.country || typeof message.country.name !== 'string') {
    sendResponse({ ok: false, error: 'Invalid answer data' });
    return false;
  }
  StorageManager.updateScore(
    message.correct, message.quizType, message.country, message.userAnswer,
    message.correctAnswer, message.isReview === true
  ).then(scores => sendResponse({ ok: true, scores }), error => {
    console.error('Could not save answer:', error);
    sendResponse({ ok: false, error: 'Could not save answer' });
  });
  return true;
});
