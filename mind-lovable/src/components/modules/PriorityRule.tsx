import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  type PriorityRuleEveningReflection,
  type PriorityRuleMorningPlan,
  canAddPriorityTask,
  MAX_PRIORITY_TASKS,
  PRIORITY_RULE_ROUTINE_TASKS,
  priorityRuleStagesFromRecords,
} from '@/lib/priorityRule';

type Props = {
  records: Array<{ question_id: string; answer_text: string }>;
  dateKey: string;
  canEdit: boolean;
  onSaveMorning: (plan: PriorityRuleMorningPlan) => Promise<void>;
  onSaveEvening: (reflection: PriorityRuleEveningReflection, plan: PriorityRuleMorningPlan) => Promise<void>;
};

const EMPTY_MORNING: PriorityRuleMorningPlan = {
  priorities: [''],
  routineTasks: PRIORITY_RULE_ROUTINE_TASKS.map(label => ({ label, done: false })),
  otherTask: '',
  plannedStartTime: '',
  expectedFinishTime: '',
};

const EMPTY_EVENING: PriorityRuleEveningReflection = {
  outcome: '',
  barrier: '',
  wins: [],
};

const WIN_OPTIONS = ['Proud', 'Confident', 'Relieved', 'Motivated', 'Calm', 'More in control'];

