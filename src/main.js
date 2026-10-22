import "./style.css";
import {
  MISSIONS,
  commanderCode,
  newAttempt,
  conceal,
  evaluate,
  retry,
  restore,
  defaults,
  recordClear,
  ViewingClock,
} from "./engine.js";
import { messages } from "./i18n.js";
import { beep, rocket, planet, heroScene, icon } from "./art.js";

const STORAGE = "little-star-launch-sequence-v1";
let storageOK = true;
let progress;
try {
  progress = restore(localStorage.getItem(STORAGE));
} catch {
  progress = defaults();
  storageOK = false;
}
const state = {
  screen: "home",
  attempt: null,
  free: false,
  length: 3,
  activeIndex: 0,
  input: "",
  modal: null,
  strategy: "group",
  independent: false,
  launched: false,
  error: "",
  commanderDraft: progress.commander,
  missionAttempts: 0,
  missionHelpUsed: false,
};
let clock = null;
let viewTimer = null;
let celebrationTimer = null;
let celebrationStart = 0;
let audio = null;
let returnFocus = null;
const root = document.querySelector("#app");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const t = (key, vars = {}) =>
  Object.entries(vars).reduce(
    (s, [k, v]) => s.replaceAll(`{${k}}`, String(v)),
    messages[progress.lang][key] ?? key,
  );
const button = (action, label, kind = "primary", extra = "") =>
  `<button type="button" class="btn ${kind}" data-action="${action}" ${extra}>${label}</button>`;
const mission = () => MISSIONS[Math.min(state.activeIndex, 6)];
const currentLength = () => (state.free ? state.length : mission().digits);
const escape = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

function persist() {
  try {
    localStorage.setItem(STORAGE, JSON.stringify(progress));
  } catch {
    storageOK = false;
  }
}

function chirp(kind = "tap") {
  if (!progress.sound) return;
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === "suspended") audio.resume().catch(() => {});
    const notes =
      kind === "win" ? [523, 659, 784, 1047] : [kind === "tap" ? 420 : 620];
    notes.forEach((frequency, i) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      const start = audio.currentTime + i * 0.13;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.055, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.23);
    });
  } catch {
    /* Audio is optional; visible feedback always remains. */
  }
}

function stopTimers() {
  clearInterval(viewTimer);
  viewTimer = null;
  clearInterval(celebrationTimer);
  celebrationTimer = null;
}

function route(screen) {
  stopTimers();
  clock = null;
  if (screen === "briefing" || screen === "free-menu") {
    state.missionAttempts = 0;
    state.missionHelpUsed = false;
  }
  state.screen = screen;
  state.modal = null;
  state.error = "";
  render(true);
}

function buddy(text, mood = "happy") {
  return `<aside class="buddy"><div class="buddy-portrait">${beep(mood)}</div><div><span class="eyebrow">${t("beepName")}</span><p>${text}</p></div></aside>`;
}

function header() {
  return `<header class="site-header"><button class="brand" data-action="home" aria-label="${t("home")}"><span class="brand-mark">${icon.star}</span><span>LAUNCH<span class="brand-second">SEQUENCE<span class="brand-dot">✦</span></span></span></button><div class="header-controls"><button class="language-button" data-action="language" aria-label="${progress.lang === "en" ? "切換為繁體中文" : "Switch to English"}"><span aria-hidden="true">◎</span> ${progress.lang === "en" ? "繁體中文" : "English"}</button><button class="icon-button" data-action="sound" aria-label="${t("soundButton")}" aria-pressed="${progress.sound}">${icon[progress.sound ? "sound" : "mute"]}</button><button class="icon-button" data-action="settings" aria-label="${t("settings")}">${icon.settings}</button></div></header>`;
}

function journey(compact = false) {
  return `<section class="journey ${compact ? "compact" : ""}" aria-label="${t("progressLabel")}"><div class="section-label"><span class="eyebrow">${t("missionMap")}</span><span>${t("missionStats", { n: progress.completed.length })}</span></div><ol class="planet-trail">${MISSIONS.map((m, i) => `<li class="${i < progress.completed.length ? "done" : i === progress.completed.length ? "current" : ""}"><div class="planet-node">${planet(m.key)}<span class="node-status">${i < progress.completed.length ? "✓" : String(i + 1).padStart(2, "0")}</span></div><span class="planet-name">${t(m.key)}</span><span class="planet-digits">${m.digits} ${t("digits")}</span><span class="sr-only">${t(i < progress.completed.length ? "complete" : i === progress.completed.length ? "current" : "locked")}</span></li>`).join("")}</ol></section>`;
}

