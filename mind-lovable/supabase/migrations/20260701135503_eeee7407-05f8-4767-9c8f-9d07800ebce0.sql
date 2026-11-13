
CREATE TABLE public.box_breathing_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile text NOT NULL,
  started_at timestamptz,
  completed_at timestamptz,
  duration_seconds integer,
  cycles_completed integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.box_breathing_sessions TO anon, authenticated;
GRANT ALL ON public.box_breathing_sessions TO service_role;
ALTER TABLE public.box_breathing_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read box_breathing" ON public.box_breathing_sessions FOR SELECT USING (true);
CREATE POLICY "public insert box_breathing" ON public.box_breathing_sessions FOR INSERT WITH CHECK (true);

CREATE TABLE public.five_finger_breathing_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile text NOT NULL,
  started_at timestamptz,
  completed_at timestamptz,
  duration_seconds integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.five_finger_breathing_sessions TO anon, authenticated;
GRANT ALL ON public.five_finger_breathing_sessions TO service_role;
ALTER TABLE public.five_finger_breathing_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read five_finger" ON public.five_finger_breathing_sessions FOR SELECT USING (true);
CREATE POLICY "public insert five_finger" ON public.five_finger_breathing_sessions FOR INSERT WITH CHECK (true);

CREATE TABLE public.grounding_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile text NOT NULL,
  viewed_at timestamptz,
  duration_seconds integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.grounding_sessions TO anon, authenticated;
GRANT ALL ON public.grounding_sessions TO service_role;
ALTER TABLE public.grounding_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read grounding" ON public.grounding_sessions FOR SELECT USING (true);
CREATE POLICY "public insert grounding" ON public.grounding_sessions FOR INSERT WITH CHECK (true);

CREATE TABLE public.circle_of_control_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile text NOT NULL,
  started_at timestamptz,
  completed_at timestamptz,
  total_items integer DEFAULT 20,
  correct_first_try integer,
  total_attempts integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.circle_of_control_sessions TO anon, authenticated;
GRANT ALL ON public.circle_of_control_sessions TO service_role;
ALTER TABLE public.circle_of_control_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read coc_sessions" ON public.circle_of_control_sessions FOR SELECT USING (true);
CREATE POLICY "public insert coc_sessions" ON public.circle_of_control_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "public update coc_sessions" ON public.circle_of_control_sessions FOR UPDATE USING (true) WITH CHECK (true);

CREATE TABLE public.circle_of_control_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.circle_of_control_sessions(id) ON DELETE CASCADE,
  mobile text NOT NULL,
  item_text text NOT NULL,
  correct_zone text NOT NULL,
  placed_zone text NOT NULL,
  was_correct boolean NOT NULL,
  attempt_number integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.circle_of_control_responses TO anon, authenticated;
GRANT ALL ON public.circle_of_control_responses TO service_role;
ALTER TABLE public.circle_of_control_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read coc_responses" ON public.circle_of_control_responses FOR SELECT USING (true);
CREATE POLICY "public insert coc_responses" ON public.circle_of_control_responses FOR INSERT WITH CHECK (true);

CREATE TABLE public.cbt_tool_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile text NOT NULL,
  tool_name text NOT NULL,
  opened_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.cbt_tool_usage TO anon, authenticated;
GRANT ALL ON public.cbt_tool_usage TO service_role;
ALTER TABLE public.cbt_tool_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read cbt_tool_usage" ON public.cbt_tool_usage FOR SELECT USING (true);
CREATE POLICY "public insert cbt_tool_usage" ON public.cbt_tool_usage FOR INSERT WITH CHECK (true);
