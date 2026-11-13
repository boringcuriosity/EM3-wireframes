import { useState, useEffect, useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { format, isToday, isFuture } from 'date-fns';
import { ArrowLeft, Save, Check, Loader2, CalendarDays, Lock, StickyNote, X, Download, FileText, Play } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GoodFlipLogo } from '@/components/GoodFlipLogo';
import { JournalCalendar } from '@/components/JournalCalendar';
import { PastEntryViewer } from '@/components/PastEntryViewer';
import { SavedEntryRenderer } from '@/components/SavedEntryRenderer';
import { useTemplateAssignments } from '@/hooks/useTemplateAssignments';
import { useCoachNotes } from '@/hooks/useCoachNotes';
import type { CoachNote } from '@/hooks/useCoachNotes';
import { useJournalRecords, useSaveAllRecords, groupRecordsBySection, useCalendarEntries } from '@/hooks/useJournalData';
import { useWeeklyHabitTracker, useSaveWeeklyHabitTracker, type Habit } from '@/hooks/useWeeklyHabitTracker';
import { isValidMobile, formatMobile, normalizeMobile } from '@/lib/mobile';
import { ALL_TEMPLATES, SectionType } from '@/types/journal';
import { toast } from 'sonner';

// Import all module components
import { WorryTreeSection, WorryEntry } from '@/components/journal/WorryTreeSection';
import { GratitudeSection } from '@/components/journal/GratitudeSection';
import { SmartGoalSection } from '@/components/journal/SmartGoalSection';
import { MotivationSection } from '@/components/journal/MotivationSection';
import { MindfulEatingQuiz, MINDFUL_EATING_QUESTIONS } from '@/components/modules/MindfulEatingQuiz';
import { MirrorExercise } from '@/components/modules/MirrorExercise';
import { WeeklyMoodDiary, WEEKLY_MOOD_QUESTIONS } from '@/components/modules/WeeklyMoodDiary';
import { MotivationTracker, MOTIVATION_TRACKER_QUESTIONS } from '@/components/modules/MotivationTracker';
import { BehaviorChangePlan, BEHAVIOR_CHANGE_QUESTIONS } from '@/components/modules/BehaviorChangePlan';
import { ProblemSolving, PROBLEM_SOLVING_QUESTIONS } from '@/components/modules/ProblemSolving';
import { ReframingThoughts, REFRAMING_THOUGHTS_QUESTIONS } from '@/components/modules/ReframingThoughts';
import { SelfLoveAffirmations } from '@/components/modules/SelfLoveAffirmations';
import { SleepTracker, SLEEP_TRACKER_QUESTIONS } from '@/components/modules/SleepTracker';
import { SleepBreathing } from '@/components/modules/SleepBreathing';
import { ZenFlowBreathing } from '@/components/modules/ZenFlowBreathing';
import { StarBreathing } from '@/components/modules/StarBreathing';
import { StopAndSwap, STOP_SWAP_QUESTIONS } from '@/components/modules/StopAndSwap';
import { TrackingTriggers, TRACKING_TRIGGERS_QUESTIONS } from '@/components/modules/TrackingTriggers';
import { SleepTips } from '@/components/modules/SleepTips';
import { HabitTracker } from '@/components/modules/HabitTracker';
import { HealthPlanner } from '@/components/modules/HealthPlanner';
import { SleepSweep } from '@/components/modules/SleepSweep';
import { FiveFingerBreathing } from '@/components/modules/FiveFingerBreathing';
import { BoxBreathing } from '@/components/modules/BoxBreathing';
import { Grounding54321 } from '@/components/modules/Grounding54321';
import { CircleOfControl } from '@/components/modules/CircleOfControl';
import { PriorityRule } from '@/components/modules/PriorityRule';
import { priorityRuleStageRecord, type PriorityRuleEveningReflection, type PriorityRuleMorningPlan } from '@/lib/priorityRule';
import { GRATITUDE_QUESTIONS, SMART_GOAL_QUESTIONS, MOTIVATION_QUESTIONS, HABIT_TRACKER_QUESTIONS, HABIT_TRACKER_DAYS, HEALTH_PLANNER_QUESTIONS, SLEEP_SWEEP_QUESTIONS, buildHabitTrackerQuestions } from '@/types/journal';


// Map template IDs to their section types for saveable modules
const SAVEABLE_TEMPLATES: Record<string, SectionType> = {
  worry_tree: 'worry_tree',
  gratitude: 'gratitude',
  smart_goal: 'smart_goal',
  motivation: 'motivation',
  mindful_eating: 'mindful_eating',
  weekly_mood: 'weekly_mood',
  motivation_tracker: 'motivation_tracker',
  behavior_change: 'behavior_change',
  problem_solving: 'problem_solving',
  reframing_thoughts: 'reframing_thoughts',
  sleep_tracker: 'sleep_tracker',
  stop_and_swap: 'stop_and_swap',
  tracking_triggers: 'tracking_triggers',
  habit_tracker: 'habit_tracker',
  health_planner: 'health_planner',
  sleep_sweep: 'sleep_sweep',
  priority_rule: 'priority_rule',
};

