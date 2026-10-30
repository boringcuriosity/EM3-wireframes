/* Mind: the Rhythm score, worked out from the cards in mind/plan.js with the Mind deck weights (mind/sandbox-simple.html):
     Sleep hours   23  full at the coach's target; drops to zero when short by 3 h; past target + 1 h, loses 20% an hour
     Sleep window  24  bedtime and wake time each: full within 30 min of the plan, none past 2 h, early or late alike
     Wind-down     23  each task done earns its share
     Breathing     10  each exercise done earns its share
     Me-time       10  any one task is enough
     Mood          10  checking in counts; the answer never does
   The day starts at 0: last night counts once it is logged. The line under the score names what a gain came from,
   as Move's does (move/momentum.js), and never shows a minus. */
(function () {
  var M = window.MDPLAN; if (!M) return;
  var P = M.P, S = M.S;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  function parts() {
    var on = M.logged(), slept = on ? (S.wake - S.bed) / 60 : 0, T = P.hours, h;
    if (!on) h = 0; else if (slept < T) h = clamp(1 - (T - slept) / P.short, 0, 1);
    else if (P.exOn && slept > T + P.grace) h = clamp(1 - (slept - T - P.grace) * P.exPen / 100, 0, 1); else h = 1;
    var e = function (d) { return d <= P.tol ? 1 : d >= P.zero ? 0 : 1 - (d - P.tol) / (P.zero - P.tol); };
    var win = on ? (e(Math.abs(S.bed - M.bedM(P.bed))) + e(Math.abs(S.wake - M.wakeM(P.wake)))) / 2 : 0;
    var n = function (k) { return P[k].filter(function (x, i) { return S[k][i]; }).length; };
    return {
      hours: h, window: win,
      wd: P.wd.length ? n("wd") / P.wd.length : 0,
      br: P.br.length ? n("br") / P.br.length : 0,
      me: n("me") ? 1 : 0,
      mood: S.mood >= 0 ? 1 : 0,
      raw: { slept: slept, wd: n("wd"), care: (n("br") ? 1 : 0) + (n("me") ? 1 : 0) + (S.mood >= 0 ? 1 : 0) }
    };
  }
  function score() {
    if (M.noplan) return null;
    var p = parts(), sum = 0, tot = 0;
    Object.keys(P.w).forEach(function (k) { sum += P.w[k]; tot += P.w[k] * p[k]; });
    return Math.round(tot / sum * 100);
  }

  /* "What shaped your score?": Sleep in hours of the target, Wind-down tasks done, and Self-care as breathing, me-time and mood */
  window.MOVEPART = [
    { cls: "glyph-sleep", name: "Sleep", T: P.hours, unit: " h" },
    { cls: "glyph-wind", name: "Wind-down", T: P.wd.length, unit: "" },
    { cls: "glyph-care", name: "Self-care", T: 3, unit: "" }
  ];
  function live() { var r = parts().raw; return [Math.round(r.slept * 10) / 10, r.wd, r.care]; }
  window.MV = function (i) { return live()[i]; };

  var last = score() || 0, said = false;
  (function first(tries) {
    if (window.setHeroScore && last != null) { window.setHeroScore(last); return; }
    if (tries < 50) setTimeout(function () { first(tries + 1); }, 100);
  })(0);

  /* the line under the score: a nudge before anything, then the gain and where it came from */
  var hide = document.createElement("style"); hide.textContent = "#cm:not(.said){display:none}"; document.head.appendChild(hide);
  var WHY = {
    sleep: "A steady night is the base of your Rhythm.",
    wd: "Small steps in the evening help you sleep steady.",
    br: "A few slow breaths help your body settle.",
    me: "Time for yourself keeps stress low.",
    mood: "Naming how you feel helps you understand your day."
  };
  function intro() {
    var cm = document.getElementById("cm"); if (!cm || !window.GFSay || !window.GFSay.show || M.noplan) return;
    cm.classList.add("said");
    window.GFSay.show(M.logged()
      ? { lead: "Keep going through your day to grow your Rhythm.", rest: "", delta: "", tone: "calm" }
      : { lead: "Log last night’s sleep to start today’s Rhythm.", rest: "", delta: "", tone: "calm" });
  }
  function say(d, n) {
    var cm = document.getElementById("cm"); if (!cm || !window.GFSay || !window.GFSay.show) return;
    if (d <= 0) return intro();
    cm.classList.add("said");
    var was = n - d, line =
      n >= 100 && was < 100 ? { lead: "You reached 100% Rhythm!", rest: "You looked after your night and your day.", delta: "" }
      : n >= 80 && was < 80 ? { lead: "You’ve earned today’s medal!", rest: "Your Rhythm went up by " + d + "%. Well done." }
      : { lead: "Your Rhythm went up by " + d + "%.", rest: WHY[M.cause] || "Every small step keeps your Rhythm steady." };
    if (line.delta === undefined) line.delta = "+" + d + "%";
    window.GFSay.show({ lead: line.lead, rest: line.rest, delta: line.delta, tone: "up" });
  }
  (function wait(n) { if (document.getElementById("cm")) intro(); else if (n < 40) setTimeout(function () { wait(n + 1); }, 100); })(0);

  var t = 0;
  function update() {
    var n = score(); if (n == null) return;
    tiles();
    var d = n - last; if (!d) return;
    last = n;
    if (window.S && window.S.hero) window.S.hero.score = n;
    if (window.setHeroScore) window.setHeroScore(n, d > 0 ? d : 0);   /* no step down and no minus on the score */
    clearTimeout(t); t = setTimeout(function () { say(d, n); if (window.MVMEDAL) window.MVMEDAL(); }, 2400);
  }
  function tiles() {
    if (!window.paintMacros) return;
    window.MOVEPART[0].T = P.hours;
    window.paintMacros(null, "");
  }
  window.MDRHYTHM = { score: score, parts: parts, update: update };
  /* the screen's date sheet and medal read today's score from Move's object; Mind answers for it */
  window.MVMOM = { score: score, gain: function () { return 0; }, logged: function () {} };
  setTimeout(tiles, 300);
})();
