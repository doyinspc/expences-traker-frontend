// src/pages/Procurement/Userroles.tsx

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { columnBuilder } from '../../../actions/common.js';
import PageBreadcrumb from "../../../components/common/PageBreadCrumb.js";
import ComponentCard from "../../../components/common/ComponentCard.js";
import Tables from '../../../components/table/index.jsx';
import Loader from '../../../components/ui/Loader.js';
import DynamicForm from "../../../components/ui/DynamicForm.js";
import { TableAction } from '../../../components/ui/TableAction.js';
import { InfoPanel } from '../../../components/ui/InfoPanel.js';
import { BackIcon, AddIcon, ReloadIcon, InfoIcon } from '../../../components/ui/TableIcons.js';
import useReduxApiData from "../../../hooks/useReduxApiData.js";
import { 
    buildTableDataFromMapping, 
    buildColumnVisibility,
    getTableAnalysisConfig,
    getAnalyzableFields,
    getFilterableFields,
    getTableDisplayName
} from '../../../utils/functions/tableBuilder.js';
import { getTableMapping } from '../../../config/tableMapping.js';
import Swal from 'sweetalert2';
import { processRows } from '../../../utils/functions/dataHelpers.js';
import { useSelector } from "react-redux";

// ==================== TYPES ====================

interface UserInterface {
    id?: string | number;
    employee_id?: string;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    photo?: string;
    title?: string;
    date_of_birth?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    employment_type?: string;
    employment_date?: string;
    job_title?: string;
    department_id?: string | number;
    is_active?: boolean;
    last_login_at?: string;
    created_at?: string;
    updated_at?: string;
}

interface UserrolesProps {
    UserData?: UserInterface;
    onClose?: () => void;
    onSave?: () => void;
}

// ==================== CONSTANTS ====================
const TABLE_NAME = "userroles";
const TABLE_PATH = "userrole";
const PAGE_SIZE = 500;
// This is the grp value for roles, adjust as necessary

