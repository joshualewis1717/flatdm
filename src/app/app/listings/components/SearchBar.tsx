'use client';
// a simple reusable search bar
import { Search } from 'lucide-react';
type props ={
    value: string;// current value user typed in
    onChange: (v: string) => void;// what to do as text changes
    placeholder?: string;// place holder text
}
export default function SearchBar({ value, onChange, placeholder = 'Search...'}: props) {
  return (
    <div className="relative flex-1 min-w-[200px]">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45">
        <Search />{/* search icon next to our text */}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#2a2a2a] border border-white/[0.13] text-white placeholder-white/45 pl-9 pr-3 py-2.5 rounded-[10px] text-[13px] outline-none focus:border-[#c9fb00]"
      />
    </div>
  );
}