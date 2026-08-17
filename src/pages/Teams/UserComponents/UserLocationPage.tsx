// src/pages/Procurement/Userlocations.tsx

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import ComponentCard from "../../../components/common/ComponentCard";
import Tables from '../../../components/table/index.jsx';
import Loader from '../../../components/ui/Loader';
import DynamicForm from "../../../components/ui/DynamicForm";
import { UserTableAction } from '../../../components/ui/TableActionUser.js';
import { InfoPanel } from '../../../components/ui/InfoPanel';
import { BackIcon, AddIcon, ReloadIcon, InfoIcon } from '../../../components/ui/TableIcons';
import useReduxApiData from "../../../hooks/useTanstackQuery.js";
import { 
    buildTableDataFromMapping, 
    buildColumnVisibility,
    getTableAnalysisConfig,
    getAnalyzableFields,
    getFilterableFields,
    getTableDisplayName
} from '../../../utils/functions/tableBuilder';
import { getTableMapping } from '../../../config/tableMapping';
import Swal from 'sweetalert2';
import { processRows } from '../../../utils/functions/dataHelpers';
import { useSelector } from "react-redux";
import UserRolePage from "./UserRolePage.js";
import ErrorBoundary from "../../../utils/functions/ErrorBoundary.jsx";
import UserDepartmentPage from "./UserDepartmentPage.jsx";
import UserManagerPage from "./UserManagerPage.jsx";
import UserAccessPage from "./UserAccessPage.jsx";
import { createColumnHelper } from '@tanstack/react-table';

// ==================== TYPES ====================

const Sections: Record<number, string> = {
    2: "Roles",
    3: "Department",
    4: "Locations",
    5: "Line Managers",
    6: "Access",
};

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

interface UserlocationsProps {
    UserData?: UserInterface;
    onClose?: () => void;
    onSave?: () => void;
}

// ==================== CONSTANTS ====================
const TABLE_NAME = "userlocations";
const TABLE_PATH = "userlocation";
const PAGE_SIZE = 500;

// ==================== CUSTOM COLUMN BUILDER ====================
const columnHelper = createColumnHelper();

interface ColumnBuilderProps {
    tableData: any[];
    onEdit?: (row: any) => void;
    onDelete?: (row: any) => void;
    onView?: (row: any) => void;
    onActivate?: (row: any) => void;
    onNext?: (row: any) => void;
    onManagers?: (row: any) => void;
    onRoles?: (row: any) => void;
    onDepartment?: (row: any) => void;
    onAccess?: (row: any) => void;
}

const buildUserColumns = ({
    tableData,
    onEdit,
    onDelete,
    onView,
    onActivate,
    onNext,
    onManagers,
    onRoles,
    onDepartment,
    onAccess
}: ColumnBuilderProps) => {
    const columns: any[] = [];

    // 1. Serial Number Column
    columns.push(
        columnHelper.display({
            id: 'sn',
            header: 'SN',
            size: 40,
            minSize: 40,
            maxSize: 40,
            cell: ({ row }) => row.index + 1,
        })
    );

    // 2. Data Columns from mapping
    tableData.forEach((element) => {
        if (element.showTable) {
            const columnSize = typeof element.width === 'number' ? element.width : 150;
            
            columns.push(
                columnHelper.accessor(element.name.toString(), {
                    id: element.name.toString(),
                    header: element.label,
                    size: columnSize,
                    meta: {
                        align: element.align || 'left'
                    },
                    cell: element.format 
                        ? (props: any) => element.format(props.getValue())
                        : ({ getValue }: any) => getValue(),
                })
            );
        }
    });

    // 3. Actions Column with UserTableAction
    columns.push(
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            size: 480,
            minSize: 400,
            cell: ({ row }) => (
                <UserTableAction
                    row={row.original}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onView={onView}
                    onActivate={onActivate}
                    onNext={onNext}
                    onManagers={onManagers}
                    onRoles={onRoles}
                    onDepartment={onDepartment}
                    onAccess={onAccess}
                    size="sm"
                    showEdit={true}
                    showDelete={true}
                    showManagers={false}
                    showRoles={true}
                    showDepartment={false}
                    showAccess={true}
                    is_active={row.original?.is_active}
                />
            ),
        })
    );

    return columns;
};

