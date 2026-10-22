export const MISSIONS = [
  { key: "earth", digits: 3, seconds: 5, color: "#78d9c8" },
  { key: "moon", digits: 4, seconds: 6, color: "#cfcedb" },
  { key: "mars", digits: 5, seconds: 7, color: "#ff987a" },
  { key: "belt", digits: 6, seconds: 8, color: "#d5b091" },
  { key: "jupiter", digits: 7, seconds: 9, color: "#edb381" },
  { key: "saturn", digits: 8, seconds: 10, color: "#f4d48f" },
  { key: "neptune", digits: 9, seconds: 11, color: "#88aaf4" },
];

export function commanderCode(value) {
  return /^[a-z]{3}$/i.test(value) ? value.toUpperCase() : null;
}

export function generateCode(length, previous = "", random = Math.random) {
  if (!Number.isInteger(length) || length < 3 || length > 12)
    throw new RangeError("Invalid code length");
  let code = Array.from({ length }, () =>
    Math.floor(Math.min(0.999999999, Math.max(0, random())) * 10),
  ).join("");
  if (code === previous)
    code = code.slice(0, -1) + ((Number(code.at(-1)) + 1) % 10);
  return code;
}

export function newAttempt(
  length,
  { assisted = false, previous = "", random = Math.random } = {},
) {
  return {
    length,
    code: generateCode(length, previous, random),
    assisted,
    helpUsed: assisted,
    submissions: 0,
    firstAttemptCorrect: false,
    phase: "viewing",
  };
}

export function conceal(attempt) {
  return { ...attempt, phase: "recall" };
}

export function evaluate(attempt, input) {
  if (
    attempt.phase !== "recall" ||
    !new RegExp(`^\\d{${attempt.length}}$`).test(input)
  ) {
    return { valid: false, attempt, correct: false, independent: false };
  }
  const correct = input === attempt.code;
  const independent =
    correct &&
    attempt.submissions === 0 &&
    !attempt.assisted &&
    !attempt.helpUsed;
  return {
    valid: true,
    correct,
    independent,
    attempt: {
      ...attempt,
      submissions: attempt.submissions + 1,
      firstAttemptCorrect: independent,
      phase: correct ? "celebration" : "feedback",
    },
  };
}

export function retry(attempt) {
  return attempt.phase === "feedback"
    ? { ...attempt, phase: "recall" }
    : attempt;
}

export function defaults() {
  return {
    version: 1,
    lang: "en",
    sound: false,
    introSeen: false,
    commander: "",
    completed: [],
    best: 0,
    practiceBest: 0,
    extraTime: false,
  };
}

export function restore(raw) {
  const base = defaults();
  try {
    const p = JSON.parse(raw);
    if (!p || p.version !== 1) return base;
    const completed = [];
    if (Array.isArray(p.completed)) {
      for (const r of p.completed.slice(0, 7)) {
        if (
          !r ||
          r.completed !== true ||
          !Number.isInteger(r.attempts) ||
          r.attempts < 1
        )
          break;
        completed.push({
          completed: true,
          attempts: r.attempts,
          helpUsed: r.helpUsed === true,
          firstAttemptCorrect: r.firstAttemptCorrect === true,
        });
      }
    }
    const best =
      Number.isInteger(p.best) && p.best >= 0 && p.best <= 12 ? p.best : 0;
    const practiceBest =
      Number.isInteger(p.practiceBest) &&
      p.practiceBest >= 0 &&
      p.practiceBest <= 12
        ? p.practiceBest
        : 0;
    return {
      ...base,
      lang: p.lang === "zh-TW" ? "zh-TW" : "en",
      sound: p.sound === true,
      introSeen: p.introSeen === true,
      commander: commanderCode(p.commander || "") || "",
      completed,
      best,
      practiceBest,
      extraTime: p.extraTime === true,
    };
  } catch {
    return base;
  }
}

export function recordClear(
  progress,
  attempt,
  independent,
  free = false,
  stats = {},
) {
  const next = { ...progress, completed: [...progress.completed] };
  if (independent) next.best = Math.max(next.best, attempt.length);
  if (attempt.assisted)
    next.practiceBest = Math.max(next.practiceBest, attempt.length);
  const attempts = stats.attempts ?? attempt.submissions;
  const helpUsed = stats.helpUsed ?? attempt.helpUsed;
  if (!free && next.completed.length < 7)
    next.completed.push({
      completed: true,
      attempts,
      helpUsed,
      firstAttemptCorrect: independent && attempts === 1,
    });
  return next;
}

export class ViewingClock {
  constructor(ms) {
    this.remaining = ms;
    this.started = null;
  }
  resume(now) {
    if (this.started === null && this.remaining > 0) this.started = now;
  }
  pause(now) {
    this.remaining = this.left(now);
    this.started = null;
  }
  left(now) {
    return Math.max(
      0,
      this.remaining -
        (this.started === null ? 0 : Math.max(0, now - this.started)),
    );
  }
}
