# Launch Sequence implementation

Build a static, dependency-light browser game using Vite and JavaScript. Keep rules and persistence separate from rendering; use original inline SVG artwork and centralized English / Traditional Chinese dictionaries. No backend, remote runtime assets, accounts, or telemetry.

1. Vertical slice: commander setup, timed viewing, recall, retry/help, launch, responsive bilingual controls.
2. Complete seven missions, independent scoring, fresh practice transitions, persistence, free practice, settings, certificate.
3. Validate deterministic rules with Node tests and play through in Chromium at phone and desktop sizes. Capture screenshots, build static output, deploy to GitHub Pages and verify the live site when access permits.

Risks: background timers and stale transitions; assisted scoring; storage corruption; narrow Chinese layouts; Pages permissions and network availability. Actual child usability requires a separate caregiver-consented study. Browser speech is optional; no critical instructions depend on it.
