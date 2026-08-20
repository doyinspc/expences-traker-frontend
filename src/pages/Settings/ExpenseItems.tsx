// src/pages/Procurement/Requisitions.tsx

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { columnBuilder } from '../../actions/common.js';
import PageBreadcrumb from "../../components/common/PageBreadCrumb.js";
import Tables from '../../components/table/index.jsx';
import Loader from '../../components/ui/Loader.js';
import DynamicForm from "../../components/ui/DynamicForm.js";
import { ExpenseIncomeSettingAction } from '../../components/ui/TableActionSetting.js';
import { InfoPanel } from '../../components/ui/InfoPanel.js';
import { FilterSection } from '../../components/ui/FilterSection.js';
import { TabNavigation } from '../../components/ui/TabNavigation.js';
import { FilterIcon, InfoIcon, BackIcon, AddIcon, ReloadIcon } from '../../components/ui/TableIcons.js';
import Analysis from "../Components/Analysis.js"
import useReduxApiData from "../../hooks/useTanstackQuery.js";
import { 
    buildTableDataFromMapping, 
    buildColumnVisibility, 
    getTableFilterConfig,
    getTableAnalysisConfig,
    getAnalyzableFields,
    getFilterableFields,
    getAvailableMetrics,
    getAvailableDimensions,
    getTableDisplayName
} from '../../utils/functions/tableBuilder.js';
import { getTableMapping } from '../../config/tableMapping.js';
import Swal from 'sweetalert2';

import { 
    processRows, 
    filterData, 
    generateAnalysisData, 
    countActiveFilters 
} from '../../utils/functions/dataHelpers.js';
import { getTitleRow } from "../../utils/functions/basci.jsx";
import { X } from "lucide-react";

// ==================== CONSTANTS ====================
const TABLE_NAME = "expenseitems";
const TABLE_PATH = "expenseitem";
const PAGE_SIZE = 500;
type TabType = 'table' | 'analysis';

