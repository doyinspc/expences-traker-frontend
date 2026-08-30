import React, { useEffect, useState } from 'react';
import companyConfig from './../../config/users/company'; 
import { Camera, Pencil } from 'lucide-react';
import { isObjectWithValue } from '../../actions/common';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
interface CompanyData {
  id: number;
  name: string;
  short_name?: string;
  motto?: string;
  logo_path?: string;
  favicon_path?: string;
  registration_number?: string;
  tax_id?: string;
  business_type?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  base_currency?: string;
  fiscal_year_start?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_sort_code?: string;
  timezone?: string;
  date_format?: string;
  week_start_day?: number;
  default_location_id?: number;
  invoice_prefix?: string;
  phone?: string;
  email?: string;
  support_email?: string;
  support_phone?: string;
  created_at?: string;
  updated_at?: string;
}

// ------------------------------------------------------------------
// Helper: format value based on field config (with defensive fallbacks)
// ------------------------------------------------------------------
function formatFieldValue(value: any, fieldConfig: any): string | JSX.Element {
  // If value is explicitly null/undefined/empty, return a dash
  if (value === null || value === undefined || value === '') return '—';

  // Guard: if fieldConfig is missing, just stringify the value
  if (!fieldConfig) {
    return String(value);
  }

  // Handle file fields (logo)
  if (fieldConfig.type === 'file') {
    if (fieldConfig.tableFormat && typeof fieldConfig.tableFormat === 'function') {
      try {
        return fieldConfig.tableFormat(value);
      } catch (error) {
        console.warn('Error formatting file field:', error);
        return '🖼️';
      }
    }
    // If value is a string, assume it's an image URL
    if (typeof value === 'string') {
      return <img src={value} alt="file" className="h-8 w-auto" onError={(e) => (e.currentTarget.style.display = 'none')} />;
    }
    return '📎';
  }

  // Handle date fields
  if (fieldConfig.type === 'date' && value) {
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return String(value); // invalid date
      return date.toLocaleDateString();
    } catch {
      return String(value);
    }
  }

  // Handle datetime
  if (fieldConfig.type === 'datetime' && value) {
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return String(value);
      return date.toLocaleString();
    } catch {
      return String(value);
    }
  }

  // Handle toggle / boolean
  if (fieldConfig.type === 'toggle' || fieldConfig.type === 'boolean') {
    return value ? '✅ Yes' : '❌ No';
  }

  // For select fields, you could map value to label if needed, but fallback to raw value
  return String(value);
}

// ------------------------------------------------------------------
// Component Props
// ------------------------------------------------------------------
interface CompanyViewPageProps {
  companyData?: CompanyData | null; // allow null/undefined
  onEdit: () => void;
  onPhoto: () => void;
}

// ------------------------------------------------------------------
// Main Component (Defensive)
// ------------------------------------------------------------------
const CompanyViewPage: React.FC<CompanyViewPageProps> = ({ companyData, onEdit, onPhoto }) => {
  // 1. Guard: no data provided
  if (!companyData || !isObjectWithValue(companyData)) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center">
        <p className="text-gray-500 dark:text-gray-400">No company data available. Please add company information.</p>
        <button
          onClick={onEdit}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Pencil size={16} />
          Add Company Info
        </button>
      </div>
    );
  }

  // 2. Get fields from config (with fallback empty object)
  const fields = companyConfig?.fields || {};

  // 3. Define categories (same as before)
  const categories = [
    { title: 'Identity & Branding', keys: ['name', 'short_name', 'motto', 'logo_path', 'favicon_path'] },
    { title: 'Legal & Registration', keys: ['registration_number', 'tax_id', 'business_type'] },
    { title: 'Address', keys: ['address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country'] },
    { title: 'Banking & Finance', keys: ['base_currency', 'fiscal_year_start', 'bank_name', 'bank_account_number', 'bank_sort_code'] },
    { title: 'System Configuration', keys: ['timezone', 'date_format', 'week_start_day', 'default_location_id', 'invoice_prefix'] },
    { title: 'Contact', keys: ['phone', 'email', 'support_email', 'support_phone'] },
  ];

  // 4. Helper: get visible keys (defensively)
  const getVisibleFields = (keys: string[]): string[] => {
    if (!companyData || typeof companyData !== 'object') return [];
    return keys.filter((key) => {
      // Use safe hasOwnProperty check
      return Object.prototype.hasOwnProperty.call(companyData, key) && companyData[key as keyof CompanyData] !== undefined;
    });
  };

  // 5. Safe date formatting for footer
  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleString();
    } catch {
      return dateStr;
    }
  };

  // ===== RENDER =====
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-colors">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <span>🏢</span> Company Details
        </h2>
        <div>
            <button
            onClick={onEdit}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
            <Pencil size={16} />
            Edit
            </button>
            <button
            onClick={onPhoto}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
            <Camera size={16} />
            Photo
            </button>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {categories.map((category, idx) => {
              const visibleKeys = getVisibleFields(category.keys);
              if (visibleKeys.length === 0) return null;

              return (
                <React.Fragment key={idx}>
                  {/* Category header */}
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 font-medium text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {category.title}
                    </td>
                  </tr>

                  {/* Field rows */}
                  {visibleKeys.map((key) => {
                    const fieldConfig = fields[key]; // may be undefined
                    if (!fieldConfig) {
                      // Fallback: show key as label and raw value
                      return (
                        <tr key={key} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                          <td className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 w-1/3">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {String(companyData[key as keyof CompanyData] || '—')}
                          </td>
                        </tr>
                      );
                    }

                    // Skip if field is hidden (but we can still show if you want, here we skip)
                    if (fieldConfig.hidden) return null;

                    const value = companyData[key as keyof CompanyData];
                    const displayValue = formatFieldValue(value, fieldConfig);

                    return (
                      <tr key={key} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 w-1/3">
                          {fieldConfig.label || key}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                          {typeof displayValue === 'string' ? displayValue : displayValue}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-6 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between">
        <span>Created: {formatDate(companyData.created_at)}</span>
        <span>Updated: {formatDate(companyData.updated_at)}</span>
      </div>
    </div>
  );
};

export default CompanyViewPage;