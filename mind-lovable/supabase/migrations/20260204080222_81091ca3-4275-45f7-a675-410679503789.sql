-- Create users table (mobile-based identity)
CREATE TABLE public.users (
  mobile TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Public read/write for users (no auth, URL-based identity)
CREATE POLICY "Allow public read on users"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on users"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- Create focus_areas table
CREATE TABLE public.focus_areas (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on focus_areas
ALTER TABLE public.focus_areas ENABLE ROW LEVEL SECURITY;

-- Public read for focus_areas
CREATE POLICY "Allow public read on focus_areas"
  ON public.focus_areas FOR SELECT
  USING (is_active = true);

-- Create materials table
CREATE TABLE public.materials (
  id TEXT PRIMARY KEY,
  focus_area_id TEXT NOT NULL REFERENCES public.focus_areas(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on materials
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Public read for materials
CREATE POLICY "Allow public read on materials"
  ON public.materials FOR SELECT
  USING (is_active = true);

-- Create daily_entries table
CREATE TABLE public.daily_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile TEXT NOT NULL,
  entry_date DATE NOT NULL,
  focus_area_id TEXT REFERENCES public.focus_areas(id),
  focus_area_title TEXT,
  materials_used JSONB DEFAULT '[]'::jsonb,
  worry_tree JSONB DEFAULT '[]'::jsonb,
  gratitude JSONB DEFAULT '{}'::jsonb,
  smart_goal JSONB DEFAULT '{}'::jsonb,
  motivation JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(mobile, entry_date)
);

-- Enable RLS on daily_entries
ALTER TABLE public.daily_entries ENABLE ROW LEVEL SECURITY;

-- Users can read their own entries
CREATE POLICY "Allow read own entries"
  ON public.daily_entries FOR SELECT
  USING (true);

-- Users can insert their own entries
CREATE POLICY "Allow insert own entries"
  ON public.daily_entries FOR INSERT
  WITH CHECK (true);

-- Users can update their own entries
CREATE POLICY "Allow update own entries"
  ON public.daily_entries FOR UPDATE
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_daily_entries_updated_at
  BEFORE UPDATE ON public.daily_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial focus areas
INSERT INTO public.focus_areas (id, title, description) VALUES
  ('stress', 'Stress', 'Find calm in the chaos and build resilience'),
  ('anxiety', 'Anxiety', 'Learn to quiet anxious thoughts and find peace'),
  ('gratitude', 'Gratitude', 'Cultivate appreciation for life''s blessings'),
  ('self-confidence', 'Self-Confidence', 'Build trust in yourself and your abilities'),
  ('motivation', 'Motivation', 'Discover what drives you forward'),
  ('sleep', 'Sleep', 'Improve rest and nighttime routines'),
  ('relationships', 'Relationships', 'Nurture connections with loved ones'),
  ('self-compassion', 'Self-Compassion', 'Be kinder to yourself'),
  ('mindfulness', 'Mindfulness', 'Stay present in the moment'),
  ('anger', 'Anger', 'Understand and manage difficult emotions'),
  ('grief', 'Grief', 'Process loss with gentle care'),
  ('loneliness', 'Loneliness', 'Find connection and belonging'),
  ('work-life-balance', 'Work-Life Balance', 'Create harmony between responsibilities'),
  ('self-esteem', 'Self-Esteem', 'Recognize and embrace your worth'),
  ('purpose', 'Purpose', 'Explore meaning in your daily life'),
  ('resilience', 'Resilience', 'Bounce back from setbacks stronger'),
  ('communication', 'Communication', 'Express yourself with clarity and care'),
  ('boundaries', 'Boundaries', 'Protect your energy and wellbeing'),
  ('forgiveness', 'Forgiveness', 'Release resentment and find freedom'),
  ('creativity', 'Creativity', 'Unlock your creative potential');

-- Seed initial materials
INSERT INTO public.materials (id, focus_area_id, title, content) VALUES
  ('stress-1', 'stress', 'The 4-7-8 Breathing Technique', 'Find a comfortable position. Breathe in quietly through your nose for 4 seconds. Hold your breath for 7 seconds. Exhale completely through your mouth for 8 seconds. Repeat this cycle 3-4 times. This technique activates your parasympathetic nervous system, helping your body shift from a stressed state to a relaxed one.'),
  ('stress-2', 'stress', 'Identify Your Stress Signals', 'Take a moment to notice how stress shows up in your body. Do you carry tension in your shoulders? Does your jaw clench? Does your heart race? Understanding your personal stress signals helps you catch stress early, before it builds.'),
  ('stress-3', 'stress', 'The One Thing Rule', 'When overwhelmed, ask yourself: "What is the ONE thing I can do right now?" Focus only on that single task. Give yourself permission to let everything else wait. Progress, not perfection, reduces stress.'),
  ('anxiety-1', 'anxiety', 'Ground Yourself with 5-4-3-2-1', 'Name 5 things you can see. 4 things you can touch. 3 things you can hear. 2 things you can smell. 1 thing you can taste. This sensory exercise brings you back to the present moment when anxious thoughts pull you elsewhere.'),
  ('anxiety-2', 'anxiety', 'Question Your Worries', 'When an anxious thought appears, gently ask: Is this thought based on fact or assumption? What would I tell a friend who had this worry? What is the most realistic outcome?'),
  ('anxiety-3', 'anxiety', 'Create a Worry Window', 'Designate a specific 15-minute period each day as your "worry time." When worries arise outside this window, write them down and save them for later. This helps contain anxiety without ignoring it.'),
  ('gratitude-1', 'gratitude', 'The Three Good Things Practice', 'Each evening, write down three good things that happened today, no matter how small. A warm cup of tea. A kind word from someone. A moment of sunshine. Training your mind to notice goodness changes how you experience each day.'),
  ('gratitude-2', 'gratitude', 'Gratitude Letter', 'Think of someone who has positively impacted your life. Write them a letter expressing your appreciation. You can share it with them or keep it for yourself. The act of writing deepens gratitude.'),
  ('gratitude-3', 'gratitude', 'Find the Hidden Gift', 'In difficult moments, ask: What might this situation be teaching me? What strength am I developing? This isn''t about toxic positivity—it''s about finding meaning even in struggle.');

-- Create index for faster queries
CREATE INDEX idx_daily_entries_mobile ON public.daily_entries(mobile);
CREATE INDEX idx_daily_entries_date ON public.daily_entries(entry_date);
CREATE INDEX idx_daily_entries_mobile_date ON public.daily_entries(mobile, entry_date);