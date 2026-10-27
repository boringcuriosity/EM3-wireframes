/* Move: the plan as routine cards (Eat's meal card), then steps through the day.
   Explored in /v7/move-plan-options.html, option 3. Eat's meal cards stay in the
   page, hidden, so none of its code has to change. */
(function () {
  var IMG = "/v7/img/move/", VID = "/v7/video/move/", ICO = "/v7/img/coach/icons/";
  var EX = {
    box: { ic: "family-breathing", name: "Box breathing", img: "box", fx: 17, min: 21, kcal: 30, reps: 10, sets: 2, restSet: "30 sec", rest: "15 sec", video: "box",
      why: "Box breathing helps you take charge of your automatic breathing patterns and train your breath for better health." },
    plank: { ic: "family-push-up", name: "Plank to push up", img: "plank", fx: 33, min: 3, kcal: 25, reps: 10, sets: 2, restSet: "30 sec", rest: "15 sec", video: "plank",
      why: "A full-body exercise that builds core strength, corrects posture and improves your range of motion.",
      steps: ["Lie straight on your stomach with your hands in line with your shoulders.", "Go into a plank by straightening your arms and lifting your knees off the floor.",
        "Tighten your stomach and squeeze your buttocks. Lower down by bending one elbow at a time, then push back up, alternating arms.", "Repeat for 10 to 15 repetitions.", "Come back to the plank position."],
      dos: ["Keep your back and body straight.", "Keep your arms straight while you are in the plank."], donts: ["Do not raise your hips.", "Do not rush. Move slowly."] },
    spot: { ic: "family-cardio", name: "Spot jump", img: "spot", fx: 37, min: 2, kcal: 20, reps: 10, sets: 2, restSet: "30 sec", rest: "15 sec", video: "spot",
      why: "Spot jump raises your metabolism and oxygen capacity, and builds stamina for the heart and lungs.",
      steps: ["Stand straight with your hands on your waist.", "Keep your back and spine straight. Do not bend forwards.", "Jump up and down with your legs together and knees straight.", "Start slowly, then gradually increase the speed."],
      dos: ["Keep your feet together while jumping.", "Keep your knees straight."], donts: ["Do not jump too high.", "Do as many as your stamina allows."] },
    coastal: { ic: "family-breathing", name: "Lateral costal breathing", img: "coastal", fx: 30, min: 5, kcal: 8, reps: 10, sets: 2, restSet: "30 sec", rest: "15 sec",
      why: "Moves the ribcage through its full range, so you breathe better, move better through the spine and let the shoulder blades work properly." },
    sideleg: { ic: "family-leg-raise", name: "Side leg raise", img: "sideleg", fx: 33, min: 2, kcal: 10, reps: 10, sets: 2, restSet: "30 sec", rest: "15 sec",
      why: "Improves the range of motion at the hip, and helps body alignment and stability.",
      steps: ["Lie on one side with your legs straight.", "Rest your lower arm under your head and your top hand on your waist.", "Raise your top leg straight up, knee straight and hips steady.", "Keep your shoulder and hip in line.", "Lower your leg, then repeat on the other side."],
      dos: ["Keep your back in a straight line with your legs."], donts: ["Do not rotate your hips forward or backward.", "Do not bend your knee or overstretch your leg."] }
  };
  var ORDER = ["box", "plank", "spot", "coastal", "sideleg"];
  var RT = [
    { name: "Morning", part: "Morning", win: "6 AM to 12 PM", ic: "sunny-outline", tone: "gold", ex: ORDER,
      tips: [{ t: "Take the stairs on your way to work", d: "Skip the lift. A few flights keep your body working without a workout." },
             { t: "Get off one stop early", d: "Walk the last stretch to the office. It adds up to a few hundred steps." }] },
    { name: "Afternoon", part: "Afternoon", win: "12 PM to 4 PM", ic: "partly-sunny-outline", tone: "teal", ex: [],
      tips: [{ t: "Stand and take your meetings", d: "Standing on calls breaks a long sit and keeps you moving gently." }] },
    { name: "Evening", part: "Evening", win: "4 PM to 8 PM", ic: "cloudy-night-outline", tone: "ok", ex: ["plank"],
      tips: [{ t: "Take a short walk after dinner", d: "10 minutes on your feet after eating helps bring your blood sugar down." },
             { t: "Stand up in every TV break", d: "A minute on your feet between shows breaks a long evening sit." }] },
    { name: "Night", part: "Night", win: "8 PM to 11 PM", ic: "moon-outline", tone: "in", ex: [], tips: [] }
  ];
  /* the whole day, midnight to midnight, marked every six hours as Apple Health and Health Connect do. The coach's parts of the
     day live on the cards above; steps count toward the day whenever they fall, so the chart only needs the clock. */
  var TICKS = ["12 AM", "6 AM", "12 PM", "6 PM"];
  var NOW = +new URLSearchParams(location.search).get("now") || 15;   /* ?now= for the case document; ponytail: the prototype's clock is 3:40 PM, so the morning is behind and the evening ahead */
  var GOAL = (window.MOVEPART && window.MOVEPART[2].T) || 10000;

  /* Before a plan (?state=noplanempty, noplan): the coach has set nothing yet, so every part of the day is a plain card
     with a plus, there are no small moves, and steps have no goal. What they log is what the coach reads first. */
  var ST = new URLSearchParams(location.search).get("state") || "";
  /* a free user (?state=free, freeempty) has no coach and never will: the same plain day, with no score, no goal and no coach in the words */
  var FREE = /^free/.test(ST), NOPLAN = FREE || /^noplan/.test(ST);
  if (NOPLAN) RT.forEach(function (rt) { rt.ex = []; rt.tips = []; });
  /* no small moves exist until the coach sets them, so their tile stands down and the other two share the row */
  if (NOPLAN) { var st0 = document.createElement("style"); st0.textContent = ".mgrid{grid-template-columns:1fr 1fr !important}.mgrid>:nth-child(2){display:none}"; document.head.appendChild(st0); }
  var S = {
    done: [{ box: "Easy", plank: "Difficult" }, {}, {}, {}],
    at: [{ box: "07:10", plank: "07:30" }, {}, {}, {}],
    tips: [[true], [], [], []],
    extra: [[], [], [], []],   /* workouts found by search and logged (log.js): { name, ic, min, kcal, at } */
    steps: { 6: 180, 7: 920, 8: 1240, 9: 430, 10: 260, 11: 310, 12: 540, 13: 690, 14: 280, 15: 230 },
    sel: null
  };
  if (NOPLAN) {
    S.done = [{}, {}, {}, {}]; S.at = [{}, {}, {}, {}]; S.tips = [[], [], [], []];
    /* noplan: one walk logged this morning, the kcal as log.js counts it (MET 3.5 × 3.5 × 70 kg ÷ 200 × 30 min) */
    if (ST === "noplan" || ST === "free") S.extra[0].push({ name: "Walking", ic: "directions_walk", min: 30, kcal: 129, at: "07:30" });
  }

  var IC = {
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    checkD: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path pathLength="1" d="M20 6L9 17l-5-5"/></svg>',
    checkG: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.53.85l10.2-6.5a1 1 0 0 0 0-1.7L9.53 4.65A1 1 0 0 0 8 5.5z"/></svg>',
    /* the Steps tile's own glyph, so every way into steps wears the same mark */
    steps: '<i class="ic-steps" aria-hidden="true"></i>',
    plusSq: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><path d="M12 8.5v7M8.5 12h7"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    dots: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="7.8" r=".6" fill="currentColor"/></svg>'
  };
  function mins(ex) { return ex.reduce(function (n, id) { return n + EX[id].min; }, 0); }
  /* ponytail: kcal per exercise is a fixed estimate for now; real numbers come from the user's weight and the coach's plan */
  function kcal(ex) { return ex.reduce(function (n, id) { return n + EX[id].kcal; }, 0); }
  /* what a part of the day burned: the coach's workouts ticked, and anything searched and logged, in one unit */
  function burned(r) {
    return RT[r].ex.reduce(function (n, id) { return n + (S.done[r][id] ? EX[id].kcal : 0); }, 0) +
      S.extra[r].reduce(function (n, x) { return n + x.kcal; }, 0);
  }
  function extras(r) {
    if (!S.extra[r].length) return "";
    /* "also" only beside the coach's workouts; on a card with nothing planned it is simply what was logged */
    return '<div class="mv-xtra"><div class="lab">' + (RT[r].ex.length ? "You also logged" : "You logged") + '</div>' + S.extra[r].map(function (x, i) {
      return '<div class="mv-xr"><span class="ic"><i style="--src:url(' + (x.ic.indexOf("/") > -1 ? "/v7/icons/move/" + x.ic : "/v7/icons/move/log/" + x.ic + ".svg") + ')"></i></span>' +
        '<span class="nm">' + x.name + '<span>' + x.min + ' min · ' + x.kcal + ' kcal</span></span>' +
        '<button class="mv-xrm" data-xrm="' + r + '|' + i + '" aria-label="More for ' + x.name + '">' + IC.dots + '</button></div>';
    }).join("") + '</div>';
  }
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
    var d = S.done[r], bare = !rt.ex.length && !rt.tips.length;
    /* nothing planned (Night): a plain card, logging from the plus in the corner, and what was logged under it */
    if (bare) return '<section class="mv-card"><div class="mv-mh"><div class="t"><div class="n">' + rt.name + '</div><div class="s">' + rt.win + '</div></div>' +
      '<button class="mv-add" data-x="logworkout" aria-label="Log a workout in the ' + rt.name.toLowerCase() + '">' + IC.plusSq + '</button></div>' +
      (S.extra[r].length ? '<div class="mv-mbi">' + extras(r) + '</div>' : "") + '</section>';
    /* a quiet Gemini scene behind the header, one per part of the day, the way Eat's meal cards carry theirs */
    return '<section class="mv-card scene" style="--scene:url(/v7/icons/move/bg/' + rt.part.toLowerCase() + '.webp?v=16)">' +
      '<div class="mv-mh">' +
        '<div class="t"><div class="n">' + rt.name + '</div><div class="s">' + rt.win + (rt.ex.length ? ' · ' + mins(rt.ex) + ' min' : '') + '</div>' +
          /* like Eat's "Nutrition breakdown": what this part of the day should burn, and its small moves */
          (rt.ex.length || rt.tips.length ? '<button class="minfo" data-burn="' + r + '" aria-label="' + rt.name + ', movement breakdown">' + IC.info + 'Movement breakdown</button>' : '') + '</div>' +
'</div>' +
      '<div class="mv-mbi">' + (rt.ex.length ? '<div class="lab">Your coach\'s plan</div><div class="mv-items">' + rt.ex.map(function (id) {
        var e = EX[id], f = d[id];
        return '<div class="mv-item' + (f ? " done" : "") + '">' +
          '<button class="mv-tb' + (f ? " on" : "") + '" data-tick="' + r + '|' + id + '" aria-pressed="' + !!f + '" aria-label="' + (f ? "Done, " + f + ": " : "Mark as done: ") + e.name + '"><span class="mv-tk">' + IC.check + '</span></button>' +
          '<button class="mv-th" data-vid="' + r + '|' + id + '" aria-label="Play ' + e.name + '">' + img(id) + '<span>' + IC.play + '</span></button>' +
          /* the thumbnail plays it full screen, turned; the name, its line and the chevron open the detail, upright */
          '<button class="mv-nm" data-vid="' + r + '|' + id + '|d">' + e.name + '<span>' + e.sets + ' sets · ' + e.reps + ' reps · ' + e.kcal + ' kcal</span></button>' +
          '<button class="mv-chev" data-vid="' + r + '|' + id + '|d" tabindex="-1" aria-hidden="true">' + IC.chev + '</button>' +
          '</div>';   /* ponytail: how it felt is kept in S.done; how to show it on the row comes later */
      }).join("") + '</div>' : "") + extras(r) +
      /* with or without a coach workout, logging one is the same row: "another" only when the coach set one */
      '<div class="mv-else"><div class="lab">' + (rt.ex.length ? "Did another workout?" : "Did any workout?") + '</div><div class="mv-acts"><button>' + IC.plusSq + 'Search and log exercise</button></div></div>' +
      (rt.tips.length ? '<div class="mv-tips"><div class="lab">Small moves</div><div class="mv-tiplist">' + rt.tips.map(function (t, i) {
        var on = !!S.tips[r][i];
        /* Eat's tip anatomy (.tip, .tmark), so ticking it plays Eat's pop, ring, check draw, burst and wash */
        return '<div class="mv-tip tip' + (on ? " done" : "") + '" data-tiprow="' + r + '|' + i + '"><button class="mv-tb tickbtn" data-tip="' + r + '|' + i + '" aria-pressed="' + on + '" aria-label="' + (on ? "Mark as not done: " : "Mark as done: ") + t.t + '"><span class="tmark' + (on ? " on" : "") + '">' + (on ? IC.checkD : "") + '</span></button>' +
          '<div><div class="tt">' + t.t + '</div><div class="td">' + t.d + '</div></div></div>';
      }).join("") + '</div></div>' : "") + '</div></section>';
  }

  /* where the steps come from, as a strip across the card's foot. There is no "sync" to press: the app reads the phone's
     health store (Apple Health, or Health Connect with ?os=android) each time this screen opens or comes back, and in the
     background as the OS allows (about hourly on iOS). So the strip only says the source and when the app last read it.
     ponytail: the prototype's clock, 3:40 PM, so the last read was 3:38 PM */
  var READ = 15 * 60 + 38, ANDROID = /android/i.test(new URLSearchParams(location.search).get("os") || "");
  /* ?health=off: Health is not connected yet, so only steps logged by hand are here, and the strip asks to connect
     (move/health.js opens the sheet). Connecting brings in the day Health already kept. */
  var HEALTH = new URLSearchParams(location.search).get("health") !== "off", HSTEPS = null;
  if (!HEALTH) { HSTEPS = S.steps; S.steps = {}; }
  function connect() {
    if (HEALTH) return;
    HEALTH = true;
    Object.keys(HSTEPS).forEach(function (h) { S.steps[h] = (S.steps[h] || 0) + HSTEPS[h]; });
    READ = 15 * 60 + 40; render();
  }
  /* while Health is not connected, the log card offers steps beside the workout, as a secondary button; it goes once
     Health brings the steps in by itself */
  function stepsDoor() {
    var row = document.querySelector(".kaira .btns"); if (!row) return;
    var b = row.querySelector('[data-x="logsteps"]');
    if (HEALTH) { if (b) b.remove(); return; }
    if (!b) row.insertAdjacentHTML("beforeend", '<button class="kbtn out" data-x="logsteps"><span>' + IC.steps + '<b>Log steps</b></span></button>');
  }
  document.addEventListener("click", function (e) { if (e.target.closest('[data-x="logsteps"]')) stepsSheet(); });
  function syncHTML() {
    var NAME = ANDROID ? "Health Connect" : "Apple Health";
    /* the action in Flip green, the reason under it in grey, a green chevron: one row that reads as a tap */
    if (!HEALTH) return '<button class="mv-sync off" data-x="health"><i class="hk' + (ANDROID ? " hc" : "") + '"></i>' +
      '<span class="tx"><b>' + (ANDROID ? "Turn on Health Connect" : "Connect Apple Health") + '</b><span>Your steps count by themselves</span></span>' + IC.chev + '</button>';
    var ago = 15 * 60 + 40 - READ;
    return '<div class="mv-sync"><span class="src"><i class="hk' + (ANDROID ? " hc" : "") + '"></i>From ' + NAME + '</span>' +
      '<span class="at">' + (ago < 1 ? "Updated just now" : "Updated " + ago + " min ago") + '</span></div>';
  }
  function stepsHTML() {
    var tot = 0, max = 0;
    for (var k = 0; k <= NOW; k++) { var v = S.steps[k] || 0; tot += v; if (v > max) max = v; }
    var top = Math.max(max, 1000), left = GOAL - tot, bars = "";
    for (var b = 0; b <= 23; b++) {
      var val = S.steps[b] || 0, cls = b < NOW ? "past" : b === NOW ? "now" : "fut";
      if (cls === "fut") { bars += '<span class="mv-b fut" aria-hidden="true"><i></i></span>'; continue; }
      bars += '<button class="mv-b ' + cls + (S.sel === b ? " sel" : "") + '" data-sel="' + b + '" style="--h:' + Math.round(val / top * 100) + '%"' +
        ' aria-label="' + hr(b) + ' to ' + hr(b + 1) + ', ' + fmt(val) + ' steps"><i></i>' +
        /* the tapped hour says its count in a small tip over its bar, held inside the card at the two ends */
        (S.sel === b ? '<span class="mv-htip' + (b < 4 ? " l" : b > 19 ? " r" : "") + '" role="status"><b>' + fmt(val) + ' steps</b>' + hr(b) + ' to ' + hr(b + 1) + (b === NOW ? ", so far" : "") + '</span>' : "") + '</button>';
    }
    return '<section class="mv-steps"><div class="sec"><h2>Your steps</h2></div><div class="mv-sc">' +
      '<div class="mv-sh"><div class="t"><div class="mv-big">' + fmt(tot) + ' <span>' + (NOPLAN ? "steps" : "of " + fmt(GOAL) + " steps") + '</span></div>' +
        /* what is left, said plainly, the number carrying the weight */
        '</div><button class="mv-logbtn" data-log>' + IC.plusSq + 'Log steps</button></div>' +
        /* its own row under the number and the button, so it has the card's full width */
        '<div class="mv-sub">' + (FREE ? "Counted by your phone." : NOPLAN ? "Your coach sets your daily goal after your first consultation." : left > 0 ? '<b>' + fmt(left) + ' more</b> to reach today\'s goal' : "<b>Goal reached.</b> Every step from here is extra.") + '</div>' +
      (NOPLAN ? "" : '<div class="mv-prog"><i style="width:' + Math.min(100, tot / GOAL * 100) + '%"></i></div>') +
      '<div class="mv-chart" role="group" aria-label="Steps by hour">' + bars + '</div>' +
      '<div class="mv-bl" aria-hidden="true">' + TICKS.map(function (t) { return '<span>' + t + '</span>'; }).join("") + '</div>' +
'</div>' + syncHTML() + '</section>';
  }

  function render() {
    root.innerHTML = '<div class="sec"><h2>' + (NOPLAN ? "Your day" : "Your move plan") + '</h2></div>' +
      RT.map(card).join("") + stepsHTML();
    stepsDoor();
    if (!window.paintMacros) return;
    /* the tiles above read the same plan. On load they were drawn before this file, so they take its numbers outright rather than counting over from staged ones */
    if (!painted) [].forEach.call(document.querySelectorAll(".mgrid .mval strong"), function (n, i) { n.setAttribute("data-n", live()[i]); n.textContent = fmt(live()[i]); });
    painted = true;
    window.paintMacros(null, "");
    burnLine();
  }
  var painted = false;

  /* Calories burned, laid out like Eat's calorie intake line: workouts (MET x 3.5 x kg / 200 x min, log.js) plus steps.
     Steps by the ACSM walking equation: level walking costs 0.1 ml O2 per kg per metre above rest, 5 kcal per litre,
     so 0.5 kcal per kg per km, net of resting; the distance is steps x stride, stride = height x 0.414.
     ponytail: 65 kg and 165 cm until the profile is wired in, as log.js */
  var KG = 65, CM = 165;
  function stepKcal(n) { return n * CM * .414 / 100000 * KG * .5; }
  function burnLine() {
    if (!window.paintCal) return;
    /* the number alone: no one sets a burn goal, and an estimate should not read as a target */
    var v = live();
    window.paintCal(Math.round(v[0] + stepKcal(v[2])), 0);
  }

  /* "What shaped your score?" counts from these cards: kcal burned of kcal planned, small moves ticked of planned, steps walked.
     ponytail: one plan for every day the switcher shows; per-day plans come with real data */
  function live() {
    var m = 0, M = 0, t = 0, T = 0, st = 0;
    RT.forEach(function (rt, r) {
      M += kcal(rt.ex); m += burned(r);
      rt.tips.forEach(function (x, i) { T++; if (S.tips[r][i]) t++; });
    });
    for (var k = 0; k <= NOW; k++) st += S.steps[k] || 0;
    window.MOVEPART[0].T = M; window.MOVEPART[0].unit = " kcal"; window.MOVEPART[1].T = T;
    return [m, t, st];
  }
  var mv0 = window.MV;
  window.MV = function (i, eaten, target) { return target === 0 && !NOPLAN ? mv0(i, eaten, target) : live()[i]; };
  live();

  /* ---------- the burn breakdown: Eat's meal sheet (index.html mealSheet), for a part of the day ----------
     what was burned, the coach's workouts and any searched and logged ones alike, against the target give or take 20% */
  function burnSheet(r) {
    var rt = RT[r], got = burned(r), tg = kcal(rt.ex), sm = rt.tips.length, smd = S.tips[r].filter(Boolean).length;
    /* lo and hi are the ends of the target range. A count (hi null) has nothing past its target: the bar ends there, with no handles */
    var row = function (ic, name, v, lo, hi, u, tgt) {
      var mx = hi == null ? lo : Math.max(hi * 1.25, v * 1.08, 1), pc = function (x) { return Math.min(x / mx * 100, 100); };
      return '<div class="ir"><div class="top">' + ic + name + ' : <b>' + v + u + '</b><span class="ideal">Target: ' + tgt + '</span></div>' +
        '<div class="track"><span class="fill" style="width:' + pc(v) + '%"></span>' +
          (hi == null ? "" : '<span class="hd2 lo" style="left:' + pc(lo) + '%"></span><span class="hd2 hi" style="left:' + pc(hi) + '%"></span>') +
        '<span class="val' + (pc(v) > 62 ? " in" : "") + '" style="left:' + pc(v) + '%">' + v + u + '</span></div></div>';
    };
    var lo = Math.round(tg * .8), hi = Math.round(tg * 1.2);
    window.GFOpenSheet("mvBurn", rt.name,
      '<div class="msub">Suggested ' + rt.win + ' · what you moved, against this part of the day’s target</div>' +
      (tg ? row('<i class="flm"></i>', "Calories burned", got, lo, hi, " kcal", lo + "–" + hi + " kcal") +
        (window.IRLEG ? '<div class="irleg">' + window.IRLEG + 'Target range</div>' : "") : "") +
      (sm ? row('<i class="gl glyph-moves"></i>', "Small moves", smd, sm, null, " of " + sm, String(sm)) : "") +
      '<div class="irex"><h5>What the target means</h5><p>Your coach sets what to do in each part of the day: calories to burn' + (sm ? ", and small moves to fit in" : "") + '.</p>' +
      '<ul>' + (tg ? '<li>For calories, anywhere within 20% of the target counts as on target. Burning more never counts against you.</li>' +
        '<li>Your coach’s workouts and anything you search and log count the same way, by the calories they burn. They are an estimate at your weight.</li>' : "") +
        (sm ? '<li>Small moves are everyday movement, like taking the stairs. Each one you tick adds to your Momentum.</li>' : "") + '</ul></div>');
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
  /* Log steps: one row per time, steps and around when. "+ Add another time" adds a row, so a morning walk and an
     evening one go in together; Save logs every row with steps in it, each into its own hour */
  var draft = null;
  function filled() { return draft.rows.filter(function (r) { return +r.n > 0; }).length; }
  function saveLabel() { var k = filled(); return k > 1 ? "Save " + k + " logs" : "Save"; }
  function stepsSheet(keep) {
    if (!keep) draft = { rows: [{ n: "", at: NOWT }], pick: 0 };
    var el = window.GFOpenSheet("mvSteps", "Log steps",
      '<div class="mv-row2 mv-heads"><span class="mv-fl">Steps</span><span class="mv-fl">Around</span><span></span></div>' +
      '<div class="mv-srows">' + draft.rows.map(function (r, i) {
        return '<div class="mv-row2 mv-srow' + (keep === "new" && i === draft.rows.length - 1 ? " new" : "") + '"><input class="mv-in" data-row="' + i + '"' + (i ? "" : ' id="mvN"') + ' inputmode="numeric" placeholder="0" autocomplete="off" aria-label="Steps" value="' + r.n + '">' +
          timeBtn("steps|" + i, r.at) + (i ? '<button class="mv-srm" data-srm="' + i + '" aria-label="Remove this time">' + IC.x + "</button>" : "<span></span>") + "</div>";
      }).join("") + "</div>" +
      (draft.rows.length < 6 ? '<button class="mv-addrow" data-addrow>' + IC.plusSq + "Add another time</button>" : "") +
      '<button class="ok" data-save' + (filled() ? "" : " disabled") + ">" + saveLabel() + "</button>");
    el.setAttribute("data-kb-lift", "");   /* the phone frame's keyboard pushes the sheet up, so the field and Save stay in view */
    var f = el.querySelector('[data-row="' + (keep === "new" ? draft.rows.length - 1 : 0) + '"]');
    if (!keep || keep === "new") setTimeout(function () { f.focus(); }, keep ? 60 : 320);
  }
  function keepRows() { [].forEach.call(document.querySelectorAll("#mvSteps [data-row]"), function (x) { draft.rows[+x.dataset.row].n = x.value; }); }

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
    var v = from === "feel" ? feelAt.at : draft.rows[draft.pick].at, h = +v.slice(0, 2), m = +v.slice(3);
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
    var t = ev.target.closest("[data-xrm],[data-burn],[data-tick],[data-tip],[data-sel],[data-log],[data-vid],[data-feel],[data-done],[data-undo],[data-save],[data-pick],[data-settime],[data-addrow],[data-srm],.mv-wi");
    if (!t || !(root.contains(t) || t.closest("#mvFeel,#mvSteps,#mvTime"))) return;
    var a = t.dataset;
    if (t.classList.contains("mv-wi")) { var c = t.parentNode; return c.scrollTo({ top: +a.i * ROW, behavior: "smooth" }); }
    if (a.pick) {
      if (a.pick.indexOf("steps") === 0) { keepRows(); draft.pick = +a.pick.split("|")[1] || 0; }
      if (document.activeElement) document.activeElement.blur();   /* or the keyboard stays up over the wheel */
      return timeSheet(a.pick);
    }
    if ("settime" in a) {
      var v = read(document.getElementById("mvTime"));
      if (pickFrom === "feel") { feelAt.at = v; return feelSheet(feelAt.r, feelAt.id, true); }
      draft.rows[draft.pick].at = v; return stepsSheet(true);
    }
    if ("addrow" in a) { keepRows(); var last = draft.rows[draft.rows.length - 1].at; draft.rows.push({ n: "", at: last }); return stepsSheet("new"); }
    if (a.srm) { keepRows(); draft.rows.splice(+a.srm, 1); return stepsSheet(true); }
    if (a.tick) { var p = a.tick.split("|"); return feelSheet(+p[0], p[1]); }
    if (a.burn) return burnSheet(+a.burn);
    if (a.xrm) {
      var xq = a.xrm.split("|"), xr = +xq[0], xw = S.extra[xr][+xq[1]];
      return window.MVTRAY && window.MVTRAY.menu(xw.name, xw.min + " min · " + xw.kcal + " kcal",
        NOPLAN ? "It comes off today's log." : "It comes off today's log, and the " + xw.kcal + " kcal it burned leave your Momentum score.",
        function () { S.extra[xr].splice(S.extra[xr].indexOf(xw), 1); },
        window.editLoggedWorkout && function () { window.editLoggedWorkout(xr, xw); });
    }
    if (a.vid) { var v = a.vid.split("|"); return window.MVPLAYER ? window.MVPLAYER.open(+v[0], v[1], v[2] === "d") : vidSheet(v[1]); }
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
      keepRows();
      var top = Math.max.apply(null, Object.keys(S.steps).map(function (k) { return S.steps[k]; }).concat(1000)), grew = {};
      draft.rows.forEach(function (r) {
        var n = +r.n; if (!n) return;
        var at = Math.min(NOW, Math.max(0, parseInt(r.at, 10) || NOW));
        if (!(at in grew)) grew[at] = S.steps[at] || 0;
        S.steps[at] = (S.steps[at] || 0) + n; S.sel = at;
      });
      window.closeSheets(); render();
      /* each bar that got steps grows from where it was */
      Object.keys(grew).forEach(function (at) {
        var bar = root.querySelector('.mv-b[data-sel="' + at + '"]'); if (!bar) return;
        var to = bar.style.getPropertyValue("--h");
        bar.style.setProperty("--h", Math.round(grew[at] / top * 100) + "%"); void bar.offsetHeight;
        requestAnimationFrame(function () { bar.style.setProperty("--h", to); });
      });
      return;
    }
    render();
  });
  document.addEventListener("input", function (ev) {
    if (!ev.target.closest || !ev.target.closest("#mvSteps [data-row]")) return;
    ev.target.value = ev.target.value.replace(/[^0-9]/g, "").replace(/^0+/, "").slice(0, 5);
    keepRows();
    var b = document.querySelector("#mvSteps [data-save]"); b.disabled = !filled(); b.textContent = saveLabel();
  });

  /* for /move/player.js: the same plan, ticks and tick sheet */
  window.MVPLAN = { noplan: NOPLAN, free: FREE, connect: connect, health: function () { return HEALTH; }, android: ANDROID, burned: burned, S: S, EX: EX, ORDER: ORDER, RT: RT, IC: IC, img: img, feelSheet: feelSheet, render: render, onDone: null };
  render();
})();