const NON_SAVEABLE = new Set(['mirror_exercise', 'self_love', 'sleep_breathing', 'zen_flow', 'star_breathing', 'sleep_tips', 'five_finger_breathing', 'box_breathing', 'grounding_54321', 'circle_of_control']);

type RecordEntry = { section: SectionType; question_id: string; question_text: string; answer_text: string };

// ─── Worry Tree serialization ───
function worriestoRecords(worries: WorryEntry[]): RecordEntry[] {
  const records: RecordEntry[] = [];
  worries.forEach((worry) => {
    if (worry.text.trim()) {
      records.push({ section: 'worry_tree', question_id: `${worry.id}_worry`, question_text: "What am I worrying about?", answer_text: worry.text });
    }
    records.push({ section: 'worry_tree', question_id: `${worry.id}_situation`, question_text: 'Hypothetical or current problem?', answer_text: worry.type });
    if (worry.canDo) {
      records.push({ section: 'worry_tree', question_id: `${worry.id}_canDo`, question_text: 'Can I do something about this?', answer_text: worry.canDo });
    }
    if (worry.actionType) {
      records.push({ section: 'worry_tree', question_id: `${worry.id}_actionType`, question_text: 'Now or later?', answer_text: worry.actionType });
    }
    if (worry.actionWhat?.trim()) {
      records.push({ section: 'worry_tree', question_id: `${worry.id}_actionWhat`, question_text: 'What will you do?', answer_text: worry.actionWhat });
    }
    if (worry.actionWhen?.trim()) {
      records.push({ section: 'worry_tree', question_id: `${worry.id}_actionWhen`, question_text: 'When will you do it?', answer_text: worry.actionWhen });
    }
    if (worry.actionHow?.trim()) {
      records.push({ section: 'worry_tree', question_id: `${worry.id}_actionHow`, question_text: 'How will you do it?', answer_text: worry.actionHow });
    }
    // backward compat: also save combined action if old format present
    if (worry.action?.trim()) {
      records.push({ section: 'worry_tree', question_id: `${worry.id}_action`, question_text: 'Action plan', answer_text: worry.action });
    }
    if (worry.decision.trim()) {
      records.push({ section: 'worry_tree', question_id: `${worry.id}_decision`, question_text: 'Decision / notes', answer_text: worry.decision });
    }
  });
  return records;
}

function recordsToWorries(records: Array<{ question_id: string; answer_text: string }>): WorryEntry[] {
  const worryMap = new Map<string, Partial<WorryEntry>>();
  records.forEach((record) => {
    const parts = record.question_id.split('_');
    const field = parts[parts.length - 1];
    const worryId = parts.slice(0, -1).join('_');
    if (!worryMap.has(worryId)) worryMap.set(worryId, { id: worryId, type: 'hypothetical' });
    const w = worryMap.get(worryId)!;
    if (field === 'worry' || field === 'text') w.text = record.answer_text;
    if (field === 'situation' || field === 'type') w.type = (record.answer_text === 'current' ? 'current' : 'hypothetical');
    if (field === 'canDo' || field === 'cando') w.canDo = record.answer_text as 'yes' | 'no';
    if (field === 'actionType' || field === 'actiontype') w.actionType = record.answer_text as 'now' | 'later';
    if (field === 'actionWhat' || field === 'actionwhat') w.actionWhat = record.answer_text;
    if (field === 'actionWhen' || field === 'actionwhen') w.actionWhen = record.answer_text;
    if (field === 'actionHow' || field === 'actionhow') w.actionHow = record.answer_text;
    if (field === 'action') w.action = record.answer_text;
    if (field === 'decision') w.decision = record.answer_text;
  });
  return Array.from(worryMap.values()).map(w => ({
    id: w.id!, text: w.text || '', type: w.type || 'hypothetical',
    canDo: w.canDo || '', actionType: w.actionType || '',
    actionWhat: w.actionWhat || '', actionWhen: w.actionWhen || '', actionHow: w.actionHow || '',
    action: w.action || '', decision: w.decision || '',
  }));
}

// ─── Standard Q&A serialization ───
function answersToRecords(section: SectionType, answers: Record<string, string>, questions: readonly { id: string; text: string }[]): RecordEntry[] {
  return questions.filter(q => answers[q.id]?.trim()).map(q => ({ section, question_id: q.id, question_text: q.text, answer_text: answers[q.id] }));
}

