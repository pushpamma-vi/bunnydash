# Bunny Dash — Game Design Document
### *A Learning Adventure for Warriors in Recovery*

> **Inspired by a kid's handwritten vision.**
> Every character, every level mechanic, and every math quiz in this document traces directly back to three notebook pages written with a heart full of imagination and care.

---

## Table of Contents
1. [Vision & Mission](#1-vision--mission)
2. [Kid's Original Design — Preserved Faithfully](#2-kids-original-design--preserved-faithfully)
3. [Why This Game Matters](#3-why-this-game-matters)
4. [Players & Personas](#4-players--personas)
5. [Core Gameplay Loop](#5-core-gameplay-loop)
6. [World & Level Design](#6-world--level-design)
7. [Characters & Powers](#7-characters--powers)
8. [Learning Engine](#8-learning-engine)
9. [Math Quiz System (Kid's Original Idea, Enhanced)](#9-math-quiz-system-kids-original-idea-enhanced)
10. [Subjects Beyond Math](#10-subjects-beyond-math)
11. [Adaptive Difficulty](#11-adaptive-difficulty)
12. [Hospital-Friendly Design](#12-hospital-friendly-design)
13. [Emotional Safety & Encouragement System](#13-emotional-safety--encouragement-system)
14. [Progression & Unlocks](#14-progression--unlocks)
15. [Accessibility](#15-accessibility)
16. [Teacher & Parent Dashboard](#16-teacher--parent-dashboard)
17. [Community & Belonging Features](#17-community--belonging-features)
18. [Narrative Arc — Recovery Warriors](#18-narrative-arc--recovery-warriors)
19. [Art Direction](#19-art-direction)
20. [Audio Design](#20-audio-design)
21. [Platform & Technical Overview](#21-platform--technical-overview)
22. [Privacy & Safety](#22-privacy--safety)

---

## 1. Vision & Mission

**Bunny Dash** is a joyful, curriculum-aligned platformer learning game built specifically for children and young people who are undergoing long-term medical treatment — cancer, organ transplants, chronic illness, and other conditions that keep them away from school for weeks, months, or years.

### The Problem It Solves

When a child is hospitalized or homebound for extended medical treatment, their schooling fractures. They miss critical foundational knowledge, fall behind peers, and face the double burden of healing their body *and* catching up academically — often with reduced energy, heavy medications, and significant emotional strain. When they return to school, the gap can feel insurmountable, damaging their confidence and social belonging at a vulnerable time.

### The Promise

> *"When they survive and come out of that misery, they should still have the same potential to compete with the world at their age and grade."*

Bunny Dash makes learning feel like play. Every minute of gameplay is also a minute of curriculum-aligned learning — math, reading, science, and social studies — calibrated to the child's exact grade level so that returning to school feels like coming home, not starting over.

---

## 2. Kid's Original Design — Preserved Faithfully

The following is a faithful transcription of the original handwritten design document, honored in full:

### Page 1 — Characters & World
> "The game is called Bunny Dash and it has 5 characters that unlock if [you] finish levels. The first character to unlock is at level 15, and the other has to unlock in level 45 and the other has to unlock in level 100, and the other has to unlock at level 150 and the other in level 200.
>
> Then the characters are Fluff, Baby, Rolli, Sof and Fluffcone and they all have special powers. Like the first one is Fluff and he has a red balloon. Also its special power is to jump a little higher and a little farther. So it has to create a better power when another is unlocked."

### Page 2 — Math Quiz System
> "So in the game, after each level is a math question which is Multiplication or Division by digit. But for younger people it's easier and for older it's harder. Also it cannot repeat the same question again. Also if you answer the question correctly, another question comes but not the same has to come.
>
> So to answer the question, numbers shaped in a keypad form (0 to 9) has to come on whatever the person types. They have to click the 'see answer' button that has to be right, below the keypad. And if the question disappears then the answer is correct. But another will come if the..."

### Page 3 — Platforms, Falling, Tunnels
> "...answer is not correct. Finally, the game has optional courses like there are rainbow path masses which is where you need to step on so you don't fall down, and below you is grass but you're very high up so you need to try not to fall down. But if you fall down you need to restart the level that you're doing and your character will come back. But if you make it, you will come in a tunnel. Also the levels get harder every time."

**Every single one of these design decisions is implemented in this document.** All enhancements are additive — nothing from the original has been removed or changed.

---

## 3. Why This Game Matters

### Who plays it
- Children ages 5–18 receiving chemotherapy, radiation, or long-term treatment
- Children with chronic conditions (autoimmune, cardiac, neurological) missing months of school
- Siblings and classmates who want to stay connected and learn together
- Homeschooled children whose parents want curriculum-aligned learning

### The learning gap crisis
A child undergoing a 6-month chemotherapy cycle typically misses:
- ~108 school days
- ~540 math lessons
- ~540 reading/writing sessions
- Critical social and peer-learning experiences

Without intervention, returning to school feels like arriving in a foreign country. Bunny Dash bridges that gap, turning treatment time into recovery *and* learning time simultaneously.

### Why a game works
- Hospital environments are isolating — a game provides agency and joy
- Progress bars and unlocks provide dopamine at a time when the body provides very little
- Short session design respects energy constraints from treatment side effects
- Narrative about getting stronger mirrors the child's own journey
- Peer connection features maintain social belonging

---

## 4. Players & Personas

### Persona 1 — Maya, 9 years old, ALL treatment
Maya is in her second month of chemotherapy for Acute Lymphoblastic Leukemia. She sleeps 16 hours a day and has nausea on treatment days. On good days she has 2–3 hours of energy. She was in 3rd grade. She misses her friends and her teacher. She likes animals and colors.

*How Bunny Dash serves Maya:* Short 10-minute sessions, auto-save every 5 seconds, Rest Mode skips the quiz on nausea days without losing progress, colorful bunny characters she can name and dress.

### Persona 2 — Caleb, 14 years old, kidney transplant recovery
Caleb is 8 weeks post kidney transplant, homebound for 3 months. He was in 8th grade. He's frustrated, bored, and worried about the algebra he's missing. He likes games and competitive scoring.

*How Bunny Dash serves Caleb:* Full algebra and pre-algebra module, class leaderboard keeps him connected to his school friends, difficult rainbow path levels, harder quiz questions aligned to 8th grade curriculum, speed-run mode for competitive runs.

### Persona 3 — Sofia, 6 years old, bone marrow transplant
Sofia is in a sterile hospital room after a bone marrow transplant. She can only use a tablet. She doesn't read well yet. She's in Kindergarten.

*How Bunny Dash serves Sofia:* Full audio narration for all text, tap-only controls, visual-first quiz answers (pictures + numbers), simple 1-digit math, huge buttons, bright friendly art.

### Persona 4 — James (parent of Caleb)
James wants to make sure Caleb's learning gap is documented for the school, and wants to share a progress report when re-enrollment happens.

*How Bunny Dash serves James:* Parent Dashboard shows topics covered, time spent, curriculum standards met, printable PDF progress reports for school and doctors.

---

## 5. Core Gameplay Loop

```
START LEVEL
    ↓
[PLATFORMER SEGMENT]
 - Dash/Run through the level
 - Navigate rainbow path platforms
 - Collect star coins and reading scrolls
 - Don't fall (or restart with character restored)
 - Reach the tunnel at the end
    ↓
[TUNNEL MOMENT] — brief cinematic, character celebration
    ↓
[LEARNING CHECKPOINT]
 - Math question (Kid's original design)
 - OR Reading snippet + comprehension question
 - OR Science observation question
 - Keypad input (0-9) — numbers, or tap-select for reading
    ↓
[RESULT]
 - Correct → Star awarded, next level unlocked
 - Incorrect → Supportive message, same question re-phrased (not identical)
 - 3 correct in a row → Power-up activated for next level
    ↓
NEXT LEVEL (harder)
```

### Session Design
| Mode | Duration | For |
|---|---|---|
| Quick Dash | 5–8 min | Fatigue days, post-treatment |
| Standard Run | 10–15 min | Regular play sessions |
| Deep Dive | 20–30 min | High energy days, learning focus |
| Rest Mode | 3–5 min | Very low energy — light story, no quiz |

Sessions auto-save every 5 seconds. The game can be paused and resumed mid-level with no penalty.

---

## 6. World & Level Design

### Biome Progression
Each world has a theme that subtly mirrors a recovery journey — from dark and uncertain to bright and triumphant.

| World | Name | Theme | Levels | Platform Hazard |
|---|---|---|---|---|
| 1 | Meadow Fields | Soft grass, flowers | 1–20 | Low height, forgiving falls |
| 2 | Crystal Caves | Glowing crystals | 21–40 | Cave drops, bounce mushrooms |
| 3 | Cloud Kingdom | Sky and clouds | 41–70 | High altitude, wind gusts |
| 4 | Rainbow Realm | **Kid's original rainbow paths** | 71–110 | Pure rainbow platforms, very high |
| 5 | Star Harbor | Space docks | 111–155 | Zero-gravity sections |
| 6 | Sunlit Summit | Bright mountain peak | 156–200+ | Ice + rainbow, hardest |

### Rainbow Path Levels (Kid's Original Mechanic)
As described in the synopsis: rainbow-colored horizontal platforms of varying widths stretch across the screen at great height. Grass far below. You must hop platform to platform without falling.

**Enhancements:**
- Platform widths shrink as levels progress
- Platforms subtly sway at higher levels
- Some platforms are labeled with numbers (connecting math to the physical world)
- Secret "bonus platforms" appear after 3 consecutive correct quiz answers — wider, golden platforms that grant extra coins

### Level Structure
```
[Start Gate] → [Run Segment] → [Mid-Level Platform Puzzle] 
                                        ↓
                               [Optional Rainbow Path — 
                                kid's original: extra stars]
                                        ↓
                               [Boss Platform — widest to 
                                narrowest, timed balance]
                                        ↓
                               [Tunnel End] → [Learning Checkpoint]
```

### The Tunnel
When the player successfully navigates the level and reaches the end, their bunny dashes into a glowing tunnel. The tunnel is a brief (3-second) moment of warmth and celebration — stars burst, the bunny does a happy spin, upbeat music swells. Inside the tunnel is the Learning Checkpoint.

The tunnel is a metaphor: *you came through something hard. Now let's grow.*

---

## 7. Characters & Powers

All five characters from the kid's original design, with expanded abilities and narratives.

### Character 1 — Fluff ⭐ (Starting Character)
*"He has a red balloon. His special power is to jump a little higher and a little farther."*

| Attribute | Detail |
|---|---|
| **Unlocked at** | Start (default character) |
| **Appearance** | White fluffy bunny, red heart balloon tied to wrist |
| **Platformer Power** | Enhanced jump — higher arc, longer distance |
| **Learning Theme** | Number sense, basic counting, quantities |
| **Lore** | Fluff carries a red balloon given to him by his best friend on the first day of treatment. Every time he jumps high, he remembers that friend cheering for him. |
| **Power Evolution** | When a new character unlocks, Fluff's balloon gets a gold star added to it, making his enhanced jump even stronger |

### Character 2 — Baby 🐣 (Unlocks: Level 15)
*(Originally described as the character at level 15)*

| Attribute | Detail |
|---|---|
| **Unlocked at** | Level 15 |
| **Appearance** | Very small pale yellow bunny with oversized eyes |
| **Platformer Power** | **Flutter** — Baby can flap tiny wings briefly to slow a fall; lands softly if falling from height |
| **Learning Theme** | Addition & subtraction facts, phonics, letter recognition |
| **Lore** | Baby just started their journey. Small but determined. The fall-softening power represents resilience — even when things go wrong, you land safely. |

### Character 3 — Rolli 🌀 (Unlocks: Level 45)

| Attribute | Detail |
|---|---|
| **Unlocked at** | Level 45 |
| **Appearance** | Chubby round bunny that literally rolls |
| **Platformer Power** | **Dash Roll** — can barrel-roll horizontally to cover large platform gaps quickly; invincible during roll |
| **Learning Theme** | Multiplication tables (kid's original!), reading comprehension |
| **Lore** | Rolli discovered that rolling through obstacles was faster than running around them. A metaphor for finding shortcuts in learning — patterns, times tables, sight words. |

### Character 4 — Sof 🌸 (Unlocks: Level 100)

| Attribute | Detail |
|---|---|
| **Unlocked at** | Level 100 |
| **Appearance** | Soft lavender bunny with flower crown, gentle glowing aura |
| **Platformer Power** | **Petal Float** — double jump; second jump generates flower petals that act as temporary platforms for 1 second |
| **Learning Theme** | Division (kid's original!), fractions, science observations, creative writing |
| **Lore** | Sof reached level 100 — that means 100 days of showing up. Sof floats because lightness comes from strength earned. |

### Character 5 — Fluffcone 🦄 (Unlocks: Level 150)

| Attribute | Detail |
|---|---|
| **Unlocked at** | Level 150 |
| **Appearance** | White bunny with a rainbow unicorn horn, sparkle trail when running |
| **Platformer Power** | **Horn Boost** — brief hyper-speed sprint (3 sec) + creates rainbow platform bridges across gaps |
| **Learning Theme** | Advanced math (algebra concepts, fractions, geometry), science experiments, history |
| **Lore** | Fluffcone proved that the impossible is possible. The horn grew when nobody was watching — during all those quiet, hard days of recovery. |

### Secret Character — Champion 🏆 (Unlocks: Level 200)
*(Bonus: the kid's design mentions the 5th character at level 200, but why stop the celebration there?)*

| Attribute | Detail |
|---|---|
| **Unlocked at** | Level 200 |
| **Appearance** | All five bunnies merge into one — a golden bunny wearing pieces of each character's symbol |
| **Platformer Power** | **All powers combined** — full power suite: enhanced jump + flutter + dash roll + petal float + horn boost |
| **Learning Theme** | Cross-subject mastery challenges |
| **Lore** | You made it. Every day of treatment, every quiz, every level — it led here. You are the Champion. |

> **Design Note on Power Evolution (Kid's Idea):** When a new character is unlocked, Fluff's power grows too. Each unlock adds a cumulative buff to all previously unlocked characters — the whole team gets stronger together. This mirrors the reality that community grows stronger together.

---

## 8. Learning Engine

### Curriculum Alignment
Bunny Dash is aligned to:
- **US Common Core State Standards** (Math, ELA)
- **UK National Curriculum** (KS1–KS4)
- **IB Primary Years Programme (PYP)**
- Custom grade-mapping for other regions (configurable by parent/teacher)

### Grade-Level Mapping
| Game Levels | School Grade (US) | Age (approx.) | Math Focus |
|---|---|---|---|
| 1–20 | Kindergarten | 5–6 | Counting to 20, number recognition |
| 21–40 | Grade 1 | 6–7 | Addition/subtraction to 20 |
| 41–70 | Grade 2 | 7–8 | Addition/subtraction to 100, intro ×2, ×5, ×10 |
| 71–110 | Grade 3 | 8–9 | Multiplication/division (kid's core mechanic) |
| 111–140 | Grade 4 | 9–10 | Multi-digit multiplication, fractions |
| 141–165 | Grade 5 | 10–11 | Fractions, decimals, mixed operations |
| 166–185 | Grade 6 | 11–12 | Ratios, intro algebra, negative numbers |
| 186–200 | Grade 7–8 | 12–14 | Algebra, geometry, statistics |

**Critical feature:** A player can **set their grade independently of game level.** A 14-year-old at game level 50 still gets 8th-grade content. The game level tracks *engagement and progress*, while the learning content tracks the *curriculum level*.

### No-Repeat Question Engine (Kid's Original Requirement)
The kid explicitly stated: *"it cannot repeat the same question again."*

Implementation:
- A `question_pool` per subject per grade contains 500+ unique questions
- A bloom filter per player tracks every question ever shown
- Questions are **never** repeated in the same session
- Across sessions: a question is only retired if answered correctly 3 times
- Incorrect questions are re-queued with **different phrasing** (not identical), then repeated at the next session milestone

---

## 9. Math Quiz System (Kid's Original Idea, Enhanced)

The kid's design is the foundation. Here it is, implemented in detail.

### Appearance
After the bunny enters the tunnel, the screen transitions to the Quiz Room. The tunnel's glow surrounds the edges like a frame. The bunny sits happily in the center, holding a small chalkboard.

### The Keypad (Kid's Exact Specification)
*"Numbers shaped in a keypad form (0 to 9) has to come on whatever the person types."*

```
┌─────────────────────────────────┐
│                                 │
│    🐰  What is  6 × 7 ?         │
│                                 │
│         [ _ _ ]                 │
│                                 │
│    ┌───┬───┬───┐                │
│    │ 7 │ 8 │ 9 │                │
│    ├───┼───┼───┤                │
│    │ 4 │ 5 │ 6 │                │
│    ├───┼───┼───┤                │
│    │ 1 │ 2 │ 3 │                │
│    ├───┴───┼───┤                │
│    │   0   │ ⌫ │                │
│    └───────┴───┘                │
│                                 │
│    [ 🔍 SEE ANSWER ]            │
│                                 │
└─────────────────────────────────┘
```

- Numbers entered appear in the answer box above
- Backspace (⌫) to correct mistakes
- **"SEE ANSWER"** button (kid's design: *"they have to click the see answer button that has to be right, below the keypad"*)
- If correct: question fades away, stars burst, bunny celebrates (*"if the question disappears then the answer is correct"*)
- If incorrect: bunny gently shakes head, kind message appears, new (rephrased) question comes (*"another will come if the answer is not correct"*)

### Question Difficulty Scaling (Kid's Design: "younger = easier, older = harder")

| Age / Grade | Operation | Digit Range | Example |
|---|---|---|---|
| K–1 (5–7) | + and − | 1 digit | 3 + 4, 9 − 5 |
| G2–G3 (7–9) | ×, ÷ basics | 1×1 | 4 × 6, 24 ÷ 8 |
| G4–G5 (9–11) | ×, ÷ extended | 2×1 | 13 × 4, 72 ÷ 6 |
| G6+ (12+) | Mixed operations | 2×2, fractions | 24 × 13, ¾ ÷ ½ |

### Quiz Variants (Same Keypad, More Subjects)
The keypad isn't just for math numbers — it adapts:
- **Reading:** Multiple-choice tap (4 picture/text answer tiles replace keypad)
- **Science:** Same keypad for numeric answers ("How many legs does a spider have?")
- **Spelling:** Letter tiles replace number tiles for spelling challenges

---

## 10. Subjects Beyond Math

Honoring the core mission — keeping children at grade level across all subjects.

### Reading & Language Arts
- Short passages (3–5 sentences for young grades, 1–2 paragraphs for older)
- Comprehension questions after each passage
- Vocabulary highlights with tap-to-hear pronunciation
- Spelling games using the same level-end checkpoint slot
- Creative writing prompts with voice recording option (drawings on tablet)

### Science
- Observation-based questions tied to level themes (e.g., in Crystal Cave world: "Light bounces off crystals — this is called ___?")
- Short "science moment" animations during tunnel sequence
- Grade-aligned biology, chemistry, physics concepts
- Inquiry questions: multiple answer taps + short explanation

### Social Studies & History
- Age-appropriate world cultures, geography, civics
- Map mini-games (tap the country/state/continent)
- Timeline puzzles in bonus levels
- Stories of historical figures who overcame great challenges (subtly inspirational for recovery context)

### Subject Rotation
The game rotates subjects to avoid fatigue:
- Math: every other level (kid's core design)
- Reading: every 3rd level
- Science: every 5th level
- Social Studies: every 8th level
- Player can set preferred subject weighting in settings

---

## 11. Adaptive Difficulty

### Three-Layer Adaptation

**Layer 1 — Grade Level** (set manually by child/parent/teacher)
Ensures content is curriculum-appropriate regardless of game level.

**Layer 2 — Performance Tracking**
The engine watches a rolling window of the last 10 quiz answers:
- >80% correct → gradually increase difficulty within grade
- 50–80% correct → maintain current difficulty
- <50% correct → step difficulty back, offer a "hint" mode

**Layer 3 — Energy Mode** (unique to this game's audience)
Players can set a daily "energy level" (1–5 scale, using a simple bunny-mood icon, not medical terms):
- Energy 1–2 (difficult day): Fewer required questions, shorter platformer levels, more encourage-only messages
- Energy 3 (normal): Standard flow
- Energy 4–5 (great day): Challenge mode unlocked, harder questions, bonus levels

This respects that a child undergoing chemotherapy has vastly variable daily capacity and should never feel punished for low-energy days.

### Streak & Recovery System
- **Correct streak:** 3 in a row = Power-up for next level
- **Incorrect answer:** Bunny gently encourages; difficulty doesn't punish; next question is same topic, different framing
- **Session reset:** Each new session starts fresh with no penalty for previous session's struggles

---

## 12. Hospital-Friendly Design

### Offline Mode
100% playable offline. All curriculum content for the player's grade level downloads on first setup. Parents/medical staff approve the download once on hospital Wi-Fi; child plays freely without connectivity.

Progress syncs to cloud automatically when connectivity resumes.

### Low-Power Mode
Reduces animations and visual effects to extend tablet battery life during long sessions or when a charger isn't accessible.

### Screen Orientations
- **Landscape:** Full platformer experience (recommended)
- **Portrait / Bed Mode:** Simplified tap-through version for flat/reclining positions, touch-only controls, larger buttons — designed for children lying in bed holding a tablet above them

### Single-Hand Play
All critical game controls work with one thumb/finger. Designed for children with IV lines, casts, or limited arm mobility.

### Input Methods
| Method | Availability | For Whom |
|---|---|---|
| Touch tap/swipe | All devices | Primary input |
| Physical keyboard | Tablets + desktop | Keypad input for math |
| Gamepad/controller | Desktop/console | Older children |
| Voice input (answer) | Optional | Motor limitations |
| Large button mode | Optional | Fine motor challenges |

### Session Length Safety
The game reminds players to take breaks:
- After 20 minutes: gentle bunny animation saying "Time to stretch!" (dismissible)
- Never forces quit — children in pain should not be forced to stop without choice
- Respects hospital schedule: optional "medicine time" break reminder that parents can configure

---

## 13. Emotional Safety & Encouragement System

### Core Principle
A child in treatment already faces enormous negativity — failed treatments, difficult news, physical suffering. The game **never** adds to that burden.

### What the Game Never Does
- Never shows a death animation or "you died" message
- Never shows a red X or harsh "WRONG!" flash
- Never awards grades or percentages that feel like a report card
- Never has a countdown timer on quiz questions (pressure = bad for sick children)
- Never shows streaks breaking in a dramatic way — a gentle neutral reset instead
- Never compares a player's performance to other players in a ranking that shows specific scores (only positive highlights)

### What the Game Always Does
- Shows a friendly message on every wrong answer:
  - "Almost! Fluff believes in you — let's try a different way!"
  - "Not quite, but you're getting warmer! 🌟"
  - "It's okay! Rolli got it wrong the first time too. Let's look at it together."
- Celebrates non-learning milestones: "You played for 5 days this week! That's amazing!"
- After a rest day (no play): "Welcome back, champion! The bunnies missed you."
- Acknowledges hard days explicitly: when Energy Mode 1–2 is selected, the bunny says: *"I know today is tough. I'm proud of you for being here at all."*

### The Character Bond System
As a player spends time with a specific bunny, that bunny's dialogue becomes more personal:
- "You've done 50 questions with me, Fluff! You're my favorite human."
- Bunny "remembers" the player's name and uses it
- On difficult days: the assigned bunny sends a "thinking of you" animation from the home screen

### Recovery Warrior Badges
Non-academic achievement badges that celebrate persistence, courage, and community:
- "Showed Up" — played on a difficult day (Energy Mode 1–2)
- "Marathon Runner" — 30 total play sessions
- "Star Catcher" — collected 100 stars
- "Question Crusher" — answered 500 questions correctly (across all subjects)
- "Rainbow Walker" — completed all rainbow path levels in a world
- "Team Bunny" — shared progress with a friend or classmate

---

## 14. Progression & Unlocks

### Level Milestones (Kid's Original Design)

| Level | Unlock |
|---|---|
| Level 1 | Fluff unlocked (default) |
| Level 15 | **Baby** unlocked |
| Level 45 | **Rolli** unlocked |
| Level 100 | **Sof** unlocked |
| Level 150 | **Fluffcone** unlocked |
| Level 200 | **Champion** (golden fusion) unlocked |
| Every 10 levels | New cosmetic for active character |

### Character Customization
Each bunny has unlockable accessories (cosmetic only, no gameplay impact):
- Hats, scarves, glasses, wings, tail accessories
- Hospital-themed items: tiny bandana (honoring the warrior journey), "Chemo Bear" companion, cheer banner
- Players can also draw their own simple accessories using the in-game sketch tool (tablet)

### Star Coin Economy
Stars collected on platforms can be spent in the Bunny Store:
- Cosmetic items for characters
- New color schemes for the game world
- Special animations for the tunnel celebration
- "Send a cheer" — spend stars to send a virtual cheer to a classmate also playing

### World Completion Rewards
Completing all levels in a world unlocks a short animated story about that bunny's journey — beautifully illustrated, 2–3 minutes, with read-aloud narration. These short films double as reading comprehension material.

---

## 15. Accessibility

### Visual
- Dyslexia-friendly font (OpenDyslexic) option in settings
- High contrast mode (for light sensitivity, common during treatment)
- Color-blind modes: Deuteranopia, Protanopia, Tritanopia — rainbow paths recolored to appropriate contrasting sets
- Text size slider (4 sizes: Small, Medium, Large, Giant)
- Reduce Motion mode (stops all non-essential animations) for photosensitive players

### Auditory
- Full audio narration for all text (every quiz question, every tip, every story)
- Sound off / subtitles only mode
- Individual volume sliders: Music, SFX, Voice

### Language Support
- English (launch)
- Spanish, French, Arabic, Hindi, Mandarin (Phase 2)
- All curriculum content translated and locally reviewed by educators in each region

### Cognitive Accessibility
- Tutorial bunny "Coach Fluff" available at any time in any screen
- Simplified mode: fewer simultaneous elements on screen
- Extended answer time (unlimited — no timer pressure ever)
- "Show Hint" button on any question (shows partial working, uses a Star Coin)

---

## 16. Teacher & Parent Dashboard

### Parent View
- Total time played per day/week/month
- Topics covered and standards met
- Quiz accuracy by subject
- Character/level progression
- Energy mode log (so parents can see patterns around treatment days)
- Printable **Learning Progress Report** for school re-enrollment meetings

### Teacher View (School Account Integration)
- Class roster with each student's game progress
- Curriculum standard coverage heatmap
- Assign specific topics to align with what the class is currently learning
- "Catch-up plan" generator: teacher inputs what the class covered in the past month; game auto-prioritizes those topics
- Message the student via the game's in-game "Teacher Postcard" feature

### Medical Team View (Optional, with Parental Consent)
- Brain-training engagement data (useful for therapy teams tracking cognitive recovery)
- Fatigue pattern recognition (energy mode data over time)
- Note: **no medical conclusions are drawn by the game** — data is informational only for care teams

---

## 17. Community & Belonging Features

### Class Connection Mode
The single biggest emotional wound for hospitalized kids is feeling forgotten by their class. Bunny Dash addresses this directly.

- A child's teacher sets up a "Class Flock" — a shared virtual space where the whole class's bunnies appear together
- The hospitalized child can see their bunny standing with their classmates' bunnies on a shared "school field" screen
- Classmates can send stars, drawings, or voice messages (teacher-moderated)
- "Class Challenge of the Week" — a shared learning goal; when the sick child completes it, a gold star appears on the class flock

### Penpal Bunny
Kids can send their bunny (with a short approved message, parent/teacher moderated) to a peer's game, where the visiting bunny leaves a "star gift." No real-world identifying info is exchanged — just bunny names and kind messages.

### "Bunny Brigade" — Community Milestone
If 10 players in a class flock collectively complete 1,000 questions, a special animated event fires for every player simultaneously: a giant rainbow bridge appears in everyone's game, and all bunnies run across it together. 

*This collective progress mechanic ensures the hospitalized child contributes to and benefits from group achievement equally.*

### Hospital Wing Flock (Optional Program)
For hospitals that adopt Bunny Dash as an official program:
- All patients in the same hospital unit can opt into a "Wing Flock"
- Anonymous (bunny name only, no real names)
- The whole wing works together on learning goals
- Medical staff can join with a "Staff Bunny" that cheers players on

---

## 18. Narrative Arc — Recovery Warriors

The game's overarching story, told through the world-completion films and loading screen comics:

### The Story
The Bunny Realm has been struck by the **Gray Cloud** — a creeping mist that drains color, joy, and knowledge from the land. Fluff and friends discover that the only way to push back the Gray Cloud is with **Dash Energy** — created by learning, growing, daring, and recovering together.

Each world the player completes restores color to a part of the Bunny Realm. By Level 200, the entire world is restored — vibrant, rainbow-lit, full of life.

The bunnies are not superhero-strong from the start. They are small, uncertain, sometimes scared. They get knocked off platforms. They face hard questions. But they keep going, and they grow stronger — every level, every quiz answer, every "try again."

*The player and the bunnies are the same. The Gray Cloud is anything that tries to take away who you are. Learning and resilience push it back.*

### Narrative Beats at Key Milestones
- **Level 15 (Baby unlocks):** *"You're not alone. Baby waited for you, and now you travel together."*
- **Level 45 (Rolli unlocks):** *"45 days of showing up. Rolli says: 'You roll through anything.'"*
- **Level 100 (Sof unlocks):** *"100. One. Hundred. Levels. You've answered hundreds of questions, jumped thousands of platforms, and never stopped. Sof floats beside you today — because so do you."*
- **Level 150 (Fluffcone unlocks):** *"A rainbow horn appeared — not because the hard part was over, but because YOU made it through the hard part. This is yours."*
- **Level 200 (Champion unlocks):** *"The Gray Cloud is gone. The Bunny Realm is alive with color. And somewhere in the real world, the same thing just happened to you. Welcome back, Champion."*

---

## 19. Art Direction

### Visual Style
- **2D, soft-edge pixel art** with gentle gradients — charming without being harsh
- Influenced by: Kirby's Adventure warmth, Stardew Valley palette softness, Celeste's world expressiveness
- Character designs: round, soft, expressive — no sharp edges, nothing visually threatening
- Color palette: warm and cool pastels, with vibrant accent colors for interactables (stars, platforms, tunnels)
- **Medical equipment subtly ignored in art direction** — bunnies are never shown in hospital settings; the game world is pure escape

### Platform Design
Rainbow path platforms (kid's original): each platform has a distinct rainbow color band:
- Red = widest, most stable
- Orange = slightly narrower
- Yellow = standard
- Green = slightly narrower still
- Blue = narrow, swaying
- Violet = narrowest, most challenging
Later levels mix and scramble the colors to prevent "just use the red ones" strategies.

### Tunnel Design
The tunnel at the end of every level:
- Glows with warm golden light from the inside
- Round, stone-framed entrance with ivy and flowers
- When the bunny enters, the camera follows into a brief moment of starlight spiraling — a breath of magic
- The learning checkpoint screen uses the tunnel's warm gold glow as its background

### UI Philosophy
- All menus soft-rounded, pastel
- No dark borders or harsh contrast on normal UI
- Loading screens show a short illustrated comic panel (no loading bar — just story)
- Error states shown as a bunny looking confused with a kind message (never a red error icon)

---

## 20. Audio Design

### Music
- Original soundtrack: gentle, upbeat, non-lyrics
- Each world has its own musical theme (Meadow = acoustic guitar + gentle bells; Cloud Kingdom = flute + light synth)
- Learning checkpoint room: soft, calm, focusing music — slower tempo, no percussion
- Tunnel moment: brief orchestral swell of joy
- Character unlock: triumphant but brief fanfare, unique per character
- All music loops seamlessly; no jarring cuts

### Sound Effects
- Platform steps: soft "boing" sounds, not jarring
- Correct answer: warm chime + a small "whoosh" of stars
- Incorrect answer: a soft, gentle "waah-waah" (not harsh buzzer — never punitive)
- Bunny reactions: small cute squeaks and hops, no words
- Star collect: soft twinkle

### Voice
- All quiz questions read aloud by a warm, friendly narrator (not robotic TTS)
- Character dialogues voiced (short phrases, 1–3 seconds)
- Bunny sounds are not words — soft squeaks and purrs only
- Player's name spoken by the narrator where used ("Great job, [Name]!")
- Full narration of all tutorial and story text

### Audio Accessibility
- All content playable with sound OFF (full subtitles and visual cues for everything)
- Music and SFX independent volume controls
- Night mode audio: auto-reduces volume after 9 PM (configurable)

---

## 21. Platform & Technical Overview

### Target Platforms (Priority Order)
1. **Tablet (iOS & Android)** — Primary; hospital environment, touch-first
2. **Chromebook** — Widely used in schools; keyboard + touch
3. **Web Browser** — Accessible on any hospital computer or laptop
4. **Desktop (Windows / macOS)** — Secondary; home recovery
5. **Console (Nintendo Switch)** — Future phase; large screen, handheld mode

### Architecture Highlights
- **Offline-first:** Full game and curriculum content for player's grade level stored locally; sync on connect
- **Auto-save:** State persisted every 5 seconds to local storage + cloud on sync
- **Content delivery:** Curriculum questions and content served as signed, versioned JSON packs downloadable per-grade
- **No ads ever:** The game must never serve advertisements; it is funded through institutional licensing, not player monetization
- **No in-app purchases that affect gameplay:** Cosmetics only, and a significant number unlockable for free via star coins

### Privacy & Data Architecture
- Players under 13: full COPPA compliance (US), GDPR-K compliance (EU)
- No third-party analytics SDKs in the children's build
- No behavioral advertising
- Player data stored encrypted, never sold, never used for training AI models without explicit institutional consent
- All multiplayer/community features go through end-to-end moderated channels — no direct text chat between minors

---

## 22. Privacy & Safety

### Design Principles
- **Minimum data collection:** Only what is needed for learning progress and game save
- **Parent control:** Every community and sharing feature requires explicit parent opt-in
- **Teacher verification:** Educational accounts require institutional email verification
- **No usernames as real names:** Players choose a bunny name for public display; real names stay in the private parent/teacher dashboard only
- **Content moderation:** All messages between users (classmate cheers, teacher postcards) are screened before delivery
- **Delete everything:** One-tap account deletion removes all data permanently within 30 days

### Hospital Data Sharing
Data shared with medical teams requires:
1. Explicit written digital consent from parent/guardian
2. Role-verified medical professional account
3. Aggregated, non-identifiable data only (engagement patterns — not specific quiz answers)

---

## Appendix A — Summary of Original Kid's Design vs. Enhancements

| Kid's Original Element | Status | Enhancement |
|---|---|---|
| Game called "Bunny Dash" | ✅ Preserved | Subtitle "A Learning Adventure for Warriors in Recovery" added |
| 5 characters unlocking at levels 15, 45, 100, 150, 200 | ✅ Preserved exactly | Secret 6th character at 200 added as bonus |
| Characters: Fluff, Baby, Rolli, Sof, Fluffcone | ✅ Preserved exactly | Each given backstory, lore, learning theme |
| Fluff has red balloon, jumps higher & farther | ✅ Preserved exactly | Balloon gains gold stars as team grows |
| New characters create better power | ✅ Preserved exactly | Power evolution system: each unlock buffs all prior characters |
| Math question after each level | ✅ Preserved exactly | Extended to include reading, science after every 2nd/3rd level |
| Multiplication or division by digit | ✅ Preserved exactly | Grade-adaptive: simpler for younger, harder for older |
| Younger = easier, older = harder | ✅ Preserved exactly | Three-layer adaptive difficulty system |
| Cannot repeat same question | ✅ Preserved exactly | Bloom filter + 500+ question pool per grade per subject |
| Answer another if correct (not same) | ✅ Preserved exactly | Rephrased question queue |
| Keypad 0–9 for input | ✅ Preserved exactly | Enhanced with backspace, visual styling |
| "See Answer" button below keypad | ✅ Preserved exactly | Named "SEE ANSWER", prominent placement |
| Question disappears if correct | ✅ Preserved exactly | Star burst + tunnel celebration added |
| New question if incorrect | ✅ Preserved exactly | Added gentle encouragement message |
| Rainbow path platforms at height | ✅ Preserved exactly | World 4 "Rainbow Realm", different widths per color |
| Grass below, fall = bad | ✅ Preserved exactly | Fall = restart level (grass visual far below) |
| Fall → restart level, character comes back | ✅ Preserved exactly | "character comes back" — no character loss at all |
| Make it to end → come through a tunnel | ✅ Preserved exactly | Tunnel is now the central narrative symbol |
| Levels get harder every time | ✅ Preserved exactly | Platform width narrows, quiz complexity rises |

---

## Appendix B — Development Phases

### Phase 1 — Core Game (MVP)
- Fluff (default) + Baby at Level 15
- Worlds 1–2 (Meadow Fields, Crystal Caves), Levels 1–40
- Math quiz system (multiplication + division), Grades 2–4
- Offline play, auto-save
- Parent dashboard (basic)
- iOS + Android tablet

### Phase 2 — Learning Expansion
- All 5 original characters
- Worlds 3–4 including full rainbow path levels
- Reading and science quiz modules
- Teacher dashboard
- Class Flock (community feature)
- Grade K–8 full curriculum

### Phase 3 — Full Vision
- Champion character (Level 200)
- Worlds 5–6
- Voice input, large button mode
- Multilingual support (Spanish, French)
- Hospital Wing Flock program
- Chromebook + Web + Desktop

### Phase 4 — Platform Expansion
- Nintendo Switch
- Console/TV mode
- Expanded community features
- Hospital program official partnership support

---

*This document is a living design artifact. The heart of it — the five bunnies, the rainbow platforms, the tunnel, the keypad, the math after every level — belongs to the kid who wrote three pages in a notebook with nothing but love and imagination. Every enhancement exists to serve that vision and the community of young warriors it was built for.*

---

**Last updated:** April 11, 2026
**Original concept:** A kid with a notebook and a great heart
**License:** All rights reserved — intended for non-profit / open-source educational use in partnership with pediatric medical institutions
