import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CalendarHeart } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MOODS = ['Happy', 'Neutral', 'Angry', 'Sad'];

export const WEEKLY_MOOD_QUESTIONS = [
  { id: 'week_of', text: 'Week of' },
  ...DAYS.map(day => ({ id: `mood_${day.toLowerCase()}`, text: `${day} mood` })),
  { id: 'reflection_notes', text: 'Reflection Notes' },
] as const;

interface WeeklyMoodDiaryProps {
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
}

export function WeeklyMoodDiary({ answers, onChange }: WeeklyMoodDiaryProps) {
  return (
    <Card className="border-purple-500/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <CalendarHeart className="h-5 w-5 text-purple-500" />
          Weekly Mood Diary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="week_of" className="text-sm font-medium">Week of</Label>
          <Input
            id="week_of"
            type="date"
            value={answers['week_of'] || ''}
            onChange={(e) => onChange('week_of', e.target.value)}
            className="w-full max-w-xs"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 border-b text-sm font-medium text-muted-foreground">Day</th>
                {MOODS.map(mood => (
                  <th key={mood} className="text-center p-2 border-b text-sm font-medium text-muted-foreground">
                    {mood}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map(day => (
                <tr key={day} className="border-b last:border-b-0">
                  <td className="p-2 text-sm font-medium">{day}</td>
                  {MOODS.map(mood => (
                    <td key={mood} className="p-2 text-center">
                      <input
                        type="radio"
                        name={`mood_${day.toLowerCase()}`}
                        checked={answers[`mood_${day.toLowerCase()}`] === mood}
                        onChange={() => onChange(`mood_${day.toLowerCase()}`, mood)}
                        className="w-4 h-4 text-purple-500 focus:ring-purple-500"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reflection_notes" className="text-sm font-medium">Reflection Notes</Label>
          <Textarea
            id="reflection_notes"
            value={answers['reflection_notes'] || ''}
            onChange={(e) => onChange('reflection_notes', e.target.value)}
            placeholder="Write your reflections for the week..."
            className="min-h-[100px] resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
}
