/* Concept: Question cards. The day's due questions as a short, calm stack. Answer the top card with one tap
   (or a sideways swipe), it slides away and the next one rises. Answered items sit above as chips. */
(function () {
  var E = "cubic-bezier(.2,0,0,1)", E2 = "cubic-bezier(.4,0,.2,1)";
  var css = [
    ".cdeck-hd{display:flex;align-items:baseline;justify-content:space-between;margin:0 0 8px}",
    ".cdeck-hd h3{margin:0;font:700 18px/26px Roboto;color:#101828}.cdeck-hd span{font:500 12px/16px Roboto;color:#98A2B3}",
    ".cdeck-chips{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;margin:0 -16px 8px;padding:0 16px}.cdeck-chips::-webkit-scrollbar{display:none}",
    ".cdeck-chip{flex:none;height:40px;padding:0;border:0;background:none;cursor:pointer;display:flex;align-items:center}",
    ".cdeck-chip>span{height:32px;padding:0 12px 0 6px;border-radius:999px;background:#F9FAFB;border:1px solid #F2F4F7;display:inline-flex;align-items:center;gap:6px;font:500 12.5px/1 Roboto;color:#475467;white-space:nowrap}",
    ".cdeck-chip i{width:20px;height:20px;border-radius:50%;display:grid;place-items:center;color:#fff}",
    ".cdeck-stack{position:relative;margin-bottom:20px}",
    ".cdeck-card{position:relative;z-index:3;background:#fff;border:1px solid #EAECF0;border-radius:24px;padding:20px 16px 16px;box-shadow:0 1px 2px rgba(16,24,40,.04),0 12px 24px -12px rgba(16,24,40,.12);touch-action:pan-y;user-select:none;-webkit-user-select:none;transition:transform .36s " + E2 + ",opacity .36s " + E2 + "}",
    ".cdeck-card.drag{transition:none}",
    ".cdeck-peek{position:absolute;left:0;right:0;top:0;bottom:0;background:#fff;border:1px solid #EAECF0;border-radius:24px;transform-origin:50% 100%;transition:transform .36s " + E + "}",
    ".cdeck-peek.p1{z-index:2;transform:translateY(8px) scale(.95);box-shadow:0 8px 16px -10px rgba(16,24,40,.1)}",
    ".cdeck-peek.p2{z-index:1;transform:translateY(16px) scale(.9);background:#FCFCFD}",
    ".cdeck-card.gone-r{transform:translateX(115%);opacity:0}",
    ".cdeck-card.gone-l{transform:translateX(-115%);opacity:0}",
    ".cdeck-card.sink{transform:translateY(16px) scale(.9);opacity:0}",
    "@keyframes cdeckRise{from{transform:translateY(8px) scale(.95);opacity:.6}to{transform:none;opacity:1}}",
    ".cdeck-card.rise{animation:cdeckRise .42s " + E + " both}",
    ".cdeck-card.rise-late{animation:cdeckRise .5s " + E + " 1.5s both}",
    ".cdeck-eb{display:flex;align-items:center;gap:12px;margin-bottom:16px}",
    ".cdeck-orb{flex:none;border-radius:50%;display:grid;place-items:center;box-shadow:inset 0 0 0 1px rgba(255,255,255,.7),0 6px 12px -6px var(--sh);position:relative}",
    ".cdeck-orb:after{content:'';position:absolute;left:22%;top:14%;width:26%;height:18%;border-radius:50%;background:rgba(255,255,255,.75);filter:blur(1.5px)}",
    ".cdeck-eb b{display:block;font:500 12px/16px Roboto;color:#667085;letter-spacing:.2px}",
    ".cdeck-eb small{display:block;font:400 12px/16px Roboto;color:#98A2B3;margin-top:2px}",
    ".cdeck-q{margin:0 0 4px;font:700 20px/28px Roboto;color:#101828;letter-spacing:-.2px}",
    ".cdeck-sub{margin:0 0 20px;font:400 14px/20px Roboto;color:#475467}",
    ".cdeck-acts{display:flex;flex-direction:column;gap:12px}",
    ".cdeck-row{display:flex;gap:8px;align-items:center}.cdeck-row .he-sec{flex:1}",
    ".cdeck-later{flex:none;height:46px;padding:0 14px;border:0;background:none;font:600 14px/1 Roboto;color:#667085;cursor:pointer;border-radius:12px}",
    ".cdeck-later:active{background:#F9FAFB}",
    ".cdeck-later.w{width:100%;height:40px}",
    ".cdeck-faces{display:flex;justify-content:space-between;gap:4px}",
    ".cdeck-face{flex:1;min-width:0;height:72px;border:1px solid #EAECF0;border-radius:16px;background:#fff;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;font:500 11px/1 Roboto;color:#667085;transition:border-color .2s,background .2s}",
    ".cdeck-face em{font-style:normal;font-size:24px;line-height:1}.cdeck-face:active{background:#F3FCF8;border-color:#299D6B}",
    ".cdeck-step{display:flex;align-items:center;justify-content:space-between;border:1px solid #EAECF0;border-radius:16px;padding:6px}",
    ".cdeck-step button{width:44px;height:44px;border-radius:12px;border:0;background:#F9FAFB;color:#344054;font:500 22px/1 Roboto;cursor:pointer}",
    ".cdeck-step button:active{background:#F2F4F7}",
    ".cdeck-step output{font:700 24px/1 Roboto;color:#101828;letter-spacing:-.3px}.cdeck-step output small{font:500 14px/1 Roboto;color:#667085;margin-left:4px;letter-spacing:0}",
    ".cdeck-hint{position:absolute;top:20px;height:28px;padding:0 10px;border-radius:999px;font:700 12px/28px Roboto;opacity:0;pointer-events:none}",
    ".cdeck-hint.y{right:16px;background:#E6FAF1;color:#2A805A}.cdeck-hint.n{right:16px;background:#F2F4F7;color:#475467}",
    ".cdeck-calm{text-align:left}",
    ".cdeck-k{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(130% 130% at 28% 18%,#fff 0%,#F5F8FF 36%,#E0F5F5 100%);box-shadow:inset 0 0 0 1px rgba(255,255,255,.8),0 6px 12px -6px rgba(68,76,231,.3);margin-bottom:16px}",
    ".cdeck-calm h4{margin:0 0 8px;font:700 20px/28px Roboto;color:#101828}",
    ".cdeck-ins{margin:0 0 16px;font:400 14px/21px Roboto;color:#475467}",
    ".cdeck-ins b{font-weight:700;color:#344054;letter-spacing:.4px;font-size:11px;display:block;margin-bottom:4px}",
    ".cdeck-link{height:40px;padding:0;border:0;background:none;font:700 14px/1 Roboto;color:#2A805A;display:inline-flex;align-items:center;gap:4px;cursor:pointer}",
    ".cdeck-opt{width:100%;min-height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;border:1px solid #EAECF0;border-radius:14px;background:#fff;font:500 15px/1.3 Roboto;color:#101828;cursor:pointer;margin-bottom:8px;text-align:left}",
    ".cdeck-opt:active{background:#F9FAFB}.cdeck-opt svg{color:#98A2B3}",
    ".cdeck-plan{display:flex;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid #F2F4F7}.cdeck-plan:last-child{border:0}",
    ".cdeck-plan time{width:64px;flex:none;font:500 12px/16px Roboto;color:#98A2B3}.cdeck-plan b{display:block;font:600 14px/20px Roboto;color:#101828}.cdeck-plan small{font:400 12px/16px Roboto;color:#667085}",
    "@media (prefers-reduced-motion: reduce){.cdeck-card,.cdeck-peek{transition:none}.cdeck-card.rise,.cdeck-card.rise-late{animation:none}}"
  ].join("");
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  /* why it matters, one line per plan item (a mechanism, never a recap) */
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
  var DONE_LINE = "Sleep is when the day’s work turns into progress: muscles repair and hunger hormones reset.";
  var HOW = { plan: "as planned", less: "a smaller portion", more: "a bigger portion", diff: "something different", part: "part of it", done: "done" };

  function S(ph) {
    if (!ph._dk) ph._dk = { back: [], how: {}, kg: 72.4, hrs: 7.5, rise: "", early: null };
    return ph._dk;
  }
  function orb(p, size) {
    var c = HE.P[p];
    return '<span class="cdeck-orb" style="width:' + size + 'px;height:' + size + 'px;color:' + c.d + ';--sh:' + c.c + '66;background:radial-gradient(130% 130% at 28% 18%,#FFF 0%,' + c.w + ' 32%,' + c.t + ' 74%,' + c.c + '59 100%)">' + HE.icon(p, Math.round(size * .46), 2) + '</span>';
  }
  function hrs(h) { var m = Math.round(h * 60); return Math.floor(m / 60) + " h" + (m % 60 ? " " + (m % 60) + " m" : ""); }

  /* the queue: what the day asks now first (ph.next), then the rest that is due, latest first; "Not yet" goes to the back */
  function queue(ph) {
    var s = S(ph), due = ph.due(), q;
    if (due.length) { var n = ph.next(); q = [n].concat(due.filter(function (x) { return x.id !== n.id; })); }
    else if (s.early === HE.hour) q = ph.open();
    else q = [];
    var k = function (x) { return s.back.indexOf(x.id); };
    return q.map(function (x, i) { return [x, i]; }).sort(function (a, b) { return (k(a[0]) - k(b[0])) || (a[1] - b[1]); }).map(function (a) { return a[0]; });
  }

  function acts(x, s) {
    var later = '<button class="cdeck-later" data-a="later">Not yet</button>';
    if (x.kind === "mood") return '<div class="cdeck-faces">' + HE.FACES.map(function (f, i) { return '<button class="cdeck-face" data-a="mood" data-v="' + i + '" aria-label="' + f[0] + '"><em>' + f[1] + '</em>' + f[0] + '</button>'; }).join("") + '</div>' + later.replace('cdeck-later"', 'cdeck-later w"');
    if (x.kind === "num") return '<div class="cdeck-step"><button data-a="kg-" aria-label="Less">−</button><output>' + s.kg.toFixed(1) + '<small>kg</small></output><button data-a="kg+" aria-label="More">+</button></div><div class="cdeck-row"><button class="he-pri" data-a="kg">Save weight</button>' + later + '</div>';
    if (x.kind === "tick") return '<button class="he-pri" data-a="plan">Yes, done</button><div class="cdeck-row"><button class="he-sec" data-a="part">Did part of it</button>' + later + '</div>';
    return '<button class="he-pri" data-a="plan">' + (x.kind === "sleep" ? "Slept as planned" : "Yes, as planned") + '</button><div class="cdeck-row"><button class="he-sec" data-a="else">Something else</button>' + later + '</div>';
  }

  function card(x, s) {
    var P = HE.P[x.p];
    return '<div class="cdeck-eb">' + orb(x.p, 44) + '<div><b>' + P.n + ' · ' + x.t + '</b><small>' + (x.at <= HE.hour + .25 ? "Planned for " : "Coming up at ") + HE.clock(x.at) + '</small></div></div>' +
      '<h3 class="cdeck-q">' + x.ask + '</h3><p class="cdeck-sub">' + x.sub + '</p>' +
      '<div class="cdeck-acts">' + acts(x, s) + '</div>' +
      '<span class="cdeck-hint y">Yes</span><span class="cdeck-hint n">Not yet</span>';
  }

  function tomorrow(ph) {
    ph.sheet("Tomorrow’s plan", HE.DAY.map(function (x) {
      return '<div class="cdeck-plan"><time>' + HE.clock(x.at) + '</time>' + orb(x.p, 32) + '<div><b>' + x.t + '</b><small>' + x.sub + '</small></div></div>';
    }).join(""), null, "Set by your coach. The same questions will be waiting in the morning.");
  }

  HE.add({
    id: "deck", name: "Question cards", rec: false,
    pitch: "The day’s due questions as a short stack of soft cards. One question at a time, one tap to answer, and the next one rises, so checking in feels like flipping through a few cards rather than filling a form.",
    how: [
      "Home opens on the question that matters now, with two more peeking behind it.",
      "Tap “Yes, as planned” (or swipe right): the card slides away, the green win plays, the next question rises.",
      "“Something else” opens a short sheet of real alternatives; “Not yet” (or swipe left) tucks the card to the back.",
      "Answered items gather above the stack as small chips that keep their names.",
      "When nothing is due, a calm KAIRA card says why the next item matters; at the end of the day it points to tomorrow."
    ],
    score: [["The right thing now", "y"], ["Answer where you are", "y"], ["Pillars in view", "m"], ["GoodFlip look", "y"], ["KAIRA carries insight", "m"]],
    catch: "Only one question is visible at a time, so the shape of the whole day and the four scores are out of view. Swipe is a gesture people must discover, the buttons do the real work.",
    from: "Stoic daily cards, Oura Advisor check-in card, Calm Sleep “I did this”, Today’s Focus cards.",
    tryit: "At Morning tap “Yes, as planned”, then “Not yet” on the next card; drag a card sideways; switch to Night and clear the stack.",
    effort: "Medium, one card component plus a stack and swipe",
    draw: function (ph) {
      var s = S(ph), q = queue(ph), items = ph.items(), open = ph.open();
      var done = items.filter(function (x) { return x.done; });
      var h = '<div class="cdeck-hd"><h3>Check in</h3>' + '</div>';
      if (done.length) h += '<div class="cdeck-chips" role="list">' + done.map(function (x) {
        return '<button class="cdeck-chip" role="listitem" data-c="' + x.id + '" aria-label="' + x.t + ', answered"><span><i style="background:' + HE.P[x.p].c + '">' + HE.icon("check", 12, 3) + '</i>' + x.t + '</span></button>';
      }).join("") + '</div>';
      h += '<div class="cdeck-stack">';
      if (q.length) {
        var top = q[0];
        h += '<div class="cdeck-card ' + (s.rise === "win" ? "rise-late" : s.rise === "quick" ? "rise" : "") + '" data-id="' + top.id + '">' + card(top, s) + '</div>';
        if (q[1]) h += '<div class="cdeck-peek p1"></div>';
        if (q[2]) h += '<div class="cdeck-peek p2"></div>';
      } else if (!open.length) {
        h += '<div class="cdeck-card cdeck-calm ' + (s.rise ? "rise-late" : "") + '"><div class="cdeck-k">' + HE.kaira(24) + '</div><h4>All answered</h4>' +
          '<p class="cdeck-ins"><b>KAIRA</b>' + DONE_LINE + '</p><button class="cdeck-link" data-a="tmw">See tomorrow’s plan' + HE.icon("chev", 16, 2.4) + '</button></div>';
      } else {
        var nx = open[0];
        h += '<div class="cdeck-card cdeck-calm ' + (s.rise ? "rise-late" : "") + '"><div class="cdeck-k">' + HE.kaira(24) + '</div><h4>Nothing to answer right now</h4>' +
          '<p class="cdeck-ins"><b>KAIRA</b>' + WHY[nx.id] + '</p>' +
          '<div class="cdeck-row"><span style="flex:1;font:500 13px/18px Roboto;color:#667085">Next: ' + nx.t + ', ' + HE.clock(nx.at) + '</span><button class="cdeck-link" data-a="early">Answer early' + HE.icon("chev", 16, 2.4) + '</button></div></div>';
      }
      h += '</div>';
      ph.slot.innerHTML = h;
      s.rise = "";

      var cardEl = ph.slot.querySelector(".cdeck-card[data-id]"), x = q[0];

      function answer(how, dir) {
        if (!cardEl || cardEl._gone) return;
        cardEl._gone = true;
        s.how[x.id] = how; s.rise = "win";
        var at = dir ? ph._dkAt : undefined;
        cardEl.classList.remove("drag", "rise", "rise-late"); cardEl.style.transform = ""; cardEl.style.opacity = "";
        cardEl.classList.add(dir === "l" ? "gone-l" : "gone-r");
        setTimeout(function () { s.back = s.back.filter(function (id) { return id !== x.id; }); ph.log(x.id, { how: how, at: at }); }, 240);
      }
      function later() {
        if (!cardEl || cardEl._gone) return;
        if (q.length < 2) { ph.toast("It will wait here until you are ready."); snap(); return; }
        cardEl._gone = true;
        cardEl.classList.remove("drag", "rise", "rise-late"); cardEl.style.transform = ""; cardEl.style.opacity = "";
        cardEl.classList.add(cardEl._swiped ? "gone-l" : "sink");
        s.back = s.back.filter(function (id) { return id !== x.id; }).concat(x.id); s.rise = "quick";
        setTimeout(function () { ph.draw(); }, 300);
      }
      function snap() { if (!cardEl) return; cardEl.classList.remove("drag"); cardEl.style.transform = ""; hint(0); }
      function hint(dx) {
        if (!cardEl) return;
        var y = cardEl.querySelector(".cdeck-hint.y"), n = cardEl.querySelector(".cdeck-hint.n");
        var canYes = x.kind !== "mood";
        y.style.opacity = dx > 0 && canYes ? Math.min(1, dx / 90) : 0;
        n.style.opacity = dx < 0 ? Math.min(1, -dx / 90) : 0;
      }
      function primary() {
        if (x.kind === "num") return "kg " + s.kg.toFixed(1);
        if (x.kind === "mood") return null;
        return "plan";
      }
      function elseSheet() {
        if (x.kind === "sleep") {
          var body = function () { return '<div class="cdeck-step" style="margin-bottom:20px"><button data-s="-" aria-label="Less">−</button><output>' + hrs(s.hrs) + '</output><button data-s="+" aria-label="More">+</button></div><button class="he-pri" data-s="ok">Save sleep</button>'; };
          ph.sheet("How long did you sleep?", body(), function (e) {
            var b = e.target.closest("[data-s]"); if (!b) return;
            if (b.dataset.s === "ok") return answer("slept " + hrs(s.hrs));
            s.hrs = Math.max(3, Math.min(11, s.hrs + (b.dataset.s === "+" ? .5 : -.5)));
            ph.el.querySelector(".he-sheet output").textContent = hrs(s.hrs);
          }, x.sub);
          return;
        }
        ph.sheet(x.t, ["less", "more", "diff"].map(function (k) {
          return '<button class="cdeck-opt" data-o="' + k + '">I had ' + HOW[k] + HE.icon("chev", 18, 2) + '</button>';
        }).join(""), function (e) { var b = e.target.closest("[data-o]"); if (b) answer(b.dataset.o); }, "Planned: " + x.sub);
      }

      ph.slot.onclick = function (e) {
        var c = e.target.closest("[data-c]");
        if (c) { var it = HE.DAY.filter(function (d) { return d.id === c.dataset.c; })[0], how = s.how[it.id];
          return ph.toast(it.t + ": " + (HOW[how] || how || "done") + ". Change it in " + HE.P[it.p].n + "."); }
        var b = e.target.closest("[data-a]"); if (!b) return;
        if (cardEl && cardEl._dragged) { cardEl._dragged = false; return; }
        var a = b.dataset.a;
        if (a === "tmw") return tomorrow(ph);
        if (a === "early") { s.early = HE.hour; s.rise = "quick"; return ph.draw(); }
        if (a === "plan" || a === "part") return answer(a);
        if (a === "else") return elseSheet();
        if (a === "later") return later();
        if (a === "mood") return answer("felt " + HE.FACES[+b.dataset.v][0].toLowerCase());
        if (a === "kg") return answer("kg " + s.kg.toFixed(1));
        if (a === "kg-" || a === "kg+") { s.kg = Math.round((s.kg + (a === "kg+" ? .1 : -.1)) * 10) / 10; b.parentNode.querySelector("output").innerHTML = s.kg.toFixed(1) + "<small>kg</small>"; }
      };

      /* swipe: drag sideways, right answers yes, left is "not yet"; the card follows the finger, then eases */
      if (cardEl) {
        var sx = 0, sy = 0, dx = 0, on = false, dragging = false;
        cardEl.addEventListener("pointerdown", function (e) {
          if (e.button || cardEl._gone) return;
          var r = ph.el.getBoundingClientRect(); ph._dkAt = { x: e.clientX - r.left, y: e.clientY - r.top };
          sx = e.clientX; sy = e.clientY; dx = 0; on = true; dragging = false; cardEl._dragged = false;
        });
        cardEl.addEventListener("pointermove", function (e) {
          if (!on) return;
          dx = e.clientX - sx;
          if (!dragging) {
            if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(e.clientY - sy)) return;
            dragging = true; cardEl._dragged = true; cardEl.classList.add("drag");
            try { cardEl.setPointerCapture(e.pointerId); } catch (_) {}
          }
          cardEl.style.transform = "translateX(" + dx + "px) rotate(" + (dx / 60) + "deg)";
          hint(dx);
        });
        var end = function () {
          if (!on) return; on = false;
          if (!dragging) return;
          var r = ph.el.getBoundingClientRect(), cr = cardEl.getBoundingClientRect();
          ph._dkAt = { x: cr.left - r.left + cr.width / 2, y: cr.top - r.top + cr.height / 2 };
          if (dx > 90 && primary()) { answer(primary(), "r"); }
          else if (dx < -90) { cardEl._swiped = true; later(); }
          else snap();
          setTimeout(function () { cardEl._dragged = false; }, 0);
        };
        cardEl.addEventListener("pointerup", end);
        cardEl.addEventListener("pointercancel", function () { on = false; snap(); });
      }
    }
  });
})();
