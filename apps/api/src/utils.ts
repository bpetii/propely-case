import { TASK_CATEGORIES, TASK_STATUSES } from './types.js';

type TaskFilterValidation =
  | { valid: true; filters: { status: string | null; category: string | null; property_id: string | null } }
  | { valid: false; error: string };

export function validateTaskFilters(query: Record<string, unknown>): TaskFilterValidation {
  const { status, category, property_id } = query;
  if ((status !== undefined && typeof status !== 'string') ||
      (category !== undefined && typeof category !== 'string') ||
      (property_id !== undefined && typeof property_id !== 'string')) {
    return { valid: false, error: 'Filters must be single strings.' };
  }
  if (status && !TASK_STATUSES.some((value) => value === status)) {
    return { valid: false, error: 'Invalid status.' };
  }
  if (category && !TASK_CATEGORIES.some((value) => value === category)) {
    return { valid: false, error: 'Invalid category.' };
  }
  return {
    valid: true,
    filters: { status: status || null, category: category || null, property_id: property_id || null },
  };
}
