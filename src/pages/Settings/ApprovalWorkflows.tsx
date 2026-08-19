// src/pages/Procurement/Requisitions.tsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { columnBuilder } from '../../actions/common.js';
import PageBreadcrumb from "../../components/common/PageBreadCrumb.js";
import Tables from '../../components/table/index.jsx';
import Loader from '../../components/ui/Loader.js';
import DynamicForm from "../../components/ui/DynamicForm.js";
import { FullSettingActionNoDelete } from '../../components/ui/TableActionSetting.js';
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
import { storeTitleRow } from '../../utils/functions/basci.jsx';
import { getTableMapping } from '../../config/tableMapping.js';
import Swal from 'sweetalert2';

import { 
    processRows, 
    filterData, 
    generateAnalysisData, 
    countActiveFilters 
} from '../../utils/functions/dataHelpers.js';
import { REQUISITION_TYPE_OPTIONS } from "../../utils/constants/common.jsx";

// ==================== ICON IMPORTS ====================
import { 
    BookOpen, 
    ChevronDown, 
    Shield, 
    Layers, 
    ListChecks,
    Lightbulb, 
    HelpCircle, 
    Plus, 
    Edit, 
    Eye, 
    Trash2,
    FileText
} from 'lucide-react';

// ==================== CONSTANTS ====================
const TABLE_NAME = "workflows";
const TABLE_PATH = "workflow";
const PAGE_SIZE = 500;
type TabType = 'table' | 'analysis';

