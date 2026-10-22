/* Move: Log your exercise. Opens from "Log workout" on the action card and from "Search and log exercise"
   on a routine card. Figma: GoodFlip ring designs, 11664:12610, with a tinted icon on each row and a live search.
   Picking a workout opens its own screen: how long (a wheel), how hard, when, then Log exercise. It counts in kcal,
   the unit the coach's workouts count in, so both add to the same Momentum, in the part of the day its time falls in. */
(function () {
  var A = "/v7/icons/move/log/";
  /* name, Material Symbols (rounded, filled), MET (Compendium of Physical Activities) */
  var W = [
    ["Walking", "directions_walk", 3.5], ["Running", "directions_run", 9.8], ["Swimming", "pool", 7],
    ["Strength Training", "fitness_center", 5], ["Cycling", "directions_bike", 7.5], ["Yoga", "self_improvement", 2.5],
    ["Pilates", "sports_gymnastics", 3], ["Rock Climbing", "landscape", 8], ["Martial Arts", "sports_martial_arts", 10],
    ["Dance", "music_note", 5], ["Hiking", "hiking", 6], ["CrossFit", "exercise", 8], ["Kickboxing", "sports_mma", 9],
    ["Badminton", "sports_tennis", 5.5], ["Cricket", "sports_cricket", 4.8], ["Football", "sports_soccer", 7],
    ["Surfing", "surfing", 3], ["Rowing", "rowing", 7]
  ];
  /* kcal = MET x 3.5 x kg / 200 per minute. ponytail: 65 kg until the profile's weight is wired in */
  var KG = 65, burn = function (w, min) { return Math.round(w[2] * 3.5 * KG / 200 * min); };
  var esc = function (s) { return s.replace(/[&<>"]/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); };

  var el = document.createElement("div");
  el.className = "mvl"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-labelledby", "mvlT");
  el.innerHTML =
    '<div class="mvl-glow" aria-hidden="true"></div>' +
    '<div class="mvl-top"><button class="mvl-back" id="mvlBack"><img src="' + A + 'back.svg" alt="">Back</button></div>' +
    '<div class="mvl-scroll"><h3 id="mvlT">Log Your Exercise</h3>' +
      '<label class="mvl-search"><img src="' + A + 'search.svg" alt=""><input id="mvlQ" type="search" placeholder="Search by exercise name" autocomplete="off" aria-label="Search by exercise name">' +
      '<button class="mvl-clr" id="mvlClr" type="button" aria-label="Clear search"><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7"/></svg></button></label>' +
      '<div class="mvl-lab" id="mvlLab">All Workouts</div><div class="mvl-list" id="mvlList"></div></div>';
  var bar = document.querySelector(".gf-status"); if (bar) el.insertBefore(bar.cloneNode(true), el.firstChild);
  (document.getElementById("col") || document.body).appendChild(el);
  var Qi = el.querySelector("#mvlQ"), list = el.querySelector("#mvlList"), lab = el.querySelector("#mvlLab");

  function draw(q) {
    q = (q || "").trim().toLowerCase();
    var hits = W.filter(function (w) { return !q || w[0].toLowerCase().indexOf(q) > -1; });
    el.querySelector(".mvl-search").classList.toggle("has", !!q);
    lab.textContent = q ? (hits.length ? hits.length + (hits.length > 1 ? " workouts" : " workout") : "No results") : "All Workouts";
    list.innerHTML = hits.length ? hits.map(function (w, i) {
      var n = esc(w[0]), k = w[0].toLowerCase().indexOf(q);
      if (q) n = esc(w[0].slice(0, k)) + "<mark>" + esc(w[0].slice(k, k + q.length)) + "</mark>" + esc(w[0].slice(k + q.length));
      return '<button class="mvl-row" style="--i:' + i + ";--src:url(" + A + w[1] + '.svg)" data-w="' + esc(w[0]) + '">' +
        '<span class="ic"><i></i></span><span class="nm">' + n + '</span><img src="' + A + 'chevron.svg" alt=""></button>';
    }).join("") : '<div class="mvl-none"><b>No workout called "' + esc(Qi.value.trim()) + '"</b>Try a shorter word, like walk, gym or yoga.</div>';
  }

  function open() { Qi.value = ""; draw(""); el.querySelector(".mvl-scroll").scrollTop = 0; el.querySelector(".mvl-glow").style.translate = ""; el.classList.remove("on"); void el.offsetWidth; el.classList.add("on"); document.documentElement.classList.add("mvl-lock"); }
  function close() { el.classList.remove("on"); Qi.blur(); document.documentElement.classList.remove("mvl-lock"); }
  window.openLogWorkout = open;

  Qi.addEventListener("input", function () { draw(Qi.value); });
  /* the glow belongs to the title, so it leaves with it rather than sitting behind the list */
  var glow = el.querySelector(".mvl-glow"), sc = el.querySelector(".mvl-scroll");
  sc.addEventListener("scroll", function () { glow.style.translate = "0 " + -sc.scrollTop + "px"; }, { passive: true });
  el.querySelector("#mvlClr").onclick = function () { Qi.value = ""; draw(""); Qi.focus(); };
  el.querySelector("#mvlBack").onclick = close;
  list.addEventListener("click", function (e) {
    var b = e.target.closest(".mvl-row"); if (!b) return;
    detail(W.filter(function (w) { return w[0] === b.dataset.w; })[0]);
  });

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

  function detail(w) {
    D = { w: w, min: 10, eff: -1, at: defTime(), date: new Date(TODAY) };   /* intensity starts unpicked: "Select" */
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
    back(); close();
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
