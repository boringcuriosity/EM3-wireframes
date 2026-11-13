-- Create table to store coach-assigned templates for each patient
CREATE TABLE public.template_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile TEXT NOT NULL,
  template_id TEXT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (mobile, template_id)
);

-- Enable RLS
ALTER TABLE public.template_assignments ENABLE ROW LEVEL SECURITY;

-- Public read policy (patients need to see their assignments)
CREATE POLICY "Allow public read on template_assignments"
  ON public.template_assignments
  FOR SELECT
  USING (true);

-- Public insert/update/delete for coach operations
CREATE POLICY "Allow public insert on template_assignments"
  ON public.template_assignments
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public delete on template_assignments"
  ON public.template_assignments
  FOR DELETE
  USING (true);

-- Add section type for home_journal (quick journaling on home page)
-- Also add mood_tracking for the home page mood feature
ALTER TABLE public.journal_records DROP CONSTRAINT IF EXISTS journal_records_section_check;

-- Create index for faster lookups
CREATE INDEX idx_template_assignments_mobile ON public.template_assignments(mobile);