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
const item_categoriesOptions = [
  { value: '1', label: 'Office Supplies' },
  { value: '2', label: 'IT Equipment' },
  { value: '3', label: 'Furniture' },
];
const tax_ratesOptions = [
  { value: 0, label: '0%' },
  { value: 5, label: '5%' },
  { value: 7.5, label: '7.5%' },
  { value: 10, label: '10%' },
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

const RequisitionItemForm: React.FC = () => {
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
      <ComponentCard title="Requisition Item Form">
        <div class="space-y-6">
        <div>
          <Label required>Item Description</Label>
          <div class="">
            <Input
              type="text"
              name="item_description"
              placeholder="HP Laptop"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label required>Quantity</Label>
          <div class="">
            <Input
              type="number"
              name="quantity"
              placeholder="5"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label required>Unit Price</Label>
          <div class="">
            <Input
              type="number"
              name="unit_price"
              placeholder="0.00"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label>SKU</Label>
          <Select
            name="sku_id"
            placeholder="Select SKU"
            options={skusOptions}
            
            class="dark:bg-dark-900"
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Category</Label>
          <Select
            name="category_id"
            placeholder="Select Category"
            options={item_categoriesOptions}
            
            class="dark:bg-dark-900"
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Tax Rate</Label>
          <Select
            name="tax_rate"
            placeholder="Select Tax Rate"
            options={tax_ratesOptions}
            
            class="dark:bg-dark-900"
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Delivery Required By</Label>
          <DatePicker
            id="delivery_required_by"
            name="delivery_required_by"
            placeholder="Select Delivery Required By"
            
            onChange={(dates, currentDateString) => {
              console.log({ dates, currentDateString });
            }}
          />
        </div>

          <div class="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="submit"
              class="px-4 py-2 text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
            >
              Save Requisition Item
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

export default RequisitionItemForm;
