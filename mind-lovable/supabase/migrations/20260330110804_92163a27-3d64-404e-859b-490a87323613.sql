
-- Add attachment columns to coach_notes
ALTER TABLE public.coach_notes
  ADD COLUMN IF NOT EXISTS attachment_url text,
  ADD COLUMN IF NOT EXISTS attachment_type text;

-- Create storage bucket for coach attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('coach-attachments', 'coach-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload to the bucket
CREATE POLICY "Allow public upload to coach-attachments"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'coach-attachments');

-- Allow anyone to read from the bucket
CREATE POLICY "Allow public read from coach-attachments"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'coach-attachments');

-- Allow anyone to delete from the bucket
CREATE POLICY "Allow public delete from coach-attachments"
ON storage.objects FOR DELETE TO public
USING (bucket_id = 'coach-attachments');
