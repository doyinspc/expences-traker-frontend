// src/pages/Finance/components/MiniCashTransfers.tsx

import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from 'react-redux';
import { Plus, Edit2, Trash2, Eye, Loader2, Upload, FileText, X, ChevronDown, ChevronRight } from 'lucide-react';
import useReduxApiData from "../../../hooks/useTanstackQuery.js";
import { moneyFunction } from "../../../utils/functions/basci.jsx";

// ==================== TYPES ====================
interface MiniCashTransfersProps {
    items?: any[];
    isLoading?: boolean;
    currency?: string;
    statusData?: any[];
    formatCurrency?: (amount: number) => string;
    formatDate?: (date: string) => string;
    getItemStatusLabel?: (status: any) => string;
    getItemStatusColor?: (status: any) => string;
    onApproveItem?: (item: any) => void;
    onRejectItem?: (item: any) => void;
    onResolveFromStock?: (item: any) => void;
    onUploadItem?: (item: any) => void;
    onRemoveItem?: (item: any) => void;
    onViewItemDetails?: (item: any) => void;
    onViewAttachments?: (item: any) => void;
    processingItemId?: number | null;
    title?: string;
    emptyMessage?: string;
    documentId?: number;
    documentTypeId?: number;
}

interface TransferRow {
    id?: number;
    special_instructions: string;
    from_account_name: string;
    to_account_name: string;
    amount_display: number;
    created_at_formatted: string;
    created_at?: string;
    from_account_id?: number;
    to_account_id?: number;
    debit_entry?: any;
    credit_entry?: any;
    has_file?: boolean;
    doc_path?: string;
    status?: number;
    approval_status?: number;
    created_by_name?: string;
}

