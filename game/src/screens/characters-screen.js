/* ═══════════════════════════════════════════════════════════════
   CHARACTERS SCREEN
   Grid of all 6 bunnies: locked cards show the unlock requirement;
   unlocked cards can be selected as the active character.
   Clicking any card opens the lore side panel.
═══════════════════════════════════════════════════════════════ */

const CharactersScreen = (() => {

  let _loreCanvas, _loreCtx, _loreFrame = 0, _loreRafId, _loreCharId = null;

  function init() {
    const backBtn = document.getElementById('btn-back-chars');
    if (backBtn) backBtn.addEventListener('click', () => {
      _closeLore();
      App.showScreen('home');
    });

    const lorePanelClose = document.getElementById('char-lore-close');
    if (lorePanelClose) lorePanelClose.addEventListener('click', _closeLore);

    const selectBtn = document.getElementById('btn-select-char');
    if (selectBtn) selectBtn.addEventListener('click', _handleSelectChar);

    _loreCanvas = document.getElementById('lore-char-canvas');
    if (_loreCanvas) _loreCtx = _loreCanvas.getContext('2d');
  }

  function show() {
    _renderGrid();
    _closeLore();
  }

  function _renderGrid() {
    const grid = document.getElementById('character-grid');
    if (!grid || !window.Characters) return;
    grid.innerHTML = '';

    const save    = Save.get();
    const unlocked = save.unlockedCharacters || ['fluff'];
    const active   = save.activeCharacter   || 'fluff';

    Characters.getAll().forEach(charDef => {
      const isUnlocked = unlocked.includes(charDef.id);
      const isActive   = charDef.id === active;

      const card = document.createElement('div');
      card.className = [
        'char-card',
        isUnlocked ? 'unlocked' : 'locked',
        isActive   ? 'active-char' : ''
      ].filter(Boolean).join(' ');
      card.dataset.charId = charDef.id;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `${charDef.name} ${isUnlocked ? '' : '— locked until level ' + charDef.unlockLevel}`);

      card.innerHTML = `
        <div class="char-emoji">${isUnlocked ? charDef.emoji : '🔒'}</div>
        <div class="char-name">${charDef.name}</div>
        ${isActive ? '<div class="active-label">Active ✓</div>' : ''}
        ${!isUnlocked ? `<div class="unlock-label">Level ${charDef.unlockLevel}</div>` : ''}
      `;

      card.addEventListener('click',  () => _openLore(charDef.id));
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') _openLore(charDef.id); });

      grid.appendChild(card);
    });
  }

  function _openLore(charId) {
    if (!window.Characters) return;
    const charDef = Characters.getById(charId);
    if (!charDef) return;

    _loreCharId = charId;
    const save    = Save.get();
    const unlocked = save.unlockedCharacters || ['fluff'];
    const isUnlocked = unlocked.includes(charId);
    const isActive   = save.activeCharacter === charId;

    // Populate panel
    const nameEl    = document.getElementById('lore-char-name');
    const abilityEl = document.getElementById('lore-char-ability');
    const textEl    = document.getElementById('lore-char-text');
    const lockNote  = document.getElementById('lore-lock-note');
    const selectBtn = document.getElementById('btn-select-char');

    if (nameEl)    nameEl.textContent    = charDef.name;
    if (abilityEl) abilityEl.textContent = charDef.abilityLabel || charDef.special;
    if (textEl)    textEl.textContent    = charDef.lore;

    if (selectBtn) {
      if (!isUnlocked) {
        selectBtn.textContent = `Unlock at Level ${charDef.unlockLevel}`;
        selectBtn.disabled = true;
        selectBtn.classList.add('disabled');
      } else if (isActive) {
        selectBtn.textContent = 'Currently Active ✓';
        selectBtn.disabled = true;
        selectBtn.classList.add('disabled');
      } else {
        selectBtn.textContent = `Choose ${charDef.name}`;
        selectBtn.disabled = false;
        selectBtn.classList.remove('disabled');
      }
    }

    if (lockNote) {
      lockNote.textContent = !isUnlocked
        ? `Keep playing to unlock ${charDef.name} at Level ${charDef.unlockLevel}!`
        : '';
    }

    // Animate character in lore canvas
    _startLoreAnimation(charId);

    // Show panel
    const panel = document.getElementById('char-lore-panel');
    if (panel) panel.style.display = 'flex';
  }

  function _closeLore() {
    const panel = document.getElementById('char-lore-panel');
    if (panel) panel.style.display = 'none';
    _stopLoreAnimation();
    _loreCharId = null;
  }

  function _handleSelectChar() {
    if (!_loreCharId) return;
    const save = Save.get();
    const unlocked = save.unlockedCharacters || ['fluff'];
    if (!unlocked.includes(_loreCharId)) return;

    Save.patch({ activeCharacter: _loreCharId });
    Save.persist();

    _closeLore();
    _renderGrid();

    App.showToast(`${_getCharName(_loreCharId)} is now your explorer! 🐰`);

    // Update home renderer if it's running
    if (window.Renderer) Renderer.setChar(_loreCharId);
  }

  function _startLoreAnimation(charId) {
    _stopLoreAnimation();
    if (!_loreCanvas || !_loreCtx || !window.Characters) return;

    _loreCanvas.width  = 200;
    _loreCanvas.height = 200;
    _loreFrame = 0;

    function _animLoop() {
      _loreFrame++;
      const ctx = _loreCtx;
      ctx.clearRect(0, 0, 200, 200);

      // Soft background circle
      const grad = ctx.createRadialGradient(100, 110, 10, 100, 110, 90);
      grad.addColorStop(0, 'rgba(255,255,200,0.5)');
      grad.addColorStop(1, 'rgba(255,255,200,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(100, 110, 90, 0, Math.PI * 2);
      ctx.fill();

      // Bob the character
      const bobY = Math.sin(_loreFrame * 0.05) * 5;
      Characters.draw(ctx, charId, 100, 110 + bobY, 1.0, _loreFrame);

      _loreRafId = requestAnimationFrame(_animLoop);
    }
    _animLoop();
  }

  function _stopLoreAnimation() {
    cancelAnimationFrame(_loreRafId);
    _loreRafId = null;
  }

  function _getCharName(id) {
    if (!window.Characters) return id;
    const def = Characters.getById(id);
    return def ? def.name : id;
  }

  return { init, show };
})();

window.CharactersScreen = CharactersScreen;
