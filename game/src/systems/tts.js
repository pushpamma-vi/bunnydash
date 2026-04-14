/* ═══════════════════════════════════════════════════════════════
   TTS (Text-to-Speech) SYSTEM
   Reads quiz questions and hope messages aloud.
   Friendly, clear child voice — warm and encouraging.
═══════════════════════════════════════════════════════════════ */

const TTS = (() => {
  let _enabled = true;
  let _voiceCache = null;

  function setEnabled(val) { _enabled = val; }

  // Pick the friendliest, clearest voice available
  function _pickVoice() {
    if (_voiceCache) return _voiceCache;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    // Ranked preference: clear, warm female voices that work well at normal pitch
    const ranked = [
      'samantha',              // macOS — very clear, warm
      'google uk english female',
      'google us english',
      'microsoft zira',        // Windows — clear female
      'microsoft aria',        // Windows 11
      'karen',                 // macOS Australian — clear
      'victoria',              // macOS
      'fiona',                 // macOS Scottish — clear
      'tessa',                 // macOS South African
    ];

    for (const name of ranked) {
      const match = voices.find(v => v.name.toLowerCase().includes(name));
      if (match) { _voiceCache = match; return match; }
    }

    // Fallback: any English female voice, then any English voice, then default
    const engFemale = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'));
    if (engFemale) { _voiceCache = engFemale; return engFemale; }
    const eng = voices.find(v => v.lang.startsWith('en'));
    if (eng) { _voiceCache = eng; return eng; }
    _voiceCache = voices[0];
    return _voiceCache;
  }

  // Ensure voices are loaded (some browsers load async)
  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => { _voiceCache = null; };
  }

  function speak(text) {
    if (!_enabled) return;
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utt = new SpeechSynthesisUtterance(text);
    utt.rate   = 0.92;   // slightly slower = clearer articulation
    utt.pitch  = 1.1;    // natural warm pitch, not too high (avoids robotic)
    utt.volume = 1.0;

    const voice = _pickVoice();
    if (voice) utt.voice = voice;

    window.speechSynthesis.speak(utt);
  }

  function stop() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  return { speak, stop, setEnabled };
})();

window.TTS = TTS;
