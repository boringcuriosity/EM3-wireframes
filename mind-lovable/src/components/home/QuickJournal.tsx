import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, Check, BookOpen } from 'lucide-react';

interface QuickJournalProps {
  value: string;
  currentPrompt: string;
  onValueChange: (value: string) => void;
  onPromptChange: () => void;
  onSave: () => void;
  isSaving: boolean;
  lastSaved: Date | null;
}

export function QuickJournal({ 
  value, currentPrompt, onValueChange, onPromptChange, onSave, isSaving, lastSaved 
}: QuickJournalProps) {
  return (
    <Card className="overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-serif">Journaling</CardTitle>
            <CardDescription>Reflect and grow</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-xl bg-gradient-to-r from-primary/8 to-primary/3 border border-primary/10">
          <p className="text-sm text-foreground font-medium italic">&ldquo;{currentPrompt}&rdquo;</p>
        </div>

        <Textarea
          placeholder="Start writing your thoughts..."
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className="min-h-[140px] resize-none bg-background/50 border-border/50 focus:border-primary/40 transition-colors"
        />

        <div className="flex items-center justify-between">
          <button 
            onClick={onPromptChange}
            className="text-sm text-primary hover:underline transition-colors"
          >
            Try another prompt →
          </button>
          
          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-xs text-muted-foreground">Saved</span>
            )}
            <Button 
              onClick={onSave} 
              disabled={isSaving || !value.trim()}
              size="sm"
              className="gap-1.5"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : lastSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              Save Entry
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
