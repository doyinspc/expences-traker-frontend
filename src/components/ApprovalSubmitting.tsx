// src/components/approvals/ApprovalSubmitModal.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { X, Loader2, RefreshCw } from 'lucide-react';
import useReduxApiData from '../hooks/useTanstackQuery';

interface ApprovalSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    workflow_id: number;
    status_id: number;
    priority_id: number;
    comment: string;
  }) => void;
  isSubmitting?: boolean;
  title?: string;
  defaultValues?: {
    workflow_id?: string | number;
    status_id?: string | number;
    priority_id?: string | number;
    comment?: string;
  };
  documentType?: string;
  maxAmount?: number;
  formatCurrency?: (amount: number) => string;
  // Optional: pass custom params for workflow selection
  workflowParams?: Record<string, any>;
}

const ApprovalSubmitModal: React.FC<ApprovalSubmitModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  title = 'Submit for Approval',
  defaultValues = {},
  documentType = 'Document',
  maxAmount = 0,
  formatCurrency = (amount) => `$${amount?.toLocaleString() || 0}`,
  workflowParams = {},
}) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [comment, setComment] = useState<string>('');

  // ============================================
  // LOAD DATA INTERNALLY
  // ============================================
  
  // Fetch statuses (grp=11)
  const { 
    data: statusData, 
    loadQuery: loadStatuses, 
    isLoading: isStatusLoading 
  } = useReduxApiData({
    table: "commons",
    uniqueKey: 'modal_statuses',
    queryType: 'gets',
    mainParam: { grp: 11, is_active: 1 },
    narration: 'get statuses',
    autoLoad: false,
  });

  // Fetch priorities (grp=14)
  const { 
    data: priorityData, 
    loadQuery: loadPriorities, 
    isLoading: isPriorityLoading 
  } = useReduxApiData({
    table: "commons",
    uniqueKey: 'modal_priorities',
    queryType: 'gets',
    mainParam: { grp: 14, is_active: 1 },
    narration: 'get priorities',
    autoLoad: false,
  });

  // Fetch workflows (grp=20) with custom params
  const { 
    data: workflowData, 
    loadQuery: loadWorkflows, 
    isLoading: isWorkflowLoading 
  } = useReduxApiData({
    table: "commons",
    uniqueKey: 'modal_workflows',
    queryType: 'getWorkflowsForRequisition',
    mainParam: { 
      is_active: 1, 
      grp: 20,
      amount: maxAmount || 0,
      requisition_type: workflowParams?.requisition_type || null,
      ...workflowParams
    },
    narration: 'get workflows',
    autoLoad: false,
  });

  // ============================================
  // LOAD DATA WHEN MODAL OPENS
  // ============================================
  useEffect(() => {
    if (isOpen) {
      loadStatuses();
      loadPriorities();
      loadWorkflows();
    }
  }, [isOpen]);

  // ============================================
  // SET DEFAULT VALUES WHEN MODAL OPENS
  // ============================================
  useEffect(() => {
    if (isOpen) {
      setSelectedWorkflow(defaultValues.workflow_id ? String(defaultValues.workflow_id) : '');
      setSelectedPriority(defaultValues.priority_id ? String(defaultValues.priority_id) : '');
      setSelectedStatus(defaultValues.status_id ? String(defaultValues.status_id) : '');
      setComment(defaultValues.comment || '');
    }
  }, [isOpen, defaultValues]);

  // ============================================
  // RELOAD ALL DATA
  // ============================================
  const handleReload = useCallback(() => {
    loadStatuses();
    loadPriorities();
    loadWorkflows();
  }, [loadStatuses, loadPriorities, loadWorkflows]);

  // ============================================
  // RESET FORM ON CLOSE
  // ============================================
  const handleClose = () => {
    setSelectedWorkflow('');
    setSelectedPriority('');
    setSelectedStatus('');
    setComment('');
    onClose();
  };

  // ============================================
  // HANDLE SUBMIT
  // ============================================
  const handleSubmit = () => {
    if (!selectedWorkflow) {
      alert('Please select a workflow');
      return;
    }
    if (!selectedPriority) {
      alert('Please select a priority');
      return;
    }
    if (!selectedStatus) {
      alert('Please select a status');
      return;
    }

    onSubmit({
      workflow_id: Number(selectedWorkflow),
      priority_id: Number(selectedPriority),
      status_id: Number(selectedStatus),
      comment: comment || `Submitting ${documentType} for approval`,
    });
  };

  // ============================================
  // HELPERS
  // ============================================
  const getColor = (item: any) => {
    return item?.text_1 || '#3B82F6';
  };

  const isLoading = isStatusLoading || isPriorityLoading || isWorkflowLoading;

  if (!isOpen) return null;

  // Safely get arrays
  const safeStatusData = Array.isArray(statusData) ? statusData : [];
  const safePriorityData = Array.isArray(priorityData) ? priorityData : [];
  const safeWorkflowData = Array.isArray(workflowData) ? workflowData : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <div className="flex items-center gap-2">
            {/* Reload Button */}
            <button
              onClick={handleReload}
              disabled={isLoading}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
              title="Reload data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Info */}
        {maxAmount > 0 && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Amount:</span> {formatCurrency(maxAmount)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-400">
              {documentType} will use the selected workflow
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !safeWorkflowData.length && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-sm text-gray-500">Loading data...</span>
          </div>
        )}

        {/* Modal Body */}
        {!isLoading || safeWorkflowData.length > 0 ? (
          <div className="space-y-4">
            {/* Workflow Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Workflow <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedWorkflow}
                onChange={(e) => setSelectedWorkflow(e.target.value)}
                disabled={isSubmitting || isLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                style={{
                  borderColor: selectedWorkflow 
                    ? getColor(safeWorkflowData.find(w => String(w.id) === String(selectedWorkflow))) 
                    : undefined
                }}
              >
                <option value="">-- Select Workflow --</option>
                {safeWorkflowData.map((workflow: any) => (
                  <option 
                    key={workflow.id} 
                    value={workflow.id}
                    style={{ 
                      backgroundColor: workflow.text_1 ? workflow.text_1 : undefined,
                      color: workflow.text_1 ? '#ffffff' : undefined
                    }}
                  >
                    {workflow.name} 
                    {workflow.number_1 ? ` (Max: ${formatCurrency(workflow.number_1)})` : ''}
                  </option>
                ))}
              </select>
              {isWorkflowLoading && (
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading workflows...
                </p>
              )}
              {!isWorkflowLoading && safeWorkflowData.length === 0 && (
                <p className="text-xs text-red-500 mt-1">No workflows available</p>
              )}
            </div>

            {/* Priority Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Priority <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                disabled={isSubmitting || isLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="">-- Select Priority --</option>
                {safePriorityData.map((priority: any) => (
                  <option 
                    key={priority.id} 
                    value={priority.id}
                    style={{ 
                      backgroundColor: priority.text_1 ? priority.text_1 : undefined,
                      color: priority.text_1 ? '#ffffff' : undefined
                    }}
                  >
                    {priority.name}
                  </option>
                ))}
              </select>
              {isPriorityLoading && (
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading priorities...
                </p>
              )}
            </div>

            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Status <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                disabled={isSubmitting || isLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="">-- Select Status --</option>
                {safeStatusData.map((status: any) => (
                  <option 
                    key={status.id} 
                    value={status.id}
                    style={{ 
                      backgroundColor: status.text_1 ? status.text_1 : undefined,
                      color: status.text_1 ? '#ffffff' : undefined
                    }}
                  >
                    {status.name}
                  </option>
                ))}
              </select>
              {isStatusLoading && (
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading statuses...
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Comment
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={isSubmitting}
                placeholder="Add a comment (optional)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
              />
            </div>
          </div>
        ) : null}

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!selectedWorkflow || !selectedPriority || !selectedStatus || isSubmitting || isLoading || !safeWorkflowData.length}
            className={`
              px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all
              ${!selectedWorkflow || !selectedPriority || !selectedStatus || isSubmitting || isLoading || !safeWorkflowData.length
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                Submitting...
              </>
            ) : (
              'Submit for Approval'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalSubmitModal;