/* Calorie strip options for the Eat page.
   Six slim ways to say "942 of 1,900 kcal", 28 to 56px tall, 342 wide.
   Classic script: window.PARTS.cal = [{ id, name, note, mount(el) }]. */
(function () {
  "use strict";
  window.PARTS = window.PARTS || {};

  /* ---------- the day ---------- */
  var GOAL = 1900, EATEN = 942, LEFT = GOAL - EATEN;

  /* ---------- tiny helpers ---------- */
  var RM = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  var n = 0;
  function uid() { return "cs" + (++n); }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function fmt(v) { return v.toLocaleString("en-US"); }
  /* seeded, so the scattered shapes never reshuffle between renders */
  function rng(seed) {
    var s = seed >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  /* one-shot intro; returns a stop function */
  function run(dur, step) {
    if (RM) { step(1); return function () {}; }
    var t0 = 0, raf = 0, off = false;
    raf = requestAnimationFrame(function loop(now) {
      if (off) return;
      if (!t0) t0 = now;
      var t = Math.min(1, (now - t0) / dur);
      step(ease(t));
      if (t < 1) raf = requestAnimationFrame(loop);
    });
    return function () { off = true; cancelAnimationFrame(raf); };
  }

  /* very subtle idle loop; fn(seconds) */
  function idle(fn) {
    if (RM) { fn(0); return function () {}; }
    var t0 = 0, raf = 0, off = false;
    raf = requestAnimationFrame(function loop(now) {
      if (off) return;
      if (!t0) t0 = now;
      fn((now - t0) / 1000);
      raf = requestAnimationFrame(loop);
    });
    return function () { off = true; cancelAnimationFrame(raf); };
  }

  function stopAll(list) { return { dispose: function () { list.forEach(function (f) { f(); }); } }; }

  /* ---------- canvas helpers ---------- */
  function canvasIn(parent, W, H, mt) {
    var cv = document.createElement("canvas");
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    cv.style.cssText = "display:block;width:" + W + "px;height:" + H + "px" + (mt ? ";margin-top:" + mt + "px" : "");
    parent.appendChild(cv);
    var ctx = cv.getContext("2d");
    ctx.scale(dpr, dpr);
    return ctx;
  }
  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, h / 2, w / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  var CSS = [
    ".cs-min{font:400 12px Roboto,sans-serif;color:#667085;padding:2px 0}",
    ".cs-row{display:flex;align-items:baseline;justify-content:space-between;gap:10px}",
    ".cs-big{font-size:15px;color:#98A2B3;white-space:nowrap}",
    ".cs-big b{font-weight:700;color:#101828;font-size:17px}",
    ".cs-lab{font-size:12.5px;color:#344054}",
    ".cs-sub{font-size:12px;color:#98A2B3;white-space:nowrap}",
    ".cs-rule{height:2px;border-radius:2px;background:#E4E7EC;margin-top:8px;overflow:hidden}",
    ".cs-rule i{display:block;height:100%;width:0;background:#299D6B;border-radius:2px}",
    ".cs-ticks{display:flex;gap:5px;margin-top:9px}",
    ".cs-tick{flex:1;height:6px;border-radius:3px;background:#E4E7EC;transition:none}",
    '.cs{width:100%;font-family:Roboto,"Helvetica Neue",Arial,sans-serif;letter-spacing:.25px;color:#101828}',
    '.cs-row{display:flex;align-items:baseline}',
    '.cs-v{font-size:13px;color:#667085;white-space:nowrap}',
    '.cs-v b{font-size:15px;font-weight:700;color:#101828}',
    '.cs-sub{margin-left:auto;font-size:12px;color:#98A2B3;white-space:nowrap}',
    '.cs-flex{display:flex;align-items:center;gap:14px}',
    '.cs-lines .l1{font-size:13px;color:#667085;white-space:nowrap;line-height:22px}',
    '.cs-lines .l1 b{font-size:17px;font-weight:700;color:#101828}',
    '.cs-lines .l2{font-size:12px;color:#98A2B3;line-height:16px}',
    '.cs-flamewrap{position:relative;width:38px;height:40px;display:grid;place-items:center;flex-shrink:0}',
    '.cs-flamewrap::before{content:"";position:absolute;left:50%;bottom:1px;width:34px;height:12px;transform:translateX(-50%);border-radius:9999px;background:radial-gradient(closest-side,rgba(171,230,204,.85),rgba(255,255,255,0))}',
    '.cs-wave{position:relative;height:28px}',
    '.cs-wtxt{position:absolute;inset:0;display:flex;align-items:center;justify-content:space-between;padding:0 13px;pointer-events:none}',
    '.cs-wtxt .a{font-size:12px;font-weight:700;color:#fff}',
    '.cs-wtxt .b{font-size:12px;color:#667085}',
    /* odometer: a mechanical counter window, digits on reels */
    '.cs-odo{display:inline-flex;gap:1px;padding:2px 5px;border-radius:6px;background:#F9FAFB;border:1px solid #E4E7EC;box-shadow:inset 0 1px 2px rgba(16,24,40,.07)}',
    '.cs-odo .w{position:relative;width:11px;height:22px;overflow:hidden}',
    '.cs-odo .w::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(249,250,251,.92),rgba(249,250,251,0) 30%,rgba(249,250,251,0) 70%,rgba(249,250,251,.92)),linear-gradient(180deg,transparent 49.4%,rgba(16,24,40,.08) 50%,transparent 50.6%)}',
    '.cs-odo .r{display:block}',
    '.cs-odo .r span{display:block;height:22px;line-height:22px;text-align:center;font-size:16px;font-weight:700;color:#101828;font-variant-numeric:tabular-nums}',
    '.cs-pfill{position:relative;height:3px;margin-top:7px;border-radius:2px;background:#F2F4F7;overflow:hidden}',
    '.cs-pfill i{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:2px;background:linear-gradient(90deg,#59B38C,#299D6B)}'
  ].join("");

  function inject() {
    if (document.getElementById("cs-style")) return;
    var s = document.createElement("style");
    s.id = "cs-style";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function head(right) {
    return '<div class="cs-row"><span class="cs-v"><b>' + fmt(EATEN) + '</b> of ' + fmt(GOAL) +
      ' kcal</span><span class="cs-sub">' + right + '</span></div>';
  }

  /* ---------- 1. ember fuse ---------- */
  /* A braided fuse burning through the day: lit rope behind the ember, pale
     rope ahead of it. The glow marks where the day has got to. */
  function ember(host) {
    inject();
    var id = uid(), W = 342, H = 22, MID = H / 2, f = EATEN / GOAL, END = W - 4;
    function strand(sign) {
      var d = "M2 " + MID;
      for (var x = 2; x <= END; x += 4) d += " L" + x + " " + (MID + sign * 2.8 * Math.sin(x / 12)).toFixed(2);
      return d;
    }
    var a = strand(1), b = strand(-1);

    host.innerHTML =
      '<div class="cs">' + head(fmt(LEFT) + ' left for today') +
        '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true" style="display:block;margin-top:7px">' +
          '<defs>' +
            '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="0">' +
              '<stop offset="0" stop-color="#1D4D38"/><stop offset=".55" stop-color="#299D6B"/><stop offset="1" stop-color="#79CCA8"/></linearGradient>' +
            '<radialGradient id="' + id + 'r">' +
              '<stop offset="0" stop-color="#FFFFFF"/><stop offset=".35" stop-color="#ABE6CC"/>' +
              '<stop offset="1" stop-color="#79CCA8" stop-opacity="0"/></radialGradient>' +
            '<clipPath id="' + id + 'c"><rect class="clip" x="0" y="0" width="0" height="' + H + '"/></clipPath>' +
          '</defs>' +
          '<path d="' + a + '" fill="none" stroke="#E4E7EC" stroke-width="2.2" stroke-linecap="round"/>' +
          '<path d="' + b + '" fill="none" stroke="#E4E7EC" stroke-width="2.2" stroke-linecap="round"/>' +
          '<g clip-path="url(#' + id + 'c)">' +
            '<path d="' + a + '" fill="none" stroke="#ABE6CC" stroke-width="7" stroke-linecap="round" opacity=".3"/>' +
            '<path d="' + b + '" fill="none" stroke="#ABE6CC" stroke-width="7" stroke-linecap="round" opacity=".3"/>' +
            '<path d="' + a + '" fill="none" stroke="url(#' + id + 'g)" stroke-width="2.6" stroke-linecap="round"/>' +
            '<path d="' + b + '" fill="none" stroke="url(#' + id + 'g)" stroke-width="2.6" stroke-linecap="round"/>' +
          '</g>' +
          '<g class="head" transform="translate(2 ' + MID + ')">' +
            '<g class="sparks"></g>' +
            '<circle r="9" fill="url(#' + id + 'r)" opacity=".9"/>' +
            '<circle r="3.4" fill="#FAFFFD"/>' +
            '<circle r="3.4" fill="none" stroke="#79CCA8" stroke-width="1.2"/>' +
          '</g>' +
        '</svg>' +
      '</div>';

    var clip = host.querySelector(".clip"), headG = host.querySelector(".head"),
        sparkG = host.querySelector(".sparks"), NS = "http://www.w3.org/2000/svg";
    var rand = rng(7), sparks = [];
    for (var i = 0; i < 4; i++) {
      var c = document.createElementNS(NS, "circle");
      c.setAttribute("r", (0.8 + rand() * 0.8).toFixed(2));
      c.setAttribute("fill", i % 2 ? "#E7C144" : "#ABE6CC");
      sparkG.appendChild(c);
      sparks.push({ el: c, t: rand(), s: 0.16 + rand() * 0.14, x: -1 + rand() * 4 });
    }

    var row = host.querySelector(".cs-row");
    var cur = { eaten: EATEN, goal: GOAL };
    function pos(k) { return Math.max(2, Math.min(END, W * Math.max(0, Math.min(1, k)))); }
    /* the numbers count with the ember, so only the digits are touched per
       frame: the row itself is rebuilt only when the goal changes */
    var shownGoal = GOAL, bEl = row && row.querySelector(".cs-v b"), subEl = row && row.querySelector(".cs-sub");
    function writeRow(e, g) {
      if (!row) return;
      var r = Math.round(e);
      if (g !== shownGoal || !bEl || !subEl) {
        shownGoal = g;
        row.innerHTML = '<span class="cs-v"><b>' + fmt(r) + '</b> of ' + fmt(g) +
          ' kcal</span><span class="cs-sub">' + fmt(Math.max(0, g - r)) + ' left for today</span>';
        bEl = row.querySelector(".cs-v b");
        subEl = row.querySelector(".cs-sub");
        return;
      }
      bEl.textContent = fmt(r);
      subEl.textContent = fmt(Math.max(0, g - r)) + " left for today";
    }

    var at = 0;
    var stop1 = run(1100, function (t) {
      at = 2 + (pos(f) - 2) * t;
      clip.setAttribute("width", at.toFixed(1));
      headG.setAttribute("transform", "translate(" + at.toFixed(1) + " " + MID + ")");
      writeRow(EATEN * t, GOAL);
    });
    var stop2 = idle(function (s) {
      sparks.forEach(function (p) {
        p.t += p.s / 60;
        if (p.t > 1) p.t = 0;
        p.el.setAttribute("cx", (p.x + Math.sin(s * 1.4 + p.x) * 1.6).toFixed(2));
        p.el.setAttribute("cy", (-2 - p.t * 8).toFixed(2));
        p.el.setAttribute("opacity", (0.75 * Math.sin(p.t * Math.PI)).toFixed(2));
      });
    });

    /* A meal logged burns the fuse forward from where it is: the ember travels,
       the numbers count with it, and the sparks carry on as they were. */
    var moveStop = null;
    var api = stopAll([stop1, stop2, function () { if (moveStop) moveStop(); }]);
    api.set = function (eaten, goal) {
      if (typeof eaten !== "number") return;
      var g = typeof goal === "number" && goal > 0 ? goal : cur.goal;
      var e0 = cur.eaten, x0 = at, x1 = pos(eaten / g);
      cur.eaten = eaten;
      cur.goal = g;
      if (moveStop) moveStop();
      moveStop = run(700, function (t) {
        at = x0 + (x1 - x0) * t;
        clip.setAttribute("width", at.toFixed(1));
        headG.setAttribute("transform", "translate(" + at.toFixed(1) + " " + MID + ")");
        writeRow(e0 + (eaten - e0) * t, g);
      });
    };
    return api;
  }

  /* ---------- 2. battery cell ---------- */
  /* The day's fuel as a charge: how much is still in the tank, with the
     numbers spelled out beside it. */
  function battery(host) {
    inject();
    var id = uid(), f = EATEN / GOAL, IX = 5.5, IW = 80;
    var bolt = "M9.6 1 L4 9.4 H7.8 L6.7 15 L12.6 6.4 H8.7 Z";
    host.innerHTML =
      '<div class="cs cs-flex" style="gap:13px">' +
        '<svg width="100" height="36" viewBox="0 0 100 36" aria-hidden="true" style="flex-shrink:0">' +
          '<defs>' +
            '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="0">' +
              '<stop offset="0" stop-color="#59B38C"/><stop offset="1" stop-color="#299D6B"/></linearGradient>' +
            '<clipPath id="' + id + 'c"><rect class="clip" x="' + IX + '" y="8" width="0" height="20" rx="6"/></clipPath>' +
          '</defs>' +
          '<rect x="1.5" y="4" width="88" height="28" rx="9" fill="#FFFFFF" stroke="#D0D5DD" stroke-width="1.6"/>' +
          '<rect x="92" y="13" width="5" height="10" rx="2.5" fill="#D0D5DD"/>' +
          '<rect x="' + IX + '" y="8" width="' + IW + '" height="20" rx="6" fill="#F2F4F7"/>' +
          '<g clip-path="url(#' + id + 'c)">' +
            '<rect x="' + IX + '" y="8" width="' + IW + '" height="20" rx="6" fill="url(#' + id + 'g)"/>' +
            '<rect x="' + IX + '" y="8" width="' + IW + '" height="7" rx="4" fill="#FFFFFF" opacity=".18"/>' +
            '<path d="M10 8 L22 8 L14 28 L2 28 Z" fill="#FFFFFF" opacity=".16"/>' +
          '</g>' +
          '<line class="tip" x1="0" y1="9.5" x2="0" y2="26.5" stroke="#E6FAF1" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>' +
          '<g transform="translate(12 10) scale(.85)">' +
            '<path d="' + bolt + '" fill="#FAFFFD" opacity=".95"/>' +
            '<path d="' + bolt + '" fill="none" stroke="#ABE6CC" stroke-width=".8"/>' +
          '</g>' +
        '</svg>' +
        '<div class="cs-lines">' +
          '<div class="l1"><b>' + fmt(LEFT) + '</b> kcal left</div>' +
          '<div class="l2">' + fmt(EATEN) + ' of ' + fmt(GOAL) + ' eaten today</div>' +
        '</div>' +
      '</div>';
    var clip = host.querySelector(".clip"), tip = host.querySelector(".tip");
    return stopAll([run(1000, function (t) {
      var w = IW * f * t;
      clip.setAttribute("width", w.toFixed(2));
      tip.setAttribute("x1", (IX + w).toFixed(2));
      tip.setAttribute("x2", (IX + w).toFixed(2));
      tip.setAttribute("opacity", w > 3 ? ".9" : "0");
    })]);
  }

  /* ---------- 3. fuel gauge ---------- */
  function gauge(host) {
    inject();
    var id = uid(), f = EATEN / GOAL;
    var ticks = "";
    [0, 0.25, 0.5, 0.75, 1].forEach(function (p) {
      var a = Math.PI * (1 - p), c = Math.cos(a), s = Math.sin(a);
      ticks += '<line x1="' + (52 + 30 * c).toFixed(1) + '" y1="' + (48 - 30 * s).toFixed(1) +
        '" x2="' + (52 + 36 * c).toFixed(1) + '" y2="' + (48 - 36 * s).toFixed(1) +
        '" stroke="#D0D5DD" stroke-width="' + (p === 0 || p === 1 || p === 0.5 ? 2 : 1.4) + '" stroke-linecap="round"/>';
    });
    host.innerHTML =
      '<div class="cs cs-flex">' +
        '<svg width="104" height="54" viewBox="0 0 104 54" aria-hidden="true" style="flex-shrink:0">' +
          '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="0">' +
            '<stop offset="0" stop-color="#79CCA8"/><stop offset="1" stop-color="#299D6B"/></linearGradient></defs>' +
          '<path d="M14 48A38 38 0 0 1 90 48" fill="none" stroke="#F2F4F7" stroke-width="7" stroke-linecap="round"/>' +
          '<path class="arc" d="M14 48A38 38 0 0 1 90 48" fill="none" stroke="url(#' + id + ')" stroke-width="7" stroke-linecap="round"/>' +
          ticks +
          '<g class="ndl"><line x1="52" y1="48" x2="24" y2="48" stroke="#1D4D38" stroke-width="2.6" stroke-linecap="round"/></g>' +
          '<circle cx="52" cy="48" r="4.5" fill="#1D4D38"/><circle cx="52" cy="48" r="1.6" fill="#fff"/>' +
        '</svg>' +
        '<div class="cs-lines">' +
          '<div class="l1"><b>' + fmt(EATEN) + '</b> of ' + fmt(GOAL) + ' kcal</div>' +
          '<div class="l2">' + fmt(LEFT) + ' left, about half the day</div>' +
        '</div>' +
      '</div>';
    var arc = host.querySelector(".arc"), ndl = host.querySelector(".ndl");
    var len = arc.getTotalLength();
    arc.style.strokeDasharray = len;
    return stopAll([run(1100, function (t) {
      arc.style.strokeDashoffset = len * (1 - f * t);
      ndl.setAttribute("transform", "rotate(" + (180 * f * t).toFixed(2) + " 52 48)");
    })]);
  }

  /* ---------- 4. liquid metal ribbon ---------- */
  /* The Liquid Metal hero, poured into a 20px ribbon: molten green chrome has
     flowed half way along a soft track, with a highlight rolling over it. */
  function ribbon(host) {
    inject();
    var W = 342, H = 20, f = EATEN / GOAL;
    host.innerHTML = '<div class="cs">' + head(fmt(LEFT) + ' left') + '</div>';
    var ctx = canvasIn(host.firstChild, W, H, 7);

    /* the chrome cross section: hard bands are what make metal read as metal */
    var band = ctx.createLinearGradient(0, 0, 0, H);
    [[0, "#246649"], [0.13, "#59B38C"], [0.3, "#FAFFFD"], [0.42, "#ABE6CC"],
     [0.53, "#1D4D38"], [0.7, "#299D6B"], [0.88, "#79CCA8"], [1, "#246649"]
    ].forEach(function (s) { band.addColorStop(s[0], s[1]); });

    var grown = 0, phase = 0.3;
    function paint() {
      ctx.clearRect(0, 0, W, H);
      rr(ctx, 0.5, 0.5, W - 1, H - 1, (H - 1) / 2);
      ctx.fillStyle = "#F2F4F7"; ctx.fill();
      ctx.strokeStyle = "#E4E7EC"; ctx.lineWidth = 1; ctx.stroke();

      var w = (W - 2) * f * grown;
      if (w < 2.5) return;
      ctx.save();
      rr(ctx, 1, 1, w, H - 2, (H - 2) / 2);
      ctx.clip();
      ctx.fillStyle = band;
      ctx.fillRect(1, 1, w, H - 2);

      var cx = 1 + phase * (w + 150) - 75;
      var sp = ctx.createLinearGradient(cx - 46, 0, cx + 46, 0);
      sp.addColorStop(0, "rgba(255,255,255,0)");
      sp.addColorStop(0.5, "rgba(255,255,255,.6)");
      sp.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = sp;
      ctx.fillRect(1, 1, w, H - 2);

      var gl = ctx.createLinearGradient(0, 1, 0, H * 0.46);
      gl.addColorStop(0, "rgba(255,255,255,.38)");
      gl.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gl;
      ctx.fillRect(1, 1, w, H * 0.46);

      /* light pooling in the rounded cap, not a line drawn on the edge */
      var cap = ctx.createRadialGradient(1 + w - 7, H / 2, 0, 1 + w - 7, H / 2, 11);
      cap.addColorStop(0, "rgba(250,255,253,.7)");
      cap.addColorStop(1, "rgba(250,255,253,0)");
      ctx.fillStyle = cap;
      ctx.fillRect(1 + w - 20, 1, 20, H - 2);
      ctx.restore();
    }

    var stop1 = run(1000, function (t) { grown = t; paint(); });
    var stop2 = idle(function (s) { phase = (s / 9) % 1; paint(); });
    return stopAll([stop1, stop2]);
  }

  /* ---------- 5. fuel pump ---------- */
  /* Calories as fuel on a petrol pump: the counter rolls up to what the day has
     taken, the line under it says how far through the tank that is. */
  function pump(host) {
    inject();
    var f = EATEN / GOAL, DH = 22, ds = String(EATEN).split("");
    var reels = ds.map(function (d, i) {
      var total = (2 + i) * 10 + Number(d), strip = "";
      for (var k = 0; k <= total; k++) strip += "<span>" + (k % 10) + "</span>";
      return { total: total, html: '<span class="w"><span class="r">' + strip + '</span></span>' };
    });

    host.innerHTML =
      '<div class="cs cs-flex" style="gap:11px">' +
        '<svg width="26" height="30" viewBox="0 0 26 30" aria-hidden="true" style="flex-shrink:0">' +
          '<rect x="2.2" y="4.2" width="13.6" height="23.6" rx="3.4" fill="#F3FCF8" stroke="#299D6B" stroke-width="1.6"/>' +
          '<rect x="5" y="7.4" width="8" height="5.4" rx="1.4" fill="#CBF0E0"/>' +
          '<path d="M5.4 18.4h7.2M5.4 21.8h4.6" stroke="#ABE6CC" stroke-width="1.5" stroke-linecap="round"/>' +
          '<path d="M16 13.2h2.6a2 2 0 0 1 2 2v7a1.6 1.6 0 0 0 3.2 0v-8.4l-2-2.4" fill="none" stroke="#79CCA8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>' +
        '<div style="flex:1;min-width:0">' +
          '<div class="cs-row" style="align-items:center">' +
            '<span class="cs-odo">' + reels[0].html + reels[1].html + reels[2].html + '</span>' +
            '<span class="cs-v" style="margin-left:8px">of ' + fmt(GOAL) + ' kcal</span>' +
            '<span class="cs-sub">' + fmt(LEFT) + ' left</span>' +
          '</div>' +
          '<div class="cs-pfill"><i></i></div>' +
        '</div>' +
      '</div>';

    var rs = host.querySelectorAll(".cs-odo .r"), fill = host.querySelector(".cs-pfill i");
    return stopAll([run(1200, function (u) {
      for (var i = 0; i < rs.length; i++) {
        var lag = i * 0.07;
        var k = Math.max(0, Math.min(1, (u - lag) / (1 - lag)));
        rs[i].style.transform = "translateY(" + (-reels[i].total * DH * k).toFixed(2) + "px)";
      }
      fill.style.width = (100 * f * u).toFixed(2) + "%";
    })]);
  }

  /* ---------- 6. grain tube ---------- */
  /* The day poured in as grain: it settles into a real pile with a sloped face,
     and the clear glass ahead of it is what the day still has room for. */
  function grains(host) {
    inject();
    var W = 342, H = 26, f = EATEN / GOAL;
    host.innerHTML = '<div class="cs">' + head(fmt(LEFT) + ' left') + '</div>';
    var ctx = canvasIn(host.firstChild, W, H, 6);

    var PAD = 4, floorY = H - PAD - 0.5, topY = PAD + 1;
    var fillX = Math.round(W * f), crest = fillX - 46;
    var TONE = ["#299D6B", "#59B38C", "#246649", "#79CCA8", "#2A805A"];
    /* angle of repose: flat on top, then a concave face down to the floor */
    function surface(x) {
      if (x <= crest) return topY + 1.4;
      var k = Math.min(1, (x - crest) / (fillX - crest));
      return topY + 1.4 + k * k * (floorY - topY - 2.6);
    }

    var rand = rng(31), gs = [], x, y;
    for (y = floorY - 1.2; y > topY; y -= 2.7) {
      for (x = 6.5; x < fillX - 1; x += 3.5) {
        var jx = x + (rand() - 0.5) * 2.4, jy = y + (rand() - 0.5) * 1.4;
        if (jy < surface(jx)) continue;
        gs.push({ x: jx, y: jy, a: rand() * Math.PI, c: TONE[(rand() * TONE.length) | 0],
                  r: 2.5 + rand() * 0.9, d: (jx / fillX) * 0.55 });
      }
    }
    /* deeper grain sits darker, so the pile has weight rather than floating */
    gs.sort(function (p, q) { return p.y - q.y; });
    /* the last few still tumbling onto the crest as it settles */
    for (var i = 0; i < 4; i++) {
      var tx = crest + 8 + rand() * 32;
      gs.push({ x: tx, y: surface(tx) + 1.5 + rand() * 2, a: rand() * Math.PI,
                c: TONE[(rand() * TONE.length) | 0], r: 2.4 + rand() * 0.8, d: 0.55 + rand() * 0.15 });
    }

    function paint(t) {
      ctx.clearRect(0, 0, W, H);
      rr(ctx, 0.75, 0.75, W - 1.5, H - 1.5, (H - 1.5) / 2);
      ctx.fillStyle = "#FDFEFE"; ctx.fill();
      ctx.strokeStyle = "#E4E7EC"; ctx.lineWidth = 1.2; ctx.stroke();

      ctx.save();
      rr(ctx, 1.5, 1.5, W - 3, H - 3, (H - 3) / 2);
      ctx.clip();
      for (var i = 0; i < gs.length; i++) {
        var g = gs[i], k = Math.max(0, Math.min(1, (t - g.d) / 0.3));
        if (k <= 0) continue;
        ctx.save();
        ctx.translate(g.x, g.y - (1 - k) * 13);
        ctx.rotate(g.a + (1 - k) * 1.1);
        ctx.globalAlpha = Math.min(1, k * 1.8);
        ctx.fillStyle = g.c;
        ctx.beginPath();
        ctx.ellipse(0, 0, g.r, g.r * 0.62, 0, 0, 6.2832);
        ctx.fill();
        ctx.fillStyle = "rgba(250,255,253,.5)";
        ctx.beginPath();
        ctx.ellipse(-g.r * 0.28, -g.r * 0.2, g.r * 0.4, g.r * 0.2, 0, 0, 6.2832);
        ctx.fill();
        ctx.restore();
      }
      /* glass over the grain: a thin sheen on the curve, not a wash */
      var top = ctx.createLinearGradient(0, 1.5, 0, H * 0.38);
      top.addColorStop(0, "rgba(255,255,255,.5)");
      top.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = top;
      ctx.fillRect(1.5, 1.5, W - 3, H * 0.38);
      var bot = ctx.createLinearGradient(0, H * 0.66, 0, H - 1.5);
      bot.addColorStop(0, "rgba(16,24,40,0)");
      bot.addColorStop(1, "rgba(16,24,40,.08)");
      ctx.fillStyle = bot;
      ctx.fillRect(1.5, H * 0.66, W - 3, H * 0.34);
      ctx.restore();

      /* where the day would be full */
      ctx.save();
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = "#D0D5DD";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W - 12.5, 6);
      ctx.lineTo(W - 12.5, H - 6);
      ctx.stroke();
      ctx.restore();
    }

    return stopAll([run(1200, paint)]);
  }

  /* ---------- 5. flame fill ---------- */
  function flame(host) {
    inject();
    var id = uid(), f = EATEN / GOAL;
    /* filled flame silhouette, 16x16 box, with the inner tongue carved out */
    var D = "M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16m0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15";
    host.innerHTML =
      '<div class="cs cs-flex" style="gap:12px">' +
        '<span class="cs-flamewrap">' +
          '<svg width="30" height="30" viewBox="0 0 16 16" aria-hidden="true" style="position:relative">' +
            '<defs>' +
              '<linearGradient id="' + id + 'g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2A805A"/><stop offset="1" stop-color="#79CCA8"/></linearGradient>' +
              '<clipPath id="' + id + 'c"><rect x="0" y="16" width="16" height="0"/></clipPath>' +
            '</defs>' +
            '<path d="' + D + '" fill="#E4E7EC"/>' +
            '<path d="' + D + '" fill="url(#' + id + 'g)" clip-path="url(#' + id + 'c)"/>' +
          '</svg>' +
        '</span>' +
        '<div class="cs-lines">' +
          '<div class="l1"><b>' + fmt(EATEN) + '</b> of ' + fmt(GOAL) + ' kcal</div>' +
          '<div class="l2">' + fmt(LEFT) + ' kcal left for today</div>' +
        '</div>' +
      '</div>';
    var clip = host.querySelector("#" + id + "c rect");
    return stopAll([run(1000, function (t) {
      var h = 16 * f * t;
      clip.setAttribute("y", 16 - h);
      clip.setAttribute("height", h);
    })]);
  }

  /* ---------- 6. liquid capsule ---------- */
  function wave(host) {
    inject();
    var id = uid(), W = 342, H = 28, f = EATEN / GOAL;
    host.innerHTML =
      '<div class="cs"><div class="cs-wave">' +
        '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true" style="display:block">' +
          '<defs>' +
            '<clipPath id="' + id + 'c"><rect x="0" y="0" width="' + W + '" height="' + H + '" rx="14"/></clipPath>' +
            '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#59B38C"/><stop offset="1" stop-color="#299D6B"/></linearGradient>' +
          '</defs>' +
          '<g clip-path="url(#' + id + 'c)">' +
            '<rect width="' + W + '" height="' + H + '" fill="#F2F4F7"/>' +
            '<path class="liq" fill="url(#' + id + 'g)"/>' +
            '<g class="bub" fill="#fff" opacity=".45"></g>' +
          '</g>' +
          '<rect x=".5" y=".5" width="' + (W - 1) + '" height="' + (H - 1) + '" rx="13.5" fill="none" stroke="#E4E7EC"/>' +
        '</svg>' +
        '<div class="cs-wtxt"><span class="a">' + fmt(EATEN) + ' of ' + fmt(GOAL) + ' kcal</span>' +
        '<span class="b">' + fmt(LEFT) + ' left</span></div>' +
      '</div></div>';

    var liq = host.querySelector(".liq"), bubG = host.querySelector(".bub");
    var bubs = [];
    for (var i = 0; i < 5; i++) {
      var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      bubG.appendChild(c);
      bubs.push({ el: c, x: 20 + Math.random() * (W * f - 40), r: 1.1 + Math.random() * 1.1, t: Math.random(), s: 0.12 + Math.random() * 0.12 });
    }
    function edge(x, phase, amp) {
      var d = "M0 0 L" + x.toFixed(1) + " 0";
      for (var y = 0; y <= H; y += 2) d += " L" + (x + Math.sin(y / H * Math.PI * 2 + phase) * amp).toFixed(2) + " " + y;
      return d + " L0 " + H + " Z";
    }
    var grown = 0;
    var stop1 = run(1000, function (t) { grown = t; liq.setAttribute("d", edge(W * f * t, 0, 1.5 * t)); });
    var stop2 = idle(function (s) {
      liq.setAttribute("d", edge(W * f * grown, s * 1.1, 1.5 * grown));
      bubs.forEach(function (b) {
        b.t += b.s / 60;
        if (b.t > 1) { b.t = 0; b.x = 20 + Math.random() * Math.max(30, W * f * grown - 40); }
        b.el.setAttribute("cx", (b.x + Math.sin(s + b.x) * 1.2).toFixed(1));
        b.el.setAttribute("cy", (H - b.t * (H - 4) - 2).toFixed(1));
        b.el.setAttribute("r", b.r.toFixed(2));
        b.el.setAttribute("opacity", (0.5 * Math.sin(b.t * Math.PI)).toFixed(2));
      });
    });
    return stopAll([stop1, stop2]);
  }


  /* ---------- minimal three: nothing but type, a rule, or ten ticks ---------- */
  function fmt(n) { return n.toLocaleString("en-US"); }

  function counter(el) {
    el.innerHTML = '<div class="cs-min cs-row"><span class="cs-big"><b>0</b> <span>of 1,900 kcal</span></span><span class="cs-sub">958 left</span></div>';
    var b = el.querySelector("b");
    return stopAll([run(900, function (t) { b.textContent = fmt(Math.round(942 * t)); })]);
  }

  function rule(el) {
    el.innerHTML = '<div class="cs-min"><div class="cs-row"><span class="cs-lab">Calorie goal</span>' +
      '<span class="cs-big"><b>942</b> <span>of 1,900 kcal</span></span></div>' +
      '<div class="cs-rule"><i></i></div></div>';
    var i = el.querySelector("i");
    return stopAll([run(900, function (t) { i.style.width = (49.6 * t).toFixed(1) + "%"; })]);
  }

  function ticks(el) {
    var n = 10, html = "";
    for (var k = 0; k < n; k++) html += '<span class="cs-tick"></span>';
    el.innerHTML = '<div class="cs-min"><div class="cs-row"><span class="cs-big"><b>942</b> <span>of 1,900 kcal</span></span>' +
      '<span class="cs-sub">each mark is 190 kcal</span></div><div class="cs-ticks">' + html + '</div></div>';
    var all = [].slice.call(el.querySelectorAll(".cs-tick"));
    return stopAll([run(900, function (t) {
      var lit = 942 / 1900 * n * t;
      all.forEach(function (d, k) { d.style.background = k + 1 <= lit ? "#299D6B" : (k < lit ? "#79CCA8" : "#E4E7EC"); });
    })]);
  }

  window.PARTS.cal = [
    { id: "counter", name: "Just the number", note: "No graphic at all: the number, the goal and what is left.", mount: counter },
    { id: "rule", name: "Filled rule", note: "One line of type over a hairline that fills to half.", mount: rule },
    { id: "ticks", name: "Ten marks", note: "Ten marks across the day, five of them lit.", mount: ticks },
    { id: "ember", name: "Ember fuse", note: "A braided fuse burning through the day's fuel, the glow sitting at now.", mount: ember },
    { id: "ribbon", name: "Liquid metal ribbon", note: "The Liquid Metal score, poured into a ribbon: green chrome half way along, with a highlight rolling over it.", mount: ribbon },
    { id: "pump", name: "Fuel pump", note: "A petrol pump counter rolling up to 942, with the tank line under it.", mount: pump },
    { id: "grains", name: "Grain tube", note: "Green grain poured into a glass tube, settled into a real pile with clear glass ahead.", mount: grains },
    { id: "battery", name: "Battery cell", note: "The day as a charge: how much fuel is still in the tank.", mount: battery },
    { id: "gauge", name: "Fuel gauge", note: "A needle dial like a fuel tank, sitting at half.", mount: gauge },
    { id: "flame", name: "Flame fill", note: "The calorie flame fills up, in the same language as the macro icons above.", mount: flame },
    { id: "wave", name: "Liquid capsule", note: "One 28px capsule of moving liquid, with both numbers read inside it.", mount: wave }
  ];
})();
