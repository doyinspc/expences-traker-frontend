import ParentDocumentContext from '../../components/common/ParentDocumentContext.jsx';
import useParentDocumentContext from '../../hooks/useParentDocumentContext.js';
// src/pages/Procurement/PurchaseOrderItems.tsx

import React, { useState, useMemo, useCallback } from "react";
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { columnBuilder } from '../../actions/common';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Tables from '../../components/table/index.jsx';
import Loader from '../../components/ui/Loader';
import { TableAction } from '../../components/ui/TableAction';
import { TabNavigation } from '../../components/ui/TabNavigation';
import { AddIcon, BackIcon, ReloadIcon } from '../../components/ui/TableIcons';
import AddItemsModal from '../../components/procurement/AddRequisitionItemsModal';
import useReduxApiData from "../../hooks/useTanstackQuery.js";
import { processRows, filterData } from '../../utils/functions/dataHelpers';

// ==================== TABLE CONFIGURATION ====================
const table_data = [
    {label: 'ID', name:'id', type:'hidden', showTable: false, editable:false, element:null},
    {label: 'Requisition ID', name:'requisition_id', type:'number', showTable: false, editable:false, element:null},
    {label: 'Procurement / Purchase Order ID', name:'purchaseorder_id', type:'number', showTable: false, editable:true, element:null},
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

// ==================== MAIN COMPONENT ====================
const PurchaseOrderItems: React.FC = () => {
    const nav = useNavigate();
    const parentContext = useParentDocumentContext();
    const { id:purchaseorder_id } = useParams();
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
                quantity: row.procurement_quantity ?? row.quantity,
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
            <PageBreadcrumb pageTitle="Procurement / Purchase Order Items" />
            <ParentDocumentContext context={parentContext} />
            
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