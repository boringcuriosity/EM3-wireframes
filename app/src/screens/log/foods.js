// Food list for the logging flow. Macros are grams; calories are derived from
// them so a dish can never show a calorie figure its own macros contradict.

const f = (id, name, unit, p, c, fat, fibre, tags = []) => ({
  id,
  name,
  unit,
  p,
  c,
  f: fat,
  fibre,
  kcal: p * 4 + c * 4 + fat * 9,
  tags,
});

export const FOODS = [
  f("poha", "Vegetable poha", "1 bowl", 5, 42, 6, 4, ["fav"]),
  f("chana", "Roasted chana", "1 handful", 9, 27, 4, 6, ["fav"]),
  f("chai", "Masala chai", "1 cup", 2, 11, 3, 0, ["fav"]),
  f("paratha", "Paratha", "1 piece", 5, 26, 6, 3, ["freq"]),
  f("curd", "Curd", "1 katori", 5, 7, 3, 0, ["freq"]),
  f("banana", "Banana", "1 piece", 1, 25, 0, 3, ["freq"]),
  f("dal", "Dal", "1 katori", 9, 20, 4, 5, ["freq"]),
  f("dosa", "Dosa", "1 piece", 4, 29, 4, 2),
  f("idli", "Idli", "2 pieces", 4, 26, 1, 2),
  f("sambar", "Sambar", "1 katori", 4, 14, 3, 4),
  f("rice", "Steamed rice", "1 katori", 3, 35, 0, 1),
  f("roti", "Roti", "1 piece", 3, 15, 2, 2),
  f("eggbhurji", "Egg bhurji", "2 eggs", 13, 2, 11, 0),
  f("chicken", "Chicken curry", "1 katori", 22, 6, 12, 1),
  f("curdrice", "Curd rice", "1 bowl", 7, 40, 5, 2),
  f("almonds", "Soaked almonds", "6 pieces", 3, 2, 7, 2),
  f("salad", "Cucumber and tomato salad", "1 bowl", 2, 6, 0, 3),
  f("raita", "Raita", "1 katori", 4, 6, 3, 1),
  f("paneer", "Paneer bhurji", "1 katori", 14, 5, 14, 1),
  f("rajma", "Rajma", "1 katori", 9, 25, 3, 7),
  f("biryani", "Chicken biryani", "1 plate", 12, 58, 14, 4),
  f("upma", "Upma", "1 bowl", 5, 38, 7, 3),
  f("coffee", "Filter coffee", "1 cup", 2, 8, 2, 0),
  f("khichdi", "Dal khichdi", "1 bowl", 8, 38, 6, 5),

  // Foods a coach's diet plan draws on. Same shape as everything above, so a
  // plan item and a logged item are the same thing to the rest of the app.
  f("blacktea", "Black tea with cinnamon", "1 cup", 0, 0.5, 0, 0),
  f("jeerawater", "Jeera water", "1 glass", 0, 0.7, 0, 0),
  f("eggs", "Boiled egg", "1 egg", 6, 1, 5, 0),
  f("chilla", "Lauki oats besan chilla", "1 piece", 3.5, 10, 2.5, 2),
  f("chutney", "Green chutney", "1 spoon", 0, 1, 0, 0.5),
  f("dahi", "Dahi, low fat", "1 bowl", 9, 12, 3, 0),
  f("gardensalad", "Garden salad", "1 bowl", 1, 3.5, 0, 3),
  f("quinoa", "Vegetable quinoa pulao", "1 bowl", 6, 28, 4, 5),
  f("makhana", "Roasted makhana", "1 bowl", 3, 18, 1.5, 2),
  f("multiroti", "Multigrain roti", "1 piece", 2.5, 13, 2, 3),
  f("sabzi", "Mixed veg sabzi", "1 katori", 3, 12, 6, 4),
  f("walnut", "Walnut", "1 piece", 0.6, 0.5, 2.6, 0.3),
  f("chamomile", "Chamomile tea", "1 cup", 0, 0.5, 0, 0),
];

export const byId = (id) => FOODS.find((x) => x.id === id);

