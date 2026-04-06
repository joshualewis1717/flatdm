// generic component to hold many radio buttons

import { RadioOption } from "../../../types";

  
type RadioGroupProps<T extends string> = {
    name: string;
    options: RadioOption<T>[];
    value: T | null;
    onChange: (value: T) => void;
};
  
export default function RadioGroup<T extends string>({ name, options, value, onChange }: RadioGroupProps<T>) {
    return (
      <div className="flex gap-4 flex-wrap">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="accent-primary"
            />
            {option.label}
          </label>
        ))}
      </div>
    );
}