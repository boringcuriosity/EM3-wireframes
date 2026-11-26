/* Hook: Keep the streak. The reason to start is a streak worth keeping: a warm week strip with the gold flame
   (the live Home's StreakFlame), three days lit, today waiting, and the day-seven reward at the end.
   Under it, the four doors in one compact row. Any log, from a door's small plus, lights today's flame. */
(function () {
  var X = "dstreak-", E = "cubic-bezier(.2,0,0,1)";
  var GOLD = "#E7C144", GOLD_D = "#A68A2D", RULE = "#E4E7EC";
  /* Lucide's flame with its inner tongue, the same path StreakFlame.jsx clips with */
  var FLAME = "M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4z";
  var REWARD = 20, GOAL = 7;

  var css = [
    "." + X + "w{display:flex;flex-direction:column;gap:16px}",
    /* the hook card: white, a warm gold wash only at its top edge */
    "." + X + "card{position:relative;border-radius:24px;border:1px solid #FEF1C7;background:linear-gradient(180deg,#FFFBEE 0%,#FFFDF7 46%,#fff 100%);padding:20px 16px 16px;overflow:hidden}",
    "." + X + "card::before{content:'';position:absolute;right:-40px;top:-70px;width:200px;height:200px;border-radius:50%;background:radial-gradient(closest-side,rgba(231,193,68,.22),rgba(231,193,68,0));pointer-events:none}",
    "." + X + "hd{position:relative;display:flex;align-items:center;gap:12px}",
    "." + X + "big{position:relative;width:44px;height:44px;flex:none}",
    "." + X + "hd h3{margin:0;font:700 20px/26px Roboto;color:#101828;letter-spacing:-.2px}",
    "." + X + "hd p{margin:2px 0 0;font:400 14px/20px Roboto;color:#475467}",
    "." + X + "ln{display:grid}." + X + "ln>*{grid-area:1/1;transition:opacity .45s " + E + ",transform .55s " + E + "}",
    "." + X + "ln .b{opacity:0;transform:translateY(6px)}",
    "." + X + "card.lit ." + X + "ln .a{opacity:0;transform:translateY(-6px)}." + X + "card.lit ." + X + "ln .b{opacity:1;transform:none}",
    /* the flame: a clip of the path, a fill that rises, the outline on top */
    "." + X + "fl{position:absolute;inset:0}",
    "." + X + "fl .clip{position:absolute;left:0;top:0;width:24px;height:24px;transform-origin:0 0;clip-path:path('" + FLAME + "')}",
    "." + X + "fl .bg{position:absolute;inset:0;background:" + RULE + ";opacity:.5}",
    "." + X + "fl .fill{position:absolute;left:0;right:0;bottom:0;height:0;background:linear-gradient(180deg,#F2D372 0%," + GOLD + " 55%,#D9AE2F 100%);transition:height .9s cubic-bezier(.32,.72,0,1)}",
    "." + X + "fl.on .fill{height:100%}",
    "." + X + "fl svg{position:absolute;inset:0;overflow:visible}",
    "." + X + "fl path{fill:none;stroke:" + RULE + ";stroke-width:1.4;stroke-linejoin:round;transition:stroke .5s ease}",
    "." + X + "fl.on path{stroke:" + GOLD_D + "}",
    /* the calm glow that resolves into today's flame when it lights */
    "." + X + "glow{position:absolute;left:50%;top:50%;width:56px;height:56px;margin:-28px 0 0 -28px;border-radius:50%;background:radial-gradient(closest-side,rgba(231,193,68,.55),rgba(231,193,68,0));opacity:0;transform:scale(.6);pointer-events:none}",
    "." + X + "day.now.on ." + X + "glow{animation:" + X + "glow 1.8s " + E + " forwards}",
    "." + X + "big.on ." + X + "glow{animation:" + X + "glow 1.8s " + E + " forwards}",
    "@keyframes " + X + "glow{0%{opacity:0;transform:scale(.6)}35%{opacity:1;transform:scale(1.15)}100%{opacity:.35;transform:scale(1)}}",
    /* the week strip */
    "." + X + "wk{position:relative;margin-top:16px;display:grid;grid-template-columns:repeat(7,1fr);gap:4px}",
    "." + X + "wk::before{content:'';position:absolute;left:7%;right:7%;top:20px;height:2px;border-radius:1px;background:#F2F4F7}",
    "." + X + "wk b.lit{position:absolute;left:7%;top:20px;height:2px;border-radius:1px;background:linear-gradient(90deg,#F2D372," + GOLD + ");transition:width .9s " + E + "}",
    "." + X + "day{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;font:500 11px/14px Roboto;color:#98A2B3}",
    "." + X + "dot{position:relative;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:#fff;box-shadow:inset 0 0 0 1px #F2F4F7}",
    "." + X + "dot ." + X + "f{position:relative;width:22px;height:22px}",
    "." + X + "day.done ." + X + "dot{background:#FFF8E0;box-shadow:inset 0 0 0 1px #FEF1C7}",
    "." + X + "day.now{color:#101828;font-weight:700}",
    "." + X + "day.now ." + X + "dot{box-shadow:inset 0 0 0 1.5px " + GOLD + ",0 0 0 4px rgba(231,193,68,.14)}",
    "." + X + "day.now.on ." + X + "dot{background:#FFF8E0}",
    "." + X + "day.far ." + X + "dot{box-shadow:inset 0 0 0 1px #F2F4F7;background:#FCFCFD}",
    "." + X + "day.far ." + X + "f{opacity:.55}",
    /* the reward at day seven: a coin in place of a flame */
    "." + X + "coin{width:22px;height:22px;background:linear-gradient(135deg,#F2D372," + GOLD + " 50%," + GOLD_D + ");clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);display:grid;place-items:center;font:800 9px/1 Roboto;color:#fff}",
    "." + X + "rw{position:relative;margin-top:16px;display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.75);border:1px solid #FEF1C7;font:500 13px/18px Roboto;color:#475467}",
    "." + X + "rw b{color:" + GOLD_D + ";font-weight:700}",
    "." + X + "rw .he-coin-i{width:14px;height:14px;flex:none;background:linear-gradient(135deg," + GOLD + "," + GOLD_D + ");clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)}",
    /* the doors: four compact cards, orb, name, score; a small plus logs that pillar's next item */
    "." + X + "doors{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}",
    "." + X + "door{position:relative;border-radius:18px;border:1px solid #F2F4F7;background:#fff;padding:14px 4px 12px;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;font-family:Roboto;box-shadow:0 1px 2px rgba(16,24,40,.04);transition:background .2s " + E + "}",
    "." + X + "door:active{background:#FCFCFD}",
    "." + X + "door:focus-visible{outline:2px solid var(--c);outline-offset:2px}",
    "." + X + "orb{position:relative;width:48px;height:48px;border-radius:50%;overflow:hidden;" +
      "background:radial-gradient(130% 130% at 28% 18%,#fff 0%,var(--w) 32%,var(--t) 74%,color-mix(in srgb,var(--c) 35%,transparent) 100%);" +
      "box-shadow:0 10px 18px -10px color-mix(in srgb,var(--c) 45%,transparent),inset 0 -10px 16px -9px color-mix(in srgb,var(--c) 65%,transparent),inset 0 6px 10px -6px #fff,inset 0 0 0 1px color-mix(in srgb,var(--c) 14%,transparent);display:grid;place-items:center;color:var(--d)}",
    "." + X + "orb::after{content:'';position:absolute;top:10%;left:17%;width:34%;height:23%;border-radius:50%;background:#fff;filter:blur(4px);opacity:.85}",
    "." + X + "orb svg{position:relative;z-index:1}",
    "." + X + "nm{font:600 12px/16px Roboto;color:#344054}",
    "." + X + "sc{font:500 17px/20px 'Playfair Display',serif;color:#101828;margin-top:-6px}",
    "." + X + "sc small{font-size:.6em;color:#667085}",
    "." + X + "plus{position:absolute;top:2px;right:2px;width:40px;height:40px;border:0;background:none;padding:0;cursor:pointer;display:grid;place-items:center}",
    "." + X + "plus span{width:24px;height:24px;border-radius:50%;background:#fff;border:1px solid #E4E7EC;color:#344054;display:grid;place-items:center;box-shadow:0 1px 2px rgba(16,24,40,.06);transition:background .2s " + E + "}",
    "." + X + "plus:active span{background:#F2F4F7}",
    "." + X + "plus.ok span{border-color:transparent;background:var(--t);color:var(--d)}",
    "." + X + "plus:focus-visible span{outline:2px solid var(--c);outline-offset:2px}",
    "@media (prefers-reduced-motion: reduce){." + X + "fl .fill,." + X + "ln>*{transition:none}." + X + "glow{animation:none!important;opacity:.35!important;transform:none!important}}"
  ].join("");
  var s = document.createElement("style"); s.textContent = css; document.head.appendChild(s);

  function vars(p) { var c = HE.P[p]; return "--c:" + c.c + ";--t:" + c.t + ";--w:" + c.w + ";--d:" + c.d; }
  function flame(size, on) {
    return '<span class="' + X + 'fl' + (on ? " on" : "") + '"><span class="clip" style="transform:scale(' + (size / 24) + ')"><span class="bg"></span><span class="fill"></span></span>' +
      '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" aria-hidden="true"><path d="' + FLAME + '"/></svg></span>';
  }

  HE.add({
    id: "streak", name: "Keep the streak", rec: false, group: "doors", kind: "Hook",
    pitch: "The reason to open a door is a streak worth keeping. A warm week strip shows three gold flames, today's flame waiting, and the day-seven reward at the end. One log from any door lights today. The doors themselves stay small and quiet underneath.",
    how: [
      "Home leads with the streak: three days lit, today's flame ringed and waiting, and a coin on day seven.",
      "The line says what it takes: \"3 days in a row. One log keeps it going.\" and \"7 days earns 20 FlipCoins\".",
      "Each door's small plus logs that pillar's next item in a tap. Tapping the door itself opens the pillar.",
      "After the win, today's flame fills with gold and a soft glow settles on it. The line becomes \"Day 4. See you tomorrow.\""
    ],
    score: [["Three doors at a glance", "y"], ["One tap in", "y"], ["A hook to start", "y"], ["GoodFlip look", "y"], ["Calm", "y"]],
    catch: "A streak rewards opening the app, not eating or moving well, and once today is lit the hook has done its job until tomorrow. A broken streak needs a kind state of its own.",
    from: "Duolingo's streak flame and week strip, Headspace's run streak, the Tide week strip, the live Home's StreakFlame.",
    tryit: "Tap the plus on Move. Watch today's flame light and the line change to Day 4.",
    effort: "Low: the streak already exists on the live Home; this gives it the top spot.",
    draw: function (ph) {
      var S = ph._s || (ph._s = { lit: false });
      var lit = ph.items().some(function (x) { return x.done; }), fresh = lit && !S.lit;
      var day = HE.STREAK + 1, part = HE.part(HE.hour);
      var tail = part === "night" ? "One log before bed keeps it going." : part === "evening" ? "One log this evening keeps it going." : "One log keeps it going.";
      var L = "SMTWTFS", d = new Date(), cells = [];
      for (var k = -HE.STREAK; k < GOAL - HE.STREAK; k++) cells.push({ k: k, l: L[(d.getDay() + k + 70) % 7], n: k + HE.STREAK + 1 });
      var left = GOAL - day;

      var w = document.createElement("div"); w.className = X + "w";
      w.innerHTML =
        '<div class="' + X + 'card' + (lit && !fresh ? " lit" : "") + '">' +
          '<div class="' + X + 'hd"><span class="' + X + 'big' + (lit && !fresh ? " on" : "") + '"><span class="' + X + 'glow"></span>' + flame(44, true) + '</span>' +
            '<div class="' + X + 'ln"><div class="a"><h3>' + HE.STREAK + ' days in a row</h3><p>' + tail + '</p></div>' +
              '<div class="b"><h3>Day ' + day + '</h3><p>See you tomorrow.</p></div></div></div>' +
          '<div class="' + X + 'wk" role="img" aria-label="' + HE.STREAK + ' days lit, today ' + (lit ? "lit" : "waiting") + ', ' + GOAL + ' days earns ' + REWARD + ' FlipCoins">' +
            '<b class="lit" style="width:' + (86 * (HE.STREAK - (lit && !fresh ? 0 : .5)) / 6) + '%"></b>' +
            cells.map(function (c) {
              var cls = c.k < 0 ? "done" : c.k === 0 ? "now" + (lit && !fresh ? " on" : "") : "far";
              var inner = c.n === GOAL ? '<span class="' + X + 'coin">' + REWARD + '</span>' : '<span class="' + X + 'f">' + flame(22, c.k < 0 || (c.k === 0 && lit && !fresh)) + '</span>';
              return '<div class="' + X + 'day ' + cls + '"><span class="' + X + 'dot">' + (c.k === 0 ? '<span class="' + X + 'glow"></span>' : "") + inner + '</span>' + (c.k === 0 ? "Today" : c.l) + '</div>';
            }).join("") + '</div>' +
          '<div class="' + X + 'rw"><span class="he-coin-i"></span><span class="rt">' +
            (lit ? left + " more days to <b>" + REWARD + " FlipCoins</b>" : GOAL + " days earns <b>" + REWARD + " FlipCoins</b>") + '</span></div>' +
        '</div>' +
        '<div class="' + X + 'doors">' + HE.ORDER.map(function (p) {
          var c = HE.P[p], it = ph.pillarNext(p);
          return '<div class="' + X + 'door" role="button" tabindex="0" data-open="' + p + '" style="' + vars(p) + '" aria-label="Open ' + c.n + ', ' + c.score + ' ' + ph.scores[p] + ' percent">' +
            '<span class="' + X + 'orb">' + HE.icon(p, 20, 2) + '</span><span class="' + X + 'nm">' + c.n + '</span>' +
            '<span class="' + X + 'sc">' + ph.scores[p] + '<small>%</small></span>' +
            (it ? '<button class="' + X + 'plus" data-log="' + p + '" aria-label="' + it.tell + '"><span>' + HE.icon("plus", 14, 2.4) + '</span></button>'
                : '<span class="' + X + 'plus ok" aria-label="All logged"><span>' + HE.icon("check", 13, 2.6) + '</span></span>') + '</div>';
        }).join("") + '</div>';
      ph.slot.appendChild(w);

      /* the first log of the day: the redraw happens under the green, so today's flame lights once the green has gone */
      if (fresh) {
        S.lit = true;
        setTimeout(function () {
          if (!w.isConnected) return;
          var card = w.querySelector("." + X + "card"), now = w.querySelector("." + X + "day.now");
          var tf = now.querySelector("." + X + "fl"), big = w.querySelector("." + X + "big"), bar = w.querySelector("b.lit");
          now.classList.add("on"); tf.classList.add("on");
          big.classList.add("on");
          bar.style.width = (86 * HE.STREAK / 6) + "%";
          setTimeout(function () { card.classList.add("lit"); }, 500);
        }, 1900);
      }

      w.querySelector("." + X + "doors").addEventListener("click", function (e) {
        var b = e.target.closest("[data-log]");
        if (b) { e.stopPropagation(); var it = ph.pillarNext(b.dataset.log); if (it) ph.log([it.id], { how: "Quick" }); return; }
        if (e.target.closest("." + X + "plus.ok")) return;
        var o = e.target.closest("[data-open]"); if (o) ph.openPillar(o.dataset.open);
      });
      w.querySelector("." + X + "doors").addEventListener("keydown", function (e) {
        if ((e.key === "Enter" || e.key === " ") && e.target.matches("[data-open]")) { e.preventDefault(); ph.openPillar(e.target.dataset.open); }
      });
    }
  });
})();
