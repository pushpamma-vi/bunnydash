/* ═══════════════════════════════════════════════════════════════
   HOME CANVAS RENDERER
   Draws the active bunny character on the 200×200 home canvas
   with smooth animation loop.
═══════════════════════════════════════════════════════════════ */

const Renderer = (() => {
  let _canvas, _ctx, _frame = 0, _charId = 'fluff', _rafId = null;

  function init(canvas) {
    _canvas = canvas;
    _ctx    = canvas.getContext('2d');
    _loop();
  }

  function setChar(id) { _charId = id; }

  function _loop() {
    if (!_canvas) return;
    _frame++;
    const w = _canvas.width, h = _canvas.height;
    _ctx.clearRect(0, 0, w, h);

    // Radial bg glow
    const grd = _ctx.createRadialGradient(w/2, h/2, 10, w/2, h/2, w/2);
    grd.addColorStop(0, 'rgba(255,243,200,0.6)');
    grd.addColorStop(1, 'rgba(255,243,200,0)');
    _ctx.fillStyle = grd;
    _ctx.fillRect(0, 0, w, h);

    if (window.Characters) {
      Characters.draw(_ctx, _charId, w/2, h/2, 1.6, _frame);
    }

    _rafId = requestAnimationFrame(_loop);
  }

  function stop() { cancelAnimationFrame(_rafId); }

  return { init, setChar, stop };
})();

window.Renderer = Renderer;
