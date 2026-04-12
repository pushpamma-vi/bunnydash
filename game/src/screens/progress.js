/* ═══════════════════════════════════════════════════════════════
   PROGRESS SCREEN
   Shows the child how far they've come: subject accuracy bars,
   level progress, total questions answered, badges, and a list
   of academic standards they've met through gameplay.
═══════════════════════════════════════════════════════════════ */

const ProgressScreen = (() => {

  // Academic standards shown once enough questions in that area are answered
  const STANDARDS = [
    { id: 'count10',    label: 'Counts to 10',           subject: 'math',    threshold: 10  },
    { id: 'count100',   label: 'Counts to 100',          subject: 'math',    threshold: 30  },
    { id: 'addFacts',   label: 'Addition Facts',         subject: 'math',    threshold: 50  },
    { id: 'subFacts',   label: 'Subtraction Facts',      subject: 'math',    threshold: 70  },
    { id: 'mulFacts',   label: 'Multiplication Tables',  subject: 'math',    threshold: 120 },
    { id: 'divFacts',   label: 'Division Basics',        subject: 'math',    threshold: 150 },
    { id: 'readComp',   label: 'Reading Comprehension',  subject: 'reading', threshold: 15  },
    { id: 'sciBasic',   label: 'Science Basics',         subject: 'science', threshold: 12  },
  ];

  // Badge definitions
  const BADGES = [
    { id: 'firstLevel',  emoji: '🌟', label: 'First Level',    desc: 'Finished your first level!' },
    { id: 'fiveLevels',  emoji: '🏅', label: 'Five Levels',    desc: 'Completed 5 levels in total!' },
    { id: 'tenLevels',   emoji: '🥇', label: 'Ten Levels',     desc: 'Reached level 10. Amazing!' },
    { id: 'streak3',     emoji: '🔥', label: '3-Day Streak',   desc: 'Played 3 days in a row!' },
    { id: 'streak7',     emoji: '💫', label: 'Week Warrior',   desc: '7 days in a row. Outstanding!' },
    { id: 'stars50',     emoji: '⭐', label: 'Star Hoarder',   desc: 'Collected 50 stars total!' },
    { id: 'perfect10',   emoji: '✨', label: 'Perfect 10',     desc: '10 correct answers in a row!' },
    { id: 'allSubjects', emoji: '📚', label: 'All-Rounder',   desc: 'Answered math, reading, and science!' },
  ];

  function init() {
    const backBtn = document.getElementById('btn-back-prog');
    if (backBtn) backBtn.addEventListener('click', () => App.showScreen('home'));
  }

  function show() {
    const save = Save.get();

    // --- Header stats ---
    // header stats — rendered into #progress-wrap dynamically
    _renderHeader(save);

    // --- Subject accuracy bars ---
    _renderSubjectBars(save);

    // --- Level progress bar ---
    _renderLevelBar(save);

    // --- Standards met ---
    _renderStandards(save);

    // --- Badges ---
    _renderBadges(save);
  }

  function _renderHeader(save) {
    const wrap = document.getElementById('progress-wrap');
    if (!wrap) return;
    // Only inject header once
    if (!document.getElementById('prog-header')) {
      const hdr = document.createElement('div');
      hdr.id = 'prog-header';
      hdr.className = 'prog-header';
      hdr.innerHTML = `
        <span>👤 <strong id="prog-player-name">${save.playerName || 'Adventurer'}</strong></span>
        <span>✅ <span id="prog-total-correct">0</span> correct / <span id="prog-total-questions">0</span> answered</span>
        <span>📚 Level <span id="prog-current-level">1</span></span>
        <span>🎯 Accuracy: <span id="prog-accuracy">0%</span></span>
      `;
      wrap.prepend(hdr);

      // Also inject container divs if missing
      const containers = [
        { id: 'subject-bars', label: '' },
        { id: 'level-progress-wrap', label: '' },
        { id: 'standards-list', label: '' },
        { id: 'badge-grid', label: '' },
      ];
      containers.forEach(({ id }) => {
        if (!document.getElementById(id)) {
          const d = document.createElement('div');
          d.id = id;
          wrap.appendChild(d);
        }
      });
      const lpWrap = document.getElementById('level-progress-wrap');
      if (lpWrap && !document.getElementById('level-progress-fill')) {
        lpWrap.innerHTML = '<div class="prog-bar-track"><div class="prog-bar-fill" id="level-progress-fill" style="width:0%"></div></div><div id="level-progress-label"></div>';
      }
    }
    _setText('prog-player-name', save.playerName || 'Adventurer');
    _setText('prog-total-correct', save.totalCorrect || 0);
    _setText('prog-total-questions', save.totalQuestions || 0);
    _setText('prog-current-level', save.currentLevel || 1);
    const accuracy = save.totalQuestions > 0
      ? Math.round((save.totalCorrect / save.totalQuestions) * 100) : 0;
    _setText('prog-accuracy', `${accuracy}%`);
  }

  function _renderSubjectBars(save) {
    const container = document.getElementById('subject-bars');
    if (!container) return;
    container.innerHTML = '';

    const subjects = [
      { key: 'math',    label: '➕ Math',    color: '#4fc3f7' },
      { key: 'reading', label: '📖 Reading', color: '#aed581' },
      { key: 'science', label: '🔬 Science', color: '#ff8a65' },
    ];

    subjects.forEach(({ key, label, color }) => {
      const arr = (save.subjectAccuracy || {})[key] || [];
      const correct = arr.filter(v => v === 1).length;
      const total   = arr.length;
      const pct     = total > 0 ? Math.round((correct / total) * 100) : 0;

      const row = document.createElement('div');
      row.className = 'prog-bar-row';
      row.innerHTML = `
        <span class="prog-bar-label">${label}</span>
        <div class="prog-bar-track" role="progressbar"
             aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"
             aria-label="${label} accuracy ${pct}%">
          <div class="prog-bar-fill" style="width:${pct}%;background:${color}"></div>
        </div>
        <span class="prog-bar-pct">${pct}%</span>
      `;
      container.appendChild(row);
    });
  }

  function _renderLevelBar(save) {
    const fill = document.getElementById('level-progress-fill');
    const label = document.getElementById('level-progress-label');
    if (!fill) return;

    const lvl = save.currentLevel || 1;
    // Progress within current world (each world = 40 levels loosely)
    const worldSize = 40;
    const withinWorld = ((lvl - 1) % worldSize) + 1;
    const pct = Math.round((withinWorld / worldSize) * 100);

    fill.style.width = `${pct}%`;
    if (label) label.textContent = `Level ${lvl} — World progress: ${pct}%`;
  }

  function _renderStandards(save) {
    const container = document.getElementById('standards-list');
    if (!container) return;
    container.innerHTML = '';

    const badges = save.badges || {};
    const totalCorrect = save.totalCorrect || 0;

    STANDARDS.forEach(std => {
      const met = totalCorrect >= std.threshold;
      const item = document.createElement('div');
      item.className = `standard-item ${met ? 'met' : 'not-met'}`;
      item.setAttribute('aria-label', `${std.label} — ${met ? 'achieved' : 'not yet achieved'}`);
      item.innerHTML = `
        <span class="std-icon">${met ? '✅' : '⬜'}</span>
        <span class="std-text">${std.label}</span>
      `;
      container.appendChild(item);
    });
  }

  function _renderBadges(save) {
    const container = document.getElementById('badge-grid');
    if (!container) return;
    container.innerHTML = '';

    const earned = save.badges || {};

    BADGES.forEach(badge => {
      const have = !!earned[badge.id];
      const card = document.createElement('div');
      card.className = `badge-card ${have ? 'earned' : 'locked'}`;
      card.setAttribute('title', badge.desc);
      card.setAttribute('role', 'img');
      card.setAttribute('aria-label', `${badge.label} badge — ${have ? badge.desc : 'not yet earned'}`);
      card.innerHTML = `
        <div class="badge-emoji">${have ? badge.emoji : '🔒'}</div>
        <div class="badge-name">${badge.label}</div>
        ${have ? `<div class="badge-desc">${badge.desc}</div>` : ''}
      `;
      container.appendChild(card);
    });
  }

  function _setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  return { init, show };
})();

window.ProgressScreen = ProgressScreen;