export function PriorityRule({ records, dateKey, canEdit, onSaveMorning, onSaveEvening }: Props) {
  const [morning, setMorning] = useState<PriorityRuleMorningPlan>(EMPTY_MORNING);
  const [evening, setEvening] = useState<PriorityRuleEveningReflection>(EMPTY_EVENING);
  const [morningSaved, setMorningSaved] = useState(false);
  const [eveningSaved, setEveningSaved] = useState(false);
  const [saving, setSaving] = useState<'morning' | 'evening' | null>(null);

  useEffect(() => {
    const stages = priorityRuleStagesFromRecords(records);
    setMorning(stages.morning ?? EMPTY_MORNING);
    setEvening(stages.evening ?? EMPTY_EVENING);
    setMorningSaved(!!stages.morning);
    setEveningSaved(!!stages.evening);
  }, [records, dateKey]);

  const updatePriority = (index: number, value: string) => {
    setMorning(current => ({
      ...current,
      priorities: current.priorities.map((task, i) => i === index ? value : task),
    }));
  };

  const updateRoutineTask = (index: number, patch: Partial<PriorityRuleMorningPlan['routineTasks'][number]>) => {
    setMorning(current => ({
      ...current,
      routineTasks: current.routineTasks.map((task, i) => i === index ? { ...task, ...patch } : task),
    }));
  };

  const saveMorning = async () => {
    const plan = {
      ...morning,
      priorities: morning.priorities.map(task => task.trim()).filter(Boolean).slice(0, MAX_PRIORITY_TASKS),
      routineTasks: PRIORITY_RULE_ROUTINE_TASKS.map(label => ({
        label,
        done: morning.routineTasks.find(task => task.label === label)?.done ?? false,
      })),
      otherTask: morning.otherTask.trim(),
    };
    if (plan.priorities.length === 0) return;
    setSaving('morning');
    try {
      await onSaveMorning(plan);
      setMorning(plan);
      setMorningSaved(true);
    } catch {
      // The page-level save callback shows a message and allows retry.
    } finally {
      setSaving(null);
    }
  };

  const saveEvening = async () => {
    setSaving('evening');
    try {
      await onSaveEvening(evening, morning);
      setEveningSaved(true);
    } catch {
      // The page-level save callback shows a message and allows retry.
    } finally {
      setSaving(null);
    }
  };

  const morningLocked = !canEdit || morningSaved;
  const eveningLocked = !canEdit || eveningSaved || !morningSaved;

  return (
    <div className="space-y-5">
      <div className="space-y-2 text-center">
        <p className="text-sm font-medium text-primary">Motivation and clarity</p>
        <h2 className="text-2xl font-semibold text-foreground">The 20–80 Priority Rule</h2>
        <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
          Start with the few future-building tasks that move you toward your goals. Routine tasks keep life running; your priorities deserve your best energy.
        </p>
      </div>

      <Card className="border-primary/20">
        <CardContent className="py-4 text-center">
          <p className="text-sm font-medium text-foreground">The 80% keeps your life running. The 20% changes your life.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Morning plan</CardTitle>
          <p className="text-sm text-muted-foreground">Choose what matters most before routine work takes your energy.</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Today’s 20% · Future-building tasks</h3>
              <p className="text-sm text-muted-foreground">What will move you closer to your long-term goals today?</p>
            </div>
            {morning.priorities.map((priority, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-7 text-sm text-muted-foreground">{index + 1}.</span>
                <Input aria-label={`Priority task ${index + 1}`} value={priority} disabled={morningLocked}
                  onChange={event => updatePriority(index, event.target.value)} placeholder="A task that matters to your future" />
                {canEdit && !morningSaved && morning.priorities.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" aria-label={`Remove priority task ${index + 1}`}
                    onClick={() => setMorning(current => ({ ...current, priorities: current.priorities.filter((_, i) => i !== index) }))}>
                    <Trash2 />
                  </Button>
                )}
              </div>
            ))}
            {canEdit && !morningSaved && canAddPriorityTask(morning.priorities.length) && (
              <Button type="button" variant="outline" size="sm" onClick={() => setMorning(current => ({ ...current, priorities: [...current.priorities, ''] }))}>
                <Plus /> Add priority ({morning.priorities.length}/{MAX_PRIORITY_TASKS})
              </Button>
            )}
          </section>

          <section className="space-y-3 border-t border-border pt-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Today’s 80% · Routine tasks</h3>
              <p className="text-sm text-muted-foreground">Select the routine tasks on your list today.</p>
            </div>
            {morning.routineTasks.map((task, index) => (
              <div key={task.label} className="flex items-center gap-3">
                <Checkbox
                  id={`priority-routine-${dateKey}-${index}`}
                  checked={task.done}
                  disabled={!canEdit || !morningSaved || eveningSaved}
                  onCheckedChange={checked => updateRoutineTask(index, { done: checked === true })}
                />
                <label htmlFor={`priority-routine-${dateKey}-${index}`} className="text-sm font-medium">{task.label}</label>
                {task.label === 'Other' && (
                  <Input
                    aria-label="Other routine task"
                    value={morning.otherTask}
                    disabled={morningLocked}
                    onChange={event => setMorning(current => ({ ...current, otherTask: event.target.value }))}
                    placeholder="Describe other task"
                    className="max-w-sm"
                  />
                )}
              </div>
            ))}
          </section>

          <section className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`priority-start-${dateKey}`}>Planned start time</Label>
              <Input id={`priority-start-${dateKey}`} type="time" value={morning.plannedStartTime} disabled={morningLocked}
                onChange={event => setMorning(current => ({ ...current, plannedStartTime: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`priority-finish-${dateKey}`}>Expected finish time</Label>
              <Input id={`priority-finish-${dateKey}`} type="time" value={morning.expectedFinishTime} disabled={morningLocked}
                onChange={event => setMorning(current => ({ ...current, expectedFinishTime: event.target.value }))} />
            </div>
          </section>

          {canEdit && !morningSaved && (
            <Button onClick={saveMorning} disabled={saving !== null || !morning.priorities.some(task => task.trim())} className="w-full sm:w-auto">
              {saving === 'morning' ? 'Saving…' : 'Save morning plan'}
            </Button>
          )}
          {morningSaved && <p className="text-sm font-medium text-primary">Morning plan saved · your evening reflection is ready.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Evening reflection</CardTitle>
          <p className="text-sm text-muted-foreground">Come back at the end of the day to reflect on your priorities.</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {!morningSaved && <p className="text-sm text-muted-foreground">Save your morning plan first to open the evening reflection.</p>}
          <fieldset disabled={eveningLocked} className="space-y-5 disabled:opacity-60">
            <div className="space-y-2">
              <Label>Did you complete your 20% future-building tasks?</Label>
              <div className="flex flex-wrap gap-2">
                {([
                  ['yes', 'Yes'], ['partly', 'Partly'], ['no', 'No'],
                ] as const).map(([value, label]) => (
                  <Button key={value} type="button" variant={evening.outcome === value ? 'default' : 'outline'} size="sm"
                    onClick={() => setEvening(current => ({ ...current, outcome: value }))}>{label}</Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`priority-barrier-${dateKey}`}>If not, what got in the way?</Label>
              <Textarea id={`priority-barrier-${dateKey}`} value={evening.barrier}
                onChange={event => setEvening(current => ({ ...current, barrier: event.target.value }))} placeholder="Add a note about what got in the way" />
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">How do you feel after completing your important tasks?</legend>
              <div className="flex flex-wrap gap-2">
                {WIN_OPTIONS.map(win => {
                  const selected = evening.wins.includes(win);
                  return <Button key={win} type="button" variant={selected ? 'default' : 'outline'} size="sm"
                    onClick={() => setEvening(current => ({ ...current, wins: selected ? current.wins.filter(item => item !== win) : [...current.wins, win] }))}>
                    {win}
                  </Button>;
                })}
              </div>
            </fieldset>
          </fieldset>
          {canEdit && morningSaved && !eveningSaved && (
            <Button onClick={saveEvening} disabled={saving !== null} className="w-full sm:w-auto">
              {saving === 'evening' ? 'Saving…' : 'Save evening reflection'}
            </Button>
          )}
          {eveningSaved && <p className="text-sm font-medium text-primary">Evening reflection saved.</p>}
        </CardContent>
      </Card>
    </div>
  );
}