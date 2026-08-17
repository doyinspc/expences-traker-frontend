// src/pages/Procurement/Requisitions.tsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { FilterIcon, InfoIcon, BackIcon, AddIcon, ReloadIcon } from '../../components/ui/TableIcons';
import Analysis from "../Components/Analysis.jsx"
import useReduxApiData from "../../hooks/useReduxApiData.js";
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
} from '../../utils/functions/tableBuilder';
import { getTableMapping } from '../../config/tableMapping';
import Swal from 'sweetalert2';

import { 
    processRows, 
    filterData, 
    generateAnalysisData, 
    countActiveFilters 
} from '../../utils/functions/dataHelpers';

// ==================== CONSTANTS ====================
const TABLE_NAME = "roles";
const TABLE_PATH = "role";
const PAGE_SIZE = 500;
type TabType = 'table' | 'analysis';

// ==================== COMPONENT ====================
const Roles: React.FC = () => {
    const nav = useNavigate();
    // const userx = useSelector((state: any) => state.userReducer);
    

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

    const initialData = {grp}

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
    const { data, loadQuery, loadUpdate, refetch, deleteData, isLoading } = useReduxApiData({
        table: TABLE_NAME,
        pth: TABLE_PATH,
        queryType: 'gets',
        mainParam: {grp},
        narration: 'get all purchase requisitions'
    });
     console.log('data', data)

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
    }, []);

    const onActivate = useCallback((row: any): void => {
        const { id, is_active } = row;
        loadUpdate({ id, cat: 'insert', is_active: is_active === 0 ? 1 : 0 });
    }, []);

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
            { table_action: TableAction, table_data: tableData },
            { onNext, onView, onActivate, onEdit, onDelete }
        );
    }, [tableData, onNext, onView, onActivate, onEdit, onDelete]);

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
                            ) : (
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

export default Roles;