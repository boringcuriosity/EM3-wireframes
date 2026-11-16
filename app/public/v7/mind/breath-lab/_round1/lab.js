/* Breathing lab: one clock, one phone frame, many visual variants.
   Each technique file calls LAB.add(tech, variant). A variant is:
     { id: "belly-a", name: "Short name", note: "One line: the idea and why it reads at a glance",
       ref: "Optional: the app or reference it learned from",
       bg: "optional CSS background for the whole phone",
       dark: false,                      // true if the phone is a night scene (word and count turn light)
       build: function (stage, L) { ... return state },   // stage is a 320 x 360 box; draw inside it only
       frame: function (state, p) { ... } }                // called every animation frame
   p, the breath right now:
     k     "in" | "hold" | "out"
     t     0..1, how far through this phase (linear)
     e     0..1, how full the lungs are (eased sine: rises on in, stays on hold, falls on out)
     sec   seconds into this phase, dur its length, left = whole seconds left (the count shown)
     word  "Breathe in" | "Hold" | "Breathe out" | "Hum", sub its short line
     idx   phase index in the cycle, cycle the cycle number from 0, time seconds since start
     next  the next phase's k, prev the previous phase's k
     reduced  true when reduced motion is on: show still end states, change only on phase change
   L, helpers: L.ease (sine in-out), L.lerp, L.clamp, L.mix(hexA, hexB, f) -> rgb string, L.C the palette, L.svg(tag, attrs) */
