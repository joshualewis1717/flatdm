'use client';
// simple generic filter component (wrapper of selection tag) to filter information
import { Filter } from 'lucide-react';
import React from 'react';

type FilterDropdownProps = {
  value: string;// current selected value in selected tag
  onChange: (v: string) => void;// what to do when value changes
  children: React.ReactNode;// used for options + potentially other stuff
};

export default function FilterDropdown({
  value,
  onChange,
  children
}: FilterDropdownProps) {
  return (
    <div className="relative">
      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45 w-4 h-4 pointer-events-none" />

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-8 bg-[#2a2a2a] border border-white/[0.13] text-white py-2.5 rounded-[10px] text-[13px] outline-none cursor-pointer"
      >
        {children}
      </select>
    </div>
  );
}