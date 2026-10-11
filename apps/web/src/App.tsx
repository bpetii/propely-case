import { useEffect, useState } from 'react';

import type { Property, Task, TaskFilters } from './types';

import { fetchProperties, fetchTasks } from './api';
import { TaskTable } from './components/TaskTable/TaskTable';
import { TaskTableFilters } from './components/TaskTable/TaskTableFilters';
import { DownloadTaskPdf } from './components/TaskTable/DownloadTaskPdf';

const DEFAULT_FILTERS: TaskFilters = { status: '', category: '', property_id: '', search: '' };

export function App() {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  const { status, category, property_id, search } = filters;
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search), 250);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProperties(controller.signal).then(setProperties).catch((error: Error) => {
      if (!controller.signal.aborted) setPropertiesError(error.message);
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setTasks(null);
    setError(null);
    // Wait until typing pauses before fetching with the latest search text.
    if (search !== debouncedSearch) return;

    const controller = new AbortController();
    fetchTasks({ status, category, property_id, search: debouncedSearch }, controller.signal).then((result) => {
      if (!controller.signal.aborted) setTasks(result);
    }).catch((error: Error) => {
      if (!controller.signal.aborted) setError(error.message);
    });
    return () => controller.abort();
  }, [status, category, property_id, search, debouncedSearch]);


  const isPDFDownloadDisabled = !!error || tasks === null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold">Vedlikeholdsoppgaver</h1>
        <p className="text-sm text-slate-500">
          {error ? 'Kunne ikke hente oppgaver' : tasks ? `${tasks.length} oppgaver` : 'Laster oppgaver …'}
        </p>
      </header>

      <main className="p-6">
        <TaskTableFilters filters={filters} properties={properties} onChange={setFilters} />
        <DownloadTaskPdf tasks={tasks} filters={filters}
          propertyName={properties.find((property) => property.id === property_id)?.name}
          disabled={isPDFDownloadDisabled} />
        {propertiesError && <p role="alert" className="mb-4 text-sm text-red-800">Kunne ikke hente eiendommer: {propertiesError}</p>}
        {error && (
          <div className="rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            Kunne ikke hente oppgaver: {error}
          </div>
        )}

        {!error && !tasks && <p className="text-sm text-slate-500">Laster …</p>}

        {tasks && <TaskTable tasks={tasks} />}
      </main>
    </div>
  );
}
