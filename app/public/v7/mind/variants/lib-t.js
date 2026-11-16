/* "All breathing exercises", variant t: Aurora mesh.
   Cards of soft mesh colour in a sideways rail: indigo, violet, teal and a hint of gold, each exercise mixed its own way
   (4-7-8 and Bhramari darker, like a night sky; Pursed Lip and Extended Exhale cooler and clearer). A frosted panel at
   the bottom carries the name and pattern. The colour drifts very slowly, like light moving across a sky; it never
   breathes, and it holds still under reduced motion (?rm=1). The card opens the info sheet, the play button starts it. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>';
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };
  var RM = /[?&]rm=1/.test(location.search) || matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* each mesh: a base, then blobs [colour, x, y, size] layered as radial gradients */
  var IN = "#6172F3", IN7 = "#3538CD", VI = "#9E77ED", LV = "#C3B5FD", TE = "#5EE0D6", SK = "#A4CAFE", GO = "#FDE3A0", NI = "#23286E";
  var MESH = {
    coherent: ["#E9ECFF", [IN, 18, 22, 62], [TE, 88, 30, 52], [LV, 70, 90, 60], [GO, 12, 92, 34]],
    sleep: [NI, [IN7, 80, 12, 64], [VI, 12, 70, 56], [IN, 70, 82, 46], [GO, 22, 16, 22]],
    box: ["#F1EDFF", [VI, 80, 18, 60], [IN, 14, 50, 56], [TE, 78, 92, 42], [LV, 30, 6, 40]],
    exhale: ["#E8F4FF", [TE, 16, 18, 56], [IN, 86, 46, 58], [SK, 30, 92, 60], [LV, 92, 4, 30]],
    belly: ["#F6F0FF", [LV, 20, 20, 62], [VI, 86, 70, 54], [GO, 84, 10, 40], [IN, 10, 96, 44]],
    hum: ["#2B2F86", [VI, 18, 18, 60], [IN, 86, 60, 58], [GO, 90, 6, 30], [TE, 10, 96, 34]],
    pursed: ["#E9F6FF", [SK, 82, 18, 60], [TE, 16, 44, 52], [IN, 70, 94, 54], [GO, 4, 4, 28]]
  };
  var mesh = function (k) {
    var m = MESH[k];
    return m.slice(1).map(function (p) { return "radial-gradient(circle at " + p[1] + "% " + p[2] + "%," + p[0] + " 0," + p[0] + "00 " + p[3] + "%)"; }).join(",") + "," + m[0];
  };
  var DARK = { sleep: 1, hum: 1 };

  var css = document.createElement("style");
  css.textContent = [
    ".blt-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 4px}",
    ".blt-hd h2{margin:0;font:400 14px/16.8px Roboto;letter-spacing:.25px;color:var(--g-900)}",
    ".blt-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blt-all::after{content:'';position:absolute;inset:-6px -8px}.blt-all svg{width:18px;height:18px}",
    ".blt-intro{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blt-rail{display:flex;gap:12px;margin:0 calc(var(--gut) * -1);padding:4px var(--gut) 8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--gut);scrollbar-width:none}",
    ".blt-rail::-webkit-scrollbar{display:none}",
    /* the card and its mesh; the mesh layer is larger than the card and drifts inside it */
    ".blt-c{position:relative;isolation:isolate;overflow:hidden;flex:0 0 calc((100% - 12px) / 2.15);min-width:0;aspect-ratio:4/5;scroll-snap-align:start;border-radius:20px;cursor:pointer;text-align:left;" +
      "box-shadow:0 0 0 1px rgb(16 24 40 / .04),0 10px 24px -14px rgb(53 56 205 / .45);transition:transform .2s var(--ease)}",
    ".blt-c:active{transform:scale(.98)}",
    ".blt-m{position:absolute;z-index:-1;inset:-30%;background:var(--mesh);filter:blur(10px) saturate(1.05);animation:blt-drift 48s ease-in-out infinite alternate}",
    "@keyframes blt-drift{0%{transform:translate(-6%,4%) rotate(-8deg) scale(1)}50%{transform:translate(5%,-3%) rotate(6deg) scale(1.08)}100%{transform:translate(-2%,-6%) rotate(14deg) scale(1.02)}}",
    ".blt-rm .blt-m{animation:none}@media (prefers-reduced-motion:reduce){.blt-m{animation:none}}",
    /* a fine grain so the colour reads as light, not a flat gradient */
    ".blt-c::after{content:'';position:absolute;inset:0;z-index:-1;opacity:.22;mix-blend-mode:soft-light;" +
      "background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")}",
    /* top: minutes, plan, play */
    ".blt-top{position:absolute;left:12px;right:8px;top:12px;display:flex;align-items:flex-start;justify-content:space-between}",
    ".blt-chips{display:flex;flex-direction:column;align-items:flex-start;gap:4px}",
    ".blt-mn,.blt-in{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 8px;border-radius:999px;font:500 12px/16px Roboto;font-variant-numeric:tabular-nums;white-space:nowrap;" +
      "background:rgb(255 255 255 / .62);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:var(--g-800)}",
    ".blt-in::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--ok-500)}",
    ".blt-pl{position:relative;flex:none;width:32px;height:32px;margin-top:-4px;border:0;padding:0;border-radius:50%;background:#fff;color:var(--in-600);display:grid;place-items:center;cursor:pointer;box-shadow:0 2px 8px rgb(30 27 75 / .18)}",
    ".blt-pl::after{content:'';position:absolute;inset:-6px}.blt-pl svg{width:14px;height:14px;margin-left:2px}",
    /* the frosted panel */
    ".blt-p{position:absolute;left:8px;right:8px;bottom:8px;height:84px;display:flex;flex-direction:column;justify-content:flex-start;gap:2px;padding:12px;border-radius:14px;" +
      "background:rgb(255 255 255 / .58);-webkit-backdrop-filter:blur(14px) saturate(1.4);backdrop-filter:blur(14px) saturate(1.4);box-shadow:inset 0 0 0 1px rgb(255 255 255 / .55)}",
    ".blt-dk .blt-p{background:rgb(255 255 255 / .16);box-shadow:inset 0 0 0 1px rgb(255 255 255 / .22)}",
    ".blt-n{font:600 15px/20px Roboto;color:var(--g-900);text-wrap:balance}.blt-s{font:400 12px/16px Roboto;color:var(--g-600);text-wrap:balance}",
    ".blt-dk .blt-n{color:#fff}.blt-dk .blt-s{color:rgb(255 255 255 / .8)}",
    /* the See all sheet */
    ".blt-ls{display:flex;flex-direction:column}.blt-r{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;padding:8px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".blt-r:first-child{border-top:0}.blt-r .sw{flex:none;width:40px;height:40px;border-radius:12px;background:var(--mesh);box-shadow:inset 0 0 0 1px rgb(16 24 40 / .05)}",
    ".blt-r .t{flex:1;min-width:0}.blt-r .tt{display:block;font:600 14px/20px Roboto}.blt-r .td{display:block;margin-top:2px;font:400 12px/18px Roboto;color:var(--g-500)}",
    ".blt-r .rt{display:inline-flex;align-items:center;gap:4px;font:500 12px/20px Roboto;color:var(--g-500)}.blt-r .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".blt-sl{margin:0 0 8px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  document.head.appendChild(css);

  function card(b, B, i) {
    var c = document.createElement("div");
    c.className = "blt-c" + (DARK[b.key] ? " blt-dk" : ""); c.setAttribute("role", "button"); c.tabIndex = 0;
    c.style.setProperty("--mesh", mesh(b.key));
    c.setAttribute("data-blinfo", b.key);
    c.setAttribute("aria-label", b.name + ", " + b.pat + ", " + b.min + " minutes. How it works");
    c.innerHTML = '<div class="blt-m" style="animation-delay:' + (-i * 7) + 's"></div>' +
      '<div class="blt-top"><div class="blt-chips"><span class="blt-mn">' + b.min + ' min</span>' +
      (B.state === "plan" && b.inPlan ? '<span class="blt-in">In your plan</span>' : "") + '</div>' +
      '<button class="blt-pl" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '">' + PLAY + '</button></div>' +
      '<div class="blt-p"><div class="blt-n">' + nm(b) + '</div><div class="blt-s">' + b.pat + '</div></div>';
    return c;
  }

  function all(B) {
    var html = '<p class="blt-sl">Tap one to see how it goes, or start it from there.</p><div class="blt-ls">' + B.list.map(function (b) {
      return '<button class="blt-r" data-blinfo="' + b.key + '"><span class="sw" style="--mesh:' + mesh(b.key) + '"></span><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + b.pat +
        (B.state === "plan" && b.inPlan ? ' · <span style="color:var(--ok-600)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    }).join("") + '</div>';
    if (window.GFOpenSheet) window.GFOpenSheet("bltAll", "Breathing exercises", html);
  }

  BLIB.add("t", {
    render: function (host, B) {
      host.className = "gut sect" + (RM ? " blt-rm" : "");
      var intro = B.state === "noplan" ? "Use any of these while your coach sets up your plan."
        : B.state === "free" ? "Start one whenever you need a pause."
        : "Start one whenever you need a pause, in your plan or not.";
      host.innerHTML = '<div class="blt-hd"><h2>Breathing exercises</h2><button class="blt-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="blt-intro">' + intro + '</p><div class="blt-rail"></div>';
      var rail = host.querySelector(".blt-rail");
      B.list.forEach(function (b, i) { rail.appendChild(card(b, B, i)); });
      host.querySelector(".blt-all").onclick = function (e) { e.stopPropagation(); all(B); };
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("blt-c")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
