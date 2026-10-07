(function () {
  window.HEROES = window.HEROES || {};

  /* A honeycomb of ingredient chips. One true honeycomb ring is twelve cells,
     so the day fills twelve: six are full, the seventh is filling, the rest sit
     empty and pale. Hexagons because that is the mark this app is built on, and
     food glyphs because the number is about eating, not about a gauge. */
  window.HEROES.hexfood = function (el, opts) {
    var score = (opts && opts.score) || 0;
    var W = 342, H = 320, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cx = 171, cy = 140, S = 27;                 // hex circumradius
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

    el.style.position = "relative";
    var cv = document.createElement("canvas");
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.cssText = "position:absolute;inset:0;width:" + W + "px;height:" + H + "px;display:block";
    el.appendChild(cv);
    var ctx = cv.getContext("2d");
    ctx.scale(dpr, dpr);

    var label = document.createElement("div");
    label.style.cssText = "position:absolute;left:0;top:0;width:" + W + "px;height:" + H + "px;pointer-events:none";
    label.innerHTML =
      '<div style="position:absolute;left:0;right:0;top:' + (cy - 31) + 'px;display:flex;justify-content:center;align-items:flex-start;' +
      'color:#101828;font-family:\'Playfair Display\',Georgia,serif;font-weight:600;line-height:1">' +
      '<span class="n" style="font-size:48px;letter-spacing:-1px">0</span>' +
      '<span style="font-size:18px;margin:5px 0 0 2px;color:#2A805A">%</span></div>' +
      '<div style="position:absolute;left:0;right:0;top:' + (cy + 118) + 'px;text-align:center;' +
      'font:700 11px Roboto,Arial,sans-serif;letter-spacing:2.2px;color:#2A805A">SUFFICIENT</div>';
    el.appendChild(label);
    var numEl = label.querySelector(".n");

    /* ---------- the ring of cells ---------- */
    var cells = [];
    for (var q = -2; q <= 2; q++) {
      for (var r = -2; r <= 2; r++) {
        if ((Math.abs(q) + Math.abs(q + r) + Math.abs(r)) / 2 !== 2) continue;
        var x = cx + S * Math.sqrt(3) * (q + r / 2);
        var y = cy + S * 1.5 * r;
        cells.push({ x: x, y: y, a: (Math.atan2(x - cx, cy - y) + Math.PI * 2) % (Math.PI * 2) });
      }
    }
    cells.sort(function (p1, p2) { return p1.a - p2.a; });      // clockwise from 12
    var N = cells.length;                                        // 12

    function hexPath(x, y, s) {
      ctx.beginPath();
      for (var i = 0; i < 6; i++) {
        var a = (Math.PI / 180) * (60 * i - 30);
        var px = x + s * Math.cos(a), py = y + s * Math.sin(a);
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.closePath();
    }

    /* ---------- ingredient glyphs ----------
       Each draws inside a box of half size s around 0,0 with the current
       fillStyle; `accent` is the colour for the small internal details. */
    function leaf(s, accent) {
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.95, -s * 0.45, s * 0.78, s * 0.72, 0, s);
      ctx.bezierCurveTo(-s * 0.78, s * 0.72, -s * 0.95, -s * 0.45, 0, -s);
      ctx.fill();
      ctx.strokeStyle = accent; ctx.lineWidth = 1.1; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(0, s * 0.82); ctx.lineTo(0, -s * 0.74); ctx.stroke();
      for (var i = -1; i <= 1; i++) {
        var yy = i * s * 0.3;
        ctx.beginPath(); ctx.moveTo(0, yy + s * 0.12); ctx.lineTo(s * 0.44, yy - s * 0.16); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, yy + s * 0.12); ctx.lineTo(-s * 0.44, yy - s * 0.16); ctx.stroke();
      }
    }
    function grain(s, accent) {
      ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1.6; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(0, s); ctx.lineTo(0, -s * 0.35); ctx.stroke();
      for (var i = 0; i < 4; i++) {
        var yy = -s + i * s * 0.42;
        for (var sgn = -1; sgn <= 1; sgn += 2) {
          ctx.save();
          ctx.translate(sgn * s * 0.3, yy + s * 0.2);
          ctx.rotate(sgn * 0.62);
          ctx.beginPath(); ctx.ellipse(0, 0, s * 0.17, s * 0.34, 0, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
      }
      ctx.beginPath(); ctx.ellipse(0, -s * 0.78, s * 0.16, s * 0.32, 0, 0, Math.PI * 2); ctx.fill();
    }
    function egg(s, accent) {
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.62, -s * 0.62, s * 0.74, s * 0.32, 0, s);
      ctx.bezierCurveTo(-s * 0.74, s * 0.32, -s * 0.62, -s * 0.62, 0, -s);
      ctx.fill();
      ctx.fillStyle = accent;
      ctx.beginPath(); ctx.ellipse(-s * 0.22, -s * 0.28, s * 0.16, s * 0.22, -0.4, 0, Math.PI * 2); ctx.fill();
    }
    function drop(s, accent) {
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.62, -s * 0.1, s * 0.8, s * 0.3, s * 0.52, s * 0.62);
      ctx.arc(0, s * 0.36, s * 0.62, 0.55, Math.PI - 0.55);
      ctx.bezierCurveTo(-s * 0.8, s * 0.3, -s * 0.62, -s * 0.1, 0, -s);
      ctx.fill();
      ctx.fillStyle = accent;
      ctx.beginPath(); ctx.ellipse(-s * 0.2, s * 0.3, s * 0.13, s * 0.2, -0.3, 0, Math.PI * 2); ctx.fill();
    }
    function bean(s, accent) {
      var kidney = function (dx, dy, rot, k) {
        ctx.save(); ctx.translate(dx, dy); ctx.rotate(rot); ctx.scale(k, k);
        ctx.beginPath();
        ctx.moveTo(-s * 0.42, -s * 0.2);
        ctx.bezierCurveTo(-s * 0.1, -s * 0.62, s * 0.46, -s * 0.44, s * 0.44, -s * 0.02);
        ctx.bezierCurveTo(s * 0.42, s * 0.42, -s * 0.12, s * 0.5, -s * 0.34, s * 0.2);
        ctx.bezierCurveTo(-s * 0.2, s * 0.14, -s * 0.2, -s * 0.1, -s * 0.42, -s * 0.2);
        ctx.fill();
        ctx.restore();
      };
      kidney(-s * 0.18, -s * 0.3, -0.35, 0.86);
      kidney(s * 0.16, s * 0.34, 0.25, 0.92);
    }
    function milk(s, accent) {
      ctx.beginPath();
      ctx.moveTo(-s * 0.52, -s * 0.85);
      ctx.lineTo(s * 0.52, -s * 0.85);
      ctx.lineTo(s * 0.36, s * 0.78);
      ctx.quadraticCurveTo(s * 0.32, s * 0.94, s * 0.18, s * 0.94);
      ctx.lineTo(-s * 0.18, s * 0.94);
      ctx.quadraticCurveTo(-s * 0.32, s * 0.94, -s * 0.36, s * 0.78);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = accent; ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-s * 0.44, -s * 0.22);
      ctx.quadraticCurveTo(0, -s * 0.02, s * 0.44, -s * 0.22);
      ctx.stroke();
    }
    function nut(s, accent) {
      ctx.save(); ctx.rotate(-0.3);
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.95);
      ctx.bezierCurveTo(s * 0.7, -s * 0.4, s * 0.62, s * 0.62, 0, s * 0.95);
      ctx.bezierCurveTo(-s * 0.62, s * 0.62, -s * 0.7, -s * 0.4, 0, -s * 0.95);
      ctx.fill();
      ctx.strokeStyle = accent; ctx.lineWidth = 1.1; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(0, -s * 0.72); ctx.lineTo(0, s * 0.72); ctx.stroke();
      ctx.restore();
    }
    function fish(s, accent) {
      ctx.beginPath();
      ctx.moveTo(-s * 0.35, 0);
      ctx.bezierCurveTo(-s * 0.1, -s * 0.6, s * 0.5, -s * 0.44, s * 0.78, 0);
      ctx.bezierCurveTo(s * 0.5, s * 0.44, -s * 0.1, s * 0.6, -s * 0.35, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-s * 0.3, 0);
      ctx.lineTo(-s * 0.88, -s * 0.44);
      ctx.lineTo(-s * 0.88, s * 0.44);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = accent;
      ctx.beginPath(); ctx.arc(s * 0.4, -s * 0.12, s * 0.1, 0, Math.PI * 2); ctx.fill();
    }
    function tomato(s, accent) {
      ctx.beginPath(); ctx.arc(0, s * 0.18, s * 0.74, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 2.2; ctx.lineCap = "round";
      for (var i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.52);
        ctx.lineTo(i * s * 0.56, -s * 0.78);
        ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(0, -s * 0.5); ctx.lineTo(0, -s * 0.92); ctx.stroke();
    }
    function sprout(s, accent) {
      ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1.8; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(0, s * 0.9); ctx.quadraticCurveTo(0, s * 0.1, 0, -s * 0.3); ctx.stroke();
      var lobe = function (sgn) {
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.06);
        ctx.bezierCurveTo(sgn * s * 0.2, -s * 0.78, sgn * s * 0.86, -s * 0.72, sgn * s * 0.82, -s * 0.2);
        ctx.bezierCurveTo(sgn * s * 0.6, s * 0.16, sgn * s * 0.16, s * 0.08, 0, -s * 0.06);
        ctx.fill();
      };
      lobe(1); lobe(-1);
      ctx.beginPath(); ctx.ellipse(0, s * 0.82, s * 0.24, s * 0.16, 0, 0, Math.PI * 2); ctx.fill();
    }
    function ricebowl(s, accent) {
      ctx.beginPath();
      ctx.moveTo(-s * 0.9, -s * 0.06);
      ctx.quadraticCurveTo(0, s * 1.06, s * 0.9, -s * 0.06);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = accent;
      for (var i = -1; i <= 1; i++) {
        ctx.save();
        ctx.translate(i * s * 0.42, -s * 0.36 - (i === 0 ? s * 0.18 : 0));
        ctx.rotate(i * 0.5);
        ctx.beginPath(); ctx.ellipse(0, 0, s * 0.11, s * 0.24, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }
    function herb(s, accent) {
      ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1.7; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(-s * 0.1, s * 0.92); ctx.quadraticCurveTo(s * 0.26, s * 0.1, s * 0.06, -s * 0.9); ctx.stroke();
      var lf = function (yy, sgn, k) {
        ctx.save();
        ctx.translate(sgn * s * 0.08 + (yy > 0 ? s * 0.1 : 0), yy);
        ctx.rotate(sgn * 0.9);
        ctx.beginPath();
        ctx.ellipse(sgn * s * 0.3 * k, 0, s * 0.32 * k, s * 0.16 * k, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };
      lf(s * 0.5, 1, 1); lf(s * 0.46, -1, 0.9);
      lf(-s * 0.02, 1, 0.95); lf(-s * 0.06, -1, 0.85);
      lf(-s * 0.52, 1, 0.8); lf(-s * 0.56, -1, 0.7);
    }
    var GLYPHS = [leaf, grain, egg, drop, bean, milk, nut, ricebowl, tomato, sprout, herb, fish];
    for (var i = 0; i < N; i++) cells[i].g = GLYPHS[i % GLYPHS.length];

    var easeOut = function (x) { return 1 - Math.pow(1 - x, 3); };
    var t0 = performance.now(), raf = 0, alive = true;

    function drawChip(c, k, t) {
      var lifting = k > 0 && k < 1 ? Math.sin(Math.min(1, k) * Math.PI) : 0;
      var settle = c.done >= 0 ? Math.max(0, 1 - (t - c.done) / 0.4) : 0;
      var lift = (lifting * 3.4) + (settle * settle * 4);
      var x = c.x, y = c.y - lift;
      var s = S - 0.9;

      // Shadow under a raised chip.
      if (k > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(x, y + s * 0.98 + 5 + lift * 0.6, s * 0.78, 5.5, 0, 0, Math.PI * 2);
        var sg = ctx.createRadialGradient(x, y + s * 0.98 + 5 + lift * 0.6, 1, x, y + s * 0.98 + 5 + lift * 0.6, s * 0.78);
        sg.addColorStop(0, "rgba(29,77,56," + (0.16 + 0.1 * Math.min(1, k) + lift * 0.01) + ")");
        sg.addColorStop(1, "rgba(29,77,56,0)");
        ctx.fillStyle = sg;
        ctx.fill();
        ctx.restore();
      }

      // Empty cell: white, walled, and slightly hollow, the way an unfilled
      // comb reads.
      hexPath(x, y, s);
      var eg = ctx.createLinearGradient(x, y - s, x, y + s);
      eg.addColorStop(0, "#FBFDFC");
      eg.addColorStop(1, "#FFFFFF");
      ctx.fillStyle = eg;
      ctx.fill();
      ctx.save();
      hexPath(x, y, s);
      ctx.clip();
      var hollow = ctx.createLinearGradient(x, y - s, x, y - s * 0.1);
      hollow.addColorStop(0, "rgba(102,112,133,0.13)");
      hollow.addColorStop(1, "rgba(102,112,133,0)");
      ctx.fillStyle = hollow;
      ctx.fillRect(x - s, y - s, s * 2, s);
      ctx.restore();
      hexPath(x, y, s);
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = "#D5DCD9";
      ctx.stroke();

      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = "#C3CCD4";
      c.g(13, "#FFFFFF");
      ctx.restore();

      if (k <= 0) return;

      // Filled part, rising from the bottom of the cell.
      ctx.save();
      hexPath(x, y, s);
      ctx.clip();
      var top = y + s - 2 * s * Math.min(1, k);
      ctx.beginPath();
      ctx.rect(x - s, top, s * 2, y + s - top + 1);
      ctx.clip();
      var fg = ctx.createLinearGradient(x, y - s, x, y + s);
      fg.addColorStop(0, "#59B38C");
      fg.addColorStop(0.45, "#299D6B");
      fg.addColorStop(1, "#246649");
      ctx.fillStyle = fg;
      ctx.fillRect(x - s, y - s, s * 2, s * 2);
      // Gloss across the top third.
      var gg = ctx.createLinearGradient(x, y - s, x, y + s * 0.1);
      gg.addColorStop(0, "rgba(255,255,255,0.34)");
      gg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gg;
      ctx.fillRect(x - s, y - s, s * 2, s * 1.1);
      // Surface line where the fill has reached.
      if (k < 1) {
        ctx.fillStyle = "rgba(230,250,241,0.85)";
        ctx.fillRect(x - s, top, s * 2, 1.6);
      }
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      c.g(13, "rgba(36,102,73,0.45)");
      ctx.restore();
      ctx.restore();

      // Wall of a filled cell, and a light catching its top edge.
      hexPath(x, y, s);
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = k >= 1 ? "rgba(36,102,73,0.5)" : "rgba(121,204,168,0.85)";
      ctx.stroke();
      if (k >= 1) {
        ctx.save();
        hexPath(x, y, s);
        ctx.clip();
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - s * 0.82, y - s * 0.46);
        ctx.lineTo(x, y - s * 0.95);
        ctx.lineTo(x + s * 0.82, y - s * 0.46);
        ctx.stroke();
        ctx.restore();
      }
    }

    for (var c0 = 0; c0 < N; c0++) cells[c0].done = -1;

    function frame(now) {
      if (!alive) return;
      var t = Math.max(0, (now - t0) / 1000);
      var p = reduce ? 1 : easeOut(Math.max(0, Math.min(t / 1.2, 1)));
      numEl.textContent = Math.round(score * p);
      var litF = (score / 100) * N * p;

      ctx.clearRect(0, 0, W, H);

      // Warm light behind the comb.
      var glow = ctx.createRadialGradient(cx, cy, 30, cx, cy, 160);
      glow.addColorStop(0, "rgba(230,250,241,0.9)");
      glow.addColorStop(0.6, "rgba(243,252,248,0.5)");
      glow.addColorStop(1, "rgba(250,255,253,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(cx, cy, 160, 0, Math.PI * 2); ctx.fill();

      for (var i2 = 0; i2 < N; i2++) {
        var c = cells[i2];
        var k = Math.max(0, Math.min(1, litF - i2));
        if (k >= 1 && c.done < 0) c.done = reduce ? -999 : t;
        drawChip(c, k, t);
      }

      if (!reduce) raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return { dispose: function () { alive = false; cancelAnimationFrame(raf); el.innerHTML = ""; } };
  };
})();
