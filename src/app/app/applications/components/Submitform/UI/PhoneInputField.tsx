import { useState } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import phoneStyles from "@/app/app/css/phoneNumber.module.css";
import { getExampleNumber } from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";

// wrapper of the phone component to make it fit our style more

type PhoneInputFieldProps = {
  label: string;
  name?: string;
  value?: string;
  required?: boolean;
  onValueChange?: (value: string) => void;
  readOnly?: boolean
};

export default function PhoneInputField({ label, name, value, required, onValueChange, readOnly= false}: PhoneInputFieldProps) {
  const [country, setCountry] = useState<string>("GB");// which country user wants to be

  const getPlaceholder = (countryCode?: string) => {
    if (!countryCode) return "";

    try {
      const example = getExampleNumber(countryCode as any, examples);
      return example?.formatInternational() || "";// we want placeholder to reflect the current countrty that user has selected
    } catch {
      return "";
    }
  };

  return (
    <div className="flex flex-col">
      <label className="text-sm text-white/70 mb-1">
        {null}
      </label>

      <div className={phoneStyles["phone-input-wrapper"]}>
        <PhoneInput
          name={name ?? label}
          value={value || undefined}
          onChange={(val) => onValueChange?.(val ?? "")}
          onCountryChange={(c) => setCountry(c ?? "GB")}
          defaultCountry="GB"
          placeholder={getPlaceholder(country)}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}