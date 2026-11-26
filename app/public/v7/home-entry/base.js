/* Home entry points: the shared phone every concept is drawn in (v7/home-entry-points.html, 24 Nov 2026).
   A concept is one file, home-entry/c-<id>.js, that calls HE.add({ id, name, ... , draw(ph) }).
   The phone gives it: the live Home header and tab bar, a sample day from a coach's plan, the clock (the doc's
   Morning/Afternoon/Evening/Night switch), and three helpers every concept logs through:
     ph.next()            the item the day is asking about now (nearest open item at or before the hour, else the next one)
     ph.open()            every item not done yet, in time order; ph.items() is all of them
     ph.log(ids, how)     marks them done, steps the pillar scores up, plays the win moment, then redraws
     ph.sheet(title, html, onTap)   a bottom sheet inside the phone (X top right, title top left, no handle)
     ph.toast(text)
   Colours, type and radii are the live Home's (app/src/tokens.js, ScoreBubbles.jsx), read from the audit. */
(function () {
  var HE = window.HE = { list: [], hour: 8 };

  /* ---------- tokens ---------- */
  var P = HE.P = {
    eat:     { n: "Eat",     score: "Nutrition",  c: "#299D6B", t: "#E6FAF1", w: "#F3FCF8", d: "#2A805A" },
    move:    { n: "Move",    score: "Momentum",   c: "#444CE7", t: "#E0EAFF", w: "#F5F8FF", d: "#3538CD" },
    mind:    { n: "Mind",    score: "Rhythm",     c: "#2DA6A6", t: "#E0FFFF", w: "#F5FFFF", d: "#1F7F7F" },
    measure: { n: "Measure", score: "Measure",    c: "#CDA935", t: "#FFF8E0", w: "#FFFDF5", d: "#A68A2D" }
  };
  HE.ORDER = ["eat", "move", "mind", "measure"];

  /* the pillar glyphs, 24 grid, stroke */
  var G = HE.G = {
    eat: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 1-3 4-3 7h3v11"/>',
    move: '<circle cx="13.5" cy="4.5" r="1.8"/><path d="M9 21l2.5-6 3 2.5V21M7 12l3-3.5 3.5 1 2 3h3M11.5 15 10 9"/>',
    mind: '<path d="M12 20c-4-1.5-7-4.5-7-8.5 2 0 4 1 5 2.5C10 10 11 7 12 5c1 2 2 5 2 9 1-1.5 3-2.5 5-2.5 0 4-3 7-7 8.5Z"/>',
    measure: '<path d="M4 7h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"/><path d="M9 7a3 3 0 0 1 6 0"/><path d="M12 12l2-2"/><circle cx="12" cy="13" r=".6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    chev: '<path d="m9 6 6 6-6 6"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'
  };
  HE.icon = function (k, size, stroke) { return '<svg viewBox="0 0 24 24" width="' + (size || 20) + '" height="' + (size || 20) + '" fill="none" stroke="currentColor" stroke-width="' + (stroke || 2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + G[k] + '</svg>'; };
  /* KAIRA's hexagon, indigo to teal */
  HE.kaira = function (size, white) {
    var id = "kg" + Math.random().toString(36).slice(2, 7);
    return '<svg viewBox="0 0 24 24" width="' + (size || 20) + '" height="' + (size || 20) + '" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#444CE7"/><stop offset="1" stop-color="#2DA6A6"/></linearGradient></defs>' +
      '<path d="M12 2.8 20 7.4v9.2L12 21.2 4 16.6V7.4Z" fill="none" stroke="' + (white ? "#fff" : "url(#" + id + ")") + '" stroke-width="2.2" stroke-linejoin="round"/></svg>';
  };

  /* ---------- the day: a sample coach plan, in time order (hours as decimals) ---------- */
  var DAY = [
    { id: "sleep",  p: "mind",    at: 7,    t: "Last night’s sleep",      sub: "Planned 10:30 PM to 6:00 AM", ask: "How did you sleep last night?",      tell: "Tell us how you slept",      me: "I slept",          kind: "sleep", gain: 14 },
    { id: "weigh",  p: "measure", at: 7.5,  t: "Morning weight",                sub: "On the scale before breakfast", ask: "Have you checked your weight?",      tell: "Step on the scale",          me: "I weighed myself", kind: "num",   gain: 10 },
    { id: "bfast",  p: "eat",     at: 8.5,  t: "Breakfast",                     sub: "Vegetable poha with peanuts, 1 bowl", ask: "Have you had your breakfast?", tell: "Tell us what you had for breakfast", me: "I had breakfast", kind: "meal", gain: 12 },
    { id: "walk",   p: "move",    at: 9,    t: "Morning walk",                  sub: "20 min, easy pace",            ask: "Have you done your morning walk?",   tell: "Log your morning walk",      me: "I went for a walk", kind: "tick",  gain: 15 },
    { id: "lunch",  p: "eat",     at: 13.5, t: "Lunch",                         sub: "2 roti, dal, sabzi, salad",    ask: "Have you had your lunch?",           tell: "Tell us what you had for lunch", me: "I had lunch",   kind: "meal",  gain: 14 },
    { id: "breath", p: "mind",    at: 15,   t: "Simple Breathing",              sub: "5 min, in 5 s and out 5 s",    ask: "Have you done your breathing?",      tell: "Take 5 minutes to breathe",  me: "I did my breathing", kind: "tick", gain: 10 },
    { id: "stairs", p: "move",    at: 16,   t: "Take the stairs",               sub: "A small move, any time",       ask: "Have you taken the stairs?",         tell: "Take the stairs once",       me: "I took the stairs", kind: "tick",  gain: 6 },
    { id: "snack",  p: "eat",     at: 17,   t: "Evening snack",                 sub: "Roasted chana, 1 small bowl",  ask: "Have you had your evening snack?",   tell: "Tell us about your snack",   me: "I had a snack",     kind: "meal",  gain: 8 },
    { id: "gym",    p: "move",    at: 18.5, t: "Strength workout",              sub: "25 min, 6 exercises",          ask: "Have you done your workout?",        tell: "Start your workout",         me: "I did my workout",  kind: "tick",  gain: 20 },
    { id: "dinner", p: "eat",     at: 20.5, t: "Dinner",                        sub: "Grilled paneer, sabzi, 1 roti", ask: "Have you had your dinner?",         tell: "Tell us what you had for dinner", me: "I had dinner",  kind: "meal",  gain: 14 },
    { id: "mood",   p: "mind",    at: 21,   t: "Mood check-in",                 sub: "How the day felt",             ask: "How has your day been?",             tell: "Tell us how the day felt",   me: "My day was",        kind: "mood",  gain: 8 },
    { id: "wind",   p: "mind",    at: 21.5, t: "Phone away, lights low",        sub: "Wind-down, 10:00 PM",          ask: "Have you put your phone away?",      tell: "Start winding down",         me: "Phone is away",     kind: "tick",  gain: 8 }
  ];
  HE.DAY = DAY;
  HE.HOURS = [["Morning", 8], ["Afternoon", 13.5], ["Evening", 18.5], ["Night", 21.25]];
  /* for the doors and hooks (part 2): the last seven days per pillar (today last), the streak, and each pillar's door */
  HE.WEEK = { eat: [52, 61, 48, 70, 66, 58, 38], move: [30, 44, 52, 38, 61, 47, 24], mind: [58, 62, 55, 71, 64, 69, 46], measure: [60, 60, 61, 60, 62, 61, 60] };
  HE.STREAK = 3;   /* days in a row with something logged */
  HE.DOOR = {
    eat: { url: "/v7/r3/eat.html", line: "Nutrition sufficiency", verb: "Log a meal" },
    move: { url: "/move/index.html", line: "Momentum", verb: "Log a workout" },
    mind: { url: "/v7/mind/index.html?sx=1&sdev=ah&swait=0", line: "Rhythm", verb: "Breathe for 5 min" },
    measure: { url: "", line: "Measure", verb: "Weigh in" }
  };
  HE.FACES = [["Awful", "\u{1F623}"], ["Low", "\u{1F615}"], ["Okay", "\u{1F610}"], ["Good", "\u{1F642}"], ["Great", "\u{1F604}"]];
  /* which due item comes first: before noon the earliest (last night's sleep before the morning weight),
     after it the one nearest to now (the workout at 6:30 PM, not the breakfast nobody logged) */
  HE.rank = function (l) { return l.slice().sort(function (a, b) { return HE.hour < 12 ? a.at - b.at : b.at - a.at; }); };
  HE.clock = function (h) { var m = Math.round(h * 60), hh = Math.floor(m / 60) % 24, mm = m % 60; return ((hh % 12) || 12) + ":" + (mm < 10 ? "0" : "") + mm + " " + (hh < 12 ? "AM" : "PM"); };
  HE.part = function (h) { return h < 12 ? "morning" : h < 17 ? "afternoon" : h < 21 ? "evening" : "night"; };

  /* ---------- the phone ---------- */
  var CSS = document.createElement("style");
  CSS.textContent = [
    ".he-ph{position:relative;width:360px;height:740px;border-radius:44px;background:#fff;box-shadow:0 0 0 10px #101828,0 0 0 11px #344054,0 30px 60px -20px rgba(16,24,40,.45);overflow:hidden;font-family:Roboto,system-ui,sans-serif;color:#101828;isolation:isolate}",
    ".he-sb{height:44px;display:flex;align-items:center;justify-content:space-between;padding:0 26px 0 30px;font:600 15px/1 Roboto;flex:none}",
    ".he-sb i{width:96px;height:28px;border-radius:20px;background:#101828;margin-left:-20px}",
    ".he-top{display:flex;align-items:center;gap:8px;padding:6px 16px 10px;border-bottom:1px solid #F2F4F7;flex:none;background:#fff}",
    ".he-cb{width:36px;height:36px;border-radius:50%;border:1px solid #E4E7EC;display:grid;place-items:center;color:#344054;background:#fff;flex:none}",
    ".he-coin{height:32px;padding:0 12px;border-radius:999px;background:#FFFBEE;border:1px solid #FEF1C7;color:#A68A2D;font:700 12px/1 Roboto;display:flex;align-items:center;gap:6px}",
    ".he-coin b{width:14px;height:14px;background:linear-gradient(135deg,#E7C144,#A68A2D);clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)}",
    ".he-col{position:absolute;inset:0;display:flex;flex-direction:column}",
    ".he-body{flex:1;overflow-y:auto;overflow-x:hidden;scrollbar-width:none;background:#fff}.he-body::-webkit-scrollbar{display:none}",
    ".he-slot{padding:16px 16px 8px}",
    ".he-after{padding:8px 16px 120px;display:flex;flex-direction:column;gap:12px}",
    ".he-ghost{border:1px solid #F2F4F7;border-radius:16px;padding:14px;color:#98A2B3;font:600 12px/1.4 Roboto}",
    ".he-ghost .bar{height:8px;border-radius:4px;background:#F2F4F7;margin-top:10px}.he-ghost .bar.s{width:60%}",
    ".he-tab{position:absolute;left:0;right:0;bottom:0;height:78px;background:#fff;border-top:1px solid #F2F4F7;display:flex;justify-content:space-around;padding-top:10px;z-index:5}",
    ".he-tab span{display:flex;flex-direction:column;align-items:center;gap:4px;font:500 10.5px/1 Roboto;color:#98A2B3;width:56px}.he-tab span.on{color:#299D6B}",
    ".he-tab i{width:22px;height:22px;border-radius:7px;border:2px solid currentColor;opacity:.75}",
    ".he-fab{position:absolute;right:16px;bottom:92px;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#444CE7,#2DA6A6);display:grid;place-items:center;box-shadow:0 20px 25px -5px rgba(16,24,40,.1),0 8px 10px -6px rgba(16,24,40,.1);z-index:6;border:0;cursor:pointer}",
    ".he-home{position:absolute;bottom:8px;left:50%;width:120px;height:5px;margin-left:-60px;border-radius:3px;background:#101828;z-index:9}",
    /* the sheet inside the phone: circle X top right, title top left, no handle, at most 90% tall */
    ".he-scrim{position:absolute;inset:0;background:rgba(16,24,40,.4);opacity:0;pointer-events:none;transition:opacity .3s cubic-bezier(.2,0,0,1);z-index:20}",
    ".he-sheet{position:absolute;left:0;right:0;bottom:0;max-height:90%;overflow-y:auto;background:#fff;border-radius:24px 24px 0 0;padding:20px 16px 34px;transform:translateY(105%);transition:transform .38s cubic-bezier(.2,0,0,1);z-index:21}",
    ".he-ph.sh .he-scrim{opacity:1;pointer-events:auto}.he-ph.sh .he-sheet{transform:none}",
    ".he-shd{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px}.he-shd h4{margin:0;font:700 18px/26px Roboto}.he-shd small{display:block;font:400 13px/18px Roboto;color:#667085;margin-top:2px}",
    ".he-x{width:32px;height:32px;border-radius:50%;border:0;background:#F2F4F7;color:#344054;display:grid;place-items:center;cursor:pointer;flex:none}",
    /* GoodFlip buttons: primary green on its ledge, secondary white on a mint ledge */
    ".he-pri{width:100%;height:48px;border:0;border-radius:12px;background:#299D6B;color:#fff;font:700 15px/1 Roboto;box-shadow:0 5px 0 #2A805A;cursor:pointer;transition:transform .2s ease-out,box-shadow .2s ease-out}.he-pri:active{transform:translateY(5px);box-shadow:none}",
    ".he-sec{width:100%;height:46px;border:1px solid #299D6B;border-radius:12px;background:#fff;color:#2A805A;font:700 15px/1 Roboto;box-shadow:0 4px 0 #CBF0E0;cursor:pointer}.he-sec:active{transform:translateY(4px);box-shadow:none}",
    ".he-chip{height:36px;padding:0 14px;border-radius:999px;border:1px solid #E4E7EC;background:#fff;font:600 13px/1 Roboto;color:#344054;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:background .2s,border-color .2s}",
    ".he-chip:active{background:#F9FAFB}",
    ".he-toast{position:absolute;left:16px;right:16px;bottom:96px;padding:12px 14px;border-radius:12px;background:#101828;color:#fff;font:500 13px/18px Roboto;opacity:0;transform:translateY(8px);transition:all .3s cubic-bezier(.2,0,0,1);z-index:30;pointer-events:none}.he-toast.on{opacity:1;transform:none}",
    /* the win moment, Eat's and Move's: green sweeps out of the tap, the logged pill, the big gain, one line */
    ".he-win{position:absolute;inset:0;z-index:40;display:grid;place-items:center;pointer-events:none}",
    ".he-win .g{position:absolute;inset:0;background:radial-gradient(circle at var(--x) var(--y),#34B27B,#299D6B 60%);clip-path:circle(0 at var(--x) var(--y));transition:clip-path .55s cubic-bezier(.4,0,.2,1)}",
    ".he-win.on .g{clip-path:circle(150% at var(--x) var(--y))}",
    ".he-win .c{position:relative;text-align:center;color:#fff;opacity:0;transform:translateY(10px);transition:all .4s cubic-bezier(.2,0,0,1) .35s}.he-win.on .c{opacity:1;transform:none}",
    ".he-win .pill{display:inline-flex;align-items:center;gap:8px;height:34px;padding:0 14px 0 6px;border-radius:999px;background:rgba(255,255,255,.18);font:600 14px/1 Roboto}",
    ".he-win .pill b{width:22px;height:22px;border-radius:50%;background:#fff;color:#299D6B;display:grid;place-items:center}",
    ".he-win .n{font:700 64px/1 Roboto;margin:18px 0 8px;letter-spacing:-1px}.he-win .n sup{font-size:26px;vertical-align:28px}",
    ".he-win .l{font:400 15px/20px Roboto;opacity:.9}",
    ".he-win.out{opacity:0;transition:opacity .35s ease}",
    /* a pillar opened from a door: the real prototype slides in from the right, Home stays behind it */
    ".he-pv{position:absolute;inset:44px 0 0;z-index:35;background:#fff;transform:translateX(100%);transition:transform .42s cubic-bezier(.2,0,0,1);box-shadow:-12px 0 30px -18px rgba(16,24,40,.35)}.he-pv.on{transform:none}",
    ".he-pv iframe{width:100%;height:100%;border:0;display:block}",
    ".he-back{position:absolute;left:12px;top:8px;z-index:2;width:36px;height:36px;border-radius:50%;border:1px solid #E4E7EC;background:rgba(255,255,255,.92);backdrop-filter:blur(6px);display:grid;place-items:center;color:#344054;cursor:pointer}",
    ".he-pv0{padding:80px 28px;display:flex;flex-direction:column;gap:8px;font:400 14px/20px Roboto;color:#667085}.he-pv0 b{font:700 22px/28px Roboto;color:#101828}",
    "@media (prefers-reduced-motion: reduce){.he-win .g{transition:none}.he-sheet{transition:none}}"
  ].join("");
  document.head.appendChild(CSS);

  HE.add = function (c) { HE.list.push(c); };

  /* one phone for one concept, with its own day so the phones never share ticks */
  HE.phone = function (host, c) {
    var el = document.createElement("div"); el.className = "he-ph";
    el.innerHTML = '<div class="he-col"><div class="he-sb"><span class="tm"></span><i></i><span style="font-size:12px">●●●</span></div>' +
      '<div class="he-top"><span class="he-cb">' + '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>' + '</span>' +
      '<span class="he-coin"><b></b><span class="cn">101</span> Flipcoins</span><span style="flex:1"></span>' +
      '<span class="he-cb"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/></svg></span>' +
      '<span class="he-cb"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg></span>' +
      '<span class="he-cb"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg></span></div>' +
      '<div class="he-body"><div class="he-slot"></div><div class="he-after">' +
        '<div class="he-ghost">Smart Devices<div class="bar"></div><div class="bar s"></div></div>' +
        '<div class="he-ghost">Your program<div class="bar"></div><div class="bar s"></div></div></div></div></div>' +
      '<button class="he-fab" aria-label="Ask KAIRA">' + HE.kaira(24, true) + '</button>' +
      '<div class="he-tab">' + ["Home", "To-do", "Measure", "Care", "More"].map(function (t, i) { return '<span class="' + (i ? "" : "on") + '"><i></i>' + t + '</span>'; }).join("") + '</div>' +
      '<div class="he-scrim"></div><div class="he-sheet"></div><div class="he-toast"></div><div class="he-home"></div>';
    host.appendChild(el);
    var slot = el.querySelector(".he-slot"), sheet = el.querySelector(".he-sheet"), scrim = el.querySelector(".he-scrim");
    var done = {}, scores = { eat: 38, move: 24, mind: 46, measure: 60 }, coins = 101, onTap = null, lastTap = null;
    var ph = {
      el: el, slot: slot, P: P, scores: scores,
      get hour() { return HE.hour; },
      items: function () { return DAY.map(function (x) { return Object.assign({ done: !!done[x.id] }, x); }); },
      open: function () { return ph.items().filter(function (x) { return !x.done; }); },
      /* what the day asks about now: HE.rank's first due item, else the next one coming */
      next: function () { return ph.due()[0] || ph.open()[0] || null; },
      due: function () { return HE.rank(ph.open().filter(function (x) { return x.at <= HE.hour + .25; })); },
      isDone: function (id) { return !!done[id]; },
      log: function (ids, opt) {
        ids = [].concat(ids).filter(function (id) { return !done[id]; }); opt = opt || {};
        if (!ids.length) return;
        var items = DAY.filter(function (x) { return ids.indexOf(x.id) > -1; }), gain = 0, ps = {};
        items.forEach(function (x) { done[x.id] = opt.how || true; gain += x.gain; ps[x.p] = 1; scores[x.p] = Math.min(100, scores[x.p] + x.gain); });
        coins += items.length;
        ph.closeSheet();
        var one = items.length === 1, p = Object.keys(ps);
        var title = one ? (items[0].kind === "meal" ? items[0].t + " logged" : items[0].kind === "sleep" ? "Sleep logged" : items[0].kind === "mood" ? "Mood checked in" : items[0].kind === "num" ? "Weight logged" : "Done") : items.length + " items logged";
        var line = p.length === 1 ? "added to your " + P[p[0]].score + " score" : "added to your scores";
        if (opt.quiet) { ph.draw(); return; }
        win(title, Math.round(gain / (one ? 1 : 1.4)), line, opt.at || lastTap);
      },
      undo: function (id) { delete done[id]; ph.draw(); },
      sheet: function (title, html, tap, sub) {
        sheet.innerHTML = '<div class="he-shd"><div><h4>' + title + '</h4>' + (sub ? "<small>" + sub + "</small>" : "") + '</div><button class="he-x" data-he="x" aria-label="Close">' + HE.icon("x", 16, 2.4) + '</button></div>' + html;
        onTap = tap || null; el.classList.add("sh");
      },
      closeSheet: function () { el.classList.remove("sh"); onTap = null; },
      /* the item a pillar's door points at: its due item first (HE.rank order), else its next one */
      pillarNext: function (p) { var d = ph.due().filter(function (x) { return x.p === p; }); return d[0] || ph.open().filter(function (x) { return x.p === p; })[0] || null; },
      /* a door opens the real pillar prototype inside the phone, with a back button (Measure has no screen yet) */
      openPillar: function (p) {
        var v = el.querySelector(".he-pv"); if (v) v.remove();
        v = document.createElement("div"); v.className = "he-pv";
        v.innerHTML = '<button class="he-back" aria-label="Back to Home"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>' +
          (HE.DOOR[p].url ? '<iframe src="' + HE.DOOR[p].url + '" title="' + P[p].n + '" loading="lazy"></iframe>' :
            '<div class="he-pv0"><b>' + P[p].n + '</b><span>Measure has no screen of its own yet. Its door would open the weight, vitals and devices here.</span></div>');
        el.appendChild(v); void v.offsetWidth; v.classList.add("on");
        v.querySelector(".he-back").onclick = function () { v.classList.remove("on"); setTimeout(function () { v.remove(); }, 380); };
      },
      toast: function (t) { var o = el.querySelector(".he-toast"); o.textContent = t; o.classList.add("on"); clearTimeout(o.t); o.t = setTimeout(function () { o.classList.remove("on"); }, 2200); },
      draw: function () {
        el.querySelector(".tm").textContent = HE.clock(HE.hour).replace(/ [AP]M/, "");
        el.querySelector(".cn").textContent = coins;
        slot.innerHTML = ""; c.draw(ph);
      }
    };
    /* where the last tap was, so the green sweeps out of it */
    el.addEventListener("pointerdown", function (e) { var r = el.getBoundingClientRect(); lastTap = { x: e.clientX - r.left, y: e.clientY - r.top }; }, true);
    sheet.addEventListener("click", function (e) {
      if (e.target.closest('[data-he="x"]')) return ph.closeSheet();
      if (onTap) onTap(e);
    });
    scrim.addEventListener("click", ph.closeSheet);
    function win(title, gain, line, at) {
      var w = document.createElement("div"); w.className = "he-win";
      w.style.setProperty("--x", (at ? at.x : 180) + "px"); w.style.setProperty("--y", (at ? at.y : 370) + "px");
      w.innerHTML = '<div class="g"></div><div class="c"><span class="pill"><b>' + HE.icon("check", 14, 3) + '</b>' + title + '</span><div class="n">+' + gain + '<sup>%</sup></div><div class="l">' + line + '</div></div>';
      el.appendChild(w); void w.offsetWidth; w.classList.add("on");
      setTimeout(function () { ph.draw(); }, 600);   /* the day is redrawn under the green, never seen changing */
      setTimeout(function () { w.classList.add("out"); setTimeout(function () { w.remove(); }, 380); }, 2100);
      w.style.pointerEvents = "auto"; w.onclick = function () { w.classList.add("out"); setTimeout(function () { w.remove(); }, 380); };
    }
    HE.phones.push(ph);
    ph.draw();
    return ph;
  };
  HE.phones = [];
  HE.setHour = function (h) { HE.hour = h; HE.phones.forEach(function (p) { p.closeSheet(); p.draw(); }); };
})();