// ==================== COMPONENT ====================
const Userroles: React.FC<UserrolesProps> = ({ 
    UserData = {}, 
    onClose,
    onSave 
}) => {
    const nav = useNavigate();
    const hasLoaded = useRef(false);
    const isMounted = useRef(true);

    // ==================== REDUX ====================
    const { id: staffId } = useSelector((state: any) => state.userReducer) || {};
    const isAdmin = true;

    // ==================== CONFIGURATIONS ====================
    const tableMapping = useMemo(() => getTableMapping(TABLE_NAME), []);
    const analysisConfig = useMemo(() => getTableAnalysisConfig(TABLE_NAME), []);
    const tableData = useMemo(() => buildTableDataFromMapping(TABLE_NAME), []);
    const columnVisibility = useMemo(() => buildColumnVisibility(TABLE_NAME), []);
    const filterableFields = useMemo(() => getFilterableFields(TABLE_NAME), []);
    const analyzableFields = useMemo(() => getAnalyzableFields(TABLE_NAME), []);
    const displayName = useMemo(() => getTableDisplayName(TABLE_NAME), []);
    const { grp } = tableMapping || {};
    const TABLE_PAGE_NUM = grp; 

    const userid = UserData?.id;
    const {first_name, last_name} = UserData || {};
    const userFullName = `${first_name || ''} ${last_name || ''}`.trim();
    const initialData = useMemo(() => ({ grp, user_id: userid }), [grp, userid]);

    // ==================== STATE ====================
    const [page, setPage] = useState<number>(0);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [row, setRow] = useState<any>({});
    const [showInfo, setShowInfo] = useState<boolean>(false);

    // ==================== API HOOKS ====================
    const { 
        data, 
        loadQuery, 
        loadUpdate, 
        deleteData, 
        isLoading 
    } = useReduxApiData({
        table: "users",
        pth: TABLE_PATH,
        queryType: 'getUserData',
        mainParam: { grp, user_id: userid },
        narration: 'get role allocated to current user',
    });

    const { 
        data: roleData, 
        loadQuery: loadRoleData, 
        isLoading: isRoleLoading 
    } = useReduxApiData({
        table: isAdmin ? "roles" : "users",
        pth: "role",
        queryType: isAdmin ? 'gets' : 'getUserData',
        mainParam: isAdmin ? { grp: TABLE_PAGE_NUM } : { grp: TABLE_PAGE_NUM, user_id: staffId },
        narration: 'get all role current user can permit',
    });

    // ==================== HANDLERS ====================
    const onAdd = useCallback((e?: React.MouseEvent): void => {
        e?.preventDefault();
        e?.stopPropagation();
        setIsEdit(false);
        setRow({});
        setPage(1);
    }, []);

    const onEdit = useCallback((rowData: any, e?: React.MouseEvent): void => {
        e?.preventDefault();
        e?.stopPropagation();
        setIsEdit(true);
        setRow(rowData);
        setPage(1);
    }, []);

    const onDelete = useCallback((rowData: any, e?: React.MouseEvent): void => {
        e?.preventDefault();
        e?.stopPropagation();
        
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
                deleteData({ id: rowData.id, act: 3, cat: 'insertData' }, rowData.id);
                Swal.fire('Deleted!', 'Your record has been deleted.', 'success');
            }
        });
    }, [deleteData]);

    const onActivate = useCallback((rowData: any, e?: React.MouseEvent): void => {
        e?.preventDefault();
        e?.stopPropagation();
        const { id, is_active } = rowData;
        loadUpdate({ id, cat: 'insertData', is_active: is_active === 0 ? 1 : 0 });
    }, [loadUpdate]);

    const onNext = useCallback((rowData: any, e?: React.MouseEvent): void => {
        e?.preventDefault();
        e?.stopPropagation();
        nav(`/procurement/requisition/${rowData.id}`);
    }, [nav]);

    const onView = useCallback((rowData: any, e?: React.MouseEvent): void => {
        e?.preventDefault();
        e?.stopPropagation();
        setRow(rowData);
        setIsEdit(false);
        setPage(1);
    }, []);

    const handleSave = useCallback((formData: any): void => {
        formData.cat = 'insertData';
        loadUpdate(formData);
        if (onSave) onSave();
    }, [loadUpdate, onSave]);

    const handleUpdate = useCallback((formData: any): void => {
        formData.cat = 'insertData';
        loadUpdate(formData);
        if (onSave) onSave();
    }, [loadUpdate, onSave]);

    const handleReload = useCallback((): void => {
        loadQuery(initialData);
    }, [loadQuery, initialData]);

    const toggleInfo = useCallback((e?: React.MouseEvent): void => {
        e?.preventDefault();
        e?.stopPropagation();
        setShowInfo(prev => !prev);
    }, []);

    const reload = useCallback((e?: React.MouseEvent): void => {
        e?.preventDefault();
        e?.stopPropagation();
        loadQuery(initialData);
    }, [loadQuery, initialData]);

    const addData = useCallback((e?: React.MouseEvent): void => {
        e?.preventDefault();
        e?.stopPropagation();
        onAdd();
    }, [onAdd]);

    const goBack = useCallback((e?: React.MouseEvent): void => {
        e?.preventDefault();
        e?.stopPropagation();
         if (onClose) onClose();
    }, [onClose]);

    // ==================== DATA PROCESSING ====================
    const processedRows = useMemo(() => {
        return processRows(data as Array<any>, TABLE_NAME);
    }, [data]);

    const filteredRows = useMemo(() => processedRows, [processedRows]);

    // ==================== ROLE OPTIONS ====================
    const processedRoleRows = useMemo(() => {
        if (!Array.isArray(roleData) || roleData.length === 0) {
            return [];
        }

        return roleData.map((role: any) => ({
            label: isAdmin ? role.name : role.itemname1,
            value: isAdmin ? role.id : role.itemid1
        }));
    }, [roleData, isAdmin]);

    // ==================== EFFECTS ====================
    // 🛡️ ONLY run when userid or staffId changes, NOT on function changes
    useEffect(() => {
        if (!isMounted.current) return;
        
        if (userid && !hasLoaded.current) {
            hasLoaded.current = true;
            loadQuery(initialData);
            loadRoleData({ grp: TABLE_PAGE_NUM, userid: staffId });
        }
        
        // Cleanup
        return () => {
            isMounted.current = false;
        };
    // 🛡️ EMPTY dependency array - only runs once on mount
    }, []);

    // ==================== COLUMNS ====================
    const columns = useMemo(() => {
        return columnBuilder(
            { 
                table_action: TableAction, 
                table_data: tableData 
            },
            { onNext, onView, onActivate, onEdit, onDelete }
        );
    }, [tableData, onNext, onView, onActivate, onEdit, onDelete]);

    // ==================== RENDER ====================
    return (
        <div onClick={(e) => e.stopPropagation()}>
            {/* Header: Actions */}
            <ComponentCard title={`${userFullName} ${displayName}`} >
            <div className="flex items-center justify-end gap-2 mb-4">
                <button
                    onClick={goBack}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Go Back"
                    type="button"
                >
                    <BackIcon />
                </button>
                <button
                    onClick={addData}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Add New Record"
                    type="button"
                >
                    <AddIcon />
                </button>
                <button
                    onClick={reload}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Reload Data"
                    type="button"
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
                    type="button"
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

            <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
                <div className="p-1">
                    {!isLoading ? (
                        <>
                            {page === 0 ? (
                                <Tables
                                    onAdd={onAdd}
                                    reload={handleReload}
                                    home={() => nav('/')}
                                    rows={filteredRows}
                                    columns={columns}
                                    pageSize={PAGE_SIZE}
                                    cV={columnVisibility}
                                />
                            ) : (
                                <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
                                    <DynamicForm
                                        tableName={TABLE_NAME}
                                        title={isEdit ? `${userFullName}  Edit ${displayName}` : `Create ${displayName}`}
                                        submitLabel={isEdit ? `Update ${displayName}` : `Create ${displayName}`}
                                        onSave={isEdit ? handleUpdate : handleSave}
                                        initialData={isEdit ? row : initialData}
                                        onCancel={() => setPage(0)}
                                        optionData={{ roles: processedRoleRows }}
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

            </ComponentCard>
            
        </div>
    );
};

export default Userroles;