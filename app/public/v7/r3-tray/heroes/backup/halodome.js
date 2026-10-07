(function () {
  window.HEROES = window.HEROES || {};

  /* Halo Dome. The dots wrap a slowly turning globe instead of lying flat, and
     the globe is filled from the bottom up: the green dots are the part of the
     day that is sufficient, the pale ones are what is still empty. A sphere's
     surface fills in step with its height, so the waterline at 54% sits just
     above the equator, which is exactly how it reads. */
  window.HEROES.halodome = function (el, opts) {
    var score = (opts && opts.score) || 0;
    var W = 342, H = 320, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cx = 171, cy = 150, R = 104, D = 520, tilt = 0.26;
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
      '<path d="M16 96v34c0 6 4 10 9 10s9-4 9-10V96M25 96v30M25 140v70"/>' +
      '<path d="M326 96c-9 8-12 24-12 44 0 8 4 12 12 12M326 96v114"/>' +
      "</svg>";
    el.appendChild(ut);

    var label = document.createElement("div");
    label.style.cssText = "position:absolute;left:0;right:0;top:" + (cy - 44) + "px;display:flex;flex-direction:column;align-items:center;pointer-events:none";
    label.innerHTML =
      '<div style="display:flex;align-items:flex-start;color:#101828;font-family:\'Playfair Display\',Georgia,serif;font-weight:600;line-height:1">' +
      '<span class="n" style="font-size:62px;letter-spacing:-1px">0</span><span style="font-size:21px;margin:7px 0 0 2px;color:#2A805A">%</span></div>' +
      '<div style="margin-top:7px;font:700 11px Roboto,Arial,sans-serif;letter-spacing:2.2px;color:#2A805A">SUFFICIENT</div>';
    el.appendChild(label);
    var numEl = label.querySelector(".n");

    var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
    var easeOut = function (x) { return 1 - Math.pow(1 - x, 3); };

    // Evenly spread points, the fibonacci way.
    var N = 176, pts = [];
    for (var i = 0; i < N; i++) {
      var y = 1 - (i / (N - 1)) * 2;
      var rr = Math.sqrt(Math.max(0, 1 - y * y));
      var ph = i * 2.399963229728653;
      pts.push({ x: Math.cos(ph) * rr, y: y, z: Math.sin(ph) * rr, s: 0.86 + ((i * 37) % 11) / 40 });
    }

    var ct = Math.cos(tilt), st = Math.sin(tilt);
    function toScreen(lx, ly, lz, omega) {
      var co = Math.cos(omega), so = Math.sin(omega);
      var X = lx * co + lz * so;
      var Z0 = -lx * so + lz * co;
      var Y = ly * ct - Z0 * st;        // tip the globe so we look slightly down on it
      var Z = ly * st + Z0 * ct;
      var sc = D / (D - Z * R);
      // canvas y grows downward, so the up axis flips here: local +y is the top
      return { x: cx + X * R * sc, y: cy - Y * R * sc, z: Z, s: sc };
    }

    // The latitude circle at the fill level, as a screen path.
    function waterline(h, omega) {
      var rr = Math.sqrt(Math.max(0, 1 - h * h)), out = [];
      for (var u = 0; u <= 72; u++) {
        var a = (u / 72) * Math.PI * 2;
        out.push(toScreen(Math.cos(a) * rr, h, Math.sin(a) * rr, omega));
      }
      return out;
    }

    var t0 = performance.now(), raf = 0, alive = true;
    var target = (score / 100) * 2 - 1;                 // fill height in sphere units

    function frame(now) {
      if (!alive) return;
      var t = (now - t0) / 1000;
      var p = reduce ? 1 : easeOut(Math.min(t / 1.2, 1));
      numEl.textContent = Math.round(score * p);
      var h = -1.06 + (target + 1.06) * p;
      var sway = reduce ? 0 : Math.sin(t * 0.55) * 0.004;
      h += sway;                                        // the surface breathes, just barely
      var omega = reduce ? 0.6 : 0.6 + (t / 26) * Math.PI * 2;

      ctx.clearRect(0, 0, W, H);

      // Soft light behind the globe.
      var glow = ctx.createRadialGradient(cx, cy, 20, cx, cy, 160);
      glow.addColorStop(0, "rgba(230,250,241,0.7)");
      glow.addColorStop(0.6, "rgba(243,252,248,0.4)");
      glow.addColorStop(1, "rgba(250,255,253,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(cx, cy, 160, 0, Math.PI * 2); ctx.fill();

      // Where it stands.
      var sh = ctx.createRadialGradient(cx, cy + R + 26, 4, cx, cy + R + 26, 96);
      sh.addColorStop(0, "rgba(16,24,40,0.13)");
      sh.addColorStop(1, "rgba(16,24,40,0)");
      ctx.save();
      ctx.translate(cx, cy + R + 26); ctx.scale(1, 0.16); ctx.translate(-cx, -(cy + R + 26));
      ctx.fillStyle = sh;
      ctx.beginPath(); ctx.arc(cx, cy + R + 26, 96, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // The glass ball itself: barely there, so the dots stay the subject.
      var body = ctx.createRadialGradient(cx - R * 0.32, cy - R * 0.36, R * 0.1, cx, cy, R);
      body.addColorStop(0, "rgba(255,255,255,0.7)");
      body.addColorStop(0.62, "rgba(243,252,248,0.3)");
      body.addColorStop(1, "rgba(203,240,224,0.14)");
      ctx.fillStyle = body;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();

      // Water: a light wash for everything under the far edge of the surface,
      // a stronger one under the near edge.
      var line = waterline(h, omega);
      var near = [], far = [];
      line.forEach(function (q) { (q.z > 0 ? near : far).push(q); });
      var byX = function (u, v) { return u.x - v.x; };
      near.sort(byX); far.sort(byX);

      function washBelow(path, colour) {
        if (path.length < 2) return;
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, R - 0.5, 0, Math.PI * 2); ctx.clip();
        ctx.beginPath();
        ctx.moveTo(path[0].x - 40, path[0].y);
        for (var j = 0; j < path.length; j++) ctx.lineTo(path[j].x, path[j].y);
        ctx.lineTo(path[path.length - 1].x + 40, path[path.length - 1].y);
        ctx.lineTo(cx + R + 40, cy + R + 40);
        ctx.lineTo(cx - R - 40, cy + R + 40);
        ctx.closePath();
        ctx.fillStyle = colour;
        ctx.fill();
        ctx.restore();
      }
      washBelow(far, "rgba(230,250,241,0.5)");
      washBelow(near, "rgba(171,230,204,0.3)");

      // The surface edge: bright where it is near, a whisper where it runs behind.
      ctx.lineWidth = 1.2;
      for (var j = 0; j < line.length - 1; j++) {
        var q0 = line[j], q1 = line[j + 1];
        var fr = clamp(((q0.z + q1.z) / 2 + 1) / 2);
        ctx.strokeStyle = "rgba(41,157,107," + (0.08 + 0.5 * fr).toFixed(3) + ")";
        ctx.beginPath(); ctx.moveTo(q0.x, q0.y); ctx.lineTo(q1.x, q1.y); ctx.stroke();
      }

      // Dots, back to front.
      var proj = pts.map(function (d) {
        var q = toScreen(d.x, d.y, d.z, omega);
        q.d = d;
        return q;
      });
      proj.sort(function (u, v) { return u.z - v.z; });

      for (var i = 0; i < proj.length; i++) {
        var q = proj[i], d = q.d;
        var fr = clamp((q.z + 1) / 2);                  // 0 behind, 1 facing us
        var lit = clamp((h - d.y) / 0.07);
        var rad = 3.9 * d.s * q.s * (0.55 + 0.45 * fr);
        if (lit > 0) {
          var pop = lit < 1 ? 1 + Math.sin(lit * Math.PI) * 0.4 : 1;
          rad *= pop;
          ctx.globalAlpha = (0.26 + 0.74 * fr) * (0.4 + 0.6 * lit);
          var g = ctx.createRadialGradient(q.x - rad * 0.36, q.y - rad * 0.44, rad * 0.08, q.x, q.y, rad);
          g.addColorStop(0, "#FFFFFF");
          g.addColorStop(0.22, "#ABE6CC");
          g.addColorStop(0.64, "#299D6B");
          g.addColorStop(1, "#246649");
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(q.x, q.y, rad, 0, Math.PI * 2); ctx.fill();
          if (fr > 0.55) {
            ctx.globalAlpha = 0.55 * fr * lit;
            ctx.fillStyle = "#FFFFFF";
            ctx.beginPath(); ctx.arc(q.x - rad * 0.34, q.y - rad * 0.44, rad * 0.24, 0, Math.PI * 2); ctx.fill();
          }
          ctx.globalAlpha = 1;
        } else {
          ctx.globalAlpha = 0.22 + 0.6 * fr;
          ctx.fillStyle = fr > 0.5 ? "#D8DCE3" : "#E7EAEF";
          ctx.beginPath(); ctx.arc(q.x, q.y, rad * 0.8, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      // Rim light, then the core scrim the number sits on.
      ctx.strokeStyle = "rgba(203,240,224,0.75)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();

      var scrim = ctx.createRadialGradient(cx, cy, 6, cx, cy, 72);
      scrim.addColorStop(0, "rgba(252,253,253,0.95)");
      scrim.addColorStop(0.6, "rgba(252,253,253,0.72)");
      scrim.addColorStop(1, "rgba(252,253,253,0)");
      ctx.fillStyle = scrim;
      ctx.beginPath(); ctx.arc(cx, cy, 72, 0, Math.PI * 2); ctx.fill();

      if (!reduce) raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return { dispose: function () { alive = false; cancelAnimationFrame(raf); el.innerHTML = ""; } };
  };
})();
