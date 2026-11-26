/* Door: Three doors. A greeting, then Eat, Move and Mind as three equal tall doors side by side,
   Measure as a slim row under them. Each door is the pillar's orb holding its score, its name,
   and one status line. The door with something due now carries a soft glow ring. Tap opens the pillar. */
(function () {
  var X = "drow-", E = "cubic-bezier(.2,0,0,1)";
  var SHORT = { sleep: "Sleep", weigh: "Weigh-in", bfast: "Breakfast", walk: "Walk", lunch: "Lunch", breath: "Breathing", stairs: "Stairs", snack: "Snack", gym: "Workout", dinner: "Dinner", mood: "Mood", wind: "Wind-down" };
  var ORB = "radial-gradient(130% 130% at 28% 18%,#fff 0%,var(--w) 32%,var(--t) 74%,color-mix(in srgb,var(--c) 35%,transparent) 100%)";
  var SHADOW = "0 12px 22px -10px color-mix(in srgb,var(--c) 40%,transparent),0 2px 4px color-mix(in srgb,var(--c) 14%,transparent),inset 0 -12px 18px -10px color-mix(in srgb,var(--c) 60%,transparent),inset 0 7px 12px -6px #fff,inset 0 0 0 1px color-mix(in srgb,var(--c) 14%,transparent)";
  var css = [
    "." + X + "hi{margin:0 0 16px}",
    "." + X + "hi h3{margin:0;font:700 22px/28px Roboto;color:#101828;letter-spacing:-.2px}",
    "." + X + "hi p{margin:4px 0 0;font:400 14px/20px Roboto;color:#667085}",
    "." + X + "row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}",
    "." + X + "d{position:relative;height:184px;border:1px solid #EAECF0;border-radius:20px;background:#fff;padding:16px 8px 12px;display:flex;flex-direction:column;align-items:center;text-align:center;cursor:pointer;font:inherit;color:inherit;" +
      "box-shadow:0 1px 2px rgba(16,24,40,.04);transition:transform .25s " + E + ",box-shadow .4s " + E + ",border-color .4s " + E + "}",
    "." + X + "d:active{transform:scale(.97)}",
    "." + X + "d:focus-visible{outline:2px solid var(--c);outline-offset:2px}",
    /* the glow ring on the door that has something due now: a still ring plus a slow breathing halo */
    "." + X + "d.now{border-color:color-mix(in srgb,var(--c) 45%,#fff);box-shadow:0 0 0 3px color-mix(in srgb,var(--c) 12%,transparent),0 12px 24px -12px color-mix(in srgb,var(--c) 45%,transparent)}",
    "." + X + "d.now::after{content:'';position:absolute;inset:-1px;border-radius:20px;pointer-events:none;box-shadow:0 0 0 6px color-mix(in srgb,var(--c) 10%,transparent);opacity:0;animation:" + X + "glow 3.2s ease-in-out infinite}",
    "@keyframes " + X + "glow{0%,100%{opacity:0}50%{opacity:1}}",
    "." + X + "o{position:relative;width:72px;height:72px;border-radius:50%;overflow:hidden;background:" + ORB + ";box-shadow:" + SHADOW + ";display:grid;place-items:center;flex:none}",
    "." + X + "liq{position:absolute;left:0;right:0;bottom:0;height:var(--lv);background:linear-gradient(180deg,var(--t) 0%,color-mix(in srgb,var(--c) 32%,transparent) 100%);transition:height 1s cubic-bezier(.42,.06,.36,.96)}",
    "." + X + "liq::before{content:'';position:absolute;left:-10%;right:-10%;top:-1px;height:3px;border-radius:50%;background:rgba(255,255,255,.6)}",
    "." + X + "spec{position:absolute;top:10%;left:18%;width:32%;height:22%;border-radius:50%;background:#fff;filter:blur(5px);opacity:.9}",
    "." + X + "n{position:relative;font:500 22px/1 'Playfair Display',serif;color:#101828}",
    "." + X + "n small{font-size:11px;color:#667085;margin-left:1px}",
    "." + X + "nm{margin-top:12px;font:700 15px/20px Roboto;color:#101828}",
    "." + X + "sc{font:500 11px/14px Roboto;color:#98A2B3;letter-spacing:.2px}",
    "." + X + "st{margin-top:auto;display:inline-flex;align-items:center;gap:4px;max-width:100%;font:500 12px/16px Roboto;color:#475467;white-space:nowrap}",
    "." + X + "st i{width:6px;height:6px;border-radius:50%;background:#D0D5DD;flex:none}",
    "." + X + "d.now ." + X + "st{color:var(--d);font-weight:600}",
    "." + X + "d.now ." + X + "st i{background:var(--c)}",
    "." + X + "st.ok{color:var(--d)}",
    "." + X + "st.ok u{width:14px;height:14px;border-radius:50%;background:var(--c);color:#fff;display:grid;place-items:center;text-decoration:none}",
    /* Measure: a slim fourth door under the three */
    "." + X + "m{position:relative;margin-top:8px;width:100%;height:64px;border:1px solid #EAECF0;border-radius:16px;background:#fff;padding:0 12px 0 10px;display:flex;align-items:center;gap:12px;cursor:pointer;font:inherit;color:inherit;text-align:left;box-shadow:0 1px 2px rgba(16,24,40,.04);transition:transform .25s " + E + ",box-shadow .4s " + E + ",border-color .4s " + E + "}",
    "." + X + "m:active{transform:scale(.985)}",
    "." + X + "m.now{border-color:color-mix(in srgb,var(--c) 45%,#fff);box-shadow:0 0 0 3px color-mix(in srgb,var(--c) 12%,transparent)}",
    "." + X + "m ." + X + "o{width:44px;height:44px}",
    "." + X + "m ." + X + "n{font-size:15px}",
    "." + X + "m ." + X + "n small{font-size:9px}",
    "." + X + "mt{flex:1;min-width:0}",
    "." + X + "mt b{display:block;font:700 14px/20px Roboto;color:#101828}",
    "." + X + "mt span{display:block;font:500 12px/16px Roboto;color:#667085}",
    "." + X + "m.now ." + X + "mt span{color:var(--d);font-weight:600}",
    "." + X + "m>svg{color:#98A2B3;flex:none}",
    "@media (prefers-reduced-motion: reduce){." + X + "d.now::after{animation:none;opacity:.6}." + X + "liq{transition:none}." + X + "d,." + X + "m{transition:none}}"
  ].join("");
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  function vars(p) { var c = HE.P[p]; return "--c:" + c.c + ";--t:" + c.t + ";--w:" + c.w + ";--d:" + c.d + ";"; }
  function orb(ph, p) {
    var sc = ph.scores[p];
    return '<span class="' + X + 'o" style="--lv:' + sc + '%"><span class="' + X + 'liq"></span><span class="' + X + 'spec"></span><span class="' + X + 'n">' + sc + '<small>%</small></span></span>';
  }
  /* one status line: what is due now, else what comes next, else all in */
  function status(ph, p, on) {
    var it = ph.pillarNext(p);
    if (!it) return { now: false, html: '<span class="' + X + 'st ok"><u>' + HE.icon("check", 10, 3.2) + '</u>All in</span>', aria: "all in" };
    var due = it.at <= HE.hour + .25, label = SHORT[it.id] + (due ? (on ? " now" : " waits") : " next");
    return { now: false, due: due, id: it.id, html: '<span class="' + X + 'st"><i></i>' + label + '</span>', aria: label };
  }
  function greet() {
    var part = HE.part(HE.hour);
    return part === "night" ? "Good night" : "Good " + part;
  }

  HE.add({
    id: "row", name: "Three doors", rec: false, group: "doors", kind: "Door",
    pitch: "The simplest Home top there is. A greeting, then Eat, Move and Mind as three equal doors side by side, each an orb holding its score with one line on what is next. The door with something due now glows softly, so the eye lands there first without being told.",
    how: [
      "A greeting by part of day, then three tall doors: Eat, Move, Mind. Each shows its orb and score, its score name, and one status line: Lunch next, Snack waits, or, on the glowing door, Workout now.",
      "The one door whose plan item is due now carries a soft glow ring that slowly breathes. Only one door glows at a time.",
      "Tap any door and that pillar opens, sliding in from the right. Back returns to Home.",
      "Measure sits as a slim fourth door under the three, with its own orb and status.",
      "When a pillar has everything in, its line turns to All in. When all four are in, the greeting says so and nothing glows."
    ],
    score: [["Three doors at a glance", "y"], ["One tap in", "y"], ["A hook to start", "m"], ["GoodFlip look", "y"], ["Calm", "y"]],
    catch: "The glow is the only hook: it points at a door but gives no reason to open it. Someone with low motivation sees three scores and a status line, which may not be enough to start.",
    from: "Tide's row of quick-action tiles (Focus Timer, Quick Nap, Breathwork), the live Home's ScoreBubbles orb skin, and the three-square widget row of the Welcome David dashboard pin.",
    tryit: "Tap the glowing door to open it, switch to Evening to see the glow move to Move, then try Measure.",
    effort: "Low, one row of cards and the existing orb skin",
    draw: function (ph) {
      var open = ph.open(), next = ph.next(), glow = next && next.at <= HE.hour + .25 ? next.p : null;
      var sub = !open.length ? "Everything is in. Rest easy." : HE.part(HE.hour) === "morning" ? "Pick a door to begin." : HE.part(HE.hour) === "night" ? "A few things left before bed." : "Pick up where you left off.";
      var doors = ["eat", "move", "mind"].map(function (p) {
        var c = HE.P[p], on = glow === p, s = status(ph, p, on);
        return '<button class="' + X + 'd' + (on ? " now" : "") + '" data-p="' + p + '" style="' + vars(p) + '" aria-label="' + c.n + ', ' + c.score + ' ' + ph.scores[p] + ' percent, ' + s.aria + (on ? ", due now" : "") + '. Open ' + c.n + '">' +
          orb(ph, p) + '<span class="' + X + 'nm">' + c.n + '</span><span class="' + X + 'sc">' + c.score + '</span>' + s.html + '</button>';
      }).join("");
      var mon = glow === "measure", m = status(ph, "measure", mon), mt = m.id ? (m.due ? (mon ? "Weigh in now" : "Weigh-in waits") : "Weigh-in next") : "All in";
      ph.slot.innerHTML = '<div class="' + X + 'hi"><h3>' + greet() + '</h3><p>' + sub + '</p></div>' +
        '<div class="' + X + 'row" role="group" aria-label="Your pillars">' + doors + '</div>' +
        '<button class="' + X + 'm' + (mon ? " now" : "") + '" data-p="measure" style="' + vars("measure") + '" aria-label="Measure ' + ph.scores.measure + ' percent, ' + mt + '. Open Measure">' + orb(ph, "measure") +
        '<span class="' + X + 'mt"><b>Measure</b><span>' + mt + '</span></span>' + HE.icon("chev", 18, 2) + '</button>';
      ph.slot.onclick = function (e) { var d = e.target.closest("[data-p]"); if (d) ph.openPillar(d.getAttribute("data-p")); };
    }
  });
})();
