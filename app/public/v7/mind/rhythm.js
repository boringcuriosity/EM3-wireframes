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
    var on = M.logged(), slept = on ? (S.segs ? S.segs.reduce(function (t, x) { return t + x.wake - x.bed; }, 0) : S.wake - S.bed) / 60 : 0, T = P.hours, h;
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
      mood: S.vm ? S.vm.filter(Boolean).length / (S.vmSlots || 1) : S.mood >= 0 ? 1 : 0,   /* two check-ins: each earns half */
      raw: { slept: slept, wd: n("wd"), care: (n("br") ? 1 : 0) + (n("me") ? 1 : 0) + (S.mood >= 0 ? 1 : 0),
        ontime: on ? (Math.abs(S.bed - M.bedM(P.bed)) <= P.tol) + (Math.abs(S.wake - M.wakeM(P.wake)) <= P.tol) : 0,
        self: n("wd") + n("br") + (n("me") ? 1 : 0) + (S.vm ? S.vm.filter(Boolean).length : S.mood >= 0 ? 1 : 0) }
    };
  }
  function score() {
    if (M.noplan) return null;
    var p = parts(), sum = 0, tot = 0;
    /* only the parts the coach's plan has count, so a plan without me-time can still reach 100 */
    var has = { wd: P.wd.length, br: P.br.length, me: P.me.length };
    Object.keys(P.w).forEach(function (k) { if (k in has && !has[k]) return; sum += P.w[k]; tot += P.w[k] * p[k]; });
    return Math.round(tot / sum * 100);
  }

  /* "What shaped your score?": the coach's three targets. Sleep hours against the target; the sleep window as bedtime and
     wake time, each on time or not (of 2); self-care as every activity done, wind-down included for now */
  /* the sleep window in words: on time, or how far off (the later of bedtime and wake), the plan under it */
  function windowTile() {
    var on = M.logged(), plan = "Plan " + M.niceS(P.bed).replace(":00", "") + "<br>to " + M.niceS(P.wake).replace(":00", "");
    if (!on) return { v: "Not logged", of: plan, pct: 0 };
    var db = S.bed - M.bedM(P.bed), dw = S.wake - M.wakeM(P.wake), off = Math.abs(db) >= Math.abs(dw) ? db : dw;
    var gap = function (m) { m = Math.round(Math.abs(m)); var h = Math.floor(m / 60), x = m % 60; return h ? h + "h" + (x ? " " + x + "m" : "") : x + " min"; };
    return { v: Math.abs(off) <= P.tol ? "On time" : gap(off) + (off > 0 ? " late" : " early"), of: plan, pct: parts().window };
  }
  var selfT = function () { return P.wd.length + P.br.length + (P.me.length ? 1 : 0) + (S.vmSlots || 1); };
  /* before a plan there are no targets, so no tiles (hidden below); the array stays valid for anything that reads it */
  function bedTile() { return M.logged() ? { v: M.nice(S.bed), of: "last night", pct: 0 } : { v: "Not logged", of: "last night", pct: 0 }; }
  if (M.noplan) {
    window.MOVEPART.splice(0, 3, { cls: "glyph-sleep", name: "Sleep hours", T: 0, unit: " h" }, { cls: "glyph-clock", name: "Went to bed", T: 0, unit: "", txt: bedTile });
    /* before a plan the tiles stand down: the night card already says what last night was */
    var g2 = document.createElement("style"); g2.textContent = "#railSect{display:none !important}"; document.head.appendChild(g2);
  } else window.MOVEPART.splice(0, 3,   /* in place: the screen's rail already holds this array */
    { cls: "glyph-sleep", name: "Sleep hours", T: P.hours, unit: " h" },
    { cls: "glyph-clock", name: "Sleep window", T: 2, unit: "", txt: windowTile },
    { cls: "glyph-care", name: "Self-care", T: selfT(), unit: "" });
  function live() { var r = parts().raw; return [Math.round(r.slept * 10) / 10, r.ontime, r.self]; }
  window.MV = function (i) { return live()[i]; };
  /* the Rhythm sheet: built before this file runs, so its score and three tiles are filled in each time it opens, from the same live numbers */
  window.MVSHEET = function (sheet) {
    var b = sheet.querySelector(".ebub b"), sc = score();
    if (b && sc != null) b.innerHTML = Math.round(sc) + "<sup>%</sup>";
    var ch = sheet.querySelector(".echips"); if (!ch) return;
    ch.innerHTML = window.MOVEPART.map(function (n, i) {
      var t = n.txt ? n.txt() : null, v = live()[i];
      return '<div><span class="top"><span class="' + n.cls + ' eglyph"></span>' + n.name + "</span>" +
        (t ? "<b>" + t.v + "<small>" + t.of.replace("<br>", " ") + "</small></b>" : "<b>" + v + "<small> of " + n.T + n.unit + "</small></b>") + "</div>";
    }).join("");
  };

  /* before a plan there is no score: the hero keeps its padlock and nothing is set */
  var last = M.noplan ? null : score() || 0, said = false;
  (function first(tries) {
    if (M.noplan) { if (window.paintMacros) tiles(); else if (tries < 50) setTimeout(function () { first(tries + 1); }, 100); return; }   /* the two tiles, painted once the rail can be */
    if (window.setHeroScore && last != null) { window.setHeroScore(last); return; }
    if (tries < 50) setTimeout(function () { first(tries + 1); }, 100);
  })(0);

  /* the line under the score: a nudge before anything, then the gain and where it came from */
  /* the line waits for something to say; before a plan the unlock line is already there (SAY_LOCK), so it stays */
  if (!M.noplan) { var hide = document.createElement("style"); hide.textContent = "#cm:not(.said){display:none}"; document.head.appendChild(hide); }
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
    var n = score();
    tiles();   /* before a plan the tiles still follow what is logged; there is just no score */
    if (n == null) return;
    var d = n - last; if (!d) return;
    last = n;
    if (window.S && window.S.hero) window.S.hero.score = n;
    if (window.setHeroScore) window.setHeroScore(n, d > 0 ? d : 0);   /* no step down and no minus on the score */
    clearTimeout(t); t = setTimeout(function () { say(d, n); if (window.MVMEDAL) window.MVMEDAL(); }, 2400);
  }
  function tiles() {
    if (!window.paintMacros) return;
    if (!M.noplan) { window.MOVEPART[0].T = P.hours; window.MOVEPART[2].T = selfT(); }
    window.paintMacros(null, "");
  }
  window.MDRHYTHM = { score: score, parts: parts, update: update };
  /* the screen's date sheet and medal read today's score from Move's object; Mind answers for it */
  window.MVMOM = { score: score, gain: function () { return 0; }, logged: function () {} };
  setTimeout(tiles, 300);
})();
