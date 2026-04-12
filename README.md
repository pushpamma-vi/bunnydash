# 🐰 Bunny Dash
### *A Learning Adventure for Warriors in Recovery*

A joyful, curriculum-aligned platformer game for children and young people undergoing long-term medical treatment — keeping their knowledge, confidence, and connection to the world intact while they heal.

---

## The Origin

This game was designed by a kid. Three handwritten notebook pages. Five bunnies. Rainbow platforms. A keypad for math questions. A tunnel at the end of every level.

That is the heart of Bunny Dash. Everything else in this repository builds on that vision.

> *"When they survive and come out of that misery, they should still have the same potential to compete with the world at their age and grade."*

---

## Documents

| Document | Description |
|---|---|
| [GAME_DESIGN_DOCUMENT.md](GAME_DESIGN_DOCUMENT.md) | Full game design — characters, worlds, mechanics, progression, accessibility, community, narrative |
| [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md) | Stack (Godot 4), data models, offline-first architecture, security, deployment |
| [CURRICULUM_FRAMEWORK.md](CURRICULUM_FRAMEWORK.md) | K–8 curriculum map, math/reading/science, adaptive engine, catch-up plans, progress reports |

---

## Live Deployment (GitHub Pages)

### First-time setup (5 minutes)

```bash
# 1. Create a GitHub repo (do this on github.com — make it public)

# 2. Push this project
git init
git remote add origin https://github.com/YOUR_USERNAME/bunnydash.git
git add .
git commit -m "🐰 Bunny Dash — initial release"
git push -u origin main

# 3. Enable GitHub Pages
#    Go to: github.com/YOUR_USERNAME/bunnydash
#    Settings → Pages → Source: GitHub Actions
#    The deploy.yml workflow runs automatically on every push
```

Your game is live at:
```
https://YOUR_USERNAME.github.io/bunnydash/
```

---

### Access code system

The root `index.html` is a gate page. Visitors must enter an organization code before reaching the game. Once approved, the device remembers — no code needed again.

**Current access codes** (share privately with organization coordinators):

| Code | Intended recipient |
|------|-------------------|
| `HOPEHERO` | Default hospital / child life partner code |
| `BUNNYDASH` | General partner and educator access |
| `WARRIOR2026` | Annual renewal code — rotate each year |

**Adding a new organization:**
```bash
# Generate a new code + its hash
node manage-codes.js generate NEWORGNAME

# Then paste the output hash line into:
#   1. index.html  →  VALID_HASHES set
#   2. manage-codes.js  →  REGISTERED object
# Commit and push — live in ~30 seconds
```

**Rotating an expired code:**
```bash
node manage-codes.js generate WARRIOR2027
# Update index.html and manage-codes.js
# Remove the WARRIOR2026 entry from both files
# Commit and push
```

---

### Adding a new hospital in under 2 minutes

```bash
# 1. Generate their code
node manage-codes.js generate CHILDRENSHOSP2026

# 2. Edit index.html — add the hash line shown above
# 3. Edit manage-codes.js — add the entry to REGISTERED
# 4. Push

git add index.html manage-codes.js
git commit -m "Add access code for Children's Hospital 2026"
git push
# Deployment is automatic — live in ~30 seconds
```

---

### Offline deployment (hospitals with no internet)

For intranet or tablet use:
```bash
# Zip the entire folder (excluding .git/)
zip -r bunnydash.zip . --exclude ".git/*"
# Send bunnydash.zip to the hospital IT team
# They extract it and open index.html in any browser — no server needed
```

---

## The Kid's Original Design (Preserved in Full)

- **Game name:** Bunny Dash
- **5 characters** unlocking at levels 15, 45, 100, 150, 200: Fluff, Baby, Rolli, Sof, Fluffcone
- **Fluff** has a red balloon; special power = jump higher and farther
- Each new character creates a better power; previously unlocked characters grow stronger too
- **Math question after every level** — multiplication or division by digit
- Younger players get easier questions; older players get harder ones
- **No question ever repeats**
- Answer stays on screen until correct; a different (not identical) question comes if wrong
- **Keypad (0–9)** for input; **"See Answer" button** below the keypad
- Question disappears when correct
- **Rainbow path platforms** high above the grass — step carefully or fall
- Fall = restart the level; character always comes back
- Make it through = enter a **tunnel**
- **Levels get harder every time**

Every single one of these mechanics is in the GDD, unchanged.

---

## What Was Added

All enhancements serve the medical education cause and add on top of — never replacing — the original design:

- **6 subjects:** Math, Reading, Science, Social Studies (grade K–8, fully curriculum-aligned)
- **Adaptive difficulty:** Three-layer system (grade level + performance + daily energy mode)
- **Hospital-friendly design:** Offline play, bed mode, single-hand controls, session length limits
- **Emotional safety system:** No timers on questions, no "you died", only encouraging feedback
- **Teacher & Parent Dashboard:** Catch-up plans, progress reports for school re-enrollment
- **Class Flock:** Hospitalized child stays connected to their class; classmates can send virtual cheers
- **Recovery Warrior narrative:** The game's story mirrors the healing journey
- **Accessibility:** Dyslexia font, high contrast, audio narration, voice input, large buttons
- **Privacy-first:** COPPA/GDPR-K compliant, no ads, no real names in community features
- **Open-source stack (Godot 4):** Zero engine licensing cost — critical for non-profit operation

---

## Who This Is For

- Children ages 5–18 in cancer treatment, post-transplant recovery, or managing chronic illness
- Hospital child life programs looking for screen time with educational value
- Teachers needing to support homebound students
- Parents navigating long treatment periods for their child

---

## License

All rights reserved. Intended for non-profit use in partnership with pediatric medical institutions.
The original game concept belongs to the kid who wrote it.

---

*Built with care. For every child who is fighting something hard and still wants to learn.*
