# LAUNCH SEQUENCE — Game Design Document

**Version:** 1.0 design baseline | **Status:** Approved direction, implementation-ready | **Genre:** Educational / memory / light adventure | **Audience:** Primarily ages 7–12; ages 5–6 with help | **Platforms:** Mobile-first web, desktop web | **Languages:** English and Traditional Chinese (`en`, `zh-TW`)

## 1. Product vision
A colorful, playful, child-friendly space-exploration game in which the player is Mission Commander at the fictional **Little Star Space Agency**. Seven launches send scientific probes toward progressively more distant solar-system destinations. To authorize each launch, the child remembers an increasingly long numerical code. A cheerful robot companion, **BEEP**, explains, encourages, and teaches optional memory strategies. The rocket launch is the immediate reward; increasing independent capability is the educational goal.

**Design thesis:** Education is the category; empowerment is the mission; digit-span practice is the mechanism; space exploration is the experience.

### Player promise
- I understand what to do without needing to read a long manual.
- My first launch succeeds quickly enough to feel exciting.
- Harder sequences feel like a challenge, never a punishment.
- If I struggle, BEEP teaches a useful approach rather than doing the task for me.
- I can tell the difference between my independent achievement and assisted practice.

### Non-goals
No weapons, military realism, actual launch procedures, combat, accounts, advertising, multiplayer, paid content, online leaderboard, analytics/telemetry, standardized clinical assessment, or claims of broad cognitive transfer. No generative AI runtime dependency. No server necessary.

## 2. Target players and accessibility
**Primary:** children ages 7–12 able to identify digits 0–9, read simple instructions or follow audio/visual cues, and tap or type short sequences. **Secondary:** ages 5–6 with a caregiver; older players may also enjoy practice. Age ranges are design hypotheses, not proof of usability.

Requirements: independent first-play onboarding; short text; no long reading blocks; large touch targets (aim ≥44 CSS px); high contrast and non-color-only cues; responsive portrait and landscape; no mandatory audio; avoid flicker, intense camera shake, and unskippable animation; reduced-motion preference support; no timed entry phase; no shame, failure sound blasts, or negative labels. A child may exit and return without losing the selected language or sound setting.

**Player validation gate:** test the first launch with actual first-time children with appropriate caregiver consent; observe comprehension, touch accuracy, fatigue, willingness to request help, and whether the child can describe the task. Do not assert these outcomes based only on developer playtesting.

## 3. Fiction and tone
The Little Star Space Agency is deploying seven different scientific probes. The Commander is the player; BEEP is a junior mission-control assistant. Destinations are whimsical mission themes, not a claim that each probe can reach its destination instantly. After launch, use a playful mission-card vignette (e.g., stylized probe near destination), not a real-time travel simulation.

Tone: curious, warm, lightly funny, energetic, respectful. Avoid talking down to children. Use clear words and avoid lengthy speeches. BEEP is a companion, not an omniscient tutor or a substitute for human relationships.

## 4. Core loop and states
**Welcome/story → Commander code setup → mission briefing → memorize digits → conceal digits → enter authorization → evaluate → launch celebration or retry/help → next mission → completion certificate → replay/free practice.**

### 4.1 Welcome and onboarding
A brief illustrated opening (roughly 2–3 short dialogue panels, skippable) explains that scientific probes need authorization codes. BEEP demonstrates one example of watching digits disappear and typing them. Provide **Play** and **How to Play**. Use interactive demonstration rather than a wall of instructions. Remember whether the introduction was seen; make it replayable.

### 4.2 Commander code
Player chooses **exactly three English letters A–Z** (e.g., SKY). Normalize lowercase to uppercase, reject digits/spaces/non-ASCII letters, and show a simple inline validation message. This is a playful fictional identifier, **not** a real secret, password, or security control. Store locally only for convenience; allow changing it from settings/start screen. Never request personal information. Display the three letters openly during authorization; **do not score them as part of digit span**.

