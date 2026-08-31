import { MIND_TEMPLATES } from "../mind/tools";

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

/* The parts of a day, and the hour each one starts.

   Four, because the day this plans is an Indian one and an Indian day has four
   names for itself: subah, dopahar, shaam, raat. The evening meal is raat ka
   khana, night food, so filing dinner under Evening put a night meal in the
   wrong part of the day. The split also gives the last stretch a finish line
   of its own: Evening used to run from five to eleven and carry half the list,
   which is the one part of the day that never got shorter.

   The hours are Indian too. Shaam starts with tea at four rather than at the
   six most apps assume, and raat starts at seven with the evening meal.

   `when` is the phase said as a moment rather than as a heading, for the lines
   that read "2 more tonight". Night is the reason it exists: every other part
   takes "this", and "this night" is not something anybody says.

   Three parts is kept switchable while the split is being shown around. */
export const PHASE_MODES = {
  4: [
    { id: "morning",   label: "Morning",   when: "this morning",   from:  5 * 60 },
    { id: "afternoon", label: "Afternoon", when: "this afternoon", from: 12 * 60 },
    { id: "evening",   label: "Evening",   when: "this evening",   from: 16 * 60 },
    { id: "night",     label: "Night",     when: "tonight",        from: 19 * 60 },
  ],
  3: [
    { id: "morning",   label: "Morning",   when: "this morning",   from:  5 * 60 },
    { id: "afternoon", label: "Afternoon", when: "this afternoon", from: 12 * 60 },
    { id: "evening",   label: "Evening",   when: "this evening",   from: 17 * 60 },
  ],
};

export const phasesFor = (mode) => PHASE_MODES[mode] || PHASE_MODES[4];

/* Which part of the day a minute falls in. Anything before the day turns over
   at five belongs to the part still running when it started, so a two in the
   morning row files under the night it actually belongs to rather than
   opening the next day. */
export const phaseOf = (at, mode) => {
  const spans = phasesFor(mode);
  let id = spans[spans.length - 1].id;
  for (const s of spans) if (at >= s.from) id = s.id;
  return id;
};

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

/* Every task is a verb and a name.

   The name is the thing itself, and it is what a confirmation says once the
   thing is done. The verb is the ask, and it comes from the kind of task, so a
   new row only has to say what it is called and what kind it is. A title is
   composed from the two and written nowhere, which is why the list can never
   ask for one thing and confirm another.

   The kind is what finishes the task, which is also what decides the verb.
   Anything that ends with a record going in reads "Log", whether it is a meal,
   last night's sleep or the coach's session, so the list teaches its own
   grammar and a row's first word already says what sort of work it is.

   `verb` overrides the kind for the handful of asks that are their own action,
   where nothing is filed afterwards: drinking the water, walking the steps,
   and the coach's own nudges. */
export const TASK_VERB = {
  record: "Log",   // a record goes in: meals, sleep, the exercise session
  device: "Sync",  // a reading arrives from a device
  insight: "Read", // Kaira has written the week up
  habit: "Take",   // done in the moment, with nothing to file
};

// Names are stored the way they are shown; a title only needs the first letter
// to come down. Digits and initials come through untouched.
export const taskTitle = (r) =>
  (r.verb || TASK_VERB[r.cat] || "Log") + " " + r.name.charAt(0).toLowerCase() + r.name.slice(1);

/* The same ask, turned back into a question. Composed from the title rather
   than written per tip, so a nudge only ever has to say what it is and both
   the row and the question come out of it. */
export const askAbout = (r) =>
  "Tell me why I should " + r.title.charAt(0).toLowerCase() + r.title.slice(1) + ".";

/* Eat keeps the plain slot names for its own headings, where a section is a
   place rather than a thing to do. Two of them read differently as a task. */
const MEAL_NAME = { prebreakfast: "Pre-breakfast", bedtime: "Bedtime snack" };

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
    name: "How you slept this week",
    tip: "Seven nights, and what the timing of them is doing to you.",
  },
  {
    id: "move", at: 15 * 60, when: "3:00 PM",
    name: "How you moved this week",
    tip: "Which days you moved on, and where the gaps sit.",
  },
  {
    id: "eat", at: 20 * 60 + 30, when: "8:30 PM",
    name: "How you ate this week",
    tip: "What held steady across seven days, and the one thing to close.",
  },
];

