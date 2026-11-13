-- Drop and recreate the CHECK constraint to allow new section types
ALTER TABLE public.journal_records DROP CONSTRAINT IF EXISTS journal_records_section_check;

ALTER TABLE public.journal_records ADD CONSTRAINT journal_records_section_check 
CHECK (section IN (
  'worry_tree', 
  'gratitude', 
  'smart_goal', 
  'motivation',
  'mindful_eating',
  'weekly_mood',
  'motivation_tracker',
  'behavior_change',
  'problem_solving',
  'reframing_thoughts',
  'sleep_tracker',
  'stop_and_swap',
  'tracking_triggers'
));