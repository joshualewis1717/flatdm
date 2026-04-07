import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// generic date picker component 
type DatePickerProps = {
  value?: Date | null;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  readOnly?: boolean
};

export default function DatePicker({ value, onChange, placeholder = "dd/mm/yyyy", readOnly= false }: DatePickerProps) {
  const [date, setDate] = useState<Date | undefined>(value ?? undefined);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    onChange?.(selectedDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-between rounded-md bg-white/[0.05] border border-white/10 p-3 text-left text-white/70 focus:outline-none focus:ring-2 focus:ring-primary w-full"
        >
          <span>{date ? format(date, "dd/MM/yyyy") : placeholder}</span>
          <CalendarIcon className="h-4 w-4 text-white/70" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="bg-[#2d2d2d] border border-white/10">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          className="text-white"
          readOnly={readOnly}
        />
      </PopoverContent>
    </Popover>
  );
}