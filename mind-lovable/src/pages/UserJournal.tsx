import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { format, isToday, isFuture } from 'date-fns';
import { FileText, CalendarDays, Smile, Wind, Sparkles, BookOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MoodTracking } from '@/components/home/MoodTracking';
import { BreathingExercise } from '@/components/home/BreathingExercise';
import { DailyAffirmation } from '@/components/home/DailyAffirmation';
import { QuickJournal } from '@/components/home/QuickJournal';
import { PreSessionNotes } from '@/components/home/PreSessionNotes';

import { JournalCalendar } from '@/components/JournalCalendar';
import { PastEntryViewer } from '@/components/PastEntryViewer';
import { GoodFlipLogo } from '@/components/GoodFlipLogo';
import { useSaveAllRecords, useJournalRecords, useCalendarEntries } from '@/hooks/useJournalData';
import { isValidMobile, formatMobile, normalizeMobile } from '@/lib/mobile';
import { JOURNAL_PROMPTS } from '@/types/journal';
import { toast } from 'sonner';
import birdsBg from '@/assets/birds-bg.jpg';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const FEATURE_SECTIONS = [
  { id: 'mood', icon: Smile, title: 'Mood Tracking', description: 'Check in with your emotions daily', color: 'from-[hsl(var(--brand-teal)/0.15)] to-[hsl(var(--brand-teal)/0.05)]', iconColor: 'text-primary' },
  { id: 'breathing', icon: Wind, title: 'Breathing', description: 'Guided breathing exercises', color: 'from-[hsl(var(--brand-blue)/0.15)] to-[hsl(var(--brand-blue)/0.05)]', iconColor: 'text-[hsl(var(--brand-blue))]' },
  { id: 'affirmations', icon: Sparkles, title: 'Affirmations', description: 'Daily positive reminders', color: 'from-[hsl(var(--brand-gold)/0.15)] to-[hsl(var(--brand-gold)/0.05)]', iconColor: 'text-[hsl(var(--brand-gold))]' },
  { id: 'journal', icon: BookOpen, title: 'Journaling', description: 'Reflect and grow', color: 'from-primary/10 to-primary/5', iconColor: 'text-primary' },
] as const;

