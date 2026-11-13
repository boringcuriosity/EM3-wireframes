import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Smile } from 'lucide-react';

const MOODS = [
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'calm', label: 'Calm', emoji: '😌' },
  { id: 'neutral', label: 'Neutral', emoji: '😐' },
  { id: 'sad', label: 'Sad', emoji: '😢' },
  { id: 'stressed', label: 'Stressed', emoji: '😰' },
  { id: 'irritated', label: 'Irritated', emoji: '😤' },
  { id: 'tired', label: 'Tired', emoji: '😴' },
] as const;

const MOOD_MESSAGES: Record<string, string> = {
  happy: "You're feeling happy today. That's wonderful!",
  calm: "You're feeling calm today. Embrace that peace.",
  neutral: "You're feeling neutral today. That's completely okay.",
  sad: "You're feeling sad today. It's okay to feel this way.",
  stressed: "You're feeling stressed today. Remember to breathe.",
  irritated: "You're feeling irritated today. Take a moment for yourself.",
  tired: "You're feeling tired today. Be gentle with yourself.",
};

interface MoodTrackingProps {
  mobile: string;
  selectedMood: string | null;
  onMoodSelect: (mood: string) => void;
}

export function MoodTracking({ mobile, selectedMood, onMoodSelect }: MoodTrackingProps) {
  return (
    <Card className="overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Smile className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-serif">Mood Tracking</CardTitle>
            <CardDescription>Check in with your emotions daily</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {MOODS.map((mood, i) => (
            <button
              key={mood.id}
              onClick={() => onMoodSelect(mood.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-300 hover:scale-110 stagger-${Math.min(i + 1, 5)} ${
                selectedMood === mood.id
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/20 scale-110'
                  : 'border-border/50 hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <span
                className="text-3xl transition-transform duration-500"
                style={{
                  animation: `floatSlow ${3 + i * 0.4}s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                }}
              >
                {mood.emoji}
              </span>
              <span className="text-xs font-medium">{mood.label}</span>
            </button>
          ))}
        </div>
        
        {selectedMood && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 animate-fade-in">
            <p className="text-sm text-foreground">{MOOD_MESSAGES[selectedMood]}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
