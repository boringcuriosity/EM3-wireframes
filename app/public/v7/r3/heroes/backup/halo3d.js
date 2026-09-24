(function () {
  window.HEROES = window.HEROES || {};

  /* Halo Orbit. The dotted halo tipped back into perspective, like a plate
     seen at an angle, with three concentric rings of dots circling it. Dots
     coming toward you grow, sharpen and catch the light; dots going round the
     back shrink, pale out and soften. 54% of them are lit, clockwise from the
     top, and the whole plate turns slowly so the lit crescent travels with it. */
  window.HEROES.halo3d = function (el, opts) {
    var score = (opts && opts.score) || 0;
    var W = 342, H = 320, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cx = 171, cy = 148, D = 480, PHI = 0.95;        // how far the plate is tipped
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

    el.style.position = "relative";
    var cv = document.createElement("canvas");
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.cssText = "position:absolute;inset:0;width:" + W + "px;height:" + H + "px;display:block";
    el.appendChild(cv);
    var ctx = cv.getContext("2d");
    ctx.scale(dpr, dpr);

    // Fork and knife, the same hands as the flat halo.
    var ut = document.createElement("div");
    ut.style.cssText = "position:absolute;inset:0;pointer-events:none";
    ut.innerHTML =
      '<svg width="342" height="320" viewBox="0 0 342 320" fill="none" stroke="#ABE6CC" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M16 104v34c0 6 4 10 9 10s9-4 9-10v-34M25 104v30M25 148v70"/>' +
      '<path d="M326 104c-9 8-12 24-12 44 0 8 4 12 12 12M326 104v114"/>' +
      "</svg>";
    el.appendChild(ut);

    var label = document.createElement("div");
    label.style.cssText = "position:absolute;left:0;right:0;top:" + (cy - 46) + "px;display:flex;flex-direction:column;align-items:center;pointer-events:none";
    label.innerHTML =
      '<div style="display:flex;align-items:flex-start;color:#101828;font-family:\'Playfair Display\',Georgia,serif;font-weight:600;line-height:1">' +
      '<span class="n" style="font-size:66px;letter-spacing:-1px">0</span><span style="font-size:22px;margin:8px 0 0 2px;color:#2A805A">%</span></div>' +
      '<div style="margin-top:8px;font:700 11px Roboto,Arial,sans-serif;letter-spacing:2.2px;color:#2A805A">SUFFICIENT</div>';
    el.appendChild(label);
    var numEl = label.querySelector(".n");

    var seed = 23;
    var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
    var easeOut = function (x) { return 1 - Math.pow(1 - x, 3); };

    var rings = [
      { r: 92, n: 16, size: 3.6, tone: 0 },
      { r: 116, n: 20, size: 4.2, tone: 1 },
      { r: 140, n: 24, size: 4.8, tone: 2 }
    ];
    var tones = [
      { hi: "#CBF0E0", mid: "#59B38C", edge: "#2A805A" },
      { hi: "#CBF0E0", mid: "#299D6B", edge: "#246649" },
      { hi: "#ABE6CC", mid: "#2A805A", edge: "#1D4D38" }
    ];

    var cp = Math.cos(PHI), sp = Math.sin(PHI);
    function project(r, a, omega) {
      var th = a + omega;
      var lx = r * Math.cos(th);
      var lz = r * Math.sin(th);
      // tip the plate back: the near rim drops toward us and grows, the far rim
      // rides up behind the number and shrinks
      var Y = lz * cp;
      var Z = lz * sp;
      var s = D / (D - Z);
      return { x: cx + lx * s, y: cy + Y * s, z: Z, s: s };
    }

    var dots = [];
    rings.forEach(function (ring) {
      for (var i = 0; i < ring.n; i++) {
        var a = -Math.PI / 2 + (i / ring.n) * Math.PI * 2 + (rnd() - 0.5) * 0.05;
        dots.push({
          r: ring.r + (rnd() - 0.5) * 4, a: a, tone: ring.tone,
          size: ring.size * (0.9 + rnd() * 0.2), tw: rnd() * Math.PI * 2
        });
      }
    });
    // Clockwise from the top when it lands.
    dots.sort(function (p, q) {
      var ap = (p.a + Math.PI / 2 + Math.PI * 4) % (Math.PI * 2);
      var aq = (q.a + Math.PI / 2 + Math.PI * 4) % (Math.PI * 2);
      return ap - aq;
    });
    dots.forEach(function (d, i) { d.order = i; });
    var total = dots.length;

    var t0 = performance.now(), raf = 0, alive = true;

    function frame(now) {
      if (!alive) return;
      var t = (now - t0) / 1000;
      var p = reduce ? 1 : easeOut(Math.min(t / 1.2, 1));
      numEl.textContent = Math.round(score * p);
      var litF = (score / 100) * total * p;
      var omega = reduce ? 0 : (t / 24) * Math.PI * 2;   // one turn every 24s

      ctx.clearRect(0, 0, W, H);

      // Light pooling on the plate.
      ctx.save();
      ctx.translate(cx, cy); ctx.scale(1, cp); ctx.translate(-cx, -cy);
      var glow = ctx.createRadialGradient(cx, cy, 16, cx, cy, 168);
      glow.addColorStop(0, "rgba(230,250,241,0.9)");
      glow.addColorStop(0.58, "rgba(243,252,248,0.5)");
      glow.addColorStop(1, "rgba(250,255,253,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(cx, cy, 168, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // The rims, fading where they run behind.
      ctx.lineWidth = 1;
      rings.forEach(function (ring) {
        var SEG = 90;
        for (var j = 0; j < SEG; j++) {
          var q0 = project(ring.r, (j / SEG) * Math.PI * 2, omega);
          var q1 = project(ring.r, ((j + 1) / SEG) * Math.PI * 2, omega);
          var fr = clamp((((q0.s + q1.s) / 2) - 0.78) / 0.5);
          ctx.strokeStyle = "rgba(171,230,204," + (0.05 + 0.45 * fr).toFixed(3) + ")";
          ctx.beginPath(); ctx.moveTo(q0.x, q0.y); ctx.lineTo(q1.x, q1.y); ctx.stroke();
        }
      });

      var frameDots = dots.map(function (d) {
        var q = project(d.r, d.a, omega);
        return { d: d, q: q };
      });
      frameDots.sort(function (u, v) { return u.q.z - v.q.z; });

      for (var i = 0; i < frameDots.length; i++) {
        var d = frameDots[i].d, q = frameDots[i].q;
        var k = clamp(litF - d.order);
        var fr = clamp((q.s - 0.78) / 0.5);              // 0 at the back, 1 up front
        var breathe = reduce ? 1 : 1 + Math.sin(t * 1.1 + d.tw) * 0.05;
        var pop = k > 0 && k < 1 ? 1 + Math.sin(k * Math.PI) * 0.45 : breathe;
        var rad = d.size * q.s * pop;
        var soft = fr < 0.45;

        if (k > 0) {
          var tone = tones[d.tone];
          var gr = rad * (2.1 + 1.3 * fr);
          var g = ctx.createRadialGradient(q.x, q.y, rad * 0.35, q.x, q.y, gr);
          g.addColorStop(0, "rgba(121,204,168," + (0.3 * k * (0.35 + 0.65 * fr)).toFixed(3) + ")");
          g.addColorStop(1, "rgba(171,230,204,0)");
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(q.x, q.y, gr, 0, Math.PI * 2); ctx.fill();

          ctx.globalAlpha = (0.55 + 0.45 * fr) * (0.5 + 0.5 * k);
          if (soft) {
            var sg = ctx.createRadialGradient(q.x, q.y, rad * 0.25, q.x, q.y, rad * 1.25);
            sg.addColorStop(0, tone.mid);
            sg.addColorStop(0.55, tone.edge);
            sg.addColorStop(1, "rgba(36,102,73,0)");
            ctx.fillStyle = sg;
            ctx.beginPath(); ctx.arc(q.x, q.y, rad * 1.25, 0, Math.PI * 2); ctx.fill();
          } else {
            var bg = ctx.createRadialGradient(q.x - rad * 0.36, q.y - rad * 0.44, rad * 0.06, q.x, q.y, rad);
            bg.addColorStop(0, "#FFFFFF");
            bg.addColorStop(0.2, tone.hi);
            bg.addColorStop(0.6, tone.mid);
            bg.addColorStop(1, tone.edge);
            ctx.fillStyle = bg;
            ctx.beginPath(); ctx.arc(q.x, q.y, rad, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 0.8 * fr * k;
            ctx.fillStyle = "#FFFFFF";
            ctx.beginPath();
            ctx.ellipse(q.x - rad * 0.34, q.y - rad * 0.44, rad * 0.3, rad * 0.22, -0.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        } else {
          var ur = rad * 0.84;
          ctx.globalAlpha = 0.5 + 0.45 * fr;
          if (soft) {
            var ug = ctx.createRadialGradient(q.x, q.y, ur * 0.25, q.x, q.y, ur * 1.3);
            ug.addColorStop(0, "#E4E7EC");
            ug.addColorStop(0.5, "#E4E7EC");
            ug.addColorStop(1, "rgba(228,231,236,0)");
            ctx.fillStyle = ug;
            ctx.beginPath(); ctx.arc(q.x, q.y, ur * 1.3, 0, Math.PI * 2); ctx.fill();
          } else {
            var dg = ctx.createRadialGradient(q.x - ur * 0.3, q.y - ur * 0.38, ur * 0.08, q.x, q.y, ur);
            dg.addColorStop(0, "#FFFFFF");
            dg.addColorStop(0.5, "#E4E7EC");
            dg.addColorStop(1, "#D0D5DD");
            ctx.fillStyle = dg;
            ctx.beginPath(); ctx.arc(q.x, q.y, ur, 0, Math.PI * 2); ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
      }

      // A breath of light at the core so the number always sits clear.
      var scrim = ctx.createRadialGradient(cx, cy, 6, cx, cy, 70);
      scrim.addColorStop(0, "rgba(252,253,253,0.92)");
      scrim.addColorStop(0.58, "rgba(252,253,253,0.7)");
      scrim.addColorStop(1, "rgba(252,253,253,0)");
      ctx.fillStyle = scrim;
      ctx.beginPath(); ctx.arc(cx, cy, 70, 0, Math.PI * 2); ctx.fill();

      if (!reduce) raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return { dispose: function () { alive = false; cancelAnimationFrame(raf); el.innerHTML = ""; } };
  };
})();
