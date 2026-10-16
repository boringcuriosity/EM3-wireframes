/* Move: the plan as routine cards (Eat's meal card), then steps through the day.
   Explored in /v7/move-plan-options.html, option 3. Eat's meal cards stay in the
   page, hidden, so none of its code has to change. */
(function () {
  var IMG = "/v7/img/move/", VID = "/v7/video/move/", ICO = "/v7/img/coach/icons/";
  var EX = {
    box: { name: "Box breathing", img: "box", fx: 17, min: 21, reps: 10, sets: 2, restSet: "30 sec", rest: "15 sec", video: "box",
      why: "Box breathing helps you take charge of your automatic breathing patterns and train your breath for better health." },
    plank: { name: "Plank to push up", img: "plank", fx: 33, min: 3, reps: 10, sets: 2, restSet: "30 sec", rest: "15 sec", video: "plank",
      why: "A full-body exercise that builds core strength, corrects posture and improves your range of motion.",
      steps: ["Lie straight on your stomach with your hands in line with your shoulders.", "Go into a plank by straightening your arms and lifting your knees off the floor.",
        "Tighten your stomach and squeeze your buttocks. Lower down by bending one elbow at a time, then push back up, alternating arms.", "Repeat for 10 to 15 repetitions.", "Come back to the plank position."],
      dos: ["Keep your back and body straight.", "Keep your arms straight while you are in the plank."], donts: ["Do not raise your hips.", "Do not rush. Move slowly."] },
    spot: { name: "Spot jump", img: "spot", fx: 37, min: 2, reps: 10, sets: 2, restSet: "30 sec", rest: "15 sec", video: "spot",
      why: "Spot jump raises your metabolism and oxygen capacity, and builds stamina for the heart and lungs.",
      steps: ["Stand straight with your hands on your waist.", "Keep your back and spine straight. Do not bend forwards.", "Jump up and down with your legs together and knees straight.", "Start slowly, then gradually increase the speed."],
      dos: ["Keep your feet together while jumping.", "Keep your knees straight."], donts: ["Do not jump too high.", "Do as many as your stamina allows."] },
    coastal: { name: "Lateral costal breathing", img: "coastal", fx: 30, min: 5, reps: 10, sets: 2, restSet: "30 sec", rest: "15 sec",
      why: "Moves the ribcage through its full range, so you breathe better, move better through the spine and let the shoulder blades work properly." },
    sideleg: { name: "Side leg raise", img: "sideleg", fx: 33, min: 2, reps: 10, sets: 2, restSet: "30 sec", rest: "15 sec",
      why: "Improves the range of motion at the hip, and helps body alignment and stability.",
      steps: ["Lie on one side with your legs straight.", "Rest your lower arm under your head and your top hand on your waist.", "Raise your top leg straight up, knee straight and hips steady.", "Keep your shoulder and hip in line.", "Lower your leg, then repeat on the other side."],
      dos: ["Keep your back in a straight line with your legs."], donts: ["Do not rotate your hips forward or backward.", "Do not bend your knee or overstretch your leg."] }
  };
  var ORDER = ["box", "plank", "spot", "coastal", "sideleg"];
  var RT = [
    { name: "Morning", part: "Morning", win: "6 AM to 12 PM", ic: "sunny-outline", tone: "gold",
      tips: [{ t: "Have a glass of water before you start", d: "It keeps you from feeling light-headed in the breathing moves." },
             { t: "Breathe out as you push up", d: "Holding your breath while you strain raises your blood pressure." }] },
    { name: "Afternoon", part: "Afternoon", win: "12 PM to 4 PM", ic: "partly-sunny-outline", tone: "teal",
      tips: [{ t: "Keep a bottle of water close", d: "Afternoons run warm, and a few sips between sets keep you going." }] },
    { name: "Evening", part: "Evening", win: "4 PM to 8 PM", ic: "cloudy-night-outline", tone: "ok",
      tips: [{ t: "Wait two hours after a big meal", d: "Moving on a full stomach can bring on cramps." }] },
    { name: "Night", part: "Night", win: "8 PM to 11 PM", ic: "moon-outline", tone: "in",
      tips: [{ t: "Keep it gentle before bed", d: "Slow moves help you wind down. Hard ones can keep you up." }] }
  ];
  var PARTS = [{ n: "Morning", h: 6, tone: "var(--gold-300)" }, { n: "Afternoon", h: 4, tone: "var(--teal-200)" },
    { n: "Evening", h: 4, tone: "var(--ok-100)" }, { n: "Night", h: 3, tone: "var(--in-200)" }];
  var NOW = 15;   /* ponytail: the prototype's clock is 3:40 PM, so the morning is behind and the evening ahead */
  var GOAL = (window.MOVEPART && window.MOVEPART[2].T) || 10000;

  var S = {
    done: [{ box: "Easy", plank: "Difficult" }, {}, {}, {}],
    at: [{ box: "07:10", plank: "07:30" }, {}, {}, {}],
    tips: [[true], [], [], []],
    steps: { 6: 180, 7: 920, 8: 1240, 9: 430, 10: 260, 11: 310, 12: 540, 13: 690, 14: 280, 15: 230 },
    sel: null
  };

  var IC = {
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    checkD: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path pathLength="1" d="M20 6L9 17l-5-5"/></svg>',
    checkG: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.53.85l10.2-6.5a1 1 0 0 0 0-1.7L9.53 4.65A1 1 0 0 0 8 5.5z"/></svg>',
    plusSq: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><path d="M12 8.5v7M8.5 12h7"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>'
  };
  function mins() { return ORDER.reduce(function (n, id) { return n + EX[id].min; }, 0); }
  function fmt(n) { return n.toLocaleString("en-IN"); }
  function hr(h) { return (h % 12 || 12) + (h < 12 || h === 24 ? " AM" : " PM"); }
  function img(id) { return '<img src="' + IMG + EX[id].img + '.webp" alt="" loading="lazy" style="object-position:' + EX[id].fx + '% 30%">'; }

  /* ---------- the section ---------- */
  var meals = document.getElementById("diary").closest(".sect");
  meals.id = "mealSect";
  var root = document.createElement("div");
  root.className = "gut sect";
  meals.parentNode.insertBefore(root, meals.nextSibling);

  function card(rt, r) {
    var d = S.done[r], all = ORDER.every(function (id) { return d[id]; });
    /* a quiet Gemini scene behind the header, one per part of the day, the way Eat's meal cards carry theirs */
    return '<section class="mv-card scene' + (all ? " settled" : "") + '" style="--scene:url(/v7/icons/move/bg/' + rt.part.toLowerCase() + '.webp?v=16)">' +
      '<div class="mv-mh">' +
        '<div class="t"><div class="n">' + rt.name + '</div><div class="s">' + rt.win + ' · ' + mins() + ' min</div></div>' +
        (all ? '<span class="mv-ok-badge">' + IC.checkG + 'Done</span>' : "") + '</div>' +
      '<div class="mv-mbi"><div class="lab">Your coach\'s plan</div><div class="mv-items">' + ORDER.map(function (id) {
        var e = EX[id], f = d[id];
        return '<div class="mv-item' + (f ? " done" : "") + '">' +
          '<button class="mv-tb' + (f ? " on" : "") + '" data-tick="' + r + '|' + id + '" aria-pressed="' + !!f + '" aria-label="' + (f ? "Done, " + f + ": " : "Mark as done: ") + e.name + '"><span class="mv-tk">' + IC.check + '</span></button>' +
          '<button class="mv-th" data-vid="' + r + '|' + id + '" aria-label="Play ' + e.name + '">' + img(id) + '<span>' + IC.play + '</span></button>' +
          '<div class="mv-nm">' + e.name + '<span>' + e.sets + ' sets · ' + e.reps + ' reps · ' + e.min + ' min</span></div>' +
          '</div>';   /* ponytail: how it felt is kept in S.done; how to show it on the row comes later */
      }).join("") + '</div>' +
      '<div class="mv-else"><div class="lab">Did another workout?</div><div class="mv-acts"><button>' + IC.plusSq + 'Search and log exercise</button></div></div>' +
      '<div class="mv-tips"><div class="lab">Small moves</div><div class="mv-tiplist">' + rt.tips.map(function (t, i) {
        var on = !!S.tips[r][i];
        /* Eat's tip anatomy (.tip, .tmark), so ticking it plays Eat's pop, ring, check draw, burst and wash */
        return '<div class="mv-tip tip' + (on ? " done" : "") + '" data-tiprow="' + r + '|' + i + '"><button class="mv-tb tickbtn" data-tip="' + r + '|' + i + '" aria-pressed="' + on + '" aria-label="' + (on ? "Mark as not done: " : "Mark as done: ") + t.t + '"><span class="tmark' + (on ? " on" : "") + '">' + (on ? IC.checkD : "") + '</span></button>' +
          '<div><div class="tt">' + t.t + '</div><div class="td">' + t.d + '</div></div></div>';
      }).join("") + '</div></div></div></section>';
  }

  function stepsHTML() {
    var tot = 0, max = 0, peak = 6;
    for (var k = 6; k <= NOW; k++) { var v = S.steps[k] || 0; tot += v; if (v > max) { max = v; peak = k; } }
    var top = Math.max(max, 1000), left = GOAL - tot, bars = "";
    for (var b = 6; b <= 22; b++) {
      var val = S.steps[b] || 0, cls = b < NOW ? "past" : b === NOW ? "now" : "fut";
      if (cls === "fut") { bars += '<span class="mv-b fut" aria-hidden="true"><i></i></span>'; continue; }
      bars += '<button class="mv-b ' + cls + (b === peak && S.sel == null ? " peak" : "") + (S.sel === b ? " sel" : "") + '" data-sel="' + b + '" style="--h:' + Math.round(val / top * 100) + '%"' +
        ' aria-label="' + hr(b) + ' to ' + hr(b + 1) + ', ' + fmt(val) + ' steps"><i></i></button>';
    }
    var s = S.sel, cap = s == null
      ? 'Most steps: <b>' + hr(peak) + ' to ' + hr(peak + 1) + '</b>, ' + fmt(max)
      : '<b>' + hr(s) + ' to ' + hr(s + 1) + '</b> · ' + fmt(S.steps[s] || 0) + ' steps' + (s === NOW ? " so far" : "");
    return '<section class="mv-steps"><div class="sec"><h2>Your steps</h2></div><div class="mv-sc">' +
      '<div class="mv-sh"><div class="t"><div class="mv-big">' + fmt(tot) + ' <span>of ' + fmt(GOAL) + ' steps</span></div>' +
        '<div class="mv-sub">' + (left > 0 ? fmt(left) + ' to go. A 10 minute walk is about 1,000 steps.' : "Goal reached for today.") + '</div></div>' +
        '<button class="mv-logbtn" data-log>' + IC.plus + 'Log steps</button></div>' +
      '<div class="mv-prog"><i style="width:' + Math.min(100, tot / GOAL * 100) + '%"></i></div>' +
      '<div class="mv-chart" role="group" aria-label="Steps by hour">' + bars + '</div>' +
      '<div class="mv-bands" aria-hidden="true">' + PARTS.map(function (p) { return '<span style="--n:' + p.h + ';--tone:' + p.tone + '"></span>'; }).join("") + '</div>' +
      '<div class="mv-bl" aria-hidden="true">' + PARTS.map(function (p) { return '<span style="--n:' + p.h + '">' + p.n + '</span>'; }).join("") + '</div>' +
      '<div class="mv-cap"><span>' + cap + '</span></div></div></section>';
  }

  function render() {
    root.innerHTML = '<div class="sec"><h2>Your move plan</h2></div>' +
      RT.map(card).join("") + stepsHTML();
  }

  /* ---------- the sheets, in the house sheet ---------- */
  /* one sheet, two questions: how it felt and when it was done. Both are needed to count it. */
  var feelAt = null;
  /* keep: coming back from the time wheel, so what was already picked stays */
  function feelSheet(r, id, keep) {
    var was = S.done[r][id];
    if (!keep) feelAt = { r: r, id: id, feel: was || "", at: (S.at[r] && S.at[r][id]) || NOWT };
    var e = EX[id], cur = feelAt.feel;
    window.GFOpenSheet("mvFeel", e.name,
      '<div class="mv-meta">' + e.sets + ' sets · ' + e.reps + ' reps · ' + e.min + ' min</div>' +
      '<div class="mv-q">How did it feel?</div>' +
      '<div class="mv-seg" role="radiogroup" aria-label="How did it feel?">' + ["Easy", "Difficult"].map(function (o) {
        return '<button role="radio" aria-checked="' + (cur === o) + '" class="' + (cur === o ? "on" : "") + '" data-feel="' + o + '">' + IC.checkG + o + '</button>';
      }).join("") + '</div>' +
      '<div class="mv-q">When did you do it?</div>' + timeBtn("feel", feelAt.at) +
      '<button class="ok" data-done' + (cur ? "" : " disabled") + '>' + (was ? "Save" : "Mark as done") + '</button>' +
      (was ? '<button class="mv-undo" data-undo>Mark as not done</button>' : ""));
  }
  var draft = null;
  function stepsSheet(keep) {
    if (!keep) draft = { n: "", at: NOWT };
    var el = window.GFOpenSheet("mvSteps", "Log steps",
      '<p>They add to the hour you pick.</p>' +
      '<div class="mv-row2"><label><span class="mv-fl">Steps</span><input class="mv-in" id="mvN" inputmode="numeric" placeholder="0" autocomplete="off" value="' + draft.n + '"></label>' +
      '<div><span class="mv-fl">Around</span>' + timeBtn("steps", draft.at) + '</div></div>' +
      '<button class="ok" data-save' + (draft.n ? "" : " disabled") + '>Save</button>');
    if (!keep) setTimeout(function () { el.querySelector("#mvN").focus(); }, 320);
  }

  /* ---------- the time wheel: hour, minute, AM or PM, in its own sheet ---------- */
  var NOWT = "15:40", ROW = 44, pickFrom = "";
  function t12(v) { var h = +v.slice(0, 2); return (h % 12 || 12) + ":" + v.slice(3) + (h < 12 ? " AM" : " PM"); }
  function timeBtn(from, v) {
    return '<button class="mv-time" data-pick="' + from + '" aria-label="Time, ' + t12(v) + '. Change">' + IC.clock + '<span>' + t12(v) + '</span>' + IC.chev + '</button>';
  }
  function pad(n) { return ("0" + n).slice(-2); }
  function col(name, vals, label) {
    return '<div class="mv-wc" data-col="' + name + '" tabindex="0" role="listbox" aria-label="' + label + '"><i></i><i></i>' +
      vals.map(function (v, i) { return '<div class="mv-wi" data-i="' + i + '">' + v + '</div>'; }).join("") + '<i></i><i></i></div>';
  }
  var HRS = [], MNS = [];
  for (var h0 = 1; h0 <= 12; h0++) HRS.push(String(h0));
  for (var m0 = 0; m0 < 60; m0++) MNS.push(pad(m0));
  function timeSheet(from) {
    pickFrom = from;
    var v = from === "feel" ? feelAt.at : draft.at, h = +v.slice(0, 2), m = +v.slice(3);
    var el = window.GFOpenSheet("mvTime", from === "feel" ? "When did you do it?" : "Around what time?",
      '<div class="mv-wheel"><span class="mv-band" aria-hidden="true"></span>' +
        col("h", HRS, "Hour") + '<span class="mv-colon" aria-hidden="true">:</span>' + col("m", MNS, "Minute") + col("p", ["AM", "PM"], "AM or PM") + '</div>' +
      '<div class="mv-wnote" aria-live="polite"></div>' +
      '<button class="ok" data-settime>Set time</button>');
    var at = { h: (h % 12 || 12) - 1, m: m, p: h < 12 ? 0 : 1 };
    [].forEach.call(el.querySelectorAll(".mv-wc"), function (c) {
      c.scrollTop = at[c.dataset.col] * ROW;
      paint(c);
      var raf = 0;
      c.addEventListener("scroll", function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { paint(c); check(el); }); });
      c.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
        if (d) { e.preventDefault(); c.scrollBy({ top: d * ROW, behavior: "smooth" }); }
      });
    });
    check(el);
  }
  /* rows tip away from the centre like a drum, and fade as they go */
  function paint(c) {
    var mid = c.scrollTop / ROW;
    [].forEach.call(c.querySelectorAll(".mv-wi"), function (it, i) {
      var d = i - mid, a = Math.min(Math.abs(d), 3);
      it.style.transform = "rotateX(" + (-d * 20).toFixed(1) + "deg)";
      it.style.opacity = (1 - a * .28).toFixed(2);
      it.classList.toggle("on", Math.abs(d) < .5);
      it.setAttribute("aria-selected", Math.abs(d) < .5);
    });
  }
  function read(el) {
    function i(n) { var c = el.querySelector('[data-col="' + n + '"]'); return Math.round(c.scrollTop / ROW); }
    var h = i("h") + 1, m = i("m"), p = i("p");
    return pad(h % 12 + (p ? 12 : 0)) + ":" + pad(m);
  }
  /* today's log can't be in the future */
  function check(el) {
    var late = read(el) > NOWT;
    el.querySelector(".mv-wnote").textContent = late ? "That's later than now. Pick a time up to " + t12(NOWT) + "." : "";
    el.querySelector("[data-settime]").disabled = late;
  }

  function vidSheet(id) {
    var e = EX[id], h = '<div class="mv-vid">' + (e.video
      ? '<video src="' + VID + e.video + '.mp4" poster="' + IMG + e.img + '-poster.webp" controls autoplay playsinline></video>'
      : img(id)) + '</div>' +
      '<div class="mv-facts"><span>' + e.sets + ' <i>sets</i></span><span>' + e.reps + ' <i>reps</i></span><span>' + e.restSet + ' <i>between sets</i></span><span>' + e.rest + ' <i>before next</i></span></div>' +
      '<div class="mv-desc"><p>' + e.why + '</p>' + (e.steps
        ? '<h6>Steps to perform</h6><ol>' + e.steps.map(function (x) { return '<li>' + x + '</li>'; }).join("") + '</ol>' +
          '<h6>Do\'s</h6><ul>' + e.dos.map(function (x) { return '<li>' + x + '</li>'; }).join("") + '</ul>' +
          '<h6>Don\'ts</h6><ul>' + e.donts.map(function (x) { return '<li>' + x + '</li>'; }).join("") + '</ul>' : "") + '</div>';
    var el = window.GFOpenSheet("mvVid", e.name, h);
    /* the clip stops when the sheet goes, however it was closed */
    if (!el.mvWatch) {
      el.mvWatch = new MutationObserver(function () { var v = el.querySelector("video"); if (v && !el.classList.contains("on")) v.pause(); });
      el.mvWatch.observe(el, { attributes: true, attributeFilter: ["class"] });
    }
  }

  document.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-tick],[data-tip],[data-sel],[data-log],[data-vid],[data-feel],[data-done],[data-undo],[data-save],[data-pick],[data-settime],.mv-wi");
    if (!t || !(root.contains(t) || t.closest("#mvFeel,#mvSteps,#mvTime"))) return;
    var a = t.dataset;
    if (t.classList.contains("mv-wi")) { var c = t.parentNode; return c.scrollTo({ top: +a.i * ROW, behavior: "smooth" }); }
    if (a.pick) {
      if (a.pick === "steps") draft.n = document.getElementById("mvN").value;
      if (document.activeElement) document.activeElement.blur();   /* or the keyboard stays up over the wheel */
      return timeSheet(a.pick);
    }
    if ("settime" in a) {
      var v = read(document.getElementById("mvTime"));
      if (pickFrom === "feel") { feelAt.at = v; return feelSheet(feelAt.r, feelAt.id, true); }
      draft.at = v; return stepsSheet(true);
    }
    if (a.tick) { var p = a.tick.split("|"); return feelSheet(+p[0], p[1]); }
    if (a.vid) { var v = a.vid.split("|"); return window.MVPLAYER ? window.MVPLAYER.open(+v[0], v[1]) : vidSheet(v[1]); }
    if ("log" in a) return stepsSheet();
    if (a.tip) {
      var q = a.tip.split("|"), on = S.tips[q[0]][q[1]] = !S.tips[q[0]][q[1]];
      render();
      if (on && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        var row = root.querySelector('[data-tiprow="' + a.tip + '"]'), mk = row.querySelector(".tmark");
        row.classList.add("cheer"); mk.classList.add("pop");
        if (window.GFBurst) mk.appendChild(window.GFBurst());
      }
      return;
    }
    else if (a.sel) { var hh = +a.sel; S.sel = S.sel === hh ? null : hh; }
    else if (a.feel) {
      /* picking an answer stays in the sheet, so the time can still be set */
      feelAt.feel = a.feel;
      [].forEach.call(document.querySelectorAll("#mvFeel [data-feel]"), function (x) { var on = x === t; x.classList.toggle("on", on); x.setAttribute("aria-checked", on); });
      document.querySelector("#mvFeel [data-done]").disabled = false;
      return;
    }
    else if ("done" in a) {
      S.done[feelAt.r][feelAt.id] = feelAt.feel;
      (S.at[feelAt.r] = S.at[feelAt.r] || {})[feelAt.id] = feelAt.at;
      window.closeSheets(); render();
      if (window.MVPLAN.onDone) window.MVPLAN.onDone(feelAt.r, feelAt.id);   /* the player moves on */
      return;
    }
    else if ("undo" in a) { delete S.done[feelAt.r][feelAt.id]; window.closeSheets(); }
    else if ("save" in a) {
      var sh = document.getElementById("mvSteps"), n = +sh.querySelector("#mvN").value;
      var at = Math.min(NOW, Math.max(6, parseInt(draft.at, 10) || NOW)), before = S.steps[at] || 0;
      S.steps[at] = before + n; S.sel = at; window.closeSheets(); render();
      /* the bar grows from where it was */
      var bar = root.querySelector('.mv-b[data-sel="' + at + '"]'), to = bar.style.getPropertyValue("--h");
      var top = Math.max.apply(null, Object.keys(S.steps).map(function (k) { return S.steps[k]; }).concat(1000));
      bar.style.setProperty("--h", Math.round(before / top * 100) + "%"); void bar.offsetHeight;
      requestAnimationFrame(function () { bar.style.setProperty("--h", to); });
      return;
    }
    render();
  });
  document.addEventListener("input", function (ev) {
    if (ev.target.id !== "mvN") return;
    ev.target.value = ev.target.value.replace(/[^0-9]/g, "").replace(/^0+/, "").slice(0, 5);
    document.querySelector("#mvSteps [data-save]").disabled = !ev.target.value;
  });

  /* for /move/player.js: the same plan, ticks and tick sheet */
  window.MVPLAN = { S: S, EX: EX, ORDER: ORDER, RT: RT, IC: IC, img: img, feelSheet: feelSheet, render: render, onDone: null };
  render();
})();
