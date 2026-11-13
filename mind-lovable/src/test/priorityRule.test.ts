import { describe, expect, it } from 'vitest';
import {
  canAddPriorityTask,
  MAX_PRIORITY_TASKS,
  normalizePriorityTaskCount,
  PRIORITY_RULE_ROUTINE_TASKS,
  priorityRuleStagesFromRecords,
} from '../lib/priorityRule';

describe('20–80 Priority Rule', () => {
  it('limits future-building priorities to three tasks', () => {
    expect(MAX_PRIORITY_TASKS).toBe(3);
    expect(canAddPriorityTask(2)).toBe(true);
    expect(canAddPriorityTask(3)).toBe(false);
    expect(normalizePriorityTaskCount(['one', 'two', 'three', 'four'])).toEqual(['one', 'two', 'three']);
  });

  it('uses the routine task choices from the worksheet', () => {
    expect(PRIORITY_RULE_ROUTINE_TASKS).toEqual([
      'Emails', 'Office work', 'Household work', 'Appointments', 'Phone calls', 'Grocery shopping', 'Other',
    ]);
  });

  it('restores saved morning and evening stages from journal records', () => {
    const stages = priorityRuleStagesFromRecords([
      {
        question_id: 'morning_plan__b123',
        answer_text: JSON.stringify({ priorities: ['Call client'], routineTasks: [], plannedStartTime: '09:00', expectedFinishTime: '17:00' }),
      },
      {
        question_id: 'evening_reflection__b456',
        answer_text: JSON.stringify({ outcome: 'partly', barrier: 'Meetings', wins: ['Proud'] }),
      },
    ]);
    expect(stages.morning?.priorities).toEqual(['Call client']);
    expect(stages.morning?.otherTask).toBe('');
    expect(stages.evening?.outcome).toBe('partly');
    expect(stages.evening?.wins).toEqual(['Proud']);
  });
});