/* "All breathing exercises", variant pb2: Glass cards.
   PB's glass, now one frosted card per exercise, standing on the white page. Behind each card sits a soft indigo glow
   (blurred, in the plan's indigo family), so the frosted surface has something to catch and the glass reads in light
   mode. On the glass: the exercise's line icon on a small clear disc, the name, the minutes and what it is for, and a
   white Start bar with green text, as Start is green across the app. The card opens the info sheet. Nothing moves. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>';
  /* the line icons from s2 (one 32 grid, optically centred) */
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
  /* the glow under each card: the same indigo family every time, the two pools nudged a little card to card */
  var GLOW = [[22, 22, 78, 84], [30, 16, 72, 90], [18, 30, 84, 78], [26, 20, 70, 86]];
  var glow = function (i) { var g = GLOW[i % GLOW.length];
    return "radial-gradient(52% 44% at " + g[0] + "% " + g[1] + "%,#8098F9 0%,rgb(128 152 249 / 0) 100%),radial-gradient(60% 50% at " + g[2] + "% " + g[3] + "%,#A4BCFD 0%,rgb(164 188 253 / 0) 100%),radial-gradient(70% 60% at 50% 55%,#E0EAFF 0%,rgb(224 234 255 / 0) 100%)"; };
  var svg = function (k) { return '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[k] + '</svg>'; };
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };

  var css = document.createElement("style");
  css.textContent = [
    ".blpb2-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 4px}.blpb2-hd h2{margin:0}",
    ".blpb2-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blpb2-all::after{content:'';position:absolute;inset:-6px -8px}.blpb2-all svg{width:18px;height:18px}",
    ".blpb2-intro{margin:0 0 4px;position:relative;z-index:1;font:400 12px/16px Roboto;color:var(--g-500)}",
    /* the rail: extra room above and below so the glow can spill past the glass without being clipped */
    ".blpb2-rail{display:flex;gap:12px;margin:-8px calc(var(--gut) * -1) -16px;padding:20px var(--gut) 32px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--gut);scrollbar-width:none}",
    ".blpb2-rail::-webkit-scrollbar{display:none}",
    ".blpb2-w{position:relative;isolation:isolate;flex:0 0 164px;scroll-snap-align:start}",
    ".blpb2-w::before{content:'';position:absolute;inset:14px 10px 10px;z-index:-1;border-radius:28px;background:var(--glow);filter:blur(12px)}",
    /* the glass */
    ".blpb2-c{position:relative;height:100%;display:flex;flex-direction:column;padding:16px;border-radius:var(--r-xl);cursor:pointer;text-align:left;color:var(--g-900);" +
      "background:linear-gradient(160deg,rgb(255 255 255 / .72) 0%,rgb(255 255 255 / .34) 100%);-webkit-backdrop-filter:blur(18px) saturate(1.5);backdrop-filter:blur(18px) saturate(1.5);" +
      "border:1px solid rgb(255 255 255 / .9);box-shadow:inset 0 1px 0 #fff,0 0 0 1px rgb(68 76 231 / .07),0 12px 24px -16px rgb(53 56 205 / .45);transition:transform .18s var(--ease),box-shadow .18s var(--ease)}",
    ".blpb2-c:active{transform:scale(.985)}.blpb2-c:focus-visible{outline:2px solid var(--in-600);outline-offset:2px}",
    ".blpb2-top{display:flex;align-items:center;justify-content:space-between;gap:4px;height:40px}",
    ".blpb2-ic{flex:none;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;color:var(--in-600);background:rgb(255 255 255 / .72);box-shadow:inset 0 0 0 1px #fff,0 2px 6px -2px rgb(53 56 205 / .2)}",
    ".blpb2-ic svg{display:block;width:26px;height:26px}",
    ".blpb2-in{display:inline-flex;align-items:center;height:24px;padding:0 8px;border-radius:var(--r-pill);background:rgb(255 255 255 / .72);box-shadow:inset 0 0 0 1px #fff;color:var(--in-700);font:500 12px/16px Roboto;white-space:nowrap}",
    ".blpb2-n{margin:4px 0 12px;height:44px;font:600 16px/22px Roboto;text-wrap:balance}",
    ".blpb2-m{margin-top:16px;font:400 12px/16px Roboto;color:var(--g-600);white-space:nowrap;font-variant-numeric:tabular-nums}",
    ".blpb2-go{position:relative;display:flex;align-items:center;justify-content:center;gap:4px;width:100%;height:40px;margin-top:auto;border:0;border-radius:var(--r-pill);cursor:pointer;" +
      "background:rgb(255 255 255 / .9);box-shadow:inset 0 0 0 1px #fff,0 2px 6px -2px rgb(53 56 205 / .18);font:600 14px/20px Roboto;color:var(--brand-600);transition:background .18s var(--ease)}",
    ".blpb2-go::after{content:'';position:absolute;inset:-2px 0}.blpb2-go svg{width:16px;height:16px}.blpb2-go:active{background:#fff}",
    /* See all: a little glass disc over the same glow */
    ".blpb2-ls{display:flex;flex-direction:column}.blpb2-r{display:flex;align-items:center;gap:12px;width:100%;min-height:72px;padding:12px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".blpb2-r:first-child{border-top:0}.blpb2-r .th{position:relative;isolation:isolate;flex:none;width:44px;height:44px;border-radius:var(--r-md);overflow:hidden;display:grid;place-items:center;color:var(--in-600);background:#fff}",
    ".blpb2-r .th::before{content:'';position:absolute;inset:-6px;z-index:-1;background:var(--glow);filter:blur(6px);opacity:.7}",
    ".blpb2-r .th::after{content:'';position:absolute;inset:0;z-index:-1;border-radius:inherit;background:rgb(255 255 255 / .45);box-shadow:inset 0 0 0 1px rgb(255 255 255 / .9)}.blpb2-r .th svg{width:26px;height:26px}",
    ".blpb2-r .t{flex:1;min-width:0}.blpb2-r .tt{display:block;font:600 14px/20px Roboto}.blpb2-r .td{display:block;margin-top:2px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blpb2-r .rt{display:inline-flex;align-items:center;gap:4px;font:400 12px/16px Roboto;color:var(--g-500);white-space:nowrap}.blpb2-r .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".blpb2-sl{margin:0 0 8px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  document.head.appendChild(css);

  function card(b, i, B) {
    var w = document.createElement("div"), plan = B.state === "plan" && b.inPlan;
    w.className = "blpb2-w"; w.style.setProperty("--glow", glow(i));
    w.innerHTML = '<div class="blpb2-c" role="button" tabindex="0" data-blinfo="' + b.key + '" aria-label="' + b.name + ', ' + b.min + ' minutes, good for ' + FOR[b.key].toLowerCase() + (plan ? ', in your plan' : '') + '. How it works">' +
      '<div class="blpb2-top"><span class="blpb2-ic">' + svg(b.key) + '</span>' + (plan ? '<span class="blpb2-in">In your plan</span>' : "") + '</div>' +
      '<div class="blpb2-m">' + b.min + ' min · ' + FOR[b.key] + '</div><div class="blpb2-n">' + nm(b) + '</div>' +
      '<button class="blpb2-go" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '">' + PLAY + 'Start</button></div>';
    return w;
  }

  function all(B) {
    var html = '<p class="blpb2-sl">Tap one to see how it goes, or start it from there.</p><div class="blpb2-ls">' + B.list.map(function (b, i) {
      return '<button class="blpb2-r" data-blinfo="' + b.key + '"><span class="th" style="--glow:' + glow(i) + '">' + svg(b.key) + '</span><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + FOR[b.key] + ' · ' + b.pat +
        (B.state === "plan" && b.inPlan ? ' · <span style="color:var(--in-700)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    }).join("") + '</div>';
    if (window.GFOpenSheet) window.GFOpenSheet("blpb2All", "Breathing exercises", html);
  }

  BLIB.add("pb2", {
    render: function (host, B) {
      host.className = "gut sect";
      var intro = B.state === "noplan" ? "Use any of these while your coach sets up your plan."
        : B.state === "free" ? "Start one whenever you need a pause."
        : "Start one whenever you need a pause, in your plan or not.";
      host.innerHTML = '<div class="blpb2-hd"><h2 class="gf-h">Breathing exercises</h2><button class="blpb2-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="blpb2-intro">' + intro + '</p><div class="blpb2-rail"></div>';
      var rail = host.querySelector(".blpb2-rail");
      B.list.forEach(function (b, i) { rail.appendChild(card(b, i, B)); });
      host.querySelector(".blpb2-all").onclick = function (e) { e.stopPropagation(); all(B); };
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("blpb2-c")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
