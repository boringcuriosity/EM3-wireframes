/* Rhythm sandbox presets (mind/sandbox-simple.html), shared with the self-check (node mind/sandbox-simple.check.cjs).
   A preset is a coach's plan (the portal's shape, coach-mind/data.js blankPlan().rhythm) and a day as the app holds it
   (v7/mind/plan.js S): sleep sessions in minutes from 00:00 yesterday (1350 is 10:30 PM yesterday, 1800 is 6:00 AM today),
   ticks by index, mood check-ins answered or not. expect is the Rhythm v7/mind/rhythm.js gives for it (17 Nov 2026). */
(function (root) {
  var SAMPLE_WD = [["Last caffeine (tea, coffee or cola)", "16:00"], ["Screen-free wind-down begins (60 min)", "21:30"],
    ["Positive sleep association: prepare the room, dark and at a comfortable temperature", "22:00"]];
  function plan(o) {
    o = o || {};
    return {
      hours: o.hours || 7.5, bedtime: o.bedtime || "22:30", wake: o.wake || "06:00",
      winddown: (o.winddown || SAMPLE_WD).map(function (w) { return { label: w[0], at: w[1] }; }),
      breathing: (o.breathing || [["Simple Breathing", 5, "07:00"]]).map(function (b) { return { name: b[0], mins: b[1], at: b[2] }; }),
      metime: (o.metime === null ? [] : o.metime || [["Walk in nature or a park (20 to 30 min)", "07:00"]]).map(function (m) { return { label: m[0], at: m[1] }; }),
      mood: { checks: (o.mood || ["08:00", "21:00"]).map(function (t) { return { at: t }; }) }
    };
  }
  var all = function (n) { var o = {}; for (var i = 0; i < n; i++) o[i] = true; return o; };
  root.SBPRESETS = [
    { id: "ontime", name: "On-time night, full day", note: "Asleep 10:30 PM to 6:00 AM, everything ticked, both check-ins.",
      plan: plan(), day: { sleeps: [[1350, 1800]], naps: [], wd: all(3), br: { 0: 5 }, me: all(1), vm: [true, true] }, expect: 100 },
    { id: "weekend", name: "Late weekend", note: "Asleep 12:40 AM to 8:15 AM, two of three wind-down tasks, morning check-in only.",
      plan: plan(), day: { sleeps: [[1480, 1935]], naps: [], wd: { 0: true, 2: true }, br: { 0: 5 }, me: all(1), vm: [true, false] }, expect: 63 },
    { id: "nap", name: "Short night with a nap", note: "Asleep 11:50 PM to 5:10 AM, then a 1 h 10 m nap at 2 PM. The nap adds to hours, never to the window.",
      plan: plan(), day: { sleeps: [[1430, 1750]], naps: [[2280, 2350]], wd: { 0: true }, br: { 0: 3 }, me: {}, vm: [true, true] }, expect: 59 },
    { id: "shift", name: "Night shift, day window", note: "The coach's window is 9:00 AM to 4:30 PM. Asleep 9:20 AM to 4:10 PM.",
      plan: plan({ hours: 7, bedtime: "09:00", wake: "16:30", winddown: [["Positive sleep association: prepare the room, dark and at a comfortable temperature", "08:30"]],
        breathing: [["Box Breathing (4-4-4-4)", 5, "08:30"]], metime: [["Social connection: call a friend or family (15 to 30 min)", "18:00"]], mood: ["18:00"] }),
      day: { sleeps: [[2000, 2410]], naps: [], wd: all(1), br: { 0: 5 }, me: all(1), vm: [true] }, expect: 99 },
    { id: "nome", name: "Plan without me-time", note: "The coach left me-time out, so breathing and mood share self-care's 30: 15 each.",
      plan: plan({ metime: null }), day: { sleeps: [[1350, 1800]], naps: [], wd: all(3), br: { 0: 5 }, me: {}, vm: [true, false] }, expect: 93 },
    { id: "split", name: "Split night", note: "Asleep 10:40 PM to 2:00 AM, awake 50 min, then 2:50 AM to 6:10 AM. One night, the break left out of hours. Breathing skipped.",
      plan: plan(), day: { sleeps: [[1360, 1560], [1610, 1810]], naps: [], wd: all(3), br: {}, me: all(1), vm: [true, true] }, expect: 83 }
  ];
})(typeof window !== "undefined" ? window : globalThis);
