// generic component for textbox

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

type TextBoxProps = {
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: React.HTMLInputTypeAttribute;
  name?: string;
  value?: string | Date | null;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onDateChange?: (date: Date | undefined) => void;
  onValidate?:(val: any)=>any;// place holder function, use this to validate textboxes however you want (important for e.g. phone, date etc)
  textarea?: boolean;
};

export default function TextBox({label,placeholder,required,type = "text",name,value,onChange, onDateChange, textarea = false,}: TextBoxProps) {

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
        // text area
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