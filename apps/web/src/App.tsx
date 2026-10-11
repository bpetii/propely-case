import { useEffect, useState } from 'react';

import type { Property, TaskFilters } from './types';

import { fetchProperties } from './api';
import { TaskTable } from './components/TaskTable/TaskTable';
import { TaskTableFilters } from './components/TaskTable/TaskTableFilters';
import { DownloadTaskPdf } from './components/TaskTable/DownloadTaskPdf';
import { Pagination } from './components/Pagination';
import { useTasks } from './hooks/useTasks';

const DEFAULT_FILTERS: TaskFilters = { status: '', category: '', property_id: '', search: '' };

export function App() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS);
  const { tasks, total, page: currentPage, loading, error } = useTasks(filters, page, pageSize);

  // Fetch properties for the property filter dropdown.
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchProperties(controller.signal).then(setProperties).catch((error: Error) => {
      if (!controller.signal.aborted) setPropertiesError(error.message);
    });
    return () => controller.abort();
  }, []);

  function handlePageSizeChange(nextPageSize: number) {
    setPageSize(nextPageSize);
    setPage(1);
  }

  const isPDFDownloadDisabled = loading || !!error || tasks === null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold">Vedlikeholdsoppgaver</h1>
        <p className="text-sm text-slate-500">
          {error ? 'Kunne ikke hente oppgaver' : tasks ? `${total} oppgaver` : 'Laster oppgaver …'}
        </p>
      </header>

      <main className="p-6">
        <TaskTableFilters filters={filters} properties={properties} onChange={(nextFilters) => {
          setFilters(nextFilters);
          setPage(1);
        }} />
        <DownloadTaskPdf filters={filters}
          propertyName={properties.find((property) => property.id === filters.property_id)?.name}
          disabled={isPDFDownloadDisabled} />
        {propertiesError && <p role="alert" className="mb-4 text-sm text-red-800">Kunne ikke hente eiendommer: {propertiesError}</p>}
        {error && (
          <div className="rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            Kunne ikke hente oppgaver: {error}
          </div>
        )}

        {loading && <p className="text-sm text-slate-500">Laster …</p>}

        {!loading && tasks && 
          <>
            <TaskTable tasks={tasks} />
            <Pagination page={currentPage} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={handlePageSizeChange} />
          </> 
        }
      </main>
    </div>
  );
}
