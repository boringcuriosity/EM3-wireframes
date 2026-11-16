/* "All breathing exercises", variant k: Indigo plan tiles.
   Each tile is the "Your mind plan" card (move/plan.css .mv-card: the indigo top wash, the 1px border with an indigo tip,
   the 2px hard shadow, radius 24) cut down to rail size. The Mind scene sits top right as on the plan cards, picked by
   when the exercise suits the day: morning for Simple and Box, afternoon for Pursed Lip and Belly, evening for Extended
   Exhale and Bhramari, night for 4-7-8. A hairline footer holds "In your plan" and the one Start. The tile opens the sheet. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>';
  var SCENE = { coherent: "morning", box: "morning", pursed: "afternoon", belly: "afternoon", exhale: "evening", hum: "evening", sleep: "night" };
  /* where each scene's figure sits, so it lands top right above the title (image 260 wide) */
  var POS = { morning: [-40, -50], afternoon: [-40, -46], evening: [-44, -50], night: [-24, -44] };
  var TX = { morning: -78, afternoon: -78, evening: -81, night: -50 };   /* See all thumbs: the figure in the middle */
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };
  var url = function (k) { return "url(/v7/icons/mind/bg/" + SCENE[k] + ".webp?v=1)"; };

  var css = document.createElement("style");
  css.textContent = [
    ".blk-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 4px}",
    ".blk-hd h2{margin:0}",
    ".blk-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blk-all::after{content:'';position:absolute;inset:-6px -8px}.blk-all svg{width:18px;height:18px}",
    ".blk-intro{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blk-rail{display:flex;gap:12px;margin:0 calc(var(--gut) * -1);padding:4px var(--gut) 8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--gut);scrollbar-width:none}",
    ".blk-rail::-webkit-scrollbar{display:none}",
    /* the tile: .mv-card.scene, its own copy so the rail does not inherit the card's bottom margin */
    ".blk-t{position:relative;isolation:isolate;flex:0 0 224px;scroll-snap-align:start;display:flex;flex-direction:column;border-radius:var(--r-xl);border:1px solid transparent;cursor:pointer;text-align:left;color:var(--g-900);box-shadow:2px 2px 0 var(--g-200);" +
      "background:linear-gradient(180deg,var(--in-25) 0%,#fff 29%,#fff 100%) padding-box,conic-gradient(from 0deg,var(--in-600) 0deg,var(--g-200) 43deg,var(--g-200) 317deg,var(--in-600) 360deg) border-box;transition:transform .18s var(--ease),box-shadow .18s var(--ease)}",
    ".blk-t:active{transform:translate(1px,1px);box-shadow:1px 1px 0 var(--g-200)}",
    ".blk-t::before{content:'';position:absolute;inset:0 0 auto 0;height:120px;z-index:-1;border-radius:inherit;opacity:.7;background:var(--scene) var(--sx) var(--sy) / 260px auto no-repeat;" +
      "-webkit-mask:linear-gradient(90deg,transparent 22%,#000 70%),linear-gradient(180deg,#000 38%,transparent 84%);-webkit-mask-composite:source-in;mask-composite:intersect}",
    ".blk-h{padding:16px 16px 12px;min-height:120px;display:flex;flex-direction:column;justify-content:flex-end}",
    ".blk-n{font:600 16px/22px Roboto;white-space:nowrap}",
    ".blk-s{margin-top:2px;font:400 12px/18px Roboto;color:var(--g-500)}",
    ".blk-f{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 16px;padding:4px 0;min-height:48px;border-top:1px solid var(--g-100)}",
    ".blk-mn{font:400 12px/16px Roboto;color:var(--g-500);font-variant-numeric:tabular-nums}",
    ".blk-in{display:inline-flex;align-items:center;height:24px;padding:0 8px;border-radius:var(--r-pill);background:var(--in-50);color:var(--in-700);font:500 12px/16px Roboto;white-space:nowrap}",
    ".blk-l{display:flex;align-items:center;gap:8px;min-width:0}",
    ".blk-go{position:relative;display:inline-flex;align-items:center;gap:4px;height:32px;margin-right:-4px;padding:0 4px;border:0;background:none;border-radius:var(--r-sm);font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blk-go::after{content:'';position:absolute;inset:-6px -4px}.blk-go svg{width:16px;height:16px}.blk-go:active{background:var(--g-50)}",
    /* See all: the plan's row, a scene thumb first */
    ".blk-ls{display:flex;flex-direction:column}.blk-r{display:flex;align-items:center;gap:12px;width:100%;min-height:72px;padding:12px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".blk-r:first-child{border-top:0}.blk-r .th{flex:none;width:48px;height:48px;border-radius:var(--r-md);background:var(--scene) var(--tx) -15px / 128px auto no-repeat var(--in-25);box-shadow:inset 0 0 0 1px var(--in-100)}",
    ".blk-r .t{flex:1;min-width:0}.blk-r .tt{display:block;font:600 14px/20px Roboto}.blk-r .td{display:block;margin-top:2px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blk-r .rt{display:inline-flex;align-items:center;gap:4px;font:400 12px/16px Roboto;color:var(--g-500)}.blk-r .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".blk-sl{margin:0 0 8px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  document.head.appendChild(css);

  function tile(b, B) {
    var t = document.createElement("div");
    t.className = "blk-t"; t.setAttribute("role", "button"); t.tabIndex = 0;
    t.setAttribute("data-blinfo", b.key); t.style.setProperty("--scene", url(b.key));
    var ps = POS[SCENE[b.key]]; t.style.setProperty("--sx", ps[0] + "px"); t.style.setProperty("--sy", ps[1] + "px");
    t.setAttribute("aria-label", b.name + ", " + b.pat + ", " + b.min + " minutes. How it works");
    t.innerHTML = '<div class="blk-h"><div class="blk-n">' + nm(b) + '</div><div class="blk-s">' + b.pat + '</div></div>' +
      '<div class="blk-f"><span class="blk-l">' + (B.state === "plan" && b.inPlan ? '<span class="blk-in">In your plan</span>' : "") + '<span class="blk-mn">' + b.min + ' min</span></span>' +
      '<button class="blk-go" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '">' + PLAY + 'Start</button></div>';
    return t;
  }

  function all(B) {
    var html = '<p class="blk-sl">Tap one to see how it goes, or start it from there.</p><div class="blk-ls">' + B.list.map(function (b) {
      return '<button class="blk-r" data-blinfo="' + b.key + '"><span class="th" style="--scene:' + url(b.key) + ';--tx:' + TX[SCENE[b.key]] + 'px"></span><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + b.pat +
        (B.state === "plan" && b.inPlan ? ' · <span style="color:var(--in-700)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    }).join("") + '</div>';
    if (window.GFOpenSheet) window.GFOpenSheet("blkAll", "Breathing exercises", html);
  }

  BLIB.add("k", {
    render: function (host, B) {
      host.className = "gut sect";
      var intro = B.state === "noplan" ? "Use any of these while your coach sets up your plan."
        : B.state === "free" ? "Start one whenever you need a pause."
        : "Start one whenever you need a pause, in your plan or not.";
      host.innerHTML = '<div class="blk-hd"><h2 class="gf-h">Breathing exercises</h2><button class="blk-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="blk-intro">' + intro + '</p><div class="blk-rail"></div>';
      var rail = host.querySelector(".blk-rail");
      B.list.forEach(function (b) { rail.appendChild(tile(b, B)); });
      host.querySelector(".blk-all").onclick = function (e) { e.stopPropagation(); all(B); };
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("blk-t")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
