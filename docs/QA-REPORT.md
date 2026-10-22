# Release candidate verification

Validated on 2026-10-22 with Node.js 24.19.0, npm 11.9.0, and Linux Chromium 154.0.8037.57.

## Results

| Check | Result |
| --- | --- |
| Dependency installation with generated npm lockfile | Passed |
| `npm test` | 16 passed; 0 failed, skipped, or disabled |
| `npm run test:browser` | 14 passed; 0 failed, skipped, or disabled |
| `npm run build` | Passed; relative assets suitable for a Pages project path |
| Frozen `npm ci` installation and rebuilt output | Passed |
| All 14 browser tests against the production preview | Passed; log in `docs/qa/production-browser.txt` |
| Browser console errors during full seven-mission campaign | None |
| Screenshots | 19 captured under `docs/screenshots/` |
| Public GitHub Pages deployment | Passed; workflow run 39766752847, attempt 2 |
| Live browser playthroughs | Passed; English desktop and Traditional Chinese phone viewport |
| Deployed HTML / CSS / JavaScript integrity | All three match the validated local build |
| Live screenshots | Four additional captures under `docs/screenshots/live-*.png` |

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

The game is live at **https://jaychtw.github.io/launch-sequence/**.

After the repository owner enabled Pages with GitHub Actions as the source, the failed deployment in [run 39766752847](https://github.com/jaychtw/launch-sequence/actions/runs/39766752847) was rerun successfully. This deployed source commit `21c82d532146c4cf7a12fe46ef8c63b8d15c1ff1`. All validation steps and the deployment job succeeded. Documentation-only evidence commits do not change the deployed application.

Public-site Chromium verification completed at 2026-10-22 11:23 UTC (19:23 Asia/Taipei). The live HTML, CSS, and JavaScript all returned HTTP 200 and matched the validated build's SHA-256 digests. Browser interactions on the public HTTPS URL completed all seven missions, reached the certificate, restored progress after reload, and completed 12-digit free practice in English at 1440×1000 and Traditional Chinese at 390×844. The English run also verified a wrong answer followed by a same-code retry. Both runs had zero runtime/console errors, zero failed requests, and no horizontal page overflow.

Evidence is in `docs/qa/live-verification.json` and `docs/screenshots/live-*.png`. From the repository root, repeat the check with:

```sh
node docs/qa/verify-live.mjs https://jaychtw.github.io/launch-sequence/
```

The browser uses the environment's supported HTTPS proxy when present. Chromium needed the environment-supplied proxy CA added to its NSS trust store; TLS verification remained enabled. The sandbox exposed an older trust-store copy, so the successful live check used the updated host store. No certificate or hostname verification was disabled.

Future application pushes to `main` test, build, and deploy automatically. Documentation-only changes are excluded from automatic deployment. Cloud development environment publication remains separate from this completed public-site deployment.
