import React, { useState, useRef } from "react";
import Bubbles from "./Bubbles";
import { PILLAR, TEXT, TEXT_2, MUTED, FAINT, BG, BG_ALT, BG_SUNK, BORDER, GREEN, GREEN_TINT, SH_SM } from "../tokens";

/* A sandbox for the bubble rule.

   Four columns for the four parts of the day. Put tasks where you want them,
   tick them off, throw them away, and watch the bubbles answer. Everything the
   bubbles say comes off this board, so there is nothing to set by hand and
   nothing that can disagree with what is on screen. */

/* The four parts, and the minute each one starts, on the Indian hours the app
   already runs on: shaam from four, raat from seven. */
const PARTS = [
  { id: "morning",   name: "Morning",   hours: "5 AM to 12 PM", from: 5 * 60 },
  { id: "afternoon", name: "Afternoon", hours: "12 PM to 4 PM", from: 12 * 60 },
  { id: "evening",   name: "Evening",   hours: "4 PM to 7 PM",  from: 16 * 60 },
  { id: "night",     name: "Night",     hours: "7 PM to 5 AM", from: 19 * 60 },
];
/* What the big bubble says once it has a score. It replaces the pillar's name
   there, because a label plus a number is two things to read and neither of
   them asks for anything. The colour and the seat already say which pillar it
   is, so the words can be spent on the nudge instead.

   Mind is the only one that changes through the day: easing into a morning and
   winding down at night are opposite ends of the same pillar. */
const NUDGE = {
  eat:     { any: "Time to eat" },
  move:    { any: "Time to move" },
  mind:    { morning: "Ease into your day", night: "Time to wind down", any: "Take a breather" },
  measure: { any: "Time for a reading" },
};
const nudgeFor = (pillar, part) => NUDGE[pillar][part] || NUDGE[pillar].any;

/* Whose hour it is, when nothing else separates them.

   Four pillars on the same score is a real tie and somebody has to break it,
   and the honest answer is that each part of the day has a pillar it belongs
   to: breakfast sets the morning, a reading suits the flat middle of the day,
   the session goes before dinner, and the night is for winding down.

   It is only ever a tie-break. A pillar that is genuinely further behind still
   wins on its own, whatever hour it is. */
const SLOT_OWNER = { morning: "eat", afternoon: "measure", evening: "move", night: "mind" };

/* What Kaira says under the bubbles.

   In the product this line is generated, and these are the shapes it has to
   come out in. Every one is built the same way: a READ, which is the one true
   thing about where this pillar stands, and a LEVER, which is the specific act
   that moves it, with a real number or a real mechanism, named to the coach
   who chose it.

   She talks about the pillar in the big bubble and never about another one,
   because a card whose two halves disagree is worse than a card that says
   less. */
const KAIRA = {
  eat: {
    fresh: "Your Eat score is built from the meals you log, so it has nothing to work with yet. Log your first meal, whatever was actually on the plate, and the number appears.",
    morning: "Fibre usually runs short by the evening, and breakfast is the cheapest place to get ahead of it. The chilla option has 6 grams of the 30 you need today, so eat that one and log it.",
    afternoon: "You are at 44 grams of the 110 grams of protein you need today. The evening chana carries 9 grams on its own, which is the easiest 9 left, so make that your next meal and log it.",
    evening: "Your fibre is at 11 grams of 30 with dinner still to come. The multigrain roti option has 6 of them, so choosing that one and logging it closes most of tonight's gap.",
    night: "Finishing dinner two hours before bed gives your body the whole night for repair instead of digestion. The khichdi option is the lighter of the two, so pick that one and log it.",
  },
  move: {
    fresh: "Nothing has been logged for Move today, and sitting for long stretches quietly undoes the meals in between. Get ten minutes on your feet after your next meal and log it.",
    part: "Your session is the biggest single thing left in your day. Twenty minutes of it moves your score more than anything else you could do right now, so do it and log it.",
    any: "Your session does the most for your glucose when it lands before dinner. Half past six gives you the time, so get it done and log it.",
    night: "Walking after a meal does more for your glucose than walking before one. Take ten minutes after dinner and log the steps, and they count double.",
  },
  mind: {
    fresh: "Your body clock is set by the light you get in the first hour after waking. Ten minutes of sun before nine does more for tonight's sleep than anything you do at bedtime, so go out and tick it off.",
    part: "Sleep is the half of Mind a device can read, and how the day felt is the half only you can. Sync last night and log your mood, and both halves are in.",
    morning: "Ten minutes of sun before nine sets your body clock for the whole day, and that does more for tonight's sleep than anything you do at bedtime. Step outside and tick it off.",
    any: "How a day felt is the half of Mind no device can read for you. Log your mood in one tap and the pattern behind your weeks starts to show.",
    night: "A bedtime you keep every night does more for your glucose than the number of hours you get. Wind down now and mark it done, because the rhythm matters more than the total.",
  },
  measure: {
    fresh: "A body reading is the one number here that logging cannot give you. Take two minutes on the scale and sync it, because the next three months get built on what it says.",
    any: "A body reading is the one number here that logging cannot give you. Take two minutes on the scale and sync it, because the next three months get built on what it says.",
  },
  done: "Everything on today's list is logged. Days like this are what turn into a pattern, and four of them in a week is when it starts to show.",
  empty: "Nothing is on the day yet. Add a task to any part of the day and I will have something useful to say about it.",
};

