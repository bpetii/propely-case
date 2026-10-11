interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const pageSizeOptions = [10, 25, 50, 100];

export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const buttonClass = 'rounded border bg-white px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <nav aria-label="Sidevalg" className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm">
      <button type="button" className={buttonClass} disabled={ page <= 1}
        onClick={() => onPageChange(page - 1)}>Forrige</button>
      <span>Side {page} av {totalPages}</span>
      <button type="button" className={buttonClass} disabled={ page >= totalPages}
        onClick={() => onPageChange(page + 1)}>Neste</button>
      <label className="flex items-center gap-2">
        Per side
        <select className="rounded border bg-white p-2" value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}>
          {pageSizeOptions.map((size) => <option key={size} value={size}>{size}</option>)}
        </select>
      </label>
    </nav>
  );
}
