// src/components/purchase_orders/PurchaseOrderViewWithDetails.tsx

import React, { useEffect, useState } from 'react';
import { X, ArrowLeft, Power, Loader2, Send, AlertTriangle } from 'lucide-react';
import useReduxApiData from '../../../hooks/useTanstackQuery';
import { useSelector } from 'react-redux';
import PurchaseOrderItemsTable from './PurchaseOrderItemsTable';
import UploadReceiptModal from './../../../components/UploadReceiptModal';
import ViewAttachmentsModal from './../../../components/ViewAttachementsDocuments';
import ApprovalSubmitModal from '../../../components/ApprovalSubmitting';

// ==================== TYPES ====================
interface PurchaseOrder {
  id: string | number;
  po_num?: string;
  po_number?: string;
  title?: string;
  description?: string;
  budget_id?: string | number;
  budget_name?: string;
  requester_id?: string | number;
  requester_name?: string;
  vendor_id?: string | number;
  vendor_name?: string;
  vendor_code?: string;
  location_id?: string | number;
  location_name?: string;
  order_date?: string;
  delivery_date?: string;
  total_amount?: number;
  tax_amount?: number;
  shipping_cost?: number;
  grand_total?: number;
  currency_id?: string;
  currency_code?: string;
  payment_terms?: string;
  shipping_address?: string;
  status_id?: string | number;
  status_name?: string;
  created_by?: string | number;
  created_by_name?: string;
  updated_by?: string | number;
  updated_by_name?: string;
  approved_by?: string | number;
  approved_by_name?: string;
  approved_at?: string;
  created_at?: string;
  updated_at?: string;
  total_items?: number;
  total_amount_record?: number;
  is_active?: boolean | number;
  location_code?: string;
  approval_workflow_id?: string | number;
  priority?: string | number;
  status?: string | number;
  requisition_type?: number;
  [key: string]: any;
}

interface PurchaseOrderItem {
  id: string | number;
  category_name?: string;
  item_name?: string;
  quantity?: number;
  unit_price?: number;
  total_price?: number;
  approval_status?: string;
  resolved?: boolean | number;
  is_active?: boolean | number;
  description?: string;
  sku?: string;
  unit?: string;
  discount?: number;
  tax_amount?: number;
  created_at?: string;
  updated_at?: string;
  has_attachments?: boolean;
  [key: string]: any;
}

interface Attachment {
  id: string | number;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  description?: string;
  uploaded_by?: string;
  uploaded_by_name?: string;
  uploaded_at?: string;
  created_at?: string;
}

interface CommonData {
  id: string | number;
  name?: string;
  code?: string;
  text_1?: string;
  is_active?: any;
  [key: string]: any;
}

interface PurchaseOrderViewWithDetailsProps {
  purchaseOrder: PurchaseOrder;
  statusData: CommonData[];
  priorityData: CommonData[];
  onClose?: () => void;
  onDeactivate?: (purchaseOrder: PurchaseOrder) => void;
  onApproveItem?: (item: PurchaseOrderItem) => void;
  onRejectItem?: (item: PurchaseOrderItem) => void;
  onResolveFromStock?: (item: PurchaseOrderItem) => void;
  onRemoveItem?: (item: PurchaseOrderItem) => void;
  onViewItemDetails?: (item: PurchaseOrderItem) => void;
  onFetchAttachments?: (itemId: string | number) => Promise<Attachment[]>;
  onDownloadAttachment?: (attachment: Attachment) => void;
  onDeleteAttachment?: (attachment: Attachment) => Promise<void>;
  deactivateLoading?: boolean;
  submitLoading?: boolean;
  className?: string;
  title?: string;
  showDeactivate?: boolean;
  showSubmitForApproval?: boolean;
  canDeleteAttachments?: boolean;
  onSubmitForApproval?: (data: {
    id: number;
    workflow_id: number;
    status_id: number;
    priority_id: number;
    comment: string;
    document_type_id: number;
  }) => void;
  onUploadReceipt?: (
    itemId: string | number, 
    file: File, 
    description: string
  ) => Promise<void>;
}

