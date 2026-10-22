# Codex implementation brief — Launch Sequence v1.0

Build and deliver the game specified in `GDD.md`. Treat it as the product contract and acceptance baseline. This is a **new original children's educational game**, not a military simulator.

## Working agreement
You own engineering decisions, implementation, tests, and deploy preparation. The human owner owns product identity and final experiential approval. Avoid asking about minor reversible choices. Escalate only for material scope, safety/privacy, cost, or core mechanic changes. No paid APIs, external accounts, analytics, or user-data collection.

## Immediate sequence
1. Inspect repository and existing project conventions. If starting from an empty repo, choose a simple static web architecture.
2. Create `docs/IMPLEMENTATION-PLAN.md` with concise stages and known risks.
3. Build **a playable vertical slice** (onboarding → 3-letter commander code → 3-digit memorization → conceal → authorization → wrong/retry/help → launch) with bilingual toggle and touch support. Use a visually coherent original BEEP and rocket; do not treat placeholder circles/text as a final art direction.
4. Verify slice via automated tests and real browser screenshots at mobile and desktop widths in both locales. Record any blocked test honestly.
5. Complete all seven missions, BEEP practice and strategy hints, scoring distinctions, persistence, free practice, completion certificate, audio/reduced motion, and polish.
6. Run full test matrix and publish a release report including deployment evidence and unverified items. Push coherent commits to the working branch and follow repository release process. Deploy only where access/authorization permits; never claim success without evidence.

## High-risk implementation details
- Treat codes as **strings**, preserve leading zeroes. Numeric challenge is `n` digits, n=3..9; letters are not part of digit-span scoring.
- Define clear states (`intro`, `setup`, `briefing`, `viewing`, `recall`, `feedback`, `celebration`, `complete`, `practice`) and transitions. Avoid stale timers and duplicate launch triggers.
- Pause timer on hidden document; reset safely on refresh mid-attempt.
- Independent best counts only **first submission of an unrevealed, unassisted sequence**. Help, redisplay, or subsequent attempts cannot earn that designation. After assisted practice, offer a **fresh ungrouped** independent attempt.
- No time pressure on input. Wrong answer never reveals code by default. User can retry, request help, or generate a fresh code at the same difficulty.
- BEEP Help teaches chunking/rehearsal rather than supplying the answer; show chunked code only in practice and mark it assisted.
- No assumption that TTS exists or speaks zh-TW well; visible instructions always sufficient.
- All visible strings in central `en`/`zh-TW` dictionaries. Language switch mid-game without state loss.
- Honor reduced motion; skippable animation; large touch targets and accessible keyboard focus.

## Required test scenarios
- `000`, `0045`, and nine-digit codes with leading zeroes; wrong lengths and non-digits.
- Commander input normalization/validation (`sky`, `SKY`, `A1B`, Unicode characters, empty).
- Timer pause/resume and refresh recovery; no unintended reveal.
- First attempt success vs second attempt success; practice/help use; fresh independent retry after practice.
- Repeated taps on Authorize and Skip; only one transition and reward.
- Persist language/sound/progress, reset, and malformed local storage.
- EN/zh-TW on all screens, narrow mobile portrait, desktop, keyboard and touch.
- Full seven-launch flow and completion certificate; free practice at 3 and 12 digits.

## Reporting format
At each meaningful milestone report: implemented/playable, tests run and their outcomes, screenshots or browser evidence, deviations, unverified risks, next steps. Keep docs concise and code/test artifacts inspectable. Do not substitute file hash matching for actual live gameplay verification.

## Scope control
Do not expand into accounts, multiplayer, AI tutoring, rocket-building, adaptive diagnostics, or real launch protocols. Prefer simple reliable authored art and animation. Use one canonical BEEP design across expressions. Preserve the educational design intent even if implementation details change.

**Completion objective:** a genuinely fun, finished, independently understandable children's memory game—not just a digit-input demo.
