/* Use textContent for stored values so imported or damaged data cannot inject HTML. */
(() => {
  const status = document.getElementById('page-status');
  const types = [
    { key: 'capitals', name: '🏛️ Capitals' },
    { key: 'flags', name: '🚩 Flags' },
    { key: 'countries', name: '🌍 Countries' }
  ];

  function notify(message, isError = false) {
    status.classList.toggle('error', isError);
    status.textContent = message;
  }

  function element(className, text) {
    const node = document.createElement('div');
    node.className = className;
    if (text !== undefined) {
      node.textContent = String(text);
    }
    return node;
  }

  function count(value) {
    return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
  }

  function percentage(correct, total) {
    return total > 0 ? Math.round(Math.min(correct, total) / total * 100) : 0;
  }

  function displayQuizTypeStats(byQuizType = {}) {
    const container = document.getElementById('quiz-type-stats');
    container.replaceChildren();
    for (const type of types) {
      const data = byQuizType?.[type.key] || {};
      const total = count(data.total);
      const correct = Math.min(count(data.correct), total);
      const accuracy = percentage(correct, total);
      const info = element('quiz-type-info');
      info.append(element('quiz-type-name', type.name), element('quiz-type-details', `${correct} / ${total} correct`));
      const item = element('quiz-type-item');
      item.append(info, element('quiz-type-accuracy', `${accuracy}%`));
      const bar = element('progress-bar');
      bar.setAttribute('aria-hidden', 'true');
      const fill = element('progress-fill');
      fill.style.width = `${accuracy}%`;
      bar.appendChild(fill);
      const wrapper = element('quiz-type-wrapper');
      wrapper.append(item, bar);
      container.appendChild(wrapper);
    }
  }

  function displayHistory(history) {
    const container = document.getElementById('history-list');
    container.replaceChildren();
    const entries = Array.isArray(history) ? history.filter(item => item && typeof item === 'object') : [];
    if (!entries.length) {
      container.appendChild(element('no-data', 'No quiz history yet. Start playing to see your history!'));
      return;
    }
    for (const item of entries.slice(0, 20)) {
      const correct = item.correct === true;
      const row = element(`history-item ${correct ? 'correct' : 'incorrect'}`);
      const date = new Date(item.timestamp);
      const dateText = Number.isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleString([], {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      const info = element('history-info');
      const quizName = types.find(type => type.key === item.quizType)?.name || 'Quiz';
      info.append(element('history-country', item.country || 'Unknown country'), element('history-type', `${quizName} • ${dateText}`));
      const result = element('history-result', correct ? '✓' : '✗');
      result.setAttribute('role', 'img');
      result.setAttribute('aria-label', correct ? 'Correct' : 'Incorrect');
      row.append(info, result);
      container.appendChild(row);
    }
  }

  function displayCountryStats(byCountry) {
    const container = document.getElementById('country-stats-list');
    container.replaceChildren();
    const countries = Object.entries(byCountry || {})
      .map(([name, data]) => ({ name, total: count(data?.total), accuracy: percentage(count(data?.correct), count(data?.total)) }))
      .filter(country => country.total >= 2 && country.accuracy < 100)
      .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total);
    if (!countries.length) {
      container.appendChild(element('no-data', 'No countries need extra practice yet. Countries appear here after at least two attempts and one missed answer.'));
      return;
    }
    for (const country of countries.slice(0, 10)) {
      const row = element('country-stat-item');
      row.append(element('country-name', country.name), element('country-accuracy', `${country.accuracy}% (${country.total} attempts)`));
      container.appendChild(row);
    }
  }

  async function loadStats() {
    const [streak, totalCorrect, totalQuestions, stats, missed] = await Promise.all([
      StorageManager.getStreak(), StorageManager.getTotalCorrect(), StorageManager.getTotalQuestions(),
      StorageManager.getStats(), StorageManager.getMissedQuestions()
    ]);
    const total = count(totalQuestions);
    const correct = Math.min(count(totalCorrect), total);
    document.getElementById('overall-accuracy').textContent = `${percentage(correct, total)}%`;
    document.getElementById('current-streak').textContent = count(streak);
    document.getElementById('total-correct').textContent = correct;
    document.getElementById('total-questions').textContent = total;
    displayQuizTypeStats(stats?.byQuizType);
    displayHistory(stats?.quizHistory);
    displayCountryStats(stats?.byCountry);
    const missedCount = Array.isArray(missed) ? missed.length : 0;
    document.getElementById('missed-count').textContent = missedCount;
    document.getElementById('review-button').disabled = missedCount === 0;
    document.getElementById('clear-missed').disabled = missedCount === 0;
  }

  document.getElementById('review-button').addEventListener('click', async () => {
    const button = document.getElementById('review-button');
    button.disabled = true;
    try {
      const missed = await StorageManager.getMissedQuestions();
      if (!Array.isArray(missed) || !missed.length) {
        await loadStats();
        notify('No missed questions to review.');
        return;
      }
      await StorageManager.setStartReviewMode(true);
      window.location.href = 'popup.html';
    } catch (error) {
      console.error('Error starting review:', error);
      button.disabled = false;
      notify('Could not start review mode. Please try again.', true);
    }
  });

  function bindReset(id, confirmation, operation, successMessage) {
    const button = document.getElementById(id);
    button.addEventListener('click', async () => {
      if (!window.confirm(confirmation)) {
        return;
      }
      button.disabled = true;
      try {
        await operation();
        await loadStats();
        notify(successMessage);
      } catch (error) {
        console.error('Error updating statistics:', error);
        notify('Could not update statistics. Reload the page and try again.', true);
      } finally {
        if (id !== 'clear-missed') {
          button.disabled = false;
        } else {
          button.disabled = document.getElementById('missed-count').textContent === '0';
        }
      }
    });
  }

  bindReset('clear-missed', 'Clear all missed questions? This cannot be undone.', () => StorageManager.clearMissedQuestions(), 'Missed questions cleared.');
  bindReset('reset-all', 'Reset all quiz statistics and missed questions? This cannot be undone. Your settings will be kept.', () => StorageManager.resetStats(), 'Statistics reset.');
  document.getElementById('reload-page').addEventListener('click', () => window.location.reload());

  (async () => {
    notify('Loading statistics…');
    try {
      const settings = await StorageManager.getSettings();
      document.body.classList.add(settings?.theme === 'dark' ? 'theme-dark' : 'theme-light');
      await loadStats();
      notify('Statistics are up to date.');
    } catch (error) {
      console.error('Error loading statistics:', error);
      notify('Could not load statistics. Use Reload Page to retry.', true);
    }
  })();
})();
