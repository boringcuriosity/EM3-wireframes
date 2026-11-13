CREATE TABLE public.breathing_exercise_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile text NOT NULL,
  exercise_name text NOT NULL,
  exercise_type text NOT NULL,
  session_id text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer,
  completed_cycles integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'started',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.breathing_exercise_sessions TO anon;
GRANT SELECT, INSERT, UPDATE ON public.breathing_exercise_sessions TO authenticated;
GRANT ALL ON public.breathing_exercise_sessions TO service_role;

ALTER TABLE public.breathing_exercise_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read breathing sessions" ON public.breathing_exercise_sessions FOR SELECT USING (true);
CREATE POLICY "public insert breathing sessions" ON public.breathing_exercise_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "public update breathing sessions" ON public.breathing_exercise_sessions FOR UPDATE USING (true) WITH CHECK (true);

CREATE INDEX idx_breathing_sessions_mobile ON public.breathing_exercise_sessions (mobile, started_at DESC);
CREATE UNIQUE INDEX idx_breathing_sessions_session_id ON public.breathing_exercise_sessions (session_id);

CREATE TRIGGER update_breathing_sessions_updated_at
BEFORE UPDATE ON public.breathing_exercise_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.template_assignments ADD COLUMN IF NOT EXISTS habit_duration_weeks integer NOT NULL DEFAULT 4;