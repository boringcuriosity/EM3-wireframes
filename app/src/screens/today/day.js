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

   The last part ends at midnight rather than running to five. Most people are
   asleep by twelve and nothing is ever assigned after it, so a label that said
   the night ran to 5 AM was promising a stretch of the day the plan has no
   business in. The turnover is still five: `phaseOf` files anything before it
   under the night that was already running, so a two in the morning row
   belongs to last night rather than opening the next day.

   `when` is the phase said as a moment rather than as a heading, for the lines
   that read "2 more tonight". Night is the reason it exists: every other part
   takes "this", and "this night" is not something anybody says.

   Three parts is kept switchable while the split is being shown around. */
export const PHASE_MODES = {
  4: [
    { id: "morning",   label: "Morning",   hindi: "Subah",   span: "5 AM to 12 PM", when: "this morning",   from:  5 * 60 },
    { id: "afternoon", label: "Afternoon", hindi: "Dopahar", span: "12 PM to 4 PM", when: "this afternoon", from: 12 * 60 },
    { id: "evening",   label: "Evening",   hindi: "Shaam",   span: "4 PM to 7 PM",  when: "this evening",   from: 16 * 60 },
    { id: "night",     label: "Night",     hindi: "Raat",    span: "7 PM to 12 AM", when: "tonight",        from: 19 * 60 },
  ],
  3: [
    { id: "morning",   label: "Morning",   hindi: "Subah",   span: "5 AM to 12 PM", when: "this morning",   from:  5 * 60 },
    { id: "afternoon", label: "Afternoon", hindi: "Dopahar", span: "12 PM to 5 PM", when: "this afternoon", from: 12 * 60 },
    { id: "evening",   label: "Evening",   hindi: "Shaam",   span: "5 PM to 12 AM", when: "this evening",   from: 17 * 60 },
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

// "7h 40m", the way anybody says a night's sleep out loud.
export const hoursMins = (m) => Math.floor(m / 60) + "h " + String(m % 60).padStart(2, "0") + "m";
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
  record: "Log",   // a record goes in: meals, the exercise session, your mood
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

/* What the big bubble on Home asks.

   Home is the screen somebody opens after the thing has already happened. A
   plan tells you to do something; this app is where you say you did it, so the
   bubble asks rather than instructs. "Have you had your lunch" is a question a
   person can answer. "Time to eat" is a nag about a moment that has usually
   already passed.

   One line per row rather than one per pillar, because the whole point is that
   it names the thing actually waiting. A category cannot do that: it would ask
   about food when what is open is the bedtime snack. The pillar line is only
   the fallback for a row nobody has written one for.

   The device rows say what the device reads. "Take a reading" is our word for
   it; a body composition check is what the person went and did.

   NONE OF THEM SAY "TODAY". The card they sit on is Home, the day it is
   showing is today, and the date is at the top of the screen: a question that
   ends in "today" is spending its last word restating the one thing nobody
   could be confused about. It also made every ask sound like the same ask.

   The session is a workout, here as everywhere else. It was the last place
   still calling it a session, which is the word Move stopped using when the
   score started counting minutes rather than the coach's routine. */
const ASK = {
  sleep: "How did you sleep last night?",
  "meal:prebreakfast": "Have you had anything yet this morning?",
  "meal:breakfast": "Have you had your breakfast?",
  "meal:lunch": "Have you had your lunch?",
  "meal:eveningsnack": "Have you had your evening snack?",
  "meal:dinner": "Have you had your dinner?",
  "meal:bedtime": "Have you had anything before bed?",
  water: "Have you had some water?",
  morning: "Have you done your morning stretch?",
  session: "Have you done your workout?",
  steps: "Have you been on your feet?",
  calm: "How has your day been?",
  "sync:measure": "Have you checked your body composition?",
  "sync:cgm": "Have you checked your glucose?",
  weekread: "Have you read your week yet?",
};

const ASK_PILLAR = {
  eat: "Have you eaten yet?",
  move: "Have you moved yet?",
  mind: "How are you feeling?",
  measure: "Have you taken a reading?",
};

export const askOf = (r) =>
  !r ? null : ASK[r.id] || (r.id.startsWith("weekread") ? ASK.weekread : ASK_PILLAR[r.pillar]) || null;

/* A tip is not work. It pays nothing, it files nothing, and it does not decide
   which pillar is worth looking at, so everything about the bubbles reads the
   recordable rows only.

   One tap is not what makes something a tip. The coach's small movements tap
   exactly the same way and are assigned work, so they carry `scores` and count
   everywhere a logged row counts. What makes a tip a tip is that nobody was
   asked to do it. */
export const isTip = (r) => r.kind === "tick" && !r.scores;

/* Eat keeps the plain slot names for its own headings, where a section is a
   place rather than a thing to do. Two of them read differently as a task. */
const MEAL_NAME = { bedtime: "Bedtime snack" };

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

/* THE COACH'S MOVE PLAN, AND THE ONLY THING MOMENTUM READS.

   The physio assigns three kinds of thing and nothing else: a session, some
   small movements, and a step goal. Everything the score does is worked out
   from this list, so no plan carries a weight set by hand and no two coaches
   can grade the same plan differently. Finish what is here and Momentum is
   100, whatever "here" happens to be.

   That last part is the point. A patient with back pain gets a plan of four
   seated movements and no step goal, and finishing it is a full day, because
   the coach who wrote it knew what to ask for. Nobody is ever measured against
   a task they were never given.

   The small movements are the NEAT half: the stairs, standing through a call,
   ten minutes after a meal. No gym, no change of clothes, and no stopwatch,
   which is why they are one tap rather than a logger. They are spread one to a
   part of the day on purpose, because spread is what the spread bonus reads
   and a plan that lands them all before lunch has not asked for a day.

   `at` is all the score needs to know about when: `phaseOf` turns it into a
   part of the day, and the parts are what the bonus is measured over.

   IT IS ALL THE PERSON NEEDS EITHER, for the small ones. The workout has a
   real time because the coach put it at an hour and it takes half of one. A
   walk after your tea does not happen at 5:30, it happens somewhere in the
   evening, and printing 5:30 next to it invents a precision nobody agreed to
   and makes a plan look like a timetable to fall behind. So `at` orders them
   and files them, and the screen shows the part of the day it landed in.

   `type` is what the task is worth, and it is deliberately not called `kind`.
   A row's `kind` is how it behaves on the list, go or tick or target, and the
   two answer different questions: the session is an `exercise` by weight and a
   `go` by behaviour, and collapsing them into one word made the session's row
   claim to be an exercise-kind row that nothing knew how to draw. */
export const MOVE_PLAN = {
  stepGoal: STEP_GOAL,
  tasks: [
    {
      id: "session", type: "exercise", at: 7 * 60, coins: 10,
      cat: "record", name: "Your workout",
      when: "7:00 - 7:30 AM",
      /* Generic on purpose. The routine itself is on the Move screen, so a row
         that counted the moves would be a second copy of it, going stale the
         moment a coach changed one. */
      tip: "About 30 minutes, with the moves your coach picked for you.",
      to: "move",
    },
    {
      id: "note:stairs", type: "neat", at: 9 * 60 + 30, coins: 3,
      verb: "Take", name: "The stairs on your way in",
      tip: "Two or three floors is enough, and it is the cheapest movement of the day.",
    },
    {
      id: "note:standup", type: "neat", at: 15 * 60, coins: 3,
      verb: "Stand", name: "Through one meeting",
      tip: "Long sitting quietly undoes a good lunch. One meeting on your feet breaks it up.",
    },
    {
      id: "note:tea", type: "neat", at: 17 * 60 + 30, coins: 3,
      verb: "Walk", name: "For ten minutes after your tea",
      tip: "A walk after a meal does more than the same walk before it.",
    },
    {
      id: "note:dinner", type: "neat", at: 21 * 60, coins: 3,
      verb: "Walk", name: "For ten minutes after dinner",
      tip: "This one settles the meal you just had, and your night starts from there.",
    },
  ],
};

/* The small movements, which is every task in the plan that is not the session
   and not the step goal. One tap each, and unlike a tip they file a record and
   pay for it. */
export const MOVE_NEAT = MOVE_PLAN.tasks.filter((t) => t.type === "neat");
export const MOVE_SESSION = MOVE_PLAN.tasks.find((t) => t.type === "exercise");

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
    planAssigned, eatDivisions, mealsLogged, exLogs,
    sleepMins, daySteps, water, ticks, skipped, planOption, measureRows, moodLabel,
    healthSync, healthSource, weekInsight, weekMode, weekReads, phaseMode,
  } = w;

  const itemsIn = (id) => mealsLogged.filter((m) => m.division === id).flatMap((m) => m.items);
  const rows = [];

  /* Sleep opens the day because the morning is when you know the answer. It is
     asked first and it is the only row about last night. */
  rows.push({
    /* Sat at minute zero to sort first, which was harmless while the day
       started at midnight. It does not survive a day that turns over at five:
       midnight is the night still running, so the row about last night filed
       itself under tonight. It opens the morning instead, which is the hour
       somebody actually knows the answer.

       A device reads it rather than the person writing it down, so it is a
       sync like the body scan and the glucose monitor. Once the reading lands
       the row shows it: a task that says only "done" throws away the one
       number the sync went and got. */
    id: "sleep", pillar: "mind", at: 5 * 60, coins: 5,
    cat: "device", name: "Last night's sleep",
    kind: "go", to: "sleep",
    done: sleepMins !== null,
    // The reading is on its way in, so the row says so where it will land.
    syncing: healthSync === "sleep",
    result: sleepMins === null ? null : hoursMins(sleepMins) + " last night",
  });

  /* The parts of the plan that are not food. They come off the meal they hang
     off rather than being written out here as well, so the day's list and the
     Eat screen cannot end up asking for different capsules. */
  if (planAssigned)
    eatDivisions.forEach((d) =>
      (d.notes || []).forEach((n) =>
        rows.push({
          // A nudge belongs to the habit it serves rather than to the meal it
          // hangs off, so it can name its own pillar and most do not.
          id: n.id, pillar: n.pillar || "eat", at: n.at,
          verb: n.verb, name: n.name,
          when: n.when,
          tip: n.tip,
          kind: "tick",
          done: ticks.includes(n.id),
        })
      )
    );

  /* The coach's small movements, straight off the plan.

     `scores: true` is what separates these from the coach's nudges. A nudge
     pays nothing, files nothing and cannot move a number, which is the rule
     that kept the stairs out of Momentum for good reason: it was worth twenty
     points for a tap nobody had to earn. These are assigned tasks that happen
     to take one tap, so they file a record and pay for it, and Momentum reads
     them. Same gesture, different standing. */
  if (planAssigned)
    MOVE_NEAT.forEach((n) =>
      rows.push({ ...n, pillar: "move", kind: "tick", scores: true, done: ticks.includes(n.id) })
    );

  /* The body scan goes before anything is eaten or drunk.

     A composition reading moves with a glass of water, so a scan taken after
     breakfast is measuring the breakfast. It sits ahead of the first meal on
     the list for that reason rather than for tidiness, and the row says so:
     somebody who is not told will do it whenever they get to it, and then the
     number their coach reads is the wrong number.

     Only the scale. A glucose monitor is not a fasting reading and moving it
     up would put a row before breakfast that has no reason to be there. */
  measureRows.forEach((m) => {
    const fasting = m.id === "measure";
    rows.push({
      id: "sync:" + m.id, pillar: "measure", at: fasting ? 5 * 60 + 30 : 7 * 60 + 30, coins: 10,
      cat: "device", name: m.name,
      when: fasting ? "5:30 AM" : "7:30 AM",
      tip: fasting ? "We recommend taking this before you eat or drink anything." : null,
      kind: "go", to: "measure",
      done: m.done,
    });
  });

  eatDivisions.forEach((d) => {
    const mine = itemsIn(d.id);
    const opts = planAssigned ? d.plan || [] : [];
    /* Which option is showing. Whatever was actually eaten wins over whatever
       was last tapped, so the row cannot show option two while option one is
       sitting logged underneath it. */
    const eaten = opts.findIndex((o) => o.some((it) => mine.some((x) => x.id === it.id)));
    const picked = planOption[d.id];
    const oi = Math.max(0, Math.min(eaten >= 0 ? eaten : picked ?? 0, opts.length - 1));
    const optIds = (opts[oi] || []).map((x) => x.id);
    const mineIds = new Set(mine.map((x) => x.id));
    // What the coach asked for that has not gone in yet.
    const outstanding = optIds.filter((id) => !mineIds.has(id));
    const fromPlan = optIds.some((id) => mineIds.has(id));
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
      // Which of the coach's items are already in, so the block can strike
      // them one at a time rather than all at once.
      loggedIds: mine.map((x) => x.id),
      outstanding,
      // Whether what went in came off the coach's option at all. Somebody who
      // ate their own food has not part-finished a plan, they have finished a
      // meal, and the sheet needs to tell those two apart.
      fromPlan,
      kind: "go", to: "eat:" + d.id,
      /* A meal is logged the moment anything goes in, three of the coach's
         four included. Holding the row open over the fourth read as though
         the meal had not happened, which is not what somebody who has eaten
         wants to see. What is still owed shows as the unstruck item in the
         block underneath, and the sheet offers to log it. */
      done: mine.length > 0,
    });
  });

  /* The week, once there is one. An insight nobody finds is an insight nobody
     has, so it comes to the day rather than waiting to be discovered three
     taps inside a pillar.

     Two shapes. As one task it is a Measure row in the evening that opens the
     whole week at once, Measure being the pillar that means knowing. As three
     it is one read per pillar, each at the hour that pillar is on your mind:
     sleep in the morning, movement in the afternoon, food after dinner.

     Only once a plan is in. A week read is the coach's reading of a week you
     spent on their plan, so before one exists there is nothing for it to be
     about. */
  if (planAssigned && weekInsight && weekInsight !== "off") {
    const readAll = weekInsight === "read";
    if (weekMode === "sheet")
      rows.push({
        id: "weekread", pillar: "measure", at: 18 * 60 + 30, coins: 5,
        cat: "insight", name: "Your week with KAIRA",
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

  /* Two glasses is one ask, not a counter to fill. A plus and a bar made a row
     you tick into a row you visit twice, and a half full bar said less than the
     sentence above it already does.

     How much to drink is a number somebody sets for you, so without a coach
     there is no target to ask for. It becomes a record instead: drink what you
     drink and say so, and the figure arrives with the plan. */
  rows.push({
    id: "water", pillar: "eat", at: 14 * 60, coins: 3,
    ...(planAssigned
      ? {
          verb: "Drink", name: WATER_GOAL + " glasses of water",
          tip: "Avoid drinking water right before you eat.",
          done: water >= WATER_GOAL,
        }
      : {
          verb: "Log", name: "Your water intake",
          done: water > 0,
        }),
    kind: "target", to: "water",
  });

  /* The coach's session, at the hour the plan puts it: the morning, where the
     day has the best chance of it actually happening.

     ONE SESSION, AND ONLY ONE. There were two for a while, a five minute
     stretch at seven and a half hour routine before dinner, and between them
     they made the exercise half of the plan worth twice what the whole of the
     rest of the day was. The stretch's flow is still in the code, unused, for
     the day a coach wants both.

     Without a plan it is an open ask with no clock on it, because nobody has
     earned the right to give this person a time yet. */
  rows.push(
    planAssigned
      ? {
          ...MOVE_SESSION,
          pillar: "move",
          kind: "go",
          done: exLogs.some((e) => e.id === "routine"),
        }
      : {
          id: "session", pillar: "move", at: 16 * 60, coins: 10,
          cat: "record", name: "20 minutes of movement",
          tip: "A walk to the shop counts. So do the stairs.",
          kind: "go", to: "move",
          done: exLogs.length > 0,
        }
  );

  /* How the day felt, which is the half of Mind no device reads. It asked for
     a calm break for a while, which is a thing to do rather than a thing to
     record, and left the app with nothing to show for it. A mood is one tap
     and it is the reading the psychologist actually wants. */
  rows.push({
    id: "calm", pillar: "mind", at: 21 * 60, coins: 5,
    cat: "record", name: "Your mood",
    kind: "go", to: "mind:mood",
    done: !!moodLabel,
    result: moodLabel ? "You felt " + moodLabel.toLowerCase() : null,
  });

  /* The psychologist's worksheets are not here on purpose. They are a plan
     artefact rather than a daily task: one is filled once and one comes back
     every night, and between them they put two more Mind rows on a day that
     already has sleep, the sun nudge and the calm break. They live on Mind,
     where ToolList lists them and shows which are filled. */

  /* A step target is a coach's number, so it waits for a coach. Without a
     plan the day asks for movement without putting a figure on it, because
     ten thousand is a thing somebody decided for you and nobody has yet. */
  if (planAssigned)
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
