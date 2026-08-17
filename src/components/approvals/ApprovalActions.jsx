// src/components/Approval/ApprovalActions.jsx

import React, { useState, useEffect } from 'react';
import { 
    Check, X, Loader2, Clock, Calendar, 
    CheckCircle, XCircle, Lock, AlertCircle,
    AlertTriangle, UserCheck, UserX, 
    ArrowUpCircle, RefreshCw, MessageSquare,
    Shield, User, Users, ArrowLeft, ArrowRight,
    Ban, Save, Send, ChevronDown, Plus, Trash2
} from 'lucide-react';
import useTanstackQuery from '../../hooks/useTanstackQuery';

const ApprovalActions = ({
    instanceId,
    activeStep,
    previousStep,
    nextStep,
    steps = [],
    userId,
    role_id,
    onSubmit,
    isLoading = false,
    isCompleted = false,
    isRejected = false,
    canApprove = false,
    canEscalate = false,
    canCancel = false,
    userData = null,
}) => {
   
    const [activeTab, setActiveTab] = useState('approve');
    const [comments, setComments] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    
    // Approval states
    const [approvalStatusId, setApprovalStatusId] = useState('');
    
    // Rejection states
    const [rejectionStatusId, setRejectionStatusId] = useState('');
    const [rejectionReasonId, setRejectionReasonId] = useState('');
    const [rejectionComments, setRejectionComments] = useState('');
    const [rejectionHistory, setRejectionHistory] = useState([]);
    
    // Escalation states
    const [escalationStatusId, setEscalationStatusId] = useState('');
    const [escalationReasonId, setEscalationReasonId] = useState('');
    const [escalationComments, setEscalationComments] = useState('');
    const [escalationHistory, setEscalationHistory] = useState([]);
    
    // Cancel states
    const [cancelStatusId, setCancelStatusId] = useState('');
    const [cancelReason, setCancelReason] = useState('');
    const [completedDate, setCompletedDate] = useState('');

    // Fetch statuses from backend (grp: 11)
    const { 
        data: statusesData, 
        loadQuery: loadStatuses,
        isLoading: isStatusesLoading
    } = useTanstackQuery({
        table: "commons",
        uniqueKey: 'approval_statuses',
        queryType: 'gets',
        mainParam: { grp: 11, is_active: 1 },
        narration: 'get statuses',
        autoLoad: false,
    });

    // Fetch rejection reasons from backend (grp: 15)
    const { 
        data: rejectionReasonsData, 
        loadQuery: loadRejectionReasons,
        isLoading: isRejectionReasonsLoading
    } = useTanstackQuery({
        table: "commons",
        uniqueKey: 'rejection_reasons',
        queryType: 'gets',
        mainParam: { grp: 15, is_active: 1 },
        narration: 'get rejection reasons',
        autoLoad: false,
    });

    // Fetch escalation reasons from backend (grp: 16)
    const { 
        data: escalationReasonsData, 
        loadQuery: loadEscalationReasons,
        isLoading: isEscalationReasonsLoading
    } = useTanstackQuery({
        table: "commons",
        uniqueKey: 'escalation_reasons',
        queryType: 'gets',
        mainParam: { grp: 16, is_active: 1 },
        narration: 'get escalation reasons',
        autoLoad: false,
    });

    // Load all data on mount
    useEffect(() => {
        loadStatuses();
        loadRejectionReasons();
        loadEscalationReasons();
    }, []);

    // Set default completed date to today
    useEffect(() => {
        if (activeTab === 'cancel') {
            const today = new Date().toISOString().split('T')[0];
            setCompletedDate(today);
        }
    }, [activeTab]);

    // Get status name from statuses data
    const getStatusName = (statusId) => {
        const status = statusesData?.find(s => s.id === statusId);
        return status?.name || 'Unknown';
    };

    const getStatusColor = (statusId) => {
        const status = statusesData?.find(s => s.id === statusId);
        return status?.text_1 || '#6B7280';
    };

    // Get reason name
    const getReasonName = (reasonId, type = 'rejection') => {
        const data = type === 'rejection' ? rejectionReasonsData : escalationReasonsData;
        const reason = data?.find(r => r.id === reasonId);
        return reason?.name || `Reason #${reasonId}`;
    };

    // Check if step is overdue
    const isOverdue = activeStep?.is_overdue === 1 || 
                     (activeStep?.due_date && new Date(activeStep.due_date) < new Date());

    // Check if step is escalated
    const isEscalated = activeStep?.escalated_at !== null && 
                        activeStep?.escalated_at !== '0000-00-00 00:00:00' &&
                        activeStep?.escalated_at !== '';

    // Get step status
    const getStepStatus = (step) => {
        if (!step) return null;
        if (step.is_active === 1) return 'active';
        if (step.is_active === 0) return 'completed';
        return 'waiting';
    };

    // Handle Approve - User selects status from dropdown, is_active becomes 0
    const handleApprove = async () => {
        if (!canApprove || actionLoading) return;
        if (!approvalStatusId) {
            alert('Please select a status for approval');
            return;
        }
        setActionLoading(true);
        try {
            const payload = {
                instance_step_id: activeStep.id,
                status_id: parseInt(approvalStatusId),
                cat: 'action_function',
                action: 'approve_instance',
                completed_at: new Date().toISOString(),
                performed_by: userId,
                is_active: 0, // Step is now complete/inactive
                comments: comments || 'Approved'
            };
            await onSubmit(payload);
            setApprovalStatusId('');
            setComments('');
            setActiveTab('approve');
        } catch (error) {
            console.error('Approval error:', error);
        } finally {
            setActionLoading(false);
        }
    };

    // Handle Reject with history
    const handleReject = async () => {
        if (!canApprove || actionLoading) return;
        if (!rejectionStatusId) {
            alert('Please select a status');
            return;
        }
        if (rejectionHistory.length === 0) {
            alert('Please add at least one rejection reason');
            return;
        }
        setActionLoading(true);
        try {
            // Build rejection comments history as JSON
            const rejectionHistoryJson = JSON.stringify(rejectionHistory.map(item => ({
                reason_id: item.reason_id,
                reason_name: getReasonName(item.reason_id, 'rejection'),
                comments: item.comments,
                created_at: item.created_at
            })));

            const payload = {
                instance_step_id: activeStep.id,
                status_id: parseInt(rejectionStatusId),
                rejection_reason_id: parseInt(rejectionHistory[rejectionHistory.length - 1].reason_id),
                rejection_comments: rejectionHistoryJson,
                cat: 'action_function',
                action: 'reject_instance',
                performed_by: userId,
                is_active: 0, // Step is now inactive (rejected)
                completed_at: new Date().toISOString()
            };
            await onSubmit(payload);
            setRejectionStatusId('');
            setRejectionReasonId('');
            setRejectionComments('');
            setRejectionHistory([]);
            setActiveTab('approve');
        } catch (error) {
            console.error('Rejection error:', error);
        } finally {
            setActionLoading(false);
        }
    };

    // Handle Escalate with history
    const handleEscalate = async () => {
        if (!canEscalate || actionLoading) return;
        if (!escalationStatusId) {
            alert('Please select a status');
            return;
        }
        if (escalationHistory.length === 0) {
            alert('Please add at least one escalation reason');
            return;
        }
        setActionLoading(true);
        try {
            // Build escalation comments history as JSON
            const escalationHistoryJson = JSON.stringify(escalationHistory.map(item => ({
                reason_id: item.reason_id,
                reason_name: getReasonName(item.reason_id, 'escalation'),
                comments: item.comments,
                created_at: item.created_at
            })));

            const payload = {
                instance_step_id: activeStep.id,
                status_id: parseInt(escalationStatusId),
                escalation_reason_id: parseInt(escalationHistory[escalationHistory.length - 1].reason_id),
                escalation_comments: escalationHistoryJson,
                cat: 'action_function',
                action: 'escalate_instance',
                performed_by: userId,
                is_active: 1, // Keep step active (escalated)
                escalated_at: new Date().toISOString()
            };
            await onSubmit(payload);
            setEscalationStatusId('');
            setEscalationReasonId('');
            setEscalationComments('');
            setEscalationHistory([]);
            setActiveTab('approve');
        } catch (error) {
            console.error('Escalation error:', error);
        } finally {
            setActionLoading(false);
        }
    };

    // Handle Cancel
    const handleCancelAction = async () => {
        if (!canCancel || actionLoading) return;
        if (!cancelStatusId) {
            alert('Please select a cancellation status');
            return;
        }
        if (!cancelReason) {
            alert('Please provide a reason for cancellation');
            return;
        }
        setActionLoading(true);
        try {
            const payload = {
                instance_step_id: activeStep.id,
                status_id: parseInt(cancelStatusId),
                comments: cancelReason,
                completed_at: completedDate || new Date().toISOString(),
                cat: 'action_function',
                action: 'cancel_instance',
                performed_by: userId,
                is_active: 0 // Step is now inactive (cancelled)
            };
            await onSubmit(payload);
            setCancelStatusId('');
            setCancelReason('');
            setCompletedDate('');
            setActiveTab('approve');
        } catch (error) {
            console.error('Cancellation error:', error);
        } finally {
            setActionLoading(false);
        }
    };

    // Add rejection reason to history
    const addRejectionReason = () => {
        if (!rejectionReasonId || !rejectionComments) return;
        setRejectionHistory([
            ...rejectionHistory,
            {
                reason_id: parseInt(rejectionReasonId),
                comments: rejectionComments,
                created_at: new Date().toISOString()
            }
        ]);
        setRejectionReasonId('');
        setRejectionComments('');
    };

    // Remove rejection reason from history
    const removeRejectionReason = (index) => {
        setRejectionHistory(rejectionHistory.filter((_, i) => i !== index));
    };

    // Add escalation reason to history
    const addEscalationReason = () => {
        if (!escalationReasonId || !escalationComments) return;
        setEscalationHistory([
            ...escalationHistory,
            {
                reason_id: parseInt(escalationReasonId),
                comments: escalationComments,
                created_at: new Date().toISOString()
            }
        ]);
        setEscalationReasonId('');
        setEscalationComments('');
    };

    // Remove escalation reason from history
    const removeEscalationReason = (index) => {
        setEscalationHistory(escalationHistory.filter((_, i) => i !== index));
    };

    // If workflow is completed (check is_active)
    if (isCompleted) {
        return (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Workflow Completed</h4>
                        <p className="text-sm text-blue-600 dark:text-blue-300">This workflow has been completed successfully.</p>
                    </div>
                </div>
            </div>
        );
    }

    // If workflow is rejected
    if (isRejected) {
        return (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-full">
                        <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-red-800 dark:text-red-200">Workflow Rejected</h4>
                        {activeStep?.rejection_comments && (
                            <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                                Reason: {activeStep.rejection_comments}
                            </p>
                        )}
                        {activeStep && (
                            <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                                Rejected at: <span className="font-medium">{activeStep.step_name}</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // If step is escalated
    if (isEscalated) {
        return (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                        <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-orange-800 dark:text-orange-200">Step Escalated</h4>
                        {activeStep?.escalation_comments && (
                            <p className="text-sm text-orange-600 dark:text-orange-300 mt-1">
                                Reason: {activeStep.escalation_comments}
                            </p>
                        )}
                        <p className="text-sm text-orange-600 dark:text-orange-300 mt-1">
                            Waiting for escalation resolution.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // If step is overdue but not escalated
    

    // If user can approve - Main Action UI with Tabs
    if (canApprove) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                {/* Header - Role Information */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-white">Approval Required</h4>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-blue-100">
                                    <span>Role: <span className="font-medium text-white">{activeStep?.step_name || 'Unknown'}</span></span>
                                    <span className="opacity-50">|</span>
                                    <span>{activeStep?.role_description || 'Review and approve this step'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium">
                                Step {activeStep?.step_serial_number || 1} of {steps.length}
                            </div>
                        </div>
                    </div>
                </div>
               {(isOverdue) && (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-full">
                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-lg font-semibold text-red-800 dark:text-red-200">Step is Overdue!</h4>
                            <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                                Due date: {activeStep?.due_date ? new Date(activeStep.due_date).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
               )}

                {/* Step Progression with Roles */}
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-sm overflow-x-auto py-1">
                        {steps.map((step, idx) => {
                            const isCompleted = getStepStatus(step) === 'completed';
                            const isActive = getStepStatus(step) === 'active';
                            const isWaiting = getStepStatus(step) === 'waiting';
                            
                            return (
                                <React.Fragment key={step.id}>
                                    <div className={`flex flex-col items-center gap-0.5 whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                                        isCompleted ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                        isActive ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 ring-2 ring-blue-400 ring-offset-1' :
                                        'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                    }`}>
                                        <div className="flex items-center gap-1">
                                            {isCompleted && <CheckCircle className="w-3 h-3" />}
                                            {isActive && <Loader2 className="w-3 h-3 animate-spin" />}
                                            {isWaiting && <Clock className="w-3 h-3" />}
                                            {step.step_name}
                                        </div>
                                        <span className="text-[8px] opacity-70">{step.step_name || 'Unknown'}</span>
                                    </div>
                                    {idx < steps.length - 1 && (
                                        <ChevronDown className="w-3 h-3 text-gray-400 rotate-[-90deg]" />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Step Details with Previous/Next */}
                <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        {previousStep && (
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                <ArrowLeft className="w-4 h-4" />
                                <span>Previous: {previousStep.step_name}</span>
                                <span className="text-xs opacity-70">({previousStep.step_name})</span>
                            </div>
                        )}
                        {activeStep && (
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                                <UserCheck className="w-4 h-4" />
                                <span>Current: {activeStep.step_name}</span>
                                <span className="text-xs opacity-70">({activeStep.step_name})</span>
                            </div>
                        )}
                        {nextStep && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <ArrowRight className="w-4 h-4" />
                                <span>Next: {nextStep.step_name}</span>
                                <span className="text-xs opacity-70">({nextStep.step_name})</span>
                            </div>
                        )}
                    </div>
                    {activeStep?.due_date && (
                        <div className={`mt-2 flex items-center gap-2 text-sm ${
                            new Date(activeStep.due_date) < new Date() ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                            <Calendar className="w-4 h-4" />
                            <span>Due: {new Date(activeStep.due_date).toLocaleDateString()}</span>
                            {new Date(activeStep.due_date) < new Date() && (
                                <span className="text-red-500 font-medium">⚠️ Overdue</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap gap-1 px-6 pt-3">
                        <button
                            onClick={() => setActiveTab('approve')}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
                                activeTab === 'approve'
                                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-b-2 border-green-500'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        >
                            <Check className="w-4 h-4 inline mr-1" />
                            Approve
                        </button>
                        <button
                            onClick={() => setActiveTab('reject')}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
                                activeTab === 'reject'
                                    ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-b-2 border-red-500'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        >
                            <X className="w-4 h-4 inline mr-1" />
                            Reject
                        </button>
                        {canEscalate && (
                            <button
                                onClick={() => setActiveTab('escalate')}
                                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
                                    activeTab === 'escalate'
                                        ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border-b-2 border-orange-500'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            >
                                <ArrowUpCircle className="w-4 h-4 inline mr-1" />
                                Escalate
                            </button>
                        )}
                        {canCancel && (
                            <button
                                onClick={() => setActiveTab('cancel')}
                                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
                                    activeTab === 'cancel'
                                        ? 'bg-gray-50 text-gray-700 dark:bg-gray-700/20 dark:text-gray-400 border-b-2 border-gray-500'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            >
                                <Ban className="w-4 h-4 inline mr-1" />
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="px-6 py-4">
                    {/* Approve Tab */}
                    {activeTab === 'approve' && (
                        <div className="space-y-4">
                            {/* Status Selection for Approval */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Approval Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={approvalStatusId}
                                    onChange={(e) => setApprovalStatusId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                                    disabled={actionLoading || isLoading || isStatusesLoading}
                                >
                                    <option value="">Select a status...</option>
                                    {statusesData?.map((status) => (
                                        <option key={status.id} value={status.id}>
                                            {status.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Comments */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Comments <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                                </label>
                                <textarea
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder="Add your approval comments here..."
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    rows="2"
                                    disabled={actionLoading || isLoading}
                                />
                            </div>

                            <button 
                                onClick={handleApprove} 
                                disabled={actionLoading || isLoading || !approvalStatusId} 
                                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow"
                            >
                                <Check className="w-5 h-5" />
                                Confirm Approval
                            </button>
                        </div>
                    )}

                    {/* Reject Tab */}
                    {activeTab === 'reject' && (
                        <div className="space-y-4">
                            {/* Status Selection - From Backend */}
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
    {/* Status Select */}
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Status <span className="text-red-500">*</span>
        </label>
        <select
            value={rejectionStatusId}
            onChange={(e) => setRejectionStatusId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={actionLoading || isLoading || isStatusesLoading}
        >
            <option value="">Select a status...</option>
            {statusesData?.map((status) => (
                <option key={status.id} value={status.id}>
                    {status.name}
                </option>
            ))}
        </select>
    </div>

    {/* Rejection Reasons Select */}
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Rejection Reasons <span className="text-red-500">*</span>
        </label>
        <select
            value={rejectionReasonId}
            onChange={(e) => setRejectionReasonId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={actionLoading || isLoading || isRejectionReasonsLoading}
        >
            <option value="">Select a reason...</option>
            {rejectionReasonsData?.map((reason) => (
                <option key={reason.id} value={reason.id}>
                    {reason.name}
                </option>
            ))}
        </select>
    </div>
</div>

                            {/* Rejection Reasons - From Backend */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Rejection Reasons <span className="text-red-500">*</span>
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <textarea
                                        value={rejectionComments}
                                        onChange={(e) => setRejectionComments(e.target.value)}
                                        placeholder="Add comments..."
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 text-sm"
                                        rows="2"
                                        disabled={actionLoading || isLoading}
                                    />
                                    <button
                                        onClick={addRejectionReason}
                                        disabled={!rejectionReasonId || !rejectionComments || actionLoading || isLoading}
                                        className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add
                                    </button>
                                </div>

                                {/* Rejection History */}
                                {rejectionHistory.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Added Reasons:</p>
                                        {rejectionHistory.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                                <div className="flex-1">
                                                    <span className="text-sm font-medium text-red-800 dark:text-red-200">
                                                        {getReasonName(item.reason_id, 'rejection')}
                                                    </span>
                                                    <p className="text-xs text-red-600 dark:text-red-300">{item.comments}</p>
                                                    <span className="text-[10px] text-red-400">
                                                        {new Date(item.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => removeRejectionReason(index)}
                                                    className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={handleReject} 
                                disabled={actionLoading || isLoading || !rejectionStatusId || rejectionHistory.length === 0} 
                                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow"
                            >
                                <X className="w-5 h-5" />
                                Confirm Rejection
                            </button>
                        </div>
                    )}

                    {/* Escalate Tab */}
                    {activeTab === 'escalate' && canEscalate && (
                        <div className="space-y-4">
                            {/* Status Selection - From Backend */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={escalationStatusId}
                                    onChange={(e) => setEscalationStatusId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                                    disabled={actionLoading || isLoading || isStatusesLoading}
                                >
                                    <option value="">Select a status...</option>
                                    {statusesData?.map((status) => (
                                        <option key={status.id} value={status.id}>
                                            {status.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Escalation Reasons - From Backend */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Escalation Reasons <span className="text-red-500">*</span>
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <select
                                        value={escalationReasonId}
                                        onChange={(e) => setEscalationReasonId(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                                        disabled={actionLoading || isLoading || isEscalationReasonsLoading}
                                    >
                                        <option value="">Select a reason...</option>
                                        {escalationReasonsData?.map((reason) => (
                                            <option key={reason.id} value={reason.id}>
                                                {reason.name}
                                            </option>
                                        ))}
                                    </select>
                                    <textarea
                                        value={escalationComments}
                                        onChange={(e) => setEscalationComments(e.target.value)}
                                        placeholder="Add comments..."
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 text-sm"
                                        rows="1"
                                        disabled={actionLoading || isLoading}
                                    />
                                    <button
                                        onClick={addEscalationReason}
                                        disabled={!escalationReasonId || !escalationComments || actionLoading || isLoading}
                                        className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add
                                    </button>
                                </div>

                                {/* Escalation History */}
                                {escalationHistory.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Added Reasons:</p>
                                        {escalationHistory.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                                <div className="flex-1">
                                                    <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                                                        {getReasonName(item.reason_id, 'escalation')}
                                                    </span>
                                                    <p className="text-xs text-orange-600 dark:text-orange-300">{item.comments}</p>
                                                    <span className="text-[10px] text-orange-400">
                                                        {new Date(item.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => removeEscalationReason(index)}
                                                    className="p-1 text-orange-400 hover:text-orange-600 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={handleEscalate} 
                                disabled={actionLoading || isLoading || !escalationStatusId || escalationHistory.length === 0} 
                                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow"
                            >
                                <ArrowUpCircle className="w-5 h-5" />
                                Confirm Escalation
                            </button>
                        </div>
                    )}

                    {/* Cancel Tab */}
                    {activeTab === 'cancel' && canCancel && (
                        <div className="space-y-4">
                            {/* Status Selection - From Backend */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Cancellation Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={cancelStatusId}
                                    onChange={(e) => setCancelStatusId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500"
                                    disabled={actionLoading || isLoading || isStatusesLoading}
                                >
                                    <option value="">Select a status...</option>
                                    {statusesData?.map((status) => (
                                        <option key={status.id} value={status.id}>
                                            {status.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Cancel Reason */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Reason for Cancellation <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="Please provide a detailed reason..."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 text-sm"
                                    rows="2"
                                    disabled={actionLoading || isLoading}
                                />
                            </div>

                            {/* Completed Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Completed Date
                                </label>
                                <input
                                    type="date"
                                    value={completedDate}
                                    onChange={(e) => setCompletedDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500"
                                    disabled={actionLoading || isLoading}
                                />
                            </div>

                            <button 
                                onClick={handleCancelAction} 
                                disabled={actionLoading || isLoading || !cancelStatusId || !cancelReason} 
                                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow"
                            >
                                <Ban className="w-5 h-5" />
                                Confirm Cancellation
                            </button>
                        </div>
                    )}

                    {(actionLoading || isLoading) && (
                        <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 py-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-sm">Processing...</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Waiting for other approver
    return (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
            <div className="flex items-start gap-4">
                <div className="p-2.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                    <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1">
                    <h4 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">Awaiting Approval</h4>
                    <p className="text-sm text-yellow-600 dark:text-yellow-300">
                        Waiting for {activeStep?.step_name || 'another approver'} to complete their review.
                    </p>
                    
                    {/* Step Progression */}
                    <div className="mt-3 flex items-center gap-2 text-xs flex-wrap">
                        {steps.map((step, idx) => {
                            const isCompleted = getStepStatus(step) === 'completed';
                            const isActive = getStepStatus(step) === 'active';
                            const isWaiting = getStepStatus(step) === 'waiting';
                            
                            return (
                                <React.Fragment key={step.id}>
                                    <span className={`px-2 py-0.5 rounded-full ${
                                        isCompleted ? 'bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                        isActive ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 animate-pulse' :
                                        'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                    }`}>
                                        {step.step_name}
                                    </span>
                                    {idx < steps.length - 1 && (
                                        <ArrowRight className="w-3 h-3 text-gray-400" />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/* Step Details */}
                    {activeStep && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-yellow-600 dark:text-yellow-300">
                            <div>
                                <span className="opacity-70">Step:</span> {activeStep.step_name}
                            </div>
                            <div>
                                <span className="opacity-70">Role:</span> {activeStep.step_name || 'Unknown'}
                            </div>
                            {activeStep.due_date && (
                                <div className={`flex items-center gap-1 ${
                                    new Date(activeStep.due_date) < new Date() ? 'text-red-500' : ''
                                }`}>
                                    <Calendar className="w-4 h-4" />
                                    Due: {new Date(activeStep.due_date).toLocaleDateString()}
                                </div>
                            )}
                            <div className="text-xs opacity-70">
                                Progress: {steps.filter(s => s.is_active === 0).length} / {steps.length} complete
                            </div>
                        </div>
                    )}

                    {canEscalate && !isOverdue && (
                        <button
                            onClick={() => setActiveTab('escalate')}
                            className="mt-3 flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all text-sm font-medium shadow-sm hover:shadow"
                        >
                            <ArrowUpCircle className="w-4 h-4" />
                            Escalate
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApprovalActions;