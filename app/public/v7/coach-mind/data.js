/* Mind plan, coach portal prototype: the shared data every module reads (coach-mind-plan.html).
   Sources:
   - Rhythm (the scored part): /mind/sandbox-simple.html (weights from the Mind deck, 70 sleep / 30 self-care; options and defaults copied from it)
   - Practices (coach's templates, not scored): goodflip-reflection.lovable.app/coach, the 27 templates and their "Times to fill", trimmed to the team's 21 on 5 Nov 2026
   The grouping of practices into themes is ours, for scanning. */
(function () {
  var MP = window.MP = window.MP || {};

  MP.PATIENT = { name: "Patient A", age: 34, sex: "F", indication: "Others", program: "Comprehensive 6 months, Diabetes care", programDates: "12 Jun 2026 to 08 Dec 2026" };
  MP.COACH = { name: "Coach A", role: "Psychologist", initials: "CA" };
  MP.TODAY = "2026-10-30";

  /* the Rhythm score: six parts, fixed weights out of 100 (Mind deck). Coaches set the plan inside each part, never the weights. */
  MP.PARTS = [
    { key: "hours",    name: "Hours of sleep",    w: 23, group: "Sleep",     colour: "in",   hint: "Full marks at the target. Less sleep drops steadily. More sleep can lose marks too." },
    { key: "window",   name: "Sleep window",      w: 24, group: "Sleep",     colour: "in",   hint: "How close bedtime and wake time were to the plan. Full marks inside the allowance, zero past the limit." },
    { key: "winddown", name: "Wind-down tasks",   w: 23, group: "Sleep",     colour: "in",   hint: "Small steps before bed. Each task done earns its share." },
    { key: "breathing",name: "Breathing",         w: 10, group: "Self-care", colour: "teal", hint: "Each at its own time. Each one done earns its share of the 10." },
    { key: "metime",   name: "Me-time",           w: 10, group: "Self-care", colour: "gold", hint: "One activity a day, at a time that suits them. Doing it earns all 10." },
    { key: "mood",     name: "Mood check-in",     w: 10, group: "Self-care", colour: "pink", hint: "Each at its own time. The face the person picks never changes the score." }
  ];

  /* the wind-down tasks a coach picks from, each with its usual time. One line of text (with its length in brackets when
     it has one) and one time: a task given as a range starts at the range's first time */
  MP.WINDDOWN = [   /* [label, usual time] */
    ["Last caffeine (tea, coffee or cola)", "16:00"],
    ["Last alcohol or nicotine", "16:00"],
    ["Evening walk or light movement (20 to 30 min)", "18:30"],
    ["Last heavy meal, dinner cut-off", "19:30"],
    ["Journalling or thought dump (5 to 10 min)", "21:00"],
    ["Last water or fluids", "21:00"],
    ["Screen-free wind-down begins (60 min)", "21:30"],
    ["Gratitude practice, 3 things (3 to 5 min)", "21:30"],
    ["Reading a physical book (20 to 30 min)", "21:30"],
    ["Listen to calming music (15 to 30 min)", "21:45"],
    ["Positive sleep association: prepare the room, dark and at a comfortable temperature", "22:00"]
  ];
  /* the breathing exercises a coach picks for the score: [name, how it goes, starting minutes, usual time].
     A range of minutes starts at its lower end; Morning is 7:00 AM, Noon 12:00 PM, and a time range uses its first time */
  MP.BREATHS = [
    ["Coherent Breathing (5-5)", "In 5 s, out 5 s, 6 breaths a minute", 5, "07:00"],
    ["Box Breathing (4-4-4-4)", "In 4 s, hold 4 s, out 4 s, hold 4 s", 5, "06:30"],
    ["Belly Breathing", "Slow breath in as the belly rises, then a slow breath out", 5, "07:00"],
    ["Pursed Lip Breathing", "In 2 s through the nose, out 4 to 6 s through pursed lips, like blowing out a candle", 2, "12:00"],
    ["Extended Exhale (2:1)", "In 4 s, out 8 s, no holds", 2, "12:00"],
    ["Humming Bee Breath (Bhramari)", "In 3 to 4 s, hum on the breath out for 6 to 8 s", 5, "20:30"],
    ["4-7-8 Breathing", "In 4 s, hold 7 s, out 8 s, 4 rounds", 1, "21:30"]
  ];
  /* minutes: any whole minute from 1 to 30 */
  MP.BREATH_MINS = []; for (var bm = 1; bm <= 30; bm++) MP.BREATH_MINS.push(bm);
  MP.BREATH_MAX = 3;
  /* me-time activities a coach picks from: [label, usual time]. One line of text (its length in brackets) and one time.
     "Morning or evening" uses its first, 7:00 AM; "Anytime" is 6:00 PM, me-time's default; a time range uses its first time */
  MP.METIME = [
    ["Reading books or articles (20 to 30 min)", "07:00"],
    ["Creative hobby: art, craft, music or cooking (20 to 35 min)", "07:00"],
    ["Walk in nature or a park (20 to 30 min)", "07:00"],
    ["Listening to music (15 to 30 min)", "07:00"],
    ["Gentle yoga or stretching (15 to 20 min)", "07:00"],
    ["Gardening or plant care (15 to 20 min)", "07:00"],
    ["Bath or a self-care ritual (10 to 20 min)", "07:00"],
    ["Prayer or spiritual practice (10 to 15 min)", "07:00"],
    ["Mindfulness meditation (10 to 15 min)", "07:00"],
    ["Social connection: call a friend or family (15 to 30 min)", "18:00"],
    ["Dancing or free movement (15 to 30 min)", "18:00"],
    ["Learning something new: a language, skill or course (20 to 30 min)", "18:00"],
    ["Indoor or outdoor games (20 to 30 min)", "18:00"],
    ["Activity of your choice (15 to 20 min)", "18:00"],
    ["Journalling or brain dump (10 to 15 min)", "21:00"],
    ["Screen-free quiet time, just sitting (10 min)", "21:00"]
  ];

  /* the coach's practices: the reflection app's templates. None of them is scored. kind "habit" carries habits; it runs for the whole plan. */
  MP.THEMES = [["restructure", "Restructuring Thoughts"], ["thoughts", "Thoughts and worry"], ["goals", "Goals and motivation"], ["mood", "Mood and self-kindness"], ["sleep", "Sleep"], ["stress", "Stress Management (Calming)"], ["triggers", "Triggers"], ["eating", "Eating and triggers"]];
  MP.PRACTICES = [
    { id: "worry-tree", name: "Worry Tree", desc: "Examine your worries and decide on action", theme: "restructure" },
    { id: "reframing", name: "Reframing Thoughts", desc: "Transform negative thoughts", theme: "restructure" },
    { id: "stop-swap", name: "Stop and Swap", desc: "Replace negative with productive thoughts", theme: "restructure" },
    { id: "problem-solving", name: "Problem Solving", desc: "Work through problems step by step", theme: "restructure" },
    { id: "circle-control", name: "Circle of Control", desc: "Sort what is and isn't in your control", theme: "restructure" },
    { id: "smart-goals", name: "SMART Goals", desc: "Set clear, achievable goals", theme: "goals" },
    { id: "motivation-checkin", name: "Motivation Check-in", desc: "Reflect on what feels hard", theme: "goals" },
    { id: "motivation-tracker", name: "Motivation Tracker", desc: "Track what motivates you monthly", theme: "goals" },
    { id: "behaviour-change", name: "Behavior Change Plan", desc: "Plan for positive change", theme: "goals" },
    { id: "health-planner", name: "Health Planner", desc: "Plan health tasks day-by-day for the week", theme: "goals" },
    { id: "priority-2080", name: "The 20–80 Priority Rule", desc: "Plan future-building priorities and reflect on your day", theme: "goals" },
    { id: "habit-tracker", name: "Habit Tracker", desc: "Track up to 8 daily habits across the week", theme: "goals", kind: "habit" },
    { id: "gratitude", name: "Gratitude Journal", desc: "Notice the good in yourself, others, and life", theme: "mood" },
    { id: "mood-diary", name: "Weekly Mood Diary", desc: "Track your mood across the week", theme: "mood" },
    { id: "mirror", name: "Mirror Exercise", desc: "Self-appreciation practice", theme: "mood" },
    { id: "self-love", name: "Self Love Affirmations", desc: "I Am Enough reminders", theme: "mood" },
    { id: "sleep-sweep", name: "Sleep Sweep", desc: "Clear your thoughts each night to sleep better", theme: "sleep" },
    { id: "five-finger", name: "5 Finger Breathing", desc: "Trace your hand and breathe", theme: "stress" },
    { id: "grounding", name: "5-4-3-2-1 Grounding", desc: "Reduce anxiety by engaging your senses", theme: "thoughts" },
    { id: "mindful-eating", name: "Mindful Eating Quiz", desc: "Check in with your eating habits", theme: "eating" },
    { id: "triggers", name: "Tracking Triggers", desc: "Identify and track your triggers", theme: "triggers" }
  ];

  /* a plan, and a template, share one shape. A template has no patient and no dates. */
  /* dates as the date input keeps them (yyyy-mm-dd, local), and a plan's default length: 15 days, start day included */
  var iso = function (d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); };
  MP.LENGTHS = [["1 week", 7], ["15 days", 15], ["3 weeks", 21], ["1 month", "1m"], ["3 months", "3m"]];
  MP.DEFAULT_LENGTH = 15;
  /* the end date for a length from a start: n days with the start counted, or whole months ending the day before the same date */
  MP.endFor = function (start, len) {
    var d = new Date(start + "T00:00");
    if (typeof len === "number") d.setDate(d.getDate() + len - 1);
    else { d.setMonth(d.getMonth() + parseInt(len, 10)); d.setDate(d.getDate() - 1); }
    return iso(d);
  };
  MP.defaultName = function () { return MP.PATIENT.name + "’s Mind plan"; };
  MP.blankPlan = function () {
    var today = iso(new Date());
    return {
      id: null, name: "", start: today, end: MP.endFor(today, MP.DEFAULT_LENGTH), status: "draft", from: null,
      rhythm: {
        hours: 7.5, shortZero: 3, excess: true, overAllowed: 1, overLose: 20,
        bedtime: "22:30", wake: "06:00", allowance: 30, zeroAt: 120,
        second: null,   /* a second sleep window, { bedtime, hours }: night shifts or sleep in two parts. Up to two windows */
        winddown: [], breathing: [], metime: [], mood: { checks: [{ at: "21:00" }] }   /* one by default, in the evening before wind-down; a second can be added in the morning */
      },
      practices: [],   /* { id, times: 1, habits: [] } */
      note: ""
    };
  };
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  MP.clone = clone;

  /* sample Mind templates a coach might keep. Prototype content, for the library. */
  var T = function (id, name, about, fill) { var p = MP.blankPlan(); p.id = id; p.name = name; p.about = about; fill(p); return p; };
  MP.TEMPLATES = [
    T("t-default", "Rhythm starter", "The Mind framework's defaults. A good first plan for anyone.", function (p) {
      p.rhythm.winddown = [{ label: "Last caffeine (tea, coffee or cola)", at: "16:00" }, { label: "Last heavy meal, dinner cut-off", at: "19:30" }, { label: "Screen-free wind-down begins (60 min)", at: "21:30" }];
      p.rhythm.breathing = [{ name: "Box Breathing (4-4-4-4)", mins: 5, at: "06:30" }];
      p.rhythm.metime = [{ label: "", at: "18:00" }];   /* the coach types the activity for each person */
    }),
    T("t-sleep", "Sleep reset, 4 weeks", "An earlier, steadier night, with sleep practices from the coach.", function (p) {
      p.rhythm.hours = 8; p.rhythm.bedtime = "22:00"; p.rhythm.wake = "06:00";
      p.rhythm.winddown = [{ label: "Last caffeine (tea, coffee or cola)", at: "16:00" }, { label: "Screen-free wind-down begins (60 min)", at: "21:00" }, { label: "Journalling or thought dump (5 to 10 min)", at: "21:15" }];
      p.rhythm.breathing = [{ name: "4-7-8 Breathing", mins: 1, at: "21:30" }];
      p.rhythm.metime = [{ label: "", at: "18:00" }];   /* the coach types the activity for each person */
      p.practices = [{ id: "sleep-sweep", times: 4 }];
    }),
    T("t-calm", "Calmer days", "For worry and stress: daily breathing and thought work.", function (p) {
      p.rhythm.bedtime = "23:00"; p.rhythm.wake = "06:30";
      p.rhythm.winddown = [{ label: "Listen to calming music (15 to 30 min)", at: "22:15" }, { label: "Positive sleep association: prepare the room, dark and at a comfortable temperature", at: "22:30" }];
      p.rhythm.breathing = [{ name: "Box Breathing (4-4-4-4)", mins: 5, at: "06:30" }, { name: "Humming Bee Breath (Bhramari)", mins: 5, at: "20:30" }];
      p.rhythm.metime = [{ label: "", at: "17:30" }];   /* the coach types the activity for each person */
      p.rhythm.mood.checks = [{ at: "07:00" }, { at: "21:00" }];
      p.practices = [{ id: "worry-tree", times: 2 }, { id: "circle-control", times: 1 }, { id: "grounding", times: 3 }];
    }),
    T("t-motivation", "Steady motivation", "Small goals and a weekly habit tracker to keep going.", function (p) {
      p.rhythm.winddown = [{ label: "Gratitude practice, 3 things (3 to 5 min)", at: "21:30" }];
      p.rhythm.breathing = [{ name: "Coherent Breathing (5-5)", mins: 5, at: "07:00" }];
      p.rhythm.metime = [{ label: "", at: "18:00" }];   /* the coach types the activity for each person */
      p.practices = [{ id: "smart-goals", times: 1 }, { id: "motivation-checkin", times: 2 }, { id: "habit-tracker", times: 1, habits: ["Walk after dinner", "Drink water on waking"] }];
    })
  ];

  /* the patient's Mind screen (v7/mind) shows this plan: the coach portal's defaults (7.5 h, 10:30 PM to 6:00 AM, one evening
     mood check-in at 9:00 PM) with picks from its own lists at their usual times, so the app shows exactly what a coach can set */
  MP.SAMPLE = (function () {
    var p = MP.blankPlan(); p.id = "sample"; p.name = MP.defaultName();
    var wd = function (i) { return { label: MP.WINDDOWN[i][0], at: MP.WINDDOWN[i][1] }; };
    p.rhythm.winddown = [wd(0), wd(6), wd(10)];   /* last caffeine 4 PM, screen-free 9:30 PM, the room 10 PM */
    p.rhythm.breathing = [{ name: MP.BREATHS[0][0], mins: MP.BREATHS[0][2], at: MP.BREATHS[0][3] }];   /* Coherent Breathing, 5 min, 7 AM */
    p.rhythm.metime = [{ label: MP.METIME[2][0], at: MP.METIME[2][1] }];   /* walk in nature, 7 AM */
    p.practices = [{ id: "gratitude", times: 1 }, { id: "worry-tree", times: 1 }, { id: "habit-tracker", times: 1, habits: ["Walk after dinner", "Drink water on waking"] }];
    return p;
  })();

  /* the plans this patient already has: none. The list starts empty, the way the portal has no Mind plan today. */
  MP.PLANS = [];

  /* the one place modules tell the host something changed (the host replaces this) */
  MP.changed = MP.changed || function () {};
  MP.steps = MP.steps || {};
  MP.helpers = {
    esc: function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); },
    t12: function (hm) { var h = +hm.slice(0, 2), m = hm.slice(3); return ((h % 12) || 12) + ":" + m + " " + (h < 12 ? "AM" : "PM"); },
    date: function (iso) { var d = new Date(iso + "T00:00"); return d.getDate() + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()] + " " + d.getFullYear(); },
    practice: function (id) { return MP.PRACTICES.filter(function (p) { return p.id === id; })[0]; }
  };
})();
