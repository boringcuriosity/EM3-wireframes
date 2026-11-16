/* "All breathing exercises", variant ph: Editorial type (after "Open").
   Typographic cards, like a quiet magazine page. A letter-spaced wordmark carries each one ("S I M P L E", "4 · 7 · 8",
   "B O X") over a very soft gradient that blooms up from the foot in the colour of what it is for: indigo for sleep,
   sky for focus, mint for calm, lavender for breathing easier. Small meta frames it: a number and the need at the top,
   the full name, pattern and minutes below a hairline, with a round Start. The card opens the info sheet. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>';
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };
  var NEED = { coherent: "calm", sleep: "sleep", box: "focus", exhale: "calm", belly: "calm", hum: "sleep", pursed: "easier" };
  var LBL = { calm: "Calm", sleep: "Sleep", focus: "Focus", easier: "Breathe easier" };
  var BLOOM = { sleep: "#C7D7FE", focus: "#B9E6FE", calm: "#C9F5DA", easier: "#DDD6FE" };
  var MARK = { coherent: "Simple", sleep: "4·7·8", box: "Box", exhale: "Exhale", belly: "Belly", hum: "Hum", pursed: "Pursed" };
  var pad = function (i) { return (i < 9 ? "0" : "") + (i + 1); };

  var css = document.createElement("style");
  css.textContent = [
    ".blph-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 4px}.blph-hd h2{margin:0}",
    ".blph-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blph-all::after{content:'';position:absolute;inset:-6px -8px}.blph-all svg{width:18px;height:18px}",
    ".blph-intro{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blph-rail{display:flex;gap:12px;margin:0 calc(var(--gut) * -1);padding:4px var(--gut) 8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--gut);scrollbar-width:none}",
    ".blph-rail::-webkit-scrollbar{display:none}",
    /* the page: warm paper, a bloom rising from the foot */
    ".blph-t{position:relative;flex:0 0 240px;height:288px;scroll-snap-align:start;display:flex;flex-direction:column;padding:16px;border-radius:var(--r-xl);cursor:pointer;text-align:left;color:var(--g-900);" +
      "background:radial-gradient(150% 80% at 50% 118%,var(--bloom) 0%,var(--bloom) 22%,rgb(255 255 255 / 0) 74%),radial-gradient(80% 50% at 100% 0%,color-mix(in srgb,var(--bloom) 45%,transparent) 0%,transparent 70%),linear-gradient(180deg,#F8F8F5 0%,#F5F6F8 100%);box-shadow:inset 0 0 0 1px rgb(16 24 40 / .05);transition:transform .18s var(--ease)}",
    ".blph-t:active{transform:scale(.985)}",
    ".blph-top{display:flex;justify-content:space-between;align-items:center;font:500 10px/16px Roboto;letter-spacing:1.6px;text-transform:uppercase;color:var(--g-500)}",
    ".blph-top .no{font-variant-numeric:tabular-nums}",
    /* the wordmark: light, wide, optically centred (the trailing letter-space is paid back on the left) */
    ".blph-mid{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px}",
    ".blph-mk{display:block;padding-left:.42em;font:300 30px/36px Roboto;letter-spacing:.42em;text-transform:uppercase;color:var(--g-900);white-space:nowrap}",
    ".blph-mk.num{letter-spacing:.32em;padding-left:.32em;font-weight:200;font-size:34px}",
    ".blph-ft{display:flex;align-items:flex-end;justify-content:space-between;gap:8px;padding-top:12px;border-top:1px solid rgb(16 24 40 / .08)}",
    ".blph-tx{min-width:0}.blph-n{font:600 14px/20px Roboto;white-space:nowrap}.blph-m{margin-top:2px;font:400 12px/16px Roboto;color:var(--g-500);white-space:nowrap;font-variant-numeric:tabular-nums}",
    ".blph-go{position:relative;flex:none;width:40px;height:40px;border-radius:50%;border:1px solid var(--g-900);padding:0;background:transparent;color:var(--g-900);display:grid;place-items:center;cursor:pointer;transition:background .18s var(--ease),color .18s var(--ease)}",
    ".blph-go::after{content:'';position:absolute;inset:-4px}.blph-go svg{width:14px;height:14px;margin-left:2px}.blph-go:active{background:var(--g-900);color:#fff}",
    ".blph-in{display:inline-flex;align-items:center;gap:4px;height:20px;letter-spacing:.4px;font:500 11px/16px Roboto;color:var(--ok-600)}.blph-in::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--ok-500)}",
    /* See all: the wordmark set small as an index */
    ".blph-ls{display:flex;flex-direction:column}.blph-r{display:flex;align-items:center;gap:12px;width:100%;min-height:72px;padding:12px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".blph-r:first-child{border-top:0}.blph-r .no{flex:none;width:24px;font:500 12px/16px Roboto;letter-spacing:1px;color:var(--g-400);font-variant-numeric:tabular-nums}",
    ".blph-r .t{flex:1;min-width:0}.blph-r .tt{display:block;font:600 14px/20px Roboto}.blph-r .td{display:block;margin-top:2px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blph-r .rt{display:inline-flex;align-items:center;gap:4px;font:400 12px/16px Roboto;color:var(--g-500)}.blph-r .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".blph-sl{margin:0 0 8px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  document.head.appendChild(css);

  function tile(b, i, B) {
    var t = document.createElement("div"), need = NEED[b.key], num = /\d/.test(MARK[b.key]);
    t.className = "blph-t"; t.setAttribute("role", "button"); t.tabIndex = 0;
    t.setAttribute("data-blinfo", b.key); t.style.setProperty("--bloom", BLOOM[need]);
    t.setAttribute("aria-label", b.name + ", good for " + LBL[need].toLowerCase() + ", " + b.pat + ", " + b.min + " minutes. How it works");
    t.innerHTML = '<div class="blph-top"><span class="no">' + pad(i) + ' · ' + LBL[need] + '</span><span>' + b.min + ' min</span></div>' +
      '<div class="blph-mid"><div class="blph-mk' + (num ? " num" : "") + '" aria-hidden="true">' + MARK[b.key] + '</div>' + (B.state === "plan" && b.inPlan ? '<span class="blph-in">In your plan</span>' : "") + '</div>' +
      '<div class="blph-ft"><div class="blph-tx"><div class="blph-n">' + nm(b) + '</div><div class="blph-m">' + b.pat + '</div></div>' +
      '<button class="blph-go" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '">' + PLAY + '</button></div>';
    return t;
  }

  function all(B) {
    var html = '<p class="blph-sl">Tap one to see how it goes, or start it from there.</p><div class="blph-ls">' + B.list.map(function (b, i) {
      return '<button class="blph-r" data-blinfo="' + b.key + '"><span class="no">' + pad(i) + '</span><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + b.pat +
        (B.state === "plan" && b.inPlan ? ' · <span style="color:var(--ok-600)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    }).join("") + '</div>';
    if (window.GFOpenSheet) window.GFOpenSheet("blphAll", "Breathing exercises", html);
  }

  BLIB.add("ph", {
    render: function (host, B) {
      host.className = "gut sect";
      var intro = B.state === "noplan" ? "Use any of these while your coach sets up your plan."
        : B.state === "free" ? "Start one whenever you need a pause."
        : "Start one whenever you need a pause, in your plan or not.";
      host.innerHTML = '<div class="blph-hd"><h2 class="gf-h">Breathing exercises</h2><button class="blph-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="blph-intro">' + intro + '</p><div class="blph-rail"></div>';
      var rail = host.querySelector(".blph-rail");
      B.list.forEach(function (b, i) { rail.appendChild(tile(b, i, B)); });
      host.querySelector(".blph-all").onclick = function (e) { e.stopPropagation(); all(B); };
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("blph-t")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
