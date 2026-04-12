/* ═══════════════════════════════════════════════════════════════
   CHARACTERS
   All five bunnies from the kid's original design, plus Champion.
   Each has: id, name, emoji, unlockLevel, power description,
   platformer stats (jump height/distance multiplier, special ability),
   lore, and a canvas draw function for the 200×200 home display.
═══════════════════════════════════════════════════════════════ */

const Characters = (() => {

  const DEFS = [
    {
      id: 'fluff',
      name: 'Fluff',
      emoji: '🐰',
      color: '#f5f5f5',
      accentColor: '#ff6b6b',
      unlockLevel: 0, // starting character
      unlockDesc: 'Your starting companion',
      powerName: 'Red Balloon Jump',
      powerDesc: 'Fluff\'s red balloon lets him jump a little higher and a little farther!',
      platformer: {
        jumpMultiplier: 1.25,   // higher
        speedMultiplier: 1.0,
        special: 'balloon_jump',
      },
      specialCooldown: 0, // always on
      learningTheme: 'Number sense & multiplication basics',
      lore: 'Fluff carries a red balloon given by his best friend on the first day of treatment. Every time he jumps high, he remembers that friend cheering for him. As the team grows, his balloon gets a gold star — and his jump gets even stronger.',
      balloonStars: 0, // increments when new characters unlock
    },
    {
      id: 'baby',
      name: 'Baby',
      emoji: '🐣',
      color: '#fffde7',
      accentColor: '#ffd166',
      unlockLevel: 15,
      unlockDesc: 'Unlocks at Level 15',
      powerName: 'Flutter Fall',
      powerDesc: 'Baby can flutter tiny wings to slow a fall and land safely!',
      platformer: {
        jumpMultiplier: 1.0,
        speedMultiplier: 0.9,
        special: 'flutter_fall', // press jump while falling = slow descent
      },
      specialCooldown: 4000,
      learningTheme: 'Addition, subtraction & phonics',
      lore: 'Baby just started their journey — small but so determined. The flutter-fall power means that even when things go wrong, you land safely. That\'s not weakness. That\'s resilience.',
    },
    {
      id: 'rolli',
      name: 'Rolli',
      emoji: '🌀',
      color: '#e8f4fd',
      accentColor: '#5bb8f5',
      unlockLevel: 45,
      unlockDesc: 'Unlocks at Level 45',
      powerName: 'Dash Roll',
      powerDesc: 'Rolli barrel-rolls horizontally to cover huge platform gaps — and is invincible during the roll!',
      platformer: {
        jumpMultiplier: 1.0,
        speedMultiplier: 1.3,
        special: 'dash_roll',    // double-tap right/left
      },
      specialCooldown: 3000,
      learningTheme: 'Multiplication tables & reading comprehension',
      lore: 'Rolli discovered that rolling through obstacles was faster than going around them — a metaphor for learning patterns, times tables, and sight words. Once you find the pattern, you zoom through!',
    },
    {
      id: 'sof',
      name: 'Sof',
      emoji: '🌸',
      color: '#f3e5f5',
      accentColor: '#ce93d8',
      unlockLevel: 100,
      unlockDesc: 'Unlocks at Level 100',
      powerName: 'Petal Float',
      powerDesc: 'Sof\'s double jump creates flower petal platforms that last 1 second — extra footholds in the air!',
      platformer: {
        jumpMultiplier: 1.1,
        speedMultiplier: 1.0,
        special: 'petal_float',  // double jump = petal platform appears
      },
      specialCooldown: 0,
      learningTheme: 'Division, fractions & creative writing',
      lore: 'Sof reached level 100. That means 100 days of showing up. Sof floats because lightness comes from strength earned — and you earned every bit of it.',
    },
    {
      id: 'fluffcone',
      name: 'Fluffcone',
      emoji: '🦄',
      color: '#fff9c4',
      accentColor: '#f48fb1',
      unlockLevel: 150,
      unlockDesc: 'Unlocks at Level 150',
      powerName: 'Horn Boost',
      powerDesc: 'Fluffcone sprints at hyper-speed for 3 seconds AND creates a rainbow platform bridge across any gap!',
      platformer: {
        jumpMultiplier: 1.2,
        speedMultiplier: 1.0,
        special: 'horn_boost',   // tap special = 3-sec sprint + bridge
      },
      specialCooldown: 6000,
      learningTheme: 'Advanced math, science & history',
      lore: 'Fluffcone proved that the impossible is possible. The rainbow horn grew when nobody was watching — during all those quiet, hard days of recovery. It was always going to be there. So were you.',
    },
    {
      id: 'champion',
      name: 'Champion',
      emoji: '🏆',
      color: '#fffde7',
      accentColor: '#ffd700',
      unlockLevel: 200,
      unlockDesc: 'Unlocks at Level 200',
      powerName: 'All Powers',
      powerDesc: 'The golden bunny carries all five powers combined — the full might of every bunny on the team!',
      platformer: {
        jumpMultiplier: 1.35,
        speedMultiplier: 1.25,
        special: 'all_powers',
      },
      specialCooldown: 5000,
      learningTheme: 'Cross-subject mastery',
      lore: 'You made it. Every day of treatment, every quiz, every level — it led here. You are the Champion. The whole Bunny Realm shines because of you.',
    },
  ];

  function getAll() { return DEFS; }

  function getById(id) {
    return DEFS.find(c => c.id === id) || DEFS[0];
  }

  function isUnlocked(id) {
    const save = window.Save ? window.Save.get() : null;
    if (!save) return id === 'fluff';
    return (save.unlockedCharacters || ['fluff']).includes(id);
  }

  /* ── Draw a bunny on a canvas ─────────────────────────────── */
  // Each bunny is drawn procedurally with canvas 2D.
  // This gives us full control and zero asset dependencies.

  function draw(ctx, id, x, y, scale = 1, frame = 0) {
    const def = getById(id);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    const bobY = Math.sin(frame * 0.08) * 3;
    ctx.translate(0, bobY);

    switch (id) {
      case 'fluff':      _drawFluff(ctx, def, frame); break;
      case 'baby':       _drawBaby(ctx, def, frame); break;
      case 'rolli':      _drawRolli(ctx, def, frame); break;
      case 'sof':        _drawSof(ctx, def, frame); break;
      case 'fluffcone':  _drawFluffcone(ctx, def, frame); break;
      case 'champion':   _drawChampion(ctx, def, frame); break;
      default:           _drawFluff(ctx, def, frame);
    }

    ctx.restore();
  }

  /* ── Individual bunny draw functions ─────────────────────── */

  function _drawFluff(ctx, def, frame) {
    // Body
    _bunnyBase(ctx, def.color, def.accentColor);
    // Red balloon (kid's original detail!)
    const bx = 32, by = -55 + Math.sin(frame * 0.05) * 4;
    ctx.save();
    ctx.beginPath();
    ctx.arc(bx, by, 14, 0, Math.PI * 2);
    ctx.fillStyle = def.accentColor;
    ctx.fill();
    ctx.strokeStyle = '#d63031';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Balloon string
    ctx.beginPath();
    ctx.moveTo(bx, by + 14);
    ctx.lineTo(18, -10);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Gold stars on balloon (one per unlocked character beyond fluff)
    const save = window.Save ? window.Save.get() : null;
    const unlocked = save ? (save.unlockedCharacters || []).length - 1 : 0;
    for (let i = 0; i < Math.min(unlocked, 5); i++) {
      _star(ctx, bx - 6 + i * 3, by + (i % 2 === 0 ? -4 : 2), 3, '#ffd700');
    }
    ctx.restore();
  }

  function _drawBaby(ctx, def, frame) {
    // Smaller, rounder
    ctx.save();
    ctx.scale(0.85, 0.85);
    _bunnyBase(ctx, def.color, def.accentColor);
    // Tiny wings on sides
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(side * 26, 0);
      ctx.rotate(side * (Math.sin(frame * 0.15) * 0.3 + 0.2));
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 7, side * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 220, 120, 0.7)';
      ctx.fill();
      ctx.strokeStyle = def.accentColor;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  function _drawRolli(ctx, def, frame) {
    // Extra chubby / round
    ctx.save();
    // Rolling tilt
    const tilt = Math.sin(frame * 0.12) * 0.15;
    ctx.rotate(tilt);
    // Rounder body
    ctx.beginPath();
    ctx.ellipse(0, 5, 30, 28, 0, 0, Math.PI * 2);
    ctx.fillStyle = def.color;
    ctx.fill();
    ctx.strokeStyle = '#aad4f5';
    ctx.lineWidth = 2;
    ctx.stroke();
    _bunnyEars(ctx, def.color, def.accentColor);
    _bunnyFace(ctx, def.accentColor);
    // Speed lines
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-35 - i * 8, -10 + i * 8);
      ctx.lineTo(-20 - i * 8, -10 + i * 8);
      ctx.strokeStyle = `rgba(91,184,245,${0.6 - i * 0.15})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
  }

  function _drawSof(ctx, def, frame) {
    _bunnyBase(ctx, def.color, def.accentColor);
    // Flower crown
    const flowers = 5;
    for (let i = 0; i < flowers; i++) {
      const angle = (i / flowers) * Math.PI * 2;
      const fx = Math.cos(angle) * 18;
      const fy = -45 + Math.sin(angle) * 6;
      ctx.beginPath();
      ctx.arc(fx, fy, 5, 0, Math.PI * 2);
      ctx.fillStyle = ['#ff6b6b','#ffd166','#6dbf67','#5bb8f5','#c9b1f7'][i];
      ctx.fill();
    }
    // Glow aura
    const grd = ctx.createRadialGradient(0, 0, 10, 0, 0, 45);
    grd.addColorStop(0, 'rgba(206,147,216,0)');
    grd.addColorStop(1, `rgba(206,147,216,${0.12 + Math.sin(frame * 0.06) * 0.05})`);
    ctx.beginPath();
    ctx.arc(0, 0, 45, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
  }

  function _drawFluffcone(ctx, def, frame) {
    _bunnyBase(ctx, def.color, def.accentColor);
    // Rainbow unicorn horn!
    ctx.save();
    ctx.translate(0, -70);
    ctx.rotate(Math.sin(frame * 0.05) * 0.06);
    const hornGrd = ctx.createLinearGradient(0, -28, 0, 0);
    hornGrd.addColorStop(0, '#ffd700');
    hornGrd.addColorStop(0.33, '#ff6b6b');
    hornGrd.addColorStop(0.66, '#5bb8f5');
    hornGrd.addColorStop(1, '#c9b1f7');
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(6, 0);
    ctx.lineTo(0, -28);
    ctx.closePath();
    ctx.fillStyle = hornGrd;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
    // Sparkle trail
    for (let i = 0; i < 4; i++) {
      const sx = -30 - i * 10 + Math.sin(frame * 0.1 + i) * 3;
      const sy = 5 + i * 6;
      _star(ctx, sx, sy, 3 - i * 0.4, ['#ffd700','#ff6b6b','#5bb8f5','#c9b1f7'][i]);
    }
  }

  function _drawChampion(ctx, def, frame) {
    // Golden bunny with trophy shimmer
    _bunnyBase(ctx, '#fffde7', '#ffd700');
    // Gold outline glow
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, 28, 26, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,215,0,${0.4 + Math.sin(frame * 0.08) * 0.3})`;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
    // Stars orbiting
    for (let i = 0; i < 5; i++) {
      const angle = (frame * 0.03) + (i / 5) * Math.PI * 2;
      const sx = Math.cos(angle) * 42;
      const sy = Math.sin(angle) * 30;
      _star(ctx, sx, sy, 4, '#ffd700');
    }
    // Mini crown
    ctx.save();
    ctx.translate(0, -64);
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(-12, 0); ctx.lineTo(-12, -14); ctx.lineTo(-6, -8);
    ctx.lineTo(0, -16); ctx.lineTo(6, -8); ctx.lineTo(12, -14);
    ctx.lineTo(12, 0); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#d4a500';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  /* ── Shared drawing utilities ─────────────────────────────── */

  function _bunnyBase(ctx, bodyColor, accentColor) {
    _bunnyEars(ctx, bodyColor, accentColor);
    // Body
    ctx.beginPath();
    ctx.ellipse(0, 5, 26, 24, 0, 0, Math.PI * 2);
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    // Tail
    ctx.beginPath();
    ctx.arc(-18, 12, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    _bunnyFace(ctx, accentColor);
  }

  function _bunnyEars(ctx, bodyColor, accentColor) {
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(side * 12, -42, 7, 20, side * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = bodyColor;
      ctx.fill();
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      // Inner ear
      ctx.beginPath();
      ctx.ellipse(side * 12, -42, 3.5, 13, side * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = accentColor;
      ctx.globalAlpha = 0.35;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function _bunnyFace(ctx, accentColor) {
    // Eyes
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(side * 9, -8, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#2d2d2d';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(side * 9 + 1.5, -9, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
    }
    // Nose
    ctx.beginPath();
    ctx.arc(0, -2, 3, 0, Math.PI * 2);
    ctx.fillStyle = accentColor;
    ctx.fill();
    // Smile
    ctx.beginPath();
    ctx.arc(0, 2, 8, 0.2, Math.PI - 0.2);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function _star(ctx, x, y, r, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const ir = r * 0.45;
      const a2 = ((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2;
      if (i === 0) ctx.moveTo(r * Math.cos(angle), r * Math.sin(angle));
      else ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
      ctx.lineTo(ir * Math.cos(a2), ir * Math.sin(a2));
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  return { getAll, getById, isUnlocked, draw };
})();

window.Characters = Characters;
