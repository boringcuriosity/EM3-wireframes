(function () {
  window.HEROES = window.HEROES || {};

  /* Halo Beads. The halo laid on a table and seen at an angle: 24 beads in a
     ring, and every bead the day has earned lifts off the surface, catches the
     light and casts a small shadow. The lit 54% becomes a raised crescent you
     can almost pick up; the rest stay flat and pale. */
  window.HEROES.halobeads = function (el, opts) {
    var score = (opts && opts.score) || 0;
    var W = 342, H = 320, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cx = 171, cy = 160, R = 122, FLAT = 0.40;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

    el.style.position = "relative";
    var cv = document.createElement("canvas");
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.cssText = "position:absolute;inset:0;width:" + W + "px;height:" + H + "px;display:block";
    el.appendChild(cv);
    var ctx = cv.getContext("2d");
    ctx.scale(dpr, dpr);

    var ut = document.createElement("div");
    ut.style.cssText = "position:absolute;inset:0;pointer-events:none";
    ut.innerHTML =
      '<svg width="342" height="320" viewBox="0 0 342 320" fill="none" stroke="#ABE6CC" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M16 106v34c0 6 4 10 9 10s9-4 9-10v-34M25 106v30M25 150v66"/>' +
      '<path d="M326 106c-9 8-12 24-12 44 0 8 4 12 12 12M326 106v110"/>' +
      "</svg>";
    el.appendChild(ut);

    var label = document.createElement("div");
    label.style.cssText = "position:absolute;left:0;right:0;top:" + (cy - 48) + "px;display:flex;flex-direction:column;align-items:center;pointer-events:none";
    label.innerHTML =
      '<div style="display:flex;align-items:flex-start;color:#101828;font-family:\'Playfair Display\',Georgia,serif;font-weight:600;line-height:1">' +
      '<span class="n" style="font-size:64px;letter-spacing:-1px">0</span><span style="font-size:22px;margin:8px 0 0 2px;color:#2A805A">%</span></div>' +
      '<div style="margin-top:8px;font:700 11px Roboto,Arial,sans-serif;letter-spacing:2.2px;color:#2A805A">SUFFICIENT</div>';
    el.appendChild(label);
    var numEl = label.querySelector(".n");

    var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
    var easeOut = function (x) { return 1 - Math.pow(1 - x, 3); };

    var N = 24, beads = [];
    for (var i = 0; i < N; i++) {
      var a = -Math.PI / 2 + (i / N) * Math.PI * 2;      // clockwise from the top
      beads.push({ a: a, order: i, tw: (i * 1.7) % 6.28 });
    }
    var total = N;

    var t0 = performance.now(), raf = 0, alive = true;

    function frame(now) {
      if (!alive) return;
      var t = (now - t0) / 1000;
      var p = reduce ? 1 : easeOut(Math.min(t / 1.2, 1));
      numEl.textContent = Math.round(score * p);
      var litF = (score / 100) * total * p;

      ctx.clearRect(0, 0, W, H);

      // The surface they rest on: a soft pool of light.
      var table = ctx.createRadialGradient(cx, cy + 14, 20, cx, cy + 14, 168);
      table.addColorStop(0, "rgba(230,250,241,0.7)");
      table.addColorStop(0.62, "rgba(243,252,248,0.42)");
      table.addColorStop(1, "rgba(250,255,253,0)");
      ctx.save();
      ctx.translate(cx, cy + 14); ctx.scale(1, 0.62); ctx.translate(-cx, -(cy + 14));
      ctx.fillStyle = table;
      ctx.beginPath(); ctx.arc(cx, cy + 14, 168, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // The ring they sit on.
      ctx.save();
      ctx.translate(cx, cy); ctx.scale(1, FLAT); ctx.translate(-cx, -cy);
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(203,240,224,0.85)";
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();

      var frameBeads = beads.map(function (b) {
        var bx = cx + Math.cos(b.a) * R;
        var by = cy + Math.sin(b.a) * R * FLAT;
        var front = (Math.sin(b.a) + 1) / 2;             // 0 at the back, 1 at the front
        var k = clamp(litF - b.order);
        var bob = reduce ? 0 : Math.sin(t * 1.05 + b.tw) * 1.3 * k;
        var overshoot = k > 0 && k < 1 ? Math.sin(k * Math.PI) * 4 : 0;
        var rise = (13 * k) + overshoot + bob;
        return { b: b, x: bx, y: by, front: front, k: k, rise: rise };
      });
      frameBeads.sort(function (u, v) { return u.y - v.y; });

      for (var i = 0; i < frameBeads.length; i++) {
        var f = frameBeads[i];
        var rad = 8.6 * (0.78 + 0.32 * f.front);

        // Shadow on the surface, softer and wider the higher the bead sits.
        var sr = rad * (1.05 + f.rise / 26);
        var sAlpha = 0.20 - 0.07 * (f.rise / 17);
        ctx.save();
        ctx.translate(f.x, f.y + rad * 0.32); ctx.scale(1, 0.34); ctx.translate(-f.x, -(f.y + rad * 0.32));
        var sg = ctx.createRadialGradient(f.x, f.y + rad * 0.32, 1, f.x, f.y + rad * 0.32, sr * 1.9);
        sg.addColorStop(0, "rgba(16,24,40," + Math.max(0.05, sAlpha).toFixed(3) + ")");
        sg.addColorStop(1, "rgba(16,24,40,0)");
        ctx.fillStyle = sg;
        ctx.beginPath(); ctx.arc(f.x, f.y + rad * 0.32, sr * 1.9, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        var by2 = f.y - f.rise;

        if (f.k > 0) {
          // The glow it throws while lifted.
          var gr = rad * (2.4 + 1.1 * f.front);
          var g = ctx.createRadialGradient(f.x, by2, rad * 0.4, f.x, by2, gr);
          g.addColorStop(0, "rgba(121,204,168," + (0.3 * f.k).toFixed(3) + ")");
          g.addColorStop(1, "rgba(171,230,204,0)");
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(f.x, by2, gr, 0, Math.PI * 2); ctx.fill();

          var bg = ctx.createRadialGradient(f.x - rad * 0.36, by2 - rad * 0.46, rad * 0.06, f.x, by2, rad);
          bg.addColorStop(0, "#FFFFFF");
          bg.addColorStop(0.18, "#CBF0E0");
          bg.addColorStop(0.58, "#299D6B");
          bg.addColorStop(1, "#1D4D38");
          ctx.fillStyle = bg;
          ctx.beginPath(); ctx.arc(f.x, by2, rad, 0, Math.PI * 2); ctx.fill();

          // Rim light along the lower edge, and a specular spark on top.
          ctx.beginPath();
          ctx.arc(f.x, by2, rad * 0.93, Math.PI * 0.12, Math.PI * 0.86);
          ctx.strokeStyle = "rgba(171,230,204,0.75)";
          ctx.lineWidth = rad * 0.16;
          ctx.stroke();

          ctx.globalAlpha = 0.85;
          ctx.fillStyle = "#FFFFFF";
          ctx.beginPath();
          ctx.ellipse(f.x - rad * 0.34, by2 - rad * 0.44, rad * 0.3, rad * 0.22, -0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        } else {
          var dg = ctx.createRadialGradient(f.x - rad * 0.3, f.y - rad * 0.38, rad * 0.08, f.x, f.y, rad * 0.86);
          dg.addColorStop(0, "#FBFCFD");
          dg.addColorStop(0.45, "#E9ECF1");
          dg.addColorStop(1, "#C9CFD8");
          ctx.fillStyle = dg;
          ctx.globalAlpha = 0.72 + 0.28 * f.front;
          ctx.beginPath(); ctx.arc(f.x, f.y, rad * 0.86, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      var scrim = ctx.createRadialGradient(cx, cy - 6, 8, cx, cy - 6, 80);
      scrim.addColorStop(0, "rgba(252,253,253,0.96)");
      scrim.addColorStop(0.6, "rgba(252,253,253,0.72)");
      scrim.addColorStop(1, "rgba(252,253,253,0)");
      ctx.fillStyle = scrim;
      ctx.beginPath(); ctx.arc(cx, cy - 6, 80, 0, Math.PI * 2); ctx.fill();

      if (!reduce) raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return { dispose: function () { alive = false; cancelAnimationFrame(raf); el.innerHTML = ""; } };
  };
})();
