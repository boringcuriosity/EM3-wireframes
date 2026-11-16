/* Mind: which sleep is last night, and how it scores. One rule for the score (mind/rhythm.js), the sleep card and
   "How last night counts" (mind/variants/sleep.js), and the self-check (node v7/mind/sleep-rule.check.cjs).
   Times are minutes from 00:00 yesterday: 1350 is 10:30 PM yesterday, 1800 is 6:00 AM today, 2280 is 2:00 PM today.
   Decided 16 Nov 2026 (v7/mind-rhythm.html, "Sleep window: how it is judged"):
   1. Today's Rhythm reads every sleep that ended between 6 PM yesterday and 6 PM today.
   2. Overlapping or repeated sessions (a watch and a phone) are merged, so no minute counts twice. Then any piece
      under 10 minutes is dropped.
   3. Pieces join into one sleep when the break between them is 1 hour or less, or up to 3 hours when the break sits
      wholly inside the coach's sleep window (awake in the night).
   4. The night is the sleep with the most time asleep. Every other sleep is a nap.
   5. Hours: time asleep in the night plus every nap in the same span, breaks left out (decided 16 Nov 2026).
      Oversleep still reduces past target + 1 h, so a long nap can cost hours points. opts.night counts the night
      only, the rule before that decision (doc only, ?naps=night).
   6. Window: judged only when the night has at least 3 hours asleep, otherwise 0. Bedtime is the night's first
      sleep, wake-up its last. Each edge scores 1 within 30 min of the plan (P.tol), 0 at 2 h or more (P.zero), a
      straight line between; the two are averaged. Early and late count alike. The 3 h minimum is a hard cut (decided).
   7. The coach's window can sit at any time of day (a night-shift sleeper: 9:00 AM to 4:30 PM). It is judged the same
      way; mind/plan.js places it in the span by its wake time. */