function home() {
  return `<section class="hero"><div class="hero-copy"><div class="pill"><span class="status-dot"></span>${t("agency")}</div><h1 tabindex="-1">${t("title")}<br><em>${t("titleAccent")}</em></h1><p class="hero-description">${t("intro")}</p><div class="actions">${button("start", `${t(progress.completed.length || progress.commander ? "resume" : "start")}${icon.arrow}`)}${button("how", t("how"), "text")}</div><div class="hero-footnote"><span>✧</span> ${t("noRush")}</div></div>${heroScene()}</section><div class="home-buddy">${buddy(t("beepWelcome"))}<div class="mission-stamp"><span>07</span><div>${t("launches")}<br><strong>∞</strong> ${t("memory")}</div></div></div>${journey()}<section class="how-strip"><div><span class="eyebrow">${t("fieldNotes")}</span><h2>${t("step1")}. ${t("step2")}.</h2></div>${[1, 2, 3].map((i) => `<article><span class="step-number">0${i}</span><h3>${t(`step${i}`)}</h3><p>${t(`step${i}Text`)}</p></article>`).join("")}</section><div class="home-extra">${button("free-menu", t("free"), "text")}${progress.completed.length === 7 ? button("certificate", t("viewCertificate"), "text") : ""}</div>`;
}

function setup() {
  return `<section class="center-screen setup-screen"><span class="eyebrow">${t("agency")}</span><h1 tabindex="-1">${t("setupTitle")}</h1><p class="lead">${t("setupText")}</p><form id="commander-form" class="setup-card"><label for="commander">${t("commander")}</label><input id="commander" name="commander" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-describedby="commander-hint commander-error" value="${escape(state.commanderDraft)}" placeholder="SKY"><p id="commander-hint" class="muted">${t("callSignHint")}</p><p id="commander-error" role="alert" class="error">${state.error ? t("callSignError") : ""}</p><button class="btn primary" type="submit">${t("saveCommander")}${icon.arrow}</button></form>${buddy(t("beepWelcome"))}</section>`;
}

function briefing() {
  const m = mission();
  return `<section class="mission-screen"><div class="screen-top"><button class="back-button" data-action="home">← ${t("home")}</button><span class="eyebrow">${t("mission")} ${state.activeIndex + 1} ${t("of")} 7</span></div><div class="briefing-layout"><div class="briefing-planet">${planet(m.key)}<span class="orbital-line"></span><span class="planet-coordinate">LSSA / ${String(state.activeIndex + 1).padStart(2, "0")}</span></div><div class="briefing-copy"><span class="eyebrow">${t("briefingEyebrow")} · ${progress.commander}</span><h1 tabindex="-1">${t("briefingTitle")}<br><em>${t(m.key)}</em></h1><p class="lead">${t(m.key + "Desc")}</p><div class="flight-facts"><div><strong>${m.digits}</strong><span>${t("digits")}</span></div><div><strong>${m.seconds * (progress.extraTime ? 2 : 1)}</strong><span>${t("displayTime")}</span></div></div>${button("begin", `${t("begin")}${icon.arrow}`)}<p class="small muted">${t("unlimited")}</p></div></div>${buddy(t("briefBeep"))}${journey(true)}</section>`;
}

