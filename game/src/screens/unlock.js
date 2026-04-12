/* ═══════════════════════════════════════════════════════════════
   UNLOCK SCREEN
   Shown when a new bunny character unlocks (at levels 15, 45,
   100, 150, 200). Full celebration with fireworks canvas,
   the character's lore, and a congratulations message.
═══════════════════════════════════════════════════════════════ */

const UnlockScreen = (() => {
  let _canvas, _ctx, _running = false, _frame = 0, _rafId = null;

  function show(charId, onDone) {
    _frame = 0;
    _running = true;

    const charDef = window.Characters ? Characters.getById(charId) : null;

    App.showScreen('unlock');

    const charEl  = document.getElementById('unlock-char');
    const titleEl = document.getElementById('unlock-title');
    const nameEl  = document.getElementById('unlock-name');
    const loreEl  = document.getElementById('unlock-lore');
    const contBtn = document.getElementById('btn-unlock-cont');

    if (charEl)  charEl.textContent  = charDef ? charDef.emoji : '🐰';
    if (titleEl) titleEl.textContent = 'New Bunny Unlocked! 🎉';
    if (nameEl)  nameEl.textContent  = charDef ? charDef.name : charId;
    if (loreEl)  loreEl.textContent  = window.Hope
      ? Hope.getUnlockMessage(charId)
      : charDef ? charDef.lore : '';

    if (contBtn) {
      const handler = () => {
        contBtn.removeEventListener('click', handler);
        _finish(onDone);
      };
      contBtn.addEventListener('click', handler);
    }

    _canvas = document.getElementById('unlock-canvas');
    if (_canvas) {
      _canvas.width  = window.innerWidth;
      _canvas.height = window.innerHeight;
      _ctx = _canvas.getContext('2d');
    }

    if (window.Particles) {
      Particles.clear();
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight * 0.35;
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          Particles.spawn({ x: cx + (Math.random()-0.5)*200, y: cy, type: 'firework', count: 30, vyBias: -4 });
        }, i * 350);
      }
    }

    cancelAnimationFrame(_rafId);
    _loop();

    // TTS announce
    if (window.TTS && window.Save && window.Save.get().settings.tts) {
      const msg = window.Hope ? Hope.getUnlockMessage(charId) : `${charDef ? charDef.name : charId} has joined your team!`;
      TTS.speak(msg);
    }
  }

  function _loop() {
    if (!_running || !_canvas) return;
    _frame++;

    const w = _canvas.width, h = _canvas.height;
    const ctx = _ctx;

    // Deep starfield background
    ctx.fillStyle = 'rgba(13,0,37,0.25)';
    ctx.fillRect(0, 0, w, h);

    // Orbiting stars around center
    for (let i = 0; i < 6; i++) {
      const angle = (_frame * 0.02) + (i / 6) * Math.PI * 2;
      const rx = w / 2 + Math.cos(angle) * w * 0.3;
      const ry = h * 0.35 + Math.sin(angle) * h * 0.15;
      ctx.beginPath();
      ctx.arc(rx, ry, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,215,0,${0.5 + Math.sin(_frame * 0.05 + i) * 0.3})`;
      ctx.fill();
    }

    if (window.Particles) {
      Particles.update();
      Particles.draw(ctx);
    }

    _rafId = requestAnimationFrame(_loop);
  }

  function _finish(onDone) {
    _running = false;
    cancelAnimationFrame(_rafId);
    if (window.Particles) Particles.clear();
    if (window.TTS) TTS.stop();
    if (onDone) onDone();
  }

  return { show };
})();

window.UnlockScreen = UnlockScreen;
