import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bed, Check } from 'lucide-react';

const TIPS = [
  'During the day, expose yourself to more bright light',
  "Don't take long or irregular naps during the day",
  'Consistently sleep and wake up at the same time every day',
  'Make your bedroom as comfortable as possible',
  'In the evening, relax and clear your mind',
  'Keep dinner light and eat at least 60 minutes before bed',
  'Avoid screen time at least 30 minutes before bed',
  'Keep dim lights or sleep in a dark room',
  'Avoid using the bed for anything other than sleep',
];

export function SleepTips() {
  return (
    <Card className="border-violet-500/20 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Bed className="h-5 w-5 text-violet-500" />
          Tips to Help You Sleep Better at Night
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {TIPS.map((tip, index) => (
            <li key={index} className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <Check className="h-3 w-3" />
              </span>
              <p className="text-foreground">{tip}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
