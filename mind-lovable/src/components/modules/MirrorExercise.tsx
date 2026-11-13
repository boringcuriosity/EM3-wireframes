import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';

const MIRROR_STEPS = [
  'Stand in front of the mirror. Say your name.',
  'Appreciate yourself. Your accomplishments, success, discipline kept and temptations resisted',
  "Say 'I LOVE YOU' to yourself.",
  'Take it in by taking a deep breath',
];

export function MirrorExercise() {
  return (
    <Card className="border-pink-500/20 bg-gradient-to-br from-pink-50/50 to-rose-50/50 dark:from-pink-950/20 dark:to-rose-950/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Heart className="h-5 w-5 text-pink-500" />
          Mirror Exercise
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {MIRROR_STEPS.map((step, index) => (
            <li key={index} className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <p className="text-foreground pt-0.5">{step}</p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
