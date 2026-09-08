// Runs the unpacked extension with real Chrome APIs and CSP, in an isolated profile.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'output', 'playwright');
fs.mkdirSync(output, { recursive: true });

(async () => {
  const context = await chromium.launchPersistentContext(fs.mkdtempSync(path.join(output, 'profile-')), {
    channel: 'chromium', headless: true, viewport: { width: 400, height: 600 },
    args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`]
  });
  const errors = [];
  context.setDefaultTimeout(10000);
  context.on('page', page => {
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error' && /Content Security Policy|Refused to execute/.test(message.text())) errors.push(message.text());
      if (message.type() === 'error') console.error('Browser:', message.text());
    });
  });
  try {
    const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
    const base = `chrome-extension://${new URL(worker.url()).hostname}`;
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    await page.goto(`${base}/popup.html`);
    await page.locator('.option-button').first().waitFor();
    assert.equal(await page.locator('.option-button').count(), 4);
    assert.equal(await page.locator('#total-questions').innerText(), '0');
    const question = await page.locator('#quiz-content').innerText();
    await page.locator('.option-button').first().press('Enter');
    await page.waitForFunction(() => document.getElementById('total-questions').textContent === '1');
    assert.equal(await page.locator('#quiz-content').innerText(), question, 'Enter must show feedback, not advance');
    assert.equal(await page.locator('.option-button:disabled').count(), 4);
    assert.equal(await page.locator('#feedback').isVisible(), true);
    const nextBounds = await page.locator('#next-button').boundingBox();
    assert(nextBounds.y + nextBounds.height <= 600, 'Next must remain visible after feedback');
    await page.screenshot({ path: path.join(output, 'popup-answer.png') });
    await page.locator('#next-button').press('Enter');
    assert.equal(await page.locator('.option-button:enabled').count(), 4);
    assert.equal(await page.locator('#feedback').isVisible(), false);
    assert.equal(await page.locator('#total-questions').innerText(), '1');

    for (const mode of ['flags', 'countries', 'capitals']) {
      await page.locator(`#quiz-${mode}`).click();
      assert.equal(await page.locator(`#quiz-${mode}`).getAttribute('aria-pressed'), 'true');
      assert.equal(await page.locator('.quiz-button[aria-pressed="true"]').count(), 1);
      assert.equal(await page.locator('.option-button').count(), 4);
      if (mode === 'flags') assert.equal(await page.locator('#flag-image').getAttribute('alt'), 'Flag to identify');
    }
    await page.reload();
    await page.waitForFunction(() => document.getElementById('total-questions').textContent === '1');
    const settingsOpened = context.waitForEvent('page');
    await page.locator('#settings-button').click();
    const settings = await settingsOpened;
    await settings.waitForLoadState();
    await settings.waitForFunction(() => !document.getElementById('theme').disabled);
    await settings.locator('#theme').selectOption('dark');
    await settings.waitForFunction(() => document.body.classList.contains('theme-dark'));
    await settings.locator('#timed-mode').check();
    for (const value of ['', '4', '61', '5.5']) {
      await settings.locator('#timer-duration').fill(value);
      await settings.locator('#timer-duration').press('Tab');
      assert.match(await settings.locator('#page-status').innerText(), /whole number/);
    }
    await settings.locator('#timer-duration').fill('5');
    await settings.locator('#timer-duration').press('Tab');
    await settings.waitForFunction(() => document.getElementById('page-status').textContent === 'Settings saved.');
    await settings.reload();
    await settings.waitForFunction(() => !document.getElementById('theme').disabled);
    assert.equal(await settings.locator('#timer-duration').inputValue(), '5');
    assert.equal(await settings.locator('#theme').inputValue(), 'dark');
    await page.reload();
    await page.waitForFunction(() => document.getElementById('total-questions').textContent === '2', { }, { timeout: 10000 });
    assert.match(await page.locator('#feedback').innerText(), /Incorrect/);
    await settings.locator('#timed-mode').uncheck();
    await settings.waitForFunction(() => document.getElementById('page-status').textContent === 'Settings saved.');

    const statsOpened = context.waitForEvent('page');
    await page.locator('#stats-button').click();
    const stats = await statsOpened;
    await stats.waitForLoadState();
    await stats.waitForFunction(() => document.getElementById('page-status').textContent === 'Statistics are up to date.');
    assert.equal(await stats.locator('#total-questions').innerText(), '2');
    await stats.setViewportSize({ width: 800, height: 900 });
    await stats.screenshot({ path: path.join(output, 'statistics.png'), fullPage: true });
    await stats.locator('#review-button').click();
    await stats.waitForURL('**/popup.html');
    await stats.locator('.review-badge').waitFor();
    // Inspect the staged question; submit through the real answer button.
    while (await stats.locator('.review-badge').count()) {
      const answer = await stats.evaluate(() => {
        const question = quizEngine.currentQuestion;
        return question.quizType === 'capitals' ? question.correctCountry.capital : question.correctCountry.name;
      });
      const button = stats.locator('.option-button').filter({ hasText: answer });
      if (await button.count()) await button.click();
      else {
        const index = await stats.locator('.option-button').evaluateAll((buttons, value) => buttons.findIndex(button => button.dataset.value === value), answer);
        await stats.locator('.option-button').nth(index).click();
      }
      await stats.waitForFunction(() => !document.getElementById('next-button').disabled);
      await stats.locator('#next-button').click();
    }
    assert.match(await stats.locator('#feedback').innerText(), /Review session finished/);
    await stats.locator('#review-button').click();
    assert.match(await stats.locator('#feedback').innerText(), /No missed questions/);
    assert.equal(await stats.locator('.option-button:enabled').count(), 4);
    await stats.setViewportSize({ width: 400, height: 600 });
    await stats.screenshot({ path: path.join(output, 'popup-dark.png') });
    assert(await stats.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Popup must not overflow horizontally');
    await stats.setViewportSize({ width: 320, height: 600 });
    assert(await stats.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Narrow popup must not overflow');
    await stats.screenshot({ path: path.join(output, 'popup-narrow.png') });
    await settings.setViewportSize({ width: 800, height: 900 });
    await settings.screenshot({ path: path.join(output, 'settings-dark.png'), fullPage: true });

    const downloadEvent = settings.waitForEvent('download');
    await settings.locator('#export-data').click();
    const download = await downloadEvent;
    const data = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
    assert(data.countriesQuizTotalQuestions >= 3);
    assert.equal(data.countriesQuizMissedQuestions.length, 0);
    settings.once('dialog', dialog => dialog.accept());
    await settings.locator('#reset-stats').click();
    await settings.waitForFunction(() => document.getElementById('page-status').textContent === 'Statistics reset.');
    await settings.reload();
    await settings.waitForFunction(() => !document.getElementById('theme').disabled);
    assert.equal(await settings.locator('#theme').inputValue(), 'dark', 'Reset must preserve settings');
    await stats.goto(`${base}/stats.html`);
    await stats.waitForFunction(() => document.getElementById('page-status').textContent === 'Statistics are up to date.');
    assert.equal(await stats.locator('#total-questions').innerText(), '0');
    assert.equal(await stats.locator('#review-button').isDisabled(), true);
    // A pending review request with no entries must still produce a playable quiz.
    await stats.evaluate(() => chrome.storage.local.set({ countriesQuizStartReviewMode: true }));
    await stats.goto(`${base}/popup.html`);
    await stats.locator('.option-button').first().waitFor();
    assert.equal(await stats.locator('.option-button:enabled').count(), 4);
    assert.match(await stats.locator('#feedback').innerText(), /No missed questions/);
    // Close immediately after submitting: persistence belongs to the worker.
    await stats.locator('.option-button').first().click();
    await stats.close();
    await page.reload();
    await page.waitForFunction(async () => (await chrome.storage.local.get('countriesQuizTotalQuestions')).countriesQuizTotalQuestions === 1);
    assert.deepEqual(errors, [], 'No runtime or CSP errors');
    console.log('PASS: real extension CSP, keyboard submission, modes, persistence, settings validation, timer, review, statistics, export, reset and popup fit.');
  } catch (error) {
    console.error('Runtime errors:', errors);
    for (const page of context.pages()) {
      if (!page.url().startsWith('chrome-extension:')) continue;
      console.error(page.url(), await page.locator('body').innerText());
    }
    throw error;
  } finally {
    await context.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
