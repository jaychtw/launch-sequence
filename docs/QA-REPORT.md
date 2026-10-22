# Release candidate verification

Validated on 2026-10-22 with Node.js 24.19.0, npm 11.9.0, and Linux Chromium 154.0.8037.57.

## Results

| Check | Result |
| --- | --- |
| Dependency installation with generated npm lockfile | Passed |
| `npm test` | 16 passed; 0 failed, skipped, or disabled |
| `npm run test:browser` | 14 passed; 0 failed, skipped, or disabled |
| `npm run build` | Passed; relative assets suitable for a Pages project path |
| Browser console errors during full seven-mission campaign | None |
| Screenshots | 19 captured under `docs/screenshots/` |

The browser suite plays all seven missions and reaches the certificate in English on desktop and Traditional Chinese at 390px. It also exercises leading zeros, invalid commander names, keyboard and on-screen keypad, wrong answers and same-code retry, assisted clears, fresh independent attempts, free practice at 3 and 12 digits, mid-attempt language changes, storage corruption/unavailability, replay/reset, timer concealment, a simulated document visibility event, modal timer pause, refresh recovery, sound/time preferences, launch animation, and repeated authorization/skip.

An initial settings test selected the header sound button behind an open modal. The test was corrected to target the dialog's labeled switch; the full suite then passed. This was a test selector issue, not an application workaround.

## Visual review

Reviewed original SVG artwork, English desktop home, Traditional Chinese phone home and recall, and the Traditional Chinese certificate. Screenshot coverage includes home, help, recall, and success at 1440px and 390px in both languages, plus completion and retry. Reduced motion is enabled for deterministic screenshots; the normal animation has its own browser test.

## Limitations

- No caregiver-consented child usability study. Comprehension, emotional tone, and enjoyment are design goals, not established outcomes.
- Browser validation uses Chromium on Linux with emulated viewport sizes. Physical phones, Safari/Firefox, actual screen readers, touch ergonomics, and physical-device audio have not been validated.
- Background pause is covered by deterministic clock tests and a browser visibility-event simulation, not a physical-device background/resume study.
- No speech narration is implemented; all instructions are visible in both languages and sound effects are optional.
- No educational efficacy or clinical claims are made. Independent best is only a game milestone.

## Deployment

The repository includes a GitHub Actions workflow that tests, builds, and deploys `main` to GitHub Pages. Public deployment and live-browser verification are recorded separately when completed; local build success alone is not deployment evidence.
