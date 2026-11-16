/* Extended Exhale (2:1): in 4 s, out 8 s. Three ways to make the long out-breath felt.
   Class prefix be-, SVG ids be-*. */
(function () {
  if (!window.LAB) return;
  var css = document.createElement("style");
  css.textContent =
    ".be-svg{position:absolute;inset:0;width:320px;height:360px;overflow:visible}" +
    ".be-orb{position:absolute;left:160px;top:180px;width:200px;height:200px;transform:translate(-50%,-50%) scale(.56);will-change:transform}" +
    ".be-orb svg{position:relative;display:block;filter:drop-shadow(0 16px 28px rgba(166,138,45,.18))}" +
    ".be-orb i{position:absolute;inset:-24%;border-radius:50%;background:radial-gradient(circle,rgba(253,232,164,.42) 30%,rgba(255,248,224,.2) 52%,rgba(255,248,224,0) 70%)}" +
    ".be-rider{position:absolute;left:0;top:0;width:44px;height:44px;margin:-22px 0 0 -22px;will-change:transform}" +
    ".be-rider svg{position:relative;display:block;filter:drop-shadow(0 6px 10px rgba(166,138,45,.28))}" +
    ".be-rider i{position:absolute;inset:-70%;border-radius:50%;background:radial-gradient(circle,rgba(253,232,164,.55) 22%,rgba(255,248,224,.22) 48%,rgba(255,248,224,0) 70%)}" +
    ".be-lbl{font:600 11px/14px Roboto,sans-serif;letter-spacing:1px;text-transform:uppercase;fill:#A68A2D}";
  document.head.appendChild(css);

  var L = LAB.L, C = L.C, ease = L.ease, clamp = L.clamp, lerp = L.lerp;
  var uid = 0;
  function still(p) { return p.reduced ? { E: p.k === "out" ? 0 : 1, T: 1 } : { E: p.e, T: p.t }; }
  /* angle in degrees, 0 at the top, clockwise */
  function pt(cx, cy, r, a) { a = a * Math.PI / 180; return [cx + r * Math.sin(a), cy - r * Math.cos(a)]; }
  function arc(cx, cy, r, a0, a1) {
    if (a1 - a0 < .05) a1 = a0 + .05;
    var p0 = pt(cx, cy, r, a0), p1 = pt(cx, cy, r, a1);
    return "M" + p0[0].toFixed(2) + " " + p0[1].toFixed(2) + "A" + r + " " + r + " 0 " + (a1 - a0 > 180 ? 1 : 0) + " 1 " + p1[0].toFixed(2) + " " + p1[1].toFixed(2);
  }
  function orb(stage) {
    var o = document.createElement("div"); o.className = "be-orb";
    o.innerHTML = "<i></i>" + LAB.pearl(200); stage.appendChild(o); return o;
  }

  /* 1. The orb with a breath clock: a short in-arc and a long out-arc around it */
  LAB.add("exhale", {
    id: "exhale-clock", name: "Orb with breath clock",
    note: "Today's orb, inside a ring cut into a short in-arc and an out-arc twice as long. A bead walks the ring, so you can see the out-breath still has room to go.",
    ref: "Breathwrk's phase ring and Oura's session ring, around the Rhythm orb",
    build: function (stage) {
      var cx = 160, cy = 180, r = 134, G = 5;
      var s = L.svg("svg", { class: "be-svg", viewBox: "0 0 320 360" });
      var d = L.svg("defs");
      var f = L.svg("filter", { id: "be-glow", x: "-100%", y: "-100%", width: "300%", height: "300%" });
      f.appendChild(L.svg("feGaussianBlur", { stdDeviation: "3.5" }));
      d.appendChild(f); s.appendChild(d);
      var segs = [[G, 120 - G], [120 + G, 360 - G]];
      var tracks = segs.map(function (g) {
        return s.appendChild(L.svg("path", { d: arc(cx, cy, r, g[0], g[1]), fill: "none", stroke: C.gold300, "stroke-width": 6, "stroke-linecap": "round", opacity: .55 }));
      });
      var done = s.appendChild(L.svg("path", { d: arc(cx, cy, r, segs[0][0], segs[0][1]), fill: "none", stroke: C.gold400, "stroke-width": 6, "stroke-linecap": "round", opacity: 0 }));
      var fill = s.appendChild(L.svg("path", { fill: "none", stroke: C.gold500, "stroke-width": 6, "stroke-linecap": "round" }));
      var halo = s.appendChild(L.svg("circle", { r: 9, fill: C.gold400, opacity: .55, filter: "url(#be-glow)" }));
      var bead = s.appendChild(L.svg("circle", { r: 6, fill: "#fff", stroke: C.gold600, "stroke-width": 2.5 }));
      stage.appendChild(s);
      return { cx: cx, cy: cy, r: r, segs: segs, tracks: tracks, done: done, fill: fill, bead: bead, halo: halo, o: orb(stage) };
    },
    frame: function (s, p) {
      var v = still(p), i = p.k === "in" ? 0 : 1, g = s.segs[i];
      var a = i === 0 ? 120 * v.T : 120 + 240 * v.T;
      var head = clamp(a, g[0], g[1]);
      s.fill.setAttribute("d", arc(s.cx, s.cy, s.r, g[0], head));
      s.fill.setAttribute("opacity", a < g[0] ? 0 : 1);
      s.tracks[i].setAttribute("opacity", .8); s.tracks[1 - i].setAttribute("opacity", .5);
      /* the in-arc stays lit through the out-breath, so the longer road ahead reads at once */
      s.done.setAttribute("opacity", i === 1 ? (p.reduced ? .55 : .55 * (1 - ease(clamp((v.T - .85) / .15, 0, 1)))).toFixed(3) : 0);
      var b = pt(s.cx, s.cy, s.r, a % 360);
      s.bead.setAttribute("cx", b[0]); s.bead.setAttribute("cy", b[1]);
      s.halo.setAttribute("cx", b[0]); s.halo.setAttribute("cy", b[1]);
      s.o.style.transform = "translate(-50%,-50%) scale(" + (.56 + .4 * v.E).toFixed(4) + ")";
    }
  });

  /* 2. The breath as a path: a quick climb, then a long gentle slope you can see ahead */
  LAB.add("exhale", {
    id: "exhale-path", name: "Breath path",
    note: "The breath drawn as a hill: a short climb and a long, gentle slope down. The gold pearl rides it, and the slope ahead shows how much out-breath is left.",
    ref: "Othership and Prana Breath's breathing graph, ridden by the Rhythm pearl",
    build: function (stage) {
      var n = ++uid, s = L.svg("svg", { class: "be-svg", viewBox: "0 0 320 360" }), d = L.svg("defs");
      var lg = L.svg("linearGradient", { id: "be-pf" + n, x1: 0, y1: 0, x2: 0, y2: 1 });
      lg.appendChild(L.svg("stop", { offset: 0, "stop-color": C.gold300, "stop-opacity": .7 }));
      lg.appendChild(L.svg("stop", { offset: 1, "stop-color": C.gold100, "stop-opacity": 0 }));
      var mg = L.svg("linearGradient", { id: "be-pm" + n, x1: 0, y1: 0, x2: 1, y2: 0 });
      [[0, 0], [.12, 1], [.86, 1], [1, 0]].forEach(function (q) { mg.appendChild(L.svg("stop", { offset: q[0], "stop-color": "#fff", "stop-opacity": q[1] })); });
      var m = L.svg("mask", { id: "be-mk" + n, maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 320, height: 360 });
      m.appendChild(L.svg("rect", { x: 0, y: 0, width: 320, height: 360, fill: "url(#be-pm" + n + ")" }));
      d.appendChild(lg); d.appendChild(mg); d.appendChild(m); s.appendChild(d);
      var g = s.appendChild(L.svg("g", { mask: "url(#be-mk" + n + ")" }));
      var area = g.appendChild(L.svg("path", { fill: "url(#be-pf" + n + ")" }));
      var base = g.appendChild(L.svg("line", { x1: 0, x2: 320, y1: 268, y2: 268, stroke: C.gold300, "stroke-width": 1, opacity: .6 }));
      var future = g.appendChild(L.svg("path", { fill: "none", stroke: C.gold400, "stroke-width": 3, "stroke-linecap": "round", "stroke-dasharray": "0.1 8" }));
      var past = g.appendChild(L.svg("path", { fill: "none", stroke: C.gold600, "stroke-width": 3, "stroke-linecap": "round", "stroke-linejoin": "round" }));
      var now = s.appendChild(L.svg("line", { x1: 96, x2: 96, y1: 92, y2: 268, stroke: C.gold300, "stroke-width": 1.5, "stroke-dasharray": "2 5", "stroke-linecap": "round" }));
      stage.appendChild(s);
      var r = document.createElement("div"); r.className = "be-rider"; r.innerHTML = "<i></i>" + LAB.pearl(44); stage.appendChild(r);
      return { area: area, past: past, future: future, r: r, base: base, now: now };
    },
    frame: function (s, p) {
      var T = p.reduced ? p.time - p.sec + p.dur - .001 : p.time;
      var X = 96, px = 19, top = 112, bot = 268;
      function eAt(t) { var c = ((t % 12) + 12) % 12; return c < 4 ? ease(c / 4) : 1 - ease((c - 4) / 8); }
      function y(t) { return bot - (bot - top) * eAt(t); }
      var t0 = T - X / px, t1 = T + (320 - X) / px, st = .1, a = [], b = [], t;
      for (t = t0; t < T; t += st) a.push((X + (t - T) * px).toFixed(1) + " " + y(t).toFixed(1));
      a.push(X + " " + y(T).toFixed(1));
      for (t = T; t <= t1 + st; t += st) b.push((X + (t - T) * px).toFixed(1) + " " + y(t).toFixed(1));
      s.past.setAttribute("d", "M" + a.join("L"));
      s.future.setAttribute("d", "M" + b.join("L"));
      s.area.setAttribute("d", "M" + a.concat(b).join("L") + "L330 " + bot + "L-10 " + bot + "Z");
      var e = eAt(T), sc = .86 + .22 * e;
      s.r.style.transform = "translate(" + X + "px," + y(T).toFixed(2) + "px) scale(" + sc.toFixed(3) + ")";
    }
  });

  /* 3. A bloom that opens fast and closes slow, over a 1:2 timeline */
  LAB.add("exhale", {
    id: "exhale-bloom", name: "Bloom and timeline",
    note: "A gold flower opens as you breathe in and folds slowly as you breathe out. Two bars below, one twice as long as the other, fill with each breath.",
    ref: "Apple Mindfulness Breathe's bloom, with Balance's step bars",
    build: function (stage) {
      var n = ++uid, s = L.svg("svg", { class: "be-svg", viewBox: "0 0 320 360" }), d = L.svg("defs");
      var rg = L.svg("radialGradient", { id: "be-bl" + n, cx: .35, cy: .35, r: .75 });
      rg.appendChild(L.svg("stop", { offset: 0, "stop-color": C.gold100 }));
      rg.appendChild(L.svg("stop", { offset: .5, "stop-color": C.gold400 }));
      rg.appendChild(L.svg("stop", { offset: 1, "stop-color": C.gold500 }));
      var cg = L.svg("radialGradient", { id: "be-bc" + n });
      cg.appendChild(L.svg("stop", { offset: 0, "stop-color": "#fff", "stop-opacity": .9 }));
      cg.appendChild(L.svg("stop", { offset: 1, "stop-color": "#fff", "stop-opacity": 0 }));
      d.appendChild(rg); d.appendChild(cg); s.appendChild(d);
      var fl = s.appendChild(L.svg("g", {}));
      var pet = [];
      for (var i = 0; i < 6; i++) pet.push(fl.appendChild(L.svg("circle", { fill: "url(#be-bl" + n + ")", opacity: .5, style: "mix-blend-mode:multiply" })));
      var core = s.appendChild(L.svg("circle", { cx: 160, cy: 150, fill: "url(#be-bc" + n + ")" }));
      /* the 1:2 timeline */
      var x0 = 44, W = 232, gap = 8, wi = (W - gap) / 3, wo = wi * 2, by = 312;
      var bars = [[x0, wi], [x0 + wi + gap, wo]].map(function (q) {
        s.appendChild(L.svg("rect", { x: q[0], y: by, width: q[1], height: 8, rx: 4, fill: C.gold300, opacity: .5 }));
        return { x: q[0], w: q[1], f: s.appendChild(L.svg("rect", { x: q[0], y: by, width: 0, height: 8, rx: 4, fill: C.gold600 })) };
      });
      [["In", x0], ["Out", x0 + wi + gap]].forEach(function (q) {
        var tx = s.appendChild(L.svg("text", { x: q[1], y: by + 26, class: "be-lbl" })); tx.textContent = q[0];
      });
      stage.appendChild(s);
      return { pet: pet, fl: fl, core: core, bars: bars };
    },
    frame: function (s, p) {
      var v = still(p), E = v.E, R = lerp(30, 58, E), D = lerp(12, 58, E), rot = lerp(-60, 0, E);
      s.pet.forEach(function (c, i) {
        var a = (i * 60) * Math.PI / 180;
        c.setAttribute("cx", (160 + D * Math.sin(a)).toFixed(2)); c.setAttribute("cy", (150 - D * Math.cos(a)).toFixed(2)); c.setAttribute("r", R.toFixed(2));
      });
      s.fl.setAttribute("transform", "rotate(" + rot.toFixed(2) + " 160 150)");
      s.core.setAttribute("r", (R * .9).toFixed(2));
      var i = p.k === "in" ? 0 : 1;
      [i === 0 ? v.T : 1, i === 1 ? v.T : 0].forEach(function (f, j) {
        var w = s.bars[j].w * f; s.bars[j].f.setAttribute("width", Math.max(8, w).toFixed(2));
        s.bars[j].f.setAttribute("opacity", clamp(w / 8, 0, 1).toFixed(3));
      });
    }
  });
})();
