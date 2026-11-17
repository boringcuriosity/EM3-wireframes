/* Sample patients for the coach's Rhythm overview (v7/coach-mind-rhythm.html). Each day holds only what the app records:
   the sleep sessions that ended in its span (6 PM the evening before to 6 PM that day, in minutes from 00:00 the day
   before, as mind/sleep-rule.js reads them) with where they came from, each wind-down task ticked or not, the seconds
   breathed in each planned exercise, me-time done or not, and the face picked at each mood check-in (0 Awful to 4 Great,
   null when the check-in was missed). Nothing is scored here: the page scores it with the app's own rule.
   Three stories, 29 days each (20 Oct to 17 Nov 2026, today):
     Sahana  a work deadline in week 2 pushes bedtime past midnight, short nights she makes up with afternoon naps, low
             moods after the shortest nights, weekends that start late; she recovers from 3 Nov
     Arjun   a night-shift nurse with a day sleep window (9:00 AM to 4:30 PM); on his days off he sleeps at night, so the
             window cannot score those days, though he sleeps enough
     Meera   sleeps on time every night, so her score looks fine, but her mood falls week by week, evening check-ins
             thin out and her breathing sessions stop after about a minute
   ponytail: a seeded generator, so the stories read the same on every load; real data comes from the API per day */
