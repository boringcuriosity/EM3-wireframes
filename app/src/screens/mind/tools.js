import { Target, Compass, RefreshCw, AlertCircle, CalendarDays, NotebookPen } from "lucide-react";

/* What Mind actually offers, taken from the live app: a check-in, a breathing
   exercise, an affirmation, and somewhere to write. Kept as data so the copy
   can change without touching layout, the same way the pillar science is.

   One plain list. There used to be a "Your coach recommended this today"
   heading over the breathing exercise, which appeared for people who had no
   coach, and split four short cards into two sections to say something about
   one of them. What a coach actually assigns is below, and it is a different
   kind of thing entirely. */

export const MOODS = [
  { id: "happy", label: "Happy", e: "🙂" },
  { id: "calm", label: "Calm", e: "😌" },
  { id: "neutral", label: "Neutral", e: "😐" },
  { id: "sad", label: "Sad", e: "🙁" },
  { id: "stressed", label: "Stressed", e: "😣" },
  { id: "irritated", label: "Irritated", e: "😤" },
  { id: "tired", label: "Tired", e: "🥱" },
];

export const AFFIRMATIONS = [
  "I release what no longer serves me.",
  "One steady day is worth more than one perfect one.",
  "My body is doing its work, even when I cannot feel it.",
  "I can begin again at the next meal.",
];

export const JOURNAL_PROMPTS = [
  "What is something you would like to let go of?",
  "What went well today that you did not expect?",
  "When did you feel most like yourself this week?",
];

export const MIND_TOOLS = [
  {
    id: "mood",
    label: "Mood check-in",
    line: "How are you feeling right now?",
    minutes: 0,
  },
  {
    id: "breathing",
    label: "Breathing",
    line: "A guided exercise to settle your body down.",
    minutes: 3,
  },
  {
    id: "affirmation",
    label: "Affirmation",
    line: "One line to carry into the rest of the day.",
    minutes: 1,
  },
  {
    id: "journal",
    label: "Journaling",
    line: "Write it down and it stops going round.",
    minutes: 5,
  },
];

/* What a psychologist assigns after the consultation.

   Mind's plan is not a set of practices at hours, the way Eat's is meals and
   Move's is exercises. It is worksheets: a thing to think about and write down.
   So the record is what you wrote, and filling one is what finishes it.

   `cadence` is the word the live version is missing. "Fill 1 time" says how
   often but never when, and how often is what decides whether a worksheet
   belongs on today's list.

   `kind` is the shape of the form, and three shapes cover all of them: a list
   of written answers, a list you add items to, and a week you fill a day at a
   time. A new worksheet is an entry here, not a screen. */
export const MIND_TEMPLATES = [
  /* What you want to bring to the next session, which is a worksheet like any
     other and gets the same sheet. `strip` draws it as a band above the rest
     rather than as a card in the list, because it is the frame the others sit
     inside: everything below is what she asked for, and this is what you want
     to raise. Its cadence is a session rather than a day or a week, so it
     never lands on the day's list. */
  {
    id: "presession",
    name: "Before your next session",
    line: "What you want to bring to it.",
    Icon: NotebookPen,
    save: "Save notes",
    task: "Your session notes",
    cadence: "session",
    strip: true,
    kind: "fields",
    fields: [
      { id: "week", label: "How was your week?", hint: "Challenges, events, anything that stuck" },
      { id: "homework", label: "How did the homework go?", hint: "What worked, what did not, what surprised you" },
    ],
  },
  {
    id: "smart",
    name: "SMART goal",
    line: "One clear goal, broken down until it is doable.",
    Icon: Target,
    /* The button names the worksheet rather than the person, because a
       psychologist reads all of them and only one of them is this. `task` is
       the same name as the day's list says it. Both are written out rather
       than composed, since "SMART" survives no rule that changes a case. */
    save: "Save SMART goal",
    task: "Your SMART goal",
    cadence: "once",
    kind: "fields",
    fields: [
      { id: "goal", label: "My goal", hint: "What do you want to achieve?" },
      { id: "s", tag: "S", label: "Specific", hint: "What exactly will you do?" },
      { id: "m", tag: "M", label: "Measurable", hint: "How will you know when it is done?" },
      { id: "a", tag: "A", label: "Actionable", hint: "What are the concrete steps?" },
      { id: "r", tag: "R", label: "Realistic", hint: "Is this achievable with what you have?" },
      { id: "t", tag: "T", label: "Time-bound", hint: "When will you complete this?" },
    ],
  },
  {
    id: "motivation",
    name: "Motivation check-in",
    line: "What is hard right now, and one small way forward.",
    Icon: Compass,
    save: "Save check-in",
    task: "Your motivation check-in",
    cadence: "day",
    kind: "fields",
    fields: [
      { id: "hard", label: "What feels difficult right now?", hint: "Name what is challenging you" },
      { id: "why", label: "Why do I think this is happening?", hint: "Explore possible reasons" },
      { id: "lighter", label: "What could make this feel lighter?", hint: "What support or change might help" },
      { id: "step", label: "One small thing I can do today", hint: "A tiny, doable step forward" },
    ],
  },
  {
    id: "reframe",
    name: "Reframing a thought",
    line: "Take one thought and hold it up to the evidence.",
    Icon: RefreshCw,
    save: "Save reframing",
    task: "Your thought reframe",
    cadence: "week",
    kind: "fields",
    fields: [
      { id: "thought", label: "My negative thought", hint: "Write it as you hear it" },
      { id: "for", label: "Evidence for my thought", hint: "What makes it feel true" },
      { id: "against", label: "Evidence against my thought", hint: "What argues with it" },
      { id: "new", label: "A more realistic version", hint: "How would you say it to a friend" },
    ],
  },
  {
    id: "worry",
    name: "The worry tree",
    line: "Decide what to do with each worry, one at a time.",
    Icon: AlertCircle,
    save: "Save worry tree",
    task: "Your worry tree",
    cadence: "week",
    kind: "list",
    addLabel: "Add a worry",
    empty: "No worries written down yet.",
  },
  {
    id: "tracker",
    name: "Motivation tracker",
    line: "What keeps you going, and how each day of the week felt.",
    Icon: CalendarDays,
    save: "Save tracker",
    task: "Your motivation tracker",
    cadence: "week",
    kind: "week",
  },
];

// How often, said as the person would say it rather than as a count.
export const CADENCE = { once: "Fill once", day: "Every day", week: "This week", session: "Before your session" };

export const MOTIVATION_LEVELS = [
  { id: "high", label: "High" },
  { id: "moderate", label: "Moderate" },
  { id: "low", label: "Low" },
  { id: "no", label: "None" },
];

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// The prototype's clock reads 1:30 PM, so last night is the night before.
export const SLEEP_GOAL_MIN = 7 * 60;

export function fmtDur(mins) {
  if (mins === null || mins === undefined) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h + "h" + (m ? " " + m + "m" : "");
}

/* Mind's reading list. Sleep, stress and rhythm rather than tools: the tools
   are on Today, and this is the part that explains why any of them help. */
export const MIND_ARTICLES = [
  {
    title: "Why Your Body Clock Decides How You Handle Sugar",
    meta: "6 min read . 18 Mar 26",
  },
  {
    title: "One Bad Night, One Hungry Day: What Short Sleep Does to Appetite",
    meta: "5 min read . 02 Mar 26",
  },
  {
    title: "Winding Down Without a Screen: A Half Hour That Actually Works",
    meta: "4 min read . 11 Feb 26",
  },
  {
    title: "Stress and Blood Sugar: The Link Nobody Mentions at the Clinic",
    meta: "8 min read . 27 Jan 26",
  },
  {
    title: "Breathing Slowly, and Why the Long Breath Out Is the One That Counts",
    meta: "3 min read . 09 Jan 26",
  },
];