### 4.3 Seven-mission campaign
| Mission | Theme | Digits | Initial display duration* |
|---|---|---:|---:|
| 1 | Earth Orbit — Training Flight | 3 | 5 s |
| 2 | The Moon | 4 | 6 s |
| 3 | Mars | 5 | 7 s |
| 4 | Asteroid Belt | 6 | 8 s |
| 5 | Jupiter | 7 | 9 s |
| 6 | Saturn | 8 | 10 s |
| 7 | Neptune — Grand Finale | 9 | 11 s |

*Durations are initial game-design defaults to validate, not normative digit-span test conditions. Provide an optional **Ready** button to advance sooner during viewing; never shorten the initial duration below the selected accessibility preference without explicit user action. No penalty for taking time during entry. Each mission uses a newly generated code.

### 4.4 Numeric code generation and viewing
Generate exactly `n` random decimal digits, including 0. Display as one readable string, no automatic chunk separators during **independent** challenge. Generate with platform randomness appropriate to non-security gameplay; avoid accidental reuse of the immediately preceding sequence when practical. Never imply cryptographic security. Show a visible countdown/progress indicator and allow **Show again** only after an attempt (counts as assisted/practice) or via an explicit **Practice** action that changes the attempt's classification. Pause countdown on document hidden/background and resume safely. The code must be completely concealed during recall and not available through ordinary visible UI, labels, hints, or screen-reader live announcements after concealment. Recognize that screen recordings or developer tools cannot be prevented; this is a game, not a secure assessment.

### 4.5 Authorization input
Two clearly labeled steps: (1) visible commander letters (can be prefilled/read-only once chosen, but player must affirm authorization through an explicit action), (2) enter remembered numerical digits. For the intended ritual, show a unified display `SKY · [digit input]` and require **Authorize**; this avoids repetitively typing non-memory letters while preserving the two-factor *fiction*. If implementation chooses manual letter entry for playfulness, keep it unscored, accessible, and optional after the first mission. Numeric input accepts exactly `n` digits and preserves leading zeros; use text/string rather than numeric types. Provide a large on-screen keypad (0–9, backspace, clear) plus native keyboard input. Disable accidental duplicate submits. No timer while recalling or entering.

### 4.6 Success and failure
Correct first unassisted entry: record independent clear, update independent best digit length, celebrate and unlock next mission. Wrong entry: friendly neutral feedback, retain the mission, offer **Try again** (same hidden code), **Practice with BEEP** (new or revealed practice code), and **New code** (same digit length, classified as new attempt). Wrong guesses should never reveal the answer automatically. Limit frustration by offering help after the first error and surfacing it more prominently after repeated errors; do not force help. A correct later attempt still completes the mission, but first-try independent performance is tracked separately. A practice-assisted clear can advance the campaign; independent best must never be inflated by assistance.

**Attempt classification:** An independent first attempt is eligible for independent best only if no code redisplay, grouping, reveal, or other memory hint was used before that first submission. Retrying the same sequence after a wrong guess is not first-attempt independent. Track per-mission `attempts`, `helpUsed`, `firstAttemptCorrect`, and `completed`. Do not expose competitive failure rankings.

### 4.7 Launch celebration
After success: BEEP cheers, a clear countdown (3–2–1), a colorful rocket lifts off with smoke/stars, a probe destination card appears, and the player sees **Next Mission**. Total animation target ~5–8 s, skippable from its start or after a very brief initial beat. Respect reduced-motion (static transition). Sound optional, default sensible for device, persisted; no autoplay-dependent critical instruction. Animation must never be required to progress and must not block the app on slow devices.

### 4.8 Completion
After seven missions show a star map with seven probes, a **Mission Commander Certificate** (display name defaults to `Commander`; do not solicit real names), best independent span, missions completed, and encouraging closing text. Offer **Play Again** and **Free Practice**. Progress should be resumable on the same device, with a clear reset confirmation. A new campaign may preserve lifetime personal best unless the user deliberately resets all progress.

## 5. BEEP — companion and pedagogical guide
**Identity:** small, rounded, friendly robot with expressive digital eyes, teal/yellow palette, compact silhouette, minimal face changes (idle, explaining, thinking, cheering, reassuring). One canonical sprite/design sheet, not independently inconsistent generations. Short lines, optional voice, readable speech bubble. Do not use manipulative attachment, guilt, shame, or endless interruptions.

