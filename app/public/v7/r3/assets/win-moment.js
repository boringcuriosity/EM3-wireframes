/* ============================================================
   The win moment: what happens between tapping "Log n items" and landing
   back on the day.

   It starts the instant the button is pressed, so the wait for the save is
   part of the show rather than a spinner, and it pays off when the save lands:
     begin(buttonRect, names) → a controller, or null for the classic overlay
     controller.win({ d, moved, sub }, done)   the payoff, then done() navigates
     controller.cancel()                       the save failed, put it all away

   Variants, chosen by ?win= on log.html or the prototype panel (remembered):
     rise   green liquid wells up out of the button and floods the screen (default)
     nova   the button collapses into a star, the lights go down, it explodes
     classic  the original green overlay (log.html draws it, this returns null)

   The day view then catches the moment: the gain is handed over in
   sessionStorage (gfLogged) and the score steps up from where it was.
   ============================================================ */
(function () {
  var Q = new URLSearchParams(location.search);
  var pick = Q.get("win"), DEMO = Q.get("auto") === "1";   /* the options page's phones never overwrite your choice */
  try { if (pick) { if (!DEMO) localStorage.setItem("gfWin2", pick); } else pick = localStorage.getItem("gfWin2"); } catch (e) {}
  var MODE = pick === "classic" || pick === "nova" ? pick : "rise";   /* Rise is the default */
  /* the final screen's design, A to E (see LAYOUTS); ?layout= or remembered */
  var LAYOUT = Q.get("layout");
  try { if (LAYOUT) { if (!DEMO) localStorage.setItem("gfWinLayout2", LAYOUT); } else LAYOUT = localStorage.getItem("gfWinLayout2"); } catch (e) {}
  if (!/^[A-E]$/.test(LAYOUT || "")) LAYOUT = "B";
  /* ?auto=1 logs the plan's foods by itself; ?stay=1 holds on the final screen. Both are for the options page. */
  var AUTO = Q.get("auto") === "1", STAY = Q.get("stay") === "1";
  var REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  var css = document.createElement("style");
  css.textContent = [
    ".wm{position:fixed;top:0;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:390px;z-index:60;overflow:hidden;pointer-events:auto}",
    ".wm canvas{position:absolute;inset:0;width:100%;height:100%}",
    ".wm .c{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;color:#fff;opacity:0}",
    ".wm .disc{width:76px;height:76px;margin:0 auto 22px;border-radius:50%;border:3px solid rgba(255,255,255,.4);display:grid;place-items:center;transform:scale(0)}",
    ".wm .disc path{fill:none;stroke:#fff;stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:76;stroke-dashoffset:76}",
    ".wm .d{font:700 46px/46px Roboto,sans-serif;letter-spacing:-1px}",
    ".wm .d s{text-decoration:none;font-size:20px;opacity:.72}",
    ".wm p{margin:10px 0 0;font:400 15px/22px Roboto,sans-serif;color:rgba(255,255,255,.94)}",
    ".wm .m{display:block;margin-top:4px;font:400 14px/20px Roboto,sans-serif;color:rgba(255,255,255,.74)}",
    /* ---- final screen layouts ---- */
    ".wm .c *{box-sizing:border-box}",
    ".wm [data-in]{opacity:0}",
    /* B: three tiers. The tick confirms, the gain is the reward, one sentence says what earned it. */
    ".wm .logged{display:inline-flex;align-items:center;gap:10px;padding:6px 16px 6px 6px;border-radius:999px;background:rgba(255,255,255,.14);",
    "border:1px solid rgba(255,255,255,.26);font:600 16px/20px Roboto,sans-serif}",
    ".wm .c.b .solid{width:30px;height:30px;margin:0;box-shadow:none}",
    ".wm .c.b .say{max-width:none;margin-top:14px;white-space:nowrap}",
    ".wm .c.b .n{display:block;margin-top:28px;font:700 96px/.9 Roboto,sans-serif;letter-spacing:-3px;font-variant-numeric:tabular-nums}",
    ".wm .gainrow{display:flex;align-items:baseline;justify-content:center;gap:8px}",
    ".wm .gainrow .n{font:700 88px/.9 Roboto,sans-serif;letter-spacing:-3px;font-variant-numeric:tabular-nums}",
    ".wm .gainrow em{font-style:normal;font:600 24px/1 Roboto,sans-serif;opacity:.88}",
    ".wm .say{max-width:270px;margin:18px auto 0;font:400 17px/25px Roboto,sans-serif;color:rgba(255,255,255,.9)}",
    /* (older B pieces, still used by D) */
    ".wm .solid{width:64px;height:64px;margin:0 auto 20px;border-radius:50%;background:#fff;display:grid;place-items:center;transform:scale(0);",
    "box-shadow:0 0 0 10px rgba(255,255,255,.14),0 0 0 22px rgba(255,255,255,.07),0 12px 30px -8px rgba(0,40,20,.35)}",
    ".wm .solid path{fill:none;stroke:#1E8A5C;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:76;stroke-dashoffset:76}",
    ".wm .big{font:700 72px/1 Roboto,sans-serif;letter-spacing:-2px;font-variant-numeric:tabular-nums}",
    ".wm .big small{display:block;margin-top:6px;font:500 16px/20px Roboto,sans-serif;letter-spacing:.2px;opacity:.8}",
    ".wm .pillchip{display:inline-flex;align-items:center;gap:8px;margin-top:22px;padding:8px 14px 8px 10px;border-radius:999px;background:rgba(255,255,255,.16);",
    "border:1px solid rgba(255,255,255,.3);font:500 14px/18px Roboto,sans-serif}",
    ".wm .pillchip i{width:18px;height:18px;background:#fff;display:block}",
    ".wm .meta{display:block;margin-top:12px;font:400 14px/20px Roboto,sans-serif;opacity:.72}",
    /* C: the score's own gauge, the tick inside it */
    ".wm .gauge{position:relative;width:188px;height:188px;margin:0 auto 18px}",
    ".wm .gauge svg{position:absolute;inset:0}",
    ".wm .gauge .in{position:absolute;inset:0;display:grid;place-items:center;align-content:center;gap:2px}",
    ".wm .gauge .pct{font:700 48px/1 Roboto,sans-serif;letter-spacing:-1.5px;font-variant-numeric:tabular-nums}",
    ".wm .gauge .pct s{text-decoration:none;font-size:20px;opacity:.8}",
    ".wm .gain{display:inline-block;padding:3px 10px;border-radius:999px;background:#fff;color:#1E8A5C;font:700 13px/16px Roboto,sans-serif}",
    ".wm .ttl{font:600 20px/26px Roboto,sans-serif}",
    ".wm .sub2{margin-top:6px;font:400 14px/20px Roboto,sans-serif;opacity:.78}",
    /* D: the four macros, the one that moved most lit */
    ".wm .macs{display:flex;gap:6px;justify-content:center;margin:26px auto 0;max-width:340px}",
    ".wm .mc{flex:1;padding:12px 4px 10px;border-radius:16px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);display:grid;justify-items:center;gap:6px}",
    ".wm .mc i{width:24px;height:24px;background:#fff;opacity:.9;display:block}",
    ".wm .mc b{font:700 16px/18px Roboto,sans-serif;font-variant-numeric:tabular-nums}",
    ".wm .mc span{font:400 12px/14px Roboto,sans-serif;opacity:.75}",
    ".wm .mc.top{background:#fff;color:#1E8A5C;border-color:#fff;box-shadow:0 10px 24px -10px rgba(0,40,20,.45)}",
    ".wm .mc.top i{background:#1E8A5C;opacity:1}",
    ".wm .mc.top span{opacity:1;font-weight:500}",
    /* E: a receipt, left aligned in the lower half */
    ".wm .c.left{top:auto;bottom:120px;transform:none;text-align:left;padding:0 24px}",
    ".wm .row1{display:flex;align-items:center;gap:10px;font:500 15px/20px Roboto,sans-serif}",
    ".wm .row1 .solid{width:32px;height:32px;margin:0;box-shadow:0 0 0 6px rgba(255,255,255,.14)}",
    ".wm .huge{margin-top:18px;font:700 104px/.9 Roboto,sans-serif;letter-spacing:-4px;font-variant-numeric:tabular-nums}",
    ".wm .huge + p{margin:8px 0 0;font:400 16px/22px Roboto,sans-serif;opacity:.85}",
    ".wm .rcpt{margin-top:22px;border-radius:16px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);overflow:hidden}",
    ".wm .rcpt div{display:flex;justify-content:space-between;padding:12px 14px;font:400 14px/18px Roboto,sans-serif}",
    ".wm .rcpt div + div{border-top:1px solid rgba(255,255,255,.14)}",
    ".wm .rcpt div.tot{font-weight:600;background:rgba(255,255,255,.08)}",
    ".wm .chip{position:absolute;left:0;top:0;padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.45);",
    "opacity:0;color:#fff;font:500 13px/16px Roboto,sans-serif;white-space:nowrap;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}"
  ].join("");
  document.head.appendChild(css);

  var cl = function (x, a, b) { return Math.min(b == null ? 1 : b, Math.max(a || 0, x)); };
  var seg = function (t, a, b) { return cl((t - a) / (b - a)); };
  var eOut = function (x) { return 1 - Math.pow(1 - x, 3); };
  var eIO = function (x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var eBack = function (x) { return 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2); };
  var mix = function (a, b, k) { return a + (b - a) * k; };
  var buzz = function (ms) { try { navigator.vibrate && navigator.vibrate(ms || 8); } catch (e) {} };

  function begin(btnRect, names) {
    if (MODE === "classic" || REDUCED) return null;
    var host = document.createElement("div"); host.className = "wm"; host.setAttribute("role", "status");
    host.innerHTML = '<canvas></canvas><div class="c"></div>';
    document.body.appendChild(host);
    var cv = host.querySelector("canvas"), x = cv.getContext("2d"), box = host.getBoundingClientRect();
    var W = box.width, H = box.height, DPR = Math.min(devicePixelRatio || 1, 2);
    cv.width = W * DPR; cv.height = H * DPR; x.scale(DPR, DPR);
    var B = { x: btnRect.left - box.left + btnRect.width / 2, y: btnRect.top - box.top + btnRect.height / 2, w: btnRect.width, h: btnRect.height };
    var C = { x: W / 2, y: LAYOUT === "E" ? H - 330 : LAYOUT === "B" ? H / 2 - 88 : H / 2 - 70 };   // where the burst centres: on the tick, or the number
    var c = host.querySelector(".c"), disc = null, tick = null;

    var t0 = performance.now(), winAt = null, data = null, done = null, exitAt = null, raf = 0, alive = true;
    var R = function (a, b) { return a + Math.random() * (b - a); };
    var sparks = [], motes = [], bubbles = [], chips = [];
    for (var i = 0; i < 420; i++) sparks.push({ a: R(0, 6.283), sp: R(90, 520), s: R(1, 2.8), h: Math.random(), drift: R(-1, 1), del: R(0, .1) });
    for (i = 0; i < 70; i++) motes.push({ a: R(0, 6.283), r: R(80, 260), sp: R(.6, 1.4), s: R(.8, 2) });
    for (i = 0; i < 40; i++) bubbles.push({ x: R(0, W), sp: R(80, 220), r: R(2, 6), ph: R(0, 6.28) });
    if (MODE === "rise") (names || []).slice(0, 4).forEach(function (n, j) {
      var el = document.createElement("span"); el.className = "chip"; el.textContent = n; host.appendChild(el);
      chips.push({ el: el, x: B.x + R(-60, 60), del: j * .12, drift: R(-30, 30) });
    });

    function glow(px, py, r, a) {
      var g = x.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, "rgba(255,255,255," + a + ")"); g.addColorStop(.3, "rgba(108,233,166," + .85 * a + ")"); g.addColorStop(1, "rgba(108,233,166,0)");
      x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill();
    }
    function content(w) {
      if (!disc) return;
      // the tick lands first, then each line rises in on its own beat, and every number counts up
      c.style.opacity = (w > 0 ? 1 : 0) * (exitAt ? 1 - seg(ex(), 0, .3) : 1);
      disc.style.transform = "scale(" + (w < .3 ? eBack(seg(w, 0, .3)) : 1) + ")";
      tick.style.strokeDashoffset = 76 * (1 - eOut(seg(w, .15, .4)));
      c.querySelectorAll("[data-in]").forEach(function (el) {
        var k = eOut(seg(w, +el.dataset.in, +el.dataset.in + .45));
        el.style.opacity = k; el.style.transform = "translateY(" + (1 - k) * 12 + "px)";
      });
      c.querySelectorAll("[data-to]").forEach(function (el) {
        var k = eOut(seg(w, +(el.dataset.at || .1), +(el.dataset.at || .1) + .8)), v = +el.dataset.from + (+el.dataset.to - +el.dataset.from) * k;
        el.textContent = Math.round(v);
      });
      var arc = c.querySelector(".arc");
      if (arc) arc.style.strokeDashoffset = arc.dataset.len * (1 - mix(+arc.dataset.a, +arc.dataset.b, eIO(seg(w, .2, 1.3))) * .75);
    }
    function ex() { return exitAt ? (performance.now() - exitAt) / 1000 : 0; }

    // ---------------------------------------------------------------- nova
    function nova(t, w) {
      var dark = eIO(seg(t, 0, .45));
      // lights down, then up into the brand green after the blast
      var bright = w == null ? 0 : eIO(seg(w, .5, 1.3));
      var g = x.createLinearGradient(0, 0, W * .4, H);
      g.addColorStop(0, "rgb(" + Math.round(mix(4, 42, bright)) + "," + Math.round(mix(26, 128, bright)) + "," + Math.round(mix(18, 90, bright)) + ")");
      g.addColorStop(1, "rgb(" + Math.round(mix(3, 18, bright)) + "," + Math.round(mix(40, 183, bright)) + "," + Math.round(mix(28, 106, bright)) + ")");
      x.globalAlpha = dark * (exitAt ? 1 - seg(ex(), .25, .7) : 1); x.fillStyle = g; x.fillRect(0, 0, W, H); x.globalAlpha = 1;
      // the star: born on the button, breathing and drinking in light while the save runs
      if (w == null || w < .45) {
        var fly = w == null ? 0 : eIO(seg(w, 0, .35)), col = w == null ? 0 : seg(w, .3, .45);
        var sx = mix(B.x, C.x, fly), sy = mix(B.y, C.y, fly) - Math.sin(Math.PI * fly) * 60;
        var r = (8 + 5 * Math.sin(t * 9)) * (1 - col) + 26 * seg(t, 0, .4) * (1 - col);
        if (w == null) motes.forEach(function (m) {   // light drawn inward
          var k = ((t * m.sp + m.r / 260) % 1), rr = m.r * (1 - k);
          x.globalAlpha = k * .8; x.fillStyle = "#A6F4C5";
          x.beginPath(); x.arc(sx + Math.cos(m.a) * rr, sy + Math.sin(m.a) * rr, m.s, 0, 7); x.fill();
        });
        x.globalAlpha = 1; glow(sx, sy, r * 3.2, 1);
        // a fading streak behind the flight
        if (w != null && fly < 1) for (var k = 1; k < 10; k++) { var f2 = eIO(seg(w - k * .015, 0, .35));
          glow(mix(B.x, C.x, f2), mix(B.y, C.y, f2) - Math.sin(Math.PI * f2) * 60, r * 2.4 * (1 - k / 10), .5 * (1 - k / 10)); }
      }
      if (w == null) return;
      // the blast: a shock ring and sparks with trails that slow into drifting glitter
      var bt = w - .45;
      if (bt > 0) {
        if (bt < .02) buzz(20);
        var ring = seg(bt, 0, .7);
        x.strokeStyle = "rgba(166,244,197," + .8 * (1 - ring) + ")"; x.lineWidth = 4 * (1 - ring);
        x.beginPath(); x.arc(C.x, C.y, 30 + 460 * eOut(ring), 0, 7); x.stroke();
        glow(C.x, C.y, 120 * (1 - seg(bt, 0, .35)) + 1, 1 - seg(bt, 0, .4));
        var fade = exitAt ? 1 - seg(ex(), 0, .4) : 1;
        sparks.forEach(function (s) {
          var u = bt - s.del; if (u <= 0) return;
          var d = s.sp * (1 - Math.exp(-u * 3.2)) + u * 14, d0 = s.sp * (1 - Math.exp(-(u - .035) * 3.2)) + (u - .035) * 14;
          var a = s.a + s.drift * u * .15;
          var px = C.x + Math.cos(a) * d, py = C.y + Math.sin(a) * d + u * u * 10;
          var qx = C.x + Math.cos(a) * Math.max(0, d0), qy = C.y + Math.sin(a) * Math.max(0, d0) + u * u * 10;
          x.globalAlpha = fade * (u < 1.6 ? 1 : .5 + .5 * Math.sin(u * 8 + s.h * 9));
          x.strokeStyle = s.h < .34 ? "#fff" : s.h < .67 ? "#6CE9A6" : "#32D583"; x.lineWidth = s.s; x.lineCap = "round";
          x.beginPath(); x.moveTo(qx, qy); x.lineTo(px, py); x.stroke();
        });
        x.globalAlpha = 1;
        content(bt);
      }
      // the exit: everything is drawn up toward where the score sits on the day view
      if (exitAt) { var e = seg(ex(), 0, .55); glow(C.x, mix(C.y, H * .3, eIO(e)), 30 * (1 - e) + 1, 1 - e); }
    }

    // ---------------------------------------------------------------- rise
    function rise(t, w) {
      // while saving the liquid wells out of the button and pools; the win sends it over the top
      var pool = eOut(seg(t, 0, .9)) * .36, surge = w == null ? 0 : eIO(seg(w, 0, .7));
      var level = mix(pool, 1.12, surge), drain = exitAt ? eIO(seg(ex(), 0, .6)) : 0;
      var top = H - level * H + drain * (H * 1.15);
      var amp = 10 + 14 * Math.sin(Math.PI * surge);
      // the blob leaving the button, before the pool covers it
      var bl = seg(t, 0, .5);
      if (bl < 1) { x.fillStyle = "rgba(41,157,107," + (1 - bl) + ")"; x.beginPath(); x.ellipse(B.x, B.y, B.w / 2 * (1 + bl * .4), B.h / 2 * (1 + bl * 2), 0, 0, 7); x.fill(); }
      var g = x.createLinearGradient(0, top, 0, H);
      g.addColorStop(0, "#6CE9A6"); g.addColorStop(.18, "#2FB47B"); g.addColorStop(1, "#1E7A52");
      x.beginPath(); x.moveTo(0, H + 40);
      for (var px = 0; px <= W; px += 6) x.lineTo(px, top + Math.sin(px * .024 + t * 3.6) * amp + Math.sin(px * .057 - t * 2.4) * amp * .4 + (Math.abs(px - B.x) < 70 ? -Math.cos((px - B.x) / 70 * Math.PI / 2) * 18 * (1 - surge) : 0));
      x.lineTo(W, H + 40); x.closePath(); x.fillStyle = g; x.fill();
      x.beginPath();
      for (px = 0; px <= W; px += 6) { var y = top + Math.sin(px * .024 + t * 3.6) * amp + Math.sin(px * .057 - t * 2.4) * amp * .4; px ? x.lineTo(px, y) : x.moveTo(px, y); }
      x.strokeStyle = "rgba(255,255,255,.85)"; x.lineWidth = 3; x.stroke();
      // bubbles
      bubbles.forEach(function (b) {
        var by = H - ((t * b.sp + b.ph * 60) % (H + 40)); if (by < top + 8) return;
        x.strokeStyle = "rgba(255,255,255,.5)"; x.lineWidth = 1.3; x.beginPath(); x.arc(b.x + Math.sin(t * 2 + b.ph) * 6, by, b.r, 0, 7); x.stroke();
      });
      // the logged foods ride up in the water and burst into sparkle at the surface
      chips.forEach(function (ch, j) {
        var u = w == null ? 0 : seg(w, ch.del, ch.del + .9);
        var cy = mix(B.y - 30, C.y + 130 - j * 12, eOut(u)), a = u <= 0 ? 0 : 1 - seg(u, .75, 1);
        ch.el.style.opacity = a * (1 - drain);
        ch.el.style.transform = "translate(" + (ch.x + ch.drift * u - ch.el.offsetWidth / 2) + "px," + cy + "px) scale(" + (1 + .15 * seg(u, .75, 1)) + ")";
        if (u > .75 && u < 1) for (var k = 0; k < 8; k++) { var aa = k / 8 * 6.28, rr = 40 * seg(u, .75, 1);
          x.fillStyle = "rgba(255,255,255," + (1 - seg(u, .75, 1)) + ")"; x.beginPath(); x.arc(ch.x + ch.drift * u + Math.cos(aa) * rr, cy + 8 + Math.sin(aa) * rr, 2, 0, 7); x.fill(); }
      });
      if (w != null) { if (w > .5 && w < .52) buzz(18); content(w - .45); }
    }

    function frame(now) {
      if (!alive) return;
      var t = (now - t0) / 1000, w = winAt == null ? null : (now - winAt) / 1000;
      x.clearRect(0, 0, W, H);
      (MODE === "rise" ? rise : nova)(t, w);
      /* leave into white, the day view's own ground, so the logger never shows through on the way out */
      if (exitAt) { x.globalAlpha = eIO(seg(ex(), .05, .55)); x.fillStyle = "#fff"; x.fillRect(0, 0, W, H); x.globalAlpha = 1; }
      if (exitAt && ex() > .7) { alive = false; done && done(); return; }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    function layout(d) {
      var TICK = '<svg width="34" height="34" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>';
      var GLY = { p: "protein", c: "carbs", f: "fats", fibre: "fibre" }, NAME = { p: "Protein", c: "Carbs", f: "Fats", fibre: "Fibre" };
      var moved = d.queued ? d.moved : '<i class="glyph-' + GLY[d.key] + '"></i>' + NAME[d.key] + " moved most";
      var meta = d.n + (d.n === 1 ? " item" : " items") + " · " + d.meal + (d.queued ? ", sends when you are back" : "");
      var from = +(Q.get("from") || 45), to = Math.min(100, from + d.d);
      if (LAYOUT === "A") return '<div class="disc">' + TICK.replace('width="34" height="34"', 'width="40" height="40"') + '</div>' +
        '<div class="d" data-in=".1">+<b data-from="0" data-to="' + d.d + '">0</b><s> points</s></div><p data-in=".25">' + d.moved + '</p><span class="m" data-in=".35">' + d.sub + "</span>";
      /* B: as little as possible. The tick, the gain, and one plain line saying what earned it. */
      /* B: the tick names what was logged, the gain stands alone, one line says what it is */
      if (LAYOUT === "B") return '<span class="logged"><span class="disc solid">' + TICK.replace(/34/g, "16") + '</span>' + d.meal + ' logged</span>' +
        '<span class="n" data-in=".12">+<span data-from="0" data-to="' + d.d + '">0</span></span>' +
        '<p class="say" data-in=".3">' + (d.queued ? "Saved on your phone. Your score updates when you're back online."
          : "points added to your sufficiency score") + "</p>";
      if (LAYOUT === "C") {
        var r = 84, len = 2 * Math.PI * r;
        return '<div class="gauge"><svg viewBox="0 0 188 188"><circle cx="94" cy="94" r="' + r + '" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="8" stroke-dasharray="' + len * .75 + ' ' + len + '" stroke-linecap="round" transform="rotate(135 94 94)"/>' +
          '<circle class="arc" data-len="' + len + '" data-a="' + from / 100 + '" data-b="' + to / 100 + '" cx="94" cy="94" r="' + r + '" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + len + '" stroke-dashoffset="' + len + '" transform="rotate(135 94 94)"/></svg>' +
          '<div class="in"><div class="disc solid" style="width:30px;height:30px;margin:0 0 6px;box-shadow:none">' + TICK.replace(/34/g, "18") + '</div><div class="pct"><span data-from="' + from + '" data-to="' + to + '" data-at=".2">' + from + '</span><s>%</s></div>' +
          '<span class="gain" data-in=".6">+' + d.d + ' points</span></div></div>' +
          '<div class="ttl" data-in=".3">' + d.meal + ' is logged</div><div class="sub2" data-in=".42">' + (d.queued ? d.moved : NAME[d.key] + " moved most") + " · " + d.n + (d.n === 1 ? " item" : " items") + "</div>";
      }
      if (LAYOUT === "D") return '<div class="disc solid">' + TICK + '</div>' +
        '<div class="big" data-in=".1">+<span data-from="0" data-to="' + d.d + '">0</span><small>points on today\'s score</small></div>' +
        '<div class="macs">' + ["p", "c", "f", "fibre"].map(function (k, i) {
          return '<div class="mc' + (k === d.key ? " top" : "") + '" data-in="' + (.3 + i * .08) + '"><i class="glyph-' + GLY[k] + '"></i><b>+<span data-from="0" data-to="' + Math.round(d.g[k]) + '" data-at="' + (.35 + i * .08) + '">0</span>g</b><span>' + (k === d.key ? "Moved most" : NAME[k]) + "</span></div>";
        }).join("") + '</div><span class="meta" data-in=".7">' + meta + "</span>";
      /* E */
      return '<div class="row1" data-in="0"><div class="disc solid">' + TICK.replace(/34/g, "18") + '</div>' + d.meal + ' is logged</div>' +
        '<div class="huge" data-in=".1">+<span data-from="0" data-to="' + d.d + '">0</span></div><p data-in=".2">points on today\'s score, ' + (d.queued ? "saved on your phone" : NAME[d.key].toLowerCase() + " moved most") + '</p>' +
        '<div class="rcpt" data-in=".35">' + (d.lines || []).map(function (l) { return "<div><span>" + l.name + "</span><span>" + l.kcal + " kcal</span></div>"; }).join("") +
        '<div class="tot"><span>' + d.n + (d.n === 1 ? " item" : " items") + '</span><span>' + d.kcal + ' kcal</span></div></div>';
    }

    return {
      win: function (d, cb) {
        // never pay off before the charge has had a moment to read
        var wait = Math.max(0, 700 - (performance.now() - t0));
        setTimeout(function () {
          data = d; done = cb;
          c.innerHTML = layout(d);
          c.classList.toggle("left", LAYOUT === "E"); c.classList.toggle("b", LAYOUT === "B");
          disc = c.querySelector(".disc"); tick = disc.querySelector("path");
          winAt = performance.now(); buzz(10);
          if (!STAY) setTimeout(function () { exitAt = performance.now(); }, MODE === "rise" ? 2800 : 3000);
        }, wait);
      },
      cancel: function () { alive = false; cancelAnimationFrame(raf); host.remove(); }
    };
  }

  /* the macro glyphs the layouts use */
  if (!document.querySelector('link[href*="glyph-masks"]')) {
    var gl = document.createElement("link"); gl.rel = "stylesheet"; gl.href = "../icons/glyph-masks.css"; document.head.appendChild(gl);
  }

  /* ?auto=1: add what the plan tab lists and tap Log, so the options page can run each phone hands-free */
  if (AUTO) setTimeout(function () {
    /* looked up fresh each time: adding one redraws the list */
    [0, 1].forEach(function (i) { setTimeout(function () {
      var b = document.querySelectorAll('button[aria-label^="Add "]')[0]; if (b) b.click();
    }, i * 300); });
    setTimeout(function () { var s = document.getElementById("saveBtn"); if (s) s.click(); }, 1100);
  }, 900);

  window.WinMoment = { begin: begin, mode: MODE, layout: LAYOUT };
})();
