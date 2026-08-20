// src/components/common/DisplayPageChild.tsx

import React, { useEffect, useState } from 'react';
import { X, ArrowLeft, Power, Loader2, Send, AlertTriangle } from 'lucide-react';
import useReduxApiData from '../../../hooks/useTanstackQuery';
import { useSelector } from 'react-redux';
import ApprovalSubmitModal from '../../../components/ApprovalSubmitting';
import ItemsTable from './ItemsTable';
import DetailFields from '../../../components/DataFields';
import { DetailField } from '../../../components/DetailFieldsTables';
import UploadReceiptModal from '../../../components/UploadReceiptModal';
import ViewAttachmentsModal from '../../../components/ViewAttachementsDocuments';
import MiniCashTransfers from './MiniTransfer';

// ==================== TYPES ====================
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
  order_date?: string;
  delivery_date?: string;
  payment_terms?: string;
  shipping_address?: string;
  grand_total?: number;
  tax_amount?: number;
  shipping_cost?: number;
  approved_by_name?: string;
  approved_at?: string;
  [key: string]: any;
}

export interface DocumentItem {
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
  doc_path?: string;
  doc_name?: string;
  has_attachments?: boolean;
  [key: string]: any;
}

export interface Attachment {
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

export interface CommonData {
  id: string | number;
  name?: string;
  code?: string;
  text_1?: string;
  is_active?: any;
  [key: string]: any;
}

export interface DisplayPageChildProps {
  document: DocumentData;
  statusData?: CommonData[];
  priorityData?: CommonData[];
  onClose?: () => void;
  onDeactivate?: (document: DocumentData) => void;
  onApproveItem?: (item: DocumentItem) => void;
  onRejectItem?: (item: DocumentItem) => void;
  onResolveFromStock?: (item: DocumentItem) => void;
  onRemoveItem?: (item: DocumentItem) => void;
  onViewItemDetails?: (item: DocumentItem) => void;
  onFetchAttachments?: (itemId: string | number) => Promise<Attachment[]>;
  onDownloadAttachment?: (attachment: Attachment) => void;
  onDeleteAttachment?: (attachment: Attachment) => Promise<void>;
  onUploadReceipt?: (itemId: string | number, file: File, description: string) => Promise<void>;
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
  documentType?: string;
  documentTypeId?: number;
  documentNumberPrefix?: string;
  fetchItemsParam?: { [key: string]: any };
  itemsTableName?: string;
  itemsTablePath?: string;
  leftFields?: DetailField[];
  rightFields?: DetailField[];
}

// ==================== COMPONENT ====================
const DisplayPageChild: React.FC<DisplayPageChildProps> = ({
  document,
  onClose,
  onDeactivate,
  onApproveItem,
  onRejectItem,
  onResolveFromStock,
  onRemoveItem,
  onViewItemDetails,
  onFetchAttachments,
  onDownloadAttachment,
  onDeleteAttachment,
  onUploadReceipt,
  deactivateLoading = false,
  submitLoading = false,
  className = '',
  title = 'Document Details',
  showDeactivate = true,
  showSubmitForApproval = true,
  canDeleteAttachments = false,
  documentType = 'Document',
  documentTypeId = 1,
  documentNumberPrefix = 'DOC',
  fetchItemsParam = {},
  itemsTableName = 'documentitems',
  itemsTablePath = 'documentitem',
  leftFields,
  rightFields,
  onSubmitForApproval
}) => {
  const { user: { id: userId } } = useSelector((state: any) => state.auth);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [documentItems, setDocumentItems] = useState<DocumentItem[]>([]);
  const [processingItemId, setProcessingItemId] = useState<string | number | null>(null);

  // ============================================
  // MODAL STATES
  // ============================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewAttachmentsOpen, setViewAttachmentsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DocumentItem | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);

  // ============================================
  // DATA FETCHING
  // ============================================
   const documentId = document?.id || 0;
   let mainParam:any = {};
   if(documentTypeId == 2){
     mainParam.purchaseorder_id = document.id || 0;
   }
   else if(documentTypeId == 8){
     mainParam.sku_id = document.id || 0;
   }
   else{
    mainParam.requisition_id = document.id || 0;
   }

  const { data: documentItemsData, loadQuery, isLoading, loadUpdate } = useReduxApiData({
    table: 'requisitionitems',
    uniqueKey: itemsTableName,
    queryType: 'gets',
    mainParam: mainParam,
    narration: `get ${documentType} items`,
  });

  const { data: budgetCategories, loadQuery:loadBudgetCategory } = useReduxApiData({
    table: 'requisitionitems',
    uniqueKey: "budgetcategory",
    queryType: 'getBudgetCategorySummary',
    mainParam: {budget_id: document.budget_id || 0},
    narration: `get ${documentType} items`,
  });

  const { data: budgetCategoryItems, loadQuery:loadBudgetCategoryItem } = useReduxApiData({
    table: 'requisitionitems',
    uniqueKey: "budgetitems",
    queryType: 'getBudgetCategoryItemSummary',
    mainParam: {budget_id: document.budget_id || 0},
    narration: `get ${documentType} items`,
  });

  const { data: statusData, loadQuery: loadStatus } = useReduxApiData({
    table: "commons",
    uniqueKey: "status",
    queryType: 'gets',
    mainParam: { grp: 13 },
    narration: 'get Status items',
  });

  const { data: priorityData, loadQuery: loadPriority } = useReduxApiData({
    table: "commons",
    uniqueKey: "priority",
    queryType: 'gets',
    mainParam: { grp: 14 },
    narration: 'get Priority items',
  });



  // ============================================
  // MODAL HANDLERS
  // ============================================
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleModalSubmit = (data: {
    workflow_id: number;
    priority_id: number;
    status_id: number;
    comment: string;
  }) => {
   
      onSubmitForApproval({
        id: Number(document.id),
        workflow_id: data.workflow_id,
        status_id: data.status_id,
        priority_id: data.priority_id,
        comment: data.comment || 'Submitting for approval',
        document_type_id: documentTypeId
      });
      closeModal();
  };

  // ============================================
  // UPLOAD & ATTACHMENT HANDLERS
  // ============================================
  const handleUploadItem = (item: DocumentItem) => {
    setSelectedItem(item);
    setUploadModalOpen(true);
  };

  const handleViewAttachments = async (item: DocumentItem) => {
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
      if (onUploadReceipt) {
        await onUploadReceipt(selectedItem.id, file, description);
      } else {
        // Default: use loadUpdate to upload
        let rw: any = {};
        rw.id = selectedItem.id;
        rw.file = file;
        rw.description = description;
        rw.cat = 'upload';
        rw.column = 'doc_path';
        await loadUpdate(rw);
      }
      
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
      window.open(attachment.file_path, '_blank');
    }
  };

