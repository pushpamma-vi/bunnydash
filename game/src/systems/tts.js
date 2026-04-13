/* ═══════════════════════════════════════════════════════════════
   TTS (Text-to-Speech) SYSTEM
   Reads quiz questions aloud when enabled.
   Falls back silently if browser doesn't support it.
   Never interrupts — only speaks when triggered.
═══════════════════════════════════════════════════════════════ */

const TTS = (() => {
  let _enabled = true;

  function setEnabled(val) { _enabled = val; }

  function speak(text) {
    if (!_enabled) return;
    if (!window.speechSynthesis) return;
    // Cancel any in-progress speech
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate   = 1.08;   // slightly faster = more lively / excited
    utt.pitch  = 1.45;   // higher pitch = child-friendly, cheerful
    utt.volume = 1.0;
    // Prefer bright, child-friendly voices: Zira, Aria, Google first, then female
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.toLowerCase().includes('zira') ||
      v.name.toLowerCase().includes('aria') ||
      v.name.toLowerCase().includes('google us english') ||
      v.name.toLowerCase().includes('google uk english female') ||
      v.name.toLowerCase().includes('samantha') ||
      v.name.toLowerCase().includes('karen') ||
      v.name.toLowerCase().includes('victoria') ||
      v.name.toLowerCase().includes('female') ||
      v.default
    );
    if (preferred) utt.voice = preferred;
    window.speechSynthesis.speak(utt);
  }

  function stop() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  return { speak, stop, setEnabled };
})();

window.TTS = TTS;
