import { useEffect, useState } from 'react';
import { fetchTasks } from '../api';
import type { TaskFilters, TaskPage } from '../types';

export function useTasks(filters: TaskFilters, page: number, pageSize: number) {
  const { status, category, property_id, search } = filters;
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [result, setResult] = useState<TaskPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search), 250);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setResult(null);
    setError(null);
    setLoading(true);

    // Wait until typing pauses before fetching with the latest search text.
    if (search !== debouncedSearch) return;

    const controller = new AbortController();
    fetchTasks({ status, category, property_id, search: debouncedSearch }, page, pageSize, controller.signal)
      .then((response) => {
        if (!controller.signal.aborted) setResult(response);
      })
      .catch((error: Error) => {
        if (!controller.signal.aborted) setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [status, category, property_id, search, debouncedSearch, page, pageSize]);

  return {
    tasks: result?.tasks ?? null,
    total: result?.total ?? 0,
    page: result?.page ?? page,
    loading: loading || search !== debouncedSearch,
    error,
  };
}
