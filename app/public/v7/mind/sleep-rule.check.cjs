/* Self-check for mind/sleep-rule.js: runs every case in v7/mind-rhythm.html ("Sleep window: how it is judged")
   through the scoring function and compares the points with the table. Run: node app/public/v7/mind/sleep-rule.check.cjs
   "before" is the rule until 16 Nov 2026 (rhythm.js summed every session as asleep and judged the first bedtime and
   the last wake-up of all of them), worked out here so the table's Before column stays honest. */
/* the browser file as it is, run in a sandbox with a window, so the check reads exactly what the screen runs */
var fs = require("fs"), path = require("path"), vm = require("vm");
var box = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(__dirname, "sleep-rule.js"), "utf8"), box);
var R = box.window.MDSLEEP;
var assert = require("assert");

/* the coach's sample plan: 7.5 h, 10:30 PM to 6:00 AM, and the fixed scoring settings */
var P = { hours: 7.5, short: 3, exOn: true, grace: 1, exPen: 20, tol: 30, zero: 120 };
var PLAN = { bed: 1350, wake: 1800 }, DAYPLAN = { bed: 1980, wake: 2430 };   /* 9:00 AM to 4:30 PM for the night-shift case */
var W = { hours: 25, window: 25 };

function before(list, plan) {
  if (!list.length) return { h: 0, w: 0 };
  var slept = list.reduce(function (t, x) { return t + x.wake - x.bed; }, 0) / 60, T = P.hours, h;
  if (slept < T) h = Math.max(0, 1 - (T - slept) / P.short); else if (slept > T + P.grace) h = Math.max(0, 1 - (slept - T - P.grace) * P.exPen / 100); else h = 1;
  var bed = Math.min.apply(null, list.map(function (x) { return x.bed; })), wake = Math.max.apply(null, list.map(function (x) { return x.wake; }));
  var win = (R.edge(bed - plan.bed, P) + R.edge(wake - plan.wake, P)) / 2;
  return { h: Math.round(W.hours * h), w: Math.round(W.window * win) };
}
function after(list, plan, opts) {
  var s = R.score(list, P, plan, opts);
  return { h: Math.round(W.hours * s.hours), w: Math.round(W.window * s.window) };
}

/* key, sessions [bed, wake] in minutes from 00:00 yesterday, before [hours, window], after [hours, window], plan, opts.
   After: naps count towards hours (decided 16 Nov 2026); { night: true } is the rule before that, night only */
var CASES = [
  ["plan", [[1350, 1800]], [25, 25], [25, 25]],
  ["synced", [[1370, 1810]], [24, 25], [24, 25]],
  ["late15", [[1365, 1800]], [23, 25], [23, 25]],
  ["late30", [[1380, 1800]], [21, 25], [21, 25]],
  ["late60", [[1410, 1800]], [17, 21], [17, 21]],
  ["late120", [[1470, 1800]], [8, 13], [8, 13]],
  ["early15", [[1350, 1785]], [23, 25], [23, 25]],
  ["early30", [[1350, 1770]], [21, 25], [21, 25]],
  ["early60", [[1350, 1740]], [17, 21], [17, 21]],
  ["early120", [[1350, 1680]], [8, 13], [8, 13]],
  ["bedearly60", [[1290, 1800]], [25, 21], [25, 21]],
  ["shift60", [[1410, 1860]], [25, 17], [25, 17]],
  ["shift120", [[1470, 1920]], [25, 0], [25, 0]],
  ["nap20", [[1350, 1800], [2280, 2300]], [25, 13], [25, 25]],
  ["nap90", [[1350, 1800], [2220, 2310]], [23, 13], [23, 25]],
  ["nap90 (night only)", [[1350, 1800], [2220, 2310]], [23, 13], [25, 25], PLAN, { night: true }],
  ["napeve", [[1140, 1200], [1350, 1800]], [25, 13], [25, 25]],
  ["napin", [[1350, 1370], [1500, 1800]], [7, 25], [7, 25]],
  ["naponly", [[2220, 2310]], [0, 0], [0, 0]],
  ["yday", [[900, 940], [1350, 1800]], [25, 13], [25, 25]],
  ["tomorrow", [[1350, 1800], [2460, 2580]], [20, 13], [25, 25]],
  ["split", [[1370, 1590], [1630, 1810]], [18, 25], [18, 25]],
  ["split2h", [[1350, 1530], [1650, 1800]], [8, 25], [8, 25]],
  ["dozeback", [[1350, 1710], [1830, 1890]], [21, 17], [21, 17]],
  ["dozeback (night only)", [[1350, 1710], [1830, 1890]], [21, 17], [13, 17], PLAN, { night: true }],
  ["short2h", [[1350, 1470]], [0, 13], [0, 0]],
  ["short3h", [[1350, 1530]], [0, 13], [0, 13]],
  ["partial", [[1690, 1815]], [0, 13], [0, 0]],
  ["nightshift", [[1980, 2400]], [21, 0], [21, 0]],
  ["nightshift, day window", [[1980, 2400]], [21, 25], [21, 25], DAYPLAN],
  ["dup", [[1370, 1810], [1360, 1800]], [0, 25], [25, 25]],
  ["overlap", [[1370, 1600], [1560, 1810]], [25, 25], [24, 25]],
  ["crumb", [[1350, 1800], [2100, 2105]], [25, 13], [25, 25]],
  ["none", [], [0, 0], [0, 0]]
];

