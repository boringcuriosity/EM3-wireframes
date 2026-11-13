import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { DAILY_AFFIRMATIONS } from '@/types/journal';

export function DailyAffirmation() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const hash = today.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    setCurrentIndex(hash % DAILY_AFFIRMATIONS.length);
  }, []);

  const handleNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % DAILY_AFFIRMATIONS.length);
      setIsTransitioning(false);
    }, 200);
  };

  return (
    <Card className="overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[hsl(var(--brand-gold)/0.15)]">
            <Sparkles className="h-4 w-4 text-[hsl(var(--brand-gold))]" />
          </div>
          <div>
            <CardTitle className="text-lg font-serif">Affirmations</CardTitle>
            <CardDescription>Daily positive reminders</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`p-6 rounded-xl bg-gradient-to-br from-[hsl(var(--brand-gold)/0.1)] via-[hsl(var(--brand-teal)/0.05)] to-transparent border border-[hsl(var(--brand-gold)/0.15)] transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-[hsl(var(--brand-gold))] flex-shrink-0 mt-0.5 animate-pulse-soft" />
            <p className="text-foreground font-medium leading-relaxed text-lg">
              {DAILY_AFFIRMATIONS[currentIndex]}
            </p>
          </div>
        </div>

        <Button 
          variant="ghost" 
          onClick={handleNext}
          className="w-full text-primary hover:text-primary hover:bg-primary/10"
        >
          Tap for another affirmation ✨
        </Button>
      </CardContent>
    </Card>
  );
}
