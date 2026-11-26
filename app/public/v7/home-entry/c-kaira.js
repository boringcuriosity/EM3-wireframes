/* Home entry concept: KAIRA speaks first (v7/home-entry-points.html, 24 Nov 2026).
   KAIRA opens Home with one line that teaches something, then asks about the item due now.
   Answer with a first-person pill, or type / speak a line that KAIRA turns into plan items to log together. */
(function () {
  var css = document.createElement("style");
  css.textContent = [
    ".ckaira-w{position:relative;isolation:isolate;padding:4px 0 0}",
    ".ckaira-orb{position:absolute;z-index:-1;top:-40px;right:-60px;width:240px;height:240px;border-radius:50%;background:radial-gradient(circle at 40% 40%,rgba(68,76,231,.10),rgba(45,166,166,.08) 45%,rgba(255,255,255,0) 70%);pointer-events:none}",
    ".ckaira-hd{display:flex;align-items:center;gap:8px;margin:0 0 12px}",
    ".ckaira-hx{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.8);box-shadow:0 0 0 1px #EEF0F6,0 4px 12px -4px rgba(68,76,231,.25)}",
    ".ckaira-hd b{font:700 12px/1 Roboto;letter-spacing:1px;color:#475467}",
    ".ckaira-hd span{font:400 12px/1 Roboto;color:#98A2B3}",
    ".ckaira-me{display:flex;justify-content:flex-end;margin:0 0 12px}",
    ".ckaira-me span{display:inline-flex;align-items:center;gap:6px;max-width:80%;padding:8px 12px;border-radius:16px 16px 4px 16px;background:#F2F4F7;font:500 13px/18px Roboto;color:#344054}",
    ".ckaira-me svg{color:#299D6B;flex:none}",
    ".ckaira-line{margin:0;font:400 19px/28px Roboto;color:#344054;letter-spacing:-.1px;animation:ckaira-in .45s cubic-bezier(.2,0,0,1) both}",
    ".ckaira-line b{font-weight:500;color:#101828}",
    "@keyframes ckaira-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}",
    ".ckaira-pills{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0 0}",
    ".ckaira-pills .he-chip{height:40px;padding:0 16px;font-size:14px;animation:ckaira-in .45s cubic-bezier(.2,0,0,1) both}",
    ".ckaira-pills .he-chip:nth-child(2){animation-delay:.05s}.ckaira-pills .he-chip:nth-child(3){animation-delay:.1s}",
    ".ckaira-pills .he-chip.pri{border-color:#299D6B;color:#2A805A;background:#F3FCF8}",
    /* the frosted input bar */
    ".ckaira-bar{position:relative;display:flex;align-items:center;gap:4px;height:52px;margin:16px 0 0;padding:0 6px 0 16px;border-radius:26px;background:rgba(255,255,255,.72);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);",
      "box-shadow:0 0 0 1px #EAECF0,0 6px 16px -8px rgba(16,24,40,.12);transition:box-shadow .4s cubic-bezier(.4,0,.2,1)}",
    ".ckaira-bar::before{content:'';position:absolute;inset:-1px;border-radius:27px;padding:1.5px;background:linear-gradient(120deg,#444CE7,#2DA6A6);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:0;transition:opacity .4s cubic-bezier(.4,0,.2,1);pointer-events:none}",
    ".ckaira-bar:focus-within::before{opacity:.55}",
    ".ckaira-bar.ls{box-shadow:0 0 0 1px transparent,0 0 0 6px rgba(68,76,231,.06),0 10px 30px -6px rgba(45,166,166,.35)}",
    ".ckaira-bar.ls::before{opacity:1;animation:ckaira-breathe 1.6s cubic-bezier(.4,0,.2,1) infinite alternate}",
    "@keyframes ckaira-breathe{from{opacity:.45}to{opacity:1}}",
    ".ckaira-bar input{flex:1;min-width:0;height:100%;border:0;background:none;outline:0;font:400 15px/1 Roboto;color:#101828}",
    ".ckaira-bar input::placeholder{color:#98A2B3}",
    ".ckaira-ib{width:40px;height:40px;border-radius:50%;border:0;display:grid;place-items:center;cursor:pointer;flex:none;background:none;color:#475467;transition:background .25s cubic-bezier(.2,0,0,1),color .25s cubic-bezier(.2,0,0,1),opacity .25s}",
    ".ckaira-ib.mic.on{background:linear-gradient(135deg,#444CE7,#2DA6A6);color:#fff}",
    ".ckaira-ib.go{background:#299D6B;color:#fff;display:none}",
    ".ckaira-bar.has .go{display:grid}.ckaira-bar.has .mic{display:none}",
    /* what KAIRA understood */
    ".ckaira-card{margin:16px 0 0;padding:12px 12px 16px;border-radius:20px;background:#fff;box-shadow:0 0 0 1px #EAECF0,0 12px 24px -10px rgba(16,24,40,.14);animation:ckaira-in .4s cubic-bezier(.2,0,0,1) both}",
    ".ckaira-card .q{margin:0 4px 8px;font:400 13px/18px Roboto;color:#667085}.ckaira-card .q q{color:#344054;font-style:italic}",
    ".ckaira-row{display:flex;align-items:center;gap:12px;width:100%;min-height:52px;padding:6px 4px;border:0;border-top:1px solid #F2F4F7;background:none;text-align:left;cursor:pointer;font:500 15px/20px Roboto;color:#101828}",
    ".ckaira-row:first-of-type{border-top:0}",
    ".ckaira-row small{display:block;font:400 12px/16px Roboto;color:#667085}",
    ".ckaira-row .ck{width:24px;height:24px;border-radius:50%;flex:none;display:grid;place-items:center;border:1.5px solid #D0D5DD;color:#fff;transition:background .2s cubic-bezier(.2,0,0,1),border-color .2s cubic-bezier(.2,0,0,1)}",
    ".ckaira-row.in .ck{background:var(--c);border-color:var(--c)}",
    ".ckaira-row[disabled]{cursor:default;opacity:.55}",
    ".ckaira-row .pg{margin-left:auto;font:500 12px/1 Roboto;color:var(--d)}",
    ".ckaira-acts{display:flex;gap:8px;margin:12px 0 0}.ckaira-acts .he-sec{width:96px;flex:none}.ckaira-acts .he-pri{flex:1}",
    ".ckaira-acts .he-pri[disabled]{opacity:.4;cursor:default}",
    /* the slim score row */
    ".ckaira-sc{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0 0}",
    ".ckaira-sc div{font:400 11px/1 Roboto;color:#667085}",
    ".ckaira-sc b{display:block;margin:4px 0 6px;font:600 15px/1 Roboto;color:#101828;font-variant-numeric:tabular-nums}",
    ".ckaira-sc i{display:block;height:3px;border-radius:2px;background:#F2F4F7;overflow:hidden}.ckaira-sc i u{display:block;height:100%;border-radius:2px;background:var(--c)}",
    ".ckaira-step{display:flex;align-items:center;justify-content:center;gap:24px;margin:8px 0 24px}",
    ".ckaira-step button{width:48px;height:48px;border-radius:50%;border:1px solid #E4E7EC;background:#fff;font:500 24px/1 Roboto;color:#344054;cursor:pointer}",
    ".ckaira-step b{font:500 40px/1 Roboto;letter-spacing:-.5px;min-width:130px;text-align:center}.ckaira-step b small{font-size:17px;color:#667085;margin-left:4px}",
    "@media (prefers-reduced-motion: reduce){.ckaira-line,.ckaira-pills .he-chip,.ckaira-card{animation:none}.ckaira-bar.ls::before{animation:none}}"
  ].join("");
  document.head.appendChild(css);

  /* KAIRA's lines: a mechanism and why it matters now, then the question. Two per item, so a second ask reads fresh. */
  var INS = {
    sleep: ["A short night raises the hunger hormone, so breakfast can feel harder to keep steady.", "Sleep sets how your body handles sugar in the morning. One rough night can lift your fasting reading."],
    weigh: ["Weight moves with water and salt from day to day. Weighing at the same time each morning shows the real trend.", "Before breakfast is when weight is most comparable, since food and water haven’t moved it yet."],
    bfast: ["Protein in the first meal keeps you full longer and steadies sugar for the rest of the morning.", "A breakfast with protein and fibre makes the mid-morning dip and the snack craving less likely."],
    walk: ["A walk within an hour of breakfast blunts the sugar rise from it. Working muscles pull glucose in.", "Twenty easy minutes after eating does more for sugar than a harder session later on."],
    lunch: ["Eating the dal and sabzi before the roti slows how fast the carbs reach your blood.", "A regular lunch time keeps evening hunger lower, which makes a light dinner easier."],
    breath: ["Slow breathing, five seconds in and five out, calms the stress response that nudges sugar up.", "The afternoon slump is often stress, not hunger. Five slow minutes settles it."],
    stairs: ["One flight of stairs after sitting wakes up your leg muscles, and they keep soaking up sugar for hours.", "Breaking up long sitting matters for sugar as much as one big workout."],
    snack: ["A protein snack like chana now means you reach dinner less hungry, so the portion stays easy.", "A planned snack heads off the late afternoon dip that turns into bigger helpings at dinner."],
    gym: ["Muscle is where most of the sugar from a meal goes, and strength work is how you build it.", "Muscles stay more sensitive to insulin for up to a day after strength work, so dinner lands softer."],
    dinner: ["Finishing dinner two to three hours before bed gives your body time to settle sugar before sleep.", "An earlier, lighter dinner means a lower reading when you wake up."],
    mood: ["How the day felt often explains your numbers better than the numbers do.", "Stress shows up in sugar and cravings too, so naming the feeling helps spot the pattern."],
    wind: ["Screen light delays melatonin. Putting the phone away now protects the deep sleep early in the night.", "A dim, quiet half hour before bed tells your body to wind down, so sleep comes faster."]
  };
  var DONE_ALL = "A steady bedtime matters more than a long one, because your body clock sets the morning sugar. <b>Lights low by 10:30, and rest well.</b>";
  var REPLY = {
    sleep: [["I slept well", "well"], ["I woke up a few times", "broken"], ["I barely slept", "poor"]],
    meal: [["Yes, as planned", "plan"], ["I had something else", "else"], ["Not yet", "later"]],
    tick: [["Yes, done", "plan"], ["I did part of it", "part"], ["Not yet", "later"]],
    mood: [["It’s been good", "good"], ["It was okay", "okay"], ["It’s been hard", "low"]],
    num: [["Yes, log it", "num"], ["Not yet", "later"]]
  };
  /* typed or spoken words to plan items */
  var KW = [
    ["bfast", /\b(poha|breakfast|upma|idli|dosa|paratha|oats|eggs?)\b/],
    ["walk", /\b(walk|walked|walking|stroll)\b/],
    ["lunch", /\b(lunch|dal|rajma|rice)\b/],
    ["sleep", /\b(slept|sleep|nap)\b/],
    ["breath", /\b(breath|breathing|breathed|breathe|meditat\w*)\b/],
    ["stairs", /\b(stairs|staircase)\b/],
    ["snack", /\b(snack|chana|fruit|nuts)\b/],
    ["gym", /\b(gym|workout|worked out|strength|weights|exercise|trained)\b/],
    ["dinner", /\b(dinner|paneer|supper)\b/],
    ["weigh", /\b(weighed|weigh|weight|kg|scale)\b/],
    ["mood", /\b(feel|feeling|felt|mood|stressed|anxious|happy|calm|tired|sad|rough|great day|good day)\b/],
    ["wind", /\b(phone away|wind down|winding down|lights low|lights off)\b/]
  ];
  var SAMPLE = { morning: "had poha and a 20 minute walk", afternoon: "had lunch and did my breathing", evening: "did my workout, feeling calm", night: "had paneer for dinner and put my phone away" };

  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

  function parse(text, byId) {
    var t = " " + text.toLowerCase() + " ", out = [];
    KW.forEach(function (k) {
      var m = t.match(k[1]); if (!m) return;
      var x = byId[k[0]], note = "from “" + m[0] + "”";
      if (k[0] === "weigh") { var n = t.match(/(\d{2,3}(?:\.\d)?)\s*(kg)?/); if (n) note = n[1] + " kg"; }
      if (k[0] === "walk") { var w = t.match(/(\d+)\s*(min|minute)/); if (w) note = w[1] + " min"; }
      if (k[0] === "sleep") { var s = t.match(/(\d+(?:\.\d)?)\s*(h|hour)/); if (s) note = s[1] + " hours"; }
      if (k[0] === "mood") { var f = t.match(/\b(stressed|anxious|happy|calm|tired|sad|rough|great|good|okay|low)\b/); note = f ? "Feeling " + f[1] : "How you feel"; }
      out.push({ x: x, note: note });
    });
    return out;
  }

  HE.add({
    id: "kaira", name: "KAIRA speaks first", rec: false,
    pitch: "KAIRA opens Home with one line that teaches something about the moment, then asks about the item due now. Answer with a tap, or just say what you did and KAIRA turns it into logs.",
    how: [
      "KAIRA’s line on top: why a walk after breakfast matters, then “Have you had your breakfast?”",
      "Tap a reply in your own words, like “Yes, as planned” or “Not yet”. It logs, and KAIRA moves to the next item with a new line.",
      "Or type “had poha and a walk” in the bar, or tap the mic. KAIRA shows what it understood.",
      "Tap “Log these” to log everything at once, or Edit to fix the words."
    ],
    score: [["The right thing now", "y"], ["Answer where you are", "y"], ["Pillars in view", "m"], ["GoodFlip look", "y"], ["KAIRA carries insight", "y"]],
    catch: "It leans on good writing: every item needs fresh, true lines or KAIRA starts to sound like a script. Free text needs real language parsing in production, the demo only matches keywords.",
    from: "WHOOP Coach (insight, then a question), Oura Advisor check-ins, Bevel Intelligence suggestions and Ask bar, Mindvalley first-person tiles, Somena “Tell me how you feel”.",
    tryit: "Tap a reply pill, or type “had poha and a walk” and press send, or tap the mic.",
    effort: "Medium, plus the language parsing for free text",
    draw: function (ph) {
      var k = ph._k || (ph._k = { skip: {}, v: {}, text: "", parsed: null, last: null, h: null });
      if (k.h !== HE.hour) { k.h = HE.hour; k.skip = {}; k.parsed = null; k.last = null; }
      var all = ph.items(), byId = {}; all.forEach(function (x) { byId[x.id] = x; });
      var due = ph.due().filter(function (x) { return !k.skip[x.id]; });
      var up = ph.open().filter(function (x) { return x.at > HE.hour + .25 && !k.skip[x.id]; });
      var cur = due[0] || up[0] || null, ahead = cur && !due.length;
      var open = ph.open(), skipped = open.filter(function (x) { return k.skip[x.id]; });

      var line, pills = [];
      if (k.parsed) {
        line = null;
      } else if (cur) {
        var ins = INS[cur.id][(k.v[cur.id] || 0) % INS[cur.id].length];
        if (ahead) { line = esc(ins) + " <b>" + esc(cur.t) + " is next, at " + HE.clock(cur.at) + ".</b>"; pills = [["I’ve done it already", "plan"], ["Remind me then", "remind"]]; }
        else { line = esc(ins) + " <b>" + esc(cur.ask) + "</b>"; pills = REPLY[cur.kind]; }
      } else if (open.length) {
        line = "Sleep, food and movement all pull on the same sugar curve, so a late log still counts. <b>Shall we go back to " + esc(skipped[0].t.toLowerCase()) + "?</b>";
        pills = [["Yes, ask me again", "again"]];
      } else line = DONE_ALL;

      var part = HE.part(HE.hour);
      var h = '<div class="ckaira-w"><div class="ckaira-orb"></div>' +
        '<div class="ckaira-hd"><span class="ckaira-hx">' + HE.kaira(20) + '</span><b>KAIRA</b><span>· Good ' + (part === "night" ? "evening" : part) + '</span></div>' +
        (k.last && !k.parsed ? '<div class="ckaira-me"><span>' + (k.last.logged ? HE.icon("check", 14, 2.8) : "") + esc(k.last.text) + '</span></div>' : "");

      if (k.parsed) {
        var any = k.parsed.length;
        h += '<p class="ckaira-line">' + (any ? "Here’s what I got. <b>Log them together?</b>" : "I couldn’t match that to your plan. <b>Try a meal, a walk, your sleep or how you feel.</b>") + '</p>' +
          '<div class="ckaira-card"><p class="q">You said <q>' + esc(k.typed) + '</q>' + (any ? ". Tap a row to leave it out." : "") + '</p>' +
          k.parsed.map(function (r, i) {
            var x = byId[r.x.id], c = HE.P[x.p];
            return '<button class="ckaira-row' + (r.on && !x.done ? " in" : "") + '" data-r="' + i + '" style="--c:' + c.c + ';--d:' + c.d + '"' + (x.done ? " disabled" : "") + ' aria-pressed="' + (r.on && !x.done) + '">' +
              '<span class="ck">' + HE.icon("check", 14, 3) + '</span><span>' + esc(x.t) + '<small>' + esc(x.done ? "Already logged" : r.note) + '</small></span><span class="pg">' + c.n + '</span></button>';
          }).join("") +
          '<div class="ckaira-acts"><button class="he-sec" data-a="edit">Edit</button>' +
          (any ? '<button class="he-pri" data-a="logall"' + (k.parsed.some(function (r) { return r.on && !byId[r.x.id].done; }) ? "" : " disabled") + '>Log these</button>' : "") + '</div></div>';
      } else {
        h += '<p class="ckaira-line">' + line + '</p>' +
          (pills.length ? '<div class="ckaira-pills">' + pills.map(function (p, i) { return '<button class="he-chip' + (i ? "" : " pri") + '" data-p="' + p[1] + '" data-l="' + esc(p[0]) + '">' + esc(p[0]) + '</button>'; }).join("") + '</div>' : "") +
          '<div class="ckaira-bar' + (k.text ? " has" : "") + '"><input type="text" aria-label="Tell KAIRA what you ate, did or felt" placeholder="' + (open.length ? "Tell KAIRA what you ate, did or felt" : "Tell KAIRA anything else") + '" value="' + esc(k.text) + '">' +
          '<button class="ckaira-ib mic" aria-label="Speak to KAIRA">' + HE.icon("mic", 20, 2) + '</button>' +
          '<button class="ckaira-ib go" aria-label="Send">' + HE.icon("arrow", 20, 2.4) + '</button></div>';
      }
      h += '<div class="ckaira-sc">' + HE.ORDER.map(function (p) {
        var c = HE.P[p], v = ph.scores[p];
        return '<div style="--c:' + c.c + '" aria-label="' + c.score + ' ' + v + '">' + c.score + '<b>' + v + '</b><i><u style="width:' + v + '%"></u></i></div>';
      }).join("") + '</div></div>';
      ph.slot.innerHTML = h;

      var w = ph.slot.querySelector(".ckaira-w"), bar = w.querySelector(".ckaira-bar"), inp = bar && bar.querySelector("input");

      function said(text, logged) { k.last = { text: text.charAt(0).toUpperCase() + text.slice(1), logged: logged }; }
      function submit() {
        var t = (inp.value || "").trim(); if (!t) return;
        k.typed = t; k.text = "";
        k.parsed = parse(t, byId).map(function (r) { r.on = true; return r; });
        ph.draw();
      }
      function weight(label) {
        var v = 72.4;
        ph.sheet("Morning weight", '<div class="ckaira-step"><button data-d="-1" aria-label="Less">−</button><b><span class="wv">72.4</span><small>kg</small></b><button data-d="1" aria-label="More">+</button></div><button class="he-pri" data-go="1">Log 72.4 kg</button>', function (e) {
          var d = e.target.closest("[data-d]");
          if (d) { v = Math.round((v + d.dataset.d * .1) * 10) / 10; ph.el.querySelector(".he-sheet .wv").textContent = v.toFixed(1); ph.el.querySelector(".he-sheet [data-go]").textContent = "Log " + v.toFixed(1) + " kg"; return; }
          if (e.target.closest("[data-go]")) { said("I’m " + v.toFixed(1) + " kg", true); ph.log("weigh", { how: v }); }
        }, "On the scale before breakfast");
      }
      if (inp) {
        inp.oninput = function () { k.text = inp.value; bar.classList.toggle("has", !!inp.value.trim()); };
        inp.onkeydown = function (e) { if (e.key === "Enter") submit(); };
        if (k.focus) { k.focus = 0; inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
      }
      w.onclick = function (e) {
        var p = e.target.closest("[data-p]");
        if (p) {
          var how = p.dataset.p, l = p.dataset.l;
          if (how === "later") { k.skip[cur.id] = 1; k.v[cur.id] = (k.v[cur.id] || 0) + 1; said(l, false); return ph.draw(); }
          if (how === "remind") { k.skip[cur.id] = 1; said(l, false); ph.toast("KAIRA will ask at " + HE.clock(cur.at) + "."); return ph.draw(); }
          if (how === "again") { k.skip = {}; k.last = null; return ph.draw(); }
          if (how === "else") { k.text = "For " + cur.t.toLowerCase() + " I had "; k.focus = 1; return ph.draw(); }
          if (how === "num") return weight();
          said(l, true); return ph.log(cur.id, { how: how });
        }
        if (e.target.closest(".mic")) return listen(e.target.closest(".mic"));
        if (e.target.closest(".go")) return submit();
        var r = e.target.closest("[data-r]");
        if (r && !r.disabled) { var row = k.parsed[+r.dataset.r]; row.on = !row.on; r.classList.toggle("in", row.on); r.setAttribute("aria-pressed", row.on);
          var go = w.querySelector('[data-a="logall"]'); if (go) go.disabled = !k.parsed.some(function (q) { return q.on && !byId[q.x.id].done; }); return; }
        var a = e.target.closest("[data-a]");
        if (a && a.dataset.a === "edit") { k.text = k.typed; k.parsed = null; k.focus = 1; return ph.draw(); }
        if (a && a.dataset.a === "logall" && !a.disabled) {
          var ids = k.parsed.filter(function (q) { return q.on && !byId[q.x.id].done; }).map(function (q) { return q.x.id; });
          said(k.typed, true); k.parsed = null;
          ph.log(ids, { how: "typed" });
        }
      };
      function listen(mic) {
        if (k.listening) return;
        var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
        var phrase = SAMPLE[part], i = 0;
        k.listening = 1; mic.classList.add("on"); bar.classList.add("ls"); inp.value = ""; inp.placeholder = "Listening…";
        setTimeout(function () {
          if (reduce) { i = phrase.length; }
          (function type() {
            if (!inp.isConnected) { k.listening = 0; return; }
            inp.value = phrase.slice(0, i); k.text = inp.value;
            if (i < phrase.length) { i += 1; return setTimeout(type, 34); }
            k.listening = 0; mic.classList.remove("on"); bar.classList.remove("ls"); bar.classList.add("has");
            inp.placeholder = "Tell KAIRA what you ate, did or felt";
          })();
        }, reduce ? 300 : 1400);
      }
    }
  });
})();
