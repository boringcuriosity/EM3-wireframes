import { CalendarCheck } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HEALTH_PLANNER_QUESTIONS } from '@/types/journal';
import { BulletInput } from './BulletInput';
import { GamifiedProgress } from './GamifiedProgress';

interface Props {
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
}

const DAY_COLORS: Record<string, string> = {
  monday: 'border-orange-300/60 bg-orange-50/60 dark:bg-orange-950/20',
  tuesday: 'border-green-300/60 bg-green-50/60 dark:bg-green-950/20',
  wednesday: 'border-indigo-300/60 bg-indigo-50/60 dark:bg-indigo-950/20',
  thursday: 'border-amber-300/60 bg-amber-50/60 dark:bg-amber-950/20',
  friday: 'border-pink-300/60 bg-pink-50/60 dark:bg-pink-950/20',
  saturday: 'border-violet-300/60 bg-violet-50/60 dark:bg-violet-950/20',
  sunday: 'border-rose-300/60 bg-rose-50/60 dark:bg-rose-950/20',
  todo: 'border-emerald-300/60 bg-emerald-50/60 dark:bg-emerald-950/20',
  notes: 'border-orange-300/60 bg-orange-50/60 dark:bg-orange-950/20',
};

function countBullets(text: string | undefined) {
  return (text || '').split('\n').filter((l) => l.trim().length > 0).length;
}

export function HealthPlanner({ answers, onChange }: Props) {
  const totalFilled = HEALTH_PLANNER_QUESTIONS.reduce(
    (sum, q) => sum + countBullets(answers[q.id]),
    0,
  );
  // Goal target: ~2 bullets per section
  const goal = HEALTH_PLANNER_QUESTIONS.length * 2;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-blue-50/40 to-purple-50/40 dark:from-blue-950/20 dark:to-purple-950/20">
      <CardHeader className="pb-4 space-y-3">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <CalendarCheck className="h-5 w-5 text-primary" />
          Health Planner
        </CardTitle>
        <GamifiedProgress filled={totalFilled} total={goal} />
      </CardHeader>
      <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {HEALTH_PLANNER_QUESTIONS.map((q) => (
          <div
            key={q.id}
            className={`space-y-2 p-3 rounded-lg border ${DAY_COLORS[q.id] || 'border-border/50 bg-card'}`}
          >
            <Label className="text-xs font-semibold uppercase tracking-wide text-foreground">
              {q.text}
            </Label>
            <BulletInput
              value={answers[q.id] || ''}
              onChange={(v) => onChange(q.id, v)}
              placeholder="Add a point..."
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
