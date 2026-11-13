export type SectionType = 
  | 'worry_tree' 
  | 'gratitude' 
  | 'smart_goal' 
  | 'motivation'
  | 'mindful_eating'
  | 'weekly_mood'
  | 'motivation_tracker'
  | 'behavior_change'
  | 'problem_solving'
  | 'reframing_thoughts'
  | 'sleep_tracker'
  | 'stop_and_swap'
  | 'tracking_triggers'
  | 'mood_tracking'
  | 'home_journal'
  | 'habit_tracker'
  | 'health_planner'
  | 'sleep_sweep'
  | 'five_finger_breathing'
  | 'box_breathing'
  | 'grounding_54321'
  | 'circle_of_control'
  | 'pre_session'
  | 'priority_rule';


export interface JournalRecord {
  id: string;
  mobile: string;
  entry_date: string;
  section: SectionType;
  question_id: string;
  question_text_snapshot: string;
  answer_text: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionAnswer {
  question_id: string;
  question_text: string;
  answer_text: string;
}

export interface SectionData {
  section: SectionType;
  entries: QuestionAnswer[];
}

export interface FocusArea {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
}

export interface Material {
  id: string;
  focus_area_id: string;
  title: string;
  content: string | null;
  is_active: boolean;
}

export interface TemplateAssignment {
  id: string;
  mobile: string;
  template_id: string;
  assigned_at: string;
  habit_names?: string[];
}

// All available templates/modules
export const ALL_TEMPLATES = [
  { id: 'worry_tree', title: 'Worry Tree', description: 'Examine your worries and decide on action' },
  { id: 'gratitude', title: 'Gratitude Journal', description: 'Notice the good in yourself, others, and life' },
  { id: 'smart_goal', title: 'SMART Goals', description: 'Set clear, achievable goals' },
  { id: 'motivation', title: 'Motivation Check-in', description: 'Reflect on what feels hard' },
  { id: 'mindful_eating', title: 'Mindful Eating Quiz', description: 'Check in with your eating habits' },
  { id: 'weekly_mood', title: 'Weekly Mood Diary', description: 'Track your mood across the week' },
  { id: 'motivation_tracker', title: 'Motivation Tracker', description: 'Track what motivates you monthly' },
  { id: 'behavior_change', title: 'Behavior Change Plan', description: 'Plan for positive change' },
  { id: 'problem_solving', title: 'Problem Solving', description: 'Work through problems step by step' },
  { id: 'reframing_thoughts', title: 'Reframing Thoughts', description: 'Transform negative thoughts' },
  { id: 'sleep_tracker', title: 'Sleep Tracker', description: 'Monitor your sleep patterns' },
  { id: 'stop_and_swap', title: 'Stop and Swap', description: 'Replace negative with productive thoughts' },
  { id: 'tracking_triggers', title: 'Tracking Triggers', description: 'Identify and track your triggers' },
  { id: 'mirror_exercise', title: 'Mirror Exercise', description: 'Self-appreciation practice' },
  { id: 'self_love', title: 'Self Love Affirmations', description: 'I Am Enough reminders' },
  { id: 'sleep_breathing', title: 'Sleep Breathing', description: '4-7-8 breathing technique' },
  { id: 'zen_flow', title: 'Zen Flow Breathing', description: 'Calming breath exercise' },
  { id: 'star_breathing', title: 'Star Breathing', description: 'Trace and breathe exercise' },
  { id: 'sleep_tips', title: 'Sleep Tips', description: 'Tips for better sleep' },
  { id: 'habit_tracker', title: 'Habit Tracker', description: 'Track up to 8 daily habits across the week' },
  { id: 'health_planner', title: 'Health Planner', description: 'Plan health tasks day-by-day for the week' },
  { id: 'sleep_sweep', title: 'Sleep Sweep', description: 'Clear your thoughts each night to sleep better' },
  { id: 'five_finger_breathing', title: '5 Finger Breathing', description: 'Trace your hand and breathe' },
  { id: 'box_breathing', title: 'Box Breathing', description: 'Calm your mind with a 4-4-4-4 breath cycle' },
  { id: 'grounding_54321', title: '5-4-3-2-1 Grounding', description: 'Reduce anxiety by engaging your senses' },
  { id: 'circle_of_control', title: 'Circle of Control', description: 'Sort what is and isn\'t in your control' },
  { id: 'priority_rule', title: 'The 20–80 Priority Rule', description: 'Plan future-building priorities and reflect on your day' },

] as const;

export const HABIT_TRACKER_DAYS = [
  { id: 'mon', text: 'Mon' },
  { id: 'tue', text: 'Tue' },
  { id: 'wed', text: 'Wed' },
  { id: 'thu', text: 'Thu' },
  { id: 'fri', text: 'Fri' },
  { id: 'sat', text: 'Sat' },
  { id: 'sun', text: 'Sun' },
] as const;

// Fallback default when a habit tracker assignment has no coach-defined habits
export const HABIT_TRACKER_HABIT_COUNT = 4;

// Build question list for a habit tracker with N habits (unlimited)
export function buildHabitTrackerQuestions(count: number) {
  const n = Math.max(1, count);
  return [
    ...Array.from({ length: n }).flatMap((_, i) => {
      const idx = i + 1;
      return [
        { id: `habit_${idx}_name`, text: `Habit ${idx} — Name` },
        ...HABIT_TRACKER_DAYS.map(d => ({
          id: `habit_${idx}_${d.id}`,
          text: `Habit ${idx} — ${d.text}`,
        })),
      ];
    }),
    { id: 'goals', text: 'Goals for the week' },
  ];
}

// Legacy static list (kept for backward-compat imports)
export const HABIT_TRACKER_QUESTIONS = buildHabitTrackerQuestions(HABIT_TRACKER_HABIT_COUNT);


const WEEK_DAYS = [
  { id: 'monday', text: 'Monday' },
  { id: 'tuesday', text: 'Tuesday' },
  { id: 'wednesday', text: 'Wednesday' },
  { id: 'thursday', text: 'Thursday' },
  { id: 'friday', text: 'Friday' },
  { id: 'saturday', text: 'Saturday' },
  { id: 'sunday', text: 'Sunday' },
] as const;

export const HEALTH_PLANNER_QUESTIONS = [
  ...WEEK_DAYS,
  { id: 'todo', text: 'Weekly To-Do List' },
  { id: 'notes', text: 'Notes' },
] as const;

export const SLEEP_SWEEP_QUESTIONS = [
  ...WEEK_DAYS,
  { id: 'todo', text: 'To-Do List' },
  { id: 'notes', text: 'Notes' },
] as const;

// Question definitions for each section
export const GRATITUDE_QUESTIONS = [
  { id: 'self', text: "Something I'm grateful for about myself" },
  { id: 'others', text: "Something I'm grateful for in someone else" },
  { id: 'life', text: "Something I'm grateful for in life" },
] as const;

export const SMART_GOAL_QUESTIONS = [
  { id: 'goal', text: 'My Goal' },
  { id: 'specific', text: 'Specific - What exactly will you do?' },
  { id: 'measurable', text: 'Measurable - How will you know when it\'s done?' },
  { id: 'actionable', text: 'Actionable - What are the concrete steps?' },
  { id: 'realistic', text: 'Realistic - Is this achievable with your current resources?' },
  { id: 'timeBound', text: 'Time-bound - When will you complete this?' },
] as const;

export const MOTIVATION_QUESTIONS = [
  { id: 'difficult', text: 'What feels difficult right now?' },
  { id: 'why', text: 'Why do I think this is happening?' },
  { id: 'lighter', text: 'What could make this feel lighter?' },
  { id: 'smallThing', text: 'One small thing I can do today or this week' },
] as const;

// Worry tree has dynamic questions per worry entry
export const WORRY_QUESTIONS = [
  { id: 'text', text: "What's worrying you?" },
  { id: 'type', text: 'Is this about a current problem or future worry?' },
  { id: 'action', text: 'What action will you take?' },
] as const;

// Affirmations for the home page
export const DAILY_AFFIRMATIONS = [
  "You are worthy of love and kindness, especially from yourself.",
  "Today, I choose to focus on what I can control.",
  "I am enough, just as I am.",
  "My feelings are valid and I honor them.",
  "I am growing and learning every day.",
  "I deserve peace and happiness.",
  "I trust in my ability to handle whatever comes my way.",
  "I am grateful for this moment.",
  "I release what no longer serves me.",
  "I am exactly where I need to be.",
] as const;

// Journal prompts for home page
export const JOURNAL_PROMPTS = [
  "What are three things you're grateful for today?",
  "What made you smile today?",
  "What's one thing you're looking forward to?",
  "Describe a moment when you felt at peace recently.",
  "What's something you'd like to let go of?",
  "What does self-care look like for you today?",
  "What's a small win you can celebrate?",
  "How are you really feeling right now?",
] as const;