### Trigger matrix
| Trigger | BEEP action | Rule |
|---|---|---|
| First entry | Welcome + one-sentence mission purpose | Skippable |
| Commander setup | Explain three-letter code | Once, replayable |
| First viewing | Explain watch-then-recall | One-time demo |
| Correct first try | Celebrate genuine achievement | Brief |
| Wrong guess | Neutral feedback, offer retry | Never reveal answer |
| Help requested | Offer one strategy at a time | Explicit opt-in |
| Multiple errors | Gently resurface Help option | No nagging |
| New personal best | Celebrate the specific milestone | Accurate only |
| Campaign complete | Congratulate effort and progress | No false cognitive claims |

### Help / guided practice
1. **Chunking:** visually group a fresh practice sequence into small groups, e.g. `583 · 204 · 917`; explain that remembering groups may feel easier. Grouping is available **only in assisted practice**, not the independent trial.
2. **Rehearsal:** encourage quietly repeating the digits while they are visible; optionally replay a fresh practice sequence. Do not imply this works for everyone.
3. **Try independently:** after practice, offer a **fresh, ungrouped code of the same length** for an independent attempt. Do not count a previously revealed or rehearsed code as unassisted.

Help is never a penalty and should not be hidden behind repeated failure. Provide a visible Help button throughout. Avoid claiming clinical or general intelligence benefits. A practice completion and an independent first-try completion are both celebrated, but labeled distinctly.

## 6. Difficulty, scoring, and replay
Campaign increases digit count from 3 to 9 by one per mission. Do not add a simultaneous typing-speed requirement. No lives, failure screen, or hard game over. Campaign completion is achievable with practice assistance. Independent best is the **largest number of digits correctly recalled on the first unassisted submission**; this is a game metric, not a standardized clinical test. Also show longest assisted practice completion separately, if tracked.

**Free Practice:** available after campaign completion, or via an unobtrusive menu for repeat players. Choose a digit length 3–12; no rocket ceremony required unless toggled on. Persist local best per length optionally. No infinite difficulty promise beyond 12 in v1.0. Free Practice should reuse the same core engine and BEEP help logic.

## 7. Visual and audio direction
Polished 2D illustrated children's game: rounded UI, vibrant blues/teals/oranges/yellows, friendly rockets and probes, readable bold numerals, a whimsical control room, seven illustrated destination cards. Keep all assets original or appropriately licensed. Prioritize recognizable BEEP and satisfying liftoff over expensive cinematic animation. Use lightweight sprite layers/CSS/canvas as appropriate; no engine migration required without reason.

Optional sound: short BEEP chirps, launch countdown, gentle rocket whoosh, success cue. Sound off must not remove necessary information. Speech narration may use browser TTS as progressive enhancement with graceful fallback to visible localized text; TTS voice availability and consistency must not be assumed. No remote voice subscription required.

## 8. Localization
All interface strings, mission titles, tutorials, BEEP lines, errors, Help content, settings, certificate, and accessibility labels must be localized in **English and Traditional Chinese**. Live language toggle without restart; preserve current game state; persist selection. Centralized string dictionaries, no scattered hard-coded visible strings. Three-letter commander code remains Latin uppercase in both locales. Digit display uses Western numerals 0–9 in both. Prefer culturally natural phrasing, not mechanical literal translations. Verify text fits small screens.

## 9. Input, accessibility, persistence, and privacy
- Responsive on common phone viewports; portrait is first-class; desktop keyboard supported.
- Use semantic buttons, explicit labels, focus management, keyboard navigation, visible focus, accessible error feedback, and reduced-motion support.
- Prevent accidental zoom/scroll on game keypad without breaking normal accessibility zoom.
- Pause viewing timer when tab is hidden; support interrupted sessions gracefully. On reload during a hidden-code attempt, restart that mission's viewing phase rather than accidentally marking an independent result.
- Store language, audio preference, intro-seen flag, commander letters, campaign progress, and personal best in local storage with schema versioning and safe fallback. No PII, analytics, third-party trackers, login, cloud sync, or external data transfer.
- Never represent the three-letter code as a real password or actual launch authorization.

