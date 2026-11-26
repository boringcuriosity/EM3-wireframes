/* Home entry concept: Say it in a sentence (v7/home-entry-points.html, 24 Nov 2026).
   The day reads as one short first-person sentence. Each coloured token is a blank the person fills by tapping,
   the token rewrites in place and the item is logged. Only due items appear, at most three clauses. */
(function () {
  var css = document.createElement("style");
  css.textContent = [
    ".csentence-w{position:relative;padding:8px 4px 0}",
    ".csentence-hi{font:500 15px/20px Roboto;color:#667085;letter-spacing:.1px;margin:0 0 12px}",
    ".csentence-s{font-weight:400;color:#101828;letter-spacing:-.3px;margin:0;text-wrap:pretty}",
    ".csentence-t{position:relative;display:inline;font:inherit;font-weight:500;color:var(--c);background:var(--w);border:0;border-radius:10px;padding:1px 5px 2px;margin:0 -2px;cursor:pointer;",
      "-webkit-box-decoration-break:clone;box-decoration-break:clone;letter-spacing:inherit;",
      "background-image:repeating-linear-gradient(90deg,var(--c) 0 6px,transparent 6px 10px);background-size:calc(100% - 12px) 2px;background-position:6px calc(100% - 3px);background-repeat:no-repeat;",
      "transition:color .25s cubic-bezier(.2,0,0,1),background-color .25s cubic-bezier(.2,0,0,1),opacity .18s cubic-bezier(.4,0,.2,1)}",
    ".csentence-t::before{content:'';position:absolute;inset:-6px -2px}",
    ".csentence-t:focus-visible{outline:2px solid var(--c);outline-offset:2px}",
    ".csentence-t .cv{display:inline-block;vertical-align:middle;margin:-4px 0 0 2px;opacity:.7;transform:rotate(90deg)}",
    ".csentence-t.set{color:var(--d);background-image:linear-gradient(var(--c),var(--c))}",
    ".csentence-t.on{background-color:var(--t)}",
    ".csentence-t.swap{opacity:0}",
    ".csentence-k{display:flex;gap:8px;align-items:flex-start;margin:16px 0 0;font:400 14px/20px Roboto;color:#475467}",
    ".csentence-k svg{flex:none;margin-top:2px}",
    ".csentence-more{display:inline-flex;align-items:center;gap:4px;height:40px;margin:4px 0 -4px;padding:0;border:0;background:none;font:600 13px/1 Roboto;color:#2A805A;cursor:pointer}",
    ".csentence-dots{display:flex;gap:16px;margin:16px 0 0;padding:12px 0 0;border-top:1px solid #F2F4F7}",
    ".csentence-d{display:flex;align-items:center;gap:6px;font:400 12px/1 Roboto;color:#667085}",
    ".csentence-d i{width:8px;height:8px;border-radius:50%;background:radial-gradient(130% 130% at 28% 18%,#fff 0%,var(--w) 20%,var(--c) 90%)}",
    ".csentence-d b{font:600 13px/1 Roboto;color:#101828;font-variant-numeric:tabular-nums}",
    ".csentence-next{display:flex;align-items:center;gap:6px;margin:8px 0 0;font:500 13px/18px Roboto;color:#667085}",
    /* the inline picker, anchored under the token */
    ".csentence-pop{position:absolute;z-index:8;width:232px;padding:6px;background:#fff;border:1px solid #F2F4F7;border-radius:16px;",
      "box-shadow:0 12px 24px -6px rgba(16,24,40,.14),0 4px 8px -4px rgba(16,24,40,.06);opacity:0;transform:translateY(-6px);transition:opacity .22s cubic-bezier(.2,0,0,1),transform .22s cubic-bezier(.2,0,0,1)}",
    ".csentence-pop.on{opacity:1;transform:none}",
    ".csentence-pop button{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:2px;width:100%;min-height:44px;padding:8px 12px;border:0;border-radius:10px;background:none;text-align:left;font:500 15px/20px Roboto;color:#101828;cursor:pointer;transition:background .2s cubic-bezier(.2,0,0,1)}",
    ".csentence-pop button:hover,.csentence-pop button:focus-visible{background:var(--w);outline:0}",
    ".csentence-pop button.cur{background:var(--w);color:var(--d)}",
    ".csentence-pop small{font:400 12px/16px Roboto;color:#667085}",
    ".csentence-pop .faces{display:flex;gap:2px}",
    ".csentence-pop .faces button{align-items:center;padding:6px 0;min-height:56px;font-size:22px;line-height:1}",
    ".csentence-pop .faces small{font-size:11px}",
    /* the weight sheet */
    ".csentence-step{display:flex;align-items:center;justify-content:center;gap:24px;margin:8px 0 24px}",
    ".csentence-step button{width:48px;height:48px;border-radius:50%;border:1px solid #E4E7EC;background:#fff;font:500 24px/1 Roboto;color:#344054;cursor:pointer}",
    ".csentence-step b{font:500 40px/1 Roboto;letter-spacing:-.5px;min-width:130px;text-align:center}.csentence-step b small{font-size:17px;color:#667085;margin-left:4px}",
    ".csentence-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-top:1px solid #F2F4F7}",
    ".csentence-row:first-of-type{border-top:0}",
    ".csentence-row i{width:10px;height:10px;border-radius:50%;flex:none}",
    ".csentence-row div{flex:1;font:500 15px/20px Roboto}.csentence-row small{display:block;font:400 13px/18px Roboto;color:#667085}",
    "@media (prefers-reduced-motion: reduce){.csentence-t,.csentence-pop{transition:none}}"
  ].join("");
  document.head.appendChild(css);

  /* each item as a clause: subject, the open blank, and the answers that can fill it */
  var C = {
    sleep:  { s: "I slept", open: "how long", opts: [["7h 30m", "plan", "As planned, 10:30 to 6"], ["about 6 hours", "short"], ["under 6 hours", "poor"], ["8 hours or more", "long"]] },
    weigh:  { s: "I", open: "haven't weighed in", yet: 1, sheet: 1 },
    bfast:  { s: "I", open: "haven't had breakfast", yet: 1, opts: [["had the poha", "plan", "Vegetable poha, 1 bowl"], ["had something else", "other"], ["had a smaller bowl", "less"], ["skipped breakfast", "skip"]] },
    walk:   { s: "I", open: "haven't walked", yet: 1, opts: [["walked 20 minutes", "plan", "As planned, easy pace"], ["walked a little", "part"], ["skipped my walk", "skip"]] },
    lunch:  { s: "I", open: "haven't had lunch", yet: 1, opts: [["had the dal and roti", "plan", "2 roti, dal, sabzi, salad"], ["had something else", "other"], ["had a lighter lunch", "less"], ["skipped lunch", "skip"]] },
    breath: { s: "I", open: "haven't done my breathing", yet: 1, opts: [["took 5 minutes to breathe", "plan", "In 5 s, out 5 s"], ["took a few slow breaths", "part"], ["skipped breathing", "skip"]] },
    stairs: { s: "I", open: "haven't taken the stairs", yet: 1, opts: [["took the stairs", "plan"], ["took the stairs twice", "more"]] },
    snack:  { s: "I", open: "haven't had my snack", yet: 1, opts: [["had the roasted chana", "plan", "1 small bowl"], ["had something else", "other"], ["skipped my snack", "skip"]] },
    gym:    { s: "I", open: "haven't trained", yet: 1, opts: [["did my full workout", "plan", "25 min, 6 exercises"], ["did part of it", "part"], ["chose rest", "rest", "Rest counts when your body asks for it"]] },
    dinner: { s: "I", open: "haven't had dinner", yet: 1, opts: [["had the paneer and roti", "plan", "Grilled paneer, sabzi, 1 roti"], ["had something else", "other"], ["had a lighter dinner", "less"], ["skipped dinner", "skip"]] },
    mood:   { s: "the day felt", open: "how", faces: 1 },
    wind:   { s: "I", open: "haven't put my phone away", yet: 1, opts: [["put my phone away", "plan", "Lights low too"], ["kept my phone a bit longer", "late"]] }
  };
  /* KAIRA's line under the sentence: what to know about the nearest open blank, never a recap */
  var INS = {
    sleep: "A short night raises the hunger hormone, so how you slept shapes how steady breakfast will feel.",
    weigh: "Before breakfast is when weight is most comparable, since food and water haven't moved it yet.",
    bfast: "Protein in the first meal keeps you full longer and steadies sugar for the rest of the morning.",
    walk: "A walk within an hour of breakfast blunts the sugar rise from it. Working muscles pull glucose in.",
    lunch: "Eating the dal and sabzi before the roti slows how fast the carbs reach your blood.",
    breath: "Slow breathing calms the stress response that nudges sugar up in the afternoon.",
    stairs: "One flight of stairs after sitting wakes up your leg muscles, and they keep soaking up sugar for hours.",
    snack: "A protein snack now means you reach dinner less hungry, so the portion stays easy.",
    gym: "Muscles stay more sensitive to insulin for up to a day after strength work, so dinner lands softer.",
    dinner: "Finishing dinner two to three hours before bed gives your body time to settle sugar before sleep.",
    mood: "How the day felt often explains your numbers better than the numbers do.",
    wind: "Screen light delays melatonin. Putting the phone away now protects the deep sleep early in the night."
  };
  /* when nothing is due: a look ahead, or the night's line once the whole plan is done */
  var AHEAD = {
    weigh: "Weighing before you eat shows your true trend, so the scale comes first tomorrow too.",
    bfast: "Breakfast inside two hours of waking keeps your body clock and your sugar on the same schedule.",
    walk: "Your walk lands best within an hour of breakfast, while the sugar from it is still rising.",
    lunch: "A steady lunch time keeps evening hunger lower, which makes a light dinner easier.",
    breath: "Your breathing is set for the afternoon slump, which is often stress more than hunger.",
    stairs: "A small move later breaks up sitting, which matters for sugar as much as one long workout.",
    snack: "The chana is planned for the late afternoon dip, before hunger turns into bigger helpings.",
    gym: "Strength work in the evening uses the sugar from your day and helps you sleep deeper.",
    dinner: "An early dinner gives your body time to settle sugar before sleep, so mornings read lower.",
    mood: "A quick note on how the day felt helps explain the days your numbers drift.",
    wind: "A dim, quiet half hour before bed tells your body to wind down, so sleep comes faster."
  };
  var DONE_ALL = "A steady bedtime matters more than a long one. Asleep by 10:30 sets up deeper sleep tomorrow.";

  function dflt(id) { var c = C[id]; return c.opts ? c.opts[0][0] : id === "weigh" ? "weighed in" : "good"; }
  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function pv(p) { var c = HE.P[p]; return "--c:" + c.c + ";--t:" + c.t + ";--w:" + c.w + ";--d:" + c.d; }

  HE.add({
    id: "sentence", name: "Say it in a sentence", rec: false,
    pitch: "Home greets you, then puts the day into one short sentence in your own words, with blanks you fill by tapping. It reads like talking about your day, and every blank you fill is a log.",
    how: [
      "Home opens on “Good morning, Shaheer” and a sentence like “I slept how long? and haven’t weighed in yet.”",
      "Each coloured word is a blank. Tap it and a small picker drops under it with the likely answers.",
      "Pick one: only that word rewrites, the item logs and the green win plays.",
      "The sentence follows the clock. With everything answered it reads as your finished morning, with one line from KAIRA on what comes next."
    ],
    score: [["The right thing now", "y"], ["Answer where you are", "y"], ["Pillars in view", "m"], ["GoodFlip look", "y"], ["KAIRA carries insight", "m"]],
    catch: "Grammar has to work for every mix of items and languages, which is real copy work per item. Past three blanks the sentence gets long, so older items wait behind a quiet link.",
    from: "Open’s greeting pill, Gentler Streak “Today I choose rest”, Muse inline choices, Mad Libs style forms.",
    tryit: "Tap a coloured word, pick an answer. Switch to Evening to see a new sentence.",
    effort: "Medium, the clause copy per item is the work",
    draw: function (ph) {
      var s = ph._s || (ph._s = { ans: {}, ids: null, h: null });
      var all = ph.items(), byId = {}; all.forEach(function (x) { byId[x.id] = x; });
      var dueOpen = ph.due();
      var ids = s.h === HE.hour ? s.ids : null;
      if (ids && ids.every(function (id) { return byId[id].done; })) ids = null;   /* answered: move on, or settle into the finished summary */
      if (!ids) {
        ids = dueOpen.length ? dueOpen.slice(0, 3).sort(function (a, b) { return a.at - b.at; }).map(function (x) { return x.id; })   /* the three ph.due() asks first, told in the order the day had them */
          : all.filter(function (x) { return x.done && x.at <= HE.hour + .25; }).slice(-3).map(function (x) { return x.id; });
        s.ids = ids; s.h = HE.hour;
      }
      var shown = ids.map(function (id) { return byId[id]; });
      var openShown = shown.filter(function (x) { return !x.done; });

      /* the sentence */
      function tok(x) {
        var c = C[x.id], set = x.done, txt = set ? (s.ans[x.id] || dflt(x.id)) : c.open;
        return '<span role="button" tabindex="0" class="csentence-t' + (set ? " set" : "") + '" data-id="' + x.id + '" style="' + pv(x.p) + '" aria-haspopup="true" aria-label="' + esc(x.t + ": " + txt) + '">' +
          esc(txt) + (set ? "" : '<span class="cv">' + HE.icon("chev", 14, 2.4) + '</span>') + '</span>';
      }
      function clause(x, drop) {
        var c = C[x.id], subj = c.s;
        if (drop) subj = subj === "I" ? "" : subj.replace(/^I /, "");
        return (subj ? esc(subj) + " " : "") + tok(x);
      }
      function yet(x, nextInSame) {
        var c = C[x.id];
        if (x.done || !c.yet) return "";
        if (nextInSame && !nextInSame.done && C[nextInSame.id].yet) return "";
        return " yet";
      }
      function startCap(h) { return h.replace(/^([a-z])/, function (m) { return m.toUpperCase(); }); }
      var html = "";
      if (shown.length === 1) html = startCap(clause(shown[0]) + yet(shown[0])) + ".";
      else if (shown.length >= 2) {
        var a = shown[0], b = shown[1], same = C[a.id].s.charAt(0) === "I" && C[b.id].s.charAt(0) === "I";
        html = startCap(clause(a) + yet(a, b) + " and " + clause(b, same) + yet(b)) + ".";
        if (shown[2]) html += " " + startCap(clause(shown[2]) + yet(shown[2])) + ".";
      }
      var plain = html.replace(/<[^>]+>/g, "");
      var fs = plain.length > 70 ? 26 : plain.length > 45 ? 28 : 30;

      var part = HE.part(HE.hour), greet = "Good " + (part === "night" ? "evening" : part) + ", Shaheer";
      var open = ph.open(), earlier = dueOpen.filter(function (x) { return ids.indexOf(x.id) < 0; });
      var line, nextUp = null;
      if (openShown.length) line = INS[openShown[openShown.length - 1].id];
      else if (open.length) { nextUp = open[0]; line = AHEAD[nextUp.id] || INS[nextUp.id]; }
      else line = DONE_ALL;

      var out = '<div class="csentence-w">' +
        '<p class="csentence-hi">' + greet + '</p>' +
        (html ? '<p class="csentence-s" style="font-size:' + fs + 'px;line-height:' + Math.round(fs * 1.45) + 'px">' + html + '</p>'
              : '<p class="csentence-s" style="font-size:30px;line-height:44px">Nothing is due just yet.</p>') +
        (earlier.length ? '<button class="csentence-more" data-more="1">' + earlier.length + (earlier.length === 1 ? " more from earlier" : " more from earlier") + HE.icon("chev", 14, 2.4) + '</button>' : "") +
        '<p class="csentence-k">' + HE.kaira(16) + '<span>' + esc(line) + '</span></p>' +
        (nextUp ? '<p class="csentence-next">Up next: ' + esc(nextUp.t) + ', ' + HE.clock(nextUp.at) + '</p>' : "") +
        '<div class="csentence-dots">' + HE.ORDER.map(function (p) {
          return '<span class="csentence-d" style="' + pv(p) + '" aria-label="' + HE.P[p].score + ' ' + ph.scores[p] + '"><i></i><b>' + ph.scores[p] + '</b>' + HE.P[p].n + '</span>';
        }).join("") + '</div></div>';
      ph.slot.innerHTML = out;
      var wrap = ph.slot.querySelector(".csentence-w");

      /* the picker */
      function closePop() {
        var p = wrap.querySelector(".csentence-pop"); if (p) p.remove();
        [].forEach.call(wrap.querySelectorAll(".csentence-t.on"), function (t) { t.classList.remove("on"); t.setAttribute("aria-expanded", "false"); });
      }
      function choose(t, x, label, how) {
        closePop();
        var was = x.done; s.ans[x.id] = label;
        t.classList.add("swap");
        setTimeout(function () {
          t.innerHTML = esc(label); t.classList.add("set"); t.classList.remove("swap");
          t.setAttribute("aria-label", x.t + ": " + label);
          /* the trailing "yet" of this clause goes with the blank */
          var n = t.nextSibling; if (n && n.nodeType === 3 && /^ yet/.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(/^ yet/, "");
        }, 180);
        if (was) { setTimeout(function () { ph.toast("Changed to “" + label + "”"); }, 200); return; }
        setTimeout(function () { ph.log(x.id, { how: how, quiet: how === "skip" }); if (how === "skip") ph.toast("Noted. Your plan adjusts around it."); }, 320);
      }
      function openPop(t) {
        var x = byId[t.dataset.id], c = C[x.id];
        if (c.sheet) return weightSheet(t, x);
        closePop(); t.classList.add("on"); t.setAttribute("aria-expanded", "true");
        var pop = document.createElement("div"); pop.className = "csentence-pop"; pop.setAttribute("style", pv(x.p)); pop.setAttribute("role", "menu");
        var cur = s.ans[x.id];
        if (c.faces) {
          pop.style.width = "300px";
          pop.innerHTML = '<div class="faces">' + HE.FACES.map(function (f) { return '<button role="menuitem" data-l="' + f[0].toLowerCase() + '" class="' + (cur === f[0].toLowerCase() ? "cur" : "") + '">' + f[1] + '<small>' + f[0] + '</small></button>'; }).join("") + '</div>';
        } else {
          pop.innerHTML = c.opts.map(function (o) { return '<button role="menuitem" data-l="' + esc(o[0]) + '" data-how="' + o[1] + '" class="' + (cur === o[0] ? "cur" : "") + '">' + esc(cap(o[0])) + (o[2] ? '<small>' + esc(o[2]) + '</small>' : "") + '</button>'; }).join("");
        }
        wrap.appendChild(pop);
        var wr = wrap.getBoundingClientRect(), r = t.getClientRects(), last = r[r.length - 1];
        var left = Math.max(0, Math.min(last.left - wr.left - 6, wr.width - pop.offsetWidth));
        pop.style.left = left + "px"; pop.style.top = (last.bottom - wr.top + 8) + "px";
        void pop.offsetWidth; pop.classList.add("on");
        pop.onclick = function (e) {
          var b = e.target.closest("button[data-l]"); if (!b) return;
          choose(t, x, b.dataset.l, b.dataset.how || "mood");
        };
        var first = pop.querySelector("button"); if (first) first.focus({ preventScroll: true });
      }
      function weightSheet(t, x) {
        var w = 72.4;
        ph.sheet("Morning weight", '<div class="csentence-step"><button data-d="-1" aria-label="Less">−</button><b><span class="wv">72.4</span><small>kg</small></b><button data-d="1" aria-label="More">+</button></div><button class="he-pri" data-go="1">Log 72.4 kg</button>', function (e) {
          var d = e.target.closest("[data-d]");
          if (d) { w = Math.round((w + d.dataset.d * .1) * 10) / 10; ph.el.querySelector(".he-sheet .wv").textContent = w.toFixed(1); ph.el.querySelector(".he-sheet [data-go]").textContent = "Log " + w.toFixed(1) + " kg"; return; }
          if (e.target.closest("[data-go]")) { ph.closeSheet(); choose(t, x, "weighed in at " + w.toFixed(1) + " kg", "num"); }
        }, "On the scale before breakfast");
      }
      function earlierSheet() {
        ph.sheet("From earlier", earlier.map(function (x) {
          return '<div class="csentence-row"><i style="background:' + HE.P[x.p].c + '"></i><div>' + esc(x.t) + '<small>' + esc(x.sub) + '</small></div><button class="he-chip" data-done="' + x.id + '">' + HE.icon("check", 14, 2.6) + 'Done</button></div>';
        }).join(""), function (e) {
          var b = e.target.closest("[data-done]"); if (!b) return;
          var x = byId[b.dataset.done]; s.ans[x.id] = dflt(x.id);
          ph.log(x.id, { how: "plan" });
        }, "Tap what you have already done");
      }
      wrap.onclick = function (e) {
        var t = e.target.closest(".csentence-t");
        if (t) { if (t.classList.contains("on")) return closePop(); return openPop(t); }
        if (e.target.closest("[data-more]")) return earlierSheet();
        if (!e.target.closest(".csentence-pop")) closePop();
      };
      if (!s.bound) { s.bound = 1; ph.el.addEventListener("pointerdown", function (e) { if (!e.target.closest(".csentence-pop,.csentence-t")) { var p = ph.el.querySelector(".csentence-pop"); if (p) { p.remove(); [].forEach.call(ph.el.querySelectorAll(".csentence-t.on"), function (t) { t.classList.remove("on"); }); } } }); }
      wrap.onkeydown = function (e) {
        if (e.key === "Escape") return closePop();
        var t = e.target.closest(".csentence-t"); if (t && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openPop(t); }
      };
    }
  });
})();
