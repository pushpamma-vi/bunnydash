/* ═══════════════════════════════════════════════════════════════
   AUDIO SYSTEM — Bunny Brave
   All sounds and music are procedurally generated using the
   Web Audio API. No file downloads, no internet needed.

   Background music: gentle piano/guitar arpeggios
   SFX: jump, land, star collect, fall, level complete, quiz correct/wrong
═══════════════════════════════════════════════════════════════ */

const GameAudio = (() => {
  let _ctx       = null;  // AudioContext
  let _musicGain = null;  // music volume node
  let _sfxGain   = null;  // sfx volume node
  let _musicOn   = true;
  let _sfxOn     = true;
  let _musicLoop = null;  // current music interval
  let _musicPlaying = false;

  // Note frequencies (piano tuning)
  const NOTE = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.26, G5: 783.99,
  };

  function _ensureCtx() {
    if (!_ctx) {
      try {
        _ctx = new (window.AudioContext || window.webkitAudioContext)();
        _musicGain = _ctx.createGain();
        _musicGain.gain.value = 0.18;  // gentle background
        _musicGain.connect(_ctx.destination);
        _sfxGain = _ctx.createGain();
        _sfxGain.gain.value = 0.35;
        _sfxGain.connect(_ctx.destination);
      } catch { return false; }
    }
    if (_ctx.state === 'suspended') _ctx.resume();
    return !!_ctx;
  }

  // ─── Tone generators ──────────────────────────────────────

  function _playTone(freq, duration, type, dest, delay) {
    if (!_ctx) return;
    const t  = _ctx.currentTime + (delay || 0);
    const osc = _ctx.createOscillator();
    const env = _ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.6, t + 0.02);
    env.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(env);
    env.connect(dest || _sfxGain);
    osc.start(t);
    osc.stop(t + duration);
  }

  // Piano-like tone with sharp attack, soft decay
  function _pianoNote(freq, duration, dest, delay) {
    if (!_ctx) return;
    const t  = _ctx.currentTime + (delay || 0);
    const osc  = _ctx.createOscillator();
    const osc2 = _ctx.createOscillator();
    const env  = _ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.01, t); // slight detune for warmth

    const mix = _ctx.createGain();
    mix.gain.value = 0.3;

    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.7, t + 0.01);
    env.gain.exponentialRampToValueAtTime(0.01, t + duration);

    osc.connect(env);
    osc2.connect(mix);
    mix.connect(env);
    env.connect(dest || _musicGain);

    osc.start(t);  osc.stop(t + duration);
    osc2.start(t); osc2.stop(t + duration);
  }

  // Guitar-like pluck (Karplus-Strong approximation via filtered noise)
  function _guitarPluck(freq, duration, dest, delay) {
    if (!_ctx) return;
    const t = _ctx.currentTime + (delay || 0);
    const d = duration || 1.2;

    // Burst of noise → filter → resonance simulates pluck
    const bufLen   = Math.round(_ctx.sampleRate / freq);
    const buf      = _ctx.createBuffer(1, bufLen, _ctx.sampleRate);
    const data     = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

    const src    = _ctx.createBufferSource();
    src.buffer   = buf;
    src.loop     = true;
    const filter = _ctx.createBiquadFilter();
    filter.type  = 'lowpass';
    filter.frequency.setValueAtTime(freq * 4, t);
    filter.frequency.exponentialRampToValueAtTime(freq * 0.5, t + d);
    const env = _ctx.createGain();
    env.gain.setValueAtTime(0.5, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + d);

    src.connect(filter);
    filter.connect(env);
    env.connect(dest || _musicGain);

    src.start(t);
    src.stop(t + d);
  }

  // ─── Background Music ─────────────────────────────────────

  // Gentle arpeggio patterns (C major / Am / F / G)
  const PROGRESSIONS = [
    [NOTE.C4, NOTE.E4, NOTE.G4, NOTE.C5],  // C major
    [NOTE.A3, NOTE.C4, NOTE.E4, NOTE.A4],  // A minor
    [NOTE.F3, NOTE.A3, NOTE.C4, NOTE.F4],  // F major
    [NOTE.G3, NOTE.B3, NOTE.D4, NOTE.G4],  // G major
  ];

  let _chordIdx  = 0;
  let _noteIdx   = 0;
  let _useGuitar = false;
  let _beatCount = 0;

  function _playNextNote() {
    if (!_ctx || !_musicPlaying) return;

    const chord = PROGRESSIONS[_chordIdx];
    const freq  = chord[_noteIdx];

    // Alternate piano and guitar every 2 chords
    if (_useGuitar) {
      _guitarPluck(freq, 1.0, _musicGain);
    } else {
      _pianoNote(freq, 0.8, _musicGain);
    }

    _noteIdx++;
    if (_noteIdx >= chord.length) {
      _noteIdx = 0;
      _chordIdx = (_chordIdx + 1) % PROGRESSIONS.length;
      _beatCount++;
      if (_beatCount % 8 === 0) _useGuitar = !_useGuitar; // switch instrument
    }
  }

  function startMusic() {
    if (!_ensureCtx()) return;
    if (_musicPlaying) return;
    _musicPlaying = true;
    _chordIdx  = 0;
    _noteIdx   = 0;
    _beatCount = 0;
    // Play a note every 280ms — gentle, unhurried pace
    _musicLoop = setInterval(_playNextNote, 280);
    _playNextNote();
  }

  function stopMusic() {
    _musicPlaying = false;
    if (_musicLoop) { clearInterval(_musicLoop); _musicLoop = null; }
  }

  // ─── Sound Effects ────────────────────────────────────────

  function sfxJump() {
    if (!_sfxOn || !_ensureCtx()) return;
    // Quick rising chirp
    const t = _ctx.currentTime;
    const osc = _ctx.createOscillator();
    const env = _ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.12);
    env.gain.setValueAtTime(0.4, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(env); env.connect(_sfxGain);
    osc.start(t); osc.stop(t + 0.15);
  }

  function sfxLand() {
    if (!_sfxOn || !_ensureCtx()) return;
    // Soft thud
    const t = _ctx.currentTime;
    const osc = _ctx.createOscillator();
    const env = _ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.1);
    env.gain.setValueAtTime(0.3, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(env); env.connect(_sfxGain);
    osc.start(t); osc.stop(t + 0.12);
  }

  function sfxStar() {
    if (!_sfxOn || !_ensureCtx()) return;
    // Sparkling chime — three quick ascending notes
    _playTone(NOTE.E5, 0.15, 'sine', _sfxGain, 0);
    _playTone(NOTE.G5, 0.15, 'sine', _sfxGain, 0.08);
    _playTone(NOTE.C5 * 2, 0.25, 'sine', _sfxGain, 0.16);
  }

  function sfxFall() {
    if (!_sfxOn || !_ensureCtx()) return;
    // Descending whoosh
    const t = _ctx.currentTime;
    const osc = _ctx.createOscillator();
    const env = _ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(500, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.5);
    env.gain.setValueAtTime(0.25, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.connect(env); env.connect(_sfxGain);
    osc.start(t); osc.stop(t + 0.5);
  }

  function sfxLevelComplete() {
    if (!_sfxOn || !_ensureCtx()) return;
    // Triumphant ascending melody: C-E-G-C5
    _pianoNote(NOTE.C4, 0.3, _sfxGain, 0);
    _pianoNote(NOTE.E4, 0.3, _sfxGain, 0.15);
    _pianoNote(NOTE.G4, 0.3, _sfxGain, 0.30);
    _pianoNote(NOTE.C5, 0.6, _sfxGain, 0.45);
  }

  function sfxCorrect() {
    if (!_sfxOn || !_ensureCtx()) return;
    // Happy two-note chime
    _playTone(NOTE.C5, 0.2, 'sine', _sfxGain, 0);
    _playTone(NOTE.E5, 0.35, 'sine', _sfxGain, 0.12);
  }

  function sfxWrong() {
    if (!_sfxOn || !_ensureCtx()) return;
    // Gentle descending two-note
    _playTone(NOTE.E4, 0.2, 'triangle', _sfxGain, 0);
    _playTone(NOTE.C4, 0.3, 'triangle', _sfxGain, 0.15);
  }

  // ─── Volume controls ────────────────────────────────────

  function setMusicVolume(v) {
    if (_musicGain) _musicGain.gain.value = Math.max(0, Math.min(1, v));
  }
  function setSfxVolume(v) {
    if (_sfxGain) _sfxGain.gain.value = Math.max(0, Math.min(1, v));
  }
  function setMusicOn(on)  { _musicOn = on; if (!on) stopMusic(); }
  function setSfxOn(on)    { _sfxOn = on; }

  // Unlock AudioContext on first user interaction (mobile requirement)
  function unlock() {
    _ensureCtx();
  }

  return {
    unlock,
    startMusic, stopMusic,
    sfxJump, sfxLand, sfxStar, sfxFall,
    sfxLevelComplete, sfxCorrect, sfxWrong,
    setMusicVolume, setSfxVolume, setMusicOn, setSfxOn,
  };
})();

window.GameAudio = GameAudio;
