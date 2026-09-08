const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const scripts = [
  'data/countries.js', 'data/regions.js', 'data/facts.js',
  'js/constants.js', 'js/storage-manager.js', 'js/quiz-engine.js'
];

// Every context represents a separate extension page. Reads and writes cross an
// asynchronous serialization boundary, as Chrome storage does; locks are shared.
function createBackend(initial = {}) {
  const data = structuredClone(initial);
  const queues = new Map();
  return {
    data,
    storage: {
      get(keys, callback) {
        const names = keys === null ? Object.keys(data) : (Array.isArray(keys) ? keys : [keys]);
        const snapshot = Object.fromEntries(names.filter(key => key in data).map(key => [key, data[key]]));
        const result = structuredClone(snapshot);
        setImmediate(() => callback(result));
      },
      set(values, callback) {
        const snapshot = structuredClone(values);
        setImmediate(() => {
          Object.assign(data, snapshot);
          callback();
        });
      }
    },
    locks: {
      request(name, operation) {
        const result = (queues.get(name) || Promise.resolve()).then(() => operation({ name }));
        queues.set(name, result.catch(() => {}));
        return result;
      }
    }
  };
}

async function loadApp(backend = createBackend()) {
  const context = vm.createContext({
    console: { log() {}, error() {}, warn() {} },
    chrome: { storage: { local: backend.storage }, runtime: {} },
    navigator: { locks: backend.locks }
  });
  for (const file of scripts) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
  }
  const app = vm.runInContext('({ engine: quizEngine, storage: StorageManager, keys: STORAGE_KEYS, defaults: DEFAULT_SETTINGS, types: QUIZ_TYPES, regions: REGIONS, difficulties: DIFFICULTY, config: QUIZ_CONFIG })', context);
  await app.engine.init();
  return { ...app, backend };
}

test('a question accepts exactly one submission and a new question can be answered', async () => {
  const { engine } = await loadApp();
  const question = engine.generateQuestion();
  assert.equal(engine.checkAnswer(question.correctCountry.capital).correct, true);
  assert.equal(engine.checkAnswer('wrong'), null);
  assert.equal(engine.checkAnswer(question.correctCountry.capital), null);
  const next = engine.generateQuestion();
  assert.equal(engine.checkAnswer(next.correctCountry.capital).correct, true);
});

test('answer results retain the question mode and review identity after navigation', async () => {
  const { engine, types } = await loadApp();
  const question = engine.generateQuestion();
  engine.setQuizType(types.FLAGS);
  const result = engine.checkAnswer(question.correctCountry.capital);
  assert.equal(result.correct, true);
  assert.equal(result.quizType, types.CAPITALS);
  assert.equal(result.reviewQuestion, null);

  const missed = { country: engine.countriesData[0].name, quizType: types.COUNTRIES };
  engine.startReviewMode([missed]);
  const review = engine.generateQuestion();
  const reviewResult = engine.checkAnswer(review.correctCountry.name);
  engine.stopReviewMode();
  engine.setQuizType(types.CAPITALS);
  engine.generateQuestion();
  assert.equal(reviewResult.correct, true);
  assert.equal(reviewResult.quizType, types.COUNTRIES);
  assert.deepEqual(structuredClone(reviewResult.reviewQuestion), missed);
});

test('every nonempty region/difficulty filter produces four distinct answers in every mode', async () => {
  const { engine, types, regions, difficulties, config } = await loadApp();
  let checked = 0;
  for (const region of Object.values(regions)) {
    for (const difficulty of ['all', ...Object.values(difficulties)]) {
      engine.settings = { ...engine.settings, region, difficulty };
      const targets = engine.countriesData.filter(country =>
        (region === 'all' || country.region === region) &&
        (difficulty === 'all' || country.difficulty === difficulty));
      for (const type of Object.values(types)) {
        engine.setQuizType(type);
        if (!targets.length) {
          assert.throws(() => engine.generateQuestion(), /No countries match/);
          assert.equal(engine.currentQuestion, null);
          continue;
        }
        for (let run = 0; run < 4; run++) {
          const question = engine.generateQuestion();
          const label = `${region}/${difficulty}/${type}`;
          assert.ok(targets.some(country => country.name === question.correctCountry.name), label);
          assert.equal(question.options.length, config.NUM_OPTIONS, label);
          const values = question.options.map(country => engine.normalizeString(type === types.CAPITALS ? country.capital : country.name));
          assert.equal(new Set(values).size, config.NUM_OPTIONS, label);
          assert.equal(question.options.filter(country => country.name === question.correctCountry.name).length, 1, label);
          checked++;
        }
      }
    }
  }
  assert.ok(checked > 100);
});

test('review removes duplicates, unknown countries, and unsupported modes', async () => {
  const { engine, types } = await loadApp();
  const country = engine.countriesData[0].name;
  engine.startReviewMode([
    { country, quizType: types.CAPITALS },
    { country, quizType: types.CAPITALS },
    { country, quizType: types.FLAGS },
    { country: 'Not a country', quizType: types.FLAGS },
    { country, quizType: 'unsupported' },
    {}
  ]);
  assert.equal(engine.getRemainingReviewCount(), 2);
  assert.equal(engine.generateQuestion().quizType, types.CAPITALS);
  assert.equal(engine.generateQuestion().quizType, types.FLAGS);
  engine.generateQuestion();
  assert.equal(engine.isReviewMode(), false);
  assert.equal(engine.getCurrentReviewQuestion(), null);
});

test('review tolerates null and primitive entries from stored data', async () => {
  const { engine, types } = await loadApp();
  const country = engine.countriesData[0].name;
  engine.startReviewMode([null, undefined, 42, 'bad', { country, quizType: types.FLAGS }]);
  assert.equal(engine.getRemainingReviewCount(), 1);
  assert.equal(engine.generateQuestion().correctCountry.name, country);
});

