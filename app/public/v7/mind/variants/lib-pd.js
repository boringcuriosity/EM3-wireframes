/* "All breathing exercises", variant pd: Clean icon cards (from Squair).
   Crisp white GoodFlip cards in a rail: radius 16, the 1px grey border and the 2px hard shadow. Top left a small round
   tinted icon (indigo for focus, lavender for sleep and evening, mint for calm in the body, sky for breath and balance),
   then the name, one plain line on what it is for, and two chips: minutes, and when it suits (Bedtime, Any time,
   Beginner). "In your plan" sits top right. The card opens the info sheet, where Start lives. See all opens the list. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };
  var ICON = {
    coherent: '<path d="M2.5 12c1.6 0 2.4-4.5 4.75-4.5S10.4 16.5 12 16.5s2.4-9 4.75-9S20 12 21.5 12"/>',
    sleep: '<path d="M19 14.6A7.5 7.5 0 0 1 9.4 5a7.5 7.5 0 1 0 9.6 9.6z"/>',
    box: '<rect x="5.5" y="5.5" width="13" height="13" rx="2.5"/>',
    exhale: '<path d="M3 17c1.8 0 2.6-9 4.5-9s4.5 9 13.5 9"/>',
    belly: '<path d="M4 18.5h16"/><path d="M5.5 18.5c0-5.5 3-9 6.5-9s6.5 3.5 6.5 9"/><circle cx="12" cy="15" r=".9" fill="currentColor" stroke="none"/>',
    hum: '<circle cx="7.5" cy="12" r="2.2"/><path d="M12.5 8.5a5 5 0 0 1 0 7"/><path d="M15.8 5.8a9 9 0 0 1 0 12.4"/>',
    pursed: '<path d="M3.5 12c2.2-2.6 4.6-3.6 6.3-2.6.8.5 1.6.5 2.4 0 1.7-1 4.1 0 6.3 2.6-2.4 2.4-4.9 3.6-7.5 3.6S5.9 14.4 3.5 12z"/><path d="M6.5 12h11"/>'
  };
  var ico = function (k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[k] + '</svg>'; };
  /* tint by need: [icon wash, icon colour, chip wash, chip text] */
  var TINT = {
    in:  ["#EEF4FF", "#444CE7", "#EEF4FF", "#3538CD"],
    lav: ["#F4F0FF", "#7A5AF8", "#F4F0FF", "#5925DC"],
    mint:["#E6FAF1", "#299D6B", "#E6FAF1", "#2A805A"],
    sky: ["#EAF4FE", "#2E90FA", "#EAF4FE", "#175CD3"]
  };
  var CARD = {
    coherent: ["sky", "Even breaths to settle body and mind", "Beginner"],
    sleep: ["lav", "A slow count to help you drift off", "Bedtime"],
    box: ["in", "Steady counts to clear your head", "Any time"],
    exhale: ["mint", "Long breaths out to ease stress", "Any time"],
    belly: ["mint", "Deep, soft breaths into your belly", "Beginner"],
    hum: ["lav", "A gentle hum to quieten your mind", "Evening"],
    pursed: ["sky", "Slows your breath when you feel short", "Any time"]
  };

  var css = document.createElement("style");
  css.textContent = [
    ".blpd-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 4px}.blpd-hd h2{margin:0}",
    ".blpd-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blpd-all::after{content:'';position:absolute;inset:-6px -8px}.blpd-all svg{width:18px;height:18px}",
    ".blpd-intro{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blpd-rail{display:flex;gap:12px;margin:0 calc(var(--gut) * -1);padding:4px var(--gut) 8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--gut);scrollbar-width:none}",
    ".blpd-rail::-webkit-scrollbar{display:none}",
    /* the card */
    ".blpd-t{flex:0 0 216px;scroll-snap-align:start;display:flex;flex-direction:column;gap:12px;padding:16px;border:1px solid var(--g-200);border-radius:var(--r-lg);background:#fff;" +
      "box-shadow:2px 2px 0 var(--g-200);cursor:pointer;text-align:left;color:var(--g-900);transition:transform .18s var(--ease),box-shadow .18s var(--ease)}",
    ".blpd-t:active{transform:translate(1px,1px);box-shadow:1px 1px 0 var(--g-200)}.blpd-t:focus-visible{outline:2px solid var(--in-600);outline-offset:2px}",
    ".blpd-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}",
    ".blpd-i{flex:none;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:var(--iw);color:var(--ic)}.blpd-i svg{width:22px;height:22px}",
    ".blpd-in{display:inline-flex;align-items:center;height:24px;padding:0 8px;border-radius:var(--r-pill);background:var(--ok-50);color:var(--ok-600);font:500 12px/16px Roboto;white-space:nowrap}",
    ".blpd-tx{display:flex;flex-direction:column;gap:4px}",
    ".blpd-n{font:600 16px/22px Roboto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".blpd-d{font:400 14px/20px Roboto;color:var(--g-600);min-height:40px;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}",
    ".blpd-ch{display:flex;gap:8px}.blpd-c{display:inline-flex;align-items:center;height:24px;padding:0 8px;border-radius:var(--r-pill);font:500 12px/16px Roboto;white-space:nowrap;font-variant-numeric:tabular-nums}",
    ".blpd-c.mn{background:var(--g-100);color:var(--g-700)}.blpd-c.wh{background:var(--cw);color:var(--ct)}",
    /* See all: the same icon, the plan's row */
    ".blpd-ls{display:flex;flex-direction:column}.blpd-r{display:flex;align-items:center;gap:12px;width:100%;min-height:72px;padding:12px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".blpd-r:first-child{border-top:0}.blpd-r .blpd-i{width:40px;height:40px}",
    ".blpd-r .t{flex:1;min-width:0}.blpd-r .tt{display:block;font:600 14px/20px Roboto}.blpd-r .td{display:block;margin-top:2px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blpd-r .rt{display:inline-flex;align-items:center;gap:4px;font:400 12px/16px Roboto;color:var(--g-500)}.blpd-r .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".blpd-sl{margin:0 0 8px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  document.head.appendChild(css);

  function vars(k) { var t = TINT[CARD[k][0]]; return "--iw:" + t[0] + ";--ic:" + t[1] + ";--cw:" + t[2] + ";--ct:" + t[3]; }

  function tile(b, B) {
    var t = document.createElement("div"), c = CARD[b.key], mine = B.state === "plan" && b.inPlan;
    t.className = "blpd-t"; t.setAttribute("role", "button"); t.tabIndex = 0; t.setAttribute("data-blinfo", b.key); t.style.cssText = vars(b.key);
    t.setAttribute("aria-label", nm(b) + ". " + c[1] + ". " + b.min + " minutes, " + c[2].toLowerCase() + (mine ? ", in your plan" : "") + ". How it works");
    t.innerHTML = '<div class="blpd-top"><span class="blpd-i">' + ico(b.key) + '</span>' + (mine ? '<span class="blpd-in">In your plan</span>' : "") + '</div>' +
      '<div class="blpd-tx"><span class="blpd-n">' + nm(b) + '</span><span class="blpd-d">' + c[1] + '</span></div>' +
      '<div class="blpd-ch"><span class="blpd-c mn">' + b.min + ' min</span><span class="blpd-c wh">' + c[2] + '</span></div>';
    return t;
  }

  function all(B) {
    var html = '<p class="blpd-sl">Tap one to see how it goes, or start it from there.</p><div class="blpd-ls">' + B.list.map(function (b) {
      return '<button class="blpd-r" data-blinfo="' + b.key + '" style="' + vars(b.key) + '"><span class="blpd-i">' + ico(b.key) + '</span><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + CARD[b.key][1] +
        (B.state === "plan" && b.inPlan ? ' · <span style="color:var(--ok-600)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    }).join("") + '</div>';
    if (window.GFOpenSheet) window.GFOpenSheet("blpdAll", "Breathing exercises", html);
  }

  BLIB.add("pd", {
    render: function (host, B) {
      host.className = "gut sect";
      var intro = B.state === "noplan" ? "Use any of these while your coach sets up your plan."
        : B.state === "free" ? "Start one whenever you need a pause."
        : "Start one whenever you need a pause, in your plan or not.";
      host.innerHTML = '<div class="blpd-hd"><h2 class="gf-h">Breathing exercises</h2><button class="blpd-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="blpd-intro">' + intro + '</p><div class="blpd-rail"></div>';
      var rail = host.querySelector(".blpd-rail");
      B.list.forEach(function (b) { rail.appendChild(tile(b, B)); });
      host.querySelector(".blpd-all").onclick = function (e) { e.stopPropagation(); all(B); };
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("blpd-t")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
