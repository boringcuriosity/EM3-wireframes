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
var W = { hours: 23, window: 24 };

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

/* key, sessions [bed, wake] in minutes from 00:00 yesterday, before [hours, window], after [hours, window], plan, opts */
var CASES = [
  ["plan", [[1350, 1800]], [23, 24], [23, 24]],
  ["synced", [[1370, 1810]], [22, 24], [22, 24]],
  ["late15", [[1365, 1800]], [21, 24], [21, 24]],
  ["late30", [[1380, 1800]], [19, 24], [19, 24]],
  ["late60", [[1410, 1800]], [15, 20], [15, 20]],
  ["late120", [[1470, 1800]], [8, 12], [8, 12]],
  ["early15", [[1350, 1785]], [21, 24], [21, 24]],
  ["early30", [[1350, 1770]], [19, 24], [19, 24]],
  ["early60", [[1350, 1740]], [15, 20], [15, 20]],
  ["early120", [[1350, 1680]], [8, 12], [8, 12]],
  ["bedearly60", [[1290, 1800]], [23, 20], [23, 20]],
  ["shift60", [[1410, 1860]], [23, 16], [23, 16]],
  ["shift120", [[1470, 1920]], [23, 0], [23, 0]],
  ["nap20", [[1350, 1800], [2280, 2300]], [23, 12], [23, 24]],
  ["nap90", [[1350, 1800], [2220, 2310]], [21, 12], [23, 24]],
  ["nap90 (naps count)", [[1350, 1800], [2220, 2310]], [21, 12], [21, 24], PLAN, { naps: true }],
  ["napeve", [[1140, 1200], [1350, 1800]], [23, 12], [23, 24]],
  ["napin", [[1350, 1370], [1500, 1800]], [6, 24], [6, 24]],
  ["naponly", [[2220, 2310]], [0, 0], [0, 0]],
  ["yday", [[900, 940], [1350, 1800]], [23, 12], [23, 24]],
  ["tomorrow", [[1350, 1800], [2460, 2580]], [18, 12], [23, 24]],
  ["split", [[1370, 1590], [1630, 1810]], [17, 24], [17, 24]],
  ["split2h", [[1350, 1530], [1650, 1800]], [8, 24], [8, 24]],
  ["dozeback", [[1350, 1710], [1830, 1890]], [19, 16], [12, 16]],
  ["dozeback (naps count)", [[1350, 1710], [1830, 1890]], [19, 16], [19, 16], PLAN, { naps: true }],
  ["short2h", [[1350, 1470]], [0, 12], [0, 0]],
  ["short3h", [[1350, 1530]], [0, 12], [0, 12]],
  ["partial", [[1690, 1815]], [0, 12], [0, 0]],
  ["nightshift", [[1980, 2400]], [19, 0], [19, 0]],
  ["nightshift, day window", [[1980, 2400]], [19, 24], [19, 24], DAYPLAN],
  ["dup", [[1370, 1810], [1360, 1800]], [0, 24], [23, 24]],
  ["overlap", [[1370, 1600], [1560, 1810]], [23, 24], [22, 24]],
  ["crumb", [[1350, 1800], [2100, 2105]], [23, 12], [23, 24]],
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
assert.strictEqual(R.words(R.score([{ bed: 1350, wake: 1800 }, { bed: 2280, wake: 2300 }], P, PLAN), P, PLAN, W).length, 4, "hours, bedtime, wake-up and the nap, in words");

console.log(bad ? "\n" + bad + " case(s) differ from the table" : "\nAll " + CASES.length + " cases match the table, and the rule's parts pass.");
process.exit(bad ? 1 : 0);
