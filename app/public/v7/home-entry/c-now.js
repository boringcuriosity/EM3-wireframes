/* Concept: Now and next. The two things that matter right now as a pair of cards, each with one verb sized to
   its task. Under them, the four pillar scores as slim pills and one KAIRA line on why the left card matters now. */
(function () {
  var E = "cubic-bezier(.2,0,0,1)";
  var css = [
    ".cnow-hd{display:flex;align-items:baseline;justify-content:space-between;margin:0 0 12px}",
    ".cnow-hd h3{margin:0;font:700 18px/26px Roboto;color:#101828}.cnow-hd span{font:500 12px/16px Roboto;color:#98A2B3}",
    ".cnow-pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}",
    ".cnow-pair.one{grid-template-columns:1fr}",
    ".cnow-card{min-width:0;display:flex;flex-direction:column;background:#fff;border:1px solid #EAECF0;border-radius:20px;padding:16px 12px 12px;box-shadow:0 1px 2px rgba(16,24,40,.04),0 10px 20px -12px rgba(16,24,40,.12)}",
    "@keyframes cnowIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}",
    ".cnow-card.in{animation:cnowIn .45s " + E + " 1.45s both}",
    ".cnow-card.in+.cnow-card.in{animation-delay:1.55s}",
    ".cnow-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}",
    ".cnow-orb{flex:none;border-radius:50%;display:grid;place-items:center;box-shadow:inset 0 0 0 1px rgba(255,255,255,.7),0 6px 12px -6px var(--sh);position:relative}",
    ".cnow-orb:after{content:'';position:absolute;left:22%;top:14%;width:26%;height:18%;border-radius:50%;background:rgba(255,255,255,.75);filter:blur(1.5px)}",
    ".cnow-when{height:24px;padding:0 8px;border-radius:999px;font:600 11px/24px Roboto;color:#667085;background:#F9FAFB;white-space:nowrap}",
    ".cnow-when.now{color:#2A805A;background:#F3FCF8}",
    ".cnow-when.now:before{content:'';display:inline-block;width:6px;height:6px;border-radius:50%;background:#299D6B;margin-right:6px;vertical-align:1px}",
    ".cnow-t{margin:0 0 4px;font:700 15px/20px Roboto;color:#101828}",
    ".cnow-d{margin:0 0 12px;font:400 12.5px/17px Roboto;color:#667085;flex:1;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:34px}",
    ".cnow-card .he-pri,.cnow-card .he-sec{height:auto;min-height:44px;padding:8px 10px;font-size:13.5px;line-height:18px}",
    ".cnow-card .he-pri{margin-bottom:5px}.cnow-card .he-sec{margin-bottom:4px}",
    ".cnow-pills{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:16px 0 12px}",
    ".cnow-pill{height:48px;border-radius:14px;border:1px solid #F2F4F7;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font:500 11px/1 Roboto;color:#667085;padding:0 4px;cursor:pointer;transition:background .9s " + E + ",border-color .9s " + E + "}",
    ".cnow-pill span{display:flex;align-items:center;gap:4px}",
    ".cnow-pill i{width:6px;height:6px;border-radius:50%;flex:none}",
    ".cnow-pill b{font:700 15px/1 Roboto;font-variant-numeric:tabular-nums}",
    ".cnow-ins{display:flex;gap:10px;align-items:flex-start;padding:0 4px}",
    ".cnow-ins span{flex:none;margin-top:1px}",
    ".cnow-ins p{margin:0;font:400 13px/19px Roboto;color:#475467}",
    ".cnow-ins p b{font:700 11px/19px Roboto;letter-spacing:.4px;color:#344054;margin-right:6px}",
    ".cnow-done{background:#fff;border:1px solid #EAECF0;border-radius:20px;padding:20px 16px 12px;box-shadow:0 1px 2px rgba(16,24,40,.04),0 10px 20px -12px rgba(16,24,40,.12)}",
    ".cnow-k{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(130% 130% at 28% 18%,#fff 0%,#F5F8FF 36%,#E0F5F5 100%);box-shadow:inset 0 0 0 1px rgba(255,255,255,.8),0 6px 12px -6px rgba(68,76,231,.3);margin-bottom:12px}",
    ".cnow-done h4{margin:0 0 4px;font:700 18px/26px Roboto;color:#101828}.cnow-done p{margin:0 0 4px;font:400 13px/19px Roboto;color:#667085}",
    ".cnow-link{height:40px;padding:0;border:0;background:none;font:700 14px/1 Roboto;color:#2A805A;display:inline-flex;align-items:center;gap:4px;cursor:pointer}",
    /* sheets */
    ".cnow-food{display:flex;gap:12px;align-items:center;padding:12px;border-radius:16px;background:#F9FAFB;margin-bottom:20px}",
    ".cnow-food b{display:block;font:600 15px/20px Roboto;color:#101828}.cnow-food small{font:400 12px/16px Roboto;color:#667085}",
    ".cnow-lbl{font:600 12px/16px Roboto;color:#667085;margin:20px 0 8px}",
    ".cnow-chips{display:flex;flex-wrap:wrap;gap:8px}.cnow-chips .he-chip{height:40px}",
    ".cnow-step{display:flex;align-items:center;justify-content:space-between;border:1px solid #EAECF0;border-radius:16px;padding:6px;margin-bottom:20px}",
    ".cnow-step button{width:48px;height:48px;border-radius:12px;border:0;background:#F9FAFB;color:#344054;font:500 22px/1 Roboto;cursor:pointer}.cnow-step button:active{background:#F2F4F7}",
    ".cnow-step output{font:700 26px/1 Roboto;color:#101828;letter-spacing:-.3px}.cnow-step output small{font:500 14px/1 Roboto;color:#667085;margin-left:4px;letter-spacing:0}",
    ".cnow-faces{display:flex;gap:6px}",
    ".cnow-face{flex:1;height:80px;border:1px solid #EAECF0;border-radius:16px;background:#fff;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;font:500 12px/1 Roboto;color:#667085}",
    ".cnow-face em{font-style:normal;font-size:28px;line-height:1}.cnow-face:active{background:#F3FCF8;border-color:#299D6B}",
    ".cnow-breath{display:grid;place-items:center;height:180px;margin-bottom:8px}",
    ".cnow-breath i{width:120px;height:120px;border-radius:50%;background:radial-gradient(130% 130% at 28% 18%,#FFF 0%,#F5FFFF 32%,#E0FFFF 74%,#2DA6A659 100%);box-shadow:inset 0 0 0 1px rgba(255,255,255,.7),0 16px 30px -14px #2DA6A6aa;animation:cnowBr 10s cubic-bezier(.4,0,.2,1) infinite}",
    "@keyframes cnowBr{0%,100%{transform:scale(.7)}50%{transform:scale(1)}}",
    ".cnow-bt{text-align:center;font:400 14px/20px Roboto;color:#475467;margin:0 0 20px}",
    ".cnow-plan{display:flex;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid #F2F4F7}.cnow-plan:last-child{border:0}",
    ".cnow-plan time{width:64px;flex:none;font:500 12px/16px Roboto;color:#98A2B3}.cnow-plan b{display:block;font:600 14px/20px Roboto;color:#101828}.cnow-plan small{font:400 12px/16px Roboto;color:#667085}",
    "@media (prefers-reduced-motion: reduce){.cnow-card.in{animation:none}.cnow-breath i{animation:none;transform:scale(.85)}.cnow-pill{transition:none}}"
  ].join("");
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  /* the verb sized to each task, and what tapping it does */
  var VERB = {
    sleep: "Tell us how you slept", weigh: "Log weight", bfast: "Log breakfast", walk: "Log walk",
    lunch: "Log lunch", breath: "Start breathing, 5\u00a0min", stairs: "Took the stairs", snack: "Log snack",
    gym: "Log workout", dinner: "Log dinner", mood: "Tell us how it felt", wind: "Phone is away"
  };
  var WHY = {
    sleep: "A short night raises hunger hormones by evening, so knowing it early helps the day go to plan.",
    weigh: "Weighing before breakfast, at the same time each day, keeps food and water out of the number.",
    bfast: "Protein at breakfast, like the peanuts in your poha, keeps you fuller until lunch.",
    walk: "Morning daylight on a walk sets your body clock, so sleep comes easier tonight.",
    lunch: "An on-time lunch keeps evening hunger from building for hours.",
    breath: "Breathing out as long as you breathe in calms the stress that afternoon slumps ride on.",
    stairs: "Short bursts like a flight of stairs help your muscles pull sugar out of the blood.",
    snack: "A protein snack now takes the edge off hunger, so dinner stays the planned size.",
    gym: "Strength work builds muscle, and muscle keeps using sugar even while you rest.",
    dinner: "Dinner two to three hours before bed gives digestion time to settle before sleep.",
    mood: "Naming how the day felt, even in one tap, takes some of its weight off.",
    wind: "Dim light and no screens let melatonin rise on time, so sleep comes sooner."
  };

  function S(ph) {
    if (!ph._nw) ph._nw = { prev: null, kg: 72.4, hrs: 7.5, fresh: false };
    return ph._nw;
  }
  function orb(p, size) {
    var c = HE.P[p];
    return '<span class="cnow-orb" style="width:' + size + 'px;height:' + size + 'px;color:' + c.d + ';--sh:' + c.c + '66;background:radial-gradient(130% 130% at 28% 18%,#FFF 0%,' + c.w + ' 32%,' + c.t + ' 74%,' + c.c + '59 100%)">' + HE.icon(p, Math.round(size * .46), 2) + '</span>';
  }
  function hrs(h) { var m = Math.round(h * 60); return Math.floor(m / 60) + " h" + (m % 60 ? " " + (m % 60) + " m" : ""); }
  function when(x) {
    if (Math.abs(x.at - HE.hour) <= .5) return '<span class="cnow-when now">Now</span>';
    return '<span class="cnow-when">Due ' + HE.clock(x.at) + '</span>';
  }
  /* the next two: what the day asks now, then the rest that is due (latest first), then what is coming */
  function pair(ph) {
    var n = ph.next(); if (!n) return [];
    var due = ph.due(), open = ph.open(), out = [n];   /* ph.due() is already in asking order (HE.rank) */
    due.concat(open).forEach(function (x) { if (out.length < 2 && !out.some(function (o) { return o.id === x.id; })) out.push(x); });
    return out;
  }

  function tomorrow(ph) {
    ph.sheet("Tomorrow’s plan", HE.DAY.map(function (x) {
      return '<div class="cnow-plan"><time>' + HE.clock(x.at) + '</time>' + orb(x.p, 32) + '<div><b>' + x.t + '</b><small>' + x.sub + '</small></div></div>';
    }).join(""), null, "Set by your coach.");
  }

  /* the compact answer for each kind; ticks log in one tap and never get here (breathing is the exception, it is a practice) */
  function answer(ph, x) {
    var s = S(ph);
    if (x.kind === "meal") {
      ph.sheet(x.t, '<div class="cnow-food">' + orb("eat", 40) + '<div><b>' + x.sub + '</b><small>Planned by your coach, ' + HE.clock(x.at) + '</small></div></div>' +
        '<button class="he-pri" data-n="plan">Had it as planned</button>' +
        '<div class="cnow-lbl">Something changed?</div><div class="cnow-chips">' +
        [["less", "Smaller portion"], ["more", "Bigger portion"], ["diff", "Something different"]].map(function (c) { return '<button class="he-chip" data-n="' + c[0] + '">' + c[1] + '</button>'; }).join("") + '</div>',
        function (e) { var b = e.target.closest("[data-n]"); if (b) ph.log(x.id, { how: b.dataset.n }); });
      return;
    }
    if (x.kind === "sleep" || x.kind === "num") {
      var sl = x.kind === "sleep";
      var val = function () { return sl ? hrs(s.hrs) : s.kg.toFixed(1) + "<small>kg</small>"; };
      ph.sheet(sl ? "How long did you sleep?" : "Your weight",
        '<div class="cnow-step"><button data-n="-" aria-label="Less">−</button><output>' + val() + '</output><button data-n="+" aria-label="More">+</button></div><button class="he-pri" data-n="ok">Save</button>',
        function (e) {
          var b = e.target.closest("[data-n]"); if (!b) return;
          if (b.dataset.n === "ok") return ph.log(x.id, { how: sl ? hrs(s.hrs) : s.kg + " kg" });
          var up = b.dataset.n === "+";
          if (sl) s.hrs = Math.max(3, Math.min(11, s.hrs + (up ? .5 : -.5)));
          else s.kg = Math.round((s.kg + (up ? .1 : -.1)) * 10) / 10;
          ph.el.querySelector(".he-sheet output").innerHTML = val();
        }, sl ? x.sub : "Last time 72.4 kg");
      return;
    }
    if (x.kind === "mood") {
      ph.sheet("How has your day been?", '<div class="cnow-faces">' + HE.FACES.map(function (f, i) { return '<button class="cnow-face" data-n="' + i + '" aria-label="' + f[0] + '"><em>' + f[1] + '</em>' + f[0] + '</button>'; }).join("") + '</div>',
        function (e) { var b = e.target.closest("[data-n]"); if (b) ph.log(x.id, { how: HE.FACES[+b.dataset.n][0] }); });
      return;
    }
    if (x.id === "breath") {
      ph.sheet("Simple Breathing", '<div class="cnow-breath"><i></i></div><p class="cnow-bt">Breathe in as the circle grows, out as it settles.</p><button class="he-pri" data-n="ok">I’m done, log it</button>',
        function (e) { if (e.target.closest("[data-n]")) ph.log(x.id); }, x.sub);
      return;
    }
    ph.log(x.id);
  }

  HE.add({
    id: "now", name: "Now and next", rec: false,
    pitch: "Two cards for the two things that matter right now, each with one verb sized to its task. Ticks log in one tap, everything else opens a small sheet, and the four scores sit right under them so the effect of logging is visible.",
    how: [
      "Home opens on a pair: the left card is the thing due now, the right one is next.",
      "Each card shows the coach’s plan and time, and one verb: “Log lunch”, “Start breathing, 5 min”, “Tell us how you slept”.",
      "A tick logs in one tap; a meal, sleep, weight or mood opens a compact sheet with the plan already filled in.",
      "After the win, the pillar pill that moved counts up, and the pair slides to the next two.",
      "Under the pills, one KAIRA line says why the left card matters now. When all is done, a calm card points at tomorrow."
    ],
    score: [["The right thing now", "y"], ["Answer where you are", "m"], ["Pillars in view", "y"], ["GoodFlip look", "y"], ["KAIRA carries insight", "y"]],
    catch: "Only two items are ever on Home, so someone catching up on a busy morning works through them two at a time. Meals, sleep and weight still take a sheet, so not everything is one tap.",
    from: "Today’s Focus (Purva Patel), Visible check-ins, Yazio “bright for now”, Cal AI widget pair.",
    tryit: "At Morning tap “Tell us how you slept”, then “Log weight”; at Afternoon try “Start breathing, 5 min”; switch to Night and finish the day.",
    effort: "Low to Medium, two cards, four pills and four small sheets",
    draw: function (ph) {
      var s = S(ph), two = pair(ph), sc = ph.scores, prev = s.prev, fresh = s.fresh;
      s.prev = Object.assign({}, sc); s.fresh = false;
      var h = '<div class="cnow-hd"><h3>Right now</h3><span>' + HE.clock(HE.hour) + '</span></div>';
      if (two.length) {
        h += '<div class="cnow-pair' + (two.length === 1 ? " one" : "") + '">' + two.map(function (x, i) {
          return '<div class="cnow-card' + (fresh ? " in" : "") + '"><div class="cnow-top">' + orb(x.p, 36) + when(x) + '</div>' +
            '<h4 class="cnow-t">' + x.t + '</h4><p class="cnow-d">' + x.sub + '</p>' +
            '<button class="' + (i ? "he-sec" : "he-pri") + '" data-v="' + x.id + '">' + VERB[x.id] + '</button></div>';
        }).join("") + '</div>';
      } else {
        h += '<div class="cnow-done' + (fresh ? " cnow-card in" : "") + '"><div class="cnow-k">' + HE.kaira(22) + '</div><h4>All done for the day</h4>' +
          '<p>Your coach’s plan is complete. Rest is part of it.</p><button class="cnow-link" data-v="tmw">See tomorrow’s plan' + HE.icon("chev", 16, 2.4) + '</button></div>';
      }
      h += '<div class="cnow-pills">' + HE.ORDER.map(function (p) {
        var c = HE.P[p], from = prev ? prev[p] : sc[p];
        return '<button class="cnow-pill" data-p="' + p + '" aria-label="' + c.score + ' ' + sc[p] + '%"><b style="color:' + c.d + '" data-from="' + from + '" data-to="' + sc[p] + '">' + from + '%</b><span><i style="background:' + c.c + '"></i>' + c.n + '</span></button>';
      }).join("") + '</div>';
      var lead = two[0];
      h += '<div class="cnow-ins"><span>' + HE.kaira(18) + '</span><p><b>KAIRA</b>' + (lead ? WHY[lead.id] : "Sleep is when the day’s work turns into progress: muscles repair and hunger hormones reset.") + '</p></div>';
      ph.slot.innerHTML = h;

      /* the pill that moved counts up as the green clears, its tint fading back to white */
      [].forEach.call(ph.slot.querySelectorAll(".cnow-pill b"), function (b) {
        var a = +b.dataset.from, z = +b.dataset.to; if (a === z) return;
        var pill = b.parentNode, p = pill.dataset.p, t0 = null;
        pill.style.background = HE.P[p].w; pill.style.borderColor = HE.P[p].t;
        setTimeout(function () {
          pill.style.background = ""; pill.style.borderColor = "";
          var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
          if (reduce) { b.textContent = z + "%"; return; }
          (function step(t) {
            if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 700), e = 1 - Math.pow(1 - k, 3);
            b.textContent = Math.round(a + (z - a) * e) + "%";
            if (k < 1 && b.isConnected) requestAnimationFrame(step);
          })(performance.now());
        }, 1600);
      });

      ph.slot.onclick = function (e) {
        var pl = e.target.closest("[data-p]");
        if (pl) { var p = pl.dataset.p; return ph.toast(HE.P[p].score + " is at " + ph.scores[p] + "%. Open " + HE.P[p].n + " to see what builds it."); }
        var b = e.target.closest("[data-v]"); if (!b) return;
        if (b.dataset.v === "tmw") return tomorrow(ph);
        var x = ph.items().filter(function (i) { return i.id === b.dataset.v; })[0];
        s.fresh = true;
        answer(ph, x);
      };
      /* closing a sheet without answering should not replay the entrance */
      if (!ph._nwX) { ph._nwX = 1; ph.el.querySelector(".he-scrim").addEventListener("click", function () { s.fresh = false; }); ph.el.querySelector(".he-sheet").addEventListener("click", function (e) { if (e.target.closest('[data-he="x"]')) s.fresh = false; }); }
    }
  });
})();
