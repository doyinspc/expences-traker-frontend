import SelectedResetInvitations from './SelectedResetInvitations.jsx';
import { useSelector } from 'react-redux';
import { ArrowRight, Mail } from 'lucide-react';
import UserManagementControls from './UserManagementControls';
import useManagementAccess from '../../hooks/useManagementAccess';
﻿// src/pages/Procurement/Requisitions.tsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import UserInfoCard from "./UserComponents/UserInfoPage.jsx";
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
const TABLE_NAME = "users";
const TABLE_PATH = "user";
const PAGE_SIZE = 500;
type TabType = 'table' | 'analysis';

// ==================== COMPONENT ====================
const Users: React.FC = () => {
    const nav = useNavigate();
    const { data: management } = useManagementAccess();
    const workspace = useSelector((state: any) => state.authReducer || state.auth || {});
    const scopeKey = `${workspace.location_id || 0}:${workspace.role_id || 0}:${Boolean(management?.is_super_admin)}`;
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    useEffect(() => { setSelectedIds([]); }, [scopeKey]);
    const clearSelection = useCallback(() => setSelectedIds([]), []);
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
    const { data, loadQuery, loadUpdate, isLoading, isProcessing, error: usersError } = useReduxApiData({
        table: TABLE_NAME,
        uniqueKey: TABLE_PATH,
        queryType: 'gets',
        mainParam: {grp},
        narration: 'get all users'
    });
    const { 
        data: departmentData, 
        loadQuery: loaddepartmentData,
    } = useReduxApiData({
        table: "commons",
        uniqueKey: 'department',
        queryType: 'gets',
        mainParam: { is_active: 1, grp: 2 },
        narration: 'get all departments data'
    });
    const { 
        data: locationData, 
        loadQuery: loadlocationData,
    } = useReduxApiData({
        table: "commons",
        uniqueKey: 'location',
        queryType: 'gets',
        mainParam: { is_active: 0, grp: 4 },
        narration: 'get all locations data'
    });
    const { 
        data: roleData, 
        loadQuery: loadroleData,
    } = useReduxApiData({
        table: "commons",
        uniqueKey: 'role',
        queryType: 'gets',
        mainParam: { is_active: 1, grp: 1 },
        narration: 'get all roles data'
    });
    // Reuse only verified employment references already present in shared user data.
    // There is no configured employment-type master group; role IDs must never be offered here.
    const employmenttypeData = useMemo(() => {
        const choices = new Map();
        for (const user of Array.isArray(data) ? data : []) if(user.employment_type && user.employment_type_name) choices.set(user.employment_type, {id:user.employment_type,name:user.employment_type_name});
        return [...choices.values()];
    }, [data]);

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

    const onDelete = useCallback(async (row: any) => {
        const result = await Swal.fire({ title:'Delete this user?', text:'This permanently removes the user account.', icon:'warning', showCancelButton:true, confirmButtonText:'Delete user' });
        if(!result.isConfirmed)return;
        try { await loadUpdate({id:row.id,cat:'insert',act:3}); }
        catch { /* The API hook displays the server's error; no success is shown on failure. */ }
    }, [loadUpdate]);

    const onActivate = useCallback(async (row: any) => {
        try { await loadUpdate({id:row.id,cat:'insert',is_active:Number(row.is_active)===1?0:1}); }
        catch { /* Keep the visible state until the server confirms the change. */ }
    }, [loadUpdate]);

    const onNext = useCallback((row: any): void => {
        nav(`/setting/user/${row.id}/activity`);
    }, [nav]);

    const onView = useCallback((row: any): void => {
        setRow(row);
        setIsEdit(false);
        setPage(2);
    }, []);

    const handleSave = useCallback(async (formData: any) => {
        const result = await loadUpdate(formData);
        setPage(0);
        return result;
    }, []);

    const handleUpdate = useCallback(async (formData: any) => {
        return await loadUpdate(formData);
    }, []);

    const handleReload = useCallback((): void => {
        loadQuery(initialData);
        loaddepartmentData()
        loadroleData()
        loadlocationData()
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

    // ==================== HANDLERS ====================
    const handleUpdatePassword = useCallback(async (data: any) => {
        return await loadUpdate({
            ...data,
            cat: 'updatePassword'
        });
    }, []);

    const handleForceReset = useCallback(async (data: any) => {
        return await loadUpdate({
            ...data,
            cat: 'forceResetPassword'
        });
    }, []);

    const handleUpdatePhoto = useCallback(async (formData: FormData) => {
        return await loadUpdate(formData);
    }, []);

    const handleRemovePhoto = useCallback(async (data: any) => {
        return await loadUpdate({
            ...data,
            cat: 'removePhoto'
        });
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
        loaddepartmentData()
        loadroleData()
        loadlocationData()
    }, []);

    useEffect(() => {
        if (analysisConfig) {
            setAnalysisGroupBy(analysisConfig.defaultGroupBy || availableDimensions[0] || '');
            setAnalysisMetric(analysisConfig.defaultMetric || availableMetrics[0] || '');
        }
    }, [analysisConfig, availableDimensions, availableMetrics]);

    const formattedSelectRows = useMemo(() => {
                const safeData = (data: unknown): any[] => Array.isArray(data) ? data : [];
                const formatOptions = (items: any[], labelKey: string, valueKey: string) => {
                    return items.map((item: any) => ({
                        label: item[labelKey] || item.name || '',
                        value: item[valueKey] || item.id || '',
                    }));
                };
        
                return {
                    departments: formatOptions(safeData(departmentData), 'name', 'id'),
                    roles: formatOptions(safeData(roleData), 'name', 'id'),
                    locations: formatOptions(safeData(locationData), 'name', 'id'),
                    employment_type: formatOptions(safeData(employmenttypeData), 'name', 'id'),
                };
            }, [departmentData, roleData, locationData, employmenttypeData]);
        

    // ==================== COLUMNS ====================
    const columns = useMemo(() => {
        const actions = (props: any) => <div className="flex items-center gap-1">
          <TableAction {...props} showNext={false} />
          <button type="button" onClick={() => onNext(props.row)} title="Staff activity" aria-label={`View activity for ${props.row.employee_id || props.row.id}`} className="rounded-lg p-2 text-brand-600 dark:text-brand-300"><ArrowRight size={18} /></button>
          {management?.can_send_reset_invitations && <button type="button" onClick={() => setSelectedIds([Number(props.row.id)])} title="Select for reset email" aria-label={`Select ${props.row.employee_id || props.row.id} for reset email`} className="rounded-lg p-2 text-gray-600 dark:text-gray-300"><Mail size={18} /></button>}
        </div>;
        const result = columnBuilder({ table_action: actions, table_data: tableData }, { onNext, onView, onActivate, onEdit, onDelete });
        if(management?.can_send_reset_invitations)result.unshift({ id: 'reset_selection', header: 'Reset email', enableSorting: false,
          cell: ({row}: any) => <input type="checkbox" aria-label={`Select ${row.original.employee_id || row.original.id} for password reset`} checked={selectedIds.includes(Number(row.original.id))} onChange={event => setSelectedIds(ids => event.target.checked ? [...ids, Number(row.original.id)] : ids.filter(id => id !== Number(row.original.id)))} /> });
        return result;
    }, [tableData, onNext, onView, onActivate, onEdit, onDelete, management?.can_send_reset_invitations, selectedIds]);

    // ==================== RENDER ====================
    return (
        <>
            <PageBreadcrumb pageTitle={displayName} />
            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">{management?.is_super_admin ? 'Company-wide directory · All locations' : 'Users assigned to your selected location'}</p>
            <UserManagementControls users={Array.isArray(data) ? data : (data?.data || [])} />
            {management?.can_send_reset_invitations && page === 0 && <SelectedResetInvitations key={scopeKey} scopeKey={scopeKey} users={Array.isArray(data) ? data : (data?.data || [])} selectedIds={selectedIds} onClear={clearSelection} />}
            <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">The forward arrow opens staff activity. The envelope selects one person for a reset email; use the checkboxes for several people, then review the recipients above.</p>
            {usersError && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"><p className="font-semibold">Users could not be loaded</p><p className="mt-1">{usersError.response?.data?.message || usersError.message || 'Please try again.'}</p><button type="button" onClick={handleReload} className="mt-2 min-h-11 underline">Retry loading users</button></div>}
            
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
                                        OPTION_DATA={formattedSelectRows}
                                    />

                                    <TabNavigation
                                        activeTab={activeTab}
                                        onTabChange={handleTabChange}
                                        hasAnalysis={analysisConfig?.enabled || false}
                                        recordCount={filteredRows.length}
                                    />

                                    {!usersError && !isLoading && filteredRows.length === 0 && <p role="status" className="my-4 rounded-lg border border-gray-200 p-4 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">{searchTerm || activeFilterCount ? 'No users match your search or filters. Clear them to see all available users.' : management?.is_super_admin ? 'No users are available in the company directory.' : 'No users are assigned to your selected location. Ask an administrator to review user location memberships.'}</p>}
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
                            ) : null}
                            {page === 1 ?(
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
                            ):null}
                            {page === 2 ?(
                                <div className="space-y-6">
                                    <UserInfoCard
                                        userData={row}
                                        onSave={handleUpdate}
                                        onClose={() => setPage(0)}
                                        handleForceReset={handleForceReset}
                                        handleRemovePhoto={handleRemovePhoto}
                                        handleUpdatePhoto={handleUpdatePhoto}
                                        handleUpdatePassword={handleUpdatePassword}
                                        isLoading={isProcessing}
                                    />
                                </div>
                            ):null}
                        </>
                    ) : (
                        <Loader scope="panel" variant="skeleton" text={`Loading ${displayName.toLowerCase()}…`} />
                    )}
                </div>
            </div>
        </>
    );
};

export default Users;