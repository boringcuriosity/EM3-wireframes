/* "All breathing exercises", variant pg: Frosted over colour (after "WAVY / Shinrin").
   Each card is a soft blurred field of colour picked by what the exercise is for: indigo for sleep, sky for focus,
   mint for calm, lavender for breathing easier. The blobs sit in a different place on every card so the rail never
   repeats. A frosted white panel at the foot holds the name, the pattern, the minutes and a small round play button
   in the field's deep shade. The card opens the info sheet; the play button starts it. Nothing moves. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>';
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };
  var NEED = { coherent: "calm", sleep: "sleep", box: "focus", exhale: "calm", belly: "calm", hum: "sleep", pursed: "easier" };
  var LBL = { calm: "Calm", sleep: "Sleep", focus: "Focus", easier: "Breathe easier" };
  /* base, deep blob, light blob, mid blob, and the button's deep shade */
  var PAL = {
    sleep: ["#A4BCFD", "#444CE7", "#E0EAFF", "#8098F9", "#3538CD"],
    focus: ["#B9E6FE", "#0BA5EC", "#F0F9FF", "#7CD4FD", "#026AA2"],
    calm: ["#A6F4C5", "#12B76A", "#ECFDF3", "#6CE9A6", "#027A48"],
    easier: ["#D9D6FE", "#7A5AF8", "#F4F3FF", "#BDB4FE", "#5925DC"]
  };
  /* where the deep, light and mid blobs sit on each card, in % of the card */
  var POS = { coherent: [[20, 20], [85, 70], [70, 15]], sleep: [[80, 18], [15, 75], [30, 25]], box: [[25, 30], [80, 80], [85, 20]],
    exhale: [[75, 25], [20, 85], [20, 20]], belly: [[50, 15], [10, 60], [90, 55]], hum: [[20, 35], [90, 85], [80, 10]], pursed: [[70, 30], [15, 15], [30, 70]] };
  function field(k) {
    var c = PAL[NEED[k]], p = POS[k];
    return "radial-gradient(70% 55% at " + p[0][0] + "% " + p[0][1] + "%," + c[1] + " 0%,transparent 70%)," +
      "radial-gradient(60% 50% at " + p[1][0] + "% " + p[1][1] + "%," + c[2] + " 0%,transparent 72%)," +
      "radial-gradient(55% 45% at " + p[2][0] + "% " + p[2][1] + "%," + c[3] + " 0%,transparent 70%)," + c[0];
  }

  var css = document.createElement("style");
  css.textContent = [
    ".blpg-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 4px}.blpg-hd h2{margin:0}",
    ".blpg-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blpg-all::after{content:'';position:absolute;inset:-6px -8px}.blpg-all svg{width:18px;height:18px}",
    ".blpg-intro{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blpg-rail{display:flex;gap:12px;margin:0 calc(var(--gut) * -1);padding:4px var(--gut) 8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--gut);scrollbar-width:none}",
    ".blpg-rail::-webkit-scrollbar{display:none}",
    /* the colour field, blurred once more so the blobs melt into each other */
    ".blpg-t{position:relative;isolation:isolate;overflow:hidden;flex:0 0 216px;height:272px;scroll-snap-align:start;border-radius:var(--r-xl);cursor:pointer;text-align:left;color:var(--g-900);transition:transform .18s var(--ease)}",
    ".blpg-t:active{transform:scale(.985)}",
    ".blpg-t::before{content:'';position:absolute;inset:-24px;z-index:-1;background:var(--field);filter:blur(18px) saturate(1.1)}",
    /* a faint grain of light at the top so the field reads as glass, not flat colour */
    ".blpg-t::after{content:'';position:absolute;inset:0;z-index:-1;border-radius:inherit;background:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\"),linear-gradient(180deg,rgb(255 255 255 / .22),transparent 40%);background-size:160px,auto;opacity:1;mix-blend-mode:soft-light;box-shadow:inset 0 0 0 1px rgb(255 255 255 / .35)}",
    ".blpg-top{position:absolute;top:12px;left:12px;right:12px;display:flex;justify-content:space-between;align-items:center;gap:8px}",
    ".blpg-tag{display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:var(--r-pill);background:rgb(255 255 255 / .55);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);box-shadow:inset 0 0 0 1px rgb(255 255 255 / .6);font:600 10px/12px Roboto;letter-spacing:1px;text-transform:uppercase;color:var(--deep)}",
    ".blpg-in{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 8px;border-radius:var(--r-pill);background:rgb(255 255 255 / .85);font:500 11px/16px Roboto;color:var(--ok-600);white-space:nowrap}",
    ".blpg-in::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--ok-500)}",
    /* the frosted panel */
    ".blpg-p{position:absolute;left:8px;right:8px;bottom:8px;padding:12px 12px 12px 16px;border-radius:var(--r-lg);background:rgb(255 255 255 / .62);-webkit-backdrop-filter:blur(20px) saturate(1.6);backdrop-filter:blur(20px) saturate(1.6);box-shadow:inset 0 0 0 1px rgb(255 255 255 / .75),0 8px 24px -12px rgb(16 24 40 / .25)}",
    ".blpg-n{font:600 16px/22px Roboto;white-space:nowrap}",
    ".blpg-pt{margin-top:2px;font:400 12px/16px Roboto;color:var(--g-600);white-space:nowrap}",
    ".blpg-r{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:4px}",
    ".blpg-mn{font:500 12px/16px Roboto;color:var(--g-700);font-variant-numeric:tabular-nums}",
    ".blpg-go{position:relative;flex:none;width:40px;height:40px;border-radius:50%;border:0;padding:0;background:var(--deep);color:#fff;display:grid;place-items:center;cursor:pointer;box-shadow:0 4px 12px -4px var(--deep);transition:transform .18s var(--ease)}",
    ".blpg-go::after{content:'';position:absolute;inset:-4px}.blpg-go svg{width:16px;height:16px;margin-left:2px}.blpg-go:active{transform:scale(.94)}",
    /* See all: a small swatch of the same field */
    ".blpg-ls{display:flex;flex-direction:column}.blpg-row{display:flex;align-items:center;gap:12px;width:100%;min-height:72px;padding:12px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".blpg-row:first-child{border-top:0}.blpg-row .th{position:relative;overflow:hidden;flex:none;width:48px;height:48px;border-radius:var(--r-md)}.blpg-row .th::before{content:'';position:absolute;inset:-8px;background:var(--field);filter:blur(6px)}",
    ".blpg-row .t{flex:1;min-width:0}.blpg-row .tt{display:block;font:600 14px/20px Roboto}.blpg-row .td{display:block;margin-top:2px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blpg-row .rt{display:inline-flex;align-items:center;gap:4px;font:400 12px/16px Roboto;color:var(--g-500)}.blpg-row .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".blpg-sl{margin:0 0 8px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  document.head.appendChild(css);

  function tile(b, B) {
    var t = document.createElement("div"), need = NEED[b.key];
    t.className = "blpg-t"; t.setAttribute("role", "button"); t.tabIndex = 0;
    t.setAttribute("data-blinfo", b.key); t.style.setProperty("--field", field(b.key)); t.style.setProperty("--deep", PAL[need][4]);
    t.setAttribute("aria-label", b.name + ", good for " + LBL[need].toLowerCase() + ", " + b.pat + ", " + b.min + " minutes. How it works");
    t.innerHTML = '<div class="blpg-top"><span class="blpg-tag">' + LBL[need] + '</span>' + (B.state === "plan" && b.inPlan ? '<span class="blpg-in">In your plan</span>' : "") + '</div>' +
      '<div class="blpg-p"><div class="blpg-n">' + nm(b) + '</div><div class="blpg-pt">' + b.pat + '</div><div class="blpg-r"><span class="blpg-mn">' + b.min + ' min</span>' +
      '<button class="blpg-go" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '">' + PLAY + '</button></div></div>';
    return t;
  }

  function all(B) {
    var html = '<p class="blpg-sl">Tap one to see how it goes, or start it from there.</p><div class="blpg-ls">' + B.list.map(function (b) {
      return '<button class="blpg-row" data-blinfo="' + b.key + '"><span class="th" style="--field:' + field(b.key) + '"></span><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + b.pat +
        (B.state === "plan" && b.inPlan ? ' · <span style="color:var(--ok-600)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    }).join("") + '</div>';
    if (window.GFOpenSheet) window.GFOpenSheet("blpgAll", "Breathing exercises", html);
  }

  BLIB.add("pg", {
    render: function (host, B) {
      host.className = "gut sect";
      var intro = B.state === "noplan" ? "Use any of these while your coach sets up your plan."
        : B.state === "free" ? "Start one whenever you need a pause."
        : "Start one whenever you need a pause, in your plan or not.";
      host.innerHTML = '<div class="blpg-hd"><h2 class="gf-h">Breathing exercises</h2><button class="blpg-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="blpg-intro">' + intro + '</p><div class="blpg-rail"></div>';
      var rail = host.querySelector(".blpg-rail");
      B.list.forEach(function (b) { rail.appendChild(tile(b, B)); });
      host.querySelector(".blpg-all").onclick = function (e) { e.stopPropagation(); all(B); };
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("blpg-t")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
