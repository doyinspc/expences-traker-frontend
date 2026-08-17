// src/components/forms/DynamicForm.tsx

import React, { useState, useEffect, useMemo, ChangeEvent, FormEvent } from 'react';
import ComponentCard from '../../components/common/ComponentCard';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import TextArea from '../../components/form/input/TextArea';
import ToggleSwitch from '../../components/form/form-elements/ToggleSwitch';
import DatePicker from '../../components/form/date-picker';
import PhoneInput from '../../components/form/group-input/PhoneInput';
import FileUpload from '../../components/form/Select';
import { getFormFields } from '../../config/tableMapping';

// ==================== TYPES ====================

export type FieldType = 
  | 'text' 
  | 'email' 
  | 'number' 
  | 'textarea' 
  | 'select' 
  | 'toggle' 
  | 'date' 
  | 'datetime' 
  | 'phone' 
  | 'file' 
  | 'json';

export interface FieldOption {
  value: string | number;
  label: string;
}

export interface FormField {
  label: string;
  placeholder?: string;
  type: FieldType;
  required?: boolean;
  disabled?: boolean;
  options?: string;
  description?: string;
  icon?: string;
  accept?: string;
  hidden?: boolean;
  showInForm?: boolean;
  default?: any;
}

export interface TableFields {
  [fieldName: string]: FormField;
}

export interface OptionDataMap {
  [key: string]: FieldOption[];
}

export interface DynamicFormProps {
  tableName: string;
  initialData?: Record<string, any>;
  onSave?: (data: Record<string, any>) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  title?: string;
  submitLabel?: string;
  cancelLabel?: string;
  resetLabel?: string;
  showReset?: boolean;
  showCancel?: boolean;
  className?: string;
  optionData: OptionDataMap;
  countryOptions?: FieldOption[];
}

// ==================== HELPER FUNCTIONS ====================

export const getSelectOptions = (
  optionKey: string,
  optionData: OptionDataMap
): FieldOption[] => {
  if (!optionData || typeof optionData !== 'object') {
    return [];
  }

  if (!optionKey || typeof optionKey !== 'string') {
    return [];
  }

  const options = optionData[optionKey];
  
  if (!options || !Array.isArray(options)) {
    return [];
  }

  return options.filter((opt): opt is FieldOption => {
    return opt && 
      typeof opt === 'object' && 
      (opt.value !== undefined && opt.value !== null) &&
      typeof opt.label === 'string';
  });
};

export const getCountryOptions = (): FieldOption[] => {
  return [
    { value: 'US', label: '+1 (US)' },
    { value: 'GB', label: '+44 (UK)' },
    { value: 'CA', label: '+1 (Canada)' },
    { value: 'AU', label: '+61 (Australia)' },
    { value: 'NG', label: '+234 (Nigeria)' },
    { value: 'KE', label: '+254 (Kenya)' },
    { value: 'ZA', label: '+27 (South Africa)' },
    { value: 'IN', label: '+91 (India)' },
    { value: 'CN', label: '+86 (China)' },
    { value: 'JP', label: '+81 (Japan)' },
    { value: 'DE', label: '+49 (Germany)' },
    { value: 'FR', label: '+33 (France)' },
  ];
};

// ==================== COMPONENT ====================

