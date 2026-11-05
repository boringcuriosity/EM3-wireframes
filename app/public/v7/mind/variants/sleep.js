/* Mind: last night's sleep, four variants drawn on the real screen (research/sleep.html).
   ?vsleep=a  Night bar card: its own card above the plan, hours as the hero, the night as a bar over the coach's window, wheel sheet
   ?vsleep=b  Clock card: the night as an arc on a 24-hour clock, drag the moon and sun in the sheet
   ?vsleep=c  Hours first, two time tiles: no picture, minus and plus in the sheet
   ?vsleep=d  A row in the plan: the Morning row with a small bar, drag the ends of the night in the sheet
   ?vsleep=e  A, slimmed: the tiles go, every fact said once
   ?vsleep=f  Night indigo card, teal window and "on time"
   ?vsleep=g  One row with a hairline bar, teal chip for "on time"
   ?vsleep=h  The bar is the card: plan times in the teal window, last night's times inside the indigo bar
              (E to H were dropped by the user, 2 Nov; their code stays)
   ?vsleep=i  A without its two tiles. Also the split night: ?sstate=split (entered) or split-synced (two sessions from Health),
              and "+ Add another sleep" in the sheet. ?skin=white (default), soft, scene, deep changes only the look.
   ?sstate=   synced (default) | short | nap | none | manual | edited | noperm
   ?spos=below puts the card under the plan, where Move keeps steps. ?os=android names Health Connect.
   ?sheet=sleep opens the sheet, ?sheet=sleepinfo the points, ?sheet=sleepperm the connect sheet.
   Hours count from falling asleep to waking, as rhythm.js does. */
