// src/pages/Procurement/Requisitions.tsx

import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from "react";
import { useNavigate } from 'react-router-dom';
import { columnBuilder } from '../../actions/common.js';
import PageBreadcrumb from "../../components/common/PageBreadCrumb.js";
import Tables from '../../components/table/index.jsx';
import Loader from '../../components/ui/Loader.js';
import { FullStageAction } from '../../components/ui/TableActionBooking.tsx';
import useReduxApiData from "../../hooks/useTanstackQuery.js";
import { 
    buildColumnVisibility, 
    getTableFilterConfig,
    getTableDisplayName
} from '../../utils/functions/tableBuilder.js';
import { storeTitleRow } from '../../utils/functions/basci.jsx';
import { getTableMapping } from '../../config/tableMapping.js';
import Swal from 'sweetalert2';
import ErrorBoundary from "../../utils/functions/ErrorBoundary.jsx";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Lazy load Analysis component
const BookingAnalysis = lazy(() => import("./Components/Analysis.tsx").catch(() => ({
    default: () => (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-8 text-center border border-yellow-200 dark:border-yellow-800">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">Analysis Component Unavailable</h3>
            <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-2">The analysis module failed to load. Please try refreshing the page.</p>
        </div>
    )
})));

// ==================== CONSTANTS ====================
const TABLE_NAME = "bookings";
const TABLE_PATH = "booking";
const PAGE_SIZE = 500;
const DEFAULT_DAYS = 30;
type TabType = 'table' | 'analysis';

// ==================== TABLE DATA ====================
const tableData = [
    {label: 'ID', name:'id', type:'text', showTable: false, editable:false, element:null},
    {label: 'Building', name:'room_parent_name', type:'text', showTable: true, editable:false, element:null},
    {label: 'Room', name:'room_name', type:'text', showTable: true, editable:true, element:null},
    {label: 'Client', name:'client_name', type:'textarea', showTable: true, editable:true, element:null},
    {label: 'Company', name:'company_name', type:'select', showTable: true, editable:true, element:null},
    {label: 'Date', name:'date', type:'text', showTable: true, editable:true, element:null},
];

