import { TASK_CATEGORIES, TASK_STATUSES } from './types.js';

export function parsePagination(query: Record<string, unknown>): { page: number; pageSize: number } {
  const requestedPage = typeof query.page === 'string' ? Number(query.page) : NaN;
  const requestedSize = typeof query.pageSize === 'string' ? Number(query.pageSize) : NaN;
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pageSize = Number.isSafeInteger(requestedSize) && requestedSize > 0
    ? Math.min(requestedSize, 100)
    : 10;
  return { page, pageSize };
}

type TaskFilterValidation =
  | { valid: true; filters: { status: string | null; category: string | null; property_id: string | null; search: string | null } }
  | { valid: false; error: string };

export function validateTaskFilters(query: Record<string, unknown>): TaskFilterValidation {
  const { status, category, property_id, search } = query;
  if ((status !== undefined && typeof status !== 'string') ||
      (category !== undefined && typeof category !== 'string') ||
      (property_id !== undefined && typeof property_id !== 'string') ||
      (search !== undefined && typeof search !== 'string')) {
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
    filters: {
      status: status || null,
      category: category || null,
      property_id: property_id || null,
      search: search?.trim().toLowerCase() || null,
    },
  };
}
