import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

const AFFIRMATIONS = [
  'I have weaknesses',
  "I can't please everyone",
  "I can say 'NO'",
  'I am still growing',
  'I make mistakes',
  "I don't have to know everything",
  "I don't have to be perfect",
  "I'm doing what's best for me",
];

export function SelfLoveAffirmations() {
  return (
    <Card className="border-rose-500/20 bg-gradient-to-br from-rose-50/50 to-pink-50/50 dark:from-rose-950/20 dark:to-pink-950/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Sparkles className="h-5 w-5 text-rose-500" />
          Self Love – I Am Enough
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 gap-3">
          {AFFIRMATIONS.map((affirmation, index) => (
            <div
              key={index}
              className="p-4 bg-white/60 dark:bg-white/5 rounded-lg border border-rose-200/50 dark:border-rose-800/30 text-center"
            >
              <p className="text-foreground font-medium">{affirmation}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
