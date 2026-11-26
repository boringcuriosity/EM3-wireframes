/* Hook: One small win. A quiet greeting, then one card with the single small thing worth doing right now and what
   it earns (its score gain and a FlipCoin). Do it logs it with the green win; Another idea offers the best one from
   another pillar. After a win the card says thanks for a moment, then offers the next one. The four doors sit
   under it as orbs that open their pillars. */
(function () {
  var X = "dwin-";
  var E = "cubic-bezier(.2,0,0,1)", E2 = "cubic-bezier(.4,0,.2,1)";
  /* each plan item said as a small win */
  var WIN = { sleep: "Tell us how you slept", weigh: "Step on the scale", bfast: "Log your breakfast", walk: "A 20 minute walk",
    lunch: "Log your lunch", breath: "5 minutes of slow breathing", stairs: "Take the stairs once", snack: "Log your evening snack",
    gym: "Your strength workout", dinner: "Log your dinner", mood: "A quick mood check-in", wind: "Phone away, lights low" };
  var HELLO = { morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening", night: "Good evening" };
  var ORB = "radial-gradient(130% 130% at 28% 18%,#fff 0%,var(--w) 32%,var(--t) 74%,color-mix(in srgb,var(--c) 38%,transparent) 100%)";
  var ORBSH = "0 12px 22px -10px color-mix(in srgb,var(--c) 40%,transparent),0 2px 4px color-mix(in srgb,var(--c) 14%,transparent),inset 0 -12px 18px -10px color-mix(in srgb,var(--c) 62%,transparent),inset 0 7px 12px -7px #fff,inset 0 0 0 1px color-mix(in srgb,var(--c) 12%,transparent)";

  var css = [
    "." + X + "w{display:flex;flex-direction:column;gap:16px}",
    "." + X + "hi{display:flex;align-items:center;gap:8px;padding:0 4px;font:600 20px/26px Roboto;color:#101828;letter-spacing:-.2px}",
    "." + X + "hi span{color:#98A2B3;display:grid}",
    /* the card: white, with a soft orb of the pillar's colour drifting in its corner */
    "." + X + "card{position:relative;border-radius:24px;padding:16px;background:#fff;overflow:hidden;isolation:isolate;" +
      "box-shadow:inset 0 0 0 1px #EAECF0,0 12px 28px -18px rgba(16,24,40,.22),0 1px 2px rgba(16,24,40,.04)}",
    "." + X + "art{position:absolute;right:-60px;top:-70px;width:220px;height:220px;border-radius:50%;z-index:-1;" +
      "background:radial-gradient(circle at 40% 60%,color-mix(in srgb,var(--c) 22%,transparent) 0%,color-mix(in srgb,var(--c) 8%,transparent) 45%,transparent 70%);filter:blur(14px);transition:background .6s " + E + "}",
    "." + X + "art::after{content:'';position:absolute;left:-90px;top:150px;width:140px;height:140px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--c) 7%,transparent),transparent 70%)}",
    "." + X + "in{display:flex;flex-direction:column;gap:12px}",
    "." + X + "in.fresh{animation:" + X + "in .45s " + E + " both}",
    "@keyframes " + X + "in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}",
    "." + X + "ey{font:600 12px/16px Roboto;color:#667085;letter-spacing:.1px}",
    "." + X + "what{display:flex;align-items:center;gap:14px}",
    "." + X + "orb{position:relative;width:56px;height:56px;border-radius:50%;flex:none;display:grid;place-items:center;color:var(--d);background:" + ORB + ";box-shadow:" + ORBSH + "}",
    "." + X + "orb::before{content:'';position:absolute;top:10%;left:18%;width:34%;height:22%;border-radius:50%;background:#fff;filter:blur(4px);opacity:.85}",
    "." + X + "orb svg{position:relative}",
    "." + X + "what h4{margin:0;font:700 17px/22px Roboto;color:#101828;letter-spacing:-.1px}",
    "." + X + "what small{display:block;font:400 13px/18px Roboto;color:#667085;margin-top:2px}",
    "." + X + "rw{display:flex;gap:8px;flex-wrap:wrap}",
    "." + X + "rw span{height:28px;padding:0 10px 0 8px;border-radius:999px;display:inline-flex;align-items:center;gap:6px;font:600 12.5px/1 Roboto}",
    "." + X + "rw .sc{background:var(--w);color:var(--d);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--c) 22%,transparent)}",
    "." + X + "rw .sc i{width:16px;height:16px;border-radius:50%;background:var(--c);color:#fff;display:grid;place-items:center}",
    "." + X + "rw .co{background:#FFFBEE;color:#A68A2D;box-shadow:inset 0 0 0 1px #FEF1C7}",
    "." + X + "rw .co b{width:14px;height:14px;background:linear-gradient(135deg,#E7C144,#A68A2D);clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)}",
    "." + X + "bt{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:4px;padding-bottom:5px}",
    "." + X + "bt .he-pri,." + X + "bt .he-sec{height:44px;font-size:14px}",
    /* the brief thanks after a win, laid over the next idea and then lifted away */
    "." + X + "ty{position:absolute;inset:0;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;z-index:2;transition:opacity .5s " + E + "}",
    "." + X + "ty.out{opacity:0;pointer-events:none}",
    "." + X + "ty .ck{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;color:#fff;background:radial-gradient(120% 120% at 30% 20%,#5BC596,#299D6B);box-shadow:0 10px 20px -10px rgba(41,157,107,.7),inset 0 -6px 10px -6px rgba(0,0,0,.18)}",
    "." + X + "ty b{font:700 17px/22px Roboto;color:#101828}",
    "." + X + "ty span{font:400 13px/18px Roboto;color:#667085}",
    /* the calm end of the day */
    "." + X + "rest{display:flex;align-items:center;gap:14px;min-height:96px}",
    "." + X + "rest p{margin:0;font:400 13px/18px Roboto;color:#667085}.{X}rest p b{display:block;font:700 17px/22px Roboto;color:#101828;margin-bottom:2px}",
    /* the four doors as orbs */
    "." + X + "row{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}",
    "." + X + "door{border:0;background:none;padding:4px 0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;border-radius:16px}",
    "." + X + "door:focus-visible{outline:2px solid var(--c);outline-offset:2px}",
    "." + X + "door ." + X + "orb{width:52px;height:52px;transition:transform .25s ease-out}",
    "." + X + "door:active ." + X + "orb{transform:scale(.96)}",
    "." + X + "door.on ." + X + "orb{box-shadow:" + ORBSH + ",0 0 0 3px #fff,0 0 0 4.5px color-mix(in srgb,var(--c) 40%,transparent)}",
    "." + X + "nm{font:600 12px/16px Roboto;color:#344054}",
    "." + X + "pc{font:500 15px/16px 'Playfair Display',serif;color:#101828;margin-top:-2px}",
    "." + X + "pc small{font:500 10px/1 Roboto;color:#667085;margin-left:1px}",
    "@media (prefers-reduced-motion: reduce){." + X + "in.fresh{animation:none}." + X + "ty{transition:none}}"
  ].join("").replace(/\.\{X\}/g, "." + X);
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  /* the small wins on offer now, one per pillar, best first: what it adds, a boost if it is due, less the longer it waits */
  function ideas(ph) {
    return HE.ORDER.map(function (p) { return ph.pillarNext(p); }).filter(Boolean).map(function (x) {
      var due = x.at <= HE.hour + .25;
      return { x: x, v: x.gain + (due ? 20 : -3 * (x.at - HE.hour)) };
    }).sort(function (a, b) { return b.v - a.v; }).map(function (o) { return o.x; });
  }
  function vars(p) { var c = HE.P[p]; return "--c:" + c.c + ";--t:" + c.t + ";--w:" + c.w + ";--d:" + c.d; }

  HE.add({
    id: "win", group: "doors", kind: "Hook", name: "One small win",
    pitch: "One small thing worth doing right now, and exactly what it earns. The card picks the pillar that would gain the most, so starting is one tap, and the four doors sit right under it for anything else.",
    how: [
      "A quiet greeting, then one card: the small win for right now, with its score gain and a FlipCoin.",
      "It comes from the pillar that would gain the most, weighed by what is due now and what waits until later.",
      "Do it logs it: the green win plays, the coin count rises, and the card says thanks before offering the next one.",
      "Another idea swaps in the best small win from another pillar, and keeps cycling.",
      "The four doors under it open their pillars. When everything is in, the card rests with a calm line."
    ],
    score: [["Three doors at a glance", "y"], ["One tap in", "y"], ["A hook to start", "y"], ["GoodFlip look", "y"], ["Calm", "y"]],
    catch: "Rewards can turn a health habit into coin chasing, and logging with Do it skips the detail (what was eaten, how it went). Cycling ideas is one more decision for someone who just wants to open Eat.",
    from: "Tide's quick-action tiles and soft orb (pin), Duolingo's next lesson with its XP, Finch's small goals, the overlapping app tiles pin for the row under it.",
    tryit: "Tap Another idea a few times, then Do it, and watch the thanks hand over to the next win. Try Evening.",
    effort: "Low, one card and the live orb skin",
    draw: function (ph) {
      var w = ph._w || (ph._w = { i: 0, hour: HE.hour, thx: null, fresh: false });
      if (w.hour !== HE.hour) { w.hour = HE.hour; w.i = 0; }
      var list = ideas(ph), n = list.length, part = HE.part(HE.hour);
      if (w.i >= n) w.i = 0;
      var it = list[w.i], thx = w.thx && Date.now() - w.thx.t < 1500 ? w.thx : null;
      if (!thx) w.thx = null;

      var card;
      if (!it) {
        card = '<div class="' + X + 'card" style="' + vars("mind") + '"><div class="' + X + 'art"></div><div class="' + X + 'rest">' +
          '<span class="' + X + 'orb">' + HE.icon("moon", 22, 2) + '</span><p><b>Everything on your plan is in</b>Rest well. A fresh small win waits for you in the morning.</p></div></div>';
      } else {
        var c = HE.P[it.p];
        card = '<div class="' + X + 'card" style="' + vars(it.p) + '"><div class="' + X + 'art"></div>' +
          '<div class="' + X + 'in' + (w.fresh ? " fresh" : "") + '" aria-live="polite">' +
            '<div class="' + X + 'ey">Your small win now</div>' +
            '<div class="' + X + 'what"><span class="' + X + 'orb">' + HE.icon(it.p, 24, 2) + '</span><div><h4>' + WIN[it.id] + '</h4><small>' + it.sub + '</small></div></div>' +
            '<div class="' + X + 'rw"><span class="sc"><i>' + HE.icon("plus", 10, 3.4) + '</i>' + it.gain + '% ' + c.score + '</span><span class="co"><b></b>+1 FlipCoin</span></div>' +
            '<div class="' + X + 'bt"><button class="he-pri" data-do="' + it.id + '">Do it</button>' +
              (n > 1 ? '<button class="he-sec" data-next>Another idea</button>' : '<button class="he-sec" data-open="' + it.p + '">Open ' + c.n + '</button>') + '</div>' +
          '</div>' +
          (thx ? '<div class="' + X + 'ty"><span class="ck">' + HE.icon("check", 24, 3) + '</span><div><b>Nicely done</b><br><span>Here is your next small win.</span></div></div>' : "") +
          '</div>';
      }
      w.fresh = false;

      var root = document.createElement("div"); root.className = X + "w";
      root.innerHTML = '<div class="' + X + 'hi"><span>' + HE.icon(part === "night" || part === "evening" ? "moon" : "sun", 20, 2) + '</span>' + HELLO[part] + '</div>' + card +
        '<div class="' + X + 'row" role="group" aria-label="Open a pillar">' + HE.ORDER.map(function (p) {
          var c = HE.P[p];
          return '<button class="' + X + 'door' + (it && p === it.p ? " on" : "") + '" data-open="' + p + '" style="' + vars(p) + '" aria-label="' + c.n + ', ' + c.score + ' ' + ph.scores[p] + ' percent. Open ' + c.n + '">' +
            '<span class="' + X + 'orb">' + HE.icon(p, 22, 2) + '</span><span class="' + X + 'nm">' + c.n + '</span><span class="' + X + 'pc">' + ph.scores[p] + '<small>%</small></span></button>';
        }).join("") + '</div>';
      ph.slot.appendChild(root);

      /* the thanks stays until the green has gone, then lifts away to show the next small win */
      if (thx) { var ty = root.querySelector("." + X + "ty"); setTimeout(function () { if (ty) ty.classList.add("out"); }, Math.max(0, thx.t + 3500 - Date.now())); }

      root.addEventListener("click", function (e) {
        var d = e.target.closest("[data-do]");
        if (d) { w.thx = { t: Date.now() }; w.i = 0; ph.log([d.getAttribute("data-do")]); return; }
        if (e.target.closest("[data-next]")) { w.i = (w.i + 1) % n; w.fresh = true; ph.draw(); return; }
        var o = e.target.closest("[data-open]"); if (o) ph.openPillar(o.getAttribute("data-open"));
      });
    }
  });
})();
