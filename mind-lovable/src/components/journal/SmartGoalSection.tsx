import { Target } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SMART_GOAL_QUESTIONS } from '@/types/journal';

interface SmartGoalSectionProps {
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
}

const PLACEHOLDERS: Record<string, string> = {
  goal: 'What do you want to achieve?',
  specific: 'What exactly will you do?',
  measurable: 'How will you know when it\'s done?',
  actionable: 'What are the concrete steps?',
  realistic: 'Is this achievable with your current resources?',
  timeBound: 'When will you complete this?',
};

export function SmartGoalSection({ answers, onChange }: SmartGoalSectionProps) {
  return (
    <div className="journal-section section-goal space-y-5">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-sky-600" />
        <h2 className="font-serif text-xl text-foreground">SMART Goal</h2>
      </div>

      <p className="text-sm text-muted-foreground">
        Set one clear goal for today. Break it down to make it achievable.
      </p>

      <div className="space-y-4">
        {SMART_GOAL_QUESTIONS.map((q) => {
          const labelParts = q.text.split(' - ');
          const mainLabel = labelParts[0];
          const isGoal = q.id === 'goal';
          
          return (
            <div key={q.id} className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                {isGoal ? (
                  mainLabel
                ) : (
                  <>
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded bg-primary/10 text-primary">
                      {mainLabel[0]}
                    </span>
                    {mainLabel}
                  </>
                )}
              </Label>
              <Textarea
                value={answers[q.id] || ''}
                onChange={(e) => onChange(q.id, e.target.value)}
                placeholder={PLACEHOLDERS[q.id]}
                className={`bg-card border-border/50 ${isGoal ? 'min-h-[80px]' : 'min-h-[60px]'}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
