/* ═══════════════════════════════════════════════════════════════
   PLATFORMER ENGINE
   Implements the kid's exact level design:
   - Rainbow path platforms at height (World 4+)
   - Below is grass (you're very high up)
   - Fall = restart level, character comes back
   - Reach the tunnel = level complete
   - Levels get harder every time
   - Stars to collect
   - Each character's power (balloon jump, flutter fall, dash roll, etc.)
═══════════════════════════════════════════════════════════════ */

const Platformer = (() => {
  let _canvas, _ctx;
  let _running = false;
  let _rafId = null;
  let _frame = 0;

  // Physics constants
  const GRAVITY     = 0.45;
  const BASE_SPEED  = 3.6;
  const BASE_JUMP   = -11;

  // Level state
  let _level      = 1;
  let _charId     = 'fluff';
  let _charDef    = null;
  let _onComplete = null;
  let _onFall     = null;
  let _levelDone  = false;   // guard: fire onComplete only once
  let _fellRecently = false; // guard: fire onFall only once per fall

  // Player state
  const player = {
    x: 80, y: 0,
    vx: 0, vy: 0,
    w: 32, h: 36,
    onGround: false,
    facing: 1,        // 1 = right, -1 = left
    frame: 0,
    special: false,
    specialTimer: 0,
    jumpsLeft: 1,
    rollTimer: 0,
    petalPlatforms: [],
  };

  // World state
  let _platforms   = [];
  let _stars       = [];
  let _tunnel      = null;
  let _worldScroll = 0;
  let _levelWidth  = 0;
  let _starsCollected = 0;
  let _camera      = { x: 0, y: 0 };

  // Colors per world theme (based on level)
  function _worldTheme(level) {
    if (level <= 20)  return { sky: '#b8e4ff', ground: '#6dbf67', groundDark: '#4a9644', accent: '#ffd166' };
    if (level <= 40)  return { sky: '#1a1a3e', ground: '#4a3680', groundDark: '#2e1f5e', accent: '#a988f7' };
    if (level <= 70)  return { sky: '#c8e6f5', ground: '#f0f8ff', groundDark: '#b0d8f0', accent: '#ffffff' };
    if (level <= 110) return { sky: '#0d0025', ground: '#2d1455', groundDark: '#1a0a3d', accent: '#ff6b6b', rainbow: true };
    if (level <= 155) return { sky: '#000820', ground: '#0a1a4d', groundDark: '#060e2d', accent: '#5bb8f5' };
    return             { sky: '#e8f7ff', ground: '#afd8e0', groundDark: '#7bbfcc', accent: '#ffd700', rainbow: true };
  }

  /* ── Level generation ─────────────────────────────────────── */
  function _generateLevel(level) {
    const theme     = _worldTheme(level);
    const cfg       = _levelConfig(level);
    const isRainbow = theme.rainbow;

    _platforms  = [];
    _stars      = [];
    _levelWidth = cfg.levelWidth;

    // Fixed world coordinates — all math is relative to these
    const GROUND_Y = 340;
    const Y_MIN    = 80;   // highest allowed platform (near top of canvas)
    const Y_MAX    = 330;  // lowest normal platform

    // ── Starting safe platform (always wide, always flat) ──────
    _platforms.push({ x: 0, y: GROUND_Y, w: 230, h: 20, color: '#6dbf67', type: 'ground', safe: true });

    let px   = 250;
    let curY = GROUND_Y;  // ← PATH WALKER: curY tracks the current elevation

    // ── Schedule deliberate climb sections across the level ────
    // Each climb: 3-4 forced upward jumps, then a descent back down.
    // Even L2 has 1 climb so it looks visibly different from L1.
    const climbTriggers = [];
    for (let c = 0; c < cfg.climbSections; c++) {
      climbTriggers.push((_levelWidth / (cfg.climbSections + 1)) * (c + 1));
    }
    let climbTriggerIdx = 0;
    let climbSteps      = 0;  // upward steps remaining
    let descentSteps    = 0;  // downward steps remaining after climb

    while (px < _levelWidth - 360) {
      const gap = cfg.gapMin + Math.random() * cfg.gapVar;
      const pw  = isRainbow
        ? _rainbowPlatformWidth(level, px)
        : Math.max(28, cfg.platWidth + (Math.random() - 0.5) * cfg.platWidthVar);

      // ── Elevation: path-walker so height variation ACCUMULATES ─
      let dy = 0;
      if (climbSteps > 0) {
        // Forced climb upward — each step requires a full jump
        const rise = cfg.heightStep > 0
          ? cfg.heightStep * (0.75 + Math.random() * 0.45)
          : 35;
        dy = -rise;
        climbSteps--;
        if (climbSteps === 0) descentSteps = 3;
      } else if (descentSteps > 0) {
        // Gentle descent after the climb
        const drop = cfg.heightStep > 0
          ? cfg.heightStep * (0.4 + Math.random() * 0.35)
          : 18;
        dy = drop;
        descentSteps--;
      } else {
        // Free random walk — variance grows with level
        dy = (Math.random() * 2 - 1) * cfg.heightStep;

        // Trigger a scheduled climb section?
        if (
          climbTriggerIdx < climbTriggers.length &&
          px >= climbTriggers[climbTriggerIdx]
        ) {
          climbSteps = 3 + Math.floor(Math.random() * 2); // 3-4 upward steps
          climbTriggerIdx++;
        }
      }

      curY = Math.max(Y_MIN, Math.min(Y_MAX, curY + dy));

      const color = isRainbow ? _rainbowColor(pw) : theme.accent;

      // ── Moving platform? ──────────────────────────────────────
      const wantsMoving = climbSteps === 0 && Math.random() < cfg.movingChance;
      // ── Blinking platform? ───────────────────────────────────
      const wantsBlink  = climbSteps === 0 && Math.random() < cfg.blinkChance;

      const plat = {
        x: px, y: curY,
        baseX: px, baseY: curY,
        w: pw, h: 16,
        color,
        type: isRainbow ? 'rainbow' : 'normal',
        swayAmp:    isRainbow && level > 80 ? 2 + Math.random() * 3 : 0,
        swayFreq:   0.03 + Math.random() * 0.02,
        swayOffset: Math.random() * Math.PI * 2,
      };

      if (wantsMoving) {
        plat.moving    = true;
        plat.moveAxis  = Math.random() < 0.65 ? 'h' : 'v';
        plat.moveRange = 28 + Math.random() * 55;
        plat.moveSpeed = cfg.moveSpeed;
        plat.movePhase = Math.random() * Math.PI * 2;
      }

      if (wantsBlink) {
        plat.blink       = true;
        plat.blinkPeriod = 75 + Math.floor(Math.random() * 55);
        plat.blinkOffset = Math.floor(Math.random() * 120);
      }

      _platforms.push(plat);

      if (Math.random() > 0.42) {
        _stars.push({
          x: px + pw / 2,
          y: curY - 28,
          w: 18, h: 18,
          collected: false,
          frame: Math.random() * 100,
        });
      }

      px += pw + gap;
    }

    // ── End safe platform & tunnel ─────────────────────────────
    _platforms.push({ x: _levelWidth - 340, y: GROUND_Y, w: 340, h: 20, color: '#6dbf67', type: 'ground', safe: true });
    _tunnel = { x: _levelWidth - 200, y: GROUND_Y - 62, w: 90, h: 60 };

    // ── Player start ───────────────────────────────────────────
    player.x  = 60;
    player.y  = GROUND_Y - 42;
    player.vx = 0;
    player.vy = 0;
    player.onGround    = false;
    player.jumpsLeft   = 1;
    player.special     = false;
    player.specialTimer = 0;
    player.facing      = 1;
    player.petalPlatforms = [];

    _starsCollected = 0;
    _camera.x = 0;
    _camera.y = 0;
  }

  function _rainbowColor(width) {
    // Kid's design: color indicates difficulty / width
    if (width > 90) return '#ff6b6b';   // red = widest
    if (width > 75) return '#ffa04d';   // orange
    if (width > 60) return '#ffd166';   // yellow
    if (width > 45) return '#6dbf67';   // green
    if (width > 30) return '#5bb8f5';   // blue
    return '#c9b1f7';                    // violet = narrowest
  }

  function _rainbowPlatformWidth(level, x) {
    const base = 100 - Math.min(level - 70, 70) * 0.8;
    return Math.max(20, base + (Math.random() - 0.5) * 30);
  }

  /* ── Per-level difficulty config ─────────────────────────────
     Every single level has distinct parameters so L1 vs L2 is
     immediately visible:
       L1 → perfectly flat, wide platforms, walkable gaps, no movers
       L2 → first height variation + one forced climb sequence
       L3 → first moving platform, wider gaps
       L5 → vertical camera kicks in
       L8 → blinking (disappearing) platforms introduced
       L10+ → all elements active at increasing intensity
  ──────────────────────────────────────────────────────────── */
  function _levelConfig(level) {
    const S = Math.max(0, Math.min(level - 1, 30)); // cap scaling at L31
    return {
      // Platform width: 165px at L1, −6px per level, floor 28px
      platWidth:     Math.max(28,  165 - S * 6),
      platWidthVar:  14,
      // Gap: 42px at L1 (nearly walkable), +12px per level, cap 220px
      gapMin:        Math.min(220, 42  + S * 12),
      gapVar:        Math.min(55,  14  + S * 2),
      // Height step: ZERO at L1 (dead flat!), 20px at L2, +7/level, cap 105
      heightStep:    S === 0 ? 0 : Math.min(105, 20 + (S - 1) * 7),
      // Moving platforms: none for L1-2, chance grows from L3
      movingChance:  S < 2 ? 0 : Math.min(0.52, (S - 2) * 0.055),
      moveSpeed:     0.013 + S * 0.0012,
      // Blinking platforms: none until L8
      blinkChance:   S < 7 ? 0 : Math.min(0.28, (S - 7) * 0.04),
      // Climb sections: none at L1, 1 at L2, grows every 2 levels
      climbSections: S === 0 ? 0 : Math.min(6, 1 + Math.floor((S - 1) / 2)),
      // Vertical camera: from L5 onwards
      verticalCamera: level >= 5,
      // Level length grows slightly each level
      levelWidth:    2100 + level * 95,
    };
  }

  /* ── Update moving platforms (called every frame) ─────────── */
  function _updateMovingPlatforms() {
    for (const plat of _platforms) {
      if (!plat.moving) continue;
      const phase = _frame * plat.moveSpeed + (plat.movePhase || 0);
      if (plat.moveAxis === 'h') {
        plat.x = plat.baseX + Math.sin(phase) * plat.moveRange;
      } else {
        plat.y = plat.baseY + Math.sin(phase) * plat.moveRange;
      }
    }
  }

  /* ── Input ────────────────────────────────────────────────── */
  const keys = { left: false, right: false, jump: false, jumpJustPressed: false, special: false };

  function _setupInput(canvas) {
    // Keyboard
    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft'  || e.key === 'a') keys.left  = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
      if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') && !keys._jumpHeld) {
        keys.jump = true;
        keys.jumpJustPressed = true;
        keys._jumpHeld = true;
      }
      if (e.key === 'Shift' || e.key === 'z') keys.special = true;
      e.preventDefault();
    });
    window.addEventListener('keyup', e => {
      if (e.key === 'ArrowLeft'  || e.key === 'a') keys.left  = false;
      if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
      if (e.key === 'ArrowUp'    || e.key === 'w' || e.key === ' ') {
        keys.jump = false;
        keys._jumpHeld = false;
      }
      if (e.key === 'Shift' || e.key === 'z') keys.special = false;
    });

    // Touch / mobile buttons
    const btnL = document.getElementById('ctrl-left');
    const btnR = document.getElementById('ctrl-right');
    const btnJ = document.getElementById('ctrl-jump');
    if (btnL) {
      btnL.addEventListener('touchstart', e => { keys.left = true; e.preventDefault(); }, { passive: false });
      btnL.addEventListener('touchend',   () => keys.left = false);
      btnL.addEventListener('mousedown',  () => keys.left = true);
      btnL.addEventListener('mouseup',    () => keys.left = false);
    }
    if (btnR) {
      btnR.addEventListener('touchstart', e => { keys.right = true; e.preventDefault(); }, { passive: false });
      btnR.addEventListener('touchend',   () => keys.right = false);
      btnR.addEventListener('mousedown',  () => keys.right = true);
      btnR.addEventListener('mouseup',    () => keys.right = false);
    }
    if (btnJ) {
      btnJ.addEventListener('touchstart', e => {
        keys.jump = true; keys.jumpJustPressed = true;
        e.preventDefault();
      }, { passive: false });
      btnJ.addEventListener('touchend',   () => keys.jump = false);
      btnJ.addEventListener('mousedown',  () => { keys.jump = true; keys.jumpJustPressed = true; });
      btnJ.addEventListener('mouseup',    () => keys.jump = false);
    }
  }

  /* ── Physics & character movement ────────────────────────── */
  function _updatePlayer() {
    const charDef = _charDef;
    const jMul    = charDef ? charDef.platformer.jumpMultiplier : 1.0;
    const sMul    = charDef ? charDef.platformer.speedMultiplier : 1.0;
    const special = charDef ? charDef.platformer.special : null;

    // Horizontal
    if (keys.left)  { player.vx = -BASE_SPEED * sMul; player.facing = -1; }
    else if (keys.right) { player.vx = BASE_SPEED * sMul; player.facing = 1; }
    else { player.vx *= 0.75; }

    // Dash roll (Rolli) — horizontal burst
    if (special === 'dash_roll' && keys.special && player.specialTimer <= 0) {
      player.vx = player.facing * BASE_SPEED * 3;
      player.rollTimer = 18;
      player.specialTimer = _charDef.specialCooldown / 16;
      player.special = true;
    }
    if (player.rollTimer > 0) {
      player.vx = player.facing * BASE_SPEED * 3;
      player.rollTimer--;
      if (player.rollTimer <= 0) player.special = false;
    }

    // Horn boost (Fluffcone)
    if (special === 'horn_boost' && keys.special && player.specialTimer <= 0) {
      player.vx = player.facing * BASE_SPEED * 2.5;
      player.specialTimer = _charDef.specialCooldown / 16;
      player.special = true;
      setTimeout(() => { player.special = false; }, 3000);
      // Create rainbow bridge platform
      const bx = player.x + player.facing * 80;
      const by = player.y + player.h;
      _platforms.push({ x: bx, y: by, w: 120, h: 12, color: '#ffd700', type: 'rainbow', temporary: true, life: 150 });
    }

    // Jump
    if (keys.jumpJustPressed) {
      if (player.onGround || player.jumpsLeft > 0) {
        player.vy = BASE_JUMP * jMul;
        player.onGround = false;
        player.jumpsLeft = Math.max(0, player.jumpsLeft - 1);

        // Petal float (Sof) — double jump deposits a petal platform
        if (special === 'petal_float' && !player.onGround && player.jumpsLeft === 0) {
          player.petalPlatforms.push({
            x: player.x - 20, y: player.y + player.h,
            w: 60, h: 8, life: 60, color: '#ce93d8',
          });
        }
      } else if (special === 'flutter_fall' && player.vy > 0 && player.specialTimer <= 0) {
        // Flutter: slow descent
        player.vy = Math.min(player.vy, 1.5);
        player.specialTimer = _charDef.specialCooldown / 16;
      }
      keys.jumpJustPressed = false;
    }

    // Apply gravity
    const reduceGrav = (special === 'flutter_fall' && player.vy > 0 && keys.jump) ? 0.4 : 1.0;
    player.vy += GRAVITY * reduceGrav;
    player.vy = Math.min(player.vy, 16); // terminal velocity

    player.x += player.vx;
    player.y += player.vy;

    if (player.specialTimer > 0) player.specialTimer--;
    player.frame++;

    // Petal platforms lifetime
    for (let i = player.petalPlatforms.length - 1; i >= 0; i--) {
      player.petalPlatforms[i].life--;
      if (player.petalPlatforms[i].life <= 0) player.petalPlatforms.splice(i, 1);
    }
  }

  /* ── Collision ────────────────────────────────────────────── */
  function _resolveCollisions() {
    player.onGround = false;

    const allPlats = [
      ..._platforms,
      ...player.petalPlatforms,
    ];

    // Temporary platforms (horn boost) decay
    for (let i = _platforms.length - 1; i >= 0; i--) {
      if (_platforms[i].temporary) {
        _platforms[i].life--;
        if (_platforms[i].life <= 0) _platforms.splice(i, 1);
      }
    }

    for (const plat of allPlats) {
      // Blinking platforms are non-solid during off-phase
      if (plat.blink) {
        const bp = (_frame + (plat.blinkOffset || 0)) % plat.blinkPeriod;
        if (bp > plat.blinkPeriod * 0.55) continue;
      }

      // Sway (rainbow L80+) or moving platform — realY is the authoritative Y
      const realY = plat.swayAmp
        ? plat.y + Math.sin(_frame * plat.swayFreq + plat.swayOffset) * plat.swayAmp
        : plat.y;

      const px = player.x, py = player.y;
      const pw = player.w, ph = player.h;

      const overlapX = px + pw > plat.x && px < plat.x + plat.w;
      const wasAbove  = (py + ph - player.vy) <= realY + 2;
      const nowBelow  = py + ph >= realY;

      if (overlapX && wasAbove && nowBelow && player.vy >= 0) {
        player.y  = realY - ph;
        player.vy = 0;
        player.onGround = true;
        player.jumpsLeft = 1;

        // Moving platform rider — carry player along with the platform
        if (plat.moving) {
          const prevPhase = (_frame - 1) * plat.moveSpeed + (plat.movePhase || 0);
          const currPhase = _frame       * plat.moveSpeed + (plat.movePhase || 0);
          if (plat.moveAxis === 'h') {
            player.x += (Math.sin(currPhase) - Math.sin(prevPhase)) * plat.moveRange;
          } else {
            const prevPlatY = plat.baseY + Math.sin(prevPhase) * plat.moveRange;
            const currPlatY = plat.baseY + Math.sin(currPhase) * plat.moveRange;
            if (currPlatY < prevPlatY) player.y += (currPlatY - prevPlatY); // pushed up
          }
        }
      }
    }
  }

  /* ── Star collection ──────────────────────────────────────── */
  function _checkStars() {
    for (const star of _stars) {
      if (star.collected) continue;
      if (
        player.x + player.w > star.x - 9 &&
        player.x < star.x + 9 &&
        player.y + player.h > star.y - 9 &&
        player.y < star.y + 9
      ) {
        star.collected = true;
        _starsCollected++;
        // Spawn spark particles at star location (relative to camera)
        if (window.Particles) {
          Particles.spawn({
            x: star.x - _camera.x,
            y: star.y - _camera.y,
            type: 'star', count: 8,
          });
        }
        window.Save && window.Save.awardStars(1);
      }
    }
  }

  /* ── Tunnel detection ─────────────────────────────────────── */
  function _checkTunnel() {
    if (!_tunnel || _levelDone) return;
    if (
      player.x + player.w > _tunnel.x &&
      player.x < _tunnel.x + _tunnel.w &&
      player.y + player.h > _tunnel.y &&
      player.y < _tunnel.y + _tunnel.h
    ) {
      _levelDone = true;   // prevent re-firing every frame
      _running   = false;  // stop the loop
      cancelAnimationFrame(_rafId);
      if (_onComplete) _onComplete(_starsCollected);
    }
  }

  /* ── Fall detection ──────────────────────────────────────────── */
  function _checkFall(canvasH) {
    if (_levelDone || _fellRecently) return;
    // Use camera-relative threshold so vertical scrolling doesn't affect it
    if (player.y > _camera.y + canvasH + 110) {
      _fellRecently = true;
      setTimeout(() => { _fellRecently = false; }, 2000);
      if (_onFall) _onFall();
    }
  }

  /* ── Camera ───────────────────────────────────────────────── */
  function _updateCamera(cw, ch) {
    // Horizontal: always track player
    const targetX = player.x - cw * 0.3;
    _camera.x += (targetX - _camera.x) * 0.1;
    _camera.x = Math.max(0, Math.min(_camera.x, _levelWidth - cw));

    // Vertical: from L5 the camera scrolls up/down with the player
    // giving the level a true three-dimensional feel
    const cfg = _levelConfig(_level);
    if (cfg.verticalCamera) {
      const targetY = player.y - ch * 0.42; // keep player ~42% from top
      _camera.y += (targetY - _camera.y) * 0.07;
      _camera.y = Math.max(-80, _camera.y); // don't over-scroll above sky
    } else {
      _camera.y = 0;
    }
  }

  /* ── Rendering ────────────────────────────────────────────── */
  function _render() {
    const cw = _canvas.width;
    const ch = _canvas.height;
    const theme = _worldTheme(_level);
    const ctx = _ctx;

    // Sky background
    const skyGrd = ctx.createLinearGradient(0, 0, 0, ch);
    skyGrd.addColorStop(0, theme.sky);
    skyGrd.addColorStop(1, theme.ground);
    ctx.fillStyle = skyGrd;
    ctx.fillRect(0, 0, cw, ch);

    // Distant hills / world decoration
    _drawBackground(ctx, cw, ch, theme);

    ctx.save();
    ctx.translate(-_camera.x, -_camera.y);

    // Ground strip at the bottom — "below you is grass" (kid's design)
    const groundY = ch + _camera.y - 40;
    ctx.fillStyle = theme.groundDark;
    ctx.fillRect(_camera.x, groundY, cw, 40);
    ctx.fillStyle = theme.ground;
    ctx.fillRect(_camera.x, groundY - 10, cw, 15);

    // Platforms — handle blinking (fade before disappear) and sway
    for (const plat of _platforms) {
      let alpha = 1;
      if (plat.blink) {
        const bp = (_frame + (plat.blinkOffset || 0)) % plat.blinkPeriod;
        if (bp > plat.blinkPeriod * 0.55) continue; // invisible
        if (bp > plat.blinkPeriod * 0.38) {
          // Fade-out warning before vanishing — player gets a visual cue
          alpha = 1 - (bp - plat.blinkPeriod * 0.38) / (plat.blinkPeriod * 0.17);
        }
      }
      const py = plat.swayAmp
        ? plat.y + Math.sin(_frame * plat.swayFreq + plat.swayOffset) * plat.swayAmp
        : plat.y;
      if (alpha < 1) ctx.globalAlpha = alpha;
      _drawPlatform(ctx, plat.x, py, plat.w, plat.h, plat.color, plat.type, plat.life);
      if (alpha < 1) ctx.globalAlpha = 1;

      // Arrow indicator on moving platforms so kids can see which way to plan
      if (plat.moving) {
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(plat.moveAxis === 'h' ? '↔' : '↕', plat.x + plat.w / 2, py - 4);
        ctx.restore();
      }
    }

    // Petal platforms
    for (const p of player.petalPlatforms) {
      const a = p.life / 60;
      ctx.save();
      ctx.globalAlpha = a;
      _drawPlatform(ctx, p.x, p.y, p.w, p.h, p.color, 'petal');
      ctx.restore();
    }

    // Stars
    for (const star of _stars) {
      if (!star.collected) {
        star.frame++;
        _drawStar(ctx, star.x, star.y, 9, star.frame);
      }
    }

    // Tunnel — kid's original: "if you make it, you will come in a tunnel"
    if (_tunnel) _drawTunnel(ctx, _tunnel);

    // Player bunny
    const drawScale = 0.55;
    if (window.Characters) {
      Characters.draw(
        ctx,
        _charId,
        Math.round(player.x + player.w / 2),
        Math.round(player.y + player.h / 2),
        drawScale,
        player.frame,
      );
    }

    ctx.restore();

    // Particles on top (canvas-relative)
    if (window.Particles) {
      Particles.update();
      Particles.draw(ctx);
    }

    // HUD stars update
    const hudStars = document.getElementById('hud-stars');
    if (hudStars) hudStars.textContent = _starsCollected + (window.Save ? window.Save.get().starCoins : 0);
  }

  function _drawBackground(ctx, cw, ch, theme) {
    // Simple rolling hills in the distance
    ctx.fillStyle = `rgba(0,0,0,0.05)`;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(i * (cw / 4) - (_frame * 0.2 % (cw * 1.5)), ch - 60, 80 + i * 20, Math.PI, 0, true);
      ctx.fill();
    }
    // Distant clouds for sky levels
    if (theme.sky !== '#1a1a3e' && theme.sky !== '#000820') {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      for (let i = 0; i < 4; i++) {
        const cx = ((i * 280 + _frame * 0.3) % (cw + 200)) - 100;
        ctx.beginPath();
        ctx.ellipse(cx, 40 + i * 25, 60, 22, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function _drawPlatform(ctx, x, y, w, h, color, type, life) {
    ctx.save();
    // Platform shadow
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 6, w / 2 * 0.8, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (type === 'rainbow') {
      // Rainbow platform glow
      const grd = ctx.createLinearGradient(x, y, x, y + h);
      grd.addColorStop(0, 'rgba(255,255,255,0.6)');
      grd.addColorStop(1, color);
      ctx.fillStyle = grd;
    } else if (type === 'petal') {
      ctx.fillStyle = color;
    } else {
      ctx.fillStyle = color;
    }

    // Rounded rect
    const r = Math.min(h / 2, 8);
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();

    // Highlight strip
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.roundRect(x + 3, y + 2, w - 6, 4, 2);
    ctx.fill();

    if (type === 'rainbow') {
      // Subtle inner glow
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x + 1, y + 1, w - 2, h - 2, r - 1);
      ctx.stroke();
    }

    ctx.restore();
  }

  function _drawStar(ctx, x, y, r, frame) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(frame * 0.04);
    const pulse = 1 + Math.sin(frame * 0.08) * 0.1;
    ctx.scale(pulse, pulse);
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a  = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const ia = ((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2;
      if (i === 0) ctx.moveTo(r * Math.cos(a), r * Math.sin(a));
      else ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
      ctx.lineTo(r * 0.45 * Math.cos(ia), r * 0.45 * Math.sin(ia));
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function _drawTunnel(ctx, tun) {
    // Kid's original: a warm glowing tunnel at the end of every level
    ctx.save();
    // Outer arch
    ctx.fillStyle = '#3d2b1a';
    ctx.beginPath();
    ctx.roundRect(tun.x, tun.y, tun.w, tun.h, [tun.w / 2, tun.w / 2, 0, 0]);
    ctx.fill();

    // Inner glow
    const grd = ctx.createRadialGradient(
      tun.x + tun.w / 2, tun.y + tun.h * 0.6,
      5,
      tun.x + tun.w / 2, tun.y + tun.h * 0.6,
      tun.w,
    );
    grd.addColorStop(0, 'rgba(255,220,100,0.95)');
    grd.addColorStop(0.5, 'rgba(255,140,50,0.7)');
    grd.addColorStop(1, 'rgba(255,100,20,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.ellipse(tun.x + tun.w / 2, tun.y + tun.h * 0.55, tun.w * 0.38, tun.h * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ivy / flower details
    ctx.fillStyle = '#4a9644';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(tun.x + i * 12 + 6, tun.y + 8, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pulsing stars around entrance
    const pulse = 1 + Math.sin(_frame * 0.1) * 0.3;
    ctx.fillStyle = `rgba(255,215,0,${0.7 * pulse})`;
    for (let i = 0; i < 3; i++) {
      const a = _frame * 0.04 + (i / 3) * Math.PI * 2;
      const sx = tun.x + tun.w / 2 + Math.cos(a) * (tun.w * 0.55);
      const sy = tun.y + tun.h * 0.4 + Math.sin(a) * 14;
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // "FINISH" label
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 11px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FINISH', tun.x + tun.w / 2, tun.y - 6);
    ctx.textAlign = 'left';
    ctx.restore();
  }

  /* ── Main game loop ─────────────────────────────────────────  */
  function _loop() {
    if (!_running) return;
    _frame++;

    const cw = _canvas.width;
    const ch = _canvas.height;

    _updateMovingPlatforms(); // move platforms first, then resolve player against them
    _updatePlayer();
    _resolveCollisions();
    _checkStars();
    _checkTunnel();
    _checkFall(ch);
    _updateCamera(cw, ch);
    _render();

    _rafId = requestAnimationFrame(_loop);
  }

  /* ── Public API ───────────────────────────────────────────── */

  let _inputBound = false;

  function init(canvas) {
    _canvas = canvas;
    _ctx    = canvas.getContext('2d');
    _resizeCanvas();
    if (!_inputBound) {
      _inputBound = true;
      _setupInput(canvas);
      window.addEventListener('resize', _resizeCanvas);
    }
  }

  function _resizeCanvas() {
    if (!_canvas) return;
    _canvas.width  = _canvas.offsetWidth  || window.innerWidth;
    _canvas.height = _canvas.offsetHeight || window.innerHeight;
  }

  function startLevel(level, charId, onComplete, onFall) {
    _level        = level;
    _charId       = charId;
    _charDef      = window.Characters ? Characters.getById(charId) : null;
    _onComplete   = onComplete;
    _onFall       = onFall;
    _frame        = 0;
    _levelDone    = false;   // reset for new level
    _fellRecently = false;   // reset for new level
    _starsCollected = 0;     // reset star count

    _generateLevel(level);
    _resizeCanvas();

    if (window.Questions) Questions.startSession();

    _running = true;
    cancelAnimationFrame(_rafId);
    _rafId = requestAnimationFrame(_loop);
  }

  function stop() {
    _running = false;
    cancelAnimationFrame(_rafId);
  }

  function pause() { _running = false; }

  function resume() {
    if (!_running) {
      _running = true;
      _rafId = requestAnimationFrame(_loop);
    }
  }

  function getStarsCollected() { return _starsCollected; }

  return { init, startLevel, stop, pause, resume, getStarsCollected };
})();

window.Platformer = Platformer;
