/* "All breathing exercises", variant pc: Particle art, night (from How We Feel).
   Deep navy cards in a rail, each with a still shape made of dots, drawn in SVG from simple 3D maths and shaded by depth
   (near dots larger and brighter): a sphere for Simple, a cube for Box, a crescent moon for 4-7-8, one long wave with a
   long tail for Extended Exhale, a soft rounded mound for Belly, concentric rings for Bhramari, a narrowing stream for
   Pursed Lip. Name centred below, minutes small. Nothing moves. The card opens the info sheet, where Start lives. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };
  var AW = 148, AH = 112, CX = AW / 2, CY = AH / 2;

  /* rotate about y then x, light perspective; returns [sx, sy, depth 0..1] */
  function proj(p, ry, rx) {
    var x = p[0], y = p[1], z = p[2], c = Math.cos(ry), s = Math.sin(ry);
    var x1 = x * c + z * s, z1 = -x * s + z * c;
    c = Math.cos(rx); s = Math.sin(rx);
    var y1 = y * c - z1 * s, z2 = y * s + z1 * c, k = 260 / (260 + z2);
    return [CX + x1 * k, CY + y1 * k, z2];
  }
  var SHAPE = {
    coherent: function () { /* sphere, golden spiral */
      var o = [], N = 300, R = 40;
      for (var i = 0; i < N; i++) { var y = 1 - (i + .5) / N * 2, r = Math.sqrt(1 - y * y), t = i * 2.39996; o.push([Math.cos(t) * r * R, y * R, Math.sin(t) * r * R]); }
      return { p: o, ry: .3, rx: -.25 };
    },
    box: function () { /* cube surface */
      var o = [], n = 7, h = 26, a, b;
      for (a = 0; a < n; a++) for (b = 0; b < n; b++) {
        var u = -h + 2 * h * a / (n - 1), v = -h + 2 * h * b / (n - 1);
        o.push([u, v, -h, 0, 0, -1], [u, v, h, 0, 0, 1], [u, -h, v, 0, -1, 0], [u, h, v, 0, 1, 0], [-h, u, v, -1, 0, 0], [h, u, v, 1, 0, 0]);
      }
      /* only the three faces that look at us, so it reads as a solid */
      return { p: o.filter(function (q) { var n = proj([q[3] * 1e3, q[4] * 1e3, q[5] * 1e3], .72, -.52); return n[2] < 0; }), ry: .72, rx: -.52 };
    },
    sleep: function () { /* crescent moon as a lit half sphere, a few stars */
      var o = [], N = 340, R = 38;
      for (var i = 0; i < N; i++) {
        var r = Math.sqrt((i + .5) / N) * R, t = i * 2.39996, x = Math.cos(t) * r - 6, y = Math.sin(t) * r;
        if (Math.hypot(x - 2 - 16, y + 12) < 34) continue;
        o.push([x, y, -Math.sqrt(Math.max(0, R * R - r * r))]);
      }
      return { p: o, ry: 0, rx: 0, stars: [[18, 20], [124, 24], [132, 78], [22, 88], [110, 98], [40, 12]] };
    },
    exhale: function () { /* one wave: a quick rise, then a long tail */
      var o = [];
      for (var i = 0; i <= 40; i++) for (var j = 0; j < 8; j++) {
        var u = i / 40, f = u < .16 ? Math.sin(u / .16 * Math.PI / 2) : Math.exp(-(u - .16) * 3.4);
        o.push([(u - .5) * 112, -f * 32 + 12, (j / 7 - .5) * 48]);
      }
      return { p: o, ry: -.18, rx: -.62 };
    },
    belly: function () { /* a soft rounded mound */
      var o = [];
      for (var i = 0; i <= 24; i++) for (var j = 0; j <= 12; j++) {
        var x = (i / 24 - .5) * 104, z = (j / 12 - .5) * 64;
        o.push([x, -40 * Math.exp(-(x * x / 900 + z * z / 900)) + 18, z]);
      }
      return { p: o, ry: .12, rx: -.38 };
    },
    hum: function () { /* concentric rings, tilted, round a small core */
      var o = [], R = [6, 15, 25, 36, 48];
      R.forEach(function (r) { var n = Math.round(r * 1.5); for (var i = 0; i < n; i++) { var t = i / n * Math.PI * 2; o.push([Math.cos(t) * r, 0, Math.sin(t) * r]); } });
      return { p: o, ry: 0, rx: -1.05 };
    },
    pursed: function () { /* a stream that narrows as it goes */
      var o = [];
      for (var i = 0; i <= 44; i++) for (var j = 0; j < 6; j++) {
        var t = i / 44, w = 34 * (1 - t) + 3, x = -56 + 112 * t, z = (j / 5 - .5) * w;
        o.push([x, Math.sin(t * Math.PI * 1.5) * 12, z + Math.cos(t * Math.PI * 1.5) * 10]);
      }
      return { p: o, ry: 0, rx: -.9 };
    }
  };
  var cache = {};
  function art(k) {
    if (cache[k]) return cache[k];
    var S = SHAPE[k](), pts = S.p.map(function (p) { return proj(p, S.ry, S.rx); }), zs = pts.map(function (q) { return q[2]; });
    var lo = Math.min.apply(0, zs), hi = Math.max.apply(0, zs), out = [];
    pts.sort(function (a, b) { return b[2] - a[2]; });
    pts.forEach(function (q) {
      var d = hi > lo ? 1 - (q[2] - lo) / (hi - lo) : 1;   /* 1 = nearest */
      out.push('<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="' + (.55 + d * .75).toFixed(2) + '" opacity="' + (.28 + d * .72).toFixed(2) + '"/>');
    });
    (S.stars || []).forEach(function (s) { out.push('<circle cx="' + s[0] + '" cy="' + s[1] + '" r=".8" opacity=".5"/>'); });
    return (cache[k] = '<svg class="blpc-art" viewBox="0 0 ' + AW + " " + AH + '" aria-hidden="true"><g fill="#D3DBFF">' + out.join("") + '</g></svg>');
  }

  var css = document.createElement("style");
  css.textContent = [
    ".blpc-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 4px}.blpc-hd h2{margin:0}",
    ".blpc-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blpc-all::after{content:'';position:absolute;inset:-6px -8px}.blpc-all svg{width:18px;height:18px}",
    ".blpc-intro{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blpc-rail{display:flex;gap:12px;margin:0 calc(var(--gut) * -1);padding:4px var(--gut) 8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--gut);scrollbar-width:none}",
    ".blpc-rail::-webkit-scrollbar{display:none}",
    /* the night card */
    ".blpc-t{position:relative;isolation:isolate;overflow:hidden;flex:0 0 " + AW + "px;height:200px;scroll-snap-align:start;display:flex;flex-direction:column;align-items:center;border-radius:20px;cursor:pointer;color:#fff;text-align:center;" +
      "background:radial-gradient(90% 60% at 50% 34%,#2A3480 0%,rgb(42 52 128 / 0) 70%),linear-gradient(180deg,#1B2259 0%,#121640 100%);" +
      "box-shadow:inset 0 0 0 1px rgb(255 255 255 / .06),0 8px 20px -10px rgb(18 22 64 / .6);transition:transform .2s var(--ease)}",
    ".blpc-t:active{transform:scale(.98)}.blpc-t:focus-visible{outline:2px solid var(--in-600);outline-offset:2px}",
    ".blpc-art{display:block;width:" + AW + "px;height:" + AH + "px;margin-top:12px;flex:none}",
    ".blpc-tx{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;flex:1;padding:0 12px 12px}",
    ".blpc-n{font:600 14px/20px Roboto;min-height:40px;display:flex;align-items:center;justify-content:center;text-wrap:balance}",
    ".blpc-m{font:400 12px/16px Roboto;color:#9AA6DA;font-variant-numeric:tabular-nums}",
    ".blpc-in{display:inline-flex;align-items:center;gap:4px;vertical-align:top;color:#C9F5DC}",
    ".blpc-in::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--ok-300);margin-top:5px;align-self:flex-start}",
    /* See all: a small night square with the same shape */
    ".blpc-ls{display:flex;flex-direction:column}.blpc-r{display:flex;align-items:center;gap:12px;width:100%;min-height:72px;padding:12px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".blpc-r:first-child{border-top:0}.blpc-r .th{flex:none;width:48px;height:48px;border-radius:var(--r-md);display:grid;place-items:center;overflow:hidden;background:radial-gradient(circle at 50% 45%,#2A3480,#141943 75%)}",
    ".blpc-r .th svg{width:56px;height:auto;margin:0}",
    ".blpc-r .t{flex:1;min-width:0}.blpc-r .tt{display:block;font:600 14px/20px Roboto}.blpc-r .td{display:block;margin-top:2px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blpc-r .rt{display:inline-flex;align-items:center;gap:4px;font:400 12px/16px Roboto;color:var(--g-500)}.blpc-r .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".blpc-sl{margin:0 0 8px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  document.head.appendChild(css);

  function tile(b, B) {
    var t = document.createElement("div"), mine = B.state === "plan" && b.inPlan;
    t.className = "blpc-t"; t.setAttribute("role", "button"); t.tabIndex = 0; t.setAttribute("data-blinfo", b.key);
    t.setAttribute("aria-label", nm(b) + ", " + b.min + " minutes" + (mine ? ", in your plan" : "") + ". How it works");
    t.innerHTML = art(b.key) + '<div class="blpc-tx"><span class="blpc-n">' + nm(b) + '</span><span class="blpc-m">' + b.min + ' min' +
      (mine ? ' · <span class="blpc-in">In your plan</span>' : "") + '</span></div>';
    return t;
  }

  function all(B) {
    var html = '<p class="blpc-sl">Tap one to see how it goes, or start it from there.</p><div class="blpc-ls">' + B.list.map(function (b) {
      return '<button class="blpc-r" data-blinfo="' + b.key + '"><span class="th">' + art(b.key) + '</span><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + b.pat +
        (B.state === "plan" && b.inPlan ? ' · <span style="color:var(--ok-600)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    }).join("") + '</div>';
    if (window.GFOpenSheet) window.GFOpenSheet("blpcAll", "Breathing exercises", html);
  }

  BLIB.add("pc", {
    render: function (host, B) {
      host.className = "gut sect";
      var intro = B.state === "noplan" ? "Use any of these while your coach sets up your plan."
        : B.state === "free" ? "Start one whenever you need a pause."
        : "Start one whenever you need a pause, in your plan or not.";
      host.innerHTML = '<div class="blpc-hd"><h2 class="gf-h">Breathing exercises</h2><button class="blpc-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="blpc-intro">' + intro + '</p><div class="blpc-rail"></div>';
      var rail = host.querySelector(".blpc-rail");
      B.list.forEach(function (b) { rail.appendChild(tile(b, B)); });
      host.querySelector(".blpc-all").onclick = function (e) { e.stopPropagation(); all(B); };
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("blpc-t")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
