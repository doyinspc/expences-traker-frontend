// src/pages/Procurement/Requisitions.tsx

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { columnBuilder } from '../../actions/common';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Tables from '../../components/table/index.jsx';
import Loader from '../../components/ui/Loader';
import DynamicForm from "../../components/ui/DynamicForm";
import { TableAction } from '../../components/ui/TableAction';
import { InfoPanel } from '../../components/ui/InfoPanel';
import { FilterSection } from '../../components/ui/FilterSection.js';
import { TabNavigation } from '../../components/ui/TabNavigation';
import { AddIcon, BackIcon, FilterIcon, InfoIcon, ReloadIcon } from '../../components/ui/TableIcons';
import useReduxApiData from "../../hooks/useTanstackQuery.js";
import { 
    getTableFilterConfig,
    getTableAnalysisConfig,
    getAnalyzableFields,
    getFilterableFields,
    getAvailableMetrics,
    getAvailableDimensions,
    getTableDisplayName
} from '../../utils/functions/tableBuilder';
import { getTableMapping } from '../../config/tableMapping';

import { 
    processRows, 
    filterData, 
    generateAnalysisData, 
    countActiveFilters 
} from '../../utils/functions/dataHelpers';
import RequisitionView from "./RequisitionComponents/RequistionView.js";
import { PRIORITY_OPTIONS, REQUISITION_TYPE_OPTIONS, STATUS_OPTIONS } from "../../utils/constants/common.jsx";
import RequisitionViewWithDetails from "./RequisitionComponents/RequistionViewWithDetails.js";

// ==================== TABLE CONFIGURATION ====================
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
    {label: 'Total Amount', name:'total_amount', type:'number', showTable: true, editable:true, element:null},
    {label: 'Record Amount', name:'total_amount_record', type:'number', showTable: true, editable:true, element:null},
    {label: 'Total Count', name:'total_count_number', type:'number', showTable: true, editable:true, element:null},
    {label: 'Currency', name:'currency_id', type:'select', showTable: false, editable:true, element:null},
    {label: 'Currency Name', name:'currency_name', type:'select', showTable: false, editable:false, element:null},
    {label: 'Is CAPEX?', name:'is_capex', type:'select', showTable: true, editable:true, element:null},
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

// Column visibility settings - simple boolean key-value pairs
const columnVisibility = {
    id: false,
    pr_id: true,
    title: true,
    budget_name: true,
    requester_name: false,
    department_name: true,
    vendor_name: false,
    location_name: false,
    requisition_type: true,
    total_amount: true,
    total_amount_record: true,
    total_count_number: true,
    is_capex: false,
    priority: true,
    status: true,
    approver_name: false,
    approve_date: false,
    approval_workflow_name: false,
    expected_delivery_date: false,
    created_at: false,
    created_by_name: false,
    updated_by_name: false,
    // Hidden by default
    description: false,
    budget_id: false,
    requester_id: false,
    department_id: false,
    vendor_id: false,
    location_id: false,
    currency_id: false,
    currency_name: false,
    approver_id: false,
    approval_workflow_id: false,
    current_approval_level: false,
    notes: false,
    created_by_id: false,
    updated_at: false,
    updated_by_id: false
};

// ==================== CONSTANTS ====================
const TABLE_NAME = "requisitions";
const PAGE_SIZE = 500;
const DOCUMENT_TYPE = 1;
type TabType = 'table' | 'analysis';

// ==================== ANALYSIS METRICS INTERFACE ====================
interface AnalysisMetrics {
    totalRequisitions: number;
    totalAmount: number;
    totalRecordAmount: number;
    totalCountNumber: number;
    averageAmount: number;
    averageRecordAmount: number;
    statusBreakdown: Array<{status: string; count: number; amount: number; recordAmount: number; totalCount: number}>;
    departmentBreakdown: Array<{department: string; count: number; amount: number; recordAmount: number; totalCount: number}>;
    priorityBreakdown: Array<{priority: string; count: number; amount: number; recordAmount: number; totalCount: number}>;
    monthlyTrend: Array<{month: string; count: number; amount: number; recordAmount: number; totalCount: number}>;
    topVendors: Array<{vendor: string; count: number; amount: number; recordAmount: number; totalCount: number}>;
    capexVsOpex: {capex: number; opex: number; capexRecord: number; opexRecord: number};
    approvalRate: number;
    currency: string;
}

