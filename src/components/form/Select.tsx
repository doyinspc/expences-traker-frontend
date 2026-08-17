// src/components/form/Select.tsx

import { useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options?: Option[]; // Made optional
  placeholder?: string;
  onChange?: (value: string) => void; // Made optional
  className?: string;
  defaultValue?: string;
  value?: string; // Added for controlled component support
  disabled?: boolean; // Added for disabled state
  name?: string; // Added for form compatibility
  id?: string; // Added for form compatibility
  required?: boolean; // Added for form compatibility
}

const Select: React.FC<SelectProps> = ({
  options = [], // 🛡️ DEFENSIVE: Default to empty array
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  value: controlledValue,
  disabled = false,
  name,
  id,
  required = false,
}) => {
  // 🛡️ DEFENSIVE: Handle controlled vs uncontrolled
  const [internalValue, setInternalValue] = useState<string>(defaultValue);
  
  // Use controlled value if provided, otherwise use internal state
  const selectedValue = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    // Update internal state if uncontrolled
    if (controlledValue === undefined) {
      setInternalValue(value);
    }
    
    // Call onChange handler if provided
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <select
      id={id}
      name={name}
      disabled={disabled}
      required={required}
      className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
        selectedValue
          ? "text-gray-800 dark:text-white/90"
          : "text-gray-400 dark:text-gray-400"
      } ${className}`}
      value={selectedValue}
      onChange={handleChange}
    >
      {/* 🛡️ DEFENSIVE: Always render placeholder */}
      <option
        value=""
        disabled
        className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
      >
        {placeholder}
      </option>
      
      {/* 🛡️ DEFENSIVE: Only map if options is an array */}
      {Array.isArray(options) && options.length > 0 ? (
        options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
          >
            {option.label}
          </option>
        ))
      ) : (
        // 🛡️ DEFENSIVE: Show "No options" message if empty
        <option
          value=""
          disabled
          className="text-gray-400 dark:bg-gray-900 dark:text-gray-500"
        >
          No options available
        </option>
      )}
    </select>
  );
};

export default Select;