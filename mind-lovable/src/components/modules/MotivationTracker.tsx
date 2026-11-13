import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Lock, Zap } from 'lucide-react';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const WEEKDAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MOTIVATION_LEVELS = ['High Motivation', 'Moderate Motivation', 'Low Motivation', 'No Motivation'];

export const MOTIVATION_TRACKER_QUESTIONS = [
  { id: 'month', text: 'Month' },
  { id: 'four_things', text: '4 things that make me feel motivated' },
  ...WEEKDAYS.map((day, idx) => ({
    id: `day_${idx}_level`,
    text: `${day} motivation level`,
  })),
] as const;

interface MotivationTrackerProps {
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
}

export function MotivationTracker({ answers, onChange }: MotivationTrackerProps) {
  // Determine today's day index (0=Mon..6=Sun)
  const today = new Date();
  const jsDay = today.getDay(); // 0=Sun
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1; // Convert to Mon=0

  const handleDayLevelChange = (dayIdx: number, level: string) => {
    onChange(`day_${dayIdx}_level`, level);
  };

  return (
    <Card className="border-yellow-500/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Zap className="h-5 w-5 text-yellow-500" />
          Motivation Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="month" className="text-sm font-medium">Month</Label>
          <Input
            id="month"
            type="month"
            value={answers['month'] || ''}
            onChange={(e) => onChange('month', e.target.value)}
            className="w-full max-w-xs"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="four_things" className="text-sm font-medium">
            4 things that make me feel motivated
          </Label>
          <Textarea
            id="four_things"
            value={answers['four_things'] || ''}
            onChange={(e) => onChange('four_things', e.target.value)}
            placeholder={"1. \n2. \n3. \n4. "}
            className="min-h-[120px] resize-none"
          />
        </div>

        <div className="space-y-4">
          <Label className="text-sm font-medium">Weekly Motivation Level (one per day)</Label>
          <div className="space-y-3">
            {WEEKDAYS.map((day, dayIdx) => {
              const currentValue = answers[`day_${dayIdx}_level`] || '';
              const isLocked = currentValue && dayIdx < todayIdx; // Past days with values are locked
              const isFuture = dayIdx > todayIdx;

              return (
                <div key={dayIdx} className={`rounded-lg border p-3 space-y-2 ${isLocked ? 'bg-muted/50 opacity-80' : isFuture ? 'opacity-60' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{day}</span>
                    {isLocked && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Lock className="h-3 w-3" /> Locked
                      </Badge>
                    )}
                    {currentValue && !isLocked && (
                      <Badge variant="secondary" className="text-xs">{currentValue}</Badge>
                    )}
                  </div>
                  {isLocked ? (
                    <p className="text-sm text-muted-foreground">{currentValue}</p>
                  ) : isFuture ? (
                    <p className="text-xs text-muted-foreground">Available on {day}</p>
                  ) : (
                    <RadioGroup
                      value={currentValue}
                      onValueChange={(v) => handleDayLevelChange(dayIdx, v)}
                      className="flex flex-wrap gap-2"
                    >
                      {MOTIVATION_LEVELS.map(level => (
                        <div key={level} className="flex items-center space-x-1">
                          <RadioGroupItem value={level} id={`mot_${dayIdx}_${level}`} />
                          <Label htmlFor={`mot_${dayIdx}_${level}`} className="text-xs font-normal cursor-pointer">
                            {level.replace(' Motivation', '')}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
