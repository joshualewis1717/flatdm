interface PaginationBarProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export default function PaginationBar({
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
}: PaginationBarProps) {
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const page = parseInt(e.target.value, 10);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Generate all page options.
  const pageOptions = [];
  for (let i = 1; i <= totalPages; i++) {
    pageOptions.push(i);
  }

  return (
    <div className="flex justify-center">
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isFirstPage}
          onClick={handlePrevious}
          className={`inline-flex h-9 w-24 items-center justify-center rounded-xl border text-sm font-medium transition-colors ${
            isFirstPage
              ? 'border-white/10 bg-white/3 text-white/35 cursor-not-allowed'
              : 'border-[#c9fb00]/25 bg-[#c9fb00]/10 text-[#c9fb00] hover:bg-[#c9fb00]/15 cursor-pointer'
          }`}
        >
          Previous
        </button>

        <div className="relative">
          <select
            aria-label="Select page"
            value={currentPage}
            onChange={handlePageSelect}
            className="h-9 min-w-20 cursor-pointer appearance-none rounded-xl border border-white/10 bg-[#1e1e1e] px-3.5 pr-9 text-sm text-white outline-none transition-colors hover:border-white/20 focus:border-[#c9fb00]"
          >
            {pageOptions.map((page) => (
              <option key={page} value={page}>
                Page {page}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/45">
            <svg
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              className="h-4 w-4"
            >
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <button
          type="button"
          disabled={isLastPage}
          onClick={handleNext}
          className={`inline-flex h-9 w-24 items-center justify-center rounded-xl border text-sm font-medium transition-colors ${
            isLastPage
              ? 'border-white/10 bg-white/3 text-white/35 cursor-not-allowed'
              : 'border-[#c9fb00]/25 bg-[#c9fb00]/10 text-[#c9fb00] hover:bg-[#c9fb00]/15 cursor-pointer'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}