/* Three states, the same three the bubble draws: nothing logged, something
   logged with the score still shut, and a score to talk about. */
const kairaLine = (hero, part, allDone, empty) => {
  if (empty) return KAIRA.empty;
  if (allDone || !hero) return KAIRA.done;
  const set = KAIRA[hero.id];
  if (!hero.done) return set.fresh;
  if (!hero.started) return set.part || set.fresh;
  return set[part] || set.any || set.fresh;
};

const DAY_START = 5 * 60;
const DAY_END = 23 * 60 + 55;

// Which part a minute falls in: the last one whose start it has passed.
const partAt = (m) => PARTS.reduce((f, x) => (m >= x.from ? x : f), PARTS[0]);

const fmtTime = (m) => {
  const h = Math.floor(m / 60), mm = m % 60;
  return (h % 12 === 0 ? 12 : h % 12) + ":" + String(mm).padStart(2, "0") + " " + (h >= 12 ? "PM" : "AM");
};

/* `first` is what a pillar says before it has a score. Nothing has been
   logged, so there is no percentage that would mean anything, and the honest
   thing on the biggest circle of the screen is the ask to go and log. */
const PILLARS = [
  { id: "eat", name: "Eat", first: "Log your first meal" },
  { id: "move", name: "Move", first: "Log your first movement" },
  { id: "mind", name: "Mind", first: "Log last night's sleep" },
  { id: "measure", name: "Measure", first: "Take your first reading" },
];

/* A normal day. Measure has nothing on it, which is true of most days: a body
   reading happens when one is due rather than every morning, so Measure sits
   out and never takes the middle. Adding a Measure task from a column is what
   shows the other case. */
const START = [
  { id: 1,  part: "morning",   pillar: "eat",  name: "Pre-breakfast" },
  { id: 2,  part: "morning",   pillar: "eat",  name: "Breakfast" },
  { id: 3,  part: "morning",   pillar: "mind", name: "Last night's sleep" },
  { id: 4,  part: "morning",   pillar: "mind", name: "10 min morning sun" },
  { id: 5,  part: "afternoon", pillar: "eat",  name: "Lunch" },
  { id: 6,  part: "afternoon", pillar: "eat",  name: "2 glasses of water" },
  { id: 7,  part: "evening",   pillar: "eat",  name: "Evening snack" },
  { id: 8,  part: "evening",   pillar: "move", name: "Your coach's session" },
  { id: 9,  part: "night",     pillar: "eat",  name: "Dinner" },
  { id: 10, part: "night",     pillar: "eat",  name: "Bedtime snack" },
  { id: 11, part: "night",     pillar: "move", name: "10,000 steps" },
  { id: 12, part: "night",     pillar: "mind", name: "Your mood" },
  { id: 13, part: "night",     pillar: "mind", name: "Lights out by 11" },
].map((t) => ({ ...t, done: false }));

/* A normal day in six stops. Each one is only a list of what is done by then,
   because everything else falls out of that. */
