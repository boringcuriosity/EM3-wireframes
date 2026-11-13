import { Progress } from '@/components/ui/progress';
import { Trophy, Flame, Star, Sparkles } from 'lucide-react';

interface Props {
  filled: number;
  total: number;
  accentClass?: string;
}

const TIERS = [
  { min: 0, label: 'Just getting started', icon: Star },
  { min: 25, label: 'Warming up', icon: Sparkles },
  { min: 50, label: 'On a roll!', icon: Flame },
  { min: 80, label: 'Crushing it!', icon: Trophy },
];

export function GamifiedProgress({ filled, total, accentClass = 'text-primary' }: Props) {
  const pct = total === 0 ? 0 : Math.round((filled / total) * 100);
  const tier = [...TIERS].reverse().find((t) => pct >= t.min) || TIERS[0];
  const Icon = tier.icon;
  const xp = filled * 10;

  return (
    <div className="rounded-xl border border-border/40 bg-card/70 backdrop-blur-sm p-3 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className={`flex items-center gap-1.5 font-medium ${accentClass}`}>
          <Icon className="h-3.5 w-3.5" />
          <span>{tier.label}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="font-medium text-foreground">{filled}</span>
          <span>/ {total} filled</span>
          <span className={`font-semibold ${accentClass}`}>+{xp} XP</span>
        </div>
      </div>
      <Progress value={pct} className="h-2" />
    </div>
  );
}