function challenge() {
  const a = state.attempt;
  const viewing = state.screen === "viewing";
  const feedback = state.screen === "feedback";
  const title = viewing
    ? "viewingTitle"
    : feedback
      ? "feedbackTitle"
      : "recallTitle";
  const label = a.assisted ? "practiceLabel" : "independentLabel";
  const code =
    a.assisted && state.strategy === "group"
      ? (a.code.match(/.{1,3}/g) || []).join(" · ")
      : a.code;
  return `<section class="challenge-screen"><div class="screen-top"><button class="back-button" data-action="${state.free ? "free-menu" : "briefing"}">← ${t("back")}</button><span class="eyebrow">${state.free ? t("free") : `${t("mission")} ${state.activeIndex + 1} / 7 · ${t(mission().key)}`}</span></div><div class="challenge-heading"><span class="pill ${a.assisted ? "practice-pill" : ""}">${t(label)}</span><h1 tabindex="-1">${t(title)}</h1><p class="lead">${t(viewing ? "viewingText" : feedback ? "feedbackText" : "recallText")}</p></div><div class="console ${feedback ? "feedback-console" : ""}"><div class="console-top"><span><span class="status-dot"></span> ${progress.commander}</span><span>${a.length} ${t("digits")}</span></div>${viewing ? `<div class="viewing-display"><div class="digit-code ${a.length > 8 ? "long-code" : ""} ${a.assisted && state.strategy === "group" ? "grouped" : ""}" data-testid="visible-code">${code}</div><div class="timer-track"><div id="timer-fill"></div></div><p class="timer-label"><span id="time-left"></span> ${t("timeLeft")}</p>${a.assisted ? `<p class="practice-tip">${t(state.strategy === "group" ? "chunkText" : "rehearsalText")}</p>` : ""}${button("ready", `${t("ready")} ✓`)}<p class="small muted">${t("paused")}</p></div>` : feedback ? `<div class="feedback-content"><div class="feedback-symbol" aria-hidden="true">↻</div><h2>${t("feedbackTitle")}</h2><div class="stack">${button("retry", t("retry"))}${button("help", t("help"), "secondary")}${button("fresh", t("newCode"), "text")}</div></div>` : `<form id="authorize-form"><label class="sr-only" for="recall-input">${t("codeLabel")}</label><div class="recall-row"><span class="commander-prefix">${progress.commander}<span>·</span></span><input id="recall-input" class="recall-input ${a.length > 8 ? "long-input" : ""}" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="${a.length}" autocomplete="off" spellcheck="false" aria-describedby="entry-hint" value="${state.input}" placeholder="${"·".repeat(a.length)}"></div><p id="entry-hint" class="entry-hint">${t("enterHint", { n: a.length })}</p><div class="keypad">${["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "backspace"].map((n) => `<button type="button" data-action="key" data-key="${n}" class="key ${n.length > 1 ? "key-special" : ""}" aria-label="${n.length > 1 ? t(n) : n}">${n === "clear" ? t("clear") : n === "backspace" ? "⌫" : n}</button>`).join("")}</div><button class="btn primary authorize-button" type="submit" ${state.input.length !== a.length ? "disabled" : ""}>${t("authorize")}${icon.arrow}</button></form>`}</div><div class="challenge-support">${buddy(t(viewing ? (a.assisted ? "assistedBeep" : "viewingBeep") : feedback ? "feedbackBeep" : "recallBeep"))}${!feedback ? button("help", t("help"), "text") : ""}${a.assisted ? button("fresh", t("freshIndependent"), "text") : ""}</div></section>`;
}

function celebration() {
  const m = mission();
  const done = state.launched;
  const distinction = state.independent
    ? "independentClear"
    : state.attempt.assisted
      ? "assistedClear"
      : "retryClear";
  return `<section class="success-screen ${done ? "landed" : ""}"><span class="eyebrow">${t(done ? "destination" : "agency")}</span><h1 tabindex="-1">${t("successTitle")}</h1><p class="lead">${t("successText")}</p><div class="launch-scene ${done ? "finished" : "animating"}">${planet(m.key, "success-planet")}<div class="launch-rocket">${rocket()}</div><div class="launch-pad"></div><div id="launch-countdown" class="launch-countdown" role="status" aria-label="${t("launchCountdown")}">${done ? "✦" : "3"}</div><span class="scene-star s1">✧</span><span class="scene-star s2">✦</span><span class="scene-star s3">+</span></div><div class="success-result" role="status"><span class="achievement">${icon.star} ${t(distinction)}</span><h2>${state.free ? `${state.length} ${t("digits")}` : t(m.key)}</h2></div>${done ? `<div class="actions centered">${button(state.free ? "free-again" : progress.completed.length === 7 ? "certificate" : "next", `${t(state.free ? "freeAgain" : progress.completed.length === 7 ? "viewCertificate" : "next")}${icon.arrow}`)}${state.free ? button("free-menu", t("freeBack"), "text") : ""}</div>${state.free ? button("home", t("practiceExit"), "text") : `<p class="small muted journey-note">${t("journeyNote")}</p>`}` : button("skip", t("skip"), "secondary")}${buddy(t("successBeep"), "cheer")}</section>`;
}

function certificate() {
  return `<section class="complete-screen"><span class="eyebrow">${t("campaignDone")}</span><h1 tabindex="-1">${t("completeTitle")}</h1><p class="lead">${t("completeText")}</p><div class="certificate"><div class="certificate-stars" aria-hidden="true">✧ ✦ ✧</div><span class="eyebrow">${t("agency")}</span><h2>${t("certificate")}</h2><p>${t("presented")}</p><strong class="certificate-name">${progress.commander || "Commander"}</strong><p class="certificate-copy">${t("certificateText")}</p><div class="certificate-planets">${MISSIONS.map((m) => planet(m.key)).join("")}</div><div class="stats"><div><strong>7 / 7</strong><span>${t("launches")}</span></div><div><strong>${progress.best || "—"}</strong><span>${t("best")} · ${t("digits")}</span></div></div><p class="small muted">${t("bestHint")}</p></div><div class="actions centered">${button("replay", t("again"))}${button("free-menu", t("free"), "secondary")}${button("print", t("print"), "text")}</div>${buddy(t("successBeep"), "cheer")}</section>`;
}

function freeMenu() {
  return `<section class="center-screen free-screen"><button class="back-button" data-action="home">← ${t("home")}</button><span class="eyebrow">${t("free")}</span><h1 tabindex="-1">${t("freeTitle")}</h1><p class="lead">${t("freeText")}</p><div class="free-card"><label for="practice-length">${t("length")}</label><div class="range-value"><strong id="length-value">${state.length}</strong><span>${t("digits")}</span></div><input id="practice-length" type="range" min="3" max="12" step="1" value="${state.length}"><div class="range-endpoints"><span>3</span><span>12</span></div>${button("start-free", `${t("startFree")}${icon.arrow}`)}<p class="small muted">${t("practiceNote")}</p><div class="stats"><div><strong>${progress.best || "—"}</strong><span>${t("best")}</span></div><div><strong>${progress.practiceBest || "—"}</strong><span>${t("assistedBest")}</span></div></div></div>${buddy(t("briefBeep"))}</section>`;
}

function dialogContents() {
  switch (state.modal) {
    case "how":
      return `<span class="eyebrow">${t("agency")}</span><h2>${t("how")}</h2>${[1, 2, 3].map((i) => `<div class="instruction"><span class="step-number">0${i}</span><div><h3>${t("step" + i)}</h3><p>${t("step" + i + "Text")}</p></div></div>`).join("")}<p>${t("helpNote")}</p>${button("demo", t("startFree"))}`;
    case "help":
      return `<div class="dialog-beep">${beep()}</div><h2>${t("helpTitle")}</h2><p>${t("helpText")}</p><div class="strategy"><h3>01 · ${t("chunking")}</h3><p>${t("chunkText")}</p>${button("group-practice", t("practiceStart"))}</div><div class="strategy"><h3>02 · ${t("rehearsal")}</h3><p>${t("rehearsalText")}</p>${button("rehearsal-practice", t("rehearseStart"), "secondary")}</div>${button("close-dialog", t("cancel"), "text")}`;
    case "settings":
      return `<span class="eyebrow">${t("agency")}</span><h2>${t("settings")}</h2><div class="setting-row"><div><h3>${t("sound")}</h3><p>${t("soundHint")}</p></div><button class="toggle ${progress.sound ? "is-on" : ""}" data-action="sound" role="switch" aria-checked="${progress.sound}" aria-label="${t("sound")}"><span></span></button></div><div class="setting-row"><div><h3>${t("extraTime")}</h3><p>${t("extraTimeHint")}</p></div><button class="toggle ${progress.extraTime ? "is-on" : ""}" data-action="extra-time" role="switch" aria-checked="${progress.extraTime}" aria-label="${t("extraTime")}"><span></span></button></div><p class="small muted">${t("reduced")}</p><div class="settings-actions">${button("change-commander", t("changeCommander"), "secondary")}${button("reset-dialog", t("reset"), "danger")}</div><p class="small muted">${t("localOnly")}</p>`;
    case "reset":
      return `<h2>${t("resetTitle")}</h2><p>${t("resetText")}</p><div class="stack">${button("confirm-reset", t("confirmReset"), "danger")}${button("close-dialog", t("cancel"), "secondary")}</div>`;
    default:
      return "";
  }
}

function openModal(name) {
  returnFocus = document.activeElement?.dataset.action;
  state.modal = name;
  if (clock) clock.pause(performance.now());
  render();
}

function closeModal() {
  state.modal = null;
  render();
  if (returnFocus)
    document.querySelector(`[data-action="${returnFocus}"]`)?.focus();
}

function render(focus = false) {
  document.documentElement.lang = progress.lang;
  const screens = {
    home,
    setup,
    briefing,
    viewing: challenge,
    recall: challenge,
    feedback: challenge,
    celebration,
    complete: certificate,
    "free-menu": freeMenu,
  };
  const scroll = window.scrollY;
  root.innerHTML = `${header()}<main id="main-content">${!storageOK ? `<p class="storage-warning" role="status">${t("storageWarning")}</p>` : ""}${screens[state.screen]()}</main><footer><span class="footer-brand">✦ ${t("agency")}</span><span>${t("footer")}</span><span class="footer-privacy">${t("localOnly")}</span></footer>${state.modal ? `<dialog aria-labelledby="dialog-title"><button class="dialog-close icon-button" data-action="close-dialog" aria-label="${t("close")}">×</button>${dialogContents()}</dialog>` : ""}`;
  if (state.modal) {
    const dialog = document.querySelector("dialog");
    dialog.querySelector("h2").id = "dialog-title";
    dialog.showModal();
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeModal();
    });
  } else if (focus) {
    document.querySelector("main h1")?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  } else window.scrollTo({ top: scroll, behavior: "instant" });
  if (state.screen === "viewing") runViewing();
  if (state.screen === "celebration" && !state.launched) runCelebration();
}