// ==================== COMPONENT ====================
const ExpensItems: React.FC = () => {
    const nav = useNavigate();

    // ==================== CONFIGURATIONS ====================
    const tableMapping = useMemo(() => getTableMapping(TABLE_NAME), []);
    const filterConfig = useMemo(() => getTableFilterConfig(TABLE_NAME), []);
    const analysisConfig = useMemo(() => getTableAnalysisConfig(TABLE_NAME), []);
    const tableData = useMemo(() => buildTableDataFromMapping(TABLE_NAME), []);
    const columnVisibility = useMemo(() => buildColumnVisibility(TABLE_NAME), []);
    const filterableFields = useMemo(() => getFilterableFields(TABLE_NAME), []);
    const analyzableFields = useMemo(() => getAnalyzableFields(TABLE_NAME), []);
    const availableMetrics = useMemo(() => getAvailableMetrics(TABLE_NAME), []);
    const availableDimensions = useMemo(() => getAvailableDimensions(TABLE_NAME), []);
    const displayName = useMemo(() => getTableDisplayName(TABLE_NAME), []);
    const {grp} = tableMapping || {}

    const titleHeaders = getTitleRow(1)
    const {id:parent_id, name:parent_name} = titleHeaders || {};
    const initialData = useMemo(() => ({parent_id}), [parent_id]);
    
    if(!titleHeaders || Object.keys(titleHeaders).length === 0){
        nav(-1)
    }

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
    const [showLearnMore, setShowLearnMore] = useState<boolean>(true);
    
    const isFirstRender = useRef(true);

    // ==================== API HOOKS ====================
    const { data, loadQuery, loadUpdate, deleteData, isLoading } = useReduxApiData({
        table: TABLE_NAME,
        pth: TABLE_PATH,
        queryType: 'gets',
        mainParam: initialData,
        narration: 'get all expense items',
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
    }, [deleteData]);

    const onActivate = useCallback((row: any): void => {
        const { id, is_active } = row;
        loadUpdate({ id, cat: 'insert', is_active: is_active === 0 ? 1 : 0 });
    }, [loadUpdate]);

    const onIncome = useCallback((row: any): void => {
        const { id, text_3 } = row;
        loadUpdate({ id, cat: 'insert', text_3: parseInt(text_3) === 0 ? 1 : 0 });
    }, [loadUpdate]);

    const onExpense = useCallback((row: any): void => {
        const { id, text_2 } = row;
        loadUpdate({ id, cat: 'insert', text_2: parseInt(text_2) === 0 ? 1 : 0 });
    }, [loadUpdate]);

    const onGoodOrService = useCallback((row: any): void => {
        const { id, text_4 } = row;
        let newValue = 0;
        if (parseInt(text_4) === 0 || parseInt(text_4) === null || parseInt(text_4) === undefined) {
            newValue = 1;
        } else if (parseInt(text_4) === 1) {
            newValue = 2;
        } else if (parseInt(text_4) === 2) {
            newValue = 3;
        } else if (parseInt(text_4) === 3) {
            newValue = 1;
        }
        loadUpdate({ id, cat: 'insert', text_4: newValue });
    }, [loadUpdate]);

    const onNext = useCallback((row: any): void => {
        nav(`/procurement/requisition/${row.id}`);
    }, [nav]);

    const onView = useCallback((row: any): void => {
        setRow(row);
        setIsEdit(false);
        setPage(1);
    }, []);

    const handleSave = useCallback((formData: any): void => {
        loadUpdate(formData);
    }, [loadUpdate]);

    const handleUpdate = useCallback((formData: any): void => {
        loadUpdate(formData);
    }, [loadUpdate]);

    const handleReload = useCallback((): void => {
        loadQuery(initialData);
    }, [loadQuery, initialData]);

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
    }, [loadQuery, initialData]);

    const addData = useCallback((): void => {
        onAdd();
    }, [onAdd]);

    const goBack = useCallback((): void => {
        nav(-1);
    }, [nav]);

    const toggleLearnMore = useCallback((): void => {
        setShowLearnMore(prev => !prev);
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
        if (isFirstRender.current) {
            isFirstRender.current = false;
            loadQuery(initialData);
        }
    }, [loadQuery, initialData]);

    useEffect(() => {
        if (analysisConfig) {
            setAnalysisGroupBy(analysisConfig.defaultGroupBy || availableDimensions[0] || '');
            setAnalysisMetric(analysisConfig.defaultMetric || availableMetrics[0] || '');
        }
    }, [analysisConfig, availableDimensions, availableMetrics]);

    // ==================== CUSTOM ACTION WRAPPER ====================
    // This wrapper ensures all props are passed correctly to the action component
    const ActionWrapper = useCallback((props: any) => {
        const { row } = props;
        return (
            <ExpenseIncomeSettingAction
                row={row}
                onEdit={onEdit}
                onDelete={onDelete}
                onActivate={onActivate}
                onIncome={onIncome}
                onExpense={onExpense}
                onGoodOrService={onGoodOrService}
                onNext={onNext}
                onView={onView}
                showEdit={true}
                showDelete={true}
                showActivate={true}
                showDeactivate={true}
                showNext={false}
                showExpense={true}
                showIncome={true}
                showGoodOrService={true}
                size="md"
                iconOnly={true}
            />
        );
    }, [onEdit, onDelete, onActivate, onIncome, onExpense, onGoodOrService, onNext, onView]);

    // ==================== COLUMNS ====================
    const columns = useMemo(() => {
        return columnBuilder(
            { 
                table_action: ActionWrapper, 
                table_data: tableData 
            },
            { 
                // These are passed as fallbacks but the wrapper uses the direct handlers
                onNext, 
                onView, 
                onActivate, 
                onEdit, 
                onDelete,
                onIncome,
                onExpense,
                onGoodOrService
            }
        );
    }, [tableData, ActionWrapper, onNext, onView, onActivate, onEdit, onDelete, onIncome, onExpense, onGoodOrService]);

    // ==================== RENDER ====================
    return (
        <>
            <PageBreadcrumb pageTitle={displayName + `: ${parent_name || '-'}`} />

            {/* ==================== LEARN MORE INFO BAR ==================== */}
            {showLearnMore && (
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <InfoIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="space-y-1.5">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                    Managing Expense Items
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-300">
                                    Expense items are the individual products or services that can be requested through requisitions, Cash Advance or can be a source of income or both. 
                                    Each item can be configured with specific attributes that determine how it's categorized in the system.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                                    <div className="flex items-start gap-1.5">
                                        <span className="text-xs font-medium text-red-600 dark:text-red-400">Expense</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">- Marks this as an expense item (OPEX/CAPEX)</span>
                                    </div>
                                    <div className="flex items-start gap-1.5">
                                        <span className="text-xs font-medium text-green-600 dark:text-green-400">Income</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">- Marks this as an income/revenue item</span>
                                    </div>
                                    <div className="flex items-start gap-1.5">
                                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Good / Service</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">- Classifies as physical product or service</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800"></span>
                                        Click <strong>Expense</strong> badge to toggle expense status
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800"></span>
                                        Click <strong>Income</strong> badge to toggle income status
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"></span>
                                        Click <strong>Good/Service</strong> badge to cycle through classifications
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={toggleLearnMore}
                            className="flex-shrink-0 p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors"
                            aria-label="Dismiss info"
                        >
                            <X size={16} className="text-blue-500 dark:text-blue-400" />
                        </button>
                    </div>
                </div>
            )}

            {/* Show Learn More Button (when info is hidden) */}
            {!showLearnMore && (
                <button
                    type="button"
                    onClick={toggleLearnMore}
                    className="mb-4 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5 transition-colors"
                >
                    <InfoIcon className="w-4 h-4" />
                    <span>Learn More</span>
                </button>
            )}

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
                                            <Analysis data={processedRows} analysisData={analysisData} />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="space-y-6">
                                    <DynamicForm
                                        tableName={TABLE_NAME}
                                        title={isEdit ? `Edit ${displayName}` : `Create ${displayName}`}
                                        submitLabel={isEdit ? `Update ${displayName}` : `Create ${displayName}`}
                                        onSave={isEdit ? handleUpdate : handleSave}
                                        initialData={isEdit ? row : initialData}
                                        onCancel={() => setPage(0)}
                                        optionData={{}}
                                    />
                                </div>
                            )}
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

export default ExpensItems;