/* Mind: "What shaped your score?", six ways of explaining it, drawn on the real screen (research/score-tiles.html).
   ?vtiles=a  Today's tiles, the Sleep window tile carries a mini bar: the dashed window with last night inside it
   ?vtiles=b  Rows, as Oura's contributors: each part a row with its fact on the right and a thin bar under it
   ?vtiles=c  Both edges: Sleep hours and Self-care side by side, the Sleep window wide under them, bedtime and wake-up each judged
   ?vtiles=d  Points: each tile shows the points it earned out of the points it can earn, the plain fact under them
   ?vtiles=e  Tap to learn: today's tiles, each opens a small sheet, "What is the sleep window?" with a picture of last night
   ?vtiles=f  Questions: each tile asks what it checks ("To bed on time?") and answers it in a few words
   G to K change only the Sleep window tile, to find the clearest way to say what it is and how close last night came:
   ?vtiles=g  A plain sentence: "Bed 45 min late, up on time", the plan under it
   ?vtiles=h  Two clock chips, moon and sun: last night's time, "plan 10:30" under it, a tick when on time
   ?vtiles=i  A mini timeline in a wide tile: the plan as an outlined band, last night solid over it, the result in words
   ?vtiles=j  Yes or no: "To bed on time? Yes", "Up on time? Yes"
   ?vtiles=k  Plan over you: two bars on one scale in a wide tile, the times written inside them, the gap named at each end
   Three tiles and a window strip (the layout from 2 Nov): Sleep duration, Self-care (breathing, me-time, mood) and Wind-down
   in a row, with a slim full-width Sleep window strip under them. ?vtiles=sa to sf vary only the strip:
   ?vtiles=sa  One line of times: moon 10:50 PM, plan 10:30, tick; sun 6:10 AM, plan 6:00, tick
   ?vtiles=sb  A hairline timeline: the plan outlined, last night solid, the result in words on the right
   ?vtiles=sc  A sentence: "Sleep window, 10:30 PM to 6 AM", then "Bed and wake-up on time"
   ?vtiles=sd  Two halves: Bed and Wake, each "Window opens 10:30 PM" or how far from it
   ?vtiles=se  "1 of 2 on time" with the two times, the plan under them
   ?vtiles=sf  Window over last night: two aligned lines, the plan times above last night's, the result at the end
   Slept and Woke up, slim (the same words as the sleep card and its sheet). Row 1 as above; ?vtiles=wa to we vary the strip:
   ?vtiles=wa  Words only: "Slept on time", "Woke up 40 min early", side by side in one line
   ?vtiles=wb  Two slim tiles, Slept and Woke up, each with its own fill: full when on time, less as that edge drifts
   ?vtiles=wc  From Eight Sleep's Schedule: the time large, "Within 30 min of plan" or how far under it
   ?vtiles=wd  From WHOOP's Sleep Planner: Slept and Woke up at the two ends of a bracket, the words under each end
   ?vtiles=we  From Apple Health's Your Schedule: a small label over each time, the plan time under it in grey
   Every tile is the screen's indigo glass (indigo 50 to 900, grey for words). Off the plan is said in words and drawn hollow, never in a new colour.
   index.html, plan.js and rhythm.js stay as they are: this file takes over window.paintMacros, which rhythm.js calls
   after every render (MDRHYTHM.update), so a tick or a logged night repaints the card. */
