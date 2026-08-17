// src/components/common/DetailFieldsTable.tsx

import React from 'react';

export interface DetailField {
  key: string;
  label: string;
  value: string;
  isChip?: boolean;
  chipColor?: string;
}

export interface DetailFieldsTableProps {
  fields: DetailField[];
  className?: string;
}

const DetailFieldsTable: React.FC<DetailFieldsTableProps> = ({
  fields,
  className = '',
}) => {
  const visibleFields = fields.filter(
    (field) =>
      field.value !== undefined &&
      field.value !== null &&
      field.value !== '' &&
      field.value !== 'N/A'
  );

  if (visibleFields.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
        No details available
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {visibleFields.map((field, index) => (
            <tr
              key={field.key}
              className={`
                ${index % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'}
                hover:bg-gray-100/70 dark:hover:bg-gray-700/50 transition-colors
              `}
            >
              <td className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap w-1/3">
                {field.label}
              </td>
              <td className="px-3 py-1.5 text-xs text-gray-900 dark:text-gray-100 w-2/3">
                {field.isChip ? (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${field.chipColor}`}>
                    {field.value}
                  </span>
                ) : (
                  <span className="break-words">{field.value}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DetailFieldsTable;