test('score, streak, history, and missed-question resolution stay consistent', async () => {
  const { storage, engine, types } = await loadApp();
  await storage.initializeStorage();
  const country = engine.countriesData[0];
  const record = (correct, type = types.CAPITALS, review = false) =>
    storage.updateScore(correct, type, country, correct ? country.capital : 'wrong', country.capital, review);
  assert.deepEqual(structuredClone(await record(true)), { score: 100, streak: 1, totalCorrect: 1, totalQuestions: 1 });
  assert.deepEqual(structuredClone(await record(false)), { score: 50, streak: 0, totalCorrect: 1, totalQuestions: 2 });
  await record(false);
  assert.equal((await storage.getMissedQuestions()).length, 1);
  await record(false, types.FLAGS);
  assert.equal((await storage.getMissedQuestions()).length, 2);
  await record(true); // Ordinary practice does not clear the review queue.
  assert.equal((await storage.getMissedQuestions()).length, 2);
  assert.deepEqual(structuredClone(await record(true, types.CAPITALS, true)), { score: 50, streak: 2, totalCorrect: 3, totalQuestions: 6 });
  const missed = await storage.getMissedQuestions();
  assert.equal(missed.length, 1);
  assert.equal(missed[0].quizType, types.FLAGS);
  const stats = await storage.getStats();
  assert.deepEqual(structuredClone(stats.byQuizType.capitals), { correct: 3, total: 5 });
  assert.deepEqual(structuredClone(stats.byCountry[country.name]), { correct: 3, total: 6 });
  assert.equal(stats.quizHistory.length, 6);
  assert.equal(stats.quizHistory[0].correct, true);
});

test('concurrent writes from separate extension contexts retain every answer', async () => {
  const backend = createBackend();
  const [first, second] = await Promise.all([loadApp(backend), loadApp(backend)]);
  await first.storage.initializeStorage();
  const country = first.engine.countriesData[0];
  await Promise.all(Array.from({ length: 24 }, (_, index) => {
    const app = index % 2 ? first : second;
    return app.storage.updateScore(true, app.types.CAPITALS, country, country.capital, country.capital);
  }));
  assert.equal(await first.storage.getTotalQuestions(), 24);
  assert.equal(await first.storage.getTotalCorrect(), 24);
  assert.equal(await first.storage.getStreak(), 24);
  assert.equal((await first.storage.getStats()).quizHistory.length, 24);
  assert.equal((await second.storage.getStats()).byCountry[country.name].total, 24);
});

test('initialization fills missing keys and preserves existing progress across repeated starts', async () => {
  const { storage, backend, keys, defaults } = await loadApp();
  backend.data[keys.SCORE] = 75;
  backend.data[keys.TOTAL_CORRECT] = 3;
  backend.data[keys.TOTAL_QUESTIONS] = 4;
  backend.data[keys.MISSED_QUESTIONS] = [{ country: 'France', quizType: 'flags' }];
  await storage.initializeStorage();
  assert.equal(await storage.getScore(), 75);
  assert.equal(await storage.getTotalCorrect(), 3);
  assert.equal(await storage.getTotalQuestions(), 4);
  assert.equal(await storage.getStreak(), 0);
  assert.deepEqual(structuredClone(await storage.getSettings()), structuredClone(defaults));
  assert.equal((await storage.getMissedQuestions()).length, 1);
  const snapshot = structuredClone(backend.data);
  await storage.initializeStorage();
  assert.deepEqual(backend.data, snapshot);
});

test('invalid stored settings fall back while valid values survive', async () => {
  const { storage, backend, keys, defaults } = await loadApp();
  backend.data[keys.SETTINGS] = {
    difficulty: 'impossible', region: 'Mars', theme: 'neon',
    soundEnabled: 'yes', timedMode: 1, timerDuration: -5
  };
  assert.deepEqual(structuredClone(await storage.getSettings()), structuredClone(defaults));
  const valid = { difficulty: 'all', region: 'Europe', theme: 'dark', soundEnabled: false, timedMode: true, timerDuration: 60 };
  backend.data[keys.SETTINGS] = valid;
  assert.deepEqual(structuredClone(await storage.getSettings()), valid);
  for (const duration of [0, 4, 61, 7.5, '10', null]) {
    backend.data[keys.SETTINGS] = { timerDuration: duration };
    assert.equal((await storage.getSettings()).timerDuration, defaults.timerDuration);
  }
});

test('all country entries have matching regional metadata', async () => {
  const { engine, regions, difficulties } = await loadApp();
  for (const country of engine.countriesData) {
    assert.ok(Object.values(regions).includes(country.region), country.name);
    assert.ok(Object.values(difficulties).includes(country.difficulty), country.name);
  }
});

test('malformed missed entries cannot prevent saving an answer or clearing a launch request', async () => {
  const { storage, backend, keys, engine } = await loadApp();
  await storage.initializeStorage();
  backend.data[keys.MISSED_QUESTIONS] = [null, 1, {}, { country: 'France', quizType: 'capitals' }];
  backend.data[keys.START_REVIEW_MODE] = true;
  const country = engine.countriesData[0];
  await storage.updateScore(false, 'capitals', country, 'wrong', country.capital);
  assert.equal(await storage.getTotalQuestions(), 1);
  assert.equal((await storage.getMissedQuestions()).length, 2);
  await storage.clearMissedQuestions();
  assert.equal(await storage.getAndClearStartReviewMode(), false);
  backend.data[keys.START_REVIEW_MODE] = true;
  await storage.resetStats();
  assert.equal(await storage.getAndClearStartReviewMode(), false);
});
