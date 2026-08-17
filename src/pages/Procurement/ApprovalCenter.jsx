// src/pages/Approval/ApprovalCenter.jsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    CheckCircle, XCircle, Clock, AlertTriangle, 
    ArrowUpCircle, Loader2, Search, 
    ChevronRight, Calendar, User, DollarSign, 
    FileText, ShoppingCart, Wallet, PieChart, 
    Users, ArrowRightLeft, Bell, Filter,
    RefreshCw, Building2, Eye,
    History, UserCheck, ChevronDown
} from 'lucide-react';
import useReduxApiData from "../../hooks/useTanstackQuery";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

// ==================== DOCUMENT TYPE CONFIG ====================
const DOCUMENT_TYPE_CONFIG = {
    1: { id: 1, code: 'REQUISITION', name: 'Requisitions', icon: FileText, color: 'blue' },
    2: { id: 2, code: 'PURCHASE_ORDER', name: 'Purchase Orders', icon: ShoppingCart, color: 'green' },
    3: { id: 3, code: 'CASH_ADVANCE', name: 'Cash Advances', icon: Wallet, color: 'purple' },
    4: { id: 4, code: 'BUDGET', name: 'Budgets', icon: PieChart, color: 'orange' },
    5: { id: 5, code: 'USER', name: 'Users', icon: Users, color: 'teal' },
    6: { id: 6, code: 'CASH_TRANSFER', name: 'Cash Transfers', icon: ArrowRightLeft, color: 'red' },
};

// ==================== HELPERS ====================
const safeArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'object' && data !== null) {
        return data.items || data.data || [];
    }
    return [];
};

const getStatusNameFromData = (statusesData, id) => {
    if (!statusesData || !Array.isArray(statusesData)) return null;
    const status = statusesData.find((s) => parseInt(s.id) === parseInt(id));
    return status?.name || null;
};

const getStatusColorFromData = (statusesData, id) => {
    if (!statusesData || !Array.isArray(statusesData)) return null;
    const status = statusesData.find((s) => parseInt(s.id) === parseInt(id));
    return status?.text_1 || null;
};

