import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Brain } from 'lucide-react';

export const REFRAMING_THOUGHTS_QUESTIONS = [
  { id: 'negative_thought', text: 'My negative thought' },
  { id: 'evidence_for', text: 'Evidence for my thought' },
  { id: 'evidence_against', text: 'Evidence against my thought' },
  { id: 'reframe', text: 'How can I reframe my negative thought to a more realistic one?' },
] as const;

interface ReframingThoughtsProps {
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
}

export function ReframingThoughts({ answers, onChange }: ReframingThoughtsProps) {
  return (
    <Card className="border-indigo-500/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Brain className="h-5 w-5 text-indigo-500" />
          Reframing Negative Thoughts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {REFRAMING_THOUGHTS_QUESTIONS.map((question) => (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={`reframe-${question.id}`} className="text-sm font-medium">
              {question.text}
            </Label>
            <Textarea
              id={`reframe-${question.id}`}
              value={answers[question.id] || ''}
              onChange={(e) => onChange(question.id, e.target.value)}
              placeholder="Write your response..."
              className="min-h-[80px] resize-none"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
