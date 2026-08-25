// Everything the sufficiency walkthrough shows. Kept in one file so the copy
// and the numbers can be tuned without touching layout.

export const NUTRIENTS = [
  { id: "protein", label: "Protein", tone: "#101828" },
  { id: "carbs", label: "Carbs", tone: "#667085" },
  { id: "fats", label: "Fats", tone: "#98A2B3" },
  { id: "fibre", label: "Fibre", tone: "#D0D5DD" },
];

export const BENEFITS = [
  {
    title: "Steadier energy",
    line: "Fewer mid afternoon crashes, and less of the random snacking that follows them.",
  },
  {
    title: "Better focus and mood",
    line: "A well fed brain thinks clearer and stays steadier through the day.",
  },
  {
    title: "Stronger immunity",
    line: "Your body's defences are built out of what you eat, not out of willpower.",
  },
  {
    title: "Healthy weight and digestion",
    line: "Fullness that comes from real nutrition, so portions look after themselves.",
  },
];

export const PROFILE = [
  { label: "Age", value: "42 years" },
  { label: "Sex", value: "Male" },
  { label: "Height", value: "174 cm" },
  { label: "Weight", value: "74.2 kg" },
];



export const MEALS = [
  {
    id: "breakfast",
    label: "Breakfast",
    options: ["Paratha", "Idli sambar", "Poha", "Dosa", "Chai and toast", "Egg bhurji"],
  },
  {
    id: "lunch",
    label: "Lunch",
    options: [
      "Dal and rice",
      "Rice and sambar",
      "Roti and sabzi",
      "Thali",
      "Chicken biryani",
      "Chicken curry and rice",
    ],
  },
  {
    id: "dinner",
    label: "Dinner",
    options: [
      "Roti and sabzi",
      "Curd rice",
      "Dal khichdi",
      "Maggi",
      "Butter chicken and naan",
      "Grilled chicken",
    ],
  },
];

// Where a usual day lands, and where it lands after the add-ons.
export const BEFORE = { score: 63, protein: 56, carbs: 177, fats: 51, fibre: 11 };
export const AFTER = { score: 78, protein: 78, carbs: 189, fats: 57, fibre: 24 };

export const ADDONS = [
  { id: "salad", label: "Sliced cucumber and tomato", why: "fibre and micronutrients" },
  { id: "raita", label: "A katori of raita", why: "protein and a cooling fibre boost" },
  { id: "chana", label: "A handful of roasted chana", why: "plant protein and fibre" },
  { id: "curd", label: "A katori of curd", why: "protein and gut friendly fibre" },
  { id: "almonds", label: "A few soaked almonds", why: "healthy fats and micronutrients" },
];

export const PAYOFFS = [
  {
    title: "Steadier energy",
    line: "The four o'clock dip that sends you looking for chai and biscuits gets a lot quieter.",
  },
  {
    title: "Sharper focus",
    line: "Your second half of the day runs on a steady supply instead of a spike and a crash.",
  },
  {
    title: "Fuller for longer",
    line: "The stretch between lunch and dinner stops feeling like something to survive.",
  },
];

/* ---------- Calories, targets and goals ----------
   Coaches use Harris-Benedict for BMR, then an activity factor for TDEE.
   Everything below is derived from that so the numbers on screen agree with
   each other: change the calorie goal and the macros genuinely recompute. */

export const ACTIVITY = { label: "Lightly active", factor: 1.375 };

// Harris-Benedict, male revised equation.
export function bmr({ kg, cm, age }) {
  return Math.round(88.362 + 13.397 * kg + 4.799 * cm - 5.677 * age);
}

export const BODY = { kg: 74.2, cm: 174, age: 42 };
export const BMR = bmr(BODY);                                   // 1679
export const TDEE = Math.round((BMR * ACTIVITY.factor) / 50) * 50;  // 2300
export const BMI = +(BODY.kg / (BODY.cm / 100) ** 2).toFixed(1); // 24.5

export function bmiBand(v) {
  if (v < 18.5) return "Underweight";
  if (v < 25) return "Healthy";
  if (v < 30) return "Overweight";
  return "Obese";
}

/* Each goal is a split of calories, not a fixed gram list, so the four tiles
   always add up to the calorie card above them. */
export const GOALS = [
  {
    id: "steady",
    label: "Stay steady",
    line: "A bit of everything, and energy that holds.",
    kcal: TDEE,
    split: { protein: 0.2, carbs: 0.5, fats: 0.3 },
    fibre: 30,
  },
  {
    id: "muscle",
    label: "Build muscle",
    line: "For when you are training and want to add strength.",
    kcal: TDEE + 250,
    split: { protein: 0.25, carbs: 0.45, fats: 0.3 },
    fibre: 32,
  },
  {
    id: "lose",
    label: "Lose weight",
    line: "Lighter on rice and roti, heavier on protein.",
    kcal: TDEE - 350,
    split: { protein: 0.3, carbs: 0.4, fats: 0.3 },
    fibre: 34,
  },
];

export const KCAL_MIN = 1400;
export const KCAL_MAX = 3200;

// Protein and carbs are 4 kcal a gram, fats are 9.
export function targetsFor(goalId, kcal) {
  const g = GOALS.find((x) => x.id === goalId) || GOALS[0];
  const k = kcal || g.kcal;
  return [
    { id: "protein", label: "Protein", target: Math.round((k * g.split.protein) / 4), unit: "g" },
    { id: "carbs", label: "Carbs", target: Math.round((k * g.split.carbs) / 4), unit: "g" },
    { id: "fats", label: "Fats", target: Math.round((k * g.split.fats) / 9), unit: "g" },
    { id: "fibre", label: "Fibre", target: g.fibre, unit: "g" },
  ];
}

// 7,700 kcal is roughly a kilo of body weight.
export function projectKg(kcal, months = 6) {
  return +(BODY.kg - ((TDEE - kcal) * (months * 30.4)) / 7700).toFixed(1);
}

export const MACRO_INFO = {
  protein: {
    label: "Protein",
    tagline: "builds and repairs",
    body: "Protein rebuilds muscle, supports your immune system and keeps you full so you snack less. It is the one most of us fall short on, and the one that moves your sufficiency the most.",
    does: ["Muscle repair and strength", "Staying full between meals", "Immunity and recovery"],
  },
  carbs: {
    label: "Carbs",
    tagline: "your main fuel",
    body: "Carbs are your body and brain's main energy source. Quality and timing matter more than quantity: whole grains, fruit and dal ahead of refined flour and sugar.",
    does: ["Everyday energy", "Fuel for workouts and focus", "Fibre for healthy digestion"],
  },
  fats: {
    label: "Fats",
    tagline: "quietly essential",
    body: "Healthy fats help you absorb vitamins, make hormones and protect your heart and brain. Leave room for ghee, nuts and seeds in sensible amounts.",
    does: ["Hormone balance", "Absorbing vitamins A, D, E and K", "Brain and heart health"],
  },
  fibre: {
    label: "Fibre",
    tagline: "keeps you full and steady",
    body: "Fibre slows digestion so your energy stays level, feeds the good bacteria in your gut and keeps you full. Most everyday plates fall short once rice and roti take over, which is why it is one of the first things worth adding.",
    does: ["Steady energy, fewer crashes", "Staying full between meals", "Healthy digestion and gut"],
  },
};
