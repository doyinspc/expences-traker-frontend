// src/pages/Procurement/Requisitions.tsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { columnBuilder } from '../../actions/common';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Tables from '../../components/table/index.jsx';
import Loader from '../../components/ui/Loader';
import RequisitionitemForm from "./RequistiontemForm.jsx";
import { TableAction } from '../../components/ui/TableAction';
import { InfoPanel } from '../../components/ui/InfoPanel';
import { TabNavigation } from '../../components/ui/TabNavigation';
import { AddIcon, BackIcon, FilterIcon, InfoIcon, ReloadIcon } from '../../components/ui/TableIcons';
import useReduxApiData from "../../hooks/useTanstackQuery.js";
import { 
    getTableDisplayName
} from '../../utils/functions/tableBuilder';
import { getTableMapping } from '../../config/tableMapping';

import { 
    processRows, 
    filterData, 
    countActiveFilters 
} from '../../utils/functions/dataHelpers';
import RequisitionView from "./Components/ItemsTable.js";
import { STATUS_OPTIONS } from "../../utils/constants/common.jsx";
import { getTitleRow, numberFunction } from "../../utils/functions/basci.jsx";
import Swal from "sweetalert2";

// ==================== TABLE CONFIGURATION ====================
const table_data = [
    // Primary & Hidden Fields
    {label: 'ID', name:'id', type:'hidden', showTable: false, editable:false, element:null},
    {label: 'Requisition ID', name:'requisition_id', type:'number', showTable: false, editable:false, element:null},
    {label: 'Requisition Number', name:'pr_id', type:'text', showTable: true, editable:false, element:null},
    {label: 'Purchase Order ID', name:'purchaseorder_id', type:'number', showTable: false, editable:true, element:null},
    {label: 'PO Number', name:'po_number', type:'text', showTable: true, editable:false, element:null},
    
    // Category
    {label: 'Category ID', name:'category_id', type:'select', showTable: false, editable:true, element:null},
    {label: 'Category', name:'category_name', type:'text', showTable: true, editable:false, element:null},
    
    // Item
    {label: 'Item ID', name:'item_id', type:'text', showTable: false, editable:true, element:null},
    {label: 'Item', name:'item_name', type:'text', showTable: true, editable:false, element:null},
    
    // Pricing
    {label: 'Quantity', name:'quantity', type:'number', showTable: true, editable:true, element:null},
    {label: 'Unit Price', name:'unit_price', type:'number', showTable: true, editable:true, element:null, format:(e)=>numberFunction(e)},
    {label: 'Total Price', name:'total_price', type:'number', showTable: true, editable:false, element:null, format:(e)=>numberFunction(e)},
    {label: 'SKU', name:'sku_id', type:'number', showTable: true, editable:false, element:null},
    
    // Delivery
    {label: 'Delivery Required By', name:'delivery_required_by', type:'date', showTable: true, editable:true, element:null},
    {label: 'Special Instructions', name:'special_instructions', type:'textarea', showTable: false, editable:true, element:null},
    
    // Resolution
    {label: 'Resolved', name:'resolved', type:'select', showTable: true, editable:false, element:null},
    {label: 'Resolved Date', name:'resolved_date', type:'datetime', showTable: true, editable:false, element:null},
    {label: 'Resolved By ID', name:'resolved_by_id', type:'select', showTable: false, editable:false, element:null},
    {label: 'Resolved By', name:'resolved_by_name', type:'text', showTable: true, editable:false, element:null},
    
    // Approval
    {label: 'Approved By ID', name:'approved_by_id', type:'select', showTable: false, editable:false, element:null},
    {label: 'Approved By', name:'approved_by_name', type:'text', showTable: true, editable:false, element:null},
    {label: 'Approved Date', name:'approved_date', type:'datetime', showTable: true, editable:false, element:null},
    {label: 'Approval Status', name:'approval_status', type:'select', showTable: true, editable:false, element:null},
    
    // Audit
    {label: 'Created At', name:'created_at', type:'datetime', showTable: true, editable:false, element:null},
    {label: 'Created By ID', name:'created_by_id', type:'select', showTable: false, editable:false, element:null},
    {label: 'Created By', name:'created_by_name', type:'text', showTable: true, editable:false, element:null},
    {label: 'Updated At', name:'updated_at', type:'datetime', showTable: false, editable:false, element:null},
    {label: 'Updated By ID', name:'updated_by_id', type:'select', showTable: false, editable:false, element:null},
    {label: 'Updated By', name:'updated_by_name', type:'text', showTable: true, editable:false, element:null}
];

