import { useState } from 'react';
import type { TaskFilters } from '../../types';
import { fetchTasksForExport } from '../../api';

interface DownloadTaskPdfProps {
  filters: TaskFilters;
  propertyName?: string;
  disabled: boolean;
}

export function DownloadTaskPdf({ filters, propertyName, disabled }: DownloadTaskPdfProps) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    if (disabled || exporting) return;
    setExporting(true);
    setError(null);
    try {
      // Fetch all matches, not just the visible page, using the clicked filters.
      const tasks = await fetchTasksForExport(filters);
      const { exportPDF } = await import('../../taskPdf');
      exportPDF(tasks, filters, propertyName);
    } catch {
      setError('Kunne ikke lage PDF. Prøv igjen.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="mb-4">
      <button type="button" onClick={download} disabled={disabled || exporting}
        className="rounded border bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">
        {exporting ? 'Lager PDF …' : 'Last ned som PDF'}
      </button>
      <p className="mt-1 text-xs text-slate-500">Eksporterer alle treff for valgte filtre og søk.</p>
      {error && <p role="alert" className="mt-1 text-sm text-red-800">{error}</p>}
    </div>
  );
}
