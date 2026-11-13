import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const TRACKING_TRIGGERS_QUESTIONS = [
  { id: 'entries', text: 'Trigger entries with weekly ratings' },
] as const;

interface TriggerEntry {
  id: string;
  trigger: string;
  notes: string;
  ratings: Record<number, string>; // day index -> rating 1-4
}

interface TrackingTriggersProps {
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
}

export function TrackingTriggers({ answers, onChange }: TrackingTriggersProps) {
  const parseEntries = (): TriggerEntry[] => {
    const entriesJson = answers['entries'];
    if (entriesJson) {
      try {
        return JSON.parse(entriesJson);
      } catch {
        return [];
      }
    }
    return [];
  };

  const [entries, setEntries] = useState<TriggerEntry[]>(parseEntries);

  const addEntry = () => {
    const newEntry: TriggerEntry = {
      id: `trigger_${Date.now()}`,
      trigger: '',
      notes: '',
      ratings: {},
    };
    const updated = [...entries, newEntry];
    setEntries(updated);
    onChange('entries', JSON.stringify(updated));
  };

  const updateEntry = (id: string, field: keyof TriggerEntry, value: string | Record<number, string>) => {
    const updated = entries.map(entry =>
      entry.id === id ? { ...entry, [field]: value } : entry
    );
    setEntries(updated);
    onChange('entries', JSON.stringify(updated));
  };

  const updateRating = (id: string, dayIdx: number, rating: string) => {
    const entry = entries.find(e => e.id === id);
    if (entry) {
      const newRatings = { ...entry.ratings, [dayIdx]: rating };
      updateEntry(id, 'ratings', newRatings);
    }
  };

  const removeEntry = (id: string) => {
    const updated = entries.filter(entry => entry.id !== id);
    setEntries(updated);
    onChange('entries', JSON.stringify(updated));
  };

  return (
    <Card className="border-orange-500/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Tracking My Triggers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-xs text-muted-foreground mb-2">
          Rating scale: 1 (low intensity) - 4 (high intensity)
        </div>
        
        {entries.map((entry) => (
          <div key={entry.id} className="p-4 border rounded-lg space-y-3 bg-muted/30">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Trigger</Label>
                  <Input
                    value={entry.trigger}
                    onChange={(e) => updateEntry(entry.id, 'trigger', e.target.value)}
                    placeholder="What triggers you?"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Situational Notes</Label>
                  <Input
                    value={entry.notes}
                    onChange={(e) => updateEntry(entry.id, 'notes', e.target.value)}
                    placeholder="Context or notes..."
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeEntry(entry.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2 items-center flex-wrap">
              <span className="text-xs text-muted-foreground">Weekly scale:</span>
              {DAYS.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">{day}</span>
                  <Select
                    value={entry.ratings[idx] || ''}
                    onValueChange={(value) => updateRating(entry.id, idx, value)}
                  >
                    <SelectTrigger className="w-12 h-8 text-xs">
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <Button variant="outline" onClick={addEntry} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Trigger
        </Button>
      </CardContent>
    </Card>
  );
}
