/* ═══════════════════════════════════════════════════════════════
   GAME SCREEN
   Wires the Platformer engine into the screen lifecycle.
   Handles pause/resume, fall-restart, level-complete flow.

   FLOW:
   startLevel(lvl, charId)
     → Platformer.startLevel(…, onComplete, onFall)
       onComplete(stars) → TunnelScreen → Quiz → handleQuizResult
       onFall            → fall message → restart same level
═══════════════════════════════════════════════════════════════ */

const GameScreen = (() => {

  let _currentLevel = 1;
  let _currentChar  = 'fluff';
  let _fallCount    = 0;

  function init() {
    // Pause button
    const pauseBtn   = document.getElementById('btn-pause');
    const resumeBtn  = document.getElementById('btn-resume');
    const quitBtn    = document.getElementById('btn-quit-level');
    const hudHomeBtn = document.getElementById('btn-hud-home');

    if (pauseBtn)   pauseBtn.addEventListener('click',   _handlePause);
    if (resumeBtn)  resumeBtn.addEventListener('click',  _handleResume);
    if (quitBtn)    quitBtn.addEventListener('click',    _handleQuit);
    if (hudHomeBtn) hudHomeBtn.addEventListener('click', _handleQuit);
  }

  // Called by App.startLevel(level, charId)
  function start(level, charId) {
    _currentLevel = level || 1;
    _currentChar  = charId || 'fluff';
    _fallCount    = 0;

    App.showScreen('game');

    // Size canvas to fill viewport and (re)init the platformer with it
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      Platformer.init(canvas);   // ← sets _canvas, _ctx, input handlers
    }

    // Update HUD
    const lvlLabel = document.getElementById('hud-level');
    if (lvlLabel) lvlLabel.textContent = `Level ${_currentLevel}`;

    _hidePauseOverlay();

    Platformer.startLevel(_currentLevel, _currentChar, _onLevelComplete, _onFall);
  }

  // ---- Platformer callbacks ----

  function _onLevelComplete(stars) {
    // Stars collected in the platformer run → tunnel celebration → quiz
    TunnelScreen.show(_currentLevel, stars, _currentChar, () => {
      Quiz.showForLevel(_currentLevel, _currentChar, _onQuizResult);
    });
  }

  function _onFall() {
    _fallCount++;

    const msg = window.Hope ? Hope.getFallMessage() : "Let's try again! You've got this! 💪";
    const overlay = document.getElementById('fall-overlay');
    const fallMsg = document.getElementById('fall-message');

    if (fallMsg) fallMsg.textContent = msg;
    if (overlay) {
      overlay.style.display = 'flex';
      setTimeout(() => { overlay.style.display = 'none'; }, 1500);
    }

    // Also speak the message
    if (window.TTS && window.Save && Save.get().settings.tts) {
      TTS.speak(msg);
    }

    // Restart same level after short pause
    setTimeout(() => {
      Platformer.startLevel(_currentLevel, _currentChar, _onLevelComplete, _onFall);
    }, 1600);
  }

  // ---- Quiz result ----

  function _onQuizResult(correct) {
    if (correct) {
      // Level beaten! Advance in save
      const newUnlocks = Save.completeLevel(_currentLevel);

      // Check for character unlocks
      const unlocked = Save.checkCharacterUnlocks();

      if (unlocked && unlocked.length > 0) {
        // Show each unlock screen sequentially, then go home
        _showUnlocksSequentially(unlocked, 0, () => App.showScreen('home'));
      } else {
        App.showScreen('home');
      }
    } else {
      // Quiz wasn't completed (shouldn't happen in normal flow, but guard)
      App.showScreen('home');
    }
  }

  function _showUnlocksSequentially(ids, index, whenDone) {
    if (index >= ids.length) {
      whenDone();
      return;
    }
    UnlockScreen.show(ids[index], () => {
      _showUnlocksSequentially(ids, index + 1, whenDone);
    });
  }

  // ---- Pause/Resume ----

  function _handlePause() {
    Platformer.pause();
    const overlay = document.getElementById('pause-overlay');
    if (overlay) overlay.style.display = 'flex';

    const hopeEl = document.getElementById('pause-hope');
    if (hopeEl && window.Hope) {
      hopeEl.textContent = Hope.getPause();
    }

    if (window.TTS && window.Save && Save.get().settings.tts && window.Hope) {
      TTS.speak(Hope.getPause());
    }
  }

  function _handleResume() {
    _hidePauseOverlay();
    Platformer.resume();
    if (window.TTS) TTS.stop();
  }

  function _handleQuit() {
    _hidePauseOverlay();
    Platformer.stop();
    if (window.TTS) TTS.stop();
    App.showScreen('home');
  }

  function _hidePauseOverlay() {
    const overlay = document.getElementById('pause-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  return { init, start };
})();

window.GameScreen = GameScreen;