// ==================== COMPONENT ====================
const ApprovalCenter = () => {
    const navigate = useNavigate();
    const { user, location_id, role_id } = useSelector((state) => state.authReducer || {});
    const userId = user?.id;

    // ==================== STATE ====================
    const [selectedStatusId, setSelectedStatusId] = useState(null);
    const [selectedPriorityId, setSelectedPriorityId] = useState(null);
    const [selectedDocumentTypeId, setSelectedDocumentTypeId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedStat, setSelectedStat] = useState(null);

    // ==================== FETCH DATA ====================
    const { data: statusesData, isLoading: statusesLoading } = useReduxApiData({
        table: "commons",
        uniqueKey: 'statuses',
        queryType: 'gets',
        mainParam: { grp: 11, is_active: 1 },
        autoLoad: true,
    });

    const { data: prioritiesData, isLoading: prioritiesLoading } = useReduxApiData({
        table: "commons",
        uniqueKey: 'priorities',
        queryType: 'gets',
        mainParam: { grp: 14, is_active: 1 },
        autoLoad: true,
    });

    const { data: documentTypesData } = useReduxApiData({
        table: "commons",
        uniqueKey: 'documentTypes',
        queryType: 'gets',
        mainParam: { grp: 10, is_active: 1, sort_order: 'ASC' },
        autoLoad: true,
    });

    const buildMainParam = useCallback(() => {
        const param = { user_id: userId || 0, location_id, role_id, limit: 50 };
        if (selectedStatusId) param.status_id = selectedStatusId;
        if (selectedPriorityId) param.priority_id = selectedPriorityId;
        if (selectedDocumentTypeId) param.document_type_id = selectedDocumentTypeId;
        if (searchTerm) param.search = searchTerm;
        return param;
    }, [userId, location_id, role_id, selectedStatusId, selectedPriorityId, selectedDocumentTypeId, searchTerm]);

    const { data: approvalItems, loadQuery: loadApprovalItems, isLoading } = useReduxApiData({
        table: 'approvalcenter',
        uniqueKey: 'approvalItems',
        queryType: 'getApprovalItems',
        mainParam: buildMainParam(),
        autoLoad: false,
    });

    const { data: approvalStats, loadQuery: loadStats } = useReduxApiData({
        table: 'approvalcenter',
        uniqueKey: 'approvalStats',
        queryType: 'getApprovalStats',
        mainParam: { user_id: userId || 0, location_id, role_id },
        autoLoad: false,
    });

    // ==================== LOAD DATA ====================
    useEffect(() => {
        if (userId) { loadApprovalItems(); loadStats(); }
    }, [userId, location_id, role_id]);

    useEffect(() => {
        if (userId) loadApprovalItems();
    }, [selectedStatusId, selectedPriorityId, selectedDocumentTypeId, searchTerm]);

    const isPageLoading = statusesLoading || prioritiesLoading || isLoading;

    // ==================== PROCESS APPROVAL ITEMS ====================
    const processedItems = useMemo(() => {
        const rawItems = safeArray(approvalItems);
        
        return rawItems.map(item => {
            const steps = item.steps || [];
            
            // Current active step: assigned_to_user_id === 1
            const currentActiveStep = steps.find(step => step.assigned_to_user_id === 1);
            
            const docType = documentTypesData?.find((d) => d.id === item.document_type_id);
            const docConfig = docType ? DOCUMENT_TYPE_CONFIG[docType.item_id1] : null;
            
            const isUserRoleMatch = currentActiveStep && currentActiveStep.role_id === role_id;
            
            const canApprove = currentActiveStep && 
                              isUserRoleMatch && 
                              currentActiveStep.status_id === item.status_id &&
                              item.is_active === 1 && 
                              item.is_completed === 0;

            const requesterName = item.document_data?.requester_name || 
                                 item.document_data?.created_by_name || 
                                 item.requester_name || 
                                 'N/A';

            const currencyCode = item.document_data?.currency_code || 
                                item.document_data?.currency_id || 
                                item.currency_code || 
                                'NGN';

            const completedSteps = steps.filter(s => s.is_active === 1 && s.action_id === 1);
            const rejectedSteps = steps.filter(s => s.action_id === 2);

            const statusName = item.status_name || 
                              currentActiveStep?.status_name || 
                              getStatusNameFromData(statusesData, currentActiveStep?.status_id) || 
                              'Unknown';

            const priorityName = item.priority_name || 
                                prioritiesData?.find(p => parseInt(p.id) === parseInt(item.priority_id))?.name || 
                                'Normal';

            return {
                ...item,
                active_step: currentActiveStep,
                steps: steps,
                can_approve: canApprove,
                is_user_role_match: isUserRoleMatch,
                step_status_id: currentActiveStep?.status_id,
                step_status_name: statusName,
                step_status_color: currentActiveStep?.status_color || '#6B7280',
                priority_name: priorityName,
                priority_color: item.priority_color || '#gray',
                doc_title: item.document_data?.title || 
                          item.document_data?.requisition_title || 
                          item.document_data?.purchaseorder_title || 
                          item.document_data?.purpose || 
                          'Untitled',
                doc_amount: item.document_data?.total_amount || 
                           item.document_data?.grand_total || 
                           item.document_data?.amount || 0,
                doc_currency: currencyCode,
                doc_department: item.document_data?.department_name,
                doc_vendor: item.document_data?.vendor_name,
                doc_requester: requesterName,
                doc_budget: item.document_data?.budget_name,
                doc_number: item.document_data?.requisition_number || 
                           item.document_data?.po_number || 
                           item.document_number,
                doc_type_config: docConfig,
                doc_type_name: item.document_name || 'Document',
                current_step_name: currentActiveStep?.step_name || 'Unknown Step',
                current_step_serial: currentActiveStep?.step_serial_number || 0,
                total_steps: steps.length,
                completed_steps: completedSteps.length,
                rejected_steps: rejectedSteps.length,
                actual_status_id: item.status_id,
                actual_status_name: item.status_name || 'Unknown',
                actual_status_color: item.status_color || '#6B7280'
            };
        });
    }, [approvalItems, role_id, statusesData, prioritiesData, documentTypesData]);

    // ==================== HANDLERS ====================
    const handleItemClick = (item) => {
        navigate(`/procurement/approvals/${item.id}`);
    };

    const handleRefresh = () => { if (userId) { loadApprovalItems(); loadStats(); } };
    
    const clearFilters = () => {
        setSelectedStatusId(null);
        setSelectedPriorityId(null);
        setSelectedDocumentTypeId(null);
        setSearchTerm('');
        setSelectedStat(null);
    };

    const handleStatClick = (statKey) => {
        if (selectedStat === statKey) {
            setSelectedStat(null);
            setSelectedStatusId(null);
        } else {
            setSelectedStat(statKey);
            const statusMap = {};
            if (statusesData && Array.isArray(statusesData)) {
                statusesData.forEach(status => {
                    statusMap[status.code.toLowerCase()] = status.id;
                });
            }
            setSelectedStatusId(statusMap[statKey] || null);
        }
    };

    // ==================== GET DOCUMENT DETAILS ====================
    const getDocumentDetails = (item) => {
        if (!item) return { config: null, docType: null, title: 'Untitled', number: '#N/A', amount: 0, currency: 'NGN', Icon: FileText, color: 'gray' };
        
        return {
            config: item.doc_type_config,
            docType: item.doc_type_config,
            title: item.doc_title || 'Untitled',
            number: item.doc_number || item.document_number || `#${item.document_id}`,
            amount: item.doc_amount || 0,
            currency: item.doc_currency || 'NGN',
            Icon: item.doc_type_config?.icon || FileText,
            color: item.doc_type_config?.color || 'gray',
            department: item.doc_department,
            vendor: item.doc_vendor,
            budget: item.doc_budget,
            requester: item.doc_requester,
            document_name: item.doc_type_name || 'Document'
        };
    };

    // ==================== RENDER STATS ====================
    const renderStats = () => {
        const stats = approvalStats || {};
        
        const statCards = [];
        
        const statConfigs = [
            { key: 'total_pending', label: 'Pending', icon: Clock, color: '#F59E0B', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
            { key: 'total_active', label: 'Active', icon: CheckCircle, color: '#3B82F6', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
            { key: 'total_waiting', label: 'Waiting', icon: Clock, color: '#9CA3AF', bgColor: 'bg-gray-50 dark:bg-gray-700/30' },
            { key: 'total_overdue', label: 'Overdue', icon: AlertTriangle, color: '#EF4444', bgColor: 'bg-red-50 dark:bg-red-900/20' },
            { key: 'total_rejected_steps', label: 'Rejected Steps', icon: XCircle, color: '#EF4444', bgColor: 'bg-red-50 dark:bg-red-900/20' },
            { key: 'total_completed_steps', label: 'Completed Steps', icon: CheckCircle, color: '#22C55E', bgColor: 'bg-green-50 dark:bg-green-900/20' },
            { key: 'total_current_active', label: 'Current Active', icon: ArrowUpCircle, color: '#8B5CF6', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
            { key: 'total_draft', label: 'Draft', icon: FileText, color: '#6B7280', bgColor: 'bg-gray-50 dark:bg-gray-700/30' },
            { key: 'total_in_progress', label: 'In Progress', icon: Loader2, color: '#3B82F6', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
            { key: 'total_rejected_workflows', label: 'Rejected Workflows', icon: XCircle, color: '#EF4444', bgColor: 'bg-red-50 dark:bg-red-900/20' },
            { key: 'total_completed_workflows', label: 'Completed Workflows', icon: CheckCircle, color: '#22C55E', bgColor: 'bg-green-50 dark:bg-green-900/20' },
        ];
        
        statConfigs.forEach(config => {
            if (stats[config.key] !== undefined && stats[config.key] > 0) {
                statCards.push({
                    key: config.key,
                    label: config.label,
                    value: stats[config.key],
                    icon: config.icon,
                    color: config.color,
                    bgColor: config.bgColor
                });
            }
        });

        if (statCards.length === 0) {
            return (
                <div className="grid grid-cols-1 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 text-center">
                        <p className="text-gray-500 dark:text-gray-400">No approval stats available</p>
                    </div>
                </div>
            );
        }

        const getGridCols = (count) => {
            if (count <= 2) return 'grid-cols-2';
            if (count <= 3) return 'grid-cols-3';
            if (count <= 4) return 'grid-cols-4';
            if (count <= 6) return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6';
            return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6';
        };

        return (
            <div className={`grid gap-3 ${getGridCols(statCards.length)} mb-6`}>
                {statCards.map((card) => (
                    <div 
                        key={card.key} 
                        onClick={() => handleStatClick(card.key.replace('total_', ''))}
                        className={`${card.bgColor} rounded-xl p-3 border-2 transition-all cursor-pointer ${
                            selectedStat === card.key.replace('total_', '') 
                                ? 'border-blue-500 shadow-md' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                        } hover:shadow-md`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">
                                    {card.label}
                                </p>
                                <p className="text-xl font-bold mt-0.5" style={{ color: card.color }}>
                                    {card.value}
                                </p>
                            </div>
                            <div className={`${card.bgColor} p-1.5 rounded-lg flex-shrink-0`}>
                                <card.icon className="w-4 h-4" style={{ color: card.color }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // ==================== RENDER STEP BADGE ====================
    const renderStepBadge = (step, index, isCurrentActive) => {
        const isCompleted = step.is_active === 1 && step.action_id === 1;
        const isRejected = step.action_id === 2;
        const isActive = step.assigned_to_user_id === 1;
        
        let bgColor = 'bg-gray-200 dark:bg-gray-600';
        let textColor = 'text-gray-600 dark:text-gray-400';
        let borderColor = 'border-gray-300 dark:border-gray-500';
        let pulseClass = '';
        let icon = null;
        
        if (isCompleted) {
            bgColor = 'bg-green-500';
            textColor = 'text-white';
            borderColor = 'border-green-600';
            icon = '✓';
        } else if (isRejected) {
            bgColor = 'bg-red-500';
            textColor = 'text-white';
            borderColor = 'border-red-600';
            icon = '✗';
        } else if (isActive) {
            bgColor = 'bg-blue-500';
            textColor = 'text-white';
            borderColor = 'border-blue-600';
            pulseClass = 'animate-pulse';
            icon = index + 1;
        } else {
            icon = index + 1;
        }
        
        return (
            <div 
                key={step.id || index}
                className={`flex items-center gap-1.5 ${pulseClass}`}
            >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${bgColor} ${textColor} border ${borderColor}`}>
                    {icon}
                </div>
                <span className={`text-xs ${isActive ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {step.step_name || `Step ${index + 1}`}
                </span>
                {isActive && (
                    <span className="text-[8px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-1 py-0.5 rounded-full animate-pulse">
                        Your Turn
                    </span>
                )}
                {isCompleted && step.performed_by_name && (
                    <span className="text-[8px] text-green-600 dark:text-green-400">
                        ✓ {step.performed_by_name}
                    </span>
                )}
                {isRejected && step.performed_by_name && (
                    <span className="text-[8px] text-red-600 dark:text-red-400">
                        ✗ {step.performed_by_name}
                    </span>
                )}
            </div>
        );
    };

    // ==================== RENDER ITEM CARD ====================
    const renderItemCard = (item) => {
        if (!item) return null;
        const { 
            config, 
            title, 
            number, 
            amount, 
            currency, 
            Icon, 
            color, 
            department, 
            requester, 
            document_name 
        } = getDocumentDetails(item);
        
        const priorityName = item.priority_name || 'Normal';
        const priorityColor = item.priority_color || '#gray';
        const statusName = item.step_status_name || item.actual_status_name || 'Unknown';
        const statusColor = item.step_status_color || item.actual_status_color || '#6B7280';
        
        const isUserStep = item.is_user_role_match;
        const isActive = item.is_active === 1;
        const isCompleted = item.is_completed === 1;
        
        const actualStatusName = item.actual_status_name || 'Unknown';
        const actualStatusColor = item.actual_status_color || '#6B7280';

        // Find current active step index
        const currentActiveIndex = item.steps?.findIndex(step => step.assigned_to_user_id === 1) ?? -1;

        return (
            <div
                key={item.instance_id || item.id}
                onClick={() => handleItemClick(item)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md group"
            >
                <div className="p-4">
                    {/* Header: Document Type & Status */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
                                <Icon className={`w-4 h-4 text-${color}-600 dark:text-${color}-400`} />
                            </div>
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                {document_name}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                {number}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span 
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: priorityColor }}
                            >
                                {priorityName}
                            </span>
                            <span 
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: statusColor }}
                            >
                                {statusName}
                            </span>
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate mb-2">
                        {title}
                    </h3>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-2">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <User className="w-3.5 h-3.5" />
                            <span className="truncate text-xs">{requester || 'N/A'}</span>
                        </div>
                        {amount > 0 && (
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <DollarSign className="w-3.5 h-3.5" />
                                <span className="text-xs">{currency} {amount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Building2 className="w-3.5 h-3.5" />
                            <span className="truncate text-xs">{department || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-xs">{item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>

                    {/* Step List - Always Visible (Replaces Progress Bar) */}
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-gray-400 mr-1">Steps:</span>
                            {item.steps && item.steps.length > 0 ? (
                                item.steps.map((step, index) => {
                                    const isCurrentActive = step.assigned_to_user_id === 1;
                                    return renderStepBadge(step, index, isCurrentActive);
                                })
                            ) : (
                                <span className="text-xs text-gray-400">No steps available</span>
                            )}
                        </div>
                        {/* Progress indicator */}
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs text-gray-400">
                                {item.completed_steps}/{item.total_steps} steps completed
                            </span>
                            <span className="text-xs text-gray-400">
                                • {item.total_steps > 0 ? Math.round((item.completed_steps / item.total_steps) * 100) : 0}%
                            </span>
                            {isUserStep && isActive && !isCompleted && (
                                <span className="text-xs text-green-600 dark:text-green-400 font-medium ml-auto animate-pulse">
                                    🔓 Your Action Required
                                </span>
                            )}
                            {isCompleted && (
                                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium ml-auto">
                                    ✅ Workflow Complete
                                </span>
                            )}
                            {item.rejected_steps > 0 && (
                                <span className="text-xs text-red-600 dark:text-red-400 font-medium ml-auto">
                                    ❌ Has Rejected Steps
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Current Step Status */}
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                        <span className="truncate">
                            Current: {item.current_step_name || 'Unknown'} 
                            {item.active_step && (
                                <span className="ml-1">
                                    ({item.active_step.is_active === 1 ? '✅ Completed' : 
                                      item.active_step.action_id === 2 ? '❌ Rejected' :
                                      isUserStep ? '⏳ Your Action' : '⏸️ Waiting'})
                                </span>
                            )}
                        </span>
                        <span 
                            className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] text-white"
                            style={{ backgroundColor: actualStatusColor }}
                        >
                            {actualStatusName}
                        </span>
                    </div>

                    {/* Footer: View Details */}
                    <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end">
                        <div className="flex items-center gap-1 text-blue-500 dark:text-blue-400 group-hover:text-blue-600 transition-colors text-xs font-medium">
                            <Eye className="w-3.5 h-3.5" />
                            View Details
                            <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderListView = () => {
        const hasActiveFilters = selectedStatusId || selectedPriorityId || selectedDocumentTypeId || searchTerm || selectedStat;
        const items = processedItems;

        return (
            <>
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search by title, number, requester..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" 
                            />
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowFilters(!showFilters)} 
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            showFilters || hasActiveFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                    >
                        <Filter className="w-4 h-4" /> Filters 
                        {hasActiveFilters && <span className="flex items-center justify-center w-5 h-5 text-xs bg-white text-blue-600 rounded-full">
                            {([selectedStatusId, selectedPriorityId, selectedDocumentTypeId].filter(Boolean).length + (searchTerm ? 1 : 0))}
                        </span>}
                    </button>
                    <button 
                        onClick={handleRefresh} 
                        className="p-2 rounded-lg transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800" 
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    {hasActiveFilters && <button onClick={clearFilters} className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">Clear All</button>}
                </div>

                {showFilters && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                <select 
                                    value={selectedStatusId || ''} 
                                    onChange={(e) => setSelectedStatusId(e.target.value ? Number(e.target.value) : null)} 
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Statuses</option>
                                    {safeArray(statusesData).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                                <select 
                                    value={selectedPriorityId || ''} 
                                    onChange={(e) => setSelectedPriorityId(e.target.value ? Number(e.target.value) : null)} 
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Priorities</option>
                                    {safeArray(prioritiesData).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document Type</label>
                                <select 
                                    value={selectedDocumentTypeId || ''} 
                                    onChange={(e) => setSelectedDocumentTypeId(e.target.value ? Number(e.target.value) : null)} 
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Types</option>
                                    {safeArray(documentTypesData).map((dt) => {
                                        const config = DOCUMENT_TYPE_CONFIG[dt.item_id1];
                                        return <option key={dt.id} value={dt.id}>{config?.name || dt.name}</option>;
                                    })}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="ml-3 text-gray-500">Loading...</span>
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                            <Bell className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No approvals pending</h3>
                        <p className="text-gray-500 dark:text-gray-400">You don't have any items waiting for your approval.</p>
                    </div>
                ) : (
                    <div className="space-y-3">{items.map((item) => renderItemCard(item))}</div>
                )}
            </>
        );
    };

    if (isPageLoading && !approvalItems) {
        return (
            <>
                <PageBreadcrumb pageTitle="Approval Center" />
                <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                    <p className="text-gray-500 mt-4">Loading...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <PageBreadcrumb pageTitle="Approval Center" />
            <div className="space-y-6">
                {renderStats()}
                {renderListView()}
            </div>
        </>
    );
};

export default ApprovalCenter;