export function buildDay(w) {
  const {
    planAssigned, eatDivisions, mealsLogged, exLogs, mindDone,
    sleepMins, daySteps, water, ticks, skipped, planOption, measureRows,
    healthSync, healthSource, weekInsight, weekMode, weekReads, phaseMode, templateKept, mindPlan,
  } = w;

  const logged = new Set(mealsLogged.map((m) => m.division));
  const itemsIn = (id) => mealsLogged.filter((m) => m.division === id).flatMap((m) => m.items);
  const rows = [];

  /* Sleep opens the day because the morning is when you know the answer. It is
     asked first and it is the only row about last night. */
  rows.push({
    /* Sat at minute zero to sort first, which was harmless while the day
       started at midnight. It does not survive a day that turns over at five:
       midnight is the night still running, so the row about last night filed
       itself under tonight. It opens the morning instead, which is the hour
       somebody actually knows the answer. */
    id: "sleep", pillar: "mind", at: 5 * 60, coins: 5,
    cat: "record", name: "Last night's sleep",
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
          // A nudge belongs to the habit it serves, and sunlight is Mind's.
          id: n.id, pillar: n.pillar || "eat", at: n.at,
          verb: n.verb, name: n.name,
          when: n.when,
          tip: n.tip,
          kind: "tick",
          done: ticks.includes(n.id),
        })
      )
    );

  measureRows.forEach((m) =>
    rows.push({
      id: "sync:" + m.id, pillar: "measure", at: 7 * 60 + 30, coins: 10,
      cat: "device", name: m.name,
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
      id: "meal:" + d.id, pillar: "eat", at: DIVISION_AT[d.id] ?? 13 * 60, coins: 4,
      cat: "record", name: MEAL_NAME[d.id] || d.name,
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
        id: "weekread", pillar: "measure", at: 18 * 60 + 30, coins: 5,
        cat: "insight", name: "Your week with Kaira",
        when: "6:30 PM",
        tip: "Seven days in. What your food, movement and sleep are saying.",
        kind: "go", to: "week",
        done: readAll,
      });
    else
      WEEK_READS.forEach((r) =>
        rows.push({
          id: "weekread:" + r.id, pillar: r.id, at: r.at, coins: 5,
          cat: "insight", name: r.name,
          when: r.when,
          tip: r.tip,
          kind: "go", to: "week:" + r.id,
          done: readAll || (weekReads || []).includes(r.id),
        })
      );
  }

  rows.push({
    id: "water", pillar: "eat", at: 14 * 60, coins: 3,
    verb: "Drink", name: WATER_GOAL + " glasses of water",
    tip: "Avoid drinking water right before you eat.",
    /* Two glasses is one ask, not a counter to fill. A plus and a bar made a
       row you tick into a row you visit twice, and a half full bar said less
       than the sentence above it already does. */
    kind: "target", to: "water",
    done: water >= WATER_GOAL,
  });

  /* With a plan this is the coach's session at their hour. Without one it is
     an open ask with no clock on it, because nobody has earned the right to
     give this person a time yet. */
  rows.push(
    planAssigned
      ? {
          /* Half past six, so the session sits in the evening rather than in
             the night. Seven is where raat starts, and a workout is something
             you do before dinner rather than after it. */
          id: "session", pillar: "move", at: 18 * 60 + 30, coins: 10,
          cat: "record", name: "Your exercise session",
          when: "6:30 - 7:00 PM",
          /* Generic on purpose. The routine itself is on the Move screen, so a
             row that counted the moves would be a second copy of it, going
             stale the moment a coach changed one. */
          tip: "About 30 minutes, with the moves your coach picked for you.",
          kind: "go", to: "move",
          done: exLogs.length > 0,
        }
      : {
          id: "session", pillar: "move", at: 16 * 60, coins: 10,
          cat: "record", name: "20 minutes of movement",
          tip: "A walk to the shop counts. So do the stairs.",
          kind: "go", to: "move",
          done: exLogs.length > 0,
        }
  );

  rows.push({
    id: "calm", pillar: "mind", at: 21 * 60, coins: 5,
    cat: "habit", name: "A calm break",
    // The breathing exercise itself, rather than the screen it sits on.
    kind: "go", to: "mind:breathing",
    done: mindDone.length > 0,
  });

  /* The psychologist's worksheets, at the cadence she set. A worksheet to fill
     once stays on the day until it is filled; a daily one comes back. Both are
     Mind, and both open their own sheet rather than the pillar screen. */
  if (mindPlan)
    MIND_TEMPLATES.forEach((t) => {
      const kept = !!(templateKept || {})[t.id];
      /* Only what today actually asks for: the daily ones, and a one-off until
         it is filled. A weekly worksheet and the session notes are open all
         week, so a row for them every morning would be nagging. */
      if (!(t.cadence === "day" || (t.cadence === "once" && !kept))) return;
      rows.push({
        id: "tpl:" + t.id,
        pillar: "mind",
        at: t.cadence === "once" ? 9 * 60 + 30 : 21 * 60 + 30,
        coins: 3,
        verb: "Fill",
        name: t.task,
        tip: t.line,
        kind: "go",
        to: "tpl:" + t.id,
        done: kept,
      });
    });

  rows.push({
    id: "steps", pillar: "move", at: 23 * 60, coins: 5,
    // The walk, not the target. A target is the app's word for it; walking
    // ten thousand steps is the thing the person actually does.
    verb: "Walk", name: STEP_GOAL.toLocaleString("en-IN") + " steps",
    kind: "target", to: "steps",
    now: daySteps, goal: STEP_GOAL, unit: "steps",
    // Only the person keeping their own count can add to it. Connected, the
    // number is a reading and a plus sign on it would be a lie.
    add: healthSource.steps === "manual",
    syncing: healthSync === "steps",
    done: (daySteps || 0) >= STEP_GOAL,
  });

  return rows
    .map((r) => ({ ...r, title: taskTitle(r), phase: phaseOf(r.at, phaseMode), skipped: skipped.includes(r.id) }))
    .sort((a, b) => a.at - b.at);
}
