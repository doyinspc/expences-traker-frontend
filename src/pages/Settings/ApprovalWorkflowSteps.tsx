import ParentDocumentContext from '../../components/common/ParentDocumentContext.jsx';
import useParentDocumentContext from '../../hooks/useParentDocumentContext.js';
// src/pages/Procurement/Requisitions.tsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { columnBuilder } from '../../actions/common.js';
import PageBreadcrumb from "../../components/common/PageBreadCrumb.js";
import Tables from '../../components/table/index.jsx';
import Loader from '../../components/ui/Loader.js';
import DynamicForm from "../../components/ui/DynamicForm.js";
import { FullSettingAction } from '../../components/ui/TableActionSetting.js';
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
import { allowsCashDisbursement, isActiveWorkflowStep, workflowStepRows, workflowStepWrite } from '../../utils/functions/workflowStepSettings';
import Swal from 'sweetalert2';

import { 
    processRows, 
    filterData, 
    generateAnalysisData, 
    countActiveFilters 
} from '../../utils/functions/dataHelpers.js';

// ==================== CONSTANTS ====================
const TABLE_NAME = "workflowsteps";
const TABLE_PATH = "workflowstep";
const PAGE_SIZE = 500;
type TabType = 'table' | 'analysis';

// ==================== COMPONENT ====================
const ApprovalWorkflowSteps: React.FC = () => {
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
    
    const parentContext = useParentDocumentContext();
    const parent_id = parentContext.id;
    const parent = parentContext.document;
    const workflow = Number(parent?.grp) === 20 && !Number(parent?.parent_id) && Number(parent?.id) === parent_id ? parent : null;
    const workflowType = workflow?.item_id1;
    const hiddenStepFields = useMemo(() => allowsCashDisbursement(workflowType) ? [] : ['text_4'], [workflowType]);

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
    const { data, loadQuery, loadUpdate, isLoading, error: stepsError } = useReduxApiData({
        table: 'commons',
        uniqueKey: TABLE_PATH,
        queryType: 'gets',
        mainParam: {parent_id},
        narration: 'get steps for this approval workflow',
        enabled: Boolean(workflow),
    });

    const { data:roleData, loadQuery:loadRoles } = useReduxApiData({
        table: 'commons',
        uniqueKey: 'roles',
        queryType: 'gets',
        mainParam: {grp:1},
        narration: 'get approval roles',
        enabled: Boolean(workflow),
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

    const onDelete = useCallback(async (record: any): Promise<void> => {
        const result=await Swal.fire({title:'Delete this Settings record?',text:'Only unused records can be removed. Records linked to staff, documents or history must be retained.',icon:'warning',showCancelButton:true,confirmButtonText:'Delete unused record',cancelButtonText:'Keep record'});
        if(!result.isConfirmed)return;
        try {
            await loadUpdate({id:record.id,cat:'insert',act:3});
            await Swal.fire({title:'Deleted',text:'The unused Settings record was removed.',icon:'success'});
        } catch { /* The existing notification shows the server refusal; no false success. */ }
    }, [loadUpdate]);

    const stepRows = useMemo(() => workflowStepRows(data, parent_id), [data, parent_id]);
    const activeStepCount = stepRows.filter(isActiveWorkflowStep).length;

    const hasConflictingOrder = useCallback((id: unknown, order: number) => stepRows.some(step =>
        isActiveWorkflowStep(step) && Number(step.id) !== Number(id) && Number(step.item_id2) === order
    ), [stepRows]);

    const onActivate = useCallback(async (record: any) => {
        const step = stepRows.find(candidate => Number(candidate.id) === Number(record.id));
        if (!step) return;
        const is_active = isActiveWorkflowStep(step) ? 0 : 1;
        if (is_active && hasConflictingOrder(step.id, Number(step.item_id2))) {
            await Swal.fire({ icon: 'warning', title: 'Approval order already in use',
                text: 'Edit the step and give it a different order before activating it.' });
            return;
        }
        try {
            await loadUpdate({ id: step.id, cat: 'insert', is_active });
        } catch { /* The shared mutation displays the server error. */ }
    }, [stepRows, hasConflictingOrder, loadUpdate]);

    const handleSave = useCallback(async (formData: any) => {
        const savedStep = isEdit ? stepRows.find(step => Number(step.id) === Number(row.id)) : null;
        if (isEdit && !savedStep) throw new Error('Open the step again from the correct workflow.');
        const payload = workflowStepWrite({
            ...formData,
            id: savedStep?.id,
            is_active: savedStep ? Number(isActiveWorkflowStep(savedStep)) : 1,
        }, workflow);
        if (payload.is_active === 1 && hasConflictingOrder(payload.id, payload.item_id2)) {
            throw new Error('Another active step already uses this approval order.');
        }
        await loadUpdate(payload);
        setPage(0);
    }, [isEdit, row.id, stepRows, workflow, hasConflictingOrder, loadUpdate]);

    const handleReload = useCallback((): void => {
        if (!workflow) return;
        loadQuery();
        loadRoles();
    }, [workflow, loadQuery, loadRoles]);

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
    const goBack = useCallback((): void => {
        nav(-1);
    }, []);

    
    // ==================== DATA PROCESSING ====================
    const processedRows = useMemo(() => {
        const names = new Map((Array.isArray(roleData) ? roleData : []).map(role => [Number(role.id), role.name]));
        return processRows(stepRows.map(step => ({
            ...step,
            is_active: Number(isActiveWorkflowStep(step)),
            item_name1: step.item_name1 || names.get(Number(step.item_id1)) || 'Role unavailable',
        })), TABLE_NAME);
    }, [stepRows, roleData]);
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
        setPage(0);
        setIsEdit(false);
        setRow({});
    }, [parent_id]);

    useEffect(() => {
        if (analysisConfig) {
            setAnalysisGroupBy(analysisConfig.defaultGroupBy || availableDimensions[0] || '');
            setAnalysisMetric(analysisConfig.defaultMetric || availableMetrics[0] || '');
        }
    }, [analysisConfig, availableDimensions, availableMetrics]);

    // ==================== COLUMNS ====================
    const columns = useMemo(() => {
        return columnBuilder(
            { table_action: FullSettingAction, table_data: tableData },
            { onEdit, onDelete, onActivate }
        );
    }, [tableData, onEdit, onDelete, onActivate]);

    const formattedSelectRows = useMemo(() => {
            const safeData = (data: unknown): any[] => Array.isArray(data) ? data : [];
    
            const formatOptions = (items: any[], labelKey: string, valueKey: string) => {
                return items.map((item: any) => ({
                    label: item[labelKey] || item.name || '',
                    value: item[valueKey] || item.id || '',
                }));
            };
    
            return {
                disbursement_steps: [{value:'approval',label:'Ordinary approval step'},{value:'cash_disbursement',label:'Confirm cash disbursement'}],
                roles: formatOptions(safeData(roleData), 'name', 'id')
            };
        }, [ roleData ]);
    

    // ==================== RENDER ====================
    return (
        <>
            <PageBreadcrumb pageTitle={displayName} />
            <ParentDocumentContext context={parentContext} />
            {parent && !workflow && <p role="alert">Open a workflow from Settings to manage its steps.</p>}
            {workflow && !isLoading && !stepsError && page === 0 && (
                <div className="mb-4 rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700">
                    <p className="font-medium">{activeStepCount} active approval {activeStepCount === 1 ? 'step' : 'steps'}</p>
                    {activeStepCount === 0 && <p className="mt-1">Add or activate a step before submitting a document to this workflow.</p>}
                </div>
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
                    onClick={onAdd}
                    disabled={!workflow || isLoading || Boolean(stepsError)}
                    className={`p-2 rounded-lg transition-colors ${
                        showInfo
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    title="Add approval step"
                >
                    <AddIcon />
                </button>
                <button
                    onClick={handleReload}
                    disabled={!workflow}
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
                    {workflow && stepsError ? (
                        <p role="alert" className="text-sm text-red-600 dark:text-red-300">Could not load approval steps. Use Reload Data to try again.</p>
                    ) : workflow && !isLoading ? (
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
                                            searchTerm={searchTerm}
                                            onSearchChange={(value: string) => setSearchTerm(value)}
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
                                        hiddenFieldNames={hiddenStepFields}
                                        title={isEdit ? `Edit ${displayName}` : `Create ${displayName}`}
                                        submitLabel={isEdit ? `Update ${displayName}` : `Create ${displayName}`}
                                        onSave={handleSave}
                                        initialData={isEdit ? row : { parent_id,
                                            item_id2: Math.max(0, ...stepRows.map(step => Number(step.item_id2) || 0)) + 1 }}
                                        onCancel={() => setPage(0)}
                                        optionData={{...formattedSelectRows}}
                                    />
                                </div>
                            )}
                        </>
                    ) : workflow && isLoading ? (
                        <Loader scope="panel" variant="skeleton" text={`Loading ${displayName.toLowerCase()}…`} />
                    ) : null}
                </div>
            </div>
        </>
    );
};

export default ApprovalWorkflowSteps;