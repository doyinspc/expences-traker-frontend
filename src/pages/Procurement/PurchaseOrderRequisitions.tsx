// src/pages/Procurement/PurchaseOrderItems.tsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { columnBuilder } from '../../actions/common';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Tables from '../../components/table/index.jsx';
import Loader from '../../components/ui/Loader';
import { TableAction } from '../../components/ui/TableAction';
import { TabNavigation } from '../../components/ui/TabNavigation';
import { AddIcon, BackIcon, ReloadIcon } from '../../components/ui/TableIcons';
import { Plus, Minus, Loader2 } from 'lucide-react';
import useReduxApiData from "../../hooks/useTanstackQuery.js";
import { processRows, filterData } from '../../utils/functions/dataHelpers';

// ==================== TABLE CONFIGURATION ====================
const table_data = [
    {label: 'ID', name:'id', type:'hidden', showTable: false, editable:false, element:null},
    {label: 'Requisition ID', name:'requisition_id', type:'number', showTable: false, editable:false, element:null},
    {label: 'Purchase Order ID', name:'purchaseorder_id', type:'number', showTable: false, editable:true, element:null},
    {label: 'Category ID', name:'category_id', type:'select', showTable: false, editable:true, element:null},
    {label: 'Category', name:'category_name', type:'text', showTable: true, editable:false, element:null},
    {label: 'Item ID', name:'item_id', type:'text', showTable: false, editable:true, element:null},
    {label: 'Item', name:'item_name', type:'text', showTable: true, editable:false, element:null},
    {label: 'Quantity', name:'quantity', type:'number', showTable: true, editable:true, element:null},
    {label: 'Unit Price', name:'unit_price', type:'number', showTable: true, editable:true, element:null},
    {label: 'Total Price', name:'total_price', type:'number', showTable: true, editable:false, element:null},
    {label: 'SKU', name:'sku_id', type:'number', showTable: true, editable:false, element:null},
    {label: 'Delivery Required By', name:'delivery_required_by', type:'date', showTable: true, editable:true, element:null},
    {label: 'Special Instructions', name:'special_instructions', type:'textarea', showTable: false, editable:true, element:null},
    {label: 'Resolved', name:'resolved', type:'select', showTable: true, editable:false, element:null},
    {label: 'Resolved Date', name:'resolved_date', type:'datetime', showTable: true, editable:false, element:null},
    {label: 'Resolved By', name:'resolved_by_name', type:'text', showTable: true, editable:false, element:null},
    {label: 'Approved By', name:'approved_by_name', type:'text', showTable: true, editable:false, element:null},
    {label: 'Approved Date', name:'approved_date', type:'datetime', showTable: true, editable:false, element:null},
    {label: 'Approval Status', name:'approval_status', type:'select', showTable: true, editable:false, element:null},
    {label: 'PO Assigned', name:'po_assigned', type:'text', showTable: true, editable:false, element:null},
    {label: 'Created At', name:'created_at', type:'datetime', showTable: true, editable:false, element:null},
    {label: 'Created By', name:'created_by_name', type:'text', showTable: true, editable:false, element:null},
];

// Column visibility settings
const columnVisibility = {
    id: false,
    requisition_id: false,
    purchaseorder_id: false,
    category_id: false,
    item_id: false,
    category_name: true,
    item_name: true,
    quantity: true,
    unit_price: true,
    total_price: true,
    sku_id: false,
    delivery_required_by: false,
    special_instructions: false,
    resolved: false,
    resolved_date: false,
    resolved_by_name: false,
    approved_by_name: false,
    approved_date: false,
    approval_status: false,
    po_assigned: true,
    created_at: false,
    created_by_name: false,
};

// ==================== CONSTANTS ====================
const TABLE_NAME = "requisitionitems";
const PAGE_SIZE = 500;
type TabType = 'table' | 'analysis';

// ==================== SAFE ARRAY HELPER ====================
const safeArray = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'object' && data !== null) {
        return data.items || data.data || [];
    }
    return [];
};

// ==================== HELPER: FORMAT CURRENCY ====================
const formatCurrency = (amount: number | string | undefined, currencyCode: string = 'NGN'): string => {
    if (amount === undefined || amount === null) return 'N/A';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return 'N/A';
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numAmount);
    } catch (error) {
        return `${currencyCode} ${numAmount.toFixed(2)}`;
    }
};

// ==================== MODAL COMPONENT ====================
interface AddItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    purchaseOrderId: number;
    onItemsAdded: () => void;
}