// ─── Sleep Tracker: store each field as separate record ───
function sleepEntriesToRecords(answers: Record<string, string>): RecordEntry[] {
  const entriesJson = answers['entries'];
  if (!entriesJson?.trim()) return [];
  try {
    const entries: any[] = JSON.parse(entriesJson);
    return entries.flatMap((entry, i) => [
      { section: 'sleep_tracker' as SectionType, question_id: `sleep_${i}_date`, question_text: 'Date', answer_text: entry.date || '' },
      { section: 'sleep_tracker' as SectionType, question_id: `sleep_${i}_sleep_time`, question_text: 'Sleep time', answer_text: entry.sleep_time || '' },
      { section: 'sleep_tracker' as SectionType, question_id: `sleep_${i}_wake_time`, question_text: 'Wake time', answer_text: entry.wake_time || '' },
      { section: 'sleep_tracker' as SectionType, question_id: `sleep_${i}_total_sleep`, question_text: 'Total sleep', answer_text: entry.total_sleep || '' },
      { section: 'sleep_tracker' as SectionType, question_id: `sleep_${i}_trouble_falling`, question_text: 'Trouble falling asleep', answer_text: String(!!entry.trouble_falling) },
      { section: 'sleep_tracker' as SectionType, question_id: `sleep_${i}_trouble_staying`, question_text: 'Trouble staying asleep', answer_text: String(!!entry.trouble_staying) },
      { section: 'sleep_tracker' as SectionType, question_id: `sleep_${i}_wake_feeling`, question_text: 'Wake feeling', answer_text: entry.wake_feeling || '' },
    ].filter(r => r.answer_text.trim() !== ''));
  } catch { return []; }
}

// ─── Stop & Swap: store each thought pair as separate records ───
function stopSwapEntriesToRecords(answers: Record<string, string>): RecordEntry[] {
  const entriesJson = answers['entries'];
  if (!entriesJson?.trim()) return [];
  try {
    const entries: any[] = JSON.parse(entriesJson);
    return entries.flatMap((entry, i) => [
      { section: 'stop_and_swap' as SectionType, question_id: `swap_${i}_negative`, question_text: 'Negative Thought', answer_text: entry.negative || '' },
      { section: 'stop_and_swap' as SectionType, question_id: `swap_${i}_productive`, question_text: 'Productive Thought', answer_text: entry.productive || '' },
    ].filter(r => r.answer_text.trim() !== ''));
  } catch { return []; }
}

// ─── Tracking Triggers: store each field + rating as separate records ───
function triggerEntriesToRecords(answers: Record<string, string>): RecordEntry[] {
  const entriesJson = answers['entries'];
  if (!entriesJson?.trim()) return [];
  try {
    const entries: any[] = JSON.parse(entriesJson);
    return entries.flatMap((entry, i) => {
      const records: RecordEntry[] = [
        { section: 'tracking_triggers' as SectionType, question_id: `trigger_${i}_trigger`, question_text: 'Trigger', answer_text: entry.trigger || '' },
        { section: 'tracking_triggers' as SectionType, question_id: `trigger_${i}_notes`, question_text: 'Notes', answer_text: entry.notes || '' },
      ];
      for (let d = 0; d < 7; d++) {
        if (entry.ratings?.[d]) {
          records.push({ section: 'tracking_triggers' as SectionType, question_id: `trigger_${i}_rating_${d}`, question_text: `Rating day ${d}`, answer_text: String(entry.ratings[d]) });
        }
      }
      return records.filter(r => r.answer_text.trim() !== '');
    });
  } catch { return []; }
}

// ─── Reconstruct entries from individual DB records (with backward compat for old JSON blob) ───
export function reconstructSleepEntries(records: Array<{ question_id: string; answer_text: string }>): any[] {
  const oldFormat = records.find(r => r.question_id === 'entries');
  if (oldFormat) { try { return JSON.parse(oldFormat.answer_text); } catch { return []; } }
  const entryMap = new Map<number, any>();
  records.forEach(r => {
    const match = r.question_id.match(/^sleep_(\d+)_(.+)$/);
    if (!match) return;
    const idx = parseInt(match[1]);
    const field = match[2];
    if (!entryMap.has(idx)) entryMap.set(idx, { id: `sleep_${idx}` });
    const entry = entryMap.get(idx)!;
    if (field === 'trouble_falling' || field === 'trouble_staying') {
      entry[field] = r.answer_text === 'true';
    } else {
      entry[field] = r.answer_text;
    }
  });
  return Array.from(entryMap.entries()).sort((a, b) => a[0] - b[0]).map(([, v]) => v);
}

export function reconstructStopSwapEntries(records: Array<{ question_id: string; answer_text: string }>): any[] {
  const oldFormat = records.find(r => r.question_id === 'entries');
  if (oldFormat) { try { return JSON.parse(oldFormat.answer_text); } catch { return []; } }
  const entryMap = new Map<number, any>();
  records.forEach(r => {
    const match = r.question_id.match(/^swap_(\d+)_(.+)$/);
    if (!match) return;
    const idx = parseInt(match[1]);
    const field = match[2];
    if (!entryMap.has(idx)) entryMap.set(idx, { id: `swap_${idx}` });
    entryMap.get(idx)![field] = r.answer_text;
  });
  return Array.from(entryMap.entries()).sort((a, b) => a[0] - b[0]).map(([, v]) => v);
}

