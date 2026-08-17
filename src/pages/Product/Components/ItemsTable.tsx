// src/components/common/ItemsTable.tsx

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
  AlertCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart
} from 'lucide-react';
import { SERVER_URL } from '../../../actions/common';
import { isArrayWithValue } from '../../../utils/functions';

export interface DocumentItem {
  id: string | number;
  category_name?: string;
  item_name?: string;
  quantity?: number;
  unit_price?: number;
  total_price?: number;
  approval_status?: string;
  resolved?: number; // 0 = pending, 1 = approved/settled, 2 = rejected
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
  category_id?: number | string;
  item_id?: number | string;
  Item_id?: number | string;
  [key: string]: any;
}

export interface BudgetCategory {
  category_id: number | string;
  budgeted_amount: number;
  spent_amount: number;
  [key: string]: any;
}

export interface BudgetItem {
  Item_id: number | string;
  item_id?: number | string;
  budgeted_amount: number;
  spent_amount: number;
  [key: string]: any;
}

export interface ItemsTableProps {
  items: DocumentItem[];
  isLoading: boolean;
  currency: string;
  statusData: any[];
  budgetCategories?: BudgetCategory[];
  budgetCategoryItems?: BudgetItem[];
  formatCurrency: (amount: number | string | undefined, currency: string) => string;
  formatDate?: (dateString: string | undefined) => string;
  getItemStatusLabel: (item: DocumentItem) => string;
  getItemStatusColor: (item: DocumentItem) => string;
  onApproveItem?: (item: DocumentItem) => void;
  onRejectItem?: (item: DocumentItem) => void;
  onResolveFromStock?: (item: DocumentItem) => void;
  onUploadItem?: (item: DocumentItem) => void;
  onRemoveItem?: (item: DocumentItem) => void;
  onViewItemDetails?: (item: DocumentItem) => void;
  processingItemId?: string | number | null;
  title?: string;
  emptyMessage?: string;
  showUpload?: boolean;
  showRemove?: boolean;
  showViewDetails?: boolean;
  showResolveFromStock?: boolean;
  showApproveReject?: boolean;
  showBudgetInfo?: boolean;
}

