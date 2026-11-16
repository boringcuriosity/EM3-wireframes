/* d. Grouped by need: Learn-style list rows under three small group headers, each group one card (common region).
   A row opens its player (as a Learn row opens its article); the (i) beside it opens the info sheet. */
BLIB.add("d", { render: function (host, B) {
  var css = document.createElement("style");
  css.textContent =
    ".bld-w{display:flex;flex-direction:column;gap:16px;text-align:left}" +
    ".bld-hd{display:flex;flex-direction:column;gap:4px}.bld-hd h2{margin:0;font:400 14px/16.8px Roboto,sans-serif;letter-spacing:.25px;color:#101828}" +
    ".bld-hd p{margin:0;font:400 12px/16px Roboto,sans-serif;color:#667085}" +
    ".bld-gs{display:flex;flex-direction:column;gap:16px}" +
    ".bld-g{background:#fff;border:1px solid #E4E7EC;border-radius:16px;box-shadow:2px 2px 0 #E4E7EC;overflow:hidden}" +
    ".bld-gh{display:flex;align-items:center;gap:8px;padding:12px 16px;background:linear-gradient(180deg,#FFFBEE 0%,#fff 100%);border-bottom:1px solid #F2F4F7}" +
    ".bld-gh .bld-gi{width:28px;height:28px;border-radius:8px;display:grid;place-items:center;background:#FFF8E0;color:#A68A2D;flex:none}.bld-gh .bld-gi svg{width:16px;height:16px}" +
    ".bld-gh b{font:600 14px/20px Roboto,sans-serif;color:#101828}.bld-gh span{font:400 12px/16px Roboto,sans-serif;color:#667085;margin-left:auto}" +
    ".bld-rs{display:flex;flex-direction:column;padding:0 16px}" +
    ".bld-r{display:flex;align-items:center;gap:12px;padding:12px 0;cursor:pointer}.bld-r+.bld-r{border-top:1px solid #F2F4F7}" +
        ".bld-th{position:relative;flex:none;width:64px;height:64px;border-radius:8px;border:1px solid #E4E7EC;box-shadow:2px 3px 0 #E4E7EC;overflow:hidden;background:#FFFBEE}" +
    ".bld-th .bl-mini{position:absolute;left:-5px;top:-5px;border-radius:0;background:transparent}" +
    ".bld-tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}" +
    ".bld-tx b{font:600 16px/22px Roboto,sans-serif;letter-spacing:.25px;color:#101828}" +
    ".bld-tx .bld-m{font:400 12px/16px Roboto,sans-serif;color:#667085;display:flex;align-items:center;gap:8px;flex-wrap:wrap}" +
    ".bld-tag{display:inline-flex;align-items:center;height:20px;padding:0 6px;border-radius:6px;font:500 11px/1 Roboto,sans-serif;color:#039855;" +
      "background:linear-gradient(90deg,#D1FADF 0%,#ECFDF3 19%,#ECFDF3 84%,#D1FADF 100%);box-shadow:inset 0 0 0 1px #A6F4C5}" +
    ".bld-i{flex:none;width:44px;height:44px;margin:0 -12px;border:0;background:none;display:grid;place-items:center;cursor:pointer;color:#667085}" +
    ".bld-i span{width:28px;height:28px;border-radius:50%;background:rgba(0,0,0,.04);display:grid;place-items:center}.bld-i svg{width:16px;height:16px}" +
    ".bld-ch{flex:none;width:20px;height:20px;color:#98A2B3}" +
    ".bld-go:focus-visible,.bld-i:focus-visible{outline:2px solid #299D6B;outline-offset:2px;border-radius:8px}";
  document.head.appendChild(css);

  var I = {
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    focus: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
    leaf: '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19l7-7"/>'
  };
  function ic(p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; }
  var INFO = ic('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>');
  var CHEV = '<svg class="bld-ch" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
  var G = [
    ["Wind down", "Evening and bedtime", I.moon, ["sleep", "hum", "exhale"]],
    ["Steady and focus", "Any time of day", I.focus, ["coherent", "box"]],
    ["Breathe easier", "When your breath feels short", I.leaf, ["belly", "pursed"]]
  ];
  var intro = B.state === "plan" ? "Do any of these, any time. The ones in your plan count towards Rhythm."
    : B.state === "noplan" ? "Do any of these, any time, while your coach sets up your plan."
    : "Free to use, any time. Pick one and breathe along.";

  host.className = "gut sect";
  host.innerHTML = '<div class="bld-w"><div class="bld-hd"><h2>All breathing exercises</h2><p>' + intro + '</p></div><div class="bld-gs">' +
    G.map(function (g) {
      return '<section class="bld-g" aria-label="' + g[0] + '"><div class="bld-gh"><span class="bld-gi">' + ic(g[2]) + '</span><b>' + g[0] + '</b><span>' + g[1] + '</span></div><div class="bld-rs">' +
        g[3].map(function (k) {
          var b = B.get(k);
          return '<div class="bld-r bld-go" role="button" tabindex="0" data-blplay="' + k + '" aria-label="Start ' + b.name + '"><span class="bld-th" data-k="' + k + '"></span>' +
            '<span class="bld-tx"><b>' + b.name + '</b><span class="bld-m"><span>' + b.pat + ' · ' + b.min + ' min</span>' +
            (B.state === "plan" && b.inPlan ? '<span class="bld-tag">In your plan</span>' : '') + '</span></span>' +
            '<button class="bld-i" data-blinfo="' + k + '" aria-label="About ' + b.name + '"><span>' + INFO + '</span></button>' + CHEV + '</div>';
        }).join("") + '</div></section>';
    }).join("") + '</div></div>';
  host.querySelectorAll(".bld-th").forEach(function (t) { t.appendChild(B.mini(t.dataset.k, 72)); });
  host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.matches(".bld-r")) { e.preventDefault(); e.target.click(); } });
} });
