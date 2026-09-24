/* Seed Jar: glossy green pebbles pour into a glass jar and settle at the
   day's sufficiency level, while the number counts up beside it.
   Canvas 2D with shaded ellipses rather than three.js: it renders the same
   everywhere, including headless, and the packing is precomputed so the pile
   always lands exactly on the score. */
(function () {
  window.HEROES = window.HEROES || {};

  var GREENS = ["#79CCA8", "#59B38C", "#299D6B", "#2A805A", "#246649"];

  // Small deterministic PRNG so the pile looks the same on every load.
  function rng(seed) {
    return function () {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
  }

  function mix(hex, to, t) {
    var a = parseInt(hex.slice(1), 16), b = parseInt(to.slice(1), 16);
    var r = Math.round(((a >> 16) & 255) * (1 - t) + ((b >> 16) & 255) * t);
    var g = Math.round(((a >> 8) & 255) * (1 - t) + ((b >> 8) & 255) * t);
    var bl = Math.round((a & 255) * (1 - t) + (b & 255) * t);
    return "rgb(" + r + "," + g + "," + bl + ")";
  }

  window.HEROES.jar = function (el, opts) {
    var score = Math.max(0, Math.min(100, (opts && opts.score) || 0));
    var W = 342, H = 320;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    el.innerHTML = "";
    var canvas = document.createElement("canvas");
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.cssText = "position:absolute;left:0;top:0;width:" + W + "px;height:" + H + "px;";
    el.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    // Number column, as real text so it stays crisp.
    var label = document.createElement("div");
    label.style.cssText =
      "position:absolute;left:198px;top:104px;width:136px;display:flex;flex-direction:column;align-items:flex-start;";
    label.innerHTML =
      '<div style="display:flex;align-items:flex-start;color:#1D4D38;">' +
      '<span data-n style="font-family:\'Playfair Display\',Georgia,serif;font-weight:600;font-size:68px;line-height:68px;letter-spacing:-1px;">0</span>' +
      '<span style="font-family:\'Playfair Display\',Georgia,serif;font-weight:600;font-size:26px;line-height:34px;margin-left:2px;">%</span></div>' +
      '<div style="font-family:Roboto,Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:2.2px;color:#2A805A;margin-top:6px;">SUFFICIENT</div>' +
      '<div style="font-family:Roboto,Arial,sans-serif;font-size:12px;line-height:17px;color:#667085;margin-top:10px;width:118px;white-space:normal;">of today&#39;s nutrition target</div>';
    el.appendChild(label);
    var numEl = label.querySelector("[data-n]");

    // Jar geometry.
    var jx = 104, top = 62, bottom = 292, halfW = 72;
    var innerL = jx - halfW + 7, innerR = jx + halfW - 7;
    var innerTop = top + 30, innerBottom = bottom - 8;
    var level = innerBottom - (innerBottom - innerTop) * (score / 100);

    function jarPath(c, inset) {
      var l = jx - halfW + inset, r = jx + halfW - inset;
      var t = top + 14 + inset * 0.6, b = bottom - inset * 0.4, rad = 26 - inset;
      c.beginPath();
      c.moveTo(l + 10, t);
      c.quadraticCurveTo(l, t + 4, l, t + 22); // shoulder
      c.lineTo(l, b - rad);
      c.quadraticCurveTo(l, b, l + rad, b);
      c.lineTo(r - rad, b);
      c.quadraticCurveTo(r, b, r, b - rad);
      c.lineTo(r, t + 22);
      c.quadraticCurveTo(r, t + 4, r - 10, t);
      c.closePath();
    }

    // Precompute the settled pile: staggered rows from the bottom up to the level.
    var rand = rng(7);
    var pebbles = [];
    var row = 0;
    for (var y = innerBottom - 9; y > level - 10; y -= 13.5) {
      var off = row % 2 ? 9 : 0;
      for (var x = innerL + 9 + off; x < innerR - 6; x += 18) {
        var px = x + (rand() - 0.5) * 4, py = y + (rand() - 0.5) * 3;
        // A gentle mound: the heap sits a little higher in the middle, so the
        // surface reads as poured rather than stacked, and averages the level.
        var u = (px - jx) / (innerR - jx);
        var surface = level + 5 - 9 * (1 - u * u);
        if (py < surface) continue;
        if (py < surface + 12 && rand() < 0.12) continue;
        // Keep pebbles out of the rounded bottom corners.
        var dx = Math.max(0, Math.max(innerL + 22 - px, px - (innerR - 22)));
        var dy = Math.max(0, py - (innerBottom - 22));
        if (dx > 0 && dy > 0 && Math.sqrt(dx * dx + dy * dy) > 15) continue;
        pebbles.push({
          x: px,
          y: py,
          rx: 10.5 + rand() * 2,
          ry: 7.8 + rand() * 1.4,
          rot: (rand() - 0.5) * 1.3,
          col: GREENS[Math.floor(rand() * GREENS.length)],
          delay: 0,
          shimmer: 0,
        });
      }
      row++;
    }
    var N = pebbles.length;
    pebbles.forEach(function (p, i) {
      // Bottom rows first, with a little shuffle inside a row.
      p.delay = (i / N) * 950 + rand() * 90;
      p.dropFrom = -30 - rand() * 60;
      p.drift = (rand() - 0.5) * 16;
    });

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
    function bounce(t) {
      // Fall with a small settle bounce at the end.
      if (t < 0.78) return Math.pow(t / 0.78, 2);
      var s = (t - 0.78) / 0.22;
      return 1 - Math.sin(s * Math.PI) * 0.06;
    }

    function drawPebble(p, x, y, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(p.rot);
      // Body with light from the upper left.
      var g = ctx.createRadialGradient(-p.rx * 0.35, -p.ry * 0.45, 1, 0, 0, p.rx * 1.15);
      g.addColorStop(0, mix(p.col, "#FFFFFF", 0.45 + p.shimmer * 0.3));
      g.addColorStop(0.45, p.col);
      g.addColorStop(1, mix(p.col, "#10261C", 0.35));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.rx, p.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      // Specular glint.
      ctx.fillStyle = "rgba(255,255,255," + (0.55 + p.shimmer * 0.4) + ")";
      ctx.beginPath();
      ctx.ellipse(-p.rx * 0.38, -p.ry * 0.42, p.rx * 0.28, p.ry * 0.16, -0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawBack() {
      // Soft shadow on the table.
      var sh = ctx.createRadialGradient(jx, bottom + 6, 4, jx, bottom + 6, halfW + 14);
      sh.addColorStop(0, "rgba(42,128,90,0.16)");
      sh.addColorStop(1, "rgba(29,77,56,0)");
      ctx.fillStyle = sh;
      ctx.beginPath();
      ctx.ellipse(jx, bottom + 6, halfW + 14, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glass body tint.
      jarPath(ctx, 0);
      var body = ctx.createLinearGradient(jx - halfW, 0, jx + halfW, 0);
      body.addColorStop(0, "rgba(203,240,224,0.35)");
      body.addColorStop(0.5, "rgba(243,252,248,0.18)");
      body.addColorStop(1, "rgba(171,230,204,0.32)");
      ctx.fillStyle = body;
      ctx.fill();

      // Back rim.
      ctx.strokeStyle = "rgba(121,204,168,0.45)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(jx, top + 14, halfW - 10, 9, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
    }

    function drawFront() {
      // Target line near the top.
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(42,128,90,0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(innerL + 4, innerTop);
      ctx.lineTo(innerR - 4, innerTop);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = "#59B38C";
      ctx.font = "600 9px Roboto, Arial, sans-serif";
      ctx.fillText("100%", innerR - 27, innerTop + 12);

      // Glass outline.
      jarPath(ctx, 0);
      ctx.strokeStyle = "rgba(89,179,140,0.55)";
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Left highlight stripe.
      var hl = ctx.createLinearGradient(jx - halfW + 8, 0, jx - halfW + 24, 0);
      hl.addColorStop(0, "rgba(255,255,255,0)");
      hl.addColorStop(0.5, "rgba(255,255,255,0.75)");
      hl.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = hl;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(jx - halfW + 9, top + 44, 14, bottom - top - 90, 7)
                    : ctx.rect(jx - halfW + 9, top + 44, 14, bottom - top - 90);
      ctx.fill();
      // Thin right reflection.
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(jx + halfW - 12, top + 60);
      ctx.lineTo(jx + halfW - 12, top + 110);
      ctx.stroke();

      // Front rim and lip.
      var rim = ctx.createLinearGradient(0, top + 4, 0, top + 24);
      rim.addColorStop(0, "rgba(255,255,255,0.95)");
      rim.addColorStop(1, "rgba(171,230,204,0.6)");
      ctx.strokeStyle = rim;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(jx, top + 14, halfW - 10, 9, 0, 0, Math.PI);
      ctx.stroke();
      ctx.strokeStyle = "rgba(89,179,140,0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(jx, top + 14, halfW - 10, 9, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    function frame(now) {
      ctx.clearRect(0, 0, W, H);
      drawBack();
      ctx.save();
      jarPath(ctx, 3);
      ctx.clip();
      var t = now;
      for (var i = 0; i < pebbles.length; i++) {
        var p = pebbles[i];
        var local = reduce ? 1 : (t - p.delay) / 520;
        if (local <= 0) continue;
        local = Math.min(1, local);
        var k = bounce(local);
        var y = p.dropFrom + (p.y - p.dropFrom) * k;
        var x = p.x + p.drift * (1 - k);
        drawPebble(p, x, y, Math.min(1, local * 3));
      }
      // A faint liquid-like sheen over the pile surface.
      ctx.restore();
      drawFront();
    }

    var start = null, raf = 0, disposed = false;
    var nextShimmer = 2600;

    function loop(ts) {
      if (disposed) return;
      if (start === null) start = ts;
      var t = ts - start;
      var c = Math.min(1, t / 1200);
      numEl.textContent = String(Math.round(score * easeOut(c)));

      // Idle: every few seconds one surface pebble catches the light.
      if (t > nextShimmer) {
        var topOnes = pebbles.slice(-Math.max(6, Math.round(N * 0.18)));
        topOnes[Math.floor(Math.random() * topOnes.length)].shimmerStart = t;
        nextShimmer = t + 4200 + Math.random() * 1800;
      }
      for (var i = 0; i < N; i++) {
        var p = pebbles[i];
        if (p.shimmerStart != null) {
          var s = (t - p.shimmerStart) / 1400;
          p.shimmer = s >= 1 ? 0 : Math.sin(s * Math.PI);
          if (s >= 1) p.shimmerStart = null;
        }
      }
      frame(t);
      raf = requestAnimationFrame(loop);
    }

    if (reduce) {
      numEl.textContent = String(score);
      frame(99999);
    } else {
      raf = requestAnimationFrame(loop);
    }

    return {
      dispose: function () {
        disposed = true;
        cancelAnimationFrame(raf);
        el.innerHTML = "";
      },
    };
  };
})();
