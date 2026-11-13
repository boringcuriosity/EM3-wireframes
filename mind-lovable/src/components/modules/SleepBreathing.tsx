import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon } from 'lucide-react';
import { useBreathingEngine, type BreathPhase } from '@/hooks/useBreathingEngine';
import { BreathingControls } from '@/components/modules/BreathingControls';

const PHASES: BreathPhase[] = [
  { id: 'inhale', label: 'Inhale', seconds: 4, kind: 'inhale' },
  { id: 'hold', label: 'Hold', seconds: 7, kind: 'hold' },
  { id: 'exhale', label: 'Exhale', seconds: 8, kind: 'exhale' },
];

export function SleepBreathing({ mobile }: { mobile?: string }) {
  const engine = useBreathingEngine({
    mobile,
    exerciseName: 'Sleep-Inducing Breathing Technique',
    exerciseType: '4-7-8',
    phases: PHASES,
  });

  const { running, phase, phaseProgress, secondsLeft, cycles } = engine;

  const scale = !running
    ? 1
    : phase.kind === 'inhale'
      ? 1 + phaseProgress * 0.6
      : phase.kind === 'hold'
        ? 1.6
        : 1.6 - phaseProgress * 0.6;

  return (
    <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-950/20 dark:to-blue-950/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Moon className="h-5 w-5 text-indigo-500" />
          Sleep-Inducing Breathing Technique
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center items-center gap-4 py-2">
          {[
            { t: '4s', l: 'Inhale', bg: 'bg-indigo-100 dark:bg-indigo-900/30', fg: 'text-indigo-600 dark:text-indigo-400', kind: 'inhale' },
            { t: '7s', l: 'Hold', bg: 'bg-purple-100 dark:bg-purple-900/30', fg: 'text-purple-600 dark:text-purple-400', kind: 'hold' },
            { t: '8s', l: 'Exhale', bg: 'bg-blue-100 dark:bg-blue-900/30', fg: 'text-blue-600 dark:text-blue-400', kind: 'exhale' },
          ].map((s, i) => (
            <div key={s.l} className="flex items-center gap-4">
              {i > 0 && <div className="text-2xl text-muted-foreground">→</div>}
              <div className="flex flex-col items-center">
                <div
                  className={`w-20 h-20 rounded-full ${s.bg} ${s.fg} flex items-center justify-center text-2xl font-bold transition-all duration-500 ${
                    running && phase.kind === s.kind ? 'ring-4 ring-offset-2 ring-indigo-400 scale-110' : ''
                  }`}
                >
                  {s.t}
                </div>
                <p className={`mt-2 text-sm font-medium ${s.fg}`}>{s.l}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Breathing bubble */}
        <div className="flex flex-col items-center justify-center py-6" style={{ minHeight: 260 }}>
          <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
            <div
              className="absolute rounded-full bg-gradient-to-br from-indigo-300/60 via-purple-300/50 to-blue-300/40 dark:from-indigo-600/40 dark:via-purple-600/30 dark:to-blue-600/30"
              style={{
                width: 130,
                height: 130,
                transform: `scale(${scale})`,
                transition: 'transform 120ms linear',
                boxShadow: '0 0 60px rgba(99,102,241,0.25)',
              }}
            />
            <div className="relative z-10 text-center">
              <p className="text-lg font-semibold text-foreground">{running ? phase.label : 'Ready'}</p>
              {running && <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-300 tabular-nums">{secondsLeft}</p>}
            </div>
          </div>
          {running && (
            <div className="w-full max-w-xs mt-6">
              <div className="h-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40 overflow-hidden">
                <div
                  className="h-full bg-indigo-500"
                  style={{ width: `${phaseProgress * 100}%`, transition: 'width 120ms linear' }}
                />
              </div>
              <p className="text-center text-xs text-muted-foreground mt-2">
                Completed cycles: <span className="font-medium text-foreground">{cycles}</span>
              </p>
            </div>
          )}
        </div>

        <BreathingControls engine={engine} />

        <p className="text-center text-sm text-muted-foreground">
          Repeat this cycle 3-4 times before sleep for best results.
        </p>
      </CardContent>
    </Card>
  );
}
