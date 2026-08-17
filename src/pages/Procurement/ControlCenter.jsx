// src/pages/ControlCenter/ControlCenter.jsx

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    CheckCircle, XCircle, Clock, AlertTriangle, 
    ArrowUpCircle, Loader2, Search, 
    ChevronRight, Calendar, User, DollarSign, 
    FileText, ShoppingCart, Wallet, PieChart, 
    Users, ArrowRightLeft, Bell, Filter,
    X, Check, RefreshCw, Lock, Eye,
    MapPin, Settings, BarChart3
} from 'lucide-react';
import useReduxApiData from "../../hooks/useTanstackQuery";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Loader from "../../components/ui/Loader";

// ==================== DOCUMENT TYPE CONFIG ====================
const DOCUMENT_TYPE_CONFIG = {
    1: { id: 1, code: 'REQUISITION', name: 'Requisitions', icon: FileText, color: 'blue' },
    2: { id: 2, code: 'PURCHASE_ORDER', name: 'Purchase Orders', icon: ShoppingCart, color: 'green' },
    3: { id: 3, code: 'CASH_ADVANCE', name: 'Cash Advances', icon: Wallet, color: 'purple' },
    4: { id: 4, code: 'BUDGET', name: 'Budgets', icon: PieChart, color: 'orange' },
    5: { id: 5, code: 'USER', name: 'Users', icon: Users, color: 'teal' },
    6: { id: 6, code: 'CASH_TRANSFER', name: 'Cash Transfers', icon: ArrowRightLeft, color: 'red' },
};

// ==================== STEP STATUS ====================
const STEP_STATUS = {
    WAITING: 0,
    ACTIVE: 1,
    COMPLETED: 2,
    REJECTED: 3,
};

const STEP_STATUS_LABELS = {
    0: 'Waiting',
    1: 'Ready',
    2: 'Completed',
    3: 'Rejected',
};

