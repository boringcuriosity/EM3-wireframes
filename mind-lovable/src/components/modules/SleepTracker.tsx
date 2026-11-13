import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Moon, Plus, Trash2, Lock } from 'lucide-react';

const WAKE_FEELINGS = ['Rested', 'Tired', 'Angry', 'Anxious', 'Groggy', 'Refreshed', 'Other'];
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CHECKLIST_ITEMS = [
  { id: 'no_caffeine', label: 'Avoided caffeine after afternoon' },
  { id: 'no_screen', label: 'Limited screen time 1 hour before bed' },
  { id: 'bed_only_sleep', label: 'Used bed only for sleep (no work or phone)' },
  { id: 'relaxing_activity', label: 'Did a relaxing activity before bed (reading, breathing, etc.)' },
];

export const SLEEP_TRACKER_QUESTIONS = [
  { id: 'sleep_goal', text: 'Sleep goal (hours per night)' },
  { id: 'entries', text: 'Daily sleep log entries' },
  ...WEEKDAYS.map((day, idx) => ({
    id: `goal_achieved_day_${idx}`,
    text: `${day} - Did you achieve your sleep goal?`,
  })),
] as const;

interface SleepEntry {
  id: string;
  date: string;
  sleep_time: string;
  wake_time: string;
  total_sleep: string;
  trouble_falling: boolean;
  trouble_staying: boolean;
  wake_feeling: string;
  checklist: Record<string, boolean>;
}

interface SleepTrackerProps {
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
}

export function SleepTracker({ answers, onChange }: SleepTrackerProps) {
  const parseEntries = (): SleepEntry[] => {
    const entriesJson = answers['entries'];
    if (entriesJson) {
      try { return JSON.parse(entriesJson); } catch { return []; }
    }
    return [];
  };

  const [entries, setEntries] = useState<SleepEntry[]>(parseEntries);

  const today = new Date();
  const jsDay = today.getDay();
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1;

  const addEntry = () => {
    const newEntry: SleepEntry = {
      id: `sleep_${Date.now()}`,
      date: '', sleep_time: '', wake_time: '', total_sleep: '',
      trouble_falling: false, trouble_staying: false, wake_feeling: '',
      checklist: {},
    };
    const updated = [...entries, newEntry];
    setEntries(updated);
    onChange('entries', JSON.stringify(updated));
  };

  const updateEntry = (id: string, field: string, value: any) => {
    const updated = entries.map(entry =>
      entry.id === id ? { ...entry, [field]: value } : entry
    );
    setEntries(updated);
    onChange('entries', JSON.stringify(updated));
  };

  const updateChecklist = (id: string, checkId: string, checked: boolean) => {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    const newChecklist = { ...entry.checklist, [checkId]: checked };
    updateEntry(id, 'checklist', newChecklist);
  };

  const removeEntry = (id: string) => {
    const updated = entries.filter(entry => entry.id !== id);
    setEntries(updated);
    onChange('entries', JSON.stringify(updated));
  };

  return (
    <Card className="border-blue-500/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Moon className="h-5 w-5 text-blue-500" />
          Sleep Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sleep Goal */}
        <div className="border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10 rounded-r-lg p-4 space-y-2">
          <Label className="text-sm font-medium">How many hours of sleep is your goal per night?</Label>
          <Input
            type="number"
            min={1} max={24} step={0.5}
            value={answers['sleep_goal'] || ''}
            onChange={(e) => onChange('sleep_goal', e.target.value)}
            placeholder="e.g. 8"
            className="w-32 bg-background"
          />
        </div>

        {/* Daily Sleep Log */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Daily Sleep Log</Label>
          {entries.map((entry) => (
            <div key={entry.id} className="p-4 border rounded-lg space-y-4 bg-muted/30">
              <div className="flex justify-between items-start">
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                  <div className="space-y-1">
                    <Label className="text-xs">Start Date</Label>
                    <Input type="date" value={entry.date}
                      onChange={(e) => updateEntry(entry.id, 'date', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Go to bed</Label>
                    <Input type="time" value={entry.sleep_time}
                      onChange={(e) => updateEntry(entry.id, 'sleep_time', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Wake up time</Label>
                    <Input type="time" value={entry.wake_time}
                      onChange={(e) => updateEntry(entry.id, 'wake_time', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Total sleep</Label>
                    <Input value={entry.total_sleep}
                      onChange={(e) => updateEntry(entry.id, 'total_sleep', e.target.value)}
                      placeholder="e.g. 7h 30m" />
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeEntry(entry.id)}
                  className="text-destructive hover:text-destructive ml-2">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Daily Checklist</Label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {CHECKLIST_ITEMS.map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={!!entry.checklist?.[item.id]}
                        onCheckedChange={(checked) => updateChecklist(entry.id, item.id, !!checked)}
                      />
                      <Label className="text-xs font-normal">{item.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-6 items-center">
                <div className="flex items-center gap-2">
                  <Checkbox checked={entry.trouble_falling}
                    onCheckedChange={(checked) => updateEntry(entry.id, 'trouble_falling', !!checked)} />
                  <Label className="text-sm">Trouble falling asleep</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={entry.trouble_staying}
                    onCheckedChange={(checked) => updateEntry(entry.id, 'trouble_staying', !!checked)} />
                  <Label className="text-sm">Trouble staying asleep</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Woke up feeling:</Label>
                  <Select value={entry.wake_feeling}
                    onValueChange={(value) => updateEntry(entry.id, 'wake_feeling', value)}>
                    <SelectTrigger className="w-[140px]"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {WAKE_FEELINGS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addEntry} className="gap-2">
            <Plus className="h-4 w-4" /> Add Sleep Entry
          </Button>
        </div>

        {/* Goal Achievement - weekly radio */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Did you achieve your sleep goal?</Label>
          <div className="space-y-2">
            {WEEKDAYS.map((day, dayIdx) => {
              const val = answers[`goal_achieved_day_${dayIdx}`] || '';
              const isLocked = val && dayIdx < todayIdx;
              const isFuture = dayIdx > todayIdx;

              return (
                <div key={dayIdx} className={`flex items-center justify-between rounded-lg border p-3 ${isLocked ? 'bg-muted/50 opacity-80' : isFuture ? 'opacity-60' : ''}`}>
                  <span className="text-sm font-medium">{day}</span>
                  {isLocked ? (
                    <div className="flex items-center gap-2">
                      <Badge variant={val === 'Yes' ? 'default' : 'outline'} className="text-xs">{val}</Badge>
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </div>
                  ) : isFuture ? (
                    <span className="text-xs text-muted-foreground">Available on {day}</span>
                  ) : (
                    <RadioGroup value={val} onValueChange={(v) => onChange(`goal_achieved_day_${dayIdx}`, v)}
                      className="flex gap-4">
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="Yes" id={`goal_${dayIdx}_yes`} />
                        <Label htmlFor={`goal_${dayIdx}_yes`} className="text-xs cursor-pointer">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="No" id={`goal_${dayIdx}_no`} />
                        <Label htmlFor={`goal_${dayIdx}_no`} className="text-xs cursor-pointer">No</Label>
                      </div>
                    </RadioGroup>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
