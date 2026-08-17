// src/components/requisitions/RequisitionViewWithDetails.tsx

import React, { useEffect, useState } from 'react';
import { X, ArrowLeft, Power, Loader2, CheckCircle, XCircle, Package, Eye, Send, AlertTriangle } from 'lucide-react';
import useReduxApiData from '../../../hooks/useTanstackQuery';
import { useSelector } from 'react-redux';
import ApprovalSubmitModal from '../../../components/ApprovalSubmitting';

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
  [key: string]: any;
}

interface RequisitionItem {
  id: string | number;
  category_name?: string;
  item_name?: string;
  quantity?: number;
  unit_price?: number;
  total_price?: number;
  status?: string;
  approval_status?: string;
  resolved?: boolean;
  [key: string]: any;
}
interface CommonData {
  id: string | number;
  name?: string;
  code?: string;
  text_1?: number;
  is_active?: any;
  [key: string]: any;
}

interface RequisitionViewWithDetailsProps {
  requisition: Requisition;
  statusData: CommonData;
  priorityData: CommonData;
  onClose?: () => void;
  onDeactivate?: (requisition: Requisition) => void;
  submitForApproval?: (requisition: Requisition) => void;
  onApproveItem?: (item: RequisitionItem) => void;
  onRejectItem?: (item: RequisitionItem) => void;
  onResolveFromStock?: (item: RequisitionItem) => void;
  deactivateLoading?: boolean;
  submitLoading?: boolean;
  className?: string;
  title?: string;
  showDeactivate?: boolean;
  showSubmitForApproval?: boolean;
  userId?: number;
  onSubmitForApproval?: (data: {
    id: number;
    workflow_id: number;
    status_id: number;
    priority_id: number;
    total_amount: number | Float32Array;
    comment: string;
  }) => void;
}

// ==================== HELPER: GET COLOR FROM DATA ====================
const getColorFromData = (data: any[], id: string | number | undefined, defaultColor: string = 'bg-gray-100 text-gray-800'): string => {
  if (!id || !data || !Array.isArray(data)) return defaultColor;
  
  const item = data.find((item: any) => String(item.id) === String(id));
  if (item && item.text_1) {
    // Return inline style with the color from text_1
    return item.text_1;
  }
  return defaultColor;
};

