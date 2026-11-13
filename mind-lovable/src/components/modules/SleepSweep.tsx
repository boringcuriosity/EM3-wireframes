import { Moon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SLEEP_SWEEP_QUESTIONS } from '@/types/journal';
import { BulletInput } from './BulletInput';
import { GamifiedProgress } from './GamifiedProgress';

interface Props {
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
}

function countBullets(text: string | undefined) {
  return (text || '').split('\n').filter((l) => l.trim().length > 0).length;
}

export function SleepSweep({ answers, onChange }: Props) {
  const totalFilled = SLEEP_SWEEP_QUESTIONS.reduce(
    (sum, q) => sum + countBullets(answers[q.id]),
    0,
  );
  const goal = SLEEP_SWEEP_QUESTIONS.length * 2;

  return (
    <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-100/40 to-violet-100/40 dark:from-indigo-950/30 dark:to-violet-950/30">
      <CardHeader className="pb-4 space-y-3">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Moon className="h-5 w-5 text-indigo-500" />
          Sleep Sweep — Clear Your Thoughts
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Each night, sweep your mind clean. Jot quick bullets so nothing lingers.
        </p>
        <GamifiedProgress filled={totalFilled} total={goal} accentClass="text-indigo-500" />
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SLEEP_SWEEP_QUESTIONS.map((q) => (
            <div
              key={q.id}
              className="space-y-2 p-3 rounded-lg border border-indigo-300/40 bg-white/60 dark:bg-white/5"
            >
              <Label className="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                {q.text}
              </Label>
              <BulletInput
                value={answers[q.id] || ''}
                onChange={(v) => onChange(q.id, v)}
                placeholder="Sweep a thought..."
                accentClass="text-indigo-500"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
