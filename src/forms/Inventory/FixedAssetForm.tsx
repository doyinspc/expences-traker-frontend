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

const skusOptions = [
  { value: '1', label: 'HP Laptop' },
  { value: '2', label: 'Dell Monitor' },
  { value: '3', label: 'Office Chair' },
];
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
const conditionsOptions = [
  { value: 'new', label: 'New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'disposed', label: 'Disposed' },
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

const FixedAssetForm: React.FC = () => {
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
      <ComponentCard title="Fixed Asset Form">
        <div class="space-y-6">
        <div>
          <Label required>Asset Tag</Label>
          <div class="">
            <Input
              type="text"
              name="asset_tag"
              placeholder="AST-001"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label>Serial Number</Label>
          <div class="">
            <Input
              type="text"
              name="serial_number"
              placeholder="SN-001"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label required>SKU</Label>
          <Select
            name="sku_id"
            placeholder="Select SKU"
            options={skusOptions}
            
            class="dark:bg-dark-900"
            onChange={handleChange}
          />
        </div>
        <div>
          <Label required>Asset Name</Label>
          <div class="">
            <Input
              type="text"
              name="asset_name"
              placeholder="Dell Laptop"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label>Description</Label>
          <TextArea
            name="description"
            placeholder="Asset description"
            
            rows={4}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label required>Purchase Date</Label>
          <DatePicker
            id="purchase_date"
            name="purchase_date"
            placeholder="Select Purchase Date"
            
            onChange={(dates, currentDateString) => {
              console.log({ dates, currentDateString });
            }}
          />
        </div>
        <div>
          <Label required>Purchase Cost</Label>
          <div class="">
            <Input
              type="number"
              name="purchase_cost"
              placeholder="0.00"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label required>Useful Life (Years)</Label>
          <div class="">
            <Input
              type="number"
              name="useful_life_years"
              placeholder="5"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label>Assigned To</Label>
          <Select
            name="assigned_to_user_id"
            placeholder="Select Assigned To"
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
        <div>
          <Label>Condition Status</Label>
          <Select
            name="condition_status"
            placeholder="Select Condition Status"
            options={conditionsOptions}
            
            class="dark:bg-dark-900"
            onChange={handleChange}
          />
        </div>

          <div class="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="submit"
              class="px-4 py-2 text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
            >
              Save Fixed Asset
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

export default FixedAssetForm;
