/* Today, as a day rather than as a filing system.

   The old To-do screen grouped by pillar: Eat, Move, Mind, Measure. That is
   how we think about metabolism, not how anybody lives an afternoon. This
   builds the same work as a list in the order it actually happens, and lets
   the pillar ride along as the colour of each row's circle.

   Every row carries `at`, the minute of the day it belongs to. The phase falls
   out of that one number, so there is no second map to keep in step.

   A row only carries a tip when the tip changes what you do: how to take the
   supplement, what counts as movement, what is in the session. Why sleep
   matters is worth knowing and is not worth a line under every task, so that
   kind of teaching stays in the pillar sheets where someone can go and look
   for it. */

export const PHASES = [
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
];

export const phaseOf = (at) => (at < 12 * 60 ? "morning" : at < 17 * 60 ? "afternoon" : "evening");

export const WATER_GOAL = 2;
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

/* One read per pillar, each at the hour that pillar is on somebody's mind. */
const WEEK_READS = [
  {
    id: "mind", at: 9 * 60, when: "9:00 AM",
    title: "Read how you slept this week",
    tip: "Seven nights, and what the timing of them is doing to you.",
  },
  {
    id: "move", at: 15 * 60, when: "3:00 PM",
    title: "Read how you moved this week",
    tip: "Which days you moved on, and where the gaps sit.",
  },
  {
    id: "eat", at: 20 * 60 + 30, when: "8:30 PM",
    title: "Read how you ate this week",
    tip: "What held steady across seven days, and the one thing to close.",
  },
];

export function buildDay(w) {
  const {
    planAssigned, eatDivisions, mealsLogged, exLogs, mindDone,
    sleepMins, daySteps, water, ticks, skipped, planOption, measureRows,
    healthSync, healthSource, weekInsight, weekMode, weekReads,
  } = w;

  const logged = new Set(mealsLogged.map((m) => m.division));
  const itemsIn = (id) => mealsLogged.filter((m) => m.division === id).flatMap((m) => m.items);
  const rows = [];

  /* Sleep opens the day because the morning is when you know the answer. It is
     asked first and it is the only row about last night. */
  rows.push({
    id: "sleep", pillar: "mind", at: 0,
    title: "Log last night's sleep",
    kind: "go", to: "sleep",
    done: sleepMins !== null,
  });

  /* The parts of the plan that are not food. They come off the meal they hang
     off rather than being written out here as well, so the day's list and the
     Eat screen cannot end up asking for different capsules. */
  if (planAssigned)
    eatDivisions.forEach((d) =>
      (d.notes || []).forEach((n) =>
        rows.push({
          id: n.id, pillar: "eat", at: n.at,
          title: n.title,
          when: n.when,
          tip: n.tip,
          kind: "tick",
          done: ticks.includes(n.id),
        })
      )
    );

  measureRows.forEach((m) =>
    rows.push({
      id: "sync:" + m.id, pillar: "measure", at: 7 * 60 + 30,
      title: m.title,
      when: "7:30 AM",
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
      // The window, plan or no plan. Knowing roughly when to eat is useful on
      // day one, and it is the same window the coach will later work from.
      when: d.time,
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

  /* The week, once there is one. An insight nobody finds is an insight nobody
     has, so it comes to the day rather than waiting to be discovered three
     taps inside a pillar.

     Two shapes. As one task it is a Measure row in the evening that opens the
     whole week at once, Measure being the pillar that means knowing. As three
     it is one read per pillar, each at the hour that pillar is on your mind:
     sleep in the morning, movement in the afternoon, food after dinner. */
  if (weekInsight && weekInsight !== "off") {
    const readAll = weekInsight === "read";
    if (weekMode === "sheet")
      rows.push({
        id: "weekread", pillar: "measure", at: 18 * 60 + 30,
        title: "Read your week with Kaira",
        when: "6:30 PM",
        tip: "Seven days in. What your food, movement and sleep are saying.",
        kind: "go", to: "week",
        done: readAll,
      });
    else
      WEEK_READS.forEach((r) =>
        rows.push({
          id: "weekread:" + r.id, pillar: r.id, at: r.at,
          title: r.title,
          when: r.when,
          tip: r.tip,
          kind: "go", to: "week:" + r.id,
          done: readAll || (weekReads || []).includes(r.id),
        })
      );
  }

  rows.push({
    id: "water", pillar: "eat", at: 14 * 60,
    title: "Drink " + WATER_GOAL + " glasses of water",
    tip: "Avoid drinking water right before you eat.",
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
