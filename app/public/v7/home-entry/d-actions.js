/* Door: Quick starts. Verbs first, pillars second. A greeting over the week's logging dots, a row of action tiles
   ("Log a meal", "Log a workout", "Breathe for 5 min", "Weigh in") that act in one tap, a KAIRA thought for this
   part of the day beside a soft orb, and the four pillars as quiet orb chips under it. Drawn from Tide's Home. */
(function () {
  var X = "dactions-", E = "cubic-bezier(.2,0,0,1)";
  var css = [
    "." + X + "hi{margin:0;font:700 26px/34px Roboto;letter-spacing:-.5px;color:#101828}",
    "." + X + "wk{display:flex;align-items:center;justify-content:space-between;margin:8px 0 16px}",
    "." + X + "days{display:flex;gap:4px}",
    "." + X + "d{width:24px;display:flex;flex-direction:column;align-items:center;gap:6px;font:600 11px/14px Roboto;color:#98A2B3}",
    "." + X + "d.now{color:#101828}",
    "." + X + "d i{width:8px;height:8px;border-radius:50%;background:#EAECF0;transition:background .6s " + E + ",box-shadow .6s " + E + "}",
    "." + X + "d.on i{background:#299D6B}",
    "." + X + "d.now i{background:#fff;box-shadow:inset 0 0 0 1.5px #299D6B}",
    "." + X + "d.now.on i{background:#299D6B;box-shadow:0 0 0 3px #E6FAF1}",
    "." + X + "st{height:28px;padding:0 10px;border-radius:999px;background:#F3FCF8;color:#2A805A;font:600 12px/28px Roboto;white-space:nowrap}",
    /* the action tiles */
    "." + X + "row{display:flex;gap:8px;margin:0 -16px;padding:0 16px 4px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 16px;scrollbar-width:none}",
    "." + X + "row::-webkit-scrollbar{display:none}",
    "." + X + "t{flex:none;width:140px;height:100px;scroll-snap-align:start;border-radius:20px;padding:12px;display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start;text-align:left;cursor:pointer;font-family:Roboto;" +
      "background:linear-gradient(150deg,var(--t) 0%,var(--w) 100%);border:1px solid color-mix(in srgb,var(--c) 16%,#fff);transition:transform .3s " + E + "}",
    "." + X + "t:active{transform:scale(.97)}",
    "." + X + "t:focus-visible{outline:2px solid var(--c);outline-offset:2px}",
    "." + X + "g{width:32px;height:32px;border-radius:50%;background:#fff;color:var(--c);display:grid;place-items:center;box-shadow:0 4px 10px -6px color-mix(in srgb,var(--c) 60%,transparent)}",
    "." + X + "t b{display:block;font:600 14px/18px Roboto;color:#101828;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:116px}",
    "." + X + "t small{display:flex;align-items:center;gap:4px;font:400 12px/16px Roboto;color:#667085;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:116px;margin-top:2px}",
    "." + X + "t.done small{color:var(--d);font-weight:500}",
    "." + X + "t.done ." + X + "g{background:var(--c);color:#fff}",
    /* KAIRA's thought */
    "." + X + "q{display:flex;gap:16px;align-items:center;margin:16px 0 0;padding:14px 16px;border-radius:24px;background:linear-gradient(150deg,#F5F8FF 0%,#F5FFFF 100%)}",
    "." + X + "q>div{flex:1;min-width:0}",
    "." + X + "eb{display:flex;align-items:center;gap:6px;font:500 12px/16px Roboto;color:#667085}",
    "." + X + "q p{margin:8px 0 8px;font:400 16px/23px Roboto;letter-spacing:-.1px;color:#101828}",
    "." + X + "ask{height:32px;padding:0;border:0;background:none;display:inline-flex;align-items:center;gap:4px;font:600 13px/1 Roboto;color:#3538CD;cursor:pointer}",
    "." + X + "orb{flex:none;width:64px;height:64px;border-radius:50%;align-self:center;position:relative;" +
      "background:radial-gradient(130% 130% at 28% 18%,#fff 0%,#EEF2FF 30%,#CFE9F2 70%,rgba(45,166,166,.55) 100%);" +
      "box-shadow:0 16px 28px -14px rgba(68,76,231,.45),inset 0 -12px 18px -10px rgba(45,166,166,.6),inset 0 8px 12px -6px #fff;animation:" + X + "br 8s ease-in-out infinite}",
    "." + X + "orb:after{content:'';position:absolute;left:20%;top:12%;width:30%;height:20%;border-radius:50%;background:#fff;filter:blur(4px);opacity:.9}",
    "@keyframes " + X + "br{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}",
    /* the pillars, quiet */
    "." + X + "lb{margin:16px 0 4px;font:600 13px/18px Roboto;color:#344054}",
    "." + X + "ps{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}",
    "." + X + "p{border:0;background:none;padding:4px 0;display:flex;flex-direction:column;align-items:center;gap:6px;font:500 12px/16px Roboto;color:#344054;cursor:pointer;min-height:40px}",
    "." + X + "p:focus-visible{outline:2px solid var(--c);outline-offset:2px;border-radius:12px}",
    "." + X + "po{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;color:var(--d);position:relative;transition:transform .3s " + E + ";" +
      "background:radial-gradient(130% 130% at 28% 18%,#fff 0%,var(--w) 32%,var(--t) 74%,color-mix(in srgb,var(--c) 35%,transparent) 100%);" +
      "box-shadow:0 8px 14px -8px color-mix(in srgb,var(--c) 50%,transparent),inset 0 -8px 12px -8px color-mix(in srgb,var(--c) 55%,transparent),inset 0 0 0 1px color-mix(in srgb,var(--c) 12%,transparent)}",
    "." + X + "p:active ." + X + "po{transform:scale(.94)}",
    /* sheets */
    "." + X + "opts{display:flex;flex-direction:column;gap:12px;padding-bottom:4px}",
    "." + X + "step{display:flex;align-items:center;justify-content:space-between;border:1px solid #EAECF0;border-radius:16px;padding:6px}",
    "." + X + "step button{width:48px;height:48px;border-radius:12px;border:0;background:#F9FAFB;color:#344054;font:500 22px/1 Roboto;cursor:pointer}",
    "." + X + "step output{font:700 26px/1 Roboto;color:#101828}." + X + "step output small{font:500 14px/1 Roboto;color:#667085;margin-left:4px}",
    "." + X + "br{display:grid;place-items:center;height:150px}",
    "." + X + "br i{width:110px;height:110px;border-radius:50%;background:radial-gradient(130% 130% at 28% 18%,#fff 0%,#F5FFFF 32%,#E0FFFF 74%,rgba(45,166,166,.35) 100%);box-shadow:0 16px 30px -14px rgba(45,166,166,.7);animation:" + X + "in 10s cubic-bezier(.4,0,.2,1) infinite}",
    "@keyframes " + X + "in{0%,100%{transform:scale(.7)}50%{transform:scale(1)}}",
    "@media (prefers-reduced-motion: reduce){." + X + "orb,." + X + "br i{animation:none}." + X + "t,." + X + "po{transition:none}}"
  ].join("");
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  /* KAIRA, one thought per part of the day: a mechanism, never a recap */
  var LINE = {
    morning: "Protein in your first meal keeps your sugar steadier all the way to lunch.",
    afternoon: "A ten minute walk after lunch lets your muscles soak up the sugar from it.",
    evening: "Muscle you work this evening keeps pulling sugar from your blood while you sleep.",
    night: "Deep sleep is when your body resets its insulin response. Dim lights help it come sooner."
  };
  function vars(p) { var c = HE.P[p]; return "--c:" + c.c + ";--t:" + c.t + ";--w:" + c.w + ";--d:" + c.d; }
  function byId(ph, id) { return ph.items().filter(function (x) { return x.id === id; })[0]; }
  /* the item each tile acts on: Eat and Move their next one, Mind its breathing, Measure the morning weight */
  function target(ph, p) {
    if (p === "mind") { var b = byId(ph, "breath"); return b.done ? null : b; }
    if (p === "measure") { var w = byId(ph, "weigh"); return w.done ? null : w; }
    return ph.pillarNext(p);
  }

  function act(ph, it) {
    if (it.kind === "tick" && it.id !== "breath") return ph.log([it.id], { how: "Done" });
    var B = function (a, t, cls) { return '<button class="' + (cls || "he-sec") + '" data-a="' + a + '">' + t + '</button>'; }, html, sub = it.sub;
    if (it.kind === "meal") html = B("log:As planned", "Had it as planned", "he-pri") + B("open", "Something else");
    else if (it.kind === "num") { sub = "Last time 72.6 kg"; html = '<div class="' + X + 'step"><button data-a="kg-" aria-label="Less">−</button><output><span class="' + X + 'kg">' + ph._kg.toFixed(1) + '</span><small>kg</small></output><button data-a="kg+" aria-label="More">+</button></div>' + B("log:kg", "Log weight", "he-pri"); }
    else html = '<div class="' + X + 'br"><i></i></div>' + B("log:Done", "I’ve done it", "he-pri") + B("open", "Open the full session");
    ph.sheet(it.t, '<div class="' + X + 'opts">' + html + '</div>', function (e) {
      var b = e.target.closest("[data-a]"); if (!b) return; var a = b.dataset.a;
      if (a.indexOf("log:") === 0) return ph.log([it.id], { how: a === "log:kg" ? ph._kg.toFixed(1) + " kg" : a.slice(4) });
      if (a === "open") { ph.closeSheet(); return ph.openPillar(it.p); }
      ph._kg = Math.round((ph._kg + (a === "kg+" ? .1 : -.1)) * 10) / 10;
      ph.el.querySelector("." + X + "kg").textContent = ph._kg.toFixed(1);
    }, sub);
  }

  function week(ph) {
    var d = new Date(), today = d.getDay(), any = ph.items().some(function (x) { return x.done; });
    var days = "SMTWTFS".split("").map(function (l, i) {
      var past = i < today && i >= today - HE.STREAK, cls = (i === today ? " now" : "") + (past || (i === today && any) ? " on" : "");
      return '<span class="' + X + 'd' + cls + '">' + l + '<i></i></span>';
    }).join("");
    var n = HE.STREAK + (any ? 1 : 0);
    return '<div class="' + X + 'wk"><div class="' + X + 'days" aria-label="Days with something logged this week">' + days + '</div><span class="' + X + 'st">' + n + ' days in a row</span></div>';
  }
  function tile(ph, p) {
    var it = target(ph, p), c = HE.P[p], v = HE.DOOR[p].verb;
    var sub = it ? it.t : HE.icon("check", 12, 2.6) + "Done";
    return '<button class="' + X + 't' + (it ? "" : " done") + '" data-t="' + p + '" style="' + vars(p) + '" aria-label="' + v + (it ? ", " + it.t : ", done. Open " + c.n) + '">' +
      '<span class="' + X + 'g">' + HE.icon(it ? p : "check", 18, 2.2) + '</span><span><b>' + v + '</b><small>' + sub + '</small></span></button>';
  }

  HE.add({
    id: "actions", name: "Quick starts", rec: false, group: "doors", kind: "Door",
    pitch: "Verbs before pillars. Home leads with what you can do right now, as four tiles that act in one tap, and a week of dots that shows the streak you are keeping. A KAIRA thought for this part of the day gives a reason to start. The pillars sit underneath as quiet orbs.",
    how: [
      "A greeting, then the week as letters with a dot under every day that had a log. Today's dot is an open ring until something is logged.",
      "Four tiles: Log a meal, Log a workout, Breathe for 5 min, Weigh in. Each names the thing it will log.",
      "A tile logs in one tap when it can (a walk, the stairs). A meal, the breathing and the weight open a short sheet first.",
      "Under the tiles, KAIRA's thought for this part of the day beside a soft orb, with Ask KAIRA.",
      "Your pillars sit last as four small orbs. Tap one and the pillar opens."
    ],
    score: [["Three doors at a glance", "m"], ["One tap in", "y"], ["A hook to start", "y"], ["GoodFlip look", "y"], ["Calm", "y"]],
    catch: "The tiles scroll, so the last one is only half in view, and the pillars sit low enough that they read as secondary. Mind's tile is only about breathing, so sleep and mood have to be found inside Mind.",
    from: "Tide's Home (Good day, week strip, quick action tiles, daily quote with an orb), Headspace's today strip.",
    tryit: "Tap Log a workout (logs in one tap), then Weigh in. Switch to Evening to see KAIRA's thought change.",
    effort: "Low, four shortcuts and one line of copy per part of the day",
    draw: function (ph) {
      ph._kg = ph._kg || 72.6;
      var part = HE.part(HE.hour), hi = part === "night" ? "Good night" : "Good " + part;
      var d = new Date(), date = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
      ph.slot.innerHTML = '<h2 class="' + X + 'hi">' + hi + '</h2>' + week(ph) +
        '<div class="' + X + 'row">' + HE.ORDER.map(function (p) { return tile(ph, p); }).join("") + '</div>' +
        '<div class="' + X + 'q"><div><span class="' + X + 'eb">' + HE.kaira(14) + date + '</span><p>' + LINE[part] + '</p>' +
          '<button class="' + X + 'ask" data-k="1">Ask KAIRA' + HE.icon("arrow", 14, 2.2) + '</button></div><span class="' + X + 'orb" aria-hidden="true"></span></div>' +
        '<div class="' + X + 'lb">Your pillars</div><div class="' + X + 'ps">' + HE.ORDER.map(function (p) {
          return '<button class="' + X + 'p" data-p="' + p + '" style="' + vars(p) + '" aria-label="Open ' + HE.P[p].n + '"><span class="' + X + 'po">' + HE.icon(p, 20, 2) + '</span>' + HE.P[p].n + '</button>';
        }).join("") + '</div>';
      ph.slot.onclick = function (e) {
        var p = e.target.closest("[data-p]"); if (p) return ph.openPillar(p.dataset.p);
        if (e.target.closest("[data-k]")) return ph.toast("KAIRA would open here with this thought, ready for your questions.");
        var t = e.target.closest("[data-t]"); if (!t) return;
        var it = target(ph, t.dataset.t);
        if (!it) return ph.openPillar(t.dataset.t);
        act(ph, it);
      };
    }
  });
})();
