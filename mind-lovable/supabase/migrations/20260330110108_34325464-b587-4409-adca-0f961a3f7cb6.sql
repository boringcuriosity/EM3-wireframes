
CREATE TABLE public.coach_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile text NOT NULL,
  note_text text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coach_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on coach_notes" ON public.coach_notes FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert on coach_notes" ON public.coach_notes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update on coach_notes" ON public.coach_notes FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public delete on coach_notes" ON public.coach_notes FOR DELETE TO public USING (true);
