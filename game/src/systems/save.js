/* ═══════════════════════════════════════════════════════════════
   SAVE SYSTEM
   Persists all player progress to localStorage.
   Auto-saves every 5 seconds as specified in GDD.
   Never deletes completed levels or correct answers.
═══════════════════════════════════════════════════════════════ */

const SAVE_KEY = 'bunnybrave_save_v1';

const Save = (() => {
  const defaults = () => ({
    playerName: '',
    grade: '3',
    energy: 3,
    currentLevel: 1,
    highestLevel: 1,
    starCoins: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    activeCharacter: 'fluff',
    unlockedCharacters: ['fluff'],
    sessionsPlayed: 0,
    lastPlayedDate: null,
    streakDays: 0,
    seenQuestionIds: [],          // bloom-style: IDs answered correctly 3+ times
    questionCorrectCount: {},     // questionId -> count
    subjectAccuracy: {            // last 10 answers per subject
      math: [], reading: [], science: []
    },
    settings: {
      largeText: false,
      highContrast: false,
      reduceMotion: false,
      tts: true,
    },
    badges: {
      showedUp: false,
      marathon: false,
      starCatcher: false,
      questionCrusher: false,
      rainbowWalker: false,
    },
    hopeIndex: 0,
    completedLevels: [],
  });

  let _data = null;

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        _data = Object.assign(defaults(), JSON.parse(raw));
      } else {
        _data = defaults();
      }
    } catch {
      _data = defaults();
    }
    return _data;
  }

  function get() {
    if (!_data) load();
    return _data;
  }

  function set(key, value) {
    if (!_data) load();
    _data[key] = value;
  }

  function patch(obj) {
    if (!_data) load();
    Object.assign(_data, obj);
  }

  function persist() {
    if (!_data) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(_data));
    } catch { /* storage full — silent */ }
  }

  function reset() {
    localStorage.removeItem(SAVE_KEY);
    _data = defaults();
    persist();
  }

  function hasExistingGame() {
    return !!localStorage.getItem(SAVE_KEY);
  }

  // Record an answered question; track correct counts
  function recordQuestion(questionId, correct, subject) {
    if (!_data) load();
    if (correct) {
      _data.totalCorrect++;
      _data.questionCorrectCount[questionId] =
        (_data.questionCorrectCount[questionId] || 0) + 1;
      // Retire question (add to seen list) after 3 correct answers
      if (
        _data.questionCorrectCount[questionId] >= 3 &&
        !_data.seenQuestionIds.includes(questionId)
      ) {
        _data.seenQuestionIds.push(questionId);
      }
    }
    _data.totalQuestions++;

    // Rolling window of last 10 per subject
    if (_data.subjectAccuracy[subject] !== undefined) {
      _data.subjectAccuracy[subject].push(correct ? 1 : 0);
      if (_data.subjectAccuracy[subject].length > 10) {
        _data.subjectAccuracy[subject].shift();
      }
    }
    persist();
  }

  // Compute difficulty direction for a subject
  function getDifficultyAdjustment(subject) {
    if (!_data) load();
    const window = _data.subjectAccuracy[subject] || [];
    if (window.length < 5) return 0; // not enough data yet
    const score = window.reduce((a, b) => a + b, 0) / window.length;
    if (score >= 0.8) return 1;   // step up
    if (score < 0.5) return -1;   // step down
    return 0;                      // hold
  }

  function completeLevel(level) {
    if (!_data) load();
    if (!_data.completedLevels.includes(level)) {
      _data.completedLevels.push(level);
    }
    if (level >= _data.highestLevel) {
      _data.highestLevel = level + 1;
    }
    _data.currentLevel = Math.max(_data.currentLevel, level + 1);

    // Streak tracking
    const today = new Date().toDateString();
    if (_data.lastPlayedDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (_data.lastPlayedDate === yesterday.toDateString()) {
        _data.streakDays++;
      } else if (_data.lastPlayedDate !== today) {
        _data.streakDays = 1;
      }
      _data.lastPlayedDate = today;
      _data.sessionsPlayed++;
    }
    persist();
  }

  function awardStars(count) {
    if (!_data) load();
    _data.starCoins = (_data.starCoins || 0) + count;
    persist();
  }

  // Unlock a character if conditions met
  function checkCharacterUnlocks() {
    if (!_data) load();
    const unlockMap = {
      baby:      15,
      rolli:     45,
      sof:       100,
      fluffcone: 150,
      champion:  200,
    };
    const newUnlocks = [];
    for (const [char, lvl] of Object.entries(unlockMap)) {
      if (
        _data.highestLevel > lvl &&
        !_data.unlockedCharacters.includes(char)
      ) {
        _data.unlockedCharacters.push(char);
        newUnlocks.push(char);
      }
    }
    if (newUnlocks.length) persist();
    return newUnlocks;
  }

  // Auto-save timer
  let _autoTimer = null;
  function startAutoSave() {
    if (_autoTimer) clearInterval(_autoTimer);
    _autoTimer = setInterval(persist, 5000);
  }
  function stopAutoSave() {
    if (_autoTimer) clearInterval(_autoTimer);
    _autoTimer = null;
  }

  return {
    load, get, set, patch, persist, reset,
    hasExistingGame,
    recordQuestion, getDifficultyAdjustment,
    completeLevel, awardStars, checkCharacterUnlocks,
    startAutoSave, stopAutoSave,
  };
})();

window.Save = Save;
