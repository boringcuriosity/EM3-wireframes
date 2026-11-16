/* "All breathing exercises", variant n: Big numbers.
   Typographic cards where the pattern is the art: the seconds of one breath set large in indigo ink ("4 7 8", "5 5"),
   each with a tiny in / hold / out under it, the name below. Hold numbers sit lighter so the rhythm reads at a glance.
   White cards with GoodFlip's 1px border and 2px 3px hard shadow, radius 16, in a snapping rail that starts on the gutter
   and peeks the next card. The card opens the info sheet; the round play button starts it; "See all" lists all 7. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>';
  var INFO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><path d="M12 7.6v.1" stroke-width="2.4"/></svg>';
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };
  var word = function (x) { return x.k === "out" && /hum/i.test(x.word) ? "hum" : x.k; };

  var css = document.createElement("style");
  css.textContent = [
    ".bln-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 4px}",
    ".bln-hd h2{margin:0;font:400 14px/16.8px Roboto;letter-spacing:.25px;color:var(--g-900)}",
    ".bln-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".bln-all::after{content:'';position:absolute;inset:-6px -8px}.bln-all svg{width:18px;height:18px}",
    ".bln-intro{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".bln-rail{display:flex;gap:12px;margin:0 calc(var(--gut) * -1);padding:4px var(--gut) 8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--gut);scrollbar-width:none}",
    ".bln-rail::-webkit-scrollbar{display:none}",
    ".bln-t{position:relative;flex:0 0 160px;height:224px;box-sizing:border-box;scroll-snap-align:start;display:flex;flex-direction:column;padding:16px;border-radius:16px;border:1px solid var(--g-200);background:#fff;box-shadow:2px 3px 0 var(--g-200);cursor:pointer;text-align:left;color:var(--g-900);transition:transform .18s var(--ease),box-shadow .18s var(--ease)}",
    ".bln-t:active{transform:translate(1px,1px);box-shadow:1px 2px 0 var(--g-200)}",
    ".bln-top{display:flex;align-items:center;justify-content:space-between;height:20px;font:500 12px/16px Roboto;color:var(--g-500);font-variant-numeric:tabular-nums}",
    ".bln-i{width:20px;height:20px;margin-right:-4px;color:var(--g-400)}.bln-i svg{width:20px;height:20px;display:block}",
    /* the numerals: one column per phase, the number over its tiny word */
    ".bln-num{display:flex;gap:10px;align-items:flex-start;height:64px;margin-top:8px}",
    ".bln-c{display:flex;flex-direction:column;align-items:center;min-width:24px}",
    ".bln-c b{font:300 44px/48px Roboto;letter-spacing:-1px;font-variant-numeric:tabular-nums;color:var(--in-700)}.bln-c.hold b{color:var(--in-300)}",
    ".bln-c span{font:500 11px/16px Roboto;letter-spacing:.3px;color:var(--g-500)}.bln-c.hold span{color:var(--g-400)}",
    ".bln-n{margin-top:12px;font:600 14px/20px Roboto;min-height:40px;text-wrap:balance}",
    ".bln-ft{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:40px}",
    ".bln-in{display:inline-flex;align-items:center;gap:4px;font:500 11px/16px Roboto;color:var(--ok-600)}.bln-in::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--ok-500)}",
    ".bln-pl{position:relative;flex:none;width:40px;height:40px;border:0;padding:0;border-radius:50%;background:var(--in-50);color:var(--in-600);display:grid;place-items:center;cursor:pointer}",
    ".bln-pl::after{content:'';position:absolute;inset:-4px}.bln-pl svg{width:18px;height:18px;margin-left:2px}",
    /* See all */
    ".bln-ls{display:flex;flex-direction:column}.bln-r{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;padding:8px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".bln-r:first-child{border-top:0}.bln-r .g{flex:none;width:76px;white-space:nowrap;font:300 20px/28px Roboto;color:var(--in-700);font-variant-numeric:tabular-nums;letter-spacing:.5px}",
    ".bln-r .t{flex:1;min-width:0}.bln-r .tt{display:block;font:600 14px/20px Roboto}.bln-r .td{display:block;margin-top:2px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".bln-r .rt{display:inline-flex;align-items:center;gap:4px;font:500 12px/20px Roboto;color:var(--g-500)}.bln-r .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".bln-sl{margin:0 0 8px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  document.head.appendChild(css);

  function card(b, B) {
    var t = document.createElement("div");
    t.className = "bln-t"; t.setAttribute("role", "button"); t.tabIndex = 0; t.setAttribute("data-blinfo", b.key);
    t.setAttribute("aria-label", b.name + ", " + b.pat + ", " + b.min + " minutes. How it works");
    t.innerHTML = '<div class="bln-top"><span>' + b.min + ' min</span><span class="bln-i" aria-hidden="true">' + INFO + '</span></div>' +
      '<div class="bln-num" aria-hidden="true">' + b.seq.map(function (x) { return '<span class="bln-c ' + x.k + '"><b>' + x.s + '</b><span>' + word(x) + '</span></span>'; }).join("") + '</div>' +
      '<div class="bln-n">' + nm(b) + '</div>' +
      '<div class="bln-ft"><span>' + (B.state === "plan" && b.inPlan ? '<span class="bln-in">In your plan</span>' : "") + '</span>' +
      '<button class="bln-pl" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '">' + PLAY + '</button></div>';
    return t;
  }

  function all(B) {
    var html = '<p class="bln-sl">Tap one to see how it goes, or start it from there.</p><div class="bln-ls">' + B.list.map(function (b) {
      return '<button class="bln-r" data-blinfo="' + b.key + '"><span class="g">' + b.seq.map(function (x) { return x.s; }).join(" ") + '</span><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + b.pat +
        (B.state === "plan" && b.inPlan ? ' · <span style="color:var(--ok-600)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    }).join("") + '</div>';
    if (window.GFOpenSheet) window.GFOpenSheet("blnAll", "Breathing exercises", html);
  }

  BLIB.add("n", {
    render: function (host, B) {
      host.className = "gut sect";
      var intro = B.state === "noplan" ? "Use any of these while your coach sets up your plan."
        : B.state === "free" ? "Start one whenever you need a pause."
        : "Start one whenever you need a pause, in your plan or not.";
      host.innerHTML = '<div class="bln-hd"><h2>Breathing exercises</h2><button class="bln-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="bln-intro">' + intro + '</p><div class="bln-rail"></div>';
      var rail = host.querySelector(".bln-rail");
      B.list.forEach(function (b) { rail.appendChild(card(b, B)); });
      host.querySelector(".bln-all").onclick = function (e) { e.stopPropagation(); all(B); };
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("bln-t")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
