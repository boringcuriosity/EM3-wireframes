/* "All breathing exercises", variant s: Line icons, minimal.
   Quiet white cards with a lot of air: one thin line icon in indigo (seven drawn for this, one 32 grid, 1.5px stroke,
   round caps), the one thing it is best for, the name, and the minutes. Start is a small outlined play disc in the
   corner; the rest of the card opens the info sheet. Nothing moves and nothing is tinted, so the section rests
   at the end of a busy screen. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>';
  /* the seven icons: a wave (even in and out), a moon (sleep), a square with its traveller (Box), a short rise and a long
     tail (Extended Exhale), a person sitting with the belly rising (Belly), a bee (Bhramari), pursed lips (Pursed Lip) */
  var ICON = {
    coherent: '<path d="M3.5 16c2.1-5.3 4.2-8 6.25-8s4.15 2.7 6.25 8 4.2 8 6.25 8 4.15-2.7 6.25-8"/>',
    sleep: '<path d="M24.5 19.6A9.5 9.5 0 0 1 12.4 7.5 9.5 9.5 0 1 0 24.5 19.6z"/><path d="M22 6v4M20 8h4"/>',
    box: '<rect x="7" y="7" width="18" height="18" rx="3.5"/><circle cx="7" cy="12" r="1.6" fill="currentColor" stroke="none"/>',
    exhale: '<path d="M4 22.5c2.5 0 3.5-12 6.5-12 4.5 0 9 12 17.5 12"/>',
    belly: '<circle cx="12.5" cy="6" r="2.8"/><path d="M10.6 10.6c-1.4 4.4-1.8 8.8-1 13.4M14.6 10.6c.3 1.8.6 3 1.2 4 3.8 1.4 5.2 3.6 5.2 5.6 0 1.8-1.4 3.4-4 3.8M9.6 24H27"/><path d="M19 13.4c3.4 1.4 5.4 3.8 5.4 6.6" stroke-dasharray="1.6 2.4"/>',
    hum: '<ellipse cx="15" cy="19.5" rx="9" ry="5.8"/><path d="M13 14v11M17.8 14v11"/><path d="M12.6 13.8c-2.3-3.8-1.5-7 1.3-7s3.1 3.4.6 7M16.8 13.8c2.5-3.6 5.7-4.4 7.2-2.7s-.4 4.2-5 5.4"/><path d="M24 19.5h2"/><circle cx="9.2" cy="18.4" r=".9" fill="currentColor" stroke="none"/>',
    pursed: '<path d="M6 16.5c2.4-4.3 5-6.4 7.3-5.6.9.3 1.6 1.6 2.7 1.6s1.8-1.3 2.7-1.6c2.3-.8 4.9 1.3 7.3 5.6"/><path d="M6 16.5c1.8 4.4 5.6 6.4 10 6.4s8.2-2 10-6.4"/><path d="M6 16.5c3.6.8 6.9 1 10 1s6.4-.2 10-1"/>'
  };
  var FOR = { coherent: "Calm", sleep: "Sleep", box: "Focus", exhale: "Stress", belly: "Digestion", hum: "Busy mind", pursed: "Breathless" };
  var svg = function (k) { return '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="bls-v">' + (k === "hum" || k === "pursed" ? '<g transform="translate(16 16) scale(1.12) translate(-16 -16)">' + ICON[k] + '</g>' : ICON[k]) + '</svg>'; };
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };

  var css = document.createElement("style");
  css.textContent = [
    ".bls-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 4px}.bls-hd h2{margin:0}",
    ".bls-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".bls-all::after{content:'';position:absolute;inset:-6px -8px}.bls-all svg{width:18px;height:18px}",
    ".bls-intro{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".bls-rail{display:flex;gap:12px;margin:0 calc(var(--gut) * -1);padding:4px var(--gut) 8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--gut);scrollbar-width:none}",
    ".bls-rail::-webkit-scrollbar{display:none}",
    ".bls-t{flex:0 0 160px;scroll-snap-align:start;display:flex;flex-direction:column;padding:16px;border-radius:var(--r-lg);border:1px solid var(--g-200);background:#fff;cursor:pointer;text-align:left;color:var(--g-900);transition:border-color .18s var(--ease),background .18s var(--ease)}",
    ".bls-t:active{background:var(--g-25);border-color:var(--g-300)}",
    ".bls-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;height:32px}",
    ".bls-ic{width:32px;height:32px;color:var(--in-600)}.bls-ic svg{display:block;width:32px;height:32px}",
    ".bls-in{display:inline-flex;align-items:center;gap:4px;margin-top:8px;font:500 11px/16px Roboto;color:var(--in-700);white-space:nowrap}.bls-in::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--in-500)}",
    ".bls-for{margin-top:40px;font:500 12px/16px Roboto;color:var(--in-600)}",
    ".bls-n{margin-top:4px;min-height:44px;font:600 16px/22px Roboto;text-wrap:balance}",
    ".bls-f{display:flex;align-items:center;justify-content:space-between;margin-top:16px;height:36px}",
    ".bls-mn{font:400 12px/16px Roboto;color:var(--g-500);font-variant-numeric:tabular-nums}",
    ".bls-go{position:relative;flex:none;width:36px;height:36px;margin-right:-4px;padding:0;border:1px solid var(--g-200);border-radius:50%;background:#fff;color:var(--brand-600);display:grid;place-items:center;cursor:pointer}",
    ".bls-go::after{content:'';position:absolute;inset:-5px}.bls-go svg{width:14px;height:14px;margin-left:2px}.bls-go:active{background:var(--g-50)}",
    /* See all: the same icon in a row */
    ".bls-ls{display:flex;flex-direction:column}.bls-r{display:flex;align-items:center;gap:16px;width:100%;min-height:64px;padding:12px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".bls-r:first-child{border-top:0}.bls-r .ic{flex:none;width:40px;height:40px;border-radius:var(--r-md);border:1px solid var(--g-200);display:grid;place-items:center;color:var(--in-600)}.bls-r .ic svg{width:28px;height:28px}",
    ".bls-r .t{flex:1;min-width:0}.bls-r .tt{display:block;font:600 14px/20px Roboto}.bls-r .td{display:block;margin-top:2px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".bls-r .rt{display:inline-flex;align-items:center;gap:4px;font:400 12px/16px Roboto;color:var(--g-500)}.bls-r .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".bls-sl{margin:0 0 8px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  css.textContent += ".bls-v *{vector-effect:non-scaling-stroke}";
  document.head.appendChild(css);

  function card(b, B) {
    var t = document.createElement("div");
    t.className = "bls-t"; t.setAttribute("role", "button"); t.tabIndex = 0; t.setAttribute("data-blinfo", b.key);
    t.setAttribute("aria-label", b.name + ", good for " + FOR[b.key].toLowerCase() + ", " + b.min + " minutes. How it works");
    t.innerHTML = '<div class="bls-top"><span class="bls-ic">' + svg(b.key) + '</span>' + (B.state === "plan" && b.inPlan ? '<span class="bls-in">In your plan</span>' : "") + '</div>' +
      '<div class="bls-for">' + FOR[b.key] + '</div><div class="bls-n">' + nm(b) + '</div>' +
      '<div class="bls-f"><span class="bls-mn">' + b.min + ' min</span><button class="bls-go" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '">' + PLAY + '</button></div>';
    return t;
  }

  function all(B) {
    var html = '<p class="bls-sl">Tap one to see how it goes, or start it from there.</p><div class="bls-ls">' + B.list.map(function (b) {
      return '<button class="bls-r" data-blinfo="' + b.key + '"><span class="ic">' + svg(b.key) + '</span><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + FOR[b.key] + ' · ' + b.pat +
        (B.state === "plan" && b.inPlan ? ' · <span style="color:var(--in-700)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    }).join("") + '</div>';
    if (window.GFOpenSheet) window.GFOpenSheet("blsAll", "Breathing exercises", html);
  }

  BLIB.add("s", {
    render: function (host, B) {
      host.className = "gut sect";
      var intro = B.state === "noplan" ? "Use any of these while your coach sets up your plan."
        : B.state === "free" ? "Start one whenever you need a pause."
        : "Start one whenever you need a pause, in your plan or not.";
      host.innerHTML = '<div class="bls-hd"><h2 class="gf-h">Breathing exercises</h2><button class="bls-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="bls-intro">' + intro + '</p><div class="bls-rail"></div>';
      var rail = host.querySelector(".bls-rail");
      B.list.forEach(function (b) { rail.appendChild(card(b, B)); });
      host.querySelector(".bls-all").onclick = function (e) { e.stopPropagation(); all(B); };
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("bls-t")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
