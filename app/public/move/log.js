/* Move: Log your exercise. Opens from "Log workout" on the action card and from "Search and log exercise"
   on a routine card. Figma: GoodFlip ring designs, 11664:12610, with a tinted icon on each row and a live search.
   Picking a workout opens its own screen: how long (a wheel), how hard, when, then Log exercise. It counts in kcal,
   the unit the coach's workouts count in, so both add to the same Momentum, in the part of the day its time falls in. */
(function () {
  var A = "/v7/icons/move/log/";
  /* name, icon, MET (Compendium of Physical Activities). Icons are Material Symbols (rounded, filled); where Material has
     no glyph for the sport, Material Design Icons (mdi-*, the same 24 grid, filled) or game-icons (frisbee, water polo, rock climbing) */
  var W = [
    ["Walking", "directions_walk", 3.5], ["Running", "directions_run", 9.8], ["Swimming", "pool", 7],
    ["Strength Training", "fitness_center", 5], ["Cycling", "directions_bike", 7.5], ["Yoga", "self_improvement", 2.5],
    ["Pilates", "mdi-yoga", 3], ["Rock Climbing", "game-icons-mountain-climbing", 8], ["Martial Arts", "sports_martial_arts", 10],
    ["Dance", "mdi-human-female-dance", 5], ["Hiking", "hiking", 6], ["CrossFit", "exercise", 8], ["Kickboxing", "sports_mma", 9],
    ["Badminton", "mdi-badminton", 5.5], ["Cricket", "sports_cricket", 4.8], ["Football", "sports_soccer", 7],
    ["Surfing", "surfing", 3], ["Rowing", "rowing", 7],
    /* the rest of the live app's Select Exercise list (app.goodflip.in/exercise, Add), A to Z. Left out: what is not a
       workout (Elevator, Escalator, In vehicle, Still, Unknown, Other, Snowmobile, Meditation) and what is already above
       under another name (Biking, Dancing, Crossfit, Football (Soccer), Strength training) */
    ["Aerobics", "sports_gymnastics", 7.3], ["Archery", "mdi-bow-arrow", 4.3], ["Backcountry Skiing", "downhill_skiing", 9], ["Baseball", "sports_baseball", 5],
    ["Basketball", "sports_basketball", 6.5], ["Beach Volleyball", "sports_volleyball", 8], ["Biathlon", "mdi-biathlon", 9], ["Boxing", "mdi-boxing-glove", 7.8],
    ["Calisthenics", "sports_gymnastics", 3.8], ["Circuit Training", "fitness_center", 8], ["Cross Skating", "roller_skating", 7], ["Cross-country Skiing", "mdi-ski-cross-country", 9],
    ["Curling", "mdi-curling", 4], ["Diving", "mdi-diving", 3], ["Downhill Skiing", "downhill_skiing", 5.3], ["Elliptical", "exercise", 5], ["Ergometer", "directions_bike", 7],
    ["Fencing", "mdi-fencing", 6], ["Fitness Walking", "directions_walk", 4.3], ["Football (American)", "sports_football", 8], ["Football (Australian)", "mdi-football-australian", 8],
    ["Frisbee", "game-icons-frisbee", 3], ["Gardening", "yard", 3.8], ["Golf", "sports_golf", 4.8], ["Gymnastics", "sports_gymnastics", 3.8], ["Handball", "sports_handball", 8],
    ["Handbiking", "accessible_forward", 6], ["HIIT", "sprint", 8], ["Hockey", "sports_hockey", 8], ["Horseback Riding", "mdi-horse-human", 5.5], ["Housework", "cleaning_services", 3.3],
    ["Ice Skating", "ice_skating", 7], ["Indoor Skating", "roller_skating", 7], ["Indoor Volleyball", "sports_volleyball", 4], ["Inline Skating", "roller_skating", 7.5],
    ["Interval Training", "timer", 8], ["Jogging", "directions_run", 7], ["Jump Rope", "mdi-jump-rope", 11], ["Kayaking", "kayaking", 5], ["Kettlebell", "mdi-kettlebell", 6],
    ["Kite Skiing", "kitesurfing", 7], ["Kitesurfing", "kitesurfing", 7], ["Mixed Martial Arts", "sports_mma", 10], ["Mountain Biking", "pedal_bike", 8.5],
    ["Nordic Walking", "nordic_walking", 4.8], ["Open Water Swimming", "waves", 7], ["P90X", "fitness_center", 8], ["Paragliding", "paragliding", 3.5], ["Polo", "mdi-polo", 8],
    ["Pool Swimming", "pool", 7], ["Racquetball", "mdi-racquetball", 7], ["Road Biking", "directions_bike", 8], ["Roller Skiing", "downhill_skiing", 9], ["Rowing Machine", "rowing", 6],
    ["Rugby", "sports_rugby", 8.3], ["Running (Treadmill)", "directions_run", 9], ["Running on Sand", "directions_run", 10], ["Sailing", "sailing", 3],
    ["Scuba Diving", "scuba_diving", 7], ["Skateboarding", "skateboarding", 5], ["Skating", "roller_skating", 7], ["Skiing", "downhill_skiing", 7], ["Sledding", "sledding", 7],
    ["Snowboarding", "snowboarding", 5.3], ["Snowshoeing", "snowshoeing", 5.3], ["Softball", "sports_baseball", 5], ["Spinning", "directions_bike", 8.5],
    ["Squash", "mdi-racquetball", 7.3], ["Stair Climbing", "stairs", 8], ["Stair Climbing Machine", "stairs", 9], ["Stand-up Paddle Boarding", "surfing", 6],
    ["Stationary Biking", "directions_bike", 7], ["Walking with a Stroller", "stroller", 4], ["Table Tennis", "mdi-table-tennis", 4], ["Team Sports", "groups", 6],
    ["Tennis", "sports_tennis", 7.3], ["Treadmill Walking", "directions_walk", 4.3], ["Utility Biking", "directions_bike", 4], ["Volleyball", "sports_volleyball", 4],
    ["Wakeboarding", "mdi-ski-water", 6], ["Water Polo", "game-icons-water-polo", 10], ["Weightlifting", "mdi-weight-lifter", 6], ["Wheelchair", "accessible_forward", 3],
    ["Windsurfing", "kitesurfing", 5], ["Zumba", "mdi-human-female-dance", 6.5]
  ];
  /* kcal = MET x 3.5 x kg / 200 per minute. ponytail: 65 kg until the profile's weight is wired in */
  var KG = 65, burn = function (w, min) { return Math.round(w[2] * 3.5 * KG / 200 * min); };
  var esc = function (s) { return s.replace(/[&<>"]/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); };

  var V1 = new URLSearchParams(location.search).get("logv") === "1";
  /* All workouts, A to Z, in letter groups; the letters with none are dimmed on the index */
  var SORTED = W.slice().sort(function (a, b) { return a[0].localeCompare(b[0]); });
  var AZ = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), HAS = {};
  SORTED.forEach(function (w) { HAS[w[0][0].toUpperCase()] = 1; });
  var TICO = {
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h11M9 12h11M9 18h11"/><path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01" stroke-width="2.6"/></svg>'
  };
  /* Recent: the workouts logged before, newest first, each with how long it was last time. Kept on the phone.
     ?recent=Walking:30:0|Yoga:20:2 (name:minutes:days ago) sets it for the case document, ?recent=none empties it */
  var RKEY = "mvRecentWorkouts";
  function recent() {
    var q = new URLSearchParams(location.search).get("recent");
    if (q === "none") return [];
    if (q) return q.split("|").map(function (x) { var p = x.split(":"); return { n: p[0], min: +p[1] || 10, ago: +p[2] || 0 }; });
    try { return (JSON.parse(localStorage.getItem(RKEY)) || []).map(function (x) { return { n: x.n, min: x.min, ago: Math.round((Date.now() - x.t) / 864e5) }; }); } catch (e) { return []; }
  }
  function remember(n, min) {
    try { var a = (JSON.parse(localStorage.getItem(RKEY)) || []).filter(function (x) { return x.n !== n; }); a.unshift({ n: n, min: min, t: Date.now() }); localStorage.setItem(RKEY, JSON.stringify(a.slice(0, 8))); } catch (e) {}
  }
  var byName = function (n) { return W.filter(function (w) { return w[0] === n; })[0]; };

  var el = document.createElement("div");
  el.className = V1 ? "mvl" : "mvl v2";
  el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-labelledby", "mvlT");
  el.innerHTML =
    /* the header and search bar are Eat's food log's: an arrow, the title and the day centred, then the search card */
    (V1 ? '<div class="mvl-glow" aria-hidden="true"></div><div class="mvl-top"><button class="mvl-back" id="mvlBack"><img src="' + A + 'back.svg" alt="">Back</button></div>' +
      '<div class="mvl-scroll"><h3 id="mvlT">Log Your Exercise</h3>'
    : '<div class="mvl-hd"><button class="mvl-bk" id="mvlBack" aria-label="Back"><svg viewBox="0 0 22 22" fill="none" aria-hidden="true"><path fill="currentColor" d="M9.409 3.444c-.015-.015-.473-.13-1.018-.255s-.997-.208-1.004-.185-.064.401-.125.84c-.124.882-.424 1.911-.744 2.555-1 2.006-2.791 3.334-4.964 3.68L1 10.165v1.773l.502.084c3.286.551 5.429 3.008 5.83 6.686.026.24.057.436.069.436.11 0 1.947-.443 1.982-.478.025-.025.006-.25-.042-.5-.531-2.765-2.053-5.015-4.027-5.955l-.474-.226 9.74-.018 6.16-.01v-1.794l-6.176-.011-9.717-.018.598-.303c1.552-.786 2.78-2.328 3.503-4.397.206-.59.517-1.934.46-1.99"/></svg></button>' +
      '<span class="t"><b id="mvlT">Log your workout</b><span>Today</span></span>' +
      /* the search bar, once scrolled away, waits here as a bare glyph, as on Eat */
      '<button class="mvl-hf" id="mvlHf" aria-label="Search" tabindex="-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></button></div><div class="mvl-scroll">') +
      '<label class="mvl-search"><svg class="mg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>' +
        '<input id="mvlQ" type="search" placeholder="' + (V1 ? "Search by exercise name" : "Search &amp; log your workout") + '" autocomplete="off" aria-label="Search and log your workout">' +
      '<button class="mvl-clr" id="mvlClr" type="button" aria-label="Clear search"><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7"/></svg></button></label>' +
      /* two tabs, as Eat's food log: what you log often, and every workout A to Z (the earlier single list: ?logv=1) */
      (V1 ? "" : '<div class="mvl-tabs" id="mvlTabs" role="tablist"><button class="mvl-tab" role="tab" data-t="recent">' + TICO.clock + '<span>Recent</span></button>' +
        '<button class="mvl-tab" role="tab" data-t="all">' + TICO.list + '<span>All workouts</span></button><span class="mvl-ind" aria-hidden="true"></span></div>' +
        '<div class="mvl-panes"><div class="mvl-pane" id="mvlRecent" data-t="recent"></div><div class="mvl-pane" id="mvlAll" data-t="all"></div></div>') +
      '<div class="mvl-lab" id="mvlLab">All Workouts</div><div class="mvl-list" id="mvlList"></div></div>' +
    (V1 ? "" : '<div class="mvl-az" id="mvlAz" aria-label="Jump to a letter">' + AZ.map(function (l) { return '<span data-l="' + l + '"' + (HAS[l] ? "" : ' class="off"') + '>' + l + '</span>'; }).join("") + '</div>' +
      '<div class="mvl-bub" id="mvlBub" aria-hidden="true"></div>');
  var bar = document.querySelector(".gf-status"); if (bar) el.insertBefore(bar.cloneNode(true), el.firstChild);
  (document.getElementById("col") || document.body).appendChild(el);
  var Qi = el.querySelector("#mvlQ"), list = el.querySelector("#mvlList"), lab = el.querySelector("#mvlLab");

  function wrow(w, i, q, sub) {
    var n = esc(w[0]), k = q ? w[0].toLowerCase().indexOf(q) : -1;
    if (k > -1) n = esc(w[0].slice(0, k)) + "<mark>" + esc(w[0].slice(k, k + q.length)) + "</mark>" + esc(w[0].slice(k + q.length));
    return '<button class="mvl-row" style="--i:' + Math.min(i, 12) + ";--src:url(" + A + w[1] + '.svg)" data-w="' + esc(w[0]) + '"' + (sub ? ' data-min="' + sub.min + '"' : "") + '>' +
      '<span class="ic"><i></i></span><span class="nm">' + n + "" + '</span>' +
      '<img src="' + A + 'chevron.svg" alt=""></button>';
  }
  var TAB = "all";
  function draw(q) {
    q = (q || "").trim().toLowerCase();
    var hits = W.filter(function (w) { return !q || w[0].toLowerCase().indexOf(q) > -1; });
    el.querySelector(".mvl-search").classList.toggle("has", !!q);
    el.classList.toggle("q", !!q);
    lab.textContent = q ? (hits.length ? hits.length + (hits.length > 1 ? " workouts" : " workout") : "") : "All Workouts";
    lab.hidden = !lab.textContent;   /* nothing found: the message below says so, no label above it */
    if (!V1 && !q) { list.innerHTML = ""; lab.hidden = true; return panes(); }
    list.innerHTML = hits.length ? hits.map(function (w, i) { return wrow(w, i, q); }).join("")
      : '<div class="mvl-none"><b>We could not find "' + esc(Qi.value.trim()) + '" in our list</b>Check the spelling and try again, or search with a different word.</div>';
  }
  /* the two tabs' contents: Recent, or its blank state; every workout under its letter */
  function panes() {
    var R = recent().filter(function (x) { return byName(x.n); }), i = 0;
    el.querySelector("#mvlRecent").innerHTML = R.length ? R.map(function (x, j) { return wrow(byName(x.n), j, "", x); }).join("")
      /* nothing logged yet: Move's own pictogram in its pool of light, one line, and the house primary, as Eat's first open */
      : '<div class="mvl-blank"><span class="art"><img src="/move/movement.png" alt=""></span>' +
        '<p>Start with whatever you did last. No judgement, ever.</p><button class="mvl-go" data-go="find">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>Find your workout</button></div>';
    el.querySelector("#mvlAll").innerHTML = AZ.filter(function (l) { return HAS[l]; }).map(function (l) {
      return '<section class="mvl-sec" data-l="' + l + '"><h4 class="mvl-l">' + l + '</h4>' +
        SORTED.filter(function (w) { return w[0][0].toUpperCase() === l; }).map(function (w) { return wrow(w, i++, ""); }).join("") + '</section>';
    }).join("");
    tab(TAB, true);
  }
  /* the indicator travels between the tabs; the panes slide toward the side their tab sits on */
  function tab(t, still) {
    if (V1) return;
    TAB = t;
    [].forEach.call(el.querySelectorAll(".mvl-tab"), function (b) { var on = b.dataset.t === t; b.classList.toggle("on", on); b.setAttribute("aria-selected", on); });
    [].forEach.call(el.querySelectorAll(".mvl-pane"), function (p) { p.classList.toggle("on", p.dataset.t === t); });
    el.classList.toggle("all", t === "all");
    var on = el.querySelector(".mvl-tab.on"), ind = el.querySelector(".mvl-ind");
    if (on && ind) {
      var w = on.firstElementChild.getBoundingClientRect().width + 6 + on.lastElementChild.offsetWidth;
      ind.style.transition = still ? "none" : ""; ind.style.width = Math.round(w) + "px";
      ind.style.transform = "translateX(" + Math.round(on.offsetLeft + (on.offsetWidth - w) / 2) + "px)";
    }
    spy();
  }

  function open() { el.classList.remove("away"); TAB = recent().length ? "recent" : "all"; Qi.value = ""; draw(""); el.querySelector(".mvl-scroll").scrollTop = 0; if (glow) glow.style.translate = ""; el.classList.remove("on"); void el.offsetWidth; el.classList.add("on"); document.documentElement.classList.add("mvl-lock"); }
  function close() { el.classList.remove("on"); Qi.blur(); document.documentElement.classList.remove("mvl-lock"); }
  window.openLogWorkout = open;

  Qi.addEventListener("input", function () { draw(Qi.value); });
  /* the glow belongs to the title, so it leaves with it rather than sitting behind the list */
  var glow = el.querySelector(".mvl-glow"), sc = el.querySelector(".mvl-scroll");
  if (glow) sc.addEventListener("scroll", function () { glow.style.translate = "0 " + -sc.scrollTop + "px"; }, { passive: true });
  /* scrolled past the search bar: it waits in the header as a glyph; a tap brings the list back to the top and the bar into focus */
  var sbar = el.querySelector(".mvl-search"), hf = el.querySelector("#mvlHf");
  if (hf) {
    sc.addEventListener("scroll", function () { el.classList.toggle("away", sc.scrollTop > sbar.offsetTop + sbar.offsetHeight - 12); }, { passive: true });
    hf.onclick = function () { sc.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); setTimeout(function () { Qi.focus(); }, 320); };
  }
  el.querySelector("#mvlClr").onclick = function () { Qi.value = ""; draw(""); Qi.focus(); };
  el.querySelector("#mvlBack").onclick = close;
  sc.addEventListener("click", function (e) {
    if (e.target.closest('[data-go="find"]')) return Qi.focus();   /* as Eat's Find your food: straight to the search */
    var t = e.target.closest(".mvl-tab, [data-go]"); if (t) return tab(t.dataset.t || t.dataset.go);
    var b = e.target.closest(".mvl-row"); if (!b) return;
    detail(byName(b.dataset.w), +b.dataset.min || 0);   /* a recent one opens at the length it was last time */
  });

  /* ---------- the A to Z index: tap a letter to glide to it, or drag along it with the letter riding beside the finger ---------- */
  var az = el.querySelector("#mvlAz"), bub = el.querySelector("#mvlBub"), cur = "";
  /* where a letter's header sits once stuck: under the search bar */
  var PADT = V1 ? 24 : 8;   /* the list's top padding (log.css) */
  /* v2: the tabs stay at the top and a letter's header stops under them; v1: under the sticky search bar */
  var stuck = function () { var s2 = el.querySelector(V1 ? ".mvl-search" : ".mvl-tabs"); return s2 ? s2.offsetHeight - PADT : 0; };
  var SMOOTH = function (smooth) { return smooth && !matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "auto"; };
  function go(l, smooth) {
    var k = AZ.indexOf(l), sec = null;
    for (; k < AZ.length && !sec; k++) sec = el.querySelector('.mvl-sec[data-l="' + AZ[k] + '"]');
    if (!sec) return;
    var y = sec.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop;   /* inside the panes, so measured on screen, not offsetTop */
    sc.scrollTo({ top: y - stuck() - PADT, behavior: SMOOTH(smooth) });
  }
  /* the letter the list is showing lights on the index */
  function spy() {
    if (!az) return;
    var top = sc.getBoundingClientRect().top + stuck() + 30, l = "";
    [].forEach.call(el.querySelectorAll(".mvl-sec"), function (x) { if (x.getBoundingClientRect().top <= top) l = x.dataset.l; });
    l = l || "A";
    if (l !== cur) { cur = l; [].forEach.call(az.children, function (x) { x.classList.toggle("on", x.dataset.l === l); }); }
  }
  if (az) {
    var raf = 0; sc.addEventListener("scroll", function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(spy); }, { passive: true });
    var drag = false, last = "";
    /* the letter nearest the finger, measured on screen */
    var at = function (y) { var best = "A", d = 1e9; [].forEach.call(az.children, function (x) { var r = x.getBoundingClientRect(); if (!r.height) return; var e = Math.abs(r.top + r.height / 2 - y); if (e < d) { d = e; best = x.dataset.l; } }); return best; };
    var show = function (l, y) {
      var r = az.getBoundingClientRect(), box = el.getBoundingClientRect();
      bub.textContent = l; var want = Math.max(r.top, Math.min(r.bottom, y)); bub.style.transition = "none"; bub.style.top = want - box.top + "px";
      /* measured, then nudged, so the drop's centre sits on the letter whatever the sheet's own offsets are */
      var got = bub.getBoundingClientRect(); bub.style.top = parseFloat(bub.style.top) + want - (got.top + got.height / 2) + "px"; void bub.offsetWidth; bub.style.transition = ""; bub.classList.add("on");
      if (l !== last) { last = l; try { navigator.vibrate && navigator.vibrate(4); } catch (x) {} }
    };
    az.addEventListener("pointerdown", function (e) { drag = true; az.setPointerCapture(e.pointerId); az.classList.add("held"); var l = at(e.clientY); show(l, e.clientY); go(l, true); e.preventDefault(); });
    az.addEventListener("pointermove", function (e) { if (!drag) return; var l = at(e.clientY); show(l, e.clientY); if (l !== cur) go(l, false); });
    var up = function () { if (!drag) return; drag = false; last = ""; az.classList.remove("held"); setTimeout(function () { bub.classList.remove("on"); }, 260); };
    az.addEventListener("pointerup", up); az.addEventListener("pointercancel", up);
  }
  window.MVLOG = { tab: tab, go: go, bubble: function (l) { var r = az.querySelector('[data-l="' + l + '"]').getBoundingClientRect(); show(l, r.top + r.height / 2); go(l, false); } };   /* the case document: straight to the letter */

  /* ---------- the workout's own screen: how long, then how hard, when and which day, then Log exercise ----------
     It slides in over the list, the way a phone pushes a screen. The duration is the hero, one wheel in 5 minute steps up to
     2 hours. Effort, time and date are quiet rows, each opening its own sheet; the button stays at the foot. */
  var FROM = -1;   /* the card it was opened from, or -1 for now */
  var NOWM = (+new URLSearchParams(location.search).get("now") || 15) * 60 + 40;   /* ponytail: the prototype's clock, 3:40 PM, or ?now= as plan.js */
  var SPANS = [[6 * 60, 12 * 60], [12 * 60, 16 * 60], [16 * 60, 20 * 60], [20 * 60, 23 * 60]];
  /* Intensity, as the live app asks it: each workout's own options, each with its MET, from the Compendium of Physical
     Activities (Ainsworth 2011). The first is the default. A workout without its own list gets light, moderate and vigorous
     around its MET. ponytail: a handful of lists by hand; the live app's full list comes from the backend */
  var INT = {
    Walking: [["General", 3.5], ["Slow, 2 mph", 2.8], ["Leisurely, 2.5 mph", 3.0], ["Moderate, 3 mph", 3.5], ["Brisk, 3.5 mph", 4.3], ["Very brisk, 4 mph", 5.0], ["Uphill, 3.5 mph", 6.0], ["Stairs up", 8.0]],
    Running: [["General", 7.0], ["4 mph (15 min mile)", 6.0], ["5 mph (12 min mile)", 8.3], ["5.2 mph (11.5 min mile)", 9.0], ["6 mph (10 min mile)", 9.8], ["6.7 mph (9 min mile)", 10.5],
      ["7 mph (8.5 min mile)", 11.0], ["7.5 mph (8 min mile)", 11.5], ["8 mph (7.5 min mile)", 11.8], ["8.6 mph (7 min mile)", 12.3], ["9 mph (6.5 min mile)", 12.8], ["10 mph (6 min mile)", 14.5],
      ["10.9 mph (5.5 min mile)", 16.0], ["Cross country", 9.0], ["On a track, team practice", 10.0], ["Stairs up", 15.0], ["Training, pushing a wheelchair", 8.0]],
    Cycling: [["General", 7.5], ["Leisure, under 10 mph", 4.0], ["Light, 10 to 12 mph", 6.8], ["Moderate, 12 to 14 mph", 8.0], ["Vigorous, 14 to 16 mph", 10.0], ["Racing, 16 to 19 mph", 12.0],
      ["Stationary, moderate", 6.8], ["Stationary, vigorous", 8.8], ["Mountain biking", 8.5]],
    Swimming: [["General, leisurely", 6.0], ["Freestyle, slow", 5.8], ["Freestyle, fast", 9.8], ["Breaststroke", 5.3], ["Backstroke", 4.8], ["Butterfly", 13.8], ["Treading water", 3.5]],
    "Strength Training": [["General", 3.5], ["Moderate effort", 5.0], ["Vigorous, heavy weights", 6.0], ["Circuit training", 8.0], ["Push-ups, sit-ups, body weight", 3.8]],
    Yoga: [["Hatha", 2.5], ["Power", 4.0], ["Surya namaskar", 3.3], ["Breathing, pranayama", 2.0]],
    Dance: [["General", 5.0], ["Aerobic, low impact", 5.0], ["Aerobic, high impact", 7.3], ["Bollywood or Zumba", 6.5], ["Slow, ballroom", 3.0]],
    Hiking: [["General", 6.0], ["Hills, light pack", 6.5], ["Hills, 10 to 20 lb pack", 7.3]],
    Badminton: [["Social, general", 5.5], ["Competitive", 7.0]],
    Football: [["Casual, general", 7.0], ["Competitive", 10.0]]
  };
  var ints = function (w) { return INT[w[0]] || [["Moderate", w[2]], ["Light", Math.round(w[2] * 7.5) / 10], ["Vigorous", Math.round(w[2] * 13) / 10]]; };
  var DUR = []; for (var q = 5; q <= 120; q += 5) DUR.push(q);
  var D = null, ROW = 44, TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
  var MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var fmtT = function (m) { var h = Math.floor(m / 60) % 24, mm = m % 60; return ((h % 12) || 12) + ":" + (mm < 10 ? "0" : "") + mm + " " + (h < 12 ? "AM" : "PM"); };
  var dayDiff = function (d) { return Math.round((TODAY - d) / 864e5); };
  var fmtD = function (d) { var n = dayDiff(d); return n === 0 ? "Today" : n === 1 ? "Yesterday" : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()] + ", " + d.getDate() + " " + MON[d.getMonth()].slice(0, 3); };
  /* a part of the day from a time: before 6 AM still counts as last night */
  var partOf = function (m) { for (var i = 0; i < 3; i++) if (m >= SPANS[i][0] && m < SPANS[i][1]) return i; return 3; };
  function defTime() {
    if (FROM < 0) return Math.floor(NOWM / 5) * 5;
    var w = SPANS[FROM]; return NOWM >= w[0] && NOWM < w[1] ? Math.floor(NOWM / 5) * 5 : Math.min(Math.floor(NOWM / 5) * 5, Math.round((w[0] + w[1]) / 2 / 5) * 5);
  }
  var kcal = function () { return Math.round(ints(D.w)[Math.max(0, D.eff)][1] * 3.5 * KG / 200 * D.min); };
  var late = function () { return dayDiff(D.date) === 0 && D.at > NOWM; };

  var dv = document.createElement("div");
  dv.className = "mvd"; dv.setAttribute("role", "dialog"); dv.setAttribute("aria-modal", "true"); dv.setAttribute("aria-labelledby", "mvdT");
  (document.getElementById("col") || document.body).appendChild(dv);
  var BAR = (document.querySelector(".gf-status") || {}).outerHTML || "";
  var CHV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';

  /* a snapping wheel column: values, the one picked */
  function col(key, vals, at, label) {
    return '<div class="wc" data-col="' + key + '" role="listbox" aria-label="' + label + '" tabindex="0">' + vals.map(function (v, k) {
      return '<div class="' + (k === at ? "on" : "") + '" data-k="' + k + '" role="option" aria-selected="' + (k === at) + '">' + v + '</div>';
    }).join("") + '</div>';
  }
  function settle(c, done) {
    var on = c.querySelector(".on"); c.scrollTop = on ? +on.dataset.k * ROW : 0;
    c.addEventListener("scroll", function () { clearTimeout(c.t); c.t = setTimeout(function () {
      var k = Math.max(0, Math.min(c.children.length - 1, Math.round(c.scrollTop / ROW)));
      [].forEach.call(c.children, function (d, j) { d.classList.toggle("on", j === k); d.setAttribute("aria-selected", j === k); });
      done(k);
    }, 70); }, { passive: true });
  }
  var rollTo = function (c, k) { c.scrollTo({ top: k * ROW, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); };

  function detail(w, min) {
    D = { w: w, min: DUR.indexOf(min) > -1 ? min : 10, eff: -1, at: defTime(), date: new Date(TODAY) };   /* intensity starts unpicked: "Select" */
    drawD();
    dv.classList.remove("on"); void dv.offsetWidth; dv.classList.add("on");
  }
  function drawD() {
    dv.innerHTML = BAR +
      '<div class="mvl-top"><button class="mvl-back" data-d="back"><img src="' + A + 'back.svg" alt="">Back</button></div>' +
      '<div class="mvd-scroll">' +
        '<div class="mvd-hd"><span class="mvd-ic"><i style="--src:url(' + A + D.w[1] + '.svg)"></i></span><h3 id="mvdT">' + esc(D.w[0]) + '</h3></div>' +
        '<p class="mvd-q">How long did you do it?</p>' +
        /* bordered, with a pointer each side at the picked row, as the live app's wheels */
        '<div class="dial"><div class="mvd-wheel"><span class="band"></span>' + col("d", DUR, DUR.indexOf(D.min), "Minutes") + '<span class="u">min</span></div></div>' +
        /* the settings card, as GoodFlip's Settings draws it (Figma, ring designs, 3900:7479): icon, label, value, chevron */
        '<div class="mvd-rows">' +
          row("effort", "row-fire", "Intensity", D.eff < 0 ? "Select" : esc(ints(D.w)[D.eff][0]), D.eff < 0 ? "opt" : "") +
          '<i class="hr"></i>' + row("time", "time", "Time", fmtT(D.at), late() ? "late" : "") +
          '<i class="hr"></i>' + row("date", "date", "Date", fmtD(D.date), "") +
        '</div>' +
        (late() ? '<p class="mvd-note">That time has not come yet today. Pick a time that has passed.</p>' : "") +
      '</div>' +
      '<div class="mvd-foot"><button class="mvd-go" data-d="log"' + (late() ? " disabled" : "") + '>' + (D.edit ? "Save changes" : "Log exercise") + '</button></div>';   /* intensity is optional: unpicked counts at the workout's general effort */
    settle(dv.querySelector('[data-col="d"]'), function (k) { D.min = DUR[k]; });
  }
  var ICO = { "row-fire": A + "row-fire.svg", time: "/v7/img/coach/icons/time-outline.svg", date: "/v7/img/coach/icons/calendar-clear-outline.svg" };
  function row(key, ic, label, val, cls) {
    return '<button class="mvd-row" data-d="' + key + '"><i class="ic" style="--src:url(' + ICO[ic] + ')"></i><span>' + label + '</span>' +
      '<b' + (cls ? ' class="' + cls + '"' : "") + '>' + val + '</b><img class="cv" src="' + A + 'row-chevron.svg" alt=""></button>';
  }
  /* editing comes straight to this screen from the card, so leaving it lets the page scroll again */
  function back() { dv.classList.remove("on"); if (D && D.edit) document.documentElement.classList.remove("mvl-lock"); }

  /* a logged workout's Edit (its three dots, tray.js menu): this screen again, filled with what was logged */
  var toMin = function (t) { if (typeof t === "number") return t; var q = /^(\d+):(\d+)/.exec(t || ""); return q ? +q[1] * 60 + +q[2] : NOWM; };
  window.editLoggedWorkout = function (r, x) {
    var w = W.filter(function (v) { return v[0] === x.name; })[0] || [x.name, x.ic];
    D = { w: w, min: DUR.indexOf(x.min) > -1 ? x.min : 10, eff: x.eff == null ? -1 : x.eff, at: toMin(x.at), date: new Date(TODAY), edit: { r: r, x: x } };
    drawD();
    document.documentElement.classList.add("mvl-lock");
    dv.classList.remove("on"); void dv.offsetWidth; dv.classList.add("on");
  };

  /* ---------- its sheets: one layer above this screen, in the bottom bar's look (plan-tray.js .pts) ---------- */
  var sh = document.createElement("div");
  sh.className = "pts pt2 mvs"; sh.setAttribute("role", "dialog"); sh.setAttribute("aria-modal", "true");
  document.body.appendChild(sh);
  var XI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="width:16px;height:16px"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  function sheet(title, html) {
    sh.innerHTML = '<div class="sh"><div class="hd"><div><h4>' + title + '</h4></div><button class="x" data-s="close" aria-label="Close">' + XI + '</button></div>' + html + '</div>';
    void sh.offsetWidth; requestAnimationFrame(function () { sh.classList.add("on"); });
  }
  function shut() { sh.classList.remove("on"); }

  /* intensity is optional, so the wheel starts on "Select" (nothing picked) and rolling back to it clears a choice */
  function effortSheet() {
    var L = ints(D.w), k = D.eff + 1;
    sheet("Select intensity", '<p class="mvs-sub">Choose the intensity of the exercise you did</p>' +
      '<div class="dial"><div class="wh mvs-int"><span class="wband"></span>' + col("in", ["Select"].concat(L.map(function (x) { return esc(x[0]); })), k, "Intensity") + '</div></div>' +
      '<button class="done" data-s="setint">Done</button>');
    sh.querySelector('[data-col="in"] > div').classList.add("none");
    requestAnimationFrame(function () { settle(sh.querySelector('[data-col="in"]'), function (n) { k = n; }); });
    sh.pick = function () { D.eff = k - 1; };
  }
  function timeSheet() {
    var h = Math.floor(D.at / 60) % 24, mins = []; for (var k = 0; k < 60; k++) mins.push((k < 10 ? "0" : "") + k);
    sheet("When did you do it?", '<div class="wh"><span class="wband"></span>' + col("th", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], (h % 12 || 12) - 1, "Hour") +
      col("tm", mins, D.at % 60, "Minute") + col("ta", ["AM", "PM"], h < 12 ? 0 : 1, "AM or PM") + '</div>' +
      '<div class="whint" aria-live="polite"></div><button class="done" data-s="settime">Done</button>');
    var T = { h: (h % 12 || 12) - 1, m: D.at % 60, a: h < 12 ? 0 : 1 };
    var at = function () { return (T.h + 1) % 12 * 60 + (T.a ? 720 : 0) + T.m; };
    /* a time still to come today is greyed, and Done waits with a line why */
    var guard = function () {
      var bad = dayDiff(D.date) === 0 && at() > NOWM;
      sh.querySelector(".whint").textContent = bad ? "You can only log a time that has passed" : "";
      sh.querySelector('[data-s="settime"]').disabled = bad;
    };
    requestAnimationFrame(function () {
      settle(sh.querySelector('[data-col="th"]'), function (k) { T.h = k; guard(); });
      settle(sh.querySelector('[data-col="tm"]'), function (k) { T.m = k; guard(); });
      settle(sh.querySelector('[data-col="ta"]'), function (k) { T.a = k; guard(); });
      guard();
    });
    sh.pick = function () { D.at = at(); };
  }
  /* the calendar: Eat's own date sheet (index.html #dateSheet), the bound pad, Monday first, no day after today */
  var VIEW = null;
  function dateSheet(keep) {
    if (!keep) VIEW = new Date(D.date.getFullYear(), D.date.getMonth(), 1);
    var y = VIEW.getFullYear(), m = VIEW.getMonth(), first = (new Date(y, m, 1).getDay() + 6) % 7, n = new Date(y, m + 1, 0).getDate();
    var atNow = y === TODAY.getFullYear() && m === TODAY.getMonth(), cells = "";
    for (var b = 0; b < first; b++) cells += '<div class="dsblank"></div>';
    for (var d = 1; d <= n; d++) {
      var dt = new Date(y, m, d), fut = dt > TODAY, sel = dt.getTime() === D.date.getTime(), now = dt.getTime() === TODAY.getTime();
      cells += '<button class="dsd' + (now ? " today" : "") + (sel ? " sel" : "") + '" data-s="day" data-d="' + d + '"' + (fut ? " disabled" : "") + ' aria-label="' + fmtD(dt) + '"' + (sel ? ' aria-current="date"' : "") + '><span class="dsn">' + d + '</span></button>';
    }
    sheet("Select date", '<div class="mvs-cal"><div class="dspad"><div class="dsr" aria-hidden="true"></div>' +
      '<div class="dsm"><button class="arr" data-s="mon" data-i="-1" aria-label="Previous month"><svg class="ico" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button>' +
        '<span class="mo">' + MON[m] + ' ' + y + '</span>' +
        '<button class="arr" data-s="mon" data-i="1" aria-label="Next month"' + (atNow ? " disabled" : "") + '><svg class="ico" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg></button></div>' +
      '<div class="dsw">' + ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(function (x) { return "<span>" + x + "</span>"; }).join("") + '</div></div>' +
      '<div class="dsg">' + cells + '</div></div>');
  }
  sh.addEventListener("click", function (e) {
    if (e.target === sh) return shut();
    var t = e.target.closest("[data-s], .wc > div"); if (!t) return;
    if (t.parentNode.classList.contains("wc")) return rollTo(t.parentNode, +t.dataset.k);
    var a = t.dataset.s;
    if (a === "close") return shut();
    if (a === "setint") { sh.pick(); shut(); return drawD(); }
    if (a === "settime") { sh.pick(); shut(); return drawD(); }
    if (a === "mon") { VIEW = new Date(VIEW.getFullYear(), VIEW.getMonth() + +t.dataset.i, 1); return dateSheet(true); }
    if (a === "day") { D.date = new Date(VIEW.getFullYear(), VIEW.getMonth(), +t.dataset.d); shut(); return drawD(); }
  });

  dv.addEventListener("click", function (e) {
    var t = e.target.closest("button, .wc > div"); if (!t) return;
    if (t.parentNode.classList && t.parentNode.classList.contains("wc")) return rollTo(t.parentNode, +t.dataset.k);
    var a = t.dataset.d;
    if (a === "back") return back();
    if (a === "effort") return effortSheet();
    if (a === "time") return timeSheet();
    if (a === "date") return dateSheet();
    if (a === "log") return log(t);
  });
  function log(btn) {
    var P = window.MVPLAN, rect = btn.getBoundingClientRect(), x = { name: D.w[0], ic: D.w[1], min: D.min, kcal: kcal(), at: D.at, eff: D.eff };
    /* an edit replaces the entry, in whichever part of the day its time now falls; the score moves and says so, no win */
    if (D.edit) {
      var old = P.S.extra[D.edit.r], k = old.indexOf(D.edit.x);
      if (k > -1) old.splice(k, 1);
      P.S.extra[partOf(D.at)].push(x);
      back(); return P.render();
    }
    back(); close(); remember(D.w[0], D.min);
    if (dayDiff(D.date) !== 0) return;   /* ponytail: an earlier day is saved with that day; the prototype only keeps today */
    var r = partOf(D.at);
    var land = function () { if (window.MVMOM) window.MVMOM.logged(); P.S.extra[r].push(x); P.render(); };
    var gain = window.MVMOM ? window.MVMOM.gain(function () { P.S.extra[r].push(x); }, function () { P.S.extra[r].pop(); }) : 0;
    if (window.MVTRAY) window.MVTRAY.win(rect, [x.name], gain, land); else land();
  }
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (sh.classList.contains("on")) shut(); else if (dv.classList.contains("on")) back(); else if (el.classList.contains("on")) close();
  });
  /* both doors into logging: the action card's button and the routine card's "Search and log exercise" */
  document.addEventListener("click", function (e) {
    var d = e.target.closest('[data-x="logworkout"], .mv-else button'); if (!d) return;
    e.preventDefault(); e.stopPropagation();
    var c = d.closest(".mv-card");   /* from a card, it logs into that part of the day */
    FROM = c ? [].indexOf.call(document.querySelectorAll(".mv-card"), c) : -1;
    open();
  }, true);
})();
