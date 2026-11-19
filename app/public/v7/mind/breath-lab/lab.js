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
    coherent: { name: "Simple Breathing", seq: [["in", 5, "Breathe in", "Through your nose"], ["out", 5, "Breathe out", "Slow and even"]] },
    sleep: { name: "4-7-8 Breathing", seq: [["in", 4, "Breathe in", "Through your nose"], ["hold", 7, "Hold", "Keep still"], ["out", 8, "Breathe out", "Slowly, through your mouth"]] },
    box: { name: "Box Breathing (4-4-4-4)", seq: [["in", 4, "Breathe in", "Through your nose"], ["hold", 4, "Hold", "Keep still"], ["out", 4, "Breathe out", "Through your mouth"], ["hold", 4, "Hold", "Keep still"]] },
    belly: { name: "Belly Breathing", seq: [["in", 4, "Breathe in", "Let your belly rise"], ["out", 6, "Breathe out", "Let it fall"]] },
    hum: { name: "Humming Bee Breath", seq: [["in", 4, "Breathe in", "Through your nose"], ["out", 7, "Hum", "A soft, low hum"]] },
    exhale: { name: "Extended Exhale (2:1)", seq: [["in", 4, "Breathe in", "Through your nose"], ["out", 8, "Breathe out", "Twice as long"]] },
    pursed: { name: "Pursed Lip Breathing", seq: [["in", 2, "Breathe in", "Through your nose"], ["out", 4, "Breathe out", "Through pursed lips"]] }
  };
  /* a quiet 2 s rest after breathing out (18 Nov 2026, the coach found it rushed), 4-7-8 included after its long breath out.
     Not after breathing in (that would be a hold) and not in Box, whose second hold already is one. ?vrest=0 shows the old timing */
  var REST = new URLSearchParams(location.search).get("vrest") !== "1" ? {} : /* ponytail: rest removed 19 Nov (breaks the breathing rhythm); ?vrest=1 previews it */ { coherent: 2, belly: 2, hum: 2, exhale: 2, pursed: 2, sleep: 2 };
  Object.keys(REST).forEach(function (k) { PAT[k].seq.push(["rest", REST[k], "Rest", "Let the breath settle"]); });
  var ease = function (t) { return .5 - Math.cos(Math.PI * Math.max(0, Math.min(1, t))) / 2; };
  var hex = function (h) { h = h.replace("#", ""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
  var L = {
    C: C, ease: ease,
    lerp: function (a, b, f) { return a + (b - a) * f; },
    clamp: function (v, a, b) { return Math.max(a, Math.min(b, v)); },
    mix: function (a, b, f) { var x = hex(a), y = hex(b); return "rgb(" + x.map(function (v, i) { return Math.round(v + (y[i] - v) * f); }).join(",") + ")"; },
    svg: function (tag, at) { var n = document.createElementNS("http://www.w3.org/2000/svg", tag); for (var k in at || {}) n.setAttribute(k, at[k]); return n; }
  };
  /* sound: soft sine cues on each breath, as the patient player (mind/variants/breath.js): a rising tone to breathe in,
     a falling one to breathe out, a soft tick on a hold, a bright one at the end. Off until the person turns it on. */
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
  /* the house sound (sounds.js: singing bowl and Breathing Calm), when the page has it */
  function H() { return !LAB.noHouse && window.SOUNDS && window.SOUNDS.house; }
  var LAB = window.LAB = { REST: REST, cue: CUE, prime: prime, L: L, PAT: PAT, V: {}, add: function (tech, v) { (this.V[tech] = this.V[tech] || []).push(v); } };

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
  var SND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5v5h4l5 4v-13l-5 4H4z"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11"/></svg>';
  var MUTE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5v5h4l5 4v-13l-5 4H4z"/><path d="M17 10l4 4M21 10l-4 4"/></svg>';
  /* controls: sound always; one Pause CTA; once paused, End appears beside Resume */
  var css = document.createElement("style");
  css.textContent = ".lp-b button{display:inline-flex;align-items:center;justify-content:center;gap:8px}.lp-b button svg{width:20px;height:20px}" +
    ".lp-snd{flex:0 0 48px;border:1px solid #D0D5DD;background:#fff;color:#344054}.lp-snd[aria-pressed=false]{color:#98A2B3}.lp-end[hidden]{display:none}";
  document.head.appendChild(css);
  var mm = function (s) { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ":" + ("0" + s % 60).slice(-2); };

  /* one phone per variant */
  LAB.phone = function (host, tech, v, opt) {
    /* opt.secs: session length in seconds (0 = no time limit, the clock counts up; unset = the lab's 5:00).
       opt.countdown: a 3, 2, 1 before the first breath. When the time is up the phone rests on Done. */
    opt = opt || {};
    var SECS = opt.secs == null ? 300 : opt.secs;
    var el = document.createElement("div");
    el.className = "lp" + (v.dark ? " dark" : "");
    if (v.bg) el.style.background = v.bg;
    el.innerHTML = '<div class="lp-top"><span class="lp-x">' + X + '</span><span class="lp-n">' + PAT[tech].name + '</span><span class="lp-tm">' + mm(SECS) + '</span></div>' +
      '<div class="lp-stage"></div><div class="lp-w"></div><div class="lp-c"></div><div class="lp-s"></div>' +
      '<div class="lp-b"><button class="lp-snd" aria-label="Sound off" aria-pressed="false">' + MUTE + '</button><button class="lp-end" hidden>End</button><button class="lp-pp">' + PAUSE + 'Pause</button></div>';
    host.appendChild(el);
    var stage = el.querySelector(".lp-stage"), w = el.querySelector(".lp-w"), c = el.querySelector(".lp-c"), s = el.querySelector(".lp-s"), tm = el.querySelector(".lp-tm"), pp = el.querySelector(".lp-pp");
    var st;
    try { st = v.build(stage, L); } catch (e) { stage.textContent = "build failed: " + e.message; console.error(v.id, e); return; }
    var sOn = false, T = opt.countdown ? -3 : 0, last = 0, on = false, paused = false, lastK = "", done = false;
    var end = el.querySelector(".lp-end"), snd = el.querySelector(".lp-snd");
    pp.onclick = function () { paused = !paused; pp.innerHTML = paused ? PLAY + "Resume" : PAUSE + "Pause"; end.hidden = !paused; };
    end.onclick = function () { if (opt.onEnd) return opt.onEnd(); T = 0; paused = false; pp.innerHTML = PAUSE + "Pause"; end.hidden = true; };
    snd.onclick = function () { var on = snd.getAttribute("aria-pressed") !== "true"; sOn = on; if (on) prime(); snd.setAttribute("aria-pressed", on); snd.innerHTML = on ? SND : MUTE; snd.setAttribute("aria-label", on ? "Sound on" : "Sound off"); };
    function tick(now) {
      if (on) requestAnimationFrame(tick);
      var dt = last ? Math.min(.1, (now - last) / 1000) : 0; last = now;
      if (!paused) T += dt * (LAB.speed || 1);
      if (!el.isConnected) { on = false; if (H()) H().music(false); }
      if (LAB.at0 != null) T = LAB.at0;   /* ?at=N: every phone frozen at second N, for review */
      if (SECS && T >= SECS && !done) {   /* time is up: rest on Done, End closes */
        done = true; paused = true; if (sOn) H() ? H().done() : CUE.done(); pp.hidden = true; end.hidden = false; end.textContent = "Done";
        w.textContent = "Well done"; s.textContent = Math.round(SECS / 60) + (SECS >= 120 ? " calm minutes" : " calm minute"); c.textContent = ""; tm.textContent = "0:00";
      }
      if (done) return;
      var hold = T < 0, p = at(tech, hold ? 0 : T); p.reduced = !!LAB.reduced; p.paused = paused || hold;
      if (hold) { p.t = 0; p.e = 0; p.sec = 0; }
      if (p.reduced && p.k === lastK && !opt.force && !hold) { /* still: redraw only on phase change */ }
      else { try { v.frame(st, p); } catch (e) { console.error(v.id, e); on = false; } }
      if (hold) {   /* the 3, 2, 1 before the first breath */
        w.textContent = Math.ceil(-T); s.textContent = "Get comfortable"; c.textContent = ""; lastK = "";
        tm.textContent = mm(SECS || 0); return;
      }
      if (H()) H().music(sOn && !paused && el.isConnected);   /* music while breathing; pause, sound off or closing stops it */
      if (p.k !== lastK && sOn && !paused) { if (H()) H().phase(p.k, LAB.PAT[tech] ? (LAB.PAT[tech].seq.filter(function (x) { return x[0] === p.k; })[0] || [0, 4])[1] : 4, tech === "hum");
        else CUE[p.k] && CUE[p.k](tech === "sleep" || tech === "hum"); }   /* a sound as each part begins */
      if (p.word !== w.textContent || p.k !== lastK) { w.textContent = p.word; s.textContent = p.sub; }
      lastK = p.k;
      c.textContent = p.left; tm.textContent = SECS ? mm(SECS - T) : mm(T);
    }
    el._tick = tick;
    /* for a host that asks before closing (the breathing library): seconds breathed, and pause or resume */
    el._ctl = { t: function () { return Math.max(0, Math.min(T, SECS || T)); }, done: function () { return done; }, paused: function () { return paused; },
      pause: function () { if (!paused && !done) pp.onclick(); }, resume: function () { if (paused && !done) pp.onclick(); } };
    /* only phones on screen run */
    new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting && !on) { on = true; last = 0; requestAnimationFrame(tick); } else if (!x.isIntersecting) on = false; }); }, { rootMargin: "200px" }).observe(el);
    return el;
  };
})();
