/* Today, as a day rather than as a filing system.

   The old To-do screen grouped by pillar: Eat, Move, Mind, Measure. That is
   how we think about metabolism, not how anybody lives an afternoon. This
   builds the same work as a list in the order it actually happens, and lets
   the pillar ride along as the colour of each row's circle.

   Every row carries `at`, the minute of the day it belongs to. The phase falls
   out of that one number, so there is no second map to keep in step. */

export const PHASES = [
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
];

export const phaseOf = (at) => (at < 12 * 60 ? "morning" : at < 17 * 60 ? "afternoon" : "evening");

export const WATER_GOAL = 8;
export const STEP_GOAL = 10000;

/* When each meal slot sits in the day. The coach's own times are shown on the
   row; these are only for ordering, so they stay steady whether or not a plan
   has landed. */
const DIVISION_AT = {
  prebreakfast: 6 * 60,
  breakfast: 8 * 60 + 30,
  lunch: 13 * 60,
  eveningsnack: 17 * 60,
  dinner: 20 * 60,
  bedtime: 22 * 60,
};

/* One line of the coach's thinking per slot. This is the part that makes the
   list read as a plan somebody wrote for you, rather than a checklist. It only
   appears once a plan is in, because before that there is nobody to be saying
   it. */
const MEAL_TIP = {
  prebreakfast: "On an empty stomach, before anything else.",
  breakfast: "Eat within an hour of waking. It steadies the whole day.",
  lunch: "Start with the salad, then the rest.",
  eveningsnack: "This is the one that stops you overeating at dinner.",
  dinner: "Finish two hours before bed so your sleep is not working on food.",
  bedtime: "Small and warm. It is for sleep, not for hunger.",
};

export function buildDay(w) {
  const {
    planAssigned, eatDivisions, mealsLogged, exLogs, mindDone,
    sleepMins, daySteps, water, ticks, skipped, planOption, measureRows,
    healthSync, healthSource,
  } = w;

  const logged = new Set(mealsLogged.map((m) => m.division));
  const itemsIn = (id) => mealsLogged.filter((m) => m.division === id).flatMap((m) => m.items);
  const rows = [];

  /* Sleep opens the day because the morning is when you know the answer. It is
     asked first and it is the only row about last night. */
  rows.push({
    id: "sleep", pillar: "mind", at: 0,
    title: "Log last night's sleep",
    tip: "A short night pushes your hunger up all day.",
    kind: "go", to: "sleep",
    done: sleepMins !== null,
  });

  if (planAssigned)
    rows.push({
      id: "supp", pillar: "eat", at: 7 * 60 + 45,
      title: "Bitter melon capsule",
      when: "7:45 AM",
      tip: "With warm water, before you eat anything.",
      kind: "tick",
      done: ticks.includes("supp"),
    });

  measureRows.forEach((m) =>
    rows.push({
      id: "sync:" + m.id, pillar: "measure", at: 7 * 60 + 30,
      title: m.title,
      when: "7:30 AM",
      tip: m.tip,
      kind: "go", to: "measure",
      done: m.done,
    })
  );

  eatDivisions.forEach((d) => {
    const mine = itemsIn(d.id);
    const opts = planAssigned ? d.plan || [] : [];
    /* Which option is showing. Whatever was actually eaten wins over whatever
       was last tapped, so the row cannot show option two while option one is
       sitting logged underneath it. */
    const eaten = opts.findIndex((o) => o.some((it) => mine.some((x) => x.id === it.id)));
    const picked = planOption[d.id];
    const oi = Math.max(0, Math.min(eaten >= 0 ? eaten : picked ?? 0, opts.length - 1));
    rows.push({
      id: "meal:" + d.id, pillar: "eat", at: DIVISION_AT[d.id] ?? 13 * 60,
      title: d.name,
      when: planAssigned ? d.time : null,
      // The plan's own food is a better instruction than a general note about
      // the hour, so the tip only speaks when there is no plan to read.
      tip: opts.length ? null : planAssigned ? MEAL_TIP[d.id] : null,
      division: d.id,
      opts,
      oi,
      optionLocked: eaten >= 0,
      items: mine,
      kind: "go", to: "eat:" + d.id,
      done: logged.has(d.id),
    });
  });

  rows.push({
    id: "water", pillar: "eat", at: 14 * 60,
    title: "Drink " + WATER_GOAL + " glasses of water",
    kind: "target", to: "water",
    now: water, goal: WATER_GOAL, unit: "glasses",
    add: true,
    done: water >= WATER_GOAL,
  });

  /* With a plan this is the coach's session at their hour. Without one it is
     an open ask with no clock on it, because nobody has earned the right to
     give this person a time yet. */
  rows.push(
    planAssigned
      ? {
          id: "session", pillar: "move", at: 19 * 60,
          title: "Your exercise session",
          when: "7:00 - 8:00 PM",
          tip: "Six moves, about 40 minutes. Your coach picked them for your knees.",
          kind: "go", to: "move",
          done: exLogs.length > 0,
        }
      : {
          id: "session", pillar: "move", at: 16 * 60,
          title: "Move for 20 minutes",
          tip: "A walk to the shop counts. So do the stairs.",
          kind: "go", to: "move",
          done: exLogs.length > 0,
        }
  );

  rows.push({
    id: "calm", pillar: "mind", at: 21 * 60,
    title: "Take a calm break",
    tip: "Two minutes of slow breathing brings your stress hormone down.",
    kind: "go", to: "mind",
    done: mindDone.length > 0,
  });

  rows.push({
    id: "steps", pillar: "move", at: 23 * 60,
    title: "Finish your step target",
    kind: "target", to: "steps",
    now: daySteps, goal: STEP_GOAL, unit: "steps",
    // Only the person keeping their own count can add to it. Connected, the
    // number is a reading and a plus sign on it would be a lie.
    add: healthSource.steps === "manual",
    syncing: healthSync === "steps",
    done: (daySteps || 0) >= STEP_GOAL,
  });

  return rows
    .map((r) => ({ ...r, phase: phaseOf(r.at), skipped: skipped.includes(r.id) }))
    .sort((a, b) => a.at - b.at);
}