// ==================== COMPONENT ====================
const PurchaseOrderViewWithDetails: React.FC<PurchaseOrderViewWithDetailsProps> = ({
  purchaseOrder,
  onClose,
  onDeactivate,
  onApproveItem,
  onRejectItem,
  onResolveFromStock,
  onRemoveItem,
  onViewItemDetails,
  onUploadReceipt,
  onFetchAttachments,
  onDownloadAttachment,
  onDeleteAttachment,
  deactivateLoading = false,
  submitLoading = false,
  className = '',
  title = 'Purchase Order Details',
  showDeactivate = true,
  showSubmitForApproval = true,
  canDeleteAttachments = false,
  statusData,
  priorityData,
  onSubmitForApproval,
}) => {
  const { user: { id: userId } } = useSelector((state: any) => state.auth);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [purchaseOrderItems, setPurchaseOrderItems] = useState<PurchaseOrderItem[]>([]);
  const [processingItemId, setProcessingItemId] = useState<string | number | null>(null);
  const [currency, setcurrency] = useState<string | number | null>(null);

  // ============================================
  // MODAL STATES
  // ============================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewAttachmentsOpen, setViewAttachmentsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PurchaseOrderItem | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);

  // ============================================
  // DATA FETCHING
  // ============================================
  const { data: purchaseOrderItemsData, loadQuery, isLoading, loadUpdate } = useReduxApiData({
    table: 'requisitionitems',
    pth: 'requisitionitem',
    queryType: 'gets',
    mainParam: { purchaseorder_id: purchaseOrder.id || 0 },
    narration: 'get purchase order items',
  });

  const {
    data: workflowData,
    loadQuery: loadworkflowData,
    isLoading: isworkflowDataLoading
  } = useReduxApiData({
    table: "commons",
    uniqueKey: 'workflow',
    queryType: 'getWorkflowsForRequisition',
    mainParam: {
      is_active: 1,
      grp: 20,
      amount: purchaseOrder?.grand_total || purchaseOrder?.total_amount || 0,
      requisition_type: 2
    },
    narration: 'get all workflows data'
  });

  // ============================================
  // MODAL HANDLERS
  // ============================================
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleModalSubmit = (data: {
    workflow_id: number;
    priority_id: number;
    status_id: number;
    comment: string;
  }) => {
    if (onSubmitForApproval) {
      onSubmitForApproval({
        id: Number(purchaseOrder.id),
        workflow_id: data.workflow_id,
        status_id: data.status_id,
        priority_id: data.priority_id,
        comment: data.comment || 'Submitting for approval',
        document_type_id: 2
      });
      closeModal();
    }
  };

  // ============================================
  // UPLOAD & ATTACHMENT HANDLERS
  // ============================================
  const handleUploadItem = (item: PurchaseOrderItem) => {
    setSelectedItem(item);
    setUploadModalOpen(true);
  };

  const handleViewAttachments = async (item: PurchaseOrderItem) => {
    setSelectedItem(item);
    setViewAttachmentsOpen(true);
    setIsLoadingAttachments(true);
    try {
      if (onFetchAttachments) {
        const data = await onFetchAttachments(item.id);
        setAttachments(data);
      } else {
        // Mock data for testing
        setAttachments([
          {
            id: 1,
            file_name: 'receipt_001.pdf',
            file_path: '/uploads/receipt_001.pdf',
            file_size: 1024000,
            file_type: 'application/pdf',
            description: 'Original receipt',
            uploaded_by_name: 'John Doe',
            uploaded_at: new Date().toISOString(),
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching attachments:', error);
      setAttachments([]);
    } finally {
      setIsLoadingAttachments(false);
    }
  };

  const handleUploadReceipt = async (file: File, description: string) => {
    if (!selectedItem) return;
    setIsUploading(true);
    try {
  
         let rw:any = {}
         rw.id = selectedItem.id;
         rw.file = file;
         rw.description = description;
         rw.cat = 'upload';
         rw.column = 'doc_path';
         await loadUpdate(rw);
         //await onUploadReceipt(selectedItem.id, file, description);
      
      // Close modal and refresh attachments
      setUploadModalOpen(false);
      // Refresh attachments list
      await handleViewAttachments(selectedItem);
    } catch (error) {
      console.error('Error uploading receipt:', error);
      alert('Failed to upload receipt. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadAttachment = (attachment: Attachment) => {
    if (onDownloadAttachment) {
      onDownloadAttachment(attachment);
    } else {
      // Default: open in new tab
      window.open(attachment.file_path, '_blank');
    }
  };

  const handleDeleteAttachment = async (attachment: Attachment) => {
    if (!selectedItem) return;
    try {
      if (onDeleteAttachment) {
        await onDeleteAttachment(attachment);
      }
      // Refresh attachments list
      await handleViewAttachments(selectedItem);
    } catch (error) {
      console.error('Error deleting attachment:', error);
      alert('Failed to delete attachment. Please try again.');
    }
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  const handleDeactivate = async () => {
    if (!onDeactivate) return;
    const displayId = purchaseOrder.po_num || purchaseOrder.po_number || purchaseOrder.id;
    if (window.confirm(`Are you sure you want to deactivate purchase order #${displayId}?`)) {
      setIsDeactivating(true);
      try {
        await onDeactivate(purchaseOrder);
      } catch (error) {
        console.error('Error deactivating purchase order:', error);
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
    const currency = purchaseOrder.currency_code ||
      purchaseOrder.currency_name ||
      purchaseOrder.currency_id ||
      'USD';
    return typeof currency === 'string' && currency !== 'null' && currency !== '' ? currency : 'USD';
  };

  const formatCurrency = (amount: number | string | undefined, currency: string = 'USD'): string => {
    if (amount === undefined || amount === null) return 'N/A';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return 'N/A';
    try {
      const currencyCode = currency || getCurrency() || 'USD';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numAmount);
    } catch (error) {
      return `${getCurrency()} ${numAmount.toFixed(2)}`;
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
  // COLOR FUNCTIONS
  // ============================================
  const getStatusColorFromData = (statusId: string | number | undefined): string => {
    if (!statusId || !statusData || !Array.isArray(statusData)) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
    const status = statusData.find((s: any) => String(s.id) === String(statusId));
    if (status && status.text_1) {
      return status.text_1;
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getItemStatusColor = (item: PurchaseOrderItem): string => {
    if (item.resolved) {
      const resolvedStatus = statusData?.find((s: any) =>
        s.code?.toLowerCase() === 'resolved' || s.name?.toLowerCase() === 'resolved'
      );
      if (resolvedStatus?.text_1) {
        return resolvedStatus.text_1;
      }
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
    if (item.approval_status) {
      const status = statusData?.find((s: any) =>
        s.code?.toLowerCase() === item.approval_status?.toLowerCase()
      );
      if (status?.text_1) {
        return status.text_1;
      }
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getItemStatusLabel = (item: PurchaseOrderItem) => {
    if (item.resolved) return 'Resolved';
    if (item.approval_status) return item.approval_status.charAt(0).toUpperCase() + item.approval_status.slice(1);
    return 'Pending';
  };

  const canSubmitForApproval = () => {
    return purchaseOrderItems?.length > 0;
  };

  const safeValue = (value: any, fallback: string = 'N/A'): string => {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value === 'string' && value.trim() === '') return fallback;
    if (typeof value === 'string' && value === 'null') return fallback;
    return String(value);
  };

  const getStatusValue = () => {
    return purchaseOrder.status_name || purchaseOrder.status_id || 'N/A';
  };

  // ============================================
  // ITEM ACTION HANDLERS
  // ============================================
  const handleApproveItem = async (item: PurchaseOrderItem) => {
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

  const handleRejectItem = async (item: PurchaseOrderItem) => {
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

  const handleResolveFromStock = async (item: PurchaseOrderItem) => {
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
    { key: 'po_num', label: 'PO Number', value: safeValue(purchaseOrder.po_num || purchaseOrder.po_number || purchaseOrder.id) },
    { key: 'title', label: 'Title', value: safeValue(purchaseOrder.title) },
    { key: 'description', label: 'Description', value: safeValue(purchaseOrder.description) },
    { key: 'budget_name', label: 'Budget', value: safeValue(purchaseOrder.budget_name) },
    { key: 'requester_name', label: 'Requester', value: safeValue(purchaseOrder.requester_name) },
    { key: 'vendor_name', label: 'Vendor', value: safeValue(purchaseOrder.vendor_name) },
    { key: 'vendor_code', label: 'Vendor Code', value: safeValue(purchaseOrder.vendor_code) },
    { key: 'location_name', label: 'Location', value: safeValue(purchaseOrder.location_name) },
    { key: 'order_date', label: 'Order Date', value: formatDate(purchaseOrder.order_date) },
    { key: 'delivery_date', label: 'Delivery Date', value: formatDate(purchaseOrder.delivery_date) },
    { key: 'payment_terms', label: 'Payment Terms', value: safeValue(purchaseOrder.payment_terms) },
    {
      key: 'status',
      label: 'Status',
      value: safeValue(getStatusValue()),
      isChip: true,
      chipColor: getStatusColorFromData(purchaseOrder.status_id)
    },
    { key: 'is_active', label: 'Is Active?', value: safeValue(formatBoolean(purchaseOrder.is_active)) },
  ];

  const detailFieldsRight = [
    {
      key: 'total_amount',
      label: 'Subtotal',
      value: formatCurrency(purchaseOrder.total_amount, currency)
    },
    {
      key: 'tax_amount',
      label: 'Tax',
      value: formatCurrency(purchaseOrder.tax_amount, currency)
    },
    {
      key: 'shipping_cost',
      label: 'Shipping',
      value: formatCurrency(purchaseOrder.shipping_cost, currency)
    },
    {
      key: 'grand_total',
      label: 'Grand Total',
      value: formatCurrency(purchaseOrder.grand_total, currency)
    },
    { key: 'currency_code', label: 'Currency', value: safeValue(currency) },
    { key: 'total_items', label: 'Total Items', value: safeValue(purchaseOrder.total_items) },
    { key: 'shipping_address', label: 'Shipping Address', value: safeValue(purchaseOrder.shipping_address) },
    { key: 'created_by_name', label: 'Created By', value: safeValue(purchaseOrder.created_by_name) },
    { key: 'created_at', label: 'Created Date', value: formatDate(purchaseOrder.created_at) },
    { key: 'updated_by_name', label: 'Updated By', value: safeValue(purchaseOrder.updated_by_name) },
    { key: 'updated_at', label: 'Updated Date', value: formatDate(purchaseOrder.updated_at) },
    { key: 'approved_by_name', label: 'Approved By', value: safeValue(purchaseOrder.approved_by_name) },
    { key: 'approved_at', label: 'Approved Date', value: formatDate(purchaseOrder.approved_at) },
  ];

  const isDeactivatingNow = deactivateLoading || isDeactivating;

  // ============================================
  // GENERATE PO NUMBER
  // ============================================
  const getPODisplayNumber = (): string => {
    if (purchaseOrder.po_num) return purchaseOrder.po_num;
    if (purchaseOrder.po_number) return purchaseOrder.po_number;
    const locationCode = purchaseOrder.location_code || purchaseOrder.location_id || '00';
    const id = purchaseOrder.id || '000';
    return `PO--${locationCode}-${id}`;
  };

  const displayId = getPODisplayNumber();

  // ============================================
  // LOAD DATA
  // ============================================
  useEffect(() => {
    if (purchaseOrder.id) {
      loadQuery();
      loadworkflowData();
    }
  }, [purchaseOrder.id]);

  useEffect(() => {
    if (purchaseOrderItemsData && Array.isArray(purchaseOrderItemsData)) {
      setPurchaseOrderItems(purchaseOrderItemsData);
    } else if (purchaseOrderItemsData && typeof purchaseOrderItemsData === 'object') {
      const items = purchaseOrderItemsData.items || purchaseOrderItemsData.data || [];
      setPurchaseOrderItems(Array.isArray(items) ? items : []);
    } else {
      setPurchaseOrderItems([]);
    }
  }, [purchaseOrderItemsData]);


// In PurchaseOrderViewWithDetails.tsx



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

        {/* Purchase Order Items Section */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50/50 dark:bg-gray-800/50">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Purchase Order Items
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {purchaseOrderItems.length} item{purchaseOrderItems.length !== 1 ? 's' : ''}
            </span>
          </div>

          <PurchaseOrderItemsTable
            items={purchaseOrderItems}
            isLoading={isLoading}
            currency={currency}
            statusData={statusData}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getItemStatusLabel={getItemStatusLabel}
            getItemStatusColor={getItemStatusColor}
            onApproveItem={onApproveItem ? handleApproveItem : undefined}
            onRejectItem={onRejectItem ? handleRejectItem : undefined}
            onResolveFromStock={onResolveFromStock ? handleResolveFromStock : undefined}
            onUploadItem={handleUploadItem}
            onRemoveItem={onRemoveItem}
            onViewItemDetails={onViewItemDetails}
            onViewAttachments={handleViewAttachments}
            processingItemId={processingItemId}
          />
        </div>

        {/* Summary Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-gray-700">
            <div className="px-4 py-2 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Subtotal</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {formatCurrency(purchaseOrder.total_amount, currency)}
              </p>
            </div>
            <div className="px-4 py-2 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Tax + Shipping</p>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency((purchaseOrder.tax_amount || 0) + (purchaseOrder.shipping_cost || 0), currency)}
              </p>
            </div>
            <div className="px-4 py-2 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Grand Total</p>
              <p className="text-sm font-bold text-green-600 dark:text-green-400">
                {formatCurrency(purchaseOrder.grand_total, currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer with actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-lg">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Created: {formatDate(purchaseOrder.created_at)}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {showSubmitForApproval && userId && (
              <button
                onClick={handleSubmitForApproval}
                disabled={submitLoading || isLoading || !canSubmitForApproval()}
                className={`
                  inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg
                  transition-all duration-200
                  ${submitLoading || isLoading || !canSubmitForApproval()
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
            )}

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

      {/* Approval Submit Modal */}
      <ApprovalSubmitModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        isSubmitting={submitLoading}
        title="Submit Purchase Order for Approval"
        documentType="Purchase Order"
        maxAmount={purchaseOrder?.grand_total || purchaseOrder?.total_amount || 0}
        formatCurrency={(amount) => formatCurrency(amount, getCurrency())}
        workflowParams={{
          requisition_type: 2,
          amount: purchaseOrder?.grand_total || purchaseOrder?.total_amount || 0,
        }}
        defaultValues={{
          workflow_id: purchaseOrder?.approval_workflow_id || '',
          priority_id: purchaseOrder?.priority || '',
          status_id: purchaseOrder?.status_id || '',
          comment: '',
        }}
      />

      {/* Upload Receipt Modal */}
      <UploadReceiptModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUploadReceipt}
        isUploading={isUploading}
        itemName={selectedItem?.item_name || ''}
        itemId={selectedItem?.id || ''}
        purchaseOrderId={purchaseOrder.id}
      />

      {/* View Attachments Modal */}
      <ViewAttachmentsModal
        isOpen={viewAttachmentsOpen}
        onClose={() => {
          setViewAttachmentsOpen(false);
          setAttachments([]);
        }}
        attachments={attachments}
        isLoading={isLoadingAttachments}
        itemName={selectedItem?.item_name || ''}
        itemId={selectedItem?.id || ''}
        onDownload={handleDownloadAttachment}
        onDelete={handleDeleteAttachment}
        canDelete={canDeleteAttachments}
      />
    </>
  );
};

export default PurchaseOrderViewWithDetails;