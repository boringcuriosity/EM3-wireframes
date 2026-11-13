import { Link } from 'react-router-dom';
import { Smile, Wind, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GoodFlipLogo } from '@/components/GoodFlipLogo';

const FEATURES = [
  { icon: Smile, title: 'Mood Tracking', description: 'Check in with your emotions and track patterns over time.' },
  { icon: Wind, title: 'Breathing Exercises', description: 'Guided techniques to help you find calm in any moment.' },
  { icon: Sparkles, title: 'Daily Affirmations', description: 'Positive reminders to nurture your self-worth.' },
  { icon: BookOpen, title: 'Guided Journaling', description: 'Thoughtful prompts to spark self-reflection and growth.' },
];

const Index = () => {
  return (
    <div className="min-h-screen goodflip-bg">
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-md sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <GoodFlipLogo size="md" />
        </div>
      </header>

      {/* Hero */}
      <div className="container max-w-4xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-8 stagger-1">
          <div className="flex justify-center animate-float">
            <GoodFlipLogo size="lg" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground leading-tight">
              A Quiet Space for{' '}
              <span className="text-primary">Reflection</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              A gentle, guided journaling experience to help you process emotions, 
              cultivate gratitude, and find clarity in your daily life.
            </p>
            <div className="pt-2">
              <p className="text-sm text-muted-foreground mb-3">Access your journal via your unique link:</p>
              <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 text-muted-foreground font-mono text-sm">
                <span>/u/</span>
                <span className="text-foreground">your-mobile-number</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <section className="py-16">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`feature-card stagger-${i + 2}`}>
                <div className="p-2 rounded-xl bg-primary/10 w-fit mb-3">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-serif text-lg text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container max-w-2xl mx-auto px-4 text-center space-y-6 stagger-5">
          <h2 className="text-2xl md:text-3xl font-serif text-foreground">Begin Your Journey</h2>
          <p className="text-muted-foreground">Try the journal with a demo account to explore the experience.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/u/9876543210">
              <Button size="lg" className="gap-2 w-full sm:w-auto bg-gradient-to-r from-primary to-[hsl(var(--brand-teal))] hover:opacity-90">
                Try Demo Journal
              </Button>
            </Link>
            <Link to="/coach">
              <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto bg-card/60 backdrop-blur-sm">
                Coach Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-8">
        <div className="container max-w-4xl mx-auto px-4 flex flex-col items-center gap-2">
          <GoodFlipLogo size="sm" />
          <p className="text-sm text-muted-foreground">A space for your thoughts</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
