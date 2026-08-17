import React, { useState } from 'react';
import ComponentCard from '../../components/common/ComponentCard';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import TextArea from '../../components/form/input/TextArea';
import ToggleSwitch from '../../components/form/form-elements/ToggleSwitch';
import DatePicker from '../../components/form/date-picker';

interface RequisitionFormData {
  pr_number?: string;
  title?: string;
  description?: string;
  department_id?: string;
  vendor_id?: string;
  requisition_type?: string;
  total_amount?: number;
  is_capex?: boolean;
  priority?: string;
  expected_delivery_date?: string;
}

const departmentsOptions = [
  { value: 'finance', label: 'Finance' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'it', label: 'IT' },
  { value: 'operations', label: 'Operations' },
  { value: 'sales', label: 'Sales' },
];

const vendorsOptions = [
  { value: '1', label: 'Acme Corp' },
  { value: '2', label: 'Tech Solutions' },
  { value: '3', label: 'Global Services' },
];

const requisition_typesOptions = [
  { value: 'goods', label: 'Goods' },
  { value: 'service', label: 'Service' },
  { value: 'cash_advance', label: 'Cash Advance' },
];

const prioritiesOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const RequisitionForm: React.FC = () => {
  const [formData, setFormData] = useState<RequisitionFormData>({
    pr_number: 'PR-2026-001',
    is_capex: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value,
    }));
  };

  const handleCustomChange = (name: keyof RequisitionFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    // Submit form data to API
  };

  const handleReset = () => {
    setFormData({
      pr_number: 'PR-2026-001',
      is_capex: false,
    });
  };

  return (
    <form onSubmit={handleSubmit} onReset={handleReset}>
      <ComponentCard title="Purchase Requisition Form">
        <div className="space-y-6">
          <div>
            <Label required>PR Number</Label>
            <div>
              <Input
                type="text"
                name="pr_number"
                placeholder="PR-2026-001"
                disabled
                value={formData.pr_number || ''}
              />
            </div>
          </div>

          <div>
            <Label required>Title</Label>
            <div>
              <Input
                type="text"
                name="title"
                placeholder="Office Supplies Purchase"
                value={formData.title || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <TextArea
              name="description"
              placeholder="Detailed description of requisition"
              rows={4}
              value={formData.description || ''}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label required>Department</Label>
            <Select
              name="department_id"
              placeholder="Select Department"
              options={departmentsOptions}
              value={formData.department_id || ''}
              className="dark:bg-dark-900"
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Vendor</Label>
            <Select
              name="vendor_id"
              placeholder="Select Vendor"
              options={vendorsOptions}
              value={formData.vendor_id || ''}
              className="dark:bg-dark-900"
              onChange={handleChange}
            />
          </div>

          <div>
            <Label required>Requisition Type</Label>
            <Select
              name="requisition_type"
              placeholder="Select Requisition Type"
              options={requisition_typesOptions}
              value={formData.requisition_type || ''}
              className="dark:bg-dark-900"
              onChange={handleChange}
            />
          </div>

          <div>
            <Label required>Total Amount</Label>
            <div>
              <Input
                type="number"
                name="total_amount"
                placeholder="0.00"
                value={formData.total_amount ?? ''}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ToggleSwitch
              name="is_capex"
              checked={!!formData.is_capex}
              onChange={(checked: boolean) => handleCustomChange('is_capex', checked)}
            />
            <Label>Is CAPEX?</Label>
          </div>

          <div>
            <Label>Priority</Label>
            <Select
              name="priority"
              placeholder="Select Priority"
              options={prioritiesOptions}
              value={formData.priority || ''}
              className="dark:bg-dark-900"
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Expected Delivery Date</Label>
            <DatePicker
              id="expected_delivery_date"
              name="expected_delivery_date"
              placeholder="Select Expected Delivery Date"
              value={formData.expected_delivery_date || ''}
              onChange={(_, currentDateString) => {
                handleCustomChange('expected_delivery_date', currentDateString);
              }}
            />
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="submit"
              className="px-4 py-2 text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
            >
              Save Purchase Requisition
            </button>
            <button
              type="reset"
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </ComponentCard>
    </form>
  );
};

export default RequisitionForm;