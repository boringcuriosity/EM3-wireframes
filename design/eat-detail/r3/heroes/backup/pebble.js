(function () {
  window.HEROES = window.HEROES || {};

  /* A glass pebble with green liquid rising to the day's sufficiency. The
     number is drawn twice, clipped at the liquid line: dark green where it sits
     on glass, white where the liquid covers it, so it reads at every level. */
  window.HEROES.pebble = function (el, opts) {
    var score = (opts && opts.score) || 0;
    var W = 342, H = 320, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cv = document.createElement("canvas");
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.cssText = "width:" + W + "px;height:" + H + "px;display:block";
    el.appendChild(cv);
    var ctx = cv.getContext("2d");
    ctx.scale(dpr, dpr);

    var cx = 171, cy = 150, R = 116;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var t0 = performance.now(), raf = 0, alive = true;

    // A few bubbles, deterministic so every render looks the same.
    var bubbles = [];
    for (var i = 0; i < 7; i++) {
      bubbles.push({ x: -0.55 + (((i * 37) % 11) / 10) * 1.1, r: 1.6 + ((i * 7) % 5) * 0.55, speed: 0.035 + ((i * 13) % 7) * 0.006, phase: (i * 0.37) % 1 });
    }

    var easeOut = function (x) { return 1 - Math.pow(1 - x, 3); };

    function wavePath(level, amp, freq, shift) {
      ctx.beginPath();
      ctx.moveTo(cx - R - 4, cy + R + 4);
      for (var x = -R - 4; x <= R + 4; x += 3) {
        ctx.lineTo(cx + x, level + Math.sin(x * freq + shift) * amp + Math.sin(x * freq * 0.53 + shift * 1.7) * amp * 0.45);
      }
      ctx.lineTo(cx + R + 4, cy + R + 4);
      ctx.closePath();
    }

    function drawNumber(n, color, sub) {
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = color;
      ctx.font = "600 62px 'Playfair Display', Georgia, serif";
      var num = String(n);
      var nw = ctx.measureText(num).width;
      ctx.font = "600 22px 'Playfair Display', Georgia, serif";
      var pw = ctx.measureText("%").width;
      var x0 = cx - (nw + pw + 2) / 2;
      ctx.textAlign = "left";
      ctx.font = "600 62px 'Playfair Display', Georgia, serif";
      ctx.fillText(num, x0, cy + 52);
      ctx.font = "600 22px 'Playfair Display', Georgia, serif";
      ctx.fillText("%", x0 + nw + 2, cy + 26);
      ctx.textAlign = "center";
      ctx.fillStyle = sub;
      ctx.font = "700 11px Roboto, Arial, sans-serif";
      if ("letterSpacing" in ctx) ctx.letterSpacing = "2.2px";
      ctx.fillText("SUFFICIENT", cx + 1, cy + 76);
      if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    }

    function frame(now) {
      if (!alive) return;
      var t = (now - t0) / 1000;
      var p = reduce ? 1 : easeOut(Math.min(t / 1.2, 1));
      var shown = Math.round(score * p);
      var fill = (score / 100) * p;
      var level = cy + R - 2 * R * fill;
      var sway = reduce ? 0 : t * 1.4;
      var amp = reduce ? 2.5 : 3.2 + Math.sin(t * 0.9) * 0.8;

      ctx.clearRect(0, 0, W, H);

      // Soft brand glow and ground shadow.
      var glow = ctx.createRadialGradient(cx, cy + 10, R * 0.6, cx, cy + 10, R * 1.45);
      glow.addColorStop(0, "rgba(203,240,224,0.55)");
      glow.addColorStop(1, "rgba(243,252,248,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      var sh = ctx.createRadialGradient(cx, cy + R + 16, 4, cx, cy + R + 16, R * 0.85);
      sh.addColorStop(0, "rgba(29,77,56,0.22)");
      sh.addColorStop(1, "rgba(29,77,56,0)");
      ctx.save();
      ctx.translate(cx, cy + R + 16);
      ctx.scale(1, 0.16);
      ctx.translate(-cx, -(cy + R + 16));
      ctx.fillStyle = sh;
      ctx.beginPath();
      ctx.arc(cx, cy + R + 16, R * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Glass body.
      var glass = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.45, R * 0.1, cx, cy, R);
      glass.addColorStop(0, "#FFFFFF");
      glass.addColorStop(0.7, "#FAFFFD");
      glass.addColorStop(1, "#E6FAF1");
      ctx.fillStyle = glass;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R - 3, 0, Math.PI * 2);
      ctx.clip();

      // Number on glass, dark green, before the liquid covers it.
      drawNumber(shown, "#1D4D38", "#2A805A");

      // Back wave, lighter.
      wavePath(level - 3, amp * 0.9, 0.034, sway * 1.2 + 1.8);
      ctx.fillStyle = "rgba(121,204,168,0.55)";
      ctx.fill();

      // Front liquid.
      wavePath(level, amp, 0.028, sway);
      var liq = ctx.createLinearGradient(0, level - 6, 0, cy + R);
      liq.addColorStop(0, "#59B38C");
      liq.addColorStop(0.45, "#299D6B");
      liq.addColorStop(1, "#1D4D38");
      ctx.fillStyle = liq;
      ctx.fill();

      // Number again, white, only inside the liquid.
      ctx.save();
      wavePath(level, amp, 0.028, sway);
      ctx.clip();
      drawNumber(shown, "#FFFFFF", "rgba(230,250,241,0.92)");
      ctx.restore();

      // Surface sheen line.
      ctx.beginPath();
      for (var x = -R; x <= R; x += 3) {
        var y = level + Math.sin(x * 0.028 + sway) * amp + Math.sin(x * 0.028 * 0.53 + sway * 1.7) * amp * 0.45;
        if (x === -R) ctx.moveTo(cx + x, y); else ctx.lineTo(cx + x, y);
      }
      ctx.strokeStyle = "rgba(203,240,224,0.9)";
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Bubbles rising inside the liquid.
      if (fill > 0.05) {
        for (var b = 0; b < bubbles.length; b++) {
          var bb = bubbles[b];
          var prog = reduce ? bb.phase : (bb.phase + t * bb.speed) % 1;
          var by = cy + R - 10 - prog * (cy + R - 10 - level - 8);
          var bx = cx + bb.x * R * 0.75 + Math.sin(t * 1.1 + b) * 3;
          ctx.beginPath();
          ctx.arc(bx, by, bb.r, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(230,250,241," + (0.25 + 0.35 * (1 - prog)) + ")";
          ctx.fill();
        }
      }

      // Inner rim shade for thickness.
      var rim = ctx.createRadialGradient(cx, cy, R * 0.78, cx, cy, R);
      rim.addColorStop(0, "rgba(29,77,56,0)");
      rim.addColorStop(1, "rgba(29,77,56,0.16)");
      ctx.fillStyle = rim;
      ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
      ctx.restore();

      // Specular highlights.
      ctx.save();
      ctx.translate(cx - R * 0.42, cy - R * 0.5);
      ctx.rotate(-0.6);
      var spec = ctx.createRadialGradient(0, 0, 1, 0, 0, R * 0.34);
      spec.addColorStop(0, "rgba(255,255,255,0.95)");
      spec.addColorStop(1, "rgba(255,255,255,0)");
      ctx.scale(1, 0.48);
      ctx.fillStyle = spec;
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.34, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.beginPath();
      ctx.arc(cx + R * 0.5, cy + R * 0.52, 5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fill();

      // Glass edge.
      ctx.beginPath();
      ctx.arc(cx, cy, R - 0.75, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(171,230,204,0.9)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (!reduce) raf = requestAnimationFrame(frame);
    }

    var start = function () { t0 = performance.now(); raf = requestAnimationFrame(frame); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else start();

    return { dispose: function () { alive = false; cancelAnimationFrame(raf); cv.remove(); } };
  };
})();
