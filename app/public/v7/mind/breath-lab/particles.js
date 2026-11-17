/* Particle figure: a gender-neutral seated person made only of indigo dots, for the breath clock (LAB.clockBloom inner).
   No hair, no face, no curves that read as one gender: a round head, a straight torso, crossed legs.
   The breath shows in the body, never in the air: breathing in, the chest and belly dots spread a little and deepen,
   and the upper body rises 2 px; breathing out, they settle back on the same curve. Holds are still.
   Per exercise:
     belly   one hand on the chest, one on the belly; the belly does most of the spreading and is the deepest colour
     pursed  breathing in, a small cluster at the nose brightens; breathing out, one at the lips
     hum     fingers at the ears; while humming a slow soft wave of light runs out from the throat through the body
     others  hands resting on the knees
   Looks (LAB.particles(tech, look)):
     dots    dense small dots, the outline a little denser so the shape reads
     web     fewer, larger dots joined by hairlines to their near neighbours, like a constellation
     bust    head, shoulders and chest only, larger, so the breath in the chest is easy to see
   ponytail: the shape is a handful of signed-distance pieces sampled once with dart throwing; no images, no library. */
(function () {
  var IN = ["#C7D7FE", "#A4BCFD", "#8098F9", "#6172F3", "#444CE7", "#3538CD", "#2D31A6"];   /* indigo 200..800 */
  var len = function (x, y) { return Math.sqrt(x * x + y * y); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  function ell(px, py, cx, cy, rx, ry) { var k = len((px - cx) / rx, (py - cy) / ry); return (k - 1) * Math.min(rx, ry); }
  function cap(px, py, ax, ay, bx, by, r) {
    var dx = bx - ax, dy = by - ay, h = clamp(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy), 0, 1);
    return len(px - ax - dx * h, py - ay - dy * h) - r;
  }
  /* iq's isosceles trapezoid, y down: r1 half width at the top, r2 at the bottom, he half height */
  function trap(px, py, cx, cy, r1, r2, he) {
    var x = Math.abs(px - cx), y = py - cy, k1x = r2, k1y = he, k2x = r2 - r1, k2y = 2 * he;
    var cax = x - Math.min(x, y < 0 ? r1 : r2), cay = Math.abs(y) - he;
    var t = clamp(((k1x - x) * k2x + (k1y - y) * k2y) / (k2x * k2x + k2y * k2y), 0, 1);
    var cbx = x - k1x + k2x * t, cby = y - k1y + k2y * t, s = cbx < 0 && cay < 0 ? -1 : 1;
    return s * Math.sqrt(Math.min(cax * cax + cay * cay, cbx * cbx + cby * cby));
  }
  function smin(a, b, k) { var h = clamp(.5 + .5 * (b - a) / k, 0, 1); return b + (a - b) * h - k * h * (1 - h); }

  /* arms per pose, as [shoulder, elbow, hand] for the left side of the picture; the right side mirrors unless given */
  var POSE = {
    knees: { L: [[108, 124], [76, 174], [106, 214]] },
    ears: { L: [[110, 124], [54, 128], [124, 82]] },
    belly: { L: [[108, 124], [82, 166], [132, 146]], R: [[192, 124], [218, 180], [166, 184]] }
  };
  var mir = function (a) { return a.map(function (p) { return [300 - p[0], p[1]]; }); };
  /* the body: which part a point is in (or null), and how far inside it is (for a denser outline) */
  function body(x, y, pose) {
    var arms = POSE[pose], L = arms.L, R = arms.R || mir(L);
    var head = ell(x, y, 150, 72, 21, 25);
    var torso = trap(x, y, 150, 164, 31, 25, 42) - 10;
    var neck = cap(x, y, 150, 92, 150, 118, 9);
    var up = smin(smin(head, neck, 4), torso, 6);
    var arm = Math.min(cap(x, y, L[0][0], L[0][1], L[1][0], L[1][1], 7), cap(x, y, L[1][0], L[1][1], L[2][0], L[2][1], 5.5), ell(x, y, L[2][0], L[2][1], 7, 6.5),
      cap(x, y, R[0][0], R[0][1], R[1][0], R[1][1], 7), cap(x, y, R[1][0], R[1][1], R[2][0], R[2][1], 5.5), ell(x, y, R[2][0], R[2][1], 7, 6.5));
    var legs = Math.min(ell(x, y, 150, 224, 86, 21), ell(x, y, 150, 236, 56, 12));
    var d = Math.min(up, arm, legs);
    if (d > 0) return null;
    var part = d === arm || (pose !== "knees" && arm < 0 && head > 0) ? "arm" : d === legs ? "legs" : head < 0 && y < 96 ? "head" : y < 104 ? "neck" : y < 158 ? "chest" : "belly";
    return { part: part, d: -d, arm: arm, head: head };
  }

  var LOOK = {
    dots: { gap: 3.9, r: [1, 1.7], edge: .55, links: 0, bust: false },
    web: { gap: 6.4, r: [1.3, 2.3], edge: .5, links: 10.5, bust: false },
    bust: { gap: 4.6, r: [1.2, 2.1], edge: .55, links: 0, bust: true }
  };
  var FOCUS = { belly: "belly", pursed: "face", hum: "hum" };
  var POSEOF = { belly: "belly", hum: "ears" };
  var cache = {};

  /* dart throwing on a grid: even spacing, a little denser at the outline. Seeded so every load looks the same */
  function sample(pose, look) {
    var key = pose + look; if (cache[key]) return cache[key];
    var o = LOOK[look], seed = 7, rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var g = o.gap, cell = g / Math.SQRT2, grid = {}, pts = [];
    var near = function (x, y, gg) {
      var gx = Math.floor(x / cell), gy = Math.floor(y / cell);
      for (var i = -3; i <= 3; i++) for (var j = -3; j <= 3; j++) { var q = grid[(gx + i) + "," + (gy + j)]; if (q && len(q.x - x, q.y - y) < gg) return true; }
      return false;
    };
    for (var n = 0; n < 60000; n++) {
      var x = 50 + rnd() * 200, y = 40 + rnd() * 215, b = body(x, y, pose);
      if (!b) continue;
      /* hands in front of the body (belly pose): a thin gap round the forearm and hand so they read on top */
      if (pose !== "knees" && b.part !== "arm" && b.part !== "head" && b.arm < 3.5) continue;
      var edge = b.d < 3.2 || (pose !== "knees" && b.part === "arm"), gg = edge ? g * .78 : g;
      if (!edge && rnd() > o.edge + .35) continue;
      if (near(x, y, gg)) continue;
      var p = { x: x, y: y, part: b.part, edge: edge, r: o.r[0] + rnd() * (o.r[1] - o.r[0]) * (edge ? 1 : .8), c: 2 + Math.floor(rnd() * 2) + (edge ? 1 : 0), ph: rnd() * 6.283, sp: .6 + rnd() * .8 };
      grid[Math.floor(x / cell) + "," + Math.floor(y / cell)] = p; pts.push(p);
    }
    var links = [];
    if (o.links) pts.forEach(function (a, i) { for (var j = i + 1; j < pts.length; j++) { var b2 = pts[j]; if (Math.abs(a.y - b2.y) < o.links && len(a.x - b2.x, a.y - b2.y) < o.links) links.push([i, j]); } });
    return (cache[key] = { pts: pts, links: links });
  }

  LAB.particles = function (tech, look) {
    look = look || "dots";
    var o = LOOK[look], pose = POSEOF[tech] || "knees", focus = FOCUS[tech], seq = LAB.PAT[tech].seq;
    var S = sample(pose, look);
    /* bust: zoom on the upper body, the chest near the middle of the ring */
    var Z = o.bust ? 1.32 : 1, OX = 150, OY = o.bust ? 120 : 150;
    return {
      bg: "#FFFFFF", size: 266,
      build: function (stage) {
        var d = Math.min(2, window.devicePixelRatio || 1), c = document.createElement("canvas");
        c.width = c.height = 300 * d; stage.appendChild(c);
        var x = c.getContext("2d"); x.setTransform(d, 0, 0, d, 0, 0);
        return { c: c, x: x, xy: new Float32Array(S.pts.length * 2) };
      },
      frame: function (s, p) {
        var x = s.x, t = performance.now() / 1000, rm = p.reduced, e = rm ? (p.k === "out" ? 0 : 1) : p.e;
        var hold = p.k === "hold", calm = rm || hold ? 0 : 1, hum = focus === "hum" && p.k === "out" && seq[p.idx][2] === "Hum";
        var chestW = focus === "belly" ? .25 : .8, bellyW = focus === "belly" ? 1.7 : .7;
        x.clearRect(0, 0, 300, 300);
        var P = S.pts, xy = s.xy;
        for (var i = 0; i < P.length; i++) {
          var q = P[i], px = q.x, py = q.y, up = q.part !== "legs";
          /* the breath: chest and belly spread sideways from the middle and a touch up, the upper body lifts */
          if (q.part === "chest") { px = 150 + (px - 150) * (1 + .06 * chestW * e); py -= 1.6 * chestW * e; }
          else if (q.part === "belly") { px = 150 + (px - 150) * (1 + .075 * bellyW * e); py += .6 * bellyW * e; }
          if (up) py -= 2 * e * (q.y < 160 ? 1 : (230 - q.y) / 70);
          /* a slow shimmer so the dots feel alive; none on a hold or with reduced motion */
          if (calm) { px += Math.sin(t * q.sp + q.ph) * .45; py += Math.cos(t * q.sp * .8 + q.ph) * .45; }
          xy[2 * i] = OX + (px - OX) * Z; xy[2 * i + 1] = OY + (py - OY) * Z + (o.bust ? 22 : 0);
        }
        if (S.links.length) {
          x.lineWidth = .7; x.strokeStyle = IN[2]; x.globalAlpha = .42; x.beginPath();
          S.links.forEach(function (l) { var a = 2 * l[0], b = 2 * l[1]; x.moveTo(xy[a], xy[a + 1]); x.lineTo(xy[b], xy[b + 1]); });
          x.stroke();
        }
        /* the hum: a soft ring of light runs out from the throat every 1.6 s, inside the body only */
        var wave = hum && !rm ? (p.sec * 60) % 96 : -1;
        for (i = 0; i < P.length; i++) {
          q = P[i];
          var X = xy[2 * i], Y = xy[2 * i + 1], c = q.c, a = .62 + .1 * q.c / 4, r = q.r * Z * (o.bust ? .8 : 1);
          if (q.part === "chest" || q.part === "belly") { var w = q.part === "belly" ? bellyW : chestW; c = Math.min(6, c + Math.round(w * e * 1.4)); a += .2 * e * Math.min(1, w); }
          if (focus === "belly" && q.part === "belly") { c = Math.max(c, 4); }
          if (focus === "belly" && q.part === "arm" && q.y > 132) { c = 6; a = .9; r *= 1.1; }   /* the two hands, one on the chest, one on the belly */
          if (focus === "hum" && q.part === "arm" && q.y < 100) { c = 6; a = .9; }   /* fingers at the ears */
          if (focus === "face") {   /* nose on the way in, lips on the way out */
            var nose = p.k === "in", fd = nose ? len((q.x - 150) * 1.4, q.y - 76) : len((q.x - 150) / 1.6, q.y - 87), on = rm ? 1 : .6 + .4 * Math.sin(Math.PI * p.t);
            if (fd < 8) { c = 6; a = .5 + .5 * on; r *= 1 + .7 * (1 - fd / 8) * on; }
          }
          if (wave >= 0) { var dd = Math.abs(len(q.x - 150, q.y - 104) - wave); if (dd < 10) { var k = 1 - dd / 10; c = Math.min(6, c + Math.round(2 * k)); a = Math.min(1, a + .3 * k); } }
          if (o.bust) a *= q.part === "legs" ? 0 : clamp((292 - Y) / 50, 0, 1);   /* the bust fades out at the bottom */
          if (a <= .01) continue;
          x.globalAlpha = Math.min(1, a); x.fillStyle = IN[c];
          x.beginPath(); x.arc(X, Y, r, 0, 6.2832); x.fill();
        }
        x.globalAlpha = 1;
      }
    };
  };

  /* the ring in indigo too, so the screen stays one colour family: recolour clockBloom's gold after it builds */
  var MAP = { "#FDE8A4": "#C7D7FE", "#E7C144": "#6172F3", "#CDA935": "#444CE7", "#F3D161": "#A4BCFD" };
  LAB.particleClock = function (tech, look, gold) {
    var v = LAB.clockBloom(tech, LAB.particles(tech, look), tech === "box"), b = v.build;
    if (!gold) v.build = function (stage, L) {
      var s = b.call(v, stage, L);
      stage.querySelectorAll("svg [stroke], svg [fill]").forEach(function (n) {
        ["stroke", "fill"].forEach(function (k) { var c = (n.getAttribute(k) || "").toUpperCase(); if (MAP[c]) n.setAttribute(k, MAP[c]); });
      });
      return s;
    };
    return v;
  };
})();
