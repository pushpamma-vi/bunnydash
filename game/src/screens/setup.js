/* ═══════════════════════════════════════════════════════════════
   SETUP SCREEN
   First-time onboarding: name, grade, energy level.
   Only shown once; after this the player goes to Home each time.
═══════════════════════════════════════════════════════════════ */

const SetupScreen = (() => {

  let _selectedEnergy = 3; // default mid-range
  let _selectedGrade  = 1;

  function init() {
    // --- Energy picker ---
    const energyBtns = document.querySelectorAll('#energy-picker .energy-btn');
    energyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        energyBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        _selectedEnergy = parseInt(btn.dataset.e, 10);
      });
    });

    // Pre-select middle energy
    const midBtn = document.querySelector('#energy-picker .energy-btn[data-e="3"]');
    if (midBtn) midBtn.classList.add('active');

    // --- Grade selector ---
    const gradeSelect = document.getElementById('select-grade');
    if (gradeSelect) {
      gradeSelect.addEventListener('change', () => {
        _selectedGrade = parseInt(gradeSelect.value, 10);
      });
    }

    // --- Done button ---
    const doneBtn = document.getElementById('btn-setup-done');
    if (doneBtn) {
      doneBtn.addEventListener('click', _handleDone);
    }
  }

  function _handleDone() {
    const nameInput = document.getElementById('input-name');
    const name = nameInput ? nameInput.value.trim() : '';

    if (!name) {
      // Gently prompt for a name
      if (nameInput) {
        nameInput.classList.add('shake');
        nameInput.focus();
        setTimeout(() => nameInput.classList.remove('shake'), 600);
      }
      App.showToast("What's your name? We'd love to know! 😊");
      return;
    }

    const gradeSelect = document.getElementById('select-grade');
    if (gradeSelect) {
      _selectedGrade = parseInt(gradeSelect.value, 10) || 1;
    }

    Save.patch({
      playerName: name,
      grade: _selectedGrade,
      energy: _selectedEnergy
    });
    Save.persist();

    App.showScreen('home');
  }

  function show() {
    // Reset fields for re-use if "Start Over" was pressed
    const nameInput = document.getElementById('input-name');
    if (nameInput) nameInput.value = '';

    const gradeSelect = document.getElementById('select-grade');
    if (gradeSelect) {
      // Populate grades K-8 dynamically if not already done
      if (gradeSelect.options.length === 0) {
        const labels = ['Kindergarten','Grade 1','Grade 2','Grade 3','Grade 4',
                        'Grade 5','Grade 6','Grade 7','Grade 8'];
        labels.forEach((label, i) => {
          const opt = document.createElement('option');
          opt.value = i;
          opt.textContent = label;
          gradeSelect.appendChild(opt);
        });
      }
      gradeSelect.value = '1';
      _selectedGrade = 1;
    }

    // Reset energy picker
    const energyBtns = document.querySelectorAll('#energy-picker .energy-btn');
    energyBtns.forEach(b => b.classList.remove('active'));
    const midBtn = document.querySelector('#energy-picker .energy-btn[data-e="3"]');
    if (midBtn) midBtn.classList.add('active');
    _selectedEnergy = 3;

    // Focus name field after screen transition
    setTimeout(() => {
      const nameInput = document.getElementById('input-name');
      if (nameInput) nameInput.focus();
    }, 300);
  }

  return { init, show };
})();

window.SetupScreen = SetupScreen;
