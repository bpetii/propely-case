import { TASK_CATEGORIES, TASK_STATUSES, type Property, type TaskFilters } from '../../types';

interface TaskTableFiltersProps {
  filters: TaskFilters;
  properties: Property[];
  onChange: (filters: TaskFilters) => void;
}

export function TaskTableFilters({ filters, properties, onChange }: TaskTableFiltersProps) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Søk
        <input type="search" className="rounded border p-2" value={filters.search}
          placeholder="Tittel, eiendoms-ID eller navn"
          onChange={(event) => onChange({ ...filters, search: event.target.value })} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Status
        <select className="rounded border p-2" value={filters.status}
          onChange={(event) => onChange({ ...filters, status: event.target.value as TaskFilters['status'] })}>
          <option value="">Alle statuser</option>
          {TASK_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Kategori
        <select className="rounded border p-2" value={filters.category}
          onChange={(event) => onChange({ ...filters, category: event.target.value as TaskFilters['category'] })}>
          <option value="">Alle kategorier</option>
          {TASK_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
      </label>
      <label className="flex min-w-0 max-w-full flex-col gap-1 text-sm">
        Eiendom
        <select className="w-full max-w-md rounded border p-2" value={filters.property_id}
          onChange={(event) => onChange({ ...filters, property_id: event.target.value })}>
          <option value="">Alle eiendommer</option>
          {properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}
        </select>
      </label>
      <button className="rounded border bg-white px-3 py-2 text-sm"
        onClick={() => onChange({ status: '', category: '', property_id: '', search: '' })}>
        Nullstill filtre
      </button>
    </div>
  );
}
