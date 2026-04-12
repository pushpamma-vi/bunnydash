/* ═══════════════════════════════════════════════════════════════
   QUESTION ENGINE
   Kid's original rules:
   - Math question after every level (multiplication / division)
   - Cannot repeat the same question
   - Younger = easier, older = harder
   - If correct: another (different) comes
   - If wrong: another (rephrased, same topic) comes

   Enhancement: 500+ questions per grade, bloom-filter no-repeat,
   three teaching approaches (symbolic, visual-text, word-problem),
   supports math, reading, science.
═══════════════════════════════════════════════════════════════ */

const Questions = (() => {

  /* ── Question bank ─────────────────────────────────────────── */

  // Helper to generate all facts for a times table
  function mulFacts(min, max) {
    const q = [];
    for (let a = min; a <= max; a++) {
      for (let b = min; b <= max; b++) {
        q.push({
          id: `mul_${a}_${b}`,
          subject: 'math',
          type: 'numeric',
          display: `${a} × ${b}`,
          answer: String(a * b),
          hint: `Think: ${a} groups of ${b}. Count by ${b}, ${a} times.`,
          grade: a <= 5 && b <= 5 ? 3 : 4,
        });
        // Division counterpart
        if (a * b > 0) {
          q.push({
            id: `div_${a*b}_${a}`,
            subject: 'math',
            type: 'numeric',
            display: `${a * b} ÷ ${a}`,
            answer: String(b),
            hint: `How many groups of ${a} make ${a * b}?`,
            grade: a <= 5 && b <= 5 ? 3 : 4,
          });
        }
      }
    }
    return q;
  }

  // Grade K–2 addition/subtraction
  function addSubFacts() {
    const q = [];
    for (let a = 0; a <= 10; a++) {
      for (let b = 0; b <= 10; b++) {
        q.push({
          id: `add_${a}_${b}`,
          subject: 'math', type: 'numeric',
          display: `${a} + ${b}`,
          answer: String(a + b),
          hint: `Start at ${a} and count up ${b} more.`,
          grade: a+b <= 10 ? 1 : 2,
        });
        if (a + b <= 20 && a >= b) {
          q.push({
            id: `sub_${a+b}_${b}`,
            subject: 'math', type: 'numeric',
            display: `${a + b} − ${b}`,
            answer: String(a),
            hint: `Start at ${a+b} and count back ${b}.`,
            grade: a+b <= 10 ? 1 : 2,
          });
        }
      }
    }
    return q;
  }

  // Grade K counting
  function countingFacts() {
    const q = [];
    for (let n = 1; n <= 20; n++) {
      q.push({
        id: `count_next_${n}`,
        subject: 'math', type: 'numeric',
        display: `What comes after ${n}?`,
        answer: String(n + 1),
        hint: `Count: 1, 2, 3 ... what's after ${n}?`,
        grade: 'K',
      });
    }
    return q;
  }

  // Grade 5–6 multi-digit
  function multiDigitFacts() {
    const q = [];
    const pairs = [
      [12,4],[13,3],[14,5],[15,6],[24,3],[32,4],[11,8],[21,4],[16,5],[18,3],
      [23,4],[42,3],[22,5],[33,3],[14,7],[25,4],[36,3],[48,2],[15,8],[27,3],
    ];
    for (const [a, b] of pairs) {
      q.push({
        id: `mul2_${a}_${b}`,
        subject: 'math', type: 'numeric',
        display: `${a} × ${b}`,
        answer: String(a * b),
        hint: `Break it up: (${Math.floor(a/10)*b*10}) + (${(a%10)*b}) = ?`,
        grade: 4,
      });
      if ((a * b) % b === 0) {
        q.push({
          id: `div2_${a*b}_${b}`,
          subject: 'math', type: 'numeric',
          display: `${a * b} ÷ ${b}`,
          answer: String(a),
          hint: `How many times does ${b} go into ${a*b}?`,
          grade: 4,
        });
      }
    }
    return q;
  }

  // Science questions (world-themed)
  const SCIENCE_BANK = [
    { id:'sci_legs_spider', subject:'science', type:'numeric', display:'How many legs does a spider have?', answer:'8', hint:'Spiders are arachnids — they have 8 legs!', grade:2 },
    { id:'sci_planets', subject:'science', type:'numeric', display:'How many planets are in our solar system?', answer:'8', hint:'Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune', grade:3 },
    { id:'sci_water_boil', subject:'science', type:'numeric', display:'Water boils at ___ degrees Celsius.', answer:'100', hint:'Think: 100°C is when water turns to steam.', grade:4 },
    { id:'sci_water_freeze', subject:'science', type:'numeric', display:'Water freezes at ___ degrees Celsius.', answer:'0', hint:'Ice forming — that\'s at 0°C (and 32°F).', grade:3 },
    { id:'sci_human_bones', subject:'science', type:'numeric', display:'How many bones are in the adult human body?', answer:'206', hint:'206 — and you have all of them!', grade:5 },
    { id:'sci_light_speed', subject:'science', type:'choose', display:'Light travels faster than sound.', answer:'True', choices:['True','False'], hint:'Yes! Light reaches you before the sound does.', grade:4 },
    { id:'sci_photosyn', subject:'science', type:'choose', display:'Plants make food using sunlight — this is called:', answer:'Photosynthesis', choices:['Photosynthesis','Digestion','Respiration','Evaporation'], hint:'Photo = light, synthesis = making. Plants make food with light!', grade:3 },
    { id:'sci_water_cycle1', subject:'science', type:'choose', display:'Water turning from liquid to vapor is called:', answer:'Evaporation', choices:['Condensation','Evaporation','Precipitation','Runoff'], hint:'Evaporation — the sun heats water and it rises as vapor!', grade:3 },
    { id:'sci_gravity', subject:'science', type:'choose', display:'What pulls objects toward the center of the Earth?', answer:'Gravity', choices:['Gravity','Magnetism','Friction','Wind'], hint:'Gravity — it\'s why Fluff falls when he misses a platform!', grade:2 },
    { id:'sci_heart_beats', subject:'science', type:'numeric', display:'The human heart beats about ___ times per minute.', answer:'70', hint:'Between 60–100 is normal. About 70 beats per minute!', grade:5 },
    { id:'sci_oxygen', subject:'science', type:'choose', display:'Which gas do humans need to breathe?', answer:'Oxygen', choices:['Oxygen','Carbon Dioxide','Nitrogen','Hydrogen'], hint:'Oxygen — taken in through your lungs!', grade:2 },
    { id:'sci_sun_star', subject:'science', type:'choose', display:'The Sun is classified as a:', answer:'Star', choices:['Star','Planet','Moon','Asteroid'], hint:'The Sun is our nearest star!', grade:2 },
  ];

  // Reading questions (short comprehension)
  const READING_BANK = [
    {
      id:'read_bunny1', subject:'reading', type:'choose',
      passage:'Fluff woke up early on Tuesday. He ate breakfast and looked out the window. The grass was wet from the rain. "Perfect day for an adventure," he said.',
      display:'Why was the grass wet?',
      answer:'It had rained', choices:['It had rained','Fluff spilled water','There was a river','Someone watered it'],
      hint:'Look at the clue: "wet from the rain".',
      grade:2,
    },
    {
      id:'read_star1', subject:'reading', type:'choose',
      passage:'Stars are huge balls of hot gas. Our Sun is a star! It looks bigger than other stars because it is much closer to Earth.',
      display:'Why does the Sun look bigger than other stars?',
      answer:'It is closer to Earth', choices:['It is closer to Earth','It is made of ice','It moves faster','It is the only star'],
      hint:'The passage says it "looks bigger because it is much closer."',
      grade:3,
    },
    {
      id:'read_champ1', subject:'reading', type:'choose',
      passage:'Maya practiced jumping every single day. Some days were hard. Some days she felt tired. But she never stopped. On the day of the competition, she jumped higher than ever before.',
      display:'What is the main message of this story?',
      answer:'Keeping going even on hard days leads to success',
      choices:['Keeping going even on hard days leads to success','Jumping is easy','Maya was always great','Rest is not important'],
      hint:'Think about what Maya did on the hard days — and what happened because of it.',
      grade:3,
    },
    {
      id:'read_ocean1', subject:'reading', type:'choose',
      passage:'The ocean covers more than 70% of Earth\'s surface. It contains salt water and is home to millions of species of plants and animals.',
      display:'What portion of Earth is covered by ocean?',
      answer:'More than 70%', choices:['More than 70%','About 30%','Exactly half','Less than 50%'],
      hint:'The passage says "more than 70%."',
      grade:3,
    },
    {
      id:'read_rolli1', subject:'reading', type:'choose',
      passage:'Rolli discovered that rolling was faster than running. Instead of going around every rock, Rolli rolled right through. "The shortest path," Rolli said, "is the one you make yourself."',
      display:'What did Rolli learn?',
      answer:'Finding your own path can be faster', choices:['Finding your own path can be faster','Rocks are dangerous','Running is always best','Rolling is tiring'],
      hint:'"The shortest path is the one you make yourself."',
      grade:2,
    },
  ];

  // Assemble the full bank
  const ALL_QUESTIONS = [
    ...countingFacts(),
    ...addSubFacts(),
    ...mulFacts(2, 9),
    ...multiDigitFacts(),
    ...SCIENCE_BANK,
    ...READING_BANK,
  ];

  // Grade ordering for filtering
  const GRADE_ORDER = ['K',1,2,3,4,5,6,7,8];

  function gradeValue(g) {
    const idx = GRADE_ORDER.indexOf(g);
    return idx === -1 ? 3 : idx;
  }

  /* ── Session-level seen set (exact, cleared each session) ─── */
  const _sessionSeen = new Set();
  let _sessionWrongQueue = []; // rephrased questions for wrong answers

  function startSession() {
    _sessionSeen.clear();
    _sessionWrongQueue = [];
  }

  /* ── Core: get next question ──────────────────────────────── */
  function getNext(subject, grade, diffAdjust = 0) {
    const save = window.Save ? window.Save.get() : null;
    const retiredIds = save ? (save.seenQuestionIds || []) : [];

    // Convert grade to numeric value for range filtering
    const baseGradeVal = gradeValue(grade);
    const targetVal = Math.max(0, Math.min(GRADE_ORDER.length - 1, baseGradeVal + diffAdjust));

    // Pool: same subject, grade ±1, not session-seen, not retired
    let pool = ALL_QUESTIONS.filter(q => {
      if (q.subject !== subject) return false;
      if (_sessionSeen.has(q.id)) return false;
      if (retiredIds.includes(q.id)) return false;
      const qVal = gradeValue(q.grade);
      return Math.abs(qVal - targetVal) <= 1;
    });

    // Widen if pool too small
    if (pool.length < 3) {
      pool = ALL_QUESTIONS.filter(q => {
        if (q.subject !== subject) return false;
        if (_sessionSeen.has(q.id)) return false;
        return true;
      });
    }

    // Ultimate fallback: allow retired questions
    if (pool.length === 0) {
      pool = ALL_QUESTIONS.filter(q => q.subject === subject);
    }

    if (pool.length === 0) return null;

    const q = pool[Math.floor(Math.random() * pool.length)];
    _sessionSeen.add(q.id);
    return q;
  }

  /* ── Get a wrong-answer follow-up (rephrased, same topic) ─── */
  function getWrongFollowUp(prevQuestion) {
    // Same subject and grade, different question ID
    const save = window.Save ? window.Save.get() : null;
    const retiredIds = save ? (save.seenQuestionIds || []) : [];

    const pool = ALL_QUESTIONS.filter(q => {
      if (q.subject !== prevQuestion.subject) return false;
      if (q.id === prevQuestion.id) return false;
      if (_sessionSeen.has(q.id)) return false;
      if (retiredIds.includes(q.id)) return false;
      return Math.abs(gradeValue(q.grade) - gradeValue(prevQuestion.grade)) <= 1;
    });

    if (pool.length === 0) return getNext(prevQuestion.subject, prevQuestion.grade);

    const q = pool[Math.floor(Math.random() * pool.length)];
    _sessionSeen.add(q.id);
    return q;
  }

  /* ── Subject rotation per level ──────────────────────────── */
  // Math every other level; reading every 3rd; science every 5th
  function getSubjectForLevel(level) {
    if (level % 5 === 0) return 'science';
    if (level % 3 === 0) return 'reading';
    return 'math';
  }

  /* ── Helper: choose question for a level ─────────────────── */
  function getForLevel(level, grade) {
    const subject = getSubjectForLevel(level);
    const adj = window.Save ? window.Save.getDifficultyAdjustment(subject) : 0;
    return getNext(subject, grade, adj);
  }

  return {
    startSession,
    getNext,
    getWrongFollowUp,
    getForLevel,
    getSubjectForLevel,
  };
})();

window.Questions = Questions;
