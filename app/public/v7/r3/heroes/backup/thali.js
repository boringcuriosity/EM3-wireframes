(function () {
  window.HEROES = window.HEROES || {};

  /* A thali read as the day. Six katoris sit around the tray, one per meal in
     clock order, filled as they are logged. The tray's own rim is the gauge:
     it glows green for as much of the day as is sufficient. */
  window.HEROES.thali = function (el, opts) {
    var score = (opts && opts.score) || 0;
    var W = 342, H = 320;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cx = 171, cy = 146;
    var R_OUT = 128, R_IN = 117, R_GAUGE = 122.5, R_KAT = 87, KR = 23.5;
    var LOGGED = 3, MEALS = 6, TAU = Math.PI * 2;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

    el.style.position = "relative";
    var cv = document.createElement("canvas");
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.cssText = "position:absolute;inset:0;width:" + W + "px;height:" + H + "px;display:block";
    el.appendChild(cv);
    var ctx = cv.getContext("2d");
    ctx.scale(dpr, dpr);

    var label = document.createElement("div");
    label.style.cssText = "position:absolute;left:0;right:0;top:" + (cy - 48) + "px;display:flex;flex-direction:column;align-items:center;pointer-events:none";
    label.innerHTML =
      '<div style="display:flex;align-items:flex-start;color:#1D4D38;font-family:\'Playfair Display\',Georgia,serif;font-weight:600;line-height:1">' +
      '<span class="n" style="font-size:54px;letter-spacing:-1px">0</span>' +
      '<span style="font-size:18px;margin:7px 0 0 2px;color:#2A805A">%</span></div>' +
      '<div style="margin-top:7px;font:700 11px Roboto,Arial,sans-serif;letter-spacing:2.2px;color:#2A805A">SUFFICIENT</div>' +
      '<div class="m" style="margin-top:5px;font:400 11px Roboto,Arial,sans-serif;color:#667085;opacity:0">3 of 6 meals</div>';
    el.appendChild(label);
    var numEl = label.querySelector(".n");
    var mealEl = label.querySelector(".m");

    /* Seeded, so the food never reshuffles between renders. */
    var seed = 11;
    var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var kat = [];
    for (var i = 0; i < MEALS; i++) {
      var a = (-90 + i * 60) * Math.PI / 180;
      var blobs = [];
      for (var b = 0; b < 7; b++) {
        blobs.push({ dx: (rnd() - 0.5) * 1.05, dy: (rnd() - 0.5) * 1.0, r: 0.12 + rnd() * 0.16, light: rnd() > 0.45 });
      }
      kat.push({
        a: a,
        x: cx + Math.cos(a) * R_KAT,
        y: cy + Math.sin(a) * R_KAT,
        blobs: blobs,
        logged: i < LOGGED,
        dish: i % 3,
        ph: rnd() * TAU
      });
    }

    var easeOut = function (x) { return 1 - Math.pow(1 - x, 3); };
    var clamp01 = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };

    function ring(r, w, style) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.lineWidth = w;
      ctx.strokeStyle = style;
      ctx.stroke();
    }

    /* Brushed sheen for the rim. Conic where the browser has it, a diagonal
       fallback where it does not. */
    function rimSheen(t) {
      var stops = [
        [0, "#FFFFFF"], [0.12, "#F2F4F7"], [0.26, "#FFFFFF"], [0.42, "#EDF1F4"],
        [0.58, "#FFFFFF"], [0.72, "#F2F4F7"], [0.88, "#FCFDFD"], [1, "#FFFFFF"]
      ];
      var g;
      if (ctx.createConicGradient) {
        g = ctx.createConicGradient(t * 0.08, cx, cy);
      } else {
        g = ctx.createLinearGradient(cx - R_OUT, cy - R_OUT, cx + R_OUT, cy + R_OUT);
      }
      stops.forEach(function (s) { g.addColorStop(s[0], s[1]); });
      return g;
    }

    function tray(t) {
      // the tray's shadow on the page
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy + R_OUT - 4, R_OUT * 0.86, 16, 0, 0, TAU);
      var sh = ctx.createRadialGradient(cx, cy + R_OUT - 4, 2, cx, cy + R_OUT - 4, R_OUT * 0.86);
      sh.addColorStop(0, "rgba(29,77,56,0.13)");
      sh.addColorStop(1, "rgba(29,77,56,0)");
      ctx.fillStyle = sh;
      ctx.fill();
      ctx.restore();

      // the well
      var well = ctx.createRadialGradient(cx - 34, cy - 44, 18, cx, cy, R_OUT);
      well.addColorStop(0, "#FFFFFF");
      well.addColorStop(0.55, "#FAFDFB");
      well.addColorStop(1, "#E6F1EC");
      ctx.beginPath();
      ctx.arc(cx, cy, R_OUT, 0, TAU);
      ctx.fillStyle = well;
      ctx.fill();

      // the well sits a little lower than the rim
      var inner = ctx.createRadialGradient(cx, cy, R_IN - 26, cx, cy, R_IN);
      inner.addColorStop(0, "rgba(29,77,56,0)");
      inner.addColorStop(1, "rgba(29,77,56,0.10)");
      ctx.beginPath();
      ctx.arc(cx, cy, R_IN, 0, TAU);
      ctx.fillStyle = inner;
      ctx.fill();

      // the raised rim, then its bevel edges
      ring(R_GAUGE, 11, rimSheen(t));
      ring(R_IN + 0.6, 1.4, "rgba(255,255,255,0.95)");
      ring(R_OUT - 0.6, 1.2, "rgba(29,77,56,0.16)");
      ring(R_IN - 15, 1, "rgba(41,157,107,0.08)");
    }

    function gauge(p, t) {
      var sweep = TAU * (score / 100) * p;
      ctx.save();
      ctx.lineCap = "round";
      ring(R_GAUGE, 6.5, "rgba(206,219,213,0.45)");
      if (sweep > 0.004) {
        var g = ctx.createLinearGradient(cx - R_GAUGE, cy - R_GAUGE, cx + R_GAUGE, cy + R_GAUGE);
        g.addColorStop(0, "#79CCA8");
        g.addColorStop(0.5, "#42A87B");
        g.addColorStop(1, "#2A805A");
        ctx.beginPath();
        ctx.arc(cx, cy, R_GAUGE, -Math.PI / 2, -Math.PI / 2 + sweep);
        ctx.lineWidth = 6;
        ctx.strokeStyle = g;
        ctx.stroke();
        // a highlight along the top of the band keeps it part of the rim
        ctx.beginPath();
        ctx.arc(cx, cy, R_GAUGE - 1.9, -Math.PI / 2, -Math.PI / 2 + sweep);
        ctx.lineWidth = 1.1;
        ctx.strokeStyle = "rgba(255,255,255,0.32)";
        ctx.stroke();

        var ha = -Math.PI / 2 + sweep;
        var hx = cx + Math.cos(ha) * R_GAUGE, hy = cy + Math.sin(ha) * R_GAUGE;
        var pulse = reduce ? 1 : 1 + Math.sin(t * 1.1) * 0.12;
        var gl = ctx.createRadialGradient(hx, hy, 0, hx, hy, 15 * pulse);
        gl.addColorStop(0, "rgba(121,204,168,0.5)");
        gl.addColorStop(1, "rgba(121,204,168,0)");
        ctx.beginPath();
        ctx.arc(hx, hy, 15 * pulse, 0, TAU);
        ctx.fillStyle = gl;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(hx, hy, 3, 0, TAU);
        ctx.fillStyle = "#F3FCF8";
        ctx.fill();
      }
      ctx.restore();
    }

    function katori(k, fill, t) {
      var x = k.x, y = k.y;

      ctx.beginPath();
      ctx.ellipse(x, y + KR * 0.62, KR * 0.88, KR * 0.34, 0, 0, TAU);
      ctx.fillStyle = "rgba(29,77,56,0.06)";
      ctx.fill();

      var body = ctx.createRadialGradient(x - KR * 0.38, y - KR * 0.46, KR * 0.12, x, y, KR);
      body.addColorStop(0, "#FFFFFF");
      body.addColorStop(0.6, "#FAFDFB");
      body.addColorStop(1, "#E4EDE8");
      ctx.beginPath();
      ctx.arc(x, y, KR, 0, TAU);
      ctx.fillStyle = body;
      ctx.fill();

      var rIn = KR - 6.5;
      if (fill <= 0.001) {
        var em = ctx.createRadialGradient(x - 4, y - 5, 2, x, y, rIn);
        em.addColorStop(0, "#FBFCFD");
        em.addColorStop(1, "#F2F4F7");
        ctx.beginPath();
        ctx.arc(x, y, rIn, 0, TAU);
        ctx.fillStyle = em;
        ctx.fill();
        ctx.save();
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.arc(x, y, rIn - 1.5, 0, TAU);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(152,162,179,0.55)";
        ctx.stroke();
        ctx.restore();
      } else {
        var r = rIn * (0.62 + 0.38 * fill);
        ctx.save();
        ctx.globalAlpha = Math.min(1, fill * 1.2);

        /* A helping of food, not a sphere: a softly lobed edge, even shading,
           and a shadow where it meets the bowl. */
        var edge = function () {
          ctx.beginPath();
          for (var s = 0; s <= 40; s++) {
            var a = (s / 40) * TAU;
            var rr = r * (1 + Math.sin(a * 3 + k.ph) * 0.045 + Math.sin(a * 5 - k.ph) * 0.022);
            var px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
            if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.closePath();
        };

        var dish = [["#9CE0C4", "#63B892", "#43A077"], ["#8AD8B6", "#52AD85", "#39936D"], ["#A6E4CC", "#6CBE99", "#4AA57E"]][k.dish];
        var food = ctx.createLinearGradient(x - r * 0.7, y - r * 0.8, x + r * 0.5, y + r);
        food.addColorStop(0, dish[0]);
        food.addColorStop(0.5, dish[1]);
        food.addColorStop(1, dish[2]);
        edge();
        ctx.fillStyle = food;
        ctx.fill();

        // grains and pieces
        ctx.save();
        edge();
        ctx.clip();
        k.blobs.forEach(function (b, bi) {
          var wob = reduce ? 0 : Math.sin(t * 0.45 + k.ph + bi) * 0.6;
          ctx.beginPath();
          ctx.ellipse(x + b.dx * r + wob, y + b.dy * r, b.r * r * 1.15, b.r * r * 0.85, bi, 0, TAU);
          ctx.fillStyle = b.light ? "rgba(203,240,224,0.55)" : "rgba(36,102,73,0.3)";
          ctx.fill();
        });
        // where the food meets the bowl
        var seat = ctx.createRadialGradient(x, y, r * 0.66, x, y, r);
        seat.addColorStop(0, "rgba(29,77,56,0)");
        seat.addColorStop(1, "rgba(29,77,56,0.24)");
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fillStyle = seat;
        ctx.fill();
        ctx.restore();

        // one quiet gloss, top left
        ctx.beginPath();
        ctx.ellipse(x - r * 0.34, y - r * 0.4, r * 0.34, r * 0.16, -0.5, 0, TAU);
        ctx.fillStyle = "rgba(255,255,255,0.28)";
        ctx.fill();
        ctx.restore();
      }

      ctx.beginPath();
      ctx.arc(x, y, KR - 1.4, 0, TAU);
      ctx.lineWidth = 2.6;
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, KR, 0, TAU);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(41,157,107,0.18)";
      ctx.stroke();
    }

    function steam(k, fill, t) {
      if (fill < 0.9 || reduce) return;
      ctx.save();
      ctx.lineCap = "round";
      for (var s = 0; s < 2; s++) {
        var baseX = k.x + (s === 0 ? -5 : 6);
        var life = ((t * 0.22) + k.ph * 0.16 + s * 0.5) % 1;
        var rise = 30 * life;
        var alpha = 0.3 * Math.sin(Math.PI * life) * (fill - 0.9) * 10;
        if (alpha <= 0) continue;
        ctx.beginPath();
        for (var seg = 0; seg <= 10; seg++) {
          var f = seg / 10;
          var yy = k.y - KR * 0.35 - rise * f - 4;
          var xx = baseX + Math.sin(f * 3.1 + t * 0.8 + k.ph) * 3.4 * f;
          if (seg === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
        }
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(121,204,168," + alpha.toFixed(3) + ")";
        ctx.stroke();
      }
      ctx.restore();
    }

    /* A spoon resting across the rim, in the quiet gap on the left. */
    function spoon() {
      var bx = cx - 90, by = cy + 1;
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(bx - 26, by + 5.5, 34, 4.5, 0, 0, TAU);
      ctx.fillStyle = "rgba(29,77,56,0.055)";
      ctx.fill();

      var g = ctx.createLinearGradient(bx - 60, by - 7, bx + 12, by + 7);
      g.addColorStop(0, "#EEF1F4");
      g.addColorStop(0.4, "#FFFFFF");
      g.addColorStop(1, "#DFE4E9");

      // handle, tapering out past the rim
      ctx.beginPath();
      ctx.moveTo(bx - 9, by - 2.3);
      ctx.quadraticCurveTo(bx - 34, by - 2.6, bx - 58, by - 1.7);
      ctx.quadraticCurveTo(bx - 63, by, bx - 58, by + 1.7);
      ctx.quadraticCurveTo(bx - 34, by + 2.6, bx - 9, by + 2.3);
      ctx.closePath();
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = "rgba(152,162,179,0.42)";
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // bowl of the spoon
      ctx.beginPath();
      ctx.ellipse(bx + 2, by, 11, 7.6, 0, 0, TAU);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(bx + 1, by - 1.4, 6.5, 3.6, -0.15, 0, TAU);
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fill();
      ctx.restore();
    }

    var t0 = performance.now(), raf = 0, alive = true;

    function frame(now) {
      if (!alive) return;
      var t = (now - t0) / 1000;
      var p = reduce ? 1 : easeOut(Math.min(t / 1.2, 1));
      numEl.textContent = Math.round(score * p);
      mealEl.style.opacity = reduce ? 1 : clamp01((t - 0.9) / 0.5);

      ctx.clearRect(0, 0, W, H);
      tray(t);
      gauge(p, t);

      for (var i = 0; i < kat.length; i++) {
        var k = kat[i];
        var fill = k.logged ? (reduce ? 1 : clamp01((t - 0.15 - i * 0.16) / 0.45)) : 0;
        katori(k, fill, t);
      }
      for (var j = 0; j < kat.length; j++) {
        if (kat[j].logged) steam(kat[j], reduce ? 1 : clamp01((t - 0.15 - j * 0.16) / 0.45), t);
      }
      spoon();

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
