import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wind } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { normalizeMobile } from '@/lib/mobile';
import { useBreathingEngine, type BreathPhase } from '@/hooks/useBreathingEngine';
import { BreathingControls } from '@/components/modules/BreathingControls';

const PHASES: BreathPhase[] = [
  { id: 'inhale', label: 'Breathe In...', seconds: 4, kind: 'inhale' },
  { id: 'hold', label: 'Hold...', seconds: 7, kind: 'hold' },
  { id: 'exhale', label: 'Breathe Out...', seconds: 8, kind: 'exhale' },
];

export function BreathingExercise() {
  const { mobile } = useParams<{ mobile: string }>();
  const engine = useBreathingEngine({
    mobile: mobile ? normalizeMobile(mobile) : undefined,
    exerciseName: 'Guided Breathing',
    exerciseType: '4-7-8',
    phases: PHASES,
  });

  const { running, phase, phaseProgress, secondsLeft, cycles } = engine;

  const scale = !running
    ? 1
    : phase.kind === 'inhale'
      ? 1 + phaseProgress * 0.5
      : phase.kind === 'hold'
        ? 1.5
        : 1.5 - phaseProgress * 0.5;

  const phaseColors: Record<string, string> = {
    idle: 'from-primary/20 via-primary/10 to-[hsl(var(--brand-blue)/0.1)]',
    inhale: 'from-[hsl(var(--brand-teal)/0.4)] via-[hsl(var(--brand-blue)/0.25)] to-[hsl(var(--brand-teal)/0.15)]',
    hold: 'from-[hsl(var(--brand-blue)/0.4)] via-[hsl(var(--brand-gold)/0.2)] to-[hsl(var(--brand-blue)/0.15)]',
    exhale: 'from-[hsl(var(--brand-gold)/0.3)] via-[hsl(var(--brand-teal)/0.2)] to-[hsl(var(--brand-gold)/0.1)]',
  };
  const phaseRingColors: Record<string, string> = {
    idle: 'border-primary/20',
    inhale: 'border-[hsl(var(--brand-teal)/0.4)]',
    hold: 'border-[hsl(var(--brand-blue)/0.4)]',
    exhale: 'border-[hsl(var(--brand-gold)/0.4)]',
  };
  const key = running ? phase.kind : 'idle';

  return (
    <Card className="overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[hsl(var(--brand-blue)/0.1)]">
            <Wind className="h-4 w-4 text-[hsl(var(--brand-blue))]" />
          </div>
          <div>
            <CardTitle className="text-lg font-serif">Breathing</CardTitle>
            <CardDescription>Guided breathing exercises</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center py-8 relative">
          {running && (
            <>
              <div className={`absolute w-52 h-52 rounded-full border-2 ${phaseRingColors[key]} animate-breathe opacity-30`} />
              <div
                className={`absolute w-60 h-60 rounded-full border ${phaseRingColors[key]} opacity-15`}
                style={{ animation: 'breathePulse 4s ease-in-out infinite 0.5s' }}
              />
            </>
          )}

          <div
            className={`w-40 h-40 rounded-full bg-gradient-to-br ${phaseColors[key]} flex items-center justify-center shadow-xl relative`}
            style={{
              transform: `scale(${scale})`,
              transition: 'transform 120ms linear',
              boxShadow: running
                ? `0 0 40px hsl(var(--brand-teal) / 0.2), 0 0 80px hsl(var(--brand-blue) / 0.1)`
                : undefined,
            }}
          >
            <div className="absolute inset-3 rounded-full bg-card/20 backdrop-blur-sm" />
            <div className="text-center relative z-10">
              <p className="text-lg font-semibold text-foreground">{running ? phase.label : 'Ready'}</p>
              {running && (
                <p className="text-4xl font-bold text-primary mt-1 tabular-nums">{secondsLeft}</p>
              )}
            </div>
          </div>
        </div>

        {running && (
          <p className="text-center text-xs text-muted-foreground">
            Completed cycles: <span className="font-medium text-foreground">{cycles}</span>
          </p>
        )}

        <BreathingControls engine={engine} startLabel="Start Breathing" />
      </CardContent>
    </Card>
  );
}
