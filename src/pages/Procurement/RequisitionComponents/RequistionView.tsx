// src/components/requisitions/RequisitionView.tsx

import React, { useState } from 'react';
import { X, ArrowLeft, Power, Loader2 } from 'lucide-react';

// ==================== TYPES ====================
interface Requisition {
  id: string | number;
  pr_id?: string;
  title?: string;
  description?: string;
  total_amount?: number;
  total_amount_record?: number;
  total_count_number?: number;
  status?: string;
  status_name?: string;
  priority?: string;
  priority_name?: string;
  requisition_type?: string;
  requisition_type_name?: string;
  department_name?: string;
  requester_name?: string;
  vendor_name?: string;
  location_name?: string;
  approver_name?: string;
  approve_date?: string;
  expected_delivery_date?: string;
  created_at?: string;
  created_by_name?: string;
  budget_name?: string;
  currency_name?: string;
  is_capex?: boolean | number;
  approval_workflow_name?: string;
  current_approval_level?: number;
  notes?: string;
  updated_at?: string;
  updated_by_name?: string;
  [key: string]: any;
}

interface RequisitionViewProps {
  requisition: Requisition;
  onClose?: () => void;
  onDeactivate?: (requisition: Requisition) => void;
  deactivateLoading?: boolean;
  className?: string;
  title?: string;
  showDeactivate?: boolean;
}

