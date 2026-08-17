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


const payment_termsOptions = [
  { value: 'net15', label: 'Net 15' },
  { value: 'net30', label: 'Net 30' },
  { value: 'net45', label: 'Net 45' },
  { value: 'net60', label: 'Net 60' },
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

const VendorForm: React.FC = () => {
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
      <ComponentCard title="Vendor Form">
        <div class="space-y-6">
        <div>
          <Label required>Vendor Code</Label>
          <div class="">
            <Input
              type="text"
              name="vendor_code"
              placeholder="VEN-001"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label required>Company Name</Label>
          <div class="">
            <Input
              type="text"
              name="company_name"
              placeholder="Acme Corp"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label>Contact Person</Label>
          <div class="">
            <Input
              type="text"
              name="contact_person"
              placeholder="John Smith"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label>Email</Label>
          <div class="relative">
            <Input
              type="text"
              name="email"
              placeholder="vendor@company.com"
               class="pl-[62px]"
              onChange={handleChange}
            />
            <span class="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <EnvelopeIcon class="size-5" />
            </span>
          </div>
        </div>
        <div>
          <Label>Phone</Label>
          <PhoneInput
            name="phone"
            placeholder="+1 (555) 000-0000"
            
            selectPosition="start"
            countries={countries}
            onChange={(phoneNumber) => console.log(phoneNumber)}
          />
        </div>
        <div>
          <Label>Address</Label>
          <TextArea
            name="address"
            placeholder="123 Vendor Street"
            
            rows={4}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Tax ID</Label>
          <div class="">
            <Input
              type="text"
              name="tax_id"
              placeholder="TIN-123-456-789"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label>Payment Terms</Label>
          <Select
            name="payment_terms"
            placeholder="Select Payment Terms"
            options={payment_termsOptions}
            
            class="dark:bg-dark-900"
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Credit Limit</Label>
          <div class="">
            <Input
              type="number"
              name="credit_limit"
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
              Save Vendor
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

export default VendorForm;
