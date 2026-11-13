ALTER TABLE public.template_assignments
  DROP CONSTRAINT IF EXISTS template_assignments_mobile_template_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS template_assignments_active_mobile_template_date_key
ON public.template_assignments (mobile, template_id, assigned_date)
WHERE is_active = true;