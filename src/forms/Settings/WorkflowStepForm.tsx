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

const rolesOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'user', label: 'User' },
  { value: 'viewer', label: 'Viewer' },
];
const authority_levelsOptions = [
  { value: 1, label: 'Level 1 - Basic' },
  { value: 3, label: 'Level 3 - Team Lead' },
  { value: 5, label: 'Level 5 - Department Head' },
  { value: 8, label: 'Level 8 - Finance Manager' },
  { value: 10, label: 'Level 10 - Super Admin' },
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

const WorkflowStepForm: React.FC = () => {
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
      <ComponentCard title="Workflow Step Form">
        <div class="space-y-6">
        <div>
          <Label required>Step Order</Label>
          <div class="">
            <Input
              type="number"
              name="step_order"
              placeholder="1"
              
              onChange={handleChange}
            />

          </div>
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
          <Label>Required Approvals</Label>
          <div class="">
            <Input
              type="number"
              name="required_approvals"
              placeholder="1"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label>Approval Authority Level</Label>
          <Select
            name="approval_authority_level"
            placeholder="Select Approval Authority Level"
            options={authority_levelsOptions}
            
            class="dark:bg-dark-900"
            onChange={handleChange}
          />
        </div>
        <div class="flex items-center gap-3">
          <ToggleSwitch
            name="can_escalate"
            
            onChange={handleChange}
          />
          <Label>Can Escalate</Label>
        </div>
        <div>
          <Label>Expected Days to Respond</Label>
          <div class="">
            <Input
              type="number"
              name="expected_days_to_respond"
              placeholder="3"
              
              onChange={handleChange}
            />

          </div>
        </div>

          <div class="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="submit"
              class="px-4 py-2 text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
            >
              Save Workflow Step
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

export default WorkflowStepForm;
