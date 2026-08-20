// src/utils/functions/detailFieldsHelpers.ts

import { DetailField } from '../../components/common/DetailFieldsTable';

export interface DocumentData {
  id: string | number;
  document_number?: string;
  title?: string;
  description?: string;
  total_amount?: number;
  total_amount_record?: number;
  total_count_number?: number;
  status?: string;
  status_name?: string;
  priority?: string;
  priority_name?: string;
  document_type?: string;
  document_type_name?: string;
  department_name?: string;
  requester_name?: string;
  vendor_name?: string;
  location_name?: string;
  approver_name?: string;
  approve_date?: string;
  expected_delivery_date?: string;
  created_at?: string;
  created_by_name?: string;
  updated_at?: string;
  updated_by_name?: string;
  budget_name?: string;
  currency_name?: string;
  currency_code?: string;
  is_capex?: boolean | number;
  approval_workflow_name?: string;
  workflow_name?: string;
  current_approval_level?: number;
  notes?: string;
  approval_workflow_id?: string | number;
  status_id?: string | number;
  is_active?: boolean | number;
  [key: string]: any;
}

export interface CommonData {
  id: string | number;
  name?: string;
  code?: string;
  text_1?: string;
  is_active?: any;
  [key: string]: any;
}

export interface DetailFieldsHelpers {
  document: DocumentData;
  statusData: CommonData[];
  priorityData: CommonData[];
  documentType: string;
  currency: string;
  formatCurrency: (amount: number | string | undefined, currency: string) => string;
  formatDate: (dateString: string | undefined) => string;
  formatBoolean: (value: boolean | number | undefined) => string;
  safeValue: (value: any, fallback?: string) => string;
  getStatusValue: () => string;
  getPriorityValue: () => string;
  getDocumentTypeValue: () => string;
  getStatusColorFromData: (statusId: string | number | undefined) => string;
  getPriorityColorFromData: (priorityId: string | number | undefined) => string;
  getWorkflowName: () => string;
}

/**
 * Build left side detail fields
 */
export const buildLeftFields = (helpers: DetailFieldsHelpers): DetailField[] => {
  const {
    document,
    documentType,
    currency,
    formatCurrency,
    safeValue,
    getStatusValue,
    getPriorityValue,
    getDocumentTypeValue,
    getStatusColorFromData,
    getPriorityColorFromData,
    formatBoolean,
  } = helpers;

  return [
    { key: 'document_number', label: `${documentType} Number`, value: safeValue(document.document_number || document.id) },
    { key: 'title', label: 'Title', value: safeValue(document.title) },
    { key: 'description', label: 'Description', value: safeValue(document.description) },
    { 
      key: 'total_amount_record', 
      label: 'Total Amount', 
      value: formatCurrency(document.total_amount_record || document.total_amount, currency) 
    },
    { key: 'currency_name', label: 'Currency', value: safeValue(currency) },
    { key: 'total_count_number', label: 'Total Items', value: safeValue(document.total_count_number) },
    { 
      key: 'status', 
      label: 'Status', 
      value: safeValue(getStatusValue()), 
      isChip: true, 
      chipColor: getStatusColorFromData(document.status_id || document.status) 
    },
    { 
      key: 'priority', 
      label: 'Priority', 
      value: safeValue(getPriorityValue()), 
      isChip: true, 
      chipColor: getPriorityColorFromData(document.priority) 
    },
    { key: 'document_type', label: 'Type', value: safeValue(getDocumentTypeValue()) },
    { key: 'notes', label: 'Note', value: safeValue(safeValue(document.notes)) },
  ];
};

/**
 * Build right side detail fields
 */
export const buildRightFields = (helpers: DetailFieldsHelpers): DetailField[] => {
  const {
    document,
    formatCurrency,
    formatDate,
    safeValue,
    getWorkflowName,
  } = helpers;

  return [
    { key: 'budget_name', label: 'Budget', value: safeValue(document.budget_name) },
    { key: 'requester_name', label: 'Requester', value: safeValue(document.requester_name) },
    { key: 'department_name', label: 'Department', value: safeValue(document.department_name) },
    { key: 'vendor_name', label: 'Vendor', value: safeValue(document.vendor_name) },
    { key: 'location_name', label: 'Location', value: safeValue(document.location_name) },
    { key: 'approver_name', label: 'Approver', value: safeValue(document.approver_name) },
    { key: 'approve_date', label: 'Approval Date', value: formatDate(document.approve_date) },
    { key: 'approval_workflow_name', label: 'Workflow', value: safeValue(getWorkflowName()) },
    { key: 'current_approval_level', label: 'Current Level', value: safeValue(document.current_approval_level) },
    { key: 'expected_delivery_date', label: 'Expected Delivery', value: formatDate(document.expected_delivery_date) },
    { key: 'created_by_name', label: 'Created By', value: safeValue(document.created_by_name) },
    { key: 'created_at', label: 'Created Date', value: formatDate(document.created_at) },
    { key: 'updated_by_name', label: 'Updated By', value: safeValue(document.updated_by_name) },
    { key: 'updated_at', label: 'Updated Date', value: formatDate(document.updated_at) },
  ];
};