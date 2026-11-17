/* The Rhythm sandbox's engine: no scoring of its own. It hands a coach's plan (the portal's shape) and a day to the app's
   real files, exactly as the Mind screen does: v7/mind/sleep-rule.js judges the night, v7/mind/rhythm.js scores the day.
   This file builds window.MDPLAN the way v7/mind/plan.js does (its coach branch maps the portal plan the same way), then
   rhythm.js, loaded after it, closes over that P and S. P and S are only ever changed in place, never replaced.
   Used by mind/sandbox-simple.html and node mind/sandbox-simple.check.cjs. */
(function (root) {
  /* the app's fixed rules for sleep (v7/mind/plan.js P): the coach sets hours and the window, never these */
  var P = { hours: 7.5, short: 3, exOn: true, grace: 1, exPen: 20, bed: "22:30", wake: "06:00", tol: 30, zero: 120,
    w: { hours: 25, window: 25, wd: 20, br: 10, me: 10, mood: 10 }, wd: [], br: [], me: [], moodAt: "21:00" };
  var S = { bed: null, wake: null, segs: null, naps: [], wd: {}, br: {}, me: {}, mood: -1, vm: null, vmSlots: 1 };
  var place = function () { return root.MDSLEEP.place(P.bed, P.wake); };
  root.MDPLAN = { P: P, S: S, Q: null, noplan: false, free: false, cause: "",
    logged: function () { return S.bed != null && S.wake != null && S.wake > S.bed; },
    bedM: function () { return place().bed; }, wakeM: function () { return place().wake; },
    niceS: function (s) { var p = String(s).split(":"), h = +p[0]; return (h % 12 || 12) + ":" + p[1] + (h < 12 ? " AM" : " PM"); },
    nice: function (m) { return root.MDSLEEP.clk(m); } };
  root.MOVEPART = root.MOVEPART || [{}, {}, {}];

  /* plan: { hours, bedtime, wake, winddown[{label,at}], breathing[{name,mins,at}], metime[{label,at}], mood.checks[{at}] }
     day: { sleeps[[bed,wake]...], naps[[bed,wake]...], wd{i:true}, br{i:minutes}, me{i:true}, vm[bool...] } */
  function apply(plan, day) {
    P.hours = +plan.hours; P.bed = plan.bedtime; P.wake = plan.wake;
    var named = function (x) { return String(x.label || "").trim(); };   /* as plan.js: a task the coach left blank is not in the plan */
    P.wd.length = 0; plan.winddown.filter(named).forEach(function (w) { P.wd.push({ t: w.label, at: w.at }); });
    P.br.length = 0; plan.breathing.slice(0, 3).forEach(function (b) { P.br.push({ n: b.name, min: +b.mins, at: b.at }); });
    P.me.length = 0; plan.metime.filter(named).slice(0, 1).forEach(function (m) { P.me.push({ t: m.label, at: m.at }); });   /* the app takes one me-time task */
    P.moodAt = (plan.mood.checks[0] || {}).at || "21:00";
    var sl = (day.sleeps || []).filter(function (x) { return x[1] > x[0]; });
    S.segs = sl.length ? sl.map(function (x) { return { bed: x[0], wake: x[1] }; }) : null;
    S.bed = sl.length ? Math.min.apply(null, sl.map(function (x) { return x[0]; })) : null;
    S.wake = sl.length ? Math.max.apply(null, sl.map(function (x) { return x[1]; })) : null;
    S.naps = (day.naps || []).filter(function (x) { return x[1] > x[0]; }).map(function (x) { return { bed: x[0], wake: x[1] }; });
    var keys = function (o, n, f) { var r = {}; for (var i = 0; i < n; i++) if (f(o[i])) r[i] = true; return r; };
    S.wd = keys(day.wd || {}, P.wd.length, Boolean);
    S.br = keys(day.br || {}, P.br.length, function (m) { return +m >= 1; });   /* a breathing exercise counts after one minute */
    S.me = keys(day.me || {}, P.me.length, Boolean);
    S.vmSlots = Math.max(1, plan.mood.checks.length);
    S.vm = []; for (var i = 0; i < S.vmSlots; i++) S.vm.push(!!(day.vm || [])[i]);
    S.mood = S.vm[0] ? 3 : -1;
  }
  /* the result, read only from rhythm.js */
  function result() {
    var R = root.MDRHYTHM, w = R.weights(), p = R.parts(), pts = {};
    Object.keys(w).forEach(function (k) { pts[k] = w[k] * p[k]; });
    var sum = function (L) { return L.reduce(function (a, k) { return a + (pts[k] || 0); }, 0); };
    var sq = sum(["hours", "window", "wd"]), sc = sum(["br", "me", "mood"]);
    return { score: R.score(), w: w, p: p, pts: pts, sleep: R.night(), sq: sq, sc: sc,
      sqOwn: Math.round(sq / 70 * 100), scOwn: Math.round(sc / 30 * 100) };   /* each part as its own score out of 100, as the app's tiles */
  }
  root.SB = { P: P, S: S, apply: apply, result: result };
})(typeof window !== "undefined" ? window : globalThis);
