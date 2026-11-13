import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { normalizeMobile } from '@/lib/mobile';
import type { JournalRecord, SectionType, QuestionAnswer } from '@/types/journal';

// Fetch all journal records for a given mobile + date
export function useJournalRecords(mobile: string, date: string) {
  const normalizedMobile = normalizeMobile(mobile);
  
  return useQuery({
    queryKey: ['journal-records', normalizedMobile, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journal_records')
        .select('*')
        .eq('mobile', normalizedMobile)
        .eq('entry_date', date)
        .order('created_at');
      
      if (error) throw error;
      return data as JournalRecord[];
    },
    enabled: !!mobile && !!date,
  });
}

// Get records grouped by section
export function groupRecordsBySection(records: JournalRecord[]): Record<SectionType, QuestionAnswer[]> {
  const grouped: Record<SectionType, QuestionAnswer[]> = {
    worry_tree: [],
    gratitude: [],
    smart_goal: [],
    motivation: [],
    mindful_eating: [],
    weekly_mood: [],
    motivation_tracker: [],
    behavior_change: [],
    problem_solving: [],
    reframing_thoughts: [],
    sleep_tracker: [],
    stop_and_swap: [],
    tracking_triggers: [],
    mood_tracking: [],
    home_journal: [],
    habit_tracker: [],
    health_planner: [],
    sleep_sweep: [],
    five_finger_breathing: [],
    box_breathing: [],
    grounding_54321: [],
    circle_of_control: [],
    pre_session: [],
    priority_rule: [],

  };
  
  for (const record of records) {
    if (grouped[record.section]) {
      grouped[record.section].push({
        question_id: record.question_id,
        question_text: record.question_text_snapshot,
        answer_text: record.answer_text,
      });
    }
  }
  
  return grouped;
}

// Fetch calendar entries (dates that have at least one record)
export function useCalendarEntries(mobile: string) {
  const normalizedMobile = normalizeMobile(mobile);
  
  return useQuery({
    queryKey: ['calendar-entries', normalizedMobile],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journal_records')
        .select('entry_date')
        .eq('mobile', normalizedMobile)
        .order('entry_date', { ascending: false });
      
      if (error) throw error;
      
      // Get unique dates
      const uniqueDates = [...new Set(data.map(d => d.entry_date))];
      return uniqueDates;
    },
    enabled: !!mobile,
  });
}

interface SaveRecordParams {
  mobile: string;
  date: string;
  section: SectionType;
  question_id: string;
  question_text: string;
  answer_text: string;
}

// Save or update a single journal record
export function useSaveRecord() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: SaveRecordParams) => {
      const normalizedMobile = normalizeMobile(params.mobile);
      
      // Ensure user exists
      await supabase
        .from('users')
        .upsert([{ mobile: normalizedMobile }], { onConflict: 'mobile' });
      
      // Upsert the record (uses unique constraint on mobile, entry_date, section, question_id)
      const { data, error } = await supabase
        .from('journal_records')
        .upsert([{
          mobile: normalizedMobile,
          entry_date: params.date,
          section: params.section,
          question_id: params.question_id,
          question_text_snapshot: params.question_text,
          answer_text: params.answer_text,
        }], { 
          onConflict: 'mobile,entry_date,section,question_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, params) => {
      const normalizedMobile = normalizeMobile(params.mobile);
      queryClient.invalidateQueries({ queryKey: ['journal-records', normalizedMobile, params.date] });
      queryClient.invalidateQueries({ queryKey: ['calendar-entries', normalizedMobile] });
    },
  });
}

interface SaveAllRecordsParams {
  mobile: string;
  date: string;
  records: Array<{
    section: SectionType;
    question_id: string;
    question_text: string;
    answer_text: string;
  }>;
}

// Save all journal records at once (batch save)
export function useSaveAllRecords() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: SaveAllRecordsParams) => {
      const normalizedMobile = normalizeMobile(params.mobile);
      
      // Ensure user exists
      await supabase
        .from('users')
        .upsert([{ mobile: normalizedMobile }], { onConflict: 'mobile' });
      
      // Filter out empty answers
      const recordsToSave = params.records.filter(r => r.answer_text.trim() !== '');
      
      if (recordsToSave.length === 0) {
        return [];
      }
      
      // Use insert (not upsert) to support multiple entries with batch IDs
      const { data, error } = await supabase
        .from('journal_records')
        .insert(
          recordsToSave.map(r => ({
            mobile: normalizedMobile,
            entry_date: params.date,
            section: r.section,
            question_id: r.question_id,
            question_text_snapshot: r.question_text,
            answer_text: r.answer_text,
          }))
        )
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, params) => {
      const normalizedMobile = normalizeMobile(params.mobile);
      queryClient.invalidateQueries({ queryKey: ['journal-records', normalizedMobile, params.date] });
      queryClient.invalidateQueries({ queryKey: ['calendar-entries', normalizedMobile] });
    },
  });
}

// Delete a journal record (for removing worry tree entries)
export function useDeleteRecord() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: { mobile: string; date: string; section: SectionType; question_id: string }) => {
      const normalizedMobile = normalizeMobile(params.mobile);
      
      const { error } = await supabase
        .from('journal_records')
        .delete()
        .eq('mobile', normalizedMobile)
        .eq('entry_date', params.date)
        .eq('section', params.section)
        .eq('question_id', params.question_id);
      
      if (error) throw error;
    },
    onSuccess: (_, params) => {
      const normalizedMobile = normalizeMobile(params.mobile);
      queryClient.invalidateQueries({ queryKey: ['journal-records', normalizedMobile, params.date] });
      queryClient.invalidateQueries({ queryKey: ['calendar-entries', normalizedMobile] });
    },
  });
}
