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

const entity_typesOptions = [
  { value: 'requisition', label: 'Requisition' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'payment', label: 'Payment' },
  { value: 'grn', label: 'GRN' },
  { value: 'retirement', label: 'Retirement' },
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

const ApprovalWorkflowForm: React.FC = () => {
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
      <ComponentCard title="Approval Workflow Form">
        <div class="space-y-6">
        <div>
          <Label required>Workflow Name</Label>
          <div class="">
            <Input
              type="text"
              name="workflow_name"
              placeholder="Purchase Approval"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label>Description</Label>
          <TextArea
            name="workflow_description"
            placeholder="Workflow description"
            
            rows={4}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label required>Entity Type</Label>
          <Select
            name="entity_type"
            placeholder="Select Entity Type"
            options={entity_typesOptions}
            
            class="dark:bg-dark-900"
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Min Amount</Label>
          <div class="">
            <Input
              type="number"
              name="min_amount"
              placeholder="0.00"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label>Max Amount</Label>
          <div class="">
            <Input
              type="number"
              name="max_amount"
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
              Save Approval Workflow
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

export default ApprovalWorkflowForm;