(function () {
  var MD = window.MDPLAN; if (!MD || MD.noplan) return;
  var Q = MD.Q, V = (Q.get("vtiles") || "a").toLowerCase(), P = MD.P, S = MD.S;
  if (!/^([a-k]|s[a-f]|w[a-f])$/.test(V)) V = "a";
  var box = document.getElementById("macros"); if (!box) return;
  var RD = matchMedia("(prefers-reduced-motion: reduce)").matches || Q.get("rm") === "1";
  var clk = MD.nice;

  /* ---------- words ---------- */
  function dur(m) { m = Math.max(0, Math.round(m)); return Math.floor(m / 60) + "h " + ("0" + m % 60).slice(-2) + "m"; }   /* as the sleep card: 7h 00m */
  function gap(m) { m = Math.round(Math.abs(m)); var h = Math.floor(m / 60), x = m % 60; return h ? h + "h" + (x ? " " + x + "m" : "") : x + " min"; }
  function plain(t) { return t.replace(":00", ""); }   /* 6:00 AM reads 6 AM */
  function edge(d) { return Math.abs(d) <= P.tol ? "On time" : gap(d) + (d > 0 ? " late" : " early"); }

  /* ---------- the day, read live ---------- */
  function data() {
    var R = window.MDRHYTHM, pr = R.parts(), on = MD.logged();
    var slept = on ? (S.segs ? S.segs.reduce(function (t, x) { return t + x.wake - x.bed; }, 0) : S.wake - S.bed) : 0;
    var pb = MD.bedM(P.bed), pw = MD.wakeM(P.wake), T = Math.round(P.hours * 60);
    var db = on ? S.bed - pb : 0, dw = on ? S.wake - pw : 0;
    var off = Math.abs(db) >= Math.abs(dw) ? db : dw;
    var cnt = function (k) { return P[k].filter(function (x, i) { return S[k][i]; }).length; };
    var moodN = S.vm ? S.vm.filter(Boolean).length : S.mood >= 0 ? 1 : 0, moodT = S.vmSlots || 1;
    var self = [];
    if (P.wd.length) self.push({ n: "Wind-down", d: cnt("wd"), t: P.wd.length, w: P.w.wd, p: pr.wd });
    if (P.br.length) self.push({ n: "Breathing", d: cnt("br"), t: P.br.length, w: P.w.br, p: pr.br });
    if (P.me.length) self.push({ n: "Me-time", d: cnt("me") ? 1 : 0, t: 1, w: P.w.me, p: pr.me });
    self.push({ n: "Mood check-in", d: moodN, t: moodT, w: P.w.mood, p: pr.mood });
    var sd = 0, st = 0, sp = 0, sw = 0;
    self.forEach(function (x) { sd += x.d; st += x.t; sp += x.w * x.p; sw += x.w; });
    return {
      on: on, slept: slept, T: T, short: T - slept, pb: pb, pw: pw, db: db, dw: dw, off: off,
      bedOk: Math.abs(db) <= P.tol, wakeOk: Math.abs(dw) <= P.tol,
      plan: plain(MD.niceS(P.bed)) + " to " + plain(MD.niceS(P.wake)),
      hp: pr.hours, wp: pr.window, sp: sw ? sp / sw : 0,
      pts: { h: Math.round(P.w.hours * pr.hours), hw: P.w.hours, w: Math.round(P.w.window * pr.window), ww: P.w.window, s: Math.round(sp), sw: sw },
      self: self, sd: sd, st: st,
      /* the new layout: wind-down on its own, self-care is breathing, me-time and mood */
      wd: { d: cnt("wd"), t: P.wd.length, p: pr.wd },
      care: (function () { var c = self.filter(function (x) { return x.n !== "Wind-down"; }), a = 0, b = 0, w = 0, ww = 0;
        c.forEach(function (x) { a += x.d; b += x.t; w += x.w * x.p; ww += x.w; }); return { d: a, t: b, p: ww ? w / ww : 0 }; })()
    };
  }

  /* ---------- small pieces ---------- */
  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = MD.IC.moon;
  var OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  var INFO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>';
  var CHEV = MD.IC.chev;
  var gl = function (c) { return '<span class="tgl ' + c + '"></span>'; };
  var top = function (c, n) { return '<span class="ttop">' + gl(c) + n + '</span>'; };
  /* the glass's liquid: data-k names it, so a repaint moves it from where it stood */
  var pool = function (k, p, tone) { return '<span class="tpool"><span class="vf ' + (tone || "") + '" data-k="' + k + '" style="--to:' + Math.round(Math.max(0, Math.min(1, p)) * 100) + '%"></span></span>'; };
  var stat = function (ok, txt) { return '<span class="vst' + (ok ? " vok" : " voff") + '">' + (ok ? OK : '<i></i>') + txt + '</span>'; };

  /* the window as a mini bar: dashed indigo band for the plan, last night in solid indigo; 90 min either side so a late night shows */
  function mini(d, wide) {
    var a0 = d.pb - (wide ? 120 : 90), a1 = d.pw + (wide ? 120 : 90);
    var pc = function (m) { return Math.max(0, Math.min(100, (m - a0) / (a1 - a0) * 100)); };
    var band = '<span class="mb-w" style="left:' + pc(d.pb) + '%;width:' + (pc(d.pw) - pc(d.pb)) + '%"></span>';
    var night = d.on ? '<span class="mb-n" style="left:' + pc(S.bed) + '%;width:' + Math.max(2, pc(S.wake) - pc(S.bed)) + '%"></span>' : "";
    var lbl = (d.on ? "Slept " + clk(S.bed) + " to " + clk(S.wake) + ". " : "") + "Sleep window " + d.plan + ".";
    return '<span class="mb' + (wide ? " wide" : "") + '" role="img" aria-label="' + lbl + '">' + band + night + '</span>';
  }

  /* A's two edge gauges: bedtime and wake-up each on a short scale, 2 h either side of the plan. The outlined zone is
     "on time" (within tol of the plan); the dot is last night, solid inside the zone, hollow outside it */
  function gauges(d) {
    var R2 = P.zero, pc = function (m) { return Math.max(3, Math.min(97, 50 + m / R2 * 50)); }, z = P.tol / R2 * 50;
    var one = function (ic, dd, ok, l) {
      return '<span class="gg" aria-label="' + l + '">' + ic + '<span class="gg-s"><span class="gg-z" style="left:' + (50 - z) + '%;width:' + 2 * z + '%"></span>' +
        '<span class="gg-c"></span>' + (d.on ? '<span class="gg-d' + (ok ? "" : " off") + '" style="left:' + pc(dd) + '%"></span>' : "") + '</span></span>';
    };
    return '<span class="ggs">' + one(MOON, d.db, d.bedOk, d.on ? "Bedtime " + edge(d.db).toLowerCase() : "Bedtime not logged") + one(SUN, d.dw, d.wakeOk, d.on ? "Wake-up " + edge(d.dw).toLowerCase() : "Wake-up not logged") + '</span>';
  }
  var planBr = function (d) { return plain(MD.niceS(P.bed)) + "<br>to " + plain(MD.niceS(P.wake)); };

  /* ---------- the six cards ---------- */
  var R = {};

  /* A: today's tiles, a mini bar in the Sleep window tile */
  R.a = function (d) {
    var hv = d.on ? '<b class="vbig t">' + dur(d.slept) + '</b>' : '<span class="vnone">Not logged</span>';
    var wv = d.on ? '<b class="vword t">' + edge(d.off) + '</b>' : '<span class="vnone">Not logged</span>';
    return '<div class="vg3">' +
      '<div class="vt-m">' + pool("h", d.hp, "tl") + top("glyph-sleep", "Sleep hours") + hv + '<span class="vof">of ' + dur(d.T) + '</span></div>' +
      '<div class="vt-m">' + pool("w", d.wp, "tl") + top("glyph-clock", "Sleep window") + wv + gauges(d) + '<span class="vof">' + planBr(d) + '</span></div>' +
      '<div class="vt-m">' + pool("s", d.sp, "in") + top("glyph-care", "Self-care") + '<b class="vbig i">' + d.sd + '</b><span class="vof">of ' + d.st + ' done</span></div></div>';
  };

  /* B: rows. The fact on the right, what it is measured against under the name, a bar for what it earned */
  R.b = function (d) {
    var row = function (k, c, n, sub, val, p, tone, extra) {
      return '<div class="vr">' + '<div class="vr-h">' + gl(c) + '<span class="vr-n">' + n + '<small>' + sub + '</small></span><span class="vr-v">' + val + '</span></div>' +
        (extra || "") + '<span class="vr-bar"><i class="vf ' + tone + '" data-k="' + k + '" style="--to:' + Math.round(p * 100) + '%"></i></span></div>';
    };
    var hv = d.on ? '<b class="t">' + dur(d.slept) + '</b>' : '<span class="vnone">Not logged</span>';
    var wv = d.on ? (d.bedOk && d.wakeOk ? stat(true, "On time") : '<b>' + ((d.bedOk ? 1 : 0) + (d.wakeOk ? 1 : 0)) + ' of 2 on time</b>') : '<span class="vnone">Not logged</span>';
    var ln = function (ic, l, m, pl, dd, ok) { return '<span>' + ic + '<em>' + l + ' <b>' + clk(m) + '</b>, plan ' + pl + '</em>' + stat(ok, ok ? "On time" : edge(dd)) + '</span>'; };
    var ed = d.on ? '<div class="vr-ed">' + ln(MOON, "Slept", S.bed, plain(MD.niceS(P.bed)), d.db, d.bedOk) + ln(SUN, "Woke up", S.wake, plain(MD.niceS(P.wake)), d.dw, d.wakeOk) + '<small>Within ' + P.tol + ' min of the plan counts as on time.</small></div>' : "";
    return '<div class="vrows">' +
      row("h", "glyph-sleep", "Sleep hours", "Your target is " + dur(d.T), hv, d.hp, "tl") +
      row("w", "glyph-clock", "Sleep window", "Plan " + d.plan, wv, d.wp, "tl", ed) +
      row("s", "glyph-care", "Self-care", d.self.map(function (x) { return x.n.split(" ")[0]; }).join(", "), '<b class="i">' + d.sd + ' of ' + d.st + '</b>', d.sp, "in") + '</div>';
  };

  /* C: both edges. Bedtime and wake-up each get a line, each said on time or how far off */
  R.c = function (d) {
    var hv = d.on ? '<b class="vbig t">' + dur(d.slept) + '</b>' : '<span class="vnone">Not logged</span>';
    var half = function (ic, l, m, plan, dd, ok) {
      return '<div class="vh"><span class="vh-l">' + ic + l + '</span>' +
        (d.on ? '<b class="vh-t">' + clk(m) + '</b>' + stat(ok, ok ? "On time" : edge(dd)) : '<b class="vh-t mute">' + plan + '</b><span class="vh-p">Planned</span>') + '</div>';
    };
    return '<div class="vg2">' +
      '<div class="vt-m">' + pool("h", d.hp, "tl") + top("glyph-sleep", "Sleep hours") + hv + '<span class="vof">of ' + dur(d.T) + '</span></div>' +
      '<div class="vt-m">' + pool("s", d.sp, "in") + top("glyph-care", "Self-care") + '<b class="vbig i">' + d.sd + '</b><span class="vof">of ' + d.st + ' done</span></div>' +
      '<div class="vt-m vwide">' + pool("w", d.wp, "tl") +
        '<div class="vw-h">' + top("glyph-clock", "Sleep window") + '<span class="vw-p">' + d.plan + '</span></div>' +
        '<div class="vh2">' + half(MOON, "Slept", S.bed, plain(MD.niceS(P.bed)), d.db, d.bedOk) + half(SUN, "Woke up", S.wake, plain(MD.niceS(P.wake)), d.dw, d.wakeOk) + '</div>' +
        '<span class="vfoot">Within ' + P.tol + ' min of your plan counts as on time.</span></div></div>';
  };

  /* D: points earned out of points possible, the plain fact under them */
  R.d = function (d) {
    var p = d.pts;
    var tile = function (k, c, n, got, of, fact, pc, tone) {
      return '<div class="vt-m">' + pool(k, pc, tone) + top(c, n) + '<span class="vpt"><b class="' + (tone === "in" ? "i" : "t") + '">' + got + '</b><small>of ' + of + '</small></span><span class="vof">' + fact + '</span></div>';
    };
    return '<div class="vg3">' +
      tile("h", "glyph-sleep", "Sleep hours", p.h, p.hw, d.on ? dur(d.slept) + " slept" : "Not logged", d.hp, "tl") +
      tile("w", "glyph-clock", "Sleep window", p.w, p.ww, d.on ? (d.bedOk && d.wakeOk ? "Bed and wake on time" : (Math.abs(d.db) >= Math.abs(d.dw) ? "Bed " : "Up ") + edge(d.off).toLowerCase()) : "Not logged", d.wp, "tl") +
      tile("s", "glyph-care", "Self-care", p.s, p.sw, d.sd + " of " + d.st + " done", d.sp, "in") + '</div>' +
      '<p class="vnote">Points add up to your Rhythm. The sleep window is ' + d.plan + ', set by your coach.</p>';
  };

  /* E: today's tiles, each a button that explains itself */
  R.e = function (d) {
    var hv = d.on ? '<b class="vbig t">' + dur(d.slept) + '</b>' : '<span class="vnone">Not logged</span>';
    var wv = d.on ? '<b class="vword t">' + edge(d.off) + '</b>' : '<span class="vnone">Not logged</span>';
    var b = function (k, inner, lab) { return '<button class="vt-m vbtn" data-vt="' + k + '" aria-label="' + lab + '">' + inner + '<span class="vi">' + INFO + '</span></button>'; };
    return '<div class="vg3">' +
      b("h", pool("h", d.hp, "tl") + top("glyph-sleep", "Sleep hours") + hv + '<span class="vof">of ' + dur(d.T) + '</span>', "What is sleep hours?") +
      b("w", pool("w", d.wp, "tl") + top("glyph-clock", "Sleep window") + wv + '<span class="vof">' + planBr(d) + '</span>', "What is the sleep window?") +
      b("s", pool("s", d.sp, "in") + top("glyph-care", "Self-care") + '<b class="vbig i">' + d.sd + '</b><span class="vof">of ' + d.st + ' done</span>', "What counts as self-care?") + '</div>' +
      '<p class="vnote c">Tap a tile to see how it counts.</p>';
  };

  /* F: each tile asks what it checks, and answers it */
  R.f = function (d) {
    var q = function (k, c, ask, ans, sub, p, tone) {
      return '<div class="vt-m vq">' + pool(k, p, tone) + '<span class="ttop vq-q">' + gl(c) + '<span>' + ask + '</span></span><b class="vq-a ' + (tone === "in" ? "i" : "t") + '">' + ans + '</b><span class="vof">' + sub + '</span></div>';
    };
    var ha = !d.on ? "Not logged" : d.short <= 0 ? "Yes" : gap(d.short) + " short";
    var late = Math.abs(d.db) >= Math.abs(d.dw);
    var wa = !d.on ? "Not logged" : d.bedOk && d.wakeOk ? "Yes" : edge(d.off);
    var ws = !d.on || (d.bedOk && d.wakeOk) ? planBr(d) : late ? "Bed " + clk(S.bed) + "<br>Plan " + plain(MD.niceS(P.bed)) : "Up " + clk(S.wake) + "<br>Plan " + plain(MD.niceS(P.wake));
    return '<div class="vg3">' +
      q("h", "glyph-sleep", "Enough sleep?", ha, d.on ? dur(d.slept) + " slept" : "Target " + dur(d.T), d.hp, "tl") +
      q("w", "glyph-clock", "In your sleep window?", wa, ws, d.wp, "tl") +
      q("s", "glyph-care", "Self-care done?", d.sd >= d.st ? "All done" : d.sd + " of " + d.st, "on today’s plan", d.sp, "in") + '</div>';
  };

  /* ---------- G to K: only the Sleep window tile changes ---------- */
  var hoursTile = function (d) { return '<div class="vt-m">' + pool("h", d.hp) + top("glyph-sleep", "Sleep hours") + (d.on ? '<b class="vbig t">' + dur(d.slept) + '</b>' : '<span class="vnone">Not logged</span>') + '<span class="vof">of ' + dur(d.T) + '</span></div>'; };
  var careTile = function (d) { return '<div class="vt-m">' + pool("s", d.sp, "in") + top("glyph-care", "Self-care") + '<b class="vbig i">' + d.sd + '</b><span class="vof">of ' + d.st + ' done</span></div>'; };
  var row3 = function (d, inner) { return '<div class="vg3">' + hoursTile(d) + '<div class="vt-m">' + pool("w", d.wp) + top("glyph-clock", "Sleep window") + inner + '</div>' + careTile(d) + '</div>'; };
  var wide = function (d, inner) { return '<div class="vg2">' + hoursTile(d) + careTile(d) + '<div class="vt-m vwide">' + pool("w", d.wp) + inner + '</div></div>'; };
  var short = function (s) { return MD.niceS(s).replace(/ [AP]M$/, ""); };   /* plan 10:30, plan 6:00 */
  var lc = function (t) { return t.charAt(0).toLowerCase() + t.slice(1); };

  /* G: one plain sentence */
  R.g = function (d) {
    var t = !d.on ? '<span class="vnone">Not logged</span>'
      : '<b class="vsen">' + (d.bedOk && d.wakeOk ? "Bed and up on time" : "Bed " + lc(edge(d.db)) + ", up " + lc(edge(d.dw))) + '</b>';
    return row3(d, t + '<span class="vof">Plan ' + planBr(d) + '</span>');
  };

  /* H: two clock chips */
  R.h = function (d) {
    var chip = function (ic, m, s, dd, ok) {
      return '<span class="vc">' + '<span class="vc-t">' + ic + (d.on ? '<b>' + clk(m) + '</b>' + (ok ? '<span class="vc-ok" aria-label="On time">' + OK + '</span>' : '') : '<b class="mute">Not logged</b>') + '</span>' +
        '<span class="vc-p">plan ' + short(s) + '</span>' + (d.on && !ok ? '<span class="vc-off">' + edge(dd) + '</span>' : '') + '</span>';
    };
    return row3(d, '<span class="vcs">' + chip(MOON, S.bed, P.bed, d.db, d.bedOk) + chip(SUN, S.wake, P.wake, d.dw, d.wakeOk) + '</span>');
  };

  /* I: a mini timeline, the plan outlined and last night solid on one track */
  R.i = function (d) {
    var a0 = d.pb - 120, a1 = d.pw + 120, pc = function (m) { return Math.max(0, Math.min(100, (m - a0) / (a1 - a0) * 100)); };
    var words = !d.on ? "Not logged yet" : d.bedOk && d.wakeOk ? "Inside your window" : (function () {
      var b = d.db, w = d.dw, big = Math.abs(b) >= Math.abs(w);
      if (big) return b > 0 ? "Asleep " + gap(b) + " after it began" : gap(b) + " outside, asleep early";
      return w > 0 ? gap(w) + " outside, up late" : "Up " + gap(w) + " before it ended";
    })();
    var tr = '<span class="vtl" role="img" aria-label="Sleep window ' + d.plan + (d.on ? ". Last night " + clk(S.bed) + " to " + clk(S.wake) : "") + '">' +
      '<span class="vtl-w" style="left:' + pc(d.pb) + '%;width:' + (pc(d.pw) - pc(d.pb)) + '%"></span>' +
      (d.on ? '<span class="vtl-n" style="left:' + pc(S.bed) + '%;width:' + Math.max(1, pc(S.wake) - pc(S.bed)) + '%"></span>' : '') + '</span>' +
      '<span class="vtl-ax"><span style="left:' + pc(d.pb) + '%">' + plain(MD.niceS(P.bed)) + '</span><span style="left:' + pc(d.pw) + '%">' + plain(MD.niceS(P.wake)) + '</span></span>';
    return wide(d, '<div class="vw-h">' + top("glyph-clock", "Sleep window") + '<b class="vw-r">' + words + '</b></div>' + tr +
      '<span class="vlg">' + (d.on ? '<span><i class="n"></i>Last night</span>' : '') + '<span><i class="w"></i>Your sleep window</span></span>');
  };

  /* J: yes or no */
  R.j = function (d) {
    var q = function (l, dd, ok) { return '<span class="vyn"><span class="vyn-q">' + l + '</span><b>' + (!d.on ? '<span class="mute">Not logged</span>' : ok ? "Yes" : edge(dd)) + '</b></span>'; };
    return row3(d, '<span class="vyns">' + q("To bed on time?", d.db, d.bedOk) + q("Up on time?", d.dw, d.wakeOk) + '</span><span class="vof">Plan ' + planBr(d) + '</span>');
  };

  /* K: plan over you, two bars on one scale with the times inside, the gap named at each end */
  R.k = function (d) {
    var lo = Math.min(d.pb, d.on ? S.bed : d.pb), hi = Math.max(d.pw, d.on ? S.wake : d.pw), pad = 40;
    var a0 = lo - pad, a1 = hi + pad, pc = function (m) { return (m - a0) / (a1 - a0) * 100; };
    var bar = function (cls, b, w) {
      var wd = pc(w) - pc(b), tx = '<span>' + plain(clk(b)) + '</span><span>' + plain(clk(w)) + '</span>';
      if (wd >= 40) return '<span class="vk-b ' + cls + '" style="left:' + pc(b) + '%;width:' + wd + '%">' + tx + '</span>';
      /* too short for its times: they sit beside it, on the side with room */
      var left = pc(b) > 50;
      return '<span class="vk-b ' + cls + '" style="left:' + pc(b) + '%;width:' + wd + '%"></span><span class="vk-out" style="' + (left ? "right:" + (100 - pc(b) + 2) : "left:" + (pc(w) + 2)) + '%">' + plain(clk(b)) + ' to ' + plain(clk(w)) + '</span>';
    };
    var tag = function (dd, ok) { return ok ? '<span class="vk-t">' + OK + 'on time</span>' : '<span class="vk-t off">' + edge(dd).toLowerCase() + '</span>'; };
    return wide(d, '<div class="vw-h">' + top("glyph-clock", "Sleep window") + '<span class="vw-p">' + (d.on ? (d.bedOk && d.wakeOk ? "Both on time" : (d.bedOk ? 1 : 0) + (d.wakeOk ? 1 : 0) + " of 2 on time") : "") + '</span></div>' +
      '<div class="vk"><span class="vk-l">Plan</span><span class="vk-r">' + bar("w", d.pb, d.pw) + '</span>' +
      '<span class="vk-l">You</span><span class="vk-r">' + (d.on ? bar("n", S.bed, S.wake) : '<span class="vk-none">Log last night to see it here</span>') + '</span>' +
      (d.on ? '<span></span><span class="vk-ts">' + tag(d.db, d.bedOk) + tag(d.dw, d.wakeOk) + '</span>' : '') + '</div>');
  };

  /* ---------- three tiles and a window strip ---------- */
  function row1(d) {
    return '<div class="vg3">' +
      '<div class="vt-m">' + pool("h", d.hp) + top("glyph-sleep", "Sleep duration") + (d.on ? '<b class="vbig t">' + dur(d.slept) + '</b>' : '<span class="vnone">Not logged</span>') + '<span class="vof">of ' + dur(d.T) + '</span></div>' +
      '<div class="vt-m">' + pool("s", d.care.p, "in") + top("glyph-care", "Self-care") + '<b class="vbig i">' + d.care.d + '</b><span class="vof">of ' + d.care.t + ' done</span></div>' +
      '<div class="vt-m">' + pool("d", d.wd.p, "in") + top("glyph-wind", "Wind-down") + '<b class="vbig i">' + d.wd.d + '</b><span class="vof">of ' + d.wd.t + ' done</span></div></div>';
  }
  /* the strip: indigo glass, its liquid running left to right with the window's points */
  var strip = function (d, inner, cls) { return row1(d) + '<div class="vsp' + (cls ? " " + cls : "") + '">' + '<span class="tpool"><span class="vf h" data-k="w" style="--to:' + Math.round(d.wp * 100) + '%"></span></span>' + inner + '</div>'; };
  var name = '<span class="vsp-n">' + gl("glyph-clock") + 'Sleep window</span>';
  var tick = '<span class="vc-ok" aria-label="On time">' + OK + '</span>';
  var ring = '<span class="vring" aria-hidden="true"></span>';
  var hh = function (s) { return MD.niceS(s).replace(/ [AP]M$/, ""); };   /* plan 10:30, plan 6:00 */
  var both = function (d) { return d.bedOk && d.wakeOk; };
  var verdict = function (d) { return both(d) ? "Bed and wake-up on time" : "Bed " + lc(edge(d.db)) + ", wake-up " + lc(edge(d.dw)); };

  /* SA: one line of times, each beside its plan, a tick when on time */
  R.sa = function (d) {
    var c = function (ic, m, pl, ok) { return '<span class="sa-c">' + ic + '<b>' + clk(m) + '</b><small>plan ' + hh(pl) + '</small>' + (ok ? tick : ring) + '</span>'; };
    var off = !d.on ? "Plan " + d.plan : both(d) ? "" : (Math.abs(d.db) >= Math.abs(d.dw) ? "Bed " : "Up ") + lc(edge(d.off));
    return strip(d, '<div class="vsp-1">' + name + '<span class="vsp-r">' + off + '</span></div>' +
      (d.on ? '<div class="sa">' + c(MOON, S.bed, P.bed, d.bedOk) + c(SUN, S.wake, P.wake, d.wakeOk) + '</div>' : '<div class="vsp-2 mute">Not logged yet</div>'));
  };
  /* SB: a hairline timeline, plan outlined, last night solid, words on the right */
  R.sb = function (d) {
    var a0 = d.pb - 120, a1 = d.pw + 120, pc = function (m) { return Math.max(0, Math.min(100, (m - a0) / (a1 - a0) * 100)); };
    var w = !d.on ? "Not logged yet" : both(d) ? "Inside your window" : (Math.abs(d.db) >= Math.abs(d.dw) ? "Bed " : "Up ") + lc(edge(d.off));
    return strip(d, '<div class="vsp-1">' + name + '<span class="vsp-pl">' + d.plan + '</span></div>' +
      '<div class="sb-row"><span class="sb" role="img" aria-label="Sleep window ' + d.plan + (d.on ? ". Last night " + clk(S.bed) + " to " + clk(S.wake) : "") + '"><span class="sb-w" style="left:' + pc(d.pb) + '%;width:' + (pc(d.pw) - pc(d.pb)) + '%"></span>' +
      (d.on ? '<span class="sb-n" style="left:' + pc(S.bed) + '%;width:' + Math.max(1, pc(S.wake) - pc(S.bed)) + '%"></span>' : '') + '</span><b class="sb-w2">' + w + '</b></div>', "sbx");
  };
  /* SC: a sentence */
  R.sc = function (d) {
    return strip(d, '<div class="vsp-1">' + name + '<span class="vsp-pl">' + d.plan + '</span></div>' +
      '<div class="vsp-2">' + (d.on ? (both(d) ? tick : ring) + '<b>' + verdict(d) + '</b>' : '<span class="mute">Not logged yet</span>') + '</div>');
  };
  /* SD: two halves, Bed and Wake, each told against the window's edge */
  R.sd = function (d) {
    var h = function (ic, l, m, edgeName, pl, dd, ok) {
      var sub = !d.on ? "Window " + edgeName + " " + plain(MD.niceS(pl)) : ok ? "Window " + edgeName + " " + plain(MD.niceS(pl)) : gap(dd) + (dd > 0 ? " after " : " before ") + plain(MD.niceS(pl));
      return '<span class="sd-h"><span class="sd-1">' + ic + l + ' <b>' + (d.on ? clk(m) : "not logged") + '</b>' + (d.on ? (ok ? tick : ring) : "") + '</span><span class="sd-2">' + sub + '</span></span>';
    };
    return strip(d, '<div class="sd">' + h(MOON, "Bed", S.bed, "opens", P.bed, d.db, d.bedOk) + h(SUN, "Wake", S.wake, "closes", P.wake, d.dw, d.wakeOk) + '</div>', "sdx");
  };
  /* SE: 1 of 2 on time, with the two times */
  R.se = function (d) {
    var n = (d.bedOk ? 1 : 0) + (d.wakeOk ? 1 : 0);
    var t = function (ic, m, ok) { return '<span class="se-t">' + ic + '<b>' + clk(m) + '</b>' + (ok ? tick : ring) + '</span>'; };
    return strip(d, '<div class="vsp-1">' + name + '<span class="vsp-pl">' + d.plan + '</span></div>' +
      '<div class="vsp-2 se">' + (d.on ? '<b class="se-n">' + n + ' of 2 on time</b>' + t(MOON, S.bed, d.bedOk) + t(SUN, S.wake, d.wakeOk) : '<span class="mute">Not logged yet</span>') + '</div>');
  };
  /* SF: the window over last night, two aligned lines, so the comparison is literal */
  R.sf = function (d) {
    var res = !d.on ? "" : both(d) ? tick + '<b>On time</b>' : '<b class="off">' + (Math.abs(d.db) >= Math.abs(d.dw) ? "Bed " : "Up ") + lc(edge(d.off)) + '</b>';
    return strip(d, '<div class="sf">' + '<span class="sf-l">Sleep window</span><span class="sf-t">' + d.plan + '</span><span></span>' +
      '<span class="sf-l">Last night</span><span class="sf-t you">' + (d.on ? clk(S.bed) + " to " + clk(S.wake) : '<span class="mute">Not logged yet</span>') + '</span><span class="sf-r">' + res + '</span></div>', "sfx");
  };

  /* ---------- Slept and Woke up, slim ---------- */
  /* plain amounts: 40 min, 1 hr, 2 hrs, 1 hr 15 min */
  function amt(m) { m = Math.round(Math.abs(m)); var h = Math.floor(m / 60), x = m % 60; return !h ? x + " min" : h + (h > 1 ? " hrs" : " hr") + (x ? " " + x + " min" : ""); }
  var EV = function (dd) { var a = Math.abs(dd); return a <= P.tol ? 1 : a >= P.zero ? 0 : 1 - (a - P.tol) / (P.zero - P.tol); };   /* rhythm.js's rule for one edge */
  function said(l, dd) { return Math.abs(dd) <= P.tol ? l + " on time" : l + " " + amt(dd) + (dd > 0 ? " late" : " early"); }
  function said2(dd) { return Math.abs(dd) <= P.tol ? "On time" : amt(dd) + (dd > 0 ? " late" : " early"); }
  var mark = function (ok) { return ok ? tick : ring; };
  var edges = function (d) { return [{ l: "Slept", ic: MOON, m: S.bed, pl: P.bed, dd: d.db, ok: d.bedOk, k: "b" }, { l: "Woke up", ic: SUN, m: S.wake, pl: P.wake, dd: d.dw, ok: d.wakeOk, k: "u" }]; };
  var stripW = function (d, inner, cls) { return row1(d) + '<div class="vsp ' + (cls || "") + '">' + inner + '</div>'; };
  var none = '<span class="mute">Not logged yet</span>';

  /* WA: words only, the user's idea */
  R.wa = function (d) {
    return stripW(d, '<div class="wa">' + edges(d).map(function (e) {
      return '<span class="wa-h">' + (d.on ? mark(e.ok) + '<b>' + said(e.l, e.dd) + '</b>' : e.ic + '<span>' + e.l + '</span>' + none) + '</span>';
    }).join("") + '</div>', "wax");
  };
  /* WB: two slim tiles, each with its own fill */
  R.wb = function (d) {
    return row1(d) + '<div class="wb">' + edges(d).map(function (e) {
      return '<div class="vsp wb-t"><span class="tpool"><span class="vf h" data-k="' + e.k + '" style="--to:' + Math.round((d.on ? EV(e.dd) : 0) * 100) + '%"></span></span>' +
        '<span class="wb-1">' + e.ic + e.l + (d.on ? ' <b>' + clk(e.m) + '</b>' : '') + '</span><span class="wb-2">' + (d.on ? mark(e.ok) + said2(e.dd) : none) + '</span></div>';
    }).join("") + '</div>';
  };
  /* WF: WB with the fill alone saying how close each edge was: full when on time, so no tick and no "On time".
     Only a miss gets words, small, so the amount is still there to read */
  R.wf = function (d) {
    return row1(d) + '<div class="wb wf">' + edges(d).map(function (e) {
      return '<div class="vsp wb-t"><span class="tpool"><span class="vf h" data-k="' + e.k + '" style="--to:' + Math.round((d.on ? EV(e.dd) : 0) * 100) + '%"></span></span>' +
        '<span class="wb-1">' + e.l + '</span><span class="wf-v">' + (d.on ? clk(e.m) : none) + '</span>' + (d.on && !e.ok ? '<span class="wf-m">' + said2(e.dd) + '</span>' : '') + '</div>';
    }).join("") + '</div>';
  };
  /* WC: Eight Sleep's Schedule card, time large and the range under it */
  R.wc = function (d) {
    return stripW(d, '<div class="wc">' + edges(d).map(function (e) {
      return '<span class="wc-h"><span class="wc-l">' + e.ic + e.l + '</span><b>' + (d.on ? clk(e.m) : '<span class="mute">Not logged</span>') + '</b><span class="wc-s">' +
        (!d.on ? "Plan " + plain(MD.niceS(e.pl)) : e.ok ? mark(true) + "Within 30 min of plan" : mark(false) + said2(e.dd)) + '</span></span>';
    }).join("") + '</div>', "wcx");
  };
  /* WD: WHOOP's Sleep Planner bracket, the two ends of the night, words only (https://mobbin.com/screens/4396ddf2-9aba-45c3-a3aa-8695e6fa697a) */
  R.wd = function (d) {
    var E = edges(d), end = function (e, r) { return '<span class="wd-e' + (r ? " r" : "") + '"><span class="wd-1">' + e.l + (d.on ? ' <b>' + clk(e.m) + '</b>' : '') + '</span><span class="wd-2">' + (d.on ? mark(e.ok) + said2(e.dd) : none) + '</span></span>'; };
    return stripW(d, '<div class="wd">' + end(E[0]) + '<span class="wd-br" aria-hidden="true"></span>' + end(E[1], true) + '</div>', "wdx");
  };
  /* WE: Apple Health's Your Schedule, a small label over each time, the plan under it */
  R.we = function (d) {
    return stripW(d, '<div class="we">' + edges(d).map(function (e) {
      return '<span class="we-h"><span class="we-l">' + e.ic + e.l.toUpperCase() + '</span><b>' + (d.on ? clk(e.m) + mark(e.ok) : '<span class="mute">Not logged</span>') + '</b><span class="we-p">' +
        (d.on && !e.ok ? said2(e.dd) : "Plan " + plain(MD.niceS(e.pl))) + '</span></span>';
    }).join("") + '</div>', "wex");
  };

  /* ---------- E's sheets ---------- */
  function sheet(k) {
    var d = data(), h;
    if (k === "w") {
      var row = function (ic, l, m, plan, dd, ok) {
        return '<div class="vs-r"><span class="vs-ic">' + ic + '</span><span class="vs-t">' + l + (d.on ? ' <b>' + clk(m) + '</b>' : '') + '<small>Plan ' + plan + '</small></span>' + (d.on ? stat(ok, ok ? "On time" : edge(dd)) : '<span class="vnone">Not logged</span>') + '</div>';
      };
      h = '<p class="vs-p">The time your coach would like you asleep, <b>' + d.plan + '</b>. Going to bed and waking up near the same times each day keeps your body clock steady.</p>' +
        '<div class="vs-pic">' + mini(d, true) + '<div class="vs-lg">' + (d.on ? '<span><i class="ln"></i>Last night</span>' : '') + '<span><i class="lw"></i>Sleep window</span></div></div>' +
        row(MOON, "Slept", S.bed, plain(MD.niceS(P.bed)), d.db, d.bedOk) + row(SUN, "Woke up", S.wake, plain(MD.niceS(P.wake)), d.dw, d.wakeOk) +
        '<div class="vs-how"><b>How it counts</b><span>Bedtime and wake-up each earn half. Within ' + P.tol + ' minutes of your plan earns it all, and it shrinks to nothing at 2 hours off.</span></div>';
      return window.GFOpenSheet("vtSheet", "What is the sleep window?", h);
    }
    if (k === "h") {
      h = '<p class="vs-p">How long you were asleep last night. Your coach set your target at <b>' + dur(d.T) + '</b>.</p>' +
        '<div class="vs-big"><b class="t">' + (d.on ? dur(d.slept) : "Not logged") + '</b><span>' + (!d.on ? "Log last night to see it here" : d.short > 0 ? gap(d.short) + " short of your target" : "Your target reached") + '</span></div>' +
        '<div class="vs-how"><b>How it counts</b><span>Reaching ' + dur(d.T) + ' earns it all. Each hour short earns a little less, down to nothing at ' + P.short + ' hours short.</span></div>';
      return window.GFOpenSheet("vtSheet", "Sleep hours", h);
    }
    h = '<p class="vs-p">The small things on your plan that help your day and your night. Each one counts on its own.</p>' +
      '<div class="vs-list">' + d.self.map(function (x) { return '<div class="vs-r"><span class="vs-t">' + x.n + '</span><span class="vst ' + (x.d >= x.t ? "vok" : "voff") + '">' + (x.d >= x.t ? OK + "Done" : "<i></i>" + x.d + " of " + x.t) + '</span></div>'; }).join("") + '</div>';
    return window.GFOpenSheet("vtSheet", "Self-care", h);
  }
  box.addEventListener("click", function (e) { var b = e.target.closest("[data-vt]"); if (b) sheet(b.dataset.vt); });

  /* ---------- paint ---------- */
  var was = {};
  function paint() {
    if (!window.MDRHYTHM) return;
    var d = data();
    box.className = "macros tiles vt vt-" + V;
    box.innerHTML = R[V](d);
    var f = box.querySelectorAll(".vf");
    [].forEach.call(f, function (x) { x.style.setProperty("--f", RD ? x.style.getPropertyValue("--to") : was[x.dataset.k] || "0%"); });
    if (RD) return;
    void box.offsetWidth;
    [].forEach.call(f, function (x, i) { if (!was[x.dataset.k]) x.style.transitionDelay = i * 90 + "ms"; x.style.setProperty("--f", x.style.getPropertyValue("--to")); was[x.dataset.k] = x.style.getPropertyValue("--to"); });
  }
  window.paintMacros = function () { paint(); };
  box.innerHTML = "";
  (function wait(n) { if (window.MDRHYTHM) paint(); else if (n < 60) setTimeout(function () { wait(n + 1); }, 50); })(0);

  /* ?scroll=tiles opens the screen at this card, for the research doc */
  if (Q.get("scroll") === "tiles") setTimeout(function () { var t = document.getElementById("railSect"); window.scrollTo(0, t.getBoundingClientRect().top + window.scrollY - 12); }, 1200);

  /* ---------- the look ---------- */
  var css = document.createElement("style");
  css.textContent = [
    /* indigo tokens only: 25 #F5F8FF, 50 #EEF4FF, 100 #E0EAFF, 200 #C7D7FE, 300 #A4BCFD, 500 #6172F3, 600 #444CE7, 700 #3538CD (6.9:1 on white), 900 #2D3282; greys for words */
    "#railMacros.tiles::before{background:linear-gradient(to bottom,#EEF4FF,rgba(238,244,255,0))}",
    "#macros.vt{padding:10px 10px 12px}",
    ".vt .vg3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}",
    ".vt .vg2{display:grid;grid-template-columns:1fr 1fr;gap:8px}.vt .vwide{grid-column:1 / -1}",
    ".vt .vt-m{position:relative;display:flex;flex-direction:column;align-items:stretch;min-height:92px;border-radius:18px;overflow:hidden;background:rgba(255,255,255,.8);box-shadow:inset 0 0 0 1px rgba(164,188,253,.55);padding:10px 7px;text-align:left;font:inherit;color:inherit;border:0;min-width:0}",
    ".vt .vt-m::after{content:'';position:absolute;left:7px;top:10px;width:3px;height:50%;border-radius:2px;pointer-events:none;background:linear-gradient(to bottom,rgba(255,255,255,.6),rgba(255,255,255,0))}",
    ".vt .vt-m > *:not(.tpool){position:relative}",
    ".vt .tpool{position:absolute;inset:4px;border-radius:14px;overflow:hidden}",
    ".vt .tpool .vf{position:absolute;left:0;right:0;bottom:0;height:var(--f);background:linear-gradient(to top,#EEF4FF,#C7D7FE)}",
    ".vt .tpool .vf.in{background:linear-gradient(to top,#EEF4FF,#C7D7FE)}",
    ".vt .vf{transition:height 1.1s cubic-bezier(.4,0,.2,1),width 1.1s cubic-bezier(.4,0,.2,1)}",
    ".vt .ttop{display:flex;align-items:center;gap:3px;font:400 12px/16px Roboto,sans-serif;color:#475467;white-space:nowrap;letter-spacing:-.1px}",
    ".vt .tgl{flex:0 0 auto;width:16px;height:16px}",
    ".vt .t,.vt .i{color:#2D3282}",
    ".vt .vbig{margin-top:14px;font:700 20px/24px Roboto,sans-serif;font-variant-numeric:tabular-nums;white-space:nowrap}",
    ".vt .vword{margin-top:14px;font:700 17px/22px Roboto,sans-serif}",
    ".vt .vnone{margin-top:14px;font:500 14px/24px Roboto,sans-serif;color:#667085}",
    ".vt .vof{margin-top:3px;font:400 12px/16px Roboto,sans-serif;color:#475467;font-variant-numeric:tabular-nums}",
    /* A's mini bar */
    ".vt .mb{position:relative;display:block;height:8px;margin:7px 0 2px;border-radius:4px;background:rgba(242,244,247,.9)}",
    ".vt .mb-w{position:absolute;top:-2px;bottom:-2px;border-radius:5px;background:#E0EAFF;border:1.5px dashed #3538CD;box-sizing:border-box}",
    ".vt .mb-n{position:absolute;top:1.5px;bottom:1.5px;border-radius:3px;background:linear-gradient(90deg,#6172F3,#3538CD)}",
    ".vt .mb.wide{height:18px;border-radius:6px;margin:0}.vt .mb.wide .mb-w{top:-3px;bottom:-3px;border-radius:8px}.vt .mb.wide .mb-n{top:3px;bottom:3px;border-radius:4px}",
    ".vt .ggs{display:flex;flex-direction:column;gap:5px;margin:8px 0 2px}",
    ".vt .gg{display:flex;align-items:center;gap:5px}.vt .gg svg{width:11px;height:11px;color:#667085;flex:0 0 auto}",
    ".vt .gg-s{position:relative;flex:1;height:5px;border-radius:2px;background:#E4E7EC}",
    ".vt .gg-z{position:absolute;top:-3px;bottom:-3px;border-radius:4px;background:#E0EAFF;border:1px dashed #3538CD;box-sizing:border-box}",
    ".vt .gg-c{position:absolute;left:50%;top:-3px;bottom:-3px;width:1px;background:#3538CD;opacity:.5}",
    ".vt .gg-d{position:absolute;top:50%;width:9px;height:9px;margin:-4.5px 0 0 -4.5px;border-radius:50%;background:#3538CD;box-shadow:0 0 0 2px #fff;transition:left .9s cubic-bezier(.4,0,.2,1)}.vt .gg-d.off{background:#fff;border:2px solid #6172F3;box-sizing:border-box}",
    /* status: on time in indigo with a tick, off in ink with a hollow indigo dot */
    ".vt .vst,.vs-r .vst{display:inline-flex;align-items:center;gap:4px;font:600 12px/16px Roboto,sans-serif;white-space:nowrap}",
    ".vst.vok{color:#3538CD}.vst.vok svg{width:14px;height:14px;flex:0 0 auto}.vst.voff{color:#101828}.vst.voff i{width:8px;height:8px;border-radius:50%;background:#fff;border:1.5px solid #6172F3;box-sizing:border-box;flex:0 0 auto;margin:0 3px}",
    /* B's rows */
    ".vt .vrows{display:flex;flex-direction:column;gap:6px}",
    ".vt .vr{border-radius:16px;background:rgba(255,255,255,.8);box-shadow:inset 0 0 0 1px rgba(164,188,253,.55);padding:12px 14px}",
    ".vt .vr-h{display:flex;align-items:flex-start;gap:8px}.vt .vr-h .tgl{margin-top:2px}",
    ".vt .vr-n{flex:1;min-width:0;font:600 14px/20px Roboto,sans-serif;color:#101828}.vt .vr-n small{display:block;font:400 12px/16px Roboto,sans-serif;color:#475467}",
    ".vt .vr-v{font:600 14px/20px Roboto,sans-serif;color:#101828;white-space:nowrap;font-variant-numeric:tabular-nums}.vt .vr-v .vst{font-size:14px;line-height:20px}",
    ".vt .vr-ed{display:flex;flex-direction:column;gap:2px;margin:8px 0 0 24px;font:400 12px/18px Roboto,sans-serif;color:#475467}.vt .vr-ed span{display:inline-flex;align-items:center;gap:6px}.vt .vr-ed svg{width:13px;height:13px;color:#667085}.vt .vr-ed b{font-weight:600;color:#101828}.vt .vr-ed em{font-style:normal;flex:1}.vt .vr-ed small{font-size:12px;color:#667085;margin-top:2px}",
    ".vt .vr-bar{position:relative;display:block;height:4px;margin:10px 0 0 24px;border-radius:2px;background:#F2F4F7;overflow:hidden}",
    ".vt .vr-bar .vf{position:absolute;left:0;top:0;bottom:0;width:var(--f);border-radius:2px;background:linear-gradient(90deg,#6172F3,#3538CD)}.vt .vr-bar .vf.in{background:linear-gradient(90deg,#6172F3,#444CE7)}",
    /* C's wide window */
    ".vt .vw-h{display:flex;align-items:center;justify-content:space-between;gap:8px}.vt .vw-p{font:600 12px/16px Roboto,sans-serif;color:#3538CD;white-space:nowrap}",
    ".vt .vh2{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}",
    ".vt .vh{display:flex;flex-direction:column;gap:2px;padding:8px 10px;border-radius:12px;background:rgba(255,255,255,.85)}",
    ".vt .vh-l{display:inline-flex;align-items:center;gap:5px;font:400 12px/16px Roboto,sans-serif;color:#475467}.vt .vh-l svg{width:13px;height:13px;color:#667085}",
    ".vt .vh-t{font:700 17px/22px Roboto,sans-serif;color:#101828;font-variant-numeric:tabular-nums}.vt .vh-t.mute{color:#475467}.vt .vh-p{font:400 12px/16px Roboto,sans-serif;color:#667085}",
    ".vt .vfoot{margin-top:8px;font:400 12px/16px Roboto,sans-serif;color:#475467}",
    /* D's points */
    ".vt .vpt{margin-top:14px;display:flex;align-items:baseline;gap:4px;font-variant-numeric:tabular-nums}.vt .vpt b{font:700 22px/24px Roboto,sans-serif}.vt .vpt small{font:500 12px/16px Roboto,sans-serif;color:#475467;white-space:nowrap}",
    ".vt .vnote{margin:10px 4px 0;font:400 12px/16px Roboto,sans-serif;color:#475467}.vt .vnote.c{text-align:center}",
    /* three tiles and a window strip */
    ".vt .vsp{position:relative;margin-top:8px;padding:8px 12px;border-radius:14px;overflow:hidden;background:rgba(255,255,255,.8);box-shadow:inset 0 0 0 1px rgba(164,188,253,.55);display:flex;flex-direction:column;gap:4px}",
    ".vt .vsp > *:not(.tpool){position:relative}.vt .vsp .tpool{inset:3px;border-radius:11px}",
    ".vt .tpool .vf.h{top:0;bottom:0;height:auto;width:var(--f);background:linear-gradient(to right,#EEF4FF,#E0EAFF)}",
    ".vt .tpool .vf.h{transition:width 1.1s cubic-bezier(.4,0,.2,1)}",
    ".vt .vsp-1{display:flex;align-items:center;gap:8px;min-height:20px}.vt .vsp-n{display:inline-flex;align-items:center;gap:4px;font:500 12px/16px Roboto,sans-serif;color:#344054;white-space:nowrap}",
    ".vt .vsp-pl{font:400 12px/16px Roboto,sans-serif;color:#475467;white-space:nowrap}",
    ".vt .vsp-r{margin-left:auto;font:600 12px/16px Roboto,sans-serif;color:#2D3282;white-space:nowrap}",
    ".vt .vsp-2{display:flex;align-items:center;gap:6px;font:400 13px/18px Roboto,sans-serif;color:#344054}.vt .vsp-2 b{font-weight:600;color:#2D3282}.vt .mute{color:#667085}",
    ".vt .vring{display:inline-block;width:12px;height:12px;border-radius:50%;border:1.5px solid #6172F3;background:#fff;box-sizing:border-box;flex:0 0 auto}",
    ".vt .vc-ok{flex:0 0 auto}",
    ".vt .sa{display:flex;justify-content:space-between;gap:8px}.vt .sa-c{display:inline-flex;align-items:center;gap:4px;white-space:nowrap;font-variant-numeric:tabular-nums}.vt .sa-c svg{width:12px;height:12px;color:#667085}.vt .sa-c b{font:700 13px/18px Roboto,sans-serif;color:#2D3282}.vt .sa-c small{font:400 11px/14px Roboto,sans-serif;color:#475467}.vt .sa-c em{font:600 11px/14px Roboto,sans-serif;font-style:normal;color:#101828}",
    ".vt .sb-row{display:flex;align-items:center;gap:10px;min-height:20px}.vt .sb-w2{font:600 12px/16px Roboto,sans-serif;color:#2D3282;white-space:nowrap}",
    ".vt .sb{position:relative;display:block;flex:1;height:6px;margin:0;border-radius:3px;background:rgba(228,231,236,.8)}.vt .sb-w{position:absolute;top:-3px;bottom:-3px;border-radius:5px;border:1.2px dashed #444CE7;box-sizing:border-box;background:rgba(224,234,255,.6)}.vt .sb-n{position:absolute;top:1px;bottom:1px;border-radius:2px;background:linear-gradient(90deg,#6172F3,#3538CD)}",
    ".vt .sd{display:grid;grid-template-columns:1fr 1fr;gap:10px}.vt .sd-h{display:flex;flex-direction:column;min-width:0}.vt .sd-h + .sd-h{padding-left:10px;border-left:1px solid rgba(164,188,253,.55)}",
    ".vt .sd-1{display:flex;align-items:center;gap:5px;font:400 12px/18px Roboto,sans-serif;color:#475467;white-space:nowrap}.vt .sd-1 svg{width:12px;height:12px;color:#667085;flex:0 0 auto}.vt .sd-1 b{font:700 13px/18px Roboto,sans-serif;color:#2D3282;font-variant-numeric:tabular-nums}",
    ".vt .sd-2{font:400 11.5px/16px Roboto,sans-serif;color:#475467;white-space:nowrap;padding-left:17px}",
    ".vt .se{gap:12px}.vt .se-t{display:inline-flex;align-items:center;gap:4px;white-space:nowrap}.vt .se-t svg{width:12px;height:12px;color:#667085}.vt .se-t b{font:700 13px/18px Roboto,sans-serif;color:#2D3282}.vt .se-n{margin-right:4px;font:600 12px/16px Roboto,sans-serif;color:#2D3282;white-space:nowrap}",
    ".vt .sf{display:grid;grid-template-columns:auto auto 1fr;align-items:center;gap:3px 8px}.vt .sf-r{justify-self:end}.vt .sf-r b.off{color:#101828}",
    ".vt .sf-l{display:inline-flex;align-items:center;gap:4px;font:400 12px/18px Roboto,sans-serif;color:#475467;white-space:nowrap}.vt .sf-l svg{width:13px;height:13px;color:#667085;margin:0 1.5px}.vt .sf-l .tgl{width:16px;height:16px}",
    ".vt .sf-t{font:500 13px/18px Roboto,sans-serif;color:#344054;white-space:nowrap;font-variant-numeric:tabular-nums}.vt .sf-t.you{font-weight:700;color:#2D3282}",
    ".vt .sf-r{display:inline-flex;align-items:center;gap:4px;font:600 12px/16px Roboto,sans-serif;color:#2D3282;white-space:nowrap}",
    /* Slept and Woke up, slim */
    ".vt .wa,.vt .wc,.vt .we{display:grid;grid-template-columns:1fr 1fr;gap:10px}",
    ".vt .wa-h{display:flex;align-items:center;gap:6px;min-width:0;font:400 13px/18px Roboto,sans-serif;color:#344054}.vt .wa-h b{font-weight:600;color:#2D3282}.vt .wa-h svg{width:12px;height:12px;color:#667085}",
    ".vt .wa-h + .wa-h,.vt .wc-h + .wc-h,.vt .we-h + .we-h{padding-left:10px;border-left:1px solid rgba(164,188,253,.55)}",
    ".vt .wb{display:grid;grid-template-columns:1fr 1fr;gap:8px}.vt .wb-t{gap:2px}",
    ".vt .wf-v{font:700 16px/22px Roboto,sans-serif;color:#2D3282;font-variant-numeric:tabular-nums}.vt .wf-m{font:500 12px/16px Roboto,sans-serif;color:#475467}",
    ".vt .wb-1{display:flex;align-items:center;gap:5px;font:400 12px/16px Roboto,sans-serif;color:#475467;white-space:nowrap}.vt .wb-1 svg{width:12px;height:12px;color:#667085}.vt .wb-1 b{font:700 13px/16px Roboto,sans-serif;color:#2D3282;font-variant-numeric:tabular-nums}",
    ".vt .wb-2{display:flex;align-items:center;gap:5px;font:600 12px/16px Roboto,sans-serif;color:#2D3282;white-space:nowrap}",
    ".vt .wc-h,.vt .we-h{display:flex;flex-direction:column;min-width:0}",
    ".vt .wc-l,.vt .we-l{display:flex;align-items:center;gap:5px;font:400 11px/14px Roboto,sans-serif;color:#475467}.vt .we-l{letter-spacing:.04em;font-weight:500}.vt .wc-l svg,.vt .we-l svg{width:11px;height:11px;color:#667085}",
    ".vt .wc-h > b,.vt .we-h > b{display:flex;align-items:center;gap:5px;font:700 15px/20px Roboto,sans-serif;color:#2D3282;font-variant-numeric:tabular-nums}.vt .wc-h > b .mute,.vt .we-h > b .mute{font:500 13px/20px Roboto,sans-serif}",
    ".vt .wc-s{display:flex;align-items:center;gap:4px;font:400 11.5px/15px Roboto,sans-serif;color:#344054;white-space:nowrap}.vt .wc-s .vring,.vt .wc-s .vc-ok{width:11px;height:11px}",
    ".vt .we-p{font:400 11.5px/15px Roboto,sans-serif;color:#475467;white-space:nowrap}",
    ".vt .wd{display:flex;align-items:center;gap:8px}.vt .wd-e{display:flex;flex-direction:column;gap:1px;flex:0 0 auto}.vt .wd-e.r{align-items:flex-end}",
    ".vt .wd-1{display:flex;align-items:center;gap:5px;font:400 12px/16px Roboto,sans-serif;color:#475467;white-space:nowrap}.vt .wd-1 svg{width:12px;height:12px;color:#667085}.vt .wd-1 b{font:700 13px/16px Roboto,sans-serif;color:#2D3282}",
    ".vt .wd-2{display:flex;align-items:center;gap:4px;font:600 12px/16px Roboto,sans-serif;color:#2D3282;white-space:nowrap}",
    ".vt .wd-br{flex:1;height:10px;border:1.5px solid #A4BCFD;border-top:0;border-radius:0 0 4px 4px;align-self:center;min-width:12px}",
    /* G to K */
    ".vt .vsen{margin-top:12px;font:700 14px/19px Roboto,sans-serif;color:#2D3282}",
    ".vt .vcs{display:flex;flex-direction:column;gap:8px;margin-top:10px}.vt .vc{display:flex;flex-direction:column}",
    ".vt .vc-t{display:flex;align-items:center;gap:4px;font-variant-numeric:tabular-nums;white-space:nowrap}.vt .vc-t svg{width:12px;height:12px;color:#667085;flex:0 0 auto}.vt .vc-t b{font:700 13px/18px Roboto,sans-serif;color:#2D3282}.vt .vc-t b.mute{font-weight:500;color:#667085}",
    ".vt .vc-ok{display:inline-grid;place-items:center;width:14px;height:14px;border-radius:50%;background:#444CE7}.vt .vc-ok svg{width:9px;height:9px;color:#fff}",
    ".vt .vc-p{margin-left:16px;font:400 11px/14px Roboto,sans-serif;color:#475467}.vt .vc-off{margin-left:16px;font:600 11px/14px Roboto,sans-serif;color:#101828}",
    ".vt .vw-r{font:700 13px/16px Roboto,sans-serif;color:#2D3282;white-space:nowrap}",
    ".vt .vtl{position:relative;display:block;height:18px;margin-top:14px;border-radius:6px;background:rgba(242,244,247,.9)}",
    ".vt .vtl-w{position:absolute;top:-3px;bottom:-3px;border-radius:8px;border:1.5px dashed #444CE7;background:rgba(224,234,255,.6);box-sizing:border-box}",
    ".vt .vtl-n{position:absolute;top:4px;bottom:4px;border-radius:4px;background:linear-gradient(90deg,#6172F3,#3538CD)}",
    ".vt .vtl-ax{position:relative;display:block;height:16px;margin-top:6px}.vt .vtl-ax span{position:absolute;transform:translateX(-50%);font:600 11px/16px Roboto,sans-serif;color:#344054;white-space:nowrap}",
    ".vt .vlg{display:flex;gap:14px;margin-top:6px;font:400 12px/16px Roboto,sans-serif;color:#475467}.vt .vlg span{display:inline-flex;align-items:center;gap:6px}.vt .vlg i{width:14px;height:8px;border-radius:3px}.vt .vlg .n{background:linear-gradient(90deg,#6172F3,#3538CD)}.vt .vlg .w{height:10px;border:1.5px dashed #444CE7;background:#E0EAFF;box-sizing:border-box}",
    ".vt .vyns{display:flex;flex-direction:column;gap:6px;margin-top:10px}.vt .vyn{display:flex;flex-direction:column}.vt .vyn-q{font:400 11px/14px Roboto,sans-serif;color:#475467;white-space:nowrap}.vt .vyn b{font:700 14px/18px Roboto,sans-serif;color:#2D3282;white-space:nowrap}.vt .vyn .mute{font-weight:500;color:#667085}",
    ".vt .vk{display:grid;grid-template-columns:34px 1fr;align-items:center;gap:6px 6px;margin-top:12px}",
    ".vt .vk-l{font:500 12px/16px Roboto,sans-serif;color:#475467}.vt .vk-r{position:relative;height:24px}",
    ".vt .vk-b{position:absolute;top:0;bottom:0;display:flex;align-items:center;justify-content:space-between;padding:0 7px;border-radius:7px;font:600 11px/14px Roboto,sans-serif;white-space:nowrap;font-variant-numeric:tabular-nums;box-sizing:border-box}",
    ".vt .vk-b.w{border:1.5px dashed #444CE7;background:#EEF4FF;color:#2D3282}.vt .vk-b.n{background:linear-gradient(90deg,#444CE7,#3538CD);color:#fff}",
    ".vt .vk-out{position:absolute;top:0;font:600 11px/24px Roboto,sans-serif;color:#2D3282;white-space:nowrap}",
    ".vt .vk-none{font:400 12px/24px Roboto,sans-serif;color:#667085}",
    ".vt .vk-ts{display:flex;justify-content:space-between}.vt .vk-t{display:inline-flex;align-items:center;gap:3px;font:600 12px/16px Roboto,sans-serif;color:#3538CD}.vt .vk-t svg{width:12px;height:12px}.vt .vk-t.off{color:#101828}",
    /* E: the tiles are buttons */
    ".vt .vbtn{cursor:pointer;transition:box-shadow .2s cubic-bezier(.4,0,.2,1)}.vt .vbtn:hover{box-shadow:inset 0 0 0 1.5px #6172F3}.vt .vbtn:focus-visible{outline:none;box-shadow:inset 0 0 0 2px #299D6B}",
    ".vt .vi{position:absolute !important;bottom:9px;right:8px;width:14px;height:14px;color:#98A2B3}.vt .vi svg{width:14px;height:14px;display:block}",
    /* F: questions */
    ".vt .vq .vq-q{align-items:flex-start;white-space:normal;min-height:32px;font-weight:500;color:#344054}.vt .vq-q .tgl{margin-top:0}",
    ".vt .vq-a{margin-top:8px;font:700 15px/20px Roboto,sans-serif;white-space:nowrap}",
    ".vt-f .vof{white-space:normal}",
    /* E's sheets */
    ".vs-p{margin:0 0 16px;font:400 14px/21px Roboto,sans-serif;color:#344054}.vs-p b{color:#101828}",
    ".vs-pic{padding:14px 12px 12px;border-radius:14px;background:#F9FAFB;margin-bottom:12px}.vs-pic .mb{position:relative;display:block}",
    ".vs-pic .mb.wide{height:18px;border-radius:6px;background:#F2F4F7}.vs-pic .mb-w{position:absolute;top:-3px;bottom:-3px;border-radius:8px;background:#E0EAFF;border:1.5px dashed #3538CD;box-sizing:border-box}.vs-pic .mb-n{position:absolute;top:3px;bottom:3px;border-radius:4px;background:linear-gradient(90deg,#6172F3,#3538CD)}",
    ".vs-lg{display:flex;gap:16px;margin-top:12px;font:400 12px/16px Roboto,sans-serif;color:#475467}.vs-lg span{display:inline-flex;align-items:center;gap:6px}.vs-lg i{width:14px;height:8px;border-radius:3px}.vs-lg .ln{background:linear-gradient(90deg,#6172F3,#3538CD)}.vs-lg .lw{background:#E0EAFF;border:1.5px dashed #3538CD;height:10px;box-sizing:border-box}",
    ".vs-r .vst{flex:0 0 auto}.vs-r{display:flex;align-items:center;gap:12px;padding:12px 0;border-top:1px solid #F2F4F7}.vs-r:first-child{border-top:0}",
    ".vs-ic{width:32px;height:32px;border-radius:10px;background:#EEF4FF;color:#3538CD;display:grid;place-items:center;flex:0 0 auto}.vs-ic svg{width:16px;height:16px}",
    ".vs-t{flex:1;min-width:0;font:400 14px/20px Roboto,sans-serif;color:#344054}.vs-t b{font-weight:600;color:#101828}.vs-t small{display:block;font-size:12px;line-height:16px;color:#667085}",
    ".vs-how{display:flex;flex-direction:column;gap:4px;margin-top:12px;padding:12px 14px;border-radius:12px;background:#EEF4FF;border:1px solid #C7D7FE;font:400 13px/19px Roboto,sans-serif;color:#344054}.vs-how b{color:#101828}",
    ".vs-big{display:flex;flex-direction:column;gap:2px;padding:14px;border-radius:14px;background:#F9FAFB}.vs-big b{font:700 26px/32px Roboto,sans-serif;color:#3538CD}.vs-big span{font:400 13px/18px Roboto,sans-serif;color:#475467}",
    ".vs-list{border-radius:14px;padding:0 14px;background:#F9FAFB}",
    "@media (prefers-reduced-motion: reduce){.vt .vf{transition:none}}"
  ].join("");
  document.head.appendChild(css);
})();
