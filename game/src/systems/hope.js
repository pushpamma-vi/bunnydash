/* ═══════════════════════════════════════════════════════════════
   HOPE SYSTEM
   The game must consistently give hope to every kid.
   This system manages:
    - Rotating hope messages on the home screen
    - Context-sensitive encouragement on difficult days
    - Welcome-back messages after rest days
    - Milestone celebration messages
    - Bunny speech during quiz
═══════════════════════════════════════════════════════════════ */

const Hope = (() => {

  // ── Core hope messages rotating on home screen ──
  const HOME_MESSAGES = [
    "Every level you complete is one more step forward. You've got this. 💛",
    "Fluff believes in you completely — even on the hard days. 🐰",
    "Learning is your superpower. No one can ever take it away from you. ⭐",
    "You showed up today. That alone is something incredible. 🌟",
    "Every question you answer makes you stronger for when you're back at school. 📚",
    "The bunnies are so proud of how far you've come. 🐾",
    "Rest days are part of the journey. Come back when you're ready — we'll be here. 💜",
    "You are not behind. You are exactly where you need to be, right now. 🌈",
    "Even the tiniest step still moves you forward. 👟",
    "Champions aren't made when everything is easy. They're made in moments like this. 🏆",
    "Your brain is learning even when your body needs to rest. That's amazing. 🧠",
    "The rainbow path is yours — one platform at a time. 🌈",
    "Fluff ran through storms to reach you. Now you run together. 🐰💨",
    "Every right answer is a little light added to the Bunny Realm. ✨",
    "You belong at school, with your friends. And you'll get back there. 🏫",
    "Hospitals can't stop curious minds. You're proof of that. 💡",
    "Brave doesn't mean not being scared. Brave means playing one more level anyway. 🦁",
    "The world is waiting for everything you're going to do. 🌍",
    "Today's small win is tomorrow's big confidence. 🌱",
    "You are loved. You are capable. You are going to be okay. 💛",
  ];

  // ── Energy-level-specific messages (low energy days) ──
  const LOW_ENERGY_MESSAGES = [
    "I know today is tough. I'm proud of you for being here at all. 💙",
    "Even five minutes of Bunny Brave is a win today. 🐰",
    "Rest Mode is here for you. No pressure — just Fluff keeping you company. 💤",
    "Today is a rest day and that's completely okay. You're still a champion. 🌙",
    "Your body is doing so much work right now. Being here at all is brave. 💜",
  ];

  // ── Welcome-back messages (returned after absence) ──
  const WELCOME_BACK_MESSAGES = [
    "Welcome back, champion! The bunnies missed you SO much. 🐰🌟",
    "You came back. That's everything. Let's pick up right where you left off. 💛",
    "The Bunny Realm was a little less colorful without you. Welcome home. 🌈",
    "Hey! You're here! Fluff did a happy spin when your name appeared. 🐾",
    "Every time you come back, the Gray Cloud shrinks a little more. 🌟",
  ];

  // ── Milestone messages by level ──
  const MILESTONE_MESSAGES = {
    5:   "5 levels done! The meadow is brighter because of you. 🌾",
    10:  "10 levels! Fluff's balloon got a star on it. You earned it. ⭐",
    15:  "Level 15! Baby has been watching you and wants to join! 🐣",
    20:  "20 levels! You've crossed the whole Meadow Fields. Look how far! 🌻",
    30:  "30 levels! You're deep in the Crystal Caves now. Glowing just like the crystals. 💎",
    45:  "Level 45! Rolli has been doing barrel rolls of excitement waiting for you! 🌀",
    50:  "Fifty! 5-0. Take a moment to feel that. FIFTY LEVELS. 🎉",
    75:  "75 levels! You're soaring through the Cloud Kingdom! ☁️",
    100: "ONE HUNDRED LEVELS. Sof floats beside you now — because so do you. 🌸✨",
    150: "150 levels. Fluffcone's rainbow horn appeared because YOU made it here. 🦄🌈",
    200: "200 LEVELS. The Gray Cloud is gone. The Bunny Realm is alive again — because of you. YOU are the Champion. 🏆💛",
  };

  // ── Quiz speech variants (bunny talking during quiz) ──
  const QUIZ_INTRO = [
    "You made it! Here comes your question 🌟",
    "Through the tunnel and ready to learn! 🐰",
    "Fluff thinks you've got this one! 💛",
    "Answer time! You're doing amazing. ⭐",
    "One question between you and the next adventure! 🌈",
  ];

  const CORRECT_REACTIONS = [
    "YES! That's exactly right! 🎉",
    "You nailed it! Fluff is doing a happy dance! 🕺",
    "Brilliant! One more star added to the Bunny Realm! ⭐",
    "Perfect! You make this look easy! ✨",
    "Correct! Your brain is incredible! 🧠💫",
    "AMAZING! Fluff's balloon is glowing! 🎈",
    "That's right! The tunnel is cheering for you! 🌈",
  ];

  const WRONG_REACTIONS = [
    "Almost! Fluff believes in you — let's try a slightly different way! 🐰",
    "Not quite — but you're thinking about it, which is great! Try once more! 💛",
    "Hmm, close! Let's look at it from a different angle. You've got this! 🌟",
    "That's okay! Even Rolli got some wrong at first. A new question is coming! 🌀",
    "Sof says: every wrong answer teaches you something. Keep going! 🌸",
    "Not this time — but the next one is yours! Fluff has total faith in you. 🐾",
    "Good try! A fresh question is on its way. You can do it! ⭐",
  ];

  const HINT_SPEECH = [
    "Here's a little clue from Fluff: ",
    "Baby whispers a hint: ",
    "Rolli rolls in with a tip: ",
  ];

  // ── Pause screen messages ──
  const PAUSE_MESSAGES = [
    "Rest is part of the journey. Fluff will wait for you. 💛",
    "Take all the time you need. The Bunny Realm isn't going anywhere. 🌈",
    "Even champions need breaks. Breathe. Come back when you're ready. 🌙",
    "Your progress is saved. Fluff is keeping watch. 🐰",
    "Rest. Heal. We'll be right here. 💜",
  ];

  // ── Returned after falling off platform ──
  const FALL_MESSAGES = [
    "Fluff bounced back! Let's try again! 🐰",
    "Up you get! The rainbow path is still waiting! 🌈",
    "Falls are just practice launches! 🚀",
    "Back to the start of this level — you've got the knowledge now! 💪",
    "Every champion falls and gets back up. That's you. ⭐",
  ];

  // Public API

  function getHomeMessage(energy) {
    const save = window.Save ? window.Save.get() : null;

    // Low energy day
    if (energy <= 2) {
      return pick(LOW_ENERGY_MESSAGES);
    }

    // Check if returning after absence
    if (save) {
      const today = new Date().toDateString();
      if (save.lastPlayedDate && save.lastPlayedDate !== today) {
        return pick(WELCOME_BACK_MESSAGES);
      }
    }

    // Check level milestone
    if (save) {
      const lvl = save.currentLevel || 1;
      if (MILESTONE_MESSAGES[lvl]) {
        const msg = MILESTONE_MESSAGES[lvl];
        // Only show milestone once (advance hopeIndex past it)
        return msg;
      }
    }

    // Rotate through standard messages
    const idx = save ? (save.hopeIndex || 0) : 0;
    const msg = HOME_MESSAGES[idx % HOME_MESSAGES.length];
    if (window.Save) {
      window.Save.set('hopeIndex', (idx + 1) % HOME_MESSAGES.length);
    }
    return msg;
  }

  function getQuizIntro()    { return pick(QUIZ_INTRO); }
  function getCorrect()      { return pick(CORRECT_REACTIONS); }
  function getWrong()        { return pick(WRONG_REACTIONS); }
  function getHintPrefix()   { return pick(HINT_SPEECH); }
  function getPause()        { return pick(PAUSE_MESSAGES); }
  function getFallMessage()  { return pick(FALL_MESSAGES); }

  function getMilestone(level) {
    return MILESTONE_MESSAGES[level] || null;
  }

  function getUnlockMessage(charId) {
    const msgs = {
      baby:      "You've done 15 incredible levels. Baby waited for you — and now you travel together. 🐣💛",
      rolli:     "45 levels of showing up. Rolli says: 'You roll through anything.' 🌀⭐",
      sof:       "One hundred levels. You answered hundreds of questions, jumped thousands of platforms, and never stopped. Sof floats beside you — because so do you. 🌸✨",
      fluffcone: "A rainbow horn appeared — not because the hard part was over, but because YOU made it through the hard part. This is yours. 🦄🌈",
      champion:  "The Gray Cloud is gone. The Bunny Realm is alive with color. Welcome back, Champion. You made it. 🏆💛🌈",
    };
    return msgs[charId] || "A new friend has joined your journey! 🐰";
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  return {
    getHomeMessage,
    getQuizIntro,
    getCorrect,
    getWrong,
    getHintPrefix,
    getPause,
    getFallMessage,
    getMilestone,
    getUnlockMessage,
  };
})();

window.Hope = Hope;
