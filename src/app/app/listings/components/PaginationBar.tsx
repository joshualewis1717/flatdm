export default function PaginationBar() {
  return (
    <div className="flex justify-center">
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled
          className="inline-flex h-9 w-24 items-center justify-center rounded-xl border border-white/10 bg-white/3 text-sm font-medium text-white/35 cursor-not-allowed"
        >
          Previous
        </button>

        <div className="relative">
          <select
            aria-label="Select page"
            defaultValue="1"
            className="h-9 min-w-20 cursor-pointer appearance-none rounded-xl border border-white/10 bg-[#1e1e1e] px-3.5 pr-9 text-sm text-white outline-none transition-colors hover:border-white/20 focus:border-[#c9fb00]"
          >
            <option value="1">Page 1</option>
            <option value="2">Page 2</option>
            <option value="3">Page 3</option>
            <option value="4">Page 4</option>
            <option value="5">Page 5</option>
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
          className="inline-flex h-9 w-24 items-center justify-center rounded-xl border border-[#c9fb00]/25 bg-[#c9fb00]/10 text-sm font-medium text-[#c9fb00] transition-colors hover:bg-[#c9fb00]/15 cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
}