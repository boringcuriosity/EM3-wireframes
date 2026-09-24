(function () {
  window.HEROES = window.HEROES || {};

  /* The plate, served.

     Food covers exactly as much of the porcelain as the day is sufficient, laid
     out the way a balanced plate is taught: half greens, a quarter grains, a
     quarter protein. The clean porcelain left over is the part of the day still
     to eat, which is what makes the number readable without reading it. */
  window.HEROES.dinnerplate = function (el, opts) {
    var score = (opts && opts.score) || 0;
    var W = 342, H = 320, TAU = Math.PI * 2;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cx = 171, cy = 118;     // plate centre
    var Rout = 104, Rin = 91;   // outer edge, and the well the food sits in
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

    el.style.position = "relative";

    var cv = document.createElement("canvas");
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.cssText = "position:absolute;inset:0;width:" + W + "px;height:" + H + "px;display:block";
    el.appendChild(cv);
    var ctx = cv.getContext("2d");
    ctx.scale(dpr, dpr);

    /* Once the plate is served it never changes, so it is painted once and the
       steam is the only thing redrawn. */
    var off = document.createElement("canvas");
    off.width = W * dpr; off.height = H * dpr;
    var octx = off.getContext("2d");
    octx.scale(dpr, dpr);
    var cached = false;

    /* Fork and knife, the same thin line drawing the halo uses, raised to frame
       the plate like a place setting. */
    var ut = document.createElement("div");
    ut.style.cssText = "position:absolute;inset:0;pointer-events:none";
    ut.innerHTML =
      '<svg width="342" height="320" viewBox="0 0 342 320" fill="none" stroke="#ABE6CC" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
      '<g transform="translate(16,-44)"><path d="M16 104v34c0 6 4 10 9 10s9-4 9-10v-34M25 104v30M25 148v70"/></g>' +
      '<g transform="translate(-16,-44)"><path d="M326 104c-9 8-12 24-12 44 0 8 4 12 12 12M326 104v114"/></g>' +
      "</svg>";
    el.appendChild(ut);

    var label = document.createElement("div");
    label.style.cssText = "position:absolute;left:0;right:0;top:230px;display:flex;flex-direction:column;align-items:center;pointer-events:none";
    label.innerHTML =
      '<div style="display:flex;align-items:flex-start;color:#1D4D38;font-family:\'Playfair Display\',Georgia,serif;font-weight:600;line-height:1">' +
      '<span class="n" style="font-size:58px;letter-spacing:-1px">0</span>' +
      '<span style="font-size:20px;margin:7px 0 0 3px;color:#2A805A">%</span></div>' +
      '<div style="margin-top:9px;font:700 11px Roboto,Arial,sans-serif;letter-spacing:2.2px;color:#2A805A">SUFFICIENT</div>';
    el.appendChild(label);
    var numEl = label.querySelector(".n");

    /* ---------- the food, generated once in unit space ---------- */
    var seed = 23;
    var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var rr = function (a, b) { return a + rnd() * (b - a); };

    // The outline of each heap, so the food has a mass under it rather than
    // white porcelain showing between the pieces.
    var greenMass = [], grainMass = [];
    for (var i = 0; i < 11; i++) greenMass.push(rr(0.84, 1.0));
    for (i = 0; i < 11; i++) grainMass.push(rr(0.86, 1.0));

    var leaves = [];
    for (i = 0; i < 34; i++) {
      var la = rnd() * TAU;
      var ld = Math.sqrt(rnd()) * 0.74;
      leaves.push({
        x: Math.cos(la) * ld, y: Math.sin(la) * ld * 0.82,
        l: rr(0.34, 0.62), w: rr(0.20, 0.36), a: la + rr(-1.0, 1.0)
      });
    }
    // Leaves higher up the plate sit further back, so they take the darker tones.
    leaves.sort(function (p, q) { return p.y - q.y; });
    var leafTone = [
      ["#1D4D38", "#246649"], ["#246649", "#2A805A"], ["#1D4D38", "#2A805A"],
      ["#246649", "#299D6B"], ["#2A805A", "#299D6B"], ["#246649", "#2A805A"],
      ["#2A805A", "#59B38C"], ["#299D6B", "#59B38C"], ["#2A805A", "#299D6B"],
      ["#299D6B", "#79CCA8"], ["#59B38C", "#79CCA8"], ["#299D6B", "#59B38C"],
      ["#59B38C", "#ABE6CC"], ["#79CCA8", "#ABE6CC"], ["#59B38C", "#79CCA8"],
      ["#79CCA8", "#CBF0E0"], ["#ABE6CC", "#CBF0E0"], ["#79CCA8", "#ABE6CC"]
    ];
    leaves.forEach(function (lf, k) { lf.tone = leafTone[k % leafTone.length]; lf.front = k > 22; });

    var grains = [];
    for (i = 0; i < 40; i++) {
      var ga = rnd() * TAU, gd = Math.sqrt(rnd()) * 0.72;
      if (i > 33) gd = rr(0.98, 1.12);
      grains.push({
        x: Math.cos(ga) * gd, y: Math.sin(ga) * gd * 0.8,
        l: rr(0.22, 0.32), w: rr(0.10, 0.14), a: rr(0, Math.PI), t: rnd()
      });
    }
    grains.sort(function (p, q) { return p.y - q.y; });

    var pieces = [
      { x: -0.34, y: 0.06, s: 0.80, a: -0.26 },
      { x: 0.30, y: -0.24, s: 0.70, a: 0.40 },
      { x: 0.14, y: 0.40, s: 0.60, a: 0.08 }
    ];

    // Seeds scattered on the porcelain, kept clear of wherever the food lands.
    var served = portions(score / 100);
    var seeds = [];
    for (i = 0; i < 26 && seeds.length < 11; i++) {
      var sa = rnd() * TAU, sd = Math.sqrt(rnd()) * (Rin - 10);
      var sx = cx + Math.cos(sa) * sd, sy = cy + Math.sin(sa) * sd;
      var clear =
        Math.hypot(sx - served.gx, sy - served.gy) > served.Rg + 9 &&
        Math.hypot(sx - served.rx, sy - served.ry) > served.Rr + 9 &&
        Math.hypot(sx - served.px, sy - served.py) > served.Rp + 9;
      if (clear) seeds.push({ x: sx, y: sy, r: rr(1.3, 2.3), a: rnd() * Math.PI, dark: rnd() > 0.6 });
    }

    /* Where each portion sits, and how big it is, for a plate served to f.
       Areas are real: greens are half of what is served, grains and protein a
       quarter each, so the three together cover f of the well. */
    function portions(f) {
      var wellArea = Math.PI * Rin * Rin;
      var Rg = Math.sqrt(0.5 * f * wellArea / Math.PI);
      var Rr = Math.sqrt(0.25 * f * wellArea / Math.PI);
      return {
        Rg: Rg, Rr: Rr, Rp: Rr,
        gx: cx - 0.86 * Rg, gy: cy + 0.02 * Rg,
        rx: cx + 1.22 * Rr, ry: cy - 1.06 * Rr,
        px: cx + 1.22 * Rr, py: cy + 1.06 * Rr
      };
    }

    function softShadow(c, x, y, r, alpha) {
      c.save();
      c.translate(x, y);
      c.scale(1, 0.26);
      var g = c.createRadialGradient(0, 0, r * 0.1, 0, 0, r);
      g.addColorStop(0, "rgba(16,24,40," + alpha + ")");
      g.addColorStop(0.65, "rgba(16,24,40," + (alpha * 0.45) + ")");
      g.addColorStop(1, "rgba(16,24,40,0)");
      c.fillStyle = g;
      c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill();
      c.restore();
    }

    function drawPlate(c) {
      // The plate sits on the page rather than floating on it.
      softShadow(c, cx, cy + Rout * 0.80, Rout * 1.02, 0.17);

      var body = c.createRadialGradient(cx - 36, cy - 46, 8, cx, cy + 12, Rout * 1.08);
      body.addColorStop(0, "#FFFFFF");
      body.addColorStop(0.55, "#FCFCFD");
      body.addColorStop(0.86, "#F6F7F9");
      body.addColorStop(1, "#EAECEF");
      c.fillStyle = body;
      c.beginPath(); c.arc(cx, cy, Rout, 0, TAU); c.fill();

      c.strokeStyle = "rgba(208,213,221,0.8)"; c.lineWidth = 1;
      c.beginPath(); c.arc(cx, cy, Rout - 0.5, 0, TAU); c.stroke();

      // Glaze catching the light on one side, falling away on the other.
      c.strokeStyle = "rgba(255,255,255,0.95)"; c.lineWidth = 3.4;
      c.beginPath(); c.arc(cx, cy, Rout - 3, Math.PI * 1.02, Math.PI * 1.74); c.stroke();
      c.strokeStyle = "rgba(208,213,221,0.5)"; c.lineWidth = 3;
      c.beginPath(); c.arc(cx, cy, Rout - 3, Math.PI * 0.06, Math.PI * 0.72); c.stroke();

      var well = c.createRadialGradient(cx - 26, cy - 32, 6, cx, cy, Rin);
      well.addColorStop(0, "#FFFFFF");
      well.addColorStop(0.78, "#FBFCFD");
      well.addColorStop(1, "#F2F4F7");
      c.fillStyle = well;
      c.beginPath(); c.arc(cx, cy, Rin, 0, TAU); c.fill();

      c.strokeStyle = "rgba(228,231,236,0.95)"; c.lineWidth = 1.4;
      c.beginPath(); c.arc(cx, cy, Rin, 0, TAU); c.stroke();
      c.strokeStyle = "rgba(203,240,224,0.7)"; c.lineWidth = 1;
      c.beginPath(); c.arc(cx, cy, Rin - 7, 0, TAU); c.stroke();

      // Reflected light inside the well: window from the top left, a mint bounce
      // from the page on the other side.
      c.save();
      c.beginPath(); c.arc(cx, cy, Rin, 0, TAU); c.clip();
      var hl = c.createLinearGradient(cx - Rin, cy - Rin, cx + Rin * 0.5, cy + Rin * 0.7);
      hl.addColorStop(0, "rgba(255,255,255,0.95)");
      hl.addColorStop(0.55, "rgba(255,255,255,0)");
      c.fillStyle = hl; c.fillRect(cx - Rin, cy - Rin, Rin * 2, Rin * 2);
      var bounce = c.createRadialGradient(cx + Rin * 0.5, cy + Rin * 0.55, 4, cx + Rin * 0.5, cy + Rin * 0.55, Rin);
      bounce.addColorStop(0, "rgba(243,252,248,0.9)");
      bounce.addColorStop(1, "rgba(243,252,248,0)");
      c.fillStyle = bounce; c.fillRect(cx - Rin, cy - Rin, Rin * 2, Rin * 2);
      c.restore();
    }

    /* A soft, slightly irregular round shape: a heap of food seen from above is
       never a circle. */
    function blobPath(c, x, y, R, rs, squash) {
      var n = rs.length, pts = [], k;
      for (k = 0; k < n; k++) {
        var a = (k / n) * TAU;
        pts.push([x + Math.cos(a) * R * rs[k], y + Math.sin(a) * R * rs[k] * squash]);
      }
      var mid = function (p, q) { return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; };
      var m = mid(pts[n - 1], pts[0]);
      c.beginPath();
      c.moveTo(m[0], m[1]);
      for (k = 0; k < n; k++) {
        var p = pts[k], mm = mid(p, pts[(k + 1) % n]);
        c.quadraticCurveTo(p[0], p[1], mm[0], mm[1]);
      }
      c.closePath();
    }

    function leafPath(c, l, w) {
      c.beginPath();
      c.moveTo(-l / 2, 0);
      c.bezierCurveTo(-l * 0.22, -w * 0.62, l * 0.18, -w * 0.5, l / 2, 0);
      c.bezierCurveTo(l * 0.18, w * 0.5, -l * 0.22, w * 0.62, -l / 2, 0);
      c.closePath();
    }

    function drawGreens(c, x, y, R) {
      softShadow(c, x, y + R * 0.66, R * 0.95, 0.13);
      // The heap itself, dark where the leaves shade each other.
      blobPath(c, x, y, R * 0.96, greenMass, 0.9);
      var mass = c.createRadialGradient(x - R * 0.3, y - R * 0.34, R * 0.06, x, y + R * 0.1, R);
      mass.addColorStop(0, "#79CCA8");
      mass.addColorStop(0.6, "#59B38C");
      mass.addColorStop(1, "#2A805A");
      c.fillStyle = mass;
      c.fill();
      leaves.forEach(function (lf) {
        c.save();
        c.translate(x + lf.x * R, y + lf.y * R);
        c.rotate(lf.a);
        var l = lf.l * R, w = lf.w * R;
        var g = c.createLinearGradient(-l / 2, 0, l / 2, 0);
        g.addColorStop(0, lf.tone[0]);
        g.addColorStop(1, lf.tone[1]);
        leafPath(c, l, w);
        c.fillStyle = g;
        c.fill();
        // Every leaf keeps its own edge, so the heap reads as leaves and not a mass.
        c.strokeStyle = lf.front ? "rgba(255,255,255,0.3)" : "rgba(29,77,56,0.28)";
        c.lineWidth = Math.max(0.55, w * 0.045);
        c.stroke();
        c.beginPath();
        c.moveTo(-l * 0.38, 0); c.lineTo(l * 0.38, 0);
        c.strokeStyle = "rgba(255,255,255,0.26)";
        c.lineWidth = Math.max(0.6, w * 0.06);
        c.stroke();
        c.restore();
      });
      // One sprig laid over the top, the way a kitchen finishes a plate.
      c.save();
      c.translate(x + R * 0.1, y - R * 0.72);
      c.strokeStyle = "#79CCA8"; c.lineWidth = Math.max(1, R * 0.03);
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(-R * 0.22, R * 0.16);
      c.quadraticCurveTo(0, R * 0.02, R * 0.24, -R * 0.1);
      c.stroke();
      [[-0.06, 0.02, -0.5], [0.08, -0.04, 0.35], [0.2, -0.1, -0.25]].forEach(function (p) {
        c.save();
        c.translate(R * p[0], R * p[1]);
        c.rotate(p[2]);
        leafPath(c, R * 0.2, R * 0.09);
        c.fillStyle = "#ABE6CC";
        c.fill();
        c.restore();
      });
      c.restore();
    }

    function drawGrains(c, x, y, R) {
      softShadow(c, x, y + R * 0.6, R * 0.92, 0.13);
      blobPath(c, x, y, R * 0.97, grainMass, 0.88);
      var mound = c.createRadialGradient(x - R * 0.28, y - R * 0.32, R * 0.05, x, y + R * 0.1, R);
      mound.addColorStop(0, "#E6FAF1");
      mound.addColorStop(0.62, "#ABE6CC");
      mound.addColorStop(1, "#79CCA8");
      c.fillStyle = mound;
      c.fill();
      c.strokeStyle = "rgba(89,179,140,0.45)";
      c.lineWidth = 1;
      c.stroke();

      c.save();
      c.translate(x, y);
      var tones = ["#FAFFFD", "#F3FCF8", "#E6FAF1", "#CBF0E0"];
      grains.forEach(function (gr) {
        c.save();
        c.translate(gr.x * R, gr.y * R);
        c.rotate(gr.a);
        var l = gr.l * R, w = gr.w * R;
        c.beginPath();
        c.ellipse(0, 0, l / 2, w / 2, 0, 0, TAU);
        c.fillStyle = tones[Math.floor(gr.t * tones.length) % tones.length];
        c.fill();
        c.strokeStyle = "rgba(121,204,168,0.5)";
        c.lineWidth = 0.6;
        c.stroke();
        c.beginPath();
        c.ellipse(-l * 0.14, -w * 0.12, l * 0.16, w * 0.2, 0, 0, TAU);
        c.fillStyle = "rgba(255,255,255,0.85)";
        c.fill();
        c.restore();
      });
      c.restore();
    }

    function roundRect(c, w, h, r) {
      c.beginPath();
      c.moveTo(-w / 2 + r, -h / 2);
      c.arcTo(w / 2, -h / 2, w / 2, h / 2, r);
      c.arcTo(w / 2, h / 2, -w / 2, h / 2, r);
      c.arcTo(-w / 2, h / 2, -w / 2, -h / 2, r);
      c.arcTo(-w / 2, -h / 2, w / 2, -h / 2, r);
      c.closePath();
    }

    function drawProtein(c, x, y, R) {
      softShadow(c, x, y + R * 0.62, R * 0.92, 0.12);
      pieces.forEach(function (pc, k) {
        c.save();
        c.translate(x + pc.x * R, y + pc.y * R);
        c.rotate(pc.a);
        var w = pc.s * R * 1.24, h = pc.s * R * 0.98, r = Math.max(2, R * 0.16);
        var lift = Math.max(1.5, R * 0.09);
        // The side of the piece, so it has thickness on the plate.
        c.save();
        c.translate(0, lift);
        roundRect(c, w, h, r);
        c.fillStyle = k === 1 ? "#246649" : "#1D4D38";
        c.fill();
        c.restore();
        var g = c.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
        g.addColorStop(0, k === 1 ? "#79CCA8" : "#59B38C");
        g.addColorStop(0.55, k === 1 ? "#299D6B" : "#299D6B");
        g.addColorStop(1, k === 1 ? "#246649" : "#2A805A");
        roundRect(c, w, h, r);
        c.fillStyle = g;
        c.fill();
        c.strokeStyle = "rgba(255,255,255,0.3)";
        c.lineWidth = 0.9;
        c.stroke();
        // A soft specular, so the piece reads as something cooked rather than flat.
        c.save();
        roundRect(c, w, h, r);
        c.clip();
        var sp = c.createRadialGradient(-w * 0.24, -h * 0.30, 1, -w * 0.24, -h * 0.30, w * 0.62);
        sp.addColorStop(0, "rgba(255,255,255,0.55)");
        sp.addColorStop(1, "rgba(255,255,255,0)");
        c.fillStyle = sp;
        c.fillRect(-w / 2, -h / 2, w, h);
        // A seared edge along the bottom.
        var sear = c.createLinearGradient(0, h * 0.2, 0, h / 2);
        sear.addColorStop(0, "rgba(29,77,56,0)");
        sear.addColorStop(1, "rgba(29,77,56,0.35)");
        c.fillStyle = sear;
        c.fillRect(-w / 2, -h / 2, w, h);
        c.restore();
        c.restore();
      });
      // A few seeds over the top.
      [[-0.5, -0.42, 0.4], [0.52, 0.3, -0.6], [-0.1, -0.6, 0.9]].forEach(function (p) {
        c.save();
        c.translate(x + p[0] * R, y + p[1] * R);
        c.rotate(p[2]);
        c.beginPath();
        c.ellipse(0, 0, R * 0.075, R * 0.04, 0, 0, TAU);
        c.fillStyle = "rgba(29,77,56,0.55)";
        c.fill();
        c.restore();
      });
    }

    function drawSeeds(c, f) {
      var a = Math.max(0, Math.min(1, (f - 0.08) / 0.3));
      if (a <= 0) return;
      seeds.forEach(function (s) {
        c.save();
        c.translate(s.x, s.y);
        c.rotate(s.a);
        c.beginPath();
        c.ellipse(0, 0, s.r, s.r * 0.6, 0, 0, TAU);
        c.fillStyle = s.dark ? "rgba(121,204,168," + (0.5 * a) + ")" : "rgba(171,230,204," + (0.65 * a) + ")";
        c.fill();
        c.restore();
      });
    }

    function drawSteam(c, t, f) {
      if (f < 0.25) return;
      var g = portions(f);
      var vents = [
        { x: g.gx + g.Rg * 0.2, y: g.gy - g.Rg * 0.8, ph: 0 },
        { x: g.rx, y: g.ry - g.Rr * 0.9, ph: 2.1 },
        { x: g.px - g.Rp * 0.3, y: g.py - g.Rp * 0.95, ph: 4.2 }
      ];
      c.save();
      c.lineCap = "round";
      vents.forEach(function (v, k) {
        var cyc = (t / 8 + v.ph / 6.4) % 1;                 // one slow rise every 8s
        var a = Math.sin(cyc * Math.PI) * 0.15;
        if (a <= 0.005) return;
        var rise = 20 + cyc * 26;
        var sway = 6 * Math.sin(t * 0.45 + v.ph);
        // Fades out as it climbs, the way steam actually goes.
        var g = c.createLinearGradient(v.x, v.y, v.x, v.y - rise);
        g.addColorStop(0, "rgba(171,230,204," + a + ")");
        g.addColorStop(0.55, "rgba(203,240,224," + (a * 0.6) + ")");
        g.addColorStop(1, "rgba(203,240,224,0)");
        c.strokeStyle = g;
        c.lineWidth = 3 - k * 0.5;
        c.shadowColor = "rgba(171,230,204,0.5)";
        c.shadowBlur = 6;
        c.beginPath();
        c.moveTo(v.x, v.y);
        c.bezierCurveTo(
          v.x + sway, v.y - rise * 0.38,
          v.x - sway, v.y - rise * 0.72,
          v.x + sway * 0.4, v.y - rise
        );
        c.stroke();
      });
      c.restore();
    }

    function drawScene(c, f) {
      c.clearRect(0, 0, W, H);
      drawPlate(c);
      var g = portions(f);
      c.save();
      c.beginPath(); c.arc(cx, cy, Rin - 1, 0, TAU); c.clip();
      drawSeeds(c, f);
      if (g.Rg > 1) drawGreens(c, g.gx, g.gy, g.Rg);
      if (g.Rr > 1) drawGrains(c, g.rx, g.ry, g.Rr);
      if (g.Rp > 1) drawProtein(c, g.px, g.py, g.Rp);
      c.restore();
    }

    var easeOut = function (x) { return 1 - Math.pow(1 - x, 3); };
    var t0 = performance.now(), raf = 0, alive = true;

    function frame(now) {
      if (!alive) return;
      var t = (now - t0) / 1000;
      var p = reduce ? 1 : easeOut(Math.min(t / 1.2, 1));
      var f = (score / 100) * p;
      numEl.textContent = Math.round(score * p);

      if (p >= 1) {
        if (!cached) { drawScene(octx, f); cached = true; }
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(off, 0, 0, W, H);
      } else {
        drawScene(ctx, f);
      }
      drawSteam(ctx, t, f);

      if (!reduce) raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return {
      dispose: function () {
        alive = false;
        cancelAnimationFrame(raf);
        el.innerHTML = "";
      }
    };
  };
})();
