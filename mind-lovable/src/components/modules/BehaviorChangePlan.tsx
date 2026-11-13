import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RefreshCw } from 'lucide-react';

export const BEHAVIOR_CHANGE_QUESTIONS = [
  { id: 'my_change', text: 'My Change' },
  { id: 'staying_same_costs', text: 'Staying the Same - Costs' },
  { id: 'staying_same_benefits', text: 'Staying the Same - Benefits' },
  { id: 'making_change_costs', text: 'Making the Change - Costs' },
  { id: 'making_change_benefits', text: 'Making the Change - Benefits' },
] as const;

interface BehaviorChangePlanProps {
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
}

export function BehaviorChangePlan({ answers, onChange }: BehaviorChangePlanProps) {
  return (
    <Card className="border-teal-500/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <RefreshCw className="h-5 w-5 text-teal-500" />
          Motivational Interviewing – Behavior Change Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="my_change" className="text-sm font-medium">My Change</Label>
          <Textarea
            id="my_change"
            value={answers['my_change'] || ''}
            onChange={(e) => onChange('my_change', e.target.value)}
            placeholder="What change do you want to make?"
            className="min-h-[80px] resize-none"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium text-sm border-b pb-2">Staying the Same</h3>
            <div className="space-y-2">
              <Label htmlFor="staying_same_costs" className="text-sm">Costs</Label>
              <Textarea
                id="staying_same_costs"
                value={answers['staying_same_costs'] || ''}
                onChange={(e) => onChange('staying_same_costs', e.target.value)}
                placeholder="What are the costs of staying the same?"
                className="min-h-[80px] resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staying_same_benefits" className="text-sm">Benefits</Label>
              <Textarea
                id="staying_same_benefits"
                value={answers['staying_same_benefits'] || ''}
                onChange={(e) => onChange('staying_same_benefits', e.target.value)}
                placeholder="What are the benefits of staying the same?"
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-sm border-b pb-2">Making the Change</h3>
            <div className="space-y-2">
              <Label htmlFor="making_change_costs" className="text-sm">Costs</Label>
              <Textarea
                id="making_change_costs"
                value={answers['making_change_costs'] || ''}
                onChange={(e) => onChange('making_change_costs', e.target.value)}
                placeholder="What are the costs of making the change?"
                className="min-h-[80px] resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="making_change_benefits" className="text-sm">Benefits</Label>
              <Textarea
                id="making_change_benefits"
                value={answers['making_change_benefits'] || ''}
                onChange={(e) => onChange('making_change_benefits', e.target.value)}
                placeholder="What are the benefits of making the change?"
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <p className="text-sm font-medium">
            How important is each item to you in making a decision about changing?
          </p>
          <p className="text-xs text-muted-foreground">
            (Put a rating number next to each item)
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-2">
            <span>1 – Slightly important</span>
            <span>2 – Moderately important</span>
            <span>3 – Very important</span>
            <span>4 – Extremely important</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
