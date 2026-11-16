/* "All breathing exercises", variant y: Chapters by need.
   One rail, read like a book with chapters: Wind down, Steady and focus, Breathe easier. Each chapter opens with a tall
   narrow label card in deep indigo (its name set upright along the card, a small glyph on top) and its exercises follow.
   The label stays pinned at the left edge while its own exercises slide past, and the next chapter's label pushes it out,
   so you always know which group you are in. The exercise cards are the mind plan card's language at tile size: indigo
   wash, conic indigo tip on the border, the 2px hard shadow, a drawn glyph, the name, the pattern as numbers and static
   bars, minutes and a play mark. A card opens the info sheet; the play mark starts it. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>';
  var G = {
    coherent: '<path d="M2.5 12c2.4-4.6 4.8-4.6 7.2 0s4.8 4.6 7.2 0c1.3-2.4 2.6-3.1 4.6-2.4"/>',
    sleep: '<path d="M19.5 14.6A7.8 7.8 0 1 1 9.4 4.5a6.2 6.2 0 0 0 10.1 10.1z"/><path d="M17 3.5v3M15.5 5h3"/>',
    box: '<rect x="4.5" y="4.5" width="15" height="15" rx="3"/><circle cx="4.5" cy="12" r=".6" fill="currentColor"/>',
    exhale: '<path d="M3 16.5c1.4-6.5 2.8-9.5 4.4-9.5 2.4 0 4.2 9.5 13.6 9.5"/>',
    belly: '<path d="M4.5 8.5c0 6.5 3.3 10.5 7.5 10.5s7.5-4 7.5-10.5"/><path d="M8.5 8.5c0 3.8 1.6 6.3 3.5 6.3s3.5-2.5 3.5-6.3"/>',
    hum: '<path d="M4 10.5v3M7.2 8v8M10.4 5v14M13.6 8v8M16.8 9.5v5M20 11v2"/>',
    pursed: '<path d="M3 12c2.8-3 5.8-4 9-2.3 3.2-1.7 6.2-.7 9 2.3-2.8 3.2-5.8 4.6-9 4.6S5.8 15.2 3 12z"/><path d="M6.5 12.2c1.9.5 3.7.5 5.5 0 1.8.5 3.6.5 5.5 0"/>'
  };
  /* the chapters' own marks: a moon, a target, a leaf */
  var CG = {
    wind: '<path d="M19.5 14.6A7.8 7.8 0 1 1 9.4 4.5a6.2 6.2 0 0 0 10.1 10.1z"/>',
    steady: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/>',
    easy: '<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14z"/><path d="M5 19l8-8"/>'
  };
  var CH = [["wind", "Wind down", ["sleep", "hum", "exhale"]], ["steady", "Steady and focus", ["coherent", "box"]], ["easy", "Breathe easier", ["belly", "pursed"]]];
  var svg = function (p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; };
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };
  var nums = function (b) { return b.seq.map(function (x) { return x.s; }).join(" · "); };
  var bars = function (b) { return '<span class="bly-bars" aria-hidden="true">' + b.seq.map(function (x) { return '<i class="' + x.k + '" style="flex:' + x.s + '"></i>'; }).join("") + '</span>'; };

  var css = document.createElement("style");
  css.textContent = [
    ".bly .sec{margin-bottom:4px}",
    ".bly-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".bly-all::after{content:'';position:absolute;inset:-6px -8px}.bly-all svg{width:18px;height:18px}",
    ".bly-intro{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    /* the rail; cards snap to just right of the pinned chapter label */
    ".bly-rail{display:flex;gap:12px;margin:0 calc(var(--gut) * -1);padding:4px var(--gut) 8px;overflow-x:auto;scroll-snap-type:x proximity;scroll-padding-left:calc(var(--gut) + 68px);scrollbar-width:none}",
    ".bly-rail::-webkit-scrollbar{display:none}",
    ".bly-grp{flex:none;display:flex;gap:12px;align-items:stretch}",
    /* the chapter label: pinned at the gutter (sticky left is measured inside the rail padding, so 0 is the gutter) while its own cards pass; a white collar either side hides them as they slide under */
    ".bly-ch{position:sticky;left:0;z-index:2;flex:0 0 56px;display:flex;flex-direction:column;align-items:center;gap:12px;padding:14px 0 16px;color:#fff}",
    ".bly-ch::before{content:'';position:absolute;z-index:-1;inset:0;border-radius:var(--r-lg);background:linear-gradient(180deg,var(--in-600),var(--in-900));box-shadow:2px 2px 0 var(--in-200)}",
    ".bly-ch::after{content:'';position:absolute;z-index:-2;left:-16px;right:-12px;top:-4px;bottom:-8px;background:linear-gradient(90deg,#fff calc(100% - 8px),rgb(255 255 255 / 0))}",
    ".bly-ch svg{flex:none;width:20px;height:20px;opacity:.9}",
    ".bly-ch b{writing-mode:vertical-rl;transform:rotate(180deg);font:600 14px/20px Roboto;letter-spacing:.3px;white-space:nowrap}",
    /* the exercise card */
    ".bly-c{position:relative;flex:0 0 156px;scroll-snap-align:start;display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:var(--r-lg);border:1px solid transparent;text-align:left;color:var(--g-900);cursor:pointer;box-shadow:2px 2px 0 var(--g-200);" +
      "background:linear-gradient(180deg,var(--in-25) 0%,#fff 46%,#fff 100%) padding-box,conic-gradient(from 0deg,var(--in-600) 0deg,var(--g-200) 43deg,var(--g-200) 317deg,var(--in-600) 360deg) border-box;" +
      "transition:transform .18s var(--ease),box-shadow .18s var(--ease)}",
    ".bly-c:active{transform:translate(1px,1px);box-shadow:1px 1px 0 var(--g-200)}",
    ".bly-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}",
    ".bly-th{flex:none;width:40px;height:40px;border-radius:var(--r-md);display:grid;place-items:center;background:linear-gradient(150deg,var(--in-50),var(--in-100));color:var(--in-600)}.bly-th svg{width:24px;height:24px}",
    ".bly-in{display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 8px 0 6px;border-radius:var(--r-pill);background:var(--ok-50);font:500 11px/16px Roboto;color:var(--ok-600);white-space:nowrap}.bly-in::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--ok-500)}",
    ".bly-n{margin-top:4px;min-height:40px;display:flex;align-items:flex-end;font:600 14px/20px Roboto;text-wrap:balance}",
    ".bly-p{margin-top:-4px;font:500 12px/16px Roboto;color:var(--g-500);font-variant-numeric:tabular-nums;letter-spacing:.2px}",
    ".bly-bars{display:flex;gap:2px;height:4px}.bly-bars i{border-radius:2px;background:var(--in-500)}.bly-bars i.hold{background:var(--in-200)}.bly-bars i.out{background:var(--in-300)}",
    ".bly-ft{margin-top:4px;display:flex;align-items:center;justify-content:space-between}",
    ".bly-mn{font:400 12px/16px Roboto;color:var(--g-500)}",
    ".bly-pl{position:relative;flex:none;width:32px;height:32px;margin:-2px -2px -2px 0;border:0;padding:0;border-radius:50%;background:#fff;color:var(--brand-600);display:grid;place-items:center;box-shadow:0 0 0 1px var(--g-200);cursor:pointer}",
    ".bly-pl::after{content:'';position:absolute;inset:-6px}.bly-pl svg{width:14px;height:14px;margin-left:2px}",
    /* See all, grouped the same way */
    ".bly-sh h6{margin:16px 0 0;font:600 12px/16px Roboto;letter-spacing:.4px;text-transform:uppercase;color:var(--in-700)}.bly-sh h6:first-of-type{margin-top:0}",
    ".bly-r{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;padding:8px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    "h6+.bly-r{border-top:0}.bly-r .t{flex:1;min-width:0}.bly-r .tt{display:block;font:600 14px/20px Roboto}.bly-r .td{display:block;margin-top:2px;font:400 12px/18px Roboto;color:var(--g-500)}",
    ".bly-r .rt{display:inline-flex;align-items:center;gap:4px;font:500 12px/20px Roboto;color:var(--g-500)}.bly-r .rt svg{width:16px;height:16px;color:var(--g-400)}"
  ].join("");
  document.head.appendChild(css);

  function card(b, B) {
    var mine = B.state === "plan" && b.inPlan;
    return '<div class="bly-c" role="button" tabindex="0" data-blinfo="' + b.key + '" aria-label="' + b.name + ', ' + b.pat + ', ' + b.min + ' minutes' + (mine ? ', in your plan' : '') + '. How it works">' +
      '<div class="bly-top"><span class="bly-th">' + svg(G[b.key]) + '</span>' + (mine ? '<span class="bly-in">In your plan</span>' : "") + '</div>' +
      '<div class="bly-n">' + nm(b) + '</div><div class="bly-p">' + nums(b) + '</div>' + bars(b) +
      '<div class="bly-ft"><span class="bly-mn">' + b.min + ' min</span><button class="bly-pl" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '">' + PLAY + '</button></div></div>';
  }

  function all(B) {
    var html = '<div class="bly-sh">' + CH.map(function (c) {
      return '<h6>' + c[1] + '</h6>' + c[2].map(function (k) {
        var b = B.get(k), mine = B.state === "plan" && b.inPlan;
        return '<button class="bly-r" data-blinfo="' + k + '"><span class="bly-th">' + svg(G[k]) + '</span><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + b.pat +
          (mine ? ' · <span style="color:var(--ok-600)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
      }).join("");
    }).join("") + '</div>';
    if (window.GFOpenSheet) window.GFOpenSheet("blyAll", "Breathing exercises", html);
  }

  BLIB.add("y", {
    render: function (host, B) {
      host.className = "gut sect bly";
      var intro = B.state === "noplan" ? "Use any of these while your coach sets up your plan."
        : B.state === "free" ? "Pick by how you feel. Start one whenever you need a pause."
        : "Pick by how you feel, in your plan or not.";
      host.innerHTML = '<div class="sec"><h2>Breathing exercises</h2><button class="bly-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="bly-intro">' + intro + '</p><div class="bly-rail">' + CH.map(function (c) {
          return '<div class="bly-grp" role="group" aria-label="' + c[1] + '"><div class="bly-ch" aria-hidden="true">' + svg(CG[c[0]]) + '<b>' + c[1] + '</b></div>' +
            c[2].map(function (k) { return card(B.get(k), B); }).join("") + '</div>';
        }).join("") + '</div>';
      host.querySelector(".bly-all").onclick = function (e) { e.stopPropagation(); all(B); };
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("bly-c")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
