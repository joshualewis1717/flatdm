'use client';
// a simple reusable search bar
import { Search } from 'lucide-react';
type props ={
    value: string;// current value user typed in
    onChange: (v: string) => void;// what to do as text changes
    placeholder?: string;// place holder text
    containerClassName?: string;
    inputClassName?: string;
}
export default function SearchBar({ value, onChange, placeholder = 'Search...', containerClassName = '', inputClassName = ''}: props) {
  return (
    <div className={`relative flex-1 min-w-50 ${containerClassName}`.trim()}>
      <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2" style={{ color: 'rgb(138, 138, 138)' }}>
        <Search />{/* search icon next to our text */}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`relative z-0 h-10.5 w-full bg-[#2a2a2a]/70 backdrop-blur-xl border border-white/13 text-white placeholder-white/45 pl-10 pr-3 py-0 rounded-[10px] text-[13px] outline-none focus:border-[#c9fb00] ${inputClassName}`.trim()}
      />
    </div>
  );
}