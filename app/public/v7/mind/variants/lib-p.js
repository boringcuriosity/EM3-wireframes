/* "All breathing exercises", variant p: Night and day.
   The rail is one sky, read left to right from dawn to deep night. Day exercises (Simple, Box, Belly, Pursed Lip) are
   light cards with a sun drawn at its hour; the wind-down ones (Extended Exhale, Humming Bee, 4-7-8) are indigo night
   cards with a crescent moon and a few stars, darker as the rail goes on. Each card's wash starts where the last one
   ended, so the rail reads as one gradient. All art is static SVG drawn here. The card opens the info sheet; the round
   play button starts it; "See all" lists all 7 under Day and Evening. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>';
  var INFO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><path d="M12 7.6v.1" stroke-width="2.4"/></svg>';
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };

  /* the sky, one stop per card edge: dawn peach, gold, pale sky, sky, dusk, night, deep night */
  var STOPS = ["#FFEEE2", "#FFF5DA", "#F6F8FF", "#E8EEFF", "#D4DCFC", "#5A60DC", "#3035B8", "#20238A", "#14165A"];
  /* rail order with each card's moment: sun position (x, y in a 160 x 64 sky) or night with a star count */
  var ORDER = [
    { k: "coherent", t: "Dawn", sun: [36, 58] },
    { k: "box", t: "Morning", sun: [64, 30] },
    { k: "belly", t: "Midday", sun: [92, 22] },
    { k: "pursed", t: "Afternoon", sun: [118, 46] },
    { k: "exhale", t: "Evening", night: 3, from: 5 },
    { k: "hum", t: "Night", night: 6, from: 6 },
    { k: "sleep", t: "Bedtime", night: 9, from: 7 }
  ];
  var STARS = [[22, 18, 1.3], [48, 40, .9], [70, 14, 1.1], [16, 46, .8], [86, 34, .9], [58, 26, .7], [30, 30, .7], [132, 52, .8], [40, 10, .8]];

  function sky(o, i) {
    var s = '<svg class="blp-sky" viewBox="0 0 160 64" preserveAspectRatio="xMidYMid slice" aria-hidden="true">';
    if (o.sun) {
      var x = o.sun[0], y = o.sun[1], id = "blpG" + i;
      s += '<defs><radialGradient id="' + id + '"><stop offset="0" stop-color="#FDE8A4" stop-opacity=".9"/><stop offset="1" stop-color="#FDE8A4" stop-opacity="0"/></radialGradient></defs>' +
        '<circle cx="' + x + '" cy="' + y + '" r="28" fill="url(#' + id + ')"/><circle cx="' + x + '" cy="' + y + '" r="10" fill="#F5CF56"/>' +
        '<path d="M0 63.5H160" stroke="#E7C144" stroke-opacity=".35"/>';
    } else {
      for (var j = 0; j < o.night; j++) { var st = STARS[j]; s += '<circle cx="' + st[0] + '" cy="' + st[1] + '" r="' + st[2] + '" fill="#fff" opacity="' + (.5 + (j % 3) * .2) + '"/>'; }
      /* a soft four point sparkle and the crescent */
      s += '<path d="M78 46l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill="#fff" opacity=".8"/>' +
        '<path d="M112 20a13 13 0 1 0 12 18 11 11 0 0 1-12-18z" fill="#FFF8E0"/>';
    }
    return s + '</svg>';
  }

  var css = document.createElement("style");
  css.textContent = [
    ".blp-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 4px}",
    ".blp-hd h2{margin:0;font:400 14px/16.8px Roboto;letter-spacing:.25px;color:var(--g-900)}",
    ".blp-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blp-all::after{content:'';position:absolute;inset:-6px -8px}.blp-all svg{width:18px;height:18px}",
    ".blp-intro{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blp-rail{display:flex;gap:12px;margin:0 calc(var(--gut) * -1);padding:4px var(--gut) 8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--gut);scrollbar-width:none}",
    ".blp-rail::-webkit-scrollbar{display:none}",
    ".blp-t{position:relative;overflow:hidden;flex:0 0 160px;height:220px;box-sizing:border-box;scroll-snap-align:start;display:flex;flex-direction:column;padding:0 16px 16px;border-radius:16px;border:1px solid rgb(16 24 40 / .06);box-shadow:2px 3px 0 var(--g-200);cursor:pointer;text-align:left;color:#1D2939;transition:transform .18s var(--ease),box-shadow .18s var(--ease)}",
    ".blp-t:active{transform:translate(1px,1px);box-shadow:1px 2px 0 var(--g-200)}",
    ".blp-t.night{color:#fff;border-color:rgb(255 255 255 / .08)}",
    ".blp-sky{display:block;width:160px;height:64px;margin:0 -16px}",
    ".blp-i{position:absolute;top:10px;right:10px;width:20px;height:20px;color:var(--g-500)}.blp-i svg{width:20px;height:20px;display:block}.night .blp-i{color:rgb(255 255 255 / .7)}",
    ".blp-e{margin-top:12px;font:500 11px/16px Roboto;letter-spacing:.6px;text-transform:uppercase;color:#A68A2D}.night .blp-e{color:#FDE8A4}",
    ".blp-n{margin-top:4px;font:600 14px/20px Roboto;text-wrap:balance}",
    ".blp-p{margin-top:2px;font:400 12px/16px Roboto;color:var(--g-600);text-wrap:balance}.night .blp-p{color:#C7D7FE}",
    ".blp-ft{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:8px;height:40px}",
    ".blp-m{position:relative;display:block;font:500 12px/16px Roboto;color:var(--g-600);font-variant-numeric:tabular-nums}.night .blp-m{color:#E0EAFF}",
    ".blp-in{position:absolute;left:0;bottom:100%;margin-bottom:4px;white-space:nowrap;display:inline-flex;align-items:center;gap:4px;font:500 11px/16px Roboto;color:var(--ok-600)}.blp-in::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--ok-500)}.night .blp-in{color:#A6F4C5}",
    ".blp-pl{position:relative;flex:none;width:40px;height:40px;border:0;padding:0;border-radius:50%;background:#2D31A6;color:#fff;display:grid;place-items:center;cursor:pointer}",
    ".night .blp-pl{background:#fff;color:#2D31A6}",
    ".blp-pl::after{content:'';position:absolute;inset:-4px}.blp-pl svg{width:18px;height:18px;margin-left:2px}",
    /* See all */
    ".blp-gh{display:flex;align-items:center;gap:8px;margin:16px 0 4px;font:600 12px/16px Roboto;letter-spacing:.3px;color:var(--g-600)}.blp-gh:first-of-type{margin-top:0}",
    ".blp-r{display:flex;align-items:center;gap:12px;width:100%;min-height:56px;padding:8px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".blp-gh+.blp-r{border-top:0}",
    ".blp-r .dot{flex:none;width:32px;height:32px;border-radius:50%;display:grid;place-items:center}.blp-r .dot svg{width:16px;height:16px}",
    ".blp-r .t{flex:1;min-width:0}.blp-r .tt{display:block;font:600 14px/20px Roboto}.blp-r .td{display:block;margin-top:2px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blp-r .rt{display:inline-flex;align-items:center;gap:4px;font:500 12px/20px Roboto;color:var(--g-500)}.blp-r .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".blp-sl{margin:0 0 16px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  document.head.appendChild(css);

  function card(o, i, B) {
    var b = B.get(o.k), t = document.createElement("div"), night = !!o.night, a = night ? o.from : i;
    t.className = "blp-t" + (night ? " night" : ""); t.setAttribute("role", "button"); t.tabIndex = 0; t.setAttribute("data-blinfo", b.key);
    t.setAttribute("aria-label", b.name + ", " + b.pat + ", " + b.min + " minutes. How it works");
    /* the wash: across, this card's slice of the sky; down, a little lighter on day cards so type stays crisp */
    t.style.background = (night ? "" : "linear-gradient(180deg,rgb(255 255 255 / 0) 30%,rgb(255 255 255 / .55)),") + "linear-gradient(90deg," + STOPS[a] + "," + STOPS[a + 1] + ")";
    t.innerHTML = sky(o, i) + '<span class="blp-i" aria-hidden="true">' + INFO + '</span>' +
      '<div class="blp-e">' + o.t + '</div><div class="blp-n">' + nm(b) + '</div><div class="blp-p">' + b.pat + '</div>' +
      '<div class="blp-ft"><span class="blp-m"><span>' + b.min + ' min</span>' + (B.state === "plan" && b.inPlan ? '<span class="blp-in">In your plan</span>' : "") + '</span>' +
      '<button class="blp-pl" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '">' + PLAY + '</button></div>';
    return t;
  }

  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z"/></svg>';
  function all(B) {
    var row = function (o) {
      var b = B.get(o.k);
      return '<button class="blp-r" data-blinfo="' + b.key + '"><span class="dot" style="' + (o.night ? "background:#2D31A6;color:#FFF8E0" : "background:#FFF5DA;color:#A68A2D") + '">' + (o.night ? MOON : SUN) + '</span>' +
        '<span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + b.pat + (B.state === "plan" && b.inPlan ? ' · <span style="color:var(--ok-600)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    };
    var html = '<p class="blp-sl">Day ones steady you, evening ones wind you down.</p>' +
      '<div class="blp-gh">By day</div>' + ORDER.filter(function (o) { return !o.night; }).map(row).join("") +
      '<div class="blp-gh">In the evening</div>' + ORDER.filter(function (o) { return o.night; }).map(row).join("");
    if (window.GFOpenSheet) window.GFOpenSheet("blpAll", "Breathing exercises", html);
  }

  BLIB.add("p", {
    render: function (host, B) {
      host.className = "gut sect";
      var intro = B.state === "noplan" ? "Morning to bedtime, while your coach sets up your plan."
        : B.state === "free" ? "From morning to bedtime, start one whenever you need it."
        : "From morning to bedtime, in your plan or not.";
      host.innerHTML = '<div class="blp-hd"><h2>Breathing exercises</h2><button class="blp-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="blp-intro">' + intro + '</p><div class="blp-rail"></div>';
      var rail = host.querySelector(".blp-rail");
      ORDER.forEach(function (o, i) { rail.appendChild(card(o, i, B)); });
      host.querySelector(".blp-all").onclick = function (e) { e.stopPropagation(); all(B); };
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("blp-t")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
