/* "All breathing exercises", variant m: Indigo glass.
   The score contributors' glass tile (Figma 6684:3223: frosted white, a 1px border with a coloured tip, the 2px 3px hard
   shadow, radius 16) moved into indigo: two soft blurred blobs, indigo and lavender, glow through the frost, a little
   differently on each tile. Each tile carries a drawn glyph for the exercise on a glass disc, the name, and the pattern
   written as small numerals over the words (4 in, 7 hold, 8 out), so the rhythm reads at a glance without moving.
   The play disc starts it; the rest of the tile opens the info sheet. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>';
  /* glyphs on a 32 grid; the closed shapes take a pale indigo fill so they sit on the glass as solid little objects */
  var G = {
    coherent: '<path d="M3.5 16c2.1-5.3 4.2-8 6.25-8s4.15 2.7 6.25 8 4.2 8 6.25 8 4.15-2.7 6.25-8"/>',
    sleep: '<path class="f" d="M24.5 19.6A9.5 9.5 0 0 1 12.4 7.5 9.5 9.5 0 1 0 24.5 19.6z"/><path d="M22 6v4M20 8h4"/>',
    box: '<rect class="f" x="7" y="7" width="18" height="18" rx="3.5"/><circle cx="7" cy="12" r="1.8" fill="currentColor" stroke="none"/>',
    exhale: '<path d="M4 22.5c2.5 0 3.5-12 6.5-12 4.5 0 9 12 17.5 12"/>',
    belly: '<circle class="f" cx="12.5" cy="6" r="2.8"/><path d="M10.6 10.6c-1.4 4.4-1.8 8.8-1 13.4M14.6 10.6c.3 1.8.6 3 1.2 4 3.8 1.4 5.2 3.6 5.2 5.6 0 1.8-1.4 3.4-4 3.8M9.6 24H27"/><path d="M19 13.4c3.4 1.4 5.4 3.8 5.4 6.6" stroke-dasharray="1.6 2.4"/>',
    hum: '<path class="f" d="M12.6 13.8c-2.3-3.8-1.5-7 1.3-7s3.1 3.4.6 7M16.8 13.8c2.5-3.6 5.7-4.4 7.2-2.7s-.4 4.2-5 5.4"/><ellipse class="f" cx="15" cy="19.5" rx="9" ry="5.8"/><path d="M13 14v11M17.8 14v11"/><path d="M24 19.5h2"/><circle cx="9.2" cy="18.4" r=".9" fill="currentColor" stroke="none"/>',
    pursed: '<path class="f" d="M6 16.5c2.4-4.3 5-6.4 7.3-5.6.9.3 1.6 1.6 2.7 1.6s1.8-1.3 2.7-1.6c2.3-.8 4.9 1.3 7.3 5.6c-1.8 4.4-5.6 6.4-10 6.4S7.8 20.9 6 16.5z"/><path d="M6 16.5c3.6.8 6.9 1 10 1s6.4-.2 10-1"/>'
  };
  /* the two blobs behind each tile: where the indigo sits, and which lavender or sky joins it */
  var TINT = { coherent: ["#A4BCFD", "#DDD6FE", "10%"], sleep: ["#8098F9", "#D9D6FE", "50%"], box: ["#A4BCFD", "#B9E6FE", "20%"], exhale: ["#C3B5FD", "#C7D7FE", "60%"],
    belly: ["#A4BCFD", "#CCFBEF", "30%"], hum: ["#C3B5FD", "#F6D0FE", "70%"], pursed: ["#7CD4FD", "#C7D7FE", "40%"] };
  var WORD = { in: "in", hold: "hold", out: "out" };
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };
  var glyph = function (k) { return '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="blm-v">' + (k === "hum" || k === "pursed" ? '<g transform="translate(16 16) scale(1.12) translate(-16 -16)">' + G[k] + '</g>' : G[k]) + '</svg>'; };
  function notation(b) {
    return b.seq.map(function (x) { return '<span class="c"><b>' + x.s + '</b><i>' + (b.key === "hum" && x.k === "out" ? "hum" : WORD[x.k]) + '</i></span>'; }).join("");
  }

  var css = document.createElement("style");
  css.textContent = [
    ".blm-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 4px}.blm-hd h2{margin:0}",
    ".blm-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blm-all::after{content:'';position:absolute;inset:-6px -8px}.blm-all svg{width:18px;height:18px}",
    ".blm-intro{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blm-rail{display:flex;gap:12px;margin:0 calc(var(--gut) * -1);padding:4px var(--gut) 8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--gut);scrollbar-width:none}",
    ".blm-rail::-webkit-scrollbar{display:none}",
    ".blm-t{position:relative;isolation:isolate;overflow:hidden;flex:0 0 160px;scroll-snap-align:start;display:flex;flex-direction:column;padding:16px;border-radius:var(--r-lg);border:1px solid transparent;cursor:pointer;text-align:left;color:var(--g-900);" +
      "background:linear-gradient(#fff,#fff) padding-box,conic-gradient(from 0deg,var(--in-600) 0deg,var(--g-300) 45deg,var(--g-300) 315deg,var(--in-600) 360deg) border-box;box-shadow:2px 3px 0 var(--g-300);transition:transform .18s var(--ease),box-shadow .18s var(--ease)}",
    ".blm-t:active{transform:translate(1px,1px);box-shadow:1px 2px 0 var(--g-300)}",
    /* the blobs, and the frost laid over them */
    ".blm-t::before{content:'';position:absolute;z-index:-2;inset:0;background:radial-gradient(64% 44% at var(--bx) 4%,var(--b1),transparent 74%),radial-gradient(72% 46% at 92% 100%,var(--b2),transparent 76%);filter:blur(12px)}",
    ".blm-t::after{content:'';position:absolute;z-index:-1;inset:0;background:linear-gradient(180deg,rgb(255 255 255 / .3),rgb(255 255 255 / .55) 60%,rgb(255 255 255 / .4))}",
    ".blm-top{display:flex;align-items:flex-start;justify-content:space-between}",
    ".blm-g{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;color:var(--in-700);background:rgb(255 255 255 / .7);box-shadow:inset 0 0 0 1px rgb(255 255 255 / .9),0 1px 2px rgb(53 56 205 / .08)}",
    ".blm-g svg{width:28px;height:28px}.blm-g .f{fill:var(--in-100)}",
    ".blm-go{position:relative;flex:none;width:36px;height:36px;margin:-2px -4px 0 0;padding:0;border:0;border-radius:50%;background:rgb(255 255 255 / .85);color:var(--brand-600);display:grid;place-items:center;cursor:pointer;box-shadow:0 0 0 1px var(--g-200)}",
    ".blm-go::after{content:'';position:absolute;inset:-5px}.blm-go svg{width:14px;height:14px;margin-left:2px}.blm-go:active{background:#fff}",
    ".blm-n{margin-top:16px;min-height:40px;display:flex;align-items:flex-end;font:600 14px/20px Roboto;text-wrap:balance}",
    ".blm-pt{display:flex;gap:12px;margin-top:8px}",
    ".blm-pt .c{display:flex;flex-direction:column;align-items:flex-start}",
    ".blm-pt b{font:500 18px/22px Roboto;color:var(--in-700);font-variant-numeric:tabular-nums}",
    ".blm-pt i{font:400 11px/14px Roboto;font-style:normal;color:var(--g-500)}",
    ".blm-f{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:12px;padding-top:8px;height:24px;border-top:1px solid rgb(68 76 231 / .1);box-sizing:content-box}",
    ".blm-mn{font:400 12px/16px Roboto;color:var(--g-500);font-variant-numeric:tabular-nums}",
    ".blm-in{display:inline-flex;align-items:center;gap:4px;font:500 11px/16px Roboto;color:var(--in-700);white-space:nowrap}.blm-in::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--in-500)}",
    /* See all */
    ".blm-ls{display:flex;flex-direction:column}.blm-r{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;padding:12px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".blm-r:first-child{border-top:0}.blm-r .ic{flex:none;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;color:var(--in-700);background:radial-gradient(circle at 30% 20%,var(--b1),var(--in-25) 80%)}.blm-r .ic svg{width:24px;height:24px}.blm-r .ic .f{fill:#fff}",
    ".blm-r .t{flex:1;min-width:0}.blm-r .tt{display:block;font:600 14px/20px Roboto}.blm-r .td{display:block;margin-top:2px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blm-r .rt{display:inline-flex;align-items:center;gap:4px;font:400 12px/16px Roboto;color:var(--g-500)}.blm-r .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".blm-sl{margin:0 0 8px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  css.textContent += ".blm-v *{vector-effect:non-scaling-stroke}";
  document.head.appendChild(css);

  function tile(b, B) {
    var t = document.createElement("div"), c = TINT[b.key];
    t.className = "blm-t"; t.setAttribute("role", "button"); t.tabIndex = 0; t.setAttribute("data-blinfo", b.key);
    t.style.cssText = "--b1:" + c[0] + ";--b2:" + c[1] + ";--bx:" + c[2];
    t.setAttribute("aria-label", b.name + ", " + b.pat + ", " + b.min + " minutes. How it works");
    t.innerHTML = '<div class="blm-top"><span class="blm-g">' + glyph(b.key) + '</span><button class="blm-go" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '">' + PLAY + '</button></div>' +
      '<div class="blm-n">' + nm(b) + '</div><div class="blm-pt" aria-hidden="true">' + notation(b) + '</div>' +
      '<div class="blm-f"><span class="blm-mn">' + b.min + ' min</span>' + (B.state === "plan" && b.inPlan ? '<span class="blm-in">In your plan</span>' : "") + '</div>';
    return t;
  }

  function all(B) {
    var html = '<p class="blm-sl">Tap one to see how it goes, or start it from there.</p><div class="blm-ls">' + B.list.map(function (b) {
      return '<button class="blm-r" data-blinfo="' + b.key + '"><span class="ic" style="--b1:' + TINT[b.key][0] + '">' + glyph(b.key) + '</span><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + b.pat +
        (B.state === "plan" && b.inPlan ? ' · <span style="color:var(--in-700)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    }).join("") + '</div>';
    if (window.GFOpenSheet) window.GFOpenSheet("blmAll", "Breathing exercises", html);
  }

  BLIB.add("m", {
    render: function (host, B) {
      host.className = "gut sect";
      var intro = B.state === "noplan" ? "Use any of these while your coach sets up your plan."
        : B.state === "free" ? "Start one whenever you need a pause."
        : "Start one whenever you need a pause, in your plan or not.";
      host.innerHTML = '<div class="blm-hd"><h2 class="gf-h">Breathing exercises</h2><button class="blm-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="blm-intro">' + intro + '</p><div class="blm-rail"></div>';
      var rail = host.querySelector(".blm-rail");
      B.list.forEach(function (b) { rail.appendChild(tile(b, B)); });
      host.querySelector(".blm-all").onclick = function (e) { e.stopPropagation(); all(B); };
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("blm-t")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
