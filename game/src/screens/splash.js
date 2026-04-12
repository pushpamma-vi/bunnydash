/* ═══════════════════════════════════════════════════════════════
   SPLASH SCREEN
   Very first screen the child sees. Checks for an existing
   save and shows either "Continue Journey" or "Start New".
═══════════════════════════════════════════════════════════════ */

const SplashScreen = (() => {

  function init() {
    const btnNew      = document.getElementById('btn-start-new');
    const btnContinue = document.getElementById('btn-continue');

    if (btnNew) {
      btnNew.addEventListener('click', () => {
        if (window.Save && Save.hasExistingGame()) {
          // Confirm wipe
          const ok = window.confirm(
            "This will erase your saved journey and start over.\nAre you sure?"
          );
          if (!ok) return;
          Save.reset();
        }
        App.showScreen('setup');
      });
    }

    if (btnContinue) {
      btnContinue.addEventListener('click', () => {
        App.showScreen('home');
      });
    }
  }

  function show() {
    const btnContinue = document.getElementById('btn-continue');
    const btnNew      = document.getElementById('btn-start-new');

    const hasSave = window.Save && Save.hasExistingGame();

    if (btnContinue) {
      btnContinue.style.display = hasSave ? 'block' : 'none';
    }
    if (btnNew) {
      btnNew.textContent = hasSave ? 'Start Over' : 'Start Adventure';
    }

    // Floating bunny animation is handled purely by CSS `.float` class —
    // nothing needed here since #splash-bunny has class="bunny float"
  }

  return { init, show };
})();

window.SplashScreen = SplashScreen;
