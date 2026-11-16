/* "All breathing exercises", variant w: Static rhythm bars.
   Each card writes one breath as a still notation: a row of rounded bars, one per phase, as long as its seconds, on one
   shared scale across the rail, so 4-7-8 reads long and Pursed Lip short. In is solid indigo, hold is a dotted outline,
   out is light indigo; the seconds sit small above each bar. A legend under the intro says which is which. Cards use the
   plan card's look (indigo wash, indigo-tipped border, 2px hard shadow). The card opens the info sheet; the round play
   button starts it; "See all" lists all 7 with a smaller copy of the bars. Nothing here moves. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>';
  var INFO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><path d="M12 7.6v.1" stroke-width="2.4"/></svg>';
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };
  var GAP = 4;

  /* the notation: px per second is shared, so lengths compare across cards */
  function bars(b, pps, cls) {
    return '<div class="' + cls + '" aria-hidden="true">' + b.seq.map(function (x) {
      return '<span class="blw-s ' + x.k + '" style="width:' + Math.round(x.s * pps) + 'px"><i>' + x.s + '</i><u></u></span>';
    }).join("") + '</div>';
  }

  var css = document.createElement("style");
  css.textContent = [
    ".blw-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 4px}",
    ".blw-hd h2{margin:0;font:400 14px/16.8px Roboto;letter-spacing:.25px;color:var(--g-900)}",
    ".blw-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blw-all::after{content:'';position:absolute;inset:-6px -8px}.blw-all svg{width:18px;height:18px}",
    ".blw-intro{margin:0;font:400 12px/16px Roboto;color:var(--g-500)}",
    /* the legend */
    ".blw-lg{display:flex;align-items:center;gap:16px;margin:8px 0 12px;font:400 12px/16px Roboto;color:var(--g-600)}",
    ".blw-lg span{display:inline-flex;align-items:center;gap:6px}.blw-lg u{display:block;width:16px;height:8px;border-radius:4px;box-sizing:border-box}",
    ".blw-rail{display:flex;gap:12px;margin:0 calc(var(--gut) * -1);padding:4px var(--gut) 8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--gut);scrollbar-width:none}",
    ".blw-rail::-webkit-scrollbar{display:none}",
    ".blw-t{position:relative;flex:0 0 160px;height:220px;box-sizing:border-box;scroll-snap-align:start;display:flex;flex-direction:column;padding:16px;border-radius:16px;border:1px solid transparent;cursor:pointer;text-align:left;color:var(--g-900);" +
      "background:linear-gradient(180deg,var(--in-50) 0%,#fff 62%) padding-box,conic-gradient(from 0deg,var(--in-600) 0deg,var(--g-200) 43deg,var(--g-200) 317deg,var(--in-600) 360deg) border-box;" +
      "box-shadow:2px 3px 0 var(--g-200);transition:transform .18s var(--ease),box-shadow .18s var(--ease)}",
    ".blw-t:active{transform:translate(1px,1px);box-shadow:1px 2px 0 var(--g-200)}",
    ".blw-top{display:flex;align-items:center;justify-content:space-between;height:20px;font:500 12px/16px Roboto;color:var(--in-700);font-variant-numeric:tabular-nums}",
    ".blw-i{width:20px;height:20px;margin-right:-4px;color:var(--g-400)}.blw-i svg{width:20px;height:20px;display:block}",
    /* a phase: its number over its bar */
    ".blw-row{display:flex;gap:" + GAP + "px;align-items:flex-end;height:32px;margin-top:12px}",
    ".blw-s{flex:none;display:flex;flex-direction:column;align-items:center;gap:4px}",
    ".blw-s i{font:500 11px/12px Roboto;font-style:normal;color:var(--in-700);font-variant-numeric:tabular-nums}",
    ".blw-s u{display:block;width:100%;height:12px;border-radius:6px;box-sizing:border-box}",
    ".blw-s.in u,.blw-lg .in{background:var(--in-600)}",
    ".blw-s.hold u,.blw-lg .hold{border:1.5px dashed var(--in-400);background:#fff}.blw-s.hold i{color:var(--in-400)}",
    ".blw-s.out u,.blw-lg .out{background:var(--in-200)}",
    ".blw-n{margin-top:12px;font:600 14px/20px Roboto;text-wrap:balance}",
    ".blw-p{margin-top:2px;font:400 12px/16px Roboto;color:var(--g-500);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".blw-ft{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:8px;height:40px}",
    ".blw-m{position:relative;display:block;font:500 12px/16px Roboto;color:var(--g-600);font-variant-numeric:tabular-nums}",
    ".blw-in{position:absolute;left:0;bottom:100%;margin-bottom:4px;white-space:nowrap;display:inline-flex;align-items:center;gap:4px;font:500 11px/16px Roboto;color:var(--ok-600)}.blw-in::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--ok-500)}",
    ".blw-pl{position:relative;flex:none;width:40px;height:40px;border:0;padding:0;border-radius:50%;background:var(--in-600);color:#fff;display:grid;place-items:center;cursor:pointer}",
    ".blw-pl::after{content:'';position:absolute;inset:-4px}.blw-pl svg{width:18px;height:18px;margin-left:2px}",
    /* See all */
    ".blw-r{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;padding:8px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".blw-r:first-child{border-top:0}.blw-r .bx{flex:none;width:84px}",
    ".blw-mini{display:flex;gap:2px;align-items:flex-end}.blw-mini .blw-s{gap:2px}.blw-mini .blw-s i{font-size:10px;line-height:12px}.blw-mini .blw-s u{height:8px;border-radius:4px}.blw-mini .blw-s.hold u{border-width:1px}",
    ".blw-r .t{flex:1;min-width:0}.blw-r .tt{display:block;font:600 14px/20px Roboto}.blw-r .td{display:block;margin-top:2px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blw-r .rt{display:inline-flex;align-items:center;gap:4px;font:500 12px/20px Roboto;color:var(--g-500)}.blw-r .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".blw-sl{margin:0 0 8px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  document.head.appendChild(css);

  /* one short line on what it is for, so it never wraps on the card */
  var FOR = { coherent: "Calm and focus", sleep: "Falling asleep", box: "Focus under stress", exhale: "Calming down", belly: "Calm and digestion", hum: "Quietening a busy mind", pursed: "Easier breathing" };
  var good = function (b) { return FOR[b.key] || b.good.join(", "); };

  function card(b, pps, B) {
    var t = document.createElement("div");
    t.className = "blw-t"; t.setAttribute("role", "button"); t.tabIndex = 0; t.setAttribute("data-blinfo", b.key);
    t.setAttribute("aria-label", b.name + ", " + b.pat + ", " + b.min + " minutes. How it works");
    t.innerHTML = '<div class="blw-top"><span>One breath, ' + b.cycle + ' s</span><span class="blw-i" aria-hidden="true">' + INFO + '</span></div>' +
      bars(b, pps, "blw-row") + '<div class="blw-n">' + nm(b) + '</div><div class="blw-p">' + good(b) + '</div>' +
      '<div class="blw-ft"><span class="blw-m"><span>' + b.min + ' min</span>' + (B.state === "plan" && b.inPlan ? '<span class="blw-in">In your plan</span>' : "") + '</span>' +
      '<button class="blw-pl" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '">' + PLAY + '</button></div>';
    return t;
  }

  function all(B, max) {
    var pps = (84 - 3 * 2) / max;
    var html = '<p class="blw-sl">Each bar is one part of a breath, as long as its seconds.</p><div>' + B.list.map(function (b) {
      return '<button class="blw-r" data-blinfo="' + b.key + '"><span class="bx">' + bars(b, pps, "blw-mini") + '</span><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + b.pat +
        (B.state === "plan" && b.inPlan ? ' · <span style="color:var(--ok-600)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    }).join("") + '</div>';
    if (window.GFOpenSheet) window.GFOpenSheet("blwAll", "Breathing exercises", html);
  }

  BLIB.add("w", {
    render: function (host, B) {
      host.className = "gut sect";
      var intro = B.state === "noplan" ? "Use any of these while your coach sets up your plan."
        : B.state === "free" ? "Start one whenever you need a pause."
        : "Start one whenever you need a pause, in your plan or not.";
      host.innerHTML = '<div class="blw-hd"><h2>Breathing exercises</h2><button class="blw-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="blw-intro">' + intro + '</p><div class="blw-lg" aria-hidden="true"><span><u class="in"></u>In</span><span><u class="hold"></u>Hold</span><span><u class="out"></u>Out</span></div><div class="blw-rail"></div>';
      /* one scale for the rail: the longest breath fills the card's inner width */
      var mx = Math.max.apply(null, B.list.map(function (b) { return b.cycle; })), pps = (128 - 3 * GAP) / mx;
      var rail = host.querySelector(".blw-rail");
      B.list.forEach(function (b) { rail.appendChild(card(b, pps, B)); });
      host.querySelector(".blw-all").onclick = function (e) { e.stopPropagation(); all(B, mx); };
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("blw-t")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B, mx);
    }
  });
})();
