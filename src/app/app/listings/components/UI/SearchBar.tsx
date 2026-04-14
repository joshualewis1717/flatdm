'use client';

import { forwardRef } from 'react';
import { Search } from 'lucide-react';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  containerClassName?: string;
  inputClassName?: string;
};

const SearchBar = forwardRef<HTMLDivElement, SearchBarProps>(function SearchBar(
  {
    value,
    onChange,
    onFocus,
    onBlur,
    placeholder = 'Search...',
    containerClassName = '',
    inputClassName = '',
  },
  ref,
) {
  return (
    <div ref={ref} className={`relative flex-1 min-w-50 ${containerClassName}`.trim()}>
      <span
        className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2"
        style={{ color: 'rgb(138, 138, 138)' }}
      >
        <Search />
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`relative z-0 h-10.5 w-full rounded-[10px] border border-white/13 bg-[#2a2a2a]/70 px-3 py-0 pl-10 pr-3 text-[13px] text-white outline-none backdrop-blur-xl placeholder-white/45 focus:border-[#c9fb00] ${inputClassName}`.trim()}
      />
    </div>
  );
});

export default SearchBar;