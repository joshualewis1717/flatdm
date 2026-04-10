import { InputFieldInput, RadioOption } from "../../../types";
import DatePicker from "./DatePicker";
import PhoneInputField from "./PhoneInputField";
import RadioGroup from "./RadioGroup";
import SelectBox from "./SelectBox";

// generic input field component
type InputFieldProps = {
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: InputFieldInput;
  name?: string;
  value?: string | number | Date | null;
  onValidate?: (val: any) => any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onDateChange?: (date: Date | undefined) => void;
  options?: { label: string; value: string }[];
  onValueChange?: (value: string) => void;
  radioOptions?: RadioOption[];
  onRadioChange?: (value: string) => void;
  readOnly?: boolean;
};

//TODO: pass required down into actual underlying input fields so that form can't be submitted without them
export default function InputField({label,placeholder,required,type = "text",name,value, onChange,onDateChange,
  onValueChange,options, radioOptions, onRadioChange, readOnly = false}: InputFieldProps) {
    const stringValue = value !== null && value !== undefined ? String(value) : "";// always return a string

  return (
    <div className="flex flex-col">
      <label className="text-sm text-white/70 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {type === "date" ? (
        <DatePicker
          value={value instanceof Date ? value : value ? new Date(value) : null}
          onChange={onDateChange}
          placeholder={placeholder}
          readOnly={readOnly}
        />
      ) : type === "select" && options ? (
        <SelectBox
          value={stringValue}
          onChange={(val) => onValueChange?.(val)}
          options={options}
          placeholder={placeholder}
          readOnly={readOnly}
        />
      ) : type === "radio" && radioOptions ? (
        <RadioGroup
          name={name ?? label}
          options={radioOptions}
          value={stringValue || null}
          onChange={(val) => onRadioChange?.(val)}
          readOnly={readOnly}
        />
      ): type === "tel" ? (
        <PhoneInputField
          label={label}
          name={name}
          value={stringValue}
          required={type === "required"}
          onValueChange={onValueChange}// underlying component needs the handler to use strings
          readOnly={readOnly}
        />
      ) : type == 'textarea' ? (
        <textarea
          name={name}
          value={stringValue}
          onChange={onChange}
          placeholder={placeholder}
          className="rounded-md bg-white/[0.05] border border-white/10 p-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          rows={4}
          readOnly={readOnly}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={stringValue}
          onChange={onChange}
          placeholder={placeholder}
          className="rounded-md bg-white/[0.05] border border-white/10 p-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
          readOnly={readOnly}
        />
      )}
    </div>
  );
}