// ==================== COMPONENT ====================
const RequisitionView: React.FC<RequisitionViewProps> = ({
  requisition,
  onClose,
  onDeactivate,
  deactivateLoading = false,
  className = '',
  title = 'Requisition Details',
  showDeactivate = true,
}) => {
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Handle deactivate
  const handleDeactivate = async () => {
    if (!onDeactivate) return;
    
    const displayId = requisition.pr_id || requisition.id;
    if (window.confirm(`Are you sure you want to deactivate requisition #${displayId}?`)) {
      setIsDeactivating(true);
      try {
        await onDeactivate(requisition);
      } catch (error) {
        console.error('Error deactivating requisition:', error);
      } finally {
        setIsDeactivating(false);
      }
    }
  };

  // Helper to format currency with proper currency symbol
  const formatCurrency = (amount: number | undefined, currency: string = 'NGN') => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper to format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  // Helper to format boolean
  const formatBoolean = (value: boolean | number | undefined) => {
    if (value === undefined || value === null) return 'N/A';
    if (typeof value === 'number') {
      return value === 1 ? 'Yes' : 'No';
    }
    return value ? 'Yes' : 'No';
  };

  // Helper to get status color
  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    
    const statusMap: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      pending_approval: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      purchased: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      delivered: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      deactivated: 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    };
    
    const lowerStatus = status.toLowerCase();
    return statusMap[lowerStatus] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  // Helper to get priority color
  const getPriorityColor = (priority: string | undefined) => {
    if (!priority) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    
    const priorityMap: Record<string, string> = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      critical: 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-200',
    };
    
    const lowerPriority = priority.toLowerCase();
    return priorityMap[lowerPriority] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  // Helper to get the display value (prefer name over raw value)
  const getDisplayValue = (field: string, value: any) => {
    if (!value) return 'N/A';
    
    // Check if there's a name version (e.g., status_name, priority_name)
    const nameKey = `${field}_name`;
    if (requisition[nameKey]) {
      return requisition[nameKey];
    }
    return value;
  };

  // Get the actual status value (prefer status_name)
  const getStatusValue = () => {
    return requisition.status_name || requisition.status || 'N/A';
  };

  // Get the actual priority value (prefer priority_name)
  const getPriorityValue = () => {
    return requisition.priority_name || requisition.priority || 'N/A';
  };

  // Get the actual requisition type (prefer requisition_type_name)
  const getRequisitionTypeValue = () => {
    return requisition.requisition_type_name || requisition.requisition_type || 'N/A';
  };

  // Define which fields to show in the details view
  const detailFields = [
    // Primary Information
    { key: 'pr_id', label: 'PR Number', value: requisition.pr_id || requisition.id },
    { key: 'title', label: 'Title', value: requisition.title },
    { key: 'description', label: 'Description', value: requisition.description },
    { 
      key: 'total_amount_record', 
      label: 'Total Amount', 
      value: formatCurrency(requisition.total_amount_record || requisition.total_amount, requisition.currency_name) 
    },
    { key: 'currency_name', label: 'Currency', value: requisition.currency_name || 'NGN' },
    { key: 'total_count_number', label: 'Total Items', value: requisition.total_count_number || 'N/A' },
    
    // Status & Priority (with labels)
    { 
      key: 'status', 
      label: 'Status', 
      value: getStatusValue(), 
      isChip: true, 
      chipColor: getStatusColor(getStatusValue()) 
    },
    { 
      key: 'priority', 
      label: 'Priority', 
      value: getPriorityValue(), 
      isChip: true, 
      chipColor: getPriorityColor(getPriorityValue()) 
    },
    
    // Type & Classification
    { key: 'requisition_type', label: 'Type', value: getRequisitionTypeValue() },
    { key: 'is_capex', label: 'Is CAPEX?', value: formatBoolean(requisition.is_capex) },
    
    // People
    { key: 'requester_name', label: 'Requester', value: requisition.requester_name || 'N/A' },
    { key: 'department_name', label: 'Department', value: requisition.department_name || 'N/A' },
    { key: 'vendor_name', label: 'Vendor', value: requisition.vendor_name || 'N/A' },
    { key: 'location_name', label: 'Location', value: requisition.location_name || 'N/A' },
    { key: 'budget_name', label: 'Budget', value: requisition.budget_name || 'N/A' },
    
    // Approval
    { key: 'approver_name', label: 'Approver', value: requisition.approver_name || 'N/A' },
    { key: 'approve_date', label: 'Approval Date', value: formatDate(requisition.approve_date) },
    { key: 'approval_workflow_name', label: 'Workflow', value: requisition.approval_workflow_name || 'N/A' },
    { key: 'current_approval_level', label: 'Current Level', value: requisition.current_approval_level || 'N/A' },
    
    // Dates
    { key: 'expected_delivery_date', label: 'Expected Delivery', value: formatDate(requisition.expected_delivery_date) },
    
    // Notes
    { key: 'notes', label: 'Notes', value: requisition.notes },
    
    // Audit
    { key: 'created_by_name', label: 'Created By', value: requisition.created_by_name || 'N/A' },
    { key: 'created_at', label: 'Created Date', value: formatDate(requisition.created_at) },
    { key: 'updated_by_name', label: 'Updated By', value: requisition.updated_by_name || 'N/A' },
    { key: 'updated_at', label: 'Updated Date', value: formatDate(requisition.updated_at) || 'N/A' },
  ];

  const isDeactivatingNow = deactivateLoading || isDeactivating;
  const displayId = requisition.pr_id || requisition.id;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            #{displayId}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Deactivate Button */}
          {showDeactivate && onDeactivate && (
            <button
              onClick={handleDeactivate}
              disabled={isDeactivatingNow}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md
                transition-colors duration-200
                ${isDeactivatingNow 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                  : 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                }
              `}
            >
              {isDeactivatingNow ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Deactivating...
                </>
              ) : (
                <>
                  <Power className="w-3.5 h-3.5" />
                  Deactivate
                </>
              )}
            </button>
          )}

          {/* Close/Back Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          )}
        </div>
      </div>

      {/* Content - Compact Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {detailFields.map((field, index) => (
              field.value !== undefined && field.value !== null && field.value !== '' && field.value !== 'N/A' && (
                <tr key={field.key} className={`
                  ${index % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'}
                  hover:bg-gray-100/70 dark:hover:bg-gray-700/50 transition-colors
                `}>
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
              )
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with compact actions */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-lg">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Created: {formatDate(requisition.created_at)}
        </span>
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors duration-200 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <X className="w-3.5 h-3.5" />
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequisitionView;