/* What Mind actually offers, taken from the live app: a check-in, a breathing
   exercise, an affirmation, and somewhere to write. Kept as data so the copy
   can change without touching layout, the same way the pillar science is.

   `coach` marks the one a coach has picked for today. One, not several: four
   tools with two highlighted is still a menu, and a single recommendation is
   the thing that makes it feel like care. */

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
    coins: 2,
  },
  {
    id: "breathing",
    label: "Breathing",
    line: "A guided exercise to settle your body down.",
    minutes: 3,
    coins: 3,
    coach: true,
  },
  {
    id: "affirmation",
    label: "Affirmation",
    line: "One line to carry into the rest of the day.",
    minutes: 1,
    coins: 1,
  },
  {
    id: "journal",
    label: "Journaling",
    line: "Write it down and it stops going round.",
    minutes: 5,
    coins: 3,
  },
];

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