var bad = 0;
console.log("case".padEnd(26) + "before h/w   after h/w");
CASES.forEach(function (c) {
  var list = c[1].map(function (x) { return { bed: x[0], wake: x[1] }; }), plan = c[4] || PLAN;
  var b = before(list, plan), a = after(list, plan, c[5]);
  var ok = b.h === c[2][0] && b.w === c[2][1] && a.h === c[3][0] && a.w === c[3][1];
  if (!ok) bad++;
  console.log((ok ? "  " : "X ") + c[0].padEnd(24) + (b.h + "/" + b.w).padEnd(13) + a.h + "/" + a.w + (ok ? "" : "   expected " + c[2].join("/") + " then " + c[3].join("/")));
});

/* the rule's parts, one by one */
assert.strictEqual(R.edge(30, P), 1, "within 30 min is full");
assert.strictEqual(R.edge(-30, P), 1, "early counts as late");
assert.strictEqual(R.edge(75, P), 0.5, "halfway between 30 min and 2 h is half");
assert.strictEqual(R.edge(120, P), 0, "2 h off is zero");
assert.strictEqual(R.split([{ bed: 1350, wake: 1800 }, { bed: 2280, wake: 2300 }], PLAN).naps.length, 1, "an afternoon nap is a nap");
assert.strictEqual(R.split([{ bed: 1350, wake: 1530 }, { bed: 1650, wake: 1800 }], PLAN).naps.length, 0, "2 h awake inside the window keeps one night");
assert.strictEqual(R.split([{ bed: 1350, wake: 1500 }, { bed: 1700, wake: 1800 }], PLAN).naps.length, 1, "over 3 h awake splits the night");
assert.strictEqual(R.split([{ bed: 1140, wake: 1200 }, { bed: 1250, wake: 1800 }], PLAN).naps.length, 0, "a break of 1 hour or less joins, outside the window too");
assert.strictEqual(R.score([{ bed: 1350, wake: 1529 }], P, PLAN).judged, false, "under 3 h asleep, the window is not judged");
assert.strictEqual(R.score([{ bed: 1350, wake: 1530 }], P, PLAN).judged, true, "3 h asleep, it is");
assert.strictEqual(R.words(R.score([{ bed: 1350, wake: 1800 }, { bed: 2280, wake: 2300 }], P, PLAN), P, PLAN, W).length, 3, "hours, bedtime and wake-up together, and the nap, in words");
assert.strictEqual(R.score([{ bed: 1350, wake: 1800 }, { bed: 2280, wake: 2300 }], P, PLAN).slept * 60, 470, "a nap adds to the hours: 7h 30m and 20 min");
assert.strictEqual(R.score([{ bed: 1350, wake: 1800 }, { bed: 2280, wake: 2300 }], P, PLAN, { night: true }).slept * 60, 450, "night only leaves it out");
assert.strictEqual(R.score([{ bed: 1350, wake: 1800 }, { bed: 2220, wake: 2310 }], P, PLAN).window, 1, "a nap never moves the window");
assert.strictEqual(R.score([{ bed: 1980, wake: 2430 }, { bed: 1380, wake: 1410 }], P, DAYPLAN).window, 1, "a day window: the day sleep is the main sleep, an evening nap stays a nap");

console.log(bad ? "\n" + bad + " case(s) differ from the table" : "\nAll " + CASES.length + " cases match the table, and the rule's parts pass.");
process.exit(bad ? 1 : 0);