// ==================== COMPONENT ====================
const Reports: React.FC = () => {
    const nav = useNavigate();

    // ==================== CONFIGURATIONS ====================
    const tableMapping = useMemo(() => getTableMapping(TABLE_NAME), []);
    const filterConfig = useMemo(() => getTableFilterConfig(TABLE_NAME), []);
    const columnVisibility = useMemo(() => buildColumnVisibility(TABLE_NAME), []);
    const displayName = useMemo(() => getTableDisplayName(TABLE_NAME), []);
    const {grp} = tableMapping || {};

    // ==================== STATE ====================
    const [page, setPage] = useState<number>(0);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [row, setRow] = useState<any>({});
    const [activeTab, setActiveTab] = useState<TabType>('table');
    const [showFilters, setShowFilters] = useState<boolean>(true);

    // ==================== FILTER STATE (for UI) ====================
    const [filterStartDate, setFilterStartDate] = useState<Date | null>(() => {
        try {
            const date = new Date();
            date.setDate(date.getDate() - DEFAULT_DAYS);
            return date;
        } catch {
            return null;
        }
    });
    const [filterEndDate, setFilterEndDate] = useState<Date | null>(() => {
        try {
            return new Date();
        } catch {
            return null;
        }
    });
    const [filterSelectedRoomId, setFilterSelectedRoomId] = useState<string>('');
    const [filterSelectedParentId, setFilterSelectedParentId] = useState<string>('');
    
    // Status filters as checkboxes - Booked checked by default
    const [filterIsBooked, setFilterIsBooked] = useState<boolean>(true);
    const [filterIsLodged, setFilterIsLodged] = useState<boolean>(false);
    const [filterIsVacated, setFilterIsVacated] = useState<boolean>(false);

    // ==================== ACTIVE QUERY PARAMS (used for API calls) ====================
    const [queryStartDate, setQueryStartDate] = useState<Date | null>(() => {
        try {
            const date = new Date();
            date.setDate(date.getDate() - DEFAULT_DAYS);
            return date;
        } catch {
            return null;
        }
    });
    const [queryEndDate, setQueryEndDate] = useState<Date | null>(() => {
        try {
            return new Date();
        } catch {
            return null;
        }
    });
    const [queryRoomId, setQueryRoomId] = useState<string>('');
    const [queryParentId, setQueryParentId] = useState<string>('');
    const [queryIsBooked, setQueryIsBooked] = useState<string>('1');
    const [queryIsLodged, setQueryIsLodged] = useState<string>('');
    const [queryIsVacated, setQueryIsVacated] = useState<string>('');

    // ==================== API HOOKS ====================
    const { 
        data: bookingsData, 
        loadQuery: loadBookings, 
        loadUpdate, 
        deleteData, 
        isLoading: isLoadingBookings 
    } = useReduxApiData({
        table: TABLE_NAME,
        pth: TABLE_PATH,
        queryType: 'gets',
        mainParam: { 
            start_date: queryStartDate ? queryStartDate.toISOString().split('T')[0] : undefined,
            end_date: queryEndDate ? queryEndDate.toISOString().split('T')[0] : undefined,
            room_id: queryRoomId || undefined,
            is_booked: queryIsBooked || undefined,
            is_lodged: queryIsLodged || undefined,
            is_vacated: queryIsVacated || undefined
        },
        narration: 'get bookings within date range'
    });

    const { 
        data: roomsData, 
        loadQuery: loadRooms, 
        isLoading: isLoadingRooms 
    } = useReduxApiData({
        table: "commons",
        uniqueKey: "common",
        queryType: 'gets',
        mainParam: { 
            is_active: 1,
            grp: 31
        },
        narration: 'get room categories'
    });

    const { 
        data: childRoomsData, 
        loadQuery: loadChildRooms, 
        isLoading: isLoadingChildRooms 
    } = useReduxApiData({
        table: "commons",
        uniqueKey: "room",
        queryType: 'gets',
        mainParam: { 
            is_active: 1,
            parent_id: queryParentId || undefined
        },
        narration: 'get child rooms'
    });

    // ==================== EFFECTS ====================
    useEffect(() => {
        try {
            loadRooms();
        } catch (error) {
            console.error('Error loading rooms:', error);
        }
    }, []);

    useEffect(() => {
        try {
            loadBookings();
        } catch (error) {
            console.error('Error loading bookings:', error);
        }
    }, []);

    // Load child rooms when parent changes
    useEffect(() => {
        if (queryParentId && parseInt(queryParentId) > 0) {
            try {
                loadChildRooms({parent_id: queryParentId});
            } catch (error) {
                console.error('Error loading child rooms:', error);
            }
        } else {
            setQueryRoomId('');
        }
    }, [queryParentId]);

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
    }, [loadUpdate]);

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

    // ==================== BOOKING STATUS HANDLERS ====================
    const handleBook = useCallback((row: any): void => {
        try {
            loadUpdate({ 
                id: row.id, 
                is_booked: 1, 
                cat: 'insert', 
                narration: 'Booking confirmed' 
            });
        } catch (error) {
            console.error('Error booking:', error);
            Swal.fire('Error', 'Failed to book room.', 'error');
        }
    }, []);

    const handleLodge = useCallback((row: any): void => {
        try {
            loadUpdate({ 
                id: row.id, 
                is_lodged: 1, 
                cat: 'insert', 
                narration: 'Guest lodged' 
            });
        } catch (error) {
            console.error('Error lodging:', error);
            Swal.fire('Error', 'Failed to mark as lodged.', 'error');
        }
    }, []);

    const handleVacate = useCallback((row: any): void => {
        try {
            loadUpdate({ 
                id: row.id, 
                is_vacated: 1, 
                cat: 'insert', 
                narration: 'Guest vacated' 
            });
        } catch (error) {
            console.error('Error vacating:', error);
            Swal.fire('Error', 'Failed to mark as vacated.', 'error');
        }
    }, []);

    const handleUnbook = useCallback((row: any): void => {
        Swal.fire({
            title: 'Cancel Booking?',
            text: `Are you sure you want to cancel this booking for ${row.client_name || 'client'}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, cancel it!'
        }).then((result) => {
            if (result.isConfirmed) {
                try {
                    loadUpdate({ 
                        id: row.id, 
                        is_booked: 0, 
                        is_lodged: 0, 
                        is_vacated: 0, 
                        cat: 'insert', 
                        narration: 'Booking cancelled' 
                    });
                    Swal.fire('Cancelled!', 'Booking has been cancelled.', 'success');
                } catch (error) {
                    Swal.fire('Error', 'Failed to cancel booking.', 'error');
                }
            }
        });
    }, []);

    const handleReload = useCallback((): void => {
        try {
            loadBookings();
            loadRooms();
            if (queryParentId && parseInt(queryParentId) > 0) {
                loadChildRooms({parent_id: queryParentId});
            }
        } catch (error) {
            console.error('Error reloading:', error);
        }
    }, [queryParentId]);

    const clearFilters = useCallback((): void => {
        try {
            setFilterSelectedRoomId('');
            setFilterSelectedParentId('');
            setFilterIsBooked(true);
            setFilterIsLodged(false);
            setFilterIsVacated(false);
            const start = new Date();
            start.setDate(start.getDate() - DEFAULT_DAYS);
            setFilterStartDate(start);
            setFilterEndDate(new Date());
            
            setQueryRoomId('');
            setQueryParentId('');
            setQueryIsBooked('1');
            setQueryIsLodged('');
            setQueryIsVacated('');
            setQueryStartDate(start);
            setQueryEndDate(new Date());
            
            loadBookings();
        } catch (error) {
            console.error('Error clearing filters:', error);
        }
    }, [loadBookings]);

    const handleTabChange = useCallback((tab: TabType): void => {
        setActiveTab(tab);
    }, []);

    const toggleFilters = useCallback((): void => {
        setShowFilters(prev => !prev);
    }, []);

    // ==================== LOAD FILTERS ====================
    const loadFilters = useCallback((): void => {
        try {
            setQueryStartDate(filterStartDate);
            setQueryEndDate(filterEndDate);
            setQueryRoomId(filterSelectedRoomId);
            setQueryParentId(filterSelectedParentId);
            setQueryIsBooked(filterIsBooked ? '1' : '');
            setQueryIsLodged(filterIsLodged ? '1' : '');
            setQueryIsVacated(filterIsVacated ? '1' : '');
            
            loadBookings();
        } catch (error) {
            console.error('Error loading filters:', error);
        }
    }, [filterStartDate, filterEndDate, filterSelectedRoomId, filterSelectedParentId, filterIsBooked, filterIsLodged, filterIsVacated, loadBookings]);

    // ==================== DATE RANGE HANDLERS ====================
    const handleStartDateChange = (date: Date | null) => {
        try {
            setFilterStartDate(date);
        } catch (error) {
            console.error('Error setting start date:', error);
        }
    };

    const handleEndDateChange = (date: Date | null) => {
        try {
            setFilterEndDate(date);
        } catch (error) {
            console.error('Error setting end date:', error);
        }
    };

    // FIXED: Get the actual ID from the select value
    const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        try {
            const value = e.target.value; // This is now the ID
            setFilterSelectedRoomId(value);
            setQueryRoomId(value);
        } catch (error) {
            console.error('Error selecting room:', error);
        }
    };

    // FIXED: Get the actual ID from the select value
    const handleParentRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        try {
            const value = e.target.value; // This is now the ID
            setFilterSelectedParentId(value);
            setQueryParentId(value);
            setFilterSelectedRoomId('');
            setQueryRoomId('');
        } catch (error) {
            console.error('Error selecting parent room:', error);
        }
    };

    const handleSetDateRange = (days: number) => {
        try {
            const start = new Date();
            start.setDate(start.getDate() - days);
            setFilterStartDate(start);
            setFilterEndDate(new Date());
        } catch (error) {
            console.error('Error setting date range:', error);
        }
    };

    // ==================== STATUS FILTER HANDLERS ====================
    const handleFilterIsBookedToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setFilterIsBooked(e.target.checked);
        } catch (error) {
            console.error('Error toggling booked filter:', error);
        }
    };

    const handleFilterIsLodgedToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setFilterIsLodged(e.target.checked);
        } catch (error) {
            console.error('Error toggling lodged filter:', error);
        }
    };

    const handleFilterIsVacatedToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setFilterIsVacated(e.target.checked);
        } catch (error) {
            console.error('Error toggling vacated filter:', error);
        }
    };

    // ==================== BUILD ROOM OPTIONS ====================
    const roomOptions = useMemo(() => {
        try {
            const rooms = Array.isArray(roomsData) ? roomsData : [];
            const options: {id: string, label: string}[] = [{id: '', label: 'All Rooms'}];
            
            rooms.forEach((room: any) => {
                if (room && typeof room === 'object') {
                    const id = room.id !== undefined && room.id !== null ? String(room.id) : '';
                    const code = room.code || '';
                    const name = room.name || '';
                    if (id) {
                        const label = code && name ? `${code} - ${name}` : name || id;
                        options.push({id, label});
                    }
                }
            });
            return options;
        } catch (error) {
            console.error('Error building room options:', error);
            return [{id: '', label: 'All Rooms'}];
        }
    }, [roomsData]);

    const parentRoomOptions = useMemo(() => {
        try {
            const rooms = Array.isArray(roomsData) ? roomsData : [];
            const options: {id: string, label: string}[] = [{id: '', label: 'All Categories'}];
            
            rooms.forEach((room: any) => {
                if (room && typeof room === 'object') {
                    const id = room.id !== undefined && room.id !== null ? String(room.id) : '';
                    const code = room.code || '';
                    const name = room.name || '';
                    if (id) {
                        const label = code && name ? `${code} - ${name}` : name || id;
                        options.push({id, label});
                    }
                }
            });
            return options;
        } catch (error) {
            console.error('Error building parent room options:', error);
            return [{id: '', label: 'All Categories'}];
        }
    }, [roomsData]);

    const childRoomOptions = useMemo(() => {
        try {
            const rooms = Array.isArray(childRoomsData) ? childRoomsData : [];
            const options: {id: string, label: string}[] = [{id: '', label: 'All Rooms'}];
            
            rooms.forEach((room: any) => {
                if (room && typeof room === 'object') {
                    const id = room.id !== undefined && room.id !== null ? String(room.id) : '';
                    const code = room.code || '';
                    const name = room.name || '';
                    if (id) {
                        const label = code && name ? `${code} - ${name}` : name || id;
                        options.push({id, label});
                    }
                }
            });
            return options;
        } catch (error) {
            console.error('Error building child room options:', error);
            return [{id: '', label: 'All Rooms'}];
        }
    }, [childRoomsData]);

    // ==================== COLUMNS ====================
    const columns = useMemo(() => {
        try {
            return columnBuilder(
                { table_action: FullStageAction, table_data: tableData },
                { 
                    onNext, 
                    onView, 
                    onActivate, 
                    onEdit, 
                    onDelete,
                    onBook: handleBook,
                    onLodge: handleLodge,
                    onVacate: handleVacate,
                    onUnbook: handleUnbook
                }
            );
        } catch (error) {
            console.error('Error building columns:', error);
            return [];
        }
    }, [tableData, onNext, onView, onActivate, onEdit, onDelete, handleBook, handleLodge, handleVacate, handleUnbook]);

    // ==================== FALLBACK COMPONENTS ====================
    const AnalysisFallback = () => (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-8 text-center border border-yellow-200 dark:border-yellow-800">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">Analysis Unavailable</h3>
            <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-2">The analysis module could not be loaded.</p>
            <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors text-sm"
            >
                Retry
            </button>
        </div>
    );

    const LoadingFallback = () => (
        <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="mt-4 text-gray-600 dark:text-gray-400">Loading Analysis...</div>
            </div>
        </div>
    );

    // Format date range for display
    const dateRangeDisplay = useMemo(() => {
        try {
            if (queryStartDate && queryEndDate) {
                return `${queryStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${queryEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
            }
            return '';
        } catch {
            return '';
        }
    }, [queryStartDate, queryEndDate]);

    // Get selected room name for display
    const getSelectedRoomName = useCallback(() => {
        try {
            if (!queryParentId || !roomsData) return '';
            const rooms = Array.isArray(roomsData) ? roomsData : [];
            const room = rooms.find((r: any) => String(r.id) === queryParentId);
            return room?.name || '';
        } catch {
            return '';
        }
    }, [queryParentId, roomsData]);

    // ==================== RENDER ====================
    const isLoading = isLoadingBookings || isLoadingRooms || isLoadingChildRooms;

    const safeBookingsData = useMemo(() => {
        return Array.isArray(bookingsData) ? bookingsData : [];
    }, [bookingsData]);

    // Get selected labels for filter UI
    const selectedParentId = useMemo(() => {
        return filterSelectedParentId || '';
    }, [filterSelectedParentId]);

    const selectedRoomId = useMemo(() => {
        return filterSelectedRoomId || '';
    }, [filterSelectedRoomId]);

    // Get active filter display for header
    const getActiveFiltersDisplay = () => {
        const parts = [];
        if (queryIsBooked === '1') parts.push('📋 Booked');
        if (queryIsLodged === '1') parts.push('🏠 Lodged');
        if (queryIsVacated === '1') parts.push('🚪 Vacated');
        return parts.length > 0 ? parts.join(', ') : 'All';
    };

    return (
        <>
            <PageBreadcrumb pageTitle={`${displayName} ${dateRangeDisplay ? `(${dateRangeDisplay})` : ''}`} />
            
            {/* Compact Filter Header - Toggleable */}
            <ErrorBoundary fallback={AnalysisFallback}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-4 overflow-hidden">
                    {/* Filter Header - Always visible, clickable to toggle */}
                    <div 
                        onClick={toggleFilters}
                        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">🔍 Filters</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 flex-wrap">
                                {queryStartDate && queryEndDate && (
                                    <span className="ml-2 inline-flex items-center gap-1">
                                        📅 {queryStartDate.toLocaleDateString()} - {queryEndDate.toLocaleDateString()}
                                    </span>
                                )}
                                {queryParentId && (
                                    <span className="ml-2 inline-flex items-center gap-1">
                                        🏢 {getSelectedRoomName() || 'Selected'}
                                    </span>
                                )}
                                <span className="ml-2 inline-flex items-center gap-1">
                                    {getActiveFiltersDisplay()}
                                </span>
                            </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                {showFilters ? 'Hide ▲' : 'Show ▼'}
                            </span>
                            <svg 
                                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* Filter Content - Collapsible */}
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showFilters ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="px-3 pb-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Date Range */}
                                <div className="flex items-center gap-1">
                                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Date:</label>
                                    <DatePicker
                                        selected={filterStartDate}
                                        onChange={handleStartDateChange}
                                        selectsStart
                                        startDate={filterStartDate || undefined}
                                        endDate={filterEndDate || undefined}
                                        placeholderText="Start Date"
                                        className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-[130px]"
                                        dateFormat="yyyy-MM-dd"
                                        popperClassName="z-50"
                                    />
                                    <span className="text-gray-500 dark:text-gray-400 text-xs">-</span>
                                    <DatePicker
                                        selected={filterEndDate}
                                        onChange={handleEndDateChange}
                                        selectsEnd
                                        startDate={filterStartDate || undefined}
                                        endDate={filterEndDate || undefined}
                                        minDate={filterStartDate || undefined}
                                        placeholderText="End Date"
                                        className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-[130px]"
                                        dateFormat="yyyy-MM-dd"
                                        popperClassName="z-50"
                                    />
                                    <div className="flex gap-0.5 ml-1">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleSetDateRange(7); }}
                                            className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            7d
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleSetDateRange(30); }}
                                            className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            30d
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleSetDateRange(90); }}
                                            className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            90d
                                        </button>
                                    </div>
                                </div>

                                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

                                {/* Room Filters - FIXED: Using ID as value */}
                                <div className="flex items-center gap-1">
                                    <select
                                        value={selectedParentId}
                                        onChange={handleParentRoomChange}
                                        className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px]"
                                    >
                                        {parentRoomOptions.map((opt) => (
                                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={selectedRoomId}
                                        onChange={handleRoomChange}
                                        className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px]"
                                    >
                                        {(filterSelectedParentId ? childRoomOptions : roomOptions).map((opt) => (
                                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

                                {/* Status Filters - Checkboxes */}
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={filterIsBooked}
                                            onChange={handleFilterIsBookedToggle}
                                            className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                                        />
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">📋 Booked</span>
                                    </label>

                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={filterIsLodged}
                                            onChange={handleFilterIsLodgedToggle}
                                            className="w-3.5 h-3.5 text-yellow-600 rounded border-gray-300 focus:ring-yellow-500 dark:border-gray-600 dark:bg-gray-700"
                                        />
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">🏠 Lodged</span>
                                    </label>

                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={filterIsVacated}
                                            onChange={handleFilterIsVacatedToggle}
                                            className="w-3.5 h-3.5 text-gray-600 rounded border-gray-300 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-700"
                                        />
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">🚪 Vacated</span>
                                    </label>
                                </div>

                                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); loadFilters(); }}
                                        className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        Load
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); clearFilters(); }}
                                        className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                    >
                                        Clear
                                    </button>
                                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onAdd(); }}
                                        className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleReload(); }}
                                        className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        title="Reload"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ErrorBoundary>

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
                    {!isLoading ? (
                        <>
                            {page === 0 ? (
                                <>
                                    {activeTab === 'table' && (
                                        <ErrorBoundary>
                                            <Tables
                                                onAdd={onAdd}
                                                reload={handleReload}
                                                home={() => nav('/')}
                                                rows={safeBookingsData}
                                                columns={columns}
                                                pageSize={PAGE_SIZE}
                                                cV={columnVisibility}
                                            />
                                        </ErrorBoundary>
                                    )}

                                    {activeTab === 'analysis' && (
                                        <ErrorBoundary>
                                            <Suspense fallback={<LoadingFallback />}>
                                                <BookingAnalysis 
                                                    data={safeBookingsData}
                                                    analysisData={safeBookingsData}
                                                />
                                            </Suspense>
                                        </ErrorBoundary>
                                    )}
                                </>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                            {isEdit ? `Edit ${displayName}` : `Create ${displayName}`}
                                        </h2>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Form implementation would go here. Please implement the form as needed.
                                        </p>
                                        <button
                                            onClick={() => setPage(0)}
                                            className="mt-4 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                        >
                                            Back
                                        </button>
                                    </div>
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

export default Reports;