const DynamicForm: React.FC<DynamicFormProps> = ({
  tableName,
  initialData = {},
  onSave,
  onCancel,
  loading = false,
  title,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  resetLabel = 'Reset',
  showReset = true,
  showCancel = true,
  className = '',
  optionData,
  countryOptions,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  
  const fields = useMemo(() => getFormFields(tableName), [tableName]);

  // Get visible fields (not hidden and showInForm !== false)
  const visibleFields = useMemo(() => {
    if (!fields) return [];
    return Object.entries(fields).filter(
      ([_, field]) => {
        // Skip if explicitly hidden or showInForm is false
        if (field.hidden === true || field.showInForm === false) {
          return false;
        }
        return true;
      }
    );
  }, [fields]);

  // Get hidden fields (for submission)
  const hiddenFields = useMemo(() => {
    if (!fields) return [];
    return Object.entries(fields).filter(
      ([_, field]) => field.hidden === true
    );
  }, [fields]);

  // Initialize form data
  useEffect(() => {
    if (fields) {
      const initial: Record<string, any> = {};
      Object.entries(fields).forEach(([fieldName, field]) => {
        // Check if we have initialData for this field
        const hasInitialData = initialData[fieldName] !== undefined && 
                              initialData[fieldName] !== null && 
                              initialData[fieldName] !== '';
        
        let defaultValue: any = null;
        
        if (hasInitialData) {
          // Use the initialData value
          defaultValue = initialData[fieldName];
        } else if (field.type === 'toggle') {
          // Toggle defaults to false
          defaultValue = field.default !== undefined ? field.default : false;
        } else if (field.type === 'select') {
          // Select defaults to null (not empty string)
          defaultValue = field.default !== undefined && field.default !== null ? field.default : null;
        } else if (field.type === 'date' || field.type === 'datetime') {
          // Date fields - use default or null
          defaultValue = field.default !== undefined && field.default !== null ? field.default : null;
        } else {
          // Other fields default to empty string or the field default
          defaultValue = field.default !== undefined ? field.default : '';
        }
        
        initial[fieldName] = defaultValue;
      });
      setFormData(initial);
    }
  }, [initialData, fields]);

  // Handle input changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value, type } = e.target;
    
    if (!name) return;

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError(null);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? null : parseFloat(value)) : value,
    }));
  };

  // Handle custom field changes
  const handleCustomChange = (name: string, value: any): void => {
    if (!name) return;

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError(null);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate form - ONLY for visible fields
  const validateForm = (): { isValid: boolean; errors: Record<string, string> } => {
    if (!fields) return { isValid: true, errors: {} };

    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Only validate visible fields (not hidden)
    visibleFields.forEach(([fieldName, field]) => {
      if (field.required) {
        const value = formData[fieldName];
        
        if (field.type === 'toggle') {
          if (value === null || value === undefined) {
            newErrors[fieldName] = `${field.label} is required`;
            isValid = false;
          }
        } else if (field.type === 'select') {
          if (value === null || value === undefined || value === '') {
            newErrors[fieldName] = `Please select a ${field.label}`;
            isValid = false;
          }
        } else if (field.type === 'date' || field.type === 'datetime') {
          if (value === null || value === undefined || value === '') {
            newErrors[fieldName] = `Please select a ${field.label}`;
            isValid = false;
          }
        } else if (field.type === 'file') {
          if (value === null || value === undefined || value === '') {
            newErrors[fieldName] = `Please upload a ${field.label}`;
            isValid = false;
          }
        } else {
          if (value === '' || value === null || value === undefined) {
            newErrors[fieldName] = `${field.label} is required`;
            isValid = false;
          }
          if (field.type === 'number' && value !== '' && isNaN(parseFloat(value))) {
            newErrors[fieldName] = `${field.label} must be a valid number`;
            isValid = false;
          }
        }
      }
    });

    return { isValid, errors: newErrors };
  };

  // Handle submit
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    // Clear previous messages
    setSubmitError(null);
    setSubmitSuccess(false);
    
    // Validate form (only visible fields)
    const validation = validateForm();
    if (!validation.isValid) {
      setErrors(validation.errors);
      // Scroll to first error
      const firstError = document.querySelector('[class*="border-red-500"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      if (onSave) {
        // Include ALL fields (including hidden) in submission
        await onSave(formData);
        setSubmitSuccess(true);
        // Reset success message after 3 seconds
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      setSubmitError(error?.message || 'Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reset
  const handleReset = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (fields) {
      const resetData: Record<string, any> = {};
      Object.entries(fields).forEach(([fieldName, field]) => {
        if (field.hidden) {
          // Keep hidden field values or reset to default
          resetData[fieldName] = field.default !== undefined ? field.default : null;
        } else if (field.showInForm === false) {
          return;
        } else if (field.type === 'toggle') {
          resetData[fieldName] = field.default !== undefined ? field.default : false;
        } else if (field.type === 'select') {
          resetData[fieldName] = field.default !== undefined && field.default !== null ? field.default : null;
        } else if (field.type === 'date' || field.type === 'datetime') {
          resetData[fieldName] = field.default !== undefined && field.default !== null ? field.default : null;
        } else {
          resetData[fieldName] = field.default !== undefined ? field.default : '';
        }
      });
      setFormData(resetData);
      setErrors({});
      setSubmitError(null);
      setSubmitSuccess(false);
    }
  };

  // Handle select change
  const handleSelectChange = (fieldName: string, eOrValue: any): void => {
    let newValue: string | number | null = null;
    
    if (eOrValue === undefined || eOrValue === null) {
      newValue = null;
    } else if (eOrValue && typeof eOrValue === 'object' && eOrValue.target) {
      const rawValue = eOrValue.target.value;
      // Check if it's a valid value (not empty)
      if (rawValue !== '' && rawValue !== null && rawValue !== undefined) {
        // If it's a number field, check if > 0
        const numValue = Number(rawValue);
        if (!isNaN(numValue) && numValue > 0) {
          newValue = numValue;
        } else if (isNaN(numValue)) {
          // It's a string value
          newValue = rawValue;
        } else {
          // Number is 0 or less - treat as null
          newValue = null;
        }
      } else {
        newValue = null;
      }
    } else {
      // Direct value
      if (eOrValue !== '' && eOrValue !== null && eOrValue !== undefined) {
        const numValue = Number(eOrValue);
        if (!isNaN(numValue) && numValue > 0) {
          newValue = numValue;
        } else if (isNaN(numValue)) {
          newValue = eOrValue;
        } else {
          newValue = null;
        }
      } else {
        newValue = null;
      }
    }
    
    console.log(`[DynamicForm] Select "${fieldName}" changed to:`, newValue);
    
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
    
    setFormData((prev) => ({
      ...prev,
      [fieldName]: newValue,
    }));
  };

  // Render select field
  const renderSelectField = (
    fieldName: string,
    field: FormField,
    value: any,
    fieldId: string,
    error: string | undefined,
    isDisabled: boolean
  ): React.ReactNode => {
    const { label, placeholder, options: optionKey, description, required } = field;
    
    const selectOptions = getSelectOptions(optionKey || '', optionData);
    
    // Value should be null by default
    let selectedValue = null;
    
    // Check if we have a valid value (not null, undefined, or empty)
    if (value !== null && value !== undefined && value !== '') {
      // Convert to string for comparison
      const stringValue = String(value);
      
      // Check if the value exists in options
      const valueExists = selectOptions.some(opt => String(opt.value) === stringValue);
      
      // Only use the value if it exists in options and is valid
      if (valueExists) {
        selectedValue = value;
      }
    }
    
    // If still null and we have a default from field config
    if (selectedValue === null && field.default !== undefined && field.default !== null) {
      const defaultString = String(field.default);
      const defaultExists = selectOptions.some(opt => String(opt.value) === defaultString);
      if (defaultExists) {
        selectedValue = field.default;
      }
    }

    return (
      <div key={fieldName}>
        <Label required={required} htmlFor={fieldId}>
          {label}
        </Label>
        <Select
          id={fieldId}
          name={fieldName}
          placeholder={placeholder || `Select ${label}`}
          options={selectOptions}
          value={selectedValue}
          disabled={isDisabled}
          className={`dark:bg-dark-900 ${error ? 'border-red-500' : ''}`}
          onChange={(eOrValue) => handleSelectChange(fieldName, eOrValue)}
        />
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  };

  // Render field based on type
  const renderField = (fieldName: string, field: FormField): React.ReactNode | null => {
    // Skip hidden fields in the UI
    if (field.hidden === true) {
      return null;
    }

    // Skip if showInForm is false
    if (field.showInForm === false) {
      return null;
    }

    const {
      label,
      placeholder,
      type,
      required = false,
      disabled = false,
      description,
      icon,
      accept,
    } = field;

    const value = formData[fieldName] ?? null;
    const fieldId = `field-${tableName}-${fieldName}`;
    const error = errors[fieldName];
    const isDisabled = disabled || loading || isSubmitting;

    switch (type) {
      case 'toggle':
        return (
          <div key={fieldName} className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <ToggleSwitch
                id={fieldId}
                name={fieldName}
                checked={!!value}
                disabled={isDisabled}
                onChange={(checked: boolean) => handleCustomChange(fieldName, checked)}
              />
              <Label htmlFor={fieldId} className="cursor-pointer">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">{description}</p>
            )}
            {error && <p className="text-sm text-red-500 ml-11">{error}</p>}
          </div>
        );

      case 'select':
        return renderSelectField(fieldName, field, value, fieldId, error, isDisabled);

      case 'textarea':
      case 'json':
        return (
          <div key={fieldName}>
            <Label required={required} htmlFor={fieldId}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <TextArea
              id={fieldId}
              name={fieldName}
              placeholder={placeholder || ''}
              rows={4}
              value={value || ''}
              disabled={isDisabled}
              className={error ? 'border-red-500' : ''}
              onChange={(e: any) => {
                if (e && e.target) {
                  handleChange(e);
                } else {
                  handleCustomChange(fieldName, e);
                }
              }}
            />
            {description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
            )}
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'date':
      case 'datetime':
        // Format date value for DatePicker
        let dateValue = value;
        if (value && typeof value === 'string') {
          // If it's a full datetime string, extract just the date part
          if (value.includes('T')) {
            dateValue = value.split('T')[0];
          }
          // If it's an ISO string without time, keep as is
        }
        // If value is null or undefined, pass null
        if (dateValue === null || dateValue === undefined || dateValue === '') {
          dateValue = null;
        }

        return (
          <div key={fieldName}>
            <Label required={required} htmlFor={fieldId}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <DatePicker
              id={fieldId}
              name={fieldName}
              placeholder={placeholder || `Select ${label}`}
              value={dateValue}
              disabled={isDisabled}
              className={error ? 'border-red-500' : ''}
              onChange={(_, currentDateString) => {
                // Store the date string in the form data
                handleCustomChange(fieldName, currentDateString || '');
              }}
            />
            {description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
            )}
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'phone':
        return (
          <div key={fieldName}>
            <Label required={required} htmlFor={fieldId}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <PhoneInput
              id={fieldId}
              name={fieldName}
              placeholder={placeholder || ''}
              selectPosition="start"
              countries={countryOptions || getCountryOptions()}
              value={value || ''}
              disabled={isDisabled}
              className={error ? 'border-red-500' : ''}
              onChange={(phoneNumber: string) => handleCustomChange(fieldName, phoneNumber)}
            />
            {description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
            )}
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'file':
        return (
          <div key={fieldName}>
            <Label required={required} htmlFor={fieldId}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <FileUpload
              id={fieldId}
              name={fieldName}
              accept={accept || ''}
              value={value || ''}
              disabled={isDisabled}
              className={error ? 'border-red-500' : ''}
              onChange={(file: File | File[]) => handleCustomChange(fieldName, file)}
            />
            {description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
            )}
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'number':
      case 'email':
      case 'text':
      default: {
        const inputType = type === 'number' ? 'number' : type === 'email' ? 'email' : 'text';
        const hasIcon = icon ? true : false;
        return (
          <div key={fieldName}>
            <Label required={required} htmlFor={fieldId}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className={hasIcon ? 'relative' : ''}>
              <Input
                id={fieldId}
                name={fieldName}
                type={inputType}
                placeholder={placeholder || ''}
                value={value || ''}
                disabled={isDisabled}
                className={`${hasIcon ? 'pl-[62px]' : ''} ${error ? 'border-red-500' : ''}`}
                onChange={handleChange}
              />
              {hasIcon && icon === 'EnvelopeIcon' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  <svg
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </span>
              )}
            </div>
            {description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
            )}
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
        );
      }
    }
  };

  if (!fields) {
    return (
      <ComponentCard title="Error">
        <div className="p-4 text-red-500">
          <p>No fields found for table: <strong>{tableName}</strong></p>
          <p className="text-sm mt-2">Please check that the table exists in tableMapping configuration.</p>
        </div>
      </ComponentCard>
    );
  }

  // Filter for visible fields only (not hidden)
  const visibleFieldsList = visibleFields;

  if (visibleFieldsList.length === 0) {
    return (
      <ComponentCard title="Form">
        <div className="p-4 text-gray-500">
          <p>No visible fields found for this form.</p>
        </div>
      </ComponentCard>
    );
  }

  const formTitle = title || 
    tableName.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) + ' Form';

  const isProcessing = loading || isSubmitting;

  return (
    <form onSubmit={handleSubmit} onReset={handleReset} className={className}>
      <ComponentCard title={formTitle}>
        <div className="space-y-6">
          {/* Success Message */}
          {submitSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-400">
                ✅ {submitLabel} successful!
              </p>
            </div>
          )}

          {/* Error Message */}
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-400">
                ❌ {submitError}
              </p>
            </div>
          )}

          {/* Form Fields - Only render visible fields */}
          {visibleFieldsList.map(([fieldName, field]) => renderField(fieldName, field))}

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="submit"
              disabled={isProcessing}
              className={`px-4 py-2 text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? 'Saving...' : submitLabel}
            </button>

            {showReset && (
              <button
                type="reset"
                disabled={isProcessing}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                {resetLabel}
              </button>
            )}

            {showCancel && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isProcessing}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                {cancelLabel}
              </button>
            )}
          </div>
        </div>
      </ComponentCard>
    </form>
  );
};

export default DynamicForm;