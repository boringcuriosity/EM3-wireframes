ALTER TABLE public.template_assignments ADD COLUMN fill_count INTEGER NOT NULL DEFAULT 1;

UPDATE public.template_assignments SET fill_count = 1 WHERE fill_count IS NULL;