  const handleDeleteAttachment = async (attachment: Attachment) => {
    if (!selectedItem) return;
    try {
      if (onDeleteAttachment) {
        await onDeleteAttachment(attachment);
      }
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
    const displayId = document.document_number || document.id;
    if (window.confirm(`Are you sure you want to deactivate ${documentType} #${displayId}?`)) {
      setIsDeactivating(true);
      try {
        await onDeactivate(document);
      } catch (error) {
        console.error(`Error deactivating ${documentType}:`, error);
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
    const currency = document.currency_name || 
                    document.currency_code ||
                    document.currency || 
                    'NGN';
    return typeof currency === 'string' && currency !== 'null' && currency !== '' ? currency : 'NGN';
  };

  const getWorkflowName = (): string => {
    const workflow = document.approval_workflow_name || 
                    document.workflow_name || 
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

  const getPriorityColorFromData = (priorityId: string | number | undefined): string => {
    if (!priorityId || !priorityData || !Array.isArray(priorityData)) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
    const priority = priorityData.find((p: any) => String(p.id) === String(priorityId));
    if (priority && priority.text_1) {
      return priority.text_1;
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getItemStatusColor = (item: DocumentItem): string => {
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

  const safeValue = (value: any, fallback: string = 'N/A'): string => {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value === 'string' && value.trim() === '') return fallback;
    if (typeof value === 'string' && value === 'null') return fallback;
    return String(value);
  };

  const getStatusValue = () => {
    return document.status_name || document.status || 'N/A';
  };

  const getPriorityValue = () => {
    return document.priority_name || document.priority || 'N/A';
  };

  const getDocumentTypeValue = () => {
    return document.document_type_name || document.document_type || documentType;
  };

  const getItemStatusLabel = (item: DocumentItem) => {
    if (item.resolved) return 'Resolved';
    if (item.approval_status) return item.approval_status.charAt(0).toUpperCase() + item.approval_status.slice(1);
    return 'Pending';
  };

  const canSubmitForApproval = () => {
    return documentItems?.length > 0;
  };

  const calculateTotals = () => {
    let totalAmount = 0;
    let totalApproved = 0;
    let totalItems = 0;

    if (documentItems && Array.isArray(documentItems)) {
      documentItems.forEach(item => {
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

  // ============================================
  // LOAD DATA
  // ============================================
  useEffect(() => {
    if (document.id) {
      loadQuery();
      loadStatus();
      loadPriority();
      loadBudgetCategory()
      loadBudgetCategoryItem()
    }
  }, [document.id]);

  useEffect(() => {
    if (documentItemsData && Array.isArray(documentItemsData)) {
      setDocumentItems(documentItemsData);
    } else {
      setDocumentItems([]);
    }
  }, [documentItemsData]);

  // Handle approve item
  const handleApproveItem = async (item: DocumentItem) => {
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
  const handleRejectItem = async (item: DocumentItem) => {
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
  const handleResolveFromStock = async (item: DocumentItem) => {
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

  const isDeactivatingNow = deactivateLoading || isDeactivating;
  const displayId = document.document_number || document.id;

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

        {/* Details Section - Using DetailFields Child Component */}
        <DetailFields
          document={document}
          statusData={statusData || []}
          priorityData={priorityData || []}
          documentType={documentType}
          documentTypeId={documentTypeId}
          currency={currency}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          formatBoolean={formatBoolean}
          safeValue={safeValue}
          getStatusValue={getStatusValue}
          getPriorityValue={getPriorityValue}
          getDocumentTypeValue={getDocumentTypeValue}
          getStatusColorFromData={getStatusColorFromData}
          getPriorityColorFromData={getPriorityColorFromData}
          getWorkflowName={getWorkflowName}
          leftFields={leftFields}
          rightFields={rightFields}
        />


{documentTypeId === 6 ? (
  <MiniCashTransfers
    items={documentItems}
    isLoading={isLoading}
    currency={currency}
    statusData={statusData || []}
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
    title={`${documentType} Items`}
    emptyMessage={`No items found for this ${documentType.toLowerCase()}`}
    documentId={documentId}
    documentTypeId={documentTypeId}
  />
) : (
  <ItemsTable
    items={documentItems}
    isLoading={isLoading}
    currency={currency}
    statusData={statusData || []}
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
    budgetCategories={budgetCategories}
    budgetCategoryItems={budgetCategoryItems}
    showBudgetInfo ={true}
    processingItemId={processingItemId}
    title={`${documentType} Items`}
    documentTypeId={documentTypeId}
    emptyMessage={`No items found for this ${documentType.toLowerCase()}`}
  />
)}

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
            Created: {formatDate(document.created_at)}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {userId && document.is_active !== 1 && (
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
        title={`Submit ${documentType} for Approval`}
        documentType={documentType}
        maxAmount={document?.grand_total || document?.total_amount_record || document?.total_amount || 0}
        formatCurrency={(amount) => formatCurrency(amount, getCurrency())}
        workflowParams={{
          document_type: documentTypeId,
          amount: document?.grand_total || document?.total_amount_record || document?.total_amount || 0,
        }}
        defaultValues={{
          workflow_id: document?.approval_workflow_id || '',
          priority_id: document?.priority || '',
          status_id: document?.status_id || document?.status || '',
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
        purchaseOrderId={document.id}
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

export default DisplayPageChild;