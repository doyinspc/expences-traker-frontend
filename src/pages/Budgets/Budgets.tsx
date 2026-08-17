// src/pages/Procurement/Requisitions.tsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { columnBuilder } from '../../actions/common.js';
import PageBreadcrumb from "../../components/common/PageBreadCrumb.js";
import Tables from '../../components/table/index.jsx';
import Loader from '../../components/ui/Loader.js';
import DynamicForm from "../../components/ui/DynamicForm.js";
import { FullBudgetActions} from '../../components/ui/TableActionBudget.tsx';
import { InfoPanel } from '../../components/ui/InfoPanel.js';
import { FilterSection } from '../../components/ui/FilterSection.js';
import { TabNavigation } from '../../components/ui/TabNavigation.js';
import { FilterIcon, InfoIcon, BackIcon, AddIcon, ReloadIcon } from '../../components/ui/TableIcons.js';
import Analysis from "../Components/Analysis.js"
import useReduxApiData from "../../hooks/useTanstackQuery.js";
import { 
    buildTableDataFromMapping, 
    getTableFilterConfig,
    getTableAnalysisConfig,
    getAnalyzableFields,
    getFilterableFields,
    getAvailableMetrics,
    getAvailableDimensions,
    getTableDisplayName
} from '../../utils/functions/tableBuilder.js';
import { storeTitleRow } from '../../utils/functions/basci.jsx';
import { getTableMapping } from '../../config/tableMapping.js';
import Swal from 'sweetalert2';

import { 
    processRows, 
    filterData, 
    generateAnalysisData, 
    countActiveFilters 
} from '../../utils/functions/dataHelpers.js';
import BudgetItemsForm from "./BugetItemsForm.jsx";
import BudgetItemApproval from "./BudgetItemApprovals.jsx";

// ==================== CONSTANTS ====================
const TABLE_NAME = "budgets";
const TABLE_PATH = "budget";
const PAGE_SIZE = 500;
type TabType = 'table' | 'analysis';
// config/budgets.js

const table_data = [
    {label: 'ID', name:'id', type:'hidden', showTable: false, editable:false, element:null},
    {label: 'Budget Name', name:'budget_name', type:'text', showTable: true, editable:true, element:null},
    {label: 'Description', name:'description', type:'textarea', showTable: false, editable:true, element:null},
    {label: 'Location', name:'location_id', type:'select', showTable: true, editable:true, element:null},
    {label: 'Total Amount', name:'total_amount', type:'number', showTable: true, editable:true, element:null},
    {label: 'Start Date', name:'start_date', type:'date', showTable: true, editable:true, element:null},
    {label: 'End Date', name:'end_date', type:'date', showTable: true, editable:true, element:null},
    {label: 'Active', name:'is_active', type:'hidden', showTable: true, editable:false, element:null},
    {label: 'Completed', name:'is_completed', type:'hidden', showTable: true, editable:false, element:null},
    {label: 'Approved', name:'is_approved', type:'hidden', showTable: true, editable:false, element:null},
    {label: 'Approved By', name:'approved_by_id', type:'hidden', showTable: false, editable:false, element:null},
    {label: 'Approved By', name:'approved_by_name', type:'hidden', showTable: true, editable:false, element:null},
    {label: 'Approved Date', name:'approved_date', type:'hidden', showTable: true, editable:false, element:null},
    {label: 'Closed', name:'is_closed', type:'hidden', showTable: true, editable:false, element:null},
    {label: 'Closed Date', name:'closed_date', type:'hidden', showTable: true, editable:false, element:null},
    {label: 'Final Comments', name:'final_comments', type:'hidden', showTable: false, editable:false, element:null},
    {label: 'Created At', name:'created_at', type:'hidden', showTable: true, editable:false, element:null},
    {label: 'Created By', name:'created_by_id', type:'hidden', showTable: true, editable:false, element:null},
    {label: 'Updated At', name:'updated_at', type:'hidden', showTable: true, editable:false, element:null},
    {label: 'Updated By', name:'updated_by_id', type:'hidden', showTable: true, editable:false, element:null}
];


