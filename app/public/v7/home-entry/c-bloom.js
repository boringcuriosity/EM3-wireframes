/* Concept: Gravity orbit. Distance from the centre is urgency.
   A pillar with something due now drifts close and grows, one coming later waits further out,
   a pillar that is all in rests on the quiet outer ring. Tap any bubble: it glides to the centre,
   asks its question with one-tap answers, logs, then drifts back out to where it now belongs. */
(function () {
  var X = "cbloom-";
  var E = "cubic-bezier(.2,0,0,1)", E2 = "cubic-bezier(.4,0,.2,1)";
  var CX = 164, CY = 150;
  var ANG = { mind: -140, move: -38, measure: 34, eat: 144 };
  var R = { due: 84, later: 116, done: 146, aside: 148 };
  var PERIOD = { eat: 17, move: 21, mind: 15, measure: 19 }, DELAY = { eat: 0, move: 6, mind: 11, measure: 3 };
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
    done: "Everything has settled to the outside. Sleep is when the body resets insulin sensitivity, so a steady bedtime keeps it working."
  };
  var ELSE = ["Something lighter", "A bigger plate", "Ate out", "Home food, a different dish"];

  var css = [
    "." + X + "f{position:relative;width:328px;height:300px;margin:0 auto}",
    "." + X + "orb{position:absolute;inset:0;pointer-events:none}",
    "." + X + "orb circle{fill:none;stroke:#EAECF0;stroke-width:1;transition:opacity .6s " + E + "}",
    "." + X + "orb circle.o{stroke-dasharray:2 5}",
    "." + X + "f.sel ." + X + "orb circle{opacity:.45}",
    "." + X + "hub{position:absolute;left:" + (CX - 30) + "px;top:" + (CY - 30) + "px;width:60px;height:60px;border-radius:50%;background:#fff;display:grid;place-items:center;box-shadow:0 8px 20px -8px rgba(68,76,231,.28),inset 0 0 0 1px #F2F4F7;transition:opacity .4s " + E + ",transform .6s " + E + "}",
    "." + X + "f.sel ." + X + "hub{opacity:0;transform:scale(.8)}",
    /* arm > sway > pos > unsway > unrot > bubble: the rotations cancel, so the bubble stays upright while it drifts along its orbit */
    "." + X + "arm{position:absolute;left:" + CX + "px;top:" + CY + "px;width:0;height:0;transform:rotate(var(--a))}",
    "." + X + "sw,." + X + "us{width:0;height:0;animation:" + X + "sway var(--per) ease-in-out infinite;animation-delay:var(--del)}",
    "." + X + "us{animation-name:" + X + "unsway}",
    "@keyframes " + X + "sway{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}",
    "@keyframes " + X + "unsway{0%,100%{transform:rotate(5deg)}50%{transform:rotate(-5deg)}}",
    "." + X + "pos{width:0;height:0;transform:translateX(var(--r));transition:transform 1s " + E2 + "}",
    "." + X + "ur{width:0;height:0;transform:rotate(calc(-1 * var(--a)))}",
    "." + X + "b{position:absolute;left:calc(var(--d) / -2);top:calc(var(--d) / -2);width:var(--d);height:var(--d);transition:left 1s " + E2 + ",top 1s " + E2 + ",width 1s " + E2 + ",height 1s " + E2 + ",opacity .6s " + E + "}",
    "." + X + "b.dim{opacity:.55}",
    "." + X + "s{position:absolute;inset:0;border-radius:50%;overflow:hidden;" +
      "background:radial-gradient(130% 130% at 28% 18%,#fff 0%,var(--w) 32%,var(--t) 74%,color-mix(in srgb,var(--c) 35%,transparent) 100%);" +
      "box-shadow:0 16px 30px -12px color-mix(in srgb,var(--c) 35%,transparent),0 2px 5px color-mix(in srgb,var(--c) 15%,transparent),inset 0 -16px 24px -13px color-mix(in srgb,var(--c) 65%,transparent),inset 0 9px 15px -8px #fff,inset 0 0 0 1px color-mix(in srgb,var(--c) 12%,transparent);transition:box-shadow .6s " + E + "}",
    "." + X + "b.set ." + X + "s{box-shadow:0 18px 34px -12px color-mix(in srgb,var(--c) 45%,transparent),0 2px 5px color-mix(in srgb,var(--c) 15%,transparent),inset 0 -16px 24px -13px color-mix(in srgb,var(--c) 65%,transparent),inset 0 9px 15px -8px #fff,inset 0 0 0 1.5px color-mix(in srgb,var(--c) 40%,transparent)}",
    "." + X + "b.done ." + X + "s{box-shadow:0 10px 20px -10px color-mix(in srgb,var(--c) 30%,transparent),inset 0 -10px 16px -10px color-mix(in srgb,var(--c) 55%,transparent),inset 0 6px 10px -6px #fff,inset 0 0 0 1px color-mix(in srgb,var(--c) 12%,transparent)}",
    "." + X + "liq{position:absolute;left:0;right:0;bottom:0;height:var(--lv);background:linear-gradient(180deg,var(--t) 0%,color-mix(in srgb,var(--c) 35%,transparent) 100%);transition:height 1.1s cubic-bezier(.42,.06,.36,.96)}",
    "." + X + "liq::before{content:'';position:absolute;left:-10%;right:-10%;top:-1px;height:3px;border-radius:50%;background:rgba(255,255,255,.62)}",
    "." + X + "b.hero ." + X + "liq{height:0}",
    "." + X + "b.hero.set ." + X + "liq{height:56%}",
    "." + X + "b.hero:not(.set) ." + X + "liq::before{opacity:0}",
    "." + X + "spec{position:absolute;top:10%;left:17%;width:34%;height:23%;border-radius:50%;background:#fff;filter:blur(5px);opacity:.9}",
    "." + X + "sm,." + X + "big,." + X + "gl{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;transition:opacity .35s " + E + " .5s}",
    "." + X + "sm b{font:700 11px/14px Roboto;color:#101828}",
    "." + X + "sm i{font:500 17px/19px 'Playfair Display',serif;font-style:normal;color:#101828;margin-top:1px}",
    "." + X + "sm i small{font-size:.5em;color:#667085}",
    "." + X + "sm em{font:600 10px/12px Roboto;font-style:normal;color:var(--dk);margin-top:2px}",
    "." + X + "b.lat ." + X + "sm b{font-size:10px;line-height:12px}." + X + "b.lat ." + X + "sm i{font-size:14px;line-height:16px}." + X + "b.lat ." + X + "sm em{display:none}",
    "." + X + "gl{color:var(--dk);opacity:0}",
    "." + X + "b.done:not(.hero) ." + X + "gl,." + X + "b.dim ." + X + "gl{opacity:1}",
    "." + X + "b.done:not(.hero) ." + X + "sm,." + X + "b.dim ." + X + "sm{opacity:0;transition-delay:0s}",
    "." + X + "big{padding:0 20px;opacity:0;pointer-events:none}",
    "." + X + "b.hero ." + X + "big{opacity:1}",
    "." + X + "b.hero ." + X + "sm,." + X + "b.hero ." + X + "gl{opacity:0;transition-delay:0s}",
    "." + X + "b:not(.hero) ." + X + "big{transition-delay:0s}",
    "." + X + "eb{display:inline-flex;align-items:center;gap:4px;font:600 11px/14px Roboto;color:var(--dk)}",
    "." + X + "q{font:600 16px/21px Roboto;color:#101828;margin-top:6px;letter-spacing:-.1px}",
    "." + X + "st{display:grid;margin-top:6px;justify-items:center}",
    "." + X + "st>*{grid-area:1/1;transition:opacity .35s " + E + ",transform .45s " + E + "}",
    "." + X + "sub{font:400 11.5px/15px Roboto;color:#475467}",
    "." + X + "pill{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 11px 0 4px;border-radius:999px;background:#fff;box-shadow:0 1px 2px rgba(16,24,40,.08),0 0 0 1px color-mix(in srgb,var(--c) 30%,transparent);font:600 12.5px/1 Roboto;color:var(--dk);white-space:nowrap;opacity:0;transform:translateY(6px)}",
    "." + X + "pill u{width:20px;height:20px;border-radius:50%;background:var(--c);color:#fff;display:grid;place-items:center;text-decoration:none}",
    "." + X + "b.set ." + X + "sub{opacity:0}",
    "." + X + "b.set ." + X + "pill{opacity:1;transform:none;transition-delay:.28s}",
    "." + X + "hit{position:absolute;inset:-4px;border:0;background:none;border-radius:50%;cursor:pointer;padding:0}",
    "." + X + "hit:focus-visible{outline:2px solid var(--c);outline-offset:2px}",
    "." + X + "b.hero ." + X + "hit{display:none}",
    "." + X + "ans{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:12px;transition:opacity .3s " + E + "}",
    "." + X + "ans:empty{margin-top:0}",
    "." + X + "ans .he-chip{height:40px;padding:0 14px;font-size:13px}",
    "." + X + "ans .he-chip.pri{border-color:#B4E7CF;background:#F3FCF8;color:#2A805A}",
    "." + X + "ans .face{width:44px;height:44px;padding:0;justify-content:center;font-size:22px;border-radius:50%}",
    "." + X + "ans .sq{width:40px;padding:0;justify-content:center}",
    "." + X + "ans.gone{opacity:0;pointer-events:none}",
    "." + X + "k{display:flex;gap:10px;align-items:flex-start;margin-top:12px;padding:12px 14px;border-radius:16px;border:1px solid #F2F4F7;background:#fff;font:400 13px/18px Roboto;color:#475467;transition:opacity .3s " + E + "}",
    "." + X + "k b{color:#101828;font-weight:600}",
    "." + X + "k svg{flex:none;margin-top:1px}",
    "." + X + "k.fade{opacity:0}",
    "." + X + "opt{display:flex;flex-direction:column;gap:8px}",
    "." + X + "opt button{height:48px;border-radius:12px;border:1px solid #E4E7EC;background:#fff;font:500 15px/1 Roboto;color:#101828;text-align:left;padding:0 16px;cursor:pointer}",
    "@media (prefers-reduced-motion: reduce){." + X + "sw,." + X + "us{animation:none}." + X + "pos,." + X + "b,." + X + "liq{transition:none}}"
  ].join("");
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  function byId(ph, id) { return ph.items().filter(function (x) { return x.id === id; })[0]; }
  function scale(ph) { return ph.el.getBoundingClientRect().width / 360 || 1; }
  function dueOf(ph, p) { return ph.open().filter(function (x) { return x.p === p && x.at <= HE.hour + .25; }); }
  function itemFor(ph, p) { var o = ph.open().filter(function (x) { return x.p === p; }), d = dueOf(ph, p); return d.length ? d[d.length - 1] : o[0] || null; }

  /* Where each pillar sits: how close is how soon. */
  function layout(ph, sel) {
    var L = {};
    HE.ORDER.forEach(function (p) {
      var open = ph.open().filter(function (x) { return x.p === p; }), due = dueOf(ph, p);
      var cls = due.length ? "due" : open.length ? "lat" : "done";
      var r = R[cls === "lat" ? "later" : cls], d = cls === "due" ? Math.min(82, 70 + 6 * (due.length - 1)) : cls === "lat" ? 56 : 46;
      if (sel) { if (p === sel) { r = 0; d = 166; } else { r = R.aside; d = Math.min(d, 46); } }
      L[p] = { r: r, d: d, cls: cls, hero: p === sel, dim: !!sel && p !== sel };
    });
    return L;
  }
  function place(el, l) {
    el.style.setProperty("--r", l.r + "px"); el.style.setProperty("--d", l.d + "px");
    var b = el.querySelector("." + X + "b");
    b.classList.remove("due", "lat", "done"); b.classList.add(l.cls);
    b.classList.toggle("hero", l.hero); b.classList.toggle("dim", l.dim);
  }

  function bigHTML(ph, it, answered) {
    var c = HE.P[it.p];
    return '<span class="' + X + 'eb">' + HE.icon(it.p, 12, 2.2) + c.n + '</span>' +
      '<div class="' + X + 'q">' + it.ask + '</div>' +
      '<div class="' + X + 'st"><div class="' + X + 'sub">' + (it.kind === "mood" ? "Tap a face" : it.kind === "num" ? "Last time 72.6 kg" : it.sub) + '</div>' +
      '<span class="' + X + 'pill"><u>' + HE.icon("check", 12, 3) + '</u><span class="lb">' + (answered || "") + '</span></span></div>';
  }
  function ansHTML(ph, it) {
    var B = function (a, label, cls, aria) { return '<button class="he-chip ' + (cls || "") + '" data-a="' + a + '"' + (aria ? ' aria-label="' + aria + '"' : "") + '>' + label + '</button>'; };
    if (it.kind === "sleep") return B("log:Slept well", "Slept well", "pri") + B("log:Okay", "Okay") + B("log:Badly", "Badly") + B("back", "Not now");
    if (it.kind === "meal") return B("log:As planned", "Had it as planned", "pri") + B("else", "Something else") + B("back", "Not yet");
    if (it.kind === "tick") return B("log:Done", HE.icon("check", 16, 2.6) + "Done", "pri") + B("back", "Not yet");
    if (it.kind === "mood") return HE.FACES.map(function (f) { return B("log:" + f[1] + " " + f[0], f[1], "face", f[0]); }).join("") + B("back", "Not now");
    return B("minus", "−", "sq", "Less") + B("log:kg", '<span class="kg">Log ' + ph._o.kg.toFixed(1) + ' kg</span>', "pri") + B("plus", "+", "sq", "More") + B("back", "Not yet");
  }
  /* KAIRA on what is closest, or on the open question */
  function kHTML(ph, sel, itemId) {
    var t;
    if (sel && itemId) t = INS[itemId];
    else {
      var n = ph.next();
      if (!n) t = INS.done;
      else {
        var due = n.at <= HE.hour + .25;
        t = '<b>' + n.t + (due ? " is closest." : " is next, around " + HE.clock(n.at) + ".") + '</b> ' + INS[n.id];
      }
    }
    return HE.kaira(18) + '<span>' + t + '</span>';
  }

  function settle(ph, it, label, chip) {
    var o = ph._o; if (o.busy) return; o.busy = true;
    var root = ph.slot.querySelector("." + X + "w"), arm = root.querySelector('[data-p="' + it.p + '"]'), el = arm.querySelector("." + X + "b");
    el.querySelector("." + X + "pill .lb").textContent = label;
    var pill = el.querySelector("." + X + "pill"), sc = scale(ph);
    if (chip && chip.animate && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      var a = chip.getBoundingClientRect(), t = pill.getBoundingClientRect();
      var dx = (t.left + t.width / 2 - a.left - a.width / 2) / sc, dy = (t.top + t.height / 2 - a.top - a.height / 2) / sc - 6;
      chip.style.position = "relative"; chip.style.zIndex = 2;
      chip.animate([{ transform: "none", opacity: 1 }, { transform: "translate(" + dx + "px," + dy + "px) scale(.8)", opacity: 0 }], { duration: 440, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" });
    }
    root.querySelectorAll("." + X + "ans .he-chip").forEach(function (c) { if (c !== chip) { c.style.transition = "opacity .25s"; c.style.opacity = "0"; } c.style.pointerEvents = "none"; });
    el.classList.add("set");
    setTimeout(function () {
      o.busy = false;
      var r = el.getBoundingClientRect(), pr = ph.el.getBoundingClientRect();
      o.set = { id: it.id, p: it.p, label: label, t: Date.now() }; o.sel = null;
      ph.log([it.id], { how: label, at: { x: (r.left - pr.left + r.width / 2) / sc, y: (r.top - pr.top + r.height / 2) / sc } });
    }, 1000);
  }

  HE.add({
    id: "bloom", name: "Gravity orbit", rec: false,
    pitch: "The four pillars orbit a calm centre, and distance is urgency: what is due now drifts close and grows, what is done rests on the outer ring. Home reads at a glance without a single word, and any bubble can be pulled in to answer.",
    how: [
      "Pillars with something due now sit close to the centre and larger; ones coming later wait further out; done ones rest small on the dashed outer ring.",
      "KAIRA's hexagon holds the centre, with one line under the field about whatever is closest.",
      "Tap any bubble: it glides to the centre and asks its question, with one-tap answers under it.",
      "Your answer settles into the bubble as a chip, the green win plays, and the bubble drifts back out to where it now belongs."
    ],
    score: [["The right thing now", "m"], ["Answer where you are", "y"], ["Pillars in view", "y"], ["GoodFlip look", "y"], ["KAIRA carries insight", "y"]],
    catch: "Distance has to be learned before it means anything, and nothing asks on its own: the person has to tap. Two pillars due at once look equally close, so it does not pick for them.",
    from: "How We Feel mood field (position carries meaning), Moodmuse floating bubbles, Atoms (one soft circle per habit), Lifesum bubble picker (tap a bubble to log that thing).",
    tryit: "Tap the closest bubble, answer it, and watch it drift out. Switch to Evening to see the orbit rearrange.",
    effort: "Medium, the orbit is CSS, answers shared with Ask, answer, stay",
    draw: function (ph) {
      var o = ph._o || (ph._o = { sel: null, kg: 72.6, hour: HE.hour, gen: 0, lastL: null });
      if (o.hour !== HE.hour) { o.hour = HE.hour; o.sel = null; o.set = null; }
      if (o.sel && !itemFor(ph, o.sel)) o.sel = null;
      var gen = ++o.gen, now = Date.now(), set = o.set && now - o.set.t < 2400 ? o.set : null;
      if (!set) o.set = null;
      var TL = layout(ph, o.sel), SL = o.lastL || TL, wait = 30;
      var selIt = o.sel ? itemFor(ph, o.sel) : null;
      if (set) { SL = layout(ph, set.p); SL[set.p].cls = "due"; wait = Math.max(30, set.t + 2250 - now); }

      var root = document.createElement("div"); root.className = X + "w";
      root.innerHTML = '<div class="' + X + 'f" role="group" aria-label="Your four pillars, closer means due sooner">' +
        '<svg class="' + X + 'orb" width="328" height="300" aria-hidden="true"><circle cx="' + CX + '" cy="' + CY + '" r="' + R.due + '"/><circle cx="' + CX + '" cy="' + CY + '" r="' + R.later + '"/><circle class="o" cx="' + CX + '" cy="' + CY + '" r="' + R.done + '"/></svg>' +
        '<div class="' + X + 'hub">' + HE.kaira(26) + '</div>' +
        HE.ORDER.map(function (p) {
          var c = HE.P[p];
          return '<div class="' + X + 'arm" data-p="' + p + '" style="--a:' + ANG[p] + 'deg;--c:' + c.c + ';--t:' + c.t + ';--w:' + c.w + ';--dk:' + c.d + ';--per:' + PERIOD[p] + 's;--del:-' + DELAY[p] + 's">' +
            '<div class="' + X + 'sw"><div class="' + X + 'pos"><div class="' + X + 'us"><div class="' + X + 'ur">' +
            '<div class="' + X + 'b"><div class="' + X + 's"><div class="' + X + 'liq"></div><div class="' + X + 'spec"></div>' +
            '<div class="' + X + 'sm"></div><div class="' + X + 'gl">' + HE.icon(p, 18, 2.2) + '</div><div class="' + X + 'big" aria-live="polite"></div></div>' +
            '<button class="' + X + 'hit" data-pick="' + p + '"></button></div></div></div></div></div></div>';
        }).join("") + '</div>' +
        '<div class="' + X + 'ans" role="group" aria-label="Answers"></div><div class="' + X + 'k"></div>';
      ph.slot.appendChild(root);
      var f = root.querySelector("." + X + "f");

      /* contents are the truth now; positions start where they were last drawn */
      HE.ORDER.forEach(function (p) {
        var arm = root.querySelector('[data-p="' + p + '"]'), el = arm.querySelector("." + X + "b"), c = HE.P[p], sc = ph.scores[p];
        var due = dueOf(ph, p).length, open = ph.open().filter(function (x) { return x.p === p; }).length;
        el.style.setProperty("--lv", sc + "%");
        el.querySelector("." + X + "sm").innerHTML = '<b>' + c.n + '</b><i>' + sc + '<small>%</small></i>' + (due ? '<em>' + (due > 1 ? due + " due" : "Due now") + '</em>' : "");
        el.querySelector("." + X + "hit").setAttribute("aria-label", c.n + ", " + c.score + " " + sc + " percent, " + (due ? "due now" : open ? "later" : "all in"));
        var heroIt = set && set.p === p ? byId(ph, set.id) : (o.sel === p ? selIt : null);
        if (heroIt) el.querySelector("." + X + "big").innerHTML = bigHTML(ph, heroIt, set && set.p === p ? set.label : "");
        place(arm, SL[p]);
        if (set && set.p === p) el.classList.add("set");
      });
      f.classList.toggle("sel", !!(set || HE.ORDER.some(function (p) { return SL[p].hero; })));
      var ans = root.querySelector("." + X + "ans"), k = root.querySelector("." + X + "k");
      var startSel = set ? set.p : (o.lastSel || null);
      if (!set && startSel && startSel === o.sel && selIt) ans.innerHTML = ansHTML(ph, selIt);
      k.innerHTML = kHTML(ph, startSel, set ? set.id : (startSel && startSel === o.sel && selIt ? selIt.id : null));
      void root.offsetWidth;

      var changed = set || startSel !== o.sel || JSON.stringify(SL) !== JSON.stringify(TL);
      o.lastL = TL; o.lastSel = o.sel;
      if (changed) setTimeout(function () {
        if (o.gen !== gen) return;
        o.set = null;
        HE.ORDER.forEach(function (p) {
          var arm = root.querySelector('[data-p="' + p + '"]'), el = arm.querySelector("." + X + "b");
          if (o.sel === p && selIt) el.querySelector("." + X + "big").innerHTML = bigHTML(ph, selIt);
          el.classList.remove("set"); place(arm, TL[p]);
        });
        f.classList.toggle("sel", !!o.sel);
        ans.classList.add("gone"); k.classList.add("fade");
        setTimeout(function () {
          ans.innerHTML = o.sel && selIt ? ansHTML(ph, selIt) : "";
          k.innerHTML = kHTML(ph, o.sel, selIt ? selIt.id : null);
          ans.classList.remove("gone"); k.classList.remove("fade");
        }, 480);
      }, wait);

      root.addEventListener("click", function (e) {
        var pk = e.target.closest("[data-pick]");
        if (pk) {
          var p = pk.getAttribute("data-pick");
          if (!itemFor(ph, p)) return ph.toast("Everything in " + HE.P[p].n + " is in. " + HE.P[p].score + " is at " + ph.scores[p] + "%.");
          o.sel = p; ph.draw(); return;
        }
        var btn = e.target.closest("[data-a]"); if (!btn || o.busy || !o.sel) return;
        var it = itemFor(ph, o.sel), a = btn.getAttribute("data-a");
        if (a === "back") { o.sel = null; ph.draw(); return; }
        if (a === "minus" || a === "plus") { o.kg = Math.round((o.kg + (a === "plus" ? .1 : -.1)) * 10) / 10; root.querySelector(".kg").textContent = "Log " + o.kg.toFixed(1) + " kg"; return; }
        if (a === "else") {
          ph.sheet("What did you have instead?", '<div class="' + X + 'opt">' + ELSE.map(function (x) { return '<button data-o="' + x + '">' + x + '</button>'; }).join("") + '</div>', function (ev) {
            var b = ev.target.closest("[data-o]"); if (!b) return;
            ph.closeSheet(); settle(ph, it, b.getAttribute("data-o"), null);
          }, "Planned: " + it.sub);
          return;
        }
        var label = a.slice(4); if (label === "kg") label = o.kg.toFixed(1) + " kg";
        settle(ph, it, label, btn);
      });
    }
  });
})();
