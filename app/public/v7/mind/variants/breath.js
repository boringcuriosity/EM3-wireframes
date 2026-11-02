/* Breathing variants for research/breathing.html, drawn on the real Mind screen.
   ?vbreath=a  One orb for all: one player, only the rhythm and words change.
   ?vbreath=b  One shell, a guide for each (recommended): same sheet and controls, each exercise draws its own picture.
   ?vbreath=c  Five rooms: a separate experience per exercise (night sheet for Sleep, word picker for Zen, trace-it-yourself Star, named fingers, counted Box).
   ?vbreath=f  Full screen, two looks (?blook=1 Line, 3 Glass), for research/breathing-look.html. See the block near the end.
   ?vbreath=d  Learn, then let go: B, and the picture fades to a glow after the first minute while sound and buzz keep time.
   Doc params: ?bx=box|478|zen|star|finger picks the plan's first exercise, ?bmin=2..15 its minutes,
   ?bstate=ready|run|paused|early|done|part (part = 2 min saved, sheet closed), ?brep=1 done before, ?rm=1 reduced motion,
   ?bspeed=4 faster for review, ?brow=before keeps today's row. ?sheet=breath opens the sheet. */
(function () {
  "use strict";
  var MD = window.MDPLAN; if (!MD) return;
  var Q = MD.Q, VK = (Q.get("vbreath") || "b").toLowerCase();
  var LOOK = { a: "orb", b: "own", c: "room", d: "own", f: "own" }[VK] || "own", SETTLE = VK === "d";
  var BX = { box: "Box Breathing", "478": "Sleep Breathing", sleep: "Sleep Breathing", zen: "Zen Flow Breathing", star: "Star Breathing", finger: "5 Finger Breathing" };
  var KEY = { "Box Breathing": "box", "Sleep Breathing": "sleep", "Zen Flow Breathing": "zen", "Star Breathing": "star", "5 Finger Breathing": "finger" };
  if (!MD.P.br.length) MD.P.br.push({ n: "Box Breathing", min: 5, how: "", at: "13:00" });
  if (Q.get("bx") && BX[Q.get("bx")]) MD.P.br[0].n = BX[Q.get("bx")];
  if (+Q.get("bmin")) MD.P.br[0].min = +Q.get("bmin");
  var RM = Q.get("rm") === "1" || matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SPEED = +Q.get("bspeed") || 1, FIRST = Q.get("brep") !== "1", BEFORE = Q.get("brow") === "before";

  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
  var SND = { on: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>',
              off: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6M16 9l6 6"/></svg>' };
  var G = {
    sleep: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    zen: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    finger: '<path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v2"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
    box: '<rect x="4" y="4" width="16" height="16" rx="2"/>'
  };
  function glyph(k) { return '<svg class="bv-g" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + G[k] + '</svg>'; }
  function clock(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ":" + ("0" + s % 60).slice(-2); }
  function dur(s) { s = Math.floor(s); var m = Math.floor(s / 60), r = s % 60; return m ? m + " min" + (r ? " " + r + " s" : "") : r + " s"; }
  function calm(n) { return n + (n === 1 ? " calm minute" : " calm minutes"); }   /* 1 calm minute, 2 calm minutes */
  function ease(f) { return f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2; }

  /* ---------- geometry for the tracing exercises (viewBox 0 0 200 200) ---------- */
  var STAR = (function () {
    var cx = 100, cy = 106, R = 88, r = 36, tips = [], val = [], i;
    for (i = 0; i < 5; i++) {
      var a = (-90 + 72 * i) * Math.PI / 180, b = (-90 + 36 + 72 * i) * Math.PI / 180;
      tips.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]); val.push([cx + r * Math.cos(b), cy + r * Math.sin(b)]);
    }
    var segs = [], outline = "M" + val[4].join(" ");
    for (i = 0; i < 5; i++) {
      segs.push("M" + val[(i + 4) % 5].join(" ") + " L" + tips[i].join(" "));   /* up to the point */
      segs.push("M" + tips[i].join(" ") + " L" + val[i].join(" "));              /* down the other side */
      outline += " L" + tips[i].join(" ") + " L" + val[i].join(" ");
    }
    return { segs: segs, outline: outline + " Z" };
  })();
  var HAND = (function () {
    var F = [[36, 98], [72, 40], [102, 28], [132, 38], [162, 64]], w = 12, base = 182, V = [128, 100, 100, 112];
    var segs = [], out = "";
    F.forEach(function (f, i) {
      var x = f[0], ty = f[1], vl = i === 0 ? base : V[i - 1], vr = i === 4 ? base : V[i];
      var up = "M" + (x - w) + " " + vl + " L" + (x - w) + " " + ty + " A" + w + " " + w + " 0 0 1 " + x + " " + (ty - w);
      var dn = "M" + x + " " + (ty - w) + " A" + w + " " + w + " 0 0 1 " + (x + w) + " " + ty + " L" + (x + w) + " " + vr;
      if (i < 4) { var nx = F[i + 1][0] - w, g = (nx - (x + w)) / 2; dn += " A" + g + " " + g + " 0 0 0 " + nx + " " + vr; }
      segs.push(up, dn);
      out += (i === 0 ? up : up.replace(/^M[^L]+/, "")) + " " + dn.replace(/^M[^A]+/, "");
    });
    return { segs: segs, outline: out + " L" + (F[4][0] + w) + " " + (base + 4) + " Q100 200 " + (F[0][0] - w) + " " + (base + 4) + " Z", F: F,
      NAMES: ["thumb", "index finger", "middle finger", "ring finger", "little finger"] };
  })();
  var BOX = { segs: ["M30 170 L30 30", "M30 30 L170 30", "M170 30 L170 170", "M170 170 L30 170"], outline: "M30 170 L30 30 L170 30 L170 170 Z" };

  /* ---------- the five exercises: real timings ---------- */
  function ph(k, s, w, sub, x) { return Object.assign({ k: k, s: s, w: w, sub: sub }, x || {}); }
  var EX = {
    sleep: { sum: "4 in, 7 hold, 8 out", holds: true,
      steps: [["4 s", "Breathe in quietly through your nose"], ["7 s", "Hold your breath"], ["8 s", "Breathe out slowly through your mouth"]],
      line: "A long breath out tells your body it is safe to slow down. Lie back and let sleep come.",
      seq: function (o) { var k = o.short ? .5 : 1, c = [ph("in", 4 * k, "Breathe in", "Through your nose"), ph("hold", 7 * k, "Hold", "Keep still"), ph("out", 8 * k, "Breathe out", "Slowly, through your mouth")], s = [];
        for (var i = 0; i < 4; i++) s = s.concat(c.map(function (p) { return Object.assign({}, p, { round: i }); }));
        s.push(ph("rest", 15, "Breathe normally", "A short rest before the next round")); s[0].lap = true; return s; } },
    zen: { sum: "4 in, 6 out, with a calming word",
      steps: [["4 s", "Breathe in slowly through your nose"], ["6 s", "Breathe out through your mouth and say your word silently"], ["", "If your mind wanders, come back to the word"]],
      line: "Breathing six times a minute is the pace where your heart rhythm settles most easily.",
      seq: function () { return [ph("in", 4, "Breathe in", "Through your nose"), ph("out", 6, "Breathe out", "Say your word silently")]; } },
    star: { sum: "Up a side breathe in, pause at the point, down breathe out",
      steps: [["4 s", "Trace up to a point and breathe in"], ["2 s", "Pause at the point"], ["6 s", "Trace down the other side and breathe out"]],
      line: "Following a shape gives a busy mind one small job, so the breath can stay slow.",
      seq: function () { var s = []; for (var i = 0; i < 5; i++) { s.push(ph("in", 4, "Breathe in", "Trace up to the point", { seg: 2 * i })); s.push(ph("hold", 2, "Pause", "At the point", { at: 2 * i })); s.push(ph("out", 6, "Breathe out", "Trace down the other side", { seg: 2 * i + 1 })); } s[0].lap = true; return s; } },
    finger: { sum: "Up a finger breathe in, down breathe out",
      steps: [["", "Hold one hand open, fingers spread"], ["4 s", "Trace up a finger with your other hand and breathe in"], ["6 s", "Trace down and breathe out. Thumb to little finger, then back"]],
      line: "Your hand is always with you. Use it any time a moment feels tight.",
      seq: function () { var s = [], N = HAND.NAMES, i;
        for (i = 0; i < 5; i++) { s.push(ph("in", 4, "Breathe in", "Up your " + N[i], { seg: 2 * i, f: i })); s.push(ph("out", 6, "Breathe out", "Down your " + N[i], { seg: 2 * i + 1, f: i })); }
        for (i = 4; i >= 0; i--) { s.push(ph("in", 4, "Breathe in", "Up your " + N[i], { seg: 2 * i + 1, rev: true, f: i })); s.push(ph("out", 6, "Breathe out", "Down your " + N[i], { seg: 2 * i, rev: true, f: i })); }
        s[0].lap = true; s[10].lap = true; return s; } },
    box: { sum: "4 in, 4 hold, 4 out, 4 hold", holds: true,
      steps: [["4 s", "Breathe in as the guide climbs"], ["4 s", "Hold across the top"], ["4 s", "Breathe out as it comes down"], ["4 s", "Hold across the bottom"]],
      line: "Holding between breaths steadies your attention. Good before a meeting or a hard conversation.",
      seq: function (o) { var h = o.short ? 2 : 4, s = [ph("in", 4, "Breathe in", "Up the side", { seg: 0 }), ph("hold", h, "Hold", "Across the top", { seg: 1 }), ph("out", 4, "Breathe out", "Down the side", { seg: 2 }), ph("hold", h, "Hold", "Across the bottom", { seg: 3 })]; s[0].lap = true; return s; } }
  };
  function kOf(i) { return KEY[MD.P.br[i].n] || "zen"; }

  /* ---------- sound: soft sine cues, as the reflection app ---------- */
  var actx = null;
  function prime() { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); actx.resume(); } catch (e) {} }
  function tone(a, b, d, peak) {
    if (!actx) return;
    var n = actx.currentTime, o = actx.createOscillator(), g = actx.createGain(), f = actx.createBiquadFilter();
    o.type = "sine"; o.frequency.setValueAtTime(a, n); o.frequency.linearRampToValueAtTime(b, n + d);
    g.gain.setValueAtTime(.0001, n); g.gain.exponentialRampToValueAtTime(peak || .05, n + Math.min(.35, d * .3)); g.gain.exponentialRampToValueAtTime(.0001, n + d);
    f.type = "lowpass"; f.frequency.value = 1200; o.connect(f).connect(g).connect(actx.destination); o.start(n); o.stop(n + d + .05);
  }
  var CUE = { in: function (lo) { tone(lo ? 196 : 220, lo ? 262 : 330, 1.4); }, hold: function () { tone(300, 300, .7, .03); }, out: function (lo) { tone(lo ? 262 : 330, lo ? 165 : 196, 1.8); }, done: function () { tone(392, 523, 1.2, .04); } };
  function haptic(k) { var p = { in: [18], hold: [10, 60, 10], out: [40], done: [15, 80, 15, 80, 15], ready: [10] }[k]; try { if (p && navigator.vibrate) navigator.vibrate(p); } catch (e) {} }

  /* ---------- today's state for breathing ---------- */
  var B = { saved: {}, S: null, i: 0, sound: SETTLE, short: false, word: "Peace", feel: "", state: "", t: 0, wake: 0 };
  var ST0 = Q.get("bstate");
  if (ST0 === "part") B.saved[0] = 120;
  if (ST0 === "donerow") { B.saved[0] = MD.P.br[0].min * 60; MD.S.br[0] = true; }
  if (ST0 === "pausedrow") { B.S = mkS(130); B.state = "paused"; B.i = 0; }

  /* ---------- the row: the title stays, the line under it and the glyph's ring carry the state ---------- */
  function rowState(i) {
    var b = MD.P.br[i], tot = b.min * 60, sv = B.saved[i] || 0, k = kOf(i);
    var paused = B.S && B.i === i && B.S.el > 0 && B.state !== "done";
    if (MD.S.br[i]) return { d: b.min + " min done today", f: 1 };
    if (paused) return { d: "Paused at " + clock(B.S.el) + (sv ? ". " + Math.floor(sv / 60) + " of " + b.min + " min saved" : ". Tap to resume"), f: sv / tot };
    if (sv) return { d: Math.floor(sv / 60) + " of " + b.min + " min. " + Math.ceil((tot - sv) / 60) + " min to go", f: sv / tot };
    return { d: b.min + " min. " + EX[k].sum, f: 0 };
  }
  window.MDVAR = window.MDVAR || {};
  MDVAR.open = MDVAR.open || {};
  MDVAR.open.br = function (o) { var i = +o.split(":")[1] || 0; if (MD.S.br[i]) return true; openSheet(i, B.S && B.i === i && B.S.el > 0 ? "paused" : "ready"); return true; };
  /* the row's circle asks before it ticks; the row itself opens the player. A ticked circle unticks straight away */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-brask],[data-brmark]"); if (!t) return;
    e.preventDefault();
    if (t.dataset.brmark != null) { var j = +t.dataset.brmark; MD.S.br[j] = true; MD.cause = "br"; if (window.closeSheets) window.closeSheets(); MD.render(); MD.toast("Breathing marked as done."); return; }
    var i = +t.dataset.brask, b = MD.P.br[i];
    if (MD.S.br[i]) { MD.S.br[i] = false; MD.cause = ""; MD.render(); MD.toast("Breathing marked as not done."); return; }
    window.GFOpenSheet("bvAsk", "Mark as done?", '<p class="msub" style="margin:0 0 16px">' + b.n + ', ' + b.min + ' min. Mark it done if you have already breathed it on your own.</p>' +
      '<div style="display:flex;flex-direction:column;gap:12px"><button class="md-save" data-brmark="' + i + '">Mark as Done</button><button class="md-sec" data-mdone="1">Not Now</button></div>');
  });
  /* ?sheet=brask opens the circle's question for the first breathing row, for the case doc */
  if (MD.Q.get("sheet") === "brask") setTimeout(function () { var b = document.querySelector("[data-brask]"); if (b) b.click(); }, 1000);
  var prevItems = MDVAR.items;
  MDVAR.items = function (L, M) {
    L = prevItems ? prevItems(L, M) : L;
    if (BEFORE) return L;
    return L.map(function (x) {
      if (!x.sheet || x.sheet.indexOf("br:") !== 0) return x; var i = +x.sheet.split(":")[1];
      /* the full-screen player (f): the row is unticked or ticked, nothing in between; saved minutes stay in the background */
      if (VK === "f") return Object.assign({}, x, { t: MD.P.br[i].n, d: MD.P.br[i].min + " min" });   /* the duration only; the time sits at the right */
      return Object.assign({}, x, { t: MD.P.br[i].n, d: rowState(i).d });
    });
  };
  /* the leading tick becomes the exercise's own glyph, with a thin ring for saved minutes */
  function decorate() {
    if (BEFORE || VK === "f") return;   /* f keeps the screen's own tick: unticked, then ticked */
    [].forEach.call(document.querySelectorAll('[data-tiprow^="br:"]'), function (r) {
      var i = +r.getAttribute("data-tiprow").split(":")[1], st = rowState(i), mk = r.querySelector(".tmark");
      if (!mk || st.f >= 1) return;   /* done keeps the screen's own green tick */
      var ring = st.f > 0 && st.f < 1 ? '<svg class="bv-ring" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="none" stroke="#E0EAFF" stroke-width="2.5"/><circle cx="24" cy="24" r="22" fill="none" stroke="#444CE7" stroke-width="2.5" stroke-linecap="round" pathLength="100" stroke-dasharray="' + (st.f * 100).toFixed(1) + ' 100"/></svg>' : "";
      var span = document.createElement("span"); span.className = "bv-gi" + (st.f >= 1 ? " on" : ""); span.dataset.bv = String(st.f) + kOf(i);
      span.innerHTML = (st.f >= 1 ? CHECK : glyph(kOf(i))) + ring;
      mk.replaceWith(span);
    });
  }
  var dq = 0;
  new MutationObserver(function () { if (!dq) dq = requestAnimationFrame(function () { dq = 0; decorate(); }); }).observe(document.body, { childList: true, subtree: true });

  /* ---------- the sheet ---------- */
  var SID = "mdBreathV";
  function sheet() { return document.getElementById(SID); }
  function body() { var s = sheet(); return s && s.querySelector(".sbody"); }
  function openSheet(i, state) {
    B.i = i; var k = kOf(i);
    window.GFOpenSheet(SID, MD.P.br[i].n, "");
    var s = sheet(); s.classList.toggle("bv-night", LOOK === "room" && k === "sleep"); s.classList.remove("bv-dim", "bv-settle");
    show(state);
  }
  function show(state) {
    var b = body(); if (!b) return;
    B.state = state;
    var i = B.i, k = kOf(i), E = EX[k], P = MD.P.br[i], sv = B.saved[i] || 0, left = P.min * 60 - sv, h;
    var stepsHTML = '<ol class="bv-steps">' + E.steps.map(function (s) { return '<li><b>' + s[0] + '</b>' + s[1] + '</li>'; }).join("") + '</ol>';
    if (state === "ready") {
      h = '<div class="msub">' + (sv ? dur(sv) + " saved. " + dur(left) + " to go" : P.min + " min" + (P.at ? ", around " + MD.niceS(P.at) : "")) + '</div><div class="bv-pl"><div class="bv-vis sm"></div></div>';
      h += FIRST ? stepsHTML : '<p class="bv-sum">' + E.sum + '.</p><button class="bv-disc" data-bv="how" aria-expanded="false">How it works</button><div class="bv-howx" hidden>' + stepsHTML + '</div>';
      if (LOOK === "room" && k === "zen") h += '<div class="lab" style="margin:8px 0">Your word</div><div class="md-pills" style="margin-bottom:12px">' + ["Peace", "Relax", "Let go", "Shanti", "Sukoon"].map(function (w) { return '<button class="md-pill' + (w === B.word ? " on" : "") + '" data-bvword="' + w + '">' + w + '</button>'; }).join("") + '</div>';
      if (FIRST) h += '<div class="md-tip2">' + (E.holds ? "If you feel light-headed, stop and breathe normally. A shorter count works just as well." : k === "finger" ? "Use your own hand. The screen shows the rhythm; your finger does the tracing." : k === "star" ? (LOOK === "room" ? "Trace the star with your finger. The guide glows when you are with it." : "Follow the guide with your eyes, or trace it with a finger.") : "Sit comfortably and relax your shoulders. You can pause any time.") + '</div>';
      if (E.holds) h += '<div class="bv-opt"><span>Shorter count<small>' + (k === "sleep" ? "2, 3.5, 4. Same rhythm, easier holds" : "Holds of 2 instead of 4") + '</small></span><button class="bv-sw" role="switch" data-bv="short" aria-checked="' + B.short + '" aria-label="Shorter count"></button></div>';
      h += '<div class="bv-opt" style="margin-bottom:16px"><span>Sound<small>' + (SETTLE ? "Keeps time when the picture fades" : "Soft tones on each breath") + '</small></span><button class="bv-sw" role="switch" data-bv="sound" aria-checked="' + B.sound + '" aria-label="Sound"></button></div>';
      h += '<button class="md-save" data-bv="go">' + (sv ? "Breathe " + Math.ceil(left / 60) + " More Min" : "Start Breathing") + '</button>';
      b.innerHTML = h; mountVis(b.querySelector(".bv-vis"), true); return;
    }
    if (state === "run" || state === "paused") {
      var night = LOOK === "room" && k === "sleep";
      b.innerHTML = '<div class="bv-pl"><div class="bv-vis"></div><div class="bv-word" aria-live="polite"></div><div class="bv-hint"></div><div class="bv-cnt"></div>' +
        '<div class="bv-sess"' + (night ? ' style="visibility:hidden"' : "") + '><span class="bv-tl"></span><span class="bv-bar"><i></i></span></div></div>' +
        '<div class="bv-two"><button class="bv-ib" data-bv="snd" aria-pressed="' + B.sound + '" aria-label="Sound">' + (B.sound ? SND.on : SND.off) + '</button><button class="md-sec" data-bv="end">End</button>' +
        (state === "paused" ? '<button class="md-save" data-bv="resume">Resume</button>' : '<button class="md-save" data-bv="pause">Pause</button>') + '</div>';
      mountVis(b.querySelector(".bv-vis"), false); paint();
      if (state === "paused") { b.querySelector(".bv-word").textContent = "Paused"; b.querySelector(".bv-hint").textContent = dur(B.S.el) + " so far. Pick up where you left off."; b.querySelector(".bv-cnt").textContent = ""; }
      else loop();
      return;
    }
    if (state === "early") {
      var el = B.S.el, ok = el >= 60, m = Math.floor(el / 60), rest = P.min - Math.floor((sv + m * 60) / 60);
      b.innerHTML = '<div class="bv-pl"><div class="bv-vis sm"></div><div class="bv-big">You breathed for ' + dur(el) + '</div><div class="bv-line">' +
        (ok ? "Minutes add up through the day. Save " + m + " min now and finish the other " + rest + " later." : "A session needs a minute to save. Even one more minute makes a difference you can feel.") + '</div></div>' +
        '<div class="bv-two"><button class="md-sec" data-bv="resume">Keep Breathing</button>' + (ok ? '<button class="md-save" data-bv="savepart">Save ' + m + ' Min</button>' : '<button class="md-save" data-bv="drop">End Here</button>') + '</div>';
      mountVis(b.querySelector(".bv-vis"), true); return;
    }
    if (state === "done") {
      var nt = LOOK === "room" && k === "sleep";
      b.innerHTML = '<div class="bv-pl bv-done"><div class="bv-vis sm"><div class="bv-orbw"><div class="bv-orb" style="transform:scale(.8)"></div></div></div><div class="bv-big">' + calm(P.min) + ', done</div><div class="bv-line">' + E.line + '</div></div>' +
        (nt ? "" : '<div class="lab" style="margin:0 0 8px">How do you feel now? Optional</div><div class="md-pills" style="margin-bottom:16px">' + ["Calmer", "About the same", "Not sure"].map(function (x) { return '<button class="md-pill' + (B.feel === x ? " on" : "") + '" data-bvfeel="' + x + '">' + x + '</button>'; }).join("") + '</div>') +
        '<button class="md-save" data-bv="close">' + (nt ? "Sleep Well" : "Back to Mind") + '</button>';
    }
  }

  /* ---------- visuals ---------- */
  var VIS = null;
  function mountVis(box, still) {
    var k = kOf(B.i), path = LOOK !== "orb" && (k === "star" || k === "finger" || k === "box");
    VIS = { box: box, kind: path ? "path" : "orb" };
    if (!path) {
      var zen = k === "zen", night = LOOK === "room" && k === "sleep";
      box.innerHTML = '<div class="bv-orbw"><div class="bv-orb' + (zen && LOOK !== "orb" ? " zen" : "") + '"></div>' +
        '<svg viewBox="0 0 228 228" aria-hidden="true"><circle cx="114" cy="114" r="108" fill="none" stroke="' + (night ? "#344054" : "#F2F4F7") + '" stroke-width="4"/><circle class="bv-hr" cx="114" cy="114" r="108" fill="none" stroke="#CDA935" stroke-width="4" stroke-linecap="round" stroke-dasharray="0 999" pathLength="100"/></svg>' +
        (zen && LOOK === "own" ? '<span class="bv-ow">' + B.word + '</span>' : "") + (zen && LOOK === "room" ? '<span class="bv-zenw">' + B.word + '</span>' : "") + '</div>';
      VIS.orb = box.querySelector(".bv-orb"); VIS.hr = box.querySelector(".bv-hr"); VIS.ow = box.querySelector(".bv-ow,.bv-zenw");
      if (still) VIS.orb.style.transform = "scale(.72)";
      return;
    }
    var geo = k === "star" ? STAR : k === "finger" ? HAND : BOX, room = LOOK === "room";
    var s = '<svg class="bv-p" viewBox="-6 -6 212 212" aria-hidden="true"><path d="' + geo.outline + '" fill="' + (k === "finger" ? "#F5F8FF" : "none") + '" stroke="#E4E7EC" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>';
    if (k === "finger" && room) s += '<g class="bv-fl">' + HAND.F.map(function (f, i) { return '<rect x="' + (f[0] - 12) + '" y="' + (f[1] - 12) + '" width="24" height="' + (180 - f[1]) + '" rx="12" fill="transparent" data-f="' + i + '"/>'; }).join("") + '</g>';
    s += '<g class="bv-lap"></g><path class="bv-trail" fill="none" stroke="#6172F3" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" d=""/>';
    s += geo.segs.map(function (d) { return '<path class="bv-seg" d="' + d + '" fill="none" stroke="none"/>'; }).join("");
    if (k === "box" && room) s += '<text class="bv-bn" x="100" y="116" text-anchor="middle" font-family="Roboto" font-weight="700" font-size="44" fill="#3538CD"></text>';
    s += '<circle class="bv-halo" r="16" fill="#E0EAFF"/><circle class="bv-hold" r="15" fill="none" stroke="#CDA935" stroke-width="3" stroke-dasharray="0 999" pathLength="100"/><circle class="bv-dot" r="8" fill="#444CE7"/></svg>';
    box.innerHTML = s;
    var sv = box.querySelector("svg");
    VIS.svg = sv; VIS.segs = [].slice.call(sv.querySelectorAll(".bv-seg")); VIS.trail = sv.querySelector(".bv-trail"); VIS.lap = sv.querySelector(".bv-lap");
    VIS.dot = sv.querySelector(".bv-dot"); VIS.halo = sv.querySelector(".bv-halo"); VIS.hold = sv.querySelector(".bv-hold"); VIS.bn = sv.querySelector(".bv-bn"); VIS.fl = sv.querySelectorAll(".bv-fl rect");
    VIS.lastI = -1;
    if (k === "finger" && room) { VIS.dot.style.display = "none"; VIS.halo.style.display = "none"; }
    var p0 = VIS.segs[0].getPointAtLength(0); place(p0.x, p0.y);
    if (k === "star" && room && !still) {
      sv.style.touchAction = "none";
      sv.addEventListener("pointermove", function (e) {
        var pt = sv.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; var q = pt.matrixTransform(sv.getScreenCTM().inverse());
        VIS.with = Math.hypot(q.x - VIS.px, q.y - VIS.py) < 22; VIS.withT = performance.now();
      });
    }
  }
  function place(x, y) {
    VIS.px = x; VIS.py = y;
    [VIS.dot, VIS.halo, VIS.hold].forEach(function (c) { c.setAttribute("cx", x); c.setAttribute("cy", y); });
    VIS.hold.setAttribute("transform", "rotate(-90 " + x + " " + y + ")");
  }
  function paint() {
    var S = B.S, v = VIS, b = body(); if (!S || !v || !b || !b.querySelector(".bv-word")) return;
    var P = S.seq[S.si], f = Math.min(1, S.t / P.s), k = kOf(B.i), fq = RM ? Math.floor(S.t) / P.s : f;
    var word = b.querySelector(".bv-word"), hint = b.querySelector(".bv-hint"), cnt = b.querySelector(".bv-cnt");
    if (S.cd > 0) { word.textContent = Math.ceil(S.cd) + ""; hint.textContent = FIRST ? "Get comfortable. Shoulders down." : "Get ready"; cnt.textContent = ""; }
    else {
      word.textContent = S.fin && P.k === "out" ? "Last breath out" : P.w;
      var showHint = FIRST || LOOK === "orb" || k === "finger" || k === "star";
      hint.textContent = showHint ? P.sub : "";
      if (k === "zen" && P.k === "out" && LOOK !== "orb") hint.textContent = FIRST ? "Say “" + B.word + "” silently" : "";
      if (k === "sleep" && P.k !== "rest" && !(LOOK === "room")) hint.textContent = (FIRST ? P.sub + ". " : "") + (LOOK === "orb" ? "Round " + (P.round + 1) + ", breath " : "Breath ") + (S.bi % 4 + 1) + " of 4";
      var showCount = LOOK === "orb" ? P.k !== "rest" : P.k === "hold" && !(LOOK === "room" && k === "sleep");
      cnt.textContent = showCount ? Math.max(1, Math.ceil(P.s - S.t)) + "" : "";
    }
    var tl = b.querySelector(".bv-tl"), bar = b.querySelector(".bv-bar i");
    if (tl) tl.textContent = S.el >= S.total ? "Finishing" : clock(S.total - S.el) + " left";
    if (bar) bar.style.width = Math.min(100, S.el / S.total * 100) + "%";
    if (v.kind === "orb") {
      var prev = S.seq[(S.si - 1 + S.seq.length) % S.seq.length], sc;
      if (S.cd > 0) sc = .56; else if (P.k === "in") sc = .56 + .44 * ease(fq); else if (P.k === "out") sc = 1 - .44 * ease(fq); else if (P.k === "hold") sc = prev.k === "in" ? 1 : .56; else sc = .64;
      if (RM) { v.orb.style.transform = "scale(.8)"; v.orb.style.opacity = (.45 + .55 * (sc - .56) / .44).toFixed(3); } else { v.orb.style.transform = "scale(" + sc.toFixed(4) + ")"; v.orb.style.opacity = 1; }
      v.hr.setAttribute("stroke-dasharray", (P.k === "hold" && S.cd <= 0 ? (fq * 100).toFixed(2) : 0) + " 999");
      if (v.ow) v.ow.classList.toggle("on", P.k === "out" && S.cd <= 0);
      return;
    }
    if (S.cd > 0) return;
    var seg = v.segs[P.seg != null ? P.seg : P.at], L = seg.getTotalLength();
    if (P.seg != null) {
      if (v.lastI !== S.si) {   /* the side just walked stays drawn, faintly, until the lap ends */
        if (v.trail.getAttribute("d")) { var c = v.trail.cloneNode(); c.setAttribute("stroke", "#C7D7FE"); c.removeAttribute("stroke-dasharray"); c.removeAttribute("class"); v.lap.appendChild(c); }
        if (P.lap) v.lap.innerHTML = "";
        v.lastI = S.si; v.trail.setAttribute("d", seg.getAttribute("d"));
      }
      var pt = seg.getPointAtLength(P.rev ? (1 - fq) * L : fq * L);
      v.trail.setAttribute("stroke-dasharray", P.rev ? "0 " + ((1 - fq) * L).toFixed(2) + " " + (fq * L).toFixed(2) + " " + L : (fq * L).toFixed(2) + " " + L);
      v.trail.setAttribute("stroke", P.k === "hold" ? "#CDA935" : "#6172F3");
      place(pt.x, pt.y); v.hold.setAttribute("stroke-dasharray", "0 999");
    } else {   /* a pause at the point: the guide waits and a ring closes around it */
      var e = seg.getPointAtLength(L); place(e.x, e.y); v.hold.setAttribute("stroke-dasharray", (fq * 100).toFixed(2) + " 999");
    }
    v.dot.style.display = RM || (LOOK === "room" && k === "finger") ? "none" : "";
    v.halo.setAttribute("r", RM ? 0 : P.k === "in" ? 12 + 6 * fq : P.k === "out" ? 18 - 6 * fq : 18);
    [].forEach.call(v.fl || [], function (r) { r.setAttribute("fill", +r.dataset.f === P.f ? (P.k === "in" ? "#E0EAFF" : "#C7D7FE") : "transparent"); });
    if (v.bn) v.bn.textContent = Math.min(4, Math.floor(S.t / (P.s / 4)) + 1);
    if (k === "star" && LOOK === "room") { var w = v.with && performance.now() - v.withT < 400; v.halo.setAttribute("fill", w ? "#CBF0E0" : "#E0EAFF"); if (w) hint.textContent = "You are right with it"; hint.classList.toggle("bv-with", !!w); }
  }

  /* ---------- the engine: a timer, so time stays true even when frames are throttled ---------- */
  /* a session already 'el' seconds in, for the doc's paused and ended-early states */
  function mkS(el) {
    var S = { seq: EX[kOf(0)].seq({ short: false }), si: 0, t: 0, el: el, total: MD.P.br[0].min * 60, cd: 0, bi: 0, fin: false }, acc = el;
    while (acc >= S.seq[S.si].s) { acc -= S.seq[S.si].s; if (S.seq[S.si].k === "out") S.bi++; S.si = (S.si + 1) % S.seq.length; }
    S.t = acc; return S;
  }
  function start() {
    var i = B.i, k = kOf(i), left = MD.P.br[i].min * 60 - (B.saved[i] || 0);
    prime();
    B.S = { seq: EX[k].seq({ short: B.short }), si: 0, t: 0, el: 0, total: Math.max(60, left), cd: 3, bi: 0, fin: false };
    haptic("ready"); show("run");
  }
  function loop() {
    clearInterval(B.t); var last = performance.now();
    B.t = setInterval(function () {
      var S = B.S, sh = sheet();
      if (!S || B.state !== "run") return clearInterval(B.t);
      if (!sh || !sh.classList.contains("on")) { clearInterval(B.t); B.state = "paused"; MD.render(); return; }   /* the sheet went away: pause where it was */
      var now = performance.now(), dt = Math.min(1, (now - last) / 1000) * SPEED; last = now;
      if (S.cd > 0) { S.cd -= dt; if (S.cd <= 0) enter(S.seq[0]); paint(); return; }
      S.t += dt; S.el += dt;
      if (S.el >= S.total) S.fin = true;
      while (S.t >= S.seq[S.si].s) {
        S.t -= S.seq[S.si].s;
        var P = S.seq[S.si];
        if (S.fin && (P.k === "out" || P.k === "rest")) return complete();   /* time is up: end after a breath out */
        if (P.k === "out") S.bi++;
        S.si = (S.si + 1) % S.seq.length; enter(S.seq[S.si]);
      }
      paint();
      if (SETTLE) settle();
    }, 40);
  }
  function enter(P) {
    var night = LOOK === "room" && kOf(B.i) === "sleep";
    if (B.sound && CUE[P.k]) CUE[P.k](night);
    haptic(P.k);
    if (night && P.k === "in" && P.round === 2) sheet().classList.add("bv-dim");   /* C, Sleep: the sheet dims itself after two rounds */
  }
  function settle() {
    var on = B.S.el > (FIRST ? 60 : 30) && performance.now() > B.wake, s = sheet(); s.classList.toggle("bv-settle", on);
    var h = body().querySelector(".bv-hint");
    if (on && h) h.textContent = B.sound ? "Eyes closed is fine. The sound and buzz keep time. Tap to see the guide." : "Eyes closed is fine. The buzz keeps time. Tap to see the guide.";
  }
  function complete() {
    clearInterval(B.t);
    var i = B.i; B.saved[i] = MD.P.br[i].min * 60; MD.S.br[i] = true; MD.cause = "br";   /* saved the moment it ends; closing with X keeps it */
    B.S = null; sheet().classList.remove("bv-dim", "bv-settle");
    if (B.sound) CUE.done(); haptic("done");
    show("done"); MD.render();
  }

  /* ---------- taps ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-bv],[data-bvword],[data-bvfeel],.bv-vis"); if (!t || !sheet() || !sheet().contains(t)) return;
    var a = t.dataset.bv;
    if (t.dataset.bvword) { B.word = t.dataset.bvword; return show("ready"); }
    if (t.dataset.bvfeel) { B.feel = B.feel === t.dataset.bvfeel ? "" : t.dataset.bvfeel; return show("done"); }
    if (t.classList.contains("bv-vis")) { if (SETTLE && B.state === "run") { B.wake = performance.now() + 10000; sheet().classList.remove("bv-settle"); } return; }
    if (a === "how") { var x = body().querySelector(".bv-howx"); x.hidden = !x.hidden; t.setAttribute("aria-expanded", !x.hidden); return; }
    if (a === "short") { B.short = !B.short; t.setAttribute("aria-checked", B.short); return; }
    if (a === "sound") { B.sound = !B.sound; t.setAttribute("aria-checked", B.sound); if (B.sound) { prime(); CUE.hold(); } return; }
    if (a === "snd") { B.sound = !B.sound; if (B.sound) prime(); t.setAttribute("aria-pressed", B.sound); t.innerHTML = B.sound ? SND.on : SND.off; return; }
    if (a === "go") return start();
    if (a === "pause") { clearInterval(B.t); sheet().classList.remove("bv-settle"); return show("paused"); }
    if (a === "resume") return show("run");
    if (a === "end") { clearInterval(B.t); sheet().classList.remove("bv-settle"); return show("early"); }
    if (a === "savepart") { var m = Math.floor(B.S.el / 60) * 60, i = B.i; B.saved[i] = Math.min(MD.P.br[i].min * 60, (B.saved[i] || 0) + m); B.S = null; window.closeSheets(); MD.render(); MD.toast("Saved " + m / 60 + " min. Finish the rest any time today."); return; }
    if (a === "drop") { B.S = null; window.closeSheets(); MD.render(); return; }
    if (a === "close") { window.closeSheets(); B.state = ""; MD.render(); MD.toast(MD.P.br[B.i].n + " done. " + calm(MD.P.br[B.i].min) + "."); return; }
  });
  /* the X and the backdrop close through the screen's own closeSheets: a running session pauses (the loop sees it),
     and a finished one has already counted */

  /* ---------- styles: the sheet and the row, on the screen's tokens ---------- */
  var css = document.createElement("style");
  css.textContent = [
    ".bv-gi{position:relative;width:32px;height:32px;border-radius:10px;display:grid;place-items:center;background:var(--in-25,#F5F8FF);color:var(--in-600,#444CE7);border:1px solid var(--in-100,#E0EAFF)}",
    ".bv-gi .bv-g{width:18px;height:18px}.bv-gi.on{background:var(--brand-600,#299D6B);border-color:var(--brand-600,#299D6B);border-radius:50%;width:26px;height:26px}.bv-gi.on svg{width:13px;height:13px}",
    ".bv-ring{position:absolute;inset:-5px;width:42px;height:42px;transform:rotate(-90deg)}",
    "#" + SID + " .sbody{display:flex;flex-direction:column}",
    ".bv-pl{display:flex;flex-direction:column;align-items:center;text-align:center}",
    ".bv-vis{position:relative;width:248px;height:248px;display:grid;place-items:center;transition:opacity 1.2s cubic-bezier(.4,0,.2,1)}.bv-vis.sm{width:160px;height:160px}",
    ".bv-p{width:100%;height:100%;overflow:visible}",
    ".bv-orbw{position:absolute;inset:0;display:grid;place-items:center}",
    ".bv-orbw svg{position:absolute;width:92%;height:92%;transform:rotate(-90deg)}",
    ".bv-orb{width:80%;height:80%;border-radius:50%;background:radial-gradient(circle at 38% 32%,#C7D7FE,#6172F3 70%,#444CE7);transform:scale(.56)}",
    ".bv-orb.zen{background:radial-gradient(circle at 38% 32%,#CBF0E0,#299D6B 75%,#2A805A)}",
    ".bv-done .bv-orb{background:radial-gradient(circle at 38% 32%,#CBF0E0,#299D6B 80%)}",
    ".bv-ow{position:absolute;font:600 18px Roboto,sans-serif;color:#fff;opacity:0;transition:opacity 1.2s}.bv-ow.on{opacity:1}",
    ".bv-zenw{position:absolute;font:300 34px/40px Roboto,sans-serif;color:#1D4D38;opacity:0;transition:opacity 1.5s}.bv-zenw.on{opacity:1}",
    ".bv-word{margin-top:12px;font:600 22px/28px Roboto,sans-serif;color:var(--g-900,#101828);min-height:28px}",
    ".bv-hint{margin-top:4px;font-size:14px;line-height:20px;color:var(--g-600,#475467);min-height:20px}.bv-hint.bv-with{color:#2A805A}",
    ".bv-cnt{font:700 15px/20px Roboto,sans-serif;color:#A68A2D;font-variant-numeric:tabular-nums;min-height:20px;margin-top:2px}",
    ".bv-sess{width:100%;margin:14px 0 6px;display:flex;align-items:center;gap:10px;font:500 12px Roboto,sans-serif;color:var(--g-500,#667085);font-variant-numeric:tabular-nums}",
    ".bv-bar{flex:1;height:4px;border-radius:999px;background:var(--g-100,#F2F4F7);overflow:hidden}.bv-bar i{display:block;height:100%;width:0;background:#6172F3;border-radius:999px}",
    ".bv-two{display:flex;gap:10px;margin-top:8px}.bv-two>*{flex:1}",
    ".bv-ib{flex:0 0 48px!important;height:48px;border-radius:6px;border:1px solid var(--g-200,#E4E7EC);background:#fff;color:var(--g-700,#344054);display:grid;place-items:center;cursor:pointer}.bv-ib svg{width:20px;height:20px}.bv-ib[aria-pressed=true]{color:#3538CD;border-color:#C7D7FE;background:#F5F8FF}",
    ".bv-steps{margin:12px 0 10px;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px}.bv-steps li{display:flex;gap:12px;align-items:baseline;font-size:14px;color:var(--g-800,#1D2939)}.bv-steps b{min-width:34px;color:#3538CD;font-variant-numeric:tabular-nums}",
    ".bv-sum{margin:12px 0 4px;color:var(--g-800,#1D2939);font-size:14px}",
    ".bv-disc{align-self:flex-start;border:0;background:none;padding:0;font:600 13px/32px Roboto,sans-serif;color:#2A805A;cursor:pointer}",
    ".bv-opt{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:48px;border-top:1px solid var(--g-100,#F2F4F7);font-size:14px;color:var(--g-800,#1D2939)}.bv-opt small{display:block;font-size:12px;color:var(--g-500,#667085)}",
    ".bv-sw{position:relative;width:44px;height:26px;border-radius:999px;border:0;background:var(--g-200,#E4E7EC);cursor:pointer;flex:0 0 auto;transition:background .2s}",
    ".bv-sw::after{content:'';position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(16,24,40,.2);transition:transform .2s cubic-bezier(.4,0,.2,1)}",
    ".bv-sw[aria-checked=true]{background:#299D6B}.bv-sw[aria-checked=true]::after{transform:translateX(18px)}",
    ".bv-big{font:700 22px/28px Roboto,sans-serif;color:var(--g-900,#101828);margin-top:8px}",
    ".bv-line{font-size:14px;line-height:21px;color:var(--g-600,#475467);margin:6px 0 16px;max-width:320px}",
    "#" + SID + ".bv-night{background:#101828;color:#F2F4F7;transition:background-color .6s,transform .3s ease-out}",
    "#" + SID + ".bv-night .bv-word,#" + SID + ".bv-night .bv-big{color:#F2F4F7}",
    "#" + SID + ".bv-night .bv-hint,#" + SID + ".bv-night .bv-sess,#" + SID + ".bv-night .msub,#" + SID + ".bv-night .bv-line,#" + SID + ".bv-night .bv-sum{color:#98A2B3}",
    "#" + SID + ".bv-night .bv-orb{background:radial-gradient(circle at 38% 32%,#3E4784,#2D31A6 70%,#1F235B)}",
    "#" + SID + ".bv-night .md-sec,#" + SID + ".bv-night .bv-ib{background:transparent;border-color:#344054;color:#D0D5DD;box-shadow:none}",
    "#" + SID + ".bv-night .md-save{background:#2D31A6;box-shadow:none}",
    "#" + SID + ".bv-night .bv-steps li,#" + SID + ".bv-night .bv-opt{color:#D0D5DD;border-color:#1D2939}#" + SID + ".bv-night .bv-steps b{color:#A4BCFD}",
    "#" + SID + ".bv-night .md-tip2{background:#1D2939;border-color:#344054;color:#D0D5DD}",
    "#" + SID + ".bv-dim .bv-vis{opacity:.35}#" + SID + ".bv-dim .bv-two,#" + SID + ".bv-dim .bv-sess{opacity:.3;transition:opacity 1.2s}",
    "#" + SID + ".bv-settle .bv-vis{opacity:.22}#" + SID + ".bv-settle .bv-word{opacity:.5}",
    "@media (prefers-reduced-motion: reduce){.bv-vis,.bv-ow,.bv-zenw,.bv-sw::after{transition-duration:.01s!important}}"
  ].join("");
  document.head.appendChild(css);

  /* =====================================================================================================
     ?vbreath=f&blook=1|3: the full-screen player in two looks, for research/breathing-look.html.
       1 Line    a thin route for the exercise; the pearl walks it and leaves a fading trail
       3 Glass   a frosted pane in the route's shape, its light rising and falling with the breath; the pearl walks its edge
       Sleep 4-7-8 and Zen Flow trace nothing, so in both looks they are the orb alone, growing and shrinking with the breath.
     Tapping a breathing row opens it over the whole screen on its ready state: close X top left, the time top right (tap it
     to change the length before Start; locked once a session has begun, paused included), the animation and phase word in the centre, Start, then Pause or Resume and End.
     The pearl is the Rhythm score's own orb (r3/heroes/cloud/orb.svg in Mind's teal, as HERO_ORB recolours it).
     ?bauto=1 starts on open.
     ===================================================================================================== */
  if (VK === "f") (function () {
    var LK = { 1: 1, 3: 3 }[+Q.get("blook")] || 1, AUTO = Q.get("bauto") === "1";
    var T8 = "#2DA6A6", T3 = "#A4FDFD", T1 = "#E0FFFF", T25 = "#F5FFFF", INK = "#164A4A";
    var XG = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 32 32"><path fill="#98A2B3" d="M16 3a13 13 0 1 0 13 13A13.013 13.013 0 0 0 16 3m4.708 16.293a1 1 0 0 1-1.415 1.415L16 17.414l-3.293 3.293a1 1 0 0 1-1.415-1.415L14.587 16l-3.293-3.293a1 1 0 1 1 1.415-1.415L16 14.587l3.293-3.293a1 1 0 0 1 1.415 1.415L17.414 16z"/></svg>';
    var pid = 0;
    function pearl(sz) {
      var u = "bp" + (pid++);
      return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 14 14" fill="none" aria-hidden="true"><g filter="url(#' + u + 'a)"><g clip-path="url(#' + u + 'b)"><rect width="14" height="14" fill="#1F7A7A" rx="7"/>' +
        '<g filter="url(#' + u + 'c)"><ellipse cx="6.316" cy="4.792" fill="#5CC9C9" rx="7.683" ry="7.542"/></g><g filter="url(#' + u + 'd)" opacity=".5"><ellipse cx="5.292" cy="3.75" fill="#A4EDED" rx="4.695" ry="4.583"/></g>' +
        '<g filter="url(#' + u + 'e)" opacity=".6"><ellipse cx="1.989" cy="1.19" fill="#2DA6A6" rx="1.989" ry="1.19" transform="matrix(.982 -.18891 .19626 .98055 6.402 12.002)"/></g></g></g><defs>' +
        '<filter id="' + u + 'a" width="14" height="14" x="0" y="0" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BG"/><feBlend in="SourceGraphic" in2="BG" result="shape"/><feColorMatrix in="SourceAlpha" result="ha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feMorphology in="SourceAlpha" radius=".406" result="m"/><feOffset/><feGaussianBlur stdDeviation="1.625"/><feComposite in2="ha" k2="-1" k3="1" operator="arithmetic"/><feColorMatrix values="0 0 0 0 0.36 0 0 0 0 0.79 0 0 0 0 0.79 0 0 0 1 0"/><feBlend in2="shape"/></filter>' +
        '<filter id="' + u + 'c" width="25.525" height="25.242" x="-6.446" y="-7.829" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="2.54"/></filter>' +
        '<filter id="' + u + 'd" width="19.549" height="19.326" x="-4.483" y="-5.913" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="2.54"/></filter>' +
        '<filter id="' + u + 'e" width="8.81" height="7.329" x="4.183" y="9.128" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="1.219"/></filter>' +
        '<clipPath id="' + u + 'b"><rect width="14" height="14" fill="#fff" rx="7"/></clipPath></defs></svg>';
    }

    /* ---------- the traced routes, drawn in a 0..100 box and centred with room around them ----------
       Box, Star and 5 Finger are traced, so they keep a shape. Sleep 4-7-8 and Zen Flow trace nothing: they are the orb alone.
       segs are the pieces a phase walks; seg(P) says which piece a phase uses, reversed or held at its end */
    var R = 22, c = R * Math.SQRT1_2, A = function (x, y) { return " A" + R + " " + R + " 0 0 1 " + x + " " + y; };
    var BL = [R - c, 100 - R + c], TL = [R - c, R - c], TR = [100 - R + c, R - c], BR = [100 - R + c, 100 - R + c];
    var BOXS = ["M" + BL.join(" ") + A(0, 100 - R) + " L0 " + R + A(TL[0], TL[1]),
                "M" + TL.join(" ") + A(R, 0) + " L" + (100 - R) + " 0" + A(TR[0], TR[1]),
                "M" + TR.join(" ") + A(100, R) + " L100 " + (100 - R) + A(BR[0], BR[1]),
                "M" + BR.join(" ") + A(100 - R, 100) + " L" + R + " 100" + A(BL[0], BL[1])];
    /* a true five-point star: inner radius 0.382 of the outer (the pentagram's own ratio), points even, centred on its
       bounding box, and every point and valley softly rounded. Each piece runs from the middle of one rounded corner to the next */
    var STR = (function () {
      var Ro = 50, ri = Ro * 0.381966, cy = 50 + Ro * (1 - Math.cos(Math.PI / 5)) / 2, V = [], i;
      for (i = 0; i < 5; i++) {
        var a = (-90 + 72 * i) * Math.PI / 180, b = (-90 - 36 + 72 * i) * Math.PI / 180;
        V.push({ p: [50 + ri * Math.cos(b), cy + ri * Math.sin(b)], d: 3.2 }); V.push({ p: [50 + Ro * Math.cos(a), cy + Ro * Math.sin(a)], d: 5.5 });
      }
      var n = V.length, f = function (p) { return p[0].toFixed(2) + " " + p[1].toFixed(2); };
      var toward = function (from, to, d) { var dx = to[0] - from[0], dy = to[1] - from[1], l = Math.hypot(dx, dy); return [from[0] + dx / l * d, from[1] + dy / l * d]; };
      var C = V.map(function (v, j) {   /* each corner as a quadratic from its in-point through the vertex to its out-point, split at its middle */
        var pin = toward(v.p, V[(j - 1 + n) % n].p, v.d), pout = toward(v.p, V[(j + 1) % n].p, v.d), m = [.25 * pin[0] + .5 * v.p[0] + .25 * pout[0], .25 * pin[1] + .5 * v.p[1] + .25 * pout[1]];
        return { pin: pin, pout: pout, m: m, c1: [(pin[0] + v.p[0]) / 2, (pin[1] + v.p[1]) / 2], c2: [(pout[0] + v.p[0]) / 2, (pout[1] + v.p[1]) / 2] };
      });
      var segs = [];
      for (i = 0; i < n; i++) { var A0 = C[i], B0 = C[(i + 1) % n]; segs.push("M" + f(A0.m) + " Q" + f(A0.c2) + " " + f(A0.pout) + " L" + f(B0.pin) + " Q" + f(B0.c1) + " " + f(B0.m)); }
      return { segs: segs, outline: segs[0] + " " + segs.slice(1).map(function (d) { return d.replace(/^M[\d. ]+/, ""); }).join(" ") + " Z" };
    })();
    /* a hand: four capsule fingers with tight valleys, the middle longest, the little finger shorter and lower,
       and a thumb angled out from the palm. Traced up the outside of each finger and down the inside, wrist to wrist */
    var HND = (function () {
      var segs = [
        "M32 100 C 31 93, 28.2 81.5, 26.2 78 L10.3 50.5 A6 6 0 0 1 12.5 42.3",        /* up the thumb */
        "M12.5 42.3 A6 6 0 0 1 20.7 44.5 L27.6 56.5 Q31 62.3 31 56",                   /* down the thumb, into a soft valley */
        "M31 56 L31 19 A5 5 0 0 1 36 14",                                                 /* up the index */
        "M36 14 A5 5 0 0 1 41 19 L41 46 A1.5 1.5 0 0 0 44 46",
        "M44 46 L44 11 A5 5 0 0 1 49 6",                                                  /* middle */
        "M49 6 A5 5 0 0 1 54 11 L54 46 A1.5 1.5 0 0 0 57 46",
        "M57 46 L57 16 A5 5 0 0 1 62 11",                                                 /* ring */
        "M62 11 A5 5 0 0 1 67 16 L67 50 A1.45 1.45 0 0 0 69.9 50",
        "M69.9 50 L69.9 30.6 A4.6 4.6 0 0 1 74.5 26",                                     /* little */
        "M74.5 26 A4.6 4.6 0 0 1 79.1 30.6 L79.1 60 C 79.1 75, 77.3 88, 74 100"
      ];
      /* open at the wrist, so the outline has no corners there */
      return { segs: segs, outline: segs[0] + " " + segs.slice(1).map(function (d) { return d.replace(/^M[\d. ]+/, ""); }).join(" ") };
    })();
    var ROUTES = {
      box: { tf: "", dx: 0, segs: BOXS, outline: BOXS[0] + BOXS.slice(1).map(function (d) { return d.replace(/^M[\d. ]+/, " "); }).join("") + " Z", seg: function (P) { return { i: P.seg }; } },
      star: { tf: "", dx: 0, segs: STR.segs, outline: STR.outline, seg: function (P) { return P.seg != null ? { i: P.seg } : { i: P.at, at: true }; } },
      finger: { tf: "translate(5.5 -3)", dx: 5.5, dy: -3, segs: HND.segs, outline: HND.outline, seg: function (P) { return { i: P.seg, rev: !!P.rev }; } },
      sleep: null, zen: null
    };

    /* ---------- the overlay ---------- */
    var el = document.createElement("div");
    el.id = "bvFull"; el.className = "bf l" + LK; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", "Breathing");
    el.innerHTML = '<div class="bf-bg"></div><div class="bf-stage"></div>' +
      '<div class="bf-top"><button class="bf-x" data-bf="close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button><div class="bf-ti"></div>' +
      '<span class="bf-tw"></span></div>' +
      '<div class="bf-txt"><div class="bf-word" aria-live="polite"></div><div class="bf-cnt"></div></div><div class="bf-bot"></div>' +
      '<div class="bf-scrim" data-bf="lenx"></div><div class="bf-sheet" role="dialog" aria-modal="true" aria-labelledby="bfLenT"></div>' +
      '<svg class="bf-hid" aria-hidden="true"><g class="bf-hg"></g></svg>';
    document.body.appendChild(el);
    var stage = el.querySelector(".bf-stage"), hg = el.querySelector(".bf-hg");
    var word = el.querySelector(".bf-word"), cnt = el.querySelector(".bf-cnt"), bot = el.querySelector(".bf-bot"), lsheet = el.querySelector(".bf-sheet");
    var RT = null, HP = [];
    function useRoute(k) {
      RT = ROUTES[k]; el.classList.toggle("free", !RT);
      hg.innerHTML = RT ? RT.segs.map(function (d) { return '<path d="' + d + '"/>'; }).join("") : ""; HP = [].slice.call(hg.querySelectorAll("path"));
    }
    function pt(i, fr) { var p = HP[i], L = p.getTotalLength(), q = p.getPointAtLength(Math.max(0, Math.min(1, fr)) * L); return [RT.dx + q.x, (RT.dy || 0) + q.y]; }
    function posOf(P, f) { var s = RT.seg(P); return s.at ? pt(s.i, 1) : pt(s.i, s.rev ? 1 - f : f); }
    var V0 = -22, VS = 144, VB = 'viewBox="' + V0 + " " + V0 + " " + VS + " " + VS + '"';   /* generous room around every shape */
    function place(node, p) { node.style.left = ((p[0] - V0) / VS * 100) + "%"; node.style.top = ((p[1] - V0) / VS * 100) + "%"; }
    /* how full the breath is: rises on the breath in, holds, falls on the breath out */
    function level(S, P, f) { if (!S) return 0; var prev = S.seq[(S.si - 1 + S.seq.length) % S.seq.length]; return P.k === "in" ? f : P.k === "out" ? 1 - f : P.k === "hold" ? (prev.k === "in" ? 1 : 0) : .35; }

    /* ---------- no route: the orb alone. It grows on the breath in, rests on the hold, shrinks on the breath out,
       with a faint soft light behind it (Line keeps it bare, Glass gives it a frosted lens) ---------- */
    var ORB = {
      build: function (glass) {
        stage.innerHTML = '<div class="bf-orb' + (glass ? " glass" : "") + '"><i class="bf-soft"></i>' + pearl(200) + (glass ? '<b class="bf-lens"></b>' : "") + '</div>';
        this.o = stage.querySelector(".bf-orb");
      },
      draw: function (S, P, f) { var s = .56 + .44 * level(S, P, f); this.o.style.transform = "translate(-50%,-50%) scale(" + s.toFixed(4) + ")"; }
    };

    /* ---------- the two looks ---------- */
    var L = {};
    L[1] = { /* Line: an even hairline route; the pearl walks it and leaves a trail that is brightest just behind it.
       The trail strokes scale with the drawing (no non-scaling-stroke), so their dash lengths are in the same units as
       getTotalLength; with non-scaling strokes Chrome measures dashes in screen pixels and the trail ran ahead of the pearl */
      build: function () {
        if (!RT) return ORB.build(false);
        var u = VS / 310, w = (1.6 * u).toFixed(3);   /* 1.6 px in the drawing's own units */
        stage.innerHTML = '<svg class="bf-sv" ' + VB + '><g transform="' + RT.tf + '"><path d="' + RT.outline + '" fill="none" stroke="#C9E6E6" stroke-width="1.25" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"/>' +
          RT.segs.map(function (d) { return '<g class="sg" opacity="0">' + [.16, .3, .55].map(function (o) { return '<path d="' + d + '" fill="none" stroke="' + T8 + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round" opacity="' + o + '"/>'; }).join("") + '</g>'; }).join("") +
          '</g></svg><div class="bf-pearl">' + pearl(24) + '</div>';
        this.sg = [].slice.call(stage.querySelectorAll(".sg")); this.pe = stage.querySelector(".bf-pearl"); this.last = -1; this.cur = null;
      },
      reset: function (g) { g.setAttribute("opacity", 0); [].forEach.call(g.children, function (p) { p.removeAttribute("stroke-dasharray"); }); },
      draw: function (S, P, f) {
        if (!RT) return ORB.draw(S, P, f);
        var me = this;
        if (!S) { this.sg.forEach(function (g) { me.reset(g); }); this.last = -1; this.cur = null; place(this.pe, pt(0, 0)); return; }
        var s = RT.seg(P);
        if (S.si !== this.last) {   /* a new piece: the one just walked settles to a faint line; a new lap clears them all */
          var lap = P.lap || S.si === 0;
          if (lap) this.sg.forEach(function (g) { me.reset(g); });
          else if (this.cur) { this.cur.setAttribute("opacity", .45); [].forEach.call(this.cur.children, function (p, j) { if (j) p.setAttribute("stroke-dasharray", "0 99999"); else p.removeAttribute("stroke-dasharray"); }); }
          this.last = S.si; this.cur = s.at ? null : this.sg[s.i];
        }
        if (this.cur) {
          var Lh = HP[s.i].getTotalLength(), done = f * Lh;   /* how far along this piece the pearl has come */
          this.cur.setAttribute("opacity", 1);
          [1, .55, .22].forEach(function (k, j) {   /* three windows ending at the pearl: the shortest is the brightest */
            var wl = Math.min(done, k * Lh), dash = s.rev ? "0 " + (Lh - done).toFixed(2) + " " + wl.toFixed(2) + " " + (Lh * 2).toFixed(2)   /* moving backwards: from the pearl towards the piece's end */
              : "0 " + (done - wl).toFixed(2) + " " + wl.toFixed(2) + " " + (Lh * 2).toFixed(2);
            me.cur.children[j].setAttribute("stroke-dasharray", dash);
          });
        }
        place(this.pe, posOf(P, f));
      } };
    L[3] = { /* Glass: a frosted pane in the route's shape whose light fills with the breath; the pearl walks its edge */
      build: function () {
        if (!RT) return ORB.build(true);
        stage.innerHTML = '<svg class="bf-sv bf-glass" ' + VB + '><defs><linearGradient id="bfG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".96"/><stop offset="1" stop-color="' + T1 + '" stop-opacity=".72"/></linearGradient>' +
          '<radialGradient id="bfL" cx=".5" cy=".55" r=".62"><stop offset="0" stop-color="' + T3 + '" stop-opacity=".7"/><stop offset="1" stop-color="' + T1 + '" stop-opacity="0"/></radialGradient></defs>' +
          '<g transform="' + RT.tf + '"><path d="' + RT.outline + '" fill="url(#bfG)" stroke="#FFFFFF" stroke-width="1.5" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>' +
          '<path class="lt" d="' + RT.outline + '" fill="url(#bfL)" opacity=".2"/>' +
          '<path d="' + RT.outline + '" fill="none" stroke="rgba(45,166,166,.32)" stroke-width="1" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></g></svg><div class="bf-pearl">' + pearl(24) + '</div>';
        this.lt = stage.querySelector(".lt"); this.pe = stage.querySelector(".bf-pearl");
      },
      draw: function (S, P, f) {
        if (!RT) return ORB.draw(S, P, f);
        if (!S) { this.lt.setAttribute("opacity", .2); place(this.pe, pt(0, 0)); return; }
        this.lt.setAttribute("opacity", (.2 + .8 * level(S, P, f)).toFixed(3));
        place(this.pe, posOf(P, f));
      } };
    var LOOK = L[LK];

    /* ---------- the session ---------- */
    var F = { S: null, state: "", len: 0, lenPick: 0 };
    function plan() { return MD.P.br[B.i].min; }
    function target() { return (F.len || plan()) * 60; }
    function setUp() { var k = kOf(B.i); useRoute(k); LOOK.build(k); paint(); }
    function paint() {
      var S = F.S, k = kOf(B.i);
      el.querySelector(".bf-ti").textContent = MD.P.br[B.i].n;
      var tl = el.querySelector(".bf-tl span"); if (tl) tl.textContent = S ? (S.el >= S.total ? "0:00" : clock(S.total - S.el)) : clock(target());
      if (!S || F.state === "done") { LOOK.draw(null); return; }
      if (S.cd > 0) { word.textContent = Math.ceil(S.cd) + ""; cnt.textContent = "Get comfortable"; LOOK.draw(null); return; }
      var P = S.seq[S.si], f = Math.min(1, S.t / P.s);
      word.textContent = F.state === "paused" ? "Paused" : S.fin && P.k === "out" ? "Last breath out" : P.w;
      cnt.textContent = F.state === "paused" ? "" : (k === "finger" ? P.sub.replace(/^(Up|Down) your /, "") + " · " : "") + Math.max(1, Math.ceil(P.s - S.t));
      if (RM) return;   /* reduced motion: the shape stays still, only the word and the count change */
      LOOK.draw(S, P, ease(f));
    }
    var PAT = { box: "In 4, hold 4, out 4, hold 4", sleep: "In 4, hold 7, out 8", zen: "In 4, out 6", star: "Up 4, pause 2, down 6", finger: "Up 4, down 6, finger by finger" };
    function buttons() {
      var st = F.state;
      if (st === "") { word.textContent = PAT[kOf(B.i)]; cnt.textContent = (F.len || plan()) + " min session"; bot.innerHTML = '<button class="md-save" data-bf="go">Start</button>'; }
      else if (st === "run") bot.innerHTML = '<button class="md-sec" data-bf="end">End</button><button class="md-save" data-bf="pause">Pause</button>';
      else if (st === "paused") bot.innerHTML = '<button class="md-sec" data-bf="end">End</button><button class="md-save" data-bf="resume">Resume</button>';
      else if (st === "early") { var e2 = F.S.el, ok = e2 >= 60, m = Math.floor(e2 / 60);
        word.textContent = "You breathed for " + dur(e2); cnt.textContent = ok ? "Minutes add up through the day." : "A session needs a minute to save.";
        bot.innerHTML = '<button class="md-sec" data-bf="resume">Keep Breathing</button>' + (ok ? '<button class="md-save" data-bf="savepart">Save ' + m + ' Min</button>' : '<button class="md-save" data-bf="drop">End Here</button>'); }
      else if (st === "done") { word.textContent = calm(Math.round(F.S.total / 60)); cnt.textContent = EX[kOf(B.i)].line; bot.innerHTML = '<button class="md-sec" data-bf="again">Do It Again</button><button class="md-save" data-bf="close">Back to Mind</button>'; }
      ["ready", "run", "paused", "early", "done"].forEach(function (x) { el.classList.toggle("s-" + x, (st || "ready") === x); });
      /* the length can change only before Start: a button on the ready screen, plain text once a session has begun */
      el.querySelector(".bf-tw").innerHTML = F.S ? '<span class="bf-tl lock" aria-label="Time left"><span></span></span>'
        : '<button class="bf-tl" data-bf="len" aria-label="Change the session length"><span></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>';
    }
    function open(i) {
      if (B.i !== i || !F.S) { F.len = 0; }
      B.i = i; F.state = F.S && F.S.el > 0 ? "paused" : ""; el.classList.add("on"); document.documentElement.classList.add("bf-lock");
      setUp(); buttons(); paint();
      if (AUTO && !F.S) { AUTO = false; setTimeout(start, 500); }   /* the doc's frames only, once; a tap on the row always waits for Start */
    }
    function close() {
      clearInterval(F.t); lenClose(); el.classList.remove("on"); document.documentElement.classList.remove("bf-lock");
      if (F.state === "run") F.state = "paused";
      B.S = F.S && F.state !== "done" ? F.S : null; B.state = F.state; MD.render();
    }
    function start() {
      prime();
      F.S = { seq: EX[kOf(B.i)].seq({ short: false }), si: 0, t: 0, el: 0, total: target(), cd: 3, fin: false };
      F.state = "run"; buttons(); haptic("ready"); loop();
    }
    function loop() {
      clearInterval(F.t); var last = performance.now();
      F.t = setInterval(function () {
        var S = F.S; if (!S || F.state !== "run") return clearInterval(F.t);
        var now = performance.now(), dt = Math.min(1, (now - last) / 1000) * SPEED; last = now;
        if (S.cd > 0) { S.cd -= dt; if (S.cd <= 0) enter(S.seq[0]); paint(); return; }
        S.t += dt; S.el += dt; if (S.el >= S.total) S.fin = true;
        while (S.t >= S.seq[S.si].s) {
          S.t -= S.seq[S.si].s; var P = S.seq[S.si];
          if (S.fin && (P.k === "out" || P.k === "rest")) return done();   /* time is up: end after a breath out */
          S.si = (S.si + 1) % S.seq.length; enter(S.seq[S.si]);
        }
        paint();
      }, 33);
    }
    function enter(P) { if (B.sound && CUE[P.k]) CUE[P.k](); haptic(P.k); }
    function credit(sec) {   /* minutes saved today, up to the plan; the plan done marks the row done */
      var i = B.i; B.saved[i] = Math.min(plan() * 60, (B.saved[i] || 0) + sec);
      if (B.saved[i] >= plan() * 60) { MD.S.br[i] = true; MD.cause = "br"; }
    }
    function done() {
      clearInterval(F.t); credit(Math.floor(F.S.total / 60) * 60);
      F.state = "done"; if (B.sound) CUE.done(); haptic("done"); buttons(); LOOK.draw(null);
    }

    /* ---------- the length sheet: house rules (title top left, grey circle X, no handle, at most 90%) ---------- */
    function lenOpen() {
      if (F.S) return;   /* the length is set before Start; once a session has begun it stays as it is */
      var pm = plan(), opts = [1, 2, 3, 5, 10]; if (opts.indexOf(pm) < 0) { opts.push(pm); opts.sort(function (a, b) { return a - b; }); }
      F.lenPick = F.len || pm;
      var row = function (m) { var on = m === F.lenPick; return '<button class="bf-opt' + (on ? " on" : "") + '" data-bfm="' + m + '" role="radio" aria-checked="' + on + '"><span class="bf-rd"></span><b>' + m + ' min</b>' + (m === pm ? '<span class="bf-tag">Recommended by your coach</span>' : "") + '</button>'; };
      lsheet.innerHTML = '<div class="bf-sh"><h4 id="bfLenT">Session length</h4><button class="bf-sx" data-bf="lenx" aria-label="Close">' + XG + '</button></div>' +
        '<div class="bf-sb"><p>Your coach recommends ' + pm + ' min. A shorter session still counts its minutes towards it.</p><div class="bf-opts" role="radiogroup" aria-label="Minutes">' + opts.map(row).join("") + '</div>' +
        '<button class="md-save" data-bf="lenok">Use ' + F.lenPick + ' Min</button></div>';
      el.classList.add("len");
    }
    function askStop() {
      clearInterval(F.t); F.state = "paused"; buttons(); paint(); F.ask = true;
      var e = F.S.el, m = Math.floor(e / 60);
      lsheet.innerHTML = '<div class="bf-sh"><h4 id="bfLenT">Stop breathing?</h4><button class="bf-sx" data-bf="lenx" aria-label="Close">' + XG + '</button></div>' +
        '<div class="bf-sb"><p>You breathed for ' + clock(e) + '. Leave now and it will not count yet.' + (m ? ' To keep your ' + m + ' min, tap End, then Save.' : '') + '</p>' +
        '<div class="bf-ask"><button class="md-save" data-bf="keep">Keep Breathing</button><button class="md-sec" data-bf="leave">Leave</button></div></div>';
      el.classList.add("len");
    }
    function lenClose() { el.classList.remove("len"); }

    el.addEventListener("click", function (e) {
      var m = e.target.closest("[data-bfm]");
      if (m) { F.lenPick = +m.dataset.bfm; [].forEach.call(lsheet.querySelectorAll("[data-bfm]"), function (x) { var on = +x.dataset.bfm === F.lenPick; x.classList.toggle("on", on); x.setAttribute("aria-checked", on); }); lsheet.querySelector("[data-bf=lenok]").textContent = "Use " + F.lenPick + " Min"; return; }
      var b = e.target.closest("[data-bf]"); if (!b) return; var a = b.dataset.bf;
      if (a === "go") return start();
      if (a === "pause") { clearInterval(F.t); F.state = "paused"; buttons(); return paint(); }
      if (a === "resume") { F.state = "run"; buttons(); return loop(); }
      if (a === "end") { clearInterval(F.t); F.state = "early"; return buttons(); }
      if (a === "len") return lenOpen();
      if (a === "lenx") { if (F.ask) { lenClose(); F.ask = false; F.state = "run"; buttons(); return loop(); } return lenClose(); }   /* dismissing the question keeps breathing */
      if (a === "lenok") { F.len = F.lenPick; if (F.S) { F.S.total = target(); F.S.fin = F.S.el >= F.S.total; } else buttons(); lenClose(); paint(); MD.toast("Session set to " + F.len + " min."); return; }
      if (a === "savepart") { var mm = Math.floor(F.S.el / 60); credit(mm * 60); F.S = null; F.state = ""; close(); MD.toast("Saved " + mm + " min. Finish the rest any time today."); return; }
      if (a === "drop") { F.S = null; F.state = ""; return close(); }
      if (a === "close" && F.state === "run") return askStop();   /* running: pause and ask before leaving */
      if (a === "keep") { lenClose(); F.ask = false; F.state = "run"; buttons(); return loop(); }
      if (a === "leave") { lenClose(); F.ask = false; return close(); }
      if (a === "again") { F.S = null; F.state = ""; return start(); }   /* a fresh session, same exercise and length */
      if (a === "close") { var wasDone = F.state === "done", mins = wasDone ? Math.round(F.S.total / 60) : 0; if (wasDone) F.S = null; close(); if (wasDone) { F.state = ""; MD.toast(MD.P.br[B.i].n + " done. " + calm(mins) + "."); } }
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && el.classList.contains("on")) { if (el.classList.contains("len")) el.querySelector(".bf-scrim").click(); else if (F.state === "run") askStop(); else close(); } });
    MDVAR.open.br = function (o) { var i = +o.split(":")[1] || 0; if (MD.S.br[i]) return true; open(i); return true; };
    /* doc-only URL hook for v7/mind-rhythm.html; nothing here runs without it. ?bfstate= opens the player in a state:
       len (the length sheet), run, paused, ask (the X question), early, short (ended under a minute), done, saved.
       ?bfel= sets the seconds already breathed (130 by default) */
    var BFS = Q.get("bfstate");
    if (BFS) setTimeout(function () {
      open(0);
      if (BFS === "len") return lenOpen();
      F.S = mkS(BFS === "short" ? 40 : +Q.get("bfel") || 130); F.S.total = target();
      if (BFS === "run") { F.state = "run"; buttons(); return loop(); }
      if (BFS === "ask") { F.state = "run"; buttons(); return askStop(); }
      if (BFS === "early" || BFS === "short") { F.state = "early"; return buttons(); }
      if (BFS === "done") return done();
      if (BFS === "saved") { var mm = Math.floor(F.S.el / 60); credit(mm * 60); F.S = null; F.state = ""; close(); MD.toast("Saved " + mm + " min. Finish the rest any time today."); return; }
      F.state = "paused"; buttons(); paint();
    }, 1000);

    /* ---------- styles ---------- */
    var css = document.createElement("style");
    css.textContent = [
      "html.bf-lock,html.bf-lock body{overflow:hidden}",
      ".bf{position:fixed;top:0;bottom:0;left:50%;width:100%;max-width:390px;transform:translate(-50%,0);z-index:300;overflow:hidden;opacity:0;visibility:hidden;transition:opacity .5s cubic-bezier(.4,0,.2,1),visibility 0s .5s;font-family:Roboto,sans-serif;color:" + INK + "}",
      ".bf.on{opacity:1;visibility:visible;transition:opacity .5s cubic-bezier(.4,0,.2,1)}",
      ".bf-bg{position:absolute;inset:0}.bf-hid{position:absolute;width:0;height:0;overflow:hidden}",
      ".bf-top{position:absolute;top:44px;left:0;right:0;height:56px;display:flex;align-items:center;gap:8px;padding:0 16px;z-index:5}",
      ".bf-x{width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,255,255,.7);color:" + INK + ";display:grid;place-items:center;cursor:pointer}.bf-x svg{width:20px;height:20px}",
      ".bf-ti{flex:1;text-align:center;font:500 14px/20px Roboto;opacity:.85}",
      ".bf-tl{min-width:44px;height:36px;padding:0 8px 0 12px;border-radius:999px;border:1px solid rgba(22,74,74,.16);background:rgba(255,255,255,.7);color:" + INK + ";display:inline-flex;align-items:center;gap:2px;font:600 13px Roboto;font-variant-numeric:tabular-nums;cursor:pointer;position:relative}",
      ".bf-tl::after{content:'';position:absolute;left:50%;top:50%;width:max(100%,44px);height:44px;transform:translate(-50%,-50%)}.bf-tl svg{width:16px;height:16px}",
      ".bf-tl.lock{border-color:transparent;background:transparent;padding:0 4px;cursor:default}.bf-tl.lock::after{display:none}",
      /* one template for every exercise and state: top bar, a fixed visual zone, a fixed instruction zone under it, actions pinned to the bottom */
      ".bf-stage{position:absolute;left:50%;top:108px;width:300px;height:300px;transform:translateX(-50%);z-index:2;overflow:visible}",
      ".bf-sv{position:absolute;inset:0;width:100%;height:100%;overflow:visible}",
      ".bf-pearl{position:absolute;width:0;height:0;z-index:3}.bf-pearl svg{position:absolute;transform:translate(-50%,-50%);filter:drop-shadow(0 3px 6px rgba(31,122,122,.22))}",
      ".bf-txt{position:absolute;left:0;right:0;top:424px;height:124px;display:flex;flex-direction:column;align-items:center;text-align:center;z-index:4;pointer-events:none}",
      ".bf-word{font:300 32px/38px Roboto;letter-spacing:.3px;padding:0 24px;max-height:76px;overflow:hidden}.bf.s-ready .bf-word,.bf.s-early .bf-word{font-size:26px;line-height:32px}.bf-cnt{margin-top:6px;font:500 15px/20px Roboto;font-variant-numeric:tabular-nums;color:#2D6B6B;min-height:20px;padding:0 48px}",
      ".bf-bot{position:absolute;left:0;right:0;bottom:0;padding:0 24px calc(40px + env(safe-area-inset-bottom,0px));display:flex;gap:12px;z-index:5}",
      ".bf-bot>button{flex:1;width:auto}.bf-bot.stack{flex-direction:column}.bf-bot.stack>button{flex:none;width:100%}",
      ".bf-ask{display:flex;flex-direction:column;gap:12px}.bf-ask>button{width:100%}",
      /* tracing shapes keep their centre clear: the word sits under the shape */
      ".l1 .bf-bg{background:linear-gradient(180deg," + T25 + " 0%,#FFFFFF 46%,#F5F8FF 100%)}",
      ".l3 .bf-bg{background:linear-gradient(160deg," + T25 + " 0%,#FFFFFF 42%,#F3F1FF 100%)}",
      ".bf-glass{filter:drop-shadow(0 24px 30px rgba(31,122,122,.16))}",
      ".l4 .bf-bg{background:radial-gradient(90% 60% at 50% 42%," + T25 + " 0%,#FFFFFF 70%)}",
      /* the orb alone (Sleep 4-7-8, Zen Flow): a faint soft light behind it, no bloom; Glass adds a frosted sheen */
      ".bf-orb{position:absolute;left:50%;top:50%;width:200px;height:200px;transform:translate(-50%,-50%) scale(.56);will-change:transform}",
      ".bf-orb svg{position:relative;display:block;filter:drop-shadow(0 16px 28px rgba(31,122,122,.18))}",
      ".bf-soft{position:absolute;inset:-24%;border-radius:50%;background:radial-gradient(circle,rgba(164,253,253,.42) 30%,rgba(224,255,255,.2) 52%,rgba(224,255,255,0) 70%)}",
      ".bf-lens{position:absolute;inset:0;border-radius:50%;background:linear-gradient(150deg,rgba(255,255,255,.5),rgba(255,255,255,.06) 55%,rgba(255,255,255,0));box-shadow:inset 0 0 0 1px rgba(255,255,255,.55)}",
      /* the length sheet */
      ".bf-scrim{position:absolute;inset:0;background:rgba(0,0,0,.4);opacity:0;pointer-events:none;transition:opacity .3s ease-out;z-index:8}",
      ".bf-sheet{position:absolute;left:0;right:0;bottom:0;max-height:90%;display:flex;flex-direction:column;background:#fff;border-radius:16px 16px 0 0;transform:translateY(100%);transition:transform .3s ease-out;z-index:9;color:#101828}",
      ".bf.len .bf-scrim{opacity:1;pointer-events:auto}.bf.len .bf-sheet{transform:none}",
      ".bf-sh{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 16px 8px}.bf-sh h4{margin:0;font:600 18px/24px Roboto}",
      ".bf-sx{width:44px;height:44px;margin-right:-6px;border:0;background:none;padding:0;display:grid;place-items:center;cursor:pointer}",
      ".bf-sb{overflow-y:auto;padding:0 16px calc(24px + env(safe-area-inset-bottom,0px))}.bf-sb p{margin:0 0 12px;font-size:14px;line-height:21px;color:#475467}",
      ".bf-opts{display:flex;flex-direction:column;gap:8px;margin-bottom:20px}",
      ".bf-opt{display:flex;align-items:center;gap:12px;min-height:52px;padding:0 16px;border:1px solid #E4E7EC;border-radius:12px;background:#fff;font:inherit;text-align:left;cursor:pointer}",
      ".bf-opt b{flex:1;font:600 15px Roboto;color:#101828}.bf-opt.on{border-color:#299D6B;background:#F3FCF8}",
      ".bf-rd{width:20px;height:20px;border-radius:50%;border:1.5px solid #D0D5DD;flex:0 0 auto;position:relative}.bf-opt.on .bf-rd{border-color:#299D6B}.bf-opt.on .bf-rd::after{content:'';position:absolute;inset:4px;border-radius:50%;background:#299D6B}",
      ".bf-tag{font:600 12px Roboto;color:#2A805A;background:#E6FAF1;border-radius:999px;padding:3px 10px}",
      "@media (prefers-reduced-motion: reduce){.bf,.bf-sheet,.bf-scrim{transition-duration:.01s!important}}"
    ].join("");
    document.head.appendChild(css);
    useRoute(kOf(0)); LOOK.build(kOf(0));
  })();

  MD.render(); decorate();

  /* states for the doc: ?bstate= with ?sheet=breath */
  var ST = Q.get("bstate");
  if (ST && /^(run|paused|early|done)$/.test(ST)) setTimeout(function () {
    openSheet(0, "ready");
    if (ST === "run") return start();
    B.S = mkS(130);
    if (ST === "paused") show("paused");
    else if (ST === "early") show("early");
    else if (ST === "done") { B.S.el = B.S.total; complete(); }
  }, 1000);
})();
