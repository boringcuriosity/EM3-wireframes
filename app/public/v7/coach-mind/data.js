/* Mind plan, coach portal prototype: the shared data every module reads (coach-mind-plan.html).
   Sources:
   - Rhythm (the scored part): /mind/sandbox-simple.html (weights from the Mind deck, 70 sleep / 30 self-care; options and defaults copied from it)
   - Practices (coach's templates, not scored): goodflip-reflection.lovable.app/coach, the 27 templates and their "Times to fill"
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

  MP.WINDDOWN = [   /* [label, suggested time, source] */
    ["Screen-off routine: reduce screens before bedtime", "22:00", "framework"],
    ["Caffeine cut-off: no caffeine late in the day", "14:00", "framework"],
    ["Consistent sleep timing: go to bed at the planned time", "22:30", "framework"],
    ["Pre-sleep relaxation: 5 minutes of breathing or relaxation", "22:15", "framework"],
    ["Last tea or coffee before 2 PM", "14:00", "research"],
    ["Dinner 2 hours before bed", "20:30", "research"],
    ["Phone away, lights low", "22:00", "research"],
    ["2 minute mind dump", "21:45", "research"],
    ["No alcohol near bedtime", "20:00", "research"],
    ["Lights low in the last hours before bed", "21:00", "research"]
  ];
  MP.BREATHS = [   /* the reflection app's five breathing exercises, the only ones a coach can pick for the score */
    ["Sleep Breathing", "4-7-8 breathing technique"], ["Zen Flow Breathing", "Calming breath exercise"], ["Star Breathing", "Trace and breathe exercise"],
    ["5 Finger Breathing", "Trace your hand and breathe"], ["Box Breathing", "Calm your mind with a 4-4-4-4 breath cycle"]
  ];
  MP.BREATH_MINS = [2, 3, 5, 10, 15];
  MP.BREATH_MAX = 3;
  MP.METIME = [
    ["Do one enjoyable activity", "framework"], ["Have one meaningful social interaction", "framework"], ["Spend 10 to 15 minutes fully engaged in something", "framework"],
    ["Music or bhajans", "research"], ["Prayer or puja", "research"], ["Gardening", "research"], ["Time with family", "research"], ["A walk in the park", "research"],
    ["Chai with a friend", "research"], ["Reading", "research"], ["A hobby", "research"], ["A show, chosen on purpose", "research"], ["Sitting in the sun", "research"],
    ["Helping someone", "research"], ["A small outing", "research"]
  ];

  /* the coach's practices: the reflection app's templates. None of them is scored. kind "habit" carries habits; it runs for the whole plan. */
  MP.THEMES = [["thoughts", "Thoughts and worry"], ["goals", "Goals and motivation"], ["mood", "Mood and self-kindness"], ["sleep", "Sleep"], ["calm", "Breathing and calm"], ["eating", "Eating and triggers"]];
  MP.PRACTICES = [
    { id: "worry-tree", name: "Worry Tree", desc: "Examine your worries and decide on action", theme: "thoughts" },
    { id: "reframing", name: "Reframing Thoughts", desc: "Transform negative thoughts", theme: "thoughts" },
    { id: "stop-swap", name: "Stop and Swap", desc: "Replace negative with productive thoughts", theme: "thoughts" },
    { id: "problem-solving", name: "Problem Solving", desc: "Work through problems step by step", theme: "thoughts" },
    { id: "circle-control", name: "Circle of Control", desc: "Sort what is and isn't in your control", theme: "thoughts" },
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
    { id: "sleep-tracker", name: "Sleep Tracker", desc: "Monitor your sleep patterns", theme: "sleep" },
    { id: "sleep-tips", name: "Sleep Tips", desc: "Tips for better sleep", theme: "sleep" },
    { id: "sleep-sweep", name: "Sleep Sweep", desc: "Clear your thoughts each night to sleep better", theme: "sleep" },
    { id: "sleep-breathing", name: "Sleep Breathing", desc: "4-7-8 breathing technique", theme: "calm", overlaps: "Sleep Breathing" },
    { id: "zen-flow", name: "Zen Flow Breathing", desc: "Calming breath exercise", theme: "calm", overlaps: "Zen Flow Breathing" },
    { id: "star-breathing", name: "Star Breathing", desc: "Trace and breathe exercise", theme: "calm", overlaps: "Star Breathing" },
    { id: "five-finger", name: "5 Finger Breathing", desc: "Trace your hand and breathe", theme: "calm", overlaps: "5 Finger Breathing" },
    { id: "box-breathing", name: "Box Breathing", desc: "Calm your mind with a 4-4-4-4 breath cycle", theme: "calm", overlaps: "Box Breathing" },
    { id: "grounding", name: "5-4-3-2-1 Grounding", desc: "Reduce anxiety by engaging your senses", theme: "calm" },
    { id: "mindful-eating", name: "Mindful Eating Quiz", desc: "Check in with your eating habits", theme: "eating" },
    { id: "triggers", name: "Tracking Triggers", desc: "Identify and track your triggers", theme: "eating" }
  ];

  /* a plan, and a template, share one shape. A template has no patient and no dates. */
  MP.blankPlan = function () {
    return {
      id: null, name: "", start: "2026-11-02", end: "2026-11-29", status: "draft", from: null,
      rhythm: {
        hours: 7.5, shortZero: 3, excess: true, overAllowed: 1, overLose: 20,
        bedtime: "22:30", wake: "06:00", allowance: 30, zeroAt: 120,
        winddown: [], breathing: [], metime: [], mood: { checks: [{ at: "20:30" }] }
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
      p.rhythm.winddown = [{ label: "Last tea or coffee before 2 PM", at: "14:00" }, { label: "Dinner 2 hours before bed", at: "20:30" }, { label: "Phone away, lights low", at: "22:00" }];
      p.rhythm.breathing = [{ name: "Box Breathing", mins: 5, at: "08:00" }];
      p.rhythm.metime = [{ label: "", at: "18:00" }];   /* the coach types the activity for each person */
    }),
    T("t-sleep", "Sleep reset, 4 weeks", "An earlier, steadier night, with sleep practices from the coach.", function (p) {
      p.rhythm.hours = 8; p.rhythm.bedtime = "22:00"; p.rhythm.wake = "06:00";
      p.rhythm.winddown = [{ label: "Caffeine cut-off: no caffeine late in the day", at: "14:00" }, { label: "Screen-off routine: reduce screens before bedtime", at: "21:30" }, { label: "2 minute mind dump", at: "21:45" }];
      p.rhythm.breathing = [{ name: "Sleep Breathing", mins: 5, at: "21:15" }];
      p.rhythm.metime = [{ label: "", at: "18:00" }];   /* the coach types the activity for each person */
      p.practices = [{ id: "sleep-tracker", times: 1 }, { id: "sleep-tips", times: 1 }, { id: "sleep-sweep", times: 4 }];
    }),
    T("t-calm", "Calmer days", "For worry and stress: daily breathing and thought work.", function (p) {
      p.rhythm.bedtime = "23:00"; p.rhythm.wake = "06:30";
      p.rhythm.winddown = [{ label: "Pre-sleep relaxation: 5 minutes of breathing or relaxation", at: "22:30" }, { label: "Phone away, lights low", at: "22:15" }];
      p.rhythm.breathing = [{ name: "Box Breathing", mins: 5, at: "08:00" }, { name: "Sleep Breathing", mins: 5, at: "21:00" }];
      p.rhythm.metime = [{ label: "", at: "17:30" }];   /* the coach types the activity for each person */
      p.rhythm.mood.checks = [{ at: "13:00" }, { at: "20:30" }];
      p.practices = [{ id: "worry-tree", times: 2 }, { id: "circle-control", times: 1 }, { id: "grounding", times: 3 }];
    }),
    T("t-motivation", "Steady motivation", "Small goals and a weekly habit tracker to keep going.", function (p) {
      p.rhythm.winddown = [{ label: "Consistent sleep timing: go to bed at the planned time", at: "22:30" }];
      p.rhythm.breathing = [{ name: "Zen Flow Breathing", mins: 3, at: "08:00" }];
      p.rhythm.metime = [{ label: "", at: "18:00" }];   /* the coach types the activity for each person */
      p.practices = [{ id: "smart-goals", times: 1 }, { id: "motivation-checkin", times: 2 }, { id: "habit-tracker", times: 1, habits: ["Walk after dinner", "Drink water on waking"] }];
    })
  ];

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
