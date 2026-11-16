/* Breathing on the real Mind screen. The pictures are the final seven (mind/breath-lab/final-list.js, spec in
   mind/breath-lab/FINAL.md): Simple Breathing, 4-7-8, Box, Extended Exhale, Belly, Humming Bee (Bhramari) and Pursed Lip.
   index.html loads lab.js, final.js, ai-frames.js and final-list.js before this file. Each visual is drawn on a 320 x 360
   stage, scaled to fit, and fed LAB.at(key, seconds breathed), so the picture and the words keep the same clock.
   ?vbreath=f  Full screen (the screen's default, plan.js). See the block near the end.
   ?vbreath=b  The same player in a bottom sheet, with a ready screen that explains the steps.
   ?vbreath=a, c, d  Research variants of the sheet, for research/breathing.html; they draw the same final pictures
               (c keeps its night sheet for 4-7-8, d fades the picture after the first minute while sound and buzz keep time).
   Controls, as the final player (breath-lab/lab.js): sound on or off always; one Pause button that turns into Resume, with End beside it.
   Doc params: ?bx=simple|478|box|exhale|belly|hum|pursed picks the plan's first exercise, ?bmin=2..15 its minutes,
   ?bstate=ready|run|paused|early|done|part (part = 2 min saved, sheet closed), ?brep=1 done before, ?rm=1 reduced motion,
   ?bspeed=4 faster for review, ?brow=before keeps today's row. ?sheet=breath opens the player.
   ?sheet=brask opens the not-done tick's sheet (Start breathing, or I've already done it); with ?done=br:0 the tick
   opens the done row's menu instead (Breathe again, Mark as not done). ?untick=br:0 does the same through plan.js.
   Older names saved in a plan (Coherent Breathing (5-5), Sleep Breathing, Box Breathing) resolve through coach-mind/data.js
   MP.breath and show as today's name; anything unknown opens as Simple Breathing. */