const SCENARIOS = [
  {
    id: "wake", at_: 6 * 60, part: "morning", label: "Just woke up", at: "6:00 AM", done: [3],
    story:
      "Sleep is already logged, so Mind has one of its four in. Eat has all seven of its tasks still ahead, so it has the most of its day left and takes the middle.",
  },
  {
    id: "fed", at_: 9 * 60, part: "morning", label: "Breakfast in", at: "9:00 AM", done: [3, 1, 2],
    story:
      "Both morning meals are in. Eat has nothing else this morning, so it steps back to its corner, and the ten minutes of sun is the last thing open. Mind takes the middle.",
  },
  {
    id: "lunch", at_: 13 * 60, part: "afternoon", label: "Lunchtime", at: "1:00 PM", done: [3, 1, 2, 4],
    story:
      "The morning is clear, so the day moved on by itself. The afternoon is all Eat, and lunch is the next thing on it.",
  },
  {
    id: "afternoon", at_: 16 * 60, part: "evening", label: "Late afternoon", at: "4:00 PM", done: [3, 1, 2, 4, 5, 6],
    story:
      "Eat is more than half done. Move has not started at all, so it has the most left of anything, and the coach's session takes the middle.",
  },
  {
    id: "bed", at_: 22 * 60, part: "night", label: "Getting late", at: "10:00 PM", done: [3, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11],
    story:
      "Everything else is in. Mind has slipped through the day with your mood and bedtime still open, so it has the most left and asks for the one thing that still helps at ten o'clock.",
  },
  {
    id: "good", at_: 23 * 60, part: "night", label: "A day that went well", at: "11:00 PM",
    done: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    story:
      "Everything is done. There is nothing to single out, so the four go back to the same size and simply float.",
  },
  {
    id: "blank", at_: 6 * 60, part: "morning", label: "Start blank", at: "Empty", blank: true, done: [],
    story:
      "Nothing on the board at all. Add a task to any part of the day with the buttons under each column, and watch which pillar comes forward and why.",
  },
];

let nextId = 100;