const ItemsTable: React.FC<ItemsTableProps> = ({
  items,
  isLoading,
  currency,
  budgetCategories = [],
  budgetCategoryItems = [],
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
  title = 'Items',
  emptyMessage = 'No items found',
  showUpload = true,
  showRemove = true,
  showViewDetails = true,
  showResolveFromStock = true,
  showApproveReject = true,
  showBudgetInfo = false,
}) => {
  const [expandedRowId, setExpandedRowId] = useState<string | number | null>(null);
  const [imageLoading, setImageLoading] = useState<Record<string | number, boolean>>({});
  const [imageError, setImageError] = useState<Record<string | number, boolean>>({});
  const [showBudget, setShowBudget] = useState<boolean>(showBudgetInfo);

  const toggleRowExpand = (itemId: string | number) => {
    setExpandedRowId(expandedRowId === itemId ? null : itemId);
  };

  const toggleBudgetVisibility = () => {
    setShowBudget(!showBudget);
  };

  const isProcessing = (itemId: string | number) => processingItemId === itemId;

  const canRemove = (item: DocumentItem) => {
    return item.is_active !== 1 && item.is_active !== true;
  };

  const safeValue = (value: any, fallback: string = 'N/A'): string => {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value === 'string' && value.trim() === '') return fallback;
    if (typeof value === 'string' && value === 'null') return fallback;
    return String(value);
  };

  // Get resolved status label
  const getResolvedStatus = (resolved: number | undefined) => {
    if (resolved === 1) return { label: 'Settled', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' };
    if (resolved === 2) return { label: 'Rejected', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' };
    return { label: 'Pending', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
  };

  // Budget calculation helpers - use item_id for budget lookup
  const getCategoryBudget = (categoryId: number | string | undefined) => {
    if (!categoryId || !isArrayWithValue(budgetCategories)) return null;
    return budgetCategories.find(rw => String(rw.category_id) === String(categoryId));
  };

  const getItemBudget = (itemId: number | string | undefined) => {
    if (!itemId || !isArrayWithValue(budgetCategoryItems)) return null;
    return budgetCategoryItems.find(rw => 
      String(rw.item_id || rw.Item_id) === String(itemId)
    );
  };

  const getBudgetInfo = (item: DocumentItem) => {
    const itemId = item.item_id || item.Item_id || item.id;
    const category = getCategoryBudget(item.category_id);
    const budgetItem = getItemBudget(itemId);

    const plannedCategoryBudget = category?.budgeted_amount || 0;
    const spentCategoryBudget = category?.spent_amount || 0;
    const percentageCategorySpent = spentCategoryBudget > 0 && plannedCategoryBudget > 0 
      ? Number((spentCategoryBudget / plannedCategoryBudget) * 100).toFixed(2) 
      : 0;
    const amountCategoryLeft = plannedCategoryBudget - spentCategoryBudget;

    const plannedItemBudget = budgetItem?.budgeted_amount || 0;
    const spentItemBudget = budgetItem?.spent_amount || 0;
    const percentageItemSpent = spentItemBudget > 0 && plannedItemBudget > 0 
      ? Number((spentItemBudget / plannedItemBudget) * 100).toFixed(2) 
      : 0;
    const amountItemLeft = plannedItemBudget - spentItemBudget;

    return {
      category: { 
        planned: plannedCategoryBudget, 
        spent: spentCategoryBudget, 
        percentage: percentageCategorySpent, 
        left: amountCategoryLeft 
      },
      item: { 
        planned: plannedItemBudget, 
        spent: spentItemBudget, 
        percentage: percentageItemSpent, 
        left: amountItemLeft 
      },
      hasBudgetData: plannedCategoryBudget > 0 || plannedItemBudget > 0
    };
  };

  // Get budget performance summary for settled items (resolved = 1)
  const getBudgetPerformanceSummary = () => {
    const settledItems = items.filter(item => item.resolved === 1);
    if (settledItems.length === 0) return null;

    let totalPlanned = 0;
    let totalSpent = 0;

    settledItems.forEach(item => {
      const budget = getBudgetInfo(item);
      if (budget.item.planned > 0) {
        totalPlanned += budget.item.planned;
        totalSpent += budget.item.spent;
      } else if (budget.category.planned > 0) {
        totalPlanned += budget.category.planned;
        totalSpent += budget.category.spent;
      }
    });

    if (totalPlanned === 0) return null;

    const percentageUsed = Number(((totalSpent / totalPlanned) * 100).toFixed(2));
    const remaining = totalPlanned - totalSpent;

    return {
      totalPlanned,
      totalSpent,
      percentageUsed,
      remaining,
      isOverBudget: remaining < 0,
      itemCount: settledItems.length
    };
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
  const renderFilePreview = (item: DocumentItem) => {
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

  // Render budget information - only shows when resolved = 0 (pending)
  const renderBudgetInfo = (item: DocumentItem) => {
    if (item.resolved !== 0) return null;
    
    const budget = getBudgetInfo(item);
    if (!budget.hasBudgetData) return null;

    const resolvedStatus = getResolvedStatus(item.resolved);

    return (
      <div className="col-span-1 sm:col-span-2 lg:col-span-4 mt-2 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-4 h-4 text-blue-500" />
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Budget Information</p>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${resolvedStatus.bg} ${resolvedStatus.color}`}>
            {resolvedStatus.label}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {budget.category.planned > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Category Budget</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Planned:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(budget.category.planned, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Spent:</span>
                <span className="font-medium text-orange-600 dark:text-orange-400">
                  {formatCurrency(budget.category.spent, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Remaining:</span>
                <span className={`font-medium ${budget.category.left >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(budget.category.left, currency)}
                </span>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${parseFloat(budget.category.percentage) > 80 ? 'bg-red-500' : parseFloat(budget.category.percentage) > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(parseFloat(budget.category.percentage), 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {budget.category.percentage}% used
                </p>
              </div>
            </div>
          )}

          {budget.item.planned > 0 && (
            <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Item Budget</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Planned:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(budget.item.planned, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Spent:</span>
                <span className="font-medium text-orange-600 dark:text-orange-400">
                  {formatCurrency(budget.item.spent, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Remaining:</span>
                <span className={`font-medium ${budget.item.left >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(budget.item.left, currency)}
                </span>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${parseFloat(budget.item.percentage) > 80 ? 'bg-red-500' : parseFloat(budget.item.percentage) > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(parseFloat(budget.item.percentage), 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {budget.item.percentage}% used
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render budget summary for settled items (resolved = 1)
  const renderBudgetSummary = () => {
    const summary = getBudgetPerformanceSummary();
    if (!summary) return null;

    const percentageColor = summary.isOverBudget 
      ? 'text-red-600 dark:text-red-400' 
      : parseFloat(summary.percentageUsed.toString()) > 80 
        ? 'text-yellow-600 dark:text-yellow-400' 
        : 'text-green-600 dark:text-green-400';

    const progressColor = summary.isOverBudget 
      ? 'bg-red-500' 
      : parseFloat(summary.percentageUsed.toString()) > 80 
        ? 'bg-yellow-500' 
        : 'bg-green-500';

    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-2">
          <PieChart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Budget Performance ({summary.itemCount} settled items)
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Total Planned</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {formatCurrency(summary.totalPlanned, currency)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Total Spent</p>
            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
              {formatCurrency(summary.totalSpent, currency)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Remaining</p>
            <p className={`text-sm font-medium ${summary.isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {formatCurrency(summary.remaining, currency)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Usage</p>
            <p className={`text-sm font-medium ${percentageColor}`}>
              {summary.percentageUsed}%
            </p>
          </div>
        </div>
        <div className="mt-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full ${progressColor}`}
              style={{ width: `${Math.min(parseFloat(summary.percentageUsed.toString()), 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
            {summary.isOverBudget ? '⚠️ Over budget' : `${summary.percentageUsed}% of budget used`}
          </p>
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
        <span className="text-sm text-gray-500">{emptyMessage}</span>
      </div>
    );
  }

  const hasBudgetData = budgetCategories.length > 0 || budgetCategoryItems.length > 0;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            {title}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasBudgetData && (
            <button
              onClick={toggleBudgetVisibility}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                showBudget 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title={showBudget ? 'Hide Budget Info' : 'Show Budget Info'}
            >
              <DollarSign className="w-3.5 h-3.5" />
              {showBudget ? 'Hide Budget' : 'Show Budget'}
            </button>
          )}
        </div>
      </div>

      {showBudget && getBudgetPerformanceSummary() && (
        <div className="px-4 py-2 bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
          {renderBudgetSummary()}
        </div>
      )}

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
                Settled
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
              const isSettled = item.resolved === 1;
              const isRejected = item.resolved === 2;
              const isPending = item.resolved === 0;
              const isExpanded = expandedRowId === item.id;
              const hasDoc = item?.doc_path && item.doc_path !== '';
              const budget = getBudgetInfo(item);
              const resolvedStatus = getResolvedStatus(item.resolved);

              return (
                <React.Fragment key={item.id || index}>
                  {/* Main Row */}
                  <tr className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    isSettled ? 'bg-green-50/30 dark:bg-green-900/5' : 
                    isRejected ? 'bg-red-50/30 dark:bg-red-900/5' : ''
                  }`}>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                      {index + 1}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      <div className="text-gray-900 dark:text-gray-100">
                        {safeValue(item.category_name)}
                      </div>
                      {showBudget && isPending && budget.hasBudgetData && budget.category.planned > 0 && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[10px] text-blue-500 dark:text-blue-400">
                            {formatCurrency(budget.category.planned, currency)}
                          </span>
                          <TrendingUp className="w-2.5 h-2.5 text-green-500" />
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      <div className="text-gray-900 dark:text-gray-100">
                        {safeValue(item.item_name)}
                      </div>
                      {showBudget && isPending && budget.hasBudgetData && budget.item.planned > 0 && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[10px] text-green-500 dark:text-green-400">
                            {formatCurrency(budget.item.planned, currency)}
                          </span>
                          <TrendingDown className="w-2.5 h-2.5 text-red-500" />
                        </div>
                      )}
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
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${resolvedStatus.bg} ${resolvedStatus.color}`}>
                        {resolvedStatus.label}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Approve/Settle Button - only for pending items */}
                        {showApproveReject && isPending && onApproveItem && (
                          <button
                            onClick={() => onApproveItem(item)}
                            disabled={isProcessingItem}
                            className={`p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors ${isProcessingItem ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Settle/Approve Item"
                          >
                            {isProcessingItem ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          </button>
                        )}

                        {/* Reject Button - only for pending items */}
                        {showApproveReject && isPending && onRejectItem && (
                          <button
                            onClick={() => onRejectItem(item)}
                            disabled={isProcessingItem}
                            className={`p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors ${isProcessingItem ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Reject Item"
                          >
                            {isProcessingItem ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                          </button>
                        )}

                        {/* Resolve from Stock Button - only for settled items */}
                        {showResolveFromStock && isSettled && onResolveFromStock && (
                          <button
                            onClick={() => onResolveFromStock(item)}
                            disabled={isProcessingItem}
                            className={`p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors ${isProcessingItem ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Resolve from Stock"
                          >
                            {isProcessingItem ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Package className="w-3.5 h-3.5" />}
                          </button>
                        )}

                        {/* Upload Icon */}
                        {showUpload && onUploadItem && (
                          <button
                            onClick={() => onUploadItem(item)}
                            className="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                            title="Upload Document"
                          >
                            <Upload className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Quick View Link */}
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

                        {/* Remove Icon - only for pending or rejected items */}
                        {showRemove && !isSettled && canRemove(item) && onRemoveItem && (
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

                  {/* Expanded Row */}
                  {isExpanded && (
                    <tr className={`bg-gray-50/80 dark:bg-gray-800/80 ${
                      isSettled ? 'border-l-4 border-green-500' : 
                      isRejected ? 'border-l-4 border-red-500' : 
                      'border-l-4 border-yellow-500'
                    }`}>
                      <td colSpan={9} className="px-4 py-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                Item Details: {safeValue(item.item_name)}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${resolvedStatus.bg} ${resolvedStatus.color}`}>
                                  {resolvedStatus.label}
                                </span>
                                {isSettled && (
                                  <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Settled
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {showUpload && onUploadItem && (
                                <button
                                  onClick={() => onUploadItem(item)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors dark:text-purple-400 dark:bg-purple-900/20 dark:hover:bg-purple-900/30"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  {hasDoc ? 'Replace Document' : 'Upload Document'}
                                </button>
                              )}
                              {showViewDetails && onViewItemDetails && (
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

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Item ID</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.item_id || item.Item_id || item.id}
                              </p>
                            </div>

                            {item.sku && (
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">SKU</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.sku}</p>
                              </div>
                            )}

                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{safeValue(item.category_name)}</p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Quantity / Unit</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.quantity || 0} {item.unit ? item.unit : ''}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Unit Price</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatCurrency(item.unit_price, currency)}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Total Price</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatCurrency(item.total_price, currency)}
                              </p>
                            </div>

                            {item.discount && (
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Discount</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(item.discount, currency)}
                                </p>
                              </div>
                            )}

                            {item.tax_amount && (
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Tax Amount</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(item.tax_amount, currency)}
                                </p>
                              </div>
                            )}

                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.is_active === 1 || item.is_active === true ? 'Yes' : 'No'}
                              </p>
                            </div>

                            {item.description && (
                              <div className="col-span-1 sm:col-span-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
                                <p className="text-sm text-gray-900 dark:text-white">{item.description}</p>
                              </div>
                            )}

                            {showBudget && renderBudgetInfo(item)}
                            {hasDoc && renderFilePreview(item)}

                            {item.created_at && formatDate && (
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatDate(item.created_at)}
                                </p>
                              </div>
                            )}

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
    </div>
  );
};

export default ItemsTable;