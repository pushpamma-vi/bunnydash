/* ═══════════════════════════════════════════════════════════════
   QUIZ SYSTEM
   Implements the kid's original design exactly:
   - Math question after every level (multiplication / division)
   - Keypad 0–9 shaped like a phone keypad
   - "SEE ANSWER" button below the keypad
   - Question disappears when correct
   - A (rephrased) new question comes if wrong
   - Cannot repeat the same question

   Enhancement: reading and science questions appear on the
   same screen using the same UI pattern.
═══════════════════════════════════════════════════════════════ */

const Quiz = (() => {
  let _currentQuestion = null;
  let _answer          = '';
  let _onComplete      = null;
  let _wrongCount      = 0;
  let _charId          = 'fluff';
  let _level           = 1;

  const MAX_ANSWER_LEN = 6;

  /* ── Show quiz for a given level ─────────────────────────── */
  function showForLevel(level, charId, onComplete) {
    _level      = level;
    _charId     = charId;
    _onComplete = onComplete;
    _wrongCount = 0;

    const grade = window.Save ? window.Save.get().grade : '3';

    _currentQuestion = window.Questions
      ? Questions.getForLevel(level, grade)
      : _fallbackQuestion();

    _render();
    App.showScreen('quiz');

    // TTS: read the question aloud
    if (window.TTS && window.Save && window.Save.get().settings.tts) {
      TTS.speak(_currentQuestion.display);
    }
  }

  /* ── Render quiz screen ───────────────────────────────────── */
  function _render() {
    const q = _currentQuestion;
    if (!q) return;

    const charDef = window.Characters ? Characters.getById(_charId) : null;

    // Bunny emoji
    const bunnyEl = document.getElementById('quiz-bunny');
    if (bunnyEl) bunnyEl.textContent = charDef ? charDef.emoji : '🐰';

    // Speech bubble
    const speechEl = document.getElementById('quiz-speech');
    if (speechEl) speechEl.textContent = window.Hope ? Hope.getQuizIntro() : 'Here comes your question! 🌟';

    // Question
    const qEl = document.getElementById('quiz-question');
    if (qEl) {
      if (q.passage) {
        // Reading question: show passage + question
        qEl.innerHTML = `<span class="quiz-passage">${q.passage}</span><br/><b>${q.display}</b>`;
      } else {
        qEl.textContent = q.display;
      }
    }

    // Subject badge
    const badge = document.getElementById('quiz-subject-badge');
    if (badge) {
      badge.textContent = q.subject === 'math' ? '🔢 Math' : q.subject === 'science' ? '🔬 Science' : '📖 Reading';
    }

    // Reset answer display
    _answer = '';
    _updateAnswerDisplay();

    // Reset feedback
    const fb = document.getElementById('quiz-feedback');
    if (fb) { fb.style.display = 'none'; fb.textContent = ''; }

    // Swap keypad vs choice buttons based on question type
    _setupInputUI(q);
  }

  function _setupInputUI(q) {
    const keypad        = document.getElementById('keypad');
    const seeAnswerBtn  = document.getElementById('btn-see-answer');
    const hintBtn       = document.getElementById('btn-hint');

    // Always show keypad for numeric; for choose, swap to choice tiles
    const existingChoices = document.getElementById('choice-tiles');
    if (existingChoices) existingChoices.remove();

    if (q.type === 'choose' && q.choices) {
      // Hide numpad, show choice tiles
      if (keypad) keypad.style.display = 'none';
      if (seeAnswerBtn) seeAnswerBtn.style.display = 'none';

      const wrap = document.getElementById('quiz-wrap') ||
                   document.querySelector('.quiz-wrap');
      const tiles = document.createElement('div');
      tiles.id = 'choice-tiles';
      tiles.style.cssText = `
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:10px;
        width:100%;
        max-width:400px;
      `;
      for (const choice of q.choices) {
        const btn = document.createElement('button');
        btn.textContent = choice;
        btn.style.cssText = `
          padding:16px 10px;
          background:white;
          border:2.5px solid #5bb8f5;
          border-radius:12px;
          font-size:1rem;
          font-weight:800;
          font-family:Nunito,sans-serif;
          cursor:pointer;
          transition:background 0.2s,transform 0.15s;
        `;
        btn.addEventListener('click', () => _submitChoice(choice));
        btn.addEventListener('touchstart', () => btn.style.transform = 'scale(0.95)', { passive: true });
        btn.addEventListener('touchend',   () => btn.style.transform = '', { passive: true });
        tiles.appendChild(btn);
      }
      // Insert after question box
      const qBox = document.getElementById('quiz-question-box');
      if (qBox && qBox.parentNode) qBox.parentNode.insertBefore(tiles, qBox.nextSibling);
    } else {
      if (keypad) keypad.style.display = '';
      if (seeAnswerBtn) seeAnswerBtn.style.display = '';
    }

    // Hint cost display
    const hintCost = document.getElementById('hint-cost');
    if (hintCost) hintCost.textContent = '(2 ⭐)';
  }

  /* ── Answer display ───────────────────────────────────────── */
  function _updateAnswerDisplay() {
    const el = document.getElementById('quiz-answer-display');
    if (el) el.textContent = _answer || '_';
  }

  /* ── Key press ────────────────────────────────────────────── */
  function pressKey(key) {
    if (_answer.length < MAX_ANSWER_LEN) {
      _answer += key;
      _updateAnswerDisplay();
    }
  }

  function pressDelete() {
    _answer = _answer.slice(0, -1);
    _updateAnswerDisplay();
  }

  /* ── Submit (kid's "SEE ANSWER" button) ──────────────────── */
  function submit() {
    if (!_currentQuestion) return;
    if (_currentQuestion.type === 'choose') return; // handled by tile click
    if (!_answer) return;

    _evaluate(_answer);
  }

  function _submitChoice(choice) {
    _evaluate(choice);
  }

  function _evaluate(given) {
    const correct = given.trim().toLowerCase() === _currentQuestion.answer.trim().toLowerCase();

    if (window.Save) {
      Save.recordQuestion(_currentQuestion.id, correct, _currentQuestion.subject);
    }

    if (correct) {
      _onCorrect();
    } else {
      _onWrong();
    }
  }

  /* ── Correct answer ───────────────────────────────────────── */
  function _onCorrect() {
    // Kid's design: "if the question disappears then the answer is correct"
    const qBox = document.getElementById('quiz-question-box');
    if (qBox) {
      qBox.classList.add('correct-flash');
      setTimeout(() => qBox.classList.remove('correct-flash'), 500);
    }

    const speechEl = document.getElementById('quiz-speech');
    if (speechEl) speechEl.textContent = window.Hope ? Hope.getCorrect() : 'Correct! Amazing! 🎉';

    if (window.TTS && window.Save && window.Save.get().settings.tts) {
      TTS.speak(window.Hope ? Hope.getCorrect() : 'Correct! Amazing!');
    }

    // Spawn star particles
    if (window.Particles) {
      const qBox2 = document.getElementById('quiz-question-box');
      if (qBox2) {
        const r = qBox2.getBoundingClientRect();
        Particles.spawn({ x: r.left + r.width / 2 - window.scrollX, y: r.top - window.scrollY, type: 'star', count: 15 });
      }
    }

    // Kid's design: "another question comes but not the same has to come"
    // We check if the level is done (one correct = proceed) or if chain mode
    // Standard mode: one correct answer → proceed to next adventure
    setTimeout(() => {
      if (_onComplete) _onComplete(true);
    }, 800);
  }

  /* ── Wrong answer ─────────────────────────────────────────── */
  function _onWrong() {
    _wrongCount++;
    _answer = '';
    _updateAnswerDisplay();

    const fb = document.getElementById('quiz-feedback');
    const msg = window.Hope ? Hope.getWrong() : 'Not quite — try once more! 💛';
    if (fb) {
      fb.textContent = msg;
      fb.style.display = 'block';
    }

    const qBox = document.getElementById('quiz-question-box');
    if (qBox) {
      qBox.classList.add('shake');
      setTimeout(() => qBox.classList.remove('shake'), 500);
    }

    if (window.TTS && window.Save && window.Save.get().settings.tts) {
      TTS.speak(msg);
    }

    // Kid's design: "another will come if the answer is not correct" — rephrased, not identical
    setTimeout(() => {
      const grade = window.Save ? window.Save.get().grade : '3';
      const followUp = window.Questions
        ? Questions.getWrongFollowUp(_currentQuestion)
        : _fallbackQuestion();
      _currentQuestion = followUp;

      const fb2 = document.getElementById('quiz-feedback');
      if (fb2) fb2.style.display = 'none';

      const qEl = document.getElementById('quiz-question');
      if (qEl) {
        if (followUp.passage) {
          qEl.innerHTML = `<span class="quiz-passage">${followUp.passage}</span><br/><b>${followUp.display}</b>`;
        } else {
          qEl.textContent = followUp.display;
        }
      }

      _setupInputUI(followUp);

      if (window.TTS && window.Save && window.Save.get().settings.tts) {
        TTS.speak(followUp.display);
      }
    }, 1600);
  }

  /* ── Hint ─────────────────────────────────────────────────── */
  function showHint() {
    const save = window.Save ? window.Save.get() : null;
    if (save && save.starCoins < 2) {
      _showFeedback("You need 2 ⭐ for a hint! Collect more stars in the levels! 🌟");
      return;
    }
    if (window.Save) Save.awardStars(-2); // spend hint

    const q = _currentQuestion;
    const prefix = window.Hope ? Hope.getHintPrefix() : 'Hint: ';
    _showFeedback(`💡 ${prefix}${q ? q.hint : '...'}`);

    if (window.TTS && save && save.settings.tts) {
      TTS.speak(`${prefix}${q ? q.hint : ''}`);
    }
  }

  function _showFeedback(msg) {
    const fb = document.getElementById('quiz-feedback');
    if (fb) { fb.textContent = msg; fb.style.display = 'block'; }
  }

  function _fallbackQuestion() {
    return {
      id: 'fallback_6x7',
      subject: 'math', type: 'numeric',
      display: '6 × 7',
      answer: '42',
      hint: 'Think: 6 groups of 7.',
      grade: 3,
    };
  }

  /* ── Wire up DOM events ───────────────────────────────────── */
  function bindEvents() {
    // Keypad number buttons
    document.querySelectorAll('.key-btn[data-k]').forEach(btn => {
      btn.addEventListener('click', () => pressKey(btn.dataset.k));
      btn.addEventListener('touchstart', e => { pressKey(btn.dataset.k); e.preventDefault(); }, { passive: false });
    });

    // Delete button
    const delBtn = document.getElementById('key-del');
    if (delBtn) {
      delBtn.addEventListener('click', pressDelete);
      delBtn.addEventListener('touchstart', e => { pressDelete(); e.preventDefault(); }, { passive: false });
    }

    // SEE ANSWER button (kid's original)
    const seeBtn = document.getElementById('btn-see-answer');
    if (seeBtn) {
      seeBtn.addEventListener('click', submit);
    }

    // Hint button
    const hintBtn = document.getElementById('btn-hint');
    if (hintBtn) hintBtn.addEventListener('click', showHint);

    // Physical keyboard for number input in quiz
    document.addEventListener('keydown', e => {
      const screen = document.querySelector('#screen-quiz.active');
      if (!screen) return;
      if (e.key >= '0' && e.key <= '9') pressKey(e.key);
      if (e.key === 'Backspace') pressDelete();
      if (e.key === 'Enter') submit();
    });
  }

  return { showForLevel, bindEvents };
})();

window.Quiz = Quiz;
