import { Play, Square, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BreathingEngine } from '@/hooks/useBreathingEngine';

interface Props {
  engine: BreathingEngine;
  startLabel?: string;
  className?: string;
}

export function BreathingControls({ engine, startLabel = 'Start Exercise', className = '' }: Props) {
  const { running, start, stop, soundOn, toggleSound, cycles, phase, secondsLeft } = engine;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-center gap-2">
        {!running ? (
          <Button onClick={start} size="lg" className="gap-2 px-8">
            <Play className="h-4 w-4" />
            {startLabel}
          </Button>
        ) : (
          <Button onClick={stop} size="lg" variant="destructive" className="gap-2 px-8">
            <Square className="h-4 w-4" />
            Stop Exercise
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={toggleSound}
          aria-label={soundOn ? 'Mute sound' : 'Unmute sound'}
          title={soundOn ? 'Mute sound' : 'Unmute sound'}
        >
          {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
      </div>

      {running && (
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <span>
            Phase: <span className="font-medium text-foreground">{phase.label}</span>
          </span>
          <span>
            Left: <span className="font-medium text-foreground tabular-nums">{secondsLeft}s</span>
          </span>
          <span>
            Cycles: <span className="font-medium text-foreground tabular-nums">{cycles}</span>
          </span>
        </div>
      )}
    </div>
  );
}