(function () {
  var C = {
    gold900: "#5C4E1F", gold700: "#A68A2D", gold600: "#CDA935", gold500: "#E7C144", gold400: "#F3D161", gold300: "#FDE8A4", gold100: "#FFF8E0", gold50: "#FFFDF5",
    ink: "#5C4E1F", g900: "#101828", g700: "#344054", g500: "#667085", g300: "#D0D5DD", g100: "#F2F4F7", white: "#FFFFFF",
    /* the wider palette: only the score carries the pillar colour, so a visual may use these */
    sky100: "#E0F2FE", sky300: "#7CD4FD", sky500: "#0BA5EC", lav100: "#EBE9FE", lav300: "#BDB4FE", lav500: "#7A5AF8",
    sage100: "#DCFAE6", sage300: "#75E0A7", sage500: "#17B26A", peach100: "#FEF0C7", peach300: "#FEC84B", rose100: "#FFE4E8", rose300: "#FEA3B4",
    night: "#101828", night2: "#1D2939"
  };
  var PAT = {
    coherent: { name: "Coherent Breathing (5-5)", seq: [["in", 5, "Breathe in", "Through your nose"], ["out", 5, "Breathe out", "Slow and even"]] },
    sleep: { name: "4-7-8 Breathing", seq: [["in", 4, "Breathe in", "Through your nose"], ["hold", 7, "Hold", "Keep still"], ["out", 8, "Breathe out", "Slowly, through your mouth"]] },
    box: { name: "Box Breathing (4-4-4-4)", seq: [["in", 4, "Breathe in", "Through your nose"], ["hold", 4, "Hold", "Keep still"], ["out", 4, "Breathe out", "Through your mouth"], ["hold", 4, "Hold", "Keep still"]] },
    belly: { name: "Belly Breathing", seq: [["in", 4, "Breathe in", "Let your belly rise"], ["out", 6, "Breathe out", "Let it fall"]] },
    hum: { name: "Humming Bee Breath (Bhramari)", seq: [["in", 4, "Breathe in", "Through your nose"], ["out", 7, "Hum", "A soft, low hum"]] },
    exhale: { name: "Extended Exhale (2:1)", seq: [["in", 4, "Breathe in", "Through your nose"], ["out", 8, "Breathe out", "Twice as long"]] },
    pursed: { name: "Pursed Lip Breathing", seq: [["in", 2, "Breathe in", "Through your nose"], ["out", 5, "Breathe out", "Through pursed lips"]] }
  };
  var ease = function (t) { return .5 - Math.cos(Math.PI * Math.max(0, Math.min(1, t))) / 2; };
  var hex = function (h) { h = h.replace("#", ""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
  var L = {
    C: C, ease: ease,
    lerp: function (a, b, f) { return a + (b - a) * f; },
    clamp: function (v, a, b) { return Math.max(a, Math.min(b, v)); },
    mix: function (a, b, f) { var x = hex(a), y = hex(b); return "rgb(" + x.map(function (v, i) { return Math.round(v + (y[i] - v) * f); }).join(",") + ")"; },
    svg: function (tag, at) { var n = document.createElementNS("http://www.w3.org/2000/svg", tag); for (var k in at || {}) n.setAttribute(k, at[k]); return n; }
  };
  var LAB = window.LAB = { L: L, PAT: PAT, V: {}, add: function (tech, v) { (this.V[tech] = this.V[tech] || []).push(v); } };

  /* where a pattern is at time s */
  function at(tech, s) {
    var seq = PAT[tech].seq, cyc = seq.reduce(function (a, x) { return a + x[1]; }, 0), c = Math.floor(s / cyc), r = s - c * cyc, i = 0;
    while (r >= seq[i][1]) { r -= seq[i][1]; i++; }
    var ph = seq[i], t = r / ph[1], prevK = seq[(i + seq.length - 1) % seq.length][0];
    var e = ph[0] === "in" ? ease(t) : ph[0] === "out" ? 1 - ease(t) : (prevK === "in" ? 1 : 0);
    return { k: ph[0], t: t, e: e, sec: r, dur: ph[1], left: Math.max(1, Math.ceil(ph[1] - r)), word: ph[2], sub: ph[3], idx: i, cycle: c, time: s,
      next: seq[(i + 1) % seq.length][0], prev: prevK };
  }
  LAB.at = at;
  var q = new URLSearchParams(location.search).get("at"); if (q != null) LAB.at0 = +q;
  /* a hidden tab gets no animation frames: draw once at load so a frozen review still renders */
  LAB.kick = function () { document.querySelectorAll(".lp").forEach(function (e) { if (e._tick) e._tick(performance.now()); }); };

  var X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1.5"/><rect x="14" y="5" width="4" height="14" rx="1.5"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>';
  var mm = function (s) { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ":" + ("0" + s % 60).slice(-2); };

  /* one phone per variant */
  LAB.phone = function (host, tech, v, opt) {
    opt = opt || {};
    var el = document.createElement("div");
    el.className = "lp" + (v.dark ? " dark" : "");
    if (v.bg) el.style.background = v.bg;
    el.innerHTML = '<div class="lp-top"><span class="lp-x">' + X + '</span><span class="lp-n">' + PAT[tech].name + '</span><span class="lp-tm">5:00</span></div>' +
      '<div class="lp-stage"></div><div class="lp-w"></div><div class="lp-c"></div><div class="lp-s"></div>' +
      '<div class="lp-b"><button class="lp-end">End</button><button class="lp-pp" aria-label="Pause">' + PAUSE + '</button></div>';
    host.appendChild(el);
    var stage = el.querySelector(".lp-stage"), w = el.querySelector(".lp-w"), c = el.querySelector(".lp-c"), s = el.querySelector(".lp-s"), tm = el.querySelector(".lp-tm"), pp = el.querySelector(".lp-pp");
    var st;
    try { st = v.build(stage, L); } catch (e) { stage.textContent = "build failed: " + e.message; console.error(v.id, e); return; }
    var T = 0, last = 0, on = false, paused = false, lastK = "";
    pp.onclick = function () { paused = !paused; pp.innerHTML = paused ? PLAY : PAUSE; pp.setAttribute("aria-label", paused ? "Resume" : "Pause"); };
    el.querySelector(".lp-end").onclick = function () { T = 0; };
    function tick(now) {
      if (on) requestAnimationFrame(tick);
      var dt = last ? Math.min(.1, (now - last) / 1000) : 0; last = now;
      if (!paused) T += dt * (LAB.speed || 1);
      if (LAB.at0 != null) T = LAB.at0;   /* ?at=N: every phone frozen at second N, for review */
      var p = at(tech, T); p.reduced = !!LAB.reduced; p.paused = paused;
      if (p.reduced && p.k === lastK && !opt.force) { /* still: redraw only on phase change */ }
      else { try { v.frame(st, p); } catch (e) { console.error(v.id, e); on = false; } }
      if (p.word !== w.textContent || p.k !== lastK) { w.textContent = p.word; s.textContent = p.sub; }
      lastK = p.k;
      c.textContent = p.left; tm.textContent = mm(300 - T);
    }
    el._tick = tick;
    /* only phones on screen run */
    new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting && !on) { on = true; last = 0; requestAnimationFrame(tick); } else if (!x.isIntersecting) on = false; }); }, { rootMargin: "200px" }).observe(el);
    return el;
  };
})();
