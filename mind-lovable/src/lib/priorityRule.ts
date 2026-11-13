export type PriorityRuleMorningPlan = {
  priorities: string[];
  routineTasks: { label: string; done: boolean }[];
  otherTask: string;
  plannedStartTime: string;
  expectedFinishTime: string;
};

export type PriorityRuleEveningReflection = {
  outcome: 'yes' | 'partly' | 'no' | '';
  barrier: string;
  wins: string[];
};

export type PriorityRuleStage = 'morning' | 'evening';

export const PRIORITY_RULE_SECTION = 'priority_rule' as const;
export const MAX_PRIORITY_TASKS = 3;
export const PRIORITY_RULE_ROUTINE_TASKS = [
  'Emails',
  'Office work',
  'Household work',
  'Appointments',
  'Phone calls',
  'Grocery shopping',
  'Other',
] as const;

export function canAddPriorityTask(currentCount: number) {
  return currentCount < MAX_PRIORITY_TASKS;
}

export function normalizePriorityTaskCount(priorities: string[]) {
  return priorities.slice(0, MAX_PRIORITY_TASKS);
}

export function priorityRuleStageRecord(
  stage: PriorityRuleStage,
  data: PriorityRuleMorningPlan | PriorityRuleEveningReflection,
) {
  return {
    section: PRIORITY_RULE_SECTION,
    question_id: stage === 'morning' ? 'morning_plan' : 'evening_reflection',
    question_text: stage === 'morning' ? 'Morning plan' : 'Evening reflection',
    answer_text: JSON.stringify(data),
  };
}

function parseStage<T>(value: string | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function priorityRuleStagesFromRecords(
  records: Array<{ question_id: string; answer_text: string }>,
) {
  let morning: PriorityRuleMorningPlan | null = null;
  let evening: PriorityRuleEveningReflection | null = null;

  for (const record of records) {
    const questionId = record.question_id.replace(/__b\d+$/, '');
    if (questionId === 'morning_plan') {
      const parsed = parseStage<PriorityRuleMorningPlan>(record.answer_text);
      if (parsed) {
        morning = {
          ...parsed,
          priorities: normalizePriorityTaskCount(Array.isArray(parsed.priorities) ? parsed.priorities : []),
          routineTasks: Array.isArray(parsed.routineTasks) ? parsed.routineTasks : [],
          otherTask: typeof parsed.otherTask === 'string' ? parsed.otherTask : '',
          plannedStartTime: parsed.plannedStartTime || '',
          expectedFinishTime: parsed.expectedFinishTime || '',
        };
      }
    }
    if (questionId === 'evening_reflection') {
      evening = parseStage<PriorityRuleEveningReflection>(record.answer_text) ?? evening;
    }
  }

  return { morning, evening };
}