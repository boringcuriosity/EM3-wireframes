/* "All breathing exercises", variant r: Ticket stubs.
   Each exercise is a little pass in a sideways rail: indigo ink on white, a perforated line with notches cut top and
   bottom, and a pale lavender stub. The main part carries the drawn glyph, the name and what it is good for; the stub
   reads the pattern as a column (In 4, Hold 7, Out 8) with the minutes under it, so the rhythm is the thing you compare.
   The ticket opens the info sheet; the stub's minutes button starts it, like tearing off the stub. "See all" lists every exercise in a sheet. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>';
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };

  /* line glyphs on a 24 grid, drawn to the same visual weight */
  var G = {
    coherent: '<path d="M2.5 12q2.375-7 4.75 0t4.75 0t4.75 0t4.75 0"/>',
    sleep: '<path d="M19 14.6A7.6 7.6 0 1 1 10.4 5a6 6 0 0 0 8.6 9.6z"/><path d="M17.5 3.5v3M16 5h3"/>',
    box: '<rect x="4.5" y="4.5" width="15" height="15" rx="3"/><circle cx="4.5" cy="4.5" r="1.7" fill="currentColor" stroke="none"/>',
    exhale: '<path d="M2 19C4.5 19 5.5 5 8.5 5S12.5 18.5 22 19"/>',
    belly: '<path d="M4 19h16"/><path d="M6.5 19c0-5 2.5-8 5.5-8s5.5 3 5.5 8"/><path d="M3.5 16c.8-5.5 4.2-9.5 8.5-9.5s7.7 4 8.5 9.5" stroke-dasharray="1.6 2.4"/>',
    hum: '<ellipse cx="10" cy="14" rx="6" ry="4.2"/><path d="M8.2 10.2v7.6M11.8 10.2v7.6"/><path d="M9.5 9.9C7.5 6.5 9 3.6 11.2 4.3c1.8.6 1.3 3.6-.7 5.7"/><path d="M11 9.9c1.4-3.4 4.8-4.4 5.6-2.6.6 1.4-1.6 3-4.6 3.1"/><path d="M19 12.5v3M21.5 11v6.4"/>',
    pursed: '<path d="M4 12c1.8-3.2 4-4.6 6-4 .8.3 1.3.8 2 .8s1.2-.5 2-.8c2-.6 4.2.8 6 4"/><path d="M4 12c1.6 3.2 4.6 5 8 5s6.4-1.8 8-5"/><path d="M8.5 12.2c1 .5 2.2.8 3.5.8s2.5-.3 3.5-.8"/>'
  };
  var glyph = function (k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + G[k] + '</svg>'; };
  var WORD = { in: "In", hold: "Hold", out: "Out" };
  var steps = function (b) { return b.seq.map(function (x) { return [x.word === "Hum" ? "Hum" : WORD[x.k], x.s]; }); };
  var NEED = { Breathless: "breathlessness", "Busy mind": "a busy mind" };
  var good = function (b) { var g = b.good[0]; return "Good for " + (NEED[g] || g.toLowerCase()); };

  var STUB = 96, NOTCH = 8;
  var css = document.createElement("style");
  css.textContent = [
    ".blr-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 4px}",
    ".blr-hd h2{margin:0;font:400 14px/16.8px Roboto;letter-spacing:.25px;color:var(--g-900)}",
    ".blr-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blr-all::after{content:'';position:absolute;inset:-6px -8px}.blr-all svg{width:18px;height:18px}",
    ".blr-intro{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blr-rail{display:flex;gap:12px;margin:0 calc(var(--gut) * -1);padding:4px var(--gut) 10px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--gut);scrollbar-width:none}",
    ".blr-rail::-webkit-scrollbar{display:none}",
    /* the ticket: the outline and the 2px hard shadow follow the cut shape, notches and all */
    ".blr-t{flex:0 0 calc((100% - 12px) / 1.25);min-width:0;scroll-snap-align:start;cursor:pointer;text-align:left;transition:transform .18s var(--ease);" +
      "filter:drop-shadow(1px 0 0 var(--in-200)) drop-shadow(-1px 0 0 var(--in-200)) drop-shadow(0 1px 0 var(--in-200)) drop-shadow(0 -1px 0 var(--in-200)) drop-shadow(2px 2px 0 var(--in-100))}",
    ".blr-t:active{transform:translate(1px,1px)}",
    ".blr-in{position:relative;display:flex;height:160px;border-radius:16px;background:#fff;" +
      "-webkit-mask:radial-gradient(circle at calc(100% - " + STUB + "px) 0," + "transparent " + NOTCH + "px,#000 " + (NOTCH + .5) + "px) top/100% 51% no-repeat,radial-gradient(circle at calc(100% - " + STUB + "px) 100%,transparent " + NOTCH + "px,#000 " + (NOTCH + .5) + "px) bottom/100% 51% no-repeat;" +
      "mask:radial-gradient(circle at calc(100% - " + STUB + "px) 0,transparent " + NOTCH + "px,#000 " + (NOTCH + .5) + "px) top/100% 51% no-repeat,radial-gradient(circle at calc(100% - " + STUB + "px) 100%,transparent " + NOTCH + "px,#000 " + (NOTCH + .5) + "px) bottom/100% 51% no-repeat}",
    /* main part */
    ".blr-m{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:space-between;padding:16px}",
    ".blr-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}",
    ".blr-g{flex:none;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;color:var(--in-600);background:linear-gradient(150deg,var(--in-50),var(--in-100))}",
    ".blr-g svg{width:24px;height:24px}",
    ".blr-tag{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 8px;border-radius:999px;background:var(--ok-50);font:500 11px/16px Roboto;color:var(--ok-600);white-space:nowrap}",
    ".blr-tag::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--ok-500)}",
        ".blr-tx{min-width:0;display:flex;flex-direction:column;gap:2px}",
    ".blr-n{font:600 16px/20px Roboto;color:#2D3282;text-wrap:balance}",
    ".blr-s{font:400 12px/16px Roboto;color:var(--g-500);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".blr-pl{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:4px;width:100%;height:32px;border:0;padding:0;border-radius:999px;background:var(--in-600);color:#fff;font:600 12px/16px Roboto;font-variant-numeric:tabular-nums;cursor:pointer;box-shadow:1px 2px 0 var(--in-200)}",
    ".blr-pl::after{content:'';position:absolute;inset:-6px -4px}.blr-pl svg{width:12px;height:12px}",
    /* the stub, behind a perforated line */
    ".blr-st{position:relative;flex:0 0 " + STUB + "px;display:flex;flex-direction:column;justify-content:space-between;padding:14px 12px 14px 14px;background:#F4F3FF}",
    ".blr-st::before{content:'';position:absolute;left:0;top:" + (NOTCH + 6) + "px;bottom:" + (NOTCH + 6) + "px;border-left:2px dotted var(--in-200)}",
    ".blr-pt{display:flex;flex-direction:column;gap:8px}",
    /* the same rhythm drawn as one static strip, each part as long as its seconds */
    ".blr-bar{display:flex;gap:2px;height:4px}.blr-bar i{border-radius:2px;background:var(--in-500)}.blr-bar i.hold{background:var(--in-200)}.blr-bar i.out{background:var(--in-300)}",
    ".blr-ph{display:grid;grid-template-columns:1fr auto;row-gap:2px;column-gap:8px;font-variant-numeric:tabular-nums}",
    ".blr-ph span{font:500 11px/16px Roboto;letter-spacing:.5px;text-transform:uppercase;color:var(--in-500)}",
    ".blr-ph b{font:600 15px/16px Roboto;color:#2D3282;text-align:right}",
        /* the See all sheet */
    ".blr-ls{display:flex;flex-direction:column}.blr-r{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;padding:8px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".blr-r:first-child{border-top:0}.blr-r .blr-g{width:40px;height:40px}",
    ".blr-r .t{flex:1;min-width:0}.blr-r .tt{display:block;font:600 14px/20px Roboto}.blr-r .td{display:block;margin-top:2px;font:400 12px/18px Roboto;color:var(--g-500)}",
    ".blr-r .rt{display:inline-flex;align-items:center;gap:4px;font:500 12px/20px Roboto;color:var(--g-500)}.blr-r .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".blr-sl{margin:0 0 8px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  document.head.appendChild(css);

  function ticket(b, B) {
    var t = document.createElement("div");
    t.className = "blr-t"; t.setAttribute("role", "button"); t.tabIndex = 0;
    t.setAttribute("data-blinfo", b.key);
    t.setAttribute("aria-label", b.name + ", " + b.pat + ", " + b.min + " minutes. How it works");
    t.innerHTML = '<div class="blr-in"><div class="blr-m"><div class="blr-top"><span class="blr-g">' + glyph(b.key) + '</span>' +
      (B.state === "plan" && b.inPlan ? '<span class="blr-tag">In your plan</span>' : "") + '</div>' +
      '<div class="blr-tx"><div class="blr-n">' + nm(b) + '</div><div class="blr-s">' + good(b) + '</div></div></div>' +
      '<div class="blr-st"><div class="blr-pt"><div class="blr-ph">' + steps(b).map(function (s) { return '<span>' + s[0] + '</span><b>' + s[1] + '</b>'; }).join("") + '</div>' +
      '<div class="blr-bar" aria-hidden="true">' + b.seq.map(function (x) { return '<i class="' + x.k + '" style="flex:' + x.s + '"></i>'; }).join("") + '</div></div>' +
      '<button class="blr-pl" data-blplay="' + b.key + '" aria-label="Start ' + b.name + ', ' + b.min + ' minutes">' + PLAY + b.min + ' min</button></div></div>';
    return t;
  }

  function all(B) {
    var html = '<p class="blr-sl">Tap one to see how it goes, or start it from there.</p><div class="blr-ls">' + B.list.map(function (b) {
      return '<button class="blr-r" data-blinfo="' + b.key + '"><span class="blr-g">' + glyph(b.key) + '</span><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + b.pat +
        (B.state === "plan" && b.inPlan ? ' · <span style="color:var(--ok-600)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    }).join("") + '</div>';
    if (window.GFOpenSheet) window.GFOpenSheet("blrAll", "Breathing exercises", html);
  }

  BLIB.add("r", {
    render: function (host, B) {
      host.className = "gut sect";
      var intro = B.state === "noplan" ? "Use any of these while your coach sets up your plan."
        : B.state === "free" ? "Start one whenever you need a pause."
        : "Start one whenever you need a pause, in your plan or not.";
      host.innerHTML = '<div class="blr-hd"><h2>Breathing exercises</h2><button class="blr-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="blr-intro">' + intro + '</p><div class="blr-rail"></div>';
      var rail = host.querySelector(".blr-rail");
      B.list.forEach(function (b) { rail.appendChild(ticket(b, B)); });
      host.querySelector(".blr-all").onclick = function (e) { e.stopPropagation(); all(B); };
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("blr-t")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
