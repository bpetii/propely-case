import type { Property, Task, TaskFilters } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export async function fetchTasks(filters: TaskFilters, signal?: AbortSignal): Promise<Task[]> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const response = await fetch(`${API_BASE_URL}/api/tasks?${params}`, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function fetchProperties(signal?: AbortSignal): Promise<Property[]> {
  const response = await fetch(`${API_BASE_URL}/api/properties`, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