function beginAttempt(assisted = false, strategy = "group") {
  stopTimers();
  const previous = state.attempt?.code || "";
  state.attempt = newAttempt(currentLength(), { assisted, previous });
  if (assisted) state.missionHelpUsed = true;
  state.input = "";
  state.strategy = strategy;
  state.modal = null;
  state.screen = "viewing";
  state.launched = false;
  const ms =
    (state.free ? currentLength() + 2 : mission().seconds) *
    1000 *
    (progress.extraTime ? 2 : 1);
  clock = new ViewingClock(ms);
  clock.total = ms;
  render(true);
}

function runViewing() {
  clearInterval(viewTimer);
  if (!clock) return;
  if (!document.hidden && !state.modal) clock.resume(performance.now());
  const tick = () => {
    if (state.screen !== "viewing") return;
    const left = clock.left(performance.now());
    const fill = document.querySelector("#timer-fill");
    if (fill) fill.style.width = `${(left / clock.total) * 100}%`;
    const label = document.querySelector("#time-left");
    if (label) label.textContent = Math.ceil(left / 1000);
    if (left <= 0) hideCode();
  };
  tick();
  viewTimer = setInterval(tick, 80);
}

function hideCode() {
  if (state.screen !== "viewing" || state.modal) return;
  clearInterval(viewTimer);
  viewTimer = null;
  clock = null;
  state.attempt = conceal(state.attempt);
  state.screen = "recall";
  render(true);
}

