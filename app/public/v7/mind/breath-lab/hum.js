/* Humming Bee Breath (Bhramari): in 4 s, hum 7 s. The out-breath is sound, so every variant makes the hum
   visible as a slow, low vibration and keeps the in-breath smooth and still. Classes "bh-", SVG ids "bh" + n. */
(function () {
  var L = LAB.L, C = L.C, uid = 0, TAU = Math.PI * 2;
  var ss = function (a, b, x) { x = L.clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
  var outQ = function (x) { return 1 - (1 - x) * (1 - x); };
  var css = document.createElement("style");
  css.textContent =
    ".bh-cv,.bh-svg{position:absolute;left:0;top:0;width:320px;height:360px;display:block}" +
    ".bh-orb{position:absolute;left:50%;top:50%;width:200px;height:200px;transform:translate(-50%,-50%) scale(.5);will-change:transform}" +
    ".bh-orb svg{position:relative;display:block;filter:drop-shadow(0 14px 26px rgba(166,138,45,.20))}" +
    ".bh-orb i{position:absolute;inset:-22%;border-radius:50%;background:radial-gradient(circle,rgba(253,232,164,.45) 30%,rgba(255,248,224,.18) 54%,rgba(255,248,224,0) 70%)}";
  document.head.appendChild(css);

  function canvas(stage) {
    var c = document.createElement("canvas"), d = Math.min(2, window.devicePixelRatio || 1);
    c.className = "bh-cv"; c.width = 320 * d; c.height = 360 * d; stage.appendChild(c);
    var x = c.getContext("2d"); x.scale(d, d); return x;
  }
  /* a closed ring whose radius ripples like a cymatic plate: two slow standing modes */
  function ringPts(cx, cy, r, a, ph) {
    var pts = [];
    for (var i = 0; i <= 96; i++) {
      var th = i / 96 * TAU, rr = r + a * (.7 * Math.sin(6 * th + ph) + .3 * Math.sin(9 * th - ph * 1.3));
      pts.push([cx + rr * Math.cos(th), cy + rr * Math.sin(th)]);
    }
    return pts;
  }
  function ringD(cx, cy, r, a, ph) {
    return ringPts(cx, cy, r, a, ph).map(function (q, i) { return (i ? "L" : "M") + q[0].toFixed(1) + "," + q[1].toFixed(1); }).join("") + "Z";
  }
  function rgba(h, a) { var v = L.mix(h, h, 0).slice(4, -1); return "rgba(" + v + "," + a.toFixed(3) + ")"; }

  /* the hum rings, shared by the orb and the figure: born every 0.9 s, slowing as they spread, quiet before the next in-breath */
  function humRings(p, T, r0, r1, each) {
    if (p.k !== "out") return;
    var life = 4.2, end = 1 - ss(p.dur - 1.1, p.dur, p.sec), calm = 1 - .55 * p.t;
    for (var i = 0, b = .15; b < p.dur - 2; i++, b += .9) {
      var age = p.sec - b; if (age < 0 || age > life) continue;
      var x = age / life, r = r0 + (r1 - r0) * outQ(x);
      each(r, (1.6 + 1.3 * (1 - x)) * calm, T * .35 + i * 1.7, Math.pow(1 - x, 1.5) * ss(0, .12, x) * end, x);
    }
  }

  /* ---------- A. Ripples of sound: the gold orb hums rings out, the in-breath gathers them back ---------- */
  LAB.add("hum", {
    id: "hum-ripples", name: "Ripples of sound",
    note: "Breathe in and soft dotted rings flow into the gold orb as it fills. Hum and gentle rippled rings ring out from it, like sound on still water, fading to calm.",
    ref: "Cymatics, Apple Mindfulness, WHOOP breath rings",
    build: function (stage) {
      var ctx = canvas(stage), o = document.createElement("div");
      o.className = "bh-orb"; o.innerHTML = "<i></i>" + LAB.pearl(200); stage.appendChild(o);
      return { ctx: ctx, o: o };
    },
    frame: function (s, p) {
      var x = s.ctx, red = p.reduced, T = red ? 0 : p.time, cx = 160, cy = 180;
      var e = red ? (p.k === "in" ? 1 : .2) : p.e;
      var hum = p.k === "out" ? (red ? 1 : ss(0, .08, p.t) * (1 - ss(.8, 1, p.t))) : 0;
      var sc = .46 + .34 * e, R = 100 * sc * .92;
      x.clearRect(0, 0, 320, 360);
      /* a warm field that brightens with the breath */
      var g = x.createRadialGradient(cx, cy, R * .6, cx, cy, 170);
      g.addColorStop(0, rgba(C.gold300, .30 + .22 * e)); g.addColorStop(1, rgba(C.gold100, 0));
      x.fillStyle = g; x.fillRect(0, 0, 320, 360);
      if (p.k === "in") {
        x.lineCap = "round"; x.setLineDash([.5, 7]);
        if (red) { [[R + 26, .45], [R + 52, .25]].forEach(function (q) { x.beginPath(); x.arc(cx, cy, q[0], 0, TAU); x.strokeStyle = rgba(C.gold600, q[1]); x.lineWidth = 2.6; x.stroke(); }); }
        else for (var b = 0; b < p.dur - 1.4; b += .7) {
          var age = p.sec - b; if (age < 0 || age > 1.6) continue;
          var f = L.ease(age / 1.6), r = L.lerp(160, R + 6, f);
          x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.lineDashOffset = age * 10;
          x.strokeStyle = rgba(C.gold600, .6 * Math.sin(Math.PI * f)); x.lineWidth = 2.6; x.stroke();
        }
        x.setLineDash([]);
      } else {
        var draw = function (r, a, ph, al, k) {
          var pts = ringPts(cx, cy, r, a, ph);
          x.beginPath(); pts.forEach(function (q, i) { i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]); }); x.closePath();
          x.fillStyle = rgba(C.gold300, .10 * al); x.fill();
          x.strokeStyle = rgba(C.gold600, .75 * al); x.lineWidth = .8 + 1.4 * (1 - k); x.stroke();
        };
        if (red) [[.12, 1], [.4, .7], [.68, .42]].forEach(function (q) { draw(R + (156 - R) * outQ(q[0]), 3, q[0] * 5, q[1], q[0]); });
        else humRings(p, T, R + 2, 156, draw);
        /* the orb's own skin hums: a halo that swells and settles about once a second */
        var hv = .5 + .5 * Math.sin(T * TAU * .9);
        x.beginPath(); x.arc(cx, cy, R + 6 + 4 * hv * hum, 0, TAU);
        x.strokeStyle = rgba(C.gold400, .35 * hum); x.lineWidth = 6; x.stroke();
      }
      var v = p.k === "out" && !red ? 1 + .012 * hum * Math.sin(T * TAU * .9) : 1;
      s.o.style.transform = "translate(-50%,-50%) scale(" + (sc * v).toFixed(4) + ")";
    }
  });

  /* ---------- B. Bee and lotus, at dusk: the bee rests while you breathe in, and flies, humming, while you hum ---------- */
  LAB.add("hum", {
    id: "hum-bee", name: "Bee and lotus",
    note: "Breathe in while the bee rests and the lotus opens. Hum while it lifts and loops slowly above, wings blurred, leaving soft rings of sound, then lands again.",
    ref: "Bhramari means bee; Calm and Headspace night scenes",
    dark: true,
    bg: "linear-gradient(180deg,#141A33 0%,#252546 38%,#433756 72%,#5E4757 100%)",
    build: function (stage) {
      var u = "bh" + (uid++), S = L.svg, svg = S("svg", { class: "bh-svg", viewBox: "0 0 320 360", "aria-hidden": "true" });
      var defs = S("defs");
      defs.innerHTML =
        '<radialGradient id="' + u + 'g"><stop offset="0" stop-color="#FDE8A4" stop-opacity=".9"/><stop offset=".45" stop-color="#F3D161" stop-opacity=".35"/><stop offset="1" stop-color="#F3D161" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="' + u + 'pb" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#CDA935"/><stop offset=".55" stop-color="#F3D161"/><stop offset="1" stop-color="#FFE4E8"/></linearGradient>' +
        '<linearGradient id="' + u + 'pf" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#E7C144"/><stop offset=".6" stop-color="#FDE8A4"/><stop offset="1" stop-color="#FFF8E0"/></linearGradient>' +
        '<linearGradient id="' + u + 'bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDE8A4"/><stop offset="1" stop-color="#E7C144"/></linearGradient>' +
        '<clipPath id="' + u + 'c"><ellipse rx="11" ry="7.5"/></clipPath>' +
        '<filter id="' + u + 'b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation=".9"/></filter>' +
        '<filter id="' + u + 'gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>';
      svg.appendChild(defs);
      /* stars: fixed, they only breathe their light */
      var stars = [], seed = 7, rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
      for (var i = 0; i < 18; i++) { var st = S("circle", { cx: (rnd() * 300 + 10).toFixed(1), cy: (rnd() * 150 + 6).toFixed(1), r: (.5 + rnd() * .9).toFixed(2), fill: "#FFF8E0" }); st._p = rnd() * TAU; stars.push(st); svg.appendChild(st); }
      svg.appendChild(S("path", { d: "M268 46a16 16 0 1 0 14 24a13 13 0 1 1 -14 -24z", fill: "#FDE8A4", opacity: ".55" }));
      /* still water under the lotus */
      [[300, 70, 5, .22], [306, 104, 6, .14], [313, 136, 7, .08]].forEach(function (w) { svg.appendChild(S("ellipse", { cx: 160, cy: w[0], rx: w[1], ry: w[2], fill: "none", stroke: "#BDB4FE", "stroke-opacity": w[3], "stroke-width": 1.2 })); });
      var glow = S("circle", { cx: 160, cy: 262, r: 70, fill: "url(#" + u + "g)" }); svg.appendChild(glow);
      var petal = function (len, w) { return "M0,0 C" + w + "," + (-len * .35) + " " + (w * .6) + "," + (-len * .86) + " 0," + (-len) + " C" + (-w * .6) + "," + (-len * .86) + " " + (-w) + "," + (-len * .35) + " 0,0Z"; };
      var mk = function (len, w, fill, op) { var n = S("path", { d: petal(len, w), fill: fill, opacity: op, stroke: "#A68A2D", "stroke-opacity": ".25", "stroke-width": .8 }); svg.appendChild(n); return n; };
      var back = [mk(56, 17, "url(#" + u + "pb)", .8), mk(56, 17, "url(#" + u + "pb)", .8), mk(60, 18, "url(#" + u + "pb)", .9), mk(60, 18, "url(#" + u + "pb)", .9)];
      /* hum rings in the air and the trail the bee leaves */
      var arcs = []; for (i = 0; i < 6; i++) { var a = S("circle", { fill: "none", stroke: "#F3D161", "stroke-width": 1.8 }); arcs.push(a); svg.appendChild(a); }
      var trail = []; for (i = 0; i < 26; i++) { var d = S("circle", { r: 1, fill: "#FDE8A4" }); trail.push(d); svg.appendChild(d); }
      /* the bee */
      var bee = S("g"), face = S("g"), wr = S("g", { class: "bh-wr" }), wf = S("g", { class: "bh-wf", filter: "url(#" + u + "b)" });
      wr.innerHTML = '<ellipse cx="-3" cy="-9" rx="9" ry="4.6" transform="rotate(-18 -3 -9)" fill="#FFFFFF" fill-opacity=".7"/><ellipse cx="1" cy="-8" rx="8" ry="4" transform="rotate(-6 1 -8)" fill="#EBE9FE" fill-opacity=".55"/>';
      var blur = []; for (i = 0; i < 3; i++) { var we = S("ellipse", { class: "bh-wb", cx: 0, cy: -11, rx: 4.6, ry: 11, fill: i == 1 ? "#EBE9FE" : "#FFF8E0", "fill-opacity": ".42" }); blur.push(we); wf.appendChild(we); }
      var body = S("g");
      body.innerHTML = '<path d="M-11,0 l-5,1.2 l5,1.6z" fill="#5C4E1F"/><ellipse rx="11" ry="7.5" fill="url(#' + u + 'bd)"/>' +
        '<g clip-path="url(#' + u + 'c)" fill="#5C4E1F"><rect x="-6" y="-9" width="3.6" height="18"/><rect x="1" y="-9" width="3.6" height="18"/></g>' +
        '<circle cx="11" cy="-.5" r="5.2" fill="#5C4E1F"/><circle cx="13" cy="-2" r="1.2" fill="#FFF8E0"/>' +
        '<path d="M12,-5 q2,-6 6,-7 M10,-5 q0,-6 3,-8" stroke="#5C4E1F" stroke-width="1" fill="none" stroke-linecap="round"/>';
      face.appendChild(wf); face.appendChild(body); face.appendChild(wr);
      /* two copies, facing right and left, crossfade when the bee turns, so it never flips or squashes */
      var back2 = face.cloneNode(true); back2.setAttribute("transform", "scale(-1,1)");
      bee.appendChild(face); bee.appendChild(back2); svg.appendChild(bee);
      var front = [mk(40, 15, "url(#" + u + "pf)", 1), mk(50, 16, "url(#" + u + "pf)", .97), mk(50, 16, "url(#" + u + "pf)", .97)];
      stage.appendChild(svg);
      return { stars: stars, glow: glow, back: back, front: front, arcs: arcs, trail: trail, bee: bee, fr: face, fl: back2, wr: bee.querySelectorAll(".bh-wr"), wf: bee.querySelectorAll(".bh-wf"), blur: bee.querySelectorAll(".bh-wb") };
    },
    frame: function (s, p) {
      var red = p.reduced, T = red ? 0 : p.time, bx = 160, by = 266;
      var e = red ? (p.k === "in" ? 1 : .3) : p.e;
      s.stars.forEach(function (st) { st.setAttribute("opacity", (.35 + .3 * Math.sin(T * .6 + st._p)).toFixed(3)); });
      var rot = function (n, a, x, y) { n.setAttribute("transform", "translate(" + x + "," + y + ") rotate(" + a.toFixed(2) + ")"); };
      var o1 = 34 + 30 * e, o2 = 12 + 16 * e, o3 = 16 + 18 * e;
      rot(s.back[0], -o1, bx, by); rot(s.back[1], o1, bx, by); rot(s.back[2], -o2, bx, by); rot(s.back[3], o2, bx, by);
      rot(s.front[0], 0, bx, by + 4); rot(s.front[1], -o3, bx, by + 4); rot(s.front[2], o3, bx, by + 4);
      s.glow.setAttribute("opacity", (.25 + .65 * e).toFixed(3)); s.glow.setAttribute("r", (54 + 26 * e).toFixed(1));
      /* where the bee is at a moment t of the hum: lifts, loops a slow figure of eight, lands */
      var rest = [bx, by - 46];
      var lift = function (t) { return ss(0, .16, t) * (1 - ss(.82, 1, t)); };
      var pos = function (t) { var l = lift(t), lx = 160 + 74 * Math.sin(TAU * t), ly = 150 - 20 * Math.sin(2 * TAU * t) + 4 * Math.sin(T * TAU * .45);
        return [L.lerp(rest[0], lx, l), L.lerp(rest[1], ly, l)]; };
      var t = p.k === "out" ? (red ? .25 : p.t) : 0, P = p.k === "out" ? pos(t) : rest, fl = p.k === "out" ? (red ? 1 : lift(t)) : 0;
      if (red && p.k === "out") P = [214, 150];
      var q = pos(Math.min(1, t + .01)), vx = red ? 30 : (q[0] - P[0]) * 100, vy = red ? 0 : (q[1] - P[1]) * 100;
      var sx = p.k === "out" ? L.lerp(1, Math.tanh(vx / 120), ss(0, .4, fl)) : 1, fr = ss(-.35, .35, sx);
      var tilt = p.k === "out" ? L.clamp(vy * .08, -12, 12) * sx : -6;
      s.bee.setAttribute("transform", "translate(" + P[0].toFixed(2) + "," + P[1].toFixed(2) + ") scale(1.75) rotate(" + tilt.toFixed(2) + ")");
      /* wings: folded and still at rest, a soft blur while humming (a slow sweep, never a flicker) */
      s.fr.setAttribute("opacity", fr.toFixed(3)); s.fl.setAttribute("opacity", (1 - fr).toFixed(3));
      s.wr.forEach(function (n) { n.setAttribute("opacity", (1 - fl).toFixed(3)); }); s.wf.forEach(function (n) { n.setAttribute("opacity", fl.toFixed(3)); });
      var sw = 10 * Math.sin(T * TAU * .7);
      s.blur.forEach(function (w, j) { var i = j % 3, a = -46 + i * 26 + sw; w.setAttribute("transform", "rotate(" + a.toFixed(1) + ")"); });
      /* trail and rings of sound */
      s.trail.forEach(function (d, k) {
        var tk = t - (k + 1) * .011, on = p.k === "out" && tk > 0 && !red;
        if (!on) { d.setAttribute("opacity", 0); return; }
        var Q = pos(tk), f = 1 - k / s.trail.length;
        d.setAttribute("cx", Q[0].toFixed(1)); d.setAttribute("cy", Q[1].toFixed(1)); d.setAttribute("r", (.5 + 1.5 * f).toFixed(2));
        d.setAttribute("opacity", (.7 * f * lift(tk) * (1 - ss(.85, 1, t))).toFixed(3));
      });
      s.arcs.forEach(function (a, i) {
        var b = .7 + i * .95, age = p.sec - b, life = 2.6;
        if (red && p.k === "out") { if (i > 2) { a.setAttribute("opacity", 0); return; } a.setAttribute("cx", P[0]); a.setAttribute("cy", P[1]); a.setAttribute("r", 22 + i * 14); a.setAttribute("opacity", (.5 - i * .15).toFixed(2)); return; }
        if (p.k !== "out" || age < 0 || age > life || b > p.dur - 1.6) { a.setAttribute("opacity", 0); return; }
        var B = pos(b / p.dur), x = age / life;
        a.setAttribute("cx", B[0].toFixed(1)); a.setAttribute("cy", B[1].toFixed(1)); a.setAttribute("r", (14 + 40 * outQ(x)).toFixed(1));
        a.setAttribute("opacity", (.75 * Math.pow(1 - x, 1.4) * ss(0, .1, x)).toFixed(3));
      });
    }
  });

  /* ---------- C. Hum line, at night: a smooth rise for the in-breath, a low, slow vibration for the hum ---------- */
  LAB.add("hum", {
    id: "hum-wave", name: "The hum line",
    note: "Breathe in and a smooth gold line rises like a hill. Hum and it sinks while it vibrates slowly, like a plucked string, three soft strands settling to a still line.",
    ref: "Siri and Voice Memos waveforms, Endel, a vibrating string",
    dark: true,
    bg: "linear-gradient(180deg,#0E1325 0%,#1A1F3A 55%,#2A2542 100%)",
    build: function (stage) {
      var ctx = canvas(stage), seed = 3, rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }, st = [];
      for (var i = 0; i < 20; i++) st.push([rnd() * 320, rnd() * 140 + 4, .4 + rnd() * .8, rnd() * TAU]);
      return { ctx: ctx, st: st };
    },
    frame: function (s, p) {
      var x = s.ctx, red = p.reduced, T = red ? 0 : p.time, x0 = 18, x1 = 302, cy = 236, H = 92;
      var e = red ? (p.k === "in" ? 1 : .45) : p.e;
      var A = p.k === "out" ? (red ? 13 : 26 * ss(0, .1, p.t) * (1 - ss(.35, 1, p.t))) : 0;
      x.clearRect(0, 0, 320, 360);
      s.st.forEach(function (q) { x.fillStyle = "rgba(255,248,224," + (.25 + .25 * Math.sin(T * .5 + q[3])).toFixed(3) + ")"; x.beginPath(); x.arc(q[0], q[1], q[2], 0, TAU); x.fill(); });
      var base = function (X) { var g = (X - 160) / 66; return cy - H * e * Math.exp(-g * g); };
      var win = function (X) { return Math.pow(Math.sin(Math.PI * (X - x0) / (x1 - x0)), 1.6); };
      var line = function (n, ph, sp, amp) { var pts = []; for (var X = x0; X <= x1; X += 3) { var u = (X - x0) / (x1 - x0);
        pts.push([X, base(X) - amp * win(X) * Math.sin(n * Math.PI * u + ph) * Math.cos(T * TAU * sp + ph * 2)]); } return pts; };
      var stroke = function (pts, col, w) { x.beginPath(); pts.forEach(function (q, i) { i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]); }); x.strokeStyle = col; x.lineWidth = w; x.stroke(); };
      /* light pooled under the hill */
      var main = line(5, .4, .45, A * .8), g = x.createLinearGradient(0, cy - H, 0, cy);
      g.addColorStop(0, "rgba(243,209,97,.30)"); g.addColorStop(1, "rgba(243,209,97,.02)");
      x.beginPath(); main.forEach(function (q, i) { i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]); }); x.lineTo(x1, cy); x.lineTo(x0, cy); x.closePath(); x.fillStyle = g; x.fill();
      x.lineCap = "round"; x.lineJoin = "round";
      x.setLineDash([1, 7]); stroke([[x0 - 10, cy + 1], [x1 + 10, cy + 1]], "rgba(253,232,164,.18)", 1.4); x.setLineDash([]);
      /* the strands only appear when there is sound */
      var k = L.clamp(A / 12, 0, 1);
      x.globalCompositeOperation = "lighter";
      stroke(line(3, 1.9, .35, A), "rgba(189,180,254," + (.7 * k).toFixed(3) + ")", 1.6);
      stroke(line(7, 3.1, .55, A * .6), "rgba(254,163,180," + (.6 * k).toFixed(3) + ")", 1.4);
      x.globalCompositeOperation = "source-over";
      x.shadowColor = "rgba(243,209,97,.7)"; x.shadowBlur = 12;
      stroke(main, "#F3D161", 2.4); x.shadowBlur = 0;
      /* a small sun riding the top of the hill: the one place to look */
      var top = main[Math.round((160 - x0) / 3)], r = 7 + 3 * e, sg = x.createRadialGradient(top[0], top[1], 0, top[0], top[1], r * 4);
      sg.addColorStop(0, "rgba(253,232,164,.55)"); sg.addColorStop(1, "rgba(253,232,164,0)");
      x.fillStyle = sg; x.beginPath(); x.arc(top[0], top[1], r * 4, 0, TAU); x.fill();
      x.fillStyle = "#FFF8E0"; x.beginPath(); x.arc(top[0], top[1], r, 0, TAU); x.fill();
    }
  });

  /* ---------- D. Seated, hands to ears: the posture itself, with the hum ringing out around the head ---------- */
  LAB.add("hum", {
    id: "hum-figure", name: "Hands to ears",
    note: "A calm seated figure shows the posture: fingers resting on the ears. Breathe in as the light behind them grows; hum as soft rings ripple out from the head.",
    ref: "Shanmukhi mudra, Apple Fitness and Oak figure illustration",
    build: function (stage) {
      var u = "bh" + (uid++), S = L.svg, svg = S("svg", { class: "bh-svg", viewBox: "0 0 320 360", "aria-hidden": "true" });
      svg.innerHTML = '<defs><radialGradient id="' + u + 'h"><stop offset="0" stop-color="#FDE8A4" stop-opacity=".95"/><stop offset=".6" stop-color="#FFF8E0" stop-opacity=".7"/><stop offset="1" stop-color="#FFF8E0" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="' + u + 'f" x1="0" y1="80" x2="0" y2="290" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#CDA935"/><stop offset="1" stop-color="#A68A2D"/></linearGradient></defs>';
      var halo = S("circle", { cx: 160, cy: 176, r: 120, fill: "url(#" + u + "h)" }); svg.appendChild(halo);
      var rings = []; for (var i = 0; i < 6; i++) { var r = S("path", { fill: "#FDE8A4", "fill-opacity": 0, stroke: "#CDA935", "stroke-width": 1.6 }); rings.push(r); svg.appendChild(r); }
      svg.appendChild(S("ellipse", { cx: 160, cy: 284, rx: 112, ry: 9, fill: "#FDE8A4", opacity: ".7" }));
      var fig = S("g", { fill: "url(#" + u + "f)" });
      fig.innerHTML =
        '<path d="M98,266 C98,244 132,237 160,240 C188,237 222,244 222,266 C222,279 196,283 160,280 C124,283 98,279 98,266Z"/>' +
        '<path d="M132,156 C132,149 144,145 160,145 C176,145 188,149 188,156 C188,178 186,196 187,214 C188,228 194,236 194,244 C194,250 178,252 160,252 C142,252 126,250 126,244 C126,236 132,228 133,214 C134,196 132,178 132,156Z"/>' +
        '<rect x="154" y="126" width="12" height="24" rx="5"/>' +
        '<circle cx="160" cy="88" r="7"/><circle cx="160" cy="111" r="19"/>' +
        '<g fill="none" stroke="url(#' + u + 'f)" stroke-width="10.5" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M140,155 C124,155 112,152 103,145 C110,134 124,120 139,113"/><path d="M180,155 C196,155 208,152 217,145 C210,134 196,120 181,113"/></g>' +
        '<ellipse cx="140" cy="111" rx="5.5" ry="7.5"/><ellipse cx="180" cy="111" rx="5.5" ry="7.5"/>' +
        '<path d="M151,112 q3.5,2.6 7,0 M162,112 q3.5,2.6 7,0" stroke="#FFF8E0" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".9"/>';
      svg.appendChild(fig); stage.appendChild(svg);
      return { halo: halo, rings: rings, fig: fig };
    },
    frame: function (s, p) {
      var red = p.reduced, T = red ? 0 : p.time, e = red ? (p.k === "in" ? 1 : .25) : p.e, hx = 160, hy = 111;
      s.halo.setAttribute("r", (78 + 62 * e).toFixed(1)); s.halo.setAttribute("opacity", (.55 + .45 * e).toFixed(3));
      /* the body rises a touch with the breath, from the hips */
      s.fig.setAttribute("transform", "translate(160 280) scale(" + (1 + .022 * e).toFixed(4) + ") translate(-160 -280)");
      var n = 0, put = function (r, a, ph, al) { var el = s.rings[n++]; if (!el) return; el.setAttribute("d", ringD(hx, hy, r, a, ph)); el.setAttribute("opacity", al.toFixed(3)); el.setAttribute("fill-opacity", (.18 * al).toFixed(3)); };
      if (p.k === "out") {
        if (red) [[.1, .9], [.38, .6], [.66, .35]].forEach(function (q) { put(34 + 120 * outQ(q[0]), 2.6, q[0] * 5, q[1]); });
        else humRings(p, T, 32, 156, put);
      }
      for (; n < s.rings.length; n++) s.rings[n].setAttribute("opacity", 0);
    }
  });
})();
