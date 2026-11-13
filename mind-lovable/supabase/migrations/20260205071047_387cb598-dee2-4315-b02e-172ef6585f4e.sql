-- Create the new journal_records table with granular question/answer storage
CREATE TABLE public.journal_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mobile TEXT NOT NULL,
  entry_date DATE NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('worry_tree', 'gratitude', 'smart_goal', 'motivation')),
  question_id TEXT NOT NULL,
  question_text_snapshot TEXT NOT NULL,
  answer_text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on mobile for faster lookups
CREATE INDEX idx_journal_records_mobile ON public.journal_records(mobile);

-- Create index on mobile + entry_date for filtering
CREATE INDEX idx_journal_records_mobile_date ON public.journal_records(mobile, entry_date);

-- Create unique constraint to prevent duplicate question entries for same mobile/date
CREATE UNIQUE INDEX idx_journal_records_unique_entry ON public.journal_records(mobile, entry_date, section, question_id);

-- Enable Row Level Security
ALTER TABLE public.journal_records ENABLE ROW LEVEL SECURITY;

-- Allow public read (URL-based identity model)
CREATE POLICY "Allow public read on journal_records"
ON public.journal_records
FOR SELECT
USING (true);

-- Allow public insert
CREATE POLICY "Allow public insert on journal_records"
ON public.journal_records
FOR INSERT
WITH CHECK (true);

-- Allow public update
CREATE POLICY "Allow public update on journal_records"
ON public.journal_records
FOR UPDATE
USING (true);

-- Allow public delete (for worry tree entries that can be removed)
CREATE POLICY "Allow public delete on journal_records"
ON public.journal_records
FOR DELETE
USING (true);

-- Add trigger for automatic updated_at timestamp
CREATE TRIGGER update_journal_records_updated_at
BEFORE UPDATE ON public.journal_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();