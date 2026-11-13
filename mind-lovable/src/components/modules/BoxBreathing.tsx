import { Wind } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBreathingEngine, type BreathPhase } from '@/hooks/useBreathingEngine';
import { BreathingControls } from '@/components/modules/BreathingControls';

const NAVY = '#243A52';
const GREEN = '#22A45D';
const PALE_GREEN = '#EAF7F0';
const PALE_NAVY = '#EEF2F6';

const PHASES: BreathPhase[] = [
  { id: 'inhale', label: 'Inhale', seconds: 4, kind: 'inhale' },
  { id: 'hold1', label: 'Hold', seconds: 4, kind: 'hold' },
  { id: 'exhale', label: 'Exhale', seconds: 4, kind: 'exhale' },
  { id: 'hold2', label: 'Hold', seconds: 4, kind: 'hold' },
];

const SIZE = 220;

export function BoxBreathing({ mobile }: { mobile?: string }) {
  const engine = useBreathingEngine({
    mobile,
    exerciseName: 'Box Breathing',
    exerciseType: 'box',
    phases: PHASES,
  });
  const { running, phase, phaseIndex, phaseProgress, secondsLeft, cycles } = engine;

  // Travel one side of the box per phase
  const corners: [number, number][] = [
    [0, 0], [SIZE, 0], [SIZE, SIZE], [0, SIZE], [0, 0],
  ];
  const [sx, sy] = corners[phaseIndex];
  const [ex, ey] = corners[phaseIndex + 1];
  const dx = sx + (ex - sx) * phaseProgress;
  const dy = sy + (ey - sy) * phaseProgress;

  return (
    <Card className="border-teal-500/20 bg-gradient-to-br from-teal-50/50 to-cyan-50/50 dark:from-teal-950/20 dark:to-cyan-950/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Wind className="h-5 w-5 text-teal-500" />
          Box Breathing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground">A simple technique to calm your mind and body in just a few minutes.</p>
        <div className="flex flex-col items-center">
          <div className="relative" style={{ width: SIZE, height: SIZE }}>
            <div className="absolute inset-0 rounded-lg" style={{ border: `3px solid ${PALE_NAVY}` }} />
            {running && (
              <div
                className="absolute rounded-full"
                style={{
                  width: 18,
                  height: 18,
                  backgroundColor: GREEN,
                  left: dx - 9,
                  top: dy - 9,
                  boxShadow: `0 0 0 6px ${PALE_GREEN}`,
                  transition: 'left 120ms linear, top 120ms linear',
                }}
              />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold" style={{ color: NAVY }}>{running ? phase.label : 'Ready'}</span>
              {running && <span className="text-4xl font-bold mt-1 tabular-nums" style={{ color: GREEN }}>{secondsLeft}</span>}
            </div>
          </div>
          {running && (
            <p className="text-xs text-muted-foreground mt-3">
              Completed cycles: <span className="font-medium text-foreground">{cycles}</span>
            </p>
          )}
        </div>

        <BreathingControls engine={engine} />

        <p className="text-xs text-muted-foreground text-center leading-relaxed px-2">
          Use anytime you need a reset — before a meeting, during a break, or before bed.
        </p>
      </CardContent>
    </Card>
  );
}