export default function Play() {
  const [scen, setScen] = useState("wake");
  const [minute, setMinute] = useState(6 * 60);
  const [tasks, setTasks] = useState(() =>
    START.map((t) => ({ ...t, done: SCENARIOS[0].done.includes(t.id) }))
  );
  const dragId = useRef(null);
  const [overPart, setOverPart] = useState(null);

  /* Where you are in the day, on the slider. It is a control here rather than
     a clock, because the whole point of this page is to stand at any hour with
     any set of tasks and see what the bubbles do. */
  const nowPart = partAt(minute);

  /* Each pillar, as its own day. `left` out of `total` is the whole of it:
     the bigger the share still to do, the more that pillar needs you. */
  const ranked = PILLARS.map((p) => {
    const mine = tasks.filter((t) => t.pillar === p.id);
    const done = mine.filter((t) => t.done).length;
    const openNow = nowPart
      ? mine.filter((t) => t.part === nowPart.id && !t.done).sort((a, b) => a.id - b.id)
      : [];
    return {
      ...p,
      total: mine.length,
      done,
      left: mine.length - done,
      /* The score, and it is the pillar's own day rather than anything set by
         hand. Null until something has been logged, because a percentage of
         nothing is a figure nobody has earned. */
      score: mine.length && done ? Math.round((done / mine.length) * 100) : mine.length ? 0 : null,
      started: done > 0,
      openNow,
      // Only a pillar with something open right now can take the middle.
      can: openNow.length > 0,
      nudge: nudgeFor(p.id, nowPart.id),
    };
  }).sort((a, b) => {
    const owner = SLOT_OWNER[nowPart.id];
    const sc = (x) => (x.score === null ? Infinity : x.score);
    return (
      // Something open right now comes first, then anything left later today.
      b.can - a.can ||
      (b.left > 0) - (a.left > 0) ||
      // Lowest score, which is the whole idea: the one furthest from done.
      sc(a) - sc(b) ||
      // Level on score, so the hour decides.
      (b.id === owner) - (a.id === owner) ||
      b.openNow.length - a.openNow.length ||
      PILLARS.findIndex((x) => x.id === a.id) - PILLARS.findIndex((x) => x.id === b.id)
    );
  });

  /* Three quiet states, and they mean different things. Nothing on the board
     at all, a day somebody has finished, and an hour with nothing in it while
     the day still has more to come. */
  const empty = tasks.length === 0;
  const allDone = tasks.length > 0 && tasks.every((t) => t.done);
  // Nothing due in this part of the day, though the day is not over.
  const quiet = !ranked.some((p) => p.can) && !allDone && !empty;
  /* Only a finished day flattens the four. An hour with nothing due still has
     a pillar worth pointing at, and four identical circles would say the day
     had no shape at all. */
  const settled = allDone || empty;
  const order = ranked.map((p, i) => ({ ...p, hero: !settled && i === 0 && p.left > 0 }));
  const hero = order[0] && order[0].hero ? order[0] : null;
  const here = SCENARIOS.find((x) => x.id === scen) || null;

  // Touching anything by hand leaves the scenario, because the strip would
  // otherwise claim to be showing a day that is no longer on screen.
  const own = () => setScen(null);
  const move = (id, part) => { own(); setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, part } : t))); };
  const toggle = (id) => { own(); setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t))); };
  const remove = (id) => { own(); setTasks((ts) => ts.filter((t) => t.id !== id)); };
  const add = (part, pillar) => {
    own();
    setTasks((ts) => ts.concat({ id: nextId++, part, pillar, name: "New " + pillar + " task" + pillar + " task", done: false }));
  };
  const play = (x) => {
    setScen(x.id);
    setMinute(x.at_);
    setTasks(x.blank ? [] : START.map((t) => ({ ...t, done: x.done.includes(t.id) })));
  };

  return (
    <div style={{ minHeight: "100vh", background: BG_ALT, fontFamily: "Roboto, system-ui, sans-serif", color: TEXT_2, padding: "28px 22px 60px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: GREEN }}>Sandbox</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, color: TEXT, marginBottom: 8, fontWeight: 600 }}>Move the day around.</h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, maxWidth: 700, marginBottom: 22 }}>
          Walk a normal day with the buttons below, or build one yourself: start blank, add tasks to any part of the day, then slide from morning to night and watch what the bubbles do. Everything they say comes off this board.
        </p>

        {/* A day in six stops */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
            {SCENARIOS.map((x) => {
              const on = scen === x.id;
              return (
                <button key={x.id} onClick={() => play(x)}
                  style={{ fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, padding: "8px 14px", borderRadius: 999,
                    border: "1px solid " + (on ? GREEN : BORDER), background: on ? GREEN_TINT : BG, color: on ? GREEN : MUTED, cursor: "pointer" }}>
                  {x.label}
                </button>
              );
            })}
            {!scen && <span style={{ alignSelf: "center", fontSize: 12.5, fontWeight: 600, color: FAINT, padding: "0 4px" }}>Your own day</span>}
          </div>

          <div style={{ background: BG, border: "1px solid " + BORDER, borderRadius: 14, padding: "14px 16px", boxShadow: SH_SM, display: "flex", gap: 14, alignItems: "flex-start" }}>
            <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 800, letterSpacing: 0.6, color: GREEN, background: GREEN_TINT, borderRadius: 8, padding: "5px 9px", minWidth: 68, textAlign: "center" }}>
              {here ? here.at : "Any time"}
            </span>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: TEXT_2, margin: 0 }}>
              {here ? here.story : "You are moving the day around yourself now. Tick something off or drag it somewhere else, and watch which pillar comes forward."}
            </p>
          </div>
        </div>

        {/* Where you are in the day, as a real clock rather than four stops.
            The handle moves minute by minute so you can stand anywhere, and
            the marks under it show where the day actually turns over. */}
        <div style={{ background: BG, border: "1px solid " + BORDER, borderRadius: 14, padding: "14px 18px 12px", boxShadow: SH_SM, marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: MUTED }}>
              Where you are in the day
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: GREEN, fontVariantNumeric: "tabular-nums" }}>
              {fmtTime(minute)} <span style={{ color: FAINT, fontWeight: 400 }}>&middot; {nowPart.name}</span>
            </span>
          </div>

          <input
            type="range" min={DAY_START} max={DAY_END} step="5" value={minute}
            aria-label="Time of day"
            aria-valuetext={fmtTime(minute) + ", " + nowPart.name}
            onChange={(e) => { own(); setMinute(+e.target.value); }}
            style={{ width: "100%", accentColor: GREEN, cursor: "pointer", display: "block" }}
          />

          {/* The four names sit where their part begins rather than spread out
              evenly, so the strip reads as a day rather than as four buttons. */}
          <div style={{ position: "relative", height: 26, marginTop: 2 }}>
            {PARTS.map((f) => {
              const pct = ((f.from - DAY_START) / (DAY_END - DAY_START)) * 100;
              const on = nowPart.id === f.id;
              return (
                <span key={f.id} style={{ position: "absolute", left: pct + "%", top: 0, transform: "translateX(-2px)" }}>
                  <span aria-hidden style={{ display: "block", width: 1.5, height: 5, borderRadius: 1, background: on ? GREEN : BORDER, marginLeft: 2 }} />
                  <span style={{ display: "block", fontSize: 10.5, fontWeight: on ? 700 : 500, color: on ? GREEN : FAINT, marginTop: 3, whiteSpace: "nowrap" }}>
                    {f.name}
                  </span>
                </span>
              );
            })}
          </div>
        </div>

        {/* The bubbles, and the working underneath */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}>
          <div style={{ background: BG, border: "1px solid " + BORDER, borderRadius: 20, padding: "16px 14px 12px", boxShadow: SH_SM }}>
            <Bubbles order={order} />
            <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: MUTED, marginTop: 2 }}>
              {empty ? "Nothing on the day yet"
                : allDone ? "Day finished"
                : hero
                ? <>{nowPart.name} &middot; <span style={{ color: GREEN }}>{hero.name}</span> needs you</>
                : nowPart.name}
            </div>
            {/* Her line sits where it sits on Home: under the scores and above
                the tasks, because joining those two is the whole of her job. */}
            <div style={{ display: "flex", gap: 9, alignItems: "flex-start", marginTop: 14, paddingTop: 12, borderTop: "1px solid " + BORDER, textAlign: "left", maxWidth: 330 }}>
              <span style={{ width: 17, height: 18.5, flexShrink: 0, marginTop: 1, background: "linear-gradient(150deg, " + GREEN + " 0%, #2A805A 100%)", clipPath: "polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 8, fontWeight: 800 }}>K</span>
              <span style={{ fontSize: 12, color: MUTED, lineHeight: 1.55 }}>
                {kairaLine(hero, nowPart.id, allDone, empty)}
              </span>
            </div>

            {(settled || quiet) && (
              <div style={{ textAlign: "center", fontSize: 11.5, color: FAINT, marginTop: 4, lineHeight: 1.45, maxWidth: 300 }}>
                {empty
                  ? "Add a task to any part of the day below."
                  : allDone
                  ? "Nothing is waiting, so nothing is singled out."
                  : "Nothing is due this " + nowPart.name.toLowerCase() + ". Its next one is later today."}
              </div>
            )}
          </div>

        </div>

        {/* The four columns */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14, alignItems: "start" }}>
          {PARTS.map((f) => {
            const mine = tasks.filter((t) => t.part === f.id);
            const open = mine.filter((t) => !t.done).length;
            const isNow = nowPart && nowPart.id === f.id;
            return (
              <div key={f.id}
                onDragOver={(e) => { e.preventDefault(); setOverPart(f.id); }}
                onDragLeave={() => setOverPart((p) => (p === f.id ? null : p))}
                onDrop={(e) => { e.preventDefault(); if (dragId.current != null) move(dragId.current, f.id); dragId.current = null; setOverPart(null); }}
                style={{ background: overPart === f.id ? GREEN_TINT : BG, border: "1px solid " + (isNow ? GREEN : BORDER), borderRadius: 16, padding: 12, minHeight: 200, boxShadow: SH_SM, transition: "background .15s" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>{f.name}</span>
                  <span style={{ fontSize: 11, color: MUTED }}>{open} open</span>
                </div>
                <div style={{ fontSize: 10.5, color: FAINT, marginBottom: 10 }}>
                  {f.hours}
                  {isNow && <span style={{ color: GREEN, fontWeight: 700 }}> &middot; you are here</span>}
                </div>

                {mine.map((t) => (
                  <Card key={t.id} t={t}
                    onPick={(id) => { dragId.current = id; }}
                    onDrop={() => { dragId.current = null; }}
                    onToggle={toggle} onRemove={remove} />
                ))}
                {mine.length === 0 && (
                  <div style={{ fontSize: 12, color: FAINT, textAlign: "center", padding: "18px 6px" }}>Drop a task here</div>
                )}

                <div style={{ display: "flex", gap: 5, marginTop: 10, flexWrap: "wrap" }}>
                  {PILLARS.map((p) => (
                    <button key={p.id} onClick={() => add(f.id, p.id)} title={"Add an " + p.name + " task to " + f.name}
                      style={{ flex: 1, minWidth: 44, fontFamily: "inherit", fontSize: 10.5, fontWeight: 700, padding: "6px 4px", borderRadius: 8,
                        border: "1px solid " + BORDER, background: PILLAR[p.id].w, color: PILLAR[p.id].c, cursor: "pointer" }}>
                      + {p.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={() => play(SCENARIOS[0])}
          style={{ marginTop: 20, fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: MUTED, background: "none", border: "1px solid " + BORDER, borderRadius: 10, padding: "9px 14px", cursor: "pointer" }}>
          Back to the start of the day
        </button>

        <Rules />
        <KairaRules />
      </div>
    </div>
  );
}

/* The whole rule, in the fewest words it survives. It sits at the foot rather
   than the top because it reads far better once somebody has already watched
   the bubbles move. */
function Rules() {
  const steps = [
    ["Each pillar carries its own score.", "In the product that is a real one: Eat is your nutrition sufficiency against the macros your coach set, Move is Momentum, and Mind gets its own. Here it is stood in for by how much of that pillar's day is logged, so you can move it by ticking things rather than by setting a dial."],
    ["Whatever is due right now comes first.", "A pillar with something open in this part of the day outranks one whose next thing is hours away. With nothing due at all, the one furthest behind still takes the middle."],
    ["Among those, the lowest score goes in the middle.", "It is the one furthest from where it should be, so it is where the next hour is worth the most."],
    ["Level on score, and the hour decides.", "The morning belongs to Eat, the afternoon to Measure, the evening to Move and the night to Mind. It only ever breaks a tie: a pillar genuinely further behind still wins on its own, whatever the hour. Anything still level after that falls back to the Eat, Move, Mind, Measure order, so the same day always gives the same answer."],
    ["Before anything is logged there is no score, so it asks you to log.", "A percentage of nothing means nothing, and on the biggest circle of the screen the honest thing is the ask. From the first log onward it is a plain percentage."],
    ["When it is all done, nothing is singled out.", "The four go back to the same size. Nobody is behind on a day they have finished."],
  ];
  return (
    <div style={{ marginTop: 40, background: BG, border: "1px solid " + BORDER, borderRadius: 20, padding: "26px 26px 22px", boxShadow: SH_SM }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: GREEN, marginBottom: 8 }}>The whole rule</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: TEXT, fontWeight: 600, marginBottom: 18 }}>
        How the big one is picked.
      </h2>
      <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 15, padding: 0, maxWidth: 760 }}>
        {steps.map(([t, b], i) => (
          <li key={t} style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
            <span style={{ width: 26, height: 26, flexShrink: 0, borderRadius: 999, background: GREEN_TINT, color: GREEN, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
            <span>
              <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: TEXT, lineHeight: 1.4 }}>{t}</span>
              <span style={{ display: "block", fontSize: 13.5, color: MUTED, lineHeight: 1.55, marginTop: 2 }}>{b}</span>
            </span>
          </li>
        ))}
      </ol>
      <p style={{ fontSize: 13, color: FAINT, lineHeight: 1.6, marginTop: 18, maxWidth: 760 }}>
        Measure sits out most days, because a body reading happens when one is due rather than every morning. Add a Measure task to any column to see it join in.
      </p>
    </div>
  );
}

/* How her line is put together, said next to the rule that picks the bubble,
   because the two are one decision: she is only ever talking about the pillar
   in the middle. */
function KairaRules() {
  const slots = [
    ["The read", "The one true thing about where that pillar stands right now. It is never the number above her, which the bubble already shows, and never the list below her, which the rows already are."],
    ["The lever", "The specific act that moves it, with a real quantity or a real mechanism, named to the coach who chose it. Six grams of fibre. Half past six, before dinner. Sahana picked it."],
    ["The opener", "A greeting and the person's name. It earns its place about once a day, on the first open of the morning. By the afternoon it is a machine marking time."],
    ["The release", "Permission, and only when it is needed: a thin day, a skipped task, a first day, a broken run. A smaller day is a real answer and should read like one."],
  ];
  const nevers = [
    ["Reading the screen back", "You have 10 tasks left today, and breakfast is next."],
    ["A greeting with nothing in it", "Good morning Shaheer, it is good to see you here."],
    ["Repeating the number above her", "Your Eat score is at 35 percent today."],
    ["Encouragement true of anyone", "You are doing really well, keep it up."],
    ["The streak as a threat", "Do not break your 11 day streak now."],
    ["Talking about the app", "Tap the Eat bubble to see your score."],
  ];
  return (
    <div style={{ marginTop: 22, background: BG, border: "1px solid " + BORDER, borderRadius: 20, padding: "26px 26px 22px", boxShadow: SH_SM }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: GREEN, marginBottom: 8 }}>Kaira</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: TEXT, fontWeight: 600, marginBottom: 10 }}>
        How her line is built.
      </h2>
      <p style={{ fontSize: 14.5, lineHeight: 1.6, maxWidth: 760, marginBottom: 20 }}>
        She sits between the scores and the tasks, and that position is her job. The scores say where you stand, the tasks say what to do, and she is the only thing that can say <b style={{ color: TEXT }}>which task moves which score, and by how much</b>. Anything she says that does not join those two halves is a wasted line. She always talks about the pillar in the big bubble, so the card never argues with itself.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginBottom: 22 }}>
        {slots.map(([t, b], i) => (
          <div key={t} style={{ background: i < 2 ? GREEN_TINT : BG_ALT, border: "1px solid " + BORDER, borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: i < 2 ? GREEN : FAINT, marginBottom: 5 }}>
              {i < 2 ? "Always" : "Sometimes"}
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: TEXT, marginBottom: 3 }}>{t}</div>
            <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{b}</div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 14.5, lineHeight: 1.6, maxWidth: 760, marginBottom: 14 }}>
        <b style={{ color: TEXT }}>Being specific is what makes her warm.</b> A greeting that would work for any person on any day is what makes a line feel like a machine being friendly. Her warmth comes from three things and none of them is a pleasantry: she names the coach who chose it, she uses numbers that are only yours, and she assumes the best of you.
      </p>

      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: MUTED, margin: "20px 0 10px" }}>
        Never, however well it reads
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 10 }}>
        {nevers.map(([t, ex]) => (
          <div key={t} style={{ background: "#FEF3F2", border: "1px solid #FEE4E2", borderRadius: 12, padding: "11px 14px" }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#B42318", marginBottom: 2 }}>{t}</div>
            <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, fontStyle: "italic" }}>{ex}</div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 13, color: FAINT, lineHeight: 1.6, marginTop: 18, maxWidth: 760 }}>
        In the product the line is generated, and everything above is the shape it has to come out in. What it is given: the pillar in the middle and its score, the tasks open in this part of the day, what the coach actually planned for them, the person's own numbers against their targets, the care team's names, and how the run is going.
      </p>
    </div>
  );
}