function runCelebration() {
  clearInterval(celebrationTimer);
  if (reducedMotion.matches || state.free) {
    finishCelebration();
    return;
  }
  const tick = () => {
    const elapsed = performance.now() - celebrationStart;
    const count = document.querySelector("#launch-countdown");
    if (count)
      count.textContent =
        elapsed < 3000
          ? String(Math.max(1, 3 - Math.floor(elapsed / 1000)))
          : "✦";
    document
      .querySelector(".launch-scene")
      ?.classList.toggle("liftoff", elapsed >= 3000);
    if (elapsed >= 6500) finishCelebration();
  };
  tick();
  celebrationTimer = setInterval(tick, 100);
}

function finishCelebration() {
  clearInterval(celebrationTimer);
  celebrationTimer = null;
  state.launched = true;
  render();
}

function submit() {
  const result = evaluate(state.attempt, state.input);
  if (!result.valid) return;
  state.missionAttempts++;
  state.attempt = result.attempt;
  state.independent = result.independent;
  state.screen = result.correct ? "celebration" : "feedback";
  state.input = "";
  if (result.correct) {
    progress = recordClear(
      progress,
      state.attempt,
      result.independent,
      state.free,
      { attempts: state.missionAttempts, helpUsed: state.missionHelpUsed },
    );
    persist();
    chirp("win");
    state.launched = reducedMotion.matches || state.free;
    celebrationStart = performance.now();
  }
  render(true);
}

function updateInput(value) {
  state.input = value.replace(/[^0-9]/g, "").slice(0, state.attempt.length);
  const input = document.querySelector("#recall-input");
  if (input && input.value !== state.input) input.value = state.input;
  const authorize = document.querySelector(".authorize-button");
  if (authorize)
    authorize.disabled = state.input.length !== state.attempt.length;
}

