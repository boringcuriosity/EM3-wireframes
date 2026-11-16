/* "All breathing exercises", variant u: Featured plus rail.
   One rail. The first card is wide (about 85% of the screen) in the mind plan card's language: the indigo wash, the conic
   indigo tip on the border, radius 24, the 2px hard shadow and the Mind scene for the time of day in its top right. It
   features the exercise that suits right now (morning Simple, afternoon Box, evening Bhramari, night 4-7-8; ?now= moves
   the clock) with a Start button. The other six follow in the same rail as small indigo cards: a drawn glyph, the name,
   the pattern as numbers and as static bars. A card opens the info sheet; the play mark starts it. No live breathing in
   the cards, that stays in the player. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>';
  /* one drawn glyph per exercise, 24 grid, 1.8 stroke */
  var G = {
    coherent: '<path d="M2.5 12c2.4-4.6 4.8-4.6 7.2 0s4.8 4.6 7.2 0c1.3-2.4 2.6-3.1 4.6-2.4"/>',
    sleep: '<path d="M19.5 14.6A7.8 7.8 0 1 1 9.4 4.5a6.2 6.2 0 0 0 10.1 10.1z"/><path d="M17 3.5v3M15.5 5h3"/>',
    box: '<rect x="4.5" y="4.5" width="15" height="15" rx="3"/><circle cx="4.5" cy="12" r=".6" fill="currentColor"/>',
    exhale: '<path d="M3 16.5c1.4-6.5 2.8-9.5 4.4-9.5 2.4 0 4.2 9.5 13.6 9.5"/>',
    belly: '<path d="M4.5 8.5c0 6.5 3.3 10.5 7.5 10.5s7.5-4 7.5-10.5"/><path d="M8.5 8.5c0 3.8 1.6 6.3 3.5 6.3s3.5-2.5 3.5-6.3"/>',
    hum: '<path d="M4 10.5v3M7.2 8v8M10.4 5v14M13.6 8v8M16.8 9.5v5M20 11v2"/>',
    pursed: '<path d="M3 12c2.8-3 5.8-4 9-2.3 3.2-1.7 6.2-.7 9 2.3-2.8 3.2-5.8 4.6-9 4.6S5.8 15.2 3 12z"/><path d="M6.5 12.2c1.9.5 3.7.5 5.5 0 1.8.5 3.6.5 5.5 0"/>'
  };
  var glyph = function (k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + G[k] + '</svg>'; };
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };
  /* what it is for, as words that read after "For" */
  var fr = function (b) { return b.good.map(function (g) { return g === "Breathless" ? "breathlessness" : g === "Busy mind" ? "a busy mind" : g.toLowerCase(); }).join(" and "); };
  var nums = function (b) { return b.seq.map(function (x) { return x.s; }).join(" · "); };
  /* the pattern as static bars, each as long as its seconds: breath in, hold, breath out */
  var bars = function (b) { return '<span class="blu-bars" aria-hidden="true">' + b.seq.map(function (x) { return '<i class="' + x.k + '" style="flex:' + x.s + '"></i>'; }).join("") + '</span>'; };

  /* what suits right now, by the prototype's clock */
  function pick(h) {
    return h >= 5 && h < 12 ? ["coherent", "morning", "this morning"] : h >= 12 && h < 17 ? ["box", "afternoon", "this afternoon"]
      : h >= 17 && h < 21 ? ["hum", "evening", "this evening"] : ["sleep", "night", "tonight"];
  }

  var css = document.createElement("style");
  css.textContent = [
    ".blu .sec{margin-bottom:4px}",
    ".blu-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blu-all::after{content:'';position:absolute;inset:-6px -8px}.blu-all svg{width:18px;height:18px}",
    ".blu-intro{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blu-rail{display:flex;align-items:stretch;gap:12px;margin:0 calc(var(--gut) * -1);padding:4px var(--gut) 8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--gut);scrollbar-width:none}",
    ".blu-rail::-webkit-scrollbar{display:none}",
    /* the plan card's dress, shared by both sizes */
    ".blu-c{position:relative;isolation:isolate;flex:none;scroll-snap-align:start;display:flex;flex-direction:column;text-align:left;color:var(--g-900);cursor:pointer;border:1px solid transparent;box-shadow:2px 2px 0 var(--g-200);" +
      "background:linear-gradient(180deg,var(--in-25) 0%,#fff 46%,#fff 100%) padding-box,conic-gradient(from 0deg,var(--in-600) 0deg,var(--g-200) 43deg,var(--g-200) 317deg,var(--in-600) 360deg) border-box;" +
      "transition:transform .18s var(--ease),box-shadow .18s var(--ease)}",
    ".blu-c:active{transform:translate(1px,1px);box-shadow:1px 1px 0 var(--g-200)}",
    /* the featured card */
    ".blu-f{flex-basis:85%;border-radius:var(--r-xl);padding:16px;gap:0;min-height:216px}",
    ".blu-f::before{content:'';position:absolute;inset:0;z-index:-1;border-radius:inherit;opacity:.6;background:var(--scene) right top / auto 132px no-repeat;" +
      "-webkit-mask:linear-gradient(90deg,transparent 20%,#000 64%),linear-gradient(180deg,#000 40%,transparent 62%);-webkit-mask-composite:source-in;mask-composite:intersect}",
    ".blu-ey{align-self:flex-start;display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 10px 0 8px;border-radius:var(--r-pill);background:rgb(255 255 255 / .82);box-shadow:0 0 0 1px var(--in-100);font:600 12px/16px Roboto;color:var(--in-700)}",
    ".blu-ey svg{width:14px;height:14px}",
    ".blu-f .n{margin-top:16px;font:600 20px/26px Roboto;max-width:62%;text-wrap:balance}",
    ".blu-f .p{margin-top:4px;font:400 14px/20px Roboto;color:var(--g-600)}",
    ".blu-f .blu-bars{width:132px;margin-top:10px}",
    ".blu-f .ft{margin-top:auto;padding-top:16px;display:flex;align-items:center;gap:12px}",
    ".blu-go{display:inline-flex;align-items:center;gap:6px;height:44px;padding:0 18px 0 14px;border:0;border-radius:var(--r-sm);background:var(--brand-600);color:#fff;font:600 14px/20px Roboto;cursor:pointer;box-shadow:0 4px 0 var(--brand-700)}",
    ".blu-go svg{width:16px;height:16px}.blu-go:active{transform:translateY(2px);box-shadow:0 2px 0 var(--brand-700)}",
    ".blu-f .blu-wy{flex:1;min-width:0;font:400 12px/16px Roboto;color:var(--g-500)}",
    /* the small cards */
    ".blu-s{flex-basis:148px;border-radius:var(--r-lg);padding:12px;gap:8px}",
    ".blu-th{width:40px;height:40px;border-radius:var(--r-md);display:grid;place-items:center;background:linear-gradient(150deg,var(--in-50),var(--in-100));color:var(--in-600)}",
    ".blu-th svg{width:24px;height:24px}",
    ".blu-s .n{margin-top:4px;min-height:40px;display:flex;align-items:flex-end;font:600 14px/20px Roboto;text-wrap:balance}",
    ".blu-s .g{font:400 12px/16px Roboto;color:var(--g-600)}",
    ".blu-s .p{margin-top:-4px;font:500 12px/16px Roboto;color:var(--g-500);font-variant-numeric:tabular-nums;letter-spacing:.2px}",
    ".blu-s .ft{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:8px}",
    ".blu-s .mn{font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blu-pl{position:relative;flex:none;width:32px;height:32px;margin:-2px -2px -2px 0;border:0;padding:0;border-radius:50%;background:#fff;color:var(--brand-600);display:grid;place-items:center;box-shadow:0 0 0 1px var(--g-200);cursor:pointer}",
    ".blu-pl::after{content:'';position:absolute;inset:-6px}.blu-pl svg{width:14px;height:14px;margin-left:2px}",
    ".blu-bars{display:flex;gap:2px;height:4px}.blu-bars i{border-radius:2px;background:var(--in-500)}.blu-bars i.hold{background:var(--in-200)}.blu-bars i.out{background:var(--in-300)}",
    ".blu-in{display:inline-flex;align-items:center;gap:4px;font:500 11px/16px Roboto;color:var(--ok-600)}.blu-in::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--ok-500)}",
    ".blu-s .blu-in{position:absolute;right:12px;top:12px;font-size:0;gap:0}.blu-s .blu-in::before{width:8px;height:8px;box-shadow:0 0 0 3px var(--ok-50)}",
    ".blu-key{display:flex;gap:12px;margin:4px 0 0;font:400 11px/16px Roboto;color:var(--g-500)}.blu-key span{display:inline-flex;align-items:center;gap:4px}.blu-key i{width:10px;height:4px;border-radius:2px;background:var(--in-500)}",
    /* See all */
    ".blu-r{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;padding:8px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".blu-r:first-child{border-top:0}.blu-r .t{flex:1;min-width:0}.blu-r .tt{display:block;font:600 14px/20px Roboto}.blu-r .td{display:block;margin-top:2px;font:400 12px/18px Roboto;color:var(--g-500)}",
    ".blu-r .rt{display:inline-flex;align-items:center;gap:4px;font:500 12px/20px Roboto;color:var(--g-500)}.blu-r .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".blu-sl{margin:0 0 8px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  document.head.appendChild(css);

  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>';

  function featured(b, B, p) {
    var c = document.createElement("div");
    c.className = "blu-c blu-f"; c.setAttribute("role", "button"); c.tabIndex = 0; c.setAttribute("data-blinfo", b.key);
    c.style.setProperty("--scene", "url(/v7/icons/mind/bg/" + p[1] + ".webp?v=1)");
    c.setAttribute("aria-label", b.name + ", good for " + p[2] + ", " + b.pat + ". How it works");
    c.innerHTML = '<span class="blu-ey">' + (p[1] === "evening" || p[1] === "night" ? MOON : SUN) + 'Good for ' + p[2] + '</span>' +
      '<div class="n">' + nm(b) + '</div><div class="p">' + b.pat + '</div>' + bars(b) +
      '<div class="ft"><button class="blu-go" data-blplay="' + b.key + '">' + PLAY + 'Start, ' + b.min + ' min</button>' +
      '<span class="blu-wy">' + (B.state === "plan" && b.inPlan ? '<span class="blu-in">In your plan</span>' : 'For ' + fr(b)) + '</span></div>';
    return c;
  }
  function small(b, B) {
    var c = document.createElement("div");
    c.className = "blu-c blu-s"; c.setAttribute("role", "button"); c.tabIndex = 0; c.setAttribute("data-blinfo", b.key);
    c.setAttribute("aria-label", b.name + ", " + b.pat + ", " + b.min + " minutes" + (B.state === "plan" && b.inPlan ? ", in your plan" : "") + ". How it works");
    c.innerHTML = '<span class="blu-th">' + glyph(b.key) + '</span>' + (B.state === "plan" && b.inPlan ? '<span class="blu-in">In your plan</span>' : "") +
      '<div class="n">' + nm(b) + '</div><div class="p">' + nums(b) + '</div>' + bars(b) + '<div class="g">For ' + fr(b) + '</div>' +
      '<div class="ft"><span class="mn">' + b.min + ' min</span><button class="blu-pl" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '">' + PLAY + '</button></div>';
    return c;
  }

  function all(B) {
    var html = '<p class="blu-sl">Tap one to see how it goes, or start it from there.</p><div>' + B.list.map(function (b) {
      return '<button class="blu-r" data-blinfo="' + b.key + '"><span class="blu-th">' + glyph(b.key) + '</span><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + b.pat +
        (B.state === "plan" && b.inPlan ? ' · <span style="color:var(--ok-600)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    }).join("") + '</div>';
    if (window.GFOpenSheet) window.GFOpenSheet("bluAll", "Breathing exercises", html);
  }

  BLIB.add("u", {
    render: function (host, B) {
      host.className = "gut sect blu";
      var p = pick(window.MDPLAN ? MDPLAN.now : 15), top = B.get(p[0]);
      var intro = B.state === "noplan" ? "Use any of these while your coach sets up your plan."
        : B.state === "free" ? "Start one whenever you need a pause."
        : "Start one whenever you need a pause, in your plan or not.";
      host.innerHTML = '<div class="sec"><h2>Breathing exercises</h2><button class="blu-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="blu-intro">' + intro + '</p><div class="blu-rail"></div>';
      var rail = host.querySelector(".blu-rail");
      rail.appendChild(featured(top, B, p));
      B.list.forEach(function (b) { if (b.key !== top.key) rail.appendChild(small(b, B)); });
      host.querySelector(".blu-all").onclick = function (e) { e.stopPropagation(); all(B); };
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("blu-c")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
