// ==================== CLIENT FORM COMPONENT ====================

import { useState } from "react";
import useReduxApiData from "../../../hooks/useTanstackQuery";
export interface Client {
  id: number | string | null;
  name: string;
  phone: string;
  email: string;
  company_id?: string;
  company_name?: string;
  created_at?: string;
  cat?: string;
  table?: string;
  narration?: string;
}

export interface Company {
  id: number | string | null;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  cat?: string;
  table?: string;
  narration?: string;
  created_at?: string;
}
interface ClientFormProps {
  initialData?: Partial<Client>;
  companies?: Company[];
  isLoading?: boolean;
  onSubmit: (data: Partial<Client>) => Promise<void>;
  onCancel: () => void;
  submitButtonText?: string;
  title?: string;
  allowAddCompany?: boolean;
  onAddCompany?: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({
  initialData = {},
  isLoading = false,
  onSubmit,
  onCancel,
  submitButtonText = 'Add Client',
  title = 'Add New Client',
  allowAddCompany = true,
  onAddCompany,
}) => {
  const [formData, setFormData] = useState<Partial<Client>>({
    name: initialData.name || '',
    phone: initialData.phone || '',
    email: initialData.email || '',
    company_id: initialData.company_id || '',
    company_name: initialData.company_name || '',
    ...initialData,
  });

  const {
      data: companies,
      loadQuery: loadCompanies,
    } = useReduxApiData({
      table: "companies",
      uniqueKey: "companies",
      queryType: 'gets',
      mainParam: {},
      narration: 'get all companies'
    });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const companyId = e.target.value;
    const company = companies.find(c => c.id?.toString() === companyId);
    setFormData(prev => ({
      ...prev,
      company_id: companyId,
      company_name: company?.name || '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      // You can use toast here if needed
      return;
    }
    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="Enter full name"
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                placeholder="Enter email address"
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company
              </label>
              <div className="flex gap-2">
                <select
                  name="company_id"
                  value={formData.company_id || ''}
                  onChange={handleCompanyChange}
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
                >
                  <option value="">Select company (optional)</option>
                  {companies && companies.map(company => (
                    <option key={company.id} value={company.id?.toString()}>
                      {company.name}
                    </option>
                  ))}
                </select>
                {allowAddCompany && onAddCompany && (
                  <button
                    type="button"
                    onClick={onAddCompany}
                    className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    + New
                  </button>
                )}
              </div>
            </div>

            {!formData.company_id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company Name (Custom)
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name || ''}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;