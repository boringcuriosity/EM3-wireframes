import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfWeek, endOfWeek, differenceInCalendarWeeks, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { normalizeMobile } from '@/lib/mobile';

export interface Habit {
  id: number;
  name: string;
}

export interface WeeklyHabitData {
  weekStart: string;
  weekEnd: string;
  habits: Habit[];
  /** keys: `habit_{id}_{day}` -> '1', plus `goals` */
  answers: Record<string, string>;
  /** how many weeks this habit list should keep running */
  durationWeeks: number;
  /** Monday of the week the habit list was first created */
  startWeek: string;
  /** true when the list was carried over from an earlier week */
  carriedOver: boolean;
  /** true when the duration window has elapsed */
  expired: boolean;
}

export const DEFAULT_HABIT_DURATION_WEEKS = 4;

export function getWeekStart(date: Date) {
  return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

function stripBatch(qid: string) {
  return qid.replace(/__b\d+$/, '');
}

/** Habit tracker is week-scoped: all records live on the Monday of the week. */
export function useWeeklyHabitTracker(mobile: string, date: Date, coachDurationWeeks?: number) {
  const normalizedMobile = normalizeMobile(mobile);
  const weekStart = getWeekStart(date);
  const weekEnd = format(endOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['habit-tracker-week', normalizedMobile, weekStart, coachDurationWeeks ?? null],
    queryFn: async (): Promise<WeeklyHabitData> => {
      const { data, error } = await supabase
        .from('journal_records')
        .select('*')
        // pull the whole week so legacy per-day saves are still visible
        .eq('mobile', normalizedMobile)
        .eq('section', 'habit_tracker')
        .gte('entry_date', weekStart)
        .lte('entry_date', weekEnd)
        .order('created_at');

      if (error) throw error;

      const answers: Record<string, string> = {};
      let habitList: Habit[] = [];
      let durationWeeks = coachDurationWeeks ?? DEFAULT_HABIT_DURATION_WEEKS;
      let startWeek = weekStart;

      for (const r of data || []) {
        const qid = stripBatch(r.question_id);
        if (qid === 'habit_list') {
          try {
            const parsed = JSON.parse(r.answer_text);
            if (Array.isArray(parsed)) habitList = parsed;
          } catch {
            /* ignore */
          }
          continue;
        }
        if (qid === 'habit_weeks') {
          const n = parseInt(r.answer_text, 10);
          if (!Number.isNaN(n) && n > 0) durationWeeks = n;
          continue;
        }
        if (qid === 'habit_start_week') {
          if (r.answer_text) startWeek = r.answer_text;
          continue;
        }
        answers[qid] = r.answer_text;
      }

      // Fall back to reconstructing the habit list from `habit_{n}_name` records
      if (habitList.length === 0) {
        const found: Habit[] = [];
        Object.entries(answers).forEach(([k, v]) => {
          const m = k.match(/^habit_(\d+)_name$/);
          if (m && v?.trim()) found.push({ id: parseInt(m[1], 10), name: v });
        });
        habitList = found.sort((a, b) => a.id - b.id);
      }

      let carriedOver = false;
      let expired = false;

      // Nothing saved for this week yet → carry the list forward from the most
      // recent earlier week, as long as the duration window is still open.
      if (habitList.length === 0) {
        const { data: prior, error: priorErr } = await supabase
          .from('journal_records')
          .select('entry_date, question_id, answer_text')
          .eq('mobile', normalizedMobile)
          .eq('section', 'habit_tracker')
          .lt('entry_date', weekStart)
          .in('question_id', ['habit_list', 'habit_weeks', 'habit_start_week'])
          .order('entry_date', { ascending: false });

        if (priorErr) throw priorErr;

        if (prior && prior.length > 0) {
          const latestDate = prior[0].entry_date;
          const group = prior.filter(r => r.entry_date === latestDate);
          let priorHabits: Habit[] = [];
          let priorDuration = coachDurationWeeks ?? DEFAULT_HABIT_DURATION_WEEKS;
          let priorStart = getWeekStart(parseISO(latestDate));

          for (const r of group) {
            if (r.question_id === 'habit_list') {
              try {
                const parsed = JSON.parse(r.answer_text);
                if (Array.isArray(parsed)) priorHabits = parsed;
              } catch {
                /* ignore */
              }
            } else if (r.question_id === 'habit_weeks') {
              const n = parseInt(r.answer_text, 10);
              if (!Number.isNaN(n) && n > 0) priorDuration = n;
            } else if (r.question_id === 'habit_start_week' && r.answer_text) {
              priorStart = r.answer_text;
            }
          }

          if (priorHabits.length > 0) {
            const weeksElapsed = differenceInCalendarWeeks(parseISO(weekStart), parseISO(priorStart), {
              weekStartsOn: 1,
            });
            if (weeksElapsed < priorDuration) {
              habitList = priorHabits;
              durationWeeks = priorDuration;
              startWeek = priorStart;
              carriedOver = true;
            } else {
              expired = true;
            }
          }
        }
      }

      return { weekStart, weekEnd, habits: habitList, answers, durationWeeks, startWeek, carriedOver, expired };
    },
    enabled: !!mobile,
  });
}

