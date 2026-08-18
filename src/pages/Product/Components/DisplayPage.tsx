// src/pages/Procurement/Requisitions.tsx

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { columnBuilder } from '../../../actions/common';
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import Tables from '../../../components/table/index.jsx';
import Loader from '../../../components/ui/Loader';
import DynamicForm from "../../../components/ui/DynamicForm";
import { TableActionDocument } from '../../../components/ui/TableActionDocument.js';
import { InfoPanel } from '../../../components/ui/InfoPanel';
import { FilterSection } from '../../../components/ui/FilterSection.js';
import { AddIcon, BackIcon, FilterIcon, InfoIcon, ReloadIcon } from '../../../components/ui/TableIcons';
import useReduxApiData from "../../../hooks/useTanstackQuery.js";
import { 
    getTableFilterConfig,
    getTableDisplayName
} from '../../../utils/functions/tableBuilder';
import { getTableMapping } from '../../../config/tableMapping';

import { 
    processRows, 
    filterData, 
    countActiveFilters 
} from '../../../utils/functions/dataHelpers';
import { REQUISITION_TYPE_OPTIONS} from "../../../utils/constants/common.jsx";
import DisplayPageDetails from "./DisplayPageChild.js";
import { moneyFunction, dateFunction, dateTimeFunction } from "../../../utils/functions/basci.jsx";

// ==================== PROPS INTERFACE ====================
export interface RequisitionsPageProps {
    /** Name of the table in the database */
    table_name: string;
    /** Path/route for the table */
    table_path: string;
    /** Number of records per page */
    page_size: number;
    /** Document type identifier (1 = Requisition, 2 = Purchase Order, etc.) */
    document_type: number;
    /** Code prefix for document numbering (e.g., 'REQ', 'PO') */
    page_code: string;
    /** Column visibility configuration - optional, will use defaults if not provided */
    columnVisibility?: ColumnVisibility;
}

export interface ColumnVisibility {
    [key: string]: boolean;
}

// ==================== TABLE DATA ====================
const table_data = [
    // Primary & Hidden Fields
    {label: 'ID', name:'id', type:'text', showTable: false, editable:false, element:null},
    {label: 'PR Number', name:'pr_id', type:'text', showTable: true, editable:false, element:null},
    {label: 'Title', name:'title', type:'text', showTable: true, editable:true, element:null},
    {label: 'Description', name:'description', type:'textarea', showTable: false, editable:true, element:null},
    {label: 'Budget', name:'budget_id', type:'select', showTable: false, editable:true, element:null},
    {label: 'Budget Name', name:'budget_name', type:'text', showTable: true, editable:false, element:null},
    {label: 'Requester', name:'requester_id', type:'select', showTable: false, editable:true, element:null},
    {label: 'Requester Name', name:'requester_name', type:'text', showTable: true, editable:false, element:null},
    {label: 'Department', name:'department_id', type:'select', showTable: false, editable:true, element:null},
    {label: 'Department Name', name:'department_name', type:'text', showTable: true, editable:false, element:null},
    {label: 'Vendor', name:'vendor_id', type:'select', showTable: false, editable:true, element:null},
    {label: 'Vendor Name', name:'vendor_name', type:'text', showTable: true, editable:false, element:null},
    {label: 'Location', name:'location_id', type:'select', showTable: false, editable:true, element:null},
    {label: 'Location Name', name:'location_name', type:'text', showTable: true, editable:false, element:null},
    {label: 'Total Amount', name:'total_amount', type:'number', showTable: true, editable:true, element:null, format:(e)=>moneyFunction(e)},
    {label: 'Record Amount', name:'total_amount_record', type:'number', showTable: true, editable:true, element:null, format:(e)=>moneyFunction(e)},
    {label: 'Total Count', name:'total_count_number', type:'number', showTable: true, editable:true, element:null},
    {label: 'Currency', name:'currency_id', type:'select', showTable: false, editable:true, element:null},
    {label: 'Currency Name', name:'currency_name', type:'select', showTable: false, editable:false, element:null},
    {label: 'Priority', name:'priority_name', type:'select', showTable: true, editable:true, element:null},
    {label: 'Status', name:'status_name', type:'select', showTable: true, editable:false, element:null},
    {label: 'Approver', name:'approver_id', type:'select', showTable: false, editable:true, element:null},
    {label: 'Approver Name', name:'approver_name', type:'text', showTable: true, editable:false, element:null},
    {label: 'Approval Date', name:'approve_date', type:'datetime', showTable: true, editable:false, element:null},
    {label: 'Approval Workflow', name:'approval_workflow_id', type:'select', showTable: false, editable:true, element:null},
    {label: 'Workflow Name', name:'approval_workflow_name', type:'text', showTable: true, editable:false, element:null},
    {label: 'Current Approval Level', name:'current_approval_level', type:'number', showTable: false, editable:false, element:null},
    {label: 'Expected Delivery Date', name:'expected_delivery_date', type:'date', showTable: true, editable:true, element:null},
    {label: 'Notes', name:'notes', type:'textarea', showTable: false, editable:true, element:null},
    {label: 'Created Date', name:'created_at', type:'datetime', showTable: true, editable:false, element:null},
    {label: 'Created By', name:'created_by_id', type:'select', showTable: false, editable:false, element:null},
    {label: 'Created By Name', name:'created_by_name', type:'text', showTable: true, editable:false, element:null},
    {label: 'Updated Date', name:'updated_at', type:'datetime', showTable: false, editable:false, element:null},
    {label: 'Updated By', name:'updated_by_id', type:'select', showTable: false, editable:false, element:null},
    {label: 'Updated By Name', name:'updated_by_name', type:'text', showTable: true, editable:false, element:null}
];

