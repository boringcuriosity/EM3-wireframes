/* "All breathing exercises", variant pa: Painterly skies (from "Resonance by Lavendaire").
   A rail of tall tiles, radius 24, each one a soft painted sky: a dawn to night family in indigo, lavender and peach,
   clouds brushed in with an SVG turbulence filter and a fine grain over the top. White type sits bottom left on a soft
   scrim: a small "For sleep" label and the name on two lines. Minutes sit top right in a frosted pill, "In your plan"
   top left. No breathing in the tile; the tile opens the info sheet, where Start lives. See all opens the list. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };
  var FOR = { coherent: "For calm", sleep: "For sleep", box: "For focus", exhale: "For stress", belly: "For digestion", hum: "For a busy mind", pursed: "For breathlessness" };
  /* one family: top, middle, bottom of the sky; glow colour and place; cloud colour and band; scrim tone; stars */
  var SKY = {
    coherent: { c: ["#AEB9EE", "#D7C9EC", "#F8D5C3"], glow: ["#FFE6D2", 120, 168, 70], cl: "#FFF4EE", band: [70, 150], scrim: "43,40,96", seed: 3 },
    sleep:    { c: ["#151A4A", "#2F357F", "#7466B4"], glow: ["#D9CCFF", 106, 78, 30], cl: "#8F86CC", band: [118, 196], scrim: "13,16,48", seed: 7, moon: [108, 76], stars: 1 },
    box:      { c: ["#8B9FEE", "#B9C6F6", "#ECE7FA"], glow: ["#FFFFFF", 40, 150, 60], cl: "#FFFFFF", band: [60, 140], scrim: "36,44,110", seed: 11 },
    exhale:   { c: ["#4D529F", "#A487C6", "#F4B6A1"], glow: ["#FFD1B0", 80, 190, 80], cl: "#F7C9C4", band: [96, 170], scrim: "38,30,84", seed: 5 },
    belly:    { c: ["#C3B3EA", "#EEC6D6", "#FCE3CE"], glow: ["#FFF1E2", 36, 70, 60], cl: "#FFF6F0", band: [50, 130], scrim: "70,44,96", seed: 9 },
    hum:      { c: ["#262B6C", "#6553A8", "#D597B4"], glow: ["#FFC8D8", 60, 200, 70], cl: "#B38BC7", band: [100, 180], scrim: "26,22,70", seed: 13, stars: 1 },
    pursed:   { c: ["#A3BEF4", "#CCD9F8", "#F4E5F0"], glow: ["#FFFFFF", 130, 60, 50], cl: "#FFFFFF", band: [40, 120], scrim: "40,50,110", seed: 2 }
  };
  var W = 160, H = 216;

  /* a tiny seeded random so each sky paints the same every time */
  function rnd(s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function sky(k) {
    var S = SKY[k], r = rnd(S.seed * 7919), id = "blpa-" + k, g = S.glow, out = [];
    out.push('<svg class="blpa-art" viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>' +
      '<linearGradient id="' + id + 'g" x1="0" y1="0" x2=".25" y2="1"><stop offset="0" stop-color="' + S.c[0] + '"/><stop offset=".55" stop-color="' + S.c[1] + '"/><stop offset="1" stop-color="' + S.c[2] + '"/></linearGradient>' +
      '<radialGradient id="' + id + 'r"><stop offset="0" stop-color="' + g[0] + '" stop-opacity=".95"/><stop offset=".45" stop-color="' + g[0] + '" stop-opacity=".4"/><stop offset="1" stop-color="' + g[0] + '" stop-opacity="0"/></radialGradient>' +
      '<filter id="' + id + 'p" x="-40%" y="-40%" width="180%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".014 .034" numOctaves="3" seed="' + S.seed + '"/>' +
      '<feDisplacementMap in="SourceGraphic" scale="42" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="2.6"/></filter>' +
      '<filter id="' + id + 'n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>' +
      '</defs><rect width="' + W + '" height="' + H + '" fill="url(#' + id + 'g)"/>' +
      '<circle cx="' + g[1] + '" cy="' + g[2] + '" r="' + g[3] + '" fill="url(#' + id + 'r)"/>');
    if (S.stars) for (var i = 0; i < 16; i++) out.push('<circle cx="' + (r() * W).toFixed(1) + '" cy="' + (r() * 100).toFixed(1) + '" r="' + (.4 + r() * .7).toFixed(2) + '" fill="#fff" opacity="' + (.35 + r() * .5).toFixed(2) + '"/>');
    if (S.moon) out.push('<mask id="' + id + 'm"><circle cx="' + S.moon[0] + '" cy="' + S.moon[1] + '" r="9" fill="#fff"/><circle cx="' + (S.moon[0] + 4.5) + '" cy="' + (S.moon[1] - 3) + '" r="8" fill="#000"/></mask>' +
      '<circle cx="' + S.moon[0] + '" cy="' + S.moon[1] + '" r="9" fill="#FBF6FF" mask="url(#' + id + 'm)"/>');
    /* clouds: soft ellipses in a band, painted through the turbulence */
    out.push('<g filter="url(#' + id + 'p)">');
    for (var j = 0; j < 6; j++) {
      var cy = S.band[0] + r() * (S.band[1] - S.band[0]);
      out.push('<ellipse cx="' + (r() * W).toFixed(1) + '" cy="' + cy.toFixed(1) + '" rx="' + (34 + r() * 46).toFixed(1) + '" ry="' + (7 + r() * 13).toFixed(1) + '" fill="' + S.cl + '" opacity="' + (.45 + r() * .4).toFixed(2) + '"/>');
    }
    out.push('</g><rect width="' + W + '" height="' + H + '" filter="url(#' + id + 'n)" opacity=".16" style="mix-blend-mode:soft-light"/></svg>');
    return out.join("");
  }

  var css = document.createElement("style");
  css.textContent = [
    ".blpa-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 4px}.blpa-hd h2{margin:0}",
    ".blpa-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blpa-all::after{content:'';position:absolute;inset:-6px -8px}.blpa-all svg{width:18px;height:18px}",
    ".blpa-intro{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blpa-rail{display:flex;gap:12px;margin:0 calc(var(--gut) * -1);padding:4px var(--gut) 8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--gut);scrollbar-width:none}",
    ".blpa-rail::-webkit-scrollbar{display:none}",
    /* the sky tile */
    ".blpa-t{position:relative;isolation:isolate;overflow:hidden;flex:0 0 " + W + "px;height:" + H + "px;scroll-snap-align:start;border-radius:var(--r-xl);cursor:pointer;color:#fff;text-align:left;" +
      "box-shadow:0 1px 2px rgb(16 24 40 / .06),0 8px 20px -8px rgb(var(--sc) / .35);transition:transform .2s var(--ease)}",
    ".blpa-t:active{transform:scale(.98)}.blpa-t:focus-visible{outline:2px solid var(--in-600);outline-offset:2px}",
    ".blpa-art{position:absolute;inset:0;width:100%;height:100%;z-index:-2}",
    ".blpa-t::after{content:'';position:absolute;inset:0;z-index:-1;border-radius:inherit;background:linear-gradient(180deg,rgb(var(--sc) / 0) 36%,rgb(var(--sc) / .62) 100%);box-shadow:inset 0 0 0 1px rgb(255 255 255 / .18)}",
    ".blpa-top{position:absolute;left:12px;right:12px;top:12px;display:flex;align-items:center;justify-content:space-between;gap:8px}",
    ".blpa-pill{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 8px;border-radius:var(--r-pill);background:rgb(255 255 255 / .22);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);" +
      "box-shadow:inset 0 0 0 1px rgb(255 255 255 / .3);font:500 12px/16px Roboto;color:#fff;white-space:nowrap;font-variant-numeric:tabular-nums}",
    ".blpa-pill.in::before{content:'';width:6px;height:6px;border-radius:50%;background:#fff}.blpa-top .blpa-pill:only-child{margin-left:auto}",
    ".blpa-b{position:absolute;left:16px;right:16px;bottom:16px;display:flex;flex-direction:column;gap:4px;text-shadow:0 1px 8px rgb(var(--sc) / .35)}",
    ".blpa-l{font:500 12px/16px Roboto;letter-spacing:.2px;color:rgb(255 255 255 / .86)}",
    ".blpa-n{font:600 16px/22px Roboto;text-wrap:balance}",
    /* See all: a small sky swatch per row */
    ".blpa-ls{display:flex;flex-direction:column}.blpa-r{display:flex;align-items:center;gap:12px;width:100%;min-height:72px;padding:12px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".blpa-r:first-child{border-top:0}.blpa-r .th{position:relative;flex:none;width:48px;height:48px;border-radius:var(--r-md);overflow:hidden}.blpa-r .th svg{position:absolute;inset:0;width:100%;height:100%}",
    ".blpa-r .t{flex:1;min-width:0}.blpa-r .tt{display:block;font:600 14px/20px Roboto}.blpa-r .td{display:block;margin-top:2px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blpa-r .rt{display:inline-flex;align-items:center;gap:4px;font:400 12px/16px Roboto;color:var(--g-500)}.blpa-r .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".blpa-sl{margin:0 0 8px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  document.head.appendChild(css);

  function tile(b, B) {
    var t = document.createElement("div"), mine = B.state === "plan" && b.inPlan;
    t.className = "blpa-t"; t.setAttribute("role", "button"); t.tabIndex = 0;
    t.setAttribute("data-blinfo", b.key); t.style.setProperty("--sc", SKY[b.key].scrim.replace(/,/g, " "));
    t.setAttribute("aria-label", nm(b) + ", " + FOR[b.key].toLowerCase() + ", " + b.min + " minutes" + (mine ? ", in your plan" : "") + ". How it works");
    t.innerHTML = sky(b.key) + '<div class="blpa-top">' + (mine ? '<span class="blpa-pill in">In your plan</span>' : "") + '<span class="blpa-pill">' + b.min + ' min</span></div>' +
      '<div class="blpa-b"><span class="blpa-l">' + FOR[b.key] + '</span><span class="blpa-n">' + nm(b) + '</span></div>';
    return t;
  }

  function all(B) {
    var html = '<p class="blpa-sl">Tap one to see how it goes, or start it from there.</p><div class="blpa-ls">' + B.list.map(function (b) {
      return '<button class="blpa-r" data-blinfo="' + b.key + '"><span class="th">' + sky(b.key).replace(/blpa-/g, "blpas-") + '</span><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + FOR[b.key] +
        (B.state === "plan" && b.inPlan ? ' · <span style="color:var(--ok-600)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    }).join("") + '</div>';
    if (window.GFOpenSheet) window.GFOpenSheet("blpaAll", "Breathing exercises", html);
  }

  BLIB.add("pa", {
    render: function (host, B) {
      host.className = "gut sect";
      var intro = B.state === "noplan" ? "Use any of these while your coach sets up your plan."
        : B.state === "free" ? "Start one whenever you need a pause."
        : "Start one whenever you need a pause, in your plan or not.";
      host.innerHTML = '<div class="blpa-hd"><h2 class="gf-h">Breathing exercises</h2><button class="blpa-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="blpa-intro">' + intro + '</p><div class="blpa-rail"></div>';
      var rail = host.querySelector(".blpa-rail");
      B.list.forEach(function (b) { rail.appendChild(tile(b, B)); });
      host.querySelector(".blpa-all").onclick = function (e) { e.stopPropagation(); all(B); };
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("blpa-t")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
