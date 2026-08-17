// src/components/common/DetailFields.tsx

import React from 'react';
import DetailFieldsTable, { DetailField } from './DetailFieldsTables';
import { buildLeftFields, buildRightFields, DetailFieldsHelpers } from '../utils/functions/detailsFieldHelpers';

export interface DetailFieldsProps extends DetailFieldsHelpers {
  leftFields?: DetailField[];
  rightFields?: DetailField[];
}

const DetailFields: React.FC<DetailFieldsProps> = ({
  document,
  statusData,
  priorityData,
  documentType,
  currency,
  formatCurrency,
  formatDate,
  formatBoolean,
  safeValue,
  getStatusValue,
  getPriorityValue,
  getDocumentTypeValue,
  getStatusColorFromData,
  getPriorityColorFromData,
  getWorkflowName,
  leftFields: customLeftFields,
  rightFields: customRightFields,
}) => {
  // Create helpers object
  const helpers: DetailFieldsHelpers = {
    document,
    statusData,
    priorityData,
    documentType,
    currency,
    formatCurrency,
    formatDate,
    formatBoolean,
    safeValue,
    getStatusValue,
    getPriorityValue,
    getDocumentTypeValue,
    getStatusColorFromData,
    getPriorityColorFromData,
    getWorkflowName,
  };

  // Build fields using helpers
  const leftFields = customLeftFields || buildLeftFields(helpers);
  const rightFields = customRightFields || buildRightFields(helpers);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
      <DetailFieldsTable fields={leftFields} />
      <DetailFieldsTable fields={rightFields} />
    </div>
  );
};

export default DetailFields;