/* One task. The whole card drags, the circle ticks it off, and the cross
   throws it away. Three things, three places, nothing behind a menu. */
function Card({ t, onPick, onDrop, onToggle, onRemove }) {
  const c = PILLAR[t.pillar];
  return (
    <div draggable
      onDragStart={(e) => { onPick(t.id); e.dataTransfer.setData("text/plain", String(t.id)); e.dataTransfer.effectAllowed = "move"; }}
      onDragEnd={onDrop}
      style={{ display: "flex", alignItems: "flex-start", gap: 8, background: t.done ? BG_SUNK : BG,
        border: "1px solid " + (t.done ? BORDER : c.t), borderLeft: "3px solid " + (t.done ? BORDER : c.c),
        borderRadius: 10, padding: "8px 9px", marginBottom: 6, cursor: "grab", opacity: t.done ? 0.6 : 1 }}>
      <button onClick={() => onToggle(t.id)}
        aria-label={(t.done ? "Mark " : "Mark ") + t.name + (t.done ? " as not done" : " done")}
        style={{ width: 17, height: 17, flexShrink: 0, marginTop: 1, borderRadius: "50%",
          border: "1.5px solid " + (t.done ? c.c : BORDER), background: t.done ? c.c : "transparent",
          color: "#fff", fontSize: 10, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}>
        {t.done ? "✓" : ""}
      </button>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: TEXT, textDecoration: t.done ? "line-through" : "none" }}>{t.name}</span>
        <span style={{ display: "block", fontSize: 10.5, color: MUTED, marginTop: 1 }}>{t.pillar}</span>
      </span>
      <button onClick={() => onRemove(t.id)} aria-label={"Remove " + t.name}
        style={{ flexShrink: 0, background: "none", border: "none", color: FAINT, fontSize: 15, lineHeight: 1, cursor: "pointer", padding: "0 2px" }}>×</button>
    </div>
  );
}
