// src/components/purchase_orders/PurchaseOrderItemsTable.tsx

import React, { useState } from 'react';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Package, 
  Eye, 
  Upload, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Link2Icon,
  FileText,
  Image,
  File,
  Download,
  AlertCircle
} from 'lucide-react';
import { SERVER_URL } from '../../../actions/common';

interface PurchaseOrderItem {
  id: string | number;
  category_name?: string;
  item_name?: string;
  quantity?: number;
  unit_price?: number;
  total_price?: number;
  approval_status?: string;
  resolved?: any;
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
  [key: string]: any;
}

interface PurchaseOrderItemsTableProps {
  items: PurchaseOrderItem[];
  isLoading: boolean;
  currency: string;
  statusData: any[];
  formatCurrency: (amount: number | string | undefined, currency: string) => string;
  formatDate?: (dateString: string | undefined) => string;
  getItemStatusLabel: (item: PurchaseOrderItem) => string;
  getItemStatusColor: (item: PurchaseOrderItem) => string;
  onApproveItem?: (item: PurchaseOrderItem) => void;
  onRejectItem?: (item: PurchaseOrderItem) => void;
  onResolveFromStock?: (item: PurchaseOrderItem) => void;
  onUploadItem?: (item: PurchaseOrderItem) => void;
  onRemoveItem?: (item: PurchaseOrderItem) => void;
  onViewItemDetails?: (item: PurchaseOrderItem) => void;
  processingItemId?: string | number | null;
}

