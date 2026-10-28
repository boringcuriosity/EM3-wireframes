/* Move: the Momentum score, worked out from the plan cards with the weights chosen in move/sandbox-weights.html (Even):
     Exercise    = 45 x min(1, kcal burned / kcal planned)    coach's exercises done + workouts logged by search
     Steps       = 25 x min(1, steps walked / steps target)
     Small moves = 15 x ticked / planned
     Spread      = 15 x parts of the day moved in / 4          an exercise done, a workout logged, or a small move ticked
   On load it sets the score. After any change the score steps to its new value with its "+N" pulse, the line under it
   says what changed, and a workout log earns the FlipCoin toast, as a meal log does on Eat.
   ponytail: one plan for every day the switcher shows, as plan.js; per-day scores come with real data */
(function () {
  var P = window.MVPLAN; if (!P) return;
  var S = P.S, EX = P.EX, RT = P.RT, NOW = +new URLSearchParams(location.search).get("now") || 15;
  var GOAL = (window.MOVEPART && window.MOVEPART[2].T) || 10000;
  /* the weights, in one place; say-kaira.js reads them too */
  var W = window.MVW = { E: 45, S: 25, N: 15, SP: 15, PARTS: 4 };
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
    var mv = RT.map(function (rt, r) { return moved(r); });
    /* each thing that counts, by name, so KAIRA can say what a gain came from (say-kaira.js) */
    var items = [];
    RT.forEach(function (rt, r) {
      rt.ex.forEach(function (id) { if (S.done[r][id]) items.push({ k: "e" + r + id, n: EX[id].name, r: r, kcal: EX[id].kcal }); });
      S.extra[r].forEach(function (x, i) { items.push({ k: "x" + r + i + x.name, n: x.name + ", " + x.min + " min", r: r, kcal: x.kcal }); });
      rt.tips.forEach(function (t, i) { if (S.tips[r][i]) items.push({ k: "t" + r + i, n: t.t, r: r, tip: true }); });
    });
    for (var h = 0; h <= NOW; h++) st += S.steps[h] || 0;
    return { e: W.E * Math.min(1, K ? k / K : 0), s: W.S * Math.min(1, st / GOAL), n: M ? W.N * m / M : 0, sp: W.SP * Math.min(on, W.PARTS) / W.PARTS, mv: mv, items: items, raw: [[k, K], [m, M], [st, GOAL]] };
  }
  function score() { var p = parts(); return Math.round(p.e + p.s + p.n + p.sp); }

  /* before a plan there is no score: the hero keeps its padlock, nothing is said under it, and a log gains nothing to show */
  if (P.noplan) { window.MVMOM = { score: function () { return null; }, gain: function () { return null; }, logged: function () {} }; return; }
  var last = score(), lastP = parts(), coin = false, coinWas = false;
  /* the line's link, as Eat's: tapping it asks KAIRA, with an answer built for this moment (say-kaira.js) */
  var CTA = "Learn more", K = window.MVKAIRA;
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
  function say(d, a, b) {
    if (!window.GFSay || !window.GFSay.show) return;
    var cm = document.getElementById("cm"); if (!cm) return;
    if (d <= 0) return intro();   /* no minus: back to the nudge */
    cm.classList.add("said");
    /* crossing 80% (the medal) and reaching 100% get their own warmth, the gain still in its capsule */
    var n = last, was = n - d;
    /* a few fixed sentences cover every case (v7/momentum-commentary.html): the effort first, then one easy next step */
    var KEEP = "Keep logging your movement to see your score grow.", plan = b.raw[0][1], beyond = b.raw[0][0] > plan, logged = coinWas;
    var line = n >= 100 && was < 100 ? { lead: "You reached 100% Momentum!", rest: "You moved well all through the day.", delta: "" }
      : n >= 80 && was < 80 ? { lead: "You’ve earned today’s medal!", rest: "Your Momentum went up by " + d + "%. Well done." }
      : was >= 80 ? { lead: "Your Momentum went up by " + d + "%.", rest: "You’re having a great day, keep it going." }
      /* the whole workout in one go, from little or none of it */
      : logged && beyond && a.raw[0][0] < plan / 2 ? { lead: "Great workout! Your Momentum is up " + d + "%.", rest: "Spreading your movement through the day keeps you healthy and strong." }
      /* more than the coach planned: the effort counts, spreading it through the day grows Momentum */
      : logged && beyond ? { lead: "Great effort! Your Momentum is up " + d + "%.", rest: "Spreading your workout through the day keeps it growing." }
      : !a.items.length && b.items.length ? { lead: "Nice start! Your Momentum is up " + d + "%.", rest: KEEP }
      : b.items.length === a.items.length && b.raw[2][0] > a.raw[2][0] ? { lead: "Your steps added " + d + "%.", rest: "Every step you take is moving you forward." }
      : { lead: "Your Momentum went up by " + d + "%.", rest: "Every move you log keeps your score growing." };
    if (line.delta === undefined) line.delta = "+" + d + "%";
    window.GFSay.show({ lead: line.lead, rest: line.rest, delta: line.delta, tone: "up", cta: CTA, ask: K && K.after(a, b, d) });
  }
  /* on arrival, before anything changes: a nudge to log, as Eat's not-started line ("Log your first meal…").
     It names the next thing to do, never recaps the day; a gain replaces it */
  function intro() {
    var cm = document.getElementById("cm");
    if (!cm || !window.GFSay || !window.GFSay.show) return;
    cm.classList.add("said");
    /* a nudge alone, as Eat's not-started line: KAIRA is asked only about a gain */
    window.GFSay.show(last > 0
      ? { lead: "Keep moving through the day to grow your Momentum.", rest: "", delta: "", tone: "calm" }
      : { lead: "As your day starts fresh, log every move to keep your Momentum growing.", rest: "", delta: "", tone: "calm" });
  }
  function full() {
    var cm = document.getElementById("cm"); if (!cm || !window.GFSay || !window.GFSay.show) return;
    cm.classList.add("said");
    window.GFSay.show({ lead: "Great effort, you’ve finished your coach’s workout today!", rest: "Spreading your workout through the day keeps your Momentum growing.", delta: "", tone: "calm", cta: CTA });
  }
  (function wait(n) { if (document.getElementById("cm")) intro(); else if (n < 40) setTimeout(function () { wait(n + 1); }, 100); })(0);
  function update() {
    var n = score(), d = n - last;
    /* a workout logged that adds nothing: the workout was already full, so say where more would come from */
    if (!d) { if (coin) full(); coin = false; return; }
    var a = lastP, b = parts(); last = n; lastP = b; if (window.S && window.S.hero) window.S.hero.score = n;
    if (window.setHeroScore) window.setHeroScore(n, d > 0 ? d : 0);   /* no step down and no minus on the score */
    /* the line under the score waits for the number to finish stepping, so the gain is read after it is seen:
       Cloud Drop remounts 420 ms after the change and steps over the next 1.9 s */
    /* the medal swings in (or goes, under 80) at the same moment, once the new number has landed */
    var wasLog = coin; clearTimeout(update.t); update.t = setTimeout(function () { coinWas = wasLog; say(d, a, b); if (window.MVMEDAL) window.MVMEDAL(); }, 2400);
    /* a workout log earns coins: the toast shows the moment the log lands */
    if (coin && d > 0 && window.GFFlipcoin) window.GFFlipcoin.show();
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
    parts: parts,
    /* what a change would add, without making it: apply, measure, undo */
    gain: function (apply, undo) { var a = score(); apply(); var b = score(); undo(); return b - a; },
    /* the next change came from logging a workout, so it earns the coin toast */
    logged: function () { coin = true; }
  };
})();
