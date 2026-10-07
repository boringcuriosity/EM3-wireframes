(function () {
  window.HEROES = window.HEROES || {};

  /* A lime cut in half, face on. Thirteen segments; the ones that are full of
     juice are the day's sufficiency, the drained ones are what is still to
     come. Food, rather than a gauge that happens to be green. */
  window.HEROES.citrus = function (el, opts) {
    var score = (opts && opts.score) || 0;
    var W = 342, H = 320, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cx = 171, cy = 144;
    var R_OUT = 122;   // outside of the rind
    var R_RIND = 113;  // rind meets pith
    var R_PITH = 103;  // pith meets the segments
    var R_IN = 46;     // core disc the number sits on
    var N = 13;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

    el.style.position = "relative";
    var cv = document.createElement("canvas");
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.cssText = "position:absolute;inset:0;width:" + W + "px;height:" + H + "px;display:block";
    el.appendChild(cv);
    var ctx = cv.getContext("2d");
    ctx.scale(dpr, dpr);

    // The number sits in the fruit's core, the label under the whole fruit.
    var label = document.createElement("div");
    label.style.cssText = "position:absolute;left:0;top:0;width:" + W + "px;height:" + H + "px;pointer-events:none";
    label.innerHTML =
      '<div style="position:absolute;left:0;right:0;top:' + (cy - 33) + 'px;display:flex;justify-content:center;align-items:flex-start;' +
      'transform:translateX(3px);color:#101828;font-family:\'Playfair Display\',Georgia,serif;font-weight:600;line-height:1">' +
      '<span class="n" style="font-size:52px;letter-spacing:-1px">0</span>' +
      '<span style="font-size:19px;margin:6px 0 0 2px;color:#2A805A">%</span></div>' +
      '<div style="position:absolute;left:0;right:0;top:' + (cy + R_OUT + 16) + 'px;text-align:center;' +
      'font:700 11px Roboto,Arial,sans-serif;letter-spacing:2.2px;color:#2A805A">SUFFICIENT</div>';
    el.appendChild(label);
    var numEl = label.querySelector(".n");

    var pt = function (a, r) { return { x: cx + Math.sin(a) * r, y: cy - Math.cos(a) * r }; };
    var seed = 19;
    var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

    // Segments taper toward the core, the way real ones do.
    var STEP = (Math.PI * 2) / N;
    var halfOut = STEP / 2 - 0.030;
    var halfIn = halfOut * 0.52;
    var halfAt = function (r) {
      var t = (r - R_IN) / (R_PITH - R_IN);
      return halfIn + (halfOut - halfIn) * Math.max(0, Math.min(1, t));
    };

    function segPath(mid, rIn, rOut) {
      var i, r, a, p, steps = 9;
      ctx.beginPath();
      for (i = 0; i <= steps; i++) {
        r = rOut + (rIn - rOut) * (i / steps); a = mid + halfAt(r); p = pt(a, r);
        i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
      }
      var aI0 = mid + halfAt(rIn), aI1 = mid - halfAt(rIn);
      for (i = 1; i <= 5; i++) { p = pt(aI0 + (aI1 - aI0) * (i / 5), rIn); ctx.lineTo(p.x, p.y); }
      for (i = 1; i <= steps; i++) {
        r = rIn + (rOut - rIn) * (i / steps); a = mid - halfAt(r); p = pt(a, r);
        ctx.lineTo(p.x, p.y);
      }
      var aO0 = mid - halfAt(rOut), aO1 = mid + halfAt(rOut);
      for (i = 1; i <= 8; i++) { p = pt(aO0 + (aO1 - aO0) * (i / 8), rOut); ctx.lineTo(p.x, p.y); }
      ctx.closePath();
    }

    // Juice vesicles, seeded once so they never jump between frames.
    var segs = [];
    for (var s = 0; s < N; s++) {
      var mid = s * STEP + STEP / 2;
      var ves = [];
      for (var v = 0; v < 34; v++) {
        // Packed a little denser toward the peel, the way real pulp is.
        var tr = Math.pow(0.08 + rnd() * 0.9, 0.78);
        var vr = R_IN + tr * (R_PITH - R_IN);
        var va = mid + (rnd() * 2 - 1) * halfAt(vr) * 0.86;
        ves.push({ r: vr, a: va, len: 1.4 + rnd() * 2.2, w: 0.9 + rnd() * 1.3, al: 0.16 + rnd() * 0.32, br: rnd() });
      }
      segs.push({ mid: mid, ves: ves, done: -1 });
    }

    // Peel oil glands, and a few juice droplets resting on the plate.
    var glands = [];
    for (var g = 0; g < 120; g++) {
      var ga = rnd() * Math.PI * 2, gr = R_RIND + 1.5 + rnd() * (R_OUT - R_RIND - 3);
      glands.push({ a: ga, r: gr, s: 0.5 + rnd() * 1.1, al: 0.06 + rnd() * 0.13 });
    }
    var drops = [
      { x: 66, y: 246, r: 5, ph: 0.2 }, { x: 286, y: 214, r: 3.6, ph: 1.7 }, { x: 268, y: 58, r: 2.8, ph: 3.1 }
    ];

    var easeOut = function (x) { return 1 - Math.pow(1 - x, 3); };
    var t0 = performance.now(), raf = 0, alive = true;

    function juice(rIn, rOut) {
      var gr = ctx.createRadialGradient(cx, cy, rIn, cx, cy, rOut);
      gr.addColorStop(0, "#79CCA8");
      gr.addColorStop(0.45, "#299D6B");
      gr.addColorStop(1, "#2A805A");
      return gr;
    }

    function drawVesicles(seg, filled, upTo) {
      for (var i = 0; i < seg.ves.length; i++) {
        var q = seg.ves[i];
        if (filled && q.r > upTo) continue;
        var p = pt(q.a, q.r);
        var rot = Math.atan2(-Math.cos(q.a), Math.sin(q.a));
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, q.len, q.w, 0, 0, Math.PI * 2);
        ctx.fillStyle = filled
          ? (q.br > 0.86 ? "rgba(230,250,241," + (0.42 + q.al * 0.4) + ")" : (q.br > 0.45 ? "rgba(203,240,224," + q.al + ")" : "rgba(121,204,168," + (q.al * 0.9) + ")"))
          : (q.br > 0.6 ? "rgba(255,255,255,0.45)" : "rgba(208,213,221," + (0.14 + q.al * 0.24) + ")");
        ctx.fill();
        ctx.restore();
      }
    }

    function frame(now) {
      if (!alive) return;
      var t = (now - t0) / 1000;
      var p = reduce ? 1 : easeOut(Math.min(t / 1.2, 1));
      numEl.textContent = Math.round(score * p);
      var litF = (score / 100) * N * p;

      ctx.clearRect(0, 0, W, H);

      // Contact shadow, so the fruit sits on the page.
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy + R_OUT - 2, R_OUT * 0.72, 12, 0, 0, Math.PI * 2);
      var sh = ctx.createRadialGradient(cx, cy + R_OUT - 2, 2, cx, cy + R_OUT - 2, R_OUT * 0.72);
      sh.addColorStop(0, "rgba(29,77,56,0.16)");
      sh.addColorStop(1, "rgba(29,77,56,0)");
      ctx.fillStyle = sh;
      ctx.fill();
      ctx.restore();

      // Fresh glow around the fruit.
      var glow = ctx.createRadialGradient(cx, cy, R_OUT * 0.6, cx, cy, R_OUT + 44);
      glow.addColorStop(0, "rgba(230,250,241,0.85)");
      glow.addColorStop(0.6, "rgba(243,252,248,0.45)");
      glow.addColorStop(1, "rgba(250,255,253,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, R_OUT + 44, 0, Math.PI * 2);
      ctx.fill();

      // Pith: the white body the segments sit in.
      ctx.beginPath();
      ctx.arc(cx, cy, R_RIND, 0, Math.PI * 2);
      ctx.fillStyle = "#F6FBF8";
      ctx.fill();

      // Segments.
      for (var i = 0; i < N; i++) {
        var seg = segs[i];
        var k = Math.max(0, Math.min(1, litF - i));
        if (k >= 1 && seg.done < 0) seg.done = reduce ? -999 : t;
        var age = seg.done >= 0 ? t - seg.done : 99;
        var e = Math.max(0, 1 - age / 0.45);
        var bump = e * e;
        var rOut = R_PITH * (1 + 0.022 * bump);
        var rIn = R_IN * (1 - 0.02 * bump);

        segPath(seg.mid, rIn, rOut);
        ctx.save();
        ctx.clip();

        if (k >= 1) {
          ctx.fillStyle = juice(rIn, rOut);
          ctx.fillRect(0, 0, W, H);
          drawVesicles(seg, true, rOut);
        } else {
          // Drained: pale, translucent, still waiting for the day.
          var gr = ctx.createRadialGradient(cx, cy, rIn, cx, cy, rOut);
          gr.addColorStop(0, "#F2F6F4");
          gr.addColorStop(1, "#E2E9E6");
          ctx.fillStyle = gr;
          ctx.fillRect(0, 0, W, H);
          drawVesicles(seg, false, rOut);
          if (k > 0) {
            // The one filling right now: a wet sheen and juice at the tip.
            var rK = R_IN + (R_PITH - R_IN) * k;
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, rK, 0, Math.PI * 2);
            ctx.clip();
            ctx.fillStyle = juice(rIn, rOut);
            ctx.fillRect(0, 0, W, H);
            ctx.restore();
            ctx.fillStyle = "rgba(171,230,204," + (0.10 + 0.12 * Math.sin(t * 1.6) * 0.5 + 0.06) + ")";
            ctx.fillRect(0, 0, W, H);
            var tip = pt(seg.mid, R_IN + 7);
            var tg = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 16);
            tg.addColorStop(0, "rgba(121,204,168,0.5)");
            tg.addColorStop(1, "rgba(121,204,168,0)");
            ctx.fillStyle = tg;
            ctx.fillRect(0, 0, W, H);
          }
        }

        // Gloss, upper left, so every segment reads wet.
        var hx = cx - rOut * 0.34 + Math.sin(seg.mid) * rOut * 0.3;
        var hy = cy - rOut * 0.38 - Math.cos(seg.mid) * rOut * 0.3;
        var hg = ctx.createRadialGradient(hx, hy, 1, hx, hy, rOut * 0.42);
        hg.addColorStop(0, "rgba(255,255,255," + (k >= 1 ? 0.3 : 0.5) + ")");
        hg.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = hg;
        ctx.fillRect(0, 0, W, H);

        // Depth where the pulp meets the pith.
        var ig = ctx.createRadialGradient(cx, cy, rOut * 0.7, cx, cy, rOut);
        ig.addColorStop(0, "rgba(29,77,56,0)");
        ig.addColorStop(1, k >= 1 ? "rgba(29,77,56,0.2)" : "rgba(102,112,133,0.1)");
        ctx.fillStyle = ig;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();

        // Membrane around each segment.
        segPath(seg.mid, rIn, rOut);
        ctx.strokeStyle = k >= 1 ? "rgba(250,255,253,0.9)"
          : (k > 0 ? "rgba(121,204,168,0.95)" : "rgba(252,254,253,0.9)");
        ctx.lineWidth = k > 0 && k < 1 ? 1.8 : 1.4;
        ctx.stroke();

        // A droplet of light where a segment has just filled.
        if (e > 0 && seg.done > 0) {
          var dp = pt(seg.mid, R_PITH + 5);
          var dg = ctx.createRadialGradient(dp.x, dp.y, 0, dp.x, dp.y, 3 + 9 * (1 - e));
          dg.addColorStop(0, "rgba(255,255,255," + 0.6 * e + ")");
          dg.addColorStop(0.5, "rgba(171,230,204," + 0.4 * e + ")");
          dg.addColorStop(1, "rgba(171,230,204,0)");
          ctx.fillStyle = dg;
          ctx.beginPath();
          ctx.arc(dp.x, dp.y, 3 + 9 * (1 - e), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // A slow sheen travelling over the wet pulp.
      if (!reduce) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, R_PITH, 0, Math.PI * 2);
        ctx.arc(cx, cy, R_IN, 0, Math.PI * 2, true);
        ctx.clip();
        var sa = (t / 9) * Math.PI * 2;
        var s1 = pt(sa, R_PITH), s2 = pt(sa + Math.PI, R_PITH);
        var sg = ctx.createLinearGradient(s1.x, s1.y, s2.x, s2.y);
        sg.addColorStop(0, "rgba(255,255,255,0)");
        sg.addColorStop(0.42, "rgba(255,255,255,0.16)");
        sg.addColorStop(0.5, "rgba(255,255,255,0.2)");
        sg.addColorStop(0.58, "rgba(255,255,255,0.16)");
        sg.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = sg;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      // Rind.
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R_OUT, 0, Math.PI * 2);
      ctx.arc(cx, cy, R_RIND, 0, Math.PI * 2, true);
      ctx.clip();
      var rg = ctx.createLinearGradient(cx - R_OUT, cy - R_OUT, cx + R_OUT, cy + R_OUT);
      rg.addColorStop(0, "#2A805A");
      rg.addColorStop(0.45, "#246649");
      rg.addColorStop(1, "#1D4D38");
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, W, H);
      for (var q2 = 0; q2 < glands.length; q2++) {
        var gl = glands[q2], gp = pt(gl.a, gl.r);
        ctx.beginPath();
        ctx.arc(gp.x, gp.y, gl.s, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(230,250,241," + gl.al + ")";
        ctx.fill();
      }
      // Rim light along the top left of the peel.
      var rl = ctx.createLinearGradient(cx - R_OUT, cy - R_OUT, cx, cy);
      rl.addColorStop(0, "rgba(255,255,255,0.4)");
      rl.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = rl;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // Whole fruit shading, light from the top left.
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R_OUT, 0, Math.PI * 2);
      ctx.clip();
      var fg = ctx.createRadialGradient(cx - 48, cy - 56, 10, cx + 30, cy + 46, R_OUT * 1.5);
      fg.addColorStop(0, "rgba(255,255,255,0.16)");
      fg.addColorStop(0.55, "rgba(255,255,255,0)");
      fg.addColorStop(1, "rgba(36,102,73,0.1)");
      ctx.fillStyle = fg;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // Core: the plate the number reads from.
      var cg = ctx.createRadialGradient(cx - 10, cy - 12, 4, cx, cy, R_IN);
      cg.addColorStop(0, "#FFFFFF");
      cg.addColorStop(0.7, "#FAFFFD");
      cg.addColorStop(1, "#EFF7F3");
      ctx.beginPath();
      ctx.arc(cx, cy, R_IN, 0, Math.PI * 2);
      ctx.fillStyle = cg;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(203,240,224,0.9)";
      ctx.stroke();

      // Juice droplets on the plate.
      for (var d = 0; d < drops.length; d++) {
        var dr = drops[d];
        var tw = reduce ? 1 : 0.82 + Math.sin(t * 0.7 + dr.ph) * 0.18;
        var dgr = ctx.createRadialGradient(dr.x - dr.r * 0.3, dr.y - dr.r * 0.4, 0.5, dr.x, dr.y, dr.r);
        dgr.addColorStop(0, "rgba(255,255,255," + 0.9 * tw + ")");
        dgr.addColorStop(0.55, "rgba(203,240,224," + 0.75 * tw + ")");
        dgr.addColorStop(1, "rgba(171,230,204," + 0.25 * tw + ")");
        ctx.beginPath();
        ctx.arc(dr.x, dr.y, dr.r, 0, Math.PI * 2);
        ctx.fillStyle = dgr;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(dr.x - dr.r * 0.32, dr.y - dr.r * 0.42, dr.r * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255," + 0.9 * tw + ")";
        ctx.fill();
      }

      if (!reduce) raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return { dispose: function () { alive = false; cancelAnimationFrame(raf); el.innerHTML = ""; } };
  };
})();