// ==================== FILE UPLOAD MODAL ====================
interface FileUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File) => void;
    rowData: any;
    formatCurrency?: (amount: number) => string;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ 
    isOpen, 
    onClose, 
    onUpload, 
    rowData,
    formatCurrency 
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (selectedFile) {
            setUploading(true);
            onUpload(selectedFile);
            setTimeout(() => {
                setUploading(false);
                setSelectedFile(null);
                onClose();
            }, 1500);
        }
    };

    const displayAmount = formatCurrency 
        ? formatCurrency(rowData?.amount_display || 0)
        : moneyFunction(rowData?.amount_display || 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Upload File
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            <strong>Transfer:</strong> {rowData?.from_account_name} → {rowData?.to_account_name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            <strong>Amount:</strong> {displayAmount}
                        </p>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer flex flex-col items-center gap-2"
                        >
                            <Upload className="w-8 h-8 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                {selectedFile ? selectedFile.name : 'Click to select a file'}
                            </span>
                            <span className="text-xs text-gray-400">
                                PDF, JPG, PNG, DOC (max 5MB)
                            </span>
                        </label>
                    </div>

                    {selectedFile && (
                        <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                            <FileText className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {selectedFile.name}
                            </span>
                            <button
                                onClick={() => setSelectedFile(null)}
                                className="ml-auto text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 inline animate-spin mr-2" />
                                Uploading...
                            </>
                        ) : (
                            'Upload File'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ==================== MAIN COMPONENT ====================
const MiniCashTransfers: React.FC<MiniCashTransfersProps> = ({ 
    items,
    isLoading: externalLoading,
    currency = 'NGN',
    statusData = [],
    formatCurrency,
    formatDate: externalFormatDate,
    getItemStatusLabel,
    getItemStatusColor,
    onApproveItem,
    onRejectItem,
    onResolveFromStock,
    onUploadItem,
    onRemoveItem,
    onViewItemDetails,
    onViewAttachments,
    processingItemId,
    title = 'Cash Transfers',
    emptyMessage = 'No cash transfers found',
    documentId,
    documentTypeId,
}) => {
    const { user } = useSelector((state: any) => state.authReducer);
    const { id: user_id } = user || {};

    // ==================== STATE ====================
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedRowForUpload, setSelectedRowForUpload] = useState<any>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    // ==================== API HOOKS ====================
    const { data: apiData, loadQuery, isLoading: apiLoading } = useReduxApiData({
        table: "requisitionitems",
        pth: "requisitionitem",
        queryType: 'gets',
        mainParam: documentId ? { requisition_id: documentId } : {},
        narration: 'get mini cash transfers'
    });

    const { loadUpdate } = useReduxApiData({
        table: "requisitionitems",
        pth: "requisitionitem",
        queryType: 'update',
        narration: 'upload file'
    });

    // ==================== HELPERS ====================
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        if (externalFormatDate) return externalFormatDate(dateString);
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const getStatusColor = (status: number) => {
        if (getItemStatusColor) return getItemStatusColor(status);
        const colors: { [key: number]: string } = {
            0: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            1: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            2: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    };

    const getStatusLabel = (status: number) => {
        if (getItemStatusLabel) return getItemStatusLabel(status);
        const labels: { [key: number]: string } = {
            0: 'Pending',
            1: 'Approved',
            2: 'Rejected',
        };
        return labels[status] || 'Unknown';
    };

    // ==================== DATA PROCESSING ====================
    const processedRows = useMemo(() => {
        // Use items prop if provided, otherwise use API data
        const sourceData = items || apiData || [];
        const rows = Array.isArray(sourceData) ? sourceData : [];
        
        // Group by special_instructions
        const groups = new Map();
        rows.forEach((row: any) => {
            const groupId = row.special_instructions;
            if (groupId && groupId !== '') {
                if (!groups.has(groupId)) {
                    groups.set(groupId, []);
                }
                groups.get(groupId).push(row);
            }
        });

        // Create unique transfers
        const uniqueTransfers: any[] = [];
        groups.forEach((entries: any[], groupId: string) => {
            const debit = entries.find((r: any) => 
                r.category_id === 0 || (parseFloat(r.total_price) > 0 && parseFloat(r.credit_price) === 0)
            );
            const credit = entries.find((r: any) => 
                r.category_id === 1 || (parseFloat(r.credit_price) > 0 && parseFloat(r.total_price) === 0)
            );
            
            if (debit || credit) {
                const primary = debit || credit;
                const amount = debit ? parseFloat(debit.total_price) : (credit ? parseFloat(credit.credit_price) : 0);
                
                uniqueTransfers.push({
                    id: primary?.id,
                    special_instructions: groupId,
                    from_account_name: debit?.account_name || 'N/A',
                    to_account_name: credit?.account_name || 'N/A',
                    from_account_id: debit?.account_id || null,
                    to_account_id: credit?.account_id || null,
                    amount_display: amount,
                    created_at: primary?.created_at,
                    created_at_formatted: formatDate(primary?.created_at),
                    created_by_name: primary?.created_by_name,
                    debit_entry: debit,
                    credit_entry: credit,
                    has_file: primary?.doc_path ? true : false,
                    doc_path: primary?.doc_path || null,
                    status: primary?.approval_status || 0,
                    approval_status: primary?.approval_status || 0,
                    category_id: primary?.category_id,
                    item_id: primary?.item_id,
                    account_id: primary?.account_id,
                    credit_price: primary?.credit_price,
                    total_price: primary?.total_price,
                    quantity: primary?.quantity,
                    unit_price: primary?.unit_price,
                    requisition_id: primary?.requisition_id,
                    purchaseorder_id: primary?.purchaseorder_id,
                    // Include all original data for callbacks
                    ...primary,
                });
            }
        });

        return uniqueTransfers;
    }, [items, apiData]);

    // ==================== HANDLERS ====================
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleFileUpload = (row: any) => {
        if (onUploadItem) {
            onUploadItem(row);
            return;
        }
        setSelectedRowForUpload(row);
        setShowUploadModal(true);
    };

    const handleUploadConfirm = (file: File) => {
        if (selectedRowForUpload) {
            if (selectedRowForUpload.debit_entry) {
                loadUpdate({ 
                    id: selectedRowForUpload.debit_entry.id, 
                    doc_path: `uploads/${file.name}` 
                });
                showToast('File uploaded successfully!', 'success');
                setTimeout(() => loadQuery(), 500);
            }
        }
    };

    const handleToggleExpand = (groupId: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(groupId)) {
            newExpanded.delete(groupId);
        } else {
            newExpanded.add(groupId);
        }
        setExpandedRows(newExpanded);
    };

    const handleReload = () => {
        if (!items && documentId) {
            loadQuery();
        }
    };

    const handleAction = (action: string, row: any) => {
        switch (action) {
            case 'approve':
                if (onApproveItem) onApproveItem(row);
                break;
            case 'reject':
                if (onRejectItem) onRejectItem(row);
                break;
            case 'resolve':
                if (onResolveFromStock) onResolveFromStock(row);
                break;
            case 'remove':
                if (onRemoveItem) onRemoveItem(row);
                break;
            case 'view':
                if (onViewItemDetails) onViewItemDetails(row);
                break;
            case 'attachments':
                if (onViewAttachments) onViewAttachments(row);
                break;
            default:
                break;
        }
    };

    // ==================== EFFECTS ====================
    useEffect(() => {
        if (documentId && !items) {
            loadQuery();
        }
    }, [documentId]);

    // ==================== RENDER ====================
    const isLoading = externalLoading || apiLoading;

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="ml-3 text-gray-500 dark:text-gray-400">Loading transfers...</span>
                </div>
            </div>
        );
    }

    if (processedRows.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <div className="flex flex-col items-center gap-2">
                    <div className="text-4xl">💰</div>
                    <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm ${
                    toast.type === 'success' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                }`}>
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {title}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                        {processedRows.length}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {!items && (
                        <button
                            onClick={handleReload}
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                            title="Refresh"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800/30">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-8">#</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">From</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">To</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {processedRows.map((row: TransferRow, index: number) => {
                            const isProcessing = processingItemId === row.id;
                            const isExpanded = expandedRows.has(row.special_instructions);
                            const statusColor = getStatusColor(row.status || 0);
                            const statusLabel = getStatusLabel(row.status || 0);

                            return (
                                <React.Fragment key={row.special_instructions || index}>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                            {index + 1}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white max-w-[120px] truncate">
                                            {row.from_account_name}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white max-w-[120px] truncate">
                                            {row.to_account_name}
                                        </td>
                                        <td className="px-3 py-2 text-sm font-semibold text-right text-green-600 dark:text-green-400">
                                            {formatCurrency 
                                                ? formatCurrency(row.amount_display)
                                                : moneyFunction(row.amount_display)
                                            }
                                        </td>
                                        <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {row.created_at_formatted}
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>
                                                {statusLabel}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                {onViewItemDetails && (
                                                    <button
                                                        onClick={() => handleAction('view', row)}
                                                        className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                        title="View Details"
                                                        disabled={isProcessing}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                )}
                                                
                                                <button
                                                    onClick={() => handleFileUpload(row)}
                                                    className="p-1.5 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                                    title="Upload File"
                                                    disabled={isProcessing}
                                                >
                                                    <Upload className="w-4 h-4" />
                                                </button>

                                                {row.has_file && (
                                                    <span className="text-xs text-green-500" title="File attached">
                                                        📎
                                                    </span>
                                                )}

                                                {onApproveItem && row.status === 0 && (
                                                    <button
                                                        onClick={() => handleAction('approve', row)}
                                                        className="p-1.5 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors rounded hover:bg-green-50 dark:hover:bg-green-900/20"
                                                        title="Approve"
                                                        disabled={isProcessing}
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {onRejectItem && row.status === 0 && (
                                                    <button
                                                        onClick={() => handleAction('reject', row)}
                                                        className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        title="Reject"
                                                        disabled={isProcessing}
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {onRemoveItem && (
                                                    <button
                                                        onClick={() => handleAction('remove', row)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        title="Remove"
                                                        disabled={isProcessing}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {isProcessing && (
                                                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* File Upload Modal */}
            <FileUploadModal
                isOpen={showUploadModal}
                onClose={() => {
                    setShowUploadModal(false);
                    setSelectedRowForUpload(null);
                }}
                onUpload={handleUploadConfirm}
                rowData={selectedRowForUpload}
                formatCurrency={formatCurrency}
            />
        </div>
    );
};

export default MiniCashTransfers;