// Exercises with MET values, the movement equivalent of the food macros.
// Calories burnt are computed, never typed in, so the number on screen always
// follows from the activity, the intensity, the duration and the body.

const e = (id, name, met, tags = []) => ({ id, name, met, tags });

export const EXERCISES = [
  e("walk", "Walking", 4.3, ["common"]),
  e("briskwalk", "Brisk walking", 5.0, ["common"]),
  e("treadmill", "Treadmill walking", 4.5),
  e("stairs", "Climbing stairs", 8.0),
  e("jog", "Jogging", 7.0, ["common"]),
  e("run", "Running", 9.8),
  e("cycle", "Cycling", 7.5, ["common"]),
  e("swim", "Swimming", 7.0),
  e("yoga", "Yoga", 3.0, ["common"]),
  e("stretch", "Stretching", 2.3),
  e("surya", "Surya namaskar", 4.5),
  e("strength", "Strength training", 5.0, ["common"]),
  e("bodyweight", "Bodyweight workout", 4.5),
  e("skipping", "Skipping", 11.0),
  e("badminton", "Badminton", 5.5),
  e("cricket", "Cricket", 5.0),
  e("football", "Football", 7.0),
  e("tabletennis", "Table tennis", 4.0),
  e("dance", "Dancing", 5.0),
  e("zumba", "Zumba", 6.5),
  e("elliptical", "Cross trainer", 5.0),
  e("pilates", "Pilates", 3.8),
  e("housework", "Housework", 3.5),
  e("gardening", "Gardening", 3.8),
];

export const byId = (id) => EXERCISES.find((x) => x.id === id);

/* Intensity is a multiplier on the MET, which is how the compendium handles
   the same activity done gently or hard. */
export const INTENSITIES = [
  { id: "light", label: "Light", hint: "You could hold a conversation easily", factor: 0.8 },
  { id: "moderate", label: "Moderate", hint: "Breathing harder, still able to talk", factor: 1.0 },
  { id: "vigorous", label: "Vigorous", hint: "Too breathless to talk in sentences", factor: 1.25 },
];

export const DURATIONS = [5, 10, 15, 20, 30, 45, 60, 90];

export const DAILY_GOAL_MIN = 20;

// The standard MET formula: kcal per minute = MET x 3.5 x kg / 200.
export function burnt({ met, minutes, factor = 1, kg = 74.2 }) {
  return Math.round(((met * factor * 3.5 * kg) / 200) * minutes);
}

export function logBurn(entry, kg) {
  const ex = byId(entry.id);
  const f = INTENSITIES.find((i) => i.id === entry.intensity)?.factor ?? 1;
  return burnt({ met: ex.met, minutes: entry.minutes, factor: f, kg });
}

export function dayMinutes(logs) {
  return logs.reduce((n, l) => n + l.minutes, 0);
}

export function dayBurn(logs, kg) {
  return logs.reduce((n, l) => n + logBurn(l, kg), 0);
}

/* A routine a coach has assigned. Same shape whether or not one exists, so the
   empty case is a real state rather than a missing screen. */
export const COACH_ROUTINE = {
  name: "Starter mobility plan",
  by: "Manya Jain",
  from: "18 Aug 2026",
  to: "14 Sep 2026",
  block: "Routine 1",
  items: [
    {
      id: "neck",
      name: "Neck stretches",
      reps: 2,
      sets: 2,
      rest: "30 sec",
      note: "Loosens the neck and upper back, which stiffen up fastest at a desk.",
    },
    {
      id: "arms",
      name: "Arm circles",
      reps: 10,
      sets: 2,
      rest: "20 sec",
      note: "Opens the shoulders before anything heavier.",
    },
    {
      id: "catcamel",
      name: "Cat and camel",
      reps: 8,
      sets: 2,
      rest: "30 sec",
      note: "A gentle mobilisation for the spine, good first thing in the morning.",
    },
    {
      id: "ankle",
      name: "Ankle pumps",
      reps: 15,
      sets: 2,
      rest: "20 sec",
      note: "Helps circulation in the lower legs, which matters with diabetes.",
    },
  ],
};

export const VIDEO_SECTIONS = [
  {
    title: "Exercise of the week",
    featured: true,
    items: [{ id: "v1", name: "Cat and camel", level: "Beginner", kind: "No equipment", likes: 34 }],
  },
  {
    title: "Breathing",
    items: [
      { id: "v2", name: "Active cycle of breathing", level: "Intermediate", kind: "No equipment" },
      { id: "v3", name: "Pursed lip breathing", level: "Beginner", kind: "No equipment" },
    ],
  },
  {
    title: "Gentle strength",
    items: [
      { id: "v4", name: "Chair squats", level: "Beginner", kind: "No equipment" },
      { id: "v5", name: "Wall push ups", level: "Beginner", kind: "No equipment" },
    ],
  },
];
