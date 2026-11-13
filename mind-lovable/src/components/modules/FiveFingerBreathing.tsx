import { Hand } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import handImage from '@/assets/five-finger-breathing.jpg';
import { useBreathingEngine, type BreathPhase } from '@/hooks/useBreathingEngine';
import { BreathingControls } from '@/components/modules/BreathingControls';

const FINGERS = ['Thumb', 'Index', 'Middle', 'Ring', 'Little'];

/** Simple hand outline: base → up a finger → down → next finger ... */
const BASE_Y = 180;
const TIPS: [number, number][] = [
  [30, 70],
  [70, 30],
  [105, 20],
  [140, 32],
  [172, 75],
];
const VALLEYS: [number, number][] = [
  [15, 150],
  [50, 110],
  [88, 95],
  [122, 97],
  [155, 112],
  [185, 150],
];

const PHASES: BreathPhase[] = [];
const SEGMENTS: Array<{ from: [number, number]; to: [number, number] }> = [];

TIPS.forEach((tip, i) => {
  PHASES.push({ id: `up-${i}`, label: `Breathe in — ${FINGERS[i]}`, seconds: 4, kind: 'inhale' });
  SEGMENTS.push({ from: VALLEYS[i], to: tip });
  PHASES.push({ id: `down-${i}`, label: `Breathe out — ${FINGERS[i]}`, seconds: 4, kind: 'exhale' });
  SEGMENTS.push({ from: tip, to: VALLEYS[i + 1] });
});

const OUTLINE = (() => {
  let d = `M ${VALLEYS[0][0]} ${BASE_Y} L ${VALLEYS[0][0]} ${VALLEYS[0][1]}`;
  TIPS.forEach((tip, i) => {
    d += ` L ${tip[0]} ${tip[1]} L ${VALLEYS[i + 1][0]} ${VALLEYS[i + 1][1]}`;
  });
  d += ` L ${VALLEYS[5][0]} ${BASE_Y} Z`;
  return d;
})();

export function FiveFingerBreathing({ mobile }: { mobile?: string }) {
  const engine = useBreathingEngine({
    mobile,
    exerciseName: '5 Finger Breathing',
    exerciseType: 'five_finger',
    phases: PHASES,
  });
  const { running, phase, phaseIndex, phaseProgress, secondsLeft, cycles } = engine;

  const seg = SEGMENTS[phaseIndex] ?? SEGMENTS[0];
  const cx = seg.from[0] + (seg.to[0] - seg.from[0]) * phaseProgress;
  const cy = seg.from[1] + (seg.to[1] - seg.from[1]) * phaseProgress;

  return (
    <Card className="border-teal-500/20 bg-gradient-to-br from-teal-50/50 to-cyan-50/50 dark:from-teal-950/20 dark:to-cyan-950/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Hand className="h-5 w-5 text-teal-500" />
          5 Finger Breathing — Calm Brain Break
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center">
          <svg viewBox="0 0 200 200" className="w-60 h-60">
            <path d={OUTLINE} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" className="text-teal-400" />
            {running && (
              <>
                <circle cx={cx} cy={cy} r="12" className="fill-teal-300/40" />
                <circle cx={cx} cy={cy} r="6.5" className="fill-teal-600" />
              </>
            )}
          </svg>
          <p className="text-sm font-semibold text-foreground">
            {running ? `${phase.label} — ${secondsLeft}s` : 'Ready'}
          </p>
          {running && (
            <p className="text-xs text-muted-foreground mt-1">
              Completed hands: <span className="font-medium text-foreground">{cycles}</span>
            </p>
          )}
        </div>

        <BreathingControls engine={engine} />

        <div className="flex justify-center">
          <img
            src={handImage}
            alt="Five finger breathing exercise — trace your hand while breathing"
            className="rounded-xl shadow-md max-w-xs w-full"
            loading="lazy"
          />
        </div>
        <div className="space-y-2 text-sm text-foreground bg-white/60 dark:bg-white/5 rounded-lg p-4">
          <p className="font-medium">How to do it:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Hold one hand open in front of you.</li>
            <li>With the index finger of your other hand, start at the base of your thumb.</li>
            <li>Breathe <strong>in</strong> as you trace up a finger.</li>
            <li>Breathe <strong>out</strong> as you trace down.</li>
            <li>Continue across all five fingers, then reverse.</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