/* Which meal division a time belongs to. The user picks a clock time, not a
   meal name, so the app has to place it. Boundaries sit between the divisions
   rather than inside them. */
export function divisionForTime(mins) {
  if (mins < 7.5 * 60) return "prebreakfast";
  if (mins < 11.5 * 60) return "breakfast";
  if (mins < 16 * 60) return "lunch";
  if (mins < 19.25 * 60) return "eveningsnack";
  if (mins < 21.75 * 60) return "dinner";
  return "bedtime";
}

/* The hour a meal defaults to when it is opened from a plan rather than typed
   in by hand. Half an hour into the window the coach set, so the record lands
   in the right division without claiming a precision nobody entered.

   Lives here rather than in the Eat screen because the day's list opens the
   logger too, and two copies of these six numbers would drift. */
export const DIVISION_TIME = {
  prebreakfast: 6 * 60 + 30,
  breakfast: 8 * 60 + 30,
  lunch: 13 * 60 + 30,
  eveningsnack: 17 * 60 + 30,
  dinner: 20 * 60 + 30,
  bedtime: 22 * 60 + 30,
};

export const DIVISION_LABEL = {
  prebreakfast: "Pre Breakfast",
  breakfast: "Breakfast",
  lunch: "Lunch",
  eveningsnack: "Evening Snack",
  dinner: "Dinner",
  bedtime: "Bed time",
};

/* "2 x 1 piece" reads badly for a single helping, so one helping just names
   the helping. */
export function qtyLabel(food, qty) {
  return qty === 1 ? food.unit : qty + " x " + food.unit;
}

export function fmtTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return h12 + ":" + String(m).padStart(2, "0") + " " + ampm;
}

// Half-hour slots from 5am to the current time, newest first is not useful for
// scanning, so they run forwards and the view scrolls to the end.
export function timeSlots(nowMins) {
  const out = [];
  for (let t = 5 * 60; t <= nowMins; t += 30) out.push(t);
  return out;
}

// Totals across everything logged today.
export function totals(mealsLogged) {
  return mealsLogged
    .flatMap((m) => m.items)
    .reduce(
      (a, it) => {
        const food = byId(it.id);
        if (!food) return a;
        a.p += food.p * it.qty;
        a.c += food.c * it.qty;
        a.f += food.f * it.qty;
        a.fibre += food.fibre * it.qty;
        a.kcal += food.kcal * it.qty;
        return a;
      },
      { p: 0, c: 0, f: 0, fibre: 0, kcal: 0 }
    );
}

/* Sufficiency is how close each of the four gets to its target, averaged, and
   capped per nutrient so a mountain of rice cannot paper over missing protein. */
export function sufficiency(t, targets) {
  const map = Object.fromEntries(targets.map((x) => [x.id, x.target]));
  const parts = [
    Math.min(t.p / map.protein, 1),
    Math.min(t.c / map.carbs, 1),
    Math.min(t.f / map.fats, 1),
    Math.min(t.fibre / map.fibre, 1),
  ];
  return Math.round((parts.reduce((a, b) => a + b, 0) / 4) * 100);
}

/* A day's three main meals, at the times they would really be eaten. Used
   wherever a demo or a tap needs food to exist rather than a counter to move,
   so every screen reading mealsLogged agrees with every screen reading the
   task cards. */
export const DEMO_DAY = [
  {
    division: "breakfast",
    timeMins: 8 * 60 + 30,
    items: [{ id: "poha", qty: 1 }, { id: "eggbhurji", qty: 1 }, { id: "chai", qty: 1 }],
  },
  {
    division: "lunch",
    timeMins: 13 * 60 + 30,
    items: [{ id: "rice", qty: 2 }, { id: "dal", qty: 1 }, { id: "paneer", qty: 1 }, { id: "curd", qty: 1 }],
  },
  {
    division: "dinner",
    timeMins: 20 * 60 + 30,
    items: [{ id: "roti", qty: 3 }, { id: "chicken", qty: 1 }, { id: "rajma", qty: 1 }, { id: "raita", qty: 1 }],
  },
];
