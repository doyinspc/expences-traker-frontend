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

const item_categoriesOptions = [
  { value: '1', label: 'Office Supplies' },
  { value: '2', label: 'IT Equipment' },
  { value: '3', label: 'Furniture' },
];
const unitsOptions = [
  { value: 'each', label: 'Each' },
  { value: 'kg', label: 'Kilogram' },
  { value: 'g', label: 'Gram' },
  { value: 'l', label: 'Liter' },
  { value: 'm', label: 'Meter' },
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

const SKUForm: React.FC = () => {
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
      <ComponentCard title="SKU Form">
        <div class="space-y-6">
        <div>
          <Label required>SKU Code</Label>
          <div class="">
            <Input
              type="text"
              name="sku_code"
              placeholder="SKU-001"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label required>Item Name</Label>
          <div class="">
            <Input
              type="text"
              name="item_name"
              placeholder="HP Laptop"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label>Description</Label>
          <TextArea
            name="description"
            placeholder="Detailed item description"
            
            rows={4}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label required>Category</Label>
          <Select
            name="category_id"
            placeholder="Select Category"
            options={item_categoriesOptions}
            
            class="dark:bg-dark-900"
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Unit of Measure</Label>
          <Select
            name="unit_of_measure"
            placeholder="Select Unit of Measure"
            options={unitsOptions}
            
            class="dark:bg-dark-900"
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Min Stock Level</Label>
          <div class="">
            <Input
              type="number"
              name="min_stock_level"
              placeholder="10"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label>Max Stock Level</Label>
          <div class="">
            <Input
              type="number"
              name="max_stock_level"
              placeholder="100"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label>Reorder Point</Label>
          <div class="">
            <Input
              type="number"
              name="reorder_point"
              placeholder="20"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label required>Unit Cost</Label>
          <div class="">
            <Input
              type="number"
              name="unit_cost"
              placeholder="0.00"
              
              onChange={handleChange}
            />

          </div>
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

          <div class="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="submit"
              class="px-4 py-2 text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
            >
              Save SKU
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

export default SKUForm;
