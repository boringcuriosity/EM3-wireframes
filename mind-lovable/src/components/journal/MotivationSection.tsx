import { Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MOTIVATION_QUESTIONS } from '@/types/journal';

interface MotivationSectionProps {
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
}

const PLACEHOLDERS: Record<string, string> = {
  difficult: 'Name what\'s challenging you...',
  why: 'Explore possible reasons...',
  lighter: 'What support or change might help...',
  smallThing: 'A tiny, doable step forward...',
};

export function MotivationSection({ answers, onChange }: MotivationSectionProps) {
  return (
    <div className="journal-section section-motivation space-y-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-coral-500" />
        <h2 className="font-serif text-xl text-foreground">Motivation Check-in</h2>
      </div>

      <p className="text-sm text-muted-foreground">
        Reflect on what's hard and find one small way to move forward.
      </p>

      <div className="space-y-4">
        {MOTIVATION_QUESTIONS.map((q) => (
          <div key={q.id} className="space-y-2">
            <Label className="text-sm font-medium">{q.text}</Label>
            <Textarea
              value={answers[q.id] || ''}
              onChange={(e) => onChange(q.id, e.target.value)}
              placeholder={PLACEHOLDERS[q.id]}
              className="min-h-[80px] bg-card border-border/50"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