export function useSaveWeeklyHabitTracker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      mobile: string;
      date: Date;
      habits: Habit[];
      answers: Record<string, string>;
      durationWeeks?: number;
      startWeek?: string;
    }) => {
      const normalizedMobile = normalizeMobile(params.mobile);
      const weekStart = getWeekStart(params.date);
      const weekEnd = format(endOfWeek(params.date, { weekStartsOn: 1 }), 'yyyy-MM-dd');

      await supabase.from('users').upsert([{ mobile: normalizedMobile }], { onConflict: 'mobile' });

      // Replace the whole week's habit-tracker snapshot (single source of truth)
      const { error: delError } = await supabase
        .from('journal_records')
        .delete()
        .eq('mobile', normalizedMobile)
        .eq('section', 'habit_tracker')
        .gte('entry_date', weekStart)
        .lte('entry_date', weekEnd);
      if (delError) throw delError;

      const rows: Array<{
        mobile: string;
        entry_date: string;
        section: string;
        question_id: string;
        question_text_snapshot: string;
        answer_text: string;
      }> = [
        {
          mobile: normalizedMobile,
          entry_date: weekStart,
          section: 'habit_tracker',
          question_id: 'habit_list',
          question_text_snapshot: 'Habit list for the week',
          answer_text: JSON.stringify(params.habits),
        },
        {
          mobile: normalizedMobile,
          entry_date: weekStart,
          section: 'habit_tracker',
          question_id: 'habit_weeks',
          question_text_snapshot: 'Habit duration (weeks)',
          answer_text: String(params.durationWeeks ?? DEFAULT_HABIT_DURATION_WEEKS),
        },
        {
          mobile: normalizedMobile,
          entry_date: weekStart,
          section: 'habit_tracker',
          question_id: 'habit_start_week',
          question_text_snapshot: 'Habit list start week',
          answer_text: params.startWeek || weekStart,
        },
      ];

      params.habits.forEach(h => {
        rows.push({
          mobile: normalizedMobile,
          entry_date: weekStart,
          section: 'habit_tracker',
          question_id: `habit_${h.id}_name`,
          question_text_snapshot: `Habit ${h.id} — Name`,
          answer_text: h.name || '',
        });
      });

      Object.entries(params.answers).forEach(([qid, value]) => {
        if (!value || qid.endsWith('_name') || qid === 'habit_list') return;
        rows.push({
          mobile: normalizedMobile,
          entry_date: weekStart,
          section: 'habit_tracker',
          question_id: qid,
          question_text_snapshot: qid,
          answer_text: value,
        });
      });

      const { error } = await supabase.from('journal_records').insert(rows);
      if (error) throw error;
      return rows.length;
    },
    onSuccess: (_, params) => {
      const normalizedMobile = normalizeMobile(params.mobile);
      queryClient.invalidateQueries({ queryKey: ['habit-tracker-week', normalizedMobile] });
      queryClient.invalidateQueries({ queryKey: ['journal-records', normalizedMobile] });
      queryClient.invalidateQueries({ queryKey: ['calendar-entries', normalizedMobile] });
    },
  });
}
