import test from "node:test";
import assert from "node:assert/strict";
import {
  MISSIONS,
  commanderCode,
  generateCode,
  newAttempt,
  conceal,
  evaluate,
  retry,
  defaults,
  restore,
  recordClear,
  ViewingClock,
} from "../src/engine.js";

test("campaign spans and display durations match the design", () => {
  assert.deepEqual(
    MISSIONS.map((m) => m.digits),
    [3, 4, 5, 6, 7, 8, 9],
  );
  assert.deepEqual(
    MISSIONS.map((m) => m.seconds),
    [5, 6, 7, 8, 9, 10, 11],
  );
});
test("commander codes normalize ASCII and reject invalid input", () => {
  assert.equal(commanderCode("sky"), "SKY");
  assert.equal(commanderCode("SKY"), "SKY");
  for (const input of [
    "",
    "A1B",
    " ABC",
    "AB ",
    "ＡＢＣ",
    "天空星",
    "abcd",
    "ab",
    "a b",
  ])
    assert.equal(commanderCode(input), null);
});
test("generator preserves leading zeroes and requested length", () => {
  assert.equal(
    generateCode(3, "", () => 0),
    "000",
  );
  let index = 0;
  assert.equal(
    generateCode(4, "", () => [0, 0, 0.4, 0.5][index++]),
    "0045",
  );
  assert.equal(
    generateCode(9, "", () => 0),
    "000000000",
  );
  assert.equal(
    generateCode(12, "", () => 0.999),
    "999999999999",
  );
  assert.throws(() => generateCode(2), RangeError);
  assert.throws(() => generateCode(13), RangeError);
});
test("generator does not immediately reuse the previous code", () =>
  assert.equal(
    generateCode(3, "000", () => 0),
    "001",
  ));
test("viewing code cannot be submitted before concealment", () => {
  const attempt = newAttempt(3, { random: () => 0 });
  assert.equal(evaluate(attempt, "000").valid, false);
});
test("first unassisted correct submission earns independent clear", () => {
  const a = conceal(newAttempt(3, { random: () => 0 }));
  const r = evaluate(a, "000");
  assert.equal(r.correct, true);
  assert.equal(r.independent, true);
  assert.equal(r.attempt.submissions, 1);
  assert.equal(evaluate(r.attempt, "000").valid, false);
});
test("invalid lengths and non-digits do not consume attempts", () => {
  const a = conceal(newAttempt(4, { random: () => 0 }));
  for (const input of ["000", "00000", "00a0", "００００", "0 00", ""]) {
    const r = evaluate(a, input);
    assert.equal(r.valid, false);
    assert.equal(r.attempt.submissions, 0);
  }
});
test("wrong answer never launches; same-code retry cannot earn independent best", () => {
  const a = conceal(newAttempt(3, { random: () => 0 }));
  const wrong = evaluate(a, "999");
  assert.equal(wrong.attempt.phase, "feedback");
  assert.equal(wrong.correct, false);
  const retried = retry(wrong.attempt);
  assert.equal(retried.code, a.code);
  const correct = evaluate(retried, "000");
  assert.equal(correct.correct, true);
  assert.equal(correct.independent, false);
  assert.equal(correct.attempt.submissions, 2);
});
test("assisted practice can advance campaign without inflating independent best", () => {
  const r = evaluate(
    conceal(newAttempt(9, { assisted: true, random: () => 0 })),
    "000000000",
  );
  assert.equal(r.independent, false);
  const p = recordClear(defaults(), r.attempt, r.independent);
  assert.equal(p.best, 0);
  assert.equal(p.practiceBest, 9);
  assert.equal(p.completed.length, 1);
  assert.equal(p.completed[0].helpUsed, true);
});
test("fresh code after practice may earn independent best", () => {
  const practice = newAttempt(3, { assisted: true, random: () => 0 });
  const fresh = newAttempt(3, { previous: practice.code, random: () => 0 });
  assert.notEqual(fresh.code, practice.code);
  const r = evaluate(conceal(fresh), fresh.code);
  assert.equal(r.independent, true);
});
test("free practice updates best without advancing campaign", () => {
  const r = evaluate(
    conceal(newAttempt(12, { random: () => 0 })),
    "000000000000",
  );
  const p = recordClear(defaults(), r.attempt, true, true);
  assert.equal(p.best, 12);
  assert.equal(p.completed.length, 0);
});
test("mission history retains previous errors and help when a fresh code earns independent best", () => {
  const r = evaluate(conceal(newAttempt(4, { random: () => 0 })), "0000");
  const p = recordClear(defaults(), r.attempt, true, false, {
    attempts: 3,
    helpUsed: true,
  });
  assert.equal(p.best, 4);
  assert.equal(p.completed[0].attempts, 3);
  assert.equal(p.completed[0].helpUsed, true);
  assert.equal(p.completed[0].firstAttemptCorrect, false);
});
test("seven successful missions produce seven completion records", () => {
  let p = defaults();
  for (const m of MISSIONS) {
    const a = conceal(newAttempt(m.digits));
    const r = evaluate(a, a.code);
    p = recordClear(p, r.attempt, r.independent);
  }
  assert.equal(p.completed.length, 7);
  assert.equal(p.best, 9);
  assert.equal(
    p.completed.every((r) => r.firstAttemptCorrect),
    true,
  );
});
test("malformed and unsupported storage recover safely", () => {
  for (const raw of [null, "", "{oops", "null", '{"version":8}', "[]"])
    assert.deepEqual(restore(raw), defaults());
  const p = restore(
    JSON.stringify({
      version: 1,
      commander: "A1B",
      best: 99,
      practiceBest: -1,
      completed: [{ completed: true, attempts: -1 }],
      lang: "xx",
    }),
  );
  assert.deepEqual(p, defaults());
});
test("storage preserves preferences and results but never stores active secret code", () => {
  const original = {
    ...defaults(),
    commander: "SKY",
    sound: true,
    lang: "zh-TW",
    best: 5,
    extraTime: true,
    completed: [
      {
        completed: true,
        attempts: 1,
        helpUsed: false,
        firstAttemptCorrect: true,
      },
    ],
  };
  assert.deepEqual(restore(JSON.stringify(original)), original);
  assert.equal(
    "code" in restore(JSON.stringify({ ...original, code: "123" })),
    false,
  );
});
test("viewing clock pauses in background, resumes, and clamps at zero", () => {
  const c = new ViewingClock(5000);
  c.resume(1000);
  assert.equal(c.left(2500), 3500);
  c.pause(2500);
  assert.equal(c.left(99000), 3500);
  c.resume(100000);
  c.resume(100500);
  assert.equal(c.left(101000), 2500);
  assert.equal(c.left(200000), 0);
});
