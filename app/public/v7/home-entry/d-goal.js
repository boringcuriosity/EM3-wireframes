/* Hook: Fill your day. One soft glass ring split into Eat, Move, Mind and Measure, each part filled to its score,
   with a small dot on each part as the gentle goal. The centre names the one part worth lifting now and offers
   its next log. Under the ring, the four doors side by side, each with its score as a soft fill. Logging plays the
   green win, then the part of the ring fills smoothly to its new score. */
(function () {
  var X = "dgoal-";
  var E = "cubic-bezier(.2,0,0,1)", E2 = "cubic-bezier(.4,0,.2,1)";
  var R = 100, SW = 16, GOAL = 0.7, Q = { eat: 0, move: 1, mind: 2, measure: 3 };
  /* the short label for the one action in the centre, by plan item */
  var ACT = { sleep: "Log your sleep", weigh: "Weigh in", bfast: "Log breakfast", walk: "Log the walk", lunch: "Log lunch",
    breath: "Breathe for 5 min", stairs: "Log the stairs", snack: "Log your snack", gym: "Log the workout", dinner: "Log dinner",
    mood: "Check in", wind: "Phone away" };
  var WHEN = { morning: "this morning", afternoon: "this afternoon", evening: "this evening", night: "before bed" };
  var HELLO = { morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening", night: "Good evening" };

  var css = [
    "." + X + "w{display:flex;flex-direction:column;gap:16px}",
    "." + X + "hd{display:flex;flex-direction:column;gap:4px;padding:0 4px}",
    "." + X + "hd h3{margin:0;font:700 20px/26px Roboto;color:#101828;letter-spacing:-.2px}",
    "." + X + "hd p{margin:0;font:400 13px/18px Roboto;color:#667085;display:flex;align-items:center;gap:6px}",
    "." + X + "hd p i{width:8px;height:8px;border-radius:50%;background:#fff;box-shadow:0 0 0 1.5px #98A2B3;flex:none}",
    /* the ring */
    "." + X + "ring{position:relative;width:240px;height:240px;margin:0 auto}",
    "." + X + "halo{position:absolute;inset:6px;border-radius:50%;background:conic-gradient(from 0deg,#299D6B 0deg,#444CE7 120deg,#2DA6A6 220deg,#CDA935 300deg,#299D6B 360deg);filter:blur(26px);opacity:.2}",
    "." + X + "ring>svg{position:absolute;inset:0;overflow:visible}",
    "." + X + "fill,." + X + "glow,." + X + "shine{transition:stroke-dashoffset 1.3s " + E2 + "}",
    "." + X + "glow{filter:blur(6px);opacity:.7}",
    "." + X + "hit{cursor:pointer;pointer-events:stroke;outline:none}",
    "." + X + "hit:focus-visible{stroke:rgba(16,24,40,.08)}",
    /* the glass disc in the middle, with a soft inner glow in the colour of the part worth lifting */
    "." + X + "disc{position:absolute;left:50%;top:50%;width:160px;height:160px;margin:-80px 0 0 -80px;border-radius:50%;" +
      "background:radial-gradient(120% 120% at 30% 18%,#fff 0%,#fff 46%,color-mix(in srgb,var(--f) 7%,#fff) 100%);" +
      "box-shadow:0 18px 32px -18px rgba(16,24,40,.28),0 2px 6px rgba(16,24,40,.05),inset 0 -22px 34px -22px color-mix(in srgb,var(--f) 55%,transparent),inset 0 10px 18px -10px #fff,inset 0 0 0 1px rgba(16,24,40,.05);" +
      "display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:10px;padding:0 18px;transition:box-shadow .8s " + E + "}",
    "." + X + "disc::before{content:'';position:absolute;top:9%;left:22%;width:40%;height:18%;border-radius:50%;background:#fff;filter:blur(7px);opacity:.9;pointer-events:none}",
    "." + X + "disc p{position:relative;margin:0;font:500 14px/19px Roboto;color:#344054}",
    "." + X + "disc p b{font-weight:700;color:var(--fd)}",
    "." + X + "disc p small{display:block;font:400 12px/16px Roboto;color:#667085;margin-top:4px}",
    "." + X + "act{position:relative;height:40px;padding:0 14px 0 10px;border-radius:999px;border:0;cursor:pointer;display:inline-flex;align-items:center;gap:6px;" +
      "font:600 13px/1 Roboto;color:var(--fd);background:color-mix(in srgb,var(--f) 9%,#fff);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--f) 28%,transparent),0 3px 0 color-mix(in srgb,var(--f) 18%,#fff);transition:transform .2s ease-out,box-shadow .2s ease-out;white-space:nowrap}",
    "." + X + "act:active{transform:translateY(3px);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--f) 28%,transparent)}",
    "." + X + "act:focus-visible{outline:2px solid var(--f);outline-offset:2px}",
    "." + X + "act u{width:22px;height:22px;border-radius:50%;background:var(--f);color:#fff;display:grid;place-items:center;text-decoration:none}",
    /* the four doors, each with its score as a soft fill rising from the bottom */
    "." + X + "row{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}",
    "." + X + "door{position:relative;height:104px;border-radius:20px;border:0;padding:12px 8px 10px;background:#fff;cursor:pointer;overflow:hidden;text-align:center;" +
      "box-shadow:inset 0 0 0 1px #EAECF0,0 1px 2px rgba(16,24,40,.04);display:flex;flex-direction:column;align-items:center;gap:6px;transition:box-shadow .6s " + E + ",transform .2s ease-out}",
    "." + X + "door:active{transform:scale(.98)}",
    "." + X + "door:focus-visible{outline:2px solid var(--c);outline-offset:2px}",
    "." + X + "door.on{box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--c) 45%,transparent),0 10px 22px -12px color-mix(in srgb,var(--c) 55%,transparent)}",
    "." + X + "liq{position:absolute;left:0;right:0;bottom:0;height:var(--lv);background:linear-gradient(180deg,color-mix(in srgb,var(--t) 0%,transparent) 0%,var(--t) 22px,color-mix(in srgb,var(--c) 16%,var(--t)) 100%);transition:height 1.3s " + E2 + "}",
    "." + X + "ic{position:relative;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;color:var(--d);" +
      "background:radial-gradient(130% 130% at 28% 18%,#fff 0%,var(--w) 34%,var(--t) 78%,color-mix(in srgb,var(--c) 30%,transparent) 100%);box-shadow:inset 0 -6px 10px -6px color-mix(in srgb,var(--c) 60%,transparent),0 4px 8px -4px color-mix(in srgb,var(--c) 40%,transparent)}",
    "." + X + "nm{position:relative;font:600 12px/16px Roboto;color:#344054}",
    "." + X + "sc{position:relative;font:500 20px/22px 'Playfair Display',serif;color:#101828;margin-top:auto}",
    "." + X + "sc small{font:500 11px/1 Roboto;color:#667085;margin-left:1px}",
    "@media (prefers-reduced-motion: reduce){." + X + "fill,." + X + "glow,." + X + "shine,." + X + "liq{transition:none}}"
  ].join("");
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  /* a pillar colour lifted toward white by k (SVG stops do not take color-mix) */
  function lift(h, k) { var n = parseInt(h.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255; return "rgb(" + [r, g, b].map(function (v) { return Math.round(v + (255 - v) * k); }).join(",") + ")"; }
  function pt(a, r) { var t = a * Math.PI / 180; return [(120 + r * Math.sin(t)).toFixed(2), (120 - r * Math.cos(t)).toFixed(2)]; }
  function arc(p, r) { var q = Q[p], a = pt(q * 90 + 8, r), b = pt(q * 90 + 82, r); return "M" + a[0] + " " + a[1] + " A" + r + " " + r + " 0 0 1 " + b[0] + " " + b[1]; }

  /* the part worth lifting now: the lowest score among the parts that still have something to log */
  function focus(ph) {
    var open = HE.ORDER.filter(function (p) { return ph.pillarNext(p); });
    if (!open.length) return null;
    return open.sort(function (a, b) { return ph.scores[a] - ph.scores[b]; })[0];
  }

  function ringSVG() {
    var defs = "", body = "";
    HE.ORDER.forEach(function (p) {
      var c = HE.P[p], q = Q[p], a = pt(q * 90 + 8, R), b = pt(q * 90 + 82, R), g = pt(q * 90 + 8 + 74 * GOAL, R), d = arc(p, R);
      defs += '<linearGradient id="' + X + 'g-' + p + '-ID" gradientUnits="userSpaceOnUse" x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '">' +
        '<stop offset="0" stop-color="' + lift(c.c, .3) + '"/><stop offset="1" stop-color="' + c.c + '"/></linearGradient>';
      body += '<g data-seg="' + p + '">' +
        '<path d="' + d + '" stroke="' + c.t + '" stroke-width="' + SW + '" fill="none" stroke-linecap="round"/>' +
        '<path d="' + arc(p, R - 4) + '" stroke="#fff" stroke-opacity=".7" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        '<path class="' + X + 'glow" d="' + d + '" pathLength="100" stroke-dasharray="100 100" stroke="' + c.c + '" stroke-width="' + SW + '" fill="none" stroke-linecap="round"/>' +
        '<path class="' + X + 'fill" d="' + d + '" pathLength="100" stroke-dasharray="100 100" stroke="url(#' + X + 'g-' + p + '-ID)" stroke-width="' + SW + '" fill="none" stroke-linecap="round"/>' +
        '<path class="' + X + 'shine" d="' + arc(p, R + 3) + '" pathLength="100" stroke-dasharray="100 100" stroke="#fff" stroke-opacity=".55" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
        '<circle cx="' + g[0] + '" cy="' + g[1] + '" r="3" fill="#fff" stroke="' + c.c + '" stroke-opacity=".55" stroke-width="1.5"/>' +
        '<path class="' + X + 'hit" d="' + d + '" stroke="transparent" stroke-width="40" fill="none" data-open="' + p + '" role="button" tabindex="0" aria-label="Open ' + c.n + '"/>' +
        '</g>';
    });
    return '<svg viewBox="0 0 240 240" width="240" height="240"><defs>' + defs + '</defs>' + body + '</svg>';
  }

  /* set the ring and the doors to a set of scores (the fill paths are 100 long, so the offset is what is left) */
  function setTo(root, sc) {
    HE.ORDER.forEach(function (p) {
      var v = Math.max(1, Math.min(100, sc[p]));
      root.querySelectorAll('[data-seg="' + p + '"] .' + X + 'fill,[data-seg="' + p + '"] .' + X + 'glow,[data-seg="' + p + '"] .' + X + 'shine').forEach(function (e) { e.style.strokeDashoffset = 100 - v; });
      var d = root.querySelector('[data-door="' + p + '"]');
      d.style.setProperty("--lv", Math.round(v * .9) + "%");
    });
  }
  function count(el, from, to) {
    if (from === to || matchMedia("(prefers-reduced-motion: reduce)").matches) { el.firstChild.nodeValue = to; return; }
    var t0 = performance.now(), D = 1300;
    (function step(t) { var k = Math.min(1, (t - t0) / D), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; el.firstChild.nodeValue = Math.round(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); })(t0);
  }

  HE.add({
    id: "goal", group: "doors", kind: "Hook", name: "Fill your day", rec: false,
    pitch: "A gentle goal for the day: one soft ring made of Eat, Move, Mind and Measure, each part filled to its score, with a small dot on each as the mark to pass. The middle names the one part worth lifting now, and the four doors sit right under it.",
    how: [
      "The ring shows the day's balance at a glance. Each part fills to its pillar's score, with a dot as the gentle goal.",
      "The middle names the part with the most room, by time of day, and offers that pillar's next log as one small button.",
      "Tap it: the green win plays, then that part of the ring and its door fill smoothly to the new score.",
      "Tap any part of the ring, or any door, to open that pillar.",
      "With everything logged, the ring rests with a calm line instead of a button."
    ],
    score: [["Three doors at a glance", "y"], ["One tap in", "y"], ["A hook to start", "y"], ["GoodFlip look", "y"], ["Calm", "y"]],
    catch: "A ring of four can read like a chart to people who don't think in scores, and Measure barely moves day to day, so its part looks stuck. The dot as a goal is ours, not a coach's target.",
    from: "Apple Fitness rings (close the ring), the gradient hero tile with its dots (pin), Oura's readiness ring, Tide's soft orb.",
    tryit: "Tap the button in the middle and watch its part of the ring fill. Then tap a part of the ring or a door to open it.",
    effort: "Low to Medium, one SVG ring and the live orb skin",
    draw: function (ph) {
      var g = ph._g || (ph._g = { prev: null, gen: 0 });
      var gen = ++g.gen, now = {}, prev = g.prev || {};
      HE.ORDER.forEach(function (p) { now[p] = ph.scores[p]; });
      var changed = g.prev && HE.ORDER.some(function (p) { return prev[p] !== now[p]; });
      g.prev = now;
      var f = focus(ph), part = HE.part(HE.hour), it = f && ph.pillarNext(f), fc = f ? HE.P[f] : { c: "#299D6B", d: "#2A805A" };

      var root = document.createElement("div"); root.className = X + "w";
      root.innerHTML =
        '<div class="' + X + 'hd"><h3>' + HELLO[part] + '</h3><p><i></i>Bring each part of the ring past its dot.</p></div>' +
        '<div class="' + X + 'ring" role="group" aria-label="Your day as a ring">' + '<div class="' + X + 'halo"></div>' + ringSVG().replace(/-ID/g, "-" + gen + Math.random().toString(36).slice(2, 5)) +
          '<div class="' + X + 'disc" style="--f:' + fc.c + ';--fd:' + fc.d + '" aria-live="polite">' +
          (f ? '<p><b>' + HE.P[f].n + '</b> is the one to lift ' + WHEN[part] + '.</p>' +
               '<button class="' + X + 'act" data-log="' + it.id + '"><u>' + HE.icon("plus", 14, 2.6) + '</u>' + ACT[it.id] + '</button>'
             : '<p>Everything on your plan is in.<small>Rest well. The ring starts fresh in the morning.</small></p>') +
          '</div></div>' +
        '<div class="' + X + 'row" role="group" aria-label="Open a pillar">' + HE.ORDER.map(function (p) {
          var c = HE.P[p];
          return '<button class="' + X + 'door' + (p === f ? " on" : "") + '" data-door="' + p + '" data-open="' + p + '" style="--c:' + c.c + ';--t:' + c.t + ';--w:' + c.w + ';--d:' + c.d + '" aria-label="' + c.n + ', ' + c.score + ' ' + now[p] + ' percent. Open ' + c.n + '">' +
            '<span class="' + X + 'liq"></span><span class="' + X + 'ic">' + HE.icon(p, 18, 2) + '</span><span class="' + X + 'nm">' + c.n + '</span>' +
            '<span class="' + X + 'sc">' + (changed ? prev[p] : now[p]) + '<small>%</small></span></button>';
        }).join("") + '</div>';
      ph.slot.appendChild(root);

      /* after a log, draw at the old scores (under the green), then fill to the new ones once the green has gone */
      if (changed) {
        setTo(root, prev);
        setTimeout(function () {
          if (g.gen !== gen) return;
          setTo(root, now);
          HE.ORDER.forEach(function (p) { count(root.querySelector('[data-door="' + p + '"] .' + X + 'sc'), prev[p], now[p]); });
        }, 1650);
      } else setTo(root, now);

      root.addEventListener("click", function (e) {
        var l = e.target.closest("[data-log]"); if (l) { ph.log([l.getAttribute("data-log")]); return; }
        var o = e.target.closest("[data-open]"); if (o) ph.openPillar(o.getAttribute("data-open"));
      });
      root.addEventListener("keydown", function (e) {
        var o = e.target.closest("path[data-open]"); if (o && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); ph.openPillar(o.getAttribute("data-open")); }
      });
    }
  });
})();
