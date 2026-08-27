// src/pages/Booking/Clients.tsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import { columnBuilder } from '../../actions/common.js';
import PageBreadcrumb from "../../components/common/PageBreadCrumb.js";
import Tables from '../../components/table/index.jsx';
import Loader from '../../components/ui/Loader.js';
import { FullSettingActionNoDeleteMinimal } from '../../components/ui/TableActionSetting.tsx';
import useReduxApiData from "../../hooks/useTanstackQuery.js";
import { storeTitleRow } from '../../utils/functions/basci.jsx';
import { getTableMapping } from '../../config/tableMapping.js';
import Swal from 'sweetalert2';
import ErrorBoundary from "../../utils/functions/ErrorBoundary.jsx";
import ClientForm from "./Form/ClientForm.tsx";
import Analysis from "./Analysis/ClientAnalysis.tsx"; // Import the Analysis component

// ==================== CONSTANTS ====================
const TABLE_NAME = "clients";
const TABLE_PATH = "client";
const PAGE_SIZE = 500;
const DEFAULT_DAYS = 30;
type TabType = 'table' | 'analysis';

// ==================== TABLE DATA ====================
const tableData = [
    {label: 'ID', name:'id', type:'text', showTable: false, editable:false, element:null},
    {label: 'Name', name:'name', type:'text', showTable: true, editable:false, element:null},
    {label: 'Phone', name:'phone', type:'text', showTable: true, editable:true, element:null},
    {label: 'Email', name:'email', type:'textarea', showTable: true, editable:true, element:null},
    {label: 'Company', name:'company_name', type:'select', showTable: true, editable:true, element:null},
    {label: 'Date', name:'created_at', type:'date', showTable: true, editable:true, element:null},
    {label: 'Bookings', name:'total_bookings', type:'number', showTable: true, editable:true, element:null},
    {label: 'Active', name:'active_bookings', type:'number', showTable: true, editable:true, element:null},
    {label: 'Lodged', name:'lodged_bookings', type:'number', showTable: true, editable:true, element:null},
    {label: 'Vacated', name:'vacated_bookings', type:'number', showTable: true, editable:true, element:null},
];

// ==================== COMPONENT ====================
const Clients: React.FC = () => {
    const nav = useNavigate();

    // ==================== CONFIGURATIONS ====================
    const tableMapping = useMemo(() => getTableMapping(TABLE_NAME), []);
    const columnVisibility = {
      id:false, 
      name:true, 
      phone:true, 
      email:true, 
      company_name:true, 
      created_at:false,
      active_bookings:false,
      total_bookings:false,
      lodged_bookings:false,
      vacated_bookings:false,
    };
    const displayName = "Client List";
    const {grp} = tableMapping || {};

    // ==================== STATE ====================
    const [page, setPage] = useState<number>(0);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [row, setRow] = useState<any>({});
    const [activeTab, setActiveTab] = useState<TabType>('table');
  
    // ==================== API HOOKS ====================
    const { 
        data: clientData, 
        loadQuery: loadClients, 
        loadUpdate, 
        deleteData, 
        refetch,
        isLoading: isLoadingClient 
    } = useReduxApiData({
        table: TABLE_NAME,
        pth: TABLE_PATH,
        queryType: 'gets',
        mainParam: { 
        },
        narration: 'get bookings within date range'
    });

    // ==================== EFFECTS ====================
    useEffect(() => {
        try {
            loadClients();
        } catch (error) {
            console.error('Error loading initial data:', error);
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
                try {
                    deleteData({ id: row.id, cat: 'delete' }, row.id);
                    Swal.fire('Deleted!', 'Your record has been deleted.', 'success');
                } catch (error) {
                    Swal.fire('Error!', 'Failed to delete record.', 'error');
                }
            }
        });
    }, [deleteData]);

    const onActivate = useCallback((row: any): void => {
        try {
            const { id, is_active } = row;
            loadUpdate({ id, cat: 'insert', is_active: is_active === 0 ? 1 : 0 });
        } catch (error) {
            console.error('Error activating record:', error);
        }
    }, []);

    const onNext = useCallback((row: any): void => {
        try {
            storeTitleRow(row, 1);
            nav(`/setting/booking/${row.id}`);
        } catch (error) {
            console.error('Error navigating:', error);
        }
    }, [nav]);

    const onView = useCallback((row: any): void => {
        setRow(row);
        setIsEdit(false);
        setPage(1);
    }, []);

    const handleSave = useCallback((formData: any): void => {
        try {
            loadUpdate(formData);
        } catch (error) {
            console.error('Error saving:', error);
        }
    }, []);

    const handleUpdate = useCallback((formData: any): void => {
        try {
            formData.cat = "insert"
            loadUpdate(formData);
        } catch (error) {
            console.error('Error updating:', error);
        }
    }, []);

    const handleTabChange = useCallback((tab: TabType): void => {
        setActiveTab(tab);
    }, []);

    // ==================== COLUMNS ====================
    const columns = useMemo(() => {
        return columnBuilder(
            { table_action: FullSettingActionNoDeleteMinimal, table_data: tableData },
            { 
                onNext, 
                onView, 
                onActivate, 
                onEdit, 
                onDelete,
            }
        );
    }, [tableData, onNext, onView, onActivate, onEdit, onDelete]);

    const LoadingFallback = () => (
        <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="mt-4 text-gray-600 dark:text-gray-400">Loading Analysis...</div>
            </div>
        </div>
    );

    // ==================== RENDER ====================
    const isLoading = isLoadingClient;

    // Safe data access
    const safeclientData = useMemo(() => {
        return clientData || [];
    }, [clientData]);

    return (
        <>
            <PageBreadcrumb pageTitle={`${displayName}`} />
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    onClick={() => handleTabChange('table')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === 'table'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                >
                    📋 Table View
                </button>
                <button
                    onClick={() => handleTabChange('analysis')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === 'analysis'
                            ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                >
                    📊 Analysis
                </button>
            </div>

            <div className="space-y-6">
                <div className="p-1">
                    {activeTab === 'table' && (
                        !isLoading ? (
                            <>
                                {page === 0 ? (
                                    <>
                                      <ErrorBoundary fallback={LoadingFallback}>
                                          <Tables
                                              onAdd={onAdd}
                                              reload={refetch}
                                              home={() => nav('/')}
                                              rows={safeclientData}
                                              columns={columns}
                                              pageSize={PAGE_SIZE}
                                              cV={columnVisibility}
                                          />
                                      </ErrorBoundary>
                                    </>
                                ) : (
                                    <div className="space-y-6">
                                        <ClientForm
                                            title={isEdit ? `Edit ${displayName}` : `Create ${displayName}`}
                                            submitLabel={isEdit ? `Update ${displayName}` : `Create ${displayName}`}
                                            onSubmit={isEdit ? handleUpdate : handleSave}
                                            initialData={isEdit ? row : { grp }}
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
                        )
                    )}

                    {activeTab === 'analysis' && (
                        <Analysis data={safeclientData} isLoading={isLoading} />
                    )}
                </div>
            </div>
        </>
    );
};

export default Clients;