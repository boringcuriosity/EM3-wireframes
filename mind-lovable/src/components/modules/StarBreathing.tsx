import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { useBreathingEngine, type BreathPhase } from '@/hooks/useBreathingEngine';
import { BreathingControls } from '@/components/modules/BreathingControls';

/** Star outline vertices (outer tip, inner valley, outer tip, ...) */
const POINTS: [number, number][] = [
  [100, 10], [120, 75], [190, 75], [135, 115], [155, 180],
  [100, 145], [45, 180], [65, 115], [10, 75], [80, 75],
];

/** One cycle = tracing the whole star: 10 edges, with a hold at each outer tip. */
const PHASES: BreathPhase[] = [];
const SEGMENTS: Array<{ from: number; to: number } | null> = [];

for (let e = 0; e < POINTS.length; e++) {
  const from = e;
  const to = (e + 1) % POINTS.length;
  const goingDown = e % 2 === 0; // outer tip -> inner valley
  PHASES.push({
    id: `edge-${e}`,
    label: goingDown ? 'Breathe out' : 'Breathe in',
    seconds: 4,
    kind: goingDown ? 'exhale' : 'inhale',
  });
  SEGMENTS.push({ from, to });
  if (!goingDown) {
    PHASES.push({ id: `hold-${e}`, label: 'Hold', seconds: 2, kind: 'hold' });
    SEGMENTS.push(null); // stay at the tip
  }
}

export function StarBreathing({ mobile }: { mobile?: string }) {
  const engine = useBreathingEngine({
    mobile,
    exerciseName: 'Star Breathing',
    exerciseType: 'star',
    phases: PHASES,
  });
  const { running, phase, phaseIndex, phaseProgress, secondsLeft, cycles } = engine;

  const seg = SEGMENTS[phaseIndex];
  let markerIndex = phaseIndex;
  while (SEGMENTS[markerIndex] === null && markerIndex > 0) markerIndex -= 1;
  const activeSeg = seg ?? SEGMENTS[markerIndex]!;
  const [x1, y1] = POINTS[activeSeg.from];
  const [x2, y2] = POINTS[activeSeg.to];
  const t = seg ? phaseProgress : 1;
  const cx = x1 + (x2 - x1) * t;
  const cy = y1 + (y2 - y1) * t;

  return (
    <Card className="border-amber-500/20 bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Star className="h-5 w-5 text-amber-500" />
          Star Breathing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <p className="text-foreground">
            <span className="font-medium">Step 1:</span> Trace your finger up one side of the star, while you take a deep breath in.
          </p>
          <p className="text-foreground">
            <span className="font-medium">Step 2:</span> Hold your breath at the point and breathe out as you slide down the other side.
          </p>
          <p className="text-foreground">
            <span className="font-medium">Step 3:</span> Keep going until you've gone around the whole star.
          </p>
        </div>

        <div className="flex flex-col items-center py-2">
          <svg viewBox="0 0 200 200" className="w-56 h-56">
            <polygon
              points={POINTS.map(p => p.join(',')).join(' ')}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-amber-400"
            />
            <text x="100" y="5" textAnchor="middle" className="text-[10px] fill-amber-600 dark:fill-amber-400 font-medium">Breathe in</text>
            <text x="195" y="75" textAnchor="start" className="text-[10px] fill-purple-600 dark:fill-purple-400 font-medium">Hold</text>
            <text x="160" y="190" textAnchor="middle" className="text-[10px] fill-blue-600 dark:fill-blue-400 font-medium">Breathe out</text>
            <text x="40" y="190" textAnchor="middle" className="text-[10px] fill-amber-600 dark:fill-amber-400 font-medium">Breathe in</text>
            <text x="5" y="75" textAnchor="end" className="text-[10px] fill-purple-600 dark:fill-purple-400 font-medium">Hold</text>
            {running && (
              <>
                <circle cx={cx} cy={cy} r="11" className="fill-amber-300/40" />
                <circle cx={cx} cy={cy} r="6" className="fill-amber-500" />
              </>
            )}
          </svg>
          <p className="text-sm font-semibold text-foreground mt-1">
            {running ? `${phase.label} — ${secondsLeft}s` : 'Ready'}
          </p>
          {running && (
            <p className="text-xs text-muted-foreground mt-1">
              Completed stars: <span className="font-medium text-foreground">{cycles}</span>
            </p>
          )}
        </div>

        <BreathingControls engine={engine} />

        <div className="flex justify-center gap-6 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            Breathe in
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-400"></span>
            Hold
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-400"></span>
            Breathe out
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
