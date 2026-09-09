const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const settle = () => new Promise(resolve => setImmediate(resolve));

// Model the form's browser-facing value coercion and change events. Exercise the
// real page script through those events and observe its storage writes.
async function loadSettings(timerDuration = 20) {
  const controlIds = ['difficulty', 'region', 'theme', 'timed-mode', 'timer-duration', 'sound-enabled'];
  const elements = {};
  for (const id of [...controlIds, 'page-status', 'export-data', 'reset-stats']) {
    let value = '';
    elements[id] = {
      get value() { return value; },
      set value(next) { value = String(next); },
      checked: false, disabled: false, textContent: '', events: {},
      classList: { toggle() {} },
      addEventListener(name, handler) { this.events[name] = handler; },
      reportValidity() {}
    };
  }
  const writes = [];
  const storage = {
    getSettings: async () => ({ timedMode: true, timerDuration }),
    updateSettings: async settings => { writes.push(structuredClone(settings)); }
  };
  const context = vm.createContext({
    document: {
      getElementById: id => elements[id],
      querySelectorAll: selector => (selector.includes('button') ? [...controlIds, 'export-data', 'reset-stats'] : controlIds).map(id => elements[id]),
      body: { classList: { add() {}, remove() {} } }
    },
    StorageManager: storage,
    DEFAULT_SETTINGS: { difficulty: 'medium', region: 'all', theme: 'light', timedMode: false, timerDuration: 10, soundEnabled: true },
    console: { error() {} }
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/settings.js'), 'utf8'), context);
  await settle();
  return {
    elements, storage, writes,
    async change(id, value) {
      elements[id][id === 'timed-mode' ? 'checked' : 'value'] = value;
      elements[id].events.change();
      await settle();
    }
  };
}

test('invalid enabled durations are rejected; disabling restores the persisted duration', async () => {
  const page = await loadSettings(20);
  for (const invalid of ['', '4', '61', '5.5', 'invalid']) {
    await page.change('timer-duration', invalid);
    assert.equal(page.writes.length, 0);
  }
  await page.change('timed-mode', false);
  assert.equal(page.writes.length, 1);
  assert.equal(page.writes[0].timedMode, false);
  assert.equal(page.writes[0].timerDuration, 20);
  assert.equal(page.elements['timer-duration'].value, '20');
  assert.equal(page.elements['timer-duration'].disabled, true);
});

test('disabling restores the last successful save, never a failed duration update', async () => {
  const page = await loadSettings(20);
  await page.change('timer-duration', '30');
  const successfulWrite = page.storage.updateSettings;
  page.storage.updateSettings = async () => { throw new Error('Storage unavailable'); };
  await page.change('timer-duration', '45');
  assert.match(page.elements['page-status'].textContent, /Could not save/);
  page.storage.updateSettings = successfulWrite;
  await page.change('timer-duration', '');
  await page.change('timed-mode', false);
  assert.equal(page.writes.length, 2);
  assert.equal(page.writes[1].timedMode, false);
  assert.equal(page.writes[1].timerDuration, 30);
});

test('invalid stored duration falls back to the default when disabling timed mode', async () => {
  const page = await loadSettings(-1);
  await page.change('timer-duration', '');
  await page.change('timed-mode', false);
  assert.equal(page.writes[0].timerDuration, 10);
  assert.equal(page.writes[0].timedMode, false);
});

test('a pending save cannot overwrite a newer validation error', async () => {
  for (const fails of [false, true]) {
    const page = await loadSettings(20);
    let finish;
    page.storage.updateSettings = () => new Promise((resolve, reject) => {
      finish = () => fails ? reject(new Error('Storage unavailable')) : resolve();
    });
    await page.change('timer-duration', '30');
    await page.change('timer-duration', '');
    assert.match(page.elements['page-status'].textContent, /whole number/);
    finish();
    await settle();
    assert.match(page.elements['page-status'].textContent, /whole number/);
  }
});
