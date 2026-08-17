import React, { useState } from 'react';
import ComponentCard from '../../components/common/ComponentCard';
import Label from '../../components/forms/Label';
import Input from '../../components/forms/input/InputField';
import Select from '../../components/forms/Select';
import TextArea from '../../components/forms/input/TextArea';
import ToggleSwitch from '../../components/forms/ToggleSwitch';
import DatePicker from '../../components/forms/DatePicker';
import PhoneInput from '../../components/forms/group-input/PhoneInput';
import FileUpload from '../../components/forms/FileUpload';
import MultiSelect from '../../components/forms/MultiSelect';

const usersOptions = [
  { value: '1', label: 'John Doe' },
  { value: '2', label: 'Jane Smith' },
  { value: '3', label: 'Bob Johnson' },
];
const locationsOptions = [
  { value: 'lagos', label: 'Lagos' },
  { value: 'abuja', label: 'Abuja' },
  { value: 'port_harcourt', label: 'Port Harcourt' },
];

const countries = [
  { code: 'US', label: '+1' },
  { code: 'GB', label: '+44' },
  { code: 'CA', label: '+1' },
  { code: 'AU', label: '+61' },
  { code: 'NG', label: '+234' },
  { code: 'KE', label: '+254' },
  { code: 'ZA', label: '+27' },
];

const DepartmentForm: React.FC = () => {
  const [formData, setFormData] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    // Submit form data to API
  };

  return (
    <form onSubmit={handleSubmit}>
      <ComponentCard title="Department Form">
        <div class="space-y-6">
        <div>
          <Label required>Department Code</Label>
          <div class="">
            <Input
              type="text"
              name="department_code"
              placeholder="FIN-001"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label required>Department Name</Label>
          <div class="">
            <Input
              type="text"
              name="department_name"
              placeholder="Finance Department"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label>Allocated Budget</Label>
          <div class="">
            <Input
              type="number"
              name="budget_allocated"
              placeholder="0.00"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label>Department Head</Label>
          <Select
            name="head_user_id"
            placeholder="Select Department Head"
            options={usersOptions}
            
            class="dark:bg-dark-900"
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Location</Label>
          <Select
            name="location_id"
            placeholder="Select Location"
            options={locationsOptions}
            
            class="dark:bg-dark-900"
            onChange={handleChange}
          />
        </div>
        <div class="flex items-center gap-3">
          <ToggleSwitch
            name="is_active"
            
            onChange={handleChange}
          />
          <Label>Active</Label>
        </div>

          <div class="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="submit"
              class="px-4 py-2 text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
            >
              Save Department
            </button>
            <button
              type="reset"
              class="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </ComponentCard>
    </form>
  );
};

export default DepartmentForm;
