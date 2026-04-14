/* ═══════════════════════════════════════════════════════════════
   TTS (Text-to-Speech) SYSTEM
   Reads quiz questions and hope messages aloud.
   Friendly, clear child voice — warm and encouraging.

   Supports user-picked voice saved in localStorage.
   Auto-tunes pitch / rate per voice engine so espeak, Google,
   macOS and Windows voices all sound their best.
═══════════════════════════════════════════════════════════════ */

const TTS = (() => {
  let _enabled   = true;
  let _voices     = [];
  let _selected   = null;   // SpeechSynthesisVoice chosen by user or auto
  const PREF_KEY  = 'bunnybrave_tts_voice';

  function setEnabled(val) { _enabled = val; }

  /* ── Voice list helpers ────────────────────────────────────── */

  function _refreshVoices() {
    if (!window.speechSynthesis) return;
    _voices = window.speechSynthesis.getVoices();
    // Re-resolve saved preference in case voices reloaded
    const saved = _loadPref();
    if (saved) {
      _selected = _voices.find(v => v.voiceURI === saved) || null;
    }
    if (!_selected) _selected = _autoPick();
    _populateDropdown();
  }

  // Auto-pick: strongly prefer high-quality online / neural voices
  function _autoPick() {
    if (!_voices.length) return null;

    // Ranked preference — Google online voices first (neural quality),
    // then macOS premium, then Windows
    const ranked = [
      'google uk english female',
      'google us english',
      'google uk english male',
      'samantha',              // macOS — very clear
      'microsoft aria',        // Windows 11 neural
      'microsoft zira',        // Windows
      'karen',                 // macOS Australian
      'victoria', 'fiona', 'tessa',
    ];
    for (const name of ranked) {
      const m = _voices.find(v => v.name.toLowerCase().includes(name));
      if (m) return m;
    }
    // Fallback: any English voice that is NOT espeak
    const good = _voices.find(v =>
      v.lang.startsWith('en') && !v.voiceURI.toLowerCase().includes('espeak')
    );
    if (good) return good;
    const eng = _voices.find(v => v.lang.startsWith('en'));
    return eng || _voices[0];
  }

  function _loadPref()     { try { return localStorage.getItem(PREF_KEY); } catch { return null; } }
  function _savePref(uri)  { try { localStorage.setItem(PREF_KEY, uri); } catch {} }

  /* ── Per-engine pitch / rate tuning ─────────────────────────
     espeak voices need lower pitch, slower rate to be less jarring.
     Google voices are natural at near-default settings.
     macOS / Windows sit in between. */
  function _tuneFor(voice) {
    const n = (voice ? voice.voiceURI || voice.name : '').toLowerCase();

    if (n.includes('espeak') || n.includes('speech-dispatcher')) {
      return { rate: 0.82, pitch: 0.85 };   // slow + low = least robotic
    }
    if (n.includes('google')) {
      return { rate: 0.95, pitch: 1.0 };    // Google neural — near default
    }
    // macOS / Windows / other
    return { rate: 0.92, pitch: 1.1 };
  }

  /* ── Dropdown population (settings panel) ──────────────────── */
  function _populateDropdown() {
    const sel = document.getElementById('set-voice');
    const row = document.getElementById('voice-picker-row');
    if (!sel) return;

    // Only show English voices to keep the list manageable
    const engVoices = _voices.filter(v => v.lang.startsWith('en'));
    const list = engVoices.length ? engVoices : _voices;

    sel.innerHTML = '';
    list.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.voiceURI;
      const tag = v.lang.replace('en-', '').replace('en_', '');
      opt.textContent = `${v.name} (${tag})`;
      if (_selected && v.voiceURI === _selected.voiceURI) opt.selected = true;
      sel.appendChild(opt);
    });
    if (row && list.length > 0) row.style.display = '';
  }

  /* ── Public: select voice (called from settings) ────────────── */
  function selectVoice(voiceURI) {
    const v = _voices.find(vv => vv.voiceURI === voiceURI);
    if (v) { _selected = v; _savePref(voiceURI); }
  }

  function getSelectedURI() {
    return _selected ? _selected.voiceURI : '';
  }

  function getVoices() { return _voices; }

  /* ── Speak ─────────────────────────────────────────────────── */
  function speak(text) {
    if (!_enabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const voice = _selected || _autoPick();
    const tune  = _tuneFor(voice);

    const utt    = new SpeechSynthesisUtterance(text);
    utt.rate     = tune.rate;
    utt.pitch    = tune.pitch;
    utt.volume   = 1.0;
    if (voice) utt.voice = voice;

    window.speechSynthesis.speak(utt);
  }

  function stop() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  /* ── Init: listen for voice list changes ───────────────────── */
  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = _refreshVoices;
    // Some browsers populate voices synchronously
    setTimeout(_refreshVoices, 0);
  }

  return { speak, stop, setEnabled, selectVoice, getSelectedURI, getVoices, refreshVoices: _refreshVoices };
})();

window.TTS = TTS;