export function reconstructTriggerEntries(records: Array<{ question_id: string; answer_text: string }>): any[] {
  const oldFormat = records.find(r => r.question_id === 'entries');
  if (oldFormat) { try { return JSON.parse(oldFormat.answer_text); } catch { return []; } }
  const entryMap = new Map<number, any>();
  records.forEach(r => {
    const matchTrigger = r.question_id.match(/^trigger_(\d+)_(.+)$/);
    if (!matchTrigger) return;
    const idx = parseInt(matchTrigger[1]);
    const field = matchTrigger[2];
    if (!entryMap.has(idx)) entryMap.set(idx, { id: `trigger_${idx}`, trigger: '', notes: '', ratings: {} });
    const entry = entryMap.get(idx)!;
    const ratingMatch = field.match(/^rating_(\d+)$/);
    if (ratingMatch) {
      entry.ratings[parseInt(ratingMatch[1])] = r.answer_text;
    } else {
      entry[field] = r.answer_text;
    }
  });
  return Array.from(entryMap.entries()).sort((a, b) => a[0] - b[0]).map(([, v]) => v);
}

function getRecordsForSection(
  templateId: string,
  worries: WorryEntry[],
  allAnswers: Record<string, Record<string, string>>,
  habitNamesForTracker: string[] = [],
): RecordEntry[] {
  switch (templateId) {
    case 'worry_tree': return worriestoRecords(worries);
    case 'gratitude': return answersToRecords('gratitude', allAnswers.gratitude || {}, GRATITUDE_QUESTIONS);
    case 'smart_goal': return answersToRecords('smart_goal', allAnswers.smart_goal || {}, SMART_GOAL_QUESTIONS);
    case 'motivation': return answersToRecords('motivation', allAnswers.motivation || {}, MOTIVATION_QUESTIONS);
    case 'mindful_eating': return answersToRecords('mindful_eating', allAnswers.mindful_eating || {}, MINDFUL_EATING_QUESTIONS);
    case 'weekly_mood': return answersToRecords('weekly_mood', allAnswers.weekly_mood || {}, WEEKLY_MOOD_QUESTIONS);
    case 'motivation_tracker': return answersToRecords('motivation_tracker', allAnswers.motivation_tracker || {}, MOTIVATION_TRACKER_QUESTIONS);
    case 'behavior_change': return answersToRecords('behavior_change', allAnswers.behavior_change || {}, BEHAVIOR_CHANGE_QUESTIONS);
    case 'problem_solving': return answersToRecords('problem_solving', allAnswers.problem_solving || {}, PROBLEM_SOLVING_QUESTIONS);
    case 'reframing_thoughts': return answersToRecords('reframing_thoughts', allAnswers.reframing_thoughts || {}, REFRAMING_THOUGHTS_QUESTIONS);
    case 'sleep_tracker': return sleepEntriesToRecords(allAnswers.sleep_tracker || {});
    case 'stop_and_swap': return stopSwapEntriesToRecords(allAnswers.stop_and_swap || {});
    case 'tracking_triggers': return triggerEntriesToRecords(allAnswers.tracking_triggers || {});
    case 'habit_tracker': {
      // Build questions dynamically based on the number of habits (coach-defined or 4-row default)
      const count = Math.max(habitNamesForTracker.length, 1);
      const answers = { ...(allAnswers.habit_tracker || {}) };
      // Ensure habit names are always persisted (from assignment) so past-day view can render them
      habitNamesForTracker.forEach((name, i) => {
        if (name && name.trim()) answers[`habit_${i + 1}_name`] = name;
      });
      return answersToRecords('habit_tracker', answers, buildHabitTrackerQuestions(count));
    }
    case 'health_planner': return answersToRecords('health_planner', allAnswers.health_planner || {}, HEALTH_PLANNER_QUESTIONS);
    case 'sleep_sweep': return answersToRecords('sleep_sweep', allAnswers.sleep_sweep || {}, SLEEP_SWEEP_QUESTIONS);
    default: return [];
  }
}


