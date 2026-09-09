/* Settings page logic lives in an external file to comply with Manifest V3 CSP. */
(() => {
  const status = document.getElementById('page-status');
  const timer = document.getElementById('timer-duration');
  const controls = [...document.querySelectorAll('select, input, button')];
  let saveQueue = Promise.resolve();
  let lastSavedDuration = DEFAULT_SETTINGS.timerDuration;
  let settingsRevision = 0;

  function notify(message, isError = false) {
    status.classList.toggle('error', isError);
    status.textContent = message;
  }

  function applyTheme(theme) {
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
  }

  function saveSettings() {
    const revision = ++settingsRevision;
    const timedMode = document.getElementById('timed-mode').checked;
    let duration = Number(timer.value);
    if (!timer.value.trim() || !Number.isInteger(duration) || duration < 5 || duration > 60) {
      if (timedMode) {
        notify('Enter a whole number from 5 to 60 seconds. Your changes have not been saved.', true);
        timer.reportValidity();
        return;
      }
      // Turning the timer off must remain possible after an invalid edit.
      duration = lastSavedDuration;
      timer.value = duration;
    }
    const settings = {
      difficulty: document.getElementById('difficulty').value,
      region: document.getElementById('region').value,
      theme: document.getElementById('theme').value,
      timedMode,
      timerDuration: duration,
      soundEnabled: document.getElementById('sound-enabled').checked
    };
    notify('Saving settings…');
    // Preserve write order; only the latest edit owns the form's status.
    saveQueue = saveQueue.then(async () => {
      try {
        await StorageManager.updateSettings(settings);
        lastSavedDuration = settings.timerDuration;
        applyTheme(settings.theme);
        if (revision === settingsRevision) notify('Settings saved.');
      } catch (error) {
        console.error('Error saving settings:', error);
        if (revision === settingsRevision) {
          notify('Could not save your settings. Change the setting again to retry.', true);
        }
      }
    });
  }

  async function exportData() {
    const button = document.getElementById('export-data');
    button.disabled = true;
    try {
      await saveQueue;
      const data = await StorageManager.exportData();
      const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `countries-quiz-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify('Data export started.');
    } catch (error) {
      console.error('Error exporting data:', error);
      notify('Could not export your data. Please try again.', true);
    } finally {
      button.disabled = false;
    }
  }

  async function resetStats() {
    if (!window.confirm('Reset all quiz statistics and missed questions? This cannot be undone. Your settings will be kept.')) {
      return;
    }
    const button = document.getElementById('reset-stats');
    button.disabled = true;
    try {
      await StorageManager.resetStats();
      notify('Statistics reset.');
    } catch (error) {
      console.error('Error resetting statistics:', error);
      notify('Could not reset statistics. Please try again.', true);
    } finally {
      button.disabled = false;
    }
  }

  async function initialize() {
    controls.forEach(control => { control.disabled = true; });
    notify('Loading settings…');
    try {
      const settings = { ...DEFAULT_SETTINGS, ...await StorageManager.getSettings() };
      for (const key of ['difficulty', 'region', 'theme']) {
        const control = document.getElementById(key);
        control.value = settings[key];
        if (!control.value) {
          control.value = DEFAULT_SETTINGS[key];
        }
      }
      document.getElementById('timed-mode').checked = settings.timedMode === true;
      const duration = Number(settings.timerDuration);
      timer.value = Number.isInteger(duration) && duration >= 5 && duration <= 60 ? duration : 10;
      lastSavedDuration = Number(timer.value);
      document.getElementById('sound-enabled').checked = settings.soundEnabled !== false;
      applyTheme(settings.theme);
      controls.forEach(control => { control.disabled = false; });
      timer.disabled = !document.getElementById('timed-mode').checked;
      notify('Changes are saved automatically.');
    } catch (error) {
      console.error('Error loading settings:', error);
      notify('Could not load settings. Reload this page to retry.', true);
    }
  }

  document.querySelectorAll('select, input').forEach(control => control.addEventListener('change', () => {
    timer.disabled = !document.getElementById('timed-mode').checked;
    saveSettings();
  }));
  document.getElementById('export-data').addEventListener('click', exportData);
  document.getElementById('reset-stats').addEventListener('click', resetStats);
  initialize();
})();
