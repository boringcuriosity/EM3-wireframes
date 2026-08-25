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
  },
  {
    id: "breathing",
    label: "Breathing",
    line: "A guided exercise to settle your body down.",
    minutes: 3,
    coach: true,
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

// The prototype's clock reads 1:30 PM, so last night is the night before.
export const SLEEP_GOAL_MIN = 7 * 60;

export function fmtDur(mins) {
  if (mins === null || mins === undefined) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h + "h" + (m ? " " + m + "m" : "");
}
