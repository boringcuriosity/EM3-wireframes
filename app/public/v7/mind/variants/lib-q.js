/* "All breathing exercises", variant q: Tall story cards.
   Tall rounded cards in a sideways rail, like the session cards in Calm or a story tray: each is a soft indigo to lavender
   gradient of its own (4-7-8 and Bhramari sit at dusk and night), with a drawn line glyph glowing in the middle, the name
   and pattern at the bottom over a gentle scrim, and the minutes as a frosted chip on top. No live breathing here: that
   stays in the player. The card opens the info sheet, the round play button starts it. Two cards show with a peek of the
   third; "See all" lists every exercise in a sheet. */
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
  var glyph = function (k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + G[k] + '</svg>'; };

  /* each card's own sky: [top, bottom, glow] */
  var SKY = {
    coherent: ["#D1E0FF", "#444CE7", "rgb(199 215 254 / .9)"],
    sleep: ["#444CE7", "#1F235B", "rgb(164 188 253 / .5)"],
    box: ["#E4E0FF", "#6E4FE0", "rgb(235 233 254 / .9)"],
    exhale: ["#C7D7FE", "#3538CD", "rgb(224 234 255 / .85)"],
    belly: ["#EFE9FF", "#8160E8", "rgb(244 240 255 / .9)"],
    hum: ["#6172F3", "#262A7A", "rgb(199 215 254 / .45)"],
    pursed: ["#D6E4FF", "#4F6BEB", "rgb(224 234 255 / .9)"]
  };
  var STARS = '<svg class="blq-st" viewBox="0 0 156 120" aria-hidden="true"><g fill="#fff"><circle cx="22" cy="58" r="1"/><circle cx="128" cy="44" r="1.2"/><circle cx="112" cy="86" r=".8"/><circle cx="36" cy="100" r=".8"/><circle cx="140" cy="104" r="1"/><circle cx="56" cy="20" r=".7"/></g></svg>';

  var css = document.createElement("style");
  css.textContent = [
    ".blq-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 4px}",
    ".blq-hd h2{margin:0;font:400 14px/16.8px Roboto;letter-spacing:.25px;color:var(--g-900)}",
    ".blq-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blq-all::after{content:'';position:absolute;inset:-6px -8px}.blq-all svg{width:18px;height:18px}",
    ".blq-intro{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blq-rail{display:flex;gap:12px;margin:0 calc(var(--gut) * -1);padding:4px var(--gut) 8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--gut);scrollbar-width:none}",
    ".blq-rail::-webkit-scrollbar{display:none}",
    /* the story card */
    ".blq-c{position:relative;isolation:isolate;overflow:hidden;flex:0 0 calc((100% - 12px) / 2.2);aspect-ratio:156/240;scroll-snap-align:start;border-radius:20px;cursor:pointer;color:#fff;text-align:left;" +
      "background:radial-gradient(120px 100px at 50% 40%,var(--glow),transparent 70%),linear-gradient(170deg,var(--top) 0%,var(--bot) 100%);" +
      "box-shadow:0 1px 2px rgb(16 24 40 / .06),0 8px 20px -10px rgb(45 49 166 / .45);transition:transform .2s var(--ease)}",
    ".blq-c:active{transform:scale(.98)}",
    ".blq-st{position:absolute;inset:0 0 auto 0;width:100%;height:auto;z-index:-1;opacity:.7}",
    /* the drawn glyph, in a soft lit circle so every shape carries the same weight */
    ".blq-g{position:absolute;left:50%;top:46%;width:76px;height:76px;margin:-38px 0 0 -38px;display:grid;place-items:center;border-radius:50%;" +
      "background:radial-gradient(circle,rgb(255 255 255 / .28),rgb(255 255 255 / .06) 62%,transparent 72%);box-shadow:inset 0 0 0 1px rgb(255 255 255 / .22)}",
    ".blq-g svg{width:46px;height:46px;color:#fff;filter:drop-shadow(0 1px 6px rgb(30 27 75 / .25))}",
    /* top: minutes, plan, play */
    ".blq-top{position:absolute;left:12px;right:8px;top:12px;display:flex;align-items:flex-start;justify-content:space-between}",
    ".blq-chips{display:flex;flex-direction:column;align-items:flex-start;gap:4px}",
    ".blq-mn,.blq-in{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 8px;border-radius:999px;font:500 12px/16px Roboto;font-variant-numeric:tabular-nums;white-space:nowrap}",
    ".blq-mn{color:#fff;background:rgb(30 27 90 / .26);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);box-shadow:inset 0 0 0 1px rgb(255 255 255 / .18)}",
    ".blq-in{color:var(--in-700);background:rgb(255 255 255 / .92)}.blq-in::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--ok-500)}",
    ".blq-pl{position:relative;flex:none;width:32px;height:32px;margin:-4px 0 0;border:0;padding:0;border-radius:50%;background:#fff;color:var(--in-600);display:grid;place-items:center;cursor:pointer;box-shadow:0 2px 6px rgb(30 27 75 / .2)}",
    ".blq-pl::after{content:'';position:absolute;inset:-6px}.blq-pl svg{width:14px;height:14px;margin-left:2px}",
    /* bottom: name and pattern over a gentle scrim */
    ".blq-ft{position:absolute;left:0;right:0;bottom:0;padding:32px 12px 14px;display:flex;flex-direction:column;gap:4px;background:linear-gradient(180deg,transparent,rgb(22 20 70 / .38))}",
    ".blq-n{font:600 16px/20px Roboto;letter-spacing:.1px;text-wrap:balance;text-shadow:0 1px 2px rgb(22 20 70 / .25)}",
    ".blq-p{font:400 12px/16px Roboto;color:rgb(255 255 255 / .86);text-wrap:balance}",
    /* the See all sheet */
    ".blq-ls{display:flex;flex-direction:column}.blq-r{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;padding:8px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".blq-r:first-child{border-top:0}.blq-r .ic{flex:none;width:40px;height:48px;border-radius:10px;display:grid;place-items:center;background:linear-gradient(170deg,var(--top),var(--bot))}",
    ".blq-r .ic svg{width:24px;height:24px;color:#fff}",
    ".blq-r .t{flex:1;min-width:0}.blq-r .tt{display:block;font:600 14px/20px Roboto}.blq-r .td{display:block;margin-top:2px;font:400 12px/18px Roboto;color:var(--g-500)}",
    ".blq-r .rt{display:inline-flex;align-items:center;gap:4px;font:500 12px/20px Roboto;color:var(--g-500)}.blq-r .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".blq-sl{margin:0 0 8px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  document.head.appendChild(css);

  var sky = function (k) { var s = SKY[k]; return "--top:" + s[0] + ";--bot:" + s[1] + ";--glow:" + s[2]; };

  function card(b, B) {
    var c = document.createElement("div");
    c.className = "blq-c"; c.setAttribute("role", "button"); c.tabIndex = 0; c.setAttribute("style", sky(b.key));
    c.setAttribute("data-blinfo", b.key);
    c.setAttribute("aria-label", b.name + ", " + b.pat + ", " + b.min + " minutes. How it works");
    c.innerHTML = (b.key === "sleep" || b.key === "hum" ? STARS : "") +
      '<div class="blq-top"><div class="blq-chips"><span class="blq-mn">' + b.min + ' min</span>' +
      (B.state === "plan" && b.inPlan ? '<span class="blq-in">In your plan</span>' : "") + '</div>' +
      '<button class="blq-pl" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '">' + PLAY + '</button></div>' +
      '<div class="blq-g">' + glyph(b.key) + '</div>' +
      '<div class="blq-ft"><div class="blq-n">' + nm(b) + '</div><div class="blq-p">' + b.pat + '</div></div>';
    return c;
  }

  function all(B) {
    var html = '<p class="blq-sl">Tap one to see how it goes, or start it from there.</p><div class="blq-ls">' + B.list.map(function (b) {
      return '<button class="blq-r" data-blinfo="' + b.key + '"><span class="ic" style="' + sky(b.key) + '">' + glyph(b.key) + '</span><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + b.pat +
        (B.state === "plan" && b.inPlan ? ' · <span style="color:var(--ok-600)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    }).join("") + '</div>';
    if (window.GFOpenSheet) window.GFOpenSheet("blqAll", "Breathing exercises", html);
  }

  BLIB.add("q", {
    render: function (host, B) {
      host.className = "gut sect";
      var intro = B.state === "noplan" ? "Use any of these while your coach sets up your plan."
        : B.state === "free" ? "Start one whenever you need a pause."
        : "Start one whenever you need a pause, in your plan or not.";
      host.innerHTML = '<div class="blq-hd"><h2>Breathing exercises</h2><button class="blq-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="blq-intro">' + intro + '</p><div class="blq-rail"></div>';
      var rail = host.querySelector(".blq-rail");
      B.list.forEach(function (b) { rail.appendChild(card(b, B)); });
      host.querySelector(".blq-all").onclick = function (e) { e.stopPropagation(); all(B); };
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("blq-c")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