(function () {
  var START = new Date(2026, 9, 20), TODAY = new Date(2026, 10, 17), DAY = 864e5;
  var N = Math.round((TODAY - START) / DAY) + 1;
  function seeded(s) { return function () { s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var hm = function (t) { var p = t.split(":"); return +p[0] * 60 + +p[1]; };
  /* a night as the app holds it: bed and wake in span minutes, with a short time awake inside it now and then */
  function night(bed, wake, r, brk) {
    bed = Math.round(bed); wake = Math.round(wake);
    if (brk && wake - bed > 240) { var at = bed + Math.round((wake - bed) * (.45 + r() * .2)), len = 15 + Math.round(r() * 25); return [{ bed: bed, wake: at }, { bed: at + len, wake: wake }]; }
    return [{ bed: bed, wake: wake }];
  }
  var j = function (r, n) { return (r() - .5) * 2 * n; };   /* jitter, plus or minus n minutes */
  var pick = function (r, p) { return r() < p ? 1 : 0; };

  /* ---------- Sahana: deadline drift, naps, weekend lie-ins, recovery ---------- */
  function sahana() {
    var r = seeded(31), days = [];
    for (var i = 0; i < N; i++) {
      var date = new Date(START.getTime() + i * DAY), dow = date.getDay(), we = dow === 0 || dow === 6, w = Math.floor(i / 7), today = i === N - 1;
      var d = { date: date, src: "health", sleeps: [], wd: [0, 0, 0], br: [0], me: 0, mood: [null, null] };
      var bed, wake, slept;
      if (w === 0) { bed = 1355 + j(r, 15) + 10; wake = 1805 + j(r, 10); }
      else if (w === 1) { bed = 1410 + (i - 7) * 9 + j(r, 15); wake = 1800 + j(r, 6); }   /* the deadline: later each night, up at 6 for work */
      else if (w === 2) { bed = 1385 + j(r, 12); wake = 1805 + j(r, 8); }
      else { bed = 1360 + j(r, 12); wake = 1802 + j(r, 8); }
      if (we) { bed = 1435 + j(r, 15); wake = 1925 + j(r, 20); }   /* weekends: past midnight, up around 8 */
      d.sleeps = night(bed, wake, r, r() < .35);
      /* naps after the short nights of the deadline week */
      if (w === 1 && !we && wake - bed < 380 && r() < .8) { var nb = 2280 + j(r, 25); d.sleeps.push({ bed: nb, wake: nb + 40 + Math.round(r() * 30) }); }
      /* 31 Oct, a red-eye flight: 2h 40m on the plane, a long nap after landing, so the window cannot be judged */
      if (i === 11) d.sleeps = [{ bed: 1530, wake: 1690 }, { bed: 2200, wake: 2350 }];
      /* 5 and 6 Nov: the watch was charging overnight, nothing synced; the rest of the day was logged */
      if (i === 16 || i === 17) { d.sleeps = []; d.src = null; }
      /* 13 Nov she typed the night in herself, round times; 15 Nov she moved the Health bedtime by hand */
      if (i === 24) { d.sleeps = [{ bed: 1380, wake: 1800 }]; d.src = "manual"; }
      if (i === 26) d.src = "edited";
      /* wind-down: caffeine cut-off, screen-free hour, the room. The screen-free hour is the one that slips */
      var sf = w === 1 ? .1 : w === 0 ? .55 : w === 2 ? .45 : .7;
      d.wd = [pick(r, w === 1 ? .6 : .9), pick(r, we ? sf * .4 : sf), pick(r, w === 1 ? .4 : .8)];
      /* breathing, 5 min at 7 AM: skipped or cut short in the deadline week */
      var bp = w === 1 ? .5 : .92, done = r() < bp;
      d.br = [done ? (w === 1 && r() < .5 ? 90 + Math.round(r() * 60) : 300) : 0];
      d.me = pick(r, w === 1 ? .25 : we ? .9 : .7);
      /* mood: the face follows the night; short nights bring lows. The evening check-in slips in the deadline week */
      var hrs = (wake - bed) / 60, base = hrs < 5.5 ? 1 : hrs < 6.5 ? 2 : 3;
      if (i === 11) base = 0;
      var face = function () { return Math.max(0, Math.min(4, base + (r() < .3 ? 1 : 0) - (r() < .15 ? 1 : 0))); };
      d.mood = [r() < .95 ? face() : null, r() < (w === 1 ? .5 : .9) ? face() : null];
      if (i === 9) { d.sleeps = [{ bed: 1510, wake: 1800 }, { bed: 2275, wake: 2345 }]; d.mood = [0, 1]; }   /* 29 Oct: to bed at 1:10 AM, 4h 50m asleep, Awful then Low */
      if (today) { d.wd = [0, 0, 0]; d.me = 0; d.mood[1] = null; d.today = true; }   /* the evening has not happened yet */
      days.push(d);
    }
    return {
      id: "sahana", name: "Sahana", age: 31, sex: "Female", ind: "Others",
      plan: {
        name: "Sleep reset, November", hours: 7.5, short: 3, exOn: true, grace: 1, exPen: 20, bed: "22:30", wake: "06:00", tol: 30, zero: 120,
        wd: [{ t: "Last caffeine (tea, coffee or cola)", s: "Caffeine cut-off", at: "16:00" }, { t: "Screen-free wind-down begins (60 min)", s: "Screen-free hour", at: "21:30" },
          { t: "Positive sleep association: prepare the room, dark and at a comfortable temperature", s: "Room ready", at: "22:00" }],
        br: [{ n: "Simple Breathing", min: 5, at: "07:00" }], me: [{ t: "Walk in nature or a park (20 to 30 min)", s: "Walk in nature", at: "07:00" }], mood: ["08:00", "21:00"]
      },
      days: days
    };
  }

  /* ---------- Arjun: night shift, a day window, nights on his days off ---------- */
  function arjun() {
    var r = seeded(77), days = [];
    for (var i = 0; i < N; i++) {
      var date = new Date(START.getTime() + i * DAY), dow = date.getDay(), today = i === N - 1;
      /* four shifts, three days off: off on Thursday, Friday and Saturday this roster */
      var off = dow === 4 || dow === 5 || dow === 6, firstOff = dow === 4;
      var d = { date: date, src: "health", sleeps: [], wd: [0, 0], br: [0], me: 0, mood: [null], shift: !off };
      if (!off) {
        var b = 1990 + j(r, 20), wk = 2420 + j(r, 25);   /* home from the night shift, asleep by about 9:15 AM, up near 4:30 PM */
        d.sleeps = r() < .4 ? [{ bed: b, wake: b + 170 }, { bed: b + 230 + Math.round(r() * 30), wake: wk }] : night(b, wk, r, false);
      } else if (firstOff) {
        /* coming off the last shift: a short morning sleep, then bed early at night */
        d.sleeps = [{ bed: 2000 + j(r, 15), wake: 2200 + j(r, 20) }];
      } else {
        d.sleeps = night(1380 + j(r, 25), 1860 + j(r, 25), r, r() < .3);   /* days off: 11 PM to 7 AM, like his family */
      }
      if (i === 22) { d.sleeps = []; d.src = null; }
      d.wd = [pick(r, off ? .3 : .85), pick(r, off ? .2 : .75)];   /* blackout curtains and phone on silent, before the day sleep */
      d.br = [r() < .7 ? 300 : r() < .5 ? 120 : 0];
      d.me = pick(r, off ? .85 : .35);
      d.mood = [r() < .85 ? Math.max(0, Math.min(4, (off ? 3 : 2) + (r() < .3 ? 1 : 0) - (r() < .2 ? 1 : 0))) : null];
      if (today) { d.me = 0; d.today = true; }
      days.push(d);
    }
    return {
      id: "arjun", name: "Arjun", age: 38, sex: "Male", ind: "Others",
      plan: {
        name: "Night-shift sleep", hours: 7, short: 3, exOn: true, grace: 1, exPen: 20, bed: "09:00", wake: "16:30", tol: 30, zero: 120,
        wd: [{ t: "Blackout curtains drawn and the room cool", s: "Room dark", at: "08:30" }, { t: "Phone on silent and out of reach", s: "Phone away", at: "08:45" }],
        br: [{ n: "Box Breathing (4-4-4-4)", min: 5, at: "08:30" }], me: [{ t: "Social connection: call a friend or family (15 to 30 min)", s: "Call family", at: "18:00" }], mood: ["18:00"]
      },
      days: days
    };
  }

  /* ---------- Meera: on time every night, mood falling, self-care thinning ---------- */
  function meera() {
    var r = seeded(5), days = [];
    for (var i = 0; i < N; i++) {
      var date = new Date(START.getTime() + i * DAY), dow = date.getDay(), w = Math.floor(i / 7), today = i === N - 1;
      var d = { date: date, src: "health", sleeps: [], wd: [0, 0], br: [0], me: 0, mood: [null, null] };
      d.sleeps = night(1345 + j(r, 15), 1800 + j(r, 12), r, r() < .5 + w * .1);   /* on time, but waking more in the night as the weeks go */
      d.wd = [pick(r, .9), pick(r, .85)];
      /* breathing ticks off, but sessions end after a minute or two, shorter each week */
      d.br = [r() < .85 ? Math.max(60, Math.round(150 - w * 25 + j(r, 30))) : 0];
      d.me = pick(r, w === 0 ? .6 : w === 1 ? .3 : .1);
      /* mood: Good at the start, sliding to Low; Sundays and Mondays lowest. The evening check-in fades */
      var base = [3, 3, 2, 2, 1][w] - (dow === 0 || dow === 1 ? 1 : 0);
      var face = function () { return Math.max(0, Math.min(4, base + (r() < .25 ? 1 : 0) - (r() < .15 ? 1 : 0))); };
      d.mood = [r() < .95 ? face() : null, r() < [.95, .8, .55, .35, .3][w] ? face() : null];
      if (today) { d.wd = [0, 0]; d.me = 0; d.mood[1] = null; d.today = true; }
      days.push(d);
    }
    return {
      id: "meera", name: "Meera", age: 45, sex: "Female", ind: "Others",
      plan: {
        name: "Calmer days", hours: 8, short: 3, exOn: true, grace: 1, exPen: 20, bed: "22:15", wake: "06:00", tol: 30, zero: 120,
        wd: [{ t: "Journalling or thought dump (5 to 10 min)", s: "Journalling", at: "21:00" }, { t: "Screen-free wind-down begins (60 min)", s: "Screen-free hour", at: "21:15" }],
        br: [{ n: "Belly Breathing", min: 5, at: "07:00" }], me: [{ t: "Gentle yoga or stretching (15 to 20 min)", s: "Gentle yoga", at: "07:00" }], mood: ["08:00", "21:00"]
      },
      days: days
    };
  }

  /* each patient's Mind plans over the period, oldest first: the date picker lists them, picking one shows only its days.
     ponytail: both plans share the targets above; a real past plan brings its own targets from the API */
  var PS = [sahana(), arjun(), meera()], CUT = new Date(2026, 10, 3), END1 = new Date(2026, 10, 2);
  var FIRST = { sahana: "Rhythm starter, October", arjun: "Night-shift starter", meera: "Rhythm starter, October" };
  PS.forEach(function (p) { p.plans = [{ name: FIRST[p.id], from: START, to: END1 }, { name: p.plan.name, from: CUT, to: TODAY }]; });
  window.MR = { START: START, TODAY: TODAY, PATIENTS: PS, hm: hm };
})();
