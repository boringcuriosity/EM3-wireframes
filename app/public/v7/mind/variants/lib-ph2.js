/* "All breathing exercises", variant ph2: Editorial, GoodFlip.
   PH's quiet magazine page on GoodFlip's card: white, the 1px border with the indigo tip and the 2px hard shadow of
   "Your mind plan", radius 24. A letter-spaced wordmark in indigo carries each one ("SIMPLE", "4·7·8", "BOX") with a
   soft indigo bloom rising behind it from the foot, the same on every card. Meta uses GoodFlip's 12/16 (what it is for
   and the minutes up top), the name at 16/22 and the pattern at 12/16 below a hairline, and a round green Start.
   The card opens the info sheet. Nothing moves. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>';
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };
  var FOR = { coherent: "Calm", sleep: "Sleep", box: "Focus", exhale: "Unwind", belly: "Digestion", hum: "Stillness", pursed: "Recovery" };
  var MARK = { coherent: "Simple", sleep: "4·7·8", box: "Box", exhale: "Exhale", belly: "Belly", hum: "Hum", pursed: "Pursed" };

  var css = document.createElement("style");
  css.textContent = [
    ".blph2-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 4px}.blph2-hd h2{margin:0}",
    ".blph2-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blph2-all::after{content:'';position:absolute;inset:-6px -8px}.blph2-all svg{width:18px;height:18px}",
    ".blph2-intro{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blph2-rail{display:flex;gap:12px;margin:0 calc(var(--gut) * -1);padding:4px var(--gut) 8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--gut);scrollbar-width:none}",
    ".blph2-rail::-webkit-scrollbar{display:none}",
    /* the page: white, the plan card's edge, an indigo bloom from the foot */
    ".blph2-t{flex:0 0 232px;height:272px;scroll-snap-align:start;display:flex;flex-direction:column;padding:16px;border-radius:var(--r-xl);border:1px solid transparent;cursor:pointer;text-align:left;color:var(--g-900);box-shadow:2px 2px 0 var(--g-200);" +
      "background:radial-gradient(150% 88% at 50% 118%,var(--in-100) 0%,var(--in-50) 38%,rgb(238 244 255 / .5) 56%,rgb(255 255 255 / 0) 80%) padding-box,linear-gradient(#fff,#fff) padding-box," +
      "conic-gradient(from 0deg,var(--in-600) 0deg,var(--g-200) 43deg,var(--g-200) 317deg,var(--in-600) 360deg) border-box;transition:transform .18s var(--ease),box-shadow .18s var(--ease)}",
    ".blph2-t:active{transform:translate(1px,1px);box-shadow:1px 1px 0 var(--g-200)}",
    ".blph2-top{display:flex;justify-content:space-between;align-items:center;font:400 12px/16px Roboto;color:var(--g-500);font-variant-numeric:tabular-nums}",
    ".blph2-top .for{font-weight:500;color:var(--in-600)}",
    /* the wordmark: light, wide, optically centred (the trailing letter-space is paid back on the left) */
    ".blph2-mid{position:relative;flex:1;display:grid;place-items:center}",
    ".blph2-mk{display:block;padding-left:.36em;font:300 28px/36px Roboto;letter-spacing:.36em;text-transform:uppercase;color:var(--in-700);white-space:nowrap}",
    ".blph2-mk.num{letter-spacing:.24em;padding-left:.24em;font-size:32px}",
    ".blph2-in{position:absolute;left:50%;top:calc(50% + 28px);transform:translateX(-50%);display:inline-flex;align-items:center;height:24px;padding:0 8px;border-radius:var(--r-pill);background:var(--in-50);color:var(--in-700);font:500 12px/16px Roboto;white-space:nowrap}",
    ".blph2-ft{display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:12px;border-top:1px solid rgb(68 76 231 / .1)}",
    ".blph2-tx{min-width:0}.blph2-n{font:600 16px/22px Roboto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.blph2-m{margin-top:2px;font:400 12px/16px Roboto;color:var(--g-500);white-space:nowrap;font-variant-numeric:tabular-nums}",
    ".blph2-go{position:relative;flex:none;width:40px;height:40px;border-radius:50%;border:0;padding:0;background:var(--brand-600);color:#fff;display:grid;place-items:center;cursor:pointer;box-shadow:0 4px 10px -6px rgb(41 157 107 / .8);transition:transform .18s var(--ease)}",
    ".blph2-go::after{content:'';position:absolute;inset:-4px}.blph2-go svg{width:16px;height:16px;margin-left:2px}.blph2-go:active{transform:scale(.94)}",
    /* See all: the wordmark set small as an index tile */
    ".blph2-ls{display:flex;flex-direction:column}.blph2-r{display:flex;align-items:center;gap:12px;width:100%;min-height:72px;padding:12px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".blph2-r:first-child{border-top:0}.blph2-r .th{flex:none;width:48px;height:48px;border-radius:var(--r-md);display:grid;place-items:center;padding-left:.12em;font:400 10px/12px Roboto;letter-spacing:.12em;text-transform:uppercase;color:var(--in-700);" +
      "background:radial-gradient(120% 70% at 50% 115%,var(--in-100) 0%,var(--in-50) 40%,#fff 80%);box-shadow:inset 0 0 0 1px var(--in-100)}",
    ".blph2-r .t{flex:1;min-width:0}.blph2-r .tt{display:block;font:600 14px/20px Roboto}.blph2-r .td{display:block;margin-top:2px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blph2-r .rt{display:inline-flex;align-items:center;gap:4px;font:400 12px/16px Roboto;color:var(--g-500);white-space:nowrap}.blph2-r .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".blph2-sl{margin:0 0 8px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  document.head.appendChild(css);

  function tile(b, B) {
    var t = document.createElement("div"), num = /\d/.test(MARK[b.key]);
    t.className = "blph2-t"; t.setAttribute("role", "button"); t.tabIndex = 0; t.setAttribute("data-blinfo", b.key);
    t.setAttribute("aria-label", b.name + ", good for " + FOR[b.key].toLowerCase() + ", " + b.pat + ", " + b.min + " minutes. How it works");
    t.innerHTML = '<div class="blph2-top"><span class="for">' + FOR[b.key] + '</span><span>' + b.min + ' min</span></div>' +
      '<div class="blph2-mid"><div class="blph2-mk' + (num ? " num" : "") + '" aria-hidden="true">' + MARK[b.key] + '</div>' + (B.state === "plan" && b.inPlan ? '<span class="blph2-in">In your plan</span>' : "") + '</div>' +
      '<div class="blph2-ft"><div class="blph2-tx"><div class="blph2-n">' + nm(b) + '</div><div class="blph2-m">' + b.pat + '</div></div>' +
      '<button class="blph2-go" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '">' + PLAY + '</button></div>';
    return t;
  }

  function all(B) {
    var html = '<p class="blph2-sl">Tap one to see how it goes, or start it from there.</p><div class="blph2-ls">' + B.list.map(function (b) {
      return '<button class="blph2-r" data-blinfo="' + b.key + '"><span class="th" aria-hidden="true">' + MARK[b.key] + '</span><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + FOR[b.key] + ' · ' + b.pat +
        (B.state === "plan" && b.inPlan ? ' · <span style="color:var(--in-700)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    }).join("") + '</div>';
    if (window.GFOpenSheet) window.GFOpenSheet("blph2All", "Breathing exercises", html);
  }

  BLIB.add("ph2", {
    render: function (host, B) {
      host.className = "gut sect";
      var intro = B.state === "noplan" ? "Use any of these while your coach sets up your plan."
        : B.state === "free" ? "Start one whenever you need a pause."
        : "Start one whenever you need a pause, in your plan or not.";
      host.innerHTML = '<div class="blph2-hd"><h2 class="gf-h">Breathing exercises</h2><button class="blph2-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="blph2-intro">' + intro + '</p><div class="blph2-rail"></div>';
      var rail = host.querySelector(".blph2-rail");
      B.list.forEach(function (b) { rail.appendChild(tile(b, B)); });
      host.querySelector(".blph2-all").onclick = function (e) { e.stopPropagation(); all(B); };
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("blph2-t")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