// Column visibility settings - simple boolean key-value pairs
const columnVisibility = {
    // Hidden IDs
    id: false,
    requisition_id: false,
    purchaseorder_id: false,
    category_id: false,
    item_id: false,
    resolved_by_id: false,
    approved_by_id: false,
    created_by_id: false,
    updated_by_id: false,
    
    // Shown Names/Display Fields
    requisition_number: true,
    po_number: true,
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
    created_at: false,
    created_by_name: false,
    updated_at: false,
    updated_by_name: false
};

// ==================== CONSTANTS ====================
const TABLE_NAME = "requisitionitems";
const PAGE_SIZE = 500;
type TabType = 'table' | 'analysis';

// ==================== ANALYSIS METRICS INTERFACE ====================
interface AnalysisMetrics {
    totalItems: number;
    totalQuantity: number;
    totalValue: number;
    averageUnitPrice: number;
    itemsApproved: number;
    itemsPending: number;
    itemsRejected: number;
    uniqueCategories: number;
    uniqueItems: number;
    topCategories: Array<{name: string; count: number; value: number}>;
    topItems: Array<{name: string; quantity: number; value: number}>;
    approvalRate: number;
    totalValueByCategory: Array<{category: string; value: number}>;
}

// ==================== COMPONENT ====================
const Requisitions: React.FC = () => {
    const nav = useNavigate();
    const {id:requisition_id} = useParams()
    const { user, location_id } = useSelector((state: any) => state.authReducer);
     const {id:user_id} = user
    const parent_row = getTitleRow(1)
    const {currency_name = 'NGN', title} = parent_row || {}

    // ==================== STATE ====================
    const [page, setPage] = useState<number>(0);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [row, setRow] = useState<any>({});
    const [activeTab, setActiveTab] = useState<TabType>('table');
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [showInfo, setShowInfo] = useState<boolean>(false);
    const [showAnalysis, setShowAnalysis] = useState<boolean>(true);

    // ==================== API HOOKS ====================
    const { data, loadQuery, loadUpdate, isLoading } = useReduxApiData({
        table: TABLE_NAME,
        pth: 'requisitionitem',
        queryType: 'gets',
        mainParam: { requisition_id: requisition_id || 0 },
        narration: 'get all purchase requisitions'
    });


    // ==================== OPTION LABEL HELPERS ====================
    const getOptionLabel = useCallback((value: string, options: any[]) => {
        const option = options.find(opt => opt.value === value);
        return option ? option.label : value;
    }, []);

    // ==================== HANDLERS ====================
    const onAdd = useCallback((): void => {
        setIsEdit(true);
        setRow({});
        setPage(1);
    }, []);

    const onEdit = useCallback((row: any): void => {
        setIsEdit(true);
        setRow(row);
        setPage(1);
    }, []);

    const onDelete = useCallback((row: any): void => {
        if (
            window.confirm(`Are you sure you want to delete requisition ${row.pr_id || row.id}?`)
        && row.approved == 0 && row.resolved == 0) 
            {
            loadUpdate({ id: row.id, act:3, cat: 'insert' });
        }else{
            Swal
        }
    }, [loadUpdate]);

    const onActivate = useCallback((row: any): void => {
        const { id, is_active } = row;
        loadUpdate({ id, cat: 'insert', is_active: is_active === 0 ? 1 : 0 });
    }, [loadUpdate]);

    const onDeactivate = useCallback((): void => {
        const { id, is_active } = row;
        loadUpdate({ id, cat: 'insert', is_active: is_active === 0 ? 1 : 0 });
    }, [loadUpdate, row]);

    const onNext = useCallback((row: any): void => {
        nav(`/procurement/requisitions/${row.id}`);
    }, [nav]);

    const onView = useCallback((row: any): void => {
        setRow(row);
        setIsEdit(false);
        setPage(2);
    }, []);

    const handleSave = useCallback((formData: any): void => {
        formData.created_by_id = user?.id || null;
        formData.location_id = location_id || 0;
        loadUpdate(formData);
        setPage(0);
    }, [loadUpdate, user, location_id]);

    const handleUpdate = useCallback((formData: any): void => {
        formData.location_id = location_id || 0;
        formData.created_by_id = user_id;
        loadUpdate(formData);
        setPage(0);
    }, [loadUpdate, location_id, user_id]);

    const handleReload = useCallback((): void => {
        loadQuery();
    }, []);

    const handleTabChange = useCallback((tab: TabType): void => {
        setActiveTab(tab);
    }, []);

    const toggleFilters = useCallback((): void => {
        setShowFilters(prev => !prev);
    }, []);

    const toggleInfo = useCallback((): void => {
        setShowInfo(prev => !prev);
    }, []);

    const toggleAnalysis = useCallback((): void => {
        setShowAnalysis(prev => !prev);
    }, []);

    const goBack = useCallback(() => nav(-1), [nav]);

    // ==================== CONFIGURATIONS ====================
    const tableMapping = useMemo(() => getTableMapping(TABLE_NAME), []);
    const displayName = useMemo(() => getTableDisplayName(TABLE_NAME), []);

    // ==================== DATA PROCESSING ====================
    const processedRows = useMemo(() => {
        const rows = processRows(data, TABLE_NAME);
        return rows.map((row: any) => ({
            ...row,
            pr_id: `RQ-${String(row.requisition_id || 0).padStart(3, '0')}-${String(row.id || 0).padStart(5, '0')}`,
            status: getOptionLabel(row.status, STATUS_OPTIONS)
        }));
    }, [data, getOptionLabel]);

    const filteredRows = useMemo(() => 
        filterData(processedRows, filters, searchTerm), 
        [processedRows, filters, searchTerm]
    );
    
    const activeFilterCount = useMemo(() => 
        countActiveFilters(filters, searchTerm), 
        [filters, searchTerm]
    );

    // ==================== ANALYSIS METRICS ====================
    const analysisMetrics = useMemo((): AnalysisMetrics => {
        const metrics: AnalysisMetrics = {
            totalItems: 0,
            totalQuantity: 0,
            totalValue: 0,
            averageUnitPrice: 0,
            itemsApproved: 0,
            itemsPending: 0,
            itemsRejected: 0,
            uniqueCategories: 0,
            uniqueItems: 0,
            topCategories: [],
            topItems: [],
            approvalRate: 0,
            totalValueByCategory: []
        };

        if (!filteredRows || filteredRows.length === 0) {
            return metrics;
        }

        const categoryMap = new Map<string, {count: number; value: number}>();
        const itemMap = new Map<string, {quantity: number; value: number}>();
        let totalQuantity = 0;
        let totalValue = 0;
        let totalUnitPrices = 0;
        let priceCount = 0;
        let approvedCount = 0;
        let pendingCount = 0;
        let rejectedCount = 0;

        filteredRows.forEach((row: any) => {
            const quantity = Number(row.quantity) || 0;
            const unitPrice = Number(row.unit_price) || 0;
            const totalPrice = Number(row.total_price) || 0;
            const category = row.category_name || 'Uncategorized';
            const itemName = row.item_name || 'Unknown Item';
            const approvalStatus = row.approval_status || 'pending';

            // Basic metrics
            totalQuantity += quantity;
            totalValue += totalPrice || (quantity * unitPrice);
            
            if (unitPrice > 0) {
                totalUnitPrices += unitPrice;
                priceCount++;
            }

            // Approval status tracking
            const statusLower = approvalStatus.toLowerCase();
            if (statusLower === 'approved' || statusLower === '1' || statusLower === 'true') {
                approvedCount++;
            } else if (statusLower === 'pending' || statusLower === '' || statusLower === '0' || statusLower === 'false') {
                pendingCount++;
            } else if (statusLower === 'rejected' || statusLower === '2') {
                rejectedCount++;
            } else {
                // Default to pending if unknown
                pendingCount++;
            }

            // Category tracking
            if (categoryMap.has(category)) {
                const existing = categoryMap.get(category)!;
                categoryMap.set(category, {
                    count: existing.count + 1,
                    value: existing.value + (totalPrice || (quantity * unitPrice))
                });
            } else {
                categoryMap.set(category, {
                    count: 1,
                    value: totalPrice || (quantity * unitPrice)
                });
            }

            // Item tracking
            if (itemMap.has(itemName)) {
                const existing = itemMap.get(itemName)!;
                itemMap.set(itemName, {
                    quantity: existing.quantity + quantity,
                    value: existing.value + (totalPrice || (quantity * unitPrice))
                });
            } else {
                itemMap.set(itemName, {
                    quantity: quantity,
                    value: totalPrice || (quantity * unitPrice)
                });
            }
        });

        // Calculate derived metrics
        metrics.totalItems = filteredRows.length;
        metrics.totalQuantity = totalQuantity;
        metrics.totalValue = totalValue;
        metrics.averageUnitPrice = priceCount > 0 ? totalUnitPrices / priceCount : 0;
        metrics.itemsApproved = approvedCount;
        metrics.itemsPending = pendingCount;
        metrics.itemsRejected = rejectedCount;
        metrics.uniqueCategories = categoryMap.size;
        metrics.uniqueItems = itemMap.size;
        metrics.approvalRate = metrics.totalItems > 0 ? (approvedCount / metrics.totalItems) * 100 : 0;

        // Top categories (by count)
        metrics.topCategories = Array.from(categoryMap.entries())
            .map(([name, data]) => ({ name, count: data.count, value: data.value }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Top items (by quantity)
        metrics.topItems = Array.from(itemMap.entries())
            .map(([name, data]) => ({ name, quantity: data.quantity, value: data.value }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        // Total value by category
        metrics.totalValueByCategory = Array.from(categoryMap.entries())
            .map(([category, data]) => ({ category, value: data.value }))
            .sort((a, b) => b.value - a.value);

        return metrics;
    }, [filteredRows]);

    // ==================== RENDER ANALYSIS SECTION ====================
    const renderAnalysisSection = () => {
        const metrics = analysisMetrics;
        const currency = currency_name || 'NGN';
        
        return (
            <div className="mt-8 space-y-6">
                {/* Analysis Header with Toggle */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            📊 Requisition Analysis
                        </h2>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({metrics.totalItems} items analyzed)
                        </span>
                    </div>
                    <button
                        onClick={toggleAnalysis}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        {showAnalysis ? 'Hide Details' : 'Show Details'}
                    </button>
                </div>

                {showAnalysis && (
                    <>
                        {/* Top Analysis Cards */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Items</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                            {metrics.totalItems.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <span>Across {metrics.uniqueCategories} categories</span>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                            {currency} {metrics.totalValue.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0-1v1m0 1v1m0 1v1" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <span>Total quantity: {metrics.totalQuantity.toLocaleString()} units</span>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Approval Rate</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                            {metrics.approvalRate.toFixed(1)}%
                                        </p>
                                    </div>
                                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <span>{metrics.itemsApproved} approved · {metrics.itemsPending} pending</span>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Unit Price</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                            {currency} {metrics.averageUnitPrice.toLocaleString(undefined, {maximumFractionDigits: 2})}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                        <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <span>{metrics.uniqueItems} unique items</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Analysis Section - Top Categories & Items */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Top Categories */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Top Categories
                                    </h3>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {metrics.uniqueCategories} total
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {metrics.topCategories.length > 0 ? (
                                        metrics.topCategories.map((category, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center justify-center w-6 h-6 text-xs font-medium text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                                                        {index + 1}
                                                    </span>
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">{category.name}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        {category.count} items
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {currency} {category.value.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No categories data available</p>
                                    )}
                                </div>
                            </div>

                            {/* Top Items */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Most Requested Items
                                    </h3>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {metrics.uniqueItems} total
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {metrics.topItems.length > 0 ? (
                                        metrics.topItems.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center justify-center w-6 h-6 text-xs font-medium text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                                                        {index + 1}
                                                    </span>
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        {item.quantity} units
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {currency} {item.value.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No items data available</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Approval Status Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Approved</p>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {metrics.itemsApproved}
                                        </p>
                                    </div>
                                    <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded">
                                        <span className="text-xs font-medium text-green-700 dark:text-green-300">
                                            {metrics.totalItems > 0 ? ((metrics.itemsApproved / metrics.totalItems) * 100).toFixed(1) : 0}%
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                    <div 
                                        className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                                        style={{ width: `${metrics.totalItems > 0 ? (metrics.itemsApproved / metrics.totalItems) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
                                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                            {metrics.itemsPending}
                                        </p>
                                    </div>
                                    <div className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                                        <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                                            {metrics.totalItems > 0 ? ((metrics.itemsPending / metrics.totalItems) * 100).toFixed(1) : 0}%
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                    <div 
                                        className="bg-yellow-500 h-1.5 rounded-full transition-all duration-500"
                                        style={{ width: `${metrics.totalItems > 0 ? (metrics.itemsPending / metrics.totalItems) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Rejected</p>
                                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                            {metrics.itemsRejected}
                                        </p>
                                    </div>
                                    <div className="px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded">
                                        <span className="text-xs font-medium text-red-700 dark:text-red-300">
                                            {metrics.totalItems > 0 ? ((metrics.itemsRejected / metrics.totalItems) * 100).toFixed(1) : 0}%
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                    <div 
                                        className="bg-red-500 h-1.5 rounded-full transition-all duration-500"
                                        style={{ width: `${metrics.totalItems > 0 ? (metrics.itemsRejected / metrics.totalItems) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    };

    // ==================== EFFECTS ====================
    useEffect(() => {
        handleReload();
    }, [location_id]);

    // ==================== COLUMNS ====================
    const columns = useMemo(() => {
        return columnBuilder(
            { table_action: TableAction, table_data: table_data },
            { onNext, onView, onActivate, onEdit, onDelete }
        );
    }, [table_data, onNext, onView, onActivate, onEdit, onDelete]);

    // ==================== RENDER ====================
    return (
        <>
            <PageBreadcrumb pageTitle={`${displayName} : ${title}` } />
            
            {/* Header */}
            <div className="flex items-center justify-end gap-2 mb-4">
                {activeFilterCount > 0 && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-auto">
                        {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}
                    </span>
                )}
                <button
                    onClick={toggleFilters}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        showFilters || activeFilterCount > 0
                            ? 'bg-brand-500 text-white hover:bg-brand-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                >
                    <FilterIcon />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={goBack}
                    className="p-2 rounded-lg transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Go Back"
                >
                    <BackIcon />
                </button>
                <button
                    onClick={onAdd}
                    className="p-2 rounded-lg transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Add New Record"
                >
                    <AddIcon />
                </button>
                <button
                    onClick={handleReload}
                    className="p-2 rounded-lg transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Reload Data"
                >
                    <ReloadIcon />
                </button>
                <button
                    onClick={toggleInfo}
                    className={`p-2 rounded-lg transition-colors ${
                        showInfo
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    title="Page Information"
                >
                    <InfoIcon />
                </button>
            </div>

            {/* Info Panel */}
            <InfoPanel
                show={showInfo}
                tableMapping={tableMapping}
                filterableFields={[]}
                analyzableFields={[]}
                analysisConfig={null}
                onClose={toggleInfo}
            />

            <div className="space-y-6">
                <div className="p-1">
                    {!isLoading ? (
                        <>
                            {page === 0 ? (
                                <>
                                    <TabNavigation
                                        activeTab={activeTab}
                                        onTabChange={handleTabChange}
                                        hasAnalysis={false}
                                        recordCount={filteredRows.length}
                                    />

                                    {activeTab === 'table' && (
                                        <>
                                            <Tables
                                                onAdd={onAdd}
                                                reload={handleReload}
                                                home={() => nav(-1)}
                                                rows={filteredRows}
                                                columns={columns}
                                                pageSize={PAGE_SIZE}
                                                cV={columnVisibility}
                                            />
                                            
                                            {/* ANALYSIS BELOW TABLE */}
                                            {renderAnalysisSection()}
                                        </>
                                    )}

                                    {activeTab === 'analysis' && (
                                        <div className="mt-4">
                                            {/* Analysis feature is disabled */}
                                        </div>
                                    )}
                                </>
                            ) : null}
                            {page === 1 ? (
                                <div className="space-y-6">
                                    <RequisitionitemForm
                                        requisitionId={requisition_id || null}
                                        parent_row={parent_row}
                                        onSave={isEdit ? handleUpdate : handleSave}
                                        initialData={row}
                                        onCancel={() => setPage(0)}
                                        onError={()=>{}}
                                    />
                                </div>
                            ) : null}
                            {page === 2 ? (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                                    <div className="w-full max-w-2xl">
                                        <RequisitionView
                                            requisition={row}
                                            onClose={() => setPage(0)}
                                            onDeactivate={onDeactivate}
                                            deactivateLoading={false}
                                            title="Requisition Details"
                                            showDeactivate={true}
                                        />
                                    </div>
                                </div>
                            ) : null}
                        </>
                    ) : (
                        <Loader
                            overlay
                            backdropColor="dark"
                            color="text-white"
                            variant="spinner"
                            text="Processing ..."
                            textClassName="text-white/90"
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default Requisitions;