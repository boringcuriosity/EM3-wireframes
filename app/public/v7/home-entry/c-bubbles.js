/* Concept: Ask, answer, stay. Today's hero bubbles, made obvious.
   The big bubble asks the day's question and its answers sit right under it as one-tap chips.
   The answer you pick settles into the bubble as a chip, the pillar colour rises inside it,
   the win plays, and then the next pillar glides into the middle. No overshoot anywhere. */
(function () {
  var X = "cbubbles-";
  var E = "cubic-bezier(.2,0,0,1)", E2 = "cubic-bezier(.4,0,.2,1)";
  var SEAT = { mind: { x: 44, y: 46, d: 72 }, move: { x: 284, y: 46, d: 76 }, eat: { x: 44, y: 212, d: 74 }, measure: { x: 284, y: 212, d: 70 } };
  var C = { x: 164, y: 128 }, HERO = 172, LEAN = 0.08, REST = 10;
  var PERIOD = { eat: 8, move: 9.4, mind: 7.2, measure: 8.7 }, DELAY = { eat: 0, move: 2.6, mind: 4.1, measure: 1.3 };

  /* KAIRA: one mechanism per item, why it matters now. Never a recap. */
  var INS = {
    sleep: "Short sleep makes the body less sensitive to insulin the next day, so this sets how breakfast lands.",
    weigh: "Weighing at the same time, before food, gives the truest trend. Single days swing with water.",
    bfast: "Protein at breakfast keeps you fuller and steadies your sugar until lunch.",
    walk: "A morning walk helps your muscles pull sugar out of the blood for hours after.",
    lunch: "A walk within an hour of lunch blunts the sugar rise from it.",
    breath: "Five slow minutes lowers the stress hormones that push sugar up in the afternoon.",
    stairs: "Short bursts count. Two minutes of stairs helps your muscles use sugar right away.",
    snack: "A small protein snack now stops the big hunger that makes dinner heavy.",
    gym: "Strength work builds muscle, and muscle is where most of your sugar goes.",
    dinner: "An earlier, lighter dinner gives your body time to settle sugar before sleep.",
    mood: "Naming how the day felt makes stress easier to spot before it shows up in your sugars.",
    wind: "Screen light delays melatonin, so the phone away now means easier sleep.",
    done: "Sleep is when the body resets its insulin sensitivity, so a steady bedtime keeps what you built working."
  };
  var ELSE = ["Something lighter", "A bigger plate", "Ate out", "Home food, a different dish"];

  var css = [
    "." + X + "w{position:relative}",
    "." + X + "f{position:relative;width:328px;height:260px;margin:0 auto}",
    "." + X + "b{position:absolute;transition:left .9s " + E2 + ",top .9s " + E2 + ",width .9s " + E2 + ",height .9s " + E2 + "}",
    "." + X + "s{position:absolute;inset:0;border-radius:50%;overflow:hidden;animation:" + X + "drift var(--per) ease-in-out infinite;animation-delay:var(--del);" +
      "background:radial-gradient(130% 130% at 28% 18%,#fff 0%,var(--w) 32%,var(--t) 74%,color-mix(in srgb,var(--c) 35%,transparent) 100%);" +
      "box-shadow:0 16px 30px -12px color-mix(in srgb,var(--c) 35%,transparent),0 2px 5px color-mix(in srgb,var(--c) 15%,transparent),inset 0 -16px 24px -13px color-mix(in srgb,var(--c) 65%,transparent),inset 0 9px 15px -8px #fff,inset 0 0 0 1px color-mix(in srgb,var(--c) 12%,transparent);transition:box-shadow .6s " + E + "}",
    "." + X + "b.set ." + X + "s{box-shadow:0 18px 34px -12px color-mix(in srgb,var(--c) 45%,transparent),0 2px 5px color-mix(in srgb,var(--c) 15%,transparent),inset 0 -16px 24px -13px color-mix(in srgb,var(--c) 65%,transparent),inset 0 9px 15px -8px #fff,inset 0 0 0 1.5px color-mix(in srgb,var(--c) 40%,transparent)}",
    "@keyframes " + X + "drift{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-4px,0)}}",
    "." + X + "liq{position:absolute;left:0;right:0;bottom:0;height:var(--lv);background:linear-gradient(180deg,var(--t) 0%,color-mix(in srgb,var(--c) 35%,transparent) 100%);transition:height 1.1s cubic-bezier(.42,.06,.36,.96)}",
    "." + X + "liq::before{content:'';position:absolute;left:-10%;right:-10%;top:-1px;height:3px;border-radius:50%;background:rgba(255,255,255,.62)}",
    "." + X + "b.hero ." + X + "liq{height:0}",
    "." + X + "b.hero.set ." + X + "liq{height:56%}",
    "." + X + "b.hero:not(.set) ." + X + "liq::before{opacity:0}",
    "." + X + "spec{position:absolute;top:10%;left:17%;width:34%;height:23%;border-radius:50%;background:#fff;filter:blur(6px);opacity:.9}",
    "." + X + "sm,." + X + "big{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;transition:opacity .35s " + E + " .45s}",
    "." + X + "sm b{font:700 11px/14px Roboto;color:#101828;letter-spacing:.1px}",
    "." + X + "sm i{font:500 18px/20px 'Playfair Display',serif;font-style:normal;color:#101828;margin-top:2px}",
    "." + X + "sm i small{font-size:.5em;color:#667085}",
    "." + X + "big{padding:0 22px;opacity:0;pointer-events:none}",
    "." + X + "b.hero ." + X + "big{opacity:1}",
    "." + X + "b.hero ." + X + "sm{opacity:0;transition-delay:0s}",
    "." + X + "b:not(.hero) ." + X + "big{transition-delay:0s}",
    "." + X + "eb{display:inline-flex;align-items:center;gap:4px;font:600 11px/14px Roboto;color:var(--d)}",
    "." + X + "q{font:600 16px/21px Roboto;color:#101828;margin-top:6px;letter-spacing:-.1px}",
    "." + X + "st{display:grid;margin-top:6px;justify-items:center}",
    "." + X + "st>*{grid-area:1/1;transition:opacity .35s " + E + ",transform .45s " + E + "}",
    "." + X + "sub{font:400 11.5px/15px Roboto;color:#475467}",
    "." + X + "pill{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 11px 0 4px;border-radius:999px;background:#fff;box-shadow:0 1px 2px rgba(16,24,40,.08),0 0 0 1px color-mix(in srgb,var(--c) 30%,transparent);font:600 12.5px/1 Roboto;color:var(--d);white-space:nowrap;opacity:0;transform:translateY(6px)}",
    "." + X + "pill u{width:20px;height:20px;border-radius:50%;background:var(--c);color:#fff;display:grid;place-items:center;text-decoration:none}",
    "." + X + "b.set ." + X + "sub{opacity:0}",
    "." + X + "b.set ." + X + "pill{opacity:1;transform:none;transition-delay:.28s}",
    "." + X + "hit{position:absolute;inset:0;border:0;background:none;border-radius:50%;cursor:pointer;padding:0}",
    "." + X + "hit:focus-visible{outline:2px solid var(--c);outline-offset:3px}",
    "." + X + "b.hero ." + X + "hit{display:none}",
    "." + X + "mid{position:absolute;left:88px;right:88px;top:0;height:260px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:10px;opacity:0;pointer-events:none;transition:opacity .5s " + E + "}",
    "." + X + "mid.on{opacity:1;transition-delay:.5s}",
    "." + X + "mid p{margin:0;font:400 13.5px/19px Roboto;color:#344054}",
    "." + X + "mid p b{display:block;font:600 13px/18px Roboto;color:#101828;margin-bottom:2px}",
    "." + X + "ans{min-height:40px;display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:12px;transition:opacity .3s " + E + "}",
    "." + X + "ans .he-chip{height:40px;padding:0 14px;font-size:13px}",
    "." + X + "ans .he-chip.pri{border-color:#B4E7CF;background:#F3FCF8;color:#2A805A}",
    "." + X + "ans .face{width:44px;height:44px;padding:0;justify-content:center;font-size:22px;border-radius:50%}",
    "." + X + "ans .sq{width:40px;padding:0;justify-content:center}",
    "." + X + "ans.gone{opacity:0;pointer-events:none}",
    "." + X + "k{display:flex;gap:10px;align-items:flex-start;margin-top:16px;padding:12px 14px;border-radius:16px;border:1px solid #F2F4F7;background:#fff;font:400 13px/18px Roboto;color:#475467;transition:opacity .3s " + E + "}",
    "." + X + "k svg{flex:none;margin-top:1px}",
    "." + X + "k.fade{opacity:0}",
    "." + X + "w.rest ." + X + "ans,." + X + "w.rest ." + X + "k{display:none}",
    "." + X + "opt{display:flex;flex-direction:column;gap:8px}",
    "." + X + "opt button{height:48px;border-radius:12px;border:1px solid #E4E7EC;background:#fff;font:500 15px/1 Roboto;color:#101828;text-align:left;padding:0 16px;cursor:pointer}",
    "." + X + "opt button:active{background:#F9FAFB}",
    "@media (prefers-reduced-motion: reduce){." + X + "s{animation:none}." + X + "b,." + X + "liq{transition:none}}"
  ].join("");
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  function byId(ph, id) { return ph.items().filter(function (x) { return x.id === id; })[0]; }
  function scale(ph) { return ph.el.getBoundingClientRect().width / 360 || 1; }

  /* Who sits in the middle: the pillar the person picked, else ph.next() skipping anything put off with Not yet. */
  function target(ph) {
    var b = ph._b, open = ph.open(), live = open.filter(function (x) { return !b.later[x.id]; });
    if (!open.length) return { mode: "done" };
    var due = function (l) { return l.filter(function (x) { return x.at <= HE.hour + .25; }); };
    var it = null;
    if (b.pin) { var po = live.filter(function (x) { return x.p === b.pin; }), pd = due(po); it = HE.rank(pd)[0] || po[0] || null; }
    if (!it) { var d = HE.rank(due(live)); it = d[0] || live[0] || null; }   /* the same order as ph.next() */
    if (!it) return { mode: "rest", upId: open[0].id };
    return { mode: "ask", hero: it.p, itemId: it.id };
  }
  function same(a, b) { return a && b && a.mode === b.mode && a.hero === b.hero && a.itemId === b.itemId; }

  function geom(p, s) {
    var seat = SEAT[p];
    if (s.mode === "ask" && s.hero === p) return { x: C.x + LEAN * (seat.x - C.x), y: C.y + LEAN * (seat.y - C.y), d: HERO };
    var d = seat.d + (s.mode === "ask" ? 0 : REST);
    return { x: seat.x, y: seat.y, d: d };
  }
  function place(el, g) { el.style.left = (g.x - g.d / 2) + "px"; el.style.top = (g.y - g.d / 2) + "px"; el.style.width = g.d + "px"; el.style.height = g.d + "px"; }

  function bigHTML(ph, it, answered) {
    var c = HE.P[it.p];
    return '<span class="' + X + 'eb">' + HE.icon(it.p, 12, 2.2) + c.n + '</span>' +
      '<div class="' + X + 'q">' + it.ask + '</div>' +
      '<div class="' + X + 'st"><div class="' + X + 'sub">' + (it.kind === "mood" ? "Tap a face" : it.kind === "num" ? "Last time 72.6 kg" : it.sub) + '</div>' +
      '<span class="' + X + 'pill"><u>' + HE.icon("check", 12, 3) + '</u><span class="lb">' + (answered || "") + '</span></span></div>';
  }
  function ansHTML(ph, it) {
    var B = function (a, label, cls, aria) { return '<button class="he-chip ' + (cls || "") + '" data-a="' + a + '"' + (aria ? ' aria-label="' + aria + '"' : "") + '>' + label + '</button>'; };
    if (it.kind === "sleep") return B("log:Slept well", "Slept well", "pri") + B("log:Okay", "Okay") + B("log:Badly", "Badly");
    if (it.kind === "meal") return B("log:As planned", "Had it as planned", "pri") + B("else", "Something else") + B("later", "Not yet");
    if (it.kind === "tick") return B("log:Done", HE.icon("check", 16, 2.6) + "Done", "pri") + B("later", "Not yet");
    if (it.kind === "mood") return HE.FACES.map(function (f) { return B("log:" + f[1] + " " + f[0], f[1], "face", f[0]); }).join("");
    var kg = ph._b.kg.toFixed(1);
    return B("minus", "−", "sq", "Less") + B("log:kg", '<span class="kg">Log ' + kg + ' kg</span>', "pri") + B("plus", "+", "sq", "More") + B("later", "Not yet");
  }
  function kHTML(text) { return HE.kaira(18) + '<span>' + text + '</span>'; }
  function midHTML(ph, s) {
    if (s.mode === "done") return HE.kaira(28) + '<p>' + INS.done + '</p>';
    if (s.mode === "rest") { var u = byId(ph, s.upId); return HE.kaira(28) + '<p><b>' + u.t + ', around ' + HE.clock(u.at) + '</b>' + INS[u.id] + '</p>'; }
    return HE.kaira(28);
  }

  function fill(ph, el, p, s, set) {
    var c = HE.P[p], sc = ph.scores[p];
    el.style.setProperty("--lv", sc + "%");
    el.querySelector("." + X + "sm").innerHTML = '<b>' + c.n + '</b><i>' + sc + '<small>%</small></i>';
    el.querySelector("." + X + "hit").setAttribute("aria-label", c.n + ", " + c.score + " " + sc + " percent" + (s.mode === "done" ? "" : ". Ask about " + c.n));
    if (s.mode === "ask" && s.hero === p) el.querySelector("." + X + "big").innerHTML = bigHTML(ph, byId(ph, s.itemId), set);
  }

  /* Move everything from where it was drawn to where it belongs now. */
  function apply(ph, root, s) {
    var b = ph._b;
    root.classList.toggle(X + "rest", s.mode !== "ask");
    root.classList.toggle("rest", s.mode !== "ask");
    HE.ORDER.forEach(function (p) {
      var el = root.querySelector('[data-p="' + p + '"]'), hero = s.mode === "ask" && s.hero === p;
      if (hero && el.getAttribute("data-it") !== s.itemId) { fill(ph, el, p, s); el.setAttribute("data-it", s.itemId); }
      if (!hero) el.removeAttribute("data-it");
      el.classList.toggle("hero", hero); el.classList.remove("set");
      place(el, geom(p, s));
    });
    root.querySelector("." + X + "mid").innerHTML = midHTML(ph, s);
    root.querySelector("." + X + "mid").classList.toggle("on", s.mode !== "ask");
    var ans = root.querySelector("." + X + "ans"), k = root.querySelector("." + X + "k");
    ans.classList.add("gone"); k.classList.add("fade");
    setTimeout(function () {
      if (s.mode === "ask") { var it = byId(ph, s.itemId); ans.innerHTML = ansHTML(ph, it); k.innerHTML = kHTML(INS[it.id]); }
      else { ans.innerHTML = ""; }
      ans.classList.remove("gone"); k.classList.remove("fade");
    }, 520);
  }

  /* The answer settles in: the chip flies up into the bubble, the colour rises, then the win. */
  function settle(ph, it, label, chip) {
    var b = ph._b; if (b.busy) return; b.busy = true;
    var root = ph.slot.querySelector("." + X + "w"), el = root.querySelector('[data-p="' + it.p + '"]');
    el.querySelector("." + X + "pill .lb").textContent = label;
    var pill = el.querySelector("." + X + "pill"), sc = scale(ph);
    if (chip && chip.animate && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      var a = chip.getBoundingClientRect(), t = pill.getBoundingClientRect();
      var dx = (t.left + t.width / 2 - a.left - a.width / 2) / sc, dy = (t.top + t.height / 2 - a.top - a.height / 2) / sc - 6;
      chip.style.position = "relative"; chip.style.zIndex = 2;
      chip.animate([{ transform: "none", opacity: 1 }, { transform: "translate(" + dx + "px," + dy + "px) scale(.8)", opacity: 0 }], { duration: 440, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" });
    }
    root.querySelectorAll("." + X + "ans .he-chip").forEach(function (c) { if (c !== chip) c.style.opacity = "0"; c.style.transition = "opacity .25s"; c.style.pointerEvents = "none"; });
    el.classList.add("set");
    setTimeout(function () {
      b.busy = false;
      var r = el.getBoundingClientRect(), pr = ph.el.getBoundingClientRect();
      b.set = { id: it.id, p: it.p, label: label, t: Date.now() }; b.pin = null;
      ph.log([it.id], { how: label, at: { x: (r.left - pr.left + r.width / 2) / sc, y: (r.top - pr.top + r.height / 2) / sc } });
    }, 1000);
  }

  HE.add({
    id: "bubbles", name: "Ask, answer, stay", rec: true,
    pitch: "Today's bubbles, with the guesswork taken out. The big bubble asks one question and its answers sit right under it, so one tap logs it. The answer stays inside the bubble, then the next pillar glides in to ask its own.",
    how: [
      "The big bubble asks what the day needs now, in that pillar's colour, with the plan's detail under the question.",
      "One-tap answers sit just under it, shaped to the question: sleep quality, a meal as planned, Done, five faces, or a weight.",
      "Your answer flies up into the bubble as a chip, the colour rises inside it, and the green win plays.",
      "The next pillar due glides into the middle. Not yet moves on without logging; tap any small bubble to ask about that pillar.",
      "When everything is in, the four sit calm and full in their corners and KAIRA says why tonight matters."
    ],
    score: [["The right thing now", "y"], ["Answer where you are", "y"], ["Pillars in view", "y"], ["GoodFlip look", "y"], ["KAIRA carries insight", "y"]],
    catch: "One question at a time: someone catching up on four things at night taps through them one by one. Something else for a meal is still a short list, not a real food log.",
    from: "Liven ring and How We Feel widget (the question is the object), 5 Minute Journal (the answer resolves in place), Bloom and Stoic (the done card keeps its answer as a chip).",
    tryit: "Tap Slept well, watch it settle, then try Not yet, a small bubble, and Something else on a meal.",
    effort: "Medium, reuses the live ScoreBubbles skin and seats",
    draw: function (ph) {
      var b = ph._b || (ph._b = { later: {}, pin: null, last: null, kg: 72.6, hour: HE.hour, gen: 0 });
      if (b.hour !== HE.hour) { b.hour = HE.hour; b.later = {}; b.pin = null; b.set = null; }
      var gen = ++b.gen, T = target(ph), S, wait = 30, now = Date.now();
      if (b.set && now - b.set.t < 2400) { S = { mode: "ask", hero: b.set.p, itemId: b.set.id }; wait = Math.max(30, b.set.t + 2250 - now); }
      else { b.set = null; S = b.last || T; }
      var set = b.set;

      var root = document.createElement("div"); root.className = X + "w";
      root.innerHTML = '<div class="' + X + 'f" role="group" aria-label="Your four pillars">' +
        HE.ORDER.map(function (p) {
          var c = HE.P[p];
          return '<div class="' + X + 'b" data-p="' + p + '" style="--c:' + c.c + ';--t:' + c.t + ';--w:' + c.w + ';--d:' + c.d + ';--per:' + PERIOD[p] + 's;--del:-' + DELAY[p] + 's">' +
            '<div class="' + X + 's"><div class="' + X + 'liq"></div><div class="' + X + 'spec"></div>' +
            '<div class="' + X + 'sm"></div><div class="' + X + 'big" aria-live="polite"></div></div>' +
            '<button class="' + X + 'hit" data-pick="' + p + '"></button></div>';
        }).join("") +
        '<div class="' + X + 'mid"></div></div>' +
        '<div class="' + X + 'ans" role="group" aria-label="Answers"></div><div class="' + X + 'k"></div>';
      ph.slot.appendChild(root);

      /* drawn where it was, so the change can glide */
      root.classList.toggle("rest", S.mode !== "ask");
      HE.ORDER.forEach(function (p) {
        var el = root.querySelector('[data-p="' + p + '"]'), hero = S.mode === "ask" && S.hero === p;
        fill(ph, el, p, S, set && set.p === p ? set.label : "");
        if (hero) el.setAttribute("data-it", S.itemId);
        el.classList.toggle("hero", hero); el.classList.toggle("set", !!(set && hero));
        place(el, geom(p, S));
      });
      var mid = root.querySelector("." + X + "mid"); mid.innerHTML = midHTML(ph, S); mid.classList.toggle("on", S.mode !== "ask");
      var ans = root.querySelector("." + X + "ans"), k = root.querySelector("." + X + "k");
      if (S.mode === "ask") { var si = byId(ph, S.itemId); if (!set) ans.innerHTML = ansHTML(ph, si); k.innerHTML = kHTML(INS[si.id]); }
      void root.offsetWidth;
      b.last = T;
      if (!same(S, T) || set) setTimeout(function () { if (b.gen !== gen) return; b.set = null; apply(ph, root, T); }, wait);

      root.addEventListener("click", function (e) {
        var pk = e.target.closest("[data-pick]");
        if (pk) {
          var p = pk.getAttribute("data-pick"), has = ph.open().filter(function (x) { return x.p === p; });
          if (!has.length) return ph.toast("Everything in " + HE.P[p].n + " is in. " + HE.P[p].score + " is at " + ph.scores[p] + "%.");
          has.forEach(function (x) { delete b.later[x.id]; });
          b.pin = p; ph.draw(); return;
        }
        var btn = e.target.closest("[data-a]"); if (!btn || b.busy || !b.last || b.last.mode !== "ask") return;
        var it = byId(ph, b.last.itemId), a = btn.getAttribute("data-a");
        if (a === "later") { b.later[it.id] = 1; if (b.pin === it.p) b.pin = null; ph.draw(); return; }
        if (a === "minus" || a === "plus") { b.kg = Math.round((b.kg + (a === "plus" ? .1 : -.1)) * 10) / 10; root.querySelector(".kg").textContent = "Log " + b.kg.toFixed(1) + " kg"; return; }
        if (a === "else") {
          ph.sheet("What did you have instead?", '<div class="' + X + 'opt">' + ELSE.map(function (o) { return '<button data-o="' + o + '">' + o + '</button>'; }).join("") + '</div>', function (ev) {
            var o = ev.target.closest("[data-o]"); if (!o) return;
            ph.closeSheet(); settle(ph, it, o.getAttribute("data-o"), null);
          }, "Planned: " + it.sub);
          return;
        }
        var label = a.slice(4); if (label === "kg") label = b.kg.toFixed(1) + " kg";
        settle(ph, it, label, btn);
      });
    }
  });
})();
