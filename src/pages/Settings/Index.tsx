// src/pages/Procurement/Requisitions.tsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import { columnBuilder } from '../../actions/common.js';
import PageBreadcrumb from "../../components/common/PageBreadCrumb.js";
import Tables from '../../components/table/index.jsx';
import Loader from '../../components/ui/Loader.js';
import DynamicForm from "../../components/ui/DynamicForm.js";
import { TableActionSetting } from '../../components/ui/TableActionSetting.js';
import { InfoPanel } from '../../components/ui/InfoPanel.js';
import { FilterSection } from '../../components/ui/FilterSection.js';
import { TabNavigation } from '../../components/ui/TabNavigation.js';
import { FilterIcon, InfoIcon, BackIcon, AddIcon, ReloadIcon } from '../../components/ui/TableIcons.js';
import Analysis from "../Components/Analysis.js";
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
import { storeTitleRow } from '../../utils/functions/basci.jsx';
import { getTableKeyByGRP, getTableMapping, getTableMappingByGRP } from '../../config/tableMapping.js';

import { 
    processRows, 
    filterData, 
    generateAnalysisData, 
    countActiveFilters 
} from '../../utils/functions/dataHelpers.js';

// ==================== TYPES & INTERFACES ====================
const PAGE_SIZE = 500;
type TabType = 'table' | 'analysis';

export type TableRowData = Record<string, any>;

interface AuthState {
    location_id: string | number;
    user: {
        user_id: string | number;
    };
}

interface RootState {
    authReducer: AuthState;
}

// ==================== COMPONENT ====================
const Index: React.FC = () => {
    const nav = useNavigate();
    const { grp } = useParams<{ grp?: string }>();

    // Parse grp into number safely
    const numericGrp = useMemo(() => (grp ? parseInt(grp, 10) : 0), [grp]);
    
    
    
    const TABLE_NAME = useMemo(() => getTableKeyByGRP(numericGrp), [numericGrp]) || '';
    const TABLE_PATH = "account";

    // ==================== CONFIGURATIONS ====================
    const filterConfig = useMemo(() => getTableFilterConfig(TABLE_NAME), [TABLE_NAME]);
    const analysisConfig = useMemo(() => getTableAnalysisConfig(TABLE_NAME), [TABLE_NAME]);
    const tableData = useMemo(() => buildTableDataFromMapping(TABLE_NAME), [TABLE_NAME]);
    const columnVisibility = useMemo(() => buildColumnVisibility(TABLE_NAME), [TABLE_NAME]);
    const filterableFields = useMemo(() => getFilterableFields(TABLE_NAME), [TABLE_NAME]);
    const analyzableFields = useMemo(() => getAnalyzableFields(TABLE_NAME), [TABLE_NAME]);
    const availableMetrics = useMemo(() => getAvailableMetrics(TABLE_NAME), [TABLE_NAME]);
    const availableDimensions = useMemo(() => getAvailableDimensions(TABLE_NAME), [TABLE_NAME]);
    const displayName = useMemo(() => getTableDisplayName(TABLE_NAME), [TABLE_NAME]);
    const tableMapping = useMemo(() => getTableMapping(TABLE_NAME), [TABLE_NAME]);

    const { user: { user_id } } = useSelector((state: RootState) => state.authReducer);

    const initialData = useMemo(() => ({ grp: numericGrp, user_id }), [numericGrp, user_id]);

    // ==================== STATE ====================
    const [page, setPage] = useState<number>(0);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [row, setRow] = useState<TableRowData>({});
    const [activeTab, setActiveTab] = useState<TabType>('table');
    const [filters, setFilters] = useState<Record<string, unknown>>({});
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [showInfo, setShowInfo] = useState<boolean>(false);
    const [analysisGroupBy, setAnalysisGroupBy] = useState<string>('');
    const [analysisMetric, setAnalysisMetric] = useState<string>('');

    // ==================== API HOOKS ====================
    const { data, loadQuery, loadUpdate, deleteData, isLoading } = useReduxApiData({
        table: 'commons',
        pth: TABLE_PATH,
        queryType: 'gets',
        mainParam: { grp: numericGrp },
        narration: `get all ${TABLE_NAME}`
    });

    // ==================== HANDLERS ====================
    const onAdd = useCallback((): void => {
        setIsEdit(false);
        setRow({});
        setPage(1);
    }, []);

    const onEdit = useCallback((selectedRow: TableRowData): void => {
        setIsEdit(true);
        setRow(selectedRow);
        setPage(1);
    }, []);

    const onDelete = useCallback((selectedRow: TableRowData): void => {
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
                loadUpdate({ id: selectedRow?.id, is_active:3, cat: 'insert' });
                Swal.fire(
                    'Deleted!',
                    'Your record has been deleted.',
                    'success'
                );
            }
        });
    }, [deleteData]);

    const onActivate = useCallback((selectedRow: TableRowData): void => {
        const { id, is_active } = selectedRow;
        loadUpdate({ id, cat: 'insert', updated_by_id:user_id, is_active: is_active === 0 ? 1 : 0 });
    }, []);

    const onNext = useCallback((selectedRow: TableRowData): void => {
        storeTitleRow(selectedRow, 1);
        nav(`/setting/page/${grp}/${selectedRow.id}`);
    }, [nav]);

    const onView = useCallback((selectedRow: TableRowData): void => {
        setRow(selectedRow);
        setIsEdit(false);
        setPage(1);
    }, []);

    const handleSave = useCallback((formData: Record<string, unknown>): void => {
        formData.updated_by_id = user_id;
        loadUpdate(formData);
    }, [loadUpdate]);

    const handleUpdate = useCallback((formData: Record<string, unknown>): void => {
        formData.updated_by_id = user_id;
        loadUpdate(formData);
    }, [loadUpdate]);

    const handleReload = useCallback((): void => {
        loadQuery(initialData);
    }, [ initialData]);

    const handleFilterChange = useCallback((filterName: string, value: unknown): void => {
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

    const addData = useCallback((): void => {
        onAdd();
    }, [onAdd]);

    const goBack = useCallback((): void => {
        nav(-1);
    }, [nav]);

    // ==================== DATA PROCESSING ====================
    const processedRows = useMemo(() => 
        processRows((data || []) as TableRowData[], TABLE_NAME), 
        [data, TABLE_NAME]
    );

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
        [filteredRows, analysisConfig, analysisGroupBy, analysisMetric, availableDimensions, availableMetrics, TABLE_NAME]
    );

    // ==================== EFFECTS ====================
    useEffect(() => {
        loadQuery(initialData);
    }, [ initialData]);

    useEffect(() => {
        if (analysisConfig) {
            setAnalysisGroupBy(analysisConfig.defaultGroupBy || availableDimensions[0] || '');
            setAnalysisMetric(analysisConfig.defaultMetric || availableMetrics[0] || '');
        }
    }, [analysisConfig, availableDimensions, availableMetrics]);

    // ==================== COLUMNS ====================
    const columns = useMemo(() => {
        return columnBuilder(
            { table_action: TableActionSetting, table_data: tableData },
            { onNext, onView, onActivate, onEdit, onDelete }
        );
    }, [tableData, onNext, onView, onActivate, onEdit, onDelete]);

    // ==================== RENDER ====================
    return (
        <>
            <PageBreadcrumb pageTitle={displayName} />
            
            {/* Header Actions */}
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
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Go Back"
                >
                    <BackIcon />
                </button>
                <button
                    onClick={addData}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Add New Record"
                >
                    <AddIcon />
                </button>
                <button
                    onClick={handleReload}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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

export default Index;