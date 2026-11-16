/* "All breathing exercises", variant v: Two-row rail.
   A rail that scrolls sideways in two rows, so all seven fit in about two screens of swipe. Each compact card is a
   row in the plan's picture-slot language: the exercise's drawn glyph on the soft indigo wash, the name, then the
   pattern as numbers in indigo and the minutes. Cards are tinted indigo with the 2px hard shadow. The eighth slot is
   a See all card, the same size, so the grid ends clean and the full list is one tap away. A card opens the info
   sheet, which holds Start. In the plan state, a small green tick on the glyph marks the ones in your plan. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
  var G = {
    coherent: '<path d="M2.5 12c2.4-4.6 4.8-4.6 7.2 0s4.8 4.6 7.2 0c1.3-2.4 2.6-3.1 4.6-2.4"/>',
    sleep: '<path d="M19.5 14.6A7.8 7.8 0 1 1 9.4 4.5a6.2 6.2 0 0 0 10.1 10.1z"/><path d="M17 3.5v3M15.5 5h3"/>',
    box: '<rect x="4.5" y="4.5" width="15" height="15" rx="3"/><circle cx="4.5" cy="12" r=".6" fill="currentColor"/>',
    exhale: '<path d="M3 16.5c1.4-6.5 2.8-9.5 4.4-9.5 2.4 0 4.2 9.5 13.6 9.5"/>',
    belly: '<path d="M4.5 8.5c0 6.5 3.3 10.5 7.5 10.5s7.5-4 7.5-10.5"/><path d="M8.5 8.5c0 3.8 1.6 6.3 3.5 6.3s3.5-2.5 3.5-6.3"/>',
    hum: '<path d="M4 10.5v3M7.2 8v8M10.4 5v14M13.6 8v8M16.8 9.5v5M20 11v2"/>',
    pursed: '<path d="M3 12c2.8-3 5.8-4 9-2.3 3.2-1.7 6.2-.7 9 2.3-2.8 3.2-5.8 4.6-9 4.6S5.8 15.2 3 12z"/><path d="M6.5 12.2c1.9.5 3.7.5 5.5 0 1.8.5 3.6.5 5.5 0"/>'
  };
  var GRID = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/></svg>';
  var glyph = function (k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + G[k] + '</svg>'; };
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };
  var nums = function (b) { return b.seq.map(function (x) { return x.s; }).join(" · "); };

  var css = document.createElement("style");
  css.textContent = [
    ".blv .sec{margin-bottom:4px}",
    ".blv-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blv-all::after{content:'';position:absolute;inset:-6px -8px}.blv-all svg{width:18px;height:18px}",
    ".blv-intro{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blv-intro .tk{display:inline-grid;place-items:center;width:14px;height:14px;margin:0 2px;border-radius:50%;background:var(--ok-600);vertical-align:-2px}.blv-intro .tk svg{width:8px;height:8px}",
    /* two rows that flow sideways; each column snaps to the gutter */
    ".blv-rail{display:grid;grid-template-rows:repeat(2,80px);grid-auto-flow:column;grid-auto-columns:224px;gap:12px;margin:0 calc(var(--gut) * -1);padding:4px var(--gut) 8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--gut);scrollbar-width:none}",
    ".blv-rail::-webkit-scrollbar{display:none}",
    ".blv-c{display:flex;align-items:center;gap:12px;min-width:0;padding:0 12px;border-radius:var(--r-lg);border:1px solid var(--in-100);scroll-snap-align:start;text-align:left;font:inherit;color:var(--g-900);cursor:pointer;" +
      "background:linear-gradient(150deg,var(--in-25),#fff 72%);box-shadow:2px 2px 0 var(--in-100);transition:transform .18s var(--ease),box-shadow .18s var(--ease)}",
    ".blv-c:active{transform:translate(1px,1px);box-shadow:1px 1px 0 var(--in-100)}",
    ".blv-th{position:relative;flex:none;width:48px;height:48px;border-radius:var(--r-md);display:grid;place-items:center;background:linear-gradient(150deg,var(--in-50),var(--in-100));color:var(--in-600)}",
    ".blv-th>svg{width:24px;height:24px}",
    ".blv-tk{position:absolute;right:-4px;top:-4px;width:18px;height:18px;border-radius:50%;background:var(--ok-600);box-shadow:0 0 0 2px #fff;display:grid;place-items:center}.blv-tk svg{width:10px;height:10px}",
    ".blv-t{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}",
    ".blv-n{font:600 14px/20px Roboto;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-wrap:balance}",
    ".blv-p{font:400 12px/16px Roboto;color:var(--g-500);font-variant-numeric:tabular-nums;white-space:nowrap}.blv-p b{font-weight:600;color:var(--in-700);letter-spacing:.2px}",
    /* the eighth slot */
    ".blv-c.more{background:#fff;border-color:var(--g-200);box-shadow:2px 2px 0 var(--g-200);color:var(--brand-600)}",
    ".blv-c.more .blv-th{background:var(--g-50);color:var(--g-500)}.blv-c.more .blv-n{display:flex;align-items:center;gap:2px}.blv-c.more .blv-n svg{width:18px;height:18px}",
    /* See all */
    ".blv-r{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;padding:8px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".blv-r:first-child{border-top:0}.blv-r .blv-th{width:40px;height:40px}.blv-r .t{flex:1;min-width:0}.blv-r .tt{display:block;font:600 14px/20px Roboto}.blv-r .td{display:block;margin-top:2px;font:400 12px/18px Roboto;color:var(--g-500)}",
    ".blv-r .rt{display:inline-flex;align-items:center;gap:4px;font:500 12px/20px Roboto;color:var(--g-500)}.blv-r .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".blv-sl{margin:0 0 8px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  document.head.appendChild(css);

  function card(b, B) {
    var mine = B.state === "plan" && b.inPlan;
    return '<button class="blv-c" data-blinfo="' + b.key + '" aria-label="' + b.name + ', ' + b.pat + ', ' + b.min + ' minutes' + (mine ? ', in your plan' : '') + '. How it works">' +
      '<span class="blv-th">' + glyph(b.key) + (mine ? '<span class="blv-tk">' + TICK + '</span>' : "") + '</span>' +
      '<span class="blv-t"><span class="blv-n">' + nm(b) + '</span><span class="blv-p"><b>' + nums(b) + '</b>  ·  ' + b.min + ' min</span></span></button>';
  }

  function all(B) {
    var html = '<p class="blv-sl">Tap one to see how it goes, or start it from there.</p><div>' + B.list.map(function (b) {
      var mine = B.state === "plan" && b.inPlan;
      return '<button class="blv-r" data-blinfo="' + b.key + '"><span class="blv-th">' + glyph(b.key) + (mine ? '<span class="blv-tk">' + TICK + '</span>' : "") + '</span><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + b.pat +
        (mine ? ' · <span style="color:var(--ok-600)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    }).join("") + '</div>';
    if (window.GFOpenSheet) window.GFOpenSheet("blvAll", "Breathing exercises", html);
  }

  BLIB.add("v", {
    render: function (host, B) {
      host.className = "gut sect blv";
      var anyMine = B.list.some(function (b) { return b.inPlan; });
      var intro = B.state === "noplan" ? "Use any of these while your coach sets up your plan."
        : B.state === "free" ? "Start one whenever you need a pause."
        : anyMine ? "Start any of them. A <span class=\"tk\">" + TICK + "</span> means it is in your plan." : "Start one whenever you need a pause, in your plan or not.";
      host.innerHTML = '<div class="sec"><h2>Breathing exercises</h2><button class="blv-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="blv-intro">' + intro + '</p><div class="blv-rail">' + B.list.map(function (b) { return card(b, B); }).join("") +
        '<button class="blv-c more" aria-label="See all ' + B.list.length + ' breathing exercises"><span class="blv-th">' + GRID + '</span><span class="blv-t"><span class="blv-n">See all ' + B.list.length + CHEV + '</span></span></button></div>';
      host.querySelectorAll(".blv-all,.blv-c.more").forEach(function (x) { x.onclick = function (e) { e.stopPropagation(); all(B); }; });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