const PurchaseOrderItemsTable: React.FC<PurchaseOrderItemsTableProps> = ({
  items,
  isLoading,
  currency,
  statusData,
  formatCurrency,
  formatDate,
  getItemStatusLabel,
  getItemStatusColor,
  onApproveItem,
  onRejectItem,
  onResolveFromStock,
  onUploadItem,
  onRemoveItem,
  onViewItemDetails,
  processingItemId = null,
}) => {
  const [expandedRowId, setExpandedRowId] = useState<string | number | null>(null);
  const [imageLoading, setImageLoading] = useState<Record<string | number, boolean>>({});
  const [imageError, setImageError] = useState<Record<string | number, boolean>>({});

  const toggleRowExpand = (itemId: string | number) => {
    setExpandedRowId(expandedRowId === itemId ? null : itemId);
  };

  const isProcessing = (itemId: string | number) => processingItemId === itemId;

  const canRemove = (item: PurchaseOrderItem) => {
    return item.is_active !== 1 && item.is_active !== true;
  };

  const safeValue = (value: any, fallback: string = 'N/A'): string => {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value === 'string' && value.trim() === '') return fallback;
    if (typeof value === 'string' && value === 'null') return fallback;
    return String(value);
  };

  // Handle image load
  const handleImageLoad = (itemId: string | number) => {
    setImageLoading(prev => ({ ...prev, [itemId]: false }));
  };

  const handleImageError = (itemId: string | number) => {
    setImageLoading(prev => ({ ...prev, [itemId]: false }));
    setImageError(prev => ({ ...prev, [itemId]: true }));
  };

  // Get file icon based on file extension
  const getFileIcon = (filePath: string) => {
    if (!filePath) return <File className="w-5 h-5 text-gray-400" />;
    
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) {
      return <Image className="w-5 h-5 text-blue-500" />;
    } else if (['pdf'].includes(ext)) {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else if (['doc', 'docx'].includes(ext)) {
      return <FileText className="w-5 h-5 text-blue-600" />;
    } else {
      return <File className="w-5 h-5 text-gray-400" />;
    }
  };

  // Check if file is an image
  const isImageFile = (filePath: string) => {
    if (!filePath) return false;
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext);
  };

  // Render file preview in expanded row
  const renderFilePreview = (item: PurchaseOrderItem) => {
    const docPath = item?.doc_path;
    if (!docPath) return null;

    const fullPath = SERVER_URL + docPath;
    const isImage = isImageFile(docPath);
    const isLoadingImage = imageLoading[item.id] !== false;
    const hasError = imageError[item.id] || false;

    return (
      <div className="col-span-1 sm:col-span-2 lg:col-span-3">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Attached Document</p>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800/50">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {getFileIcon(docPath)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {item?.doc_name || docPath.split('/').pop() || 'Document'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Click to view or download
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={fullPath}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
              >
                <Eye className="w-3.5 h-3.5" />
                View
              </a>
              <a
                href={fullPath}
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors dark:text-green-400 dark:bg-green-900/20 dark:hover:bg-green-900/30"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
            </div>
          </div>
          
          {/* Image Preview */}
          {isImage && (
            <div className="mt-3 relative">
              {isLoadingImage && (
                <div className="flex items-center justify-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="ml-2 text-sm text-gray-500">Loading image...</span>
                </div>
              )}
              {hasError ? (
                <div className="flex items-center justify-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  <span className="ml-2 text-sm text-red-500">Failed to load image</span>
                </div>
              ) : (
                <img
                  src={fullPath}
                  alt="Document preview"
                  className={`max-h-48 w-auto mx-auto object-contain rounded-lg border border-gray-200 dark:border-gray-700 ${
                    isLoadingImage ? 'hidden' : 'block'
                  }`}
                  onLoad={() => handleImageLoad(item.id)}
                  onError={() => handleImageError(item.id)}
                  style={{ display: isLoadingImage ? 'none' : 'block' }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">Loading items...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="text-sm text-gray-500">No items found for this purchase order</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              S/N
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Category
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Item
            </th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Qty
            </th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Unit Price
            </th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total
            </th>
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <span className="sr-only">Expand</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
          {items.map((item, index) => {
            const isProcessingItem = isProcessing(item.id);
            const isResolved = item.resolved === 1;
            const isApproved = item.approval_status === 'approved';
            const isRejected = item.approval_status === 'rejected';
            const isExpanded = expandedRowId === item.id;
            const hasDoc = item?.doc_path && item.doc_path !== '';

            return (
              <React.Fragment key={item.id || index}>
                {/* Main Row */}
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-gray-100">
                    {safeValue(item.category_name)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-gray-100">
                    {safeValue(item.item_name)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-right text-gray-900 dark:text-gray-100">
                    {item.quantity || 0}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-right text-gray-900 dark:text-gray-100">
                    {formatCurrency(item.unit_price, currency)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-right font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(item.total_price, currency)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getItemStatusColor(item)}`}>
                      {getItemStatusLabel(item)}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      {/* Approve Button */}
                      {!isResolved && !isApproved && !isRejected && onApproveItem && (
                        <button
                          onClick={() => onApproveItem(item)}
                          disabled={isProcessingItem}
                          className={`p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors ${isProcessingItem ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title="Approve Item"
                        >
                          {isProcessingItem ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      {/* Reject Button */}
                      {!isResolved && !isApproved && !isRejected && onRejectItem && (
                        <button
                          onClick={() => onRejectItem(item)}
                          disabled={isProcessingItem}
                          className={`p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors ${isProcessingItem ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title="Reject Item"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Resolve from Stock Button */}
                      {!isResolved && isApproved && onResolveFromStock && (
                        <button
                          onClick={() => onResolveFromStock(item)}
                          disabled={isProcessingItem}
                          className={`p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors ${isProcessingItem ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title="Resolve from Stock"
                        >
                          {isProcessingItem ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Package className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      {/* Upload Icon - always visible */}
                      {onUploadItem && (
                        <button
                          onClick={() => onUploadItem(item)}
                          className="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                          title="Upload Document"
                        >
                          <Upload className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Quick View Link - shows when document exists */}
                      {hasDoc && (
                        <a
                          href={SERVER_URL + item.doc_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
                          title="Quick View Document"
                        >
                          <Link2Icon className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {/* Remove Icon - only if not active */}
                      {canRemove(item) && onRemoveItem && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove item "${item.item_name || item.id}"?`)) {
                              onRemoveItem(item);
                            }
                          }}
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          title="Remove Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <button
                      onClick={() => toggleRowExpand(item.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                      title={isExpanded ? "Hide Details" : "Show Details"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>

                {/* Expanded Row - Detailed View */}
                {isExpanded && (
                  <tr className="bg-gray-50/80 dark:bg-gray-800/80">
                    <td colSpan={9} className="px-4 py-4">
                      <div className="space-y-3">
                        {/* Title */}
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Item Details: {safeValue(item.item_name)}
                          </h4>
                          <div className="flex items-center gap-2">
                            {onUploadItem && (
                              <button
                                onClick={() => onUploadItem(item)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors dark:text-purple-400 dark:bg-purple-900/20 dark:hover:bg-purple-900/30"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                {hasDoc ? 'Replace Document' : 'Upload Document'}
                              </button>
                            )}
                            {onViewItemDetails && (
                              <button
                                onClick={() => onViewItemDetails(item)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View Full Details
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {/* ID */}
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Item ID</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{item.id}</p>
                          </div>

                          {/* SKU */}
                          {item.sku && (
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">SKU</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{item.sku}</p>
                            </div>
                          )}

                          {/* Category */}
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{safeValue(item.category_name)}</p>
                          </div>

                          {/* Quantity & Unit */}
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Quantity / Unit</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.quantity || 0} {item.unit ? item.unit : ''}
                            </p>
                          </div>

                          {/* Unit Price */}
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Unit Price</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(item.unit_price, currency)}
                            </p>
                          </div>

                          {/* Total Price */}
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Price</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(item.total_price, currency)}
                            </p>
                          </div>

                          {/* Discount */}
                          {item.discount && (
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Discount</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatCurrency(item.discount, currency)}
                              </p>
                            </div>
                          )}

                          {/* Tax */}
                          {item.tax_amount && (
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Tax Amount</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatCurrency(item.tax_amount, currency)}
                              </p>
                            </div>
                          )}

                          {/* Status */}
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Approval Status</p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getItemStatusColor(item)}`}>
                              {getItemStatusLabel(item)}
                            </span>
                          </div>

                          {/* Active Status */}
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.is_active === 1 || item.is_active === true ? 'Yes' : 'No'}
                            </p>
                          </div>

                          {/* Description */}
                          {item.description && (
                            <div className="col-span-1 sm:col-span-2">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
                              <p className="text-sm text-gray-900 dark:text-white">{item.description}</p>
                            </div>
                          )}

                          {/* Document Preview - Full size in expanded row */}
                          {hasDoc && renderFilePreview(item)}

                          {/* Created At */}
                          {item.created_at && formatDate && (
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatDate(item.created_at)}
                              </p>
                            </div>
                          )}

                          {/* Updated At */}
                          {item.updated_at && formatDate && (
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Updated</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatDate(item.updated_at)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseOrderItemsTable;