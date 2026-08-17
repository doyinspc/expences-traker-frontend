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
import MultiSelect from '../../components/forms/MultiSelect';import { EnvelopeIcon } from '../../icons';


const departmentsOptions = [
  { value: 'finance', label: 'Finance' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'it', label: 'IT' },
  { value: 'operations', label: 'Operations' },
  { value: 'sales', label: 'Sales' },
];
const rolesOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'user', label: 'User' },
  { value: 'viewer', label: 'Viewer' },
];
const usersOptions = [
  { value: '1', label: 'John Doe' },
  { value: '2', label: 'Jane Smith' },
  { value: '3', label: 'Bob Johnson' },
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

const UserForm: React.FC = () => {
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
      <ComponentCard title="User Form">
        <div class="space-y-6">
        <div>
          <Label required>Employee ID</Label>
          <div class="">
            <Input
              type="text"
              name="employee_id"
              placeholder="EMP-001"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label required>Email</Label>
          <div class="relative">
            <Input
              type="text"
              name="email"
              placeholder="employee@company.com"
               class="pl-[62px]"
              onChange={handleChange}
            />
            <span class="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <EnvelopeIcon class="size-5" />
            </span>
          </div>
        </div>
        <div>
          <Label required>First Name</Label>
          <div class="">
            <Input
              type="text"
              name="first_name"
              placeholder="John"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label required>Last Name</Label>
          <div class="">
            <Input
              type="text"
              name="last_name"
              placeholder="Doe"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label required>Department</Label>
          <Select
            name="department_id"
            placeholder="Select Department"
            options={departmentsOptions}
            
            class="dark:bg-dark-900"
            onChange={handleChange}
          />
        </div>
        <div>
          <Label required>Role</Label>
          <Select
            name="role_id"
            placeholder="Select Role"
            options={rolesOptions}
            
            class="dark:bg-dark-900"
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Manager</Label>
          <Select
            name="manager_id"
            placeholder="Select Manager"
            options={usersOptions}
            
            class="dark:bg-dark-900"
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Delegated Authority Limit</Label>
          <div class="">
            <Input
              type="number"
              name="delegated_authority_limit"
              placeholder="0.00"
              
              onChange={handleChange}
            />

          </div>
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
              Save User
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

export default UserForm;
