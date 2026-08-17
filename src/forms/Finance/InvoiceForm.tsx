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

const purchase_ordersOptions = [
  { value: '1', label: 'PO-2026-001' },
  { value: '2', label: 'PO-2026-002' },
  { value: '3', label: 'PO-2026-003' },
];
const vendorsOptions = [
  { value: '1', label: 'Acme Corp' },
  { value: '2', label: 'Tech Solutions' },
  { value: '3', label: 'Global Services' },
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

const InvoiceForm: React.FC = () => {
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
      <ComponentCard title="Invoice Form">
        <div class="space-y-6">
        <div>
          <Label required>Invoice Number</Label>
          <div class="">
            <Input
              type="text"
              name="invoice_number"
              placeholder="INV-001"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label>Purchase Order</Label>
          <Select
            name="po_id"
            placeholder="Select Purchase Order"
            options={purchase_ordersOptions}
            
            class="dark:bg-dark-900"
            onChange={handleChange}
          />
        </div>
        <div>
          <Label required>Vendor</Label>
          <Select
            name="vendor_id"
            placeholder="Select Vendor"
            options={vendorsOptions}
            
            class="dark:bg-dark-900"
            onChange={handleChange}
          />
        </div>
        <div>
          <Label required>Invoice Date</Label>
          <DatePicker
            id="invoice_date"
            name="invoice_date"
            placeholder="Select Invoice Date"
            
            onChange={(dates, currentDateString) => {
              console.log({ dates, currentDateString });
            }}
          />
        </div>
        <div>
          <Label required>Due Date</Label>
          <DatePicker
            id="due_date"
            name="due_date"
            placeholder="Select Due Date"
            
            onChange={(dates, currentDateString) => {
              console.log({ dates, currentDateString });
            }}
          />
        </div>
        <div>
          <Label required>Subtotal</Label>
          <div class="">
            <Input
              type="number"
              name="subtotal"
              placeholder="0.00"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label>Tax Amount</Label>
          <div class="">
            <Input
              type="number"
              name="tax_amount"
              placeholder="0.00"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label>Discount Amount</Label>
          <div class="">
            <Input
              type="number"
              name="discount_amount"
              placeholder="0.00"
              
              onChange={handleChange}
            />

          </div>
        </div>
        <div>
          <Label required>Total Amount</Label>
          <div class="">
            <Input
              type="number"
              name="total_amount"
              placeholder="0.00"
               disabled
              onChange={handleChange}
            />

          </div>
        </div>

          <div class="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="submit"
              class="px-4 py-2 text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
            >
              Save Invoice
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

export default InvoiceForm;
