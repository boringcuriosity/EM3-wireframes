import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Moon, AlertTriangle, ArrowRight, AlertCircle, CheckCircle2, Check } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HABIT_TRACKER_DAYS, HABIT_TRACKER_HABIT_COUNT } from '@/types/journal';
import type { QuestionAnswer, SectionType } from '@/types/journal';
import { priorityRuleStagesFromRecords } from '@/lib/priorityRule';

const SECTION_LABELS: Record<string, string> = {
  mood_tracking: 'Mood Tracking',
  home_journal: 'Journal Entry',
  worry_tree: 'Worry Tree',
  gratitude: 'Gratitude',
  smart_goal: 'SMART Goals',
  motivation: 'Motivation',
  mindful_eating: 'Mindful Eating',
  weekly_mood: 'Weekly Mood',
  motivation_tracker: 'Motivation Tracker',
  behavior_change: 'Behavior Change',
  problem_solving: 'Problem Solving',
  reframing_thoughts: 'Reframing Thoughts',
  sleep_tracker: 'Sleep Tracker',
  stop_and_swap: 'Stop and Swap',
  tracking_triggers: 'Tracking Triggers',
  habit_tracker: 'Habit Tracker',
  health_planner: 'Health Planner',
  sleep_sweep: 'Sleep Sweep',
  priority_rule: 'The 20–80 Priority Rule',
};

const DAYS_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface SavedEntryRendererProps {
  section: SectionType;
  answers: QuestionAnswer[];
}

export function SavedEntryRenderer({ section, answers }: SavedEntryRendererProps) {
  switch (section) {
    case 'sleep_tracker':
      return <SleepTrackerView answers={answers} />;
    case 'tracking_triggers':
      return <TrackingTriggersView answers={answers} />;
    case 'stop_and_swap':
      return <StopAndSwapView answers={answers} />;
    case 'worry_tree':
      return <WorryTreeView answers={answers} />;
    case 'habit_tracker':
      return <HabitTrackerView answers={answers} />;
    case 'priority_rule':
      return <PriorityRuleSavedView answers={answers} />;
    default:
      return <GenericSavedView section={section} answers={answers} />;
  }
}

