/* Door: Widget row. A greeting, then four square pillar widgets in a row, each drawn the way its pillar thinks:
   Eat a plate ring, Move the week as bars, Mind last night as a moon arc, Measure a weight trend. A widget opens
   its pillar. Under the row, one wide card holds the next thing that matters, with one verb. */
(function () {
  var X = "dwidgets-", E = "cubic-bezier(.2,0,0,1)", E2 = "cubic-bezier(.4,0,.2,1)";
  var SLEPT = "7h 12m", SLEPT_H = 7.2, KG = [73.4, 73.3, 73.1, 73.2, 72.9, 72.8, 72.6];
  var css = [
    "." + X + "hi{margin:0 0 16px;font:700 24px/32px Roboto;letter-spacing:-.4px;color:#101828}",
    "." + X + "hi span{color:#98A2B3}",
    "." + X + "lb{display:flex;justify-content:space-between;align-items:baseline;margin:0 0 4px;font:600 13px/18px Roboto;color:#344054}",
    "." + X + "lb small{font:400 12px/16px Roboto;color:#98A2B3}",
    "." + X + "row{display:flex;gap:8px;margin:0 -16px;padding:8px 16px 16px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 16px;scrollbar-width:none}",
    "." + X + "row::-webkit-scrollbar{display:none}",
    "." + X + "w{flex:none;width:96px;height:96px;scroll-snap-align:start;border-radius:22px;padding:10px;display:flex;flex-direction:column;justify-content:space-between;text-align:left;cursor:pointer;" +
      "background:linear-gradient(160deg,var(--w) 0%,#fff 70%);border:1px solid color-mix(in srgb,var(--c) 14%,#fff);" +
      "box-shadow:0 1px 2px rgba(16,24,40,.04),0 10px 18px -12px color-mix(in srgb,var(--c) 45%,transparent);font-family:Roboto;color:#101828;transition:transform .3s " + E + ",box-shadow .3s " + E + "}",
    "." + X + "w:active{transform:scale(.97)}",
    "." + X + "w:focus-visible{outline:2px solid var(--c);outline-offset:2px}",
    "." + X + "n{display:flex;align-items:center;gap:4px;font:600 11.5px/14px Roboto;color:var(--d)}",
    "." + X + "v{font:700 16px/18px Roboto;letter-spacing:-.2px;font-variant-numeric:tabular-nums;white-space:nowrap}",
    "." + X + "v small{font:500 11px/1 Roboto;color:#667085;margin-left:2px;letter-spacing:0}",
    "." + X + "viz{flex:1;display:flex;align-items:center;justify-content:center;min-height:0}",
    "." + X + "viz svg{display:block;overflow:visible;max-width:100%;height:auto}",
    "." + X + "arc{transition:stroke-dashoffset .9s " + E2 + "}",
    "." + X + "bar{transition:height .9s " + E2 + "}",
    /* the next thing card */
    "." + X + "nx{position:relative;overflow:hidden;border-radius:24px;border:1px solid #EAECF0;background:#fff;padding:16px;min-height:132px;box-shadow:0 1px 2px rgba(16,24,40,.04),0 14px 24px -18px rgba(16,24,40,.25)}",
    "." + X + "art{position:absolute;inset:0;pointer-events:none;background:radial-gradient(70% 90% at 100% 0%,var(--t) 0%,transparent 70%),radial-gradient(60% 80% at 85% 120%,var(--w) 0%,transparent 70%)}",
    "." + X + "orb{position:absolute;right:16px;top:50%;margin-top:-36px;width:72px;height:72px;border-radius:50%;display:grid;place-items:center;color:var(--d);" +
      "background:radial-gradient(130% 130% at 28% 18%,#fff 0%,var(--w) 32%,var(--t) 74%,color-mix(in srgb,var(--c) 35%,transparent) 100%);" +
      "box-shadow:0 14px 26px -12px color-mix(in srgb,var(--c) 45%,transparent),inset 0 -12px 18px -10px color-mix(in srgb,var(--c) 55%,transparent),inset 0 8px 12px -6px #fff,inset 0 0 0 1px color-mix(in srgb,var(--c) 12%,transparent)}",
    "." + X + "orb:after{content:'';position:absolute;left:20%;top:12%;width:30%;height:20%;border-radius:50%;background:#fff;filter:blur(4px);opacity:.85}",
    "." + X + "orb svg{position:relative;z-index:1}",
    "." + X + "tx{position:relative;padding-right:92px}",
    "." + X + "eb{display:flex;align-items:center;gap:6px;font:600 12px/16px Roboto;color:var(--d)}",
    "." + X + "eb i{width:3px;height:3px;border-radius:50%;background:#D0D5DD}",
    "." + X + "eb em{font-style:normal;color:#667085;font-weight:500}",
    "." + X + "tt{margin:6px 0 2px;font:700 17px/24px Roboto;color:#101828}",
    "." + X + "sb{margin:0 0 14px;font:400 13px/18px Roboto;color:#667085;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}",
    "." + X + "nx .he-pri,." + X + "nx .he-sec{position:relative;width:auto;height:40px;padding:0 18px;font-size:14px;margin-bottom:4px}",
    "." + X + "nx .he-pri{box-shadow:0 4px 0 #2A805A}",
    "." + X + "nx.done ." + X + "sb{-webkit-line-clamp:3}",
    /* sheets */
    "." + X + "opts{display:flex;flex-direction:column;gap:12px;padding-bottom:4px}",
    "." + X + "step{display:flex;align-items:center;justify-content:space-between;border:1px solid #EAECF0;border-radius:16px;padding:6px}",
    "." + X + "step button{width:48px;height:48px;border-radius:12px;border:0;background:#F9FAFB;color:#344054;font:500 22px/1 Roboto;cursor:pointer}",
    "." + X + "step output{font:700 26px/1 Roboto;color:#101828}." + X + "step output small{font:500 14px/1 Roboto;color:#667085;margin-left:4px}",
    "." + X + "faces{display:flex;gap:6px}",
    "." + X + "face{flex:1;height:80px;border:1px solid #EAECF0;border-radius:16px;background:#fff;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;font:500 12px/1 Roboto;color:#667085}",
    "." + X + "face em{font-style:normal;font-size:28px;line-height:1}",
    "@media (prefers-reduced-motion: reduce){." + X + "arc,." + X + "bar,." + X + "w{transition:none}}"
  ].join("");
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  function vars(p) { var c = HE.P[p]; return "--c:" + c.c + ";--t:" + c.t + ";--w:" + c.w + ";--d:" + c.d; }

  /* ---------- the four widgets ---------- */
  function ring(v) {   /* a plate: the rim fills to the score */
    var r = 19, L = 2 * Math.PI * r;
    return '<svg width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="' + r + '" fill="#fff" stroke="' + HE.P.eat.t + '" stroke-width="6"/>' +
      '<circle class="' + X + 'arc" data-v="' + v + '" cx="24" cy="24" r="' + r + '" fill="none" stroke="' + HE.P.eat.c + '" stroke-width="6" stroke-linecap="round" stroke-dasharray="' + L.toFixed(1) + '" stroke-dashoffset="' + (L * (1 - v / 100)).toFixed(1) + '" transform="rotate(-90 24 24)"/>' +
      '<circle cx="24" cy="24" r="11" fill="none" stroke="#EAECF0" stroke-width="1"/></svg>';
  }
  function bars(ph) {   /* the week, today last and in full colour */
    var wk = HE.WEEK.move.slice(0, 6).concat(ph.scores.move), c = HE.P.move;
    return '<svg width="78" height="40" viewBox="0 0 78 40">' + wk.map(function (v, i) {
      var h = Math.max(4, Math.round(v / 100 * 40)), last = i === 6;
      return '<rect class="' + X + 'bar"' + (last ? ' data-bar="1"' : "") + ' x="' + (i * 11.5) + '" y="' + (40 - h) + '" width="8" height="' + h + '" rx="3" fill="' + (last ? c.c : "color-mix(in srgb," + c.c + " 22%,#fff)") + '"/>';
    }).join("") + '</svg>';
  }
  function moon() {     /* last night as an arc over the hours slept, the moon where it ends */
    var f = Math.min(1, SLEPT_H / 8), th = Math.PI * (1 - f), x = 39 + 31 * Math.cos(th), y = 38 - 31 * Math.sin(th), c = HE.P.mind;
    return '<svg width="78" height="42" viewBox="0 0 78 42"><path d="M8 38A31 31 0 0 1 70 38" fill="none" stroke="' + c.t + '" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M8 38A31 31 0 0 1 ' + x.toFixed(1) + ' ' + y.toFixed(1) + '" fill="none" stroke="' + c.c + '" stroke-width="5" stroke-linecap="round"/>' +
      '<circle cx="31" cy="24" r="1.2" fill="' + c.c + '" opacity=".5"/><circle cx="46" cy="18" r="1" fill="' + c.c + '" opacity=".4"/><circle cx="40" cy="30" r=".9" fill="' + c.c + '" opacity=".35"/>' +
      '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="7.5" fill="#fff"/><path transform="translate(' + (x - 5).toFixed(1) + ',' + (y - 5).toFixed(1) + ') scale(.42)" d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="' + c.c + '"/></svg>';
  }
  function trend(ph) {  /* the weight line, today's point joins once weighed */
    var pts = ph.isDone("weigh") ? KG.concat(ph._kg) : KG.slice(), lo = Math.min.apply(0, pts) - .2, hi = Math.max.apply(0, pts) + .2, c = HE.P.measure;
    var xy = pts.map(function (v, i) { return [i * 76 / (pts.length - 1) + 1, 3 + (hi - v) / (hi - lo) * 32]; });
    var d = xy.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(""), e = xy[xy.length - 1];
    return '<svg width="78" height="40" viewBox="0 0 78 40"><defs><linearGradient id="' + X + 'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c.c + '" stop-opacity=".22"/><stop offset="1" stop-color="' + c.c + '" stop-opacity="0"/></linearGradient></defs>' +
      '<path d="' + d + 'L77 40L1 40Z" fill="url(#' + X + 'g)"/><path d="' + d + '" fill="none" stroke="' + c.c + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<circle cx="' + e[0].toFixed(1) + '" cy="' + e[1].toFixed(1) + '" r="3.5" fill="' + (ph.isDone("weigh") ? c.c : "#fff") + '" stroke="' + c.c + '" stroke-width="2"/></svg>';
  }
  function widget(ph, p) {
    var c = HE.P[p], s = ph.scores[p], v, viz, aria;
    if (p === "eat") { v = s + "<small>%</small>"; viz = ring(s); aria = "Eat, Nutrition " + s + " percent"; }
    if (p === "move") { v = s + "<small>%</small>"; viz = bars(ph); aria = "Move, Momentum " + s + " percent, with the last seven days"; }
    if (p === "mind") { v = SLEPT; viz = moon(); aria = "Mind, slept " + SLEPT + " last night"; }
    if (p === "measure") { var kg = ph.isDone("weigh") ? ph._kg : KG[KG.length - 1]; v = kg.toFixed(1) + "<small>kg</small>"; viz = trend(ph); aria = "Measure, weight " + kg.toFixed(1) + " kilograms"; }
    return '<button class="' + X + 'w" data-p="' + p + '" style="' + vars(p) + '" aria-label="' + aria + '. Open ' + c.n + '">' +
      '<span class="' + X + 'n">' + HE.icon(p, 13, 2.2) + c.n + '</span><span class="' + X + 'viz">' + viz + '</span><span class="' + X + 'v">' + v + '</span></button>';
  }

  /* ---------- the one verb, and what it does ---------- */
  var VERB = { sleep: "Tell us", meal: "Log it", num: "Weigh in", mood: "Check in", tick: "Mark done" };
  function act(ph, it) {
    if (!it) return;
    if (it.kind === "tick" && it.id !== "breath") return ph.log([it.id], { how: "Done" });
    var B = function (a, t, cls) { return '<button class="' + (cls || "he-sec") + '" data-a="' + a + '">' + t + '</button>'; }, html, title = it.t;
    if (it.kind === "meal") html = B("log:As planned", "Had it as planned", "he-pri") + B("open", "Something else");
    else if (it.kind === "sleep") { title = it.ask; html = B("log:Slept well", "Slept well", "he-pri") + B("log:Okay", "Okay") + B("log:Badly", "Badly"); }
    else if (it.kind === "mood") { title = it.ask; html = '<div class="' + X + 'faces">' + HE.FACES.map(function (f) { return '<button class="' + X + 'face" data-a="log:' + f[0] + '" aria-label="' + f[0] + '"><em>' + f[1] + '</em>' + f[0] + '</button>'; }).join("") + '</div>'; }
    else if (it.kind === "num") html = '<div class="' + X + 'step"><button data-a="kg-" aria-label="Less">−</button><output><span class="' + X + 'kg">' + ph._kg.toFixed(1) + '</span><small>kg</small></output><button data-a="kg+" aria-label="More">+</button></div>' + B("log:kg", "Log weight", "he-pri");
    else html = B("open", "Start breathing", "he-pri") + B("log:Done", "I’ve done it");
    ph.sheet(title, '<div class="' + X + 'opts">' + html + '</div>', function (e) {
      var b = e.target.closest("[data-a]"); if (!b) return; var a = b.dataset.a;
      if (a.indexOf("log:") === 0) return ph.log([it.id], { how: a === "log:kg" ? ph._kg.toFixed(1) + " kg" : a.slice(4) });
      if (a === "open") { ph.closeSheet(); return ph.openPillar(it.p); }
      ph._kg = Math.round((ph._kg + (a === "kg+" ? .1 : -.1)) * 10) / 10;
      ph.el.querySelector("." + X + "kg").textContent = ph._kg.toFixed(1);
    }, it.kind === "sleep" || it.kind === "mood" ? it.t : it.kind === "num" ? "Last time 72.6 kg" : it.sub);
  }

  function nextCard(ph) {
    var it = ph.next();
    if (!it) return '<div class="' + X + 'nx done" style="--c:#444CE7;--t:#E0EAFF;--w:#E0F5F5;--d:#3538CD"><div class="' + X + 'art"></div><div class="' + X + 'orb">' + HE.kaira(30) + '</div>' +
      '<div class="' + X + 'tx"><span class="' + X + 'eb">KAIRA</span><div class="' + X + 'tt">All set for the day</div>' +
      '<p class="' + X + 'sb">Sleep is when your body resets its insulin response, so a steady bedtime keeps it working.</p>' +
      '<button class="he-sec" data-x="kaira">Ask KAIRA</button></div></div>';
    var c = HE.P[it.p], now = it.at <= HE.hour + .25, verb = it.id === "breath" ? "Breathe now" : VERB[it.kind];
    return '<div class="' + X + 'nx" style="' + vars(it.p) + '"><div class="' + X + 'art"></div><div class="' + X + 'orb">' + HE.icon(it.p, 30, 1.8) + '</div>' +
      '<div class="' + X + 'tx"><span class="' + X + 'eb">' + c.n + '<i></i><em>' + (now ? "Up next" : "Around " + HE.clock(it.at)) + '</em></span>' +
      '<div class="' + X + 'tt">' + it.t + '</div><p class="' + X + 'sb">' + it.sub + '</p>' +
      '<button class="he-pri" data-x="go" data-id="' + it.id + '">' + verb + '</button></div></div>';
  }

  HE.add({
    id: "widgets", name: "Widget row", rec: false, group: "doors", kind: "Door",
    pitch: "Home opens like a phone's widget row. Four small squares, one per pillar, each drawn the way that pillar thinks: a plate ring, a week of bars, last night's moon, a weight line. Under them, one card holds the next thing that matters, with a single verb.",
    how: [
      "A greeting by time of day, then four widgets in a row. Three sit fully in view and Measure peeks from the edge, inviting a swipe.",
      "Each widget is a glance at one pillar: Eat's plate fills to its score, Move shows the week with today in full colour, Mind shows last night's hours, Measure the weight trend.",
      "Tap a widget and its pillar slides in.",
      "The wide card under the row holds the one thing due now. Its button logs it in a tap, or opens a short sheet when it needs an answer.",
      "After a log, the green plays, then the widget catches up: the plate fills, today's bar rises, the weight joins the line."
    ],
    score: [["Three doors at a glance", "y"], ["One tap in", "y"], ["A hook to start", "m"], ["GoodFlip look", "y"], ["Calm", "y"]],
    catch: "Four different chart types ask the eye to learn four small languages. The hook is the next card, which is useful but not much of a reason to come back.",
    from: "The widget pin (Welcome David), iOS small widgets, Apple Fitness summary tiles.",
    tryit: "Swipe the row, tap a widget to open its pillar, then tap the green button on the card under it.",
    effort: "Medium, four small charts on data the app already has",
    draw: function (ph) {
      ph._kg = ph._kg || 72.6;
      var w = ph._w = ph._w || { prev: null };
      var part = HE.part(HE.hour), hi = part === "night" ? "Welcome back" : "Good " + part;
      ph.slot.innerHTML = '<h2 class="' + X + 'hi">' + hi + '<span>, Shaheer</span></h2>' +
        '<div class="' + X + 'lb">Your pillars<small>Swipe for more</small></div>' +
        '<div class="' + X + 'row" role="list">' + HE.ORDER.map(function (p) { return widget(ph, p); }).join("") + '</div>' + nextCard(ph);

      /* the widgets catch up after the green clears: drawn at the old value, then eased to the new one */
      var prev = w.prev, now = { eat: ph.scores.eat, move: ph.scores.move };
      if (prev && (prev.eat !== now.eat || prev.move !== now.move)) {
        var arc = ph.slot.querySelector("." + X + "arc"), bar = ph.slot.querySelector("[data-bar]");
        var L = 2 * Math.PI * 19, toA = arc.getAttribute("stroke-dashoffset"), toH = bar.getAttribute("height"), toY = bar.getAttribute("y");
        arc.style.strokeDashoffset = (L * (1 - prev.eat / 100)).toFixed(1);
        var h0 = Math.max(4, Math.round(prev.move / 100 * 40));
        bar.style.height = h0 + "px"; bar.style.y = (40 - h0) + "px"; bar.style.transition = "height .9s " + E2 + ",y .9s " + E2;
        setTimeout(function () { arc.style.strokeDashoffset = toA; bar.style.height = toH + "px"; bar.style.y = toY + "px"; }, 1500);
      }
      w.prev = now;

      ph.slot.onclick = function (e) {
        var wd = e.target.closest("[data-p]"); if (wd) return ph.openPillar(wd.dataset.p);
        var x = e.target.closest("[data-x]"); if (!x) return;
        if (x.dataset.x === "kaira") return ph.toast("KAIRA would open here, ready to talk about sleep.");
        act(ph, ph.items().filter(function (i) { return i.id === x.dataset.id; })[0]);
      };
    }
  });
})();
