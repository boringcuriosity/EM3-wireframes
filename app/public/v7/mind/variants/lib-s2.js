/* "All breathing exercises", variant s2: Line icons, with warmth.
   S's line icons, now in K's plan-card language (move/plan.css .mv-card): the indigo top wash, the 1px border with an
   indigo tip, the 2px hard shadow, radius 24. Each icon sits on a soft indigo disc, then a one-word benefit in indigo,
   the name on one line, and a hairline footer with the minutes and the one
   green Start, as on the plan. The card opens the info sheet. Nothing moves. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>';
  /* the seven, one 32 grid, drawn to sit optically centred: an even wave (Simple), a moon (4-7-8), a square with its
     direction (Box), a short rise and a long fall (Extended Exhale), someone lying down with the belly rising (Belly),
     a bee (Bhramari), lips pursed round a small opening (Pursed Lip) */
  var ICON = {
    coherent: '<path d="M4 16c2-5.2 4-7.8 6-7.8s4 2.6 6 7.8 4 7.8 6 7.8 4-2.6 6-7.8"/>',
    sleep: '<path d="M23.6 19.8A9 9 0 0 1 12.2 8.4 9.4 9.4 0 1 0 23.6 19.8z"/><path d="M22.5 5.5v4M20.5 7.5h4"/>',
    box: '<rect x="7" y="7" width="18" height="18" rx="4"/><path d="M13 7h4.5M15.5 5l2 2-2 2"/>',
    exhale: '<path d="M4 23c2.6 0 3.6-13 6.6-13 4.6 0 8.6 13 17.4 13"/>',
    belly: '<g transform="translate(0 -1)"><circle cx="6.8" cy="17.4" r="3"/><path d="M10.6 21h2.2c1.8 0 2.6-7 5.9-7s4.1 7 5.9 7H28M4 25.5h24"/><path d="M18.7 5.5v5M16.6 7.6l2.1-2.1 2.1 2.1"/></g>',
    hum: '<g transform="translate(16 16) scale(1.1) translate(-16 -16)"><ellipse cx="15" cy="19.5" rx="8.5" ry="5.6"/><path d="M13 14.1v10.8M17.4 14.1v10.8"/><path d="M12.4 14c-2.4-3.4-1.8-6.8.9-6.8 2.6 0 3 3.4.9 6.8M16.8 14c2.3-3.2 5.4-4 6.8-2.5 1.3 1.6-.3 4-4.6 5.2"/><path d="M23.5 19.5h2.6"/><circle cx="9.6" cy="18.4" r=".9" fill="currentColor" stroke="none"/></g>',
    pursed: '<path d="M7 16.4c2.2-4 4.6-6 6.6-5.5 1 .3 1.5 1.1 2.4 1.1s1.4-.8 2.4-1.1c2-.5 4.4 1.5 6.6 5.5-2 4.4-5 6.6-9 6.6s-7-2.2-9-6.6z"/><path d="M7 16.4h6.2M18.8 16.4H25"/><circle cx="16" cy="16.4" r="2.2"/>'
  };
  var FOR = { coherent: "Calm", sleep: "Sleep", box: "Focus", exhale: "Unwind", belly: "Digestion", hum: "Stillness", pursed: "Recovery" };
  var svg = function (k) { return '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[k] + '</svg>'; };
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };

  var css = document.createElement("style");
  css.textContent = [
    ".bls2-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 4px}.bls2-hd h2{margin:0}",
    ".bls2-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".bls2-all::after{content:'';position:absolute;inset:-6px -8px}.bls2-all svg{width:18px;height:18px}",
    ".bls2-intro{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".bls2-rail{display:flex;gap:12px;margin:0 calc(var(--gut) * -1);padding:4px var(--gut) 8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--gut);scrollbar-width:none}",
    ".bls2-rail::-webkit-scrollbar{display:none}",
    /* the card: .mv-card's skin, cut to a rail tile */
    ".bls2-t{flex:0 0 196px;scroll-snap-align:start;display:flex;flex-direction:column;border-radius:var(--r-xl);border:1px solid transparent;cursor:pointer;text-align:left;color:var(--g-900);box-shadow:2px 2px 0 var(--g-200);" +
      "background:linear-gradient(180deg,var(--in-50) 0%,var(--in-25) 22%,#fff 50%,#fff 100%) padding-box,conic-gradient(from 0deg,var(--in-600) 0deg,var(--g-200) 43deg,var(--g-200) 317deg,var(--in-600) 360deg) border-box;transition:transform .18s var(--ease),box-shadow .18s var(--ease)}",
    ".bls2-t:active{transform:translate(1px,1px);box-shadow:1px 1px 0 var(--g-200)}",
    ".bls2-b{display:flex;flex-direction:column;padding:16px}",
    ".bls2-top{display:flex;align-items:center;justify-content:space-between;gap:8px;height:48px}",
    /* the disc: a soft indigo pool, lighter at the top left like the wash */
    ".bls2-ic{flex:none;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;color:var(--in-600);background:radial-gradient(circle at 32% 28%,#fff 0%,var(--in-50) 46%,var(--in-100) 100%);box-shadow:inset 0 0 0 1px var(--in-100)}",
    ".bls2-ic svg{display:block;width:28px;height:28px}",
    ".bls2-in{display:inline-flex;align-items:center;height:24px;padding:0 8px;border-radius:var(--r-pill);background:var(--in-50);color:var(--in-700);font:500 12px/16px Roboto;white-space:nowrap}",
    ".bls2-for{margin-top:16px;font:500 12px/16px Roboto;color:var(--in-600)}",
    ".bls2-n{margin-top:4px;font:600 16px/22px Roboto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".bls2-f{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 16px;min-height:48px;border-top:1px solid var(--g-100)}",
    ".bls2-mn{font:400 12px/16px Roboto;color:var(--g-500);font-variant-numeric:tabular-nums}",
    ".bls2-go{position:relative;display:inline-flex;align-items:center;gap:4px;height:32px;margin-right:-4px;padding:0 4px;border:0;background:none;border-radius:var(--r-sm);font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".bls2-go::after{content:'';position:absolute;inset:-6px -4px}.bls2-go svg{width:16px;height:16px}.bls2-go:active{background:var(--g-50)}",
    /* See all: the same disc in a row */
    ".bls2-ls{display:flex;flex-direction:column}.bls2-r{display:flex;align-items:center;gap:12px;width:100%;min-height:72px;padding:12px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".bls2-r:first-child{border-top:0}.bls2-r .bls2-ic{width:44px;height:44px}.bls2-r .bls2-ic svg{width:26px;height:26px}",
    ".bls2-r .t{flex:1;min-width:0}.bls2-r .tt{display:block;font:600 14px/20px Roboto}.bls2-r .td{display:block;margin-top:2px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".bls2-r .rt{display:inline-flex;align-items:center;gap:4px;font:400 12px/16px Roboto;color:var(--g-500);white-space:nowrap}.bls2-r .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".bls2-sl{margin:0 0 8px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  document.head.appendChild(css);

  function card(b, B) {
    var t = document.createElement("div");
    t.className = "bls2-t"; t.setAttribute("role", "button"); t.tabIndex = 0; t.setAttribute("data-blinfo", b.key);
    t.setAttribute("aria-label", b.name + ", good for " + FOR[b.key].toLowerCase() + ", " + b.min + " minutes. How it works");
    t.innerHTML = '<div class="bls2-b"><div class="bls2-top"><span class="bls2-ic">' + svg(b.key) + '</span>' + (B.state === "plan" && b.inPlan ? '<span class="bls2-in">In your plan</span>' : "") + '</div>' +
      '<div class="bls2-for">' + FOR[b.key] + '</div><div class="bls2-n">' + nm(b) + '</div></div>' +
      '<div class="bls2-f"><span class="bls2-mn">' + b.min + ' min</span><button class="bls2-go" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '">' + PLAY + 'Start</button></div>';
    return t;
  }

  function all(B) {
    var html = '<p class="bls2-sl">Tap one to see how it goes, or start it from there.</p><div class="bls2-ls">' + B.list.map(function (b) {
      return '<button class="bls2-r" data-blinfo="' + b.key + '"><span class="bls2-ic">' + svg(b.key) + '</span><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + FOR[b.key] + ' · ' + b.pat +
        (B.state === "plan" && b.inPlan ? ' · <span style="color:var(--in-700)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    }).join("") + '</div>';
    if (window.GFOpenSheet) window.GFOpenSheet("bls2All", "Breathing exercises", html);
  }

  BLIB.add("s2", {
    render: function (host, B) {
      host.className = "gut sect";
      var intro = B.state === "noplan" ? "Use any of these while your coach sets up your plan."
        : B.state === "free" ? "Start one whenever you need a pause."
        : "Start one whenever you need a pause, in your plan or not.";
      host.innerHTML = '<div class="bls2-hd"><h2 class="gf-h">Breathing exercises</h2><button class="bls2-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="bls2-intro">' + intro + '</p><div class="bls2-rail"></div>';
      var rail = host.querySelector(".bls2-rail");
      B.list.forEach(function (b) { rail.appendChild(card(b, B)); });
      host.querySelector(".bls2-all").onclick = function (e) { e.stopPropagation(); all(B); };
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("bls2-t")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
