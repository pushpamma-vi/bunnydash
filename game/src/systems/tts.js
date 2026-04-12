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
    utt.rate = 0.92;
    utt.pitch = 1.05;
    utt.volume = 1.0;
    // Prefer a friendly voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.toLowerCase().includes('female') ||
      v.name.toLowerCase().includes('samantha') ||
      v.name.toLowerCase().includes('karen') ||
      v.name.toLowerCase().includes('victoria') ||
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