// ==================== INFO PANEL COMPONENT ====================
const WorkflowInfoPanel = ({ isExpanded, onToggle }) => {
    if (!isExpanded) {
        return (
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all group"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Understanding Workflows
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Learn how approval workflows work, what defines them, and how steps are structured
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium group-hover:text-blue-700">
                        Learn More
                    </span>
                    <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-y-0.5 transition-transform" />
                </div>
            </button>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Workflow Guide
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Everything you need to know about creating and managing approval workflows
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        Hide Guide
                    </span>
                    <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400 rotate-180 transition-transform" />
                </div>
            </button>

            <div className="p-6 space-y-6">
                {/* What is a Workflow */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            What is an Approval Workflow?
                        </h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 pl-7">
                        An Approval Workflow defines the approval process for different document types. 
                        It determines who needs to approve what, in what order, and under what conditions. 
                        Workflows ensure that all documents go through the proper review process before 
                        they can be executed.
                    </p>
                </div>

                {/* Workflow Components */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Layers className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Workflow Components
                        </h4>
                    </div>
                    <div className="pl-7 space-y-3">
                        <div className="flex items-start gap-3">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold mt-0.5">1</span>
                            <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Document Type</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Specifies which document type this workflow applies to (Requisitions, Purchase Orders, Cash Advances, Budgets, Cash Transfers).
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold mt-0.5">2</span>
                            <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Maximum Amount</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    The maximum amount this workflow can handle. Documents above this limit use a different workflow.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold mt-0.5">3</span>
                            <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Workflow Steps</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Sequential approval steps. Each step specifies a role, serial number, and required action.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* How Steps Work */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <ListChecks className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            How Steps Work
                        </h4>
                    </div>
                    <div className="pl-7 space-y-2">
                        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">→</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Serial Order:</span> Steps execute in order (Step 1 → Step 2 → Step 3...).
                            </p>
                        </div>
                        <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <span className="text-green-600 dark:text-green-400 font-bold text-sm">→</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Role Assignment:</span> Each step is assigned to a specific role.
                            </p>
                        </div>
                        <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <span className="text-yellow-600 dark:text-yellow-400 font-bold text-sm">→</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Actions:</span> Approve (✓), Reject (✗), or Review with comments.
                            </p>
                        </div>
                    </div>
                </div>

                {/* What You Can Do */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            What You Can Do
                        </h4>
                    </div>
                    <div className="pl-7 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Create Workflows</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Define new workflows for different document types.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <Edit className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Manage Steps</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Add, edit, or reorder steps in a workflow.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Review Workflows</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">View existing workflows and approval paths.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Deactivate</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Deactivate workflows no longer needed.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tips */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Pro Tips
                        </h4>
                    </div>
                    <div className="pl-7 space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400">•</span>
                            <span><span className="font-medium">Think about amount thresholds:</span> Create separate workflows for low, medium, and high value documents.</span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400">•</span>
                            <span><span className="font-medium">Plan your approval hierarchy:</span> Start with department heads, then finance, then executive management.</span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400">•</span>
                            <span><span className="font-medium">Keep steps clear:</span> Each step should have a clear purpose and responsible role.</span>
                        </p>
                    </div>
                </div>

                {/* Quick Reference */}
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Document Types & Typical Workflows
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1 p-2 bg-white dark:bg-gray-700/50 rounded">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span className="text-gray-600 dark:text-gray-400">Requisitions → Dept Head → Finance → Director</span>
                        </div>
                        <div className="flex items-center gap-1 p-2 bg-white dark:bg-gray-700/50 rounded">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-gray-600 dark:text-gray-400">Purchase Orders → Approver → Finance → Procurement</span>
                        </div>
                        <div className="flex items-center gap-1 p-2 bg-white dark:bg-gray-700/50 rounded">
                            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                            <span className="text-gray-600 dark:text-gray-400">Cash Advances → Supervisor → Finance → Director</span>
                        </div>
                        <div className="flex items-center gap-1 p-2 bg-white dark:bg-gray-700/50 rounded">
                            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                            <span className="text-gray-600 dark:text-gray-400">Budgets → Dept Head → Finance → CEO</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==================== COMPONENT ====================
const ApprovalWorkflows: React.FC = () => {
    const nav = useNavigate();
    // ==================== STATE ====================
    const [isInfoExpanded, setIsInfoExpanded] = useState(false);

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
    const { data, loadQuery, loadUpdate, deleteData, isLoading } = useReduxApiData({
        table: 'commons',
        uniqueKey: TABLE_PATH,
        queryType: 'gets',
        mainParam: {grp},
        narration: 'get all purchase requisitions'
    });

    const { 
            data: workflowtypeData, 
            loadQuery: loadworkflowtypeData,
        } = useReduxApiData({
            table: "commons",
            uniqueKey: 'workflowtype',
            queryType: 'gets',
            mainParam: { is_active: 1, grp: 15 },
            narration: 'get all workflowtypes data'
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
    }, []);

    const onActivate = useCallback((row: any): void => {
        const { id, is_active } = row;
        loadUpdate({ id, cat: 'insert', is_active: is_active === 0 ? 1 : 0 });
    }, []);

    const onNext = useCallback((row: any): void => {
        storeTitleRow(row, 1);
        nav(`/setting/workflow/${row.id}`);
    }, []);

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
        loadworkflowtypeData()
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
        loadworkflowtypeData()
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
            { table_action: FullSettingActionNoDelete, table_data: tableData },
            { onNext, onView, onActivate, onEdit, onDelete }
        );
    }, [tableData, onNext, onView, onActivate, onEdit, onDelete]);

    const formattedSelectRows = useMemo(() => {
            const safeData = (data: unknown): any[] => Array.isArray(data) ? data : [];
    
            const formatOptions = (items: any[], labelKey: string, valueKey: string) => {
                return items.map((item: any) => ({
                    label: item[labelKey] || item.name || '',
                    value: item[valueKey] || item.id || '',
                }));
            };
    
            return {
                workflowtypes: formatOptions(safeData(workflowtypeData), 'name', 'id'),
                requisition_types: REQUISITION_TYPE_OPTIONS,
            };
        }, [workflowtypeData, REQUISITION_TYPE_OPTIONS]);
    

    // ==================== RENDER ====================
    return (
        <>
            <PageBreadcrumb pageTitle={displayName} />
            
            {/* Info Panel - Added at the top */}
            <div className="mb-4">
                <WorkflowInfoPanel 
                    isExpanded={isInfoExpanded} 
                    onToggle={() => setIsInfoExpanded(!isInfoExpanded)} 
                />
            </div>

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
                                        optionData={{...formattedSelectRows}}
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

export default ApprovalWorkflows;