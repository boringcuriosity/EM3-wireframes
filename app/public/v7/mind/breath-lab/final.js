/* Final breathing visuals, one per technique, agreed one by one. Class prefix bf-.
   Coherent: the breath clock from 4-7-8 (a ring cut into in and out, a bead walking it) around the bloom from
   Extended Exhale. No round dots: the ring already says where you are. */
(function () {
  var css = document.createElement("style");
  css.textContent = ".bf-svg{position:absolute;inset:0;width:320px;height:360px;overflow:visible}";
  document.head.appendChild(css);
  var L = LAB.L, C = L.C, clamp = L.clamp, lerp = L.lerp, uid = 0;
  function still(p) { return p.reduced ? { E: p.k === "out" ? 0 : 1, T: 1 } : { E: p.e, T: p.t }; }
  function pt(cx, cy, r, a) { a = a * Math.PI / 180; return [cx + r * Math.sin(a), cy - r * Math.cos(a)]; }
  function arc(cx, cy, r, a0, a1) {
    if (a1 - a0 < .05) a1 = a0 + .05;
    var p0 = pt(cx, cy, r, a0), p1 = pt(cx, cy, r, a1);
    return "M" + p0[0].toFixed(2) + " " + p0[1].toFixed(2) + "A" + r + " " + r + " 0 " + (a1 - a0 > 180 ? 1 : 0) + " 1 " + p1[0].toFixed(2) + " " + p1[1].toFixed(2);
  }

  /* clock + bloom for any in/hold/out pattern: each phase gets its share of the ring, holds are dotted */
  /* inner: optional { build, frame, size } drawn inside the ring instead of the flower (e.g. an illustration) */
  LAB.clockBloom = function (tech, inner, square) {
    /* the track: a circle, or for Box a square walked clockwise from the top-left corner, one side per phase.
       ponytail: angle 0..360 maps onto the perimeter, so a segment never turns a corner (each phase is one side) */
    var H = 118, sq = function (cx, cy, a) {
      var f = (a % 360) / 90, i = Math.floor(f), t = f - i, c = [[-1, -1], [1, -1], [1, 1], [-1, 1], [-1, -1]][i], n = [[-1, -1], [1, -1], [1, 1], [-1, 1], [-1, -1]][i + 1];
      return [cx + H * lerp(c[0], n[0], t), cy + H * lerp(c[1], n[1], t)];
    };
    var P = square ? function (cx, cy, r, a) { return sq(cx, cy, a); } : pt;
    var A = square ? function (cx, cy, r, a0, a1) { var p0 = sq(cx, cy, a0), p1 = sq(cx, cy, Math.max(a1, a0 + .05) - (a1 >= 360 ? .001 : 0)); return "M" + p0[0].toFixed(2) + " " + p0[1].toFixed(2) + "L" + p1[0].toFixed(2) + " " + p1[1].toFixed(2); } : arc;
    return {
      bg: inner && inner.bg,
      build: function (stage) {
        var ins = inner && inner.build(stage);
        /* ponytail: shrink the inner canvas so the figure sits inside the ring */
        if (ins && ins.c) { var z = inner.size || 250; ins.c.style.cssText = "position:absolute;left:" + (160 - z / 2) + "px;top:" + (180 - z / 2) + "px;width:" + z + "px;height:" + z + "px"; }
        var n = ++uid, s = L.svg("svg", { class: "bf-svg", viewBox: "0 0 320 360" }), d = L.svg("defs"), cx = 160, cy = 180, r = 134, G = square ? 1.6 : 4;
        var f = L.svg("filter", { id: "bf-g" + n, x: "-100%", y: "-100%", width: "300%", height: "300%" });
        f.appendChild(L.svg("feGaussianBlur", { stdDeviation: 3.5 }));
        var rg = L.svg("radialGradient", { id: "bf-bl" + n, cx: .35, cy: .35, r: .75 });
        [[0, C.gold100], [.5, C.gold400], [1, C.gold500]].forEach(function (q) { rg.appendChild(L.svg("stop", { offset: q[0], "stop-color": q[1] })); });
        var cg = L.svg("radialGradient", { id: "bf-bc" + n });
        cg.appendChild(L.svg("stop", { offset: 0, "stop-color": "#fff", "stop-opacity": .9 }));
        cg.appendChild(L.svg("stop", { offset: 1, "stop-color": "#fff", "stop-opacity": 0 }));
        d.appendChild(f); d.appendChild(rg); d.appendChild(cg); s.appendChild(d);
        /* ring segments, one per phase */
        var seq = LAB.PAT[tech].seq, tot = seq.reduce(function (a, x) { return a + x[1]; }, 0), a0 = 0;
        var ph = seq.map(function (x) {
          var a1 = a0 + 360 * x[1] / tot, o = { st: [a0, a1], g: [a0 + G, a1 - G], dash: x[0] === "hold" ? { "stroke-dasharray": "0.1 9", "stroke-width": 4.5 } : { "stroke-width": 4 } };
          a0 = a1; return o;
        });
        ph.forEach(function (o) { var at = { d: A(cx, cy, r, o.g[0], o.g[1]), fill: "none", stroke: C.gold300, "stroke-linecap": "round", opacity: .55 }; for (var q in o.dash) at[q] = o.dash[q]; o.track = s.appendChild(L.svg("path", at)); });
        ph.forEach(function (o) { var at = { fill: "none", stroke: C.gold500, "stroke-linecap": "round" }; for (var q in o.dash) at[q] = o.dash[q]; o.fill = s.appendChild(L.svg("path", at)); });
        /* the bloom: six petals open on the in-breath, fold on the out-breath */
        var fl = s.appendChild(L.svg("g", {})), pet = [];
        for (var i = 0; i < 6; i++) pet.push(fl.appendChild(L.svg("circle", { fill: "url(#bf-bl" + n + ")", opacity: .5, style: "mix-blend-mode:multiply" })));
        var core = s.appendChild(L.svg("circle", { cx: cx, cy: cy, fill: "url(#bf-bc" + n + ")" }));
        var halo = s.appendChild(L.svg("circle", { r: 9, fill: C.gold400, opacity: .5, filter: "url(#bf-g" + n + ")" }));
        var bead = s.appendChild(L.svg("circle", { r: 5.5, fill: "#fff", stroke: C.gold600, "stroke-width": 2 }));
        stage.appendChild(s);
        if (ins) fl.style.display = core.style.display = "none";
        return { cx: cx, cy: cy, r: r, ph: ph, fl: fl, pet: pet, core: core, halo: halo, bead: bead, ins: ins };
      },
      frame: function (s, p) {
        var v = still(p), o = s.ph[p.idx], a = lerp(o.st[0], o.st[1], v.T);
        s.ph.forEach(function (q, i) {
          var on = i === p.idx;
          q.fill.setAttribute("opacity", on && a > q.g[0] ? 1 : 0);
          if (on) q.fill.setAttribute("d", A(s.cx, s.cy, s.r, q.g[0], clamp(a, q.g[0], q.g[1])));
          q.track.setAttribute("opacity", on ? .9 : .5);
        });
        var b = P(s.cx, s.cy, s.r, a % 360);
        [s.bead, s.halo].forEach(function (c) { c.setAttribute("cx", b[0]); c.setAttribute("cy", b[1]); });
        if (s.ins) { inner.frame(s.ins, p); return; }
        /* ponytail: petals sized to stay inside the ring (max reach 104 < 134) */
        var E = v.E, R = lerp(26, 52, E), D = lerp(10, 52, E);
        s.pet.forEach(function (c, i) {
          var t = i * Math.PI / 3;
          c.setAttribute("cx", (s.cx + D * Math.sin(t)).toFixed(2)); c.setAttribute("cy", (s.cy - D * Math.cos(t)).toFixed(2)); c.setAttribute("r", R.toFixed(2));
        });
        s.fl.setAttribute("transform", "rotate(" + lerp(-60, 0, E).toFixed(2) + " " + s.cx + " " + s.cy + ")");
        s.core.setAttribute("r", (R * .9).toFixed(2));
      }
    };
  };
})();