function PriorityRuleSavedView({ answers }: { answers: QuestionAnswer[] }) {
  const { morning, evening } = priorityRuleStagesFromRecords(answers);
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          The 20–80 Priority Rule
          <Badge variant="secondary" className="ml-auto text-xs">Saved</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {morning && (
          <section className="space-y-2">
            <h3 className="font-medium">Morning plan</h3>
            <Field label="Today’s 20% · Future-building tasks" value={morning.priorities.join('\n')} />
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Today’s 80% · Routine tasks</p>
              <ul className="space-y-1 text-sm">
                {morning.routineTasks.map(task => (
                  <li key={task.label}>{task.done ? '✓' : '○'} {task.label}{task.label === 'Other' && morning.otherTask ? `: ${morning.otherTask}` : ''}</li>
                ))}
              </ul>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Planned start time" value={morning.plannedStartTime} />
              <Field label="Expected finish time" value={morning.expectedFinishTime} />
            </div>
          </section>
        )}
        {evening && (
          <section className="space-y-2 border-t border-border pt-4">
            <h3 className="font-medium">Evening reflection</h3>
            <Field label="Did you complete your 20% first?" value={{ yes: 'Yes', partly: 'Partly', no: 'No' }[evening.outcome] || undefined} />
            <Field label="What got in the way?" value={evening.barrier} />
            <Field label="Today's win" value={evening.wins.join(', ')} />
          </section>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Habit Tracker (weekly table) ───
function HabitTrackerView({ answers }: { answers: QuestionAnswer[] }) {
  const map = new Map<string, string>();
  answers.forEach(a => map.set(a.question_id.replace(/__b\d+$/, ''), a.answer_text));
  // Discover how many habits were saved (supports unlimited count)
  const habitIndices = new Set<number>();
  for (const key of map.keys()) {
    const m = key.match(/^habit_(\d+)_/);
    if (m) habitIndices.add(parseInt(m[1], 10));
  }
  const habits = Array.from(habitIndices).sort((a, b) => a - b);
  if (habits.length === 0) {
    for (let i = 1; i <= HABIT_TRACKER_HABIT_COUNT; i++) habits.push(i);
  }
  const goals = map.get('goals');

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          Weekly Habit Tracker
          <Badge variant="secondary" className="ml-auto text-xs">Saved</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px]">Habit</TableHead>
                {HABIT_TRACKER_DAYS.map(d => (
                  <TableHead key={d.id} className="text-center px-2">{d.text}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {habits.map(n => (
                <TableRow key={n}>
                  <TableCell className="font-medium text-sm">
                    {map.get(`habit_${n}_name`) || <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  {HABIT_TRACKER_DAYS.map(d => {
                    const checked = map.get(`habit_${n}_${d.id}`) === '1';
                    return (
                      <TableCell key={d.id} className="text-center px-2">
                        {checked ? (
                          <Check className="h-4 w-4 mx-auto text-primary" />
                        ) : (
                          <span className="text-muted-foreground/40">·</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {goals && <Field label="Goals for the week" value={goals} />}
      </CardContent>
    </Card>
  );
}


// ─── Generic label:value view for simple Q&A modules ───
function GenericSavedView({ section, answers }: { section: SectionType; answers: QuestionAnswer[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" />
          {SECTION_LABELS[section] || section}
          <Badge variant="secondary" className="ml-auto text-xs">Saved</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {answers.map((a, i) => {
          const lines = (a.answer_text || '').split('\n').map((l) => l.trim()).filter(Boolean);
          const isBulletList = lines.length > 1 || (lines.length === 1 && a.answer_text.includes('\n'));
          return (
            <div key={`${a.question_id}-${i}`} className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{a.question_text}</p>
              {isBulletList ? (
                <ul className="text-sm text-foreground bg-muted/50 rounded-lg p-3 space-y-1 list-disc pl-6">
                  {lines.map((l, j) => (
                    <li key={j}>{l}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3 whitespace-pre-wrap">{a.answer_text}</p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ─── Reconstruct structured entries from individual field records (with backward compat) ───
// Strip batch IDs from question_id for reconstruction
function stripBatchId(qid: string): string {
  return qid.replace(/__b\d+$/, '');
}

function reconstructSleepFromRecords(records: QuestionAnswer[]): any[] {
  const cleaned = records.map(r => ({ ...r, question_id: stripBatchId(r.question_id) }));
  // Old format: single JSON blob
  const oldFormat = cleaned.find(r => r.question_id === 'entries');
  if (oldFormat) { try { return JSON.parse(oldFormat.answer_text); } catch { return []; } }
  // New format: individual fields
  const entryMap = new Map<number, any>();
  cleaned.forEach(r => {
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

function reconstructSwapFromRecords(records: QuestionAnswer[]): any[] {
  const cleaned = records.map(r => ({ ...r, question_id: stripBatchId(r.question_id) }));
  const oldFormat = cleaned.find(r => r.question_id === 'entries');
  if (oldFormat) { try { return JSON.parse(oldFormat.answer_text); } catch { return []; } }
  const entryMap = new Map<number, any>();
  cleaned.forEach(r => {
    const match = r.question_id.match(/^swap_(\d+)_(.+)$/);
    if (!match) return;
    const idx = parseInt(match[1]);
    const field = match[2];
    if (!entryMap.has(idx)) entryMap.set(idx, { id: `swap_${idx}` });
    entryMap.get(idx)![field] = r.answer_text;
  });
  return Array.from(entryMap.entries()).sort((a, b) => a[0] - b[0]).map(([, v]) => v);
}

function reconstructTriggersFromRecords(records: QuestionAnswer[]): any[] {
  const cleaned = records.map(r => ({ ...r, question_id: stripBatchId(r.question_id) }));
  const oldFormat = cleaned.find(r => r.question_id === 'entries');
  if (oldFormat) { try { return JSON.parse(oldFormat.answer_text); } catch { return []; } }
  const entryMap = new Map<number, any>();
  cleaned.forEach(r => {
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

// ─── Sleep Tracker ───
function SleepTrackerView({ answers }: { answers: QuestionAnswer[] }) {
  const entries = reconstructSleepFromRecords(answers);

  return (
    <Card className="border-blue-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Moon className="h-4 w-4 text-blue-500" />
          Sleep Tracker
          <Badge variant="secondary" className="ml-auto text-xs">Saved</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.length === 0 && <p className="text-sm text-muted-foreground">No entries recorded.</p>}
        {entries.map((entry: any, i: number) => (
          <div key={i} className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Field label="Date" value={entry.date} />
              <Field label="Sleep time" value={entry.sleep_time} />
              <Field label="Wake time" value={entry.wake_time} />
              <Field label="Total sleep" value={entry.total_sleep} />
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              {entry.trouble_falling && <Badge variant="outline" className="text-xs">Trouble falling asleep</Badge>}
              {entry.trouble_staying && <Badge variant="outline" className="text-xs">Trouble staying asleep</Badge>}
              {entry.wake_feeling && <Badge className="text-xs">Woke up: {entry.wake_feeling}</Badge>}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Tracking Triggers ───
function TrackingTriggersView({ answers }: { answers: QuestionAnswer[] }) {
  const entries = reconstructTriggersFromRecords(answers);

  return (
    <Card className="border-orange-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          Tracking Triggers
          <Badge variant="secondary" className="ml-auto text-xs">Saved</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.length === 0 && <p className="text-sm text-muted-foreground">No entries recorded.</p>}
        {entries.map((entry: any, i: number) => (
          <div key={i} className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Trigger" value={entry.trigger} />
              <Field label="Notes" value={entry.notes} />
            </div>
            {entry.ratings && Object.keys(entry.ratings).length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Weekly Ratings (1-4)</p>
                <div className="flex gap-2 flex-wrap">
                  {DAYS_LABELS.map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-0.5 min-w-[40px]">
                      <span className="text-[10px] text-muted-foreground">{day}</span>
                      <span className={`text-sm font-medium rounded-md w-8 h-8 flex items-center justify-center ${
                        entry.ratings[idx] ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        {entry.ratings[idx] || '–'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Stop and Swap ───
function StopAndSwapView({ answers }: { answers: QuestionAnswer[] }) {
  const entries = reconstructSwapFromRecords(answers);

  return (
    <Card className="border-red-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-red-500" />
          Stop and Swap
          <Badge variant="secondary" className="ml-auto text-xs">Saved</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.length === 0 && <p className="text-sm text-muted-foreground">No entries recorded.</p>}
        {entries.map((entry: any, i: number) => (
          <div key={i} className="grid md:grid-cols-2 gap-3 p-4 rounded-lg border bg-muted/30">
            <div className="space-y-1">
              <p className="text-xs font-medium text-red-600 dark:text-red-400">Negative Thought</p>
              <p className="text-sm bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">{entry.negative || '–'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-green-600 dark:text-green-400">Productive Thought</p>
              <p className="text-sm bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">{entry.productive || '–'}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Worry Tree ───
function WorryTreeView({ answers }: { answers: QuestionAnswer[] }) {
  // Strip batch IDs from question_ids for parsing
  const cleaned = answers.map(a => ({ ...a, question_id: a.question_id.replace(/__b\d+$/, '') }));
  const worryMap = new Map<string, Record<string, string>>();
  cleaned.forEach(a => {
    const parts = a.question_id.split('_');
    const field = parts[parts.length - 1];
    const worryId = parts.slice(0, -1).join('_');
    if (!worryMap.has(worryId)) worryMap.set(worryId, {});
    const w = worryMap.get(worryId)!;
    if (field === 'text' || field === 'worry') w.text = a.answer_text;
    else if (field === 'type' || field === 'situation') w.type = a.answer_text;
    else if (field === 'action') w.actionPlan = a.answer_text;
    else if (field === 'actionWhat' || field === 'actionwhat') w.actionWhat = a.answer_text;
    else if (field === 'actionWhen' || field === 'actionwhen') w.actionWhen = a.answer_text;
    else if (field === 'actionHow' || field === 'actionhow') w.actionHow = a.answer_text;
    else if (field === 'canDo' || field === 'cando') w.canDo = a.answer_text;
    else if (field === 'actionType' || field === 'actiontype') w.actionType = a.answer_text;
    else if (field === 'timing') w.timing = a.answer_text;
    else if (field === 'decision') w.decision = a.answer_text;
    else w[field] = a.answer_text;
  });

  const worries = Array.from(worryMap.values());

  return (
    <Card className="border-amber-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          Worry Tree
          <Badge variant="secondary" className="ml-auto text-xs">Saved</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {worries.length === 0 && <p className="text-sm text-muted-foreground">No worries recorded.</p>}
        {worries.map((w, i) => (
          <div key={i} className="rounded-lg border bg-muted/30 p-4 space-y-2">
            {w.text && <Field label="What's worrying you?" value={w.text} />}
            {w.type && <Field label="Type" value={w.type === 'hypothetical' ? 'Hypothetical situation' : w.type === 'current' ? 'Current problem' : w.type} />}
            {w.canDo && <Field label="Can I do something about this?" value={w.canDo} />}
            {w.actionWhat && <Field label="What will you do?" value={w.actionWhat} />}
            {w.actionWhen && <Field label="When will you do it?" value={w.actionWhen} />}
            {w.actionHow && <Field label="How will you do it?" value={w.actionHow} />}
            {w.actionType && <Field label="When?" value={w.actionType} />}
            {w.timing && <Field label="Timing" value={w.timing} />}
            {w.actionPlan && <Field label="Action / Decision" value={w.actionPlan} />}
            {w.decision && <Field label="Decision" value={w.decision} />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Shared field component ───
function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}
