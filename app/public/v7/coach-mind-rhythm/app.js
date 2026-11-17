/* The coach's Rhythm overview (v7/coach-mind-rhythm.html), built like Momentum (coach-momentum-day-parts.html) and Nutrition
   Sufficiency (coach-nutrition-sufficiency.html): KPIs, then what stands out in how the person sleeps and looks after
   themselves, then one chart (the sleep against the coach's window, with the self-care rows under it), then what is
   behind the score. Every number comes from the app's own rule: mind/sleep-rule.js picks the night, the naps and the
   window, and the weights are mind/plan.js's (sleep duration 25, consistency 25, wind-down 20, breathing 10, me-time 10,
   mood 10; a part the plan leaves out shares its points inside its own group). Today is shown "so far" and left out of
   the averages and the patterns, since its evening has not happened. */
(function () {
  var S = window.MDSLEEP, MR = window.MR, DAY = 864e5;
  var W0 = { hours: 25, window: 25, wd: 20, br: 10, me: 10, mood: 10 }, GROUPS = [["hours", "window", "wd"], ["br", "me", "mood"]];
  var FACE = ["😣", "😕", "😐", "🙂", "😄"], FACEN = ["Awful", "Low", "Okay", "Good", "Great"];
  var MEDAL = 80, BANDS = [[80, "Great", "ok", "🏅"], [70, "Solid", "solid", "✨"], [50, "Room to grow", "warn", "⛅"], [0, "Needs attention", "bad", "⚠️"]];
  var $ = function (id) { return document.getElementById(id); };
  var r0 = Math.round, avg = function (a) { return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : null; };
  var fmt = function (d, o) { return d.toLocaleDateString("en-GB", o || { day: "numeric", month: "short" }); };
  var addD = function (d, n) { return new Date(d.getTime() + n * DAY); };
  var clk = function (m) { return S.clk(m); }, gap = function (m) { return S.gap(m); }, dur = function (m) { return S.dur(m); };
  /* averages are said to the nearest 5 minutes: "about 11:55 PM", not 11:56 */
  var clk5 = function (m) { return clk(Math.round(m / 5) * 5); }, gap5 = function (m) { return gap(Math.round(m / 5) * 5); };
  var hrsTxt = function (h) { var m = r0(h * 60); return m % 60 ? Math.floor(m / 60) + "h " + m % 60 + "m" : m / 60 + "h"; };
  var off = function (d, tol) { return Math.abs(d) <= tol ? "on time" : gap(d) + (d > 0 ? " late" : " early"); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var plural = function (n, w) { return n + " " + w + (n === 1 ? "" : "s"); };
  var verdict = function (v) { var b = BANDS.filter(function (x) { return v >= x[0]; })[0]; return '<span class="pill ' + b[2] + '">' + b[3] + " " + b[1] + "</span>"; };
  var listDates = function (L) { var t = L.slice(0, 3).map(function (d) { return fmt(d.date); }); return t.join(", ") + (L.length > 3 ? " and " + (L.length - 3) + " more" : ""); };

  /* line icons for the part tiles, as masks */
  /* single quotes: these land inside style="" attributes, where a double quote would end the attribute (the icons showed as empty boxes) */
  var svgu = function (p) { return "url('data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + "</svg>") + "')"; };
  var CMP = [
    { k: "hours", name: "Sleep duration", col: "#444CE7", ic: "url(/mind/icons/moon.svg)" },
    { k: "window", name: "Sleep consistency", col: "#6172F3", ic: "url(/v7/mind/icons/clock.svg)" },
    { k: "wd", name: "Wind-down", col: "#8098F0", ic: "url(/mind/icons/sunset.svg)" },
    { k: "br", name: "Breathing", col: "#2DA6A6", ic: svgu('<path d="M12.8 19.6A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/><path d="M9.8 4.4A2 2 0 1 1 11 8H2"/>') },
    { k: "me", name: "Me-time", col: "#299D6B", ic: "url(/mind/icons/care.svg)" },
    { k: "mood", name: "Mood check-in", col: "#CDA935", ic: svgu('<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>') }
  ];
  var ctile = function (k, sz) { var c = CMP.filter(function (x) { return x.k === k; })[0]; return '<i class="ct ' + (sz || "") + '" style="--mc:' + c.col + '"><i style="--src:' + c.ic + '"></i></i>'; };

  var HELP = {
    score: "<b>How Rhythm works</b>Rhythm shows how well the person slept and looked after themselves against the Mind plan, out of 100. It starts at 0 each day.<ul><li><b>Sleep quality, 70:</b> sleep duration 25 (main sleep and naps against the target), sleep consistency 25 (bedtime and wake-up each within 30 minutes of the window, judged on the main sleep only) and wind-down 20 (each task earns its share).</li><li><b>Self-care, 30:</b> breathing 10, me-time 10 and mood check-in 10. Checking in counts. The face they pick never changes the score.</li></ul>A part the plan leaves out shares its points within its group. A day at 80 or more earns the medal in the app.",
    avg: '<b>Average score</b>The average of the daily scores on days with anything logged. Today is left out until the day is over.<ul class="tags"><li><span class="pill ok">🏅 Great</span><span>80 and above. A medal day in the app.</span></li><li><span class="pill solid">✨ Solid</span><span>70 to 79.</span></li><li><span class="pill warn">⛅ Room to grow</span><span>50 to 69.</span></li><li><span class="pill bad">⚠️ Needs attention</span><span>Below 50.</span></li></ul>',
    nights: "<b>Nights logged</b>Nights with sleep logged. A night with no data is not a bad night: it scores no sleep points, and it is shown apart so you can ask about it.",
    medal: "<b>Medal days</b>Days at 80 or more, out of the days with anything logged. On each one the person earned the Lotus at dawn medal in the app.",
    chart: "<b>Reading the chart</b>Each column is a day, or the average of a week or month.<ul><li><b>Top, the sleep:</b> the shaded band is the coach's window. The bar is the main sleep from bedtime to wake-up; a thin line inside it is time awake. Lighter bars are naps. <b>Dashed:</b> no sleep logged.</li><li><b>Below, self-care:</b> each row fills by how much was done. Dashed is planned, not done. Mood shows the lowest face that day.</li><li>Grey columns are weekends. The number on top is the score.</li></ul>A week or month shows the average bedtime and wake-up, with thin lines for the earliest and latest.",
    side: "<b>Behind the score</b>Each part's average, with the points it earned out of what it can earn. Tap a day or week on the chart to see it alone."
  };

  /* ---------- the patient and their scored days ---------- */
  var Q = new URLSearchParams(location.search), PT, P, WIN, Wt, D = [], CD = [];
  function weights(P) {
    var has = { wd: P.wd.length, br: P.br.length, me: P.me.length }, w = {};
    GROUPS.forEach(function (g) {
      var on = g.filter(function (k) { return !(k in has) || has[k]; }), full = 0, part = 0;
      g.forEach(function (k) { full += W0[k]; }); on.forEach(function (k) { part += W0[k]; });
      on.forEach(function (k) { w[k] = W0[k] * full / part; });
    });
    return w;
  }
  function scoreDay(d) {
    var sl = S.score(d.sleeps, P, WIN), x = {};
    x.sl = sl; x.sleep = d.sleeps.length > 0;
    x.wdN = d.wd.filter(Boolean).length;
    x.brTick = d.br.filter(function (s) { return s >= 60; }).length;
    x.brMin = d.br.reduce(function (a, s) { return a + s; }, 0) / 60; x.brPlan = P.br.reduce(function (a, b) { return a + b.min; }, 0);
    x.moodN = d.mood.filter(function (v) { return v != null; }).length;
    x.p = { hours: sl.hours, window: sl.window, wd: P.wd.length ? x.wdN / P.wd.length : 0, br: P.br.length ? x.brTick / P.br.length : 0, me: d.me ? 1 : 0, mood: x.moodN / P.mood.length };
    x.pts = {}; var tot = 0;
    Object.keys(Wt).forEach(function (k) { x.pts[k] = Wt[k] * x.p[k]; tot += x.pts[k]; });
    x.score = r0(tot);
    x.logged = x.sleep || x.wdN > 0 || d.br.some(Boolean) || d.me > 0 || x.moodN > 0;
    x.we = d.date.getDay() === 0 || d.date.getDay() === 6;
    return x;
  }
  function load(id) {
    PT = MR.PATIENTS.filter(function (p) { return p.id === id; })[0] || MR.PATIENTS[0]; P = PT.plan;
    WIN = S.place(P.bed, P.wake); Wt = weights(P);
    D = PT.days.map(function (d) { var o = Object.assign({}, d); o.x = scoreDay(d); return o; });
    state.sel = null; PIN = null; state.hl = null; state.more = false; state.from = state.to = null;
  }

  /* ---------- buckets (as Momentum) ---------- */
  var state = { v: "daily", sel: null, from: null, to: null, hl: null, more: false };
  function range() { return state.from ? [state.from, state.to] : state.v === "daily" ? [new Date(Math.max(MR.START, addD(MR.TODAY, -29))), MR.TODAY] : [MR.START, MR.TODAY]; }
  function buckets(v) {
    var f = range()[0], t = range()[1], DD = D.filter(function (d) { return d.date >= f && d.date <= t; });
    if (v === "daily") return DD.map(function (d) { return { days: [d], label: d.date.getDate(), sub: "SMTWTFS"[d.date.getDay()], title: fmt(d.date, { weekday: "long", day: "numeric", month: "short" }), bold: d.date.getDay() === 1 }; });
    if (v === "weekly") {
      var out = [];
      DD.forEach(function (d, i) { if (i === 0 || d.date.getDay() === 1) out.push({ days: [] }); out[out.length - 1].days.push(d); });
      return out.map(function (b, i) { return Object.assign(b, { label: "W" + (Math.floor((b.days[0].date - addD(MR.START, -((MR.START.getDay() + 6) % 7))) / (7 * DAY)) + 1), sub: fmt(b.days[0].date), title: fmt(b.days[0].date) + " to " + fmt(b.days[b.days.length - 1].date) }); });
    }
    var m = {}; DD.forEach(function (d) { (m[d.date.getMonth()] = m[d.date.getMonth()] || []).push(d); });
    return Object.keys(m).map(function (k) { var days = m[k], a = days[0].date, z = days[days.length - 1].date;
      return { days: days, label: fmt(a, { month: "short" }), sub: a.getDate() + " to " + z.getDate(), title: fmt(a, { month: "long", year: "numeric" }) + ", " + a.getDate() + " to " + z.getDate() }; });
  }
  /* the closed days with anything logged: today is left out until it is over */
  var closed = function (days) { return days.filter(function (d) { return !d.today && d.x.logged; }); };
  function agg(days) {
    var L = closed(days); if (!L.length) return null;
    var o = { n: days.filter(function (d) { return !d.today; }).length, nl: L.length, score: avg(L.map(function (d) { return d.x.score; })), pts: {} };
    Object.keys(Wt).forEach(function (k) { o.pts[k] = avg(L.map(function (d) { return d.x.pts[k]; })); });
    o.medal = L.filter(function (d) { return d.x.score >= MEDAL; }).length;
    var N = L.filter(function (d) { return d.x.sleep; }), J = N.filter(function (d) { return d.x.sl.judged; });
    o.nights = N.length; o.judged = J.length;
    o.slept = avg(N.map(function (d) { return d.x.sl.slept; }));
    o.met = N.filter(function (d) { return d.x.sl.slept >= P.hours - .25; }).length;
    /* bedtime and wake-up are averaged over the nights near the window only: a night-shift sleeper's nights off would
       otherwise blend day and night into a time nobody slept. The others are counted apart */
    var J2 = J.filter(function (d) { return Math.abs(d.x.sl.db) < 240; }); o.far = J.length - J2.length; o.near = J2.length;
    o.bed = avg(J2.map(function (d) { return d.x.sl.night.bed; })); o.wake = avg(J2.map(function (d) { return d.x.sl.night.wake; }));
    o.bedMin = Math.min.apply(null, J2.map(function (d) { return d.x.sl.night.bed; })); o.bedMax = Math.max.apply(null, J2.map(function (d) { return d.x.sl.night.bed; }));
    o.wakeMin = Math.min.apply(null, J2.map(function (d) { return d.x.sl.night.wake; })); o.wakeMax = Math.max.apply(null, J2.map(function (d) { return d.x.sl.night.wake; }));
    o.onBoth = J.filter(function (d) { return Math.abs(d.x.sl.db) <= P.tol && Math.abs(d.x.sl.dw) <= P.tol; }).length;
    o.naps = N.reduce(function (a, d) { return a + d.x.sl.naps.length; }, 0);
    o.napMin = avg([].concat.apply([], N.map(function (d) { return d.x.sl.naps.map(function (z) { return z.asleep; }); })));
    o.wd = avg(L.map(function (d) { return d.x.wdN; })); o.wdTask = P.wd.map(function (_, t) { return L.filter(function (d) { return d.wd[t]; }).length; });
    o.brDays = L.filter(function (d) { return d.x.brTick > 0; }).length; o.brMin = avg(L.filter(function (d) { return d.x.brMin > 0; }).map(function (d) { return d.x.brMin; }));
    o.me = L.filter(function (d) { return d.me; }).length;
    o.moodN = L.reduce(function (a, d) { return a + d.x.moodN; }, 0); o.moodSlots = L.length * P.mood.length;
    o.faces = [0, 0, 0, 0, 0]; L.forEach(function (d) { d.mood.forEach(function (v) { if (v != null) o.faces[v]++; }); });
    return o;
  }

  /* ---------- what stands out: behaviour, not just numbers ---------- */
  var wkdy = function (d) { return !d.x.we; };
  function insights(days) {
    var L = closed(days), out = [], N = L.filter(function (d) { return d.x.sleep; }), J = N.filter(function (d) { return d.x.sl.judged; });
    var dayWin = WIN.wake > 1900;   /* a window that ends in the day: a night-shift sleeper */
    if (L.length < 5) return out;
    var nm = PT.name;
    /* 1. bedtime by week, weekdays only so weekends do not hide a drift */
    var wk = []; J.filter(wkdy).forEach(function (d) { var k = Math.floor((d.date - L[0].date) / (7 * DAY)); (wk[k] = wk[k] || []).push(d); });
    wk = wk.filter(Boolean).map(function (g) { return { days: g, db: avg(g.map(function (d) { return d.x.sl.db; })), bed: avg(g.map(function (d) { return d.x.sl.night.bed; })) }; });
    if (!dayWin && wk.length >= 3) {
      var worst = wk.reduce(function (a, b) { return b.db > a.db ? b : a; }), last = wk[wk.length - 1];
      if (worst.db >= 45 && last.db <= 30 && worst !== last)
        out.push({ tone: "ok", w: 5, title: "Bedtime is back near the plan", line: "After a late stretch (" + fmt(worst.days[0].date) + " to " + fmt(worst.days[worst.days.length - 1].date) + ", about " + clk5(worst.bed) + " on weekdays), " + nm + " now goes to bed around " + clk5(last.bed) + "." + (function () { var c = L.filter(function (d) { return d.note && d.date > worst.days[0].date; })[0]; return c ? " The turn came after the coach call on " + fmt(c.date) + "." : ""; })(), days: worst.days });
      else if (last.db - wk[0].db >= 30) out.push({ tone: "warn", w: 9, title: "Bedtime is moving later", line: "Weekday bedtime went from about " + clk5(wk[0].bed) + " to " + clk5(last.bed) + " over the period.", days: last.days });
      else if (last.db >= 45) out.push({ tone: "warn", w: 8, title: "Bedtime runs late", line: "About " + clk5(last.bed) + " on weekdays lately, " + gap5(last.db) + " after the plan.", days: last.days });
    }
    /* 2. weekends */
    var WE = J.filter(function (d) { return d.x.we; }), WD = J.filter(wkdy);
    if (!dayWin && WE.length >= 2 && WD.length >= 3) {
      var dwE = avg(WE.map(function (d) { return d.x.sl.night.wake; })), dwD = avg(WD.map(function (d) { return d.x.sl.night.wake; }));
      if (dwE - dwD >= 60) {
        var cE = avg(WE.map(function (d) { return d.x.pts.window; })), cD = avg(WD.map(function (d) { return d.x.pts.window; }));
        out.push({ tone: "warn", w: 7, title: "Weekends start late", line: "Up around " + clk5(dwE) + " on weekends, " + gap5(dwE - dwD) + " later than on weekdays. Sleep consistency falls from " + r0(cD) + " to " + r0(cE) + " pts on those days.", days: WE });
      }
    }
    /* 3. naps after short nights */
    var napD = N.filter(function (d) { return d.x.sl.naps.length; });
    if (napD.length >= 3) {
      var after = napD.filter(function (d) { return d.x.sl.night.asleep / 60 < P.hours - 1; });
      var napAvg = avg([].concat.apply([], napD.map(function (d) { return d.x.sl.naps.map(function (z) { return z.asleep; }); })));
      out.push({ tone: after.length >= napD.length * .6 ? "warn" : "info", w: 6, title: after.length >= napD.length * .6 ? "Naps are making up for short nights" : "Naps on " + napD.length + " days",
        line: "Naps on " + napD.length + " days, " + gap5(napAvg) + " on average" + (after.length ? ", " + after.length + " of them after a night under " + hrsTxt(P.hours - 1) : "") + ". Naps add to the hours, never to the window.", days: napD });
    }
    /* 4. the night shift: on days off they sleep at night, which a day window cannot score */
    if (dayWin) {
      var nights = J.filter(function (d) { return Math.abs(d.x.sl.db) >= P.zero; });
      if (nights.length >= 3) out.push({ tone: "info", w: 8, title: "Nights on days off", line: "On " + nights.length + " days off " + nm + " slept at night (about " + clk5(avg(nights.map(function (d) { return d.x.sl.night.bed; }))) + " to " + clk5(avg(nights.map(function (d) { return d.x.sl.night.wake; }))) + "), so the day window scored 0. Still " + hrsTxt(avg(nights.map(function (d) { return d.x.sl.slept; }))) + " of sleep on those days.", days: nights });
    }
    /* 5. low moods: falling over time, or after short nights. The score never shows this */
    var M = []; L.forEach(function (d) { d.mood.forEach(function (v) { if (v != null) M.push({ d: d, v: v }); }); });
    if (M.length >= 8) {
      var h = Math.floor(M.length / 2), lowA = M.slice(0, h).filter(function (m) { return m.v <= 1; }).length / h, last10 = M.slice(-10), lowB = last10.filter(function (m) { return m.v <= 1; }).length;
      var lowDays = L.filter(function (d) { return d.mood.some(function (v) { return v != null && v <= 1; }); });
      /* falling: the average face of the last 10 is a step or more below the first half's */
      var mA = avg(M.slice(0, h).map(function (m) { return m.v; })), mB = avg(last10.map(function (m) { return m.v; }));
      if (mA - mB >= .8)
        out.push({ tone: "warn", w: 10, title: "Mood is falling", line: "Check-ins went from mostly " + FACEN[r0(mA)] + " to mostly " + FACEN[Math.ceil(mB)] + (Math.ceil(mB) !== Math.floor(mB) ? " and " + FACEN[Math.floor(mB)] : "") + ". " + lowB + " of the last 10 were Low or Awful, against " + (r0(lowA * h) || "none") + " of " + h + " before. Mood never moves the score, so the score will not show this.", days: L.filter(function (d) { return d.mood.some(function (v) { return v != null && v <= 2; }) && d.date >= last10[0].d.date; }) });
      else if (lowDays.length >= 2) {
        var shortBefore = lowDays.filter(function (d) { return d.x.sleep && d.x.sl.slept < 6.25; });
        if (shortBefore.length >= lowDays.length * .6) out.push({ tone: "info", w: 6, title: "Low moods follow short nights", line: shortBefore.length + " of the " + plural(lowDays.length, "day") + " with a Low or Awful check-in came after under " + hrsTxt(6.25) + " of sleep.", days: lowDays });
      }
    }
    /* 6. the evening check-in fading */
    if (P.mood.length > 1 && L.length >= 14) {
      var late = L.slice(-14), early = L.slice(0, 7), miss = function (g) { return g.filter(function (d) { return d.mood[d.mood.length - 1] == null; }); };
      if (miss(late).length >= 6 && miss(late).length / 14 > miss(early).length / 7 + .2)
        out.push({ tone: "warn", w: 7, title: "Evening check-ins are thinning out", line: "Missed on " + miss(late).length + " of the last 14 evenings, against " + miss(early).length + " of the first 7.", days: miss(late) });
    }
    /* 7. breathing: skipped, or ticked but short (a session counts after 1 minute) */
    if (P.br.length) {
      var brOn = L.filter(function (d) { return d.x.brTick > 0; }), mins = avg(brOn.map(function (d) { return d.x.brMin; }));
      if (brOn.length >= L.length * .6 && mins < P.br[0].min * .6)
        out.push({ tone: "warn", w: 6, title: "Breathing sessions end early", line: "Done on " + brOn.length + " of " + L.length + " days, but " + mins.toFixed(1) + " of " + P.br[0].min + " min on average. A session counts after 1 minute, so the score shows full points.", days: brOn });
      else if (brOn.length < L.length * .7) {
        var skip = L.filter(function (d) { return !d.x.brTick; });
        out.push({ tone: "info", w: 4, title: "Breathing often skipped", line: P.br[0].n + " was done on " + brOn.length + " of " + L.length + " days. Skipped on " + listDates(skip) + ".", days: skip });
      }
    }
    /* 8. the wind-down task that slips, and what it does to bedtime */
    if (P.wd.length && !dayWin) {
      var rate = P.wd.map(function (_, t) { return L.filter(function (d) { return d.wd[t]; }).length; }), t = rate.indexOf(Math.min.apply(null, rate));
      if (rate[t] < L.length * .6) {
        var yes = J.filter(function (d) { return d.wd[t]; }), no = J.filter(function (d) { return !d.wd[t]; });
        var diff = yes.length >= 3 && no.length >= 3 ? avg(no.map(function (d) { return d.x.sl.db; })) - avg(yes.map(function (d) { return d.x.sl.db; })) : 0;
        out.push({ tone: "info", w: diff >= 20 ? 7 : 3, title: P.wd[t].s + ": done on " + rate[t] + " of " + L.length + " days",
          line: diff >= 20 ? "On the days it was done, bedtime was " + gap5(diff) + " closer to the plan. It is the wind-down step that slips most." : "The wind-down step that slips most. The others are done on most days.", days: L.filter(function (d) { return d.wd[t]; }) });
      }
    }
    /* 9. me-time rarely done */
    if (P.me.length) { var meD = L.filter(function (d) { return d.me; }).length; if (meD < L.length * .35) out.push({ tone: "info", w: 4, title: "Me-time is rarely done", line: P.me[0].s + " on " + meD + " of " + L.length + " days. Worth asking whether it still suits them.", days: L.filter(function (d) { return d.me; }) }); }
    /* 10. nights with no data, a night too short to judge, and nights typed in by hand */
    var none = L.filter(function (d) { return !d.x.sleep; }), hand = N.filter(function (d) { return d.src === "manual" || d.src === "edited"; }), nj = N.filter(function (d) { return !d.x.sl.judged; });
    if (none.length) out.push({ tone: "info", w: 3, title: "No sleep data on " + plural(none.length, "day"), line: listDates(none) + ". Other logs came in on " + (none.length > 1 ? "those days" : "that day") + ", so it looks like the device or the sync, not a bad night." + (hand.length ? " Also, " + plural(hand.length, "night") + " typed in or edited by hand." : ""), days: none });
    if (nj.length) out.push({ tone: "info", w: 2, title: plural(nj.length, "night") + " too short to judge", line: listDates(nj) + ": the longest sleep was under 3 hours, so sleep consistency gave 0. Hours still count.", days: nj });
    /* 11. something steady, so the coach can praise it */
    if (!dayWin && WD.length >= 5) { var st = WD.filter(function (d) { return Math.abs(d.x.sl.dw) <= P.tol; }); if (st.length >= WD.length * .8) out.push({ tone: "ok", w: 2, title: "Wake-up is steady", line: "Within 30 minutes of " + clk(WIN.wake) + " on " + st.length + " of " + WD.length + " weekdays.", days: st }); }
    if (dayWin) { var sh = J.filter(function (d) { return Math.abs(d.x.sl.db) < P.zero; }), ok = sh.filter(function (d) { return Math.abs(d.x.sl.db) <= P.tol && Math.abs(d.x.sl.dw) <= P.tol; }); if (sh.length >= 5) out.push({ tone: "ok", w: 5, title: "Day sleep after shifts holds well", line: "On " + ok.length + " of " + sh.length + " shift days, bedtime and wake-up were both within 30 minutes of the window.", days: ok }); }
    var T = { warn: 2, info: 1, ok: 0 };
    return out.sort(function (a, b) { return T[b.tone] - T[a.tone] || b.w - a.w; });
  }

  /* ---------- render ---------- */
  var B = [], A = null, PD = [];
  function render() {
    B = buckets(state.v).map(function (b) { b.a = agg(b.days); return b; });
    PD = [].concat.apply([], B.map(function (b) { return b.days; })); A = agg(PD);
    [].forEach.call(document.querySelectorAll("#views button"), function (b) { b.setAttribute("aria-selected", b.dataset.v === state.v); });
    var r = range(); $("range").innerHTML = ic("cal") + fmt(r[0]) + " to " + fmt(r[1]) + ic("down", "i dn");
    $("chart-title").textContent = { daily: "Sleep and self-care, day by day", weekly: "Sleep and self-care, week by week", monthly: "Sleep and self-care, month by month" }[state.v];
    $("chart-hint").textContent = state.v === "daily" ? "The bar is the night against the coach's window, the rows are self-care. Tap a day to see it." : "Average bedtime and wake-up, and how much self-care was done. Tap to see it.";
    kpis(); ins(); side(); chart(); legend();
  }
  function shell() {
    $("pt").innerHTML = '<span class="av">' + PT.name.charAt(0) + "</span><span><b>" + PT.name + "</b><small>" + PT.age + " · " + PT.sex + "</small><small>Indication: <em>" + PT.ind + "</em></small></span>";
    $("nav").innerHTML = [["grid", "Overview", 1], ["chat", "Chat with KAIRA"], "Patient record", ["user", "Shared Profile"], ["file", "Records"], ["cal", "Consultations"], ["trend", "Progress & Goals"],
      "Care triad", ["apple", "Diet Coach"], ["pulse", "Exercise Coach"], ["gauge", "Success Coach"], ["", "Baseline Assessment", 0, 1], ["", "Follow-up Assessments", 0, 1], ["", "Mind Plan", 0, 1, "coach-mind-plan.html"], ["", "Rhythm", 1, 1]]
      .map(function (x) { return typeof x === "string" ? '<div class="h">' + x.toUpperCase() + "</div>" : '<a href="' + (x[4] || "#") + '" class="' + (x[2] ? "on" : "") + " " + (x[3] ? "sub" : "") + '"' + (x[2] ? ' aria-current="page"' : "") + ">" + (x[0] ? ic(x[0]) : "") + x[1] + "</a>"; }).join("");
    var PS0 = PT.plans ? PT.plans[PT.plans.length - 1].from : MR.START, plen = Math.round((MR.TODAY - PS0) / DAY) + 1;   /* the active plan's own start */
    $("stats").innerHTML = '<div class="stat"><div class="stat-label">Age / Sex</div><div class="stat-val">' + PT.age + " · " + PT.sex.charAt(0) + '</div></div><div class="stat"><div class="stat-label">Indication</div><div class="stat-val sm">' + PT.ind + '</div></div>' +
      '<div class="stat"><div class="stat-label">Mind plan <span class="pill ok">Active</span></div><div class="stat-val sm">' + esc(P.name) + '</div></div><div class="stat"><div class="stat-label">Plan started</div><div class="stat-val sm">' + fmt(PS0, { day: "numeric", month: "short", year: "numeric" }) + ", day " + plen + '</div></div>' +
      '<div class="stat"><div class="stat-label">Sleep data</div><div class="stat-val sm">Apple Health</div></div><div class="stat"><div class="stat-label">Mood check-ins</div><div class="stat-val sm">' + P.mood.map(function (t) { return clk(MR.hm(t)); }).join(" and ") + "</div></div>";
    /* the plan in one line; the rest of it on demand */
    var bits = [hrsTxt(P.hours) + " a night", clk(WIN.bed) + " to " + clk(WIN.wake), plural(P.wd.length, "wind-down step"), P.br.map(function (b) { return b.n + ", " + b.min + " min"; }).join(", "), P.me.length ? P.me[0].s : "", plural(P.mood.length, "mood check-in")].filter(Boolean);
    $("plan").hidden = true; return;   /* the plan's chips left the page (17 Nov 2026): the plan picker in the dates says which plan */
    $("plan").innerHTML = '<span class="lab">Plan</span><b>' + esc(P.name) + "</b>" + bits.map(function (b, i) { return '<span class="pb' + (i > 1 ? " more" : "") + '">' + esc(b) + "</span>"; }).join("") + '<a class="vp" href="coach-mind-plan.html">View plan</a>';
    $("pp").innerHTML = MR.PATIENTS.map(function (p) { return '<button type="button" data-p="' + p.id + '" aria-pressed="' + (p === PT) + '">' + p.name + "</button>"; }).join("");
    $("pp-line").textContent = { sahana: "A work deadline pushes bedtime past midnight in week 2; naps, low moods and late weekends follow, then she recovers.", arjun: "A night-shift nurse with a day window. On days off he sleeps at night, which the window cannot score.", meera: "Sleeps on time, so the score looks fine, but her mood is falling and self-care is thinning." }[PT.id];
    $("rp-note").textContent = "Records start on " + fmt(MR.START) + ", when the first plan began.";
  }
  function gauge(v, size, sw) {
    var c = size / 2, rr = c - sw / 2 - 1, C = 2 * Math.PI * rr;
    return '<div class="gauge" style="width:' + size + "px;height:" + size + 'px"><svg width="' + size + '" height="' + size + '" aria-hidden="true"><circle cx="' + c + '" cy="' + c + '" r="' + rr + '" fill="none" stroke="var(--g100)" stroke-width="' + sw + '"/>' +
      '<circle class="arc" cx="' + c + '" cy="' + c + '" r="' + rr + '" fill="none" stroke="var(--mo-ring)" stroke-width="' + sw + '" stroke-linecap="round" stroke-dasharray="' + (v / 100 * C) + " " + C + '"/></svg><div class="num"><b style="color:var(--ink)">' + r0(v) + "</b></div></div>";
  }
  function kpis() {
    if (!A) { $("kpis").innerHTML = '<div class="kpi">Nothing logged in these dates.</div>'; return; }
    $("kpis").innerHTML = '<div class="kpi hero">' + gauge(A.score, 64, 5) + '<div class="meta"><div class="stat-label"><span>Average score' + tip("the average score", HELP.avg, "l w") + '</span></div><div class="hero-line">' + verdict(A.score) + "</div></div></div>" +
      '<div class="kpi days"><div class="stat-label"><span>Nights logged' + tip("nights logged", HELP.nights, "l") + '</span></div><div class="stat-val">' + A.nights + "<small>of " + A.n + '</small></div><div class="meter"><i style="width:' + (A.nights / A.n * 100) + '%;--mc:var(--g500)"></i></div></div>' +
      '<div class="kpi medal"><div class="stat-label"><span>Medal days' + tip("medal days", HELP.medal, "l") + '</span></div><div class="stat-val">' + A.medal + "<small>of " + A.nl + '</small></div><div class="meter"><i style="width:' + (A.medal / A.nl * 100) + '%;--mc:var(--g500)"></i></div></div>';
  }
  var TONE = { warn: ["Worth a conversation", "alert"], info: ["Good to know", "bulb"], ok: ["Going well", "check"] };
  function ins() {
    /* "What stands out" taken off the page (17 Nov 2026): the chart and Behind the score tell the story.
       ponytail: insights() is kept, unused, in case the cards come back */
    var el = $("ins"); el.innerHTML = ""; el.hidden = true; el._L = null; return;
    var L = insights(PD);
    if (!L.length) { el.innerHTML = ""; return; }
    var shown = state.more ? L : L.slice(0, 4);
    el.innerHTML = '<div class="ins-h"><h4>What stands out</h4><p>Patterns in how ' + PT.name + " sleeps and looks after themselves, " + fmt(range()[0]) + " to " + fmt(range()[1]) + ". Today is left out.</p></div>" +
      '<div class="ins-g">' + shown.map(function (x, i) {
        var on = state.hl === i;
        return '<article class="ins-c t-' + x.tone + (on ? " on" : "") + '"><div class="ins-t"><span class="ins-dot" aria-hidden="true"></span><span class="ins-k">' + TONE[x.tone][0] + "</span></div><h5>" + esc(x.title) + "</h5><p>" + esc(x.line) + "</p>" +
          (x.days.length ? '<button type="button" class="ins-b" data-hl="' + i + '" aria-pressed="' + on + '">' + (on ? "Clear the chart" : "Show " + plural(x.days.length, "day") + " on the chart") + "</button>" : "") + "</article>";
      }).join("") + "</div>" + (L.length > 4 ? '<button type="button" class="ins-more" id="ins-more">' + (state.more ? "Show fewer" : "Show " + (L.length - 4) + " more") + "</button>" : "");
    el._L = L;
  }
  $("ins").addEventListener("click", function (e) {
    var b = e.target.closest("[data-hl]");
    if (b) { var i = +b.dataset.hl; state.hl = state.hl === i ? null : i; if (state.hl != null && state.v !== "daily") { state.v = "daily"; state.sel = null; PIN = null; return render(); } ins(); chart(); return; }
    if (e.target.closest("#ins-more")) { state.more = !state.more; ins(); }
  });

  /* ---------- the chart: the night against the window, then the self-care rows ---------- */
  var ROWS = function () { return [["wd", "Wind-down", P.wd.length], ["br", "Breathing", P.br.length], ["me", "Me-time", P.me.length], ["mood", "Mood", P.mood.length]].filter(function (r) { return r[2]; }); };
  var PIN = null;
  function chart() {
    var el = $("chart"); if (!el) return;
    var CW = el.clientWidth || 600, narrow = CW < 640, daily = state.v === "daily";
    var pl = narrow ? 70 : 112, pr = 10, W = narrow ? Math.max(CW, pl + B.length * (daily ? 22 : 64)) : CW;
    var pt = 30, SH = narrow ? 170 : 210, rows = ROWS(), rh = 24, rg = 5, sg = 30, pb = 36;
    var H = pt + SH + sg + rows.length * (rh + rg) + pb;
    var step = (W - pl - pr) / B.length, bw = Math.min(step * .56, daily ? 14 : 40), rx = 3;
    var HL = state.hl != null && $("ins")._L ? $("ins")._L[state.hl] : null, hl = HL ? HL.days : null;
    /* the time scale: the coach's window and every sleep shown, on whole hours, inside 6 PM to 6 PM */
    var lo = WIN.bed - 60, hi = WIN.wake + 60;
    PD.forEach(function (d) { d.sleeps.forEach(function (s) { lo = Math.min(lo, s.bed - 30); hi = Math.max(hi, s.wake + 30); }); });
    lo = Math.max(1080, Math.floor(lo / 60) * 60); hi = Math.min(2520, Math.ceil(hi / 60) * 60);
    var y = function (t) { return pt + (t - lo) / (hi - lo) * SH; };
    var g = '<div class="cscroll"><svg viewBox="0 0 ' + W + " " + H + '" height="' + H + '"' + (W > CW ? ' style="width:' + W + 'px"' : "") + ' role="group" aria-label="' + $("chart-title").textContent + '">';
    g += '<defs><pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="4" height="4" fill="#C7D7FE"/><line x1="0" y1="0" x2="0" y2="4" stroke="#444CE7" stroke-width="2"/></pattern></defs>';
    /* weekends first, behind everything */
    if (daily) B.forEach(function (b, i) { if (b.days[0].x.we) g += '<rect x="' + (pl + step * i) + '" y="' + (pt - 6) + '" width="' + step + '" height="' + (H - pt - pb + 6) + '" fill="#F2F4F7" rx="4"/>'; });
    /* hour lines and the window band */
    var hs = (hi - lo) / 60 > 12 ? 180 : 120;
    for (var t = Math.ceil(lo / hs) * hs; t <= hi; t += hs) g += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y(t) + '" y2="' + y(t) + '" stroke="#EAECF0"/><text class="yl" x="' + (pl - 8) + '" y="' + (y(t) + 3.5) + '" text-anchor="end">' + clk(t).replace(":00", "") + "</text>";
    g += '<rect x="' + pl + '" y="' + y(WIN.bed) + '" width="' + (W - pl - pr) + '" height="' + (y(WIN.wake) - y(WIN.bed)) + '" fill="#EEF4FF" fill-opacity=".85"/>' +
      '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y(WIN.bed) + '" y2="' + y(WIN.bed) + '" stroke="#A4BCFD" stroke-dasharray="4 3"/><line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y(WIN.wake) + '" y2="' + y(WIN.wake) + '" stroke="#A4BCFD" stroke-dasharray="4 3"/>';
    /* row labels: the sleep, then the self-care rows */
    g += '<foreignObject x="0" y="' + (pt - 4) + '" width="' + (pl - 34) + '" height="40"><div class="rowl" xmlns="http://www.w3.org/1999/xhtml"><i class="pic" style="--ic:url(/mind/icons/moon.svg);color:#98A2B3"></i><span><b>Sleep</b></span></div></foreignObject>';
    var ry = function (k) { return pt + SH + sg + k * (rh + rg); };
    g += '<text class="cap" x="' + pl + '" y="' + (pt + SH + sg - 10) + '">SELF-CARE</text>';
    rows.forEach(function (r, k) { g += '<foreignObject x="0" y="' + ry(k) + '" width="' + (pl - 8) + '" height="' + rh + '"><div class="rowl" xmlns="http://www.w3.org/1999/xhtml"><i class="pic" style="--ic:' + CMP.filter(function (c) { return c.k === r[0]; })[0].ic + ';color:#98A2B3"></i><span><b>' + r[1] + "</b></span></div></foreignObject>"; });
    B.forEach(function (b, i) {
      var x = pl + step * i + (step - bw) / 2, cx = x + bw / 2, a = b.a, one = daily ? b.days[0] : null, dim = hl && !(one && hl.indexOf(one) >= 0);
      g += '<g class="bar' + (state.sel === i ? " sel" : "") + (dim ? " dim" : "") + (hl && !dim ? " hl" : "") + '" data-i="' + i + '" tabindex="0" role="button" aria-label="' + b.title + '"><rect class="hit" x="' + (pl + step * i) + '" y="' + (pt - 28) + '" width="' + step + '" height="' + (H - pt - pb + 40) + '" rx="8"/>';
      if (one) {
        var sl = one.x.sl;
        if (!one.x.sleep) g += '<rect x="' + (x + .75) + '" y="' + y(WIN.bed) + '" width="' + (bw - 1.5) + '" height="' + (y(WIN.wake) - y(WIN.bed)) + '" rx="' + rx + '" fill="#fff" stroke="#A4BCFD" stroke-width="1.5" stroke-dasharray="3 3"/>';
        else {
          var fill = "#444CE7";
          if (sl.night) {
            sl.night.segs.forEach(function (s) { g += '<rect x="' + x + '" y="' + y(s.bed) + '" width="' + bw + '" height="' + Math.max(2, y(s.wake) - y(s.bed)) + '" rx="' + rx + '" fill="' + fill + '"' + (sl.judged ? "" : ' fill-opacity=".55"') + "/>"; });
            for (var q = 1; q < sl.night.segs.length; q++) g += '<line x1="' + cx + '" x2="' + cx + '" y1="' + y(sl.night.segs[q - 1].wake) + '" y2="' + y(sl.night.segs[q].bed) + '" stroke="#444CE7" stroke-width="1.5"/>';
          }
          sl.naps.forEach(function (z) { g += '<rect x="' + (x + 1.5) + '" y="' + y(z.bed) + '" width="' + (bw - 3) + '" height="' + Math.max(3, y(z.wake) - y(z.bed)) + '" rx="2" fill="#A4BCFD"/>'; });
        }
        rows.forEach(function (r, k) { g += cell(r[0], one, x, ry(k), bw, rh); });
      } else if (a) {
        /* a week or month: the average night, with the earliest and latest bedtime and wake-up as thin lines */
        if (a.near) {
          g += '<line x1="' + cx + '" x2="' + cx + '" y1="' + y(a.bedMin) + '" y2="' + y(a.bedMax) + '" stroke="#8098F9" stroke-width="1.5"/><line x1="' + (cx - 5) + '" x2="' + (cx + 5) + '" y1="' + y(a.bedMin) + '" y2="' + y(a.bedMin) + '" stroke="#8098F9" stroke-width="1.5"/>' +
            '<line x1="' + cx + '" x2="' + cx + '" y1="' + y(a.wakeMin) + '" y2="' + y(a.wakeMax) + '" stroke="#8098F9" stroke-width="1.5"/><line x1="' + (cx - 5) + '" x2="' + (cx + 5) + '" y1="' + y(a.wakeMax) + '" y2="' + y(a.wakeMax) + '" stroke="#8098F9" stroke-width="1.5"/>' +
            '<rect x="' + x + '" y="' + y(a.bed) + '" width="' + bw + '" height="' + (y(a.wake) - y(a.bed)) + '" rx="' + rx + '" fill="#444CE7"/>';
          if (a.naps) g += '<g><rect x="' + (cx - 17) + '" y="' + (y(a.wake) + 8) + '" width="34" height="16" rx="8" fill="#E0EAFF"/><text x="' + cx + '" y="' + (y(a.wake) + 19.5) + '" text-anchor="middle" class="pc">' + a.naps + " nap" + (a.naps > 1 ? "s" : "") + "</text></g>";
        }
        rows.forEach(function (r, k) { g += cellAgg(r[0], b, a, x, ry(k), bw, rh); });
      }
      var sc = one ? (one.x.logged ? one.x.score : null) : a ? a.score : null;
      if (sc != null) g += '<text x="' + cx + '" y="' + (pt - 10) + '" text-anchor="middle" class="sn' + (one && one.today ? " so" : "") + '">' + r0(sc) + "</text>";
      if (i % Math.max(1, Math.ceil(24 / step)) === 0 || !daily) g += '<text class="xl' + (b.bold ? " b" : "") + '" x="' + cx + '" y="' + (H - pb + 16) + '" text-anchor="middle">' + b.label + "</text>" + (narrow && !daily ? "" : '<text class="yl" x="' + cx + '" y="' + (H - pb + 29) + '" text-anchor="middle">' + b.sub + "</text>");
      g += "</g>";
    });
    var was = el.querySelector(".cscroll"), keep = was && was.scrollWidth === W ? was.scrollLeft : null;
    el.innerHTML = g + '</svg></div><div class="tip" id="tip"></div>';
    var sc2 = el.querySelector(".cscroll"); sc2.scrollLeft = keep == null ? W : keep;
    var tp = $("tip");
    [].forEach.call(el.querySelectorAll(".bar"), function (n) {
      var i = +n.dataset.i, show = function () { tp.innerHTML = tipHtml(B[i]); var bx = n.getBBox(), w = Math.min(260, CW - 16), left = bx.x + bx.width / 2 + 14 + w > W ? bx.x + bx.width / 2 - w - 14 : bx.x + bx.width / 2 + 14; tp.style.width = w + "px"; tp.style.left = Math.max(0, Math.min(left - sc2.scrollLeft, CW - w)) + "px"; tp.style.top = "8px"; tp.classList.add("on"); };
      n.onmouseenter = show; n.onfocus = show;
      n.onmouseleave = n.onblur = function () { if (PIN == null) tp.classList.remove("on"); else if (PIN !== i) { var p = el.querySelector('.bar[data-i="' + PIN + '"]'); p && p.dispatchEvent(new Event("mouseenter")); } };
      n.onclick = function () { select(i); };
      n.onkeydown = function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(i); } if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); var m = el.querySelector('.bar[data-i="' + (i + (e.key === "ArrowRight" ? 1 : -1)) + '"]'); m && m.focus(); } };
    });
    if (PIN != null) { var p = el.querySelector('.bar[data-i="' + PIN + '"]'); p && p.dispatchEvent(new Event("mouseenter")); }
  }
  /* one self-care cell for a day: filled by how much was done, dashed when planned and not done, pale when not due yet */
  /* GoodFlip colours by meaning (17 Nov 2026): sleep rows stay in indigo, self-care takes the tertiary accents,
     teal for breathing, flipgreen for me-time; f is the done fill, l the outline of an open or part-done cell */
  var C = { wd: { f: "#8098F0", l: "#C7D7FE" }, br: { f: "#2DA6A6", l: "#A4FDFD" }, me: { f: "#299D6B", l: "#ABE6CC" }, mood: { f: "#CDA935", l: "#FDE8A4" } };
  function cell(k, d, x, y0, bw, rh) {
    var f, rx = 3, pend = false;
    if (k === "wd") { f = d.x.wdN / P.wd.length; pend = d.today && !f; }
    if (k === "br") { f = Math.min(1, d.x.brMin / d.x.brPlan); }
    if (k === "me") { f = d.me ? 1 : 0; pend = d.today && !f; }
    if (k === "mood") {
      var v = d.mood.filter(function (m) { return m != null; }), miss = d.mood.length - v.length, lowest = v.length ? Math.min.apply(null, v) : null;
      if (lowest == null) return d.today ? pale() : dash();
      return '<rect x="' + (x - 3) + '" y="' + y0 + '" width="' + (bw + 6) + '" height="' + rh + '" rx="6" fill="' + (lowest <= 1 ? "#FEF3F2" : "#fff") + '" stroke="' + (lowest <= 1 ? "#FECDCA" : "#EAECF0") + '"' + (miss && !d.today ? ' stroke-dasharray="3 2"' : "") + '/><text x="' + (x + bw / 2) + '" y="' + (y0 + rh / 2 + 4.5) + '" text-anchor="middle" style="font-size:' + Math.min(13, bw + 1) + 'px">' + FACE[lowest] + "</text>";
    }
    function dash() { return '<rect x="' + (x + .75) + '" y="' + (y0 + .75) + '" width="' + (bw - 1.5) + '" height="' + (rh - 1.5) + '" rx="' + rx + '" fill="#fff" stroke="' + C[k].l + '" stroke-width="1.5" stroke-dasharray="3 3"/>'; }
    function pale() { return '<rect x="' + x + '" y="' + y0 + '" width="' + bw + '" height="' + rh + '" rx="' + rx + '" fill="#F2F4F7"/>'; }
    if (pend) return pale();
    if (!f) return dash();
    if (f >= 1) return '<rect x="' + x + '" y="' + y0 + '" width="' + bw + '" height="' + rh + '" rx="' + rx + '" fill="' + C[k].f + '"/>';
    var id = "c" + k + Math.round(x);
    return '<rect x="' + (x + .75) + '" y="' + (y0 + .75) + '" width="' + (bw - 1.5) + '" height="' + (rh - 1.5) + '" rx="' + rx + '" fill="#fff" stroke="' + C[k].l + '" stroke-width="1.5"/><clipPath id="' + id + '"><rect x="' + x + '" y="' + y0 + '" width="' + bw + '" height="' + rh + '" rx="' + rx + '"/></clipPath><rect clip-path="url(#' + id + ')" x="' + x + '" y="' + (y0 + rh * (1 - f)) + '" width="' + bw + '" height="' + rh * f + '" fill="' + C[k].f + '"/>';
  }
  /* a week or month: the share done, with the number on a small pill; mood shows its lows */
  function cellAgg(k, b, a, x, y0, bw, rh) {
    var L = closed(b.days); if (!L.length) return "";
    var f = k === "wd" ? a.wd / P.wd.length : k === "br" ? a.brDays / L.length : k === "me" ? a.me / L.length : a.moodN / a.moodSlots, id = "a" + k + Math.round(x), cx = x + bw / 2;
    var lows = a.faces[0] + a.faces[1], txt = k === "mood" && lows ? lows + " low" : r0(f * 100) + "%";
    return '<rect x="' + (x + .75) + '" y="' + (y0 + .75) + '" width="' + (bw - 1.5) + '" height="' + (rh - 1.5) + '" rx="3" fill="' + (k === "mood" && lows ? "#FEF3F2" : "#fff") + '" stroke="' + (k === "mood" && lows ? "#FECDCA" : C[k].l) + '" stroke-width="1.5"/>' +
      (k === "mood" && lows ? "" : '<clipPath id="' + id + '"><rect x="' + x + '" y="' + y0 + '" width="' + bw + '" height="' + rh + '" rx="3"/></clipPath><rect clip-path="url(#' + id + ')" x="' + x + '" y="' + (y0 + rh * (1 - f)) + '" width="' + bw + '" height="' + rh * f + '" fill="' + C[k].f + '"/>') +
      (bw >= 30 ? '<rect x="' + (cx - 17) + '" y="' + (y0 + rh / 2 - 7) + '" width="34" height="14" rx="7" fill="#fff" fill-opacity=".92"/><text x="' + cx + '" y="' + (y0 + rh / 2 + 3.5) + '" text-anchor="middle" class="pc' + (k === "mood" && lows ? " pk" : "") + '">' + txt + "</text>" : "");
  }
  function select(i) {
    PIN = PIN === i ? null : i; state.sel = PIN; side();
    var t = $("tip"); if (PIN == null) t.classList.remove("on"); else { var n = document.querySelector('.bar[data-i="' + i + '"]'); n && n.dispatchEvent(new Event("mouseenter")); }
    [].forEach.call(document.querySelectorAll(".bar"), function (n) { n.classList.toggle("sel", +n.dataset.i === PIN); });
  }

  /* ---------- the tooltip: the night and the day's self-care in plain words ---------- */
  var row = function (l, v, on) { return '<div class="tr"><span>' + l + "</span><b" + (on === false ? ' class="no"' : "") + ">" + v + "</b></div>"; };
  function srcLine(d) { return { health: "From Apple Health", manual: "Typed in by hand", edited: "From Apple Health, times edited by hand" }[d.src] || ""; }
  function nightLines(d, coachTone) {
    var sl = d.x.sl; if (!d.x.sleep) return row("Sleep", "No sleep logged", false);
    var o = "";
    if (sl.judged) { o += row("Slept", clk(sl.night.bed) + ", " + off(sl.db, P.tol), Math.abs(sl.db) <= P.tol); o += row("Woke up", clk(sl.night.wake) + ", " + off(sl.dw, P.tol), Math.abs(sl.dw) <= P.tol); }
    else o += row("Longest sleep", dur(sl.night.asleep) + ", under 3 h", false);
    var awake = sl.night.wake - sl.night.bed - sl.night.asleep;
    o += row("Asleep", dur(sl.night.asleep) + (sl.naps.length ? " + " + sl.naps.map(function (z) { return gap(z.asleep) + " nap"; }).join(" + ") : "") + (awake > 0 ? ", " + gap(awake) + " awake" : ""), sl.slept >= P.hours - .25);
    return o;
  }
  function tipHtml(b) {
    var a = b.a, one = b.days.length === 1 ? b.days[0] : null;
    var head = '<div class="t1"><span>' + b.title + (one && one.today ? ", so far" : "") + "</span>" + (one ? (one.x.logged && !one.today ? verdict(one.x.score) : "") : a ? verdict(a.score) : "") + "</div>";
    if (one) {
      if (!one.x.logged) return head + '<div class="lost">Nothing logged this day, so it is left out of the average.</div>';
      var d = one, o = head + '<div class="sc">' + d.x.score + "<small> of 100" + (d.today ? ", the evening still to come" : "") + "</small></div>";
      o += '<div class="tg">Sleep</div>' + nightLines(d);   /* where the sleep came from is left out (17 Nov 2026) */
      o += '<div class="tg">Self-care</div>';
      if (P.wd.length) o += row("Wind-down", d.x.wdN + " of " + P.wd.length + (d.x.wdN && d.x.wdN < P.wd.length ? ": " + P.wd.filter(function (_, t) { return d.wd[t]; }).map(function (w) { return w.s.toLowerCase(); }).join(", ") : ""), d.x.wdN === P.wd.length);
      if (P.br.length) o += row("Breathing", d.x.brMin ? (d.x.brMin >= d.x.brPlan ? "Done, " + d.x.brPlan + " min" : (d.x.brMin < 1 ? "Under 1 min" : d.x.brMin.toFixed(1).replace(".0", "") + " of " + d.x.brPlan + " min")) : "Not done", d.x.brMin >= d.x.brPlan);
      if (P.me.length) o += row("Me-time", d.me ? "Done" : "Not done", !!d.me);
      o += row("Mood", d.mood.map(function (v, k) { return clk(MR.hm(P.mood[k])).replace(":00", "") + " " + (v == null ? (d.today && k ? "not yet" : "missed") : FACE[v] + " " + FACEN[v]); }).join("<br>"), d.mood.every(function (v) { return v != null; }));
      return o;
    }
    if (!a) return head + '<div class="lost">Nothing logged.</div>';
    var o2 = head + '<div class="sc">' + r0(a.score) + "<small> of 100, average of " + plural(a.nl, "day") + "</small></div>" + '<div class="tg">Sleep</div>';
    if (a.far) o2 += row("Far from the window", plural(a.far, "sleep"), false);
    if (a.near) { o2 += row("Bedtime", "About " + clk5(a.bed) + "<small>" + clk(a.bedMin) + " to " + clk(a.bedMax) + "</small>"); o2 += row("Wake-up", "About " + clk5(a.wake) + "<small>" + clk(a.wakeMin) + " to " + clk(a.wakeMax) + "</small>"); }
    o2 += row("Asleep, a day", a.slept != null ? dur(a.slept * 60) : "None logged", a.slept >= P.hours - .25);
    o2 += row("Both on time", a.onBoth + " of " + a.judged + " nights") + (a.naps ? row("Naps", a.naps + ", " + gap5(a.napMin) + " on average") : "") + (a.nights < a.nl ? row("No sleep data", plural(a.nl - a.nights, "day"), false) : "");
    o2 += '<div class="tg">Self-care</div>' + (P.wd.length ? row("Wind-down", a.wd.toFixed(1) + " of " + P.wd.length + " a day") : "") + (P.br.length ? row("Breathing", a.brDays + " of " + a.nl + " days") : "") + (P.me.length ? row("Me-time", a.me + " of " + a.nl + " days") : "") +
      row("Mood", a.faces.map(function (c, v) { return c ? FACE[v] + " " + c : ""; }).filter(Boolean).reverse().join("  ") || "No check-ins");
    return o2;
  }

  /* ---------- side panel: behind the score ---------- */
  function prow(k, val, foot, frac) {
    var c = CMP.filter(function (x) { return x.k === k; })[0];
    return '<div class="prow">' + ctile(k) + '<div class="pm"><span class="n">' + c.name + '<span class="g">' + val + '</span></span><div class="meter" style="--mc:' + c.col + '"><i style="width:' + Math.min(1, frac) * 100 + '%"></i></div>' + (foot ? '<span class="prow-f">' + foot + "</span>" : "") + "</div></div>";
  }
  var pts = function (a, k) { return "<b>" + r0(a.pts[k]) + "</b> / " + r0(Wt[k]) + " pts"; };
  function parts(a, one) {
    var sq = ["hours", "window", "wd"].filter(function (k) { return k in Wt; }), cq = ["br", "me", "mood"].filter(function (k) { return k in Wt; });
    var gp = function (L) { return r0(L.reduce(function (t, k) { return t + a.pts[k]; }, 0)); };
    var o = '<div class="grp"><h5>Sleep quality<span class="gs"><b>' + gp(sq) + "</b> / 70 pts</span></h5>";
    o += prow("hours", pts(a, "hours"), one ? (one.x.sleep ? dur(one.x.sl.slept * 60) + " asleep against " + hrsTxt(P.hours) : "No sleep logged") : (a.slept != null ? dur(a.slept * 60) + " a night against " + hrsTxt(P.hours) + ". Target met on <b>" + a.met + " of " + a.nights + "</b> nights" + (a.naps ? ", " + plural(a.naps, "nap") : "") : "No sleep logged"), a.pts.hours / Wt.hours);
    o += prow("window", pts(a, "window"), one ? (one.x.sleep ? (one.x.sl.judged ? "Bed " + clk(one.x.sl.night.bed) + ", " + off(one.x.sl.db, P.tol) + ". Up " + clk(one.x.sl.night.wake) + ", " + off(one.x.sl.dw, P.tol) : "Too short a night to judge") : "No sleep logged") : (a.near ? "Bed about " + clk5(a.bed) + ", up about " + clk5(a.wake) + ". Both on time on <b>" + a.onBoth + " of " + a.judged + "</b> nights" + (a.far ? ". " + plural(a.far, "sleep") + " far from the window, left out of these times" : "") : "No nights to judge"), a.pts.window / Wt.window);
    if ("wd" in Wt) o += prow("wd", pts(a, "wd"), (one ? '<span class="tl">' + P.wd.map(function (w, t) { return '<span class="ti' + (one.wd[t] ? " on" : "") + '"><i aria-label="' + (one.wd[t] ? "Done" : "Not done") + '"></i>' + esc(w.t) + "</span>"; }).join("") + "</span>"
      : P.wd.map(function (w, t) { return w.s + " <b>" + a.wdTask[t] + "</b>"; }).join(" · ") + " of " + a.nl + " days"), a.pts.wd / Wt.wd);
    o += '</div><div class="grp"><h5>Self-care<span class="gs"><b>' + gp(cq) + "</b> / 30 pts</span></h5>";
    if ("br" in Wt) o += prow("br", pts(a, "br"), one ? (one.x.brMin ? (one.x.brMin >= one.x.brPlan ? "Done, " : one.x.brMin.toFixed(1).replace(".0", "") + " of ") + one.x.brPlan + " min of " + P.br[0].n : "Not done") : "Done on <b>" + a.brDays + " of " + a.nl + "</b> days" + (a.brMin ? ", " + a.brMin.toFixed(1).replace(".0", "") + " of " + P.br[0].min + " min a session" : ""), a.pts.br / Wt.br);
    if ("me" in Wt) o += prow("me", pts(a, "me"), one ? '<span class="tl"><span class="ti' + (one.me ? " on" : "") + '"><i aria-label="' + (one.me ? "Done" : "Not done") + '"></i>' + esc(P.me[0].t) + "</span></span>" : P.me[0].s + " on <b>" + a.me + " of " + a.nl + "</b> days", a.pts.me / Wt.me);
    o += prow("mood", pts(a, "mood"), one ? one.mood.map(function (v, k) { return clk(MR.hm(P.mood[k])) + ": " + (v == null ? (one.today && k ? "not yet" : "missed") : FACE[v] + " " + FACEN[v]); }).join("<br>")
      : "Checked in <b>" + a.moodN + " of " + a.moodSlots + '</b> times. The faces they picked:<span class="faces">' + a.faces.map(function (c, v) { return c ? '<span title="' + FACEN[v] + '">' + FACE[v] + " " + c + "</span>" : ""; }).reverse().join("") + "</span>", a.pts.mood / Wt.mood);
    return o + "</div>";
  }
  function side() {
    var el = $("side"), b = state.sel != null ? B[state.sel] : null;
    if (!A) { el.innerHTML = ""; return; }
    /* no day picked: no panel, the chart takes the width (17 Nov 2026: the period average left the page; a tapped day or week shows what was done) */
    var wrap = el.closest(".ns-in");
    if (wrap && wrap.classList.contains("noside") === !!b) { wrap.classList.toggle("noside", !b); requestAnimationFrame(function () { chart(); $("tip").classList.remove("on"); }); }   /* the chart's width changed: draw it again at the new width */
    if (!b) { el.innerHTML = ""; return; }
    var a = b.a, one = b.days.length === 1 ? b.days[0] : null;
    var head = '<div class="side-h"><div><h4>' + b.title + "</h4><p>" + (one ? (one.today ? "Today so far" : "Single day") : a ? "Average of " + plural(a.nl, "day") : "Nothing logged") + '</p></div><button class="back" id="back" aria-label="Close this day">Close</button></div>';
    if (one && one.x.logged) {
      var fake = { pts: one.x.pts, faces: [0, 0, 0, 0, 0] }; one.mood.forEach(function (v) { if (v != null) fake.faces[v]++; });
      var diff = one.x.score - r0(A.score);
      el.innerHTML = head + '<div class="day-score">' + gauge(one.x.score, 56, 5) + '<div style="flex:1">' + (one.today ? '<span class="pill solid">So far</span>' : verdict(one.x.score)) + '<small style="margin-top:5px">' + (diff >= 0 ? "+" : "") + diff + " vs period average</small></div></div>" + "" + parts(fake, one);
    } else if (a) { var d2 = r0(a.score - A.score); el.innerHTML = head + '<div class="day-score">' + gauge(a.score, 56, 5) + '<div style="flex:1">' + verdict(a.score) + '<small style="margin-top:5px">' + (d2 >= 0 ? "+" : "") + d2 + " vs period average</small></div></div>" + parts(a); }
    else el.innerHTML = head + '<div class="empty">' + ic("clock") + "<div>Nothing was logged this day.<br>It is left out of the average.</div></div>";
    $("back").onclick = function () { select(state.sel); };
  }
  function legend() {
    var sw = function (st) { return '<i style="width:12px;height:12px;border-radius:3px;' + st + '"></i>'; };
    $("legend").innerHTML = '<span class="plain">' + sw("background:#EEF4FF;border:1px dashed #A4BCFD") + "Coach's window</span>" + '<span class="plain">' + sw("background:#444CE7") + "Asleep</span>" + '<span class="plain">' + sw("background:#A4BCFD") + "Nap</span>" +
      (state.v === "daily" ? '<span class="plain">' + sw("background:#fff;border:1.5px dashed #A4BCFD") + 'Not logged or not done</span><span class="plain">' + sw("background:#F2F4F7") + 'Weekend</span>' : '<span class="plain"><i style="width:2px;height:12px;background:#8098F9"></i>Earliest to latest</span>');
  }

  /* ---------- date range (as Momentum) ---------- */
  var iso = function (d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); };
  var parse = function (v) { var p = v.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  var PRE = [["Last 7 days", function () { return [addD(MR.TODAY, -6), MR.TODAY]; }], ["Last 14 days", function () { return [addD(MR.TODAY, -13), MR.TODAY]; }], ["All plans", function () { return [MR.START, MR.TODAY]; }]];
  var rp = $("rp"), rbtn = $("range"), rf = $("rp-from"), rt = $("rp-to");
  [rf, rt].forEach(function (x) { x.min = iso(MR.START); x.max = iso(MR.TODAY); });
  function setRange(f, t) { state.from = f; state.to = t; state.sel = null; PIN = null; state.hl = null; closeRp(); render(); }
  function plansHtml(r) {
    var L = PT.plans || [{ name: P.name, from: MR.START, to: MR.TODAY }];
    return '<div class="rp-pl"><span class="rp-lab">Plans</span>' + L.map(function (p, i) {
      var n = Math.round((p.to - p.from) / 864e5) + 1, on = iso(p.from) === iso(r[0]) && iso(p.to) === iso(r[1]);
      return '<button type="button" data-pl="' + i + '" aria-pressed="' + on + '"><b>' + esc(p.name) + "</b><small>" + fmt(p.from) + " to " + fmt(p.to) + " · " + n + " days" + (p.to >= MR.TODAY ? " · Active" : "") + "</small></button>";
    }).join("") + "</div>";
  }
  function openRp() { var r = range(); rf.value = iso(r[0]); rt.value = iso(r[1]); checkRp(); $("rp-pls").innerHTML = plansHtml(r); $("rp-pre").innerHTML = PRE.map(function (p, i) { var x = p[1](); return '<button type="button" data-i="' + i + '" aria-pressed="' + (iso(x[0]) === iso(r[0]) && iso(x[1]) === iso(r[1])) + '">' + p[0] + "</button>"; }).join(""); rp.hidden = false; rbtn.setAttribute("aria-expanded", "true"); }
  function closeRp() { rp.hidden = true; rbtn.setAttribute("aria-expanded", "false"); }
  function checkRp() { var e = !rf.value || !rt.value ? "Pick both dates." : parse(rf.value) > parse(rt.value) ? "The start date is after the end date." : parse(rf.value) < MR.START || parse(rt.value) > MR.TODAY ? "Pick dates between " + fmt(MR.START) + " and " + fmt(MR.TODAY) + "." : ""; $("rp-err").textContent = e; $("rp-apply").disabled = !!e; }
  rbtn.onclick = function () { rp.hidden ? openRp() : closeRp(); };
  rf.oninput = rt.oninput = checkRp;
  $("rp-pls").onclick = function (e) { var b = e.target.closest("[data-pl]"); if (!b) return; var p = (PT.plans || [{ from: MR.START, to: MR.TODAY }])[b.dataset.pl]; setRange(p.from, p.to); };
  $("rp-pre").onclick = function (e) { var b = e.target.closest("button"); if (b) setRange.apply(null, PRE[b.dataset.i][1]()); };
  $("rp-apply").onclick = function () { setRange(parse(rf.value), parse(rt.value)); };
  $("rp-cancel").onclick = function () { closeRp(); rbtn.focus(); };
  addEventListener("click", function (e) { if (!rp.hidden && !e.target.closest(".rp")) closeRp(); });

  /* ---------- wiring ---------- */
  $("help-score").innerHTML = tip("how Rhythm works", HELP.score, "l w");
  $("help-chart").innerHTML = tip("reading the chart", HELP.chart, "l w");
  [].forEach.call(document.querySelectorAll("#views button"), function (b) { b.onclick = function () { state.v = b.dataset.v; state.sel = null; PIN = null; state.hl = null; render(); }; });
  $("pp").onclick = function (e) { var b = e.target.closest("[data-p]"); if (!b) return; load(b.dataset.p); history.replaceState(null, "", "?p=" + b.dataset.p + (state.v !== "daily" ? "&view=" + state.v : "")); shell(); render(); };
  addEventListener("keydown", function (e) { if (e.key !== "Escape") return; if (!rp.hidden) { closeRp(); rbtn.focus(); } else if (PIN != null) select(PIN); });
  var rz; addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(chart, 150); });
  (function () { var tog = function (o) { document.body.classList.toggle("nav-open", o); $("menu").setAttribute("aria-expanded", o); }; $("menu").onclick = function () { tog(!document.body.classList.contains("nav-open")); }; $("nav-scrim").onclick = function () { tog(false); }; })();
  state.v = Q.get("view") || "daily";
  load(Q.get("p") || "sahana"); shell(); render();
  if (Q.get("day")) { var di = B.findIndex(function (b) { return iso(b.days[0].date) === Q.get("day"); }); if (di >= 0) select(di); }
})();
