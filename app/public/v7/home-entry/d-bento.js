/* Door: Bento. A large hero tile on top (the metabolism score in a soft four-pillar gradient, one big number,
   and one KAIRA line on why the thing due now matters), then Eat, Move, Mind and Measure as a 2x2 bento,
   each with its glyph, score and a 7-day bar. Tiles open their pillars; the hero explains how the four add up. */
(function () {
  var X = "dbento-", E = "cubic-bezier(.2,0,0,1)";
  /* KAIRA's hook: why the pillar with the most to give is worth opening now (a mechanism, never a recap) */
  var HOOK = {
    sleep: "Short sleep makes the body less sensitive to insulin, so last night sets how breakfast lands.",
    weigh: "Weighing before food, at the same time, gives the truest trend.",
    bfast: "Protein at breakfast keeps you fuller and steadies sugar until lunch.",
    walk: "A morning walk helps your muscles pull sugar from the blood for hours.",
    lunch: "A walk within an hour of lunch blunts the sugar rise from it.",
    breath: "Five slow minutes lowers the stress hormones that push sugar up.",
    stairs: "Two minutes of stairs helps your muscles use sugar right away.",
    snack: "A small protein snack now stops the big hunger that makes dinner heavy.",
    gym: "Strength work builds muscle, and muscle is where most sugar goes.",
    dinner: "An earlier, lighter dinner gives sugar time to settle before sleep.",
    mood: "Naming how the day felt makes stress easier to spot early.",
    wind: "Screen light delays melatonin, so phone away now means easier sleep.",
    done: "Sleep is when insulin sensitivity resets, so a steady bedtime keeps what you built."
  };
  var css = [
    "." + X + "w{display:flex;flex-direction:column;gap:8px}",
    /* the hero: white base, four soft pillar blooms, glass content */
    "." + X + "h{position:relative;overflow:hidden;height:176px;border-radius:24px;border:1px solid #EAECF0;padding:16px;text-align:left;cursor:pointer;font:inherit;color:inherit;width:100%;display:flex;flex-direction:column;" +
      "background:radial-gradient(70% 90% at 0% 0%,color-mix(in srgb,#299D6B 26%,transparent),transparent 70%),radial-gradient(70% 90% at 100% 0%,color-mix(in srgb,#444CE7 22%,transparent),transparent 70%)," +
      "radial-gradient(70% 90% at 100% 100%,color-mix(in srgb,#2DA6A6 26%,transparent),transparent 70%),radial-gradient(60% 80% at 0% 100%,color-mix(in srgb,#CDA935 22%,transparent),transparent 70%),#fff;" +
      "box-shadow:0 1px 2px rgba(16,24,40,.04),0 16px 28px -18px rgba(68,76,231,.35);transition:transform .25s " + E + "}",
    "." + X + "h:active{transform:scale(.985)}",
    "." + X + "h:focus-visible{outline:2px solid #444CE7;outline-offset:2px}",
    "." + X + "h::before{content:'';position:absolute;inset:0;background:radial-gradient(60% 60% at 50% 40%,rgba(255,255,255,.75),transparent 70%);pointer-events:none}",
    "." + X + "h>*{position:relative}",
    "." + X + "ht{display:flex;align-items:center;gap:8px}",
    "." + X + "ht b{font:600 13px/18px Roboto;color:#344054}",
    "." + X + "gl{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.7);box-shadow:inset 0 0 0 1px rgba(255,255,255,.9),0 2px 6px rgba(16,24,40,.06);display:grid;place-items:center}",
    "." + X + "go{margin-left:auto;width:36px;height:36px;border-radius:50%;background:#fff;box-shadow:0 2px 6px rgba(16,24,40,.08);display:grid;place-items:center;color:#344054}",
    "." + X + "go svg{transform:rotate(-45deg)}",
    "." + X + "hm{display:flex;align-items:flex-end;justify-content:space-between;margin:8px 0 12px}",
    "." + X + "big{font:500 48px/1 'Playfair Display',serif;color:#101828;letter-spacing:-1px}",
    "." + X + "big small{font:500 18px/1 'Playfair Display',serif;color:#475467;margin-left:2px;letter-spacing:0}",
    /* the dots: one per pillar, sized by its score, like the pin's growing dots */
    "." + X + "dots{display:flex;align-items:center;gap:8px;padding-bottom:6px}",
    "." + X + "dots i{border-radius:50%;background:var(--c);box-shadow:0 0 0 3px rgba(255,255,255,.75);transition:width .8s " + E + ",height .8s " + E + "}",
    "." + X + "k{display:flex;gap:8px;align-items:flex-start;margin-top:auto;font:400 12.5px/17px Roboto;color:#344054}",
    "." + X + "k svg{flex:none;margin-top:1px}",
    /* the 2x2 */
    "." + X + "g{display:grid;grid-template-columns:1fr 1fr;gap:8px}",
    "." + X + "t{position:relative;height:112px;border:1px solid #EAECF0;border-radius:20px;background:#fff;padding:12px;display:flex;flex-direction:column;text-align:left;cursor:pointer;font:inherit;color:inherit;box-shadow:0 1px 2px rgba(16,24,40,.04);transition:transform .25s " + E + "}",
    "." + X + "t:active{transform:scale(.97)}",
    "." + X + "t:focus-visible{outline:2px solid var(--c);outline-offset:2px}",
    "." + X + "tt{display:flex;align-items:center;gap:8px}",
    "." + X + "ic{position:relative;width:32px;height:32px;border-radius:50%;background:var(--t);color:var(--d);display:grid;place-items:center;flex:none}",
    "." + X + "ic u{position:absolute;top:-1px;right:-1px;width:9px;height:9px;border-radius:50%;background:var(--c);box-shadow:0 0 0 2px #fff}",
    "." + X + "tn{flex:1;min-width:0}",
    "." + X + "tn b{display:block;font:700 13px/16px Roboto;color:#101828}",
    "." + X + "tn span{display:block;font:500 11px/14px Roboto;color:#98A2B3}",
    "." + X + "tt>svg{color:#98A2B3;flex:none}",
    "." + X + "tb{margin-top:auto;display:flex;align-items:flex-end;justify-content:space-between;gap:8px}",
    "." + X + "n{font:500 26px/1 'Playfair Display',serif;color:#101828}",
    "." + X + "n small{font-size:12px;color:#667085;margin-left:1px}",
    "." + X + "bars{display:flex;align-items:flex-end;gap:3px;height:28px}",
    "." + X + "bars i{width:5px;border-radius:3px;background:var(--t)}",
    "." + X + "bars i:last-child{background:var(--c)}",
    /* the sheet */
    "." + X + "sx{margin:0 0 16px;font:400 14px/20px Roboto;color:#475467}",
    "." + X + "sr{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #F2F4F7}",
    "." + X + "sr:last-of-type{border:0}",
    "." + X + "sr .nm{width:72px;font:600 14px/20px Roboto;color:#101828}",
    "." + X + "sr .tr{flex:1;height:8px;border-radius:4px;background:#F2F4F7;overflow:hidden}",
    "." + X + "sr .tr i{display:block;height:100%;border-radius:4px;background:var(--c)}",
    "." + X + "sr .v{width:40px;text-align:right;font:600 14px/20px Roboto;color:#101828}",
    "." + X + "sum{display:flex;justify-content:space-between;align-items:baseline;margin-top:12px;padding:12px 14px;border-radius:14px;background:#F9FAFB;font:600 14px/20px Roboto;color:#344054}",
    "." + X + "sum b{font:500 22px/1 'Playfair Display',serif;color:#101828}",
    "@media (prefers-reduced-motion: reduce){." + X + "h,." + X + "t,." + X + "dots i{transition:none}}"
  ].join("");
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  function vars(p) { var c = HE.P[p]; return "--c:" + c.c + ";--t:" + c.t + ";--w:" + c.w + ";--d:" + c.d + ";"; }
  function total(ph) { return Math.round(HE.ORDER.reduce(function (a, p) { return a + ph.scores[p]; }, 0) / 4); }
  /* the pillar the hook points at: the one with something due now first, else the lowest score with something left */
  function lift(ph) {
    var n = ph.due()[0]; if (n) return n.id;
    var left = HE.ORDER.filter(function (p) { return ph.pillarNext(p); });
    if (!left.length) return "done";
    return ph.pillarNext(left.sort(function (a, b) { return ph.scores[a] - ph.scores[b]; })[0]).id;
  }
  function bars(ph, p) {
    var w = HE.WEEK[p].slice(0, 6).concat(ph.scores[p]);
    return '<span class="' + X + 'bars" aria-hidden="true">' + w.map(function (v) { return '<i style="height:' + Math.max(4, Math.round(v / 100 * 28)) + 'px"></i>'; }).join("") + '</span>';
  }

  HE.add({
    id: "bento", name: "Bento", rec: false, group: "doors", kind: "Door",
    pitch: "One number on top, four doors under it. A hero tile shows the metabolism score in a soft blend of all four pillar colours, with one KAIRA line on why the thing due now matters. Under it, Eat, Move, Mind and Measure sit as equal tiles, each with its score and a week of bars.",
    how: [
      "The hero tile shows the metabolism score as one big number, four dots sized by each pillar, and a KAIRA line on why the thing due now matters (or, if nothing is due, the lowest pillar's next item).",
      "Under it, a 2x2 of Eat, Move, Mind and Measure. Each tile has its glyph, score and a 7-day bar, with today in full colour.",
      "A small dot on a tile's glyph means something there is due now.",
      "Tap a tile to open that pillar. Tap the hero to see, in a short sheet, how the four scores add up to one.",
      "When everything is in, the hero's KAIRA line turns to why the night matters."
    ],
    score: [["Three doors at a glance", "y"], ["One tap in", "y"], ["A hook to start", "y"], ["GoodFlip look", "y"], ["Calm", "m"]],
    catch: "Five numbers and four charts above the fold is a lot for someone who just wants to log lunch. The metabolism score as an even average is a stand-in: the real weighting needs a product decision.",
    from: "The Credit Factors pin (gradient hero, then a 2x2 bento with icon, number, tiny chart and arrow), Oura's readiness tile, and Apple Fitness summary tiles.",
    tryit: "Tap the hero to see how the four add up, then tap Move. Switch to Evening and watch the KAIRA line move.",
    effort: "Low, static tiles plus one sheet",
    draw: function (ph) {
      var tot = total(ph), L = lift(ph), dueP = {};
      ph.due().forEach(function (x) { dueP[x.p] = 1; });
      var dots = HE.ORDER.map(function (p) { var d = 6 + Math.round(ph.scores[p] / 100 * 12); return '<i style="--c:' + HE.P[p].c + ';width:' + d + 'px;height:' + d + 'px"></i>'; }).join("");
      var tiles = HE.ORDER.map(function (p) {
        var c = HE.P[p];
        return '<button class="' + X + 't" data-p="' + p + '" style="' + vars(p) + '" aria-label="' + c.n + ', ' + c.score + ' ' + ph.scores[p] + ' percent' + (dueP[p] ? ', something due now' : '') + '. Open ' + c.n + '">' +
          '<span class="' + X + 'tt"><span class="' + X + 'ic">' + HE.icon(p, 18, 2) + (dueP[p] ? '<u></u>' : '') + '</span><span class="' + X + 'tn"><b>' + c.n + '</b><span>' + (p === "measure" ? "Weight" : c.score) + '</span></span>' + HE.icon("chev", 16, 2) + '</span>' +
          '<span class="' + X + 'tb"><span class="' + X + 'n">' + ph.scores[p] + '<small>%</small></span>' + bars(ph, p) + '</span></button>';
      }).join("");
      ph.slot.innerHTML = '<div class="' + X + 'w">' +
        '<button class="' + X + 'h" data-hero="1" aria-label="Metabolism score ' + tot + ' percent. See how it adds up">' +
          '<span class="' + X + 'ht"><b>Metabolism score</b><span class="' + X + 'go">' + HE.icon("arrow", 16, 2.2) + '</span></span>' +
          '<span class="' + X + 'hm"><span class="' + X + 'big">' + tot + '<small>%</small></span><span class="' + X + 'dots" aria-hidden="true">' + dots + '</span></span>' +
          '<span class="' + X + 'k">' + HE.kaira(16) + '<span>' + HOOK[L] + '</span></span></button>' +
        '<div class="' + X + 'g" role="group" aria-label="Your pillars">' + tiles + '</div></div>';
      ph.slot.onclick = function (e) {
        var t = e.target.closest("[data-p]"); if (t) return ph.openPillar(t.getAttribute("data-p"));
        if (!e.target.closest("[data-hero]")) return;
        ph.sheet("How your score adds up",
          '<p class="' + X + 'sx">Your metabolism score blends your four pillars. Each one rises as you log its plan, so anything you log moves it.</p>' +
          HE.ORDER.map(function (p) { var c = HE.P[p]; return '<div class="' + X + 'sr" style="' + vars(p) + '"><span class="nm">' + c.n + '</span><span class="tr"><i style="width:' + ph.scores[p] + '%"></i></span><span class="v">' + ph.scores[p] + '%</span></div>'; }).join("") +
          '<div class="' + X + 'sum"><span>Metabolism score</span><b>' + tot + '%</b></div>', null, "Four pillars, one number");
      };
    }
  });
})();