export default function UserJournal() {
  const { mobile } = useParams<{ mobile: string }>();
  const saveAllRecords = useSaveAllRecords();
  
  const isMobileValid = useMemo(() => mobile && isValidMobile(mobile), [mobile]);
  const normalizedMobile = useMemo(() => mobile ? normalizeMobile(mobile) : '', [mobile]);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const isViewingToday = isToday(selectedDate);
  const isViewingFuture = isFuture(selectedDate) && !isViewingToday;
  const canEdit = isViewingToday;
  
  const { data: entryDates = [] } = useCalendarEntries(normalizedMobile);
  const { data: existingRecords = [], isLoading: recordsLoading } = useJournalRecords(normalizedMobile, dateStr);

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [journalEntry, setJournalEntry] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const today = new Date().toDateString();
    const hash = today.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    setPromptIndex(hash % JOURNAL_PROMPTS.length);
  }, []);

  useEffect(() => {
    if (existingRecords.length > 0 && canEdit) {
      const moodRecord = existingRecords.find(r => r.section === 'mood_tracking' && r.question_id === 'daily_mood');
      if (moodRecord) setSelectedMood(moodRecord.answer_text);
      
      const journalRecord = existingRecords.find(r => r.section === 'home_journal' && r.question_id === 'quick_entry');
      if (journalRecord) setJournalEntry(journalRecord.answer_text);
    }
  }, [existingRecords, canEdit]);

  if (!isMobileValid) return <Navigate to="/" replace />;
  if (isViewingFuture) return <Navigate to={`/u/${mobile}`} replace />;

  const handleDateSelect = (date: Date) => {
    if (isFuture(date) && !isToday(date)) return;
    setSelectedDate(date);
    setShowCalendar(false);
    setSelectedMood(null);
    setJournalEntry('');
    setLastSaved(null);
  };

  const handleFeatureClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setTimeout(() => {
      sectionRefs.current[sectionId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleMoodSelect = async (mood: string) => {
    if (!canEdit) return;
    setSelectedMood(mood);
    try {
      await saveAllRecords.mutateAsync({
        mobile: normalizedMobile,
        date: dateStr,
        records: [{ section: 'mood_tracking', question_id: 'daily_mood', question_text: 'How are you feeling today?', answer_text: mood }],
      });
    } catch (error) {
      console.error('Failed to save mood:', error);
    }
  };

  const handlePromptChange = () => setPromptIndex((prev) => (prev + 1) % JOURNAL_PROMPTS.length);

  const handleSaveJournal = async () => {
    if (!journalEntry.trim() || !canEdit) return;
    try {
      await saveAllRecords.mutateAsync({
        mobile: normalizedMobile,
        date: dateStr,
        records: [{ section: 'home_journal', question_id: 'quick_entry', question_text: JOURNAL_PROMPTS[promptIndex], answer_text: journalEntry }],
      });
      setLastSaved(new Date());
      toast.success('Journal entry saved');
    } catch (error) {
      console.error('Failed to save journal:', error);
      toast.error('Failed to save. Please try again.');
    }
  };

  return (
    <div className="min-h-screen goodflip-bg">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-md sticky top-0 z-10">
        <div className="container max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <GoodFlipLogo size="md" />
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCalendar(!showCalendar)}
                className="gap-2"
              >
                <CalendarDays className="h-4 w-4" />
                {showCalendar ? 'Hide' : 'History'}
              </Button>
              <div className="text-sm text-muted-foreground">
                {formatMobile(normalizedMobile)}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Calendar Section */}
        {showCalendar && (
          <div className="stagger-1">
            <JournalCalendar entryDates={entryDates} selectedDate={selectedDate} onDateSelect={handleDateSelect} />
          </div>
        )}

        {/* Past entry viewer */}
        {!isViewingToday && (
          <div className="stagger-1">
            <PastEntryViewer records={existingRecords} date={selectedDate} isEditable={false} />
            <div className="pt-4 flex flex-col gap-3">
              <Button onClick={() => handleDateSelect(new Date())} className="w-full">Back to Today</Button>
              <Link to={`/u/${mobile}/templates`}>
                <Button variant="outline" className="w-full gap-2">
                  <FileText className="h-4 w-4" />
                  See the ones coach selected for you
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Today's view */}
        {isViewingToday && (
          <>
            {/* Hero Section with Birds Background */}
            <div className="relative rounded-3xl overflow-hidden stagger-1">
              <img
                src={birdsBg}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background/80" />
              <div className="relative text-center py-10 px-6">
                <div className="flex justify-center mb-5 animate-float">
                  <GoodFlipLogo size="lg" />
                </div>
                <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-3 animate-fade-in">
                  {getGreeting()}
                </h1>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.15s' }}>
                  Take a moment to pause, breathe, and nurture your mind. You deserve this time.
                </p>
                <p className="text-xs text-muted-foreground/70 mt-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>

            {/* Coach Templates CTA - most prominent */}
            <div className="stagger-2 space-y-3">
              <Link to={`/u/${mobile}/templates`}>
                <Button className="w-full gap-2 text-base py-6 bg-gradient-to-r from-primary to-[hsl(var(--brand-teal))] hover:opacity-90 shadow-lg">
                  <FileText className="h-5 w-5" />
                  See the ones coach selected for you
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>






            {/* Feature Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              {FEATURE_SECTIONS.map((feature, i) => (
                <button
                  key={feature.id}
                  onClick={() => handleFeatureClick(feature.id)}
                  className={`feature-card text-left bg-gradient-to-br ${feature.color} stagger-${i + 2} group`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-xl bg-card/80 ${feature.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
                </button>
              ))}
            </div>

            {/* Expanded Sections */}
            <div className="space-y-4">
              <div ref={el => sectionRefs.current['mood'] = el}>
                <MoodTracking mobile={normalizedMobile} selectedMood={selectedMood} onMoodSelect={handleMoodSelect} />
              </div>

              <div ref={el => sectionRefs.current['breathing'] = el}>
                <BreathingExercise />
              </div>

              <div ref={el => sectionRefs.current['affirmations'] = el}>
                <DailyAffirmation />
              </div>

              <div ref={el => sectionRefs.current['journal'] = el}>
                <QuickJournal
                  value={journalEntry}
                  currentPrompt={JOURNAL_PROMPTS[promptIndex]}
                  onValueChange={setJournalEntry}
                  onPromptChange={handlePromptChange}
                  onSave={handleSaveJournal}
                  isSaving={saveAllRecords.isPending}
                  lastSaved={lastSaved}
                />
              </div>
            </div>

            {/* Pre-session notes — moved to the bottom of the front page */}
            <PreSessionNotes mobile={normalizedMobile} date={dateStr} canEdit={canEdit} />


            {/* Spacer */}
            <div className="h-4" />
          </>
        )}
      </main>
    </div>
  );
}