(function () {
  "use strict";
  var MD = window.MDPLAN; if (!MD || !window.LAB || !LAB.FINAL) return;
  var Q = MD.Q, VK = (Q.get("vbreath") || "b").toLowerCase();
  var LOOK = { a: "orb", b: "own", c: "room", d: "own", f: "own" }[VK] || "own", SETTLE = VK === "d";
  var F7 = LAB.FINAL;
  var BX = { simple: "coherent", coherent: "coherent", "478": "sleep", sleep: "sleep", box: "box", exhale: "exhale", belly: "belly", hum: "hum", pursed: "pursed" };
  function keyOf(n) {
    var b = window.MP && MP.breath ? MP.breath(n) : null;
    return b ? b[4] : LAB.FINAL_ORDER.filter(function (k) { return F7[k].name === n; })[0] || "coherent";
  }
  if (!MD.P.br.length) MD.P.br.push({ n: F7.coherent.name, min: 5, how: "", at: "13:00" });
  MD.P.br.forEach(function (b) { b.n = F7[keyOf(b.n)].name; });   /* only the final seven's names are ever shown */
  if (BX[Q.get("bx")]) MD.P.br[0].n = F7[BX[Q.get("bx")]].name;
  if (+Q.get("bmin")) MD.P.br[0].min = +Q.get("bmin");
  var RM = Q.get("rm") === "1" || matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SPEED = +Q.get("bspeed") || 1, FIRST = Q.get("brep") !== "1", BEFORE = Q.get("brow") === "before";

  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
  var SND = { on: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>',
              off: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6M16 9l6 6"/></svg>' };
  var PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.5"/><rect x="14" y="5" width="4" height="14" rx="1.5"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>';
  /* the final player's controls: sound always, one Pause; once paused, End appears beside Resume */
  function sndBtn(a, cls) { return '<button class="' + cls + '" data-' + a + '="snd" aria-pressed="' + B.sound + '" aria-label="' + (B.sound ? "Sound on" : "Sound off") + '">' + (B.sound ? SND.on : SND.off) + '</button>'; }
  function ctl(paused, a, cls) {
    return sndBtn(a, cls) +
      (paused ? '<button class="md-sec" data-' + a + '="end">End</button><button class="md-save bv-cta" data-' + a + '="resume">' + PLAY + 'Resume</button>'
        : '<button class="md-save bv-cta" data-' + a + '="pause">' + PAUSE + 'Pause</button>');
  }
  var G = {
    sleep: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    box: '<rect x="4" y="4" width="16" height="16" rx="2"/>'
  };
  G.coherent = G.belly = G.pursed = G.exhale = G.hum = G.leaf;   /* the others share the calm leaf */
  function glyph(k) { return '<svg class="bv-g" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + G[k] + '</svg>'; }
  function clock(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ":" + ("0" + s % 60).slice(-2); }
  function dur(s) { s = Math.floor(s); var m = Math.floor(s / 60), r = s % 60; return m ? m + " min" + (r ? " " + r + " s" : "") : r + " s"; }
  function calm(n) { return n + (n === 1 ? " calm minute" : " calm minutes"); }   /* 1 calm minute, 2 calm minutes */

  /* ---------- the final seven: timings straight from LAB.PAT, words from final-list.js ---------- */
  function ph(k, s, w, sub) { return { k: k, s: s, w: w, sub: sub }; }
  var EX = {};
  LAB.FINAL_ORDER.forEach(function (k) {
    var f = F7[k], seq = LAB.PAT[k].seq;
    EX[k] = { sum: f.how, holds: seq.some(function (x) { return x[0] === "hold"; }), steps: f.steps, line: f.line,
      seq: function () { return seq.map(function (x) { return ph(x[0], x[1], x[2], x[3]); }); } };
  });
  function kOf(i) { return keyOf(MD.P.br[i].n); }

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
  var B = { saved: {}, S: null, i: 0, sound: false, feel: "", state: "", t: 0, wake: 0 };   /* sound off until the person turns it on */
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
  /* B.play(i, fresh) opens the player for row i: the sheet here, the full screen in ?vbreath=f (it sets its own below) */
  B.play = function (i, fresh) { if (fresh) B.S = null; openSheet(i, B.S && B.i === i && B.S.el > 0 ? "paused" : "ready"); };
  /* a done row, tapped on its body or its tick: Eat's item menu (r3/eat.html itemMenu), no confirm, the sheet was the asking */
  function doneMenu(i) {
    MD.menu("bvMenu", MD.P.br[i].n, [["again", MD.MI.play, "Breathe again"], ["undo", MD.MI.back, "Mark as not done"]], function (a) {
      if (window.closeSheets) window.closeSheets();
      if (a === "again") return B.play(i, true);
      MD.S.br[i] = false; B.saved[i] = 0; MD.cause = ""; MD.render(); MD.toast("Marked as not done");
    });
  }
  MDVAR.open.br = function (o) { var i = +o.split(":")[1] || 0; if (MD.S.br[i]) doneMenu(i); else B.play(i); return true; };
  /* the row's body opens the player; its tick, not yet done, asks how: breathe now, or it was already done on their own */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-brask],[data-brmark],[data-brgo]"); if (!t) return;
    e.preventDefault();
    if (t.dataset.brgo != null) { if (window.closeSheets) window.closeSheets(); return B.play(+t.dataset.brgo); }
    if (t.dataset.brmark != null) { var j = +t.dataset.brmark; MD.S.br[j] = true; MD.cause = "br"; if (window.closeSheets) window.closeSheets(); MD.render(); MD.toast("Marked as done"); return; }
    var i = +t.dataset.brask, b = MD.P.br[i];
    if (MD.S.br[i]) return doneMenu(i);
    window.GFOpenSheet("bvAsk", b.n, '<p class="msub" style="margin:0 0 16px">' + F7[kOf(i)].pat + ' · ' + b.min + ' min, suggested by your coach</p>' +
      '<div style="display:flex;flex-direction:column;gap:12px"><button class="md-save" data-brgo="' + i + '">Start breathing</button><button class="md-sec" data-brmark="' + i + '">I\'ve already done it</button></div>');
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
      if (FIRST) h += '<div class="md-tip2">' + (E.holds ? "If you feel light-headed, stop and breathe normally." : "Sit comfortably and relax your shoulders. You can pause any time.") + '</div>';
      h += '<div class="bv-opt" style="margin-bottom:16px"><span>Sound<small>' + (SETTLE ? "Keeps time when the picture fades" : "Soft tones on each breath") + '</small></span><button class="bv-sw" role="switch" data-bv="sound" aria-checked="' + B.sound + '" aria-label="Sound"></button></div>';
      h += '<button class="md-save" data-bv="go">' + (sv ? "Breathe " + Math.ceil(left / 60) + " More Min" : "Start Breathing") + '</button>';
      b.innerHTML = h; mountVis(b.querySelector(".bv-vis")); return;
    }
    if (state === "run" || state === "paused") {
      var night = LOOK === "room" && k === "sleep";
      b.innerHTML = '<div class="bv-pl"><div class="bv-vis"></div><div class="bv-word" aria-live="polite"></div><div class="bv-hint"></div><div class="bv-cnt"></div>' +
        '<div class="bv-sess"' + (night ? ' style="visibility:hidden"' : "") + '><span class="bv-tl"></span><span class="bv-bar"><i></i></span></div></div>' +
        '<div class="bv-two">' + ctl(state === "paused", "bv", "bv-ib") + '</div>';
      mountVis(b.querySelector(".bv-vis")); paint();
      if (state === "paused") { b.querySelector(".bv-word").textContent = "Paused"; b.querySelector(".bv-hint").textContent = dur(B.S.el) + " so far. Pick up where you left off."; b.querySelector(".bv-cnt").textContent = ""; }
      else loop();
      return;
    }
    if (state === "early") {
      var el = B.S.el, ok = el >= 60, m = Math.floor(el / 60), rest = P.min - Math.floor((sv + m * 60) / 60);
      b.innerHTML = '<div class="bv-pl"><div class="bv-vis sm"></div><div class="bv-big">You breathed for ' + dur(el) + '</div><div class="bv-line">' +
        (ok ? "Minutes add up through the day. Save " + m + " min now and finish the other " + rest + " later." : "A session needs a minute to save. Even one more minute makes a difference you can feel.") + '</div></div>' +
        '<div class="bv-two"><button class="md-sec" data-bv="resume">Keep Breathing</button>' + (ok ? '<button class="md-save" data-bv="savepart">Save ' + m + ' Min</button>' : '<button class="md-save" data-bv="drop">End Here</button>') + '</div>';
      mountVis(b.querySelector(".bv-vis")); return;
    }
    if (state === "done") {
      var nt = LOOK === "room" && k === "sleep";
      b.innerHTML = '<div class="bv-pl bv-done"><div class="bv-vis sm"><div class="bv-orbw"><div class="bv-orb" style="transform:scale(.8)"></div></div></div><div class="bv-big">' + calm(P.min) + ', done</div><div class="bv-line">' + E.line + '</div></div>' +
        (nt ? "" : '<div class="lab" style="margin:0 0 8px">How do you feel now? Optional</div><div class="md-pills" style="margin-bottom:16px">' + ["Calmer", "About the same", "Not sure"].map(function (x) { return '<button class="md-pill' + (B.feel === x ? " on" : "") + '" data-bvfeel="' + x + '">' + x + '</button>'; }).join("") + '</div>') +
        '<button class="md-save" data-bv="close">' + (nt ? "Sleep Well" : "Back to Mind") + '</button>';
    }
  }

  /* ---------- the picture: the exercise's final visual, on its 320 x 360 stage scaled into the box ----------
     A frame loop draws it while the box is on screen: the breath while a session runs, its first moment otherwise.
     Reduced motion: the visuals show still end states and change only when the phase changes (final-list.js). */
  var VIS = null;
  function mountVis(box) {
    var k = kOf(B.i), v = F7[k].visual(), w = box.offsetWidth || 248;
    box.innerHTML = '<div class="bv-fin"></div>';
    var st = box.firstChild; st.style.transform = "translate(-50%,-50%) scale(" + (w / 320).toFixed(4) + ")";
    var me = VIS = { box: box, k: k, v: v, st: v.build(st, LAB.L) };
    (function tick() { if (VIS !== me || !box.isConnected) return; draw(); requestAnimationFrame(tick); })();
  }
  function draw() {
    var S = B.S, live = S && S.cd <= 0 && (B.state === "run" || B.state === "paused");
    var p = LAB.at(VIS.k, live ? S.el : 0); p.reduced = RM; p.paused = !live || B.state !== "run";
    if (!live) p.sec = 1;   /* at rest: past the first moment's hand-over, so the picture shows breathing in, not the last breath out */
    try { VIS.v.frame(VIS.st, p); } catch (e) { console.error(e); }
  }
  function paint() {
    var S = B.S, b = body(); if (!S || !b || !b.querySelector(".bv-word")) return;
    var P = S.seq[S.si];
    var word = b.querySelector(".bv-word"), hint = b.querySelector(".bv-hint"), cnt = b.querySelector(".bv-cnt");
    if (S.cd > 0) { word.textContent = Math.ceil(S.cd) + ""; hint.textContent = FIRST ? "Get comfortable. Shoulders down." : "Get ready"; cnt.textContent = ""; }
    else {
      word.textContent = S.fin && P.k === "out" ? "Last breath out" : P.w;
      hint.textContent = FIRST || LOOK === "orb" ? P.sub : "";
      cnt.textContent = Math.max(1, Math.ceil(P.s - S.t)) + "";
    }
    var tl = b.querySelector(".bv-tl"), bar = b.querySelector(".bv-bar i");
    if (tl) tl.textContent = S.el >= S.total ? "Finishing" : clock(S.total - S.el) + " left";
    if (bar) bar.style.width = Math.min(100, S.el / S.total * 100) + "%";
  }

  /* ---------- the engine: a timer, so time stays true even when frames are throttled ---------- */
  /* a session already 'el' seconds in, for the doc's paused and ended-early states */
  function mkS(el) {
    var S = { seq: EX[kOf(0)].seq(), si: 0, t: 0, el: el, total: MD.P.br[0].min * 60, cd: 0, bi: 0, fin: false }, acc = el;
    while (acc >= S.seq[S.si].s) { acc -= S.seq[S.si].s; if (S.seq[S.si].k === "out") S.bi++; S.si = (S.si + 1) % S.seq.length; }
    S.t = acc; return S;
  }
  function start() {
    var i = B.i, k = kOf(i), left = MD.P.br[i].min * 60 - (B.saved[i] || 0);
    prime();
    B.S = { seq: EX[k].seq(), si: 0, t: 0, el: 0, total: Math.max(60, left), cd: 3, bi: 0, fin: false };
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
    if (night && P.k === "in" && B.S.bi === 2) sheet().classList.add("bv-dim");   /* C, 4-7-8: the sheet dims itself after two breaths */
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
    var t = e.target.closest("[data-bv],[data-bvfeel],.bv-vis"); if (!t || !sheet() || !sheet().contains(t)) return;
    var a = t.dataset.bv;
    if (t.dataset.bvfeel) { B.feel = B.feel === t.dataset.bvfeel ? "" : t.dataset.bvfeel; return show("done"); }
    if (t.classList.contains("bv-vis")) { if (SETTLE && B.state === "run") { B.wake = performance.now() + 10000; sheet().classList.remove("bv-settle"); } return; }
    if (a === "how") { var x = body().querySelector(".bv-howx"); x.hidden = !x.hidden; t.setAttribute("aria-expanded", !x.hidden); return; }
    if (a === "sound") { B.sound = !B.sound; t.setAttribute("aria-checked", B.sound); if (B.sound) { prime(); CUE.hold(); } return; }
    if (a === "snd") { B.sound = !B.sound; if (B.sound) prime(); t.setAttribute("aria-pressed", B.sound); t.setAttribute("aria-label", B.sound ? "Sound on" : "Sound off"); t.innerHTML = B.sound ? SND.on : SND.off; return; }
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
    ".bv-fin{position:absolute;left:50%;top:50%;width:320px;height:360px;transform-origin:center}",
    ".bv-cta{display:inline-flex;align-items:center;justify-content:center;gap:8px}.bv-cta svg{width:20px;height:20px}",
    ".bv-orbw{position:absolute;inset:0;display:grid;place-items:center}",
    ".bv-orbw svg{position:absolute;width:92%;height:92%;transform:rotate(-90deg)}",
    ".bv-orb{width:80%;height:80%;border-radius:50%;background:radial-gradient(circle at 38% 32%,#C7D7FE,#6172F3 70%,#444CE7);transform:scale(.56)}",
    ".bv-done .bv-orb{background:radial-gradient(circle at 38% 32%,#CBF0E0,#299D6B 80%)}",
    ".bv-word{margin-top:12px;font:600 22px/28px Roboto,sans-serif;color:var(--g-900,#101828);min-height:28px}",
    ".bv-hint{margin-top:4px;font-size:14px;line-height:20px;color:var(--g-600,#475467);min-height:20px}.bv-hint.bv-with{color:#2A805A}",
    ".bv-cnt{font:700 15px/20px Roboto,sans-serif;color:#A68A2D;font-variant-numeric:tabular-nums;min-height:20px;margin-top:2px}",
    ".bv-sess{width:100%;margin:14px 0 6px;display:flex;align-items:center;gap:10px;font:500 12px Roboto,sans-serif;color:var(--g-500,#667085);font-variant-numeric:tabular-nums}",
    ".bv-bar{flex:1;height:4px;border-radius:999px;background:var(--g-100,#F2F4F7);overflow:hidden}.bv-bar i{display:block;height:100%;width:0;background:#6172F3;border-radius:999px}",
    ".bv-two{display:flex;gap:10px;margin-top:8px}.bv-two>*{flex:1}",
    ".bv-ib{flex:0 0 48px!important;height:48px;border-radius:6px;border:1px solid var(--g-200,#E4E7EC);background:#fff;color:var(--g-700,#344054);display:grid;place-items:center;cursor:pointer}.bv-ib svg{width:20px;height:20px}.bv-ib[aria-pressed=false]{color:#98A2B3}",
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
    "@media (prefers-reduced-motion: reduce){.bv-vis,.bv-sw::after{transition-duration:.01s!important}}"
  ].join("");
  document.head.appendChild(css);

  /* =====================================================================================================
     ?vbreath=f: the full-screen player. Tapping a breathing row opens it over the whole screen on its ready state: close X
     top left, the time top right (tap it to change the length before Start; locked once a session has begun, paused
     included), the exercise's final picture in the centre with the phase word and its count under it, Start; then the
     final player's controls: sound on or off, Pause, and once paused End beside Resume. The sound button is there from the
     ready screen on, left of Start. The length sheet ends with No time limit: the pill reads No limit and, once started,
     counts up from 0:00 until they end it. Past 1 minute breathed the row ticks in the background (Rhythm moves) while they
     keep going; X or End asks: at 1 minute or more "N min saved" (Save and exit, Keep breathing), under it "Stop breathing?"
     (Keep breathing, Leave). Saved minutes are the whole minutes breathed.
     ?bauto=1 starts on open.
     ===================================================================================================== */
  if (VK === "f") (function () {
    var AUTO = Q.get("bauto") === "1";
    var T25 = "#FFFDF5", INK = "#5C4E1F";
    var XG = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 32 32"><path fill="#98A2B3" d="M16 3a13 13 0 1 0 13 13A13.013 13.013 0 0 0 16 3m4.708 16.293a1 1 0 0 1-1.415 1.415L16 17.414l-3.293 3.293a1 1 0 0 1-1.415-1.415L14.587 16l-3.293-3.293a1 1 0 1 1 1.415-1.415L16 14.587l3.293-3.293a1 1 0 0 1 1.415 1.415L17.414 16z"/></svg>';

    /* ---------- the overlay ---------- */
    var el = document.createElement("div");
    el.id = "bvFull"; el.className = "bf l1"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", "Breathing");
    el.innerHTML = '<div class="bf-bg"></div><div class="bf-stage"></div>' +
      '<div class="bf-top"><button class="bf-x" data-bf="close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button><div class="bf-ti"></div>' +
      '<span class="bf-tw"></span></div>' +
      '<div class="bf-txt"><div class="bf-word" aria-live="polite"></div><div class="bf-cnt"></div></div><div class="bf-bot"></div>' +
      '<div class="bf-scrim" data-bf="lenx"></div><div class="bf-sheet" role="dialog" aria-modal="true" aria-labelledby="bfLenT"></div>';
    document.body.appendChild(el);
    var stage = el.querySelector(".bf-stage");
    var word = el.querySelector(".bf-word"), cnt = el.querySelector(".bf-cnt"), bot = el.querySelector(".bf-bot"), lsheet = el.querySelector(".bf-sheet");
    /* ---------- the picture: the exercise's final visual on its 320 x 360 stage, scaled to the 300 px zone.
       A frame loop draws it while the player is open: the breath while a session runs, its first moment otherwise ---------- */
    var FV = null, ticking = false;
    function setUp() {
      var k = kOf(B.i), v = F7[k].visual();
      stage.innerHTML = '<div class="bf-fin"></div>';
      FV = { k: k, v: v, st: v.build(stage.firstChild, LAB.L) };
      paint();
      if (!ticking) { ticking = true; (function tick() { if (!el.classList.contains("on")) { ticking = false; return; } drawVis(); requestAnimationFrame(tick); })(); }
    }
    function drawVis() {
      if (!FV) return;
      var S = F.S, live = S && S.cd <= 0 && F.state !== "done" && F.state !== "";
      var p = LAB.at(FV.k, live ? S.el : 0); p.reduced = RM; p.paused = !live || F.state !== "run";
      if (!live) p.sec = 1;   /* at rest: past the first moment's hand-over, so the picture shows breathing in, not the last breath out */
      try { FV.v.frame(FV.st, p); } catch (e) { console.error(e); }
    }

    /* ---------- the session ---------- */
    var F = { S: null, state: "", len: 0, lenPick: 0 };
    function plan() { return MD.P.br[B.i].min; }
    function target() { return F.len < 0 ? Infinity : (F.len || plan()) * 60; }   /* F.len -1: no time limit */
    function free() { return F.S ? F.S.total === Infinity : F.len < 0; }
    /* 1 minute breathed ticks the row in the background, right then, so Rhythm moves even if they keep going */
    function autoTick() { if (F.S && F.S.el >= 60 && !MD.S.br[B.i]) { MD.S.br[B.i] = true; MD.cause = "br"; MD.render(); } }
    function paint() {
      var S = F.S;
      el.querySelector(".bf-ti").innerHTML = '<button class="bf-ib" data-bf="info" aria-label="How ' + MD.P.br[B.i].n + ' works">' + MD.P.br[B.i].n + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg></button>';
      var tl = el.querySelector(".bf-tl span"); if (tl) tl.textContent = !S ? (free() ? "No limit" : clock(target())) : free() ? clock(S.el) : S.el >= S.total ? "0:00" : clock(S.total - S.el);
      if (!S || F.state === "done") return;
      if (S.cd > 0) { word.textContent = Math.ceil(S.cd) + ""; cnt.textContent = "Get comfortable"; return; }
      var P = S.seq[S.si];
      word.textContent = F.state === "paused" ? "Paused" : S.fin && P.k === "out" ? "Last breath out" : P.w;
      cnt.textContent = F.state === "paused" ? "" : Math.max(1, Math.ceil(P.s - S.t));
    }
    function buttons() {
      var st = F.state;
      if (st === "") { word.textContent = F7[kOf(B.i)].pat; cnt.textContent = free() ? "No time limit" : (F.len || plan()) + " min session"; bot.innerHTML = sndBtn("bf", "bf-snd") + '<button class="md-save" data-bf="go">Start</button>'; }   /* sound from the start, where it sits while breathing */
      else if (st === "run" || st === "paused") bot.innerHTML = ctl(st === "paused", "bf", "bf-snd");
      else if (st === "done") { word.textContent = calm(Math.round(F.S.total / 60)); cnt.textContent = EX[kOf(B.i)].line; bot.innerHTML = '<button class="md-sec" data-bf="again">Do It Again</button><button class="md-save" data-bf="close">Back to Mind</button>'; }
      ["ready", "run", "paused", "done"].forEach(function (x) { el.classList.toggle("s-" + x, (st || "ready") === x); });
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
        S.t += dt; S.el += dt; if (S.el >= S.total) S.fin = true; autoTick();
        while (S.t >= S.seq[S.si].s) {
          S.t -= S.seq[S.si].s; var P = S.seq[S.si];
          if (S.fin && (P.k === "out" || P.k === "rest")) return done();   /* time is up: end after a breath out */
          S.si = (S.si + 1) % S.seq.length; enter(S.seq[S.si]);
        }
        paint();
      }, 33);
    }
    function enter(P) { if (B.sound && CUE[P.k]) CUE[P.k](); haptic(P.k); }
    function credit(sec) {   /* whole minutes breathed, saved today; a minute or more ticks the row */
      var i = B.i; B.saved[i] = (B.saved[i] || 0) + sec;
      if (B.saved[i] >= 60 && !MD.S.br[i]) { MD.S.br[i] = true; MD.cause = "br"; }
    }
    function done() {
      clearInterval(F.t); credit(Math.floor(F.S.el / 60) * 60);
      F.state = "done"; if (B.sound) CUE.done(); haptic("done"); buttons();
    }

    /* ---------- the length sheet: house rules (title top left, grey circle X, no handle, at most 90%) ---------- */
    function lenOpen() {
      if (F.S) return;   /* the length is set before Start; once a session has begun it stays as it is */
      var pm = plan(), opts = [1, 2, 3, 5, 10]; if (opts.indexOf(pm) < 0) { opts.push(pm); opts.sort(function (a, b) { return a - b; }); }
      opts.push(-1);   /* last: no time limit */
      F.lenPick = F.len || pm;
      var row = function (m) { var on = m === F.lenPick; return '<button class="bf-opt' + (on ? " on" : "") + '" data-bfm="' + m + '" role="radio" aria-checked="' + on + '"><span class="bf-rd"></span><b>' + (m < 0 ? 'No time limit<small>As long as you like</small>' : m + ' min') + '</b>' + (m === pm ? '<span class="bf-tag">Recommended by your coach</span>' : "") + '</button>'; };
      lsheet.innerHTML = '<div class="bf-sh"><h4 id="bfLenT">Session length</h4><button class="bf-sx" data-bf="lenx" aria-label="Close">' + XG + '</button></div>' +
        '<div class="bf-sb"><p>Your coach recommends ' + pm + ' min. A shorter session still counts its minutes towards it.</p><div class="bf-opts" role="radiogroup" aria-label="Minutes">' + opts.map(row).join("") + '</div>' +
        '<button class="md-save" data-bf="lenok">' + useL(F.lenPick) + '</button></div>';
      el.classList.add("len");
    }
    function useL(m) { return "Use " + (m < 0 ? "no time limit" : m + " min"); }
    /* X or End once a session has begun (running or paused): a minute or more is already ticked, so it offers to save */
    function askStop() {
      F.was = F.state; clearInterval(F.t); F.state = "paused"; buttons(); paint(); F.ask = true;
      var m = Math.floor(F.S.el / 60), n = MD.P.br[B.i].n;
      lsheet.innerHTML = '<div class="bf-sh"><h4 id="bfLenT">' + (m ? m + " min saved" : "Stop breathing?") + '</h4><button class="bf-sx" data-bf="lenx" aria-label="Close">' + XG + '</button></div>' +
        '<div class="bf-sb"><p>' + (m ? "Your " + m + (m === 1 ? " minute counts" : " minutes count") + " and " + n + " is ticked in your plan." : "Breathe for at least 1 minute for it to count.") + '</p>' +
        '<div class="bf-ask">' + (m ? '<button class="md-save" data-bf="savexit">Save and exit</button><button class="md-sec" data-bf="keep">Keep breathing</button>'
          : '<button class="md-save" data-bf="keep">Keep breathing</button><button class="md-sec" data-bf="leave">Leave</button>') + '</div></div>';
      el.classList.add("len");
    }
    /* the title's info: how the exercise goes, as in the breathing library's sheet (pattern, the wave, steps, why it helps), one Got it.
       It pauses nothing: before Start it is just reading; while breathing it pauses and Got it carries on */
    function infoOpen() {
      var k = kOf(B.i), Fx = LAB.FINAL[k], it = window.BLIB && BLIB.get ? BLIB.get(k) : null;
      F.was = F.state; if (F.state === "run") { clearInterval(F.t); F.state = "paused"; buttons(); paint(); }
      var good = it ? " " + it.good.map(function (g) { return { "Busy mind": "a busy mind", Breathless: "breathlessness" }[g] || g.toLowerCase(); }).reduce(function (a, w, i, l) { return a + (i ? (i === l.length - 1 ? " and " : ", ") : "") + w; }, "Good for ") + "." : "";
      lsheet.innerHTML = '<div class="bf-sh"><h4 id="bfLenT">' + MD.P.br[B.i].n + '</h4><button class="bf-sx" data-bf="infox" aria-label="Close">' + XG + '</button></div>' +
        '<div class="bf-sb bf-inf"><div class="pat">' + Fx.pat + '</div><p>' + Fx.how + '</p><div class="wv"></div><p class="wk">Up as you breathe in, flat while you hold, down as you breathe out.</p>' +
        '<h5>How it works</h5><div class="steps">' + Fx.steps.map(function (x) { return '<div class="st"><b>' + x[0] + '</b><span>' + x[1] + '</span></div>'; }).join("") + '</div>' +
        '<h5>Why it helps</h5><p>' + Fx.line + good + '</p><button class="md-save" data-bf="infox">Got it</button></div>';
      var wv = lsheet.querySelector(".wv"); if (wv && it && BLIB.wave) wv.replaceWith(BLIB.wave(it)); else if (wv) { wv.nextSibling.remove(); wv.remove(); }
      el.classList.add("len");
    }
    function lenClose() { el.classList.remove("len"); }

    el.addEventListener("click", function (e) {
      var m = e.target.closest("[data-bfm]");
      if (m) { F.lenPick = +m.dataset.bfm; [].forEach.call(lsheet.querySelectorAll("[data-bfm]"), function (x) { var on = +x.dataset.bfm === F.lenPick; x.classList.toggle("on", on); x.setAttribute("aria-checked", on); }); lsheet.querySelector("[data-bf=lenok]").textContent = useL(F.lenPick); return; }
      var b = e.target.closest("[data-bf]"); if (!b) return; var a = b.dataset.bf;
      if (a === "go") return start();
      if (a === "snd") { B.sound = !B.sound; if (B.sound) prime(); b.setAttribute("aria-pressed", B.sound); b.setAttribute("aria-label", B.sound ? "Sound on" : "Sound off"); b.innerHTML = B.sound ? SND.on : SND.off; return; }
      if (a === "pause") { clearInterval(F.t); F.state = "paused"; buttons(); return paint(); }
      if (a === "resume") { F.state = "run"; buttons(); return loop(); }
      if (a === "end") return askStop();
      if (a === "len") return lenOpen();
      if (a === "info") return infoOpen();
      if (a === "infox") { lenClose(); if (F.was === "run") { F.state = "run"; buttons(); loop(); } F.was = ""; return; }
      if (a === "lenx") { if (F.ask) { lenClose(); F.ask = false; if (F.was !== "run") return; F.state = "run"; buttons(); return loop(); } return lenClose(); }   /* dismissing the question goes back to where they were */
      if (a === "lenok") { F.len = F.lenPick; if (F.S) { F.S.total = target(); F.S.fin = F.S.el >= F.S.total; } else buttons(); lenClose(); paint(); MD.toast(F.len < 0 ? "Session set to no time limit." : "Session set to " + F.len + " min."); return; }
      if (a === "savexit") { lenClose(); F.ask = false; credit(Math.floor(F.S.el / 60) * 60); F.S = null; F.state = ""; return close(); }   /* the sheet said it, so no toast */
      if (a === "close" && (F.state === "run" || F.state === "paused") && F.S) return askStop();   /* begun: pause and ask before leaving */
      if (a === "keep") { lenClose(); F.ask = false; F.state = "run"; buttons(); return loop(); }
      if (a === "leave") { lenClose(); F.ask = false; F.S = null; F.state = ""; return close(); }   /* under a minute: nothing counts */
      if (a === "again") { F.S = null; F.state = ""; return start(); }   /* a fresh session, same exercise and length */
      if (a === "close") { var wasDone = F.state === "done", mins = wasDone ? Math.round(F.S.total / 60) : 0; if (wasDone) F.S = null; close(); if (wasDone) { F.state = ""; MD.toast(MD.P.br[B.i].n + " done. " + calm(mins) + "."); } }
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && el.classList.contains("on")) { if (el.classList.contains("len")) el.querySelector(".bf-scrim").click(); else if ((F.state === "run" || F.state === "paused") && F.S) askStop(); else close(); } });
    B.play = function (i, fresh) { if (fresh) { F.S = null; F.state = ""; } open(i); };   /* the row, its tick sheet's Start breathing, and Breathe again */
    /* doc-only URL hook for v7/mind-rhythm.html; nothing here runs without it. ?bfstate= opens the player in a state:
       len (the length sheet), lenfree (No time limit picked), run, free (no time limit, counting up), tick (running from 0:55,
       the row ticks at 1:00), paused, ask (X or End at 2 min: "2 min saved"), askshort (under a minute: "Stop breathing?"),
       done, saved (2 min saved and closed). early and short, from before 16 Nov, now show ask and askshort.
       ?bfel= sets the seconds already breathed (130 by default) */
    var BFS = Q.get("bfstate");
    if (BFS) setTimeout(function () {
      open(0);
      if (BFS === "len") return lenOpen();
      if (BFS === "lenfree") { lenOpen(); return lsheet.querySelector('[data-bfm="-1"]').click(); }
      if (BFS === "free") { F.len = -1; buttons(); }
      F.S = mkS(/^(short|askshort)$/.test(BFS) ? 40 : BFS === "tick" ? 55 : +Q.get("bfel") || 130); F.S.total = target(); autoTick();
      if (BFS === "run" || BFS === "free" || BFS === "tick") { F.state = "run"; buttons(); return loop(); }
      if (/^(ask|askshort|early|short)$/.test(BFS)) { F.state = "run"; buttons(); return askStop(); }
      if (BFS === "done") return done();
      if (BFS === "saved") { credit(Math.floor(F.S.el / 60) * 60); F.S = null; F.state = ""; close(); return; }
      F.state = "paused"; buttons(); paint();
    }, 1000);

    /* ---------- styles ---------- */
    var css = document.createElement("style");
    css.textContent = [
      "html.bf-lock,html.bf-lock body{overflow:hidden}",
      ".bf{position:fixed;top:0;bottom:0;left:50%;width:100%;max-width:390px;transform:translate(-50%,0);z-index:300;overflow:hidden;opacity:0;visibility:hidden;transition:opacity .5s cubic-bezier(.4,0,.2,1),visibility 0s .5s;font-family:Roboto,sans-serif;color:" + INK + "}",
      ".bf.on{opacity:1;visibility:visible;transition:opacity .5s cubic-bezier(.4,0,.2,1)}",
      ".bf:not(.on){pointer-events:none}",   /* fading out: a tap goes to the row under it */
      ".bf-bg{position:absolute;inset:0}",
      ".bf-top{position:absolute;top:44px;left:0;right:0;height:56px;display:flex;align-items:center;gap:8px;padding:0 16px;z-index:5}",
      ".bf-x{width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,255,255,.7);color:" + INK + ";display:grid;place-items:center;cursor:pointer}.bf-x svg{width:20px;height:20px}",
      ".bf-ti{flex:1;text-align:center;font:500 14px/20px Roboto;opacity:.85}",
      ".bf-ib{position:relative;display:inline-flex;align-items:center;gap:6px;border:0;background:none;padding:0;font:inherit;color:inherit;cursor:pointer}.bf-ib svg{width:16px;height:16px;opacity:.8}.bf-ib::after{content:'';position:absolute;inset:-12px -8px}",
      ".bf-inf .pat{font:600 20px/26px Roboto;color:#A68A2D;margin-bottom:4px}.bf-inf h5{font:600 14px/20px Roboto;color:#101828;margin:16px 0 8px}.bf-inf .blw{margin-top:4px}.bf-inf .wk{font:400 12px/16px Roboto;color:#667085;margin:4px 0 0}" +
      ".bf-inf .steps{border:1px solid #EAECF0;border-radius:12px;margin-bottom:4px}.bf-inf .st{display:flex;gap:12px;padding:12px 16px;font:400 14px/20px Roboto;color:#344054}.bf-inf .st+.st{border-top:1px dashed #EAECF0}.bf-inf .st b{min-width:32px;font-weight:600;color:#A68A2D}.bf-inf .md-save{margin-top:8px}",
      ".bf-tl{min-width:44px;height:36px;padding:0 8px 0 12px;border-radius:999px;border:1px solid rgba(92,78,31,.16);background:rgba(255,255,255,.7);color:" + INK + ";display:inline-flex;align-items:center;gap:2px;font:600 13px Roboto;font-variant-numeric:tabular-nums;cursor:pointer;position:relative}",
      ".bf-tl::after{content:'';position:absolute;left:50%;top:50%;width:max(100%,44px);height:44px;transform:translate(-50%,-50%)}.bf-tl svg{width:16px;height:16px}",
      ".bf-tl.lock{border-color:transparent;background:transparent;padding:0 4px;cursor:default}.bf-tl.lock::after{display:none}",
      /* one template for every exercise and state: top bar, the visual and its words centred together between the bar and the actions (never higher than before), actions pinned to the bottom */
      ".bf-stage{position:absolute;left:50%;top:max(108px,calc(50% - 234px));width:300px;height:300px;transform:translateX(-50%);z-index:2;overflow:visible}",
      ".bf-fin{position:absolute;left:50%;top:50%;width:320px;height:360px;transform:translate(-50%,-50%) scale(.9375)}",
      ".bf-txt{position:absolute;left:0;right:0;top:max(424px,calc(50% + 82px));height:124px;display:flex;flex-direction:column;align-items:center;text-align:center;z-index:4;pointer-events:none}",
      ".bf-word{font:300 32px/38px Roboto;letter-spacing:.3px;padding:0 24px;max-height:76px;overflow:hidden}.bf.s-ready .bf-word,.bf.s-early .bf-word{font-size:26px;line-height:32px}.bf-cnt{margin-top:6px;font:500 15px/20px Roboto;font-variant-numeric:tabular-nums;color:#A68A2D;min-height:20px;padding:0 48px}",
      ".bf-bot{position:absolute;left:0;right:0;bottom:0;padding:0 24px calc(40px + env(safe-area-inset-bottom,0px));display:flex;gap:12px;z-index:5}",
      ".bf-bot>button{flex:1;width:auto}.bf-bot.stack{flex-direction:column}.bf-bot.stack>button{flex:none;width:100%}",
      /* the final player's controls: a square sound button, then Pause (or End and Resume) with its icon */
      ".bf-bot>.bf-snd{flex:0 0 48px;height:48px;border-radius:6px;border:1px solid #D0D5DD;background:#fff;color:#344054;display:grid;place-items:center;cursor:pointer;padding:0}.bf-snd svg{width:20px;height:20px}.bf-snd[aria-pressed=false]{color:#98A2B3}",
      ".bf-ask{display:flex;flex-direction:column;gap:12px}.bf-ask>button{width:100%}",
      ".l1 .bf-bg{background:linear-gradient(180deg," + T25 + " 0%,#FFFFFF 46%,#F5F8FF 100%)}",
      /* the length sheet */
      ".bf-scrim{position:absolute;inset:0;background:rgba(0,0,0,.4);opacity:0;pointer-events:none;transition:opacity .3s ease-out;z-index:8}",
      ".bf-sheet{position:absolute;left:0;right:0;bottom:0;max-height:90%;display:flex;flex-direction:column;background:#fff;border-radius:16px 16px 0 0;transform:translateY(100%);transition:transform .3s ease-out;z-index:9;color:#101828}",
      ".bf.len .bf-scrim{opacity:1;pointer-events:auto}.bf.len .bf-sheet{transform:none}",
      ".bf-sh{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 16px 8px}.bf-sh h4{margin:0;font:600 18px/24px Roboto}",
      ".bf-sx{width:44px;height:44px;margin-right:-6px;border:0;background:none;padding:0;display:grid;place-items:center;cursor:pointer}",
      ".bf-sb{overflow-y:auto;padding:0 16px calc(24px + env(safe-area-inset-bottom,0px))}.bf-sb p{margin:0 0 12px;font-size:14px;line-height:21px;color:#475467}",
      ".bf-opts{display:flex;flex-direction:column;gap:8px;margin-bottom:20px}",
      ".bf-opt{display:flex;align-items:center;gap:12px;min-height:52px;padding:0 16px;border:1px solid #E4E7EC;border-radius:12px;background:#fff;font:inherit;text-align:left;cursor:pointer}",
      ".bf-opt b{flex:1;font:600 15px Roboto;color:#101828}.bf-opt b small{display:block;margin-top:2px;font:400 13px/18px Roboto;color:#667085}.bf-opt:has(small){padding-top:8px;padding-bottom:8px}.bf-opt.on{border-color:#299D6B;background:#F3FCF8}",
      ".bf-rd{width:20px;height:20px;border-radius:50%;border:1.5px solid #D0D5DD;flex:0 0 auto;position:relative}.bf-opt.on .bf-rd{border-color:#299D6B}.bf-opt.on .bf-rd::after{content:'';position:absolute;inset:4px;border-radius:50%;background:#299D6B}",
      ".bf-tag{font:600 12px Roboto;color:#2A805A;background:#E6FAF1;border-radius:999px;padding:3px 10px}",
      "@media (prefers-reduced-motion: reduce){.bf,.bf-sheet,.bf-scrim{transition-duration:.01s!important}}"
    ].join("");
    document.head.appendChild(css);
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
