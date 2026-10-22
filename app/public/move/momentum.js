/* Move: the Momentum score, worked out from the plan cards with the sandbox's formula (move/sandbox.html):
     Exercise    = 40 x min(1, kcal burned / kcal planned)    coach's exercises done + workouts logged by search
     Steps       = 10 x min(1, steps walked / steps target)
     Small moves = 10 x ticked / planned
     Spread      = 10 x parts of the day moved in              an exercise done, a workout logged, or a small move ticked
   On load it sets the score. After any change the score steps to its new value with its "+N" pulse, the line under it
   says what changed, and a workout log earns the FlipCoin toast, as a meal log does on Eat.
   ponytail: one plan for every day the switcher shows, as plan.js; per-day scores come with real data */
(function () {
  var P = window.MVPLAN; if (!P) return;
  var S = P.S, EX = P.EX, RT = P.RT, NOW = +new URLSearchParams(location.search).get("now") || 15;
  var GOAL = (window.MOVEPART && window.MOVEPART[2].T) || 10000;
  var sum = function (a, f) { return a.reduce(function (n, x) { return n + f(x); }, 0); };

  function moved(r) {
    return RT[r].ex.some(function (id) { return S.done[r][id]; }) || S.extra[r].length > 0 || RT[r].tips.some(function (t, i) { return S.tips[r][i]; });
  }
  function parts() {
    var K = 0, k = 0, M = 0, m = 0, on = 0, st = 0;
    RT.forEach(function (rt, r) {
      K += sum(rt.ex, function (id) { return EX[id].kcal; });
      k += sum(rt.ex, function (id) { return S.done[r][id] ? EX[id].kcal : 0; }) + sum(S.extra[r], function (x) { return x.kcal; });
      M += rt.tips.length; m += rt.tips.filter(function (t, i) { return S.tips[r][i]; }).length;
      if (moved(r)) on++;
    });
    for (var h = 0; h <= NOW; h++) st += S.steps[h] || 0;
    return { e: 40 * Math.min(1, K ? k / K : 0), s: 10 * Math.min(1, st / GOAL), n: M ? 10 * m / M : 0, sp: 10 * on, raw: [[k, K], [m, M], [st, GOAL]] };
  }
  function score() { var p = parts(); return Math.round(p.e + p.s + p.n + p.sp); }

  /* before a plan there is no score: the hero keeps its padlock, nothing is said under it, and a log gains nothing to show */
  if (P.noplan) { window.MVMOM = { score: function () { return null; }, gain: function () { return null; }, logged: function () {} }; return; }
  var last = score(), coin = false;
  window.S && window.S.hero && (window.S.hero.score = last);
  /* the hero mounts on its own clock, so the first number waits for it */
  (function first(tries) {
    if (window.setHeroScore) return window.setHeroScore(last);
    if (tries < 50) setTimeout(function () { first(tries + 1); }, 100);
  })(0);

  /* score-say.js mounts with Eat's sample line; Move has nothing to say until the score changes, so the line waits hidden */
  var hide = document.createElement("style"); hide.textContent = "#cm:not(.said){display:none}#cm:not(.said)+#railSect{margin-top:32px !important}"; document.head.appendChild(hide);
  /* Momentum never penalises: the line only ever names a gain. A score that comes down (something undone or removed)
     simply settles at its new number, and the line goes back to the nudge to log */
  function say(d) {
    if (!window.GFSay || !window.GFSay.show) return;
    var cm = document.getElementById("cm"); if (!cm) return;
    if (d <= 0) return intro();   /* no minus: back to the nudge */
    cm.classList.add("said");
    window.GFSay.show({ lead: "Your score went up by " + d + "%,", rest: "keep logging your movement.", delta: "+" + d + "%", tone: "up", cta: window.SAY_CTA });
  }
  /* on arrival, before anything changes: a nudge to log, as Eat's not-started line ("Log your first meal…").
     It names the next thing to do, never recaps the day; a gain replaces it */
  function intro() {
    var cm = document.getElementById("cm");
    if (!cm || !window.GFSay || !window.GFSay.show) return;
    cm.classList.add("said");
    window.GFSay.show(last > 0
      ? { lead: "Log your movement through the day to keep your Momentum growing.", rest: "", delta: "", tone: "calm", cta: window.SAY_CTA }
      : { lead: "Log your first workout to see your Momentum score grow.", rest: "", delta: "", tone: "calm", cta: window.SAY_CTA });
  }
  (function wait(n) { if (document.getElementById("cm")) intro(); else if (n < 40) setTimeout(function () { wait(n + 1); }, 100); })(0);
  function update() {
    var n = score(), d = n - last; if (!d) { coin = false; return; }
    last = n; if (window.S && window.S.hero) window.S.hero.score = n;
    if (window.setHeroScore) window.setHeroScore(n, d > 0 ? d : 0);   /* no step down and no minus on the score */
    /* the line under the score waits for the number to finish stepping, so the gain is read after it is seen:
       Cloud Drop remounts 420 ms after the change and steps over the next 1.9 s */
    /* the medal swings in (or goes, under 80) at the same moment, once the new number has landed */
    clearTimeout(update.t); update.t = setTimeout(function () { say(d); if (window.MVMEDAL) window.MVMEDAL(); }, 2400);
    /* a workout log earns coins, once the line has landed */
    if (coin && d > 0 && window.GFFlipcoin) setTimeout(window.GFFlipcoin.show, 3200);
    coin = false;
  }
  /* every change to the cards ends in plan.js calling paintMacros, so the score follows from there */
  var pm = window.paintMacros;
  window.paintMacros = function () { if (pm) pm.apply(this, arguments); update(); };

  /* the Momentum sheet is built once from the page's staged state; each time it opens it takes today's real numbers */
  window.MVSHEET = function (sheet) {
    var b = sheet.querySelector(".ebub b"), tiles = sheet.querySelectorAll(".echips > div > b"), unit = [" kcal", "", " steps"];
    if (b) b.innerHTML = score() + "<sup>%</sup>";
    parts().raw.forEach(function (v, i) {
      if (tiles[i]) tiles[i].innerHTML = v[0].toLocaleString("en-IN") + "<small> of " + v[1].toLocaleString("en-IN") + unit[i] + "</small>";
    });
  };
  /* ?sheet=info opens it before this file has loaded */
  var es = document.getElementById("es-suff"); if (es && es.classList.contains("on")) window.MVSHEET(es);
  window.MVMOM = {
    score: score,
    /* what a change would add, without making it: apply, measure, undo */
    gain: function (apply, undo) { var a = score(); apply(); var b = score(); undo(); return b - a; },
    /* the next change came from logging a workout, so it earns the coin toast */
    logged: function () { coin = true; }
  };
})();
