import type { Property, Task, TaskFilters, TaskPage } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

function taskFilterParams(filters: TaskFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  return params;
}

export async function fetchTasks(filters: TaskFilters, page = 1, pageSize = 10, signal?: AbortSignal): Promise<TaskPage> {
  const params = taskFilterParams(filters);

  //handling pagination parameters
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  const response = await fetch(`${API_BASE_URL}/api/tasks?${params}`, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
// Fetch all tasks matching the filters, without pagination, for export.
export async function fetchTasksForExport(filters: TaskFilters): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/export?${taskFilterParams(filters)}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function fetchProperties(signal?: AbortSignal): Promise<Property[]> {
  const response = await fetch(`${API_BASE_URL}/api/properties`, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
