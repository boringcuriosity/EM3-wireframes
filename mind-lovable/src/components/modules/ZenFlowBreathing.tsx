import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wind } from 'lucide-react';
import { useBreathingEngine, type BreathPhase } from '@/hooks/useBreathingEngine';
import { BreathingControls } from '@/components/modules/BreathingControls';

const STEPS = [
  { title: 'Breathe In', desc: 'Inhale slowly through your nose.' },
  { title: 'Breathe Out', desc: 'As you exhale through your mouth, silently repeat a calming word.' },
  { title: 'Stay Present', desc: 'If your mind wanders, gently bring your focus back to your breath and word.' },
  { title: 'Repeat for 1–5 minutes', desc: 'Do this while sitting, walking, or during daily tasks.' },
];

const KEYWORDS = ['Peace', 'Relax', 'Let go'];

const PHASES: BreathPhase[] = [
  { id: 'inhale', label: 'Breathe In', seconds: 4, kind: 'inhale' },
  { id: 'exhale', label: 'Breathe Out', seconds: 6, kind: 'exhale' },
];

export function ZenFlowBreathing({ mobile }: { mobile?: string }) {
  const engine = useBreathingEngine({
    mobile,
    exerciseName: 'Zen Flow Breathing',
    exerciseType: 'zen_flow',
    phases: PHASES,
  });
  const { running, phase, phaseProgress, secondsLeft, cycles } = engine;

  const scale = !running ? 1 : phase.kind === 'inhale' ? 1 + phaseProgress * 0.55 : 1.55 - phaseProgress * 0.55;

  return (
    <Card className="border-green-500/20 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Wind className="h-5 w-5 text-green-500" />
          Zen Flow Breathing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center py-4">
          <div className="relative flex items-center justify-center" style={{ width: 210, height: 210 }}>
            <div
              className="absolute rounded-full border border-green-400/40"
              style={{ width: 150, height: 150, transform: `scale(${scale * 1.12})`, transition: 'transform 120ms linear', opacity: 0.4 }}
            />
            <div
              className="absolute rounded-full bg-gradient-to-br from-green-300/60 to-emerald-200/50 dark:from-green-600/40 dark:to-emerald-700/30"
              style={{ width: 140, height: 140, transform: `scale(${scale})`, transition: 'transform 120ms linear' }}
            />
            <div className="relative z-10 text-center">
              <p className="font-semibold text-foreground">{running ? phase.label : 'Ready'}</p>
              {running && <p className="text-3xl font-bold text-green-700 dark:text-green-300 tabular-nums">{secondsLeft}</p>}
            </div>
          </div>
          {running && (
            <p className="text-xs text-muted-foreground mt-3">
              Completed cycles: <span className="font-medium text-foreground">{cycles}</span>
            </p>
          )}
        </div>

        <BreathingControls engine={engine} />

        <div className="space-y-4">
          {STEPS.map((step, index) => (
            <div key={index} className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <div>
                <p className="font-medium text-foreground">{step.title}</p>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-3 text-center">Calming words to use:</p>
          <div className="flex justify-center gap-3">
            {KEYWORDS.map((word) => (
              <span
                key={word}
                className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
