import { CheckCircle2, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HABIT_TRACKER_DAYS } from '@/types/journal';
import type { Habit } from '@/hooks/useWeeklyHabitTracker';

interface Props {
  /** Habit rows for the whole week */
  habits: Habit[];
  onHabitsChange: (habits: Habit[]) => void;
  /** keys: `habit_{id}_{day}` -> '1', plus `goals` */
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
  /** false when the coach defined the habit list */
  canEditHabits?: boolean;
  /** e.g. 'mon' — highlights today's column */
  todayDayId?: string;
  weekLabel?: string;
  /** how many weeks this habit list runs for */
  durationWeeks?: number;
  onDurationChange?: (weeks: number) => void;
}

export function HabitTracker({
  habits,
  onHabitsChange,
  answers,
  onChange,
  canEditHabits = true,
  todayDayId,
  weekLabel,
  durationWeeks = 4,
  onDurationChange,
}: Props) {
  const addHabit = () => {
    const nextId = habits.reduce((max, h) => Math.max(max, h.id), 0) + 1;
    onHabitsChange([...habits, { id: nextId, name: '' }]);
  };

  const renameHabit = (id: number, name: string) => {
    onHabitsChange(habits.map(h => (h.id === id ? { ...h, name } : h)));
  };

  const removeHabit = (id: number) => {
    onHabitsChange(habits.filter(h => h.id !== id));
    HABIT_TRACKER_DAYS.forEach(d => onChange(`habit_${id}_${d.id}`, ''));
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-sky-50/50 to-rose-50/50 dark:from-sky-950/20 dark:to-rose-950/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Weekly Habit Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {canEditHabits
            ? 'Add your habits once — they stay for the whole week. Tick each day as you complete them.'
            : 'Tick each day as you complete the habits your coach set for you.'}
          {weekLabel ? ` (${weekLabel})` : ''}
        </p>

        <div className="rounded-lg border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[160px]">Habit</TableHead>
                {HABIT_TRACKER_DAYS.map(d => (
                  <TableHead
                    key={d.id}
                    className={`text-center px-2 ${d.id === todayDayId ? 'text-primary font-semibold' : ''}`}
                  >
                    {d.text}
                  </TableHead>
                ))}
                {canEditHabits && <TableHead className="w-10" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {habits.length === 0 && (
                <TableRow>
                  <TableCell colSpan={HABIT_TRACKER_DAYS.length + 2} className="text-center text-sm text-muted-foreground py-6">
                    No habits yet — add your first one below.
                  </TableCell>
                </TableRow>
              )}
              {habits.map(habit => (
                <TableRow key={habit.id}>
                  <TableCell className="p-2">
                    {canEditHabits ? (
                      <Input
                        value={habit.name}
                        onChange={(e) => renameHabit(habit.id, e.target.value)}
                        placeholder={`Habit ${habit.id}`}
                        className="h-9 border-border/50"
                      />
                    ) : (
                      <div className="text-sm font-medium text-foreground px-2">{habit.name}</div>
                    )}
                  </TableCell>
                  {HABIT_TRACKER_DAYS.map(d => {
                    const key = `habit_${habit.id}_${d.id}`;
                    const checked = answers[key] === '1';
                    return (
                      <TableCell
                        key={d.id}
                        className={`text-center px-2 ${d.id === todayDayId ? 'bg-primary/5' : ''}`}
                      >
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => onChange(key, v ? '1' : '')}
                            aria-label={`${habit.name || `Habit ${habit.id}`} ${d.text}`}
                          />
                        </div>
                      </TableCell>
                    );
                  })}
                  {canEditHabits && (
                    <TableCell className="px-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeHabit(habit.id)}
                        aria-label={`Remove ${habit.name || `Habit ${habit.id}`}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {canEditHabits && (
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addHabit}>
              <Plus className="h-4 w-4" />
              Add habit
            </Button>
          )}

          {onDurationChange ? (
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium whitespace-nowrap">Keep these habits for</Label>
              <Input
                type="number"
                min={1}
                max={52}
                value={durationWeeks}
                onChange={(e) => onDurationChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="h-9 w-20"
              />
              <span className="text-sm text-muted-foreground">week(s)</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your coach set these habits to run for <span className="font-medium text-foreground">{durationWeeks} week(s)</span>.
            </p>
          )}
        </div>

        <div className="space-y-1 pt-2">
          <Label className="text-sm font-medium">Goals for the week</Label>
          <Textarea
            value={answers['goals'] || ''}
            onChange={(e) => onChange('goals', e.target.value)}
            placeholder="What do you hope to achieve this week?"
            className="min-h-[80px] bg-card border-border/50"
          />
        </div>
      </CardContent>
    </Card>
  );
}
