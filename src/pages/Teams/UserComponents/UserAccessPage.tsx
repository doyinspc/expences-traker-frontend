// src/pages/Settings/AccessManagement.tsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import { columnBuilder } from '../../../actions/common.js';
import PageBreadcrumb from "../../../components/common/PageBreadCrumb.js";
import Tables from '../../../components/table/index.jsx';
import Loader from '../../../components/ui/Loader.js';
import { FullSettingActionNoDelete } from '../../../components/ui/TableActionSetting.js';
import useReduxApiData from "../../../hooks/useTanstackQuery.js";
import { 
    buildColumnVisibility, 
    getTableDisplayName
} from '../../../utils/functions/tableBuilder.js';
import Swal from 'sweetalert2';
import { allNavItems, flatNavItems } from '../../../config/navigationConfig.js';
import {
    RefreshCw,
    ChevronDown,
    ChevronRight,
    X,
    Users,
    MapPin,
    Shield,
    CheckSquare,
    Square,
    ListChecks,
    Eye,
    PenSquare,
    Lock,
    AlertCircle,
    Save,
    ArrowLeft,
    Check,
    Plus
} from 'lucide-react';

// ==================== TYPES ====================

interface AccessControl {
  id?: number;
  user_id: number;
  location_id: number;
  parent_path_number: number;
  child_path_number: number;
  access_level: 1 | 2 | 3;
  user_name?: string;
  location_name?: string;
  parent_name?: string;
  child_name?: string;
  created_at?: string;
  updated_at?: string;
}

interface AccessManagementProps {
  userId: number;
  locationId: number;
}

// ==================== CONSTANTS ====================
const TABLE_NAME = "accesscontrols";
const TABLE_PATH = "access";
const PAGE_SIZE = 500;

// ==================== TABLE DATA ====================
const tableData = [
    {label: 'ID', name:'id', type:'text', showTable: false, editable:false, element:null},
    {label: 'User ID', name:'user_id', type:'text', showTable: true, editable:true, element:null},
    {label: 'User', name:'user_name', type:'text', showTable: true, editable:false, element:null},
    {label: 'Location ID', name:'location_id', type:'text', showTable: true, editable:true, element:null},
    {label: 'Location', name:'location_name', type:'text', showTable: true, editable:false, element:null},
    {label: 'Parent Module', name:'parent_name', type:'text', showTable: true, editable:false, element:null},
    {label: 'Sub Module', name:'child_name', type:'text', showTable: true, editable:false, element:null},
    {label: 'Access Level', name:'access_level', type:'select', showTable: true, editable:true, element:null},
];

// ==================== ACCESS LEVEL OPTIONS ====================
const accessLevelOptions = [
    { value: 1, label: 'View Only', icon: <Eye className="w-3.5 h-3.5" /> },
    { value: 2, label: 'Manage', icon: <PenSquare className="w-3.5 h-3.5" /> },
    { value: 3, label: 'Full Access', icon: <Lock className="w-3.5 h-3.5" /> },
];

const getAccessLevelLabel = (level: number): string => {
    try {
        const option = accessLevelOptions.find(opt => opt.value === level);
        return option ? option.label : 'Unknown';
    } catch {
        return 'Unknown';
    }
};

