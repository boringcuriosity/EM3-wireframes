import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Lightbulb } from 'lucide-react';

export const PROBLEM_SOLVING_QUESTIONS = [
  { id: 'identify_problem', text: 'Identify your problem' },
  { id: 'possible_solution', text: 'Possible solution' },
  { id: 'for', text: 'For' },
  { id: 'against', text: 'Against' },
  { id: 'chosen_solution', text: 'Chosen solution' },
  { id: 'steps_required', text: 'Steps required' },
] as const;

interface ProblemSolvingProps {
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
}

export function ProblemSolving({ answers, onChange }: ProblemSolvingProps) {
  return (
    <Card className="border-orange-500/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Lightbulb className="h-5 w-5 text-orange-500" />
          Problem Solving
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="identify_problem" className="text-sm font-medium">
            Identify your problem
          </Label>
          <Textarea
            id="identify_problem"
            value={answers['identify_problem'] || ''}
            onChange={(e) => onChange('identify_problem', e.target.value)}
            placeholder="What problem are you facing?"
            className="min-h-[80px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="possible_solution" className="text-sm font-medium">
            Possible solution
          </Label>
          <Textarea
            id="possible_solution"
            value={answers['possible_solution'] || ''}
            onChange={(e) => onChange('possible_solution', e.target.value)}
            placeholder="What is a possible solution?"
            className="min-h-[80px] resize-none"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="for" className="text-sm font-medium">For</Label>
            <Textarea
              id="for"
              value={answers['for'] || ''}
              onChange={(e) => onChange('for', e.target.value)}
              placeholder="Arguments for this solution..."
              className="min-h-[100px] resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="against" className="text-sm font-medium">Against</Label>
            <Textarea
              id="against"
              value={answers['against'] || ''}
              onChange={(e) => onChange('against', e.target.value)}
              placeholder="Arguments against this solution..."
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="chosen_solution" className="text-sm font-medium">
            Chosen solution
          </Label>
          <Textarea
            id="chosen_solution"
            value={answers['chosen_solution'] || ''}
            onChange={(e) => onChange('chosen_solution', e.target.value)}
            placeholder="What solution have you chosen?"
            className="min-h-[80px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="steps_required" className="text-sm font-medium">
            Steps required
          </Label>
          <Textarea
            id="steps_required"
            value={answers['steps_required'] || ''}
            onChange={(e) => onChange('steps_required', e.target.value)}
            placeholder="What steps do you need to take?"
            className="min-h-[100px] resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
}
