/* Move: park the screen in one case from the URL, for the every-case document (/move/momentum-cases.html).
     ?day=  a whole day, set before the score is first worked out, so the number opens on it
     ?now=  the clock's hour (plan.js and momentum.js read it too), so a finished day has no hours still to come
     ?act=  something done once the screen has settled: a sheet opened, a tick, a log, the player
   Loaded after plan.js and before momentum.js. */
(function () {
  var Q = new URLSearchParams(location.search), P = window.MVPLAN; if (!P) return;
  var S = P.S, RT = P.RT, NOW = +Q.get("now") || 15;
  /* the shape of a normal day's steps, hour by hour from 6 AM; a total is spread along it up to the clock */
  var SHAPE = { 6: 2, 7: 9, 8: 12, 9: 4, 10: 3, 11: 3, 12: 5, 13: 7, 14: 3, 15: 3, 16: 3, 17: 6, 18: 8, 19: 9, 20: 6, 21: 4, 22: 2 };
  function steps(total) {
    var w = 0, h, out = {};
    for (h = 6; h <= NOW; h++) w += SHAPE[h] || 0;
    for (h = 6; h <= NOW; h++) { out[h] = w ? Math.round(total * (SHAPE[h] || 0) / w) : 0; total -= out[h]; w -= SHAPE[h] || 0; }
    return out;
  }
  function did(r, ids, at) { ids.forEach(function (id) { S.done[r][id] = "Done"; S.at[r][id] = at; }); }
  function tick(r, n) { for (var i = 0; i < n; i++) S.tips[r][i] = true; }
  function all() { did(0, RT[0].ex, "07:10"); did(2, RT[2].ex, "18:10"); RT.forEach(function (rt, r) { tick(r, rt.tips.length); }); }
  var W = { walk: ["Walking", "directions_walk"], gym: ["Strength training", "fitness_center"], run: ["Running", "directions_run"], bad: ["Badminton", "sports_tennis"] };
  /* kcal as log.js counts it: MET × 3.5 × 70 kg ÷ 200 × minutes */
  function extra(r, w, met, min, at) { S.extra[r].push({ name: W[w][0], ic: W[w][1], min: min, kcal: Math.round(met * 3.5 * 70 / 200 * min), at: at }); }

  var DAYS = {
    zero: function () { S.steps = {}; },
    start: function () { S.steps = steps(0); },   /* nothing yet, not even steps, so the score reads 0 */
    first: function () { did(0, ["box"], "07:10"); S.steps = steps(1500); },
    plan: function () { all(); S.steps = steps(10400); },
    walk: function () { all(); extra(3, "walk", 3.5, 20, "20:40"); S.steps = steps(10800); },
    extra: function () { all(); extra(3, "bad", 5.5, 45, "20:30"); S.steps = steps(12000); },
    half: function () { did(0, ["box", "plank", "spot"], "07:10"); did(2, ["plank"], "18:10"); tick(0, 1); tick(2, 1); S.steps = steps(7500); },
    morning: function () { did(0, RT[0].ex, "07:10"); tick(0, 2); S.steps = steps(7000); },
    gym: function () { extra(2, "gym", 5, 60, "18:30"); S.steps = steps(5500); },
    swap: function () { extra(0, "run", 9.8, 30, "07:00"); did(2, RT[2].ex, "18:10"); tick(0, 1); tick(2, 1); S.steps = steps(11000); },
    active: function () { RT.forEach(function (rt, r) { tick(r, rt.tips.length); }); S.steps = steps(9700); },
    sick: function () { S.steps = steps(1400); },
    /* the default afternoon, plus a walk before 6 AM: it counts, in the chart and the total */
    early: function () { did(0, ["box", "plank"], "07:10"); tick(0, 1); S.steps = steps(5080); S.steps[5] = 1900; },
    /* everything but the afternoon's one small move: 78, so ?act=cross ticks it and the day crosses 80 */
    nearly: function () { all(); S.tips[1] = []; S.steps = steps(10400); },
    /* the commentary doc (v7/momentum-commentary.html): a big morning, a small move in the afternoon, the step goal reached */
    over: function () { did(0, RT[0].ex, "07:10"); extra(0, "walk", 3.5, 15, "07:40"); tick(0, 1); S.steps = steps(5200); },
    tick: function () { did(0, ["box", "plank"], "07:10"); tick(0, 1); tick(1, 1); S.steps = steps(5080); },
    goal: function () { did(0, ["box", "plank", "spot"], "07:10"); tick(0, 2); tick(1, 1); S.steps = steps(10100); },
    medal: function () { did(0, ["box", "plank", "spot"], "07:10"); tick(0, 2); tick(1, 1); did(2, ["plank"], "18:10"); S.steps = steps(10100); }
  };
  var day = Q.get("day");
  if (DAYS[day]) {
    S.done = [{}, {}, {}, {}]; S.at = [{}, {}, {}, {}]; S.tips = [[], [], [], []]; S.extra = [[], [], [], []];
    DAYS[day](); P.render();
  }

  var $ = function (s) { return document.querySelector(s); };
  var click = function (s) { var b = $(s); if (b) b.click(); return b; };
  var later = function (ms, f) { setTimeout(f, ms); };
  function type(v) { var q = $("#mvlQ"); q.value = v; q.dispatchEvent(new Event("input", { bubbles: true })); }
  /* scrolls this page only: scrollIntoView would also scroll the document the phone sits in */
  function scrollTo(s) { var e = $(s); if (e) window.scrollTo(0, e.getBoundingClientRect().top + scrollY - innerHeight / 2); }
  var ACTS = {
    info: function () { window.openMomentum && window.openMomentum(); },
    /* the line's KAIRA link, tapped: on its own it asks before anything changes; with &ask=1 another act runs first */
    kaira: function () { click("#cm .cta"); },
    earn: function () { click(".earnchip"); },
    burn: function () { click('[data-burn="0"]'); },
    bar: function () { scrollTo(".mv-b.now"); click('.mv-b[data-sel="8"]'); },
    steps: function () { click(".mv-logbtn"); },
    /* two of the morning's workouts ticked: they drop into the bar, waiting to be logged */
    tray: function () { scrollTo('[data-tick="0|spot"]'); click('[data-tick="0|spot"]'); later(300, function () { click('[data-tick="0|coastal"]'); }); },
    review: function () { ACTS.tray(); later(900, function () { click('[data-mt="review"]'); }); },
    future: function () { scrollTo('[data-tick="2|plank"]'); click('[data-tick="2|plank"]'); later(700, function () { click('[data-mt="review"]'); }); },
    log: function () { ACTS.tray(); later(1200, function () { click('[data-mt="log"]'); }); },
    edit: function () { scrollTo('[data-tick="0|box"]'); click('[data-tick="0|box"]'); },
    /* the tick and the undo stay at the top, so the score and the line under it are what the phone shows */
    tip: function () { click('[data-tip="0|1"]'); },
    untip: function () { scrollTo('[data-tip="0|0"]'); click('[data-tip="0|0"]'); },
    /* ticked off screen, so the phone keeps the score and the medal in view */
    cross: function () { click('[data-tip="1|0"]'); },
    drop: function () { click('[data-tip="0|0"]'); later(700, function () { click('[data-mt="undo"]'); }); },
    player: function () { window.MVPLAYER.open(0, "box"); },
    side: function () { ACTS.player(); later(900, function () { click('[data-a="side"]'); }); },
    portrait: function () { ACTS.player(); later(900, function () { click('[data-a="portrait"]'); }); },
    /* a move with steps to read, scrolled, so the Up next bar has text passing under it (v7/move-upnext-options.html) */
    reading: function () { window.MVPLAYER.open(0, "plank"); later(900, function () { click('[data-a="portrait"]'); later(500, function () { var sc = $(".mvp-scroll"); if (sc) sc.scrollTop = 150; }); }); },
    last: function () { window.MVPLAYER.open(2, "plank"); later(900, function () { click('[data-a="portrait"]'); }); },
    ended: function () { window.MVPLAYER.open(2, "plank"); later(1200, function () { var v = $(".mvp video, video"); if (v) { v.pause(); v.dispatchEvent(new Event("ended")); } }); },
    /* Apple Health not connected (?health=off): the Connect strip, the sheet, and connecting */
    healthcard: function () { scrollTo(".mv-sync"); },
    health: function () { window.openHealth(); },
    connect: function () { window.openHealth(); later(2200, function () { click('#mvHealth [data-h="go"]'); }); },
    search: function () { window.openLogWorkout(); },
    /* the two tabs (log.js): Recent comes from ?recent=, ?recent=none for its blank state */
    recenttab: function () { ACTS.search(); later(300, function () { window.MVLOG.tab("recent"); }); },
    alltab: function () { ACTS.search(); later(300, function () { window.MVLOG.tab("all"); }); },
    /* the A to Z index held on S, its letter riding beside it */
    az: function () { ACTS.alltab(); later(700, function () { var a = $("#mvlAz"); if (a) a.classList.add("held"); window.MVLOG.bubble("S"); }); },
    typing: function () { ACTS.search(); later(400, function () { type("wa"); }); },
    none: function () { ACTS.search(); later(400, function () { type("kabaddi"); }); },
    detail: function () { ACTS.search(); later(500, function () { click('.mvl-row[data-w="Walking"]'); }); },
    /* a coach exercise found by search: Burpees, its intensity wheel open (light, moderate, vigorous from the Compendium) */
    intensity: function () { ACTS.search(); later(400, function () { type("burpees"); }); later(1000, function () { click('.mvl-row[data-w="Burpees"]'); }); later(1700, function () { click('[data-d="effort"]'); }); },
    /* a walk found by search and logged, at the default ten minutes */
    walk: function () { ACTS.detail(); later(900, function () { click('[data-d="log"]'); }); }
  };
  var act = Q.get("act");
  /* after the page has loaded (the Earn chip and the hero come in on load), and the cards have settled */
  var go = function () { setTimeout(ACTS[act], +Q.get("wait") || 1200); };
  if (ACTS[act]) document.readyState === "complete" ? go() : addEventListener("load", go);
  /* &ask=1: once the act's gain has landed and the line has said it (momentum.js waits 2.4 s, the win moment longer), KAIRA is asked */
  if (Q.get("ask")) addEventListener("load", function () { setTimeout(ACTS.kaira, (+Q.get("wait") || 1200) + (+Q.get("askAt") || 4200)); });
})();