const getAccessLevelColor = (level: number): string => {
    try {
        switch (level) {
            case 1: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 2: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 3: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
        }
    } catch {
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
};

const getAccessLevelIcon = (level: number): React.ReactNode => {
    switch (level) {
        case 1: return <Eye className="w-3.5 h-3.5" />;
        case 2: return <PenSquare className="w-3.5 h-3.5" />;
        case 3: return <Lock className="w-3.5 h-3.5" />;
        default: return <AlertCircle className="w-3.5 h-3.5" />;
    }
};

// ==================== DEFENSIVE HELPER ====================
const safeArray = (data: any): any[] => {
    try {
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
};

const safeValue = (value: any, fallback: any = ''): any => {
    try {
        return value !== undefined && value !== null ? value : fallback;
    } catch {
        return fallback;
    }
};

// ==================== COMPONENT ====================
const AccessManagement: React.FC<AccessManagementProps> = ({
    userId,
    locationId,
}) => {
    const nav = useNavigate();

    // ==================== STATE ====================
    const [selectedAccess, setSelectedAccess] = useState<any[]>([]);
    const [showSummary, setShowSummary] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        modules: true
    });

    // ==================== API HOOKS ====================
    const { 
        data: accessData, 
        loadQuery: loadAccess, 
        loadUpdate, 
        isLoading: isLoadingAccess 
    } = useReduxApiData({
        table: TABLE_NAME,
        pth: TABLE_PATH,
        queryType: 'gets',
        mainParam: { 
            user_id: userId,
            location_id: locationId
        },
        narration: 'get access controls'
    });

    const { 
        data: usersData, 
        loadQuery: loadUsers, 
        isLoading: isLoadingUsers 
    } = useReduxApiData({
        table: "users",
        uniqueKey: "users",
        queryType: 'gets',
        mainParam: { is_active: 1 },
        narration: 'get users'
    });

    const { 
        data: locationsData, 
        loadQuery: loadLocations, 
        isLoading: isLoadingLocations 
    } = useReduxApiData({
        table: "commons",
        uniqueKey: "locations",
        queryType: 'gets',
        mainParam: { is_active: 1 },
        narration: 'get locations'
    });

    // ==================== EFFECTS ====================
    useEffect(() => {
        try {
            loadAccess();
            loadUsers();
            loadLocations();
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }, []);

    // ==================== TOGGLE FUNCTIONS ====================
    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // ==================== ACCESS SELECTION ====================
    const toggleAccessSelection = (item: any) => {
        setSelectedAccess(prev => {
            const exists = prev.find(
                p => p.parent_path_number === item.parent_path_number && 
                     p.child_path_number === (item.child_path_number || 0)
            );
            if (exists) {
                return prev.filter(
                    p => !(p.parent_path_number === item.parent_path_number && 
                          p.child_path_number === (item.child_path_number || 0))
                );
            } else {
                return [...prev, {
                    parent_path_number: item.parent_path_number,
                    child_path_number: item.child_path_number || 0,
                    name: item.name,
                    access_level: item.access_level || 3,
                }];
            }
        });
    };

    // Toggle entire parent with all children
    const toggleParentAccess = (parent: any) => {
        const parentKey = `${parent.parent_path_number}-0`;
        const isParentSelected = selectedAccess.some(
            p => p.parent_path_number === parent.parent_path_number && p.child_path_number === 0
        );

        if (isParentSelected) {
            // Remove parent and all children
            setSelectedAccess(prev => prev.filter(
                p => p.parent_path_number !== parent.parent_path_number
            ));
        } else {
            // Add parent and all children
            const itemsToAdd = [
                {
                    parent_path_number: parent.parent_path_number,
                    child_path_number: 0,
                    name: parent.name,
                    access_level: 3,
                }
            ];

            // Add all sub-items
            if (parent.subItems) {
                parent.subItems.forEach((sub: any) => {
                    itemsToAdd.push({
                        parent_path_number: parent.parent_path_number,
                        child_path_number: sub.child_path_number,
                        name: sub.name,
                        access_level: 3,
                    });
                });
            }

            setSelectedAccess(prev => {
                // Remove any existing items from this parent
                const filtered = prev.filter(
                    p => p.parent_path_number !== parent.parent_path_number
                );
                return [...filtered, ...itemsToAdd];
            });
        }
    };

    // Update access level for a specific item
    const updateAccessLevel = (parentPathNumber: number, childPathNumber: number, level: number) => {
        setSelectedAccess(prev => prev.map(item => {
            if (item.parent_path_number === parentPathNumber && 
                item.child_path_number === (childPathNumber || 0)) {
                return { ...item, access_level: level };
            }
            return item;
        }));
    };

    // Update access level for all items in a parent
    const updateParentAccessLevel = (parentPathNumber: number, level: number) => {
        setSelectedAccess(prev => prev.map(item => {
            if (item.parent_path_number === parentPathNumber) {
                return { ...item, access_level: level };
            }
            return item;
        }));
    };

    // ==================== HANDLERS ====================
    const handleDelete = useCallback((row: any): void => {
        try {
            if (!row || !row.id) {
                Swal.fire('Error', 'Invalid record selected.', 'error');
                return;
            }

            Swal.fire({
                title: 'Are you sure?',
                text: "This will remove access for this user!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, remove access!'
            }).then((result) => {
                if (result.isConfirmed) {
                    loadUpdate({ id: row.id, cat: 'insert', act: 3, table: TABLE_NAME });
                    Swal.fire('Removed!', 'Access has been removed.', 'success');
                    loadAccess();
                }
            });
        } catch (error) {
            console.error('Error in onDelete:', error);
            Swal.fire('Error', 'Failed to delete access control.', 'error');
        }
    }, []);

    const handleSubmit = async () => {
        if (selectedAccess.length === 0) {
            Swal.fire('Warning', 'Please select at least one module.', 'warning');
            return;
        }

        setIsSubmitting(true);
        let successCount = 0;
        let errorCount = 0;
        let updateCount = 0;
        let insertCount = 0;

        try {
            for (const item of selectedAccess) {
                const payload: any = {
                    user_id: userId,
                    location_id: locationId,
                    parent_path_number: item.parent_path_number,
                    child_path_number: item.child_path_number || 0,
                    access_level: item.access_level || 3,
                    cat: 'insert',
                    table: TABLE_NAME,
                    narration: item.id ? 'Update access control' : 'Add access control'
                };

                if (item.id) {
                    payload.id = item.id;
                    updateCount++;
                } else {
                    insertCount++;
                }

                try {
                    await loadUpdate(payload);
                    successCount++;
                } catch (err) {
                    console.error('Error saving item:', err);
                    errorCount++;
                }
            }

            setSelectedAccess([]);
            setShowSummary(false);
            loadAccess();
            
            Swal.fire(
                'Success!', 
                `${successCount} access entries saved. (${insertCount} new, ${updateCount} updated) ${errorCount > 0 ? `${errorCount} failed.` : ''}`,
                errorCount > 0 ? 'warning' : 'success'
            );
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            Swal.fire('Error', 'Failed to save access controls.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReload = useCallback((): void => {
        try {
            loadAccess();
            loadUsers();
            loadLocations();
        } catch (error) {
            console.error('Error reloading data:', error);
        }
    }, [loadAccess, loadUsers, loadLocations]);

    const clearSelection = () => {
        setSelectedAccess([]);
    };

    const removeFromSelection = (index: number) => {
        const item = selectedAccess[index];
        if (item.id) {
            handleDelete(item);
        }
        setSelectedAccess(prev => prev.filter((_, i) => i !== index));
    };

    // ==================== DATA PROCESSING ====================
    const processedRows = useMemo(() => {
        try {
            const data = safeArray(accessData);
            const users = safeArray(usersData);
            const locations = safeArray(locationsData);
            const navItems = safeArray(flatNavItems);
            
            return data.map((item: any) => {
                try {
                    const navItem = navItems.find(
                        n => n?.parent_path_number === item?.parent_path_number && 
                             n?.child_path_number === (item?.child_path_number || 0)
                    );
                    
                    const user = users.find((u: any) => u?.id === item?.user_id);
                    const location = locations.find((l: any) => l?.id === item?.location_id);
                    
                    return {
                        ...item,
                        user_name: safeValue(user?.name, `User ${safeValue(item?.user_id, 'Unknown')}`),
                        location_name: safeValue(location?.name, `Location ${safeValue(item?.location_id, 'Unknown')}`),
                        parent_name: safeValue(navItem?.name, `Module ${safeValue(item?.parent_path_number, '?')}`),
                        child_name: item?.child_path_number === 0 ? 'Main' : safeValue(navItem?.name, `Sub ${safeValue(item?.child_path_number, '?')}`),
                        access_level_label: getAccessLevelLabel(item?.access_level),
                        access_level_color: getAccessLevelColor(item?.access_level),
                    };
                } catch (err) {
                    console.error('Error processing row:', err);
                    return item;
                }
            });
        } catch (error) {
            console.error('Error processing rows:', error);
            return [];
        }
    }, [accessData, usersData, locationsData]);

    // ==================== BUILD COLUMNS ====================
    const columns = useMemo(() => {
        try {
            const accessLevelColumn = {
                label: 'Access Level',
                name: 'access_level',
                type: 'text',
                showTable: true,
                editable: true,
                element: null,
                render: (row: any) => {
                    try {
                        return (
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${safeValue(row?.access_level_color, 'bg-gray-100 text-gray-700')}`}>
                                {getAccessLevelIcon(row?.access_level)}
                                {safeValue(row?.access_level_label, 'Unknown')}
                            </span>
                        );
                    } catch {
                        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Unknown</span>;
                    }
                }
            };

            const baseColumns = columnBuilder(
                { table_action: FullSettingActionNoDelete, table_data: tableData },
                { onDelete: handleDelete }
            );

            return baseColumns.map((col: any) => {
                if (col?.accessor === 'access_level') {
                    return accessLevelColumn;
                }
                return col;
            });
        } catch (error) {
            console.error('Error building columns:', error);
            return [];
        }
    }, [tableData, handleDelete]);

    // ==================== RENDER ====================
    const isLoading = isLoadingAccess || isLoadingUsers || isLoadingLocations;

    const displayName = useMemo(() => {
        try {
            return getTableDisplayName(TABLE_NAME) || 'Access Management';
        } catch {
            return 'Access Management';
        }
    }, []);

    const userDisplayName = useMemo(() => {
        try {
            const user = safeArray(usersData).find((u: any) => u?.id === userId);
            return user?.name || `User ${userId}`;
        } catch {
            return `User ${userId}`;
        }
    }, [usersData, userId]);

    const locationDisplayName = useMemo(() => {
        try {
            const location = safeArray(locationsData).find((l: any) => l?.id === locationId);
            return location?.name || `Location ${locationId}`;
        } catch {
            return `Location ${locationId}`;
        }
    }, [locationsData, locationId]);

    const isSelected = (item: any) => {
        return selectedAccess.some(
            p => p.parent_path_number === item.parent_path_number && 
                 p.child_path_number === (item.child_path_number || 0)
        );
    };

    const isExistingAccess = (item: any) => {
        return safeArray(accessData).some(
            (p: any) => p.parent_path_number === item.parent_path_number && 
                       p.child_path_number === (item.child_path_number || 0)
        );
    };

    // Get selection status for a parent
    const getParentSelectionStatus = (parent: any) => {
        const parentSelected = selectedAccess.some(
            p => p.parent_path_number === parent.parent_path_number && p.child_path_number === 0
        );
        
        const children = parent.subItems || [];
        const selectedChildren = children.filter((sub: any) => 
            selectedAccess.some(
                p => p.parent_path_number === parent.parent_path_number && 
                     p.child_path_number === sub.child_path_number
            )
        );

        if (parentSelected && selectedChildren.length === children.length) {
            return 'all'; // All selected
        } else if (parentSelected || selectedChildren.length > 0) {
            return 'partial'; // Partially selected
        } else {
            return 'none'; // None selected
        }
    };

    // Get the icon for parent selection status
    const getParentSelectionIcon = (status: string) => {
        if (status === 'all') {
            return <CheckSquare className="w-4 h-4 text-blue-600" />;
        } else if (status === 'partial') {
            return <Square className="w-4 h-4 text-blue-400" />;
        } else {
            return <Square className="w-4 h-4 text-gray-400" />;
        }
    };

    return (
        <>
            <PageBreadcrumb pageTitle={displayName} />
            
            {/* Info Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">User:</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{userDisplayName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">Location:</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{locationDisplayName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">Total Access:</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{processedRows.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">Selected:</span>
                            <span className="font-medium text-blue-600 dark:text-blue-400">{selectedAccess.length}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleReload}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Reload"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        {selectedAccess.length > 0 && (
                            <button
                                onClick={() => setShowSummary(true)}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
                            >
                                <ListChecks className="w-4 h-4" />
                                Review & Submit ({selectedAccess.length})
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Accordion - Module Selection with Checkboxes */}
            <div className="mb-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <button
                        onClick={() => toggleSection('modules')}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-blue-500" />
                            <span className="font-medium text-gray-800 dark:text-gray-200">Select Modules</span>
                            <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                                {selectedAccess.length} selected
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); clearSelection(); }}
                                className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            >
                                Clear All
                            </button>
                            {expandedSections.modules ? (
                                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            )}
                        </div>
                    </button>

                    {expandedSections.modules && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 max-h-[500px] overflow-y-auto">
                            <div className="space-y-2">
                                {allNavItems.map((parent) => {
                                    const selectionStatus = getParentSelectionStatus(parent);
                                    const isExisting = isExistingAccess({ 
                                        parent_path_number: parent.parent_path_number, 
                                        child_path_number: 0 
                                    });

                                    return (
                                        <div key={parent.id} className={`border rounded-lg overflow-hidden ${
                                            isExisting ? 'border-green-300 dark:border-green-700' : 'border-gray-200 dark:border-gray-700'
                                        }`}>
                                            {/* Parent Row */}
                                            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                <button
                                                    onClick={() => toggleParentAccess({
                                                        parent_path_number: parent.parent_path_number,
                                                        name: parent.name,
                                                        subItems: parent.subItems
                                                    })}
                                                    className="flex items-center justify-center w-5 h-5"
                                                >
                                                    {getParentSelectionIcon(selectionStatus)}
                                                </button>
                                                <span className={`ml-3 font-medium ${
                                                    isExisting ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'
                                                }`}>
                                                    {parent.name}
                                                    {isExisting && (
                                                        <span className="ml-2 text-xs text-green-500">(exists)</span>
                                                    )}
                                                </span>
                                                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                                                    {parent.subItems?.length || 0} sub-modules
                                                </span>
                                                {selectionStatus === 'partial' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateParentAccessLevel(parent.parent_path_number, 3);
                                                        }}
                                                        className="ml-2 text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                                                    >
                                                        Set All Full
                                                    </button>
                                                )}
                                            </div>
                                            
                                            {/* Children */}
                                            {parent.subItems && parent.subItems.length > 0 && (
                                                <div className="p-2 space-y-1 border-t border-gray-200 dark:border-gray-700">
                                                    {parent.subItems.map((sub) => {
                                                        const isChildSelected = isSelected({
                                                            parent_path_number: parent.parent_path_number,
                                                            child_path_number: sub.child_path_number
                                                        });
                                                        const isChildExisting = isExistingAccess({
                                                            parent_path_number: parent.parent_path_number,
                                                            child_path_number: sub.child_path_number
                                                        });
                                                        const selectedItem = selectedAccess.find(
                                                            p => p.parent_path_number === parent.parent_path_number && 
                                                                 p.child_path_number === sub.child_path_number
                                                        );
                                                        const accessLevel = selectedItem?.access_level || 3;

                                                        return (
                                                            <div 
                                                                key={sub.id}
                                                                className={`flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded transition-colors ml-6 ${
                                                                    isChildExisting ? 'bg-green-50/50 dark:bg-green-900/10' : ''
                                                                }`}
                                                            >
                                                                <button
                                                                    onClick={() => toggleAccessSelection({
                                                                        parent_path_number: parent.parent_path_number,
                                                                        child_path_number: sub.child_path_number,
                                                                        name: sub.name,
                                                                        access_level: accessLevel
                                                                    })}
                                                                    className="flex items-center justify-center w-5 h-5"
                                                                >
                                                                    {isChildSelected ? (
                                                                        <CheckSquare className="w-4 h-4 text-blue-600" />
                                                                    ) : isChildExisting ? (
                                                                        <Check className="w-4 h-4 text-green-500" />
                                                                    ) : (
                                                                        <Square className="w-4 h-4 text-gray-400" />
                                                                    )}
                                                                </button>
                                                                <span className={`ml-3 text-sm ${
                                                                    isChildExisting ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'
                                                                }`}>
                                                                    {sub.name}
                                                                    {isChildExisting && (
                                                                        <span className="ml-1 text-xs text-green-500">(exists)</span>
                                                                    )}
                                                                </span>
                                                                
                                                                {/* Access Level Checkboxes */}
                                                                <div className="ml-auto flex items-center gap-1">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            updateAccessLevel(parent.parent_path_number, sub.child_path_number, 1);
                                                                        }}
                                                                        className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                                                                            accessLevel === 1 
                                                                                ? 'bg-blue-500 text-white' 
                                                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                                        }`}
                                                                        title="View Only"
                                                                    >
                                                                        <Eye className="w-3 h-3" />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            updateAccessLevel(parent.parent_path_number, sub.child_path_number, 2);
                                                                        }}
                                                                        className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                                                                            accessLevel === 2 
                                                                                ? 'bg-yellow-500 text-white' 
                                                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                                        }`}
                                                                        title="Manage"
                                                                    >
                                                                        <PenSquare className="w-3 h-3" />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            updateAccessLevel(parent.parent_path_number, sub.child_path_number, 3);
                                                                        }}
                                                                        className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                                                                            accessLevel === 3 
                                                                                ? 'bg-green-500 text-white' 
                                                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                                        }`}
                                                                        title="Full Access"
                                                                    >
                                                                        <Lock className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Screen */}
            {showSummary && (
                <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Review Access</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedAccess.length} modules selected for {userDisplayName}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowSummary(false)}
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-2">
                                {selectedAccess.map((item, index) => (
                                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                                        item.id ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'
                                    }`}>
                                        <div>
                                            <div className="font-medium text-gray-800 dark:text-gray-200">
                                                {item.name || `Module ${item.parent_path_number}`}
                                                {item.id && (
                                                    <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">(update)</span>
                                                )}
                                                {!item.id && (
                                                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">(new)</span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {item.child_path_number === 0 ? 'Main Module' : 'Sub Module'}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <select
                                                value={item.access_level || 3}
                                                onChange={(e) => {
                                                    const newAccess = [...selectedAccess];
                                                    newAccess[index].access_level = Number(e.target.value);
                                                    setSelectedAccess(newAccess);
                                                }}
                                                className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                                            >
                                                {accessLevelOptions.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.icon} {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => removeFromSelection(index)}
                                                className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <button
                                onClick={() => setShowSummary(false)}
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || selectedAccess.length === 0}
                                className={`flex items-center gap-2 px-6 py-2 text-white rounded-lg transition-colors font-medium ${
                                    isSubmitting || selectedAccess.length === 0
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-green-500 hover:bg-green-600'
                                }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Confirm & Save ({selectedAccess.length})
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Access Table */}
            <div className="space-y-6">
                <div className="p-1">
                    {!isLoading ? (
                        <Tables
                            onAdd={() => toggleSection('modules')}
                            reload={handleReload}
                            home={() => nav('/')}
                            rows={processedRows}
                            columns={columns}
                            pageSize={PAGE_SIZE}
                            cV={buildColumnVisibility(TABLE_NAME)}
                        />
                    ) : (
                        <Loader
                            overlay
                            backdropColor="dark"
                            color="text-white"
                            variant="spinner"
                            text="Loading access controls..."
                            textClassName="text-white/90"
                        />
                    )}
                </div>
            </div>
        </>
    );
};

// ==================== EXPORT ====================
export default AccessManagement;