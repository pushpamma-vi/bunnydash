/* ═══════════════════════════════════════════════════════════════
   TUNNEL SCREEN
   Kid's design: "if you make it, you will come in a tunnel"
   This is the celebration moment between completing a level
   and the quiz checkpoint. It runs for ~2.5 seconds with
   particles, a warm glow canvas, and an encouraging message.
═══════════════════════════════════════════════════════════════ */

const TunnelScreen = (() => {
  let _canvas, _ctx, _running = false, _frame = 0, _rafId = null;
  let _onDone = null;

  function show(level, stars, charId, onDone) {
    _onDone = onDone;
    _frame  = 0;
    _running = true;

    App.showScreen('tunnel');

    // Message
    const msgEl   = document.getElementById('tunnel-message');
    const subEl   = document.getElementById('tunnel-sub');
    const emojiEl = document.getElementById('tunnel-emoji');

    const charDef = window.Characters ? Characters.getById(charId) : null;

    if (msgEl) msgEl.textContent = _getLevelMessage(level);
    if (subEl) subEl.textContent = charDef
      ? `${charDef.name} says: "${_getCharMessage(charId)}" 💛`
      : 'Keep going, champion! 💛';
    if (emojiEl) emojiEl.textContent = charDef ? charDef.emoji : '✨';

    _canvas = document.getElementById('tunnel-canvas');
    if (_canvas) {
      _canvas.width  = window.innerWidth;
      _canvas.height = window.innerHeight;
      _ctx = _canvas.getContext('2d');
    }

    // Burst particles
    if (window.Particles) {
      Particles.clear();
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;
      Particles.spawn({ x: cx, y: cy, type: 'firework', count: 40, vyBias: -3 });
      Particles.spawn({ x: cx, y: cy, type: 'star',     count: 20 });
      if (stars > 3) Particles.spawn({ x: cx, y: cy, type: 'rainbow', count: 20 });
    }

    cancelAnimationFrame(_rafId);
    _loop();

    // Auto-advance after 2.5 seconds
    setTimeout(() => {
      if (_running) _finish();
    }, 2500);
  }

  function _loop() {
    if (!_running || !_canvas) return;
    _frame++;

    const w = _canvas.width, h = _canvas.height;
    const ctx = _ctx;

    // Deep golden tunnel atmosphere
    const grd = ctx.createRadialGradient(w/2, h/2, 20, w/2, h/2, w);
    const glow = 0.5 + Math.sin(_frame * 0.06) * 0.15;
    grd.addColorStop(0, `rgba(255,200,50,${glow})`);
    grd.addColorStop(0.4, 'rgba(160,80,0,0.6)');
    grd.addColorStop(1, 'rgba(10,0,30,1)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    // Tunnel ring rings (concentric arches rushing toward viewer)
    const ringCount = 8;
    for (let i = 0; i < ringCount; i++) {
      const t = ((_frame * 3 + i * (60 / ringCount)) % 60) / 60;
      const rx = w / 2;
      const ry = h * 0.55;
      const rw = (20 + t * w * 0.8);
      const rh = (12 + t * h * 0.5);
      const alpha = (1 - t) * 0.6;
      ctx.strokeStyle = `rgba(255,200,80,${alpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(rx, ry, rw / 2, rh / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (window.Particles) {
      Particles.update();
      Particles.draw(ctx);
    }

    _rafId = requestAnimationFrame(_loop);
  }

  function _finish() {
    _running = false;
    cancelAnimationFrame(_rafId);
    if (window.Particles) Particles.clear();
    if (_onDone) _onDone();
  }

  function _getLevelMessage(level) {
    const msgs = {
      1:  'You cleared your very first level! 🎉',
      5:  'Five levels down! You\'re flying! ✈️',
      10: 'Ten levels! The meadow cheers for you! 🌻',
      15: 'Level 15! A new friend is waiting... 🐣',
      20: 'Twenty levels! Look how far you\'ve come! 🌟',
      45: 'Level 45! Someone has been rolling toward you! 🌀',
      50: 'FIFTY LEVELS. Take a moment to feel that. 🏅',
      100: 'One hundred. You. Are. Incredible. 🌸',
      150: 'A rainbow horn appeared, just for you. 🦄',
      200: 'THE CHAMPION IS HERE. You made it. 🏆',
    };
    return msgs[level] || `Level ${level} complete! You made it through the tunnel! ✨`;
  }

  function _getCharMessage(charId) {
    const msgs = {
      fluff:     "My balloon has never glowed this bright!",
      baby:      "You caught me when I was small. I won't forget that.",
      rolli:     "You rolled right through it — just like I knew you would!",
      sof:       "Float with me. You've earned it.",
      fluffcone: "The horn glows brighter with every level.",
      champion:  "We did this together. Every single step.",
    };
    return msgs[charId] || "You made it! I'm so proud of you!";
  }

  return { show };
})();

window.TunnelScreen = TunnelScreen;