export default function PatientTemplates() {
  const { mobile } = useParams<{ mobile: string }>();
  const queryClient = useQueryClient();
  
  const isMobileValid = useMemo(() => mobile && isValidMobile(mobile), [mobile]);
  const normalizedMobile = useMemo(() => mobile ? normalizeMobile(mobile) : '', [mobile]);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const isViewingToday = isToday(selectedDate);
  const isViewingFuture = isFuture(selectedDate) && !isViewingToday;

  const { data: assignments, isLoading: assignmentsLoading } = useTemplateAssignments(normalizedMobile, dateStr);
  const { data: existingRecords, isLoading: recordsLoading } = useJournalRecords(normalizedMobile, dateStr);
  const { data: entryDates = [] } = useCalendarEntries(normalizedMobile);
  const { data: coachNotes = [] } = useCoachNotes(normalizedMobile);
  const saveAllRecords = useSaveAllRecords();
  const coachHabitDuration = useMemo(() => {
    const a = assignments?.find(x => x.template_id === 'habit_tracker') as any;
    const n = a?.habit_duration_weeks;
    return typeof n === 'number' && n > 0 ? n : undefined;
  }, [assignments]);
  const { data: weeklyHabits } = useWeeklyHabitTracker(normalizedMobile, selectedDate, coachHabitDuration);
  const saveWeeklyHabits = useSaveWeeklyHabitTracker();

  // State for all modules
  const [worries, setWorries] = useState<WorryEntry[]>([]);
  const [allAnswers, setAllAnswers] = useState<Record<string, Record<string, string>>>({});
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [habitList, setHabitList] = useState<Habit[]>([]);
  const [habitAnswers, setHabitAnswers] = useState<Record<string, string>>({});
  const [habitDuration, setHabitDuration] = useState(4);


  // Derive savedSections from existingRecords — no manual state management
  const savedSections = useMemo(() => {
    if (!existingRecords?.length) return new Set<string>();
    const sections = new Set<string>();
    existingRecords.forEach(r => sections.add(r.section));
    return sections;
  }, [existingRecords]);

  // Helper to update answers for a section
  const updateAnswer = (section: string, id: string, value: string) => {
    setAllAnswers(prev => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [id]: value },
    }));
  };

  // Load existing records into component state for editing/display
  useEffect(() => {
    if (existingRecords && existingRecords.length > 0) {
      const grouped = groupRecordsBySection(existingRecords);
      
      if (grouped.worry_tree.length > 0) {
        setWorries(recordsToWorries(grouped.worry_tree));
      }
      
      const newAnswers: Record<string, Record<string, string>> = {};
      
      // Standard Q&A sections
      const standardSections: SectionType[] = [
        'gratitude', 'smart_goal', 'motivation', 'mindful_eating',
        'weekly_mood', 'motivation_tracker', 'behavior_change',
        'problem_solving', 'reframing_thoughts',
      ];
      standardSections.forEach(section => {
        if (grouped[section].length > 0) {
          const data: Record<string, string> = {};
          grouped[section].forEach(r => { data[r.question_id] = r.answer_text; });
          newAnswers[section] = data;
        }
      });

      // Structured sections: reconstruct entries JSON for UI components
      if (grouped.sleep_tracker.length > 0) {
        const entries = reconstructSleepEntries(grouped.sleep_tracker);
        newAnswers.sleep_tracker = { entries: JSON.stringify(entries) };
      }
      if (grouped.stop_and_swap.length > 0) {
        const entries = reconstructStopSwapEntries(grouped.stop_and_swap);
        newAnswers.stop_and_swap = { entries: JSON.stringify(entries) };
      }
      if (grouped.tracking_triggers.length > 0) {
        const entries = reconstructTriggerEntries(grouped.tracking_triggers);
        newAnswers.tracking_triggers = { entries: JSON.stringify(entries) };
      }
      
      setAllAnswers(prev => ({ ...prev, ...newAnswers }));
    }
  }, [existingRecords]);

  // Reset state when date changes
  useEffect(() => {
    setWorries([]);
    setAllAnswers({});
  }, [dateStr]);

  if (isViewingFuture) return <Navigate to={`/u/${mobile}/templates`} replace />;
  if (!isMobileValid) return <Navigate to="/" replace />;

  const handleDateSelect = (date: Date) => {
    if (isFuture(date) && !isToday(date)) return;
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const assignedTemplateIds = assignments?.map(a => a.template_id) || [];
  const assignedTemplates = ALL_TEMPLATES.filter(t => assignedTemplateIds.includes(t.id));
  const fillCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    assignments?.forEach(a => { map[a.template_id] = a.fill_count ?? 1; });
    return map;
  }, [assignments]);

  const habitNamesForTracker = useMemo(() => {
    const habitAssignment = assignments?.find(a => a.template_id === 'habit_tracker') as any;
    return ((habitAssignment?.habit_names as string[] | undefined) || []).filter(n => n && n.trim());
  }, [assignments]);

  const coachDefinedHabits = habitNamesForTracker.length > 0;

  // Habits + weekly completion state live on the week, not on a single day
  const habitsFromCoach = useMemo<Habit[]>(
    () => habitNamesForTracker.map((name, i) => ({ id: i + 1, name })),
    [habitNamesForTracker],
  );

  useEffect(() => {
    if (!weeklyHabits) return;
    setHabitList(coachDefinedHabits ? habitsFromCoach : weeklyHabits.habits);
    setHabitAnswers(weeklyHabits.answers);
    setHabitDuration(coachHabitDuration ?? weeklyHabits.durationWeeks);
  }, [weeklyHabits, coachDefinedHabits, habitsFromCoach, coachHabitDuration]);

  const updateHabitAnswer = (id: string, value: string) => {
    setHabitAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveHabitTracker = async () => {
    setSavingSection('habit_tracker');
    try {
      await saveWeeklyHabits.mutateAsync({
        mobile: normalizedMobile,
        date: selectedDate,
        habits: habitList,
        answers: habitAnswers,
        durationWeeks: coachHabitDuration ?? habitDuration,
        startWeek: weeklyHabits?.startWeek,
      });
      toast.success('Weekly Habit Tracker saved');
    } catch (error) {
      toast.error('Failed to save. Please try again.');
      console.error('Save error:', error);
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveSection = async (templateId: string) => {
    if (!isViewingToday) return;

    if (templateId === 'habit_tracker') {
      await handleSaveHabitTracker();
      return;
    }

    const records = getRecordsForSection(templateId, worries, allAnswers, habitNamesForTracker);

    if (records.length === 0) {
      toast.error('Please fill in at least one field before saving.');
      return;
    }
    
    // Add batch timestamp for multiple entries support
    const batchId = `__b${Date.now()}`;
    const batchedRecords = records.map(r => ({
      ...r,
      question_id: `${r.question_id}${batchId}`,
    }));
    
    setSavingSection(templateId);
    try {
      await saveAllRecords.mutateAsync({ mobile: normalizedMobile, date: dateStr, records: batchedRecords });
      await queryClient.refetchQueries({ queryKey: ['journal-records', normalizedMobile, dateStr] });
      toast.success(`${ALL_TEMPLATES.find(t => t.id === templateId)?.title || 'Entry'} saved`);
    } catch (error) {
      toast.error('Failed to save. Please try again.');
      console.error('Save error:', error);
    } finally {
      setSavingSection(null);
    }
  };

  const savePriorityMorning = async (plan: PriorityRuleMorningPlan) => {
    const record = priorityRuleStageRecord('morning', plan);
    try {
      await saveAllRecords.mutateAsync({
        mobile: normalizedMobile,
        date: dateStr,
        records: [{ ...record, question_id: `${record.question_id}__b${Date.now()}` }],
      });
      await queryClient.refetchQueries({ queryKey: ['journal-records', normalizedMobile, dateStr] });
      toast.success('Morning plan saved');
    } catch (error) {
      toast.error('Could not save the morning plan. Please try again.');
      throw error;
    }
  };

  const savePriorityEvening = async (reflection: PriorityRuleEveningReflection, plan: PriorityRuleMorningPlan) => {
    const batchId = `__b${Date.now()}`;
    const morningRecord = priorityRuleStageRecord('morning', plan);
    const eveningRecord = priorityRuleStageRecord('evening', reflection);
    try {
      await saveAllRecords.mutateAsync({
        mobile: normalizedMobile,
        date: dateStr,
        records: [
          { ...morningRecord, question_id: `${morningRecord.question_id}${batchId}` },
          { ...eveningRecord, question_id: `${eveningRecord.question_id}${batchId}` },
        ],
      });
      await queryClient.refetchQueries({ queryKey: ['journal-records', normalizedMobile, dateStr] });
      toast.success('Evening reflection saved');
    } catch (error) {
      toast.error('Could not save the evening reflection. Please try again.');
      throw error;
    }
  };


  const isSectionSaved = (templateId: string) => savedSections.has(SAVEABLE_TEMPLATES[templateId] || templateId);
  const canEdit = isViewingToday;

  const renderTemplate = (templateId: string) => {
    const hasSavedEntries = isSectionSaved(templateId);
    const isSaveable = !NON_SAVEABLE.has(templateId);
    const isCurrentlySaving = savingSection === templateId;
    const sectionType = SAVEABLE_TEMPLATES[templateId];
    
    // Show previously saved entries as read-only cards
    // (habit tracker is week-scoped and always renders its live weekly table)
    const savedEntryCards = hasSavedEntries && sectionType && templateId !== 'habit_tracker' && (templateId !== 'priority_rule' || !canEdit) ? (() => {
      const grouped = groupRecordsBySection(existingRecords || []);
      const sectionAnswers = grouped[sectionType] || [];
      if (sectionAnswers.length === 0) return null;
      return <SavedEntryRenderer section={sectionType} answers={sectionAnswers} />;
    })() : null;
    
    const templateContent = (() => {
      switch (templateId) {
        case 'worry_tree':
          return <WorryTreeSection key={templateId} worries={worries} onChange={setWorries} />;
        case 'gratitude':
          return <GratitudeSection key={templateId} answers={allAnswers.gratitude || {}} onChange={(id, v) => updateAnswer('gratitude', id, v)} />;
        case 'smart_goal':
          return <SmartGoalSection key={templateId} answers={allAnswers.smart_goal || {}} onChange={(id, v) => updateAnswer('smart_goal', id, v)} />;
        case 'motivation':
          return <MotivationSection key={templateId} answers={allAnswers.motivation || {}} onChange={(id, v) => updateAnswer('motivation', id, v)} />;
        case 'mindful_eating':
          return <MindfulEatingQuiz key={templateId} answers={allAnswers.mindful_eating || {}} onChange={(id, v) => updateAnswer('mindful_eating', id, v)} />;
        case 'weekly_mood':
          return <WeeklyMoodDiary key={templateId} answers={allAnswers.weekly_mood || {}} onChange={(id, v) => updateAnswer('weekly_mood', id, v)} />;
        case 'motivation_tracker':
          return <MotivationTracker key={templateId} answers={allAnswers.motivation_tracker || {}} onChange={(id, v) => updateAnswer('motivation_tracker', id, v)} />;
        case 'behavior_change':
          return <BehaviorChangePlan key={templateId} answers={allAnswers.behavior_change || {}} onChange={(id, v) => updateAnswer('behavior_change', id, v)} />;
        case 'problem_solving':
          return <ProblemSolving key={templateId} answers={allAnswers.problem_solving || {}} onChange={(id, v) => updateAnswer('problem_solving', id, v)} />;
        case 'reframing_thoughts':
          return <ReframingThoughts key={templateId} answers={allAnswers.reframing_thoughts || {}} onChange={(id, v) => updateAnswer('reframing_thoughts', id, v)} />;
        case 'sleep_tracker':
          return <SleepTracker key={templateId} answers={allAnswers.sleep_tracker || {}} onChange={(id, v) => updateAnswer('sleep_tracker', id, v)} />;
        case 'stop_and_swap':
          return <StopAndSwap key={templateId} answers={allAnswers.stop_and_swap || {}} onChange={(id, v) => updateAnswer('stop_and_swap', id, v)} />;
        case 'tracking_triggers':
          return <TrackingTriggers key={templateId} answers={allAnswers.tracking_triggers || {}} onChange={(id, v) => updateAnswer('tracking_triggers', id, v)} />;
        case 'mirror_exercise': return <MirrorExercise key={templateId} />;
        case 'self_love': return <SelfLoveAffirmations key={templateId} />;
        case 'sleep_breathing': return <SleepBreathing key={templateId} mobile={normalizedMobile} />;
        case 'zen_flow': return <ZenFlowBreathing key={templateId} mobile={normalizedMobile} />;
        case 'star_breathing': return <StarBreathing key={templateId} mobile={normalizedMobile} />;
        case 'sleep_tips': return <SleepTips key={templateId} />;
        case 'five_finger_breathing': return <FiveFingerBreathing key={templateId} mobile={normalizedMobile} />;
        case 'box_breathing': return <BoxBreathing key={templateId} mobile={normalizedMobile} />;
        case 'grounding_54321': return <Grounding54321 key={templateId} mobile={normalizedMobile} />;
        case 'circle_of_control': return <CircleOfControl key={templateId} mobile={normalizedMobile} />;
        case 'priority_rule':
          return (
            <PriorityRule
              key={templateId}
              records={groupRecordsBySection(existingRecords || []).priority_rule}
              dateKey={dateStr}
              canEdit={canEdit}
              onSaveMorning={savePriorityMorning}
              onSaveEvening={savePriorityEvening}
            />
          );

        case 'habit_tracker':
          return (
            <HabitTracker
              key={templateId}
              habits={habitList}
              onHabitsChange={setHabitList}
              answers={habitAnswers}
              onChange={updateHabitAnswer}
              canEditHabits={!coachDefinedHabits && canEdit}
              todayDayId={HABIT_TRACKER_DAYS[(new Date().getDay() + 6) % 7].id}
              weekLabel={weeklyHabits ? `week of ${format(new Date(weeklyHabits.weekStart + 'T00:00:00'), 'MMM d')}` : undefined}
              durationWeeks={coachHabitDuration ?? habitDuration}
              onDurationChange={coachHabitDuration ? undefined : setHabitDuration}
            />
          );

        case 'health_planner':
          return <HealthPlanner key={templateId} answers={allAnswers.health_planner || {}} onChange={(id, v) => updateAnswer('health_planner', id, v)} />;
        case 'sleep_sweep':
          return <SleepSweep key={templateId} answers={allAnswers.sleep_sweep || {}} onChange={(id, v) => updateAnswer('sleep_sweep', id, v)} />;
        default: return null;
      }
    })();

    const fillCount = fillCountMap[templateId] ?? 1;

    return (
      <div key={templateId} className="relative space-y-4">
        {/* Fill count indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            Fill {fillCount} {fillCount === 1 ? 'time' : 'times'}
          </span>
        </div>
        
        {/* Show saved entries */}
        {savedEntryCards}
        
        {/* Show form for new entry (always available on today) */}
        {canEdit && templateContent}
        
        {/* Per-section save button */}
        {isSaveable && canEdit && templateId !== 'priority_rule' && (
          <div className="mt-3 flex justify-end">
            <Button
              onClick={() => handleSaveSection(templateId)}
              disabled={isCurrentlySaving}
              size="sm"
              className="gap-2"
            >
              {isCurrentlySaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save {ALL_TEMPLATES.find(t => t.id === templateId)?.title}
            </Button>
          </div>
        )}
        
        {/* Show template content read-only for past dates */}
        {!canEdit && !savedEntryCards && templateContent}
      </div>
    );
  };

  const isLoading = assignmentsLoading || recordsLoading;

  return (
    <div className="min-h-screen goodflip-bg">
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-md sticky top-0 z-10">
        <div className="container max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <GoodFlipLogo size="md" />
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCalendar(!showCalendar)}
                className="gap-2"
              >
                <CalendarDays className="h-4 w-4" />
                {showCalendar ? 'Hide Calendar' : 'View History'}
              </Button>
              <div className="text-sm text-muted-foreground">
                {formatMobile(normalizedMobile)}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-8">
        <Link to={`/u/${mobile}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {showCalendar && (
          <div className="mb-6">
            <JournalCalendar entryDates={entryDates} selectedDate={selectedDate} onDateSelect={handleDateSelect} />
          </div>
        )}

        {!isViewingToday && (
          <div className="space-y-4">
            <PastEntryViewer records={existingRecords || []} date={selectedDate} isEditable={false} />
            <Button onClick={() => handleDateSelect(new Date())} className="w-full">Back to Today</Button>
          </div>
        )}

        {isViewingToday && (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : assignedTemplates.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <CalendarDays className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-serif text-foreground mb-2">No templates assigned yet</h2>
                <p className="text-muted-foreground">Your coach will share them soon.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Coach Notes for Patient */}
                {coachNotes.length > 0 && (
                  <Card className="border-primary/30 bg-primary/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <StickyNote className="h-4 w-4 text-primary" />
                        Notes from your Coach
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(coachNotes as CoachNote[]).map((note) => {
                        const allAttachments: { url: string; type: string }[] = [];
                        if (note.attachment_url) allAttachments.push({ url: note.attachment_url, type: note.attachment_type || 'file' });
                        note.attachments.forEach(a => allAttachments.push({ url: a.file_url, type: a.file_type }));

                        return (
                          <div key={note.id} className="space-y-3 pb-3 border-b border-border/40 last:border-0 last:pb-0">
                            {/* Note text first */}
                            {note.note_text && (
                              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{note.note_text}</p>
                            )}
                            {/* Attachments at the end */}
                            {allAttachments.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {allAttachments.map((att, i) => (
                                  <div key={i}>
                                    {att.type === 'image' && (
                                      <button
                                        onClick={() => setZoomedImage(att.url)}
                                        className="w-full aspect-square rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors cursor-zoom-in"
                                      >
                                        <img src={att.url} alt="Coach attachment" className="w-full h-full object-cover" />
                                      </button>
                                    )}
                                    {att.type === 'video' && (
                                      <div className="w-full aspect-square rounded-lg overflow-hidden border border-border bg-black/5 relative">
                                        <video src={att.url} controls className="w-full h-full object-cover rounded-lg" />
                                      </div>
                                    )}
                                    {att.type === 'file' && (
                                      <a href={att.url} target="_blank" rel="noreferrer"
                                        className="flex flex-col items-center justify-center gap-2 w-full aspect-square rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors">
                                        <FileText className="h-8 w-8 text-muted-foreground" />
                                        <span className="text-xs text-primary font-medium">View File</span>
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">{format(new Date(note.created_at), 'MMM d, yyyy · h:mm a')}</p>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}

                <div>
                  <h1 className="text-2xl font-serif text-foreground">Your Templates</h1>
                  <p className="text-sm text-muted-foreground">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
                </div>

                <div className="space-y-6">
                  {assignedTemplates.map(template => renderTemplate(template.id))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Image Zoom Lightbox */}
      {zoomedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setZoomedImage(null)}>
          <button onClick={() => setZoomedImage(null)} className="absolute top-4 right-4 text-white/80 hover:text-white z-50">
            <X className="h-8 w-8" />
          </button>
          <a href={zoomedImage} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="absolute top-4 left-4 text-white/80 hover:text-white z-50">
            <Download className="h-6 w-6" />
          </a>
          <img
            src={zoomedImage}
            alt="Zoomed attachment"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