const STEP_STATUS_COLORS = {
    0: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
    1: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    2: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    3: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
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

const getStatusById = (statusesData, id) => {
    if (!statusesData || !Array.isArray(statusesData)) return null;
    return statusesData.find((s) => s.id === id) || null;
};

// ==================== COMPONENT ====================
const ControlCenter = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.authReducer || {});
    const userId = user?.id;
    
    // Get location_id from auth - if 0 or null, show ALL locations
    const locationId = user?.location_id || null;

    // ==================== STATE ====================
    const [selectedItem, setSelectedItem] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [selectedStatusId, setSelectedStatusId] = useState(null);
    const [selectedPriorityId, setSelectedPriorityId] = useState(null);
    const [selectedDocumentTypeId, setSelectedDocumentTypeId] = useState(null);
    const [selectedStepStatus, setSelectedStepStatus] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);

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
        mainParam: { grp: 10, is_active: 1},
        autoLoad: true,
    });

    const buildMainParam = useCallback(() => {
        const param = { 
            limit: 50,
            // If locationId is set and > 0, filter by it
            // If locationId is 0 or null, show ALL locations
            location_id: locationId || 0
        };
        if (selectedStatusId) param.status_id = selectedStatusId;
        if (selectedPriorityId) param.priority_id = selectedPriorityId;
        if (selectedDocumentTypeId) param.document_type_id = selectedDocumentTypeId;
        if (selectedStepStatus !== null) param.step_status = selectedStepStatus;
        if (searchTerm) param.search = searchTerm;
        return param;
    }, [locationId, selectedStatusId, selectedPriorityId, selectedDocumentTypeId, selectedStepStatus, searchTerm]);

    const { data: controlItems, loadQuery: loadControlItems, isLoading } = useReduxApiData({
        table: 'controlcenter',
        pth: 'control',
        queryType: 'getControlItems',
        mainParam: buildMainParam(),
        autoLoad: false,
    });

    const { data: controlStats, loadQuery: loadStats } = useReduxApiData({
        table: 'controlcenter',
        pth: 'control',
        queryType: 'getControlStats',
        mainParam: { location_id: locationId || 0 },
        autoLoad: false,
    });

    // ==================== LOAD DATA ====================
    useEffect(() => {
        loadControlItems();
        loadStats();
    }, [locationId]);

    useEffect(() => {
        loadControlItems();
    }, [selectedStatusId, selectedPriorityId, selectedDocumentTypeId, selectedStepStatus, searchTerm]);

    const isPageLoading = statusesLoading || prioritiesLoading || isLoading;

    // ==================== HANDLERS ====================
    const handleItemClick = (item) => {
        setSelectedItem(item);
        setViewMode('detail');
    };

    const handleBack = () => { setViewMode('list'); setSelectedItem(null); };
    const handleRefresh = () => { loadControlItems(); loadStats(); };
    const clearFilters = () => {
        setSelectedStatusId(null);
        setSelectedPriorityId(null);
        setSelectedDocumentTypeId(null);
        setSelectedStepStatus(null);
        setSearchTerm('');
    };

    const handleApprove = async (data) => {
        if (!selectedItem) return;
        setActionLoading(true);
        try {
            const response = await fetch('/api/control/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instance_id: selectedItem.instance_id,
                    step_record_id: selectedItem.step_record_id,
                    user_id: userId,
                    comments: data?.comments || 'Approved by Control Center'
                })
            });
            const result = await response.json();
            if (result.success) {
                loadControlItems();
                loadStats();
                if (result.is_completed) {
                    alert('Workflow completed!');
                }
                handleBack();
            } else {
                alert(result.message || 'Failed to approve');
            }
        } catch (error) {
            console.error('Error approving:', error);
            alert('Error approving item');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (data) => {
        if (!selectedItem) return;
        setActionLoading(true);
        try {
            const response = await fetch('/api/control/reject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instance_id: selectedItem.instance_id,
                    step_record_id: selectedItem.step_record_id,
                    user_id: userId,
                    comments: data?.comments || 'Rejected by Control Center'
                })
            });
            const result = await response.json();
            if (result.success) {
                loadControlItems();
                loadStats();
                handleBack();
            } else {
                alert(result.message || 'Failed to reject');
            }
        } catch (error) {
            console.error('Error rejecting:', error);
            alert('Error rejecting item');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEscalate = async (data) => {
        if (!selectedItem) return;
        setActionLoading(true);
        try {
            const response = await fetch('/api/control/escalate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instance_id: selectedItem.instance_id,
                    step_record_id: selectedItem.step_record_id,
                    user_id: userId,
                    comments: data?.comments || 'Escalated by Control Center'
                })
            });
            const result = await response.json();
            if (result.success) {
                loadControlItems();
                loadStats();
                handleBack();
            } else {
                alert(result.message || 'Failed to escalate');
            }
        } catch (error) {
            console.error('Error escalating:', error);
            alert('Error escalating item');
        } finally {
            setActionLoading(false);
        }
    };

    // ==================== GET DOCUMENT DETAILS ====================
    const getDocumentDetails = (item) => {
        if (!item) return { config: null, docType: null, title: 'Untitled', number: '#N/A', amount: 0, currency: 'NGN', Icon: FileText, color: 'gray' };
        const docType = documentTypesData?.find((d) => d.id === item.document_type_id);
        const config = docType ? DOCUMENT_TYPE_CONFIG[docType.item_id1] : null;
        return {
            config, docType,
            title: item.title || item.doc_REQUISITION_title || item.doc_PURCHASE_ORDER_title || item.doc_CASH_ADVANCE_title || 'Untitled',
            number: item.doc_REQUISITION_number || item.doc_PURCHASE_ORDER_number || item.doc_CASH_ADVANCE_number || item.document_number || `#${item.document_id}`,
            amount: item.doc_REQUISITION_amount || item.doc_PURCHASE_ORDER_amount || item.doc_CASH_ADVANCE_amount || item.total_amount || 0,
            currency: item.doc_REQUISITION_currency || item.doc_PURCHASE_ORDER_currency || item.doc_CASH_ADVANCE_currency || item.currency_code || 'NGN',
            Icon: config?.icon || FileText,
            color: config?.color || 'gray',
            location: item.doc_location_id || null
        };
    };

    // ==================== RENDER ====================
    const renderStats = () => {
        const stats = controlStats || {};
        const cards = [
            { label: 'Active', value: stats.total_active || 0, icon: Clock, color: '#3B82F6' },
            { label: 'Ready', value: stats.total_ready || 0, icon: CheckCircle, color: '#22C55E' },
            { label: 'Waiting', value: stats.total_waiting || 0, icon: Clock, color: '#F59E0B' },
            { label: 'Overdue', value: stats.total_overdue || 0, icon: AlertTriangle, color: '#EF4444' },
            { label: 'Completed', value: stats.total_completed || 0, icon: CheckCircle, color: '#10B981' },
            { label: 'Rejected', value: stats.total_rejected || 0, icon: XCircle, color: '#EF4444' },
        ];

        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
                {cards.map((card) => (
                    <div key={card.label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                                <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
                            </div>
                            <div className="p-2 rounded-lg" style={{ backgroundColor: card.color + '20' }}>
                                <card.icon className="w-5 h-5" style={{ color: card.color }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderItemCard = (item) => {
        if (!item) return null;
        const { config, docType, title, number, amount, currency, Icon, color, location } = getDocumentDetails(item);
        const priority = prioritiesData?.find((p) => p.id === item.priority_id);
        const status = statusesData?.find((s) => s.id === item.step_status_id);
        
        const isActive = item.step_is_active === STEP_STATUS.ACTIVE;
        const isCompleted = item.step_is_active === STEP_STATUS.COMPLETED;
        const isRejected = item.step_is_active === STEP_STATUS.REJECTED;
        const isWaiting = item.step_is_active === STEP_STATUS.WAITING;

        const getStepStatusLabel = () => {
            if (isActive) return 'Ready';
            if (isCompleted) return 'Completed';
            if (isRejected) return 'Rejected';
            return 'Waiting';
        };

        return (
            <div
                key={item.instance_id}
                onClick={() => handleItemClick(item)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all cursor-pointer group"
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg`}>
                            <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{docType?.name || item.document_type_name}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{number}</span>
                                {location && (
                                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                        <MapPin className="w-3 h-3" />
                                        {location}
                                    </span>
                                )}
                                {priority && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: priority.text_1 || '#gray' }}>
                                        {priority.name}
                                    </span>
                                )}
                                <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STEP_STATUS_COLORS[item.step_is_active] || 'bg-gray-100 text-gray-800'}`}>
                                    {getStepStatusLabel()}
                                </span>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate mt-1">{title}</h3>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                                <span className="flex items-center gap-1"><User className="w-3 h-3" />{item.requester_name}</span>
                                {amount > 0 && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{currency} {amount.toLocaleString()}</span>}
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : 'N/A'}</span>
                                {item.is_overdue && isActive && <span className="text-red-600 dark:text-red-400 font-medium">Overdue!</span>}
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs text-gray-400">Step {item.step_serial_number} of {item.total_steps}</span>
                                <span className="text-xs text-blue-600 dark:text-blue-400">{item.step_name}</span>
                                {isActive && <span className="text-xs text-green-600 dark:text-green-400">🔓 Ready</span>}
                                {isWaiting && <span className="text-xs text-gray-400">🔒 Waiting</span>}
                            </div>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors flex-shrink-0 mt-2" />
                </div>
            </div>
        );
    };

    const renderListView = () => {
        const hasActiveFilters = selectedStatusId || selectedPriorityId || selectedDocumentTypeId || selectedStepStatus !== null || searchTerm;
        const safeItems = safeArray(controlItems);

        return (
            <>
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${showFilters || hasActiveFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}>
                        <Filter className="w-4 h-4" /> Filters {hasActiveFilters && <span className="flex items-center justify-center w-5 h-5 text-xs bg-white text-blue-600 rounded-full">{([selectedStatusId, selectedPriorityId, selectedDocumentTypeId, selectedStepStatus].filter(Boolean).length + (searchTerm ? 1 : 0))}</span>}
                    </button>
                    <button onClick={handleRefresh} className="p-2 rounded-lg transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800" title="Refresh"><RefreshCw className="w-4 h-4" /></button>
                    {hasActiveFilters && <button onClick={clearFilters} className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">Clear All</button>}
                </div>

                {showFilters && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                <select value={selectedStatusId || ''} onChange={(e) => setSelectedStatusId(e.target.value ? Number(e.target.value) : null)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                                    <option value="">All Statuses</option>
                                    {safeArray(statusesData).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Step Status</label>
                                <select value={selectedStepStatus !== null ? selectedStepStatus : ''} onChange={(e) => setSelectedStepStatus(e.target.value !== '' ? Number(e.target.value) : null)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                                    <option value="">All Steps</option>
                                    <option value={0}>Waiting</option>
                                    <option value={1}>Ready</option>
                                    <option value={2}>Completed</option>
                                    <option value={3}>Rejected</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                                <select value={selectedPriorityId || ''} onChange={(e) => setSelectedPriorityId(e.target.value ? Number(e.target.value) : null)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                                    <option value="">All Priorities</option>
                                    {safeArray(prioritiesData).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document Type</label>
                                <select value={selectedDocumentTypeId || ''} onChange={(e) => setSelectedDocumentTypeId(e.target.value ? Number(e.target.value) : null)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
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
                    <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /><span className="ml-3 text-gray-500">Loading...</span></div>
                ) : safeItems.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto flex items-center justify-center"><Bell className="w-8 h-8 text-gray-400" /></div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No items found</h3>
                        <p className="text-gray-500 dark:text-gray-400">No workflows match your current filters.</p>
                    </div>
                ) : (
                    <div className="space-y-3">{safeItems.map((item) => renderItemCard(item))}</div>
                )}
            </>
        );
    };

    const renderDetailView = () => {
        if (!selectedItem) return null;
        const { docType, title, number, amount, currency, Icon, color, location } = getDocumentDetails(selectedItem);
        const statusColor = getStatusById(statusesData, selectedItem.step_status_id)?.text_1 || '#gray';

        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg`}><Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} /></div>
                        <div><h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2><p className="text-sm text-gray-500 dark:text-gray-400">{number}</p></div>
                    </div>
                    <button onClick={handleBack} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">Back</button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Document Type</p><p className="font-medium">{docType?.name}</p></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Requester</p><p className="font-medium">{selectedItem.requester_name}</p></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Amount</p><p className="font-medium">{currency} {amount.toLocaleString()}</p></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Step Status</p><span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white" style={{ backgroundColor: statusColor }}>{STEP_STATUS_LABELS[selectedItem.step_is_active] || 'Unknown'}</span></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Step</p><p className="font-medium">{selectedItem.step_name} ({selectedItem.step_serial_number} of {selectedItem.total_steps})</p></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Priority</p><span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white" style={{ backgroundColor: prioritiesData?.find(p => p.id === selectedItem.priority_id)?.text_1 || '#gray' }}>{selectedItem.priority_name}</span></div>
                    {location && <div><p className="text-sm text-gray-500 dark:text-gray-400">Location</p><p className="font-medium">{location}</p></div>}
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Workflow</p><p className="font-medium">{selectedItem.workflow_name || 'N/A'}</p></div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Approval Chain</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedItem.approval_chain || 'No steps defined'}</p>
                </div>

                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={() => handleApprove({ comments: 'Approved by Control Center' })} disabled={actionLoading} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"><Check className="w-4 h-4" /> Approve</button>
                    <button onClick={() => handleReject({ comments: 'Rejected by Control Center' })} disabled={actionLoading} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"><X className="w-4 h-4" /> Reject</button>
                    <button onClick={() => handleEscalate({ comments: 'Escalated by Control Center' })} disabled={actionLoading} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"><ArrowUpCircle className="w-4 h-4" /> Escalate</button>
                </div>
            </div>
        );
    };

    if (isPageLoading && !controlItems) {
        return (
            <>
                <PageBreadcrumb pageTitle="Control Center" />
                <div className="flex flex-col items-center justify-center py-16"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /><p className="text-gray-500 mt-4">Loading Control Center...</p></div>
            </>
        );
    }

    // Show location info
    const locationDisplay = locationId && locationId > 0 ? `Location: ${locationId}` : 'All Locations';

    return (
        <>
            <PageBreadcrumb pageTitle="Control Center" />
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{locationDisplay}</span>
            </div>
            <div className="space-y-6">
                {viewMode === 'list' && renderStats()}
                {viewMode === 'list' ? renderListView() : renderDetailView()}
            </div>
        </>
    );
};

export default ControlCenter;