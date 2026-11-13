import { useEffect, useRef } from 'react';
import { Sparkles, Eye, Hand, Ear, Flower2, Coffee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const NAVY = '#243A52';
const PALE_NAVY = '#EEF2F6';

export function Grounding54321({ mobile }: { mobile: string }) {
  const startedAtRef = useRef<Date>(new Date());
  const steps = [
    { n: 5, sense: 'see', icon: Eye, color: '#3B82C4', verb: 'Notice' },
    { n: 4, sense: 'touch', icon: Hand, color: '#4E9E6B', verb: 'Find' },
    { n: 3, sense: 'hear', icon: Ear, color: '#D9A441', verb: 'Become aware of' },
    { n: 2, sense: 'smell', icon: Flower2, color: '#D97B4F', verb: 'Notice' },
    { n: 1, sense: 'taste', icon: Coffee, color: '#4E82B0', verb: 'Focus on' },
  ];

  useEffect(() => {
    if (!mobile) return;
    supabase.from('grounding_sessions').insert({
      mobile,
      viewed_at: startedAtRef.current.toISOString(),
      duration_seconds: 0,
    }).then(() => {});
  }, [mobile]);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Sparkles className="h-5 w-5 text-primary" />
          5-4-3-2-1 Grounding
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">To reduce anxiety and focus on the present.</p>
        <div className="flex flex-col gap-2.5">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.n} className="flex items-center gap-3 rounded-xl p-3" style={{ backgroundColor: PALE_NAVY }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                  style={{ backgroundColor: s.color }}
                >
                  {s.n}
                </div>
                <p className="text-sm flex-1" style={{ color: NAVY }}>
                  {s.verb} <b>{s.n}</b> thing{s.n > 1 ? 's' : ''} you can <b>{s.sense}</b>.
                </p>
                <Icon size={18} style={{ color: s.color }} className="shrink-0" />
              </div>
            );
          })}
        </div>
        <div className="text-center mt-5">
          <p className="text-sm font-semibold" style={{ color: NAVY }}>From thinking to sensing</p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2 px-2">
            Take a deep breath, engage your senses, and come back to the present moment. No need to write anything down — just notice.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