// Column visibility settings
const columnVisibility = {
    id: true,
    budget_name: true,
    total_amount: true,
    start_date: true,
    end_date: true,
    location_id: false,
    is_active: false,
    is_completed: false,
    is_approved: true,
    approved_by_id: false,
    approved_by_name: true,
    approved_date: false,
    is_closed: false,
    closed_date: false,
    created_at: false,
    created_by_id: false,
    updated_at: false,
    updated_by_id: false
};



// ==================== COMPONENT ====================
const Budgets: React.FC = () => {
    const nav = useNavigate();
    // const userx = useSelector((state: any) => state.userReducer);
    

    // ==================== CONFIGURATIONS ====================
    const tableMapping = useMemo(() => getTableMapping(TABLE_NAME), []);
    const filterConfig = useMemo(() => getTableFilterConfig(TABLE_NAME), []);
    const analysisConfig = useMemo(() => getTableAnalysisConfig(TABLE_NAME), []);
    const tableData = useMemo(() => buildTableDataFromMapping(TABLE_NAME), []);
    //const columnVisibility = useMemo(() => buildColumnVisibility(TABLE_NAME), []);
    const filterableFields = useMemo(() => getFilterableFields(TABLE_NAME), []);
    const analyzableFields = useMemo(() => getAnalyzableFields(TABLE_NAME), []);
    const availableMetrics = useMemo(() => getAvailableMetrics(TABLE_NAME), []);
    const availableDimensions = useMemo(() => getAvailableDimensions(TABLE_NAME), []);
    const displayName = useMemo(() => getTableDisplayName(TABLE_NAME), []);
    const { user, location_id } = useSelector((state: any) => state.authReducer);
    const {locations=[]} = user || {}
    const locationData = locations || [];
   
    
    const initialData = {location_id}

    // ==================== STATE ====================
    const [page, setPage] = useState<number>(0);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [row, setRow] = useState<any>({});
    const [activeTab, setActiveTab] = useState<TabType>('table');
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [showInfo, setShowInfo] = useState<boolean>(false);
    const [analysisGroupBy, setAnalysisGroupBy] = useState<string>('');
    const [analysisMetric, setAnalysisMetric] = useState<string>('');

    // ==================== API HOOKS ====================
    const { data, loadQuery, loadUpdate, deleteData, isLoading } = useReduxApiData({
        table: TABLE_NAME,
        pth: TABLE_PATH,
        queryType: 'gets',
        mainParam: {location_id},
        narration: 'get all purchase requisitions'
    });
    

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
    const onPrepareBudget = useCallback((row: any): void => {
        setRow(row);
        setPage(2);
    }, []);

    const onDelete = useCallback((row: any): void => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteData({ id: row.id, cat: 'delete' }, row.id);
                Swal.fire(
                    'Deleted!',
                    'Your record has been deleted.',
                    'success'
                );
            }
        });
    }, []);

    const onActivate = useCallback((row: any): void => {
        const { id, is_active } = row;
        loadUpdate({ id, cat: 'insert', is_active: is_active === 0 ? 1 : 0 });
    }, []);

    const onNext = useCallback((row: any): void => {
        storeTitleRow(row, 1);
        nav(`/procurement/budgets/${row.id}`);
    }, []);

    const onView = useCallback((row: any): void => {
        setRow(row);
        setIsEdit(false);
        setPage(3);
    }, []);

    const handleSave = useCallback((formData: any): void => {
        loadUpdate(formData);
    }, []);

    const handleUpdate = useCallback((formData: any): void => {
        loadUpdate(formData);
    }, []);

    const handleReload = useCallback((): void => {
        loadQuery(initialData);
    }, []);

    const handleFilterChange = useCallback((filterName: string, value: any): void => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    }, []);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
        setSearchTerm(e.target.value);
    }, []);

    const clearFilters = useCallback((): void => {
        setFilters({});
        setSearchTerm('');
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
    const reload = useCallback((): void => {
        loadQuery(initialData);
    }, []);
    const addData = useCallback((): void => {
        onAdd()
    }, []);
    const goBack = useCallback((): void => {
        nav(-1);
    }, []);

    
    // ==================== DATA PROCESSING ====================
    const processedRows = useMemo(() => processRows(data as Array<any>, TABLE_NAME), [data]);
    const filteredRows = useMemo(() => 
        filterData(processedRows, filters, searchTerm, filterConfig), 
        [processedRows, filters, searchTerm, filterConfig]
    );
    
    const activeFilterCount = useMemo(() => 
        countActiveFilters(filters, searchTerm), 
        [filters, searchTerm]
    );

    const analysisData = useMemo(() => 
        generateAnalysisData(
            filteredRows, 
            analysisConfig, 
            analysisGroupBy, 
            analysisMetric, 
            availableDimensions, 
            availableMetrics,
            TABLE_NAME
        ), 
        [filteredRows, analysisConfig, analysisGroupBy, analysisMetric, availableDimensions, availableMetrics]
    );

    // ==================== EFFECTS ====================
    useEffect(() => {
        loadQuery(initialData);
    }, []);

    useEffect(() => {
        if (analysisConfig) {
            setAnalysisGroupBy(analysisConfig.defaultGroupBy || availableDimensions[0] || '');
            setAnalysisMetric(analysisConfig.defaultMetric || availableMetrics[0] || '');
        }
    }, [analysisConfig, availableDimensions, availableMetrics]);

    // ==================== COLUMNS ====================
    const columns = useMemo(() => {
    return columnBuilder(
        { table_action: FullBudgetActions, table_data: table_data },
        { onNext, onView, onActivate, onEdit, onDelete, onPrepareBudget }
    );
}, [tableData, onNext, onView, onActivate, onEdit, onDelete, onPrepareBudget]);

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
                    className={`p-2 rounded-lg transition-colors ${
                        showInfo
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    title="Go Back"
                >
                    <BackIcon />
                </button>
                <button
                    onClick={addData}
                    className={`p-2 rounded-lg transition-colors ${
                        showInfo
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    title="Add New Record"
                >
                    <AddIcon />
                </button>
                <button
                    onClick={reload}
                    className={`p-2 rounded-lg transition-colors ${
                        showInfo
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
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
                                    <FilterSection
                                        show={showFilters}
                                        filterConfig={filterConfig}
                                        filters={filters}
                                        searchTerm={searchTerm}
                                        onSearchChange={handleSearchChange}
                                        onFilterChange={handleFilterChange}
                                        onClearFilters={clearFilters}
                                        OPTION_DATA={{}}
                                    />

                                    <TabNavigation
                                        activeTab={activeTab}
                                        onTabChange={handleTabChange}
                                        hasAnalysis={analysisConfig?.enabled || false}
                                        recordCount={filteredRows.length}
                                    />

                                    {activeTab === 'table' && (
                                        <Tables
                                            onAdd={onAdd}
                                            reload={handleReload}
                                            home={() => nav('/')}
                                            rows={filteredRows}
                                            columns={columns}
                                            pageSize={PAGE_SIZE}
                                            cV={columnVisibility}
                                        />
                                    )}

                                    {activeTab === 'analysis' && (
                                        <div className="mt-4">
                                            <Analysis data={processedRows} analysisData ={analysisData} />
                                        </div>
                                    )}
                                </>
                            ) :null}
                            {page === 1 ? (
                                <div className="space-y-6">
                                    <DynamicForm
                                        tableName={TABLE_NAME}
                                        title={isEdit ? `Edit ${displayName}` : `Create ${displayName}`}
                                        submitLabel={isEdit ? `Update ${displayName}` : `Create ${displayName}`}
                                        onSave={isEdit ? handleUpdate : handleSave}
                                        initialData={ isEdit ? row  : initialData }
                                        onCancel={() => setPage(0)}
                                        optionData={{}}
                                    />
                                </div>
                            ):null}
                            {page === 2 ? (
                                <div className="space-y-6">
                                    <BudgetItemsForm
                                        row={row}
                                        onClose={() => setPage(0)}
                                    />
                                </div>
                            ):null}
                             {page === 3 ? (
                                <div className="space-y-6">
                                    <BudgetItemApproval
                                        row={row}
                                        onClose={() => setPage(0)}
                                    />
                                </div>
                            ):null}
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

export default Budgets;