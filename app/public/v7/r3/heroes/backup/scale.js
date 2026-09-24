(function () {
  window.HEROES = window.HEROES || {};

  /* A kitchen dial scale weighing the day. Greens pile into the bowl, the
     needle sweeps to 54 on a 0 to 100 face, and the swept part of the dial is
     traced in green. Nutrition as something you measure, not a gauge in a
     vacuum. */
  window.HEROES.scale = function (el, opts) {
    var score = (opts && opts.score) || 0;
    var W = 342, H = 320, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

    var BX = 171, BY = 56, BRX = 78, BRY = 20;        // bowl
    var DX = 171, DY = 186, DR = 90;                  // dial
    var A0 = 135, SWEEP = 270;                        // gauge sweep, gap at the bottom
    var rad = function (deg) { return (deg * Math.PI) / 180; };
    var angFor = function (v) { return rad(A0 + (v / 100) * SWEEP); };

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
      '<div style="position:absolute;left:0;right:0;top:' + (DY + 18) + 'px;display:flex;justify-content:center;align-items:flex-start;' +
      'color:#101828;font-family:\'Playfair Display\',Georgia,serif;font-weight:600;line-height:1">' +
      '<span class="n" style="font-size:40px;letter-spacing:-0.5px">0</span>' +
      '<span style="font-size:15px;margin:5px 0 0 2px;color:#2A805A">%</span></div>' +
      '<div style="position:absolute;left:0;right:0;top:' + (DR + DY + 12) + 'px;text-align:center;' +
      'font:700 11px Roboto,Arial,sans-serif;letter-spacing:2.2px;color:#2A805A">SUFFICIENT</div>' +
      '<div style="position:absolute;left:0;right:0;top:' + (DR + DY + 30) + 'px;text-align:center;' +
      'font:400 11px Roboto,Arial,sans-serif;color:#98A2B3">of today\'s targets</div>';
    el.appendChild(label);
    var numEl = label.querySelector(".n");

    // Greens, seeded once so the heap never reshuffles.
    var seed = 11;
    var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var greens = [];
    for (var i = 0; i < 16; i++) {
      var col = i / 15;
      greens.push({
        x: (rnd() * 2 - 1) * 36,
        y: 2 - rnd() * 18,
        rot: (rnd() * 2 - 1) * 1.1,
        rx: 13 + rnd() * 9,
        ry: 7 + rnd() * 4,
        order: rnd(),
        c: ["#79CCA8", "#59B38C", "#299D6B", "#2A805A", "#246649"][Math.floor(rnd() * 5)],
        edge: rnd() > 0.5
      });
    }
    greens.sort(function (a, b) { return a.y - b.y; });

    var easeOut = function (x) { return 1 - Math.pow(1 - x, 3); };
    var t0 = performance.now(), raf = 0, alive = true;

    function bowl(p, t) {
      // Contact shadow of the bowl on the dial.
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(BX, BY + 44, 40, 7, 0, 0, Math.PI * 2);
      var bs = ctx.createRadialGradient(BX, BY + 44, 1, BX, BY + 44, 40);
      bs.addColorStop(0, "rgba(29,77,56,0.12)");
      bs.addColorStop(1, "rgba(29,77,56,0)");
      ctx.fillStyle = bs;
      ctx.fill();
      ctx.restore();

      // Neck.
      ctx.beginPath();
      ctx.moveTo(BX - 15, BY + 12);
      ctx.lineTo(BX + 15, BY + 12);
      ctx.lineTo(BX + 11, BY + 44);
      ctx.lineTo(BX - 11, BY + 44);
      ctx.closePath();
      var ng = ctx.createLinearGradient(BX - 15, 0, BX + 15, 0);
      ng.addColorStop(0, "#E4E7EC");
      ng.addColorStop(0.35, "#FFFFFF");
      ng.addColorStop(1, "#E9EDEB");
      ctx.fillStyle = ng;
      ctx.fill();

      // Bowl body.
      ctx.beginPath();
      ctx.moveTo(BX - BRX, BY);
      ctx.bezierCurveTo(BX - BRX + 8, BY + 30, BX - 34, BY + 34, BX, BY + 34);
      ctx.bezierCurveTo(BX + 34, BY + 34, BX + BRX - 8, BY + 30, BX + BRX, BY);
      ctx.closePath();
      var bg = ctx.createLinearGradient(0, BY, 0, BY + 36);
      bg.addColorStop(0, "#FFFFFF");
      bg.addColorStop(0.55, "#F6F8F8");
      bg.addColorStop(1, "#E6EBE9");
      ctx.fillStyle = bg;
      ctx.fill();

      // The well, so the bowl reads as something you can put food in.
      ctx.beginPath();
      ctx.ellipse(BX, BY + 1, BRX - 5, BRY - 4, 0, 0, Math.PI * 2);
      var wg = ctx.createLinearGradient(0, BY - BRY, 0, BY + BRY);
      wg.addColorStop(0, "#E9EEEC");
      wg.addColorStop(0.5, "#F7FAF9");
      wg.addColorStop(1, "#FFFFFF");
      ctx.fillStyle = wg;
      ctx.fill();

      // Greens in the bowl, growing with the day. Clipped to the well plus a
      // small mound, so the heap sits in the bowl rather than on top of it.
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(BX, BY + 1, BRX - 5, BRY - 4, 0, 0, Math.PI * 2);
      ctx.moveTo(BX + 52, BY - 9);
      ctx.ellipse(BX, BY - 9, 52, 29, 0, 0, Math.PI * 2);
      ctx.clip();
      // The mass of the heap, under the leaves that catch the light.
      ctx.beginPath();
      ctx.ellipse(BX, BY - 1 * p, 46 * p, 18 * p, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(36,102,73,0.9)";
      ctx.fill();
      for (var i = 0; i < greens.length; i++) {
        var g = greens[i];
        var k = Math.max(0, Math.min(1, (p - g.order * 0.55) / 0.45));
        if (k <= 0) continue;
        ctx.save();
        ctx.translate(BX + g.x * (0.7 + 0.3 * k), BY - 4 + g.y * k);
        ctx.rotate(g.rot + (reduce ? 0 : Math.sin(t * 0.5 + g.order * 6) * 0.02));
        ctx.scale(k, k);
        ctx.beginPath();
        ctx.moveTo(-g.rx, 0);
        ctx.bezierCurveTo(-g.rx * 0.5, -g.ry * 1.9, g.rx * 0.5, -g.ry * 1.9, g.rx, 0);
        ctx.bezierCurveTo(g.rx * 0.5, g.ry * 1.5, -g.rx * 0.5, g.ry * 1.5, -g.rx, 0);
        ctx.fillStyle = g.c;
        ctx.fill();
        if (g.edge) {
          ctx.strokeStyle = "rgba(255,255,255,0.4)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.restore();
      }
      ctx.restore();

      // Rim, drawn last so the greens sit inside it.
      ctx.beginPath();
      ctx.ellipse(BX, BY, BRX, BRY, 0, 0, Math.PI * 2);
      ctx.lineWidth = 3.4;
      var rg = ctx.createLinearGradient(BX - BRX, BY - BRY, BX + BRX, BY + BRY);
      rg.addColorStop(0, "#FFFFFF");
      rg.addColorStop(0.5, "#E4E7EC");
      rg.addColorStop(1, "#FFFFFF");
      ctx.strokeStyle = rg;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(BX, BY, BRX - 2, BRY - 2, 0, Math.PI * 1.08, Math.PI * 1.92);
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    function dialFace() {
      // Bezel.
      ctx.beginPath();
      ctx.arc(DX, DY, DR, 0, Math.PI * 2);
      var bez = ctx.createLinearGradient(DX - DR, DY - DR, DX + DR, DY + DR);
      bez.addColorStop(0, "#FFFFFF");
      bez.addColorStop(0.45, "#EDF1EF");
      bez.addColorStop(1, "#DDE3E0");
      ctx.fillStyle = bez;
      ctx.fill();

      // Face, recessed.
      ctx.beginPath();
      ctx.arc(DX, DY, DR - 9, 0, Math.PI * 2);
      var face = ctx.createRadialGradient(DX - 26, DY - 34, 8, DX, DY + 10, DR);
      face.addColorStop(0, "#FFFFFF");
      face.addColorStop(0.7, "#FBFDFC");
      face.addColorStop(1, "#EFF4F2");
      ctx.fillStyle = face;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(203,240,224,0.9)";
      ctx.stroke();

      // Shadow inside the top of the recess.
      ctx.save();
      ctx.beginPath();
      ctx.arc(DX, DY, DR - 9, 0, Math.PI * 2);
      ctx.clip();
      var ish = ctx.createLinearGradient(0, DY - DR, 0, DY - DR + 30);
      ish.addColorStop(0, "rgba(102,112,133,0.12)");
      ish.addColorStop(1, "rgba(102,112,133,0)");
      ctx.fillStyle = ish;
      ctx.fillRect(DX - DR, DY - DR, DR * 2, 34);
      ctx.restore();
    }

    function ticksAndArc(p) {
      var rTick = DR - 20, rMinor = rTick - 6, rMajor = rTick - 11;

      // Track.
      ctx.beginPath();
      ctx.arc(DX, DY, rTick + 7, angFor(0), angFor(100));
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#EDF0F2";
      ctx.stroke();

      // Swept part.
      if (p > 0.004) {
        var a1 = angFor(score * p);
        ctx.save();
        ctx.beginPath();
        ctx.arc(DX, DY, rTick + 7, angFor(0), a1);
        var ag = ctx.createLinearGradient(DX - DR, DY, DX + DR, DY);
        ag.addColorStop(0, "#59B38C");
        ag.addColorStop(0.5, "#299D6B");
        ag.addColorStop(1, "#2A805A");
        ctx.strokeStyle = ag;
        ctx.lineWidth = 6;
        ctx.shadowColor = "rgba(41,157,107,0.35)";
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();
      }

      // Ticks.
      for (var v = 0; v <= 100; v += 2) {
        var a = angFor(v), major = v % 10 === 0;
        var r1 = major ? rMajor : rMinor;
        ctx.beginPath();
        ctx.moveTo(DX + Math.cos(a) * r1, DY + Math.sin(a) * r1);
        ctx.lineTo(DX + Math.cos(a) * rTick, DY + Math.sin(a) * rTick);
        ctx.strokeStyle = major ? "#98A2B3" : "#D0D5DD";
        ctx.lineWidth = major ? 1.8 : 1;
        ctx.stroke();
      }

      // Only the two ends are numbered: the needle owns the rest of the face.
      ctx.font = "500 10px Roboto, Arial, sans-serif";
      ctx.fillStyle = "#98A2B3";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      [0, 100].forEach(function (v2) {
        var a2 = angFor(v2), rr = rMajor - 9;
        ctx.fillText(String(v2), DX + Math.cos(a2) * rr, DY + Math.sin(a2) * rr);
      });
      ctx.textAlign = "start";
      ctx.textBaseline = "alphabetic";
    }

    function readingPlate() {
      // A small recessed plate so the number reads cleanly off the face.
      var x = DX - 52, y = DY + 12, w = 104, h = 52, r = 13;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      var pg = ctx.createLinearGradient(0, y, 0, y + h);
      pg.addColorStop(0, "#FFFFFF");
      pg.addColorStop(1, "#F6FAF8");
      ctx.fillStyle = pg;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(203,240,224,0.95)";
      ctx.stroke();
    }

    function needle(p, t) {
      var v = score * p;
      var sway = reduce ? 0 : Math.sin(t * 0.8) * 0.12;      // a live instrument never sits perfectly still
      var a = angFor(v) + (p >= 1 ? rad(sway) : 0);
      var len = DR - 32, back = 16;
      var ux = Math.cos(a), uy = Math.sin(a), px = -uy, py = ux;

      ctx.save();
      ctx.shadowColor = "rgba(16,24,40,0.18)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 1.5;
      ctx.beginPath();
      ctx.moveTo(DX + ux * len, DY + uy * len);
      ctx.lineTo(DX + px * 3.4 - ux * back * 0.2, DY + py * 3.4 - uy * back * 0.2);
      ctx.lineTo(DX - ux * back + px * 2.2, DY - uy * back + py * 2.2);
      ctx.lineTo(DX - ux * back - px * 2.2, DY - uy * back - py * 2.2);
      ctx.lineTo(DX - px * 3.4 - ux * back * 0.2, DY - py * 3.4 - uy * back * 0.2);
      ctx.closePath();
      var ng2 = ctx.createLinearGradient(DX - ux * back, DY - uy * back, DX + ux * len, DY + uy * len);
      ng2.addColorStop(0, "#246649");
      ng2.addColorStop(1, "#1D4D38");
      ctx.fillStyle = ng2;
      ctx.fill();
      ctx.restore();

      // Highlight down the needle's spine.
      ctx.beginPath();
      ctx.moveTo(DX + ux * (len - 6) + px * 0.6, DY + uy * (len - 6) + py * 0.6);
      ctx.lineTo(DX + px * 1.2, DY + py * 1.2);
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Cap.
      ctx.beginPath();
      ctx.arc(DX, DY, 9, 0, Math.PI * 2);
      var cg = ctx.createRadialGradient(DX - 3, DY - 4, 1, DX, DY, 9);
      cg.addColorStop(0, "#FFFFFF");
      cg.addColorStop(1, "#E4E7EC");
      ctx.fillStyle = cg;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#2A805A";
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(DX, DY, 2.6, 0, Math.PI * 2);
      ctx.fillStyle = "#1D4D38";
      ctx.fill();
    }

    function glass(t) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(DX, DY, DR - 9, 0, Math.PI * 2);
      ctx.clip();
      var drift = reduce ? 0 : Math.sin(t * 0.18) * 10;
      var sg = ctx.createLinearGradient(DX - DR + drift, DY - DR, DX + drift, DY + DR * 0.3);
      sg.addColorStop(0, "rgba(255,255,255,0.55)");
      sg.addColorStop(0.42, "rgba(255,255,255,0.14)");
      sg.addColorStop(0.62, "rgba(255,255,255,0)");
      ctx.fillStyle = sg;
      ctx.fillRect(DX - DR, DY - DR, DR * 2, DR * 2);
      ctx.restore();
    }

    function frame(now) {
      if (!alive) return;
      var t = Math.max(0, (now - t0) / 1000);
      var p = reduce ? 1 : easeOut(Math.max(0, Math.min(t / 1.2, 1)));
      numEl.textContent = Math.round(score * p);

      ctx.clearRect(0, 0, W, H);

      // Light under the whole object.
      var glow = ctx.createRadialGradient(DX, DY - 10, 40, DX, DY, 190);
      glow.addColorStop(0, "rgba(230,250,241,0.7)");
      glow.addColorStop(1, "rgba(250,255,253,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      // Contact shadow.
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(DX, DY + DR - 2, DR * 0.76, 11, 0, 0, Math.PI * 2);
      var sh = ctx.createRadialGradient(DX, DY + DR - 2, 2, DX, DY + DR - 2, DR * 0.76);
      sh.addColorStop(0, "rgba(29,77,56,0.18)");
      sh.addColorStop(1, "rgba(29,77,56,0)");
      ctx.fillStyle = sh;
      ctx.fill();
      ctx.restore();

      dialFace();
      ticksAndArc(p);
      readingPlate();
      needle(p, t);
      glass(t);
      bowl(p, t);

      if (!reduce) raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return { dispose: function () { alive = false; cancelAnimationFrame(raf); el.innerHTML = ""; } };
  };
})();