// ==================== COMPONENT ====================
const RequisitionViewWithDetails: React.FC<RequisitionViewWithDetailsProps> = ({
  requisition,
  onClose,
  onDeactivate,
  onApproveItem,
  onRejectItem,
  onResolveFromStock,
  onSubmitForApproval,
  deactivateLoading = false,
  submitLoading = false,
  className = '',
  title = 'Requisition Details',
  showDeactivate = true,
  statusData,
  priorityData,
}) => {
 
  const {user:{id:userId}} = useSelector((state: any)=>state.auth)
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [requisitionItems, setRequisitionItems] = useState<RequisitionItem[]>([]);
  const [processingItemId, setProcessingItemId] = useState<string | number | null>(null);
  
  // ============================================
  // MODAL STATE
  // ============================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fetch requisition items
  const { data: requisitionitemsData, loadQuery, isLoading } = useReduxApiData({
    table: 'requisitionitems',
    pth: 'requisitionitem',
    queryType: 'gets',
    mainParam: { requisition_id: requisition.id || 0 },
    narration: 'get requisition items',
  });

  // ============================================
  // MODAL HANDLERS
  // ============================================

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  // ============================================
  // HELPER FUNCTIONS
  // ============================================

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

  const handleSubmitForApproval = () => {
    if (!userId) {
      alert('User not logged in');
      return;
    }
    openModal();
  };

  const getCurrency = (): string => {
    const currency = requisition.currency_name || 
                    requisition.currency_code ||
                    requisition.currency || 
                    'NGN';
    return typeof currency === 'string' && currency !== 'null' && currency !== '' ? currency : 'NGN';
  };

  const getWorkflowName = (): string => {
    const workflow = requisition.approval_workflow_name || 
                    requisition.workflow_name || 
                    'N/A';
    return typeof workflow === 'string' && workflow !== 'null' && workflow !== '' ? workflow : 'N/A';
  };

  const formatCurrency = (amount: number | string | undefined, currency: string = 'NGN'): string => {
    if (amount === undefined || amount === null) return 'N/A';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return 'N/A';
    try {
      const currencyCode = currency || getCurrency() || 'NGN';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(numAmount);
    } catch (error) {
      return `${getCurrency()} ${numAmount.toLocaleString()}`;
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    if (dateString === '0000-00-00 00:00:00' || dateString === '0000-00-00') return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const formatBoolean = (value: boolean | number | undefined) => {
    if (value === undefined || value === null) return 'N/A';
    if (typeof value === 'number') {
      return value === 1 ? 'Yes' : 'No';
    }
    return value ? 'Yes' : 'No';
  };

  // ============================================
  // COLOR FUNCTIONS USING text_1 FROM COMMONS
  // ============================================
  
  /**
   * Get status color from statusData using text_1 column
   * Falls back to default gray if not found
   */
  const getStatusColorFromData = (statusId: string | number | undefined): string => {
    if (!statusId || !statusData || !Array.isArray(statusData)) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
    
    const status = statusData.find((s: any) => String(s.id) === String(statusId));
    if (status && status.text_1) {
      // text_1 contains the color code like #FFA500
      return `bg-[${status.text_1}] text-white`;
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  /**
   * Get priority color from priorityData using text_1 column
   * Falls back to default gray if not found
   */
  const getPriorityColorFromData = (priorityId: string | number | undefined): string => {
    if (!priorityId || !priorityData || !Array.isArray(priorityData)) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
    
    const priority = priorityData.find((p: any) => String(p.id) === String(priorityId));
    if (priority && priority.text_1) {
      return `bg-[${priority.text_1}] text-white`;
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  /**
   * Get item status color based on approval_status and resolved
   * Uses text_1 from statusData if available
   */
  const getItemStatusColor = (item: RequisitionItem): string => {
    if (item.resolved) {
      // Try to get color from resolved status
      const resolvedStatus = statusData?.find((s: any) => s.code?.toLowerCase() === 'resolved' || s.name?.toLowerCase() === 'resolved');
      if (resolvedStatus?.text_1) {
        return `bg-[${resolvedStatus.text_1}] text-white`;
      }
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
    
    if (item.approval_status) {
      const status = statusData?.find((s: any) => s.code?.toLowerCase() === item.approval_status?.toLowerCase());
      if (status?.text_1) {
        return `bg-[${status.text_1}] text-white`;
      }
    }
    
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const safeValue = (value: any, fallback: string = 'N/A'): string => {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value === 'string' && value.trim() === '') return fallback;
    if (typeof value === 'string' && value === 'null') return fallback;
    return String(value);
  };

  const getStatusValue = () => {
    return requisition.status_name || requisition.status || 'N/A';
  };

  const getPriorityValue = () => {
    return requisition.priority_name || requisition.priority || 'N/A';
  };

  const getRequisitionTypeValue = () => {
    return requisition.requisition_type_name || requisition.requisition_type || 'N/A';
  };

  const getItemStatusLabel = (item: RequisitionItem) => {
    if (item.resolved) return 'Resolved';
    if (item.approval_status) return item.approval_status.charAt(0).toUpperCase() + item.approval_status.slice(1);
    return 'Pending';
  };

  const canSubmitForApproval = () => {
    return requisitionitemsData?.length > 0 ;
  };

  const calculateTotals = () => {
    let totalAmount = 0;
    let totalApproved = 0;
    let totalItems = 0;

    if (requisitionItems && Array.isArray(requisitionItems)) {
      requisitionItems.forEach(item => {
        const amount = parseFloat(String(item.total_price || item.total_amount || 0));
        if (!isNaN(amount)) {
          totalAmount += amount;
          totalItems++;
          if (item.approval_status === 'approved' || item.resolved) {
            totalApproved += amount;
          }
        }
      });
    }

    return { totalAmount, totalApproved, totalItems };
  };

  const { totalAmount, totalApproved, totalItems } = calculateTotals();
  const currency = getCurrency();

  // Load requisition items
  useEffect(() => {
    if (requisition.pr_id || requisition.id) {
      loadQuery();
    }
  }, [requisition.pr_id, requisition.id]);

  // Process requisition items data
  useEffect(() => {
    if (requisitionitemsData && Array.isArray(requisitionitemsData)) {
      setRequisitionItems(requisitionitemsData);
    }  else {
      setRequisitionItems([]);
    }
  }, [requisitionitemsData]);

  // Handle approve item
  const handleApproveItem = async (item: RequisitionItem) => {
    if (!onApproveItem) return;
    setProcessingItemId(item.id);
    try {
      await onApproveItem(item);
    } catch (error) {
      console.error('Error approving item:', error);
    } finally {
      setProcessingItemId(null);
    }
  };

  // Handle reject item
  const handleRejectItem = async (item: RequisitionItem) => {
    if (!onRejectItem) return;
    if (!window.confirm(`Are you sure you want to reject item "${item.item_name || item.id}"?`)) return;
    setProcessingItemId(item.id);
    try {
      await onRejectItem(item);
    } catch (error) {
      console.error('Error rejecting item:', error);
    } finally {
      setProcessingItemId(null);
    }
  };

  // Handle resolve from stock
  const handleResolveFromStock = async (item: RequisitionItem) => {
    if (!onResolveFromStock) return;
    if (!window.confirm(`Resolve item "${item.item_name || item.id}" from stock?`)) return;
    setProcessingItemId(item.id);
    try {
      await onResolveFromStock(item);
    } catch (error) {
      console.error('Error resolving item from stock:', error);
    } finally {
      setProcessingItemId(null);
    }
  };

  // ============================================
  // DETAIL FIELDS
  // ============================================
  
  const detailFieldsLeft = [
    { key: 'pr_id', label: 'PR Number', value: safeValue(requisition.pr_id || requisition.id) },
    { key: 'title', label: 'Title', value: safeValue(requisition.title) },
    { key: 'description', label: 'Description', value: safeValue(requisition.description) },
    { 
      key: 'total_amount_record', 
      label: 'Total Amount', 
      value: formatCurrency(requisition.total_amount_record || requisition.total_amount, currency) 
    },
    { key: 'currency_name', label: 'Currency', value: safeValue(currency) },
    { key: 'total_count_number', label: 'Total Items', value: safeValue(requisition.total_count_number) },
    { 
      key: 'status', 
      label: 'Status', 
      value: safeValue(getStatusValue()), 
      isChip: true, 
      chipColor: getStatusColorFromData(requisition.status) 
    },
    { 
      key: 'priority', 
      label: 'Priority', 
      value: safeValue(getPriorityValue()), 
      isChip: true, 
      chipColor: getPriorityColorFromData(requisition.priority) 
    },
    { key: 'requisition_type', label: 'Type', value: safeValue(getRequisitionTypeValue()) },
    { key: 'is_capex', label: 'Is CAPEX?', value: safeValue(formatBoolean(requisition.is_capex)) },
  ];

  const detailFieldsRight = [
    { key: 'budget_name', label: 'Budget', value: safeValue(requisition.budget_name) },
    { key: 'requester_name', label: 'Requester', value: safeValue(requisition.requester_name) },
    { key: 'department_name', label: 'Department', value: safeValue(requisition.department_name) },
    { key: 'vendor_name', label: 'Vendor', value: safeValue(requisition.vendor_name) },
    { key: 'location_name', label: 'Location', value: safeValue(requisition.location_name) },
    { key: 'approver_name', label: 'Approver', value: safeValue(requisition.approver_name) },
    { key: 'approve_date', label: 'Approval Date', value: formatDate(requisition.approve_date) },
    { key: 'approval_workflow_name', label: 'Workflow', value: safeValue(getWorkflowName()) },
    { key: 'current_approval_level', label: 'Current Level', value: safeValue(requisition.current_approval_level) },
    { key: 'expected_delivery_date', label: 'Expected Delivery', value: formatDate(requisition.expected_delivery_date) },
    { key: 'notes', label: 'Notes', value: safeValue(requisition.notes) },
    { key: 'created_by_name', label: 'Created By', value: safeValue(requisition.created_by_name) },
    { key: 'created_at', label: 'Created Date', value: formatDate(requisition.created_at) },
    { key: 'updated_by_name', label: 'Updated By', value: safeValue(requisition.updated_by_name) },
    { key: 'updated_at', label: 'Updated Date', value: formatDate(requisition.updated_at) },
  ];

  const isDeactivatingNow = deactivateLoading || isDeactivating;
  const displayId = requisition.pr_id || requisition.id;

  // ============================================
  // RENDER ITEMS TABLE
  // ============================================
  const renderItemsTable = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Loading items...</span>
        </div>
      );
    }

    if (requisitionItems.length === 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <span className="text-sm text-gray-500">No items found for this requisition</span>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">S/N</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unit Price</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
            {requisitionItems.map((item, index) => {
              const isProcessing = processingItemId === item.id;
              const isResolved = item.resolved === true || item.resolved === 1 || item.resolved === '1';
              const isApproved = item.approval_status === 'approved';
              const isRejected = item.approval_status === 'rejected';

              return (
                <tr key={item.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">{index + 1}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-gray-100">{safeValue(item.category_name)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-gray-100">{safeValue(item.item_name)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-right text-gray-900 dark:text-gray-100">{item.quantity || 0}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-right text-gray-900 dark:text-gray-100">{formatCurrency(item.unit_price, currency)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-right font-medium text-gray-900 dark:text-gray-100">{formatCurrency(item.total_price, currency)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getItemStatusColor(item)}`}>
                      {getItemStatusLabel(item)}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      {!isResolved && !isApproved && !isRejected && (
                        <button
                          onClick={() => handleApproveItem(item)}
                          disabled={isProcessing}
                          className={`p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title="Approve Item"
                        >
                          {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      {!isResolved && !isApproved && !isRejected && (
                        <button
                          onClick={() => handleRejectItem(item)}
                          disabled={isProcessing}
                          className={`p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title="Reject Item"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {!isResolved && isApproved && (
                        <button
                          onClick={() => handleResolveFromStock(item)}
                          disabled={isProcessing}
                          className={`p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title="Resolve from Stock"
                        >
                          {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Package className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors" title="View Item Details">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // ============================================
  // MODAL COMPONENT
  // ============================================
   const handleModalSubmit = (data: {
    workflow_id: number;
    status_id: number;
    priority_id: number;
    comment: string;
  }) => {
    if (onSubmitForApproval) {
      onSubmitForApproval({
        id: Number(requisition.id),
        workflow_id: data.workflow_id,
        status_id: data.status_id,
        priority_id: data.priority_id,
        total_amount: requisition?.total_amount_record || 0,
        comment: data.comment,
      });
    }
    closeModal();
  };

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <>
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

        {/* Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {detailFieldsLeft.map((field, index) => (
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

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {detailFieldsRight.map((field, index) => (
                  field.value !== undefined && field.value !== null && field.value !== '' && field.value !== 'N/A' && (
                    <tr key={field.key} className={`
                      ${index % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'}
                      hover:bg-gray-100/70 dark:hover:bg-gray-700/50 transition-colors
                    `}>
                      <td className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap w-1/3">
                        {field.label}
                      </td>
                      <td className="px-3 py-1.5 text-xs text-gray-900 dark:text-gray-100 w-2/3">
                        <span className="break-words">{field.value}</span>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Requisition Items Section */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50/50 dark:bg-gray-800/50">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Requisition Items
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {requisitionItems.length} item{requisitionItems.length !== 1 ? 's' : ''}
            </span>
          </div>
          {renderItemsTable()}
        </div>

        {/* Summary Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-gray-700">
            <div className="px-4 py-2 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Amount</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalAmount, currency)}
              </p>
            </div>
            <div className="px-4 py-2 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Approved</p>
              <p className="text-sm font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totalApproved, currency)}
              </p>
            </div>
            <div className="px-4 py-2 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Items</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {totalItems}
              </p>
            </div>
          </div>
        </div>

        {/* Footer with actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-lg">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Created: {formatDate(requisition.created_at)}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            
              <button
                onClick={handleSubmitForApproval || requisition.is_active == 0}
                disabled={submitLoading || isLoading || !canSubmitForApproval()}
                className={`
                  inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg
                  transition-all duration-200
                  ${submitLoading || isLoading || !canSubmitForApproval() || requisition.is_active == 1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg dark:bg-blue-600 dark:hover:bg-blue-700'
                  }
                  shadow-md hover:shadow-lg transform hover:scale-[1.02]
                `}
              >
                {submitLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                      Submit For Approval
                    <AlertTriangle className="w-4 h-4 text-yellow-300" />
                  </>
                )}
              </button>
            

            {onClose && (
              <button
                onClick={onClose}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors duration-200 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                <X className="w-3.5 h-3.5" />
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      <ApprovalSubmitModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        isSubmitting={submitLoading}
        title="Submit Requisition for Approval"
        documentType="Requisition"
        maxAmount={requisition?.total_amount_record || requisition?.total_amount || 0}
        formatCurrency={(amount) => formatCurrency(amount, getCurrency())}
        workflowParams={{
          requisition_type: requisition?.requisition_type,
          amount: requisition?.total_amount_record || requisition?.total_amount || 0,
        }}
        defaultValues={{
          workflow_id: requisition?.approval_workflow_id || '',
          priority_id: requisition?.priority || '',
          status_id: requisition?.status || '',
          comment: '',
        }}
      />
    </>
  );
};

export default RequisitionViewWithDetails;