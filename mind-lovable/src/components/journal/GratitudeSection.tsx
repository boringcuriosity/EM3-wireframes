import { Heart } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GRATITUDE_QUESTIONS, QuestionAnswer } from '@/types/journal';

interface GratitudeSectionProps {
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
}

const PLACEHOLDERS: Record<string, string> = {
  self: 'A quality, action, or choice you appreciate about yourself...',
  others: 'A person who brightened your day or supports you...',
  life: 'A moment, experience, or simple pleasure from today...',
};

export function GratitudeSection({ answers, onChange }: GratitudeSectionProps) {
  return (
    <div className="journal-section section-gratitude space-y-5">
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5 text-rose-500" />
        <h2 className="font-serif text-xl text-foreground">Gratitude Journal</h2>
      </div>

      <p className="text-sm text-muted-foreground">
        Take a moment to notice the good. What are you thankful for today?
      </p>

      <div className="space-y-4">
        {GRATITUDE_QUESTIONS.map((q) => (
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