(function (root) {
  var R = { from: 1080, to: 2520, minPiece: 10, join: 60, joinIn: 180, minNight: 180 };

  /* 1 and 2: today's pieces, merged where they overlap, crumbs dropped */
  function tidy(list) {
    var a = (list || []).filter(function (s) { return s && s.wake > s.bed && s.wake > R.from && s.wake <= R.to; })
      .map(function (s) { return { bed: s.bed, wake: s.wake }; }).sort(function (x, y) { return x.bed - y.bed; });
    var out = [];
    a.forEach(function (s) { var l = out[out.length - 1]; if (l && s.bed <= l.wake) l.wake = Math.max(l.wake, s.wake); else out.push(s); });
    return out.filter(function (s) { return s.wake - s.bed >= R.minPiece; });
  }
  /* 3: pieces into sleeps */
  function blocks(pieces, plan) {
    var out = [];
    pieces.forEach(function (x) {
      var b = out[out.length - 1], gap = b ? x.bed - b.wake : 0, inside = b && b.wake >= plan.bed && x.bed <= plan.wake;
      if (b && (gap <= R.join || (inside && gap <= R.joinIn))) { b.segs.push(x); b.wake = x.wake; b.asleep += x.wake - x.bed; }
      else out.push({ bed: x.bed, wake: x.wake, asleep: x.wake - x.bed, segs: [x] });
    });
    return out;
  }
  /* 4: the night and the naps */
  function split(list, plan) {
    var b = blocks(tidy(list), plan), night = null;
    b.forEach(function (x) { if (!night || x.asleep > night.asleep) night = x; });
    return { night: night, naps: b.filter(function (x) { return x !== night; }) };
  }
  function edge(d, P) { d = Math.abs(d); return d <= P.tol ? 1 : d >= P.zero ? 0 : 1 - (d - P.tol) / (P.zero - P.tol); }
  /* 5 and 6. P: the coach's plan (hours, short, exOn, grace, exPen, tol, zero). plan: { bed, wake } in minutes. */
  function score(list, P, plan, opts) {
    opts = opts || {};
    var r = split(list, plan), n = r.night, napMin = r.naps.reduce(function (t, x) { return t + x.asleep; }, 0);
    if (!n) return { night: null, naps: [], napMin: 0, slept: 0, hours: 0, window: 0, judged: false, bed: 0, wake: 0, db: 0, dw: 0 };
    var slept = (n.asleep + (opts.night ? 0 : napMin)) / 60, T = P.hours, h;
    if (slept < T) h = Math.max(0, 1 - (T - slept) / P.short);
    else if (P.exOn && slept > T + P.grace) h = Math.max(0, 1 - (slept - T - P.grace) * P.exPen / 100); else h = 1;
    var judged = n.asleep >= R.minNight, db = n.bed - plan.bed, dw = n.wake - plan.wake;
    var bed = judged ? edge(db, P) : 0, wake = judged ? edge(dw, P) : 0;
    return { night: n, naps: r.naps, napMin: napMin, slept: slept, hours: h, window: (bed + wake) / 2, judged: judged, bed: bed, wake: wake, db: db, dw: dw };
  }

  /* 7: the coach's window ("22:30", "06:00") in minutes of the span. The wake-up sits where it ends inside 6 PM yesterday
     to 6 PM today, the bedtime the window's length before it: 10:30 PM to 6:00 AM is 1350 to 1800, a night-shift
     9:00 AM to 4:30 PM is 1980 to 2430 */
  function place(bed, wake) {
    var hm = function (t) { var p = String(t).split(":"); return +p[0] * 60 + +p[1]; };
    var w = hm(wake), b = hm(bed), W = w + 1440 > R.to ? w : w + 1440, len = ((w - b) % 1440 + 1440) % 1440 || 1440;
    return { bed: W - len, wake: W };
  }

  /* the same result in plain words, for "How last night counts". w: the two weights { hours, window } */
  function clk(m) { m = ((Math.round(m) % 1440) + 1440) % 1440; var h = Math.floor(m / 60); return (h % 12 || 12) + ":" + ("0" + m % 60).slice(-2) + (h < 12 ? " AM" : " PM"); }
  function gap(m) { m = Math.round(Math.abs(m)); var h = Math.floor(m / 60), x = m % 60; return h ? h + "h" + (x ? " " + x + "m" : "") : x + " min"; }
  function dur(m) { m = Math.max(0, Math.round(m)); return Math.floor(m / 60) + "h " + ("0" + m % 60).slice(-2) + "m"; }
  function words(s, P, plan, w, opts) {
    opts = opts || {};
    if (!s.night) return ["Nothing for last night yet, so sleep has no points so far."];
    var n = s.night, L = [], half = w.window / 2;
    var aw = n.wake - n.bed - n.asleep;
    var nn = s.naps.length, withNaps = !opts.night && s.napMin;
    L.push("Hours: " + dur(s.slept * 60) + " asleep" + (withNaps ? ", your main sleep and " + (nn === 1 ? "a nap" : nn + " naps") + " together" : "") + (aw > 0 ? " (the " + gap(aw) + " awake in the night is left out)" : "") + ", against your " + dur(P.hours * 60) + ". " + Math.round(w.hours * s.hours) + " of " + w.hours + "." +
      (P.exOn && s.slept > P.hours + P.grace ? " More than " + gap(P.grace * 60) + " over your target takes some points off." : ""));
    if (!s.judged) L.push("Sleep window: your longest sleep was " + dur(n.asleep) + ". A night needs at least 3 hours asleep for the window to count, so it gives 0 of " + w.window + ".");
    else {
      var one = function (l, at, d, v) {
        return l + " " + clk(at) + ", " + (Math.abs(d) <= P.tol ? "on time" : gap(d) + (d > 0 ? " late" : " early")) + ": " + Math.round(half * v) + " of " + half + ".";
      };
      L.push(one("Slept", n.bed, s.db, s.bed)); L.push(one("Woke up", n.wake, s.dw, s.wake));
    }
    s.naps.forEach(function (x) {
      L.push("Your " + gap(x.asleep) + " nap at " + clk(x.bed) + (opts.night ? " is not part of the night, so it changes neither your hours nor your sleep window."
        : " counts towards your hours, not your sleep window."));
    });
    return L;
  }

  var API = { R: R, place: place, tidy: tidy, blocks: blocks, split: split, edge: edge, score: score, words: words, clk: clk, gap: gap, dur: dur };
  root.MDSLEEP = API;
})(window);
