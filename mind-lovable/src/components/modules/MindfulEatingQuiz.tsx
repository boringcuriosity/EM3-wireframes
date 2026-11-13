import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Utensils } from 'lucide-react';

export const MINDFUL_EATING_QUESTIONS = [
  { id: 'name', text: 'Name' },
  { id: 'date', text: 'Date' },
  { id: 'why_eat', text: 'Why do you want to eat? Are you hungry, bored or emotional….' },
  { id: 'what_eat', text: 'What do you want to eat?' },
  { id: 'time_of_day', text: 'What time of the day it is?' },
  { id: 'last_meal', text: 'When was your last meal or snack?' },
  { id: 'what_doing', text: 'What are you doing? Watching TV, playing on your phone, working on your computer…..' },
  { id: 'hunger_type', text: 'Are you physically hungry or psychologically hungry?' },
] as const;

interface MindfulEatingQuizProps {
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
}

export function MindfulEatingQuiz({ answers, onChange }: MindfulEatingQuizProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Utensils className="h-5 w-5 text-primary" />
          Mindful Eating Quiz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {MINDFUL_EATING_QUESTIONS.map((question) => (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={`mindful-${question.id}`} className="text-sm font-medium">
              {question.text}
            </Label>
            {question.id === 'name' || question.id === 'date' || question.id === 'time_of_day' || question.id === 'last_meal' ? (
              <Input
                id={`mindful-${question.id}`}
                value={answers[question.id] || ''}
                onChange={(e) => onChange(question.id, e.target.value)}
                placeholder={`Enter ${question.text.toLowerCase()}`}
                className="w-full"
              />
            ) : (
              <Textarea
                id={`mindful-${question.id}`}
                value={answers[question.id] || ''}
                onChange={(e) => onChange(question.id, e.target.value)}
                placeholder="Write your answer..."
                className="min-h-[80px] resize-none"
              />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
