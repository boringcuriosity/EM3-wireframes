import { useEffect, useState } from 'react';
import { Brain, BookOpen, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useSaveAllRecords, useJournalRecords } from '@/hooks/useJournalData';
import { toast } from 'sonner';

export function PreSessionNotes({ mobile, date, canEdit }: { mobile: string; date: string; canEdit: boolean }) {
  const { data: records = [] } = useJournalRecords(mobile, date);
  const save = useSaveAllRecords();
  const [brainDump, setBrainDump] = useState('');
  const [reflection, setReflection] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const bd = records.find(r => r.section === 'pre_session' && r.question_id === 'brain_dump');
    const rf = records.find(r => r.section === 'pre_session' && r.question_id === 'reflection');
    if (bd) setBrainDump(bd.answer_text);
    if (rf) setReflection(rf.answer_text);
  }, [records]);

  const handleSave = async () => {
    if (!canEdit) return;
    if (!brainDump.trim() && !reflection.trim()) {
      toast.error('Write something in Brain Dump or Reflection first');
      return;
    }
    setSaving(true);
    try {
      const recs = [];
      if (brainDump.trim()) recs.push({ section: 'pre_session' as const, question_id: 'brain_dump', question_text: 'Brain Dump — How was my week? Challenges and events', answer_text: brainDump });
      if (reflection.trim()) recs.push({ section: 'pre_session' as const, question_id: 'reflection', question_text: 'Reflection on homework — How did it go? What did you notice?', answer_text: reflection });
      await save.mutateAsync({ mobile, date, records: recs });
      toast.success('Pre-session notes saved');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-[hsl(var(--brand-blue)/0.08)] to-[hsl(var(--brand-teal)/0.05)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          Pre-session notes
        </CardTitle>
        <p className="text-xs text-muted-foreground">Prepare for your next session — capture thoughts and reflections.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-border/50 bg-card/60 p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-primary/10"><Brain className="h-4 w-4 text-primary" /></div>
            <h3 className="font-medium text-sm">Brain Dump</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-2">How was my week? Challenges and events</p>
          <Textarea
            value={brainDump}
            onChange={(e) => setBrainDump(e.target.value)}
            disabled={!canEdit}
            placeholder="Write freely..."
            rows={5}
          />
        </div>

        <div className="rounded-xl border border-border/50 bg-card/60 p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-[hsl(var(--brand-blue)/0.15)]"><BookOpen className="h-4 w-4 text-[hsl(var(--brand-blue))]" /></div>
            <h3 className="font-medium text-sm">Reflection on homework</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-2">How did it go? What did you notice?</p>
          <Textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            disabled={!canEdit}
            placeholder="What worked, what didn't, what surprised you..."
            rows={4}
          />
        </div>

        {canEdit && (
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save notes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
