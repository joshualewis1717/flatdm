import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";

// generic select box component
type SelectBoxProps = {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
};

export default function SelectBox({ value, onChange, options, placeholder = "Select..." }: SelectBoxProps) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <ListboxButton className="w-full rounded-md bg-white/[0.05] border border-white/10 p-3 text-white text-left focus:outline-none focus:ring-2 focus:ring-primary">
          {options.find((o) => o.value === value)?.label || placeholder}
        </ListboxButton>
        <ListboxOptions className="absolute mt-2 w-full bg-black border border-white/10 rounded-md shadow-lg z-10 max-h-60 overflow-auto">
          {options.map((option) => (
            <ListboxOption
              key={option.value}
              value={option.value}
              className={({ active }) =>
                `cursor-pointer px-4 py-2 transition ${
                  active ? "bg-primary text-black" : "text-white hover:bg-white/10"
                }`
              }
            >
              {option.label}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}