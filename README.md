# Launch Sequence

A bilingual, mobile-first space memory adventure for little explorers. Become a commander, remember launch codes, and send seven scientific probes from Earth orbit to Neptune with BEEP.

English / Traditional Chinese · keyboard / touch · optional sound · reduced motion · local progress · no accounts, advertising, telemetry, or backend.

## Develop

Use Node.js 22 or newer (CI uses Node 24).

```sh
npm ci
npm run dev
```

## Validate and build

```sh
npm test
# Cloud workspace: /usr/bin/chromium is already available.
npm run test:browser
npm run build
npm run preview
```

On another machine, install a Playwright browser with `npx playwright install chromium`, and set `CHROMIUM_PATH` to its executable path, or use `CI=1 npm run test:browser` to use Playwright's installed browser. Screenshots are in `docs/screenshots/`; the interactive test report is generated in `playwright-report/`.

The build creates `dist/` using relative asset paths, so it works under a project subdirectory. The included GitHub Actions workflow tests and deploys `main` to GitHub Pages. Enable Pages with **GitHub Actions** as its build source in repository settings. Pull requests run validation without deploying.

## Game rules

Campaign codes grow from 3 to 9 digits. Leading zeros matter. There is no entry timer. Wrong guesses retain the hidden code; practice uses a fresh sequence. Only a first correct, unassisted submission of a fresh sequence can increase the independent best. Assisted clears can advance the campaign. Free practice offers 3–12 digits and never advances campaign progress.

Progress is stored only in this browser with a versioned schema. Reloading an unfinished attempt returns to mission preparation; the hidden sequence is never saved. Reset requires confirmation. Changing language preserves the current attempt. Sound and extra viewing time are optional; reduced motion follows the device setting.

All artwork is original inline SVG. There are no runtime network dependencies. The handoff specifications are retained in `docs/GDD.md` and `docs/CODEX_BRIEF.md`. See `docs/QA-REPORT.md` for release evidence and limitations. Real child usability and physical-device testing require separate observation; automated tests do not establish those outcomes.
