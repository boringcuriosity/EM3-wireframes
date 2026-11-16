/* "All breathing exercises", variant c: Glass tile rail.
   A horizontal rail of glass tiles in the look of GoodFlip's score contributors (Figma 6684:3223): a frosted white over
   a soft gold glow, a 1px border with a gold tip, the 2px 3px hard shadow, radius 16. Each tile carries the exercise's
   live visual (with a play mark, it starts the exercise), the name and the pattern. The tile opens the info sheet.
   Short at the end of the screen: about two and a half tiles show, the peek says there is more, and "See all" opens
   every exercise as a list in a sheet. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>';
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };

  var css = document.createElement("style");
  css.textContent = [
    ".blc-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 4px}",
    ".blc-hd h2{margin:0;font:400 14px/16.8px Roboto;letter-spacing:.25px;color:var(--g-900)}",
    ".blc-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blc-all::after{content:'';position:absolute;inset:-6px -8px}.blc-all svg{width:18px;height:18px}",
    ".blc-intro{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    /* the rail runs edge to edge and starts on the gutter; tiles snap */
    ".blc-rail{display:flex;gap:12px;margin:0 calc(var(--gut) * -1);padding:4px var(--gut) 8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--gut);scrollbar-width:none}",
    ".blc-rail::-webkit-scrollbar{display:none}",
    /* the glass tile */
    ".blc-t{position:relative;isolation:isolate;overflow:hidden;flex:0 0 148px;scroll-snap-align:start;display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:12px 12px 14px;border-radius:16px;border:1px solid transparent;cursor:pointer;text-align:left;color:var(--g-900);" +
      "background:linear-gradient(180deg,rgb(255 255 255 / .4),rgb(255 255 255 / .9)) padding-box,linear-gradient(#fff,#fff) padding-box,conic-gradient(from 0deg,var(--gold-600) 0deg,var(--g-300) 45deg,var(--g-300) 315deg,var(--gold-600) 360deg) border-box;" +
      "box-shadow:2px 3px 0 var(--g-300);transition:transform .18s var(--ease),box-shadow .18s var(--ease)}",
    ".blc-t:active{transform:translate(1px,1px);box-shadow:1px 2px 0 var(--g-300)}",
    /* the glow behind the glass, as the contributors' blurred blob, in Mind's gold */
    ".blc-t::before{content:'';position:absolute;z-index:-1;left:-30px;top:-40px;width:150px;height:120px;border-radius:50%;background:var(--gold-200);filter:blur(30px);opacity:.75}",
    ".blc-top{display:flex;align-items:flex-start;justify-content:space-between;width:100%}",
    ".blc-pl{position:relative;flex:none;width:56px;height:56px;border:0;padding:0;border-radius:50%;background:none;cursor:pointer}",
    ".blc-pl::after{content:'';position:absolute;inset:-4px}",
    ".blc-pl .bl-mini{background:radial-gradient(circle,#fff 35%,var(--gold-50));box-shadow:0 0 0 1px var(--gold-200)}",
    ".blc-pl .pb{position:absolute;right:-4px;bottom:-4px;width:22px;height:22px;border-radius:50%;background:#fff;color:var(--brand-600);display:grid;place-items:center;box-shadow:0 0 0 1px var(--g-200)}",
    ".blc-pl .pb svg{width:12px;height:12px;margin-left:1px}",
    ".blc-mn{font:400 12px/16px Roboto;color:var(--g-500);font-variant-numeric:tabular-nums}",
    ".blc-n{font:600 14px/20px Roboto;min-height:40px;display:flex;align-items:flex-end;text-wrap:balance}",
    ".blc-p{margin-top:-6px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blc-in{display:inline-flex;align-items:center;gap:4px;font:500 11px/16px Roboto;color:var(--ok-600)}.blc-in::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--ok-500)}",
    ".blc-t .blc-ft{min-height:16px;margin-top:-4px}",
    /* the See all sheet: the plan row, visual first */
    ".blc-ls{display:flex;flex-direction:column}.blc-r{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;padding:8px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".blc-r:first-child{border-top:0}.blc-r .bl-mini{box-shadow:0 0 0 1px var(--gold-200);background:radial-gradient(circle,#fff 35%,var(--gold-50))}",
    ".blc-r .t{flex:1;min-width:0}.blc-r .tt{display:block;font:600 14px/20px Roboto}.blc-r .td{display:block;margin-top:2px;font:400 12px/18px Roboto;color:var(--g-500)}",
    ".blc-r .rt{display:inline-flex;align-items:center;gap:4px;font:500 12px/20px Roboto;color:var(--g-500)}.blc-r .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".blc-sl{margin:0 0 8px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  document.head.appendChild(css);

  function tile(b, B) {
    var t = document.createElement("div");
    t.className = "blc-t"; t.setAttribute("role", "button"); t.tabIndex = 0;
    t.setAttribute("data-blinfo", b.key);
    t.setAttribute("aria-label", b.name + ", " + b.pat + ", " + b.min + " minutes. How it works");
    t.innerHTML = '<div class="blc-top"><button class="blc-pl" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '"><span class="pb">' + PLAY + '</span></button><span class="blc-mn">' + b.min + ' min</span></div>' +
      '<div class="blc-n">' + nm(b) + '</div><div class="blc-p">' + b.pat + '</div>' +
      (B.state === "plan" ? '<div class="blc-ft">' + (b.inPlan ? '<span class="blc-in">In your plan</span>' : "") + '</div>' : "");
    var pl = t.querySelector(".blc-pl"); pl.insertBefore(B.mini(b.key, 56), pl.firstChild);
    return t;
  }

  function all(B) {
    var html = '<p class="blc-sl">Tap one to see how it goes, or start it from there.</p><div class="blc-ls">' + B.list.map(function (b) {
      return '<button class="blc-r" data-blinfo="' + b.key + '"><i data-k="' + b.key + '"></i><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + b.pat +
        (B.state === "plan" && b.inPlan ? ' · <span style="color:var(--ok-600)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    }).join("") + '</div>';
    var el = window.GFOpenSheet ? window.GFOpenSheet("blcAll", "Breathing exercises", html) : null;
    if (el) el.querySelectorAll("i[data-k]").forEach(function (i) { i.replaceWith(B.mini(i.dataset.k, 40)); });
  }

  BLIB.add("c", {
    render: function (host, B) {
      host.className = "gut sect";
      var intro = B.state === "noplan" ? "Use any of these while your coach sets up your plan."
        : B.state === "free" ? "Start one whenever you need a pause."
        : "Start one whenever you need a pause, in your plan or not.";
      host.innerHTML = '<div class="blc-hd"><h2>Breathing exercises</h2><button class="blc-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="blc-intro">' + intro + '</p><div class="blc-rail"></div>';
      var rail = host.querySelector(".blc-rail");
      B.list.forEach(function (b) { rail.appendChild(tile(b, B)); });
      host.querySelector(".blc-all").onclick = function (e) { e.stopPropagation(); all(B); };
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("blc-t")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
