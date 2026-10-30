/* Mind: the coach's Rhythm plan as part-of-day cards, in Move's card anatomy (move/plan.js).
   What the coach sets comes from mind/sandbox-simple.html: hours of sleep, the sleep window, wind-down tasks with a
   suggested time, up to two breathing exercises, me-time tasks (any one is enough) and an evening mood check-in.
   Last night's sleep is logged in a sheet; everything else is a tick. The score lives in mind/rhythm.js. */
(function () {
  var Q = new URLSearchParams(location.search), ST = Q.get("state") || "";
  var FREE = /^free/.test(ST), NOPLAN = FREE || /^noplan/.test(ST);
  var NOW = +Q.get("now") || 15;   /* the prototype's clock, in hours; ?now= for the case document */

  /* the coach's plan */
  var P = {
    hours: 7.5, short: 3, exOn: true, grace: 1, exPen: 20,   /* hours of sleep: target, zero when short by, oversleep allowance and penalty */
    bed: "22:30", wake: "06:00", tol: 30, zero: 120,          /* sleep window: full marks within tol minutes, none past zero */
    w: { hours: 23, window: 24, wd: 23, br: 10, me: 10, mood: 10 },   /* the Mind deck weights: sleep 70, self-care 30 */
    wd: [
      { t: "Last tea or coffee before 2 PM", at: "14:00", d: "Caffeine stays in your body for hours and keeps sleep light." },
      { t: "Dinner 2 hours before bed", at: "20:30", d: "An early dinner keeps your sugar steadier through the night." },
      { t: "Phone away, lights low", at: "22:00", d: "Dim light tells your body it is time to sleep." }
    ],
    br: [{ n: "Cyclic sighing", min: 5, how: "Two breaths in through the nose, one long breath out" }],
    me: [
      { t: "Do one enjoyable activity", d: "Music, a hobby, gardening, anything you look forward to." },
      { t: "Have one meaningful conversation", d: "A call or a chai with someone who matters to you." },
      { t: "Spend 10 to 15 minutes fully engaged", d: "Lose yourself in one thing: a puzzle, a recipe, a song." }
    ],
    moodAt: "20:30"
  };

  /* minutes from 00:00 yesterday: 1350 is 10:30 PM yesterday, 1485 is 12:45 AM today, 1800 is 6:00 AM today */
  function mins(s) { var p = s.split(":"); return +p[0] * 60 + +p[1]; }
  function bedM(s) { var m = mins(s); return m < 720 ? m + 1440 : m; }
  function wakeM(s) { return mins(s) + 1440; }

  /* what the person has done today */
  var S = { bed: null, wake: null, wd: {}, br: {}, me: {}, mood: -1 };
  /* ?day= sets up a case for the document (v7/mind-rhythm.html) */
  var DAYS = {
    start: {},
    slept: { bed: 1370, wake: 1810 },
    noon: { bed: 1370, wake: 1810, wd: { 0: 1 }, br: { 0: 1 } },
    evening: { bed: 1370, wake: 1810, wd: { 0: 1 }, br: { 0: 1 }, me: { 1: 1 } },
    night: { bed: 1370, wake: 1810, wd: { 0: 1, 1: 1 }, br: { 0: 1 }, me: { 1: 1 }, mood: 3 },
    full: { bed: 1350, wake: 1800, wd: { 0: 1, 1: 1, 2: 1 }, br: { 0: 1 }, me: { 0: 1 }, mood: 3 },
    late: { bed: 1485, wake: 1800, wd: { 0: 1 }, mood: -1 },
    lie: { bed: 1350, wake: 2025, wd: { 0: 1, 1: 1, 2: 1 }, br: { 0: 1 }, me: { 0: 1 }, mood: 3 },
    short: { bed: 1425, wake: 1770, wd: { 0: 1, 1: 1, 2: 1 }, br: { 0: 1 }, me: { 2: 1 }, mood: 2 },
    skipped: { wd: { 0: 1 }, br: { 0: 1 } }
  };
  var DK = Q.get("day") || (NOPLAN ? "start" : "");
  if (DK && DAYS[DK]) Object.keys(DAYS[DK]).forEach(function (k) { S[k] = DAYS[DK][k]; });

  /* Mind is not split by the clock, as Eat and Move are: one card per practice, in the order a day meets them */

  var IC = {
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    checkD: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path pathLength="1" d="M20 6L9 17l-5-5"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
    plusSq: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><path d="M12 8.5v7M8.5 12h7"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
    wind: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.8 19.6A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/><path d="M9.8 4.4A2 2 0 1 1 11 8H2"/></svg>'
  };
  var FACES = [["Awful", "😣"], ["Low", "😕"], ["Okay", "😐"], ["Good", "🙂"], ["Great", "😄"]];
  function nice(m) { m = ((m % 1440) + 1440) % 1440; var h = Math.floor(m / 60); return (h % 12 || 12) + ":" + ("0" + m % 60).slice(-2) + (h < 12 ? " AM" : " PM"); }
  function niceS(s) { return nice(mins(s)); }
  function hm(m) { m = Math.round(m); var h = Math.floor(m / 60), x = m % 60; return h + "h" + (x ? " " + x + "m" : ""); }
  function logged() { return S.bed != null && S.wake != null && S.wake > S.bed; }

  /* ---------- the section, as Move does: Eat's meals stay in the page, hidden ---------- */
  var meals = document.getElementById("diary").closest(".sect");
  meals.id = "mealSect";
  var root = document.createElement("div");
  root.className = "gut sect"; root.id = "mdRoot";
  meals.parentNode.insertBefore(root, meals.nextSibling);

  function tip(key, title, sub, on, extra) {
    return '<div class="mv-tip tip' + (on ? " done" : "") + '" data-tiprow="' + key + '"><button class="mv-tb tickbtn" data-mt="' + key + '" aria-pressed="' + on + '" aria-label="' + (on ? "Mark as not done: " : "Mark as done: ") + title + '"><span class="tmark' + (on ? " on" : "") + '">' + (on ? IC.checkD : "") + '</span></button>' +
      '<div style="flex:1;min-width:0"><div class="tt">' + title + '</div><div class="td">' + sub + '</div></div>' + (extra || "") + '</div>';
  }
  function head(ic, title, sub, pts) {
    return '<div class="md-hd"><span class="md-hi">' + ic + '</span><div class="md-ht"><div class="n">' + title + '</div><div class="s">' + sub + '</div></div>' + (pts || "") + '</div>';
  }
  var I = {
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
    wind: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.8 19.6A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/><path d="M9.8 4.4A2 2 0 1 1 11 8H2"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/></svg>',
    sunset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10V3"/><path d="m4.9 10.9 1.4 1.4"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.1 10.9-1.4 1.4"/><path d="M22 22H2"/><path d="M16 18a4 4 0 0 0-8 0"/></svg>',
    smile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.53.85l10.2-6.5a1 1 0 0 0 0-1.7L9.53 4.65A1 1 0 0 0 8 5.5z"/></svg>'
  };
  var done = function (on, txt) { return on ? '<span class="md-ok">' + IC.checkD + (txt || "Done") + '</span>' : ""; };
  /* every card is Move's card (move/plan.css .mv-card): the soft indigo top, the two-tone border, a header, then the body */
  function card(title, sub, body, act) {
    return '<section class="mv-card"><div class="mv-mh"><div class="t"><div class="n">' + title + '</div><div class="s">' + sub + '</div></div>' + (act || "") + '</div>' +
      '<div class="mv-mbi">' + body + '</div></section>';
  }

  /* the day on one card: every item a row in time order. A plain step ticks in place; one that needs an answer
     (last night's times, the breathing itself, which me-time, how today felt) opens a sheet from its row */
  function rowHTML(o) {
    var on = !!o.on, tag = o.sheet ? 'data-open="' + o.sheet + '"' : 'data-mt="' + o.key + '"';
    return '<div class="mv-tip tip md-row' + (on ? " done" : "") + '" data-tiprow="' + (o.key || o.sheet) + '">' +
      '<button class="mv-tb tickbtn" ' + tag + ' aria-pressed="' + on + '" aria-label="' + o.t + '"><span class="tmark' + (on ? " on" : "") + '">' + (on ? IC.checkD : "") + '</span></button>' +
      '<button class="md-rb" ' + tag + '><span class="tt">' + o.t + '</span><span class="td">' + o.d + '</span></button>' +
      (o.sheet ? '<span class="md-chev" aria-hidden="true">' + IC.chev + '</span>' : '<span class="md-chev"></span>') + '</div>';
  }
  function items() {
    var L = [], h = logged() ? S.wake - S.bed : 0, meOn = P.me.filter(function (x, j) { return S.me[j]; })[0];
    L.push({ m: 360, sheet: "sleep", on: logged(), t: "Last night’s sleep", at: "Morning",
      d: logged() ? hm(h) + " · " + nice(S.bed) + " to " + nice(S.wake) : "Planned " + niceS(P.bed) + " to " + niceS(P.wake) });
    P.wd.forEach(function (w, i) { L.push({ m: mins(w.at), key: "wd:" + i, on: !!S.wd[i], t: w.t, d: w.d, at: niceS(w.at) }); });
    P.br.forEach(function (b, i) { var ps = PL && PL.i === i && PL.el > 0 && !S.br[i]; L.push({ m: 13 * 60 + i, sheet: "br:" + i, on: !!S.br[i], t: b.n + ", " + b.min + " min", d: S.br[i] ? "Done today" : ps ? "Paused at " + clockS(PL.el) + ". Tap to resume." : b.how, at: "Any time" }); });
    L.push({ m: 18 * 60, sheet: "me", on: !!meOn, t: "Something for you", d: meOn ? meOn.t : "Pick any one of " + P.me.length + ". One is enough.", at: "Any time" });
    L.push({ m: mins(P.moodAt) + 1, sheet: "mood", on: S.mood >= 0, t: "How was today?", d: S.mood >= 0 ? FACES[S.mood][1] + " " + FACES[S.mood][0] + (S.tags && S.tags.length ? " · " + S.tags.join(", ") : "") : "A quick check-in. The answer is never scored.", at: niceS(P.moodAt) });
    return L;
  }
  /* grouped by kind, each under a small label, in the order a day meets them; times stay out of the list */
  var GROUPS = [["Sleep", ["sleep"]], ["Mood", ["mood"]], ["Breathing", ["br"]], ["Me-time", ["me"]], ["Wind-down", ["wd"]]];
  function todayCard() {
    var L = items(), n = L.filter(function (x) { return x.on; }).length;
    var kind = function (x) { return (x.key || x.sheet).split(":")[0]; };
    return '<section class="mv-card"><div class="mv-mh"><div class="t"><div class="n">Today</div><div class="s">' + (n === L.length ? "All done. Sleep well tonight." : n + " of " + L.length + " done") + '</div></div>' +
      '<span class="md-ring" style="--p:' + Math.round(n / L.length * 100) + '"><b>' + n + '</b></span></div>' +
      '<div class="mv-mbi">' + GROUPS.map(function (g) {
        var rows = L.filter(function (x) { return g[1].indexOf(kind(x)) > -1; }).sort(function (a, b) { return a.m - b.m; });
        return rows.length ? '<div class="md-grp"><div class="lab">' + g[0] + '</div><div class="mv-tiplist">' + rows.map(rowHTML).join("") + '</div></div>' : "";
      }).join("") + '</div></section>';
  }

  /* ---------- the sheets an item opens ---------- */
  function meSheet() {
    window.GFOpenSheet("mdMe", "Something for you", '<div class="msub">Pick any one. One is enough for today, and you can do more whenever you like.</div><div class="md-opts">' +
      P.me.map(function (m, j) { var on = !!S.me[j]; return '<button class="md-opt' + (on ? " on" : "") + '" data-mepick="' + j + '"><span class="tmark' + (on ? " on" : "") + '">' + (on ? IC.checkD : "") + '</span><span><b>' + m.t + '</b><small>' + m.d + '</small></span></button>'; }).join("") + '</div>');
  }
  function moodSheet() {
    var f = S.mood, low = f >= 0 && f <= 1;
    var body = '<div class="msub">' + (f < 0 ? "Tap the one closest to how today felt. Checking in counts; your answer never changes the score." : "Thank you for checking in.") + '</div>' +
      '<div class="md-faces">' + FACES.map(function (x, j) { return '<button class="md-face' + (f === j ? " on" : "") + '" data-mf="' + j + '"><span>' + x[1] + '</span>' + x[0] + '</button>'; }).join("") + '</div>';
    if (f >= 0) {
      body += '<div class="md-reply' + (low ? " low" : "") + '">' + MOODSAY[f] + '</div>' +
        '<div class="lab" style="margin:14px 0 8px">What shaped today? Optional</div><div class="md-pills">' +
        TAGS.map(function (x) { var on = (S.tags || []).indexOf(x) > -1; return '<button class="md-pill' + (on ? " on" : "") + '" data-tag="' + x + '">' + (on ? IC.checkD : "") + x + '</button>'; }).join("") + '</div>' +
        (low ? '<div class="md-help"><b>Want to talk it through?</b><span>Your coach Sahana can call you today.</span><button class="md-go" data-help="coach">Ask Sahana to call</button><small>Need someone right now? Tele-MANAS, <b>14416</b>, free, any time, in your language.</small></div>' : "") +
        '<button class="md-save" data-mdone style="margin-top:16px">Back to Today</button>';
    }
    window.GFOpenSheet("mdMood", "How was today?", body);
  }

  /* ---------- humane lines: what the app says back, after something is logged ---------- */
  function sleepSay() {
    var h = (S.wake - S.bed) / 60, late = S.bed - bedM(P.bed);
    if (h < P.hours - 1) return "A short night happens. Go a little easy on yourself today, and try to get to bed a bit earlier tonight.";
    if (P.exOn && h > P.hours + P.grace) return "A long sleep. If you are feeling run down, let your coach know.";
    if (late > 60) return "A late night. Going to bed close to " + niceS(P.bed) + " tonight brings your rhythm back.";
    return "A steady night’s sleep. Today should feel easier for it.";
  }
  var MOODSAY = [
    "I am really sorry today feels this hard. You are not alone. Your coach is here, and if you need someone right now, a free helpline is one tap away.",
    "Thank you for being honest. Low days happen, and you do not have to carry this one alone.",
    "An okay day is still a good day to check in. Thank you for telling us.",
    "Good to hear. Notice what made it good, so you can do more of it.",
    "Lovely to hear. Whatever you did today, it is working for you."
  ];
  var TAGS = ["Work", "Family", "Health", "Sleep", "Food", "Money", "Friends", "Rest", "Exercise"];
  var toast = function (m) { if (window.GFToast) window.GFToast(m); };

  /* ---------- the plan, four ways (?v=a, b, c, d); a is the default ---------- */
  var V = Q.get("v") || "a";
  /* ?layout= draws the plan with one of the layouts in mind/layouts.js, for mind/plan-layouts.html */
  var LY = window.MDLAYOUT && window.MDLAYOUT[Q.get("layout")];
  function upNextCard() {
    var L = items(), n = L.filter(function (x) { return x.on; }).length;
    var open = L.filter(function (x) { return !x.on; }).sort(function (a, b) { return a.m - b.m; });
    var due = open.filter(function (x) { return x.m >= NOW * 60 - 60; })[0] || open[0];
    var ACT = { sleep: "Log last night", mood: "Check in", me: "Pick one", wd: "Mark as done" };
    var act = function (x) { var k = (x.key || x.sheet).split(":")[0]; return k === "br" ? (PL && PL.i === +x.sheet.split(":")[1] && PL.el ? "Resume" : "Start breathing") : ACT[k]; };
    var tag = function (x) { return x.sheet ? 'data-open="' + x.sheet + '"' : 'data-mt="' + x.key + '"'; };
    var head = due ? '<div class="md-next"><div class="lab">Up next</div><div class="tt">' + due.t + '</div><div class="td">' + due.d + '</div><button class="md-go md-wide" ' + tag(due) + '>' + act(due) + '</button></div>'
      : '<div class="md-next"><div class="lab">All done</div><div class="tt">Everything on today’s plan is done.</div><div class="td">Sleep well, and keep to your bedtime tonight.</div></div>';
    var rest = L.filter(function (x) { return x !== due; }).sort(function (a, b) { return (a.on - b.on) || (a.m - b.m); });
    return '<section class="mv-card"><div class="mv-mh"><div class="t"><div class="n">Today</div><div class="s">' + n + " of " + L.length + ' done</div></div><span class="md-ring" style="--p:' + Math.round(n / L.length * 100) + '"><b>' + n + '</b></span></div>' +
      '<div class="mv-mbi">' + head + '<div class="lab" style="margin-top:14px">Rest of today</div><div class="md-pills">' +
      rest.map(function (x) { return '<button class="md-pill' + (x.on ? " on" : "") + '" ' + tag(x) + '>' + (x.on ? IC.checkD : "") + x.t + '</button>'; }).join("") + '</div></div></section>';
  }
  function nightDayCards() {
    var L = items(), kind = function (x) { return (x.key || x.sheet).split(":")[0]; };
    var part = function (title, share, kinds) {
      var rows = L.filter(function (x) { return kinds.indexOf(kind(x)) > -1; }), n = rows.filter(function (x) { return x.on; }).length;
      return '<section class="mv-card"><div class="mv-mh"><div class="t"><div class="n">' + title + '</div><div class="s">' + share + ' · ' + n + ' of ' + rows.length + ' done</div></div></div>' +
        '<div class="mv-mbi"><div class="mv-tiplist">' + rows.map(rowHTML).join("") + '</div></div></section>';
    };
    return part("Your night", "70 of your score", ["sleep", "wd"]) + part("Your day", "30 of your score", ["mood", "br", "me"]);
  }
  function tilesCard() {
    var L = items(), get = function (k) { return L.filter(function (x) { return (x.key || x.sheet).split(":")[0] === k; }); };
    var wd = get("wd"), wdn = wd.filter(function (x) { return x.on; }).length, sl = get("sleep")[0], br = get("br")[0], me = get("me")[0], mo = get("mood")[0];
    var tile = function (cls, ic, name, status, on, open, wide) {
      return '<button class="md-tile ' + cls + (on ? " on" : "") + (wide ? " wide" : "") + '" data-open="' + open + '"><span class="md-ti">' + ic + '</span><span class="md-tn">' + name + '</span><span class="md-ts">' + status + '</span>' + (on ? '<span class="md-tk">' + IC.checkD + '</span>' : "") + '</button>';
    };
    return '<section class="mv-card"><div class="mv-mh"><div class="t"><div class="n">Today</div><div class="s">Tap any one to log it</div></div></div><div class="mv-mbi"><div class="md-tiles">' +
      tile("sl", I.moon, "Sleep", sl.on ? sl.d.split(" · ")[0] : "Log last night", sl.on, "sleep", true) +
      tile("mo", I.smile, "Mood", mo.on ? mo.d : "How was today?", mo.on, "mood") +
      tile("br", I.wind, "Breathing", br.on ? "Done" : P.br[0].min + " min", br.on, br.sheet) +
      tile("me", I.heart, "Me-time", me.on ? "Done" : "Pick one", me.on, "me") +
      tile("wd", I.sunset, "Wind-down", wdn + " of " + wd.length, wdn === wd.length, "wd") +
      '</div></div></section>';
  }
  function wdSheet() {
    var order = P.wd.map(function (w, i) { return i; }).sort(function (a, b) { return mins(P.wd[a].at) - mins(P.wd[b].at); });
    window.GFOpenSheet("mdWd", "Wind-down", '<div class="msub">Small steps for a steady night. Each one counts on its own.</div><div class="md-opts">' +
      order.map(function (i) { var w = P.wd[i], on = !!S.wd[i]; return '<button class="md-opt' + (on ? " on" : "") + '" data-wdpick="' + i + '"><span class="tmark' + (on ? " on" : "") + '">' + (on ? IC.checkD : "") + '</span><span><b>' + w.t + '</b><small>' + niceS(w.at) + ' · ' + w.d + '</small></span></button>'; }).join("") + '</div>');
  }
  /* ---------- per-practice cards: Move's card for each one, the status in the header, one action on the right ----------
     ?v=e a stack, ?v=f a two-up grid, ?v=g a swipeable row. Wind-down keeps its ticks inside; the rest open a sheet. */
  function practices() {
    var L = items(), by = function (k) { return L.filter(function (x) { return (x.key || x.sheet).split(":")[0] === k; }); };
    var sl = by("sleep")[0], mo = by("mood")[0], br = by("br")[0], me = by("me")[0], wd = by("wd"), wdn = wd.filter(function (x) { return x.on; }).length;
    var paused = PL && PL.el > 0 && !S.br[PL.i];
    return [
      { k: "sleep", ic: I.moon, n: "Sleep", on: sl.on, s: sl.on ? sl.d : "How did you sleep last night?", open: "sleep", act: sl.on ? "Edit" : "Log" },
      { k: "mood", ic: I.smile, n: "Mood", on: mo.on, s: mo.on ? mo.d : "How was today?", open: "mood", act: mo.on ? "Change" : "Check in" },
      { k: "br", ic: I.wind, n: "Breathing", on: br.on, s: br.on ? P.br[0].n + " · done" : paused ? "Paused at " + clockS(PL.el) : P.br[0].n + " · " + P.br[0].min + " min", open: br.sheet, act: br.on ? "Undo" : paused ? "Resume" : "Start" },
      { k: "me", ic: I.heart, n: "Me-time", on: me.on, s: me.on ? me.d : "Any one of " + P.me.length + " is enough", open: "me", act: me.on ? "Change" : "Pick one" },
      { k: "wd", ic: I.sunset, n: "Wind-down", on: wdn === wd.length, s: wdn === wd.length ? "All done. Rest well tonight." : wdn + " of " + wd.length + " small steps", open: "wd", act: "", rows: wd }
    ];
  }
  function pCard(x, mode) {
    var badge = x.on ? '<span class="md-done" aria-label="Done">' + IC.checkD + '</span>' : "";
    var btn = x.act ? '<button class="' + (x.on ? "md-ghost" : "md-act") + '" data-open="' + x.open + '">' + x.act + '</button>' : "";
    var body = x.rows && mode !== "g" ? '<div class="mv-mbi"><div class="mv-tiplist">' + x.rows.map(rowHTML).join("") + '</div></div>' : "";
    var right = x.rows ? (mode === "g" || mode === "f" ? '<button class="md-act" data-open="wd">' + (x.on ? "View" : "Open") + '</button>' : badge) : (x.on ? badge + btn : btn);
    if (x.rows && mode === "f") body = "";
    return '<section class="mv-card md-p md-p-' + x.k + (x.on ? " is-done" : "") + '">' +
      '<div class="mv-mh"><span class="md-pi">' + x.ic + '</span><div class="t"><div class="n">' + x.n + '</div><div class="s">' + x.s + '</div></div>' + right + '</div>' + body + '</section>';
  }
  function stackCards() { return practices().map(function (x) { return pCard(x, "e"); }).join(""); }
  function gridCards() {
    var P5 = practices();
    return '<div class="md-grid">' + P5.map(function (x, i) { return '<div class="' + (i === 0 ? "md-gw" : "") + '">' + pCard(x, "f") + '</div>'; }).join("") + '</div>';
  }
  function swipeCards() {
    var P5 = practices(), n = P5.filter(function (x) { return x.on; }).length;
    return '<div class="md-swhd">' + n + ' of ' + P5.length + ' done today</div><div class="md-sw">' + P5.map(function (x) { return pCard(x, "g"); }).join("") + '</div>' +
      '<div class="md-dots">' + P5.map(function (x) { return '<i class="' + (x.on ? "on" : "") + '"></i>'; }).join("") + '</div>';
  }

  function render() {
    if (NOPLAN) {
      root.innerHTML = '<div class="sec"><h2>Your mind plan</h2></div><section class="mv-card"><div class="mv-mh"><div class="t"><div class="n">Your plan is on its way</div><div class="s">Your Mind Coach sets your sleep times, wind-down and calm minutes after your first consultation.</div></div></div></section>';
    } else root.innerHTML = '<div class="sec"><h2>Your mind plan</h2></div>' + (LY ? LY({ P: P, S: S, items: items, practices: practices, rowHTML: rowHTML, nice: nice, niceS: niceS, hm: hm, mins: mins, now: NOW, I: I, IC: IC, FACES: FACES, logged: logged }) : V === "b" ? upNextCard() : V === "c" ? nightDayCards() : V === "d" ? tilesCard() : V === "e" ? stackCards() : V === "f" ? gridCards() : V === "g" ? swipeCards() : todayCard());
    if (window.MDRHYTHM) window.MDRHYTHM.update();
    kaira();
  }
  /* KAIRA's card: before last night is in, it asks for it; after, it points at the next thing on the plan by the clock */
  function kaira() {
    /* KAIRA's card is off on Mind: the night card asks for last night, and each card says what is left */
    var kc = document.querySelector(".ksect"); if (kc) { kc.hidden = true; return; }
    var say = document.getElementById("kairaSay"), act = document.getElementById("kairaAct");
    if (!say || NOPLAN) return;
    if (!logged()) { if (act) act.hidden = false; var k0 = say.closest(".ksect"); if (k0) k0.hidden = false; return; }
    if (act) act.hidden = true;
    var next = [];
    P.wd.forEach(function (w, i) { if (!S.wd[i]) next.push([mins(w.at), "<strong>" + w.t + ".</strong> " + w.d]); });
    P.br.forEach(function (b, i) { if (!S.br[i]) next.push([13 * 60, "<strong>" + b.min + " minutes of " + b.n.toLowerCase() + ".</strong> A few slow breaths after lunch help your body settle."]); });
    if (S.mood < 0) next.push([mins(P.moodAt), "<strong>How was today?</strong> A quick check-in at " + niceS(P.moodAt) + " helps you see your pattern."]);
    next.sort(function (a, b) { return a[0] - b[0]; });
    var up = next.filter(function (x) { return x[0] >= NOW * 60; })[0] || next[0];
    /* me-time is never KAIRA's nudge: its own card already says any one is enough */
    var allDone = !next.length && P.me.some(function (x, j) { return S.me[j]; }), ks = say.closest(".ksect");
    if (ks) ks.hidden = !up && !allDone;
    say.innerHTML = up ? up[1] : "<strong>Everything is done for today.</strong> Sleep well, and keep to your bedtime tonight.";
  }

  /* ---------- last night's sleep, in the house sheet ---------- */
  var draft = null;
  function picker(k, label) {
    var v = draft[k], day = v >= 1440 ? 1 : 0;
    return '<div class="md-pk"><div class="pl">' + label + '</div>' +
      '<div class="md-seg"><button data-dday="' + k + '|0" class="' + (day ? "" : "on") + '">Yesterday</button><button data-dday="' + k + '|1" class="' + (day ? "on" : "") + '">Today</button></div>' +
      '<div class="md-tp"><button data-dst="' + k + '|-15" aria-label="15 minutes earlier">−</button><b>' + nice(v) + '</b><button data-dst="' + k + '|15" aria-label="15 minutes later">+</button></div></div>';
  }
  function sleepBody() {
    var ok = draft.wake > draft.bed;
    return '<div class="msub">When you went to sleep and when you woke up. Planned ' + niceS(P.bed) + ' to ' + niceS(P.wake) + '.</div>' +
      '<div class="md-pks">' + picker("bed", "Went to sleep") + picker("wake", "Woke up") + '</div>' +
      '<div class="md-sum">' + (ok ? 'That is <b>' + hm(draft.wake - draft.bed) + '</b> of sleep.' : '<span class="bad">Wake-up is before bedtime. Check Yesterday and Today.</span>') + '</div>' +
      '<button class="md-save" data-dsave' + (ok ? "" : " disabled") + '>Save Last Night</button>';
  }
  function sleepSheet() {
    draft = { bed: S.bed != null ? S.bed : bedM(P.bed), wake: S.wake != null ? S.wake : wakeM(P.wake) };
    window.GFOpenSheet("mdSleep", "Last night’s sleep", sleepBody());
  }
  function redrawSheet() { var b = document.querySelector("#mdSleep .sbody") || document.querySelector("#mdSleep"); var host = document.querySelector("#mdSleep [data-dsave]"); if (!host) return; host.parentNode.innerHTML = sleepBody(); }

  /* ---------- the breathing player ----------
     Ready (what to do), Running (the orb leads, a ring shows the session, the breath is counted), Paused (frozen, Resume
     or End), Ended early (keep going, or count what was done), Done (a warm word, then it counts). Closing the sheet
     mid-session pauses it, and the row says where it stopped. ?fast=1 runs ten times faster, for the docs. */
  var PAT = { "Cyclic sighing": [["Breathe in through your nose", 2.5, .85], ["A short second breath in", 1, 1], ["A long breath out through your mouth", 6, .45]] };
  var SPEED = Q.get("fast") ? 10 : 1, PL = null;
  function clockS(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ":" + ("0" + s % 60).slice(-2); }
  function plBody(state) {
    var b = P.br[PL.i], tot = b.min * 60, ph = PAT[b.n] || [["Breathe in", 4, .85], ["Breathe out", 6, .45]];
    if (state === "ready") return '<div class="msub">' + b.min + ' min · ' + b.how + '</div>' +
      '<ol class="md-steps">' + ph.map(function (x) { return '<li><b>' + x[1] + 's</b>' + x[0] + '</li>'; }).join("") + '</ol>' +
      '<div class="md-tip2">Sit comfortably, relax your shoulders, and let the circle lead your breath. You can pause any time.</div>' +
      '<button class="md-save" data-pl="go">Start Breathing</button>';
    if (state === "early") return '<div class="md-pl"><div class="md-big"><i class="still"></i></div><div class="md-ph">You breathed for ' + clockS(PL.el) + '</div><div class="md-tm">Every calm minute helps. Your plan is ' + b.min + ' min.</div></div>' +
      '<div class="md-2btn"><button class="md-sec" data-pl="resume">Keep Breathing</button><button class="md-save" data-pl="count">Count This Session</button></div>';
    if (state === "done") return '<div class="md-pl"><div class="md-big done"><i class="still"></i></div><div class="md-ph">Well done</div><div class="md-tm">' + b.min + ' calm minutes. Notice how your shoulders feel now.</div></div>' +
      '<div class="lab" style="margin:0 0 8px">How do you feel now? Optional</div><div class="md-pills" style="margin-bottom:16px">' +
      ["Calmer", "About the same", "Not sure"].map(function (x) { var on = PL.feel === x; return '<button class="md-pill' + (on ? " on" : "") + '" data-feel="' + x + '">' + (on ? IC.checkD : "") + x + '</button>'; }).join("") + '</div>' +
      '<button class="md-save" data-pl="count">Save Session</button>';
    return '<div class="md-pl"><div class="md-big" style="--p:' + Math.min(100, PL.el / tot * 100) + '"><i id="mdOrb"></i></div><div class="md-ph" id="mdPh">' + (state === "paused" ? "Paused" : PL.word || "Get ready") + '</div>' +
      '<div class="md-tm"><span id="mdTm">' + clockS(tot - PL.el) + '</span> left · breath <span id="mdBn">' + (PL.n || 1) + '</span></div></div>' +
      '<div class="md-2btn"><button class="md-sec" data-pl="end">End Session</button>' + (state === "paused" ? '<button class="md-save" data-pl="resume">Resume</button>' : '<button class="md-save" data-pl="pause">Pause</button>') + '</div>';
  }
  function plShow(state) {
    PL.state = state;
    var el = document.getElementById("mdBreath");
    if (el && el.classList.contains("on")) el.querySelector(".sbody").innerHTML = plBody(state);
    else window.GFOpenSheet("mdBreath", P.br[PL.i].n, plBody(state));
    if (state === "run") plTick(true);
  }
  function plTick(first) {
    clearInterval(PL.t);
    var b = P.br[PL.i], tot = b.min * 60, ph = PAT[b.n] || [["Breathe in", 4, .85], ["Breathe out", 6, .45]];
    var step = function () {
      var orb = document.getElementById("mdOrb"), sheet = document.getElementById("mdBreath");
      if (!orb || !sheet || !sheet.classList.contains("on")) { clearInterval(PL.t); PL.state = "paused"; render(); return; }   /* the sheet went away: pause where it was */
      if (PL.cd > 0) { PL.cd -= .25 * SPEED; document.getElementById("mdPh").textContent = Math.ceil(PL.cd) > 0 ? String(Math.ceil(PL.cd)) : "Begin"; return; }
      if (PL.rest <= 0) { var x = ph[PL.k % ph.length]; PL.k++; if (PL.k % ph.length === 1) PL.n = Math.floor(PL.k / ph.length) + 1; PL.rest = x[1]; PL.word = x[0];
        document.getElementById("mdPh").textContent = x[0]; orb.style.transitionDuration = (x[1] / SPEED) + "s"; orb.style.transform = "scale(" + x[2] + ")"; document.getElementById("mdBn").textContent = PL.n; }
      PL.rest -= .25 * SPEED; PL.el = Math.min(tot, PL.el + .25 * SPEED);
      document.getElementById("mdTm").textContent = clockS(tot - PL.el);
      orb.parentNode.style.setProperty("--p", PL.el / tot * 100);
      if (PL.el >= tot) { clearInterval(PL.t); plShow("done"); }
    };
    PL.t = setInterval(step, 250); if (first) step();
  }
  function player(i) {
    if (!PL || PL.i !== i) PL = { i: i, el: 0, k: 0, rest: 0, n: 1 };
    plShow(PL.el > 0 ? "paused" : "ready");
  }

  /* ---------- taps ---------- */
  document.addEventListener("click", function (ev) {
    var t = ev.target.closest('[data-x="logsleep"],[data-feel],[data-open],[data-mepick],[data-wdpick],[data-mt],[data-mb],[data-mf],[data-tag],[data-mdone],[data-help],[data-pl],[data-dday],[data-dst],[data-dsave],[data-bplay]');
    if (!t) return;
    var a = t.dataset;
    if (a.open) { ev.preventDefault(); var o = a.open; if (o === "sleep") return sleepSheet(); if (o === "me") return meSheet(); if (o === "mood") return moodSheet(); if (o === "wd") return wdSheet();
      var bi = +o.split(":")[1]; if (S.br[bi]) { S.br[bi] = false; MD.cause = ""; toast("Breathing marked as not done."); return render(); } return player(bi); }
    if (a.mepick != null) { var mj = +a.mepick, was = !!S.me[mj]; S.me = {}; if (!was) S.me[mj] = true; MD.cause = was ? "" : "me"; if (window.closeSheets) window.closeSheets(); render(); if (!was) toast("Time for yourself, done. Small moments like this add up."); return; }
    if (a.wdpick != null) { var wi = +a.wdpick; S.wd[wi] = !S.wd[wi]; MD.cause = S.wd[wi] ? "wd" : ""; render(); wdSheet(); if (S.wd[wi] && P.wd.every(function (w, i) { return S.wd[i]; })) toast("Nicely wound down. Rest well tonight."); return; }
    if (a.pl) {
      if (a.pl === "go") { PL.cd = 3; return plShow("run"); }
      if (a.pl === "resume") return plShow("run");
      if (a.pl === "pause") { clearInterval(PL.t); return plShow("paused"); }
      if (a.pl === "end") { clearInterval(PL.t); return plShow(PL.el > 0 ? "early" : "ready"); }
      if (a.pl === "count") { clearInterval(PL.t); S.br[PL.i] = true; MD.cause = "br"; var full = PL.el >= P.br[PL.i].min * 60; PL = null; if (window.closeSheets) window.closeSheets(); render(); toast(full ? "Well done. A few calm minutes, done." : "Counted. Every calm minute helps."); return; }
    }
    if (a.feel) { PL.feel = PL.feel === a.feel ? "" : a.feel; return plShow("done"); }
    if (a.bplay != null) return player(+a.bplay);
    if (a.x === "logsleep") { ev.preventDefault(); if (!NOPLAN) sleepSheet(); return; }
    if (a.dday) { var d = a.dday.split("|"), m = ((draft[d[0]] % 1440) + 1440) % 1440; draft[d[0]] = m + (+d[1] ? 1440 : 0); return redrawSheet(); }
    if (a.dst) { var s = a.dst.split("|"); draft[s[0]] = Math.max(0, Math.min(2865, draft[s[0]] + +s[1])); return redrawSheet(); }
    if ("dsave" in a) { if (!(draft.wake > draft.bed)) return; S.bed = draft.bed; S.wake = draft.wake; MD.cause = "sleep"; if (window.closeSheets) window.closeSheets(); render(); toast(sleepSay()); return; }
    if (a.mf != null) { var f = +a.mf; S.mood = f; MD.cause = "mood"; render(); moodSheet(); return; }   /* the sheet stays, and answers */
    if (a.tag) { S.tags = S.tags || []; var ti = S.tags.indexOf(a.tag); if (ti > -1) S.tags.splice(ti, 1); else S.tags.push(a.tag); render(); moodSheet(); return; }
    if ("mdone" in a) { if (window.closeSheets) window.closeSheets(); return; }
    if (a.help) { toast("Sahana will call you today."); return; }
    var key = a.mt || (a.mb != null ? "br:" + a.mb : null);
    if (key) {
      var q = key.split(":"), on = S[q[0]][q[1]] = !S[q[0]][q[1]];
      MD.cause = on ? q[0] : "";
      render();
      if (on && q[0] === "wd" && P.wd.every(function (w, i) { return S.wd[i]; })) toast("Nicely wound down. Rest well tonight.");
      if (on && a.mt && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        var r = root.querySelector('[data-tiprow="' + key + '"]'), mk = r && r.querySelector(".tmark");
        if (r) { r.classList.add("cheer"); mk.classList.add("pop"); if (window.GFBurst) mk.appendChild(window.GFBurst()); }
      }
    }
  });

  var MD = window.MDPLAN = { P: P, S: S, noplan: NOPLAN, free: FREE, now: NOW, logged: logged, bedM: bedM, wakeM: wakeM, render: render, cause: "" };
  /* the screen's own code asks Move's plan whether anything was logged today (the FlipCoins card); Mind answers for it */
  window.MVPLAN = { noplan: NOPLAN, RT: [], burned: function () { return 0; } };

  var css = document.createElement("style");
  css.textContent = [
    /* inside Move's card: only the pieces Move does not have */
    "#mdRoot .md-p{margin-bottom:12px}",
    "#mdRoot .md-p .mv-mh{gap:12px}",
    ".md-pi{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--in-25,#F5F8FF);color:var(--in-600,#444CE7);flex:0 0 auto;border:1px solid var(--in-100,#E0EAFF)}",
    ".md-pi svg{width:20px;height:20px}",
    ".md-p .mv-mh .s{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".md-p.is-done .md-pi{background:var(--p-50,#F3FCF8);color:var(--p-700,#2A805A);border-color:var(--p-100,#E6FAF1)}",
    ".md-act{height:40px;padding:0 16px;border-radius:6px;border:1px solid var(--p-600,#299D6B);background:#fff;color:var(--p-700,#2A805A);font:600 14px Roboto,sans-serif;cursor:pointer;flex:0 0 auto;box-shadow:0 3px 0 #CBF0E0}",
    ".md-act:active{transform:translateY(3px);box-shadow:none}",
    ".md-ghost{height:32px;padding:0 10px;border:0;background:none;color:var(--g-600,#475467);font:600 13px Roboto,sans-serif;cursor:pointer;flex:0 0 auto}",
    ".md-done{width:24px;height:24px;border-radius:50%;background:var(--p-600,#299D6B);display:grid;place-items:center;flex:0 0 auto}.md-done svg{width:12px;height:12px}",
    ".md-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}",
    ".md-grid>div{min-width:0}.md-grid .md-gw{grid-column:1 / -1}",
    ".md-grid>div{display:flex}.md-grid>div>.md-p{margin:0;flex:1}",
    ".md-grid>div:not(.md-gw) .mv-mh{flex-wrap:wrap;align-items:flex-start}",
    ".md-grid>div:not(.md-gw) .mv-mh .t{flex:1 1 calc(100% - 52px)}",
    ".md-grid>div:not(.md-gw) .mv-mh .s{white-space:normal}",
    ".md-grid>div:not(.md-gw) .md-act,.md-grid>div:not(.md-gw) .md-ghost{width:100%;margin-top:4px}",
    ".md-grid>div:not(.md-gw) .md-done{position:absolute;top:12px;right:12px}",
    ".md-grid .md-p{position:relative}",
    ".md-grid>div:not(.md-gw) .is-done .mv-mh .t,.md-sw .is-done .mv-mh .t{padding-right:22px}",
    ".md-swhd{font-size:13px;color:var(--g-600,#475467);margin:0 0 10px}",
    ".md-sw{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;margin:0 -16px;padding:0 16px 6px;scrollbar-width:none}",
    ".md-sw::-webkit-scrollbar{display:none}",
    ".md-sw .md-p{flex:0 0 76%;scroll-snap-align:start;margin:0;position:relative}",
    ".md-sw .md-p .mv-mh{flex-direction:column;align-items:flex-start;gap:10px;min-height:168px}",
    ".md-sw .md-p .mv-mh .t{flex:1;width:100%}.md-sw .md-p .mv-mh .s{white-space:normal}",
    ".md-sw .md-act,.md-sw .md-ghost{width:100%}",
    ".md-sw .md-done{position:absolute;top:16px;right:16px}",
    ".md-dots{display:flex;justify-content:center;gap:6px;margin-top:10px}.md-dots i{width:6px;height:6px;border-radius:50%;background:#E4E7EC}.md-dots i.on{background:var(--p-600,#299D6B)}",
    ".md-next{background:var(--in-25,#F5F8FF);border:1px solid var(--in-100,#E0EAFF);border-radius:12px;padding:16px}",
    ".md-next .tt{font-size:17px;font-weight:700;color:var(--g-900,#101828)}.md-next .td{font-size:13px;color:var(--g-600,#475467);margin:4px 0 12px}",
    ".md-wide{width:100%;justify-content:center;height:44px;font-size:14px}",
    ".md-pills{display:flex;flex-wrap:wrap;gap:8px}",
    ".md-pill{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px;border-radius:999px;border:1px solid var(--g-200,#E4E7EC);background:#fff;font:500 13px Roboto,sans-serif;color:var(--g-700,#344054);cursor:pointer}",
    ".md-pill svg{width:12px;height:12px;background:var(--p-600,#299D6B);border-radius:50%;padding:2px;box-sizing:content-box}",
    ".md-pill.on{border-color:var(--p-200,#CBF0E0);background:var(--p-25,#F3FCF8);color:var(--p-700,#2A805A)}",
    ".md-tiles{display:grid;grid-template-columns:1fr 1fr;gap:10px}",
    ".md-tile{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:6px;text-align:left;border:1px solid var(--g-200,#E4E7EC);border-radius:16px;background:#fff;padding:14px;cursor:pointer;font:inherit;min-height:96px}",
    ".md-tile.wide{grid-column:1 / -1;min-height:0;flex-direction:row;align-items:center}",
    ".md-tile.wide .md-ts{margin-left:auto;margin-right:24px}",
    ".md-ti{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;background:var(--in-25,#F5F8FF);color:var(--in-700,#3538CD)}.md-ti svg{width:18px;height:18px}",
    ".md-tn{font-weight:700;font-size:14px;color:var(--g-900,#101828)}.md-ts{font-size:12px;color:var(--g-500,#667085)}",
    ".md-tile.on{border-color:var(--p-200,#CBF0E0);background:var(--p-25,#F3FCF8)}",
    ".md-tk{position:absolute;top:12px;right:12px;width:20px;height:20px;border-radius:50%;background:var(--p-600,#299D6B);display:grid;place-items:center}.md-tk svg{width:11px;height:11px}",
    ".md-reply{margin-top:16px;padding:12px 16px;border-radius:12px;background:var(--in-25,#F5F8FF);color:var(--g-800,#1D2939);font-size:14px;line-height:1.45}",
    ".md-reply.low{background:#FFFBEE}",
    ".md-help{margin-top:16px;padding:16px;border:1px solid #FEF1C7;border-radius:12px;background:#FFFBEE;display:flex;flex-direction:column;gap:8px;font-size:13px;color:var(--g-700,#344054)}",
    ".md-help b{color:var(--g-900,#101828)}.md-help small{font-size:12px;color:var(--g-600,#475467)}.md-help .md-go{align-self:flex-start}",
    ".md-steps{margin:14px 0 10px;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px}",
    ".md-steps li{display:flex;gap:12px;align-items:baseline;font-size:14px;color:var(--g-800,#1D2939)}.md-steps b{min-width:30px;color:var(--in-700,#3538CD);font-variant-numeric:tabular-nums}",
    ".md-tip2{font-size:14px;color:var(--g-700,#344054);background:#FFFBEE;border:1px solid #FEF1C7;border-radius:12px;padding:12px 16px;margin-bottom:16px}",
    ".md-2btn{display:flex;gap:10px}.md-2btn>*{flex:1}",
    ".md-sec{height:48px;border-radius:6px;border:1px solid var(--p-600,#299D6B);background:#fff;color:var(--p-700,#2A805A);font:600 16px Roboto,sans-serif;cursor:pointer;box-shadow:0 4px 0 #CBF0E0}.md-sec:active{transform:translateY(4px);box-shadow:none}",
    ".md-big{--p:0;position:relative}",
    ".md-big::before{content:'';position:absolute;inset:-6px;border-radius:50%;background:conic-gradient(var(--in-600,#444CE7) calc(var(--p)*1%),transparent 0);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 4px),#000 calc(100% - 4px));mask:radial-gradient(farthest-side,transparent calc(100% - 4px),#000 calc(100% - 4px))}",
    ".md-big.done{background:radial-gradient(circle,#F3FCF8,#CBF0E0)}",
    ".md-big i.still{width:120px;height:120px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#A4BCFD,#444CE7);transform:scale(.8)}",
    ".md-big.done i.still{background:radial-gradient(circle at 35% 30%,#A6EBCB,#299D6B)}",
    "#mdRoot .md-row{display:flex;align-items:center;gap:12px}",
    "#mdRoot .md-row + .md-row{border-top:1px solid var(--g-100,#F2F4F7);padding-top:12px}",
    "#mdRoot .md-grp + .md-grp{margin-top:14px;padding-top:14px;border-top:1px solid var(--g-100,#F2F4F7)}",
    "#mdRoot .md-grp .lab{margin:0 0 8px}",
    ".md-rb{flex:1;min-width:0;text-align:left;background:none;border:0;padding:0;cursor:pointer;display:flex;flex-direction:column;gap:2px;font:inherit}",
    ".md-rb .tt{font-weight:600;font-size:14px;color:var(--g-900,#101828)}.md-rb .td{font-size:12px;color:var(--g-500,#667085);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".md-row.done .md-rb .tt{color:var(--g-500,#667085)}",
    ".md-chev{width:16px;flex:0 0 auto;color:var(--g-400,#98A2B3);display:grid;place-items:center}.md-chev svg{width:16px;height:16px}",
    ".md-ring{--p:0;width:36px;height:36px;border-radius:50%;flex:0 0 auto;display:grid;place-items:center;background:conic-gradient(var(--in-600,#444CE7) calc(var(--p)*1%),#E4E7EC 0);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 4px),#000 calc(100% - 4px));mask:radial-gradient(farthest-side,transparent calc(100% - 4px),#000 calc(100% - 4px));position:relative}",
    ".md-ring b{display:none}",
    ".md-opts{display:flex;flex-direction:column;gap:8px;margin:14px 0 6px}",
    ".md-opt{display:flex;align-items:flex-start;gap:12px;text-align:left;border:1px solid var(--g-200,#E4E7EC);border-radius:12px;background:#fff;padding:12px;cursor:pointer;font:inherit}",
    ".md-opt b{display:block;font-size:14px;color:var(--g-900,#101828)}.md-opt small{display:block;font-size:12px;color:var(--g-500,#667085);margin-top:2px}",
    ".md-opt.on{border-color:var(--p-600,#299D6B);background:var(--p-25,#F3FCF8)}",
    ".md-opt .tmark{margin-top:1px}",
    ".md-hrs{font-size:34px;font-weight:700;letter-spacing:-.4px;color:var(--g-900,#101828);font-variant-numeric:tabular-nums;margin:2px 0 12px;display:flex;align-items:baseline;gap:2px}",
    ".md-hrs small{font-size:16px;font-weight:600;color:var(--g-500,#667085);margin-right:4px}",
    ".md-hrs span{font-size:13px;font-weight:500;color:var(--g-500,#667085);margin-left:6px}",
    ".md-trk{position:relative;height:10px;border-radius:999px;background:var(--g-100,#F2F4F7)}",
    ".md-trk .pl{position:absolute;top:0;bottom:0;border-radius:999px;background:var(--in-100,#E0EAFF)}",
    ".md-trk .me{position:absolute;top:-2px;bottom:-2px;border-radius:999px;background:linear-gradient(90deg,#3538CD,#6172F3)}",
    ".md-tks{display:flex;justify-content:space-between;font-size:10px;color:var(--g-400,#98A2B3);margin-top:6px}",
    ".md-cap{font-size:12px;color:var(--g-500,#667085);margin-top:10px;display:flex;align-items:center;flex-wrap:wrap;gap:6px}",
    ".md-key{display:inline-block;width:14px;height:6px;border-radius:3px}.md-key.me{background:#444CE7}.md-key.pl{background:var(--in-100,#E0EAFF);margin-left:6px}",
    ".md-edit{height:30px;padding:0 12px;border-radius:999px;border:1px solid var(--g-200,#E4E7EC);background:#fff;color:var(--g-700,#344054);font:600 12px Roboto,sans-serif;cursor:pointer}",
    ".md-bri{align-items:center}",
    ".md-go{display:inline-flex;align-items:center;gap:6px;height:44px;padding:0 16px;border:0;border-radius:6px;background:var(--p-600,#299D6B);color:#fff;font:600 14px Roboto,sans-serif;cursor:pointer;flex:0 0 auto;box-shadow:0 4px 0 #2A805A}.md-go svg{width:13px;height:13px}",
    ".md-undo{height:30px;padding:0 12px;border-radius:999px;border:1px solid var(--g-200,#E4E7EC);background:#fff;color:var(--g-700,#344054);font:600 12px Roboto,sans-serif;cursor:pointer;flex:0 0 auto}",
    ".md-ok{display:flex;align-items:center;gap:5px;margin-top:4px;font-size:12px;font-weight:600;color:var(--p-700,#2A805A)}.md-ok svg{width:14px;height:14px;background:var(--p-600,#299D6B);border-radius:50%;padding:2px}",
    ".md-at{font-size:12px;font-weight:600;color:var(--g-500,#667085);white-space:nowrap;padding-top:2px;font-variant-numeric:tabular-nums}",
    ".md-faces{display:flex;gap:6px}",
    ".md-face{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;border:1px solid var(--g-200,#E4E7EC);border-radius:12px;background:#fff;padding:10px 0;font:500 11px Roboto,sans-serif;color:var(--g-600,#475467);cursor:pointer}",
    ".md-face span{font-size:22px;line-height:1}",
    ".md-face.on{border-color:var(--p-600,#299D6B);background:var(--p-25,#F3FCF8);color:var(--p-700,#2A805A);font-weight:700}",
    ".md-pl{display:flex;flex-direction:column;align-items:center;gap:10px;padding:18px 0 22px}",
    ".md-big{width:200px;height:200px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,#F5F8FF,#E0EAFF)}",
    "#mdOrb{width:150px;height:150px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#A4BCFD,#444CE7);transform:scale(.55);transition:transform 2s ease-in-out;}",
    ".md-ph{font-size:20px;font-weight:700;color:#3538CD}.md-tm{font-size:14px;color:var(--g-500,#667085);font-variant-numeric:tabular-nums}",
    /* the sleep sheet */
    ".md-pks{display:flex;gap:10px;margin:14px 0}",
    ".md-pk{flex:1;border:1px solid var(--g-200,#E4E7EC);border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:8px}",
    ".md-pk .pl{font-size:12px;color:var(--g-600,#475467);font-weight:600}",
    ".md-seg{display:flex;gap:4px}",
    ".md-seg button{flex:1;height:28px;border:1px solid var(--g-200,#E4E7EC);border-radius:999px;background:#fff;font:600 12px Roboto,sans-serif;color:var(--g-600,#475467);cursor:pointer}",
    ".md-seg button.on{background:var(--p-100,#E6FAF1);border-color:var(--p-100,#E6FAF1);color:var(--p-700,#2A805A)}",
    ".md-tp{display:flex;align-items:center;justify-content:space-between;gap:6px}",
    ".md-tp b{font-size:17px;white-space:nowrap;color:var(--g-900,#101828);font-variant-numeric:tabular-nums}",
    ".md-tp button{width:34px;height:34px;border:1px solid var(--g-200,#E4E7EC);border-radius:10px;background:#fff;color:var(--g-700,#344054);font-size:18px;cursor:pointer}",
    ".md-sum{font-size:14px;color:var(--g-700,#344054);margin-bottom:14px}",
    ".md-sum .bad{color:#D92D20}",
    ".md-save{width:100%;height:48px;border:0;border-radius:6px;background:var(--p-600,#299D6B);color:#fff;font:600 16px Roboto,sans-serif;cursor:pointer;box-shadow:0 4px 0 #2A805A;transition:transform .2s cubic-bezier(.4,0,.2,1),box-shadow .2s cubic-bezier(.4,0,.2,1)}.md-save:active{transform:translateY(4px);box-shadow:0 0 0 #2A805A}",
    ".md-save[disabled]{background:#F2F4F7;color:#98A2B3;box-shadow:none;cursor:not-allowed}"
  ].join("");
  document.head.appendChild(css);

  /* ?tiles=0 takes "What shaped your score?" away, to see the screen without it */
  if (Q.get("tiles") === "0") { var rs = document.getElementById("railSect"); if (rs) rs.hidden = true; }
  render();
  /* ?sheet=sleep opens last night's sheet once the screen is up, for the case document */
  if (Q.get("sheet") === "sleep" && !NOPLAN) setTimeout(sleepSheet, 900);
  /* ?scroll=plan opens the screen at the plan, for the variants doc */
  if (Q.get("scroll") === "plan") setTimeout(function () { root.scrollIntoView({ block: "start" }); window.scrollBy(0, -70); }, 1200);
  var SH = Q.get("sheet");
  if (!NOPLAN && SH) setTimeout(function () {
    if (SH === "mood") moodSheet(); else if (SH === "me") meSheet(); else if (SH === "wd") wdSheet();
    else if (SH === "breath") player(0); else if (SH === "breathrun") { player(0); plShow("run"); }
    else if (SH === "breathpause") { PL = { i: 0, el: 130, k: 0, rest: 0, n: 13 }; plShow("paused"); }
  }, 900);
  /* ?mood= and ?tags= set a check-in for the docs */
  if (Q.get("mood") != null) { S.mood = +Q.get("mood"); S.tags = (Q.get("tags") || "").split(",").filter(Boolean); render(); }
})();
