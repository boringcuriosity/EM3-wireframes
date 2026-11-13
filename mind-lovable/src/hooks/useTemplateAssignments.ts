import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { normalizeMobile } from '@/lib/mobile';
import type { TemplateAssignment } from '@/types/journal';

async function ensureUserExists(mobile: string) {
  const { data, error } = await supabase
    .from('users')
    .select('mobile')
    .eq('mobile', mobile)
    .maybeSingle();

  if (error) throw error;
  if (data) return;

  const { error: insertError } = await supabase
    .from('users')
    .insert([{ mobile }]);

  if (insertError && insertError.code !== '23505') {
    throw insertError;
  }
}

// Fetch active template assignments for a patient.
// For the user side: if no assignments exist for the exact date,
// fall back to the most recent date with assignments (<= requested date).
export function useTemplateAssignments(mobile: string, date?: string) {
  const normalizedMobile = normalizeMobile(mobile);
  
  return useQuery({
    queryKey: ['template-assignments', normalizedMobile, date || 'all'],
    queryFn: async () => {
      if (!date) {
        // No date filter — return all active
        const { data, error } = await supabase
          .from('template_assignments')
          .select('*')
          .eq('mobile', normalizedMobile)
          .eq('is_active', true)
          .order('assigned_at');
        if (error) throw error;
        return data as (TemplateAssignment & { is_active: boolean; assigned_date: string; fill_count: number })[];
      }

      // Try exact date first
      const { data: exact, error: exactErr } = await supabase
        .from('template_assignments')
        .select('*')
        .eq('mobile', normalizedMobile)
        .eq('is_active', true)
        .eq('assigned_date', date)
        .order('assigned_at');
      if (exactErr) throw exactErr;

      if (exact && exact.length > 0) {
        return exact as (TemplateAssignment & { is_active: boolean; assigned_date: string; fill_count: number })[];
      }

      // Fall back: most recent date with active assignments <= requested date
      const { data: fallback, error: fallbackErr } = await supabase
        .from('template_assignments')
        .select('*')
        .eq('mobile', normalizedMobile)
        .eq('is_active', true)
        .lte('assigned_date', date)
        .order('assigned_date', { ascending: false })
        .order('assigned_at');
      if (fallbackErr) throw fallbackErr;

      if (!fallback || fallback.length === 0) return [];

      // Get only assignments from the most recent date
      const latestDate = fallback[0].assigned_date;
      return fallback.filter(a => a.assigned_date === latestDate) as (TemplateAssignment & { is_active: boolean; assigned_date: string; fill_count: number })[];
    },
    enabled: !!mobile,
  });
}

// Get all patients with assignments (for coach view)
export function useAllPatients() {
  return useQuery({
    queryKey: ['all-patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('mobile, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

// Retry helper
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 500): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries - 1) throw err;
      await new Promise(r => setTimeout(r, delay * (attempt + 1)));
    }
  }
  throw new Error('Retry failed');
}

// Save template assignments for a patient on a specific date
export function useSaveTemplateAssignments() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ mobile, templateIds, assignedDate, fillCounts, habitNames, habitDurationWeeks }: { mobile: string; templateIds: string[]; assignedDate: string; fillCounts?: Record<string, number>; habitNames?: Record<string, string[]>; habitDurationWeeks?: Record<string, number> }) => {
      const normalizedMobile = normalizeMobile(mobile);
      
      return withRetry(async () => {
        await ensureUserExists(normalizedMobile);

        // Get current active assignments for this specific date
        const { data: currentActive, error: fetchError } = await supabase
          .from('template_assignments')
          .select('id, template_id, fill_count, habit_names, habit_duration_weeks' as any)
          .eq('mobile', normalizedMobile)
          .eq('is_active', true)
          .eq('assigned_date', assignedDate);
        
        if (fetchError) throw fetchError;
        
        const currentIds = new Set((currentActive || []).map((a: any) => a.template_id));
        const newIds = new Set(templateIds);
        
        // Deactivate assignments that are no longer selected
        const toDeactivateIds = (currentActive || [])
          .filter((a: any) => !newIds.has(a.template_id))
          .map((a: any) => a.id);
        
        if (toDeactivateIds.length > 0) {
          const { error } = await supabase
            .from('template_assignments')
            .update({ is_active: false })
            .in('id', toDeactivateIds);
          if (error) throw error;
        }
        
        // Update fill_count / habit_names for existing assignments that are still selected
        const toUpdate = (currentActive || []).filter((a: any) => newIds.has(a.template_id));
        for (const existing of toUpdate as any[]) {
          const newFillCount = fillCounts?.[existing.template_id] ?? 1;
          const newHabitNames = habitNames?.[existing.template_id] ?? [];
          const patch: any = {};
          if (existing.fill_count !== newFillCount) patch.fill_count = newFillCount;
          if (existing.template_id === 'habit_tracker') {
            const current = existing.habit_names || [];
            if (JSON.stringify(current) !== JSON.stringify(newHabitNames)) {
              patch.habit_names = newHabitNames;
            }
            const newDuration = habitDurationWeeks?.[existing.template_id] ?? 4;
            if (existing.habit_duration_weeks !== newDuration) {
              patch.habit_duration_weeks = newDuration;
            }
          }
          if (Object.keys(patch).length > 0) {
            const { error } = await supabase
              .from('template_assignments')
              .update(patch)
              .eq('id', existing.id);
            if (error) throw error;
          }
        }
        
        // Insert new assignments that aren't already active
        const toInsert = templateIds.filter(id => !currentIds.has(id));
        if (toInsert.length > 0) {
          const { error } = await supabase
          .from('template_assignments')
            .insert(
              toInsert.map(templateId => ({
                mobile: normalizedMobile,
                template_id: templateId,
                assigned_date: assignedDate,
                fill_count: fillCounts?.[templateId] ?? 1,
                // Always include habit_names so PostgREST sees the same columns
                // across every row in the batch (otherwise multi-row inserts fail
                // with "All object keys must match" when only some rows carry it).
                habit_names: templateId === 'habit_tracker' ? (habitNames?.[templateId] ?? []) : [],
                habit_duration_weeks: habitDurationWeeks?.[templateId] ?? 4,
              })) as any
            );
          if (error) throw error;
        }
        
        return [];
      });
    },
    onSuccess: (_, { mobile }) => {
      const normalizedMobile = normalizeMobile(mobile);
      queryClient.invalidateQueries({ queryKey: ['template-assignments', normalizedMobile] });
      queryClient.invalidateQueries({ queryKey: ['all-patients'] });
    },
    retry: 2,
    retryDelay: 1000,
  });
}

