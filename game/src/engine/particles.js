/* ═══════════════════════════════════════════════════════════════
   PARTICLES ENGINE
   Used for: star bursts, correct-answer confetti, tunnel glow,
   character unlock fireworks, and the Gray Cloud retreat effect.
═══════════════════════════════════════════════════════════════ */

const Particles = (() => {
  const _particles = [];

  function spawn(opts) {
    // opts: { x, y, type, canvas }
    const count = opts.count || 20;
    const types = {
      star:      { colors: ['#ffd700','#ffd166','#fff8b0','#f9ca24'], shape: 'star',    size: [6,12], speed: [2,5],  life: [60,100] },
      confetti:  { colors: ['#ff6b6b','#ffa04d','#ffd166','#6dbf67','#5bb8f5','#c9b1f7'], shape: 'rect', size: [5,10], speed: [2,6],  life: [80,140] },
      sparkle:   { colors: ['#ffffff','#fff8b0','#ffd700'], shape: 'circle', size: [3,6], speed: [1,3], life: [40,70] },
      firework:  { colors: ['#ff6b6b','#ffd700','#5bb8f5','#c9b1f7','#6dbf67','#fff'], shape: 'star', size: [4,10], speed: [3,8], life: [50,90] },
      rainbow:   { colors: ['#ff6b6b','#ffa04d','#ffd166','#6dbf67','#5bb8f5','#8b7bb5'], shape: 'circle', size: [8,16], speed: [1,3], life: [80,130] },
    };
    const cfg = types[opts.type] || types.confetti;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = cfg.speed[0] + Math.random() * (cfg.speed[1] - cfg.speed[0]);
      _particles.push({
        x: opts.x,
        y: opts.y,
        vx: Math.cos(angle) * spd + (opts.vxBias || 0),
        vy: Math.sin(angle) * spd + (opts.vyBias || -2),
        size: cfg.size[0] + Math.random() * (cfg.size[1] - cfg.size[0]),
        color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)],
        shape: cfg.shape,
        life: cfg.life[0] + Math.random() * (cfg.life[1] - cfg.life[0]),
        maxLife: 0,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        gravity: 0.12,
      });
      _particles[_particles.length - 1].maxLife = _particles[_particles.length - 1].life;
    }
  }

  function update() {
    for (let i = _particles.length - 1; i >= 0; i--) {
      const p = _particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.rotSpeed;
      p.life--;
      if (p.life <= 0) _particles.splice(i, 1);
    }
  }

  function draw(ctx) {
    for (const p of _particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else if (p.shape === 'star') {
        _drawStar(ctx, p.size / 2);
      }
      ctx.restore();
    }
  }

  function clear() { _particles.length = 0; }
  function count() { return _particles.length; }

  function _drawStar(ctx, r) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const ir = r * 0.45;
      const a2 = ((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2;
      if (i === 0) ctx.moveTo(r * Math.cos(a), r * Math.sin(a));
      else ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
      ctx.lineTo(ir * Math.cos(a2), ir * Math.sin(a2));
    }
    ctx.closePath();
    ctx.fill();
  }

  return { spawn, update, draw, clear, count };
})();

window.Particles = Particles;