## 10. Technical feasibility and constraints
**Established feasibility:** browser UI, timers, random code generation, numeric input, localization, local persistence, simple sprite animation, and rule-based companion dialogue are conventional web capabilities. These are architectural judgments, not proof of finished implementation.

**Needs validation:** first-time comprehension by 7-year-olds; memory display timing; mobile keypad ergonomics; browser TTS availability; visual consistency of BEEP poses; animation smoothness on ordinary phones; emotional tone of retry messaging; whether nine digits is enjoyable rather than discouraging. Record evidence separately.

**Engineering discretion:** JavaScript or TypeScript; Vite or equivalent; DOM/CSS/canvas or lightweight rendering library; asset organization; deterministic state-machine implementation; automated testing framework. Prefer minimal dependencies, static deployment, and reusable modules for generator, mission state, scoring, BEEP trigger logic, and localization.

**Escalate to product owner only for:** core mechanic changes; removing bilingual/mobile/BEEP/help; paid services; major content scope; user-data collection; external accounts; meaningful shifts in target audience or educational promise. Minor reversible details are delegated.

## 11. Acceptance criteria / test matrix
**Functional**
- Three-letter code accepts only ASCII A–Z and remains editable; no real-secret claim.
- Each campaign mission uses 3,4,5,6,7,8,9 digits respectively; leading zeros preserved.
- Code concealed before input; no entry timer; backgrounding pauses viewing countdown.
- Correct input launches exactly once and unlocks next; incorrect input never launches.
- Retries, fresh-code attempts, help, and assisted vs independent scoring are correct and tested with deterministic fixtures.
- Help grouping never inflates independent first-attempt best.
- Full seven-mission completion and replay; progress restoration/reset work.
- English/Traditional Chinese switch mid-mission; all visible strings localized.
- Keyboard and touch keypad work; no missing focus/accessibility labels.
- Reduced motion and muted audio work; launch animation skippable.

**Experiential / visual**
- BEEP stays visually consistent across expressions and states.
- First-time child can understand first launch with minimal adult help (requires actual observation).
- Retry feels supportive, not punitive; Help feels empowering rather than cheating.
- Text/controls remain usable on small phone viewport in both languages.
- At least one actual live-browser playthrough (or explicitly record limitation); screenshots at phone/desktop, both locales, onboarding, help, success, failure, completion.

**Release evidence:** automated test logs, build output, browser screenshots, known limitations, static deployment verification, and clear distinction between deployment file integrity and live end-to-end browser validation.

## 12. Implementation stages and release gates
**A. Vertical slice:** title/onboarding, BEEP prototype, three-letter setup, 3-digit warmup, hide/recall, retry/help, single rocket launch; EN/zh-TW, touch and keyboard. Verify playable experience, not just code.

**B. Campaign:** seven missions, increasing spans, destinations, scoring classification, progress persistence, finish screen, skip/reduced-motion.

**C. Learning layer:** polished BEEP expression states, contextual help, chunking/rehearsal practice, fresh independent retry, accessibility and localization QA.

**D. Release:** visual polish, automated and browser testing, performance review, deploy, release report. Continue autonomously between stages; don't require approval for routine choices. Stop only on material escalation conditions.

## 13. Out of scope for v1.0
Adaptive AI tutor, speech recognition, accounts, multiplayer, real spaceflight telemetry, scientific simulations, rocket construction, additional solar systems, purchasable content, advanced analytics, psychological profiling, educational efficacy claims, and elaborate narrative branching.

## 14. Definition of done
A child can choose a commander code, understand BEEP's guidance, complete seven increasingly difficult digit-recall missions (independently or with optional practice), enjoy seven distinct launches, see meaningful completion and independent best, and replay on phone or desktop in English or Traditional Chinese. Functional tests and real browser evidence exist, with limitations disclosed. No mandatory online service or paid dependency.