const AddItemsModal: React.FC<AddItemsModalProps> = ({
    isOpen,
    onClose,
    purchaseOrderId,
    onItemsAdded,
}) => {
    const { location_id } = useSelector((state: any) => state.auth || {});
    const [selectedRequisition, setSelectedRequisition] = useState<string>('');
    const [requisitionItems, setRequisitionItems] = useState<any[]>([]);
    const [adding, setAdding] = useState<number | null>(null);
    const [requisitionCurrency, setRequisitionCurrency] = useState<string>('NGN');

    // Fetch active requisitions
    const { data: requisitionsData, loadQuery: loadRequisitions } = useReduxApiData({
        table: "requisitions",
        uniqueKey: 'requisition',
        queryType: 'gets',
        mainParam: { is_active: 1, location_id: location_id || 0 },
        narration: 'get active requisitions',
        autoLoad: false,
    });

    // Fetch requisition items for selected requisition
    const { data: itemsData, loadQuery: loadItems, loadUpdate, isLoading: itemsLoading } = useReduxApiData({
        table: "requisitionitems",
        uniqueKey: 'requisitionitemLoader',
        queryType: 'gets',
        mainParam: { requisition_id: selectedRequisition || null },
        narration: 'get requisition items',
        autoLoad: false,
    });

    // Get currency for selected requisition
    useEffect(() => {
        if (selectedRequisition && requisitionsData) {
            const safeReqs = safeArray(requisitionsData);
            const selectedReq = safeReqs.find((req: any) => String(req?.id) === String(selectedRequisition));
            if (selectedReq) {
                const currency = selectedReq?.currency_code || selectedReq?.currency || 'NGN';
                setRequisitionCurrency(currency);
            }
        }
    }, [selectedRequisition, requisitionsData]);

    // Update items when selected requisition changes
    useEffect(() => {
        if (selectedRequisition && parseInt(selectedRequisition) > 0) {
            loadItems({ requisition_id: selectedRequisition });
        } else {
            setRequisitionItems([]);
        }
    }, [selectedRequisition, ]);

    // Process items data - FILTER OUT NULL/UNDEFINED
    useEffect(() => {
        if (itemsData) {
            const items = safeArray(itemsData);
            const validItems = items.filter((item: any) => item !== null && item !== undefined && typeof item === 'object');
            setRequisitionItems(validItems);
        } else {
            setRequisitionItems([]);
        }
    }, [itemsData]);

    // Load requisitions on mount
    useEffect(() => {
        if (isOpen) {
            loadRequisitions();
        }
    }, [isOpen]);

    // Handle load button click
    const handleLoadItems = () => {
        if (selectedRequisition && parseInt(selectedRequisition) > 0) {
            loadItems({ requisition_id: selectedRequisition });
        }
    };

    // Handle add single item to PO
    const handleAddSingleItem = (itemId: number) => {
        setAdding(itemId);
        try {
            loadUpdate({
                id: itemId,
                purchaseorder_id: purchaseOrderId,
                act: 0,
            });
            loadItems({ requisition_id: selectedRequisition });
            onItemsAdded();
        } catch (error) {
            console.error('Error adding item:', error);
            alert('Failed to add item to purchase order');
        } finally {
            setAdding(null);
        }
    };

    // Handle remove item from PO
    const handleRemoveItem = (itemId: number) => {
        if (!window.confirm('Remove this item from the purchase order?')) return;
        
        setAdding(itemId);
        try {
            loadUpdate({
                id: itemId,
                purchaseorder_id: null,
                act: 0,
            });
            loadItems({ requisition_id: selectedRequisition });
            onItemsAdded();
        } catch (error) {
            console.error('Error removing item:', error);
            alert('Failed to remove item from purchase order');
        } finally {
            setAdding(null);
        }
    };

    if (!isOpen) return null;

    // Filter out null/undefined items for display
    const displayItems = requisitionItems.filter((item: any) => item !== null && item !== undefined);
    
    // Check if purchaseorder_id > 0 (not just exists)
    const itemsWithPO = displayItems.filter((item: any) => item?.purchaseorder_id && Number(item.purchaseorder_id) > 0 && Number(item.purchaseorder_id) === purchaseOrderId);
    const itemsWithoutPO = displayItems.filter((item: any) => !item?.purchaseorder_id || Number(item.purchaseorder_id) === 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 p-6 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Add Items to Purchase Order
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Requisition Selection */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Select Requisition
                        </label>
                        <select
                            value={selectedRequisition}
                            onChange={(e) => setSelectedRequisition(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">-- Select Requisition --</option>
                            {safeArray(requisitionsData).filter((req: any) => req !== null && req !== undefined).map((req: any) => (
                                <option key={req?.id} value={req?.id}>
                                    {req?.requisition_number || req?.pr_id || `REQ-${req?.id}`} - {req?.title || 'No Title'}
                                    {req?.currency_code && ` (${req?.currency_code})`}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleLoadItems}
                        disabled={!selectedRequisition || itemsLoading}
                        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {itemsLoading ? 'Loading...' : 'Load Items'}
                    </button>
                </div>

                {/* Items Table */}
                <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    {itemsLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            <span className="ml-2 text-sm text-gray-500">Loading items...</span>
                        </div>
                    ) : displayItems.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <span className="text-sm text-gray-500">Select a requisition and click Load Items</span>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unit Price</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">PO Status</th>
                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                {displayItems.map((item: any, index: number) => {
                                    // Skip if item is null/undefined
                                    if (!item || typeof item !== 'object') return null;
                                    
                                    // Check if purchaseorder_id > 0
                                    const hasPO = item?.purchaseorder_id && Number(item.purchaseorder_id) > 0;
                                    const isInCurrentPO = item?.purchaseorder_id && Number(item.purchaseorder_id) === purchaseOrderId;
                                    const isProcessing = adding === item?.id;
                                    const isApproved = item?.approved_by && item?.approved_by !== 0;
                                    const currencyCode = requisitionCurrency || 'NGN';
                                    const itemName = item?.item_name || item?.item_id || 'N/A';
                                    const categoryName = item?.category_name || 'N/A';
                                    const quantity = item?.quantity || 0;
                                    const unitPrice = item?.unit_price;
                                    const totalPrice = item?.total_price;

                                    return (
                                        <tr key={item?.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-gray-100">
                                                {typeof itemName === 'string' ? itemName : 'N/A'}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-gray-100">
                                                {typeof categoryName === 'string' ? categoryName : 'N/A'}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-right text-gray-900 dark:text-gray-100">
                                                {typeof quantity === 'number' ? quantity : 0}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-right text-gray-900 dark:text-gray-100">
                                                {unitPrice ? formatCurrency(unitPrice, currencyCode) : 'N/A'}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-right font-medium text-gray-900 dark:text-gray-100">
                                                {totalPrice ? formatCurrency(totalPrice, currencyCode) : 'N/A'}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-center">
                                                {isInCurrentPO ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                        In This PO
                                                    </span>
                                                ) : hasPO ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                                        In Other PO
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                                        Available
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-center">
                                                {isApproved ? (
                                                    <span className="text-xs text-gray-400">Approved</span>
                                                ) : isInCurrentPO ? (
                                                    <button
                                                        onClick={() => handleRemoveItem(item?.id)}
                                                        disabled={isProcessing}
                                                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/30"
                                                    >
                                                        {isProcessing ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <Minus className="w-3 h-3" />
                                                        )}
                                                        Remove
                                                    </button>
                                                ) : hasPO ? (
                                                    <span className="text-xs text-gray-400">In Another PO</span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAddSingleItem(item?.id)}
                                                        disabled={isProcessing}
                                                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:text-green-400 dark:bg-green-900/20 dark:hover:bg-green-900/30"
                                                    >
                                                        {isProcessing ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <Plus className="w-3 h-3" />
                                                        )}
                                                        Add Item
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Summary */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span>Total: {displayItems.length}</span>
                        <span className="ml-4 text-green-600 dark:text-green-400">
                            In PO: {itemsWithPO.length}
                        </span>
                        <span className="ml-4 text-yellow-600 dark:text-yellow-400">
                            Available: {itemsWithoutPO.length}
                        </span>
                        {requisitionCurrency && (
                            <span className="ml-4 text-gray-400">Currency: {requisitionCurrency}</span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// ==================== MAIN COMPONENT ====================
const PurchaseOrderItems: React.FC = () => {
    const nav = useNavigate();
    const { purchaseorder_id } = useParams();
    const { user } = useSelector((state: any) => state.authReducer || {});

    // ==================== STATE ====================
    const [activeTab, setActiveTab] = useState<TabType>('table');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // ==================== API HOOKS ====================
    const { data, loadQuery, loadUpdate, isLoading } = useReduxApiData({
        table: TABLE_NAME,
        pth: 'requisitionitem',
        queryType: 'gets',
        mainParam: { purchaseorder_id: purchaseorder_id || 0 },
        narration: 'get purchase order items'
    });

    // ==================== HANDLERS ====================
    const onAdd = useCallback((): void => {
        setIsModalOpen(true);
    }, []);

    const onDelete = useCallback((row: any): void => {
        const itemName = row?.item_name || row?.id || 'item';
        if (window.confirm(`Remove item ${itemName} from this purchase order?`)) {
            loadUpdate({ id: row?.id, purchaseorder_id: null, act: 0 });
        }
    }, [loadUpdate]);

    const handleReload = useCallback((): void => {
        loadQuery();
    }, [loadQuery]);

    const goBack = useCallback(() => nav(-1), [nav]);

    const handleItemsAdded = useCallback(() => {
        handleReload();
    }, [handleReload]);

    // ==================== DATA PROCESSING ====================
    const processedRows = useMemo(() => {
        try {
            // Get safe array from data
            let safeData = [];
            if (data) {
                if (Array.isArray(data)) {
                    safeData = data;
                } else if (typeof data === 'object' && data !== null) {
                    safeData = data.items || data.data || [];
                }
            }
            
            // FILTER OUT NULL/UNDEFINED objects BEFORE passing to processRows
            const validData = safeData.filter((item: any) => 
                item !== null && 
                item !== undefined && 
                typeof item === 'object' &&
                Object.keys(item).length > 0
            );
            
            const rows = processRows(validData, TABLE_NAME);
            return rows.map((row: any) => ({
                ...row,
                // Check if purchaseorder_id is greater than 0
                po_assigned: (row?.purchaseorder_id && Number(row.purchaseorder_id) > 0) ? '✅ Assigned' : '❌ Not Assigned',
            }));
        } catch (error) {
            console.warn('Error processing rows:', error);
            return [];
        }
    }, [data]);

    // Filtered rows with null check
    const filteredRows = useMemo(() => {
        try {
            // Only call filterData if we have valid rows
            if (!Array.isArray(processedRows) || processedRows.length === 0) {
                return [];
            }
            
            // Filter out any null/undefined before passing
            const validRows = processedRows.filter((row: any) => 
                row !== null && 
                row !== undefined && 
                typeof row === 'object'
            );
            
            if (validRows.length === 0) {
                return [];
            }
            
            return filterData(validRows, {}, '');
        } catch (error) {
            console.warn('Error filtering rows:', error);
            return processedRows || [];
        }
    }, [processedRows]);

    // ==================== COLUMNS ====================
    const columns = useMemo(() => {
        return columnBuilder(
            { table_action: TableAction, table_data: table_data },
            { onDelete }
        );
    }, [table_data, onDelete]);

    // ==================== RENDER ====================
    return (
        <>
            <PageBreadcrumb pageTitle="Purchase Order Items" />
            
            {/* Header */}
            <div className="flex items-center justify-end gap-2 mb-4">
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                    <AddIcon />
                    Add Items
                </button>
                <button
                    onClick={goBack}
                    className="p-2 rounded-lg transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Go Back"
                >
                    <BackIcon />
                </button>
                <button
                    onClick={handleReload}
                    className="p-2 rounded-lg transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Reload Data"
                >
                    <ReloadIcon />
                </button>
            </div>

            <div className="space-y-6">
                <div className="p-1">
                    {!isLoading ? (
                        <>
                            <TabNavigation
                                activeTab={activeTab}
                                onTabChange={setActiveTab}
                                hasAnalysis={false}
                                recordCount={filteredRows?.length || 0}
                            />

                            {activeTab === 'table' && (
                                <Tables
                                    onAdd={onAdd}
                                    reload={handleReload}
                                    home={() => nav(-1)}
                                    rows={filteredRows || []}
                                    columns={columns}
                                    pageSize={PAGE_SIZE}
                                    cV={columnVisibility}
                                />
                            )}
                        </>
                    ) : (
                        <Loader
                            overlay
                            backdropColor="dark"
                            color="text-white"
                            variant="spinner"
                            text="Loading items..."
                            textClassName="text-white/90"
                        />
                    )}
                </div>
            </div>

            {/* Add Items Modal */}
            <AddItemsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                purchaseOrderId={Number(purchaseorder_id)}
                onItemsAdded={handleItemsAdded}
            />
        </>
    );
};

export default PurchaseOrderItems;