/* Two still pictures, one per phase, cross-fading over the first .6 s of each phase (Pursed Lip). */
LAB.twoFrames = function (inSrc, outSrc) {
  return {
    bg: "#FFFFFF",
    build: function (stage) {
      var c = document.createElement("div"); stage.appendChild(c);
      var im = [inSrc, outSrc].map(function (s) { var i = new Image(); i.src = s; i.alt = ""; i.style.cssText = "position:absolute;inset:0;width:100%;height:100%;border-radius:50%"; c.appendChild(i); return i; });
      return { c: c, "in": im[0], out: im[1] };
    },
    frame: function (s, p) {
      var a = p.reduced ? 1 : LAB.L.ease(Math.min(1, p.sec / .6)), on = p.k === "out" ? s.out : s["in"], off = on === s.out ? s["in"] : s.out;
      on.style.opacity = 1; off.style.opacity = (1 - a).toFixed(3); on.style.zIndex = 1; off.style.zIndex = 2;
    }
  };
};

/* One clip of a whole breath (out, in, out). Breathing in plays [0, split] seconds, breathing out [split, end],
   each stretched to its phase by seeking frame by frame (the clip is all-intra so every seek is exact). */
LAB.clipBreath = function (src, split, curve) {
  /* curve: how full the belly is at evenly spaced points through the in part (0..1, increasing). With it, both phases
     follow the breath's own smooth curve (p.e) instead of the clip's timing, so a reversed out-breath is even too. */
  function when(f) {
    if (!curve) return f;
    var n = curve.length - 1;
    for (var i = 0; i < n; i++) if (curve[i + 1] >= f) { var a = curve[i], b = curve[i + 1]; return (i + (b > a ? (f - a) / (b - a) : 0)) / n; }
    return 1;
  }
  return {
    bg: "#FFFFFF",
    build: function (stage) {
      var c = document.createElement("div"), v = document.createElement("video");
      v.src = src; v.muted = true; v.playsInline = true; v.preload = "auto";
      v.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:50%;background:#fff";
      c.appendChild(v); stage.appendChild(c);
      return { c: c, v: v };
    },
    frame: function (s, p) {
      var v = s.v, d = v.duration; if (!d || v.readyState < 1 || v.seeking) return;
      var u = when(p.reduced ? (p.k === "out" ? 0 : 1) : p.e), t = p.k === "out" ? split + (1 - u) * (d - split) : u * split;
      t = Math.max(.01, Math.min(d - .02, t));
      if (Math.abs(v.currentTime - t) > .004) v.currentTime = t;
    }
  };
};

/* A video already timed to one whole cycle (e.g. 4 s in + 6 s out). It plays natively, so it is as smooth as the file;
   the player only nudges it back when it drifts from the breath clock, and holds still when paused or frozen. */
LAB.loopBreath = function (src) {
  return {
    bg: "#FFFFFF",
    build: function (stage) {
      var c = document.createElement("div"), v = document.createElement("video");
      v.src = src; v.muted = true; v.playsInline = true; v.loop = true; v.preload = "auto";
      v.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:50%;background:#fff";
      c.appendChild(v); stage.appendChild(c);
      return { c: c, v: v };
    },
    frame: function (s, p) {
      var v = s.v, d = v.duration; if (!d || v.readyState < 1) return;
      var want = p.reduced ? (p.k === "out" ? 0 : 4) : p.time % d, still = p.paused || p.reduced || LAB.at0 != null;
      if (still) { if (!v.paused) v.pause(); if (!v.seeking && Math.abs(v.currentTime - want) > .03) v.currentTime = want; return; }
      if (v.paused) v.play().catch(function () {});
      var off = Math.abs(v.currentTime - want); off = Math.min(off, d - off);   /* wrap-aware drift */
      if (off > .15 && !v.seeking) v.currentTime = want;
    }
  };
};
