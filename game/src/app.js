/* ═══════════════════════════════════════════════════════════════
   APP.JS  —  Main Application Coordinator
   ─────────────────────────────────────────────────────────────
   • App.showScreen(name)  — the single source of truth for
     screen transitions; every other file calls this.
   • App.showToast(msg)    — non-blocking notification banner.
   • App.startLevel(lvl, charId) — initiates the level flow.
   • Settings panel wiring (accessibility toggles, grade).
   • DOMContentLoaded init: loads save, binds all systems,
     decides whether to show splash, setup, or home.
═══════════════════════════════════════════════════════════════ */

const App = (() => {

  // ── Internal state ───────────────────────────────────────────
  let _activeScreen = null;
  let _toastTimer   = null;

  // ── Public: Screen router ────────────────────────────────────
  /**
   * Hide every screen div, activate the requested one,
   * then call per-screen onShow hooks.
   * @param {string} name  — matches the id suffix: #screen-{name}
   */
  function showScreen(name) {
    // Deactivate all
    document.querySelectorAll('.screen').forEach(el => {
      el.classList.remove('active');
    });

    // Activate target
    const target = document.getElementById(`screen-${name}`);
    if (!target) {
      console.warn(`[App] Unknown screen: "${name}"`);
      return;
    }
    target.classList.add('active');
    _activeScreen = name;

    // Per-screen hooks
    switch (name) {
      case 'splash':
        if (window.SplashScreen) SplashScreen.show();
        break;
      case 'setup':
        if (window.SetupScreen) SetupScreen.show();
        break;
      case 'home':
        if (window.HomeScreen) HomeScreen.show();
        break;
      case 'characters':
        if (window.CharactersScreen) CharactersScreen.show();
        break;
      case 'progress':
        if (window.ProgressScreen) ProgressScreen.show();
        break;
      // game, tunnel, quiz, unlock: their own init() / show() methods
      // handle setup; App.showScreen just reveals the element.
    }

    // Restore focus to body so keyboard events work cleanly
    document.body.focus();
  }

  // ── Public: Level flow entry point ───────────────────────────
  /**
   * Called by HomeScreen "Play" button and any restart logic.
   */
  function startLevel(level, charId) {
    if (window.GameScreen) {
      GameScreen.start(level, charId);
    }
  }

  // ── Public: Toast notification ───────────────────────────────
  /**
   * Show a brief non-blocking message banner at the bottom.
   * @param {string} msg
   * @param {number} [duration=3000]  ms to display
   */
  function showToast(msg, duration) {
    duration = duration || 3000;
    const toast = document.getElementById('toast');
    if (!toast) return;

    clearTimeout(_toastTimer);
    toast.textContent = msg;
    toast.classList.add('visible');

    _toastTimer = setTimeout(() => {
      toast.classList.remove('visible');
    }, duration);
  }

  // ── Settings panel population ─────────────────────────────────
  function _populateSettingsPanel() {
    // Grade selector
    const gradeSelect = document.getElementById('set-grade');
    if (gradeSelect && gradeSelect.options.length === 0) {
      const labels = ['Kindergarten','Grade 1','Grade 2','Grade 3','Grade 4',
                      'Grade 5','Grade 6','Grade 7','Grade 8'];
      labels.forEach((label, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = label;
        gradeSelect.appendChild(opt);
      });
      gradeSelect.value = Save.get().grade || 1;
      gradeSelect.addEventListener('change', () => {
        Save.patch({ grade: parseInt(gradeSelect.value, 10) });
        Save.persist();
      });
    }

    // Energy picker (inject buttons if not already present)
    const energyPicker = document.getElementById('settings-energy-picker');
    if (energyPicker && energyPicker.children.length === 0) {
      const levels = [
        { e: 1, emoji: '😴', label: 'Very tired' },
        { e: 2, emoji: '😐', label: 'A bit tired' },
        { e: 3, emoji: '🙂', label: 'Okay!' },
        { e: 4, emoji: '😊', label: 'Good!' },
        { e: 5, emoji: '🌟', label: 'Great!' },
      ];
      levels.forEach(({ e, emoji, label }) => {
        const btn = document.createElement('button');
        btn.className = 'energy-btn';
        btn.dataset.e = e;
        btn.setAttribute('aria-label', label);
        btn.innerHTML = `${emoji}<span>${label}</span>`;
        energyPicker.appendChild(btn);
      });
    }

    // Reset progress button
    const resetBtn = document.getElementById('btn-reset-all');
    if (resetBtn && !resetBtn.dataset.bound) {
      resetBtn.dataset.bound = '1';
      resetBtn.addEventListener('click', () => {
        const ok = window.confirm(
          'Reset ALL progress? This cannot be undone.\nAll levels, stars, and characters will be lost.'
        );
        if (ok) {
          Save.reset();
          location.reload();
        }
      });
    }
  }

  // ── Settings panel ───────────────────────────────────────────
  function _bindSettings() {
    const openBtn  = document.getElementById('btn-settings');
    const closeBtn = document.getElementById('btn-settings-close');
    const panel    = document.getElementById('settings-panel');

    if (openBtn)  openBtn.addEventListener('click',  () => {
      if (panel) panel.style.display = 'flex';
    });
    if (closeBtn) closeBtn.addEventListener('click', () => {
      if (panel) panel.style.display = 'none';
    });

    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('bunnybrave_gate_v1');
      window.location.href = '../index.html';
    });

    // Clicking the dim backdrop (the panel itself, outside the card) closes it
    if (panel) panel.addEventListener('click', e => {
      if (e.target === panel) panel.style.display = 'none';
    });

    // --- Accessibility toggles ---
    _bindToggle('set-tts',           val => {
      Save.patch({ settings: { ...Save.get().settings, tts: val } });
      if (window.TTS) TTS.setEnabled(val);
    });

    _bindToggle('set-contrast', val => {
      document.body.classList.toggle('high-contrast', val);
      Save.patch({ settings: { ...Save.get().settings, highContrast: val } });
    });

    _bindToggle('set-large-text',    val => {
      document.body.classList.toggle('large-text', val);
      Save.patch({ settings: { ...Save.get().settings, largeText: val } });
    });

    _bindToggle('set-reduce-motion', val => {
      document.body.classList.toggle('reduce-motion', val);
      Save.patch({ settings: { ...Save.get().settings, reduceMotion: val } });
    });

    // --- Energy update in settings ---
    const energyBtns = document.querySelectorAll('#settings-energy-picker .energy-btn');
    energyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        energyBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const val = parseInt(btn.dataset.e, 10);
        Save.patch({ energy: val });
        Save.persist();
        showToast(_energyMessage(val));
        // Refresh home hope message if we're on home screen
        if (_activeScreen === 'home') {
          const hopeEl = document.getElementById('hope-text');
          if (hopeEl && window.Hope) hopeEl.textContent = Hope.getHomeMessage(val);
        }
      });
    });
  }

  function _bindToggle(id, onChange) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', () => onChange(el.checked));
  }

  function _energyMessage(energy) {
    const msgs = {
      1: "Take it easy today — every step counts! 💙",
      2: "Low and slow is perfectly fine. We're here with you! 🌸",
      3: "Steady energy today — let's have some gentle fun! 🌟",
      4: "You're feeling good! Let's learn and play! ✨",
      5: "Full energy! Let's go, champion! 🚀"
    };
    return msgs[energy] || "You've got this! 💪";
  }

  // ── Apply saved accessibility settings ───────────────────────
  function _applySettings() {
    const settings = (Save.get().settings) || {};

    if (settings.highContrast)  document.body.classList.add('high-contrast');
    if (settings.largeText)     document.body.classList.add('large-text');
    if (settings.reduceMotion)  document.body.classList.add('reduce-motion');
    if (window.TTS) TTS.setEnabled(settings.tts !== false);

    // Sync toggle checkboxes
    _syncToggle('set-tts',           settings.tts !== false);
    _syncToggle('set-contrast',       !!settings.highContrast);
    _syncToggle('set-large-text',     !!settings.largeText);
    _syncToggle('set-reduce-motion',  !!settings.reduceMotion);

    // Sync energy picker in settings
    const savedEnergy = Save.get().energy || 3;
    const energyBtns  = document.querySelectorAll('#settings-energy-picker .energy-btn');
    energyBtns.forEach(b => {
      b.classList.toggle('active', parseInt(b.dataset.e, 10) === savedEnergy);
    });
  }

  function _syncToggle(id, value) {
    const el = document.getElementById(id);
    if (el) el.checked = value;
  }

  // ── Daily streak check ────────────────────────────────────────
  function _checkStreak() {
    const save = Save.get();
    const today = new Date().toDateString();

    if (!save.lastPlayedDate) {
      Save.patch({ lastPlayedDate: today, streakDays: 1, sessionsPlayed: (save.sessionsPlayed || 0) + 1 });
    } else if (save.lastPlayedDate !== today) {
      const last  = new Date(save.lastPlayedDate);
      const now   = new Date(today);
      const diff  = Math.round((now - last) / (1000 * 60 * 60 * 24));
      const newStreak = diff === 1 ? (save.streakDays || 1) + 1 : 1;
      Save.patch({
        lastPlayedDate: today,
        streakDays: newStreak,
        sessionsPlayed: (save.sessionsPlayed || 0) + 1
      });
    }
    Save.persist();
  }

  // ── Badge awarding ────────────────────────────────────────────
  function _checkAndAwardBadges() {
    const save   = Save.get();
    const badges = { ...(save.badges || {}) };
    let changed  = false;

    if (!badges.firstLevel && (save.completedLevels || []).length >= 1) {
      badges.firstLevel = true; changed = true;
      showToast('Badge earned: First Level! 🌟');
    }
    if (!badges.fiveLevels && (save.completedLevels || []).length >= 5) {
      badges.fiveLevels = true; changed = true;
      showToast('Badge earned: Five Levels! 🏅');
    }
    if (!badges.tenLevels && (save.currentLevel || 1) >= 10) {
      badges.tenLevels = true; changed = true;
      showToast('Badge earned: Ten Levels! 🥇');
    }
    if (!badges.streak3 && (save.streakDays || 0) >= 3) {
      badges.streak3 = true; changed = true;
      showToast('Badge earned: 3-Day Streak! 🔥');
    }
    if (!badges.streak7 && (save.streakDays || 0) >= 7) {
      badges.streak7 = true; changed = true;
      showToast('Badge earned: Week Warrior! 💫');
    }
    if (!badges.stars50 && (save.starCoins || 0) >= 50) {
      badges.stars50 = true; changed = true;
      showToast('Badge earned: Star Hoarder! ⭐');
    }

    if (changed) {
      Save.patch({ badges });
      Save.persist();
    }
  }

  // ── Boot sequence ─────────────────────────────────────────────
  function _init() {
    // 1. Load or create save
    Save.load();

    // 2. Check/update streak
    _checkStreak();

    // 3. Start auto-save
    Save.startAutoSave();

    // 4. Bind all screen init hooks
    if (window.SplashScreen)     SplashScreen.init();
    if (window.SetupScreen)      SetupScreen.init();
    if (window.HomeScreen)       HomeScreen.init();
    if (window.GameScreen)       GameScreen.init();
    if (window.ProgressScreen)   ProgressScreen.init();
    if (window.CharactersScreen) CharactersScreen.init();

    // 5. Bind quiz keyboard/button events (one-time setup)
    if (window.Quiz) Quiz.bindEvents();

    // 6. Populate settings panel dropdowns/pickers
    _populateSettingsPanel();

    // 7. Bind settings panel
    _bindSettings();

    // 8. Apply saved accessibility settings
    _applySettings();

    // 8. Start Questions session tracking
    if (window.Questions) Questions.startSession();

    // 9. Award any earned badges from previous sessions
    _checkAndAwardBadges();

    // 10. Unlock audio on first user interaction (mobile requirement)
    if (window.GameAudio) {
      const _unlockAudio = () => {
        GameAudio.unlock();
        document.removeEventListener('click', _unlockAudio);
        document.removeEventListener('touchstart', _unlockAudio);
      };
      document.addEventListener('click', _unlockAudio);
      document.addEventListener('touchstart', _unlockAudio);
    }

    // 11. Decide first screen
    if (Save.hasExistingGame()) {
      showScreen('home');
    } else {
      showScreen('splash');
    }
  }

  document.addEventListener('DOMContentLoaded', _init);

  // ── Expose public API ─────────────────────────────────────────
  return { showScreen, startLevel, showToast, checkBadges: _checkAndAwardBadges };

})();

window.App = App;