// ==================== COMPONENT ====================
const Requisitions: React.FC = () => {
    const nav = useNavigate();
    const { user, location_id } = useSelector((state: any) => state.authReducer);
    const { locations = [], id: user_id } = user || {};
    const locationData = locations || [];
  

    // ==================== REFS FOR DATE PICKERS ====================
    const startDateRef = useRef<HTMLInputElement>(null);
    const endDateRef = useRef<HTMLInputElement>(null);

    // ==================== STATE ====================
    const [page, setPage] = useState<number>(0);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [row, setRow] = useState<any>({});
    const [activeTab, setActiveTab] = useState<TabType>('table');
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
        table: TABLE_NAME,
        uniqueKey: 'requisition',
        queryType: 'gets',
        mainParam: { 
            location_id: location_id || 0, 
            requisition_type: DOCUMENT_TYPE,
            ...(isDateRangeApplied && dateRange.start && dateRange.end ? {
                start_date: dateRange.start,
                end_date: dateRange.end
            } : {})
        },
        narration: 'get all purchase requisitions'
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
        narration: 'get all currencys data'
    });

    const { 
        data: statusData, 
        loadQuery: loadstatusData,
    } = useReduxApiData({
        table: "commons",
        uniqueKey: 'status',
        queryType: 'gets',
        mainParam: { is_active: 1, grp: 13 },
        narration: 'get all statuss data'
    });

    const { 
        data: priorityData, 
        loadQuery: loadpriorityData,
    } = useReduxApiData({
        table: "commons",
        uniqueKey: 'priority',
        queryType: 'gets',
        mainParam: { is_active: 1, grp: 14 },
        narration: 'get all prioritys data'
    });

    // ==================== OPTION LABEL HELPERS ====================
    const getOptionLabel = useCallback((value: string, options: any[]) => {
        const option = options.find(opt => opt.value === value);
        return option ? option.label : value;
    }, []);

    // ==================== DATE PICKER HELPERS ====================
    const openDatePicker = useCallback((ref: React.RefObject<HTMLInputElement>) => {
        if (ref.current) {
            try {
                if ('showPicker' in ref.current) {
                    ref.current.showPicker();
                } else {
                    ref.current.click();
                    ref.current.focus();
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
        if (window.confirm(`Are you sure you want to delete requisition ${row.pr_id || row.id}?`)) {
            loadUpdate({ id: row.id, cat: 'delete' });
        }
    }, []);

    const onActivate = useCallback((row: any): void => {
        const { id, is_active } = row;
        loadUpdate({ id, cat: 'insert', is_active: is_active === 0 ? 1 : 0 });
    }, []);

    const onDeactivate = useCallback((): void => {
        const { id, is_active } = row;
        loadUpdate({ id, cat: 'insert', is_active: is_active === 0 ? 1 : 0 });
    }, [row]);

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
        formData.requester_id = user?.id || null;
        formData.requisition_type = DOCUMENT_TYPE || null;
        formData.location_id = location_id || 0;
        loadUpdate(formData);
        setPage(0);
    }, [user, location_id]);

    const handleUpdate = useCallback((formData: any): void => {
        formData.location_id = location_id || 0;
        formData.created_by_id = user?.id;
        formData.requisition_type = DOCUMENT_TYPE || null;
        loadUpdate(formData);
        setPage(0);
    }, [location_id, user?.id]);

    const handleReload = useCallback((): void => {
        loadQuery();
        loadDepartmentData();
        loadVendorData();
        loadUserData();
        loadBudgetData();
        loadCurrencyData();
        loadstatusData()
        loadpriorityData()
    }, [location_id]);

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

    const handleTabChange = useCallback((tab: TabType): void => {
        setActiveTab(tab);
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
            // Reload with date filter
            loadQuery();
        }
    }, [dateRange]);

    const submitForApproval = (formData: any)=>{
            const requestData = {
                id: formData?.id,
                workflow_id: formData?.workflow_id,
                submitted_by: user_id,
                status_id: formData?.status_id,
                priority_id: formData?.priority_id,
                requisition_type: row?.requisition_type,
                comment: formData?.comment,
                act: 4,
                cat: "insert"
            };

            loadUpdate(requestData);
    };

    const clearDateRange = useCallback((): void => {
        setIsDateRangeApplied(false);
        setDateRange({ start: '', end: '' });
        // Reload without date filter to show all data
        loadQuery();
    }, []);

    const setQuickDateRange = useCallback((months: number): void => {
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - months);
        setDateRange({
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        });
        setIsDateRangeApplied(true);
        // Reload with new date filter
        loadQuery();
    }, []);

    // ==================== CONFIGURATIONS ====================
    const tableMapping = useMemo(() => getTableMapping(TABLE_NAME), []);
    const filterConfig = useMemo(() => getTableFilterConfig(TABLE_NAME), []);
    const analysisConfig = useMemo(() => getTableAnalysisConfig(TABLE_NAME), []);
    const filterableFields = useMemo(() => getFilterableFields(TABLE_NAME), []);
    const analyzableFields = useMemo(() => getAnalyzableFields(TABLE_NAME), []);
    const availableMetrics = useMemo(() => getAvailableMetrics(TABLE_NAME), []);
    const availableDimensions = useMemo(() => getAvailableDimensions(TABLE_NAME), []);
    const displayName = useMemo(() => getTableDisplayName(TABLE_NAME), []);

    // ==================== DATA PROCESSING ====================
    const processedRows = useMemo(() => {
        const rows = processRows(data, TABLE_NAME);
        return rows.map((row: any) => ({
            ...row,
            pr_id: `PR-${String(row.location_id || 0).padStart(3, '0')}-${String(row.id || 0).padStart(5, '0')}`,
            requisition_type_name: getOptionLabel(row.requisition_type, REQUISITION_TYPE_OPTIONS),
        }));
    }, [data, getOptionLabel]);

    const filteredRows = useMemo(() => 
        filterData(processedRows, filters, searchTerm, filterConfig), 
        [processedRows, filters, searchTerm, filterConfig]
    );
    
    const activeFilterCount = useMemo(() => 
        countActiveFilters(filters, searchTerm), 
        [filters, searchTerm]
    );

    // ==================== ANALYSIS METRICS ====================
    const analysisMetrics = useMemo((): AnalysisMetrics => {
        const metrics: AnalysisMetrics = {
            totalRequisitions: 0,
            totalAmount: 0,
            totalRecordAmount: 0,
            totalCountNumber: 0,
            averageAmount: 0,
            averageRecordAmount: 0,
            statusBreakdown: [],
            departmentBreakdown: [],
            priorityBreakdown: [],
            monthlyTrend: [],
            topVendors: [],
            capexVsOpex: { capex: 0, opex: 0, capexRecord: 0, opexRecord: 0 },
            approvalRate: 0,
            currency: 'NGN'
        };

        if (!filteredRows || filteredRows.length === 0) {
            return metrics;
        }

        const statusMap = new Map<string, {count: number; amount: number; recordAmount: number; totalCount: number}>();
        const deptMap = new Map<string, {count: number; amount: number; recordAmount: number; totalCount: number}>();
        const priorityMap = new Map<string, {count: number; amount: number; recordAmount: number; totalCount: number}>();
        const monthMap = new Map<string, {count: number; amount: number; recordAmount: number; totalCount: number}>();
        const vendorMap = new Map<string, {count: number; amount: number; recordAmount: number; totalCount: number}>();
        let totalAmount = 0;
        let totalRecordAmount = 0;
        let totalCountNumber = 0;
        let totalApproved = 0;
        let totalRequisitions = 0;
        let currency = 'NGN';

        filteredRows.forEach((row: any) => {
            // ✅ FIX: Use total_amount_record for monetary values, not total_amount
            const amount = Number(row.total_amount_record) || 0;
            const recordAmount = Number(row.total_amount_record) || 0;
            const totalCount = Number(row.total_count_number) || 0;
            const status = row.status_name || row.status || 'Unknown';
            const department = row.department_name || 'Uncategorized';
            const priority = row.priority_name || row.priority || 'Unknown';
            const vendor = row.vendor_name || 'Unknown';
            const isCapex = row.is_capex;
            const createdDate = row.created_at ? new Date(row.created_at) : null;
            
            totalAmount += amount;
            totalRecordAmount += recordAmount;
            totalCountNumber += totalCount;
            totalRequisitions++;
            
            if (row.currency_name) currency = row.currency_name;

            // Status breakdown
            if (statusMap.has(status)) {
                const existing = statusMap.get(status)!;
                statusMap.set(status, {
                    count: existing.count + 1,
                    amount: existing.amount + amount,
                    recordAmount: existing.recordAmount + recordAmount,
                    totalCount: existing.totalCount + totalCount
                });
            } else {
                statusMap.set(status, { count: 1, amount, recordAmount, totalCount });
            }

            // Department breakdown
            if (deptMap.has(department)) {
                const existing = deptMap.get(department)!;
                deptMap.set(department, {
                    count: existing.count + 1,
                    amount: existing.amount + amount,
                    recordAmount: existing.recordAmount + recordAmount,
                    totalCount: existing.totalCount + totalCount
                });
            } else {
                deptMap.set(department, { count: 1, amount, recordAmount, totalCount });
            }

            // Priority breakdown
            if (priorityMap.has(priority)) {
                const existing = priorityMap.get(priority)!;
                priorityMap.set(priority, {
                    count: existing.count + 1,
                    amount: existing.amount + amount,
                    recordAmount: existing.recordAmount + recordAmount,
                    totalCount: existing.totalCount + totalCount
                });
            } else {
                priorityMap.set(priority, { count: 1, amount, recordAmount, totalCount });
            }

            // Vendor breakdown
            if (vendorMap.has(vendor)) {
                const existing = vendorMap.get(vendor)!;
                vendorMap.set(vendor, {
                    count: existing.count + 1,
                    amount: existing.amount + amount,
                    recordAmount: existing.recordAmount + recordAmount,
                    totalCount: existing.totalCount + totalCount
                });
            } else {
                vendorMap.set(vendor, { count: 1, amount, recordAmount, totalCount });
            }

            // Monthly trend
            if (createdDate) {
                const monthKey = createdDate.toLocaleString('default', { month: 'short', year: 'numeric' });
                if (monthMap.has(monthKey)) {
                    const existing = monthMap.get(monthKey)!;
                    monthMap.set(monthKey, {
                        count: existing.count + 1,
                        amount: existing.amount + amount,
                        recordAmount: existing.recordAmount + recordAmount,
                        totalCount: existing.totalCount + totalCount
                    });
                } else {
                    monthMap.set(monthKey, { count: 1, amount, recordAmount, totalCount });
                }
            }

            // Capex vs Opex with both amounts
            if (isCapex === true || isCapex === 'true' || isCapex === 1 || isCapex === '1') {
                metrics.capexVsOpex.capex += amount;
                metrics.capexVsOpex.capexRecord += recordAmount;
            } else {
                metrics.capexVsOpex.opex += amount;
                metrics.capexVsOpex.opexRecord += recordAmount;
            }

            // Approval tracking - check both status and status_name
            const statusLower = (status || '').toLowerCase();
            if (statusLower === 'approved' || statusLower === 'completed' || statusLower === '1') {
                totalApproved++;
            }
        });

        metrics.totalRequisitions = totalRequisitions;
        metrics.totalAmount = totalAmount;
        metrics.totalRecordAmount = totalRecordAmount;
        metrics.totalCountNumber = totalCountNumber;
        metrics.averageAmount = totalRequisitions > 0 ? totalAmount / totalRequisitions : 0;
        metrics.averageRecordAmount = totalRequisitions > 0 ? totalRecordAmount / totalRequisitions : 0;
        metrics.approvalRate = totalRequisitions > 0 ? (totalApproved / totalRequisitions) * 100 : 0;
        metrics.currency = currency;

        // Sort and limit breakdowns
        metrics.statusBreakdown = Array.from(statusMap.entries())
            .map(([status, data]) => ({ 
                status, 
                count: data.count, 
                amount: data.amount,
                recordAmount: data.recordAmount,
                totalCount: data.totalCount
            }))
            .sort((a, b) => b.count - a.count);

        metrics.departmentBreakdown = Array.from(deptMap.entries())
            .map(([department, data]) => ({ 
                department, 
                count: data.count, 
                amount: data.amount,
                recordAmount: data.recordAmount,
                totalCount: data.totalCount
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 10);

        metrics.priorityBreakdown = Array.from(priorityMap.entries())
            .map(([priority, data]) => ({ 
                priority, 
                count: data.count, 
                amount: data.amount,
                recordAmount: data.recordAmount,
                totalCount: data.totalCount
            }))
            .sort((a, b) => b.count - a.count);

        metrics.monthlyTrend = Array.from(monthMap.entries())
            .map(([month, data]) => ({ 
                month, 
                count: data.count, 
                amount: data.amount,
                recordAmount: data.recordAmount,
                totalCount: data.totalCount
            }))
            .sort((a, b) => {
                const dateA = new Date(a.month);
                const dateB = new Date(b.month);
                return dateA.getTime() - dateB.getTime();
            });

        metrics.topVendors = Array.from(vendorMap.entries())
            .map(([vendor, data]) => ({ 
                vendor, 
                count: data.count, 
                amount: data.amount,
                recordAmount: data.recordAmount,
                totalCount: data.totalCount
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 10);

        return metrics;
    }, [filteredRows]);

    // ==================== RENDER COMPACT DATE RANGE FILTER ====================
    const renderDateRangeFilter = () => (
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
                                    try { input.showPicker(); } catch (error) {}
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
                                    try { input.showPicker(); } catch (error) {}
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
    );

    // ==================== RENDER ANALYSIS TAB ====================
    const renderAnalysisTab = () => {
        const metrics = analysisMetrics;
        const currency = metrics.currency || 'NGN';

        return (
            <div className="space-y-6 mt-4">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Requisitions</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                    {metrics.totalRequisitions.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                    Total Items: {metrics.totalCountNumber.toLocaleString()}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {currency} {metrics.totalAmount.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                    Avg: {currency} {metrics.averageAmount.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0-1v1m0 1v1m0 1v1" />
                                </svg>
                            </div>
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
                        <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div 
                                className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${metrics.approvalRate}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">CAPEX vs OPEX</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                                    CAPEX: {currency} {metrics.capexVsOpex.capex.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>OPEX: {currency} {metrics.capexVsOpex.opex.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                        </div>
                    </div>
                </div>

                {/* Status Breakdown */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Status Breakdown</h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {metrics.statusBreakdown.length} statuses
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {metrics.statusBreakdown.map((item) => (
                            <div key={item.status} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.status}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.count} reqs</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">Items: {item.totalCount}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {currency} {item.amount.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {((item.amount / metrics.totalAmount) * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Departments & Vendors */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Departments</h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400">By spend</span>
                        </div>
                        <div className="space-y-3">
                            {metrics.departmentBreakdown.map((dept, index) => (
                                <div key={dept.department} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 text-xs font-medium text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{dept.department}</span>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">Items: {dept.totalCount}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {currency} {dept.amount.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                        </span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {dept.count} reqs
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {metrics.departmentBreakdown.length === 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No department data available</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Vendors</h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400">By spend</span>
                        </div>
                        <div className="space-y-3">
                            {metrics.topVendors.map((vendor, index) => (
                                <div key={vendor.vendor} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 text-xs font-medium text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{vendor.vendor}</span>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">Items: {vendor.totalCount}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {currency} {vendor.amount.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                        </span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {vendor.count} reqs
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {metrics.topVendors.length === 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No vendor data available</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Monthly Trend */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Trend</h3>
                    <div className="space-y-3">
                        {metrics.monthlyTrend.map((month) => (
                            <div key={month.month} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <div className="flex items-center gap-4 flex-1">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-24">{month.month}</span>
                                    <div className="flex-1 flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div 
                                                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${(month.count / Math.max(...metrics.monthlyTrend.map(m => m.count))) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 w-16 text-right">
                                            {month.count} reqs
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {currency} {month.amount.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                    </span>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                        Items: {month.totalCount}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {metrics.monthlyTrend.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No monthly trend data available</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // ==================== EFFECTS ====================
    useEffect(() => {
        handleReload();
    }, [location_id]);

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
    }, [locationData, userData, vendorData, departmentData, statusData, priorityData,  budgetData, currencyData]);

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
                filterableFields={filterableFields}
                analyzableFields={analyzableFields}
                analysisConfig={analysisConfig}
                onClose={toggleInfo}
            />

            <div className="space-y-6">
                <div className="p-1">
                    {!isLoading ? (
                        <>
                            {page === 0 ? (
                                <>
                                    {/* Date Range Filter - Compact design above the table */}
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

                                    <TabNavigation
                                        activeTab={activeTab}
                                        onTabChange={handleTabChange}
                                        hasAnalysis={true}
                                        recordCount={filteredRows.length}
                                    />

                                    {activeTab === 'table' && (
                                        <Tables
                                            onAdd={onAdd}
                                            reload={handleReload}
                                            home={() => nav(-1)}
                                            rows={filteredRows}
                                            columns={columns}
                                            pageSize={PAGE_SIZE}
                                            cV={columnVisibility}
                                        />
                                    )}

                                    {activeTab === 'analysis' && renderAnalysisTab()}
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
                                        <RequisitionViewWithDetails
                                            requisition={row}
                                            onClose={() => setPage(0)}
                                            onDeactivate={onDeactivate}
                                            deactivateLoading={false}
                                            title="Requisition Details"
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

export default Requisitions;