root.addEventListener("input", (event) => {
  if (event.target.id === "recall-input") updateInput(event.target.value);
  if (event.target.id === "commander")
    state.commanderDraft = event.target.value;
  if (event.target.id === "practice-length") {
    state.length = Number(event.target.value);
    document.querySelector("#length-value").textContent = state.length;
  }
});

root.addEventListener("submit", (event) => {
  event.preventDefault();
  if (event.target.id === "authorize-form") submit();
  if (event.target.id === "commander-form") {
    const code = commanderCode(state.commanderDraft);
    if (!code) {
      state.error = "commander";
      render();
      document.querySelector("#commander").focus();
      return;
    }
    progress.commander = code;
    persist();
    if (state.free) route("free-menu");
    else {
      state.activeIndex = Math.min(progress.completed.length, 6);
      route(progress.completed.length === 7 ? "complete" : "briefing");
    }
  }
});

root.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  switch (action) {
    case "language":
      progress.lang = progress.lang === "en" ? "zh-TW" : "en";
      persist();
      render();
      break;
    case "sound":
      progress.sound = !progress.sound;
      persist();
      chirp();
      render();
      break;
    case "extra-time":
      progress.extraTime = !progress.extraTime;
      persist();
      render();
      break;
    case "home":
      state.free = false;
      route("home");
      break;
    case "settings":
      openModal("settings");
      break;
    case "how":
      openModal("how");
      break;
    case "help":
      openModal("help");
      break;
    case "close-dialog":
      closeModal();
      break;
    case "reset-dialog":
      openModal("reset");
      break;
    case "confirm-reset": {
      const { lang, sound, extraTime } = progress;
      progress = { ...defaults(), lang, sound, extraTime };
      persist();
      state.attempt = null;
      state.commanderDraft = "";
      state.free = false;
      route("home");
      break;
    }
    case "change-commander":
      state.commanderDraft = progress.commander;
      route("setup");
      break;
    case "start":
      state.free = false;
      progress.introSeen = true;
      persist();
      state.activeIndex = Math.min(progress.completed.length, 6);
      route(
        progress.commander
          ? progress.completed.length === 7
            ? "complete"
            : "briefing"
          : "setup",
      );
      break;
    case "begin":
      beginAttempt();
      break;
    case "ready":
      hideCode();
      break;
    case "key": {
      if (state.screen !== "recall") break;
      const key = target.dataset.key;
      updateInput(
        key === "clear"
          ? ""
          : key === "backspace"
            ? state.input.slice(0, -1)
            : state.input + key,
      );
      chirp();
      break;
    }
    case "retry":
      state.attempt = retry(state.attempt);
      state.input = "";
      route("recall");
      break;
    case "fresh":
      beginAttempt();
      break;
    case "group-practice":
      beginAttempt(true, "group");
      break;
    case "rehearsal-practice":
      beginAttempt(true, "rehearsal");
      break;
    case "briefing":
      route("briefing");
      break;
    case "skip":
      if (state.screen === "celebration" && !state.launched)
        finishCelebration();
      break;
    case "next":
      state.activeIndex = Math.min(progress.completed.length, 6);
      route("briefing");
      break;
    case "certificate":
      route("complete");
      break;
    case "replay":
      progress.completed = [];
      persist();
      state.activeIndex = 0;
      state.free = false;
      route("briefing");
      break;
    case "free-menu":
      state.free = true;
      route("free-menu");
      break;
    case "start-free":
    case "demo":
      state.free = true;
      if (!progress.commander) {
        state.commanderDraft = "";
        route("setup");
      } else beginAttempt();
      break;
    case "free-again":
      beginAttempt();
      break;
    case "print":
      window.print();
      break;
  }
});

document.addEventListener("keydown", (event) => {
  if (
    state.modal ||
    state.screen !== "recall" ||
    event.target instanceof HTMLInputElement ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey
  )
    return;
  if (/^\d$/.test(event.key)) {
    event.preventDefault();
    updateInput(state.input + event.key);
    chirp();
  }
  if (event.key === "Backspace" || event.key === "Delete") {
    event.preventDefault();
    updateInput(event.key === "Delete" ? "" : state.input.slice(0, -1));
  }
  if (event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) {
    event.preventDefault();
    submit();
  }
});

document.addEventListener("visibilitychange", () => {
  if (!clock || state.screen !== "viewing") return;
  if (document.hidden) clock.pause(performance.now());
  else if (!state.modal) clock.resume(performance.now());
});

render();
