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

const cash_advancesOptions = [
  { value: '1', label: 'ADV-2026-001' },
  { value: '2', label: 'ADV-2026-002' },
  { value: '3', label: 'ADV-2026-003' },
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

const RetirementForm: React.FC = () => {
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
      <ComponentCard title="Cash Advance Retirement Form">
        <div class="space-y-6">
        <div>
          <Label>Retirement Number</Label>
          <div class="">
            <Input
              type="text"
              name="retirement_number"
              placeholder=""
               disabled
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label required>Cash Advance</Label>
          <Select
            name="cash_advance_id"
            placeholder="Select Cash Advance"
            options={cash_advancesOptions}
            
            class="dark:bg-dark-900"
            onChange={handleChange}
          />
        </div>
        <div>
          <Label required>Retirement Date</Label>
          <DatePicker
            id="retirement_date"
            name="retirement_date"
            placeholder="Select Retirement Date"
            
            onChange={(dates, currentDateString) => {
              console.log({ dates, currentDateString });
            }}
          />
        </div>
        <div>
          <Label required>Amount Retired</Label>
          <div class="">
            <Input
              type="number"
              name="amount_retired"
              placeholder="0.00"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label>Receipt Number</Label>
          <div class="">
            <Input
              type="text"
              name="receipt_number"
              placeholder="RCP-001"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label>Receipt Document</Label>
          <FileUpload
            name="receipt_file_path"
            accept=".pdf,.jpg,.jpeg,.png"
            
            onChange={(file) => console.log(file)}
          />
        </div>
        <div>
          <Label>Expense Description</Label>
          <TextArea
            name="expense_description"
            placeholder="Description of expenses"
            
            rows={4}
            onChange={handleChange}
          />
        </div>

          <div class="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="submit"
              class="px-4 py-2 text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
            >
              Save Cash Advance Retirement
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

export default RetirementForm;