(function () {
  var MD = window.MDPLAN; if (!MD) return;
  var Q = MD.Q, V = (Q.get("vsleep") || "a").toLowerCase(), P = MD.P, S = MD.S;
  /* J: I with the facts said once. Hours and the times in two plain lines (no "short", no "on time"), the bar without
     its pins, and a legend under it naming last night and the plan. The targets live in "What shaped your score?" */
  var J = V === "j"; if (J) V = "i";
  var AND = /android/i.test(Q.get("os") || ""), NAME = AND ? "Health Connect" : "Apple Health";
  var RD = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var PLAN = { bed: MD.bedM(P.bed), wake: MD.wakeM(P.wake), hours: Math.round(P.hours * 60) };
  var NOWM = 1440 + Math.round(MD.now * 60), PREV = { bed: PLAN.bed + 15, wake: PLAN.wake + 5 };
  var PICK = { a: "wheel", b: "dial", c: "stepper", d: "drag" }[V] || "wheel";   /* e to h reuse A's sheet: two fields, the wheel, presets */

  /* ---------- the night as it came in ---------- */
  var SY = { bed: PLAN.bed + 20, wake: PLAN.wake + 10 }, SH = { bed: 1690, wake: 1815 };
  var SP = { bed: PLAN.bed + 20, wake: PLAN.wake + 10, segs: [{ bed: PLAN.bed + 20, wake: 1590 }, { bed: 1630, wake: PLAN.wake + 10 }] };
  var K = Q.get("sstate") || "synced";
  var ST = {
    synced: { perm: true, src: "health", night: SY, health: SY },
    short: { perm: true, src: "health", night: SH, health: SH, odd: true },
    nap: { perm: true, src: "health", night: SY, health: SY, nap: [900, 940] },
    none: { perm: true, src: null, night: null, health: null },
    manual: { perm: true, src: "manual", night: { bed: PLAN.bed + 30, wake: PLAN.wake + 30 }, health: null },
    edited: { perm: true, src: "edited", night: { bed: PLAN.bed + 45, wake: PLAN.wake + 15 }, health: SH },
    noperm: { perm: false, src: null, night: null, health: null },
    /* a split night: asleep 10:50 PM, awake 2:30 to 3:10 AM, asleep again until 6:10 AM */
    split: { perm: true, src: "manual", night: SP, health: null },
    "split-synced": { perm: true, src: "health", night: SP, health: SP },
    /* doc-only (v7/mind-rhythm.html): typed in by hand while Health is not connected, so the Connect strip stays */
    "manual-noperm": { perm: false, src: "manual", night: { bed: PLAN.bed + 30, wake: PLAN.wake + 30 }, health: null }
  }[K] || null;
  if (!ST) { K = "synced"; ST = { perm: true, src: "health", night: SY, health: SY }; }
  function put(n) { S.bed = n ? n.bed : null; S.wake = n ? n.wake : null; S.segs = n && n.segs || null; }   /* rhythm.js counts a split night's time asleep only */
  put(ST.night);

  /* ---------- words ---------- */
  var clk = MD.nice;
  function dur(m) { m = Math.max(0, Math.round(m)); return Math.floor(m / 60) + "h " + ("0" + m % 60).slice(-2) + "m"; }
  function gap(m) { m = Math.round(Math.abs(m)); var h = Math.floor(m / 60), x = m % 60; return h ? h + "h" + (x ? " " + x + "m" : "") : x + " min"; }
  function dayOf(m, k) { return k === "bed" ? (m < 1440 ? "last night" : "after midnight") : (m < 2160 ? "this morning" : "this afternoon"); }
  /* a split night counts only the time asleep; its timing is the first bedtime and the last wake */
  var len = function (n) { return n.segs ? n.segs.reduce(function (a, x) { return a + x.wake - x.bed; }, 0) : n.wake - n.bed; };
  var awake = function (n) { return n.segs ? n.wake - n.bed - len(n) : 0; };
  function pts(n) {
    if (!n) return { h: 0, w: 0 };
    var s = len(n) / 60, T = P.hours, h = s < T ? Math.max(0, 1 - (T - s) / P.short) : P.exOn && s > T + P.grace ? Math.max(0, 1 - (s - T - P.grace) * P.exPen / 100) : 1;
    var e = function (d) { return d <= P.tol ? 1 : d >= P.zero ? 0 : 1 - (d - P.tol) / (P.zero - P.tol); };
    return { h: Math.round(P.w.hours * h), w: Math.round(P.w.window * (e(Math.abs(n.bed - PLAN.bed)) + e(Math.abs(n.wake - PLAN.wake))) / 2) };
  }
  function timing(n) {
    var b = n.bed - PLAN.bed, w = n.wake - PLAN.wake;
    if (Math.abs(b) <= P.tol && Math.abs(w) <= P.tol) return { ok: true, v: "On time", s: "Within " + P.tol + " min of your plan" };
    var big = Math.abs(b) >= Math.abs(w) ? ["Bed", b] : ["Up", w];
    return { ok: false, v: big[0] + " " + gap(big[1]) + (big[1] > 0 ? " late" : " early"), s: "Plan " + clk(PLAN.bed) + " to " + clk(PLAN.wake) };
  }
  function hours(n) { var a = len(n), d = PLAN.hours - a; return { v: dur(a), s: d > 0 ? gap(d) + " short of " + dur(PLAN.hours) : "Your " + dur(PLAN.hours) + " reached", pct: Math.min(100, a / PLAN.hours * 100) }; }

  var I = {
    moon: MD.IC.moon,
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    hours: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14M5 2h14M17 22v-4.2a2 2 0 0 0-.6-1.4L12 12l-4.4 4.4a2 2 0 0 0-.6 1.4V22M7 2v4.2a2 2 0 0 0 .6 1.4L12 12l4.4-4.4a2 2 0 0 0 .6-1.4V2"/></svg>',
    ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg>',
    pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
  };

  /* ---------- the night as a bar against the window, 8 PM to 10 AM ---------- */
  var A0 = 1200, A1 = 2040;
  var pc = function (m) { return Math.max(0, Math.min(100, (m - A0) / (A1 - A0) * 100)); };
  var AX = [1200, 1440, 1680, 1920];
  function bar(n, o) {
    o = o || {};
    var band = '<span class="band" style="left:' + pc(PLAN.bed) + '%;width:' + (pc(PLAN.wake) - pc(PLAN.bed)) + '%"></span>';
    var b = n && n.segs ? n.segs.map(function (x, i) { return (i ? '<span class="gap" style="left:' + pc(n.segs[i - 1].wake) + '%;width:' + Math.max(0, pc(x.bed) - pc(n.segs[i - 1].wake)) + '%"></span>' : "") + '<span class="bar" style="left:' + pc(x.bed) + '%;width:' + Math.max(0, pc(x.wake) - pc(x.bed)) + '%"></span>'; }).join("")
      : n ? '<span class="bar" style="left:' + pc(n.bed) + '%;width:' + Math.max(0, pc(n.wake) - pc(n.bed)) + '%"></span>'
 : "";
    var pins = o.mini || J ? "" : '<span class="pin" style="left:' + pc(PLAN.bed) + '%">' + clk(PLAN.bed) + '</span><span class="pin" style="left:' + pc(PLAN.wake) + '%">' + clk(PLAN.wake) + '</span>';
    var ax = o.mini || o.noaxis ? "" : '<div class="ax" aria-hidden="true">' + AX.map(function (m) { return '<span style="left:' + pc(m) + '%">' + clk(m).replace(":00", "") + '</span>'; }).join("") + '</div>';
    var lbl = (n ? "Slept " + clk(n.bed) + " to " + clk(n.wake) + ". " : "") + "Your plan is " + clk(PLAN.bed) + " to " + clk(PLAN.wake) + ".";
    var lg = J && !o.mini ? '<div class="sv-lg" aria-hidden="true">' + (n ? '<span><i class="lb"></i>Last night</span>' : "") + '<span><i class="lp"></i>Sleep window' + (o.inSheet ? "" : ", " + clk(PLAN.bed) + " to " + clk(PLAN.wake)) + '</span></div>' : "";
    return '<div class="sv-tl' + (o.mini ? " mini" : "") + (J ? " j" : "") + '" role="img" aria-label="' + lbl + '">' + pins + '<div class="tr">' + band + b + '</div>' + ax + lg + '</div>';
  }

  /* ---------- B: the clock ---------- */
  var ang = function (m) { return ((m % 1440) + 1440) % 1440 / 4; };
  var pt = function (c, r, a) { var t = (a - 90) * Math.PI / 180; return [c + r * Math.cos(t), c + r * Math.sin(t)]; };
  function arc(c, r, m0, m1) {
    var sw = Math.min(359.9, (m1 - m0) / 4); if (sw <= 0) return "";
    var p0 = pt(c, r, ang(m0)), p1 = pt(c, r, ang(m0) + sw);
    return "M" + p0[0].toFixed(2) + " " + p0[1].toFixed(2) + " A" + r + " " + r + " 0 " + (sw > 180 ? 1 : 0) + " 1 " + p1[0].toFixed(2) + " " + p1[1].toFixed(2);
  }
  function dial(n, size, big) {
    var c = size / 2, w = big ? 22 : 12, r = c - (big ? 26 : 10);
    var lab = [[0, "12 AM"], [360, "6 AM"], [720, "12 PM"], [1080, "6 PM"]].map(function (x) { var p = pt(c, r - w / 2 - (big ? 16 : 10), ang(x[0])); return '<text x="' + p[0].toFixed(1) + '" y="' + (p[1] + 3).toFixed(1) + '" text-anchor="middle" font-size="' + (big ? 10 : 8) + '" fill="#98A2B3" font-family="Roboto">' + (big ? x[1] : x[1].split(" ")[0]) + '</text>'; }).join("");
    var s = '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="none" stroke="#F2F4F7" stroke-width="' + w + '"/><path d="' + arc(c, r, PLAN.bed, PLAN.wake) + '" fill="none" stroke="#E0EAFF" stroke-width="' + w + '" stroke-linecap="round"/>' +
      '<path d="' + arc(c, r + w / 2 + 3, PLAN.bed, PLAN.wake) + '" fill="none" stroke="#C7D7FE" stroke-width="1.5" stroke-dasharray="3 3"/>' + lab;
    if (n) s += '<path d="' + arc(c, r, n.bed, n.wake) + '" fill="none" stroke="url(#svg' + size + ')" stroke-width="' + (w - 6) + '" stroke-linecap="round"/>';
    if (big && n) {
      [["bed", n.bed, I.moon, "Fell asleep"], ["wake", n.wake, I.sun, "Woke up"]].forEach(function (h) {
        var p = pt(c, r, ang(h[1]));
        s += '<g class="hd" data-h="' + h[0] + '" tabindex="0" role="slider" aria-label="' + h[3] + '" aria-valuetext="' + clk(h[1]) + '" transform="translate(' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ')"><circle r="17" fill="#fff" stroke="#444CE7" stroke-width="2"/>' +
          '<g color="#444CE7">' + h[2].replace("<svg ", '<svg x="-9" y="-9" width="18" height="18" ') + '</g></g>';
      });
      s += '<text x="' + c + '" y="' + (c + 4) + '" text-anchor="middle" font-size="24" font-weight="700" fill="#3538CD" font-family="Roboto">' + dur(len(n)) + '</text><text x="' + c + '" y="' + (c + 22) + '" text-anchor="middle" font-size="11" fill="#667085" font-family="Roboto">of sleep</text>';
    }
    return '<svg class="' + (big ? "dd" : "dial") + '" viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="' + (n ? "Slept " + clk(n.bed) + " to " + clk(n.wake) + ", " : "") + 'plan ' + clk(PLAN.bed) + ' to ' + clk(PLAN.wake) + '">' +
      '<defs><linearGradient id="svg' + size + '" x1="0" x2="1"><stop offset="0" stop-color="#6172F3"/><stop offset="1" stop-color="#4F50B8"/></linearGradient></defs>' + s + '</svg>';
  }

  /* ---------- the pieces of the card ---------- */
  function strip() {
    var hk = '<i class="hk' + (AND ? " hc" : "") + '"></i>';
    if (J && ST.src === "manual" && ST.perm) return "";   /* J: times they typed need no label; not connected keeps the Connect strip */
    if (ST.src === "manual" && (ST.perm || !J)) return '<div class="mv-sync"><span class="src"><i class="hk sv-me">' + I.pencil + '</i>Entered by you</span><span class="at">' + (ST.at || "7:12 AM") + '</span></div>';
    if (!ST.perm) return '<button class="mv-sync off" data-sv="perm">' + hk + '<span class="tx"><b>' + (AND ? "Turn on Health Connect" : "Connect Apple Health") + '</b><span>Your sleep fills in by itself</span></span>' + MD.IC.chev + '</button>';
    if (!ST.night) return '<div class="mv-sync"><span class="src">' + hk + 'From ' + NAME + '</span><span class="at">No sleep synced yet</span></div>';
    if (ST.src === "edited") return '<div class="mv-sync"><span class="src">' + hk + 'From ' + NAME + ', edited by you</span></div>';
    return '<div class="mv-sync"><span class="src">' + hk + 'From ' + NAME + '</span><span class="at">Updated 7:22 AM</span></div>';
  }
  /* J: the short-sync note, a slim ribbon in the gold of Eat's "logging in future" ribbon (v7/future-time-options.html, B).
     Fix opens the sheet; X keeps Health's times and puts the note away */
  var XS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  function oddNote(n) {
    return '<div class="so so-a">' + I.warn + '<span>' + NAME + ' shows ' + dur(len(n)) + '. If you slept more, fix it.</span>' +
      '<button class="so-fix" data-sv="edit">Fix</button><button class="so-x" data-sv="oddok" aria-label="Keep these times">' + XS + '</button></div>';
  }
  function notes() {
    var h = "", n = ST.night;
    if (J && ST.odd && ST.src === "health") h += ST.oddOk ? "" : oddNote(n);
    else if (ST.odd && ST.src === "health") h += '<div class="sv-note warn">' + I.warn + '<span>Only ' + dur(len(n)) + ' came through from ' + NAME + '. If you slept longer, <button class="sv-lk" data-sv="edit">fix the times</button>.</span></div>';
    if (ST.nap) h += '<div class="sv-note">' + I.moon + '<span>' + NAME + ' also has a ' + gap(ST.nap[1] - ST.nap[0]) + ' nap yesterday at ' + clk(ST.nap[0]) + '. Your hours count the night.</span></div>';
    return h;
  }
  function empty() {
    if (!ST.perm) return { t: "Add last night", s: "Enter the times, or connect " + NAME + " to fill them in by itself.", b: "Enter Last Night", sec: false };
    return { t: "We haven’t received last night’s sleep yet", s: "Wait for it to sync, or log it yourself.", b: "Enter Last Night", sec: false };
  }
  function emptyCard(pic) {
    if (J) return jEmpty();
    var c = empty();
    return '<div class="mv-sc sv-sc"><div class="sv-et">' + (pic || "") + '<div><div class="sv-t">' + c.t + '</div><div class="mv-sub">' + c.s + '</div></div></div>' + (pic ? "" : bar(null, {})) +
      '<button class="sv-cta' + (c.sec ? " sec" : "") + '" data-sv="edit">' + c.b + '</button></div>';
  }
  var EDIT = '<button class="mv-logbtn" data-sv="edit">' + I.pencil + 'Edit</button>';
  function tiles(n) {
    var h = hours(n), t = timing(n);
    return '<div class="sv-rds"><div class="sv-rd"><span class="l">' + I.hours + 'Hours</span><span class="v">' + h.v + '</span><span class="s">' + h.s + '</span><span class="mt"><i style="width:' + h.pct + '%"></i></span></div>' +
      '<div class="sv-rd"><span class="l">' + I.clock + 'Timing</span><span class="v">' + (t.ok ? I.ok : "") + t.v + '</span><span class="s">' + t.s + '</span></div></div>';
  }
  /* J's top lines: how long, then when, with the moon and sun saying which time is which */
  function jHead(n) {
    var aw = n.segs ? 'Awake ' + gap(awake(n)) + (n.segs.length > 2 ? ' in ' + (n.segs.length - 1) + ' breaks' : ' at ' + clk(n.segs[0].wake)) : '';
    var mw = function (ic, l, m) { return '<span class="jh-t">' + ic + '<span>' + l + ' <b>' + clk(m) + '</b></span></span>'; };
    /* the times sit under the hours across the card's full width, so Slept and Woke up stay side by side */
    return '<div class="mv-sh"><div class="t"><div class="mv-big">' + dur(len(n)) + ' <span>of sleep</span></div></div>' + EDIT + '</div>' +
      '<div class="jh-r">' + mw(MOONF, "Slept", n.bed) + mw(SUNF, "Woke up", n.wake) + '</div>' + (aw ? '<div class="mv-sub">' + aw + '</div>' : '');
  }
  /* J with nothing for last night: Log sleep at the top right, as Move's Log steps, over the empty sleep window */
  function jEmpty() {
    var c = empty();
    return '<div class="mv-sc sv-sc"><div class="mv-sh"><div class="t"><div class="sv-t">' + c.t + '</div>' + (c.s ? '<div class="mv-sub">' + c.s + '</div>' : "") + '</div>' +
      '<button class="mv-logbtn" data-sv="edit">' + PLUSQ + 'Log sleep</button></div>' + bar(null, {}) + '</div>';
  }
  var CARD = {
    /* I: A exactly, without the Hours and Timing tiles. What the tiles said comes back in A's own two lines:
       "short" after the hours, timing after the times, and a split night's awake time beside the times */
    i: function () {
      var n = ST.night; if (!n) return emptyCard();
      var d = PLAN.hours - len(n), t = timing(n);
      if (J) return '<div class="mv-sc sv-sc">' + jHead(n) + bar(n) + notes() + '</div>';
      return '<div class="mv-sc sv-sc"><div class="mv-sh"><div class="t"><div class="mv-big">' + dur(len(n)) + ' <span>of sleep' + (d > 0 ? ', ' + gap(d) + ' short' : '') + '</span></div>' +
        '<div class="mv-sub">' + clk(n.bed) + ' to ' + clk(n.wake) + (n.segs ? ', awake ' + gap(awake(n)) + (n.segs.length > 2 ? ' in ' + (n.segs.length - 1) + ' breaks' : ' at ' + clk(n.segs[0].wake)) : '') + ', <span class="sv-tw2' + (t.ok ? ' ok' : '') + '">' + (t.ok ? 'on time' : t.v.toLowerCase()) + '</span></div></div>' + EDIT + '</div>' +
        bar(n) + notes() + '</div>';
    },
    a: function () {
      var n = ST.night; if (!n) return emptyCard();
      return '<div class="mv-sc sv-sc"><div class="mv-sh"><div class="t"><div class="mv-big">' + dur(len(n)) + ' <span>of sleep</span></div><div class="mv-sub">' + clk(n.bed) + ' to ' + clk(n.wake) + '</div></div>' + EDIT + '</div>' +
        bar(n) + tiles(n) + notes() + '</div>';
    },
    b: function () {
      var n = ST.night; if (!n) return emptyCard(dial(null, 96));
      var line = function (ic, l, m, p) { var ok = Math.abs(m - p) <= P.tol; return '<div><span class="' + (ok ? "ok" : "off") + '">' + (ok ? I.ok : ic) + '</span>' + l + ' <b>' + clk(m) + '</b></div>'; };
      var t = timing(n), h = hours(n);
      return '<div class="mv-sc sv-sc"><div class="sv-ck">' + dial(n, 124) + '<div class="cr"><div class="mv-big">' + dur(len(n)) + '</div><div class="sv-ckl">' + line(I.moon, "Asleep", n.bed, PLAN.bed) + line(I.sun, "Up", n.wake, PLAN.wake) + '</div>' +
        '<div class="mv-sub">' + h.s + '. ' + (t.ok ? "On time." : t.v + ".") + '</div></div></div>' + '<div>' + EDIT + '</div>' + notes() + '</div>';
    },
    c: function () {
      var n = ST.night; if (!n) return emptyCard();
      var h = hours(n);
      var tile = function (ic, l, m, p) { var d = m - p, ok = Math.abs(d) <= P.tol; return '<div class="sv-rd"><span class="l">' + ic + l + '</span><span class="v big">' + clk(m) + '</span><span class="s">' + (ok ? "On time" : gap(d) + (d > 0 ? " later" : " earlier")) + ', plan ' + clk(p) + '</span></div>'; };
      return '<div class="mv-sc sv-sc"><div class="mv-sh"><div class="t"><div class="mv-big">' + dur(len(n)) + ' <span>of ' + dur(PLAN.hours) + '</span></div><div class="mv-sub">' + h.s + '</div></div>' + EDIT + '</div>' +
        '<div class="mv-prog" style="margin:0"><i style="width:' + h.pct + '%"></i></div><div class="sv-rds">' + tile(I.moon, "Fell asleep", n.bed, PLAN.bed) + tile(I.sun, "Woke up", n.wake, PLAN.wake) + '</div>' + notes() + '</div>';
    }
  };
  /* ---------- E to H: slimmer cards. Each fact is said once: hours and its target in the top line, the coach's
     window as the band, last night's times at the ends of the bar, timing in words, the source in one short phrase.
     Colours are GoodFlip tokens only: indigo for the night itself, teal (Mind's score colour) for the coach's window
     and for "on time", since that is what earns the points. Teal text is teal-900 on white, 4.54:1 (AA). */
  function hw(n) { var d = PLAN.hours - len(n); return d > 0 ? gap(d) + " short" : "Hours met"; }
  function src(dark, short) {
    var hk = '<i class="hk' + (AND ? " hc" : "") + '"></i>';
    if (short) return '<span class="sv-src" title="' + (ST.src === "manual" ? "Entered by you" : NAME + (ST.src === "edited" ? ", edited by you" : "")) + '">' + (ST.src === "manual" ? '<i class="hk sv-me">' + I.pencil + '</i>you' : hk + (ST.src === "edited" ? "edited" : "")) + '<span class="sv-vh">From ' + (ST.src === "manual" ? "you" : NAME) + '</span></span>';
    if (ST.src === "manual") return '<span class="sv-src"><i class="hk sv-me">' + I.pencil + '</i>Entered by you</span>';
    if (ST.src === "edited") return '<span class="sv-src">' + hk + NAME + ', edited by you</span>';
    return '<span class="sv-src">' + hk + NAME + ', 7:22 AM</span>';
  }
  function slimNote() {
    var n = ST.night;
    if (ST.odd && ST.src === "health") return '<div class="sv-sn warn">' + I.warn + '<span>Only ' + dur(len(n)) + ' came in. <button class="sv-lk" data-sv="edit">Fix times</button></span></div>';
    if (ST.nap) return '<div class="sv-sn">' + I.moon + '<span>Also a ' + gap(ST.nap[1] - ST.nap[0]) + ' nap at ' + clk(ST.nap[0]) + '. Hours count the night.</span></div>';
    return "";
  }
  function slimEmpty(cls, dark) {
    var hk = '<i class="hk' + (AND ? " hc" : "") + '"></i>';
    var t = !ST.perm ? "Add last night" : "We haven’t received last night’s sleep yet";
    var sub = !ST.perm ? '<button class="sv-lk" data-sv="perm">' + (AND ? "Turn on Health Connect" : "Connect Apple Health") + '</button>'
      : '<span class="sv-src">' + hk + (NAME + " has nothing yet") + '</span>';
    return '<div class="mv-sc sv-sl ' + cls + '"><div class="sv-er"><span class="sv-mi">' + I.moon + '</span><div class="t"><div class="sv-et2">' + t + '</div><div class="sv-es">' + sub + '</div></div>' +
      '<button class="sv-enter" data-sv="edit">Enter Times</button></div>' + '</div>';
  }
  function ends(n) {   /* last night's times under the two ends of the bar, the only place they are written */
    return '<div class="sv-ends" aria-hidden="true"><span style="left:' + pc(n.bed) + '%">' + clk(n.bed) + '</span><span style="left:' + pc(n.wake) + '%">' + clk(n.wake) + '</span></div>';
  }
  var PEN = '<button class="sv-pen" data-sv="edit" aria-label="Edit last night">' + I.pencil + '</button>';
  var SLIM = {
    /* E: A, slimmed. The tiles go; hours and its target sit in one line, timing and the source in the next */
    e: function () {
      var n = ST.night; if (!n) return slimEmpty("sv-ein");
      var t = timing(n);
      return '<div class="mv-sc sv-sl sv-ein"><div class="sv-r1"><div class="mv-big">' + dur(len(n)) + ' <span>' + (PLAN.hours > len(n) ? gap(PLAN.hours - len(n)) + ' short of ' + dur(PLAN.hours) : 'your ' + dur(PLAN.hours) + ' reached') + '</span></div>' + EDIT + '</div>' +
        '<div class="sv-r2"><span class="sv-tw' + (t.ok ? " ok" : "") + '">' + (t.ok ? I.ok : I.clock) + t.v + '</span>' + src() + '</div>' +
        bar(n, { noaxis: true }) + ends(n) + slimNote() + '</div>';
    },
    /* F: a night-indigo card with teal for the window and "on time" */
    f: function () {
      var n = ST.night; if (!n) return slimEmpty("sv-fin", true);
      var t = timing(n);
      return '<div class="mv-sc sv-sl sv-fin"><div class="sv-r1"><span class="sv-mi">' + I.moon + '</span><div class="t"><div class="sv-h">' + dur(len(n)) + '<small>' + clk(n.bed) + ' to ' + clk(n.wake) + '</small></div></div>' +
        '<button class="sv-pen" data-sv="edit" aria-label="Edit last night">' + I.pencil + 'Edit</button></div>' +
        '<div class="sv-fb">' + bar(n, { mini: true }) + '</div>' +
        '<div class="sv-r2"><span class="sv-tw' + (t.ok ? " ok" : "") + '">' + (t.ok ? I.ok : I.clock) + t.v + ', ' + hw(n).toLowerCase() + '</span>' + src() + '</div>' + slimNote() + '</div>';
    },
    /* G: one row, like a list item, with a hairline bar under it */
    g: function () {
      var n = ST.night; if (!n) return slimEmpty("sv-gin");
      var t = timing(n);
      return '<div class="mv-sc sv-sl sv-gin"><div class="sv-r1"><span class="sv-mi">' + I.moon + '</span><div class="t"><div class="sv-h">' + dur(len(n)) + ' <small>' + hw(n) + '</small></div>' +
        '<div class="sv-es">' + clk(n.bed) + ' to ' + clk(n.wake) + ' ' + src(false, true) + '</div></div>' +
        '<span class="sv-chip' + (t.ok ? " ok" : "") + '" aria-label="' + t.v + '">' + (t.ok ? I.ok + t.v : t.v.replace(/^(Bed|Up) /, "")) + '</span>' + PEN + '</div>' + bar(n, { mini: true }) + slimNote() + '</div>';
    },
    /* H: the bar is the card. Plan times sit inside the teal window, last night's times inside the indigo bar */
    h: function () {
      var n = ST.night; if (!n) return slimEmpty("sv-hin");
      var t = timing(n), w = pc(n.wake) - pc(n.bed);
      return '<div class="mv-sc sv-sl sv-hin"><div class="sv-r1"><div class="sv-h">' + dur(len(n)) + ' <small><span class="sv-tw' + (t.ok ? " ok" : "") + '">' + (t.ok ? I.ok : "") + t.v + '</span> · ' + hw(n) + '</small></div>' + PEN + '</div>' +
        '<div class="sv-ht" role="img" aria-label="Slept ' + clk(n.bed) + ' to ' + clk(n.wake) + '. Your plan is ' + clk(PLAN.bed) + ' to ' + clk(PLAN.wake) + '.">' +
        '<span class="wn" style="left:' + pc(PLAN.bed) + '%;width:' + (pc(PLAN.wake) - pc(PLAN.bed)) + '%"></span>' +
        '<span class="nb" style="left:' + pc(n.bed) + '%;width:' + w + '%">' + (w > 34 ? '<em>' + clk(n.bed) + '</em><em>' + clk(n.wake) + '</em>' : "") + '</span></div>' +
        '<div class="sv-r2"><span class="sv-pl">Plan ' + clk(PLAN.bed) + ' to ' + clk(PLAN.wake) + '</span>' + src() + '</div>' + slimNote() + '</div>';
    }
  };
  function cardHTML() {
    if (SLIM[V]) return '<div class="sec sv-sec"><h2>Last night</h2><button class="sv-ib" data-sv="info" aria-label="How last night counts">' + I.info + '</button></div><section class="sv-steps sv-slimw">' + SLIM[V]() + '</section>';
    var sk = (J ? " sv-j" : "") + (V === "i" ? " sk-" + (/^(soft|scene|deep)$/.test(Q.get("skin") || "") ? Q.get("skin") : "white") : "");
    return '<div class="sec sv-sec"><h2>Last night</h2>' + (J ? "" : '<button class="sv-ib" data-sv="info" aria-label="How last night counts">' + I.info + '</button>') + '</div><section class="mv-steps sv-steps' + sk + '" style="margin-top:0">' + CARD[V]() + strip() + '</section>';
  }

  /* ---------- where it goes: its own card beside the plan (a, b, c), or the Morning row (d) ---------- */
  var box = null;
  function place() {
    if (V === "d") return;
    var root = document.getElementById("mdRoot"); if (!root) return;
    if (!box) { box = document.createElement("div"); box.className = "gut sect"; box.id = "svCard"; }
    if (Q.get("spos") === "below") { if (root.nextSibling !== box) root.parentNode.insertBefore(box, root.nextSibling); }
    else if (box.nextSibling !== root) root.parentNode.insertBefore(box, root);
    box.innerHTML = cardHTML();
  }
  var obs = new MutationObserver(function () { place(); });
  var root0 = document.getElementById("mdRoot"); if (root0) obs.observe(root0, { childList: true });

  /* ---------- the sheet ---------- */
  var draft = null, active = "bed", el = null;
  /* I's draft holds one to three sleeps; bed and wake read and write the sleep in use, so the wheel works unchanged */
  function mkDraft(segs) {
    var d = { segs: segs.map(function (x) { return { bed: x.bed, wake: x.wake }; }), ai: 0 };
    ["bed", "wake"].forEach(function (k) { Object.defineProperty(d, k, { get: function () { return d.segs[d.ai][k]; }, set: function (v) { d.segs[d.ai][k] = v; } }); });
    return d;
  }
  function sheet(k) {
    var n = ST.night;
    draft = n ? { bed: n.bed, wake: n.wake } : { bed: PLAN.bed, wake: PLAN.wake }; active = k === "wake" ? "wake" : "bed";
    if (V === "i") draft = mkDraft(n ? (n.segs || [n]) : [{ bed: PLAN.bed, wake: PLAN.wake }]);
    el = window.GFOpenSheet("svSleep", "Last night’s sleep", '<div class="sv-s' + (J ? " sv-j-sheet" : "") + '"><div class="msub">Your coach’s plan: ' + clk(PLAN.bed) + ' to ' + clk(PLAN.wake) + ', ' + dur(PLAN.hours) + '.</div><div data-svs="pick"></div>' +
      (J ? "" : '<div class="sv-pre" role="group" aria-label="Quick fill"><button data-svp="plan">As planned</button><button data-svp="prev">Same as the night before</button><button data-svp="now">Woke up just now</button></div>') +   /* J: the bar and the wheel are enough */
      '<div class="sv-sum" data-svs="sum" aria-live="polite"></div><button class="md-save" data-sv="save">Save Sleep</button>' +
      (ST.health && ST.src === "edited" ? '<button class="sv-rst" data-sv="reset">Use ' + NAME + '’s times (' + clk(ST.health.bed) + ' to ' + clk(ST.health.wake) + ')</button>' : "") + '</div>');
    drawPick(); drawSum();
  }
  function checkI() {
    var g = draft.segs, many = g.length > 1, last = g[g.length - 1];
    for (var i = 0; i < g.length; i++) {
      if (g[i].wake <= g[i].bed) return { err: (many ? "Sleep " + (i + 1) + ": woke" : "Woke") + " up has to come after " + (J ? "Slept." : "fell asleep."), i: i, f: "wake" };
      if (i && g[i].bed < g[i - 1].wake) return { err: "Sleep " + (i + 1) + " starts before sleep " + i + " ends. Move it later.", i: i, f: "bed" };
    }
    if (last.wake > NOWM) return { err: "It is " + clk(NOWM) + " now. Pick a wake-up time before that.", i: g.length - 1, f: "wake" };
    if (last.wake - g[0].bed > 14 * 60) return { err: "That is over 14 hours from first to last. Check AM and PM.", i: 0, f: "bed" };
    if (len(draft) < 180) return { wrn: "That is a short night. Save it if it is right." };
    return {};
  }
  function drawPairs() {
    var g = draft.segs, many = g.length > 1, slot = el.querySelector('[data-svs="pick"]');
    slot.innerHTML = '<div class="sv-col"><div class="sv-dw"><div data-svs="pv"></div><div class="sv-hl" data-svs="hl"></div></div>' + g.map(function (x, i) {
      return '<div class="sv-pair">' + (many ? '<div class="sv-ph"><span>Sleep ' + (i + 1) + '</span>' + (i ? '<button class="sv-rm" data-svx="rm" data-i="' + i + '" aria-label="Remove sleep ' + (i + 1) + '">Remove</button>' : '') + '</div>' : '') +
        '<div class="sv-flds">' + [["bed", J ? "Slept" : "Fell asleep", J ? MOONF : I.moon], ["wake", "Woke up", J ? SUNF : I.sun]].map(function (f) {
          return '<button class="sv-fld" data-f="' + f[0] + '" data-i="' + i + '" aria-pressed="' + (draft.ai === i && active === f[0]) + '"><span class="fl">' + f[2] + f[1] + '</span><span class="fv"></span><span class="fd"></span></button>';
        }).join("") + '</div>' + (draft.ai === i ? wheels() : '') + '</div>';
    }).join("") + (g.length < 3 ? '<button class="sv-add" data-svx="add"><span class="sv-addl">' + PLUSQ + 'Add another sleep</span><small>Slept more than once? Add each sleep here.</small></button>' : '') + '</div>';
    bindWheels();
  }
  function drawSumI() {
    var c = checkI(), g = draft.segs, sum = el.querySelector('[data-svs="sum"]'), aw = draft.segs[g.length - 1].wake - g[0].bed - len(draft);
    sum.innerHTML = (c.err ? "" : '<div class="h">That is <b>' + dur(len(draft)) + '</b> of sleep' + (g.length > 1 ? ', with ' + gap(aw) + ' awake in between' : '') + '.</div>') +
      (c.err ? '<div class="sv-msg err">' + I.warn + '<span>' + c.err + '</span></div>' : c.wrn ? '<div class="sv-msg wrn">' + I.info + '<span>' + c.wrn + '</span></div>' : "");
    el.querySelector('[data-sv="save"]').disabled = !!c.err;
    el.querySelectorAll(".sv-fld").forEach(function (f) { var i = +f.dataset.i, k = f.dataset.f, m = g[i][k]; f.classList.toggle("bad", !!c.err && c.i === i && c.f === k); f.querySelector(".fv").textContent = clk(m); f.querySelector(".fd").textContent = dayOf(m, k); });
    var ok = !c.err, pv = el.querySelector('[data-svs="pv"]');
    if (pv) pv.innerHTML = bar(ok ? { bed: g[0].bed, wake: g[g.length - 1].wake, segs: g.length > 1 ? g : null } : null, { inSheet: true });
    handles();
  }
  /* the sheet's bar can be dragged, as in the coach portal: a grip at each end of each sleep moves that time, the sleep
     itself moves both. Steps of 5 minutes, kept on the 8 PM to 10 AM bar; the checks under it judge the rest */
  var SN = 5, dragging = false;
  /* J's fields wear filled glyphs: the moon is Mind's own sleep glyph (mind/icons/moon.svg), the sun Phosphor's sun, fill */
  var MOONF = '<svg class="mn" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.3 2.05a1 1 0 0 1 .27 1.2A7 7 0 0 0 20.75 11.4a1 1 0 0 1 1.2.27A10 10 0 1 1 12.3 2.05Z"/></svg>';
  var SUNF = '<svg viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" d="M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z"/></svg>';
  var PLUSQ = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><path d="M12 8.5v7M8.5 12h7"/></svg>';   /* Eat's square plus (r3/eat.html plusSq) */
  function handles() {
    var hl = el && el.querySelector('[data-svs="hl"]'), tr = el && el.querySelector('[data-svs="pv"] .tr');
    if (!hl || !tr) return;
    var r = tr.getBoundingClientRect(), w = hl.parentNode.getBoundingClientRect();   /* the grips sit exactly over the track */
    hl.style.top = r.top - w.top + "px"; hl.style.height = r.height + "px"; hl.style.left = r.left - w.left + "px"; hl.style.width = r.width + "px";
    if (dragging) return place2(hl);
    hl.innerHTML = draft.segs.map(function (x, i) {
      var nm = draft.segs.length > 1 ? " of sleep " + (i + 1) : "";
      return '<div class="sv-blk" data-dg="blk" data-i="' + i + '" role="slider" tabindex="0" aria-label="Move the whole sleep' + nm + '"></div>' +
        '<div class="sv-hd" data-dg="bed" data-i="' + i + '" role="slider" tabindex="0" aria-label="' + (J ? "Slept" : "Fell asleep") + nm + '"><span></span></div>' +
        '<div class="sv-hd" data-dg="wake" data-i="' + i + '" role="slider" tabindex="0" aria-label="Woke up' + nm + '"><span></span></div>';
    }).join("");
    place2(hl);
    hl.querySelectorAll("[data-dg]").forEach(dragger);
  }
  function place2(hl) {
    hl.querySelectorAll("[data-dg]").forEach(function (n) {
      var x = draft.segs[+n.dataset.i], k = n.dataset.dg;
      if (k === "blk") { n.style.left = pc(x.bed) + "%"; n.style.width = Math.max(0, pc(x.wake) - pc(x.bed)) + "%"; return; }
      n.style.left = pc(x[k]) + "%"; n.setAttribute("aria-valuetext", clk(x[k]));
    });
  }
  function nudge(i, k, x0, dm) {
    var x = draft.segs[i], sn = function (m) { return Math.round(m / SN) * SN; };
    if (k === "blk") { var l = x0.wake - x0.bed, b = Math.max(A0, Math.min(A1 - l, sn(x0.bed + dm))); x.bed = b; x.wake = b + l; }
    else if (k === "bed") x.bed = Math.max(A0, Math.min(x.wake - 15, sn(x0.bed + dm)));
    else x.wake = Math.min(A1, Math.max(x.bed + 15, sn(x0.wake + dm)));
    draft.ai = i; active = k === "wake" ? "wake" : "bed";
    drawSumI();
  }
  function dragger(n) {
    var i = +n.dataset.i, k = n.dataset.dg;
    n.onpointerdown = function (e) {
      if (e.button !== 0) return;
      e.preventDefault(); n.setPointerCapture(e.pointerId); n.classList.add("is-drag"); dragging = true;
      var w = n.parentNode.getBoundingClientRect().width, x0 = { bed: draft.segs[i].bed, wake: draft.segs[i].wake }, cx = e.clientX;
      n.onpointermove = function (ev) { nudge(i, k, x0, (ev.clientX - cx) / w * (A1 - A0)); };
      n.onpointerup = n.onpointercancel = function () {
        n.onpointermove = n.onpointerup = n.onpointercancel = null; dragging = false;
        drawPairs(); drawSumI();   /* the wheel and the fields catch up with where the bar ended */
      };
    };
    n.onkeydown = function (e) {
      var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!d) return;
      e.preventDefault(); nudge(i, k, { bed: draft.segs[i].bed, wake: draft.segs[i].wake }, d * SN);
    };
  }
  function saveI() {
    if (checkI().err) return;
    var g = draft.segs, n = { bed: g[0].bed, wake: g[g.length - 1].wake }, h = ST.health;
    if (g.length > 1) n.segs = g.map(function (x) { return { bed: x.bed, wake: x.wake }; });
    var key = function (x) { return x ? JSON.stringify(x.segs || [{ bed: x.bed, wake: x.wake }]) : ""; }, same = h && key(h) === key(n);
    ST.night = same ? h : n; ST.src = same ? "health" : h ? "edited" : "manual"; 
    if (!same) { ST.odd = false; ST.at = clk(Math.floor(NOWM / 5) * 5); }
    put(ST.night); MD.cause = "sleep"; window.closeSheets(); MD.render(); place(); MD.toast("Last night saved.");
  }
  function check() {
    var l = draft.wake - draft.bed;
    if (l <= 0) return { err: J ? "Woke up has to come after the time you slept. Check the two times." : "Woke up has to come after fell asleep. Check the two times.", f: "wake" };
    if (draft.wake > NOWM) return { err: "It is " + clk(NOWM) + " now. Pick a wake-up time before that.", f: "wake" };
    if (l > 14 * 60) return { err: "That is over 14 hours. Check AM and PM.", f: "bed" };
    if (l < 180) return { wrn: "That is a short night. Save it if it is right." };
    return {};
  }
  function drawSum() {
    if (!el) return;
    if (draft && draft.segs) return drawSumI();
    var c = check(), sum = el.querySelector('[data-svs="sum"]');
    sum.innerHTML = (c.err ? "" : '<div class="h">That is <b>' + dur(draft.wake - draft.bed) + '</b> of sleep.</div>') +
      (c.err ? '<div class="sv-msg err">' + I.warn + '<span>' + c.err + '</span></div>' : c.wrn ? '<div class="sv-msg wrn">' + I.info + '<span>' + c.wrn + '</span></div>' : "");
    el.querySelector('[data-sv="save"]').disabled = !!c.err;
    el.querySelectorAll(".sv-fld").forEach(function (f) { var k = f.dataset.f; f.classList.toggle("bad", !!c.err && c.f === k); f.querySelector(".fv").textContent = clk(draft[k]); f.querySelector(".fd").textContent = dayOf(draft[k], k); });
    el.querySelectorAll(".sv-nu").forEach(function (u) { var k = u.dataset.f; u.querySelector("b").textContent = clk(draft[k]); u.querySelector(".fd").textContent = dayOf(draft[k], k); });
    var pv = el.querySelector('[data-svs="pv"]'); if (pv) pv.innerHTML = bar(draft.wake > draft.bed ? draft : null);
    if (PICK === "dial") drawDial();
    if (PICK === "drag") placeDrag();
  }
  function fields() {
    return '<div class="sv-flds">' + [["bed", "Fell asleep", I.moon], ["wake", "Woke up", I.sun]].map(function (f) {
      return '<button class="sv-fld" data-f="' + f[0] + '" aria-pressed="' + (active === f[0]) + '"><span class="fl">' + f[2] + f[1] + '</span><span class="fv"></span><span class="fd"></span></button>';
    }).join("") + '</div>';
  }
  function nudges() {
    return '<div class="sv-nud">' + [["bed", "Fell asleep"], ["wake", "Woke up"]].map(function (f) {
      return '<div class="sv-nu" data-f="' + f[0] + '"><button class="sv-sp" data-n="-5" aria-label="' + f[1] + ', 5 minutes earlier">−</button><span class="c"><span class="lb">' + f[1] + '</span><b></b><span class="fd"></span></span><button class="sv-sp" data-n="5" aria-label="' + f[1] + ', 5 minutes later">+</button></div>';
    }).join("") + '</div>';
  }
  function drawPick() {
    if (draft && draft.segs) return drawPairs();
    var slot = el.querySelector('[data-svs="pick"]');
    if (PICK === "wheel") { slot.innerHTML = '<div class="sv-col"><div data-svs="pv"></div>' + fields() + wheels() + '</div>'; bindWheels(); }
    if (PICK === "stepper") { slot.innerHTML = nudges(); }
    if (PICK === "dial") { slot.innerHTML = '<div class="sv-dw" data-svs="dial"></div>' + nudges(); bindDial(); }
    if (PICK === "drag") {
      slot.innerHTML = '<div class="sv-db"><div class="sv-tl"><span class="pin" style="left:' + pc(PLAN.bed) + '%">' + clk(PLAN.bed) + '</span><span class="pin" style="left:' + pc(PLAN.wake) + '%">' + clk(PLAN.wake) + '</span>' +
        '<div class="tr"><span class="band" style="left:' + pc(PLAN.bed) + '%;width:' + (pc(PLAN.wake) - pc(PLAN.bed)) + '%"></span><span class="bar"></span></div>' +
        '<div class="ax" aria-hidden="true">' + AX.map(function (m) { return '<span style="left:' + pc(m) + '%">' + clk(m).replace(":00", "") + '</span>'; }).join("") + '</div></div>' +
        '<span class="hh" data-h="bed" tabindex="0" role="slider" aria-label="Fell asleep"><i></i></span><span class="hh" data-h="wake" tabindex="0" role="slider" aria-label="Woke up"><i></i></span></div>' + nudges();
      bindDrag();
    }
  }

  /* A: wheels for the field in use: hour, minutes in fives, AM or PM */
  var HRS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], MNS = []; for (var i = 0; i < 60; i += 5) MNS.push(i);
  var wi = null;
  function wheels() {
    var m = ((draft[active] % 1440) + 1440) % 1440, h = Math.floor(m / 60);
    wi = { h: h % 12, m: Math.round((m % 60) / 5) % 12, ap: h < 12 ? 0 : 1 };
    var col = function (k, arr, l) { return '<div class="sv-wh" data-w="' + k + '" tabindex="0" role="listbox" aria-label="' + l + '">' + arr.map(function (x, j) { return '<button tabindex="-1" role="option" data-i="' + j + '">' + x + '</button>'; }).join("") + '</div>'; };
    return '<div class="sv-whs">' + col("h", HRS, "Hour") + col("m", MNS.map(function (x) { return ("0" + x).slice(-2); }), "Minutes") + col("ap", ["AM", "PM"], "AM or PM") + '</div>';
  }
  function bindWheels() {
    el.querySelectorAll(".sv-wh").forEach(function (w) {
      var k = w.dataset.w, max = w.children.length - 1, t;
      w.scrollTop = wi[k] * 40;
      var set = function (j) {
        j = Math.max(0, Math.min(max, j)); if (wi[k] === j) return; wi[k] = j;
        var c = (wi.h + (wi.ap ? 12 : 0)) * 60 + MNS[wi.m];
        draft[active] = active === "bed" ? (c >= 720 ? c : 1440 + c) : 1440 + c;
        drawSum();
      };
      w.addEventListener("scroll", function () { clearTimeout(t); t = setTimeout(function () { set(Math.round(w.scrollTop / 40)); }, 90); });
      w.addEventListener("keydown", function (e) { if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return; e.preventDefault(); var j = Math.max(0, Math.min(max, wi[k] + (e.key === "ArrowDown" ? 1 : -1))); w.scrollTo({ top: j * 40, behavior: RD ? "auto" : "smooth" }); set(j); });
      w.querySelectorAll("button").forEach(function (b) { b.onclick = function () { var j = +b.dataset.i; w.scrollTo({ top: j * 40, behavior: RD ? "auto" : "smooth" }); set(j); }; });
    });
  }
  /* B: the clock; listeners sit on its box, which stays while the clock inside is redrawn */
  function drawDial() {
    var bx = el.querySelector('[data-svs="dial"]'); if (!bx) return;
    var fa = document.activeElement, fk = fa && fa.closest && fa.closest(".hd") ? fa.closest(".hd").dataset.h : null;
    bx.innerHTML = dial(draft.wake > draft.bed ? draft : { bed: draft.bed, wake: draft.bed + 1 }, 248, true);
    if (fk) { var f = bx.querySelector('.hd[data-h="' + fk + '"]'); if (f) f.focus({ preventScroll: true }); }
  }
  function bindDial() {
    var bx = el.querySelector('[data-svs="dial"]'), drag = null;
    var toMin = function (ev) { var r = bx.querySelector("svg").getBoundingClientRect(), x = ev.clientX - r.left - r.width / 2, y = ev.clientY - r.top - r.height / 2; return Math.round(((Math.atan2(x, -y) * 180 / Math.PI + 360) % 360) * 4 / 5) * 5 % 1440; };
    var apply = function (k, c) { draft[k] = k === "bed" ? (c >= 720 ? c : 1440 + c) : 1440 + c; };
    var near = function (c, m) { var d = Math.abs(c - ((m % 1440) + 1440) % 1440); return Math.min(d, 1440 - d); };
    bx.addEventListener("pointerdown", function (ev) { if (!ev.target.closest("svg")) return; var c = toMin(ev); drag = near(c, draft.bed) <= near(c, draft.wake) ? "bed" : "wake"; try { bx.setPointerCapture(ev.pointerId); } catch (x) {} apply(drag, c); drawSum(); });
    bx.addEventListener("pointermove", function (ev) { if (drag) { apply(drag, toMin(ev)); drawSum(); } });
    ["pointerup", "pointercancel"].forEach(function (t) { bx.addEventListener(t, function () { drag = null; }); });
    bx.addEventListener("keydown", function (e) { var h = e.target.closest(".hd"), s = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 }[e.key]; if (!h || !s) return; e.preventDefault(); draft[h.dataset.h] += s; drawSum(); });
  }
  /* D: the bar, its two ends dragged */
  function placeDrag() {
    var bx = el.querySelector(".sv-db"); if (!bx) return;
    var b = bx.querySelector(".bar"); b.style.left = pc(draft.bed) + "%"; b.style.width = Math.max(0, pc(draft.wake) - pc(draft.bed)) + "%";
    bx.querySelectorAll(".hh").forEach(function (h) { h.style.left = pc(draft[h.dataset.h]) + "%"; h.setAttribute("aria-valuetext", clk(draft[h.dataset.h])); });
  }
  function bindDrag() {
    var bx = el.querySelector(".sv-db"), tr = bx.querySelector(".tr"), drag = null;
    var toMin = function (ev) { var r = tr.getBoundingClientRect(), f = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)); return Math.round((A0 + f * (A1 - A0)) / 5) * 5; };
    var move = function (ev) { if (!drag) return; var m = toMin(ev); draft[drag] = drag === "bed" ? Math.min(m, draft.wake - 30) : Math.max(m, draft.bed + 30); drawSum(); };
    bx.addEventListener("pointerdown", function (ev) { var m = toMin(ev); drag = Math.abs(m - draft.bed) <= Math.abs(m - draft.wake) ? "bed" : "wake"; try { bx.setPointerCapture(ev.pointerId); } catch (x) {} move(ev); });
    bx.addEventListener("pointermove", move);
    ["pointerup", "pointercancel"].forEach(function (t) { bx.addEventListener(t, function () { drag = null; }); });
    bx.addEventListener("keydown", function (e) { var h = e.target.closest(".hh"), s = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 }[e.key]; if (!h || !s) return; e.preventDefault(); draft[h.dataset.h] += s; drawSum(); });
  }
  /* minus and plus, 5 minutes a tap, faster while held */
  var hold = null;
  document.addEventListener("pointerdown", function (e) {
    var b = e.target.closest(".sv-sp"); if (!b || !draft) return;
    e.preventDefault();
    var k = b.closest(".sv-nu").dataset.f, step = function () { draft[k] = Math.max(1080, Math.min(2160, draft[k] + +b.dataset.n)); drawSum(); };
    step(); clearTimeout(hold && hold.a); clearInterval(hold && hold.b); hold = { a: setTimeout(function () { hold.b = setInterval(step, 70); }, 420) };
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach(function (t) { document.addEventListener(t, function () { if (hold) { clearTimeout(hold.a); clearInterval(hold.b); hold = null; } }, true); });
  document.addEventListener("keydown", function (e) {
    var b = e.target.closest && e.target.closest(".sv-sp"); if (!b || (e.key !== "Enter" && e.key !== " ")) return; e.preventDefault();
    var k = b.closest(".sv-nu").dataset.f; draft[k] = Math.max(1080, Math.min(2160, draft[k] + +b.dataset.n)); drawSum();
  });

  function save() {
    if (draft && draft.segs) return saveI();
    if (!draft || check().err) return;
    var h = ST.health, same = h && h.bed === draft.bed && h.wake === draft.wake;
    ST.night = { bed: draft.bed, wake: draft.wake }; ST.src = same ? "health" : h ? "edited" : "manual"; 
    if (!same) { ST.odd = false; ST.at = clk(Math.floor(NOWM / 5) * 5); }
    put(ST.night); MD.cause = "sleep"; window.closeSheets(); MD.render(); place(); MD.toast("Last night saved.");
  }
  function info() {
    var p = pts(ST.night), n = ST.night;
    window.GFOpenSheet("svInfo", "How last night counts", '<div class="msub">Last night gives up to ' + (P.w.hours + P.w.window) + ' of your 100 Rhythm points, set from your coach’s plan: in bed by ' + clk(PLAN.bed) + ', up at ' + clk(PLAN.wake) + ', ' + dur(PLAN.hours) + ' of sleep.</div>' +
      '<div class="sv-pts"><div>Hours<b>' + (n ? p.h : 0) + ' of ' + P.w.hours + '</b>Full at ' + dur(PLAN.hours) + '</div><div>Timing<b>' + (n ? p.w : 0) + ' of ' + P.w.window + '</b>Full within ' + P.tol + ' min of both times</div></div>' +
      '<div class="msub" style="margin-top:16px">Both count on their own, so a full night at a late hour still earns its hours. Going to bed at the same time each night is what helps your sugar and energy most.</div>');
  }
  function perm() {
    if (J) return permJ();
    window.GFOpenSheet("svPerm", AND ? "Turn on Health Connect" : "Connect Apple Health", '<div class="sv-perm"><div class="pair"><img src="/v7/icons/goodflip-logo-small.png" alt=""><i class="hk' + (AND ? " hc" : "") + '"></i></div><ul>' +
      ["GoodFlip reads when you fell asleep and woke up.", "You can still change the times yourself.", "Sleep needs a watch, or a sleep app, that writes to " + NAME + "."].map(function (t) { return '<li>' + I.check + '<span>' + t + '</span></li>'; }).join("") + '</ul></div>' +
      '<button class="md-save" data-sv="permgo">Continue</button><button class="sv-rst" data-sv="close">Not Now</button>');
  }

  /* J: Move's Health sheet (move/health.js, its #mvHealth styles in move/plan.css), turned to sleep. The picture is the
     phone's next screen with everything GoodFlip reads switched on, sleep first, then Move's steps, workouts and energy. ponytail: the iOS Sleep glyph is a drawn bed in Health's sleep teal, not exported */
  function permJ() {
    var SB = '<div class="ds-sb"><b>9:41</b><span><i class="b1"></i><i class="b2"></i><i class="b3"></i><i class="b4"></i><em></em></span></div>';
    var sw = function (on) { return '<span class="ds-sw' + (on ? " on" : "") + '"></span>'; };
    var G = {
      bed: '<svg viewBox="0 0 24 24"><path fill="#30B0C7" d="M3 5a1 1 0 0 1 2 0v8h6V9a2 2 0 0 1 2-2h5a4 4 0 0 1 4 4v8a1 1 0 0 1-2 0v-2H5v2a1 1 0 0 1-2 0zM8 12.5a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5z"/></svg>',
      bedo: '<svg viewBox="0 0 24 24"><path fill="none" stroke="#1F1F1F" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M3 5v14M3 15h18v4M21 15v-3a4 4 0 0 0-4-4h-5v7"/><circle cx="7.5" cy="11" r="2" fill="none" stroke="#1F1F1F" stroke-width="1.7"/></svg>',
      heart: '<svg viewBox="0 0 24 24"><path fill="#FF2D55" d="M12 21.2 10.6 20C5.4 15.4 2 12.4 2 8.6 2 5.6 4.4 3.2 7.4 3.2c1.7 0 3.4.8 4.6 2.1 1.2-1.3 2.9-2.1 4.6-2.1 3 0 5.4 2.4 5.4 5.4 0 3.8-3.4 6.8-8.6 11.4z"/></svg>',
      pulse: '<svg viewBox="0 0 24 24"><path fill="none" stroke="#1F1F1F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M2 12h4l2.5-6 4 13 2.5-7H22"/></svg>',
      /* Move's own (move/health.js): iOS marks Activity types with an orange flame, Health Connect with an outlined flame */
      flame: '<svg viewBox="0 0 24 24"><path fill="#FF6A1A" d="M12.6 2.2c.3 2.2-.7 3.8-1.9 5.4-1.3 1.7-2.8 3.4-2.8 5.9 0 1 .3 1.9.8 2.6-.9-.5-1.6-1.4-1.9-2.4-1.3 1.5-2 3.2-1.9 5 .2 3.1 3.1 5.3 6.9 5.3 4.2 0 7.2-2.6 7.2-6.6 0-3.4-2-5.6-3.6-7.6-1.2-1.6-2.4-3.2-2.8-5.4zM12 21c-1.8 0-3-1-3-2.6 0-1.4.9-2.4 1.8-3.4.3 1 1 1.7 2 2 .1-1.2.6-2.1 1.3-3 .8 1 1.4 2 1.4 3.3 0 2.2-1.4 3.7-3.5 3.7z"/></svg>',
      fire: '<svg viewBox="0 0 24 24"><path fill="none" stroke="#1F1F1F" stroke-width="1.7" stroke-linejoin="round" d="M12.4 3c.4 2.6-1.1 4.3-2.6 6.1C8.6 10.6 7.2 12.3 7.2 14.6a4.8 4.8 0 0 0 9.6 0c0-2.4-1.3-4.2-2.6-5.8-.2 1.2-.8 2.1-1.7 2.6.3-3-.3-6.1-.1-8.4z"/><path fill="none" stroke="#1F1F1F" stroke-width="1.7" stroke-linejoin="round" d="M12 19.2c-1.2 0-2-.8-2-1.9 0-1 .7-1.8 1.4-2.6.2.7.6 1.1 1.2 1.3.1-.6.4-1.1.8-1.6.5.6.8 1.3.8 2.1 0 1.5-.9 2.7-2.2 2.7z"/></svg>'
    };
    var row = function (ic, n, on) { return '<div class="ds-row"><span class="ds-ic">' + G[ic] + '</span><span class="ds-n">' + n + '</span>' + sw(on) + '</div>'; };
    var GFI = '<span class="ds-app gf"><img src="/v7/icons/goodflip-logo-small.png" alt=""></span>';
    var LINK = '<span class="ds-lk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h15l-4-4M20 15H5l4 4"/></svg></span>';
    var PAIR = function (o) { return '<div class="ds-pair">' + o + LINK + GFI + '</div>'; };
    var scr = AND
      ? SB + '<div class="ds-and">' + PAIR('<span class="ds-app hc"><img src="/v7/icons/health/health-connect.png" alt=""></span>') +
          '<h3>Allow GoodFlip to access Health Connect?</h3><p>Choose data that you want this app to read from Health Connect</p>' +
          '<div class="ds-h">Allow \u201cGoodFlip\u201d to read</div>' + row("bedo", "Sleep", 1) + row("fire", "Steps", 1) + row("fire", "Exercise", 1) + row("fire", "Active calories burned", 1) + row("pulse", "Heart rate", 1) + '</div>'
      : SB + '<div class="ds-ios"><div class="ds-nav"><span>Don\u2019t Allow</span><b>Health Access</b><span>Allow</span></div>' + PAIR('<span class="ds-app ah"><img src="/v7/icons/health/apple-health-heart.png" alt=""></span>') +
          '<p class="ds-lead">\u201cGoodFlip\u201d would like to access and update your Health data.</p>' +
          '<div class="ds-h">Allow \u201cGoodFlip\u201d to read</div><div class="ds-grp">' + row("bed", "Sleep", 1) + row("flame", "Steps", 1) + row("flame", "Workouts", 1) + row("flame", "Active Energy", 1) + row("heart", "Heart Rate", 1) + '</div></div>';
    window.GFOpenSheet("mvHealth", "Let your phone fill in your sleep",
      '<p class="hsub">Your watch or sleep app already saves it. Connect once, and last night comes in by itself every morning.</p>' +
      '<div class="dev-wrap" aria-hidden="true"><div class="flab">Next, your phone will ask</div><div class="dev' + (AND ? " and" : "") + '"><span class="dev-cam"></span><div class="dev-scr"><div class="ds">' + scr + '</div></div></div></div>' +
      '<div class="hft"><button class="hgo" data-sv="permgo">' + (AND ? "Allow Health Connect" : "Connect Apple Health") + '</button>' +
      '<button class="hlater" data-sv="edit">I will enter my sleep myself</button></div>');
  }

  /* ---------- taps ---------- */
  document.addEventListener("click", function (e) {
    var p = e.target.closest("[data-svp]"), f = e.target.closest(".sv-fld"), t = e.target.closest("[data-sv]");
    var x = e.target.closest("[data-svx]");
    if (x && draft && draft.segs) {
      var g = draft.segs;
      if (x.dataset.svx === "add" && g.length < 3) {
        /* the new sleep splits the last one in two around its middle, 40 minutes apart, so both are close to right already */
        var l = g[g.length - 1], mid = Math.round((l.bed + l.wake) / 10) * 5, nw = l.wake - l.bed >= 120 ? { bed: mid + 20, wake: l.wake } : { bed: l.wake + 20, wake: Math.min(l.wake + 80, NOWM - NOWM % 5) };
        if (l.wake - l.bed >= 120) l.wake = mid - 20;
        g.push(nw); draft.ai = g.length - 1; active = "bed";
      }
      if (x.dataset.svx === "rm") { var i = +x.dataset.i; g[i - 1].wake = g[i].wake; g.splice(i, 1); draft.ai = i - 1; active = "wake"; }   /* removing joins it back to the sleep before */
      drawPick(); drawSum(); return;
    }
    if (p && draft && draft.segs) {
      if (p.dataset.svp === "plan") draft = mkDraft([{ bed: PLAN.bed, wake: PLAN.wake }]);
      if (p.dataset.svp === "prev") draft = mkDraft([{ bed: PREV.bed, wake: PREV.wake }]);
      if (p.dataset.svp === "now") { draft.ai = draft.segs.length - 1; draft.wake = NOWM - NOWM % 5; active = "wake"; }
      drawPick(); drawSum(); return;
    }
    if (p && draft) {
      if (p.dataset.svp === "plan") draft = { bed: PLAN.bed, wake: PLAN.wake };
      if (p.dataset.svp === "prev") draft = { bed: PREV.bed, wake: PREV.wake };
      if (p.dataset.svp === "now") { draft.wake = NOWM - NOWM % 5; active = "wake"; }
      drawPick(); drawSum(); return;
    }
    if (f) { if (draft && draft.segs && f.dataset.i != null) draft.ai = +f.dataset.i; active = f.dataset.f; drawPick(); drawSum(); return; }
    if (!t) return;
    var a = t.dataset.sv;
    if (a === "edit") return sheet(t.dataset.f);
    if (a === "save") return save();
    if (a === "info") return info();
    if (a === "perm") return perm();
    if (a === "close") return window.closeSheets();
    if (a === "oddok") { ST.oddOk = true; MD.render(); place(); MD.toast("Kept " + NAME + "’s times."); return; }
    if (a === "reset") { ST.night = ST.health.segs ? ST.health : { bed: ST.health.bed, wake: ST.health.wake }; ST.src = "health"; ST.odd = len(ST.night) < 180; put(ST.night); window.closeSheets(); MD.render(); place(); MD.toast("Back to " + NAME + "’s times."); return; }
    if (a === "permgo") {
      /* the phone's own permission screen comes next; here it always says yes, then last night is read */
      window.closeSheets(); ST = { perm: true, src: null, night: null, health: null }; put(null); MD.render(); place();
      setTimeout(function () { ST = { perm: true, src: "health", night: SY, health: SY }; put(SY); MD.render(); place(); MD.toast("Last night came in from " + NAME + "."); }, RD ? 50 : 1400);
    }
  });

  /* ---------- D: the Morning row says it all ---------- */
  function items(L) {
    if (V !== "d") return L.filter(function (x) { return x.sheet !== "sleep"; });
    return L.map(function (x) {
      if (x.sheet !== "sleep") return x;
      var n = ST.night, mark = ST.src === "manual" ? '<i class="hk sv-me">' + I.pencil + '</i>' : '<i class="hk' + (AND ? " hc" : "") + '"></i>';
      var d = n ? mark + dur(len(n)) + " · " + clk(n.bed) + " to " + clk(n.wake) + (ST.src === "edited" ? " · edited" : "") + (ST.odd && ST.src === "health" ? ' <em class="sv-chk">· check this</em>' : "")
        : !ST.perm ? "Enter it, or connect " + NAME : "Nothing from " + NAME + ". Tap to enter.";
      return { m: x.m, sheet: "sleep", on: !!n, at: x.at, t: x.t, d: '<span class="sv-rowd">' + d + '</span>' + bar(n, { mini: true }) };
    });
  }

  window.MDVAR = window.MDVAR || {};
  MDVAR.open = MDVAR.open || {};
  MDVAR.open.sleep = function () { sheet(); return true; };
  MDVAR.open.sleepinfo = function () { info(); return true; };
  MDVAR.open.sleepperm = function () { perm(); return true; };
  var prevItems = MDVAR.items;
  MDVAR.items = function (L, M) { L = prevItems ? prevItems(L, M) : L; return items(L); };

  var css = document.createElement("style");
  css.textContent = [
    "#svCard .sv-sec{display:flex;align-items:center;justify-content:space-between}",
    ".sv-ib{width:44px;height:44px;margin:-12px -12px -12px 0;border:0;background:none;display:grid;place-items:center;color:var(--g-400);cursor:pointer;border-radius:999px}.sv-ib svg{width:18px;height:18px}",
    ".sv-sc{display:flex;flex-direction:column;gap:12px}",
    ".sv-sc .mv-big span{font-weight:400}",
    ".sv-t{font:600 16px/22px Roboto,sans-serif;color:var(--g-900)}",
    ".sv-et{display:flex;gap:16px;align-items:center}.sv-et svg.dial{width:96px;height:96px;flex:none}",
    ".sv-tl{position:relative;padding-top:18px}.sv-tl.j{padding-top:4px}",
    ".sv-steps .mv-logbtn svg{width:16px;height:16px}",
    /* J's top lines: moon and sun in neutral grey, as on the sheet's fields */
    ".sv-j-sheet .sv-fld .fl svg{color:var(--g-500)}",
    ".sv-j-sheet .sv-dw{margin-bottom:8px}",   /* a little air between the bar's legend and the two time fields */
    /* the moon fills its box edge to edge, so it sits a size down to look the same as the sun */
    ".jh-t svg.mn{width:13px;height:13px;margin:0 1.5px}.sv-j-sheet .sv-fld .fl svg.mn{width:12px;height:12px;margin:0 1px}",
    ".jh-r{display:flex;flex-wrap:wrap;gap:4px 20px;margin-top:-8px}.jh-t{display:inline-flex;align-items:center;gap:6px;font:400 14px/20px Roboto,sans-serif;color:#475467}.jh-t b{font-weight:600;color:#101828}.jh-t svg{width:16px;height:16px;color:var(--g-500)}",
    /* the short-sync note, four slim looks. Gold from Eat's ribbon: 25 #FFFDF5, 50 #FFFBEE, 100 #FFF8E0, 200 #FEF1C7, 800 #A68A2D, 900 #826E2D */
    ".so{display:flex;align-items:center;gap:8px;margin-top:12px;font:400 13px/18px Roboto,sans-serif;color:#344054}.so svg{width:16px;height:16px;flex:0 0 auto}",
    ".so-x{flex:0 0 auto;width:32px;height:32px;margin:-6px -8px -6px 0;border:0;border-radius:50%;background:none;color:#826E2D;display:grid;place-items:center;cursor:pointer}.so-x svg{width:14px;height:14px}",
    ".so-fix{flex:0 0 auto;height:28px;padding:0 12px;border:1px solid #299D6B;border-radius:8px;background:#fff;color:#2A805A;font:600 13px Roboto,sans-serif;box-shadow:0 2px 0 #CBF0E0;cursor:pointer}.so-fix:active{transform:translateY(2px);box-shadow:none}",
    ".so-a{padding:6px 12px;border-radius:12px;border:1px solid #FEF1C7;background:repeating-linear-gradient(-45deg,#FFF8E0 0 10px,#FFFBEE 10px 20px);color:#826E2D;font-weight:500}.so-a > span{flex:1;min-width:0}.so-a .so-x{margin-left:-6px;width:28px}.so-a > svg{color:#A68A2D}",
    ".sv-dw{position:relative;align-self:stretch;width:100%;user-select:none;-webkit-user-select:none}.sv-dw [data-svs=pv],.sv-dw .sv-tl{width:100%}.sv-hl{position:absolute}",
    ".sv-blk{position:absolute;top:0;bottom:0;cursor:grab;touch-action:none;border-radius:6px}.sv-blk.is-drag{cursor:grabbing;box-shadow:inset 0 0 0 1.5px var(--in-600)}",
    ".sv-hd{position:absolute;top:-10px;bottom:-10px;width:32px;margin-left:-16px;cursor:ew-resize;touch-action:none;outline:none}",
    ".sv-hd span{position:absolute;left:50%;top:50%;width:10px;height:24px;transform:translate(-50%,-50%);border-radius:5px;background:#fff;border:1.5px solid var(--g-900);box-shadow:0 1px 3px rgba(16,24,40,.18);transition:border-color .15s cubic-bezier(.4,0,.2,1)}",
    ".sv-hd:hover span,.sv-hd.is-drag span{border-color:var(--in-600)}.sv-hd:focus-visible span{border-color:var(--p-600);box-shadow:0 0 0 3px rgba(41,157,107,.35)}",
    /* J in Mind's teal (goodflip-design foundations: teal 800 #E7C144, 900 #826E2D). Text in teal 900, 4.54:1 on white */
    ".sv-j .mv-big{color:#826E2D}.sv-tl.j .bar{background:linear-gradient(90deg,#E7C144,#826E2D)}.sv-tl.j + .sv-lg .lb,.sv-tl.j .sv-lg .lb{background:linear-gradient(90deg,#E7C144,#826E2D)}",
    ".sv-tl.j .tr{height:18px;border-radius:6px}.sv-tl.j .band{top:-3px;bottom:-3px;border-radius:8px}.sv-tl.j .bar{top:3px;bottom:3px;border-radius:4px}",
    ".sv-lg{display:flex;flex-wrap:wrap;gap:4px 16px;margin-top:10px;font:400 12px/16px Roboto,sans-serif;color:var(--g-600)}.sv-lg span{display:inline-flex;align-items:center;gap:6px}",
    ".sv-lg i{width:14px;height:8px;border-radius:3px;flex:0 0 auto}.sv-lg .lb{background:linear-gradient(90deg,var(--in-500),#4F50B8)}.sv-lg .lp{background:var(--in-50);border:1.5px dashed var(--in-200);height:10px}",
    ".sk-soft .sv-lg .lp{background:#FFF8E0;border-color:#826E2D}.sk-deep .sv-lg{color:#C7D7FE}.sk-deep .sv-lg .lp{background:rgba(253,232,164,.12);border-color:#FDE8A4}",
    ".sv-tl .tr{position:relative;height:28px;border-radius:8px;background:var(--g-50)}",
    ".sv-tl .band{position:absolute;top:-4px;bottom:-4px;border-radius:10px;background:var(--in-50);border:1.5px dashed var(--in-200)}",
    ".sv-tl .bar{position:absolute;top:4px;bottom:4px;border-radius:6px;background:linear-gradient(90deg,var(--in-500),#4F50B8);transition:left .5s cubic-bezier(.4,0,.2,1),width .5s cubic-bezier(.4,0,.2,1)}",
    ".sv-tl .pin{position:absolute;top:0;transform:translateX(-50%);font:600 10px/14px Roboto,sans-serif;color:var(--in-600);white-space:nowrap}",
    ".sv-tl .ax{position:relative;height:16px;margin-top:6px}.sv-tl .ax span{position:absolute;transform:translateX(-50%);font:400 10px/14px Roboto,sans-serif;color:var(--g-400);white-space:nowrap}.sv-tl .ax span:first-child{transform:none}",
    ".sv-tl.mini{padding-top:0;margin-top:8px;width:100%}.sv-tl.mini .tr{height:10px;border-radius:4px}.sv-tl.mini .band{top:-2px;bottom:-2px;border-radius:5px;border-width:1px}.sv-tl.mini .bar{top:2px;bottom:2px;border-radius:3px}",
    ".sv-rowd{display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap;font-variant-numeric:tabular-nums}.sv-rowd .hk{display:inline-block;width:14px;height:14px;border-radius:4px;flex:none;background:#fff url(/v7/icons/health/apple-health-heart.png) center/9px no-repeat;box-shadow:0 0 0 1px var(--g-200)}.sv-rowd .hk.hc{background:url(/v7/icons/health/health-connect.png) center/cover no-repeat}.sv-rowd .hk.sv-me svg{width:9px;height:9px}.sv-chk{font-style:normal;color:var(--amber-600,#DC6803)}",
    ".ly-row .td:has(.sv-tl){white-space:normal;width:100%}",
    ".sv-rds{display:grid;grid-template-columns:1fr 1fr;gap:8px}",
    ".sv-rd{border:1px solid var(--in-100);border-radius:14px;background:#fff;padding:10px 12px;display:flex;flex-direction:column;gap:2px;min-width:0}",
    ".sv-rd .l{display:flex;align-items:center;gap:6px;font:400 12px/16px Roboto,sans-serif;color:var(--g-600)}.sv-rd .l svg{width:14px;height:14px;color:var(--in-600);flex:none}",
    ".sv-rd .v{display:flex;align-items:center;gap:4px;font:700 15px/21px Roboto,sans-serif;color:var(--g-900);font-variant-numeric:tabular-nums}.sv-rd .v.big{font-size:18px;line-height:24px}.sv-rd .v svg{width:16px;height:16px;color:var(--p-600,#299D6B);flex:none}",
    ".sv-rd .s{font:400 11.5px/16px Roboto,sans-serif;color:var(--g-500);font-variant-numeric:tabular-nums}",
    ".sv-rd .mt{height:4px;border-radius:4px;background:var(--in-50);margin-top:6px;overflow:hidden}.sv-rd .mt i{display:block;height:100%;border-radius:inherit;background:var(--in-500)}",
    ".sv-note{display:flex;gap:8px;align-items:flex-start;border-radius:12px;padding:10px 12px;font:400 12.5px/18px Roboto,sans-serif;background:var(--g-50);color:var(--g-700)}",
    ".sv-note svg{width:16px;height:16px;flex:none;margin-top:1px;color:var(--g-500)}.sv-note.warn{background:#FFFAEB;color:#7A2E0E}.sv-note.warn svg{color:var(--amber-600,#DC6803)}",
    ".sv-lk{position:relative;border:0;background:none;padding:0;font:600 12.5px Roboto,sans-serif;color:var(--p-600,#299D6B);cursor:pointer}.sv-lk::after{content:'';position:absolute;inset:-12px -8px}",
    ".sv-cta{height:44px;width:100%;border:0;border-radius:6px;background:var(--p-600,#299D6B);color:#fff;font:600 15px Roboto,sans-serif;cursor:pointer;box-shadow:0 4px 0 #2A805A}",
    ".sv-cta.sec{background:#fff;color:var(--p-700,#2A805A);border:1px solid var(--p-600,#299D6B);box-shadow:0 3px 0 #CBF0E0}",
    ".hk.sv-me{background:var(--p-50,#F3FCF8);box-shadow:0 0 0 1px var(--p-100,#E6FAF1);display:inline-grid;place-items:center;color:var(--p-600,#299D6B)}.hk.sv-me svg{width:12px;height:12px}",
    ".sv-ck{display:flex;gap:16px;align-items:center}.sv-ck svg.dial{width:124px;height:124px;flex:none}.sv-ck .cr{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px}",
    ".sv-ckl{display:flex;flex-direction:column;gap:4px;font:400 12.5px/18px Roboto,sans-serif;color:var(--g-600)}.sv-ckl div{display:flex;align-items:center;gap:6px}.sv-ckl svg{width:14px;height:14px}.sv-ckl .ok{color:var(--p-600,#299D6B)}.sv-ckl .off{color:var(--in-600)}",
    /* the sheet */
    ".sv-s{display:flex;flex-direction:column;gap:16px}.sv-s .msub{margin:0}.sv-col{display:flex;flex-direction:column;gap:12px}",
    ".sv-flds{display:grid;grid-template-columns:1fr 1fr;gap:8px}",
    ".sv-fld{border:1px solid var(--g-200);border-radius:12px;background:#fff;padding:10px 12px;text-align:left;cursor:pointer;display:flex;flex-direction:column;gap:2px;font-family:inherit;min-height:72px}",
    ".sv-fld .fl{display:flex;align-items:center;gap:6px;font:600 12px/16px Roboto,sans-serif;color:var(--g-600)}.sv-fld .fl svg{width:14px;height:14px;color:var(--in-600)}",
    ".sv-fld .fv{font:700 20px/26px Roboto,sans-serif;color:var(--g-900);font-variant-numeric:tabular-nums}.sv-fld .fd{font:400 11.5px/16px Roboto,sans-serif;color:var(--g-500)}",
    ".sv-fld[aria-pressed=true]{border-color:#299D6B;box-shadow:0 0 0 3px #CBF0E0}.sv-fld.bad{border-color:#D92D20}",
    ".sv-whs{position:relative;display:flex;gap:4px;height:200px;border-radius:14px;background:var(--g-50);padding:0 8px}",
    ".sv-whs::before{content:'';position:absolute;left:8px;right:8px;top:80px;height:40px;border-radius:10px;background:#fff;box-shadow:0 1px 2px rgba(16,24,40,.08);pointer-events:none}",
    ".sv-whs::after{content:'';position:absolute;inset:0;border-radius:14px;pointer-events:none;background:linear-gradient(180deg,var(--g-50),rgba(249,250,251,0) 35%,rgba(249,250,251,0) 65%,var(--g-50))}",
    ".sv-wh{position:relative;flex:1;overflow-y:scroll;scroll-snap-type:y mandatory;scrollbar-width:none;padding:80px 0;outline:none;border-radius:10px}.sv-wh::-webkit-scrollbar{display:none}.sv-wh:focus-visible{box-shadow:inset 0 0 0 2px var(--in-300)}",
    ".sv-wh button{display:block;width:100%;height:40px;border:0;background:none;scroll-snap-align:center;font:500 20px/40px Roboto,sans-serif;color:var(--g-900);cursor:pointer;font-variant-numeric:tabular-nums}",
    ".sv-dw{display:flex;justify-content:center}.sv-dw svg{width:248px;height:248px;touch-action:none}.sv-dw .hd{cursor:grab;outline:none}.sv-dw .hd:focus-visible circle{stroke:var(--in-300);stroke-width:6}",
    ".sv-nud{display:grid;gap:8px}",
    ".sv-nu{display:flex;align-items:center;justify-content:space-between;gap:8px;border:1px solid var(--g-200);border-radius:12px;padding:8px 10px}",
    ".sv-nu .c{text-align:center;display:flex;flex-direction:column}.sv-nu .lb{font:600 12px/16px Roboto,sans-serif;color:var(--g-600)}.sv-nu b{font:700 20px/28px Roboto,sans-serif;color:var(--g-900);font-variant-numeric:tabular-nums}.sv-nu .fd{font:400 11.5px/16px Roboto,sans-serif;color:var(--g-500)}",
    ".sv-sp{width:44px;height:44px;border:1px solid var(--g-200);border-radius:10px;background:#fff;color:var(--g-700);font-size:20px;cursor:pointer;flex:none;touch-action:manipulation;user-select:none}.sv-sp:active{background:var(--g-50)}",
    ".sv-db{position:relative;touch-action:none}.sv-db .tr{height:44px;border-radius:12px}.sv-db .band{border-radius:14px}.sv-db .bar{top:6px;bottom:6px;border-radius:9px;transition:none}",
    ".sv-db .hh{position:absolute;top:18px;width:44px;height:44px;margin-left:-22px;display:grid;place-items:center;cursor:ew-resize;outline:none;z-index:2}",
    ".sv-db .hh i{width:22px;height:34px;border-radius:8px;background:#fff;border:2px solid var(--in-600);box-shadow:0 2px 6px rgba(16,24,40,.18)}.sv-db .hh:focus-visible i{box-shadow:0 0 0 4px var(--in-200)}",
    ".sv-pre{display:flex;flex-wrap:wrap;gap:8px}.sv-pre button{position:relative;min-height:36px;padding:0 12px;border:1px solid var(--g-200);border-radius:999px;background:#fff;font:500 13px Roboto,sans-serif;color:var(--g-700);cursor:pointer}.sv-pre button::after{content:'';position:absolute;left:0;right:0;top:-4px;bottom:-4px}",
    ".sv-sum{display:flex;flex-direction:column;gap:6px}.sv-sum .h{font:400 15px/22px Roboto,sans-serif;color:var(--g-700);font-variant-numeric:tabular-nums}.sv-sum .h b{font-size:17px;color:var(--g-900)}",
    ".sv-msg{display:flex;gap:6px;align-items:flex-start;font:400 13px/18px Roboto,sans-serif}.sv-msg svg{width:16px;height:16px;flex:none;margin-top:1px}.sv-msg.err{color:#D92D20}.sv-msg.wrn{color:#B54708}",
    ".sv-rst{align-self:center;min-height:44px;border:0;background:none;font:600 14px Roboto,sans-serif;color:var(--p-600,#299D6B);cursor:pointer;width:100%}",
    ".sv-pts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px}.sv-pts div{border:1px solid var(--g-200);border-radius:12px;padding:10px 12px;font:400 12px/16px Roboto,sans-serif;color:var(--g-500)}.sv-pts b{display:block;font:700 18px/24px Roboto,sans-serif;color:var(--g-900)}",
    ".sv-perm{display:flex;flex-direction:column;align-items:center;gap:16px;padding:4px 0 16px}.sv-perm .pair{display:flex;gap:12px;align-items:center}.sv-perm .pair img{width:48px;height:48px;border-radius:12px;box-shadow:0 0 0 1px var(--g-200)}",
    ".sv-perm .pair .hk{width:48px;height:48px;border-radius:12px;background:#fff url(/v7/icons/health/apple-health-heart.png) center/30px no-repeat;box-shadow:0 0 0 1px var(--g-200)}.sv-perm .pair .hk.hc{background:url(/v7/icons/health/health-connect.png) center/cover no-repeat}",
    ".sv-perm ul{margin:0;padding:0;list-style:none;display:grid;gap:8px;align-self:stretch}.sv-perm li{display:flex;gap:10px;font:400 14px/20px Roboto,sans-serif;color:var(--g-700)}.sv-perm li svg{width:18px;height:18px;color:var(--p-600,#299D6B);flex:none}",
    /* E to H, tokens from the GoodFlip design system: indigo 25 #F5F8FF, 50 #EEF4FF, 100 #E0EAFF, 200 #C7D7FE, 300 #A4BCFD, 500 #6172F3, 600 #444CE7, 700 #3538CD, 800 #2D31A6, 900 #2D3282;
       teal 50 #FFFBEE, 100 #FFF8E0, 200 #FEF1C7 (border-teal), 300 #FDE8A4, 900 #826E2D */
    ".sv-sl{display:flex;flex-direction:column;gap:8px;padding:12px 16px;border-radius:var(--r-xl,24px);border:1px solid #E0EAFF;background:linear-gradient(180deg,#F5F8FF,#fff 60%);box-shadow:0 1px 2px rgba(16,24,40,.04),0 6px 16px -8px rgba(16,24,40,.12)}",
    ".sv-sl .sv-r1{display:flex;align-items:center;gap:12px}.sv-sl .sv-r1>.t,.sv-sl .sv-r1>.mv-big,.sv-sl .sv-r1>.sv-h{flex:1;min-width:0}",
    ".sv-sl .sv-r2{display:flex;align-items:center;justify-content:space-between;gap:8px;font:400 12px/16px Roboto,sans-serif;color:#667085}",
    ".sv-sl .mv-big{font-size:24px;line-height:30px}.sv-sl .mv-big span{font-size:13px}",
    ".sv-vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}",
    ".sv-src{display:inline-flex;align-items:center;gap:6px;font:400 12px/16px Roboto,sans-serif;color:#667085;white-space:nowrap;min-width:0}",
    ".sv-src .hk{display:inline-block;width:14px;height:14px;border-radius:4px;flex:none;background:#fff url(/v7/icons/health/apple-health-heart.png) center/9px no-repeat;box-shadow:0 0 0 1px #E4E7EC}.sv-src .hk.hc{background:url(/v7/icons/health/health-connect.png) center/cover no-repeat}.sv-src .hk.sv-me svg{width:9px;height:9px}",
    ".sv-tw{display:inline-flex;align-items:center;gap:4px;font:600 12px/16px Roboto,sans-serif;color:#3538CD}.sv-tw svg{width:14px;height:14px;flex:none}.sv-tw.ok{color:#826E2D}",
    ".sv-sn{display:flex;gap:6px;align-items:center;font:400 12px/16px Roboto,sans-serif;color:#667085}.sv-sn svg{width:14px;height:14px;flex:none}.sv-sn.warn{color:#B54708}.sv-sn .sv-lk{font-size:12px}",
    ".sv-mi{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;background:#EEF4FF;color:#444CE7;flex:none}.sv-mi svg{width:18px;height:18px}",
    ".sv-h{font:700 18px/24px Roboto,sans-serif;color:#3538CD;font-variant-numeric:tabular-nums;display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}.sv-h small{font:400 12px/16px Roboto,sans-serif;color:#667085}",
    ".sv-es{font:400 12px/16px Roboto,sans-serif;color:#667085;display:flex;align-items:center;gap:4px;flex-wrap:wrap;font-variant-numeric:tabular-nums}",
    ".sv-pen{position:relative;flex:none;display:inline-flex;align-items:center;gap:6px;height:32px;padding:0;border:0;background:none;color:#299D6B;font:600 14px Roboto,sans-serif;cursor:pointer}.sv-pen svg{width:18px;height:18px}.sv-pen::after{content:'';position:absolute;left:50%;top:50%;width:44px;height:44px;transform:translate(-50%,-50%)}",
    ".sv-er{display:flex;align-items:center;gap:12px}.sv-er .t{flex:1;min-width:0}.sv-et2{font:600 14px/20px Roboto,sans-serif;color:#101828}",
    ".sv-enter{position:relative;flex:none;height:36px;padding:0 14px;border-radius:6px;border:1px solid #299D6B;background:#fff;color:#2A805A;font:600 13px Roboto,sans-serif;cursor:pointer;box-shadow:0 3px 0 #CBF0E0}.sv-enter::after{content:'';position:absolute;inset:-4px 0}",
    /* E: A's bar, its times only at the two ends */
    ".sv-ein .sv-tl{padding-top:16px}.sv-ends{position:relative;height:16px;margin-top:-4px}.sv-ends span{position:absolute;transform:translateX(-50%);font:600 11px/16px Roboto,sans-serif;color:#344054;white-space:nowrap;font-variant-numeric:tabular-nums}",
    /* the teal window for F, G, H: the coach's plan, which is what earns the points */
    ".sv-fin .sv-tl .band,.sv-gin .sv-tl .band,.sv-hin .sv-tl .band{background:#FFF8E0;border-color:#826E2D}",
    /* F: night indigo */
    ".sv-fin{background:linear-gradient(160deg,#2D3282,#2D31A6);border-color:#2D31A6}",
    ".sv-fin .sv-mi{background:rgba(255,255,255,.1);color:#FDE8A4}.sv-fin .sv-h{color:#fff}.sv-fin .sv-h small,.sv-fin .sv-src,.sv-fin .sv-es,.sv-fin .sv-sn{color:#C7D7FE}",
    ".sv-fin .sv-tw{color:#C7D7FE}.sv-fin .sv-tw.ok{color:#FDE8A4}.sv-fin .sv-pen{color:#fff}.sv-fin .sv-et2{color:#fff}.sv-fin .sv-sn.warn{color:#FEC84B}.sv-fin .sv-lk{color:#FDE8A4}",
    ".sv-fin .sv-tl.mini .tr{background:rgba(255,255,255,.08)}.sv-fin .sv-tl .band{background:rgba(253,232,164,.14);border-color:#FDE8A4}.sv-fin .sv-tl .bar{background:linear-gradient(90deg,#C7D7FE,#fff)}",
    ".sv-fin .sv-enter{background:#fff;border-color:#fff;box-shadow:none}.sv-fin .sv-src .hk{box-shadow:none}",
    ".sv-fb .sv-tl.mini{margin-top:4px}.sv-fb .sv-tl.mini .tr{height:8px}",
    /* G: one row */
    ".sv-gin .sv-r1{gap:12px}.sv-gin .sv-h,.sv-gin .sv-es{flex-wrap:nowrap;white-space:nowrap}.sv-gin .sv-es{overflow:hidden;text-overflow:ellipsis}.sv-chip{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 8px;border-radius:999px;border:1px solid #E0EAFF;background:#fff;font:600 12px/16px Roboto,sans-serif;color:#3538CD;white-space:nowrap}",
    ".sv-chip.ok{border-color:#FEF1C7;color:#826E2D}.sv-chip svg{width:14px;height:14px}",
    ".sv-gin .sv-tl.mini{margin-top:2px}.sv-gin .sv-tl.mini .tr{height:8px}.sv-gin .sv-tl.mini .bar{top:1px;bottom:1px}.sv-fb .sv-tl.mini .bar{top:1px;bottom:1px}",
    /* H: the bar is the card */
    ".sv-ht{position:relative;height:28px;border-radius:10px;background:#F9FAFB}",
    ".sv-ht .wn{position:absolute;top:0;bottom:0;border-radius:10px;background:#FFFBEE;border:1.5px dashed #826E2D}",
    ".sv-ht .nb{position:absolute;top:4px;bottom:4px;border-radius:7px;background:linear-gradient(90deg,#444CE7,#2D31A6);display:flex;align-items:center;justify-content:space-between;padding:0 8px;transition:left .5s cubic-bezier(.4,0,.2,1),width .5s cubic-bezier(.4,0,.2,1)}",
    ".sv-ht .nb em{font:500 11px/1 Roboto,sans-serif;font-style:normal;color:#fff;font-variant-numeric:tabular-nums;white-space:nowrap}",
    ".sv-pl{font:500 12px/16px Roboto,sans-serif;color:#826E2D;font-variant-numeric:tabular-nums}",
    ".sv-hin .sv-h{font-size:20px;line-height:26px}",
    /* I and the split night */
    ".sv-tl .gap{position:absolute;top:4px;bottom:4px;background:repeating-linear-gradient(135deg,#E0EAFF 0 3px,#fff 3px 6px);border-radius:3px}",
    ".sv-tw2{font-weight:600;color:#3538CD}.sv-tw2.ok{color:#826E2D}",
    ".sv-pair{display:flex;flex-direction:column;gap:8px}.sv-ph{display:flex;align-items:center;justify-content:space-between;font:600 12px/16px Roboto,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#667085}",
    ".sv-rm{position:relative;border:0;background:none;padding:0;font:600 13px Roboto,sans-serif;letter-spacing:.25px;text-transform:none;color:#B42318;cursor:pointer}.sv-rm::after{content:'';position:absolute;left:50%;top:50%;width:64px;height:44px;transform:translate(-50%,-50%)}",
    ".sv-add{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-height:44px;padding:4px 0;border:0;background:none;text-align:left;font:600 14px/20px Roboto,sans-serif;color:#299D6B;cursor:pointer}.sv-add small{font:400 12px/16px Roboto,sans-serif;color:#667085}",
    ".sv-addl{display:inline-flex;align-items:center;gap:6px}.sv-addl svg{width:20px;height:20px;flex:0 0 auto}",
    /* I's skins: the content and layout stay, only the look changes. Tokens: indigo 25 to 900, teal 50, 100, 300, 900 */
    ".sk-soft .mv-sc{background:#EEF4FF;border-color:#C7D7FE}.sk-soft .mv-sync{background:#E0EAFF;border-color:#C7D7FE}",
    ".sk-soft .sv-tl .tr{background:#fff}.sk-soft .sv-tl .band{background:#FFF8E0;border-color:#826E2D}.sk-soft .sv-tl .pin{color:#826E2D}.sk-soft .sv-tw2.ok{color:#826E2D}",
    ".sk-scene .mv-sc{position:relative;isolation:isolate;overflow:hidden;background:linear-gradient(180deg,#F5F8FF,#fff 60%)}.sk-scene .mv-logbtn{background:rgba(255,255,255,.85);border-radius:8px;padding:0 6px}",
    ".sk-scene .mv-sc::before{content:'';position:absolute;inset:0 0 auto 0;height:132px;z-index:-1;background:url(/v7/icons/mind/bg/night.webp?v=1) right top/auto 100% no-repeat;opacity:.4;-webkit-mask-image:linear-gradient(90deg,transparent 25%,#000 70%),linear-gradient(180deg,#000 40%,transparent);-webkit-mask-composite:source-in;mask-image:linear-gradient(90deg,transparent 25%,#000 70%),linear-gradient(180deg,#000 40%,transparent);mask-composite:intersect}",
    ".sk-scene .sv-tl .tr{background:rgba(255,255,255,.85)}",
    ".sk-deep .mv-sc{background:linear-gradient(160deg,#2D3282,#2D31A6);border-color:#2D31A6}",
    ".sk-deep .mv-big{color:#fff}.sk-deep .mv-big span,.sk-deep .mv-sub{color:#C7D7FE}.sk-deep .mv-logbtn{color:#fff}",
    ".sk-deep .sv-tw2{color:#fff}.sk-deep .sv-tw2.ok{color:#FDE8A4}",
    ".sk-deep .sv-tl .tr{background:rgba(255,255,255,.08)}.sk-deep .sv-tl .band{background:rgba(253,232,164,.12);border-color:#FDE8A4}.sk-deep .sv-tl .pin{color:#FDE8A4}.sk-deep .sv-tl .ax span{color:#A4BCFD}",
    ".sk-deep .sv-tl .bar{background:linear-gradient(90deg,#C7D7FE,#fff)}.sk-deep .sv-tl .gap{background:repeating-linear-gradient(135deg,rgba(255,255,255,.25) 0 3px,transparent 3px 6px)}",
    ".sk-deep .sv-note{background:rgba(255,255,255,.08);color:#E0EAFF}.sk-deep .sv-note svg{color:#C7D7FE}.sk-deep .sv-note.warn{color:#FEC84B}.sk-deep .sv-note.warn svg{color:#FEC84B}.sk-deep .sv-lk{color:#FDE8A4}",
    ".sk-deep .sv-t{color:#fff}.sk-deep .mv-sync{background:#EEF4FF;border-color:#C7D7FE}",
    "@media (prefers-reduced-motion: reduce){.sv-ht .nb{transition:none}.sv-tl .bar{transition:none}}"
  ].join("");
  document.head.appendChild(css);

  MD.render();
  place();
  /* doc-only URL hooks for v7/mind-rhythm.html; nothing here runs without them.
     ?act=sleep  last night arrives from Health 1.6 s after the screen settles, so the score and its line move
     ?serr=order|long|overlap  opens the sheet with times that fail a check (overlap needs ?sstate=split) */
  if (Q.get("act") === "sleep") setTimeout(function () { ST = { perm: true, src: "health", night: SY, health: SY }; put(SY); MD.cause = "sleep"; MD.render(); place(); }, 1600);
  var SE = Q.get("serr");
  if (SE && V === "i") setTimeout(function () {
    sheet(); var g = draft.segs;
    if (SE === "order") g[0].bed = g[0].wake + 20;
    if (SE === "long") g[0].bed = g[g.length - 1].wake - 900;
    if (SE === "overlap" && g[1]) g[1].bed = g[0].wake - 30;
    drawPick(); drawSum();
  }, 1000);
  /* ?scroll=sleep opens the screen at last night, for the research doc */
  if (Q.get("scroll") === "sleep") setTimeout(function () { var t = box || document.getElementById("mdRoot"); window.scrollTo(0, t.getBoundingClientRect().top + window.scrollY - 16);   /* scrollTo keeps a parent page still when this runs in a frame */ }, 1200);
})();
