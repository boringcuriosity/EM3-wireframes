import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowDown, Wind } from 'lucide-react';

export const STOP_SWAP_QUESTIONS = [
  { id: 'entries', text: 'Negative and Productive thought pairs' },
] as const;

interface StopAndSwapProps {
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
}

export function StopAndSwap({ answers, onChange }: StopAndSwapProps) {
  const parseEntries = (): { id: string; negative: string; productive: string }[] => {
    const entriesJson = answers['entries'];
    if (entriesJson) {
      try { return JSON.parse(entriesJson); } catch { return []; }
    }
    return [];
  };

  const [negative, setNegative] = useState('');
  const [productive, setProductive] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [entries, setEntries] = useState(parseEntries);
  const [breathCount, setBreathCount] = useState(0);

  // Breathing timer for step 2
  useEffect(() => {
    if (step !== 2) return;
    setBreathCount(0);
    const interval = setInterval(() => {
      setBreathCount(prev => {
        if (prev >= 2) {
          clearInterval(interval);
          setTimeout(() => setStep(3), 500);
          return 3;
        }
        return prev + 1;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [step]);

  const handleSubmitNegative = () => {
    if (!negative.trim()) return;
    setStep(2);
  };

  const handleSubmitProductive = () => {
    if (!productive.trim()) return;
    const newEntry = { id: `thought_${Date.now()}`, negative, productive };
    const updated = [...entries, newEntry];
    setEntries(updated);
    onChange('entries', JSON.stringify(updated));
    // Reset for next entry
    setNegative('');
    setProductive('');
    setStep(1);
  };

  return (
    <Card className="border-red-500/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <ArrowRight className="h-5 w-5 text-red-500" />
          Stop and Swap
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Previously saved entries */}
        {entries.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">Previous entries</Label>
            {entries.map((entry, i) => (
              <div key={entry.id} className="grid md:grid-cols-2 gap-3 p-3 rounded-lg border bg-muted/30">
                <div>
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Negative Thought</p>
                  <p className="text-sm">{entry.negative}</p>
                </div>
                <div>
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Productive Thought</p>
                  <p className="text-sm">{entry.productive}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Negative thought */}
        <div className={`space-y-3 ${step !== 1 ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-900/10 rounded-r-lg p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Step 1</p>
            <Label className="text-sm font-medium">Enter your negative thought</Label>
            <Textarea
              value={negative}
              onChange={(e) => setNegative(e.target.value)}
              placeholder="Write the negative thought..."
              className="min-h-[80px] resize-none bg-background"
              disabled={step !== 1}
            />
            {step === 1 && (
              <Button onClick={handleSubmitNegative} size="sm" disabled={!negative.trim()} className="gap-2">
                Continue <ArrowDown className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Step 2: Breathing intervention */}
        {step >= 2 && (
          <>
            <div className="flex justify-center">
              <ArrowDown className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <div className={`border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10 rounded-r-lg p-6 text-center space-y-3 ${step !== 2 ? 'opacity-70' : ''}`}>
              <Wind className={`h-8 w-8 mx-auto text-blue-500 ${step === 2 ? 'animate-pulse' : ''}`} />
              <p className="text-lg font-medium">Pause. Take 3 deep breaths.</p>
              {step === 2 && (
                <div className="flex justify-center gap-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className={`w-3 h-3 rounded-full transition-colors ${breathCount > i ? 'bg-blue-500' : 'bg-blue-200 dark:bg-blue-800'}`} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Step 3: Productive thought */}
        {step >= 3 && (
          <>
            <div className="flex justify-center">
              <ArrowDown className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <div className="border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-900/10 rounded-r-lg p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Step 3</p>
              <Label className="text-sm font-medium">Now enter a more productive or helpful thought</Label>
              <Textarea
                value={productive}
                onChange={(e) => setProductive(e.target.value)}
                placeholder="Reframe to a productive thought..."
                className="min-h-[80px] resize-none bg-background"
              />
              <Button onClick={handleSubmitProductive} size="sm" disabled={!productive.trim()} className="gap-2">
                Add Entry
              </Button>
            </div>
          </>
        )}

        {/* Daily Affirmation */}
        <div className="pt-4 border-t">
          <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">Daily Affirmation</p>
            <p className="font-medium text-foreground">
              "I am in control of my thoughts, feelings, and actions"
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