// ==================== COMPONENT ====================
const Userlocations: React.FC<UserlocationsProps> = ({ 
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

    const userid = UserData?.id;
    const { first_name, last_name } = UserData || {};
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
        uniqueKey: TABLE_PATH,
        queryType: 'getUserData',
        mainParam: { grp, user_id: userid },
        narration: 'get location allocated to current user',
    });

    const { 
        data: locationData, 
        loadQuery: loadLocationData, 
    } = useReduxApiData({
        table: isAdmin ? "locations" : "users",
        uniqueKey: "location",
        queryType: isAdmin ? 'gets' : 'getUserData',
        mainParam: isAdmin ? { grp: 4 } : { grp: 4, user_id: staffId },
        narration: 'get all location current user can permit',
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
                loadUpdate({ id: rowData.id, act: 3, cat: 'insertData' });
                Swal.fire('Deleted!', 'Your record has been deleted.', 'success');
            }
        });
    }, [deleteData]);

    const onActivate = useCallback((rowData: any, e?: React.MouseEvent): void => {
        e?.preventDefault();
        e?.stopPropagation();
        const { id, is_active } = rowData;
        const newStatus = is_active === 0 ? 1 : 0;
        loadUpdate({ id, cat: 'insertData', is_active: newStatus });
    }, []);

    const onView = useCallback((rowData: any, e?: React.MouseEvent): void => {
        e?.preventDefault();
        e?.stopPropagation();
        setRow(rowData);
        setIsEdit(false);
        setPage(1);
    }, []);

    const onNext = useCallback((rowData: any, e?: React.MouseEvent): void => {
        e?.preventDefault();
        e?.stopPropagation();
        setIsEdit(true);
        setRow(rowData);
        setPage(2);
    }, []);

    // ==================== NEW HANDLERS FOR UserTableAction ====================
    const onManagers = useCallback((rowData: any, e?: React.MouseEvent): void => {
        e?.preventDefault();
        e?.stopPropagation();
        setIsEdit(true);
        setRow(rowData);
        setPage(5);
    }, []);

    const onRoles = useCallback((rowData: any, e?: React.MouseEvent): void => {
        e?.preventDefault();
        e?.stopPropagation();
        setIsEdit(true);
        setRow(rowData);
        setPage(2);
    }, []);

    const onDepartment = useCallback((rowData: any, e?: React.MouseEvent): void => {
        e?.preventDefault();
        e?.stopPropagation();
        setIsEdit(true);
        setRow(rowData);
        setPage(3);
    }, []);

    const onAccess = useCallback((rowData: any, e?: React.MouseEvent): void => {
        e?.preventDefault();
        e?.stopPropagation();
        setIsEdit(true);
        setRow(rowData);
        setPage(6);
    }, []);

    const handleSave = useCallback((formData: any): void => {
        formData.cat = 'insertData';
        loadUpdate(formData);
        if (onSave) onSave();
    }, [onSave]);

    const handleUpdate = useCallback((formData: any): void => {
        formData.cat = 'insertData';
        loadUpdate(formData);
        if (onSave) onSave();
    }, [onSave]);

    const handleReload = useCallback((): void => {
        loadQuery(initialData);
    }, [initialData]);

    const toggleInfo = useCallback((e?: React.MouseEvent): void => {
        e?.preventDefault();
        e?.stopPropagation();
        setShowInfo(prev => !prev);
    }, []);

    const reload = useCallback((e?: React.MouseEvent): void => {
        e?.preventDefault();
        e?.stopPropagation();
        loadQuery(initialData);
    }, [initialData]);

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

    // ==================== LOCATION OPTIONS ====================
    const processedLocationRows = useMemo(() => {
        if (!Array.isArray(locationData) || locationData.length === 0) {
            return [];
        }

        return locationData.map((location: any) => ({
            label: isAdmin ? location.name : location.itemname1,
            value: isAdmin ? location.id : location.itemid1
        }));
    }, [locationData, isAdmin]);

    // ==================== EFFECTS ====================
    useEffect(() => {
        if (!isMounted.current) return;
        
        if (userid && !hasLoaded.current) {
            hasLoaded.current = true;
            loadQuery(initialData);
            loadLocationData({ grp: 4, userid: staffId });
        }
        
        return () => {
            isMounted.current = false;
        };
    }, []);

    // ==================== BUILD COLUMNS ====================
    const columns = useMemo(() => {
        return buildUserColumns({
            tableData,
            onEdit,
            onDelete,
            onView,
            onActivate,
            onNext,
            onManagers,
            onRoles,
            onDepartment,
            onAccess
        });
    }, [tableData, onEdit, onDelete, onView, onActivate, onNext, onManagers, onRoles, onDepartment, onAccess]);

    // ==================== RENDER ====================
    const locationName = row?.name || row?.itemname1 || "";

    const getTitle = () => {
        let title = `${userFullName} Profile`;
        if (locationName) {
            title += ` | ${locationName}`;
        }
        title += ` ${displayName}`;
        if (page > 1 && Sections[page]) {
            title += ` | ${Sections[page]}`;
        }
        return title;
    };

    // Render header with title and buttons on the same row
    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between w-full">
                {/* Title - Left side */}
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {getTitle()}
                </h2>
                
                {/* Buttons - Right side (only on page 0) */}
                {page === 0 && (
                    <div className="flex items-center gap-2 flex-shrink-0">
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
                )}
            </div>
        );
    };

    return (
        <div onClick={(e) => e.stopPropagation()}>
            <ComponentCard title={renderHeader()}>
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
                                {page === 0 && (
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

                                {page === 1 && (
                                    <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
                                        <DynamicForm
                                            tableName={TABLE_NAME}
                                            title={isEdit ? `${userFullName} Edit ${displayName}` : `Create ${displayName}`}
                                            submitLabel={isEdit ? `Update ${displayName}` : `Create ${displayName}`}
                                            onSave={isEdit ? handleUpdate : handleSave}
                                            initialData={isEdit ? row : initialData}
                                            onCancel={() => setPage(0)}
                                            optionData={{ locations: processedLocationRows }}
                                        />
                                    </div>
                                )}

                                {page === 2 && (
                                    <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
                                        <ErrorBoundary>
                                            <React.Suspense fallback={<div>Loading Role...</div>}>
                                                <UserRolePage 
                                                    UserData={UserData} 
                                                    LocationData={row} 
                                                    onClose={() => setPage(0)} 
                                                />  
                                            </React.Suspense>
                                        </ErrorBoundary>
                                    </div>
                                )}

                                {page === 3 && (
                                    <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
                                        <ErrorBoundary>
                                            <React.Suspense fallback={<div>Loading Department...</div>}>
                                                <UserDepartmentPage 
                                                    UserData={UserData} 
                                                    location={row} 
                                                    onClose={() => setPage(0)} 
                                                />  
                                            </React.Suspense>
                                        </ErrorBoundary>
                                    </div>
                                )}

                                {page === 4 && (
                                    <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
                                        <ErrorBoundary>
                                            <React.Suspense fallback={<div>Loading Locations...</div>}>
                                                <UserDepartmentPage 
                                                    UserData={UserData} 
                                                    location={row} 
                                                    onClose={() => setPage(0)} 
                                                />  
                                            </React.Suspense>
                                        </ErrorBoundary>
                                    </div>
                                )}

                                {page === 5 && (
                                    <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
                                        <ErrorBoundary>
                                            <React.Suspense fallback={<div>Loading Managers...</div>}>
                                                <UserManagerPage 
                                                    UserData={UserData} 
                                                    location={row} 
                                                    onClose={() => setPage(0)} 
                                                />  
                                            </React.Suspense>
                                        </ErrorBoundary>
                                    </div>
                                )}

                                {page === 6 && (
                                    <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
                                        <ErrorBoundary>
                                            <React.Suspense fallback={<div>Loading Access...</div>}>
                                                <UserAccessPage 
                                                    UserData={UserData} 
                                                    location={row} 
                                                    onClose={() => setPage(0)} 
                                                />  
                                            </React.Suspense>
                                        </ErrorBoundary>
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

export default Userlocations;