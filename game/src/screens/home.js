/* ═══════════════════════════════════════════════════════════════
   HOME SCREEN
   The hub the child returns to between every level.
   Shows greeting, hope message, current bunny, stats, and
   the Play button. Also handles the streak badge display.
═══════════════════════════════════════════════════════════════ */

const HomeScreen = (() => {

  function init() {
    const playBtn  = document.getElementById('btn-play');
    const charsBtn = document.getElementById('btn-characters');
    const progBtn  = document.getElementById('btn-progress');

    if (playBtn)  playBtn.addEventListener('click',  _handlePlay);
    if (charsBtn) charsBtn.addEventListener('click', () => App.showScreen('characters'));
    if (progBtn)  progBtn.addEventListener('click',  () => App.showScreen('progress'));

    // Grade picker
    const gradeChip  = document.getElementById('btn-grade-chip');
    const gradePanel = document.getElementById('grade-picker-panel');
    if (gradeChip && gradePanel) {
      gradeChip.addEventListener('click', () => {
        const open = gradePanel.style.display !== 'none';
        gradePanel.style.display = open ? 'none' : 'block';
        gradeChip.setAttribute('aria-expanded', String(!open));
      });
      document.querySelectorAll('.grade-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          const g = btn.dataset.grade;
          Save.patch({ grade: isNaN(g) ? g : parseInt(g, 10) });
          Save.persist();
          _updateGradeChip();
          gradePanel.style.display = 'none';
          gradeChip.setAttribute('aria-expanded', 'false');
          // Highlight selected
          document.querySelectorAll('.grade-opt').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          App.showToast(`Grade changed to ${_gradeLabel(g)} 🎓`);
        });
      });
    }
  }

  function show() {
    const save = Save.get();

    // --- Greeting ---
    const greetEl = document.getElementById('home-greeting');
    if (greetEl) {
      const hour = new Date().getHours();
      let timeGreet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
      greetEl.textContent = `${timeGreet}, ${save.playerName || 'friend'}! 🌟`;
    }

    // --- Hope banner ---
    const hopeEl = document.getElementById('hope-text');
    if (hopeEl && window.Hope) {
      hopeEl.textContent = Hope.getHomeMessage(save.energy);
    }

    // --- Stats row ---
    _updateStat('stat-stars',   save.starCoins  ?? 0);
    _updateStat('stat-level',   save.currentLevel ?? 1);
    _updateStat('stat-correct', save.totalCorrect ?? 0);

    // --- Active bunny name ---
    const nameEl = document.getElementById('home-bunny-name');
    if (nameEl && window.Characters) {
      const def = Characters.getById(save.activeCharacter || 'fluff');
      nameEl.textContent = def ? def.name : 'Fluff';
    }

    // --- Canvas character renderer ---
    const canvas = document.getElementById('home-bunny-canvas');
    if (canvas && window.Renderer) {
      Renderer.init(canvas);
      Renderer.setChar(save.activeCharacter || 'fluff');
    }

    // --- Streak badge ---
    const streakArea = document.getElementById('streak-area');
    const streakCount = document.getElementById('streak-count');
    if (streakArea) {
      if (save.streakDays && save.streakDays > 1) {
        if (streakCount) streakCount.textContent = save.streakDays;
        streakArea.style.display = 'block';
      } else {
        streakArea.style.display = 'none';
      }
    }

    // --- Level display on play button ---
    const levelNumEl = document.getElementById('home-level-num');
    if (levelNumEl) levelNumEl.textContent = save.currentLevel || 1;

    // --- Grade chip ---
    _updateGradeChip();

    // Highlight the current grade option
    const g = String(save.grade ?? '3');
    document.querySelectorAll('.grade-opt').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.grade === g);
    });

    // --- Admin shortcut (only when admin gate code was used) ---
    const adminBtn = document.getElementById('btn-admin-shortcut');
    if (adminBtn) {
      const isAdmin = localStorage.getItem('bunnybrave_gate_v1') === 'admin';
      adminBtn.style.display = isAdmin ? 'inline-flex' : 'none';
    }
  }

  function _gradeLabel(g) {
    const labels = { K:'Kindergarten', 0:'Kindergarten', 1:'Grade 1', 2:'Grade 2', 3:'Grade 3',
                     4:'Grade 4', 5:'Grade 5', 6:'Grade 6', 7:'Grade 7', 8:'Grade 8' };
    return labels[g] ?? `Grade ${g}`;
  }

  function _updateGradeChip() {
    const save = Save.get();
    const g = save.grade ?? '3';
    const el = document.getElementById('grade-chip-text');
    if (el) el.textContent = _gradeLabel(String(g));
  }

  function _updateStat(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function _handlePlay() {
    const save = Save.get();
    const lvl  = save.currentLevel || 1;
    const char = save.activeCharacter || 'fluff';

    // Pause home canvas renderer before leaving
    if (window.Renderer) Renderer.stop();

    App.startLevel(lvl, char);
  }

  return { init, show };
})();

window.HomeScreen = HomeScreen;
