/* "All breathing exercises", variant pg2: Frosted indigo.
   PG's frosted white panel over a soft blurred field, but every field is the same indigo and lavender family as
   "Your mind plan", so the rail reads as one calm set. Only where the pools of colour sit moves a little from card to
   card. The exercise's line icon sits on a small frosted disc at the top; the panel holds the name, the pattern, the
   minutes and a green Start pill. The card opens the info sheet. Nothing moves. */
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
  /* one family: an indigo pool, a periwinkle pool and a lavender pool on a pale indigo base; only their places shift */
  var POS = [[78, 18, 16, 30, 60, 62], [70, 24, 22, 20, 52, 70], [84, 30, 14, 40, 64, 58], [72, 14, 26, 26, 48, 66]];
  function field(i) {
    var p = POS[i % POS.length];
    return "radial-gradient(58% 46% at " + p[0] + "% " + p[1] + "%,#8098F9 0%,rgb(128 152 249 / 0) 100%)," +
      "radial-gradient(60% 50% at " + p[2] + "% " + p[3] + "%,#A4BCFD 0%,rgb(164 188 253 / 0) 100%)," +
      "radial-gradient(70% 50% at " + p[4] + "% " + p[5] + "%,#DDD9FE 0%,rgb(221 217 254 / 0) 100%),#EAF0FF";
  }
  var svg = function (k) { return '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[k] + '</svg>'; };
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };

  var css = document.createElement("style");
  css.textContent = [
    ".blpg2-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 4px}.blpg2-hd h2{margin:0}",
    ".blpg2-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blpg2-all::after{content:'';position:absolute;inset:-6px -8px}.blpg2-all svg{width:18px;height:18px}",
    ".blpg2-intro{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blpg2-rail{display:flex;gap:12px;margin:0 calc(var(--gut) * -1);padding:4px var(--gut) 8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--gut);scrollbar-width:none}",
    ".blpg2-rail::-webkit-scrollbar{display:none}",
    /* the field, blurred once more so the pools melt together */
    ".blpg2-t{position:relative;isolation:isolate;overflow:hidden;flex:0 0 216px;height:264px;scroll-snap-align:start;border-radius:var(--r-xl);cursor:pointer;text-align:left;color:var(--g-900);box-shadow:inset 0 0 0 1px rgb(255 255 255 / .5);transition:transform .18s var(--ease)}",
    ".blpg2-t:active{transform:scale(.985)}",
    ".blpg2-t::before{content:'';position:absolute;inset:-24px;z-index:-1;background:var(--field);filter:blur(20px) saturate(1.05)}",
    /* a soft sheen from the top, and a hairline so the edge stays crisp on white */
    ".blpg2-t::after{content:'';position:absolute;inset:0;z-index:-1;border-radius:inherit;background:linear-gradient(180deg,rgb(255 255 255 / .28),rgb(255 255 255 / 0) 45%);box-shadow:inset 0 0 0 1px rgb(68 76 231 / .08)}",
    ".blpg2-top{position:absolute;top:16px;left:16px;right:16px;display:flex;justify-content:space-between;align-items:center;gap:8px}",
    ".blpg2-ic{flex:none;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;color:var(--in-700);background:rgb(255 255 255 / .6);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:inset 0 0 0 1px rgb(255 255 255 / .8)}",
    ".blpg2-ic svg{display:block;width:28px;height:28px}",
    ".blpg2-in{display:inline-flex;align-items:center;height:24px;padding:0 8px;border-radius:var(--r-pill);background:rgb(255 255 255 / .8);color:var(--in-700);font:500 12px/16px Roboto;white-space:nowrap}",
    /* the frosted panel */
    ".blpg2-p{position:absolute;left:8px;right:8px;bottom:8px;padding:12px 12px 12px 16px;border-radius:var(--r-lg);background:rgb(255 255 255 / .7);-webkit-backdrop-filter:blur(20px) saturate(1.4);backdrop-filter:blur(20px) saturate(1.4);box-shadow:inset 0 0 0 1px rgb(255 255 255 / .8),0 8px 24px -14px rgb(53 56 205 / .35)}",
    ".blpg2-n{font:600 16px/22px Roboto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".blpg2-r{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px;padding-top:8px;border-top:1px solid rgb(68 76 231 / .08)}",
    ".blpg2-pt{margin-top:2px;font:400 12px/16px Roboto;color:var(--g-600);white-space:nowrap}.blpg2-mn{font:500 12px/16px Roboto;color:var(--in-700);font-variant-numeric:tabular-nums}",
    ".blpg2-go{position:relative;flex:none;display:inline-flex;align-items:center;gap:4px;height:32px;padding:0 14px 0 10px;border-radius:var(--r-pill);border:0;background:var(--brand-600);color:#fff;font:600 14px/20px Roboto;cursor:pointer;box-shadow:0 4px 10px -6px rgb(41 157 107 / .7);transition:transform .18s var(--ease)}",
    ".blpg2-go::after{content:'';position:absolute;inset:-6px -4px}.blpg2-go svg{width:16px;height:16px}.blpg2-go:active{transform:scale(.94)}",
    /* See all: a small swatch of the same field with the icon on it */
    ".blpg2-ls{display:flex;flex-direction:column}.blpg2-row{display:flex;align-items:center;gap:12px;width:100%;min-height:72px;padding:12px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".blpg2-row:first-child{border-top:0}.blpg2-row .th{position:relative;isolation:isolate;overflow:hidden;flex:none;width:48px;height:48px;border-radius:var(--r-md);display:grid;place-items:center;color:var(--in-700)}",
    ".blpg2-row .th::before{content:'';position:absolute;inset:-8px;z-index:-1;background:var(--field);filter:blur(6px)}.blpg2-row .th svg{width:28px;height:28px}",
    ".blpg2-row .t{flex:1;min-width:0}.blpg2-row .tt{display:block;font:600 14px/20px Roboto}.blpg2-row .td{display:block;margin-top:2px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blpg2-row .rt{display:inline-flex;align-items:center;gap:4px;font:400 12px/16px Roboto;color:var(--g-500);white-space:nowrap}.blpg2-row .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".blpg2-sl{margin:0 0 8px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  document.head.appendChild(css);

  function tile(b, i, B) {
    var t = document.createElement("div");
    t.className = "blpg2-t"; t.setAttribute("role", "button"); t.tabIndex = 0;
    t.setAttribute("data-blinfo", b.key); t.style.setProperty("--field", field(i));
    t.setAttribute("aria-label", b.name + ", " + b.pat + ", " + b.min + " minutes. How it works");
    t.innerHTML = '<div class="blpg2-top"><span class="blpg2-ic">' + svg(b.key) + '</span>' + (B.state === "plan" && b.inPlan ? '<span class="blpg2-in">In your plan</span>' : "") + '</div>' +
      '<div class="blpg2-p"><div class="blpg2-n">' + nm(b) + '</div><div class="blpg2-pt">' + b.pat + '</div><div class="blpg2-r"><span class="blpg2-mn">' + b.min + ' min</span>' +
      '<button class="blpg2-go" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '">' + PLAY + 'Start</button></div></div>';
    return t;
  }

  function all(B) {
    var html = '<p class="blpg2-sl">Tap one to see how it goes, or start it from there.</p><div class="blpg2-ls">' + B.list.map(function (b, i) {
      return '<button class="blpg2-row" data-blinfo="' + b.key + '"><span class="th" style="--field:' + field(i) + '">' + svg(b.key) + '</span><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + b.pat +
        (B.state === "plan" && b.inPlan ? ' · <span style="color:var(--in-700)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    }).join("") + '</div>';
    if (window.GFOpenSheet) window.GFOpenSheet("blpg2All", "Breathing exercises", html);
  }

  BLIB.add("pg2", {
    render: function (host, B) {
      host.className = "gut sect";
      var intro = B.state === "noplan" ? "Use any of these while your coach sets up your plan."
        : B.state === "free" ? "Start one whenever you need a pause."
        : "Start one whenever you need a pause, in your plan or not.";
      host.innerHTML = '<div class="blpg2-hd"><h2 class="gf-h">Breathing exercises</h2><button class="blpg2-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="blpg2-intro">' + intro + '</p><div class="blpg2-rail"></div>';
      var rail = host.querySelector(".blpg2-rail");
      B.list.forEach(function (b, i) { rail.appendChild(tile(b, i, B)); });
      host.querySelector(".blpg2-all").onclick = function (e) { e.stopPropagation(); all(B); };
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("blpg2-t")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
