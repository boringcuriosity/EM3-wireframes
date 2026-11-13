
CREATE TABLE public.note_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID NOT NULL REFERENCES public.coach_notes(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'file',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.note_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on note_attachments" ON public.note_attachments FOR SELECT USING (true);
CREATE POLICY "Allow public insert on note_attachments" ON public.note_attachments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete on note_attachments" ON public.note_attachments FOR DELETE USING (true);

CREATE INDEX idx_note_attachments_note_id ON public.note_attachments(note_id);
