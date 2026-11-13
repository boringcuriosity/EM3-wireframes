import { Plus, Trash2, AlertCircle, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface WorryEntry {
  id: string;
  text: string;
  type: 'hypothetical' | 'current';
  canDo: 'yes' | 'no' | '';
  actionType: 'now' | 'later' | '';
  actionWhat: string;
  actionWhen: string;
  actionHow: string;
  action: string; // kept for backward compat
  decision: string;
}

interface WorryTreeSectionProps {
  worries: WorryEntry[];
  onChange: (worries: WorryEntry[]) => void;
}

export function WorryTreeSection({ worries, onChange }: WorryTreeSectionProps) {
  const addWorry = () => {
    const newWorry: WorryEntry = {
      id: crypto.randomUUID(),
      text: '', type: 'hypothetical', canDo: '', actionType: '',
      actionWhat: '', actionWhen: '', actionHow: '',
      action: '', decision: '',
    };
    onChange([...worries, newWorry]);
  };

  const updateWorry = (id: string, updates: Partial<WorryEntry>) => {
    onChange(worries.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const removeWorry = (id: string) => {
    onChange(worries.filter(w => w.id !== id));
  };

  return (
    <Card className="border-amber-500/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            The Worry Tree
          </CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addWorry} className="gap-1">
            <Plus className="h-4 w-4" /> Add Worry
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground">
          Follow the worry tree to decide what to do with each worry.
        </p>
        {worries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-xl">
            <p>No worries recorded yet</p>
            <Button type="button" variant="ghost" size="sm" onClick={addWorry} className="mt-2">Add your first worry</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {worries.map((worry, index) => (
              <WorryFlowCard key={worry.id} worry={worry} index={index}
                onUpdate={(updates) => updateWorry(worry.id, updates)}
                onRemove={() => removeWorry(worry.id)} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WorryFlowCard({ worry, index, onUpdate, onRemove }: {
  worry: WorryEntry; index: number;
  onUpdate: (updates: Partial<WorryEntry>) => void; onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 px-4 py-2 border-b border-border/50">
        <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Worry {index + 1}</span>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4 space-y-4">
        {/* Step 1 */}
        <FlowStep stepLabel="Notice the Worry" color="amber">
          <Label className="text-sm font-medium">What am I worrying about?</Label>
          <Textarea value={worry.text} onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder="Describe your worry..." className="min-h-[70px] bg-background" />
        </FlowStep>
        <FlowArrow />

        {/* Step 2: Type */}
        <FlowStep stepLabel="Is this worry about..." color="blue">
          <RadioGroup value={worry.type}
            onValueChange={(v) => onUpdate({ type: v as any, canDo: '', actionType: '', actionWhat: '', actionWhen: '', actionHow: '', action: '', decision: '' })}
            className="space-y-2">
            <div className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="hypothetical" id={`hyp-${worry.id}`} />
              <Label htmlFor={`hyp-${worry.id}`} className="font-normal cursor-pointer flex-1">
                A hypothetical situation <span className="text-muted-foreground text-xs">(future / "what if")</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="current" id={`cur-${worry.id}`} />
              <Label htmlFor={`cur-${worry.id}`} className="font-normal cursor-pointer flex-1">
                A current problem <span className="text-muted-foreground text-xs">(happening now)</span>
              </Label>
            </div>
          </RadioGroup>
        </FlowStep>
        <FlowArrow />

        {/* Hypothetical branch */}
        {worry.type === 'hypothetical' && (
          <FlowStep stepLabel="Hypothetical → Let it go" color="purple">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 space-y-3 border border-purple-200 dark:border-purple-800">
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">This is a hypothetical worry. Try to let it go.</p>
              <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1 list-disc list-inside">
                <li>Let the worry go</li>
                <li>Change your focus of attention</li>
              </ul>
              <Label className="text-sm font-medium">How will you refocus?</Label>
              <Textarea value={worry.decision} onChange={(e) => onUpdate({ decision: e.target.value })}
                placeholder="I will change my focus by..." className="min-h-[60px] bg-background" />
            </div>
          </FlowStep>
        )}

        {/* Current branch */}
        {worry.type === 'current' && (
          <>
            <FlowStep stepLabel="Can I do something about this?" color="green">
              <RadioGroup value={worry.canDo}
                onValueChange={(v) => onUpdate({ canDo: v as any, actionType: '', actionWhat: '', actionWhen: '', actionHow: '', action: '', decision: '' })}
                className="space-y-2">
                <div className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="yes" id={`yes-${worry.id}`} />
                  <Label htmlFor={`yes-${worry.id}`} className="font-normal cursor-pointer flex-1">Yes</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="no" id={`no-${worry.id}`} />
                  <Label htmlFor={`no-${worry.id}`} className="font-normal cursor-pointer flex-1">No</Label>
                </div>
              </RadioGroup>
            </FlowStep>

            {worry.canDo === 'no' && (
              <>
                <FlowArrow />
                <FlowStep stepLabel="No → Let it go" color="purple">
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 space-y-3 border border-purple-200 dark:border-purple-800">
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-200">You can't control this right now. Try to let it go.</p>
                    <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1 list-disc list-inside">
                      <li>Let the worry go</li>
                      <li>Change your focus of attention</li>
                    </ul>
                    <Label className="text-sm font-medium">How will you refocus?</Label>
                    <Textarea value={worry.decision} onChange={(e) => onUpdate({ decision: e.target.value })}
                      placeholder="I will let this go by..." className="min-h-[60px] bg-background" />
                  </div>
                </FlowStep>
              </>
            )}

            {worry.canDo === 'yes' && (
              <>
                <FlowArrow />
                <FlowStep stepLabel="Action Plan" color="emerald">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">What will you do?</Label>
                      <Textarea value={worry.actionWhat} onChange={(e) => onUpdate({ actionWhat: e.target.value })}
                        placeholder="Describe what you will do..." className="min-h-[60px] bg-background" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">When will you do it?</Label>
                      <Textarea value={worry.actionWhen} onChange={(e) => onUpdate({ actionWhen: e.target.value })}
                        placeholder="When will you take action..." className="min-h-[60px] bg-background" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">How will you do it?</Label>
                      <Textarea value={worry.actionHow} onChange={(e) => onUpdate({ actionHow: e.target.value })}
                        placeholder="How will you carry this out..." className="min-h-[60px] bg-background" />
                    </div>
                  </div>
                </FlowStep>

                <FlowArrow />

                <FlowStep stepLabel="Can I do it now or later?" color="sky">
                  <RadioGroup value={worry.actionType}
                    onValueChange={(v) => onUpdate({ actionType: v as 'now' | 'later', decision: '' })}
                    className="space-y-2">
                    <div className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="now" id={`now-${worry.id}`} />
                      <Label htmlFor={`now-${worry.id}`} className="font-normal cursor-pointer flex-1">
                        Now → <span className="font-medium">Do it!</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="later" id={`later-${worry.id}`} />
                      <Label htmlFor={`later-${worry.id}`} className="font-normal cursor-pointer flex-1">
                        Later → <span className="font-medium">Schedule it</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </FlowStep>

                {worry.actionType && (
                  <>
                    <FlowArrow />
                    <FlowStep stepLabel={worry.actionType === 'now' ? "Do it! Then let worry go" : "Schedule it, then let worry go"} color="teal">
                      <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 space-y-3 border border-teal-200 dark:border-teal-800">
                        <p className="text-sm text-teal-800 dark:text-teal-200 font-medium">
                          {worry.actionType === 'now'
                            ? 'Do it now! Then let the worry go and change your focus.'
                            : 'Schedule it for later, then let the worry go and change your focus.'}
                        </p>
                        <Label className="text-sm font-medium">Notes / Next step</Label>
                        <Textarea value={worry.decision} onChange={(e) => onUpdate({ decision: e.target.value })}
                          placeholder={worry.actionType === 'now' ? "What I'm doing right now..." : "When I'll do it (date/time)..."}
                          className="min-h-[60px] bg-background" />
                      </div>
                    </FlowStep>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function FlowStep({ stepLabel, color, children }: { stepLabel: string; color: string; children: React.ReactNode }) {
  const colorMap: Record<string, string> = {
    amber: 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10',
    blue: 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10',
    green: 'border-l-green-500 bg-green-50/50 dark:bg-green-900/10',
    emerald: 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10',
    purple: 'border-l-purple-500 bg-purple-50/50 dark:bg-purple-900/10',
    sky: 'border-l-sky-500 bg-sky-50/50 dark:bg-sky-900/10',
    teal: 'border-l-teal-500 bg-teal-50/50 dark:bg-teal-900/10',
  };
  return (
    <div className={`border-l-4 rounded-r-lg p-4 space-y-3 ${colorMap[color] || colorMap.amber}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stepLabel}</p>
      {children}
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex justify-center">
      <ArrowDown className="h-5 w-5 text-muted-foreground/50" />
    </div>
  );
}
