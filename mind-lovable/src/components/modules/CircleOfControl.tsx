import { useEffect, useRef, useState } from 'react';
import { Check, CircleDot, RotateCcw, Undo2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const NAVY = '#243A52';
const GREEN = '#22A45D';
const PALE_GREEN = '#EAF7F0';
const PALE_NAVY = '#EEF2F6';
const PINK = '#E8A0B4';
const PALE_PINK = '#FCEFF3';

const IN_CONTROL = ['my thoughts', 'my words', 'my actions', 'my effort', 'my decisions', 'my attitude', 'my focus', 'my reactions', 'my choices', 'my self-talk'];
const OUT_CONTROL = ["Other people's actions", "Other people's opinions", "Other people's emotions", 'The past', 'The future', 'The economy', 'The environment (weather, natural disasters, traffic)', 'Laws and rules', 'Unexpected events', 'Genetics and Biology'];

type Item = { t: string; zone: 'in' | 'out'; status: 'pool' | 'in' | 'out' };

export function CircleOfControl({ mobile }: { mobile: string }) {
  const buildItems = (): Item[] =>
    [...IN_CONTROL.map<Item>((t) => ({ t, zone: 'in', status: 'pool' })),
      ...OUT_CONTROL.map<Item>((t) => ({ t, zone: 'out', status: 'pool' }))]
      .sort(() => Math.random() - 0.5);

  const [items, setItems] = useState<Item[]>(buildItems);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({});
  const [correctFirstTry, setCorrectFirstTry] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const startedAtRef = useRef<Date>(new Date());
  const completedLoggedRef = useRef(false);

  useEffect(() => {
    if (!mobile) return;
    let cancelled = false;
    supabase.from('circle_of_control_sessions').insert({
      mobile,
      started_at: startedAtRef.current.toISOString(),
      total_items: 20,
      correct_first_try: 0,
      total_attempts: 0,
    }).select('id').single().then(({ data }) => {
      if (!cancelled && data) setSessionId(data.id);
    });
    return () => { cancelled = true; };
  }, [mobile]);

  const place = (zone: 'in' | 'out') => {
    if (selected === null) return;
    const item = items[selected];
    const correct = item.zone === zone;
    const prevAttempts = attemptCounts[item.t] ?? 0;
    const attemptNumber = prevAttempts + 1;

    setAttemptCounts((prev) => ({ ...prev, [item.t]: attemptNumber }));
    setTotalAttempts((n) => n + 1);
    if (correct && attemptNumber === 1) setCorrectFirstTry((n) => n + 1);

    setFeedback({ text: item.t, correct });
    setItems((prev) => {
      const copy = [...prev];
      copy[selected] = { ...item, status: correct ? zone : 'pool' };
      return copy;
    });
    setSelected(null);
    setTimeout(() => setFeedback(null), 1100);

    if (sessionId) {
      supabase.from('circle_of_control_responses').insert({
        session_id: sessionId,
        mobile,
        item_text: item.t,
        correct_zone: item.zone,
        placed_zone: zone,
        was_correct: correct,
        attempt_number: attemptNumber,
      }).then(() => {});
    }
  };

  const undo = (idx: number) =>
    setItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], status: 'pool' };
      return copy;
    });

  const pool = items.filter((i) => i.status === 'pool');
  const sortedCount = items.filter((i) => i.status !== 'pool').length;
  const allSorted = sortedCount === items.length;

  useEffect(() => {
    if (allSorted && sessionId && !completedLoggedRef.current) {
      completedLoggedRef.current = true;
      supabase.from('circle_of_control_sessions').update({
        completed_at: new Date().toISOString(),
        correct_first_try: correctFirstTry,
        total_attempts: totalAttempts,
      }).eq('id', sessionId).then(() => {});
    }
  }, [allSorted, sessionId, correctFirstTry, totalAttempts]);

  const SIZE = 340;
  const CX = SIZE / 2, CY = SIZE / 2;
  const OUTER_R = 155, INNER_R = 78;

  const reset = () => {
    setItems(buildItems());
    setSelected(null);
    setFeedback(null);
    setAttemptCounts({});
    setCorrectFirstTry(0);
    setTotalAttempts(0);
    completedLoggedRef.current = false;
    startedAtRef.current = new Date();
    if (!mobile) return;
    supabase.from('circle_of_control_sessions').insert({
      mobile,
      started_at: startedAtRef.current.toISOString(),
      total_items: 20,
      correct_first_try: 0,
      total_attempts: 0,
    }).select('id').single().then(({ data }) => {
      if (data) setSessionId(data.id);
    });
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <CircleDot className="h-5 w-5 text-primary" />
          Circle of Control
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">Tap a card below, then tap the ring it belongs in.</p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium whitespace-nowrap" style={{ color: NAVY }}>{sortedCount} / {items.length} sorted</span>
          <div className="flex-1 mx-3 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: PALE_NAVY }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(sortedCount / items.length) * 100}%`, backgroundColor: GREEN }} />
          </div>
        </div>

        <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
          <button
            onClick={() => place('out')}
            className="absolute inset-0 rounded-full transition-all"
            style={{ backgroundColor: selected !== null ? '#DCE7F0' : PALE_NAVY, border: `3px solid ${NAVY}` }}
          >
            <span
              className="absolute top-2 left-1/2 -translate-x-1/2 text-[11px] font-bold px-2.5 py-1 rounded-full text-white"
              style={{ backgroundColor: NAVY }}
            >
              Out of My Control
            </span>
          </button>

          {OUT_CONTROL.map((label, idx) => {
            const item = items.find((i) => i.t === label);
            if (!item || item.status !== 'out') return null;
            const angle = (idx / OUT_CONTROL.length) * 2 * Math.PI - Math.PI / 2;
            const x = CX + OUTER_R * Math.cos(angle);
            const y = CY + OUTER_R * Math.sin(angle);
            return (
              <button
                key={label}
                onClick={(e) => { e.stopPropagation(); undo(items.indexOf(item)); }}
                className="absolute text-center leading-tight rounded-lg px-1.5 py-1 bg-white shadow-sm hover:shadow-md transition-shadow"
                style={{ left: x, top: y, width: 78, fontSize: 9, color: NAVY, border: '1px solid #DCE3EA', transform: 'translate(-50%, -50%)', zIndex: 5 }}
                title="Tap to move back"
              >
                {label}
              </button>
            );
          })}

          <button
            onClick={(e) => { e.stopPropagation(); place('in'); }}
            className="absolute rounded-full flex flex-col items-center justify-center p-3 transition-all"
            style={{
              left: CX - INNER_R, top: CY - INNER_R, width: INNER_R * 2, height: INNER_R * 2,
              backgroundColor: selected !== null ? PALE_PINK : 'white', border: `3px solid ${PINK}`, zIndex: 4,
            }}
          >
            <span className="text-[10px] font-bold mb-1.5 px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: PINK }}>
              In My Control
            </span>
            <div className="flex flex-wrap justify-center gap-1 overflow-hidden">
              {IN_CONTROL.map((label) => {
                const item = items.find((i) => i.t === label);
                if (!item || item.status !== 'in') return null;
                return (
                  <span
                    key={label}
                    onClick={(e) => { e.stopPropagation(); undo(items.indexOf(item)); }}
                    className="rounded px-1 py-0.5 cursor-pointer"
                    style={{ fontSize: 8.5, color: NAVY, backgroundColor: PALE_PINK }}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </button>
        </div>

        {feedback && (
          <div
            className="mt-4 flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg justify-center"
            style={{ backgroundColor: feedback.correct ? PALE_GREEN : '#FDECEC', color: NAVY }}
          >
            {feedback.correct ? <Check size={16} style={{ color: GREEN }} /> : <X size={16} style={{ color: '#D14343' }} />}
            {feedback.correct ? 'Correct' : 'Not quite — try the other zone'}
          </div>
        )}

        <div className="mt-5">
          <p className="text-xs font-medium mb-2" style={{ color: NAVY }}>
            {allSorted ? 'All sorted — nice work.' : 'Cards to sort'}
          </p>
          <div className="flex flex-wrap gap-2 min-h-[36px]">
            {pool.map((item) => {
              const realIdx = items.indexOf(item);
              return (
                <button
                  key={item.t}
                  onClick={() => setSelected(realIdx)}
                  className="px-3 py-1.5 rounded-full text-xs transition-all"
                  style={{
                    backgroundColor: selected === realIdx ? GREEN : PALE_NAVY,
                    color: selected === realIdx ? 'white' : NAVY,
                    border: `2px solid ${selected === realIdx ? GREEN : 'transparent'}`,
                  }}
                >
                  {item.t}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-5">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Undo2 size={12} /> Tap a placed card to move it back</span>
        </div>
        <button
          onClick={reset}
          className="mt-3 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mx-auto"
          style={{ backgroundColor: PALE_NAVY, color: NAVY }}
        >
          <RotateCcw size={14} /> Reset
        </button>
      </CardContent>
    </Card>
  );
}
