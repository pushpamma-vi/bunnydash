# Bunny Dash — Technical Architecture

## Stack Recommendation

### Game Engine
**Godot 4 (GDScript / C#)**
- Free and open-source — critical for a non-profit cause
- Native Android, iOS, Web (HTML5), Windows, macOS, Linux exports from one codebase
- Lightweight enough to run well on budget tablets in hospitals
- Strong 2D platformer support built-in
- Active community, no proprietary licensing costs

Alternative if budget exists: **Unity (IL2CPP)** — more third-party tools, wider platform support (Switch), but licensing cost.

---

## Application Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    CLIENT (Game)                            │
│                                                            │
│  ┌─────────────┐   ┌──────────────┐   ┌────────────────┐  │
│  │  Godot Game │   │ Learning UI  │   │  Offline Store │  │
│  │  Engine     │   │  (Quiz, HUD) │   │  (SQLite local)│  │
│  └──────┬──────┘   └──────┬───────┘   └───────┬────────┘  │
│         └─────────────────┴──────────────┬─────┘           │
│                                 ┌─────────┴──────────┐     │
│                                 │  Sync Manager      │     │
│                                 │  (queue, conflict  │     │
│                                 │   resolution)      │     │
│                                 └─────────┬──────────┘     │
└───────────────────────────────────────────┼────────────────┘
                                            │ HTTPS / WebSocket
                                            │ (when online)
┌───────────────────────────────────────────┼────────────────┐
│                   BACKEND                 │                 │
│                                           ▼                 │
│  ┌────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Auth      │  │  Progress   │  │  Curriculum Content  │  │
│  │  Service   │  │  API        │  │  CDN (JSON packs)    │  │
│  └────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                            │
│  ┌────────────────────┐  ┌──────────────────────────────┐  │
│  │  Dashboard API     │  │  Community / Moderation      │  │
│  │  (parent/teacher)  │  │  Service                     │  │
│  └────────────────────┘  └──────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              PostgreSQL  (primary DB)               │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

---

## Data Models (Core)

### Player Profile
```json
{
  "player_id": "uuid",
  "display_name": "BunnyName",
  "grade_level": 3,
  "created_at": "ISO8601",
  "parent_account_id": "uuid",
  "characters_unlocked": ["fluff", "baby"],
  "active_character": "fluff",
  "current_level": 22,
  "star_coins": 140,
  "energy_mode_history": [],
  "settings": {
    "font": "opendyslexic",
    "text_size": "large",
    "high_contrast": false,
    "reduce_motion": false,
    "audio_narration": true,
    "bed_mode": false
  }
}
```

### Progress Record
```json
{
  "record_id": "uuid",
  "player_id": "uuid",
  "session_date": "ISO8601",
  "levels_completed": [21, 22],
  "quizzes": [
    {
      "question_id": "math_g3_mul_021",
      "subject": "math",
      "standard": "CCSS.MATH.3.OA.C.7",
      "question_text": "6 × 7",
      "correct_answer": "42",
      "player_answer": "42",
      "correct": true,
      "attempts": 1,
      "time_to_answer_ms": 8400
    }
  ],
  "energy_mode": 3,
  "session_duration_s": 720,
  "stars_earned": 34
}
```

### Curriculum Question
```json
{
  "question_id": "math_g3_mul_021",
  "subject": "math",
  "grade_min": 3,
  "grade_max": 4,
  "standard": "CCSS.MATH.3.OA.C.7",
  "type": "numeric_input",
  "question_template": "{a} × {b}",
  "variables": { "a": [6], "b": [7] },
  "answer": "42",
  "hint": "Think: 6 groups of 7. 7 + 7 + 7 + 7 + 7 + 7 = ?",
  "difficulty": 2,
  "tags": ["multiplication", "times-tables", "single-digit"]
}
```

---

## Offline Architecture

### Local Storage (SQLite via Godot's built-in)
- `player_profile` table
- `progress_events` table (append-only event log)
- `question_seen_bloom` table (bloom filter for no-repeat)
- `curriculum_questions` table (downloaded per grade)
- `sync_queue` table (events pending upload)

### Sync Strategy
1. On connectivity restored: flush `sync_queue` to backend in batches of 50 events
2. Conflict resolution: `last-write-wins` on non-critical fields; `union-merge` on progress (never lose a completed level)
3. Curriculum updates: versioned JSON packs; client checks version hash on connection; downloads diff if changed

---

## No-Repeat Question System

```python
# Conceptual implementation (Godot GDScript equivalent)

class QuestionEngine:
    # Bloom filter to track shown question IDs
    shown_questions: BloomFilter
    
    # Per-session seen set (exact)
    session_seen: Set[str]
    
    # Correct-answer count per question (retire at 3)
    correct_count: Dict[str, int]
    
    def get_next_question(self, subject, grade, difficulty) -> Question:
        pool = curriculum_db.query(
            subject=subject,
            grade=grade,
            difficulty=difficulty
        )
        
        candidates = [
            q for q in pool
            if q.id not in self.session_seen          # Not seen this session
            and not self.shown_questions.check(q.id)  # Not seen bloom
            and self.correct_count.get(q.id, 0) < 3  # Not retired
        ]
        
        if not candidates:
            # Expand pool: widen grade range ±1
            candidates = self._expand_pool(subject, grade, difficulty)
        
        chosen = random.choice(candidates)
        self.session_seen.add(chosen.id)
        self.shown_questions.add(chosen.id)
        return chosen
    
    def record_answer(self, question_id, correct: bool):
        if correct:
            self.correct_count[question_id] = \
                self.correct_count.get(question_id, 0) + 1
```

---

## Security Considerations

### Authentication
- Under-13 accounts: Parent creates account; child has a PIN-based local login (no password-remembering)
- Parent accounts: Email + bcrypt-hashed password + MFA option
- Teacher accounts: Institutional email domain verification + admin approval
- Session tokens: short-lived JWT (1 hour) + refresh token (30 days), rotated on each use

### Data Protection
- All data in transit: TLS 1.3 minimum
- Passwords: bcrypt (cost factor 12)
- PII fields at rest: AES-256 encrypted in database
- Player IDs in curriculum/community systems: UUID only, no real names exposed
- COPPA compliance: no behavioral tracking, no ad networks, parental consent flow on signup

### API Security
- All API endpoints require authentication (no anonymous endpoints except health check)
- Rate limiting: 100 req/min per player, 1000 req/min per teacher dashboard
- Input validation: all quiz answers and settings validated server-side (not trust-client)
- Content moderation API for all community messages before delivery

---

## Parent/Teacher Dashboard

### Technology
- **Web app** (React + TypeScript) — accessible from any browser, no install
- Responsive design: works on phone, tablet, laptop
- PDF export for learning reports (uses server-side rendering)

### Teacher Catch-Up Plan Feature
```
Teacher input:  "Class covered Chapter 3-5 of 3rd grade math 
                 (multiplication 2×1 digit, word problems)"
                 
System output:  Priority queue of questions for this player
                targeting those exact CCSS standards,
                inserted at next 10 Learning Checkpoints
```

---

## Deployment

### Recommended Infrastructure
- **Backend:** Docker containers on any cloud (AWS ECS / GCP Cloud Run / self-hosted)
- **Database:** PostgreSQL (managed service or self-hosted for hospital private cloud)
- **CDN:** Curriculum JSON packs and game assets on CDN (CloudFront / Cloudflare)
- **Hospital private deployment option:** Full stack containerized for on-premise hospital network (air-gapped mode), sync disabled, parent dashboard on local network

### Hospital Network Mode
For hospitals with strict network policies:
- Game server deployed on hospital internal network
- No external internet required after initial setup
- Medical IT team manages updates via signed update packages
- Patient data stays within hospital network boundary

---

*Architecture is designed to be buildable by a small team (3–5 developers) and deployable at low cost for non-profit operation. Godot's open-source nature means zero engine licensing fees. Operational costs scale with player count only.*
