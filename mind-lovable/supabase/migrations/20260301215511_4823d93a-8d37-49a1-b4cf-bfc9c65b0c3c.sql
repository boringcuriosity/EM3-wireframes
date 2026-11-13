
-- Add is_active column to template_assignments
ALTER TABLE public.template_assignments ADD COLUMN is_active boolean NOT NULL DEFAULT true;

-- Allow UPDATE on template_assignments (needed to deactivate old assignments)
CREATE POLICY "Allow public update on template_assignments" ON public.template_assignments FOR UPDATE USING (true);
