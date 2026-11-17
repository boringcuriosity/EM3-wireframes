/* "All breathing exercises", variant k3: K2's plan tiles stacked vertically, full width.
   Each card: its own scene top right, name, pattern and minutes; a footer with Start on the left and Know more on the right
   (opens the info sheet). The whole card also opens the sheet. All seven are listed, so there is no See all. */
(function () {
  var INFO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>';
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>';
  var SY = { sleep: -44, belly: -58, exhale: -44, hum: -44, box: -46, pursed: -14 };   /* lift so the person clears the title */
  var SZ = { pursed: 196 };   /* the standing figure is tall, so its scene is drawn smaller */
  var FX = { coherent: .76, sleep: .72, box: .68, exhale: .85, belly: .55, hum: .68, pursed: .64 };   /* where the figure sits across each scene */
  /* where each scene's figure sits, so it lands top right above the title (image 260 wide) */
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };
  var url = function (k) { return "url(/v7/icons/mind/breath/" + k + ".webp?v=1)"; };

  var css = document.createElement("style");
  css.textContent = [
    ".blk3-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 4px}",
    ".blk3-hd h2{margin:0}",
    ".blk3-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blk3-all::after{content:'';position:absolute;inset:-6px -8px}.blk3-all svg{width:18px;height:18px}",
    ".blk3-intro{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blk3-rail{display:flex;flex-direction:column;gap:16px;padding:4px 0 8px}",
    /* the tile: .mv-card.scene, its own copy so the rail does not inherit the card's bottom margin */
    ".blk3-t{position:relative;isolation:isolate;width:100%;display:flex;flex-direction:column;border-radius:var(--r-xl);border:1px solid transparent;cursor:pointer;text-align:left;color:var(--g-900);box-shadow:2px 2px 0 var(--g-200);" +
      "background:linear-gradient(180deg,var(--in-25) 0%,#fff 29%,#fff 100%) padding-box,conic-gradient(from 0deg,var(--in-600) 0deg,var(--g-200) 43deg,var(--g-200) 317deg,var(--in-600) 360deg) border-box;transition:transform .18s var(--ease),box-shadow .18s var(--ease)}",
    ".blk3-t:active{transform:translate(1px,1px);box-shadow:1px 1px 0 var(--g-200)}",
    ".blk3-t::before{content:'';position:absolute;inset:0 0 auto 0;height:128px;z-index:-1;border-radius:inherit;opacity:.9;background:var(--scene) right 0 top var(--sy) / var(--sz) auto no-repeat;" +
      "-webkit-mask:linear-gradient(90deg,transparent 22%,#000 70%),linear-gradient(180deg,#000 30%,transparent 74%);-webkit-mask-composite:source-in;mask-composite:intersect}",
    ".blk3-h{padding:16px 16px 12px;min-height:128px;display:flex;flex-direction:column;justify-content:flex-end}",
    ".blk3-n{display:flex;align-items:center;font:600 16px/22px Roboto;white-space:nowrap}",
    ".blk3-s{margin-top:2px;font:400 12px/18px Roboto;color:var(--g-500)}",
    ".blk3-f{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 16px;padding:4px 0;min-height:48px;border-top:1px solid var(--g-100)}",
    ".blk3-mn{font:400 12px/16px Roboto;color:var(--g-500);font-variant-numeric:tabular-nums}",
    ".blk3-in{display:inline-flex;align-items:center;height:24px;padding:0 8px;border-radius:var(--r-pill);background:var(--in-50);color:var(--in-700);font:500 12px/16px Roboto;white-space:nowrap}",
    ".blk3-l{display:flex;align-items:center;gap:8px;min-width:0}",
    ".blk3-km{position:relative;display:inline-flex;align-items:center;gap:4px;height:32px;margin-right:-4px;padding:0 4px;border:0;background:none;border-radius:var(--r-sm);font:400 13px/18px Roboto;color:var(--g-500);cursor:pointer}.blk3-km svg{width:14px;height:14px}.blk3-km::after{content:'';position:absolute;inset:-6px -4px}.blk3-ip{margin-left:8px;display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 8px;border-radius:6px;border:1px solid transparent;font:400 12px/14px Roboto,sans-serif;letter-spacing:.25px;white-space:nowrap;vertical-align:middle;color:#826E2D;background:linear-gradient(90deg,#FEF1C7,#FFFBEE 30%,#FFFBEE 70%,#FEF1C7) padding-box,conic-gradient(from 180deg,#826E2D,#E7C144 25%,#E7C144 50%,#826E2D 75%,#E7C144) border-box}",
    ".blk3-go{position:relative;display:inline-flex;align-items:center;gap:4px;height:32px;margin-left:-4px;padding:0 4px;border:0;background:none;border-radius:var(--r-sm);font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blk3-go::after{content:'';position:absolute;inset:-6px -4px}.blk3-go svg{width:16px;height:16px}.blk3-go:active{background:var(--g-50)}",
    /* See all: the plan's row, a scene thumb first */
    ".blk3-ls{display:flex;flex-direction:column}.blk3-r{display:flex;align-items:center;gap:12px;width:100%;min-height:72px;padding:12px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".blk3-r:first-child{border-top:0}.blk3-r .th{flex:none;width:48px;height:48px;border-radius:var(--r-md);background:var(--scene) var(--tx) -19px / 128px auto no-repeat var(--in-25);box-shadow:inset 0 0 0 1px var(--in-100)}",
    ".blk3-r .t{flex:1;min-width:0}.blk3-r .tt{display:block;font:600 14px/20px Roboto}.blk3-r .td{display:block;margin-top:2px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blk3-r .rt{display:inline-flex;align-items:center;gap:4px;font:400 12px/16px Roboto;color:var(--g-500)}.blk3-r .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".blk3-sl{margin:0 0 8px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  document.head.appendChild(css);

  function tile(b, B) {
    var t = document.createElement("div");
    t.className = "blk3-t"; t.setAttribute("role", "button"); t.tabIndex = 0;
    t.setAttribute("data-blinfo", b.key); t.style.setProperty("--scene", url(b.key));
    var sz = (SZ[b.key] || 250) + 30; t.style.setProperty("--sz", sz + "px"); t.style.setProperty("--sx", Math.round(286 - FX[b.key] * sz) + "px"); t.style.setProperty("--sy", (SY[b.key] || -54) + "px");
    t.setAttribute("aria-label", b.name + ", " + b.pat + ", " + b.min + " minutes. How it works");
    t.innerHTML = '<div class="blk3-h"><div class="blk3-n">' + nm(b) + (B.state === "plan" && b.inPlan ? '<span class="blk3-ip">In your plan</span>' : "") + '</div><div class="blk3-s">' + b.pat + ' · ' + b.min + ' min</div></div>' +
      '<div class="blk3-f"><button class="blk3-go" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '">' + PLAY + 'Start</button>' +
      '<button class="blk3-km" data-blinfo="' + b.key + '" aria-label="Know more about ' + b.name + '">' + INFO + 'Know more</button></div>';
    return t;
  }

  function all(B) {
    var html = '<p class="blk3-sl">Tap one to see how it goes, or start it from there.</p><div class="blk3-ls">' + B.list.map(function (b) {
      return '<button class="blk3-r" data-blinfo="' + b.key + '"><span class="th" style="--scene:' + url(b.key) + ';--tx:' + Math.round(24 - FX[b.key] * 128) + 'px"></span><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + b.pat +
        (B.state === "plan" && b.inPlan ? ' · <span style="color:var(--in-700)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    }).join("") + '</div>';
    if (window.GFOpenSheet) window.GFOpenSheet("blkAll", "Breathing exercises", html);
  }

  BLIB.add("k3", {
    render: function (host, B) {
      host.className = "gut sect";
      var intro = B.sub;
      host.innerHTML = '<div class="blk3-hd"><h2 class="gf-h">Breathing exercises</h2></div>' +
        '<p class="blk3-intro">' + intro + '</p><div class="blk3-rail"></div>';
      var rail = host.querySelector(".blk3-rail");
      B.list.forEach(function (b) { rail.appendChild(tile(b, B)); });
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("blk3-t")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