// ==================== DEFAULT COLUMN VISIBILITY ====================
// All *_id and id fields are set to false
const DEFAULT_COLUMN_VISIBILITY: ColumnVisibility = {
    id: false,
    pr_id: true,
    title: true,
    budget_id: false,
    budget_name: false,
    requester_id: false,
    requester_name: false,
    department_id: false,
    department_name: false,
    vendor_id: false,
    vendor_name: false,
    location_id: false,
    location_name: false,
    total_amount: true,
    total_amount_record: true,
    total_count_number: false,
    currency_id: false,
    currency_name: false,
    is_capex: false,
    priority_name: true,
    status_name: true,
    approver_id: false,
    approver_name: false,
    approve_date: false,
    approval_workflow_id: false,
    approval_workflow_name: true,
    current_approval_level: false,
    expected_delivery_date: false,
    notes: false,
    created_at: false,
    created_by_id: false,
    created_by_name: false,
    updated_at: false,
    updated_by_id: false,
    updated_by_name: false
};

// ==================== COMPONENT ====================
const DisplayPage: React.FC<RequisitionsPageProps> = (props) => {
    const { 
        table_name, 
        table_path, 
        page_size, 
        document_type, 
        page_code,
        columnVisibility = DEFAULT_COLUMN_VISIBILITY
    } = props;
    
    const nav = useNavigate();
    const { user, location_id } = useSelector((state: any) => state.authReducer);
    const { locations = [], id: user_id } = user || {};
    const locationData = locations || [];

    // ==================== CONSTANTS ====================
    const TABLE_NAME = table_name;
    const TABLE_PATH = table_path;
    const PAGE_SIZE = page_size;
    const DOCUMENT_TYPE = document_type;
    const PAGE_CODE = page_code;

    // ==================== CONFIGURATIONS ====================
    const tableMapping = useMemo(() => getTableMapping(TABLE_NAME), [TABLE_NAME]);
    const filterConfig = useMemo(() => getTableFilterConfig(TABLE_NAME), [TABLE_NAME]);
    const displayName = useMemo(() => getTableDisplayName(TABLE_NAME), [TABLE_NAME]);

    // ==================== REFS FOR DATE PICKERS ====================
    const startDateRef = useRef<HTMLInputElement>(null);
    const endDateRef = useRef<HTMLInputElement>(null);

    // ==================== STATE ====================
    const [page, setPage] = useState<number>(0);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [row, setRow] = useState<any>({});
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [showInfo, setShowInfo] = useState<boolean>(false);
    
    // Date range state
    const [dateRange, setDateRange] = useState<{start: string; end: string}>(() => {
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - 3);
        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        };
    });
    const [isDateRangeApplied, setIsDateRangeApplied] = useState<boolean>(true);

    // ==================== API HOOKS ====================
    const { data, loadQuery, loadUpdate, isLoading } = useReduxApiData({
        table: 'requisitions',
        uniqueKey: TABLE_PATH,
        queryType: 'gets',
        mainParam: { 
            location_id: location_id || 0, 
            requisition_type: DOCUMENT_TYPE,
            ...(isDateRangeApplied && dateRange.start && dateRange.end ? {
                start_date: dateRange.start,
                end_date: dateRange.end
            } : {})
        },
        narration: `get all ${displayName}`
    });

    const { 
        data: userData, 
        loadQuery: loadUserData,
    } = useReduxApiData({
        table: "users",
        uniqueKey: 'user',
        queryType: 'getUserData',
        mainParam: { location_id: location_id || null },
        narration: 'get all users data'
    });

    const { 
        data: departmentData, 
        loadQuery: loadDepartmentData,
    } = useReduxApiData({
        table: "commons",
        uniqueKey: 'department',
        queryType: 'gets',
        mainParam: { is_active: 1, grp: 2 },
        narration: 'get all departments data'
    });

    const { 
        data: vendorData, 
        loadQuery: loadVendorData,
    } = useReduxApiData({
        table: "commons",
        uniqueKey: 'vendor',
        queryType: 'gets',
        mainParam: { is_active: 1, grp: 8 },
        narration: 'get all vendors data'
    });

    const { 
        data: budgetData, 
        loadQuery: loadBudgetData,  
    } = useReduxApiData({
        table: "budgets",
        uniqueKey: 'budget',
        queryType: 'gets',
        mainParam: { is_active: 1 },
        narration: 'get all budgets data'
    });

    const { 
        data: currencyData, 
        loadQuery: loadCurrencyData,  
    } = useReduxApiData({
        table: "commons",
        uniqueKey: 'currency',
        queryType: 'gets',
        mainParam: { is_active: 1, grp: 6 },
        narration: 'get all currencies data'
    });

    const { 
        data: statusData, 
        loadQuery: loadstatusData,
    } = useReduxApiData({
        table: "commons",
        uniqueKey: 'status',
        queryType: 'gets',
        mainParam: { is_active: 1, grp: 13 },
        narration: 'get all statuses data'
    });

    const { 
        data: priorityData, 
        loadQuery: loadpriorityData,
    } = useReduxApiData({
        table: "commons",
        uniqueKey: 'priority',
        queryType: 'gets',
        mainParam: { is_active: 1, grp: 14 },
        narration: 'get all priorities data'
    });

    // ==================== OPTION LABEL HELPERS ====================
    const getOptionLabel = useCallback((value: string, options: any[]): string => {
        const option = options.find(opt => opt.value === value);
        return option ? option.label : value;
    }, []);

    // ==================== DATE PICKER HELPERS ====================
    const openDatePicker = useCallback((ref: React.RefObject<HTMLInputElement>): void => {
        if (ref.current) {
            try {
                if ('showPicker' in ref.current) {
                    (ref.current as any).showPicker();
                } else {
                    ref.current?.click();
                    ref.current?.focus();
                }
            } catch (error) {
                ref.current.click();
                ref.current.focus();
            }
        }
    }, []);

    // ==================== HANDLERS ====================
    const onAdd = useCallback((): void => {
        setIsEdit(false);
        setRow({});
        setPage(1);
    }, []);

    const onEdit = useCallback((row: any): void => {
        setIsEdit(true);
        setRow(row);
        setPage(1);
    }, []);

    const onDelete = useCallback((row: any): void => {
        if (window.confirm(`Are you sure you want to delete ${displayName} ${row.pr_id || row.id}?`)) {
            loadUpdate({ id: row.id, cat: 'delete' });
        }
    }, [displayName]);

    const onActivate = useCallback((row: any): void => {
        const { id, is_active } = row;
        loadUpdate({ id, cat: 'insert', is_active: is_active === 0 ? 1 : 0 });
    }, []);

    const onDeactivate = useCallback((): void => {
        const { id, is_active } = row;
        loadUpdate({ id, cat: 'insert', is_active: is_active === 0 ? 1 : 0 });
    }, [row]);

    const onNext = useCallback((row: any): void => {
        nav(`/procurement/${TABLE_PATH}/${row.id}`);
    }, [nav]);

    const onView = useCallback((row: any): void => {
        console.log(row)
        setRow(row);
        setIsEdit(false);
        setPage(2);
    }, []);

    const handleSave = useCallback((formData: any): void => {
        formData.created_by_id = user?.id || null;
        formData.requester_id = user?.id || null;
        formData.requisition_type = DOCUMENT_TYPE || null;
        formData.location_id = location_id || 0;
        loadUpdate(formData);
        setPage(0);
    }, [user, location_id, DOCUMENT_TYPE]);

    const handleUpdate = useCallback((formData: any): void => {
        formData.location_id = location_id || 0;
        formData.created_by_id = user?.id;
        formData.requisition_type = DOCUMENT_TYPE || null;
        loadUpdate(formData);
        setPage(0);
    }, [location_id, user?.id, DOCUMENT_TYPE]);

    const handleReload = useCallback((): void => {
        loadQuery();
        loadDepartmentData();
        loadVendorData();
        loadUserData();
        loadBudgetData();
        loadCurrencyData();
        loadstatusData();
        loadpriorityData();
    }, [loadQuery, loadDepartmentData, loadVendorData, loadUserData, loadBudgetData, loadCurrencyData, loadstatusData, loadpriorityData]);

    const handleFilterChange = useCallback((filterName: string, value: any): void => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    }, []);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
        setSearchTerm(e.target.value);
    }, []);

    const clearFilters = useCallback((): void => {
        setFilters({});
        setSearchTerm('');
        // Reset date range to last 3 months
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - 3);
        setDateRange({
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        });
        setIsDateRangeApplied(true);
    }, []);

    const toggleFilters = useCallback((): void => {
        setShowFilters(prev => !prev);
    }, []);

    const toggleInfo = useCallback((): void => {
        setShowInfo(prev => !prev);
    }, []);

    const goBack = useCallback(() => nav(-1), [nav]);

    const handleDateRangeChange = useCallback((type: 'start' | 'end', value: string): void => {
        setDateRange(prev => ({ ...prev, [type]: value }));
    }, []);

    const applyDateRange = useCallback((): void => {
        if (dateRange.start && dateRange.end) {
            setIsDateRangeApplied(true);
            loadQuery();
        }
    }, [dateRange, loadQuery]);

    const submitForApproval = useCallback((formData: any): void => {
        const requestData = {
            id: formData?.id,
            workflow_id: formData?.workflow_id,
            submitted_by: user_id,
            location_id: location_id,
            status_id: formData?.status_id,
            priority_id: formData?.priority_id,
            requisition_type: document_type,
            comment: formData?.comment,
            act: 4,
            cat: "insert"
        };
        loadUpdate(requestData);
    }, [user_id, location_id, row, loadUpdate]);

    const clearDateRange = useCallback((): void => {
        setIsDateRangeApplied(false);
        setDateRange({ start: '', end: '' });
        loadQuery();
    }, [loadQuery]);

    const setQuickDateRange = useCallback((months: number): void => {
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - months);
        setDateRange({
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        });
        setIsDateRangeApplied(true);
        loadQuery();
    }, [loadQuery]);

    // ==================== DATA PROCESSING ====================
    const processedRows = useMemo(() => {
        const rows = processRows(data, TABLE_NAME);
        return rows.map((row: any) => ({
            ...row,
            pr_id: `${PAGE_CODE}-${String(row.location_id || 0).padStart(3, '0')}-${String(row.id || 0).padStart(5, '0')}`,
            requisition_type_name: getOptionLabel(row.requisition_type, REQUISITION_TYPE_OPTIONS),
        }));
    }, [data, TABLE_NAME, PAGE_CODE, getOptionLabel]);

    const filteredRows = useMemo(() => 
        filterData(processedRows, filters, searchTerm, filterConfig), 
        [processedRows, filters, searchTerm, filterConfig]
    );
    
    const activeFilterCount = useMemo(() => 
        countActiveFilters(filters, searchTerm), 
        [filters, searchTerm]
    );

    // ==================== RENDER COMPACT DATE RANGE FILTER ====================
    const renderDateRangeFilter = useCallback(() => (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 border border-gray-200 dark:border-gray-700 mb-4">
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">📅</span>
                
                <div className="flex items-center gap-1">
                    <div className="relative">
                        <input
                            ref={startDateRef}
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => handleDateRangeChange('start', e.target.value)}
                            className="px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-32 cursor-pointer"
                            onFocus={(e) => {
                                const input = e.currentTarget;
                                if ('showPicker' in input) {
                                    try { (input as any).showPicker(); } catch (error) {}
                                }
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => openDatePicker(startDateRef)}
                            className="absolute right-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                            aria-label="Select start date"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>
                    
                    <span className="text-xs text-gray-400 dark:text-gray-500">→</span>
                    
                    <div className="relative">
                        <input
                            ref={endDateRef}
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => handleDateRangeChange('end', e.target.value)}
                            className="px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-32 cursor-pointer"
                            onFocus={(e) => {
                                const input = e.currentTarget;
                                if ('showPicker' in input) {
                                    try { (input as any).showPicker(); } catch (error) {}
                                }
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => openDatePicker(endDateRef)}
                            className="absolute right-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                            aria-label="Select end date"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setQuickDateRange(3)}
                        className="px-2 py-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors whitespace-nowrap"
                    >
                        3M
                    </button>
                    <button
                        onClick={() => setQuickDateRange(12)}
                        className="px-2 py-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors whitespace-nowrap"
                    >
                        12M
                    </button>
                    <button
                        onClick={() => setQuickDateRange(24)}
                        className="px-2 py-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors whitespace-nowrap"
                    >
                        24M
                    </button>
                </div>

                <div className="flex items-center gap-1 ml-auto">
                    <button
                        onClick={applyDateRange}
                        disabled={!dateRange.start || !dateRange.end}
                        className={`px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-colors whitespace-nowrap ${
                            dateRange.start && dateRange.end
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    >
                        Apply
                    </button>
                    <button
                        onClick={clearDateRange}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors whitespace-nowrap"
                    >
                        Clear
                    </button>
                </div>
            </div>

            <div className="mt-1.5 flex items-center gap-2">
                {isDateRangeApplied && dateRange.start && dateRange.end ? (
                    <>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                            📆 {new Date(dateRange.start).toLocaleDateString()} — {new Date(dateRange.end).toLocaleDateString()}
                        </span>
                        <span className="px-1.5 py-0.5 text-[9px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                            Active
                        </span>
                    </>
                ) : (
                    <>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">📆 All data</span>
                        <span className="px-1.5 py-0.5 text-[9px] font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full">
                            All
                        </span>
                    </>
                )}
                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    {filteredRows.length} records
                </span>
            </div>
        </div>
    ), [dateRange, handleDateRangeChange, openDatePicker, setQuickDateRange, applyDateRange, clearDateRange, isDateRangeApplied, filteredRows.length]);

    // ==================== FORMATTED OPTIONS ====================
    const formattedSelectRows = useMemo(() => {
        const safeData = (data: unknown): any[] => Array.isArray(data) ? data : [];

        const formatOptions = (items: any[], labelKey: string, valueKey: string) => {
            return items.map((item: any) => ({
                label: item[labelKey] || item.name || '',
                value: item[valueKey] || item.id || '',
            }));
        };

        return {
            users: formatOptions(safeData(userData), 'name', 'id'),
            locations: formatOptions(safeData(locationData), 'name', 'id'),
            vendors: formatOptions(safeData(vendorData), 'name', 'id'),
            departments: formatOptions(safeData(departmentData), 'name', 'id'),
            requisition_status: formatOptions(safeData(statusData), 'name', 'id'),
            priorities: formatOptions(safeData(priorityData), 'name', 'id'),
            requisition_types: REQUISITION_TYPE_OPTIONS,
            budgets: formatOptions(safeData(budgetData), 'budget_name', 'id'),
            currencies: formatOptions(safeData(currencyData), 'name', 'id')
        };
    }, [locationData, userData, vendorData, departmentData, statusData, priorityData, budgetData, currencyData]);

    // ==================== COLUMNS ====================
    const columns = useMemo(() => {
        return columnBuilder(
            { table_action: TableActionDocument, table_data: table_data },
            { onNext, onView, onActivate, onEdit, onDelete }
        );
    }, [table_data, onNext, onView, onActivate, onEdit, onDelete]);

    // ==================== EFFECTS ====================
    useEffect(() => {
        handleReload();
    }, [location_id]);

    // ==================== RENDER ====================
    return (
        <>
            <PageBreadcrumb pageTitle={displayName} />
            
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
                                    {/* Date Range Filter */}
                                    {renderDateRangeFilter()}
                                    <FilterSection
                                        show={showFilters}
                                        filterConfig={filterConfig}
                                        filters={filters}
                                        searchTerm={searchTerm}
                                        onSearchChange={handleSearchChange}
                                        onFilterChange={handleFilterChange}
                                        onClearFilters={clearFilters}
                                        OPTION_DATA={formattedSelectRows}
                                    />

                                    <Tables
                                        onAdd={onAdd}
                                        reload={handleReload}
                                        home={() => nav(-1)}
                                        rows={filteredRows}
                                        columns={columns}
                                        pageSize={PAGE_SIZE}
                                        cV={columnVisibility}
                                    />
                                </>
                            ) : null}
                            {page === 1 ? (
                                <div className="space-y-6">
                                    <DynamicForm
                                        tableName={TABLE_NAME}
                                        title={isEdit ? `Edit ${displayName}` : `Create ${displayName}`}
                                        submitLabel={isEdit ? `Update ${displayName}` : `Create ${displayName}`}
                                        onSave={isEdit ? handleUpdate : handleSave}
                                        initialData={row}
                                        onCancel={() => setPage(0)}
                                        optionData={formattedSelectRows}
                                    />
                                </div>
                            ) : null}
                            {page === 2 ? (
                                <DisplayPageDetails
                                    document={row}
                                    documentTypeId={document_type}
                                    onClose={() => setPage(0)}
                                    onDeactivate={onDeactivate}
                                    deactivateLoading={false}
                                    title={`${displayName} Details`}
                                    showDeactivate={true}
                                    statusData={statusData || []}
                                    priorityData={priorityData || []}
                                    onSubmitForApproval={submitForApproval}
                                />
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

export default DisplayPage;