// generic component for textbox

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";

type TextBoxProps = {
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: React.HTMLInputTypeAttribute | 'select';
  name?: string;
  value?: string | number | Date | null;
  onValidate?:(val: any)=>any;// place holder function, use this to validate textboxes however you want (important for e.g. phone, date etc)
  textarea?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onDateChange?: (date: Date | undefined) => void;// arg for data picker
  // args for select
  options?: { label: string; value: string }[];
  onValueChange?: (value: string) => void;
};

export default function TextBox({label,placeholder,required,type = "text",name,value,onChange, onDateChange, textarea = false,
  onValueChange, onValidate, options
}: TextBoxProps) {

  // local state for date picker
  const [date, setDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  
    if (onDateChange) {
      onDateChange(selectedDate);
    }
  };

  return (
    <div className="flex flex-col">
      <label className="text-sm text-white/70 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/*date picker turn into component later */}
      {type === "date" ? (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center justify-between rounded-md bg-white/[0.05] border border-white/10 p-3 text-left text-white/70  focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <span>
                {date ? format(date, "dd/MM/yyyy") : "dd/mm/yyyy"}
              </span>
              <CalendarIcon className="h-4 w-4 text-white/70" />
            </button>
          </PopoverTrigger>

          <PopoverContent className="bg-[#2d2d2d] border border-white/10">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              className="text-white"
            />
          </PopoverContent>
        </Popover>
        // select (also turn into component later)
      ) : type === "select" && options ? (
        <Listbox value={typeof value === "string" ? value : ""} onChange={(val) => onValueChange?.(val)}>
          <div className="relative">
            {/* Button */}
            <ListboxButton className="w-full rounded-md bg-white/[0.05] border border-white/10 p-3 text-white text-left focus:outline-none focus:ring-2 focus:ring-primary">
              {options.find((o) => o.value === value)?.label || placeholder || "Select..."}
            </ListboxButton>
      
            {/* Options */}
            <ListboxOptions className="absolute mt-2 w-full bg-black border border-white/10 rounded-md shadow-lg z-10 max-h-60 overflow-auto">
              {options.map((option) => (
                <ListboxOption
                  key={option.value}
                  value={option.value}
                  className={({ active }) =>
                    `cursor-pointer px-4 py-2 transition ${
                      active
                        ? "bg-primary text-black"
                        : "text-white hover:bg-white/10"
                    }`
                  }
                >
                  {option.label}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
      ) : textarea ? (
        <textarea
          name={name}
          value={typeof value === "string" ? value : ""}// we want to force value to be string to allow for value to be date and remove ts warnings
          onChange={onChange}
          placeholder={placeholder}
          className="rounded-md bg-white/[0.05] border border-white/10 p-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          rows={4}
        />
      ) : (
        //normal input box
        <input
          type={type}
          name={name}
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
          placeholder={placeholder}
          className="rounded-md bg-white/[0.05] border border-white/10 p-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      )}
    </div>
  );
}