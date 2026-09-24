(function () {
  window.HEROES = window.HEROES || {};

  /* A bowl of clear broth from above. What you have eaten is what floats in it:
     the garnish covers 54% of the surface and the rest is still clear broth.
     The rim carries the same number as a fine arc, so the score is readable
     even before you read the bowl. */
  window.HEROES.broth = function (el, opts) {
    var score = (opts && opts.score) || 0;
    var W = 342, H = 320, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cx = 171, cy = 122;
    var R_OUT = 106, R_RIM = 96, R_BROTH = 90;
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
      '<div style="position:absolute;left:0;right:0;top:' + (cy + R_OUT + 16) + 'px;display:flex;justify-content:center;align-items:flex-start;' +
      'color:#101828;font-family:\'Playfair Display\',Georgia,serif;font-weight:600;line-height:1">' +
      '<span class="n" style="font-size:46px;letter-spacing:-1px">0</span>' +
      '<span style="font-size:17px;margin:5px 0 0 2px;color:#2A805A">%</span></div>' +
      '<div style="position:absolute;left:0;right:0;top:' + (cy + R_OUT + 68) + 'px;text-align:center;' +
      'font:700 11px Roboto,Arial,sans-serif;letter-spacing:2.2px;color:#2A805A">SUFFICIENT</div>';
    el.appendChild(label);
    var numEl = label.querySelector(".n");

    var seed = 23;
    var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

    /* ---------- the garnish, covering 54% of the broth ---------- */
    var KINDS = [
      { t: "onion", w: 0.16, r: [10, 14] },
      { t: "leaf", w: 0.38, r: [11, 16] },
      { t: "bean", w: 0.26, r: [8, 11.5] },
      { t: "grain", w: 0.08, r: [4.5, 6.5] },
      { t: "slice", w: 0.12, r: [9, 13] }
    ];
    function pickKind() {
      var u = rnd(), acc = 0;
      for (var i = 0; i < KINDS.length; i++) { acc += KINDS[i].w; if (u <= acc) return KINDS[i]; }
      return KINDS[0];
    }
    var GREENS = ["#59B38C", "#299D6B", "#299D6B", "#2A805A", "#246649", "#1D4D38"];
    var items = [];
    // The garnish holds 54% of the bowl, as a wedge from twelve o'clock round.
    // The rest stays clear broth, so the fraction is readable without counting.
    var SWEEP = Math.PI * 2 * (score / 100);
    var sectorArea = 0.5 * SWEEP * R_BROTH * R_BROTH;
    var target = sectorArea * 1.15;
    var covered = 0, guard = 0;
    while (covered < target && guard++ < 20000) {
      var kind = pickKind();
      var r = kind.r[0] + rnd() * (kind.r[1] - kind.r[0]);
      var rr = 14 + Math.sqrt(rnd()) * (R_BROTH - r - 8 - 14);
      var a = rnd() * (SWEEP + 0.3) - 0.15;                  // a softly ragged edge
      if (a < (rnd() - 0.6) * 0.18 || a > SWEEP + (rnd() - 0.4) * 0.26) continue;
      var x = Math.sin(a) * rr, y = -Math.cos(a) * rr;       // clockwise from 12
      var ok = true;
      for (var j = 0; j < items.length; j++) {
        var it = items[j], dx = it.x - x, dy = it.y - y;
        if (dx * dx + dy * dy < Math.pow((it.r + r) * 0.6, 2)) { ok = false; break; }
      }
      if (!ok) continue;
      items.push({
        t: kind.t, x: x, y: y, r: r, a: a,
        rot: rnd() * Math.PI * 2,
        c: GREENS[Math.floor(rnd() * GREENS.length)],
        ph: rnd() * Math.PI * 2
      });
      covered += Math.PI * r * r * (kind.t === "grain" ? 0.7 : 0.9);
    }
    // Clockwise, so the bowl garnishes itself in step with the number.
    items.sort(function (p1, p2) { return p1.a - p2.a; });

    function drawItem(it, k, t) {
      var bob = reduce ? 0 : Math.sin(t * 0.5 + it.ph) * 1.2;
      var x = cx + it.x, y = cy + it.y + bob;
      var s = k < 1 ? 0.4 + 0.6 * k : 1;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(it.rot + (reduce ? 0 : Math.sin(t * 0.22 + it.ph) * 0.06));
      ctx.scale(s, s);
      ctx.globalAlpha = Math.min(1, k * 1.6);

      // Everything floating casts a soft shadow into the broth.
      ctx.save();
      ctx.translate(1.5, 2);
      ctx.fillStyle = "rgba(29,77,56,0.10)";
      ctx.beginPath(); ctx.ellipse(0, 0, it.r * 0.95, it.r * 0.7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      if (it.t === "onion") {
        ctx.beginPath();
        ctx.arc(0, 0, it.r * 0.72, 0, Math.PI * 2);
        ctx.lineWidth = it.r * 0.44;
        ctx.strokeStyle = it.c;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, it.r * 0.72, Math.PI * 1.1, Math.PI * 1.75);
        ctx.lineWidth = it.r * 0.18;
        ctx.strokeStyle = "rgba(255,255,255,0.55)";
        ctx.stroke();
      } else if (it.t === "leaf") {
        ctx.beginPath();
        ctx.moveTo(0, -it.r);
        ctx.bezierCurveTo(it.r * 0.9, -it.r * 0.35, it.r * 0.7, it.r * 0.6, 0, it.r);
        ctx.bezierCurveTo(-it.r * 0.7, it.r * 0.6, -it.r * 0.9, -it.r * 0.35, 0, -it.r);
        ctx.fillStyle = it.c;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(0, -it.r * 0.8); ctx.lineTo(0, it.r * 0.8); ctx.stroke();
      } else if (it.t === "bean") {
        ctx.beginPath();
        ctx.moveTo(-it.r * 0.9, -it.r * 0.2);
        ctx.bezierCurveTo(-it.r * 0.3, -it.r * 1.1, it.r * 0.95, -it.r * 0.7, it.r * 0.85, 0);
        ctx.bezierCurveTo(it.r * 0.8, it.r * 0.8, -it.r * 0.3, it.r * 0.95, -it.r * 0.72, it.r * 0.35);
        ctx.bezierCurveTo(-it.r * 0.4, it.r * 0.2, -it.r * 0.4, -it.r * 0.05, -it.r * 0.9, -it.r * 0.2);
        ctx.fillStyle = it.c;
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-it.r * 0.1, -it.r * 0.34, it.r * 0.34, it.r * 0.16, -0.4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.fill();
      } else if (it.t === "grain") {
        ctx.beginPath();
        ctx.ellipse(0, 0, it.r * 1.25, it.r * 0.6, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#D7EDE2";
        ctx.fill();
        ctx.strokeStyle = "rgba(121,204,168,0.5)";
        ctx.lineWidth = 0.7;
        ctx.stroke();
      } else {
        // A round slice: courgette, cucumber, radish.
        ctx.beginPath();
        ctx.arc(0, 0, it.r * 0.85, 0, Math.PI * 2);
        ctx.fillStyle = "#E6FAF1";
        ctx.fill();
        ctx.lineWidth = it.r * 0.2;
        ctx.strokeStyle = it.c;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, it.r * 0.34, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(121,204,168,0.45)";
        ctx.fill();
      }
      ctx.restore();
    }

    var easeOut = function (x) { return 1 - Math.pow(1 - x, 3); };
    var t0 = performance.now(), raf = 0, alive = true;

    function frame(now) {
      if (!alive) return;
      var t = Math.max(0, (now - t0) / 1000);
      var p = reduce ? 1 : easeOut(Math.max(0, Math.min(t / 1.2, 1)));
      numEl.textContent = Math.round(score * p);

      ctx.clearRect(0, 0, W, H);

      // Bowl shadow on the table.
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy + R_OUT - 4, R_OUT * 0.8, 13, 0, 0, Math.PI * 2);
      var sh = ctx.createRadialGradient(cx, cy + R_OUT - 4, 2, cx, cy + R_OUT - 4, R_OUT * 0.8);
      sh.addColorStop(0, "rgba(29,77,56,0.16)");
      sh.addColorStop(1, "rgba(29,77,56,0)");
      ctx.fillStyle = sh;
      ctx.fill();
      ctx.restore();

      // Bowl: an outer wall with a fine double rim.
      ctx.beginPath();
      ctx.arc(cx, cy, R_OUT, 0, Math.PI * 2);
      var wall = ctx.createLinearGradient(cx - R_OUT, cy - R_OUT, cx + R_OUT, cy + R_OUT);
      wall.addColorStop(0, "#FFFFFF");
      wall.addColorStop(0.5, "#F3F6F5");
      wall.addColorStop(1, "#E4E9E7");
      ctx.fillStyle = wall;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, R_RIM, 0, Math.PI * 2);
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "rgba(203,240,224,0.95)";
      ctx.stroke();

      // The same number, traced on the rim.
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, (R_OUT + R_RIM) / 2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (score / 100) * p);
      ctx.lineWidth = 4.5;
      ctx.lineCap = "round";
      var ag = ctx.createLinearGradient(cx - R_OUT, cy, cx + R_OUT, cy);
      ag.addColorStop(0, "#59B38C");
      ag.addColorStop(1, "#2A805A");
      ctx.strokeStyle = ag;
      ctx.stroke();
      ctx.restore();

      // Broth.
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R_BROTH, 0, Math.PI * 2);
      ctx.clip();
      var br = ctx.createRadialGradient(cx - 26, cy - 30, 10, cx, cy + 12, R_BROTH * 1.25);
      br.addColorStop(0, "#F7FCFA");
      br.addColorStop(0.55, "#EAF6F0");
      br.addColorStop(1, "#D8EBE2");
      ctx.fillStyle = br;
      ctx.fillRect(cx - R_BROTH, cy - R_BROTH, R_BROTH * 2, R_BROTH * 2);

      // Caustic light moving across the surface.
      var drift = reduce ? 0 : t * 0.16;
      for (var c2 = 0; c2 < 4; c2++) {
        ctx.beginPath();
        for (var s2 = 0; s2 <= 40; s2++) {
          var xx = cx - R_BROTH + (s2 / 40) * R_BROTH * 2;
          var yy = cy - R_BROTH * 0.62 + c2 * R_BROTH * 0.42 +
            Math.sin(s2 * 0.34 + drift + c2 * 1.7) * 9 +
            Math.sin(s2 * 0.11 - drift * 1.4) * 5;
          s2 ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
        }
        ctx.strokeStyle = "rgba(255,255,255," + (0.5 - c2 * 0.06) + ")";
        ctx.lineWidth = 2.6;
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.lineWidth = 7;
        ctx.stroke();
      }

      // Oil catching the light.
      for (var o = 0; o < 5; o++) {
        var oa = o * 1.7 + (reduce ? 0 : t * 0.05);
        var orr = 26 + o * 11;
        var ox = cx + Math.cos(oa) * orr, oy = cy + Math.sin(oa * 1.3) * orr * 0.7;
        ctx.beginPath();
        ctx.arc(ox, oy, 4 + o, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.45)";
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }

      // A wash under the garnished side, so the full half reads as mass and the
      // clear half reads as broth.
      ctx.save();
      ctx.filter = "blur(9px)";                    // feathered, so it reads as food, not a pie slice
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R_BROTH - 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (score / 100) * p);
      ctx.closePath();
      var raft = ctx.createRadialGradient(cx, cy, 10, cx, cy, R_BROTH);
      raft.addColorStop(0, "rgba(121,204,168,0.2)");
      raft.addColorStop(1, "rgba(41,157,107,0.32)");
      ctx.fillStyle = raft;
      ctx.fill();
      ctx.restore();

      // The garnish.
      var litF = items.length * p;
      for (var i = 0; i < items.length; i++) {
        var k = Math.max(0, Math.min(1, litF - i));
        if (k <= 0) continue;
        drawItem(items[i], k, t);
      }

      // Depth at the bowl wall.
      var vg = ctx.createRadialGradient(cx, cy, R_BROTH * 0.72, cx, cy, R_BROTH);
      vg.addColorStop(0, "rgba(36,102,73,0)");
      vg.addColorStop(1, "rgba(36,102,73,0.16)");
      ctx.fillStyle = vg;
      ctx.fillRect(cx - R_BROTH, cy - R_BROTH, R_BROTH * 2, R_BROTH * 2);
      ctx.restore();

      // Rim highlight over the top left of the bowl.
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R_OUT, 0, Math.PI * 2);
      ctx.arc(cx, cy, R_BROTH, 0, Math.PI * 2, true);
      ctx.clip();
      var rl = ctx.createLinearGradient(cx - R_OUT, cy - R_OUT, cx + R_OUT * 0.4, cy + R_OUT * 0.4);
      rl.addColorStop(0, "rgba(255,255,255,0.95)");
      rl.addColorStop(0.55, "rgba(255,255,255,0)");
      ctx.fillStyle = rl;
      ctx.fillRect(cx - R_OUT, cy - R_OUT, R_OUT * 2, R_OUT * 2);
      ctx.restore();

      // Steam, barely there.
      if (!reduce) {
        ctx.save();
        ctx.lineCap = "round";
        for (var w = 0; w < 3; w++) {
          var ph = (t * 0.18 + w * 0.33) % 1;
          var baseX = cx - 34 + w * 34;
          var rise = 46 * ph;
          var alpha = Math.sin(ph * Math.PI) * 0.22;
          ctx.beginPath();
          for (var q = 0; q <= 14; q++) {
            var qy = cy - R_BROTH * 0.5 - rise - q * 3.4;
            var qx = baseX + Math.sin(q * 0.5 + t * 0.6 + w) * (3 + q * 0.45);
            q ? ctx.lineTo(qx, qy) : ctx.moveTo(qx, qy);
          }
          ctx.strokeStyle = "rgba(171,230,204," + alpha + ")";
          ctx.lineWidth = 5;
          ctx.stroke();
        }
        ctx.restore();
      }

      if (!reduce) raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return { dispose: function () { alive = false; cancelAnimationFrame(raf); el.innerHTML = ""; } };
  };
})();
