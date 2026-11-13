/* 4-7-8 Breathing: in 4, hold 7, out 8. The gold orb family, with a hold you can watch pass.
   Class prefix bs-, SVG ids bs-*. orb.js registers "Today's orb" as the reference. */
(function () {
  if (!window.LAB) return;
  var css = document.createElement("style");
  css.textContent =
    ".bs-svg{position:absolute;inset:0;width:320px;height:360px;overflow:visible}" +
    ".bs-orb{position:absolute;left:160px;top:180px;width:200px;height:200px;transform:translate(-50%,-50%) scale(.56);will-change:transform}" +
    ".bs-orb svg{position:relative;display:block;filter:drop-shadow(0 16px 28px rgba(166,138,45,.18))}" +
    ".bs-orb i{position:absolute;inset:-24%;border-radius:50%;background:radial-gradient(circle,rgba(253,232,164,.42) 30%,rgba(255,248,224,.2) 52%,rgba(255,248,224,0) 70%);will-change:transform,opacity}" +
    ".bs-orb.bs-moon svg{filter:drop-shadow(0 0 22px rgba(243,209,97,.45))}" +
    ".bs-orb.bs-moon i{inset:-46%;background:radial-gradient(circle,rgba(243,209,97,.34) 24%,rgba(231,193,68,.12) 46%,rgba(231,193,68,0) 70%)}";
  document.head.appendChild(css);

  var L = LAB.L, C = L.C, ease = L.ease, clamp = L.clamp, lerp = L.lerp;
  /* still end states under reduced motion */
  function still(p) { return p.reduced ? { E: p.k === "out" ? 0 : 1, T: 1 } : { E: p.e, T: p.t }; }
  function pt(cx, cy, r, a) { a = a * Math.PI / 180; return [cx + r * Math.sin(a), cy - r * Math.cos(a)]; }
  function arc(cx, cy, r, a0, a1) {
    if (a1 - a0 < .05) a1 = a0 + .05;
    if (a1 - a0 > 359.9) a1 = a0 + 359.9;
    var p0 = pt(cx, cy, r, a0), p1 = pt(cx, cy, r, a1);
    return "M" + p0[0].toFixed(2) + " " + p0[1].toFixed(2) + "A" + r + " " + r + " 0 " + (a1 - a0 > 180 ? 1 : 0) + " 1 " + p1[0].toFixed(2) + " " + p1[1].toFixed(2);
  }
  function orb(stage, cls, cy) {
    var o = document.createElement("div"); o.className = "bs-orb" + (cls ? " " + cls : "");
    if (cy) o.style.top = cy + "px";
    o.innerHTML = "<i></i>" + LAB.pearl(200); stage.appendChild(o);
    return { o: o, h: o.firstChild };
  }
  function glow(s, id, sd) {
    var d = L.svg("defs"), f = L.svg("filter", { id: id, x: "-100%", y: "-100%", width: "300%", height: "300%" });
    f.appendChild(L.svg("feGaussianBlur", { stdDeviation: sd })); d.appendChild(f); s.appendChild(d);
  }
  /* the orb: size from lungs, a slow glow while held */
  function setOrb(m, E, hold, T, max) {
    var sc = .56 + (max - .56) * E;
    m.o.style.transform = "translate(-50%,-50%) scale(" + sc.toFixed(4) + ")";
    var w = hold ? Math.sin(Math.PI * T) : 0;
    m.h.style.transform = "scale(" + (1 + .07 * w).toFixed(4) + ")";
    m.h.style.opacity = (.85 + .15 * w).toFixed(3);
  }
  var uid = 0;

  /* 1. Day: the orb, and a ring that closes around it through the hold */
  LAB.add("sleep", {
    id: "sleep-ring", name: "Orb with hold ring",
    note: "Today's orb grows and rests full. While you hold, a thin gold ring slowly closes around it, so you can see the seven seconds pass without moving.",
    ref: "Oura's session ring and WHOOP's target ring, around the Rhythm orb",
    build: function (stage) {
      var n = ++uid, s = L.svg("svg", { class: "bs-svg", viewBox: "0 0 320 360" });
      glow(s, "bs-g" + n, 3.5);
      var track = s.appendChild(L.svg("circle", { cx: 160, cy: 180, r: 126, fill: "none", stroke: C.gold400, "stroke-width": 2.5, "stroke-dasharray": "0.1 7", "stroke-linecap": "round" }));
      var ring = s.appendChild(L.svg("path", { fill: "none", stroke: C.gold500, "stroke-width": 3.5, "stroke-linecap": "round" }));
      var halo = s.appendChild(L.svg("circle", { r: 8, fill: C.gold400, filter: "url(#bs-g" + n + ")" }));
      var bead = s.appendChild(L.svg("circle", { r: 5, fill: "#fff", stroke: C.gold600, "stroke-width": 2 }));
      stage.appendChild(s);
      return { track: track, ring: ring, bead: bead, halo: halo, m: orb(stage) };
    },
    frame: function (s, p) {
      var v = still(p), hold = p.k === "hold";
      var a = hold ? 360 * v.T : (p.k === "out" ? 360 : 0);
      /* ring shows only from the hold on, and dissolves as the orb shrinks */
      var vis = hold ? 1 : p.k === "out" ? (p.reduced ? 0 : 1 - ease(clamp(p.t * 1.6, 0, 1))) : 0;
      s.ring.setAttribute("d", arc(160, 180, 126, 0, Math.max(.05, a)));
      s.ring.setAttribute("opacity", (hold && a < 1 ? 0 : vis).toFixed(3));
      var b = pt(160, 180, 126, a);
      [s.bead, s.halo].forEach(function (c) { c.setAttribute("cx", b[0]); c.setAttribute("cy", b[1]); });
      s.bead.setAttribute("opacity", hold ? 1 : 0);
      s.halo.setAttribute("opacity", hold ? .5 : 0);
      s.track.setAttribute("opacity", (.35 + .5 * v.E).toFixed(3));
      setOrb(s.m, v.E, hold, v.T, .96);
    }
  });

  /* 2. Night: the orb as a moon among slow stars, seven stars light through the hold */
  var NIGHT = "radial-gradient(120% 75% at 50% 32%, #24325C 0%, #141D3A 46%, #0A1024 100%)";
  LAB.add("sleep", {
    id: "sleep-moon", name: "Moon and seven stars", dark: true, bg: NIGHT,
    note: "A night sky with the gold orb as a moon. While you hold, seven small stars above it light up, one each second, so the wait feels counted and calm.",
    ref: "Calm Sleep and Headspace Sleepcasts' night scenes, with the Rhythm orb as the moon",
    build: function (stage) {
      var n = ++uid, s = L.svg("svg", { class: "bs-svg", viewBox: "0 0 320 360" });
      glow(s, "bs-sg" + n, 2.4);
      var seed = 7, rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
      var stars = [];
      for (var i = 0; i < 30; i++) {
        var x = rnd() * 320, y = rnd() * 340, dx = x - 160, dy = y - 180;
        if (dx * dx + dy * dy < 150 * 150) { i--; continue; }
        stars.push({ c: s.appendChild(L.svg("circle", { cx: x.toFixed(1), cy: y.toFixed(1), r: (.6 + rnd() * 1.1).toFixed(2), fill: "#FFF8E0" })), ph: rnd() * 6.28, sp: .5 + rnd() * .5, b: .25 + rnd() * .45 });
      }
      var dots = [];
      for (var k = 0; k < 7; k++) {
        var q = pt(160, 180, 132, -54 + k * 18);
        var g = s.appendChild(L.svg("g", {}));
        dots.push({
          ring: g.appendChild(L.svg("circle", { cx: q[0], cy: q[1], r: 3.2, fill: "none", stroke: C.gold300, "stroke-width": 1.2 })),
          glow: g.appendChild(L.svg("circle", { cx: q[0], cy: q[1], r: 6, fill: C.gold400, filter: "url(#bs-sg" + n + ")" })),
          dot: g.appendChild(L.svg("circle", { cx: q[0], cy: q[1], r: 3.4, fill: C.gold100 }))
        });
      }
      stage.appendChild(s);
      return { stars: stars, dots: dots, m: orb(stage, "bs-moon") };
    },
    frame: function (s, p) {
      var v = still(p), hold = p.k === "hold";
      if (!p.reduced) s.stars.forEach(function (st) { st.c.setAttribute("opacity", (st.b * (.6 + .4 * Math.sin(p.time * st.sp + st.ph))).toFixed(3)); });
      else s.stars.forEach(function (st) { st.c.setAttribute("opacity", st.b.toFixed(3)); });
      var outFade = p.k === "out" ? (p.reduced ? 0 : 1 - ease(clamp(p.t * 1.5, 0, 1))) : 1;
      s.dots.forEach(function (d, i) {
        var lit = hold ? (p.reduced ? 1 : ease(clamp((p.sec - i) / .8, 0, 1))) : p.k === "out" ? outFade : 0;
        d.dot.setAttribute("opacity", lit.toFixed(3));
        d.glow.setAttribute("opacity", (lit * .7).toFixed(3));
        d.ring.setAttribute("opacity", ((.2 + .45 * v.E) * (1 - lit)).toFixed(3));
      });
      setOrb(s.m, v.E, hold, v.T, .92);
    }
  });

  /* 3. Night: the whole breath as a clock, the hold drawn as a dotted arc, four rounds below */
  LAB.add("sleep", {
    id: "sleep-clock", name: "Night breath clock", dark: true,
    bg: "linear-gradient(180deg, #0A1024 0%, #141D3A 58%, #2A2643 100%)",
    note: "The moon orb inside a ring cut 4, 7 and 8: solid for breathing, dotted for the hold. A bead walks the ring, and four dots below count the rounds.",
    ref: "Breathwrk's pattern ring and Apple Watch's activity ring, around the Rhythm orb",
    build: function (stage) {
      var n = ++uid, s = L.svg("svg", { class: "bs-svg", viewBox: "0 0 320 360" }), cx = 160, cy = 168, r = 128, G = 4;
      glow(s, "bs-cg" + n, 3.5);
      var tot = 19, a1 = 360 * 4 / tot, a2 = 360 * 11 / tot;
      var segs = { "in": [G, a1 - G], hold: [a1 + G, a2 - G], out: [a2 + G, 360 - G] };
      var st = { "in": [0, a1], hold: [a1, a2], out: [a2, 360] };
      var dotted = function (k) { return k === "hold" ? { "stroke-dasharray": "0.1 9", "stroke-width": 4.5 } : { "stroke-width": 4 }; };
      var tracks = {}, fills = {};
      ["in", "hold", "out"].forEach(function (k) {
        var at = { d: arc(cx, cy, r, segs[k][0], segs[k][1]), fill: "none", stroke: "#FFF8E0", "stroke-linecap": "round", opacity: .2 }, x = dotted(k);
        for (var q in x) at[q] = x[q];
        tracks[k] = s.appendChild(L.svg("path", at));
      });
      ["in", "hold", "out"].forEach(function (k) {
        var at = { fill: "none", stroke: C.gold400, "stroke-linecap": "round" }, x = dotted(k);
        for (var q in x) at[q] = x[q];
        fills[k] = s.appendChild(L.svg("path", at));
      });
      var halo = s.appendChild(L.svg("circle", { r: 9, fill: C.gold400, opacity: .6, filter: "url(#bs-cg" + n + ")" }));
      var bead = s.appendChild(L.svg("circle", { r: 5.5, fill: "#FFF8E0" }));
      var rounds = [];
      for (var i = 0; i < 4; i++) rounds.push(s.appendChild(L.svg("circle", { cx: 160 + (i - 1.5) * 16, cy: 334, r: 3.5, fill: C.gold400, stroke: C.gold300, "stroke-width": 1.2 })));
      stage.appendChild(s);
      return { cx: cx, cy: cy, r: r, segs: segs, st: st, tracks: tracks, fills: fills, halo: halo, bead: bead, rounds: rounds, m: orb(stage, "bs-moon", cy) };
    },
    frame: function (s, p) {
      var v = still(p), k = p.k, sp = s.st[k], g = s.segs[k];
      var a = lerp(sp[0], sp[1], v.T);
      ["in", "hold", "out"].forEach(function (q) {
        var on = q === k;
        s.fills[q].setAttribute("opacity", on && a > g[0] ? 1 : 0);
        if (on) s.fills[q].setAttribute("d", arc(s.cx, s.cy, s.r, g[0], clamp(a, g[0], g[1])));
        s.tracks[q].setAttribute("opacity", on ? .32 : .18);
      });
      var b = pt(s.cx, s.cy, s.r, a % 360);
      [s.bead, s.halo].forEach(function (c) { c.setAttribute("cx", b[0]); c.setAttribute("cy", b[1]); });
      var rd = p.cycle % 4;
      s.rounds.forEach(function (c, i) {
        c.setAttribute("fill-opacity", i < rd ? .55 : i === rd ? 1 : 0);
        c.setAttribute("stroke-opacity", i <= rd ? 0 : .6);
      });
      setOrb(s.m, v.E, k === "hold", v.T, .88);
